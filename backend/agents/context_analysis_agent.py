import os
import json
from typing import TypedDict, List, Dict, Any
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from sqlalchemy.orm import Session
from models import MockComplaint

# --- 1. Define State Schema (Context-to-Context Flow) ---
class AnalysisState(TypedDict):
    # Input
    region_polygon: List[List[float]] # [[lat, lng], ...]
    db_session: Any # SQLAlchemy Session (passed in config or state)
    
    # Internal State
    raw_complaints: List[Dict] # Extracted from DB
    themes: Dict[str, List[str]] # { "Noise": ["Fireworks", "Busking"] }
    semantic_context: str # "High tourist activity area with conflicting residential needs..."
    
    # Output
    final_report: str
    chart_data: Dict[str, Any] # For visualization
    urgency_score: int # 0-100
    sentiment_breakdown: Dict[str, int] # e.g. {"Negative": 80, "Neutral": 20}
    action_items: List[str]

# --- 2. Define Nodes ---

def retrieve_complaints(state: AnalysisState):
    """
    Fetch complaints within the polygon. 
    (For MVP, we might just fetch all if polygon is complex, or simple bounds check)
    """
    db = state['db_session']
    # MVP: Fetch all for now, in production use spatial query
    # In real implementation: filter by lat/lng vs polygon
    complaints = db.query(MockComplaint).all()
    
    # Simple bounds filter (if polygon provided)
    poly = state.get('region_polygon')
    filtered = []
    if poly and len(poly) > 2:
        # Simple bounding box
        lats = [p[0] for p in poly]
        lngs = [p[1] for p in poly]
        min_lat, max_lat = min(lats), max(lats)
        min_lng, max_lng = min(lngs), max(lngs)
        
        for c in complaints:
            if min_lat <= c.lat <= max_lat and min_lng <= c.lng <= max_lng:
                filtered.append({
                    "id": c.id, 
                    "summary": c.summary, 
                    "text": c.original_text,
                    "category": c.category,
                    "location": c.location
                })
    else:
        # If no polygon, return all (or empty?)
        # Let's return all for "Global Analysis" if empty
        filtered = [{"id": c.id, "summary": c.summary, "text": c.original_text} for c in complaints]
        
    print(f"DEBUG: Retrieved {len(filtered)} complaints.")
    return {"raw_complaints": filtered}

def analyze_context(state: AnalysisState):
    """
    LLM Step: Analyze the 'Context' from raw texts.
    Identify recurring themes, hidden connections, and root causes.
    """
    complaints = state['raw_complaints']
    if not complaints:
        return {"semantic_context": "No complaints found in this area.", "themes": {}}

    docs = "\n".join([f"- {c['summary']}: {c['text']}" for c in complaints])
    
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    messages = [
        SystemMessage(content="""
        You are a smart City Urban Planner AI for Busan, Korea.
        Analyze the provided civil complaints to understand the "Context".
        
        IMPORTANT: Output MUST be in **Korean** (Hangul).
        
        Output JSON format:
        {
            "semantic_narrative": "A rich Korean paragraph describing the situation (e.g., '서면 지역의 소음과 교통 혼잡이 주거 환경을 위협하고 있습니다...')",
            "themes": {
               "Theme Name (Korean)": ["Evidence 1", "Evidence 2"]
            },
            "urgency_score": 85,  // Integer 0-100 based on severity
            "sentiment_stats": {
                "Negative": 70, // Percentage
                "Neutral": 20,
                "Positive": 10
            }
        }
        """),
        HumanMessage(content=f"Complaints:\n{docs}")
    ]
    
    response = llm.invoke(messages)
    try:
        content = response.content.replace("```json", "").replace("```", "")
        data = json.loads(content)
        return {
            "semantic_context": data.get("semantic_narrative", ""),
            "themes": data.get("themes", {}),
            "urgency_score": data.get("urgency_score", 50),
            "sentiment_breakdown": data.get("sentiment_stats", {"Negative": 0, "Neutral": 0, "Positive": 0}),
            # Extract simple counts for chart from themes
            "chart_data": {
                "categories": list(data.get("themes", {}).keys()),
                "counts": [len(v) for v in data.get("themes", {}).values()]
            }
        }
    except:
        return {"semantic_context": "분석 실패", "themes": {}, "chart_data": {}}

def generate_report(state: AnalysisState):
    """
    LLM Step: Synthesize the final report and action items.
    """
    context = state['semantic_context']
    themes = state['themes']
    
    llm = ChatOpenAI(model="gpt-4o", temperature=0.3)
    messages = [
        SystemMessage(content="""
        Generate a 'Context-Driven' Action Report in **Korean**.
        Style: Professional, Insightful, Strategic (Korean Public Institution Style).
        Format: Markdown.
        
        Sections:
        1. 🌍 현황 분석 (Context Overview) - 심각성 위주
        2. 🔗 연관 패턴 (Interconnected Patterns) - 발견된 문제점들
        3. 🚀 전략적 제언 (Strategic Interventions) - 구체적 실행 방안
        
        IMPORTANT: Use ONLY Korean language. No English headers.
        """),
        HumanMessage(content=f"Context: {context}\nThemes: {themes}")
    ]
    
    response = llm.invoke(messages)
    return {
        "final_report": response.content,
        "chart_data": state.get("chart_data", {}),
        "urgency_score": state.get("urgency_score", 0),
        "sentiment_breakdown": state.get("sentiment_breakdown", {})
    }

# --- 3. Build Graph ---
def create_graph():
    workflow = StateGraph(AnalysisState)
    
    # Add Nodes
    workflow.add_node("retrieve", retrieve_complaints)
    workflow.add_node("analyze", analyze_context)
    workflow.add_node("report", generate_report)
    
    # Add Edges
    workflow.set_entry_point("retrieve")
    workflow.add_edge("retrieve", "analyze")
    workflow.add_edge("analyze", "report")
    workflow.add_edge("report", END)
    
    return workflow.compile()

# Singleton
analysis_graph = create_graph()
