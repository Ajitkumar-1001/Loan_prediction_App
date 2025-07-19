import sys
from dotenv import load_dotenv
from fastapi import APIRouter
from pathlib import Path
from email.message import EmailMessage
import smtplib
import os
from datetime import datetime
sys.path.append(str(Path(__file__).resolve().parent.parent))
from models.feedback import Feedback

env_path = Path(__file__).resolve().parent.parent / '.env'

load_dotenv(dotenv_path=env_path)


router = APIRouter(prefix="/review" , tags=["feedback"])

@router.post("/send-feedback")
def get_feedback(data:Feedback):
    
    email = os.getenv("USER_EMAIL")
    password = os.getenv("USER_PASS")

    Email = EmailMessage() 
    Email["Subject"] = "Hey, Ajit! You got a feedback on your SmartLoanPredictor App!"
    Email["From"] = email 
    Email["To"] = email 

    Email.set_content(f"""
 Feedback received at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

Name: {data.name}
Email: {data.email}

 Message:
{data.message}
    """)

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(email, password)
            smtp.send_message(Email)
        return {"status": "success"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


