from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from datetime import datetime


class ComplaintRequest(BaseModel):
    """Request model for classifying a complaint"""
    complaint: str = Field(
        ..., 
        min_length=5, 
        max_length=2000,
        description="Customer complaint text"
    )
    customer_id: Optional[str] = Field(
        None, 
        description="Optional customer ID for tracking"
    )


class ComplaintResponse(BaseModel):
    """Response model after classification"""
    id: int
    complaint: str
    category: str
    confidence: float
    keywords_matched: List[str] = []  # Added
    priority: str = "Medium"  # Added with default
    timestamp: str
    total_complaints: int
    category_count: int
    message: str


class StatsResponse(BaseModel):
    """Statistics response model"""
    total_complaints: int
    category_breakdown: Dict[str, int]
    category_percentages: Dict[str, float] = {}  # Added
    most_common_category: Optional[str] = None  # Added
    average_confidence: float = 0.0  # Added


class CategoryStatsResponse(BaseModel):
    """Category-specific statistics"""
    category: str
    count: int
    complaints: List[Dict]