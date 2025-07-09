from fastapi import APIRouter, HTTPException 
from typing import List 
from models import Applicants
from database import get_connection 

router = APIRouter(prefix="/applicants",tags = ["Applicants"])

@router.get("/", response_model = List[Applicants])
def get_all_applicants():
    conn = get_connection() 
    cursor = conn.cursor()

    try: 
        query = "SELECT * FROM Applicants"
        cursor.execute(query)
        rows = cursor.fetchall() 
        applicants = [dict(row) for row in rows]
        return applicants 
    
    except Exception as e : 
        raise HTTPException(status_code = 500 , details = str(e))
    



