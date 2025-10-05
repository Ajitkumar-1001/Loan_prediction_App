# loan_api/Dockerfile
FROM python:3.11-slim

# Set working directory at the root level, not inside loan_api/
WORKDIR /app

ENV PYTHONPATH="${PYTHONPATH}:/app"

# Copy backend
COPY ./loan_api /app/loan_api
COPY ./App_files /app/App_files
COPY ./config /app/config
COPY ./data /app/data
COPY ./Rag_files /app/Rag_files
COPY ./loan_api/requirements.txt /app/requirements.txt

# Install dependencies
RUN pip install --upgrade pip && pip install -r /app/requirements.txt

# Expose FastAPI port
EXPOSE 8000

# Start FastAPI with correct import path
CMD ["uvicorn", "loan_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
