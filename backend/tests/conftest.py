"""Shared pytest fixtures — uses an isolated SQLite DB and temp vector store."""
import os
import tempfile

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("VECTOR_DB_PATH", tempfile.mkdtemp(prefix="exlsmartassist-test-chroma-"))

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402
from app.scripts.build_vector_index import build_index  # noqa: E402
from app.scripts.seed_db import seed_database  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _prepare_data():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestSession = sessionmaker(bind=engine)

    def override_get_db():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    from app import database

    database.SessionLocal = TestSession
    database.engine = engine

    seed_database()
    build_index()
    yield


@pytest.fixture
def client():
    return TestClient(app)
