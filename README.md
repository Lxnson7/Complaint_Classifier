# Customer Complaint Classification API

This project provides a **FastAPI-based REST API** for automatically classifying e‑commerce / service customer complaints into predefined categories using a **Transformer model (DistilBERT)** from HuggingFace.

**Supported categories:**
- Payment Issue
- Delivery Issue
- Product Defect
- Refund Request
- Account Problem
- Fraud
- General Query

It also exposes endpoints for statistics, debugging analysis, and basic health monitoring.

---

## 1. Problem Chosen

Modern e‑commerce platforms receive thousands of free-text customer complaints every day. Manually reading and routing these complaints to the correct support team (payments, delivery, fraud, etc.) is:
- Time-consuming
- Error-prone
- Difficult to scale

### Goal
Automatically classify each incoming complaint into one of a small number of operational categories so that:
- Tickets can be auto-routed to the right team
- High-priority issues (e.g., fraud) can be escalated faster
- Overall resolution time and support load are reduced

### Categories
The system uses the following fixed set of complaint categories (taken from the training dataset):

1. `Payment Issue`
2. `Delivery Issue`
3. `Product Defect`
4. `Refund Request`
5. `Account Problem`
6. `Fraud`
7. `General Query`

Each category also has an associated **priority level** used in responses:
- **Critical:** Fraud
- **High:** Payment Issue, Product Defect
- **Medium:** Refund Request, Delivery Issue, Account Problem
- **Low:** General Query

*(Defined in `training_data.py` via `PRIORITY_MAP`.)*

---

## 2. Model Used

The core model is implemented in `classifier_transformer.py` as:
`TransformerComplaintClassifier(model_name="distilbert-base-uncased")`

### 2.1 Architecture
- **Base model**: `distilbert-base-uncased` (HuggingFace Transformers)
- **Task**: Text classification (sequence classification)
- **Number of labels**: 7 (the categories above)
- **Frameworks**:
  - `transformers` (AutoTokenizer, AutoModelForSequenceClassification, Trainer, pipeline)
  - `torch` for training
  - `scikit-learn` for train/test split and evaluation metrics
  - `numpy` for array handling

### 2.2 Training Data
Defined in `training_data.py`:
- `TRAINING_DATA`: a list of `(text, label)` pairs.
- Contains 50+ examples per category, covering:
  - Payment problems (double charge, failed transaction)
  - Delivery issues (delayed, lost, wrong address)
  - Product defects (broken, not working)
  - Refund requests
  - Account problems (login issues, OTP)
  - Fraud/unauthorized activity
  - General queries

### 2.3 Training Process
In `TransformerComplaintClassifier.train()`:
1. **Preprocessing**: Lowercasing, trimming, removing URLs.
2. **Dataset split**: 80/20 split (`stratify=labels`).
3. **Tokenization**: `max_length=128`, truncation, padding.
4. **Training**: 3 epochs, batch size 8, weight decay 0.01.
5. **Evaluation**: Prints accuracy and classification report.
6. **Persistence**: Saves model to `models/transformer_classifier`.

On startup, the classifier checks for a saved model. If none exists, it trains from scratch.

### 2.4 Inference
- **Method**: `classify(complaint: str)`
- **Logic**: Uses HuggingFace pipeline to find the highest scoring label.
- **Extras**: Extracts keywords (length > 3) and maps priority.

---

## 3. API Details

The API is defined in `main.py` using FastAPI.

### 3.1 Base URL
- **Local**: `http://localhost:8000`
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### 3.2 Endpoints Overview
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Root info |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/categories` | List available categories |
| `POST` | `/api/classify` | Classify a single complaint |
| `POST` | `/api/classify/batch` | Classify multiple complaints |
| `GET` | `/api/stats` | Overall statistics |
| `GET` | `/api/stats/detailed` | Detailed statistics with breakdown |
| `GET` | `/api/complaints` | List stored complaints (paginated) |
| `GET` | `/api/complaints/{id}` | Get complaint by ID |
| `POST` | `/api/analyze` | Detailed analysis (all scores) |
| `DELETE` | `/api/reset` | Reset in-memory data |

### 3.3 Models (JSON Examples)

#### 3.3.1 Classify Request (`POST /api/classify`)
```json
{
  "complaint": "I was charged twice for my order but only placed it once.",
  "customer_id": "CUST-001"
}
{
  "id": 1,
  "complaint": "I was charged twice for my order but only placed it once.",
  "category": "Payment Issue",
  "confidence": 0.94,
  "keywords_matched": ["charged", "twice", "order"],
  "priority": "High",
  "timestamp": "2025-12-04T18:51:21.123456",
  "total_complaints": 1,
  "category_count": 1,
  "message": "Complaint classified as 'Payment Issue' with 94% confidence"
}
```
Stats Response (GET /api/stats)
``` json
{
  "total_complaints": 100,
  "category_breakdown": {
    "Payment Issue": 30,
    "Delivery Issue": 20,
    "Product Defect": 15,
    "Refund Request": 10,
    "Account Problem": 10,
    "Fraud": 5,
    "General Query": 10
  },
  "most_common_category": "Payment Issue",
  "average_confidence": 0.88
}
```
Steps to Run the Solution
4.1 Prerequisites
Python 3.9+ recommended

pip installed

Internet access (first run will download the HuggingFace model)

4.2 Install Dependencies
From the project root:
pip install -r requirements.txt
4.3 Run the API
Use Uvicorn to start the FastAPI app:
The app will run at http://localhost:8000.

4.4 Test the API
Open your browser and go to Swagger docs: http://localhost:8000/docs

Click POST /api/classify -> Try it out.

Enter a sample complaint and execute.

Check the JSON response for category and priority.

5. Git Commit Description
When committing this project, you can use the following summary:

Add transformer-based customer complaint classification API

- Implement FastAPI service for classifying customer complaints
- Add DistilBERT-based TransformerComplaintClassifier with training pipeline
- Include labeled training dataset covering 7 complaint categories
- Expose endpoints for classification, batch classification, stats, and analysis
- Implement in-memory storage for complaints and category counts
