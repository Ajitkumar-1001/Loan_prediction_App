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
from models.document import Document
from sqlalchemy.orm import Session
from redis_client import redis_client, CacheKeys, CacheTTL

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
    Chat history is cached in Redis for session continuity

    Args:
        chat_message: User's message and session ID

    Returns:
        Chatbot response with timestamp
    """
    try:
        logger.info(f"Received chat message: {chat_message.message}")

        # Store message in chat history (Redis)
        history_key = CacheKeys.chat_history(chat_message.session_id)
        user_msg = {
            "role": "user",
            "message": chat_message.message,
            "timestamp": datetime.now().isoformat()
        }
        redis_client.rpush(history_key, user_msg)
        redis_client.expire(history_key, CacheTTL.CHAT_HISTORY)

        # Get RAG chain
        chain = get_rag_chain()

        # Get response
        response = chain.ask(chat_message.message)

        # Store bot response in history
        bot_msg = {
            "role": "bot",
            "message": response,
            "timestamp": datetime.now().isoformat()
        }
        redis_client.rpush(history_key, bot_msg)

        # Keep only last 20 messages (10 exchanges)
        redis_client.ltrim(history_key, -20, -1)

        return ChatResponse(
            response=response,
            timestamp=datetime.now().isoformat(),
            session_id=chat_message.session_id
        )

    except Exception as e:
        logger.error(f"Error processing chat message: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{session_id}", response_model=ChatHistory)
async def get_chat_history(session_id: str):
    """Get chat history for a session from Redis cache"""
    try:
        history_key = CacheKeys.chat_history(session_id)
        messages = redis_client.lrange(history_key, 0, -1)

        return ChatHistory(messages=messages)
    except Exception as e:
        logger.error(f"Error retrieving chat history: {e}")
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


@router.delete("/history/{session_id}")
async def clear_session_history(session_id: str):
    """Clear chat history for specific session from Redis"""
    try:
        history_key = CacheKeys.chat_history(session_id)
        redis_client.delete(history_key)
        logger.info(f"Session history cleared: {session_id}")
        return {"message": f"Session {session_id} history cleared successfully"}
    except Exception as e:
        logger.error(f"Error clearing session history: {e}")
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


# Document upload endpoint
@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(require_admin),
    db: Session = Depends(get_db)
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

        # Store metadata in database
        document = Document(
            id=file_id,
            filename=file.filename,
            file_path=str(file_path),
            file_type=file_extension,
            file_size=file_size,
            chunks_count=len(chunks),
            uploaded_by=user.email,
            uploaded_at=datetime.now(),
            status="active"
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        # Invalidate documents list cache
        redis_client.invalidate_cache("documents:*")

        logger.info(f"Document uploaded: {file.filename} by {user.email}")

        return {
            "message": "Document uploaded and processed successfully",
            "document": document.to_dict()
        }
        
    except Exception as e:
        logger.error(f"Error uploading document: {e}")
        # Clean up file if it was saved
        if 'file_path' in locals() and file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=str(e))


# List documents endpoint
@router.get("/documents")
async def list_documents(
    user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get list of uploaded documents (Admin only) - Redis cached"""
    try:
        # Try to get from cache
        cache_key = CacheKeys.documents_list()
        cached = redis_client.get(cache_key)

        if cached is not None:
            logger.debug("Documents list retrieved from cache")
            return {"documents": cached, "from_cache": True}

        # Cache miss - query database
        documents = db.query(Document).filter(Document.status == "active").all()
        doc_list = [doc.to_dict() for doc in documents]

        # Cache the result
        redis_client.set(cache_key, doc_list, CacheTTL.DOCUMENTS_LIST)

        return {"documents": doc_list, "from_cache": False}
    except Exception as e:
        logger.error(f"Error listing documents: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Delete document endpoint
@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Delete a document from knowledge base (Admin only)"""
    try:
        # Find document in database
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.status == "active"
        ).first()

        if not document:
            raise HTTPException(status_code=404, detail="Document not found")

        # Delete physical file
        file_path = Path(document.file_path)
        if file_path.exists():
            file_path.unlink()

        # Mark as deleted in database (soft delete)
        document.status = "deleted"
        db.commit()

        # Invalidate cache
        redis_client.invalidate_cache("documents:*")

        # Note: Vector store chunks remain (would need enhancement to remove specific chunks)
        # For now, they just won't be referenced

        logger.info(f"Document deleted: {document.filename} by {user.email}")

        return {
            "message": "Document deleted successfully",
            "document_id": document_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting document: {e}")
        raise HTTPException(status_code=500, detail=str(e))
