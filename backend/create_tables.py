
from backend.database.database import engine, SessionLocal
from backend.database.models import Base, User
from backend.security.utils import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Creating tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created")

    db = SessionLocal()
    admin_user = db.query(User).filter(User.email == "admin@example.com").first()

    if not admin_user:
        logger.info("Creating admin user...")
        admin_password = "Admin@1234"
        hashed_password = get_password_hash(admin_password)

        admin = User(
            email="admin@example.com",
            username="admin",
            full_name="Administrator",
            hashed_password=hashed_password,
            is_active=True,
            is_admin=True
        )

        db.add(admin)
        db.commit()
        logger.info(f"Admin user created with email: admin@example.com and password: {admin_password}")
    else:
        if not admin_user.is_admin:
            admin_user.is_admin = True
            db.commit()
            logger.info("Admin role added to existing admin user")
        else:
            logger.info("Admin user already exists")

    db.close()

if __name__ == "__main__":
    init_db()
