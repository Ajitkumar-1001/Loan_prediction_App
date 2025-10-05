"""
Chatbot Router for Banking Assistant
Provides REST and WebSocket endpoints for RAG-based chatbot
"""
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Dict, Optional
import sys
from pathlib import Path
import json
from datetime import datetime
import os
import uuid
import shutil

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from Rag_files.rag_chain import BankingRAGChain, StreamingBankingRAGChain, initialize_knowledge_base
from Rag_files.vector_store import VectorStoreManager
from config.config import logger
from authenticate import decode_access_token
from database import SessionLocal
from models.user import User
from sqlalchemy.orm import Session

router = APIRouter(prefix="/chatbot", tags=["Chatbot"])
security = HTTPBearer()

# Upload directory
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "Rag_files" / "uploaded_documents"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Initialize RAG chain (singleton)
rag_chain = None
streaming_rag_chain = None


def get_rag_chain():
    """Get or create RAG chain instance"""
    global rag_chain
    if rag_chain is None:
        logger.info("Initializing RAG chain")
        try:
            rag_chain = BankingRAGChain()
            logger.info("RAG chain initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing RAG chain: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to initialize chatbot: {str(e)}")
    return rag_chain


def get_streaming_rag_chain():
    """Get or create streaming RAG chain instance"""
    global streaming_rag_chain
    if streaming_rag_chain is None:
        logger.info("Initializing streaming RAG chain")
        try:
            streaming_rag_chain = StreamingBankingRAGChain()
            logger.info("Streaming RAG chain initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing streaming RAG chain: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to initialize chatbot: {str(e)}")
    return streaming_rag_chain


# Pydantic models
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = "default"


class ChatResponse(BaseModel):
    response: str
    timestamp: str
    session_id: str


class ChatHistory(BaseModel):
    messages: List[Dict[str, str]]


# REST Endpoints
@router.post("/chat", response_model=ChatResponse)
async def chat(chat_message: ChatMessage):
    """
    Send a message to the chatbot and get a response

    Args:
        chat_message: User's message and session ID

    Returns:
        Chatbot response with timestamp
    """
    try:
        logger.info(f"Received chat message: {chat_message.message}")

        # Get RAG chain
        chain = get_rag_chain()

        # Get response
        response = chain.ask(chat_message.message)

        return ChatResponse(
            response=response,
            timestamp=datetime.now().isoformat(),
            session_id=chat_message.session_id
        )

    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/clear-history")
async def clear_history():
    """Clear the conversation history"""
    try:
        chain = get_rag_chain()
        chain.clear_history()
        logger.info("Chat history cleared")
        return {"message": "Chat history cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/initialize-kb")
async def initialize_kb():
    """Initialize the knowledge base with sample documents"""
    try:
        logger.info("Initializing knowledge base")
        initialize_knowledge_base()
        return {"message": "Knowledge base initialized successfully"}
    except Exception as e:
        logger.error(f"Error initializing knowledge base: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        chain = get_rag_chain()
        return {
            "status": "healthy",
            "model": chain.model_name,
            "temperature": chain.temperature
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }


# WebSocket endpoint for streaming responses
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time chat with streaming responses

    Usage:
        Connect to ws://localhost:8000/chatbot/ws
        Send JSON: {"message": "your question here"}
        Receive streaming responses
    """
    await websocket.accept()
    logger.info("WebSocket connection established")

    try:
        # Get streaming RAG chain
        chain = get_streaming_rag_chain()

        while True:
            # Receive message from client
            data = await websocket.receive_text()
            logger.info(f"Received WebSocket message: {data}")

            try:
                # Parse message
                message_data = json.loads(data)
                user_message = message_data.get("message", "")

                if not user_message:
                    await websocket.send_json({
                        "type": "error",
                        "content": "Empty message received"
                    })
                    continue

                # Send start signal
                await websocket.send_json({
                    "type": "start",
                    "content": "Processing your question..."
                })

                # Stream response
                full_response = ""
                async for chunk in chain.ask_stream(user_message):
                    full_response += chunk
                    await websocket.send_json({
                        "type": "stream",
                        "content": chunk
                    })

                # Send end signal
                await websocket.send_json({
                    "type": "end",
                    "content": full_response,
                    "timestamp": datetime.now().isoformat()
                })

            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "content": "Invalid JSON format"
                })
            except Exception as e:
                logger.error(f"Error processing WebSocket message: {e}")
                await websocket.send_json({
                    "type": "error",
                    "content": str(e)
                })

    except WebSocketDisconnect:
        logger.info("WebSocket connection closed")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass


# Session management (for future multi-user support)
class SessionManager:
    """Manage multiple chat sessions"""

    def __init__(self):
        self.sessions: Dict[str, BankingRAGChain] = {}

    def get_session(self, session_id: str) -> BankingRAGChain:
        """Get or create a session"""
        if session_id not in self.sessions:
            self.sessions[session_id] = BankingRAGChain()
        return self.sessions[session_id]

    def clear_session(self, session_id: str):
        """Clear a specific session"""
        if session_id in self.sessions:
            self.sessions[session_id].clear_history()

    def delete_session(self, session_id: str):
        """Delete a session"""
        if session_id in self.sessions:
            del self.sessions[session_id]


# Global session manager
session_manager = SessionManager()


@router.post("/session/{session_id}/clear")
async def clear_session(session_id: str):
    """Clear a specific session's history"""
    try:
        session_manager.clear_session(session_id)
        return {"message": f"Session {session_id} cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions for authentication
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        email = decode_access_token(token)
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


def require_admin(user: User = Depends(get_current_user)):
    """Verify user is admin"""
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# Document metadata storage (in-memory for now, can be moved to database)
documents_metadata = []


# Document upload endpoint
@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(require_admin)
):
    """
    Upload a document to the knowledge base (Admin only)
    Supports: PDF, TXT, DOC, DOCX
    """
    try:
        # Validate file type
        allowed_extensions = ['.pdf', '.txt', '.doc', '.docx']
        file_extension = Path(file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"File type not supported. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Generate unique filename
        file_id = str(uuid.uuid4())
        filename = f"{file_id}{file_extension}"
        file_path = UPLOAD_DIR / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(file_path)
        
        # Process document and add to vector store
        vsm = VectorStoreManager()
        
        # Load document based on type
        if file_extension == '.pdf':
            from langchain_community.document_loaders import PyPDFLoader
            loader = PyPDFLoader(str(file_path))
        elif file_extension in ['.txt']:
            from langchain_community.document_loaders import TextLoader
            loader = TextLoader(str(file_path))
        elif file_extension in ['.doc', '.docx']:
            from langchain_community.document_loaders import UnstructuredWordDocumentLoader
            loader = UnstructuredWordDocumentLoader(str(file_path))
        
        # Load and process
        documents = loader.load()
        chunks = vsm.split_documents(documents, chunk_size=1000, chunk_overlap=200)
        
        # Add metadata
        for chunk in chunks:
            chunk.metadata['source_file'] = file.filename
            chunk.metadata['file_id'] = file_id
            chunk.metadata['uploaded_by'] = user.email
            chunk.metadata['uploaded_at'] = datetime.now().isoformat()
        
        # Add to vector store
        vsm.add_documents(chunks)
        
        # Store metadata
        doc_metadata = {
            "id": file_id,
            "filename": file.filename,
            "uploaded_at": datetime.now().isoformat(),
            "size": file_size,
            "type": file_extension,
            "uploaded_by": user.email,
            "chunks_count": len(chunks),
            "file_path": str(file_path)
        }
        documents_metadata.append(doc_metadata)
        
        logger.info(f"Document uploaded: {file.filename} by {user.email}")
        
        return {
            "message": "Document uploaded and processed successfully",
            "document": doc_metadata
        }
        
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        # Clean up file if it was saved
        if 'file_path' in locals() and file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=str(e))


# List documents endpoint
@router.get("/documents")
async def list_documents(user: User = Depends(require_admin)):
    """Get list of uploaded documents (Admin only)"""
    try:
        return {"documents": documents_metadata}
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Delete document endpoint
@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    user: User = Depends(require_admin)
):
    """Delete a document from knowledge base (Admin only)"""
    try:
        # Find document metadata
        doc = next((d for d in documents_metadata if d['id'] == document_id), None)
        
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Delete physical file
        file_path = Path(doc['file_path'])
        if file_path.exists():
            file_path.unlink()
        
        # Remove from metadata
        documents_metadata.remove(doc)
        
        # Note: Vector store chunks remain (would need enhancement to remove specific chunks)
        # For now, they just won't be referenced
        
        logger.info(f"Document deleted: {doc['filename']} by {user.email}")
        
        return {
            "message": "Document deleted successfully",
            "document_id": document_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))
