from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware 
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from routers.loanapproval import router
from routers.Users import rout
from database import engine
from models.user import Base


app = FastAPI() 

Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:5173"],
    allow_methods=["POST"],
    allow_headers=["*"],
    allow_credentials = True
)

app.include_router(router=router)
app.include_router(router=rout)

