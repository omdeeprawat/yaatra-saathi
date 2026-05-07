import unittest
from types import SimpleNamespace

from fastapi.testclient import TestClient

import routers.chat as chat_router
from core.dependencies import get_current_user
from main import app


class ApiContractTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

        async def _fake_current_user():
            return SimpleNamespace(id=1)

        async def _noop_rate_limit(_user_id: int):
            return None

        async def _fake_stream_response(**_kwargs):
            yield "hello"
            yield "world"

        self._orig_stream = chat_router.stream_rag_response_multiagent
        self._orig_rate_limit = chat_router.chat_rate_limiter.check_rate_limit

        app.dependency_overrides[get_current_user] = _fake_current_user
        chat_router.chat_rate_limiter.check_rate_limit = _noop_rate_limit
        chat_router.stream_rag_response_multiagent = _fake_stream_response

    def tearDown(self):
        app.dependency_overrides.clear()
        chat_router.stream_rag_response_multiagent = self._orig_stream
        chat_router.chat_rate_limiter.check_rate_limit = self._orig_rate_limit

    def test_chat_routes_exist(self):
        route_paths = {route.path for route in app.routes}
        self.assertIn("/chat/status", route_paths)
        self.assertIn("/chat/stream", route_paths)
        self.assertIn("/chat/ingest-document", route_paths)

    def test_chat_stream_sse_contract(self):
        response = self.client.post(
            "/chat/stream",
            json={"message": "Hi", "history": []},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("content-type"), "text/event-stream; charset=utf-8")

        body = response.text
        self.assertIn('data: {"text": "hello"}', body)
        self.assertIn('data: {"text": "world"}', body)
        self.assertIn("data: [DONE]", body)

    def test_health_endpoints(self):
        health = self.client.get("/health")
        self.assertEqual(health.status_code, 200)
        self.assertEqual(health.json().get("status"), "ok")

        ready = self.client.get("/health/ready")
        self.assertIn(ready.status_code, (200, 503))
        self.assertIn("status", ready.json())
        self.assertIn("checks", ready.json())


if __name__ == "__main__":
    unittest.main()
