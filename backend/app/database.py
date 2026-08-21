import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker


DATABASE_URL = os.getenv("postgresql://saath_groww_db_user:KyXKoTmkTc5mVlbXp1MlwLPQjUx4O4EE@dpg-da3u3s2jobas739pdli0-a/saath_groww_db")


if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set."
    )


engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()