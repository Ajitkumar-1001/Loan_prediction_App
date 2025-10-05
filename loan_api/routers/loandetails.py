from fastapi import APIRouter, HTTPException 
from typing import List 
from schema import LoanDetails
from database import get_connection 


router = APIRouter(prefix="/loandetails" , tags= ["LoanDetails"])

@router.get("/", response_model= List[LoanDetails]) # type: ignore
def get_empdetails(): 

    conn = get_connection() 
    cursor = conn.cursor() 

    try: 
        query = "SELECT * FROM LoanDetails"
        cursor.execute(query)
        rows = cursor.fetchall()
        Loandetails = [dict(s) for s in rows]
        return Loandetails
    
    except Exception as e: 
        raise HTTPException(status_code = 500, details= str(e))
    