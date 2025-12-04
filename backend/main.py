from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List, Optional
from datetime import datetime
from collections import defaultdict

from models import (
    ComplaintRequest, 
    ComplaintResponse, 
    StatsResponse,
    CategoryStatsResponse
)
from classifier_transformer import TransformerComplaintClassifier, CATEGORIES

# Initialize FastAPI app
app = FastAPI(
    title="Customer Complaint Classifier API",
    description="""
    An API to classify customer complaints into categories:
    - Payment Issue
    - Delivery Issue
    - Product Defect
    - Refund Request
    - Account Problem
    - Fraud
    - General Query
    """,
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize classifier
classifier = TransformerComplaintClassifier(model_name="distilbert-base-uncased")

# In-memory storage
complaints_db: List[Dict] = []
category_counts: Dict[str, int] = {cat: 0 for cat in CATEGORIES}
complaint_id_counter = 0


# ==================== ENDPOINTS ====================

@app.get("/", tags=["Root"])
async def root():
    """Welcome endpoint with API information"""
    return {
        "message": "Welcome to Customer Complaint Classifier API",
        "version": "1.0.0",
        "endpoints": {
            "POST /api/classify": "Classify a complaint",
            "GET /api/stats": "Get complaint statistics",
            "GET /api/complaints": "Get all complaints",
            "GET /api/complaints/{category}": "Get complaints by category",
            "GET /api/categories": "Get all available categories",
            "DELETE /api/reset": "Reset all data"
        }
    }


@app.get("/api/categories", tags=["Categories"])
async def get_categories():
    """Get all available complaint categories"""
    return {
        "categories": CATEGORIES,
        "total": len(CATEGORIES)
    }


@app.post("/api/classify", response_model=ComplaintResponse, tags=["Classification"])
async def classify_complaint(request: ComplaintRequest):
    """
    Classify a customer complaint into one of the predefined categories.
    
    Returns the category, confidence score, and complaint statistics.
    """
    global complaint_id_counter
    
    # Validate input
    complaint_text = request.complaint.strip()
    if not complaint_text:
        raise HTTPException(
            status_code=400, 
            detail="Complaint text cannot be empty"
        )
    
    if len(complaint_text) < 5:
        raise HTTPException(
            status_code=400,
            detail="Complaint text must be at least 5 characters"
        )
    
    # Classify the complaint
    category, confidence, keywords, priority = classifier.classify(complaint_text)
    
    # Update counters
    complaint_id_counter += 1
    category_counts[category] += 1
    total_complaints = sum(category_counts.values())
    
    # Store complaint
    complaint_record = {
        "id": complaint_id_counter,
        "complaint": complaint_text,
        "customer_id": request.customer_id,
        "category": category,
        "confidence": confidence,
        "keywords_matched": keywords,  # Added
        "priority": priority,  # Added
        "timestamp": datetime.now().isoformat()
    }
    complaints_db.append(complaint_record)
    
    return ComplaintResponse(
        id=complaint_id_counter,
        complaint=complaint_text,
        category=category,
        confidence=confidence,
        keywords_matched=keywords,  # Added
        priority=priority,  # Added
        timestamp=complaint_record["timestamp"],
        total_complaints=total_complaints,
        category_count=category_counts[category],
        message=f"Complaint classified as '{category}' with {confidence*100:.0f}% confidence"
    )


@app.post("/api/classify/batch", tags=["Classification"])
async def classify_batch(complaints: List[ComplaintRequest]):
    """Classify multiple complaints at once"""
    results = []
    for complaint_req in complaints:
        result = await classify_complaint(complaint_req)
        results.append(result)
    return {"results": results, "total_processed": len(results)}


@app.get("/api/stats", response_model=StatsResponse, tags=["Statistics"])
async def get_stats():
    """Get overall complaint statistics"""
    total = sum(category_counts.values())
    
    # Calculate percentages
    category_percentages = {}
    for cat, count in category_counts.items():
        category_percentages[cat] = round((count / total * 100), 2) if total > 0 else 0.0
    
    # Find most common category
    most_common = None
    if total > 0:
        most_common = max(category_counts, key=category_counts.get)
    
    # Calculate average confidence
    avg_confidence = 0.0
    if complaints_db:
        avg_confidence = sum(c.get("confidence", 0) for c in complaints_db) / len(complaints_db)
    
    return StatsResponse(
        total_complaints=total,
        category_breakdown=category_counts,
        category_percentages=category_percentages,
        most_common_category=most_common,
        average_confidence=round(avg_confidence, 2)
    )


@app.get("/api/stats/detailed", tags=["Statistics"])
async def get_detailed_stats():
    """Get detailed statistics with percentages"""
    total = sum(category_counts.values())
    
    breakdown = []
    for category, count in category_counts.items():
        percentage = (count / total * 100) if total > 0 else 0
        breakdown.append({
            "category": category,
            "count": count,
            "percentage": round(percentage, 2)
        })
    
    # Sort by count descending
    breakdown.sort(key=lambda x: x["count"], reverse=True)
    
    return {
        "total_complaints": total,
        "breakdown": breakdown,
        "most_common": breakdown[0]["category"] if total > 0 else None,
        "least_common": breakdown[-1]["category"] if total > 0 else None
    }


@app.get("/api/complaints", tags=["Complaints"])
async def get_all_complaints(
    limit: int = Query(default=100, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    """Get all complaints with pagination"""
    total = len(complaints_db)
    paginated = complaints_db[offset:offset + limit]
    
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "complaints": paginated
    }


@app.get("/api/complaints/category/{category}", tags=["Complaints"])
async def get_complaints_by_category(category: str):
    """Get all complaints for a specific category"""
    # Validate category
    if category not in CATEGORIES:
        raise HTTPException(
            status_code=404,
            detail=f"Category '{category}' not found. Valid categories: {CATEGORIES}"
        )
    
    filtered = [c for c in complaints_db if c["category"] == category]
    
    return CategoryStatsResponse(
        category=category,
        count=len(filtered),
        complaints=filtered
    )


@app.get("/api/complaints/{complaint_id}", tags=["Complaints"])
async def get_complaint_by_id(complaint_id: int):
    """Get a specific complaint by ID"""
    for complaint in complaints_db:
        if complaint["id"] == complaint_id:
            return complaint
    
    raise HTTPException(
        status_code=404,
        detail=f"Complaint with ID {complaint_id} not found"
    )


@app.post("/api/analyze", tags=["Analysis"])
async def analyze_complaint(request: ComplaintRequest):
    """
    Analyze a complaint and show scores for all categories
    (for debugging/understanding classification)
    """
    scores = classifier.get_all_probabilities(request.complaint)
    category, confidence, keywords, priority = classifier.classify(request.complaint)
    
    # Sort scores by value
    sorted_scores = dict(sorted(scores.items(), key=lambda x: x[1], reverse=True))
    
    return {
        "complaint": request.complaint,
        "predicted_category": category,
        "confidence": confidence,
        "keywords": keywords,
        "priority": priority,
        "all_category_scores": sorted_scores
    }


@app.delete("/api/reset", tags=["Admin"])
async def reset_data():
    """Reset all complaint data (for testing)"""
    global complaints_db, category_counts, complaint_id_counter
    
    complaints_db = []
    category_counts = {cat: 0 for cat in CATEGORIES}
    complaint_id_counter = 0
    
    return {"message": "All data has been reset", "status": "success"}


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "total_complaints_processed": sum(category_counts.values())
    }


# Run with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)