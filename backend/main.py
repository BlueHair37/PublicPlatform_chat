from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import uuid
from pathlib import Path
from dotenv import load_dotenv

from agents.perception import PerceptionAgent
from agents.planner import PlannerAgent
from agents.insight import InsightAgent
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
perception_agent = PerceptionAgent()
planner_agent = PlannerAgent()
insight_agent = InsightAgent()

# Models associated with Pydantic for response
class ChatRequest(BaseModel):
    message: str
    image_url: Optional[str] = None
    session_id: Optional[str] = "default"

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
    items = db.query(models.WordCloudItem).all()
    return items

@app.get("/api/dashboard/patterns")
def get_complaint_patterns(db: Session = Depends(get_db)):
    patterns = db.query(models.ComplaintPattern).all()
    return patterns

@app.get("/api/dashboard/high-risk")
def get_high_risk_complaints(db: Session = Depends(get_db)):
    items = db.query(models.HighRiskComplaint).all()
    return items

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
    total = db.query(models.MockComplaint).count()
    # Mock categories logic for now since MockComplaint structure in DB is JSON
    # In a real app we would query the JSON field or a normalized table
    return {
        "active_complaints": total,
        "resolved_today": 0,
        "categories": {"Road": total} # Simplified
    }

# --- Chat Endpoint ---

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, db: Session = Depends(get_db)):
    # 1. Perception
    perception_data = await perception_agent.process(request.message, request.image_url)
    
    response_text = ""
    action_taken = None
    
    if perception_data.get("intent") == "report_complaint":
        # 2. Planning
        plan = await planner_agent.create_plan(perception_data)
        
        # 3. Save to DB
        complaint_id = str(uuid.uuid4())
        
        db_complaint = models.MockComplaint(
            id=complaint_id,
            perception=perception_data,
            plan=plan,
            status="Received"
        )
        db.add(db_complaint)
        db.commit()
        
        response_text = (
            f"네, 접수되었습니다. <br/>"
            f"<strong>[분류]</strong> {perception_data.get('category')} / <strong>[위치]</strong> {perception_data.get('location')} <br/>"
            f"<strong>[담당]</strong> {plan.get('department')}에 배정되어 {plan.get('estimated_time')} 내 조치 예정입니다."
        )
        action_taken = "Complaint Registered"
        
    else:
        # Simple conversation fallback
        # Use OpenAI Service directly for chat if needed, or simple response
        # Here we just acknowledge
        response_text = "이해하였습니다. 더 도와드릴 것이 있나요?"
        action_taken = "General Chat"

    return ChatResponse(
        response=response_text,
        action_taken=action_taken,
        structured_data=perception_data
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
