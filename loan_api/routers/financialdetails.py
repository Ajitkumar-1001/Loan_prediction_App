from fastapi import APIRouter, HTTPException 
from typing import List 
from schema import FinancialDetails 
from database import get_connection 


router = APIRouter(prefix = "/financialdetails" , tags = ["FinancialDetails"])

@router.get("/", response_model= List[FinancialDetails]) # type: ignore
def get_findetails():
     conn = get_connection() 
     cursor = conn.cursor() 

     try:
          query = "SELECT * FROM FinancialDetails"
          cursor.execute(query)
          rows = cursor.fetchall() 
          findetails = [dict(s) for s in rows]
          return findetails 

     except Exception as e: 
          raise HTTPException(status_code = 500, details = str(e))
      
      