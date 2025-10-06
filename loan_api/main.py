from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))
from routers.loanapproval import router
from routers.Users import rout
from routers.chatbot import router as chatbot_router
from database import engine
from models.user import Base


app = FastAPI()

Base.metadata.create_all(bind=engine)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development/network access
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials = True
)

app.include_router(router=router,prefix="/api")
app.include_router(router=rout, prefix="/api")
app.include_router(router=chatbot_router, prefix="/api")

