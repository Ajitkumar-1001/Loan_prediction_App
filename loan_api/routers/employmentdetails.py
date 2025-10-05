from fastapi import APIRouter, HTTPException 
from typing import List 
from schema import EmploymentDetails 
from database import get_connection 


router = APIRouter(prefix="/employmentdetails" , tags= ["EmploymentDetails"])

@router.get("/", response_model= List[EmploymentDetails]) # type: ignore
def get_empdetails(): 

    conn = get_connection() 
    cursor = conn.cursor() 

    try: 
        query = "SELECT * FROM EmploymentDetails"
        cursor.execute(query)
        rows = cursor.fetchall()
        empdetails = [dict(s) for s in rows]
        return empdetails
    
    except Exception as e: 
        raise HTTPException(status_code = 500, details= str(e))
    