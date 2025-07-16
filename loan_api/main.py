from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from routers.loanapproval import router

app = FastAPI() 

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"]
)

app.include_router(router=router)