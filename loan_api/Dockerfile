# loan_api/Dockerfile
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app/loan_api 

ENV PYTHONPATH="${PYTHONPATH}:/app"

# Copy requirements only from backend
# Copy full backend folder
COPY ./loan_api /app/loan_api

# Also copy shared files outside
COPY ./App_files /app/App_files
COPY ./config /app/config
COPY ./data /app/data

COPY ./loan_api/requirements.txt /app/loan_api/requirements.txt

# Install dependencies
RUN pip install --upgrade pip && pip install -r requirements.txt



# Expose FastAPI port
EXPOSE 8000
RUN ls -l /app/loan_api && cat /app/loan_api/main.py

# Start FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
