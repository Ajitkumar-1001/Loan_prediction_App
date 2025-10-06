"""
RAG Chain Setup for Banking Chatbot
Combines vector retrieval with LLM generation using Groq
"""
import os
import sys
from pathlib import Path
from typing import List, Dict, Any

sys.path.append(str(Path(__file__).resolve().parent.parent))

from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableParallel
from langchain.memory import ConversationBufferMemory
from langchain.schema import Document
from dotenv import load_dotenv
import yaml

from Rag_files.vector_store import VectorStoreManager
from config.config import logger

# Load environment variables
load_dotenv()

# Load configuration
yaml_path = Path(__file__).resolve().parent.parent / "config" / "config.yaml"
with open(yaml_path, 'r') as f:
    config = yaml.safe_load(f)


class BankingRAGChain:
    """RAG Chain for Banking Assistant"""

    def __init__(self, model_name: str = None, temperature: float = None):
        """
        Initialize RAG Chain

        Args:
            model_name: LLM model name (from config if not provided)
            temperature: Model temperature (from config if not provided)
        """
        # Load from config if not provided
        self.model_name = model_name or config.get("llm", {}).get("model", "llama3.2")
        self.temperature = temperature or config.get("llm", {}).get("temperature", 0.8)

        logger.info(f"Initializing RAG Chain with model: {self.model_name}")

        # Initialize Vector Store Manager
        self.vsm = VectorStoreManager()

        # Initialize LLM (using Ollama for local llama3.2)
        # Support both local and Docker environments
        ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.llm = Ollama(
            model=self.model_name,
            temperature=self.temperature,
            base_url=ollama_host
        )

        # Initialize conversation memory
        self.memory = ConversationBufferMemory(
            return_messages=True,
            memory_key="chat_history"
        )

        # Create RAG chain
        self.chain = self._create_rag_chain()

        logger.info("RAG Chain initialized successfully")

    def _create_rag_chain(self):
        """Create the RAG chain with retrieval and generation"""

        # Define the prompt template
        template = """Your name is AK, You are a helpful banking assistant with expertise in loans, financial planning, and banking services.
Use the following context from our banking knowledge base to answer the user's question.
If you don't know the answer based on the context, say so and provide general banking advice if appropriate.

Context from knowledge base:
{context}

Chat History:
{chat_history}

User Question: {question}

Helpful Answer:"""

        prompt = ChatPromptTemplate.from_template(template)

        # Get retriever
        retriever = self.vsm.get_retriever(k=4)

        # Format documents function
        def format_docs(docs: List[Document]) -> str:
            return "\n\n".join(doc.page_content for doc in docs)

        # Create the RAG chain
        rag_chain = (
            RunnableParallel(
                {
                    "context": retriever | format_docs,
                    "question": RunnablePassthrough(),
                    "chat_history": lambda x: self._get_chat_history()
                }
            )
            | prompt
            | self.llm
            | StrOutputParser()
        )

        return rag_chain

    def _get_chat_history(self) -> str:
        """Get formatted chat history"""
        try:
            history = self.memory.load_memory_variables({})
            messages = history.get("chat_history", [])

            if not messages:
                return "No previous conversation."

            formatted = []
            for msg in messages[-6:]:  # Last 3 exchanges
                if hasattr(msg, 'type'):
                    role = "User" if msg.type == "human" else "Assistant"
                    formatted.append(f"{role}: {msg.content}")

            return "\n".join(formatted) if formatted else "No previous conversation."
        except Exception as e:
            logger.error(f"Error getting chat history: {e}")
            return "No previous conversation."

    def ask(self, question: str) -> str:
        """
        Ask a question and get an answer

        Args:
            question: User's question

        Returns:
            Assistant's answer
        """
        try:
            logger.info(f"Processing question: {question}")

            # Get answer from chain
            answer = self.chain.invoke(question)

            # Save to memory
            self.memory.save_context(
                {"input": question},
                {"output": answer}
            )

            logger.info("Answer generated successfully")
            return answer

        except Exception as e:
            logger.error(f"Error processing question: {e}")
            return f"I apologize, but I encountered an error: {str(e)}. Please try again."

    def clear_history(self):
        """Clear conversation history"""
        self.memory.clear()
        logger.info("Conversation history cleared")

    def add_documents_to_knowledge_base(self, documents: List[Document]):
        """
        Add new documents to the knowledge base

        Args:
            documents: List of documents to add
        """
        try:
            logger.info(f"Adding {len(documents)} documents to knowledge base")
            chunks = self.vsm.split_documents(documents)
            self.vsm.add_documents(chunks)
            logger.info("Documents added successfully")
        except Exception as e:
            logger.error(f"Error adding documents: {e}")
            raise


class StreamingBankingRAGChain(BankingRAGChain):
    """RAG Chain with streaming support for real-time responses"""

    async def ask_stream(self, question: str):
        """
        Ask a question and stream the answer

        Args:
            question: User's question

        Yields:
            Chunks of the answer
        """
        try:
            logger.info(f"Processing streaming question: {question}")

            # Get context
            retriever = self.vsm.get_retriever(k=4)
            docs = retriever.get_relevant_documents(question)
            context = "\n\n".join(doc.page_content for doc in docs)
            chat_history = self._get_chat_history()

            # Format prompt
            template = """You are a helpful banking assistant with expertise in loans, financial planning, and banking services.
Use the following context from our banking knowledge base to answer the user's question.
If you don't know the answer based on the context, say so and provide general banking advice if appropriate.

Context from knowledge base:
{context}

Chat History:
{chat_history}

User Question: {question}

Helpful Answer:"""

            formatted_prompt = template.format(
                context=context,
                chat_history=chat_history,
                question=question
            )

            # Stream response
            full_response = ""
            async for chunk in self.llm.astream(formatted_prompt):
                full_response += chunk
                yield chunk

            # Save to memory
            self.memory.save_context(
                {"input": question},
                {"output": full_response}
            )

        except Exception as e:
            logger.error(f"Error in streaming: {e}")
            yield f"Error: {str(e)}"


def initialize_knowledge_base():
    """Initialize the knowledge base with sample documents"""
    logger.info("Initializing knowledge base")
    vsm = VectorStoreManager()

    # Create sample documents
    sample_docs = vsm.create_sample_banking_docs()

    # Split and add documents
    chunks = vsm.split_documents(sample_docs, chunk_size=500, chunk_overlap=50)
    vsm.add_documents(chunks)

    logger.info("Knowledge base initialized with sample documents")


if __name__ == "__main__":
    # Initialize knowledge base
    # initialize_knowledge_base()

    # Test the RAG chain
    rag = BankingRAGChain()

    # Test questions
    questions = [
        "Why was my loan rejected even though my income is high?",
        "What interest rates do you offer for home loans?",
        "How can I improve my financial status?"
    ]

    for q in questions:
        print(f"\nQ: {q}")
        answer = rag.ask(q)
        print(f"A: {answer}")
        print("-" * 80)
