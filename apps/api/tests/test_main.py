from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    response = client.get('/health')
    assert response.status_code == 200
    assert response.json()['status'] == 'ok'


def test_command_center_payload():
    response = client.get('/api/dashboard/command-center')
    assert response.status_code == 200
    payload = response.json()
    assert 'context' in payload
    assert 'command_center' in payload
    assert payload['salesman_leaderboard']
