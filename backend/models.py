from sqlalchemy import Column, Integer, String, Float, Text, JSON, DateTime
from sqlalchemy.sql import func
from database import Base

class WordCloudItem(Base):
    __tablename__ = "word_cloud_items"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    size = Column(String) # e.g., "3.5rem"
    class_name = Column(String) # Tailwind classes
    style = Column(JSON, nullable=True) # Custom styles if any

class ComplaintPattern(Base):
    __tablename__ = "complaint_patterns"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(Text)
    percentage = Column(Integer, nullable=True) # For progress bars if needed

class HighRiskComplaint(Base):
    __tablename__ = "high_risk_complaints"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    time_text = Column(String) # "방금 전", "12분 전" - in real app, use DateTime
    location = Column(String)
    description = Column(String)
    category = Column(String) # "warning", "water_drop" for icon choice

class InsightData(Base):
    __tablename__ = "insight_data"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class MockComplaint(Base):
    __tablename__ = "mock_complaints"
    
    id = Column(String, primary_key=True)
    # Core Data
    summary = Column(String)
    original_text = Column(String)
    location = Column(String)
    lat = Column(Float, nullable=True) # New: For Map
    lng = Column(Float, nullable=True) # New: For Map
    category = Column(String)
    
    # 10+ AI Metrics
    urgency_score = Column(Integer) # 1-10
    safety_risk_score = Column(Integer) # 1-10
    inconvenience_score = Column(Integer) # 1-10
    visual_impact_score = Column(Integer) # 1-10
    sentiment_score = Column(Integer) # 1-10 (User anger level)
    
    estimated_cost = Column(String) # Low, Medium, High
    required_personnel = Column(String) # Estimate
    legal_risk = Column(String) # Low, High
    probability_of_escalation = Column(Integer) # %
    department_in_charge = Column(String)
    
    status = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DashboardStat(Base):
    __tablename__ = "dashboard_stats"
    
    key = Column(String, primary_key=True)
    value = Column(String)
    description = Column(String)
