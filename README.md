# <div align="center">💰 Loan Prediction System</div>

## <div align="center">🔍 A Smart Loan Approval AI Tool Predict Loan Approval using Machine Learning , with REST API </div>

<p align="center">
  <img src="https://img.shields.io/badge/build-passing-brightgreen" alt="Build Passing"/>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License: MIT"/>
  <img src="https://img.shields.io/badge/python-3.8%2B-yellow" alt="Python Version"/>
  <img src="https://img.shields.io/github/repo-size/Ajitkumar-1001/Loan_prediction_App" alt="Repo Size"/>
</p>

---

### 📌 Overview

This project predicts **Loan Approval** with trained machine learning models such as (Logistic Regression , Ridge Classification, XGBOOST and Random forest Classifier )built on credit and income features. Additionally, it generates **custom financial advice** using a LLM, customized Report based on the outcome.

> 🔧 Stack:  
**FastAPI** (backend) + **SQLite3** (database) + **React + Tailwind + TypeScript** (frontend) + **MLflow** (tracking) + **LLM (Gemini)** for insights.

---

## 📦 Step 1: Environment Setup

✅ **Python Version:** 3.8 - 3.10 (Recommended < 3.11)

```bash
git clone https://github.com/Ajitkumar-1001/Loan_prediction_App.git
cd Loan_prediction_App
python -m venv Loan_App
source Loan_App/bin/activate
pip install -r requirements.txt
```
# Loan Prediction App

<div align="center">
  <h1>Loan Prediction</h1>
  <p>This project uses Machine Learning algorithms to predict loan approval for customers based on credit scores, income, loan amount, and other financial features.</p>
</div>

---

## 🚀 Features

* 📊 Trained ML model using feature engineering, PCA, and classification algorithms
* 🧠 MLflow experiment tracking
* 🔗 SQLite3 for relational data
* 🧪 FastAPI backend for inference
* 💻 React + TypeScript frontend with animated results
* 💬 LLM response suggestions via Gemini Pro API
* 🌐 Ready for cloud deployment

---

## 📦 Installation Instructions

### 1️⃣ Python Setup

> Recommended Python version: **< 3.11**

```bash
conda create -n Loan_App python=3.10 -y
conda activate Loan_App
pip install -r requirements.txt
```

### 2️⃣ Database Setup

> Create a SQLite database and required tables from the CSV dataset.

```bash
python create_database.py
```

### 3️⃣ Model Training + Logging

Train the model with feature selection, PCA, and classifiers like Logistic Regression, Random Forest, and Ridge. Log metrics using MLflow.

```bash
python train_model.py
```

Logged to `mlruns/` directory.

---

## 🧠 FastAPI Backend

### 🔧 Start the server:

```bash
uvicorn loan_api.main:app --reload
```

### 🔁 Endpoints:

* `POST /Loan/predict-loan` → returns prediction + LLM-based suggestion

---

## 💻 React Frontend

### 📁 Navigate to frontend:

```bash
cd frontend
npm install
```

### 🚀 Start development server:

```bash
npm run dev
```

* Form input fields
* Animated prediction + suggestions
* Validation to avoid empty or negative values

---



### 🔗 Backend (FastAPI):

* Create new **Web Service** on Render
* Connect GitHub repo
* Start command:

  ```bash
  uvicorn loan_api.main:app --host=0.0.0.0 --port=8000
  ```
* Add Environment Variables like `GEMINI_API_KEY`

### 🧑‍💻 Frontend (React):

* Create new **Static Site**
* Build command: `npm run build`
* Publish directory: `dist` or `build`

---

## 📬 API Example

```json
POST /Loan/predict-loan
{
  "IncomePerDependent": 10000,
  "LoanAmount": 2500000,
  "RiskScore": 650,
  "TotalDebtToIncomeRatio": 0.4,
  "InterestRate": 7.5,
  "AnnualIncome": 60000,
  "BaseInterestRate": 5.5
}
```

Response:

```json
{
  "prediction": "Approved",
  "message": "You are eligible for the loan.",
  "llm_response": "Based on your high income and low risk, we suggest going ahead with the loan application."
}
```

---

## 📚 Tech Stack

* FastAPI
* SQLite3
* MLflow
* React + TailwindCSS
* Gemini LLM API
* Docker-ready (optional)

---

## 🧑‍💻 Author

Ajit Kumar — [GitHub](https://github.com/Ajitkumar-1001)

---

## 📜 License

MIT License



## License

This project is licensed under the [MIT License](./LICENSE).
