"""
Database Migration Script
Creates or updates database tables for Document model
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from database import engine, Base
from models.user import User
from models.document import Document
from config.config import logger


def migrate():
    """Create all database tables"""
    try:
        logger.info("Starting database migration...")

        # Create all tables
        Base.metadata.create_all(bind=engine)

        logger.info("✅ Database migration completed successfully!")
        logger.info("Tables created/verified:")
        logger.info("  - users")
        logger.info("  - documents")

    except Exception as e:
        logger.error(f"❌ Migration failed: {e}")
        raise


if __name__ == "__main__":
    migrate()
