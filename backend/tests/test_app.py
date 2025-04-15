import pytest

from src.app import app


# pylint: disable=redefined-outer-name
@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health_check_without_token(client):
    """Test the health check endpoint"""
    response = client.get("/api/health")
    assert response.status_code == 403
