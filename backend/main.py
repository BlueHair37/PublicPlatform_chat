from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import uuid
from pathlib import Path
from dotenv import load_dotenv

from agents.civil_complaint import CivilComplaintAgent
from agents.insight import InsightAgent
from agents.context_analysis_agent import analysis_graph
from agents.openai_service import get_openai_service

from database import engine, get_db
import models

# Create tables if not exist (handled by init_db but good safety)
models.Base.metadata.create_all(bind=engine)

# Load environment variables
env_path = Path(__file__).resolve().parent.parent / ".env"
print(f"DEBUG: Loading env from {env_path}, Exists: {env_path.exists()}")
load_dotenv(dotenv_path=env_path)
print(f"DEBUG: OPENAI_API_KEY Loaded: {bool(os.getenv('OPENAI_API_KEY'))}")

app = FastAPI(title="Busan Civil Complaint AI Platform")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agents
civil_agent = CivilComplaintAgent()
insight_agent = InsightAgent()

# In-Memory Sessions (Simple cache for demo)
chat_sessions: Dict[str, List[dict]] = {}

# Models associated with Pydantic for response
class ChatResponse(BaseModel):
    response: str
    action_taken: Optional[str] = None
    structured_data: Optional[dict] = None

@app.get("/")
def read_root():
    return {"status": "Busan AI Platform Backend Running"}

# --- Dashboard API Endpoints ---

@app.get("/api/map/items")
def get_map_items(db: Session = Depends(get_db)):
    # 1. Static Word Cloud Items
    static_items = db.query(models.WordCloudItem).all()
    
    # 2. Real-time Complaints (MockComplaint)
    complaints = db.query(models.MockComplaint).all()
    
    formatted_complaints = []
    for c in complaints:
        if c.lat and c.lng:
            # Determine style based on risk
            is_risky = (c.safety_risk_score or 0) >= 8
            
            formatted_complaints.append({
                "id": c.id,
                "text": c.category or "민원",
                "lat": c.lat,
                "lng": c.lng,
                "size": "3rem" if is_risky else "2rem",
                "class_name": "text-red-600 font-black animate-pulse" if is_risky else "text-blue-600 font-bold",
                "style": {"zIndex": 1000}
            })
            
    # Combine (Schema mismatch handling moved to serializer or simple dict return)
    # Since existing static_items are objects, we'll convert them to dicts to match formatted_complaints
    result = []
    for s in static_items:
        result.append({
            "text": s.text,
            "lat": s.lat,
            "lng": s.lng,
            "size": s.size,
            "class_name": s.class_name,
            "style": s.style
        })
        
    result.extend(formatted_complaints)
    return result

@app.get("/api/dashboard/patterns")
def get_complaint_patterns(db: Session = Depends(get_db)):
    patterns = db.query(models.ComplaintPattern).all()
    return patterns

@app.get("/api/dashboard/high-risk")
def get_high_risk_complaints(db: Session = Depends(get_db)):
    # Fetch real data from Chat interactions (MockComplaint)
    # Filter for high risk items (e.g., safety_risk_score >= 8)
    items = db.query(models.MockComplaint).filter(models.MockComplaint.safety_risk_score >= 8).all()
    
    # Format for frontend
    result = []
    for item in items:
        result.append({
            "title": item.summary or "긴급 민원",
            "time_text": "방금 전", # In real app, calculate time diff
            "location": item.location,
            "description": item.original_text[:50] + "..." if item.original_text else "",
            "category": "warning" if (item.safety_risk_score or 0) >= 9 else "water_drop" # Simple icon logic
        })
        
    return result

@app.get("/api/dashboard/insight")
async def get_insight(db: Session = Depends(get_db)):
    # Try to get from DB first
    insight = db.query(models.InsightData).order_by(models.InsightData.id.desc()).first()
    if insight:
        return {"summary": insight.content}
    
    # Fallback to generating one if empty (or could trigger agent)
    stats = await get_stats(db)
    insight_text = await insight_agent.generate_briefing(stats)
    return {"summary": insight_text}

@app.get("/api/dashboard/stats")
async def get_stats(db: Session = Depends(get_db)):
    try:
        total = db.query(models.MockComplaint).count()
        # Basic category grouping logic
        categories = {}
        complaints = db.query(models.MockComplaint).all()
        for c in complaints:
            cat = c.category or "기타"
            categories[cat] = categories.get(cat, 0) + 1
            
        return {
            "active_complaints": total,
            "resolved_today": 0,
            "categories": categories or {"Road": 0} 
        }
    except Exception as e:
        import traceback
        with open("error.log", "a") as f:
            f.write(f"Stats Error: {traceback.format_exc()}\n")
        raise HTTPException(status_code=500, detail=str(e))


# --- Heatmap Endpoint (New) ---
@app.get("/api/map/heatmap")
def get_heatmap_data(db: Session = Depends(get_db)):
    # Mock/Seed Heatmap Data based on existing word cloud items or random
    # Format: [[lat, lng, intensity], ...]
    if False: # If we had real data
        pass
    
    # Generate some static dummy data around Busan for heatmap demo
    base_lat = 35.1796
    base_lng = 129.0756
    heatmap_data = [
        [base_lat + 0.001, base_lng + 0.001, 0.8],
        [base_lat - 0.002, base_lng - 0.001, 0.6],
        [base_lat + 0.003, base_lng + 0.002, 0.9],
        [base_lat + 0.001, base_lng - 0.003, 0.5],
        [base_lat - 0.001, base_lng + 0.004, 0.7],
        [35.155, 129.085, 0.8], # Gwangan
        [35.165, 129.055, 0.6], # Seomyeon
    ]
    return heatmap_data

# --- Chat Endpoint ---

@app.get("/api/dashboard/stats/general")
def get_general_stats(db: Session = Depends(get_db)):
    stats = db.query(models.DashboardStat).all()
    # Convert list to dict for easier frontend consumption
    return {stat.key: stat.value for stat in stats}

@app.post("/api/map/analyze")
def analyze_area(db: Session = Depends(get_db)):
    # In a real app, this would take coordinates and query spatial DB.
    # For now, we return specific mock values stored in DB as requested.
    severity = db.query(models.DashboardStat).filter(models.DashboardStat.key == "avg_road_severity").first()
    count = db.query(models.DashboardStat).filter(models.DashboardStat.key == "pending_complaints_count").first()
    
    return {
        "severity": int(severity.value) if severity else 80,
        "count": int(count.value) if count else 100
    }

class RegionAnalysisRequest(BaseModel):
    polygon: List[List[float]] # [[lat, lng], ...]

@app.post("/api/map/analyze-region")
async def analyze_region(request: RegionAnalysisRequest, db: Session = Depends(get_db)):
    """
    Stateful Analysis Endpoint (LangGraph)
    """
    initial_state = {
        "region_polygon": request.polygon,
        "db_session": db,
        "raw_complaints": [],
        "themes": {},
        "semantic_context": "",
        "final_report": "",
        "action_items": []
    }
    
    # Run Graph
    try:
        result = await analysis_graph.ainvoke(initial_state)
        return {
            "report": result.get("final_report", "Analysis Failed"),
            "context": result.get("semantic_context", ""),
            "themes": result.get("themes", {})
        }
    except Exception as e:
        print(f"Graph Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/complaint/{complaint_id}/analyze")
async def analyze_complaint_detail(complaint_id: str, db: Session = Depends(get_db)):
    # Fetch complaint
    complaint = db.query(models.MockComplaint).filter(models.MockComplaint.id == complaint_id).first()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
        
    # Prepare data for AI
    data = {
        "summary": complaint.summary,
        "original_text": complaint.original_text,
        "category": complaint.category,
        "location": complaint.location,
        "urgency_score": complaint.urgency_score,
        "safety_risk_score": complaint.safety_risk_score
    }
    
    # Generate AI Report
    analysis_text = await civil_agent.generate_report(data)
    
    return {
        "complaint": data,
        "analysis_report": analysis_text
    }

# --- Chat Endpoint ---

class ChatRequest(BaseModel):
    message: str
    session_id: str = None
    image_url: str = None # Legacy/Optional
    image_data: str = None # Base64 encoded image

# ... (Previous code) ...

# --- Chat Endpoint ---

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    session_id = request.session_id or "default"
    
    # Retrieve history
    history = chat_sessions.get(session_id, [])
    
    # Analyze Image if present (Prioritize base64 data)
    image_input = request.image_data or request.image_url
    
    message_content = request.message
    if image_input and not request.image_data: 
         # If just URL (text), append it. If Base64, we pass it separately to agent.
         message_content += f" (이미지 URL: {request.image_url})"

    # Chat with Boogie Agent
    # Pass DB session for tools to use
    response_text, updated_history = await civil_agent.chat(
        message_content, 
        history=history, 
        db=db, 
        image_data=request.image_data
    )
    
    # Store history
    new_history = [msg for msg in updated_history if msg['role'] != 'system']
    chat_sessions[session_id] = new_history
    
    # Check for "Complaint Registered" action
    action_taken = "General Chat"
    if "민원이 정상적으로 시스템에 등록되었습니다" in response_text:
        action_taken = "Complaint Registered"
    
    return ChatResponse(
        response=response_text,
        action_taken=action_taken,
        structured_data=None 
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
