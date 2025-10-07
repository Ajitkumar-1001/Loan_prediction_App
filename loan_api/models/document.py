"""
Document model for RAG chatbot knowledge base
Stores metadata about uploaded documents for admin management
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class Document(Base):
    """Model for storing uploaded document metadata"""

    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)  # UUID
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # .pdf, .txt, .doc, .docx
    file_size = Column(Integer, nullable=False)  # in bytes
    chunks_count = Column(Integer, default=0)

    # Admin who uploaded
    uploaded_by = Column(String, ForeignKey("users.email"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Status
    status = Column(String, default="active")  # active, deleted

    # Relationship to user
    uploader = relationship("User", back_populates="uploaded_documents")

    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "id": self.id,
            "filename": self.filename,
            "file_type": self.file_type,
            "file_size": self.file_size,
            "chunks_count": self.chunks_count,
            "uploaded_by": self.uploaded_by,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "status": self.status
        }
