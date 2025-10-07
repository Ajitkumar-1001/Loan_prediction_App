"""
Vector Store Setup for Banking Chatbot RAG System
Uses ChromaDB for document storage and retrieval
"""
import os
from pathlib import Path
from typing import List, Optional
import sys

sys.path.append(str(Path(__file__).resolve().parent.parent))

from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    DirectoryLoader
)
from langchain.schema import Document
from config.config import logger


class VectorStoreManager:
    """Manages vector database operations for RAG"""

    def __init__(
        self,
        persist_directory: str = None,
        collection_name: str = "banking_docs",
        embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    ):
        """
        Initialize Vector Store Manager

        Args:
            persist_directory: Directory to persist ChromaDB (None for auto-detection)
            collection_name: Name of the collection
            embedding_model: HuggingFace embedding model name
        """
        # Auto-detect persist directory based on environment
        if persist_directory is None:
            # Check if running in Docker (working_dir is /app/loan_api)
            if Path("/app/Rag_files/chroma_db").exists() or Path("/app").exists():
                persist_directory = "/app/Rag_files/chroma_db"
            else:
                # Local development
                persist_directory = str(Path(__file__).parent / "chroma_db")

        self.persist_directory = persist_directory
        self.collection_name = collection_name

        # Initialize embeddings with caching for faster retrieval
        logger.info(f"Loading embedding model: {embedding_model}")
        self.embeddings = HuggingFaceEmbeddings(
            model_name=embedding_model,
            model_kwargs={'device': 'cpu'},
            encode_kwargs={
                'normalize_embeddings': True,
                'batch_size': 32  # Process in batches for speed
            },
            cache_folder="/tmp/huggingface_cache"  # Cache embeddings
        )

        # Create persist directory if it doesn't exist
        Path(persist_directory).mkdir(parents=True, exist_ok=True)

        # Initialize or load vector store
        self.vector_store = None
        self._load_or_create_vectorstore()

    def _load_or_create_vectorstore(self):
        """Load existing vector store or create new one"""
        try:
            import chromadb
            from chromadb.config import Settings

            # Create ChromaDB persistent client
            logger.info(f"Initializing ChromaDB client at {self.persist_directory}")
            chroma_client = chromadb.PersistentClient(
                path=self.persist_directory,
                settings=Settings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )

            # Initialize vector store with persistent client
            logger.info(f"Loading collection: {self.collection_name}")
            self.vector_store = Chroma(
                client=chroma_client,
                collection_name=self.collection_name,
                embedding_function=self.embeddings
            )

            # Log document count
            try:
                count = self.vector_store._collection.count()
                logger.info(f"Vector store loaded with {count} documents")
            except:
                logger.info("Vector store initialized (new collection)")

        except Exception as e:
            logger.error(f"Error loading/creating vector store: {e}")
            raise

    def load_documents_from_directory(
        self,
        directory: str,
        glob_pattern: str = "**/*.txt",
        loader_cls=TextLoader
    ) -> List[Document]:
        """
        Load documents from a directory

        Args:
            directory: Path to directory containing documents
            glob_pattern: Pattern to match files (e.g., "**/*.pdf", "**/*.txt")
            loader_cls: Loader class to use

        Returns:
            List of Document objects
        """
        try:
            logger.info(f"Loading documents from {directory} with pattern {glob_pattern}")
            loader = DirectoryLoader(
                directory,
                glob=glob_pattern,
                loader_cls=loader_cls,
                show_progress=True
            )
            documents = loader.load()
            logger.info(f"Loaded {len(documents)} documents")
            return documents
        except Exception as e:
            logger.error(f"Error loading documents: {e}")
            return []

    def split_documents(
        self,
        documents: List[Document],
        chunk_size: int = 1000,
        chunk_overlap: int = 200
    ) -> List[Document]:
        """
        Split documents into smaller chunks

        Args:
            documents: List of documents to split
            chunk_size: Size of each chunk
            chunk_overlap: Overlap between chunks

        Returns:
            List of split documents
        """
        try:
            logger.info(f"Splitting {len(documents)} documents into chunks")
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=chunk_size,
                chunk_overlap=chunk_overlap,
                length_function=len,
                separators=["\n\n", "\n", " ", ""]
            )
            splits = text_splitter.split_documents(documents)
            logger.info(f"Created {len(splits)} chunks")
            return splits
        except Exception as e:
            logger.error(f"Error splitting documents: {e}")
            return []

    def add_documents(self, documents: List[Document]) -> None:
        """
        Add documents to vector store (auto-persisted with ChromaDB 0.5+)

        Args:
            documents: List of documents to add
        """
        try:
            logger.info(f"Adding {len(documents)} documents to vector store")
            self.vector_store.add_documents(documents)

            # Verify documents were added
            count = self.vector_store._collection.count()
            logger.info(f"Documents added successfully. Total count: {count}")
        except Exception as e:
            logger.error(f"Error adding documents: {e}")
            raise

    def similarity_search(
        self,
        query: str,
        k: int = 4,
        filter: Optional[dict] = None
    ) -> List[Document]:
        """
        Perform similarity search

        Args:
            query: Search query
            k: Number of results to return
            filter: Optional metadata filter

        Returns:
            List of relevant documents
        """
        try:
            logger.info(f"Performing similarity search for: {query}")
            results = self.vector_store.similarity_search(
                query,
                k=k,
                filter=filter
            )
            logger.info(f"Found {len(results)} relevant documents")
            return results
        except Exception as e:
            logger.error(f"Error in similarity search: {e}")
            return []

    def get_retriever(self, k: int = 4):
        """
        Get retriever for RAG chain with MMR for diversity

        Args:
            k: Number of documents to retrieve

        Returns:
            Retriever object
        """
        return self.vector_store.as_retriever(
            search_type="mmr",  # Maximum Marginal Relevance for diversity
            search_kwargs={
                "k": k,
                "fetch_k": k * 3  # Fetch more candidates for better matching
            }
        )

    def delete_collection(self):
        """Delete the current collection"""
        try:
            logger.info(f"Deleting collection: {self.collection_name}")
            self.vector_store.delete_collection()
            logger.info("Collection deleted successfully")
        except Exception as e:
            logger.error(f"Error deleting collection: {e}")
            raise

    def create_sample_banking_docs(self) -> List[Document]:
        """Create sample banking documents for testing"""
        sample_docs = [
            Document(
                page_content="""
                Loan Approval Criteria:
                - Minimum credit score: 650 for personal loans, 600 for secured loans
                - Debt-to-Income ratio should be below 40%
                - Minimum employment history: 2 years for salaried, 3 years for self-employed
                - Down payment: 20% for home loans, 10% for car loans
                - Annual income should be at least 3x the loan amount
                """,
                metadata={"source": "loan_policy", "category": "approval_criteria"}
            ),
            Document(
                page_content="""
                Interest Rates by Loan Type:
                - Personal Loans: 8.5% - 14% APR
                - Home Loans: 6.5% - 9% APR
                - Car Loans: 7% - 12% APR
                - Education Loans: 6% - 10% APR
                - Business Loans: 9% - 15% APR

                Rates vary based on credit score, loan amount, and tenure.
                """,
                metadata={"source": "interest_rates", "category": "pricing"}
            ),
            Document(
                page_content="""
                Common Reasons for Loan Rejection:
                1. Low credit score (below minimum threshold)
                2. High debt-to-income ratio (above 40%)
                3. Insufficient income relative to loan amount
                4. Unstable employment history
                5. Too many recent credit inquiries
                6. Existing defaults or bankruptcies
                7. Incomplete or incorrect documentation
                """,
                metadata={"source": "rejection_reasons", "category": "policies"}
            ),
            Document(
                page_content="""
                Financial Planning Tips:
                - Save at least 20% of your monthly income
                - Build an emergency fund covering 6 months of expenses
                - Pay off high-interest debt first
                - Diversify investments across multiple assets
                - Review and improve your credit score regularly
                - Create a budget and track expenses
                - Consider tax-saving investment options
                """,
                metadata={"source": "financial_tips", "category": "advice"}
            ),
            Document(
                page_content="""
                Required Documents for Loan Application:
                For Salaried Employees:
                - Last 3 months salary slips
                - Last 6 months bank statements
                - PAN card and Aadhaar card
                - Employment certificate
                - Form 16 or ITR for last 2 years

                For Self-Employed:
                - Last 2 years ITR with computation
                - Business registration documents
                - Last 12 months bank statements
                - PAN card and Aadhaar card
                - Financial statements (Balance Sheet, P&L)
                """,
                metadata={"source": "documentation", "category": "requirements"}
            )
        ]
        return sample_docs


if __name__ == "__main__":
    # Example usage
    logger.info("Initializing Vector Store Manager")
    vsm = VectorStoreManager()

    # Create and add sample documents
    logger.info("Creating sample banking documents")
    sample_docs = vsm.create_sample_banking_docs()

    # Split documents
    chunks = vsm.split_documents(sample_docs, chunk_size=500, chunk_overlap=50)

    # Add to vector store
    vsm.add_documents(chunks)

    # Test retrieval
    query = "Why was my loan rejected?"
    results = vsm.similarity_search(query, k=2)

    logger.info(f"\nQuery: {query}")
    logger.info(f"Results: {len(results)}")
    for i, doc in enumerate(results, 1):
        logger.info(f"\nResult {i}:")
        logger.info(doc.page_content)
