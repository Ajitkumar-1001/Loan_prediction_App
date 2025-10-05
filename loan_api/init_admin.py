"""
Initialize Default Admin User
Run this script to create the default admin account
"""
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent))

from database import SessionLocal, engine
from models.user import User, Base
from authenticate import hash_password
from sqlalchemy.exc import IntegrityError

# Default admin credentials
DEFAULT_ADMIN_EMAIL = "adminajitkumarslp@gmail.com"
DEFAULT_ADMIN_PASSWORD = "Adminslp@9876543"  # Change this in production!
DEFAULT_ADMIN_FIRSTNAME = "Admin"
DEFAULT_ADMIN_LASTNAME = "User"


def init_admin():
    """Initialize default admin user"""

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if admin already exists
        existing_admin = db.query(User).filter(User.email == DEFAULT_ADMIN_EMAIL).first()

        if existing_admin:
            print(f"✓ Admin user already exists: {DEFAULT_ADMIN_EMAIL}")
            print(f"  Role: {existing_admin.role}")
            return

        # Create admin user
        admin_user = User(
            firstname=DEFAULT_ADMIN_FIRSTNAME,
            middlename=None,
            lastname=DEFAULT_ADMIN_LASTNAME,
            email=DEFAULT_ADMIN_EMAIL,
            password=hash_password(DEFAULT_ADMIN_PASSWORD),
            role="admin"
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("=" * 60)
        print("✓ Default Admin User Created Successfully!")
        print("=" * 60)
        print(f"Email:    {DEFAULT_ADMIN_EMAIL}")
        print(f"Password: {DEFAULT_ADMIN_PASSWORD}")
        print(f"Role:     {admin_user.role}")
        print("=" * 60)
        print(" IMPORTANT: Change the default password after first login!")
        print("=" * 60)

    except IntegrityError as e:
        db.rollback()
        print(f"✗ Error creating admin user: {e}")
    except Exception as e:
        db.rollback()
        print(f"✗ Unexpected error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    init_admin()
