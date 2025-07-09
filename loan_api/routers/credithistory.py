from fastapi import APIRouter, HTTPException 
from typing import List 
from models import CreditHistory
from database import get_connection 


router = APIRouter(prefix="/credithistory" , tags= ["CreditHistory"])

@router.get("/", response_model= List[CreditHistory])
def get_empdetails(): 

    conn = get_connection() 
    cursor = conn.cursor() 

    try: 
        query = "SELECT * FROM CreditHistory"
        cursor.execute(query)
        rows = cursor.fetchall()
        cred = [dict(s) for s in rows]
        return cred
    
    except Exception as e: 
        raise HTTPException(status_code = 500, details= str(e))
    