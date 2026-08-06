"""Smoke tests covering every backend endpoint end-to-end against seeded data."""


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200


def test_login_success(client):
    resp = client.post("/api/auth/login", json={"username": "agent.priya", "password": "demo123"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["user"]["role"] == "Agent"


def test_login_failure(client):
    resp = client.post("/api/auth/login", json={"username": "agent.priya", "password": "wrong"})
    assert resp.status_code == 401


def test_chat(client):
    resp = client.post(
        "/api/chat",
        json={
            "industry": "Insurance",
            "customer_message": "My auto claim was denied because of missing documents.",
            "history": [],
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["suggested_reply"]
    assert isinstance(body["sources"], list)


def test_summarize(client):
    resp = client.post(
        "/api/summarize",
        json={
            "industry": "Banking",
            "transcript": [
                {"sender": "customer", "text": "There's a charge on my account I didn't make."},
                {"sender": "agent", "text": "I'm sorry to hear that, let's dispute it right away."},
            ],
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["customer_issue"]
    assert body["crm_note"]


def test_next_action(client):
    resp = client.post(
        "/api/next-action",
        json={
            "industry": "Healthcare",
            "transcript": [
                {"sender": "customer", "text": "My prior authorization was denied and I need this medication."}
            ],
        },
    )
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["actions"]) > 0


def test_knowledge_search(client):
    resp = client.post("/api/knowledge-search", json={"query": "return policy exception", "top_k": 5})
    assert resp.status_code == 200
    body = resp.json()
    assert body["total"] >= 0


def test_crm_note(client):
    resp = client.post(
        "/api/crm-note",
        json={
            "industry": "Retail",
            "customer_name": "Test Customer",
            "transcript": [
                {"sender": "customer", "text": "I want to return this damaged item."},
                {"sender": "agent", "text": "I'll process that return for you now."},
            ],
        },
    )
    assert resp.status_code == 200
    assert resp.json()["note_text"]


def test_compliance_check_flags_guarantee(client):
    resp = client.post(
        "/api/compliance-check",
        json={"industry": "Insurance", "draft_response": "I guarantee your claim will be approved."},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["passed"] is False
    assert body["risk_level"] in ("Medium", "High")


def test_compliance_check_passes_clean_response(client):
    resp = client.post(
        "/api/compliance-check",
        json={"industry": "Insurance", "draft_response": "Let me review your policy and get back to you shortly."},
    )
    assert resp.status_code == 200
    assert resp.json()["passed"] is True


def test_dashboard(client):
    resp = client.get("/api/dashboard")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["kpis"]) == 4


def test_analytics(client):
    resp = client.get("/api/analytics")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["aht_trend"]) == 7


def test_conversations_list_and_copilot(client):
    resp = client.get("/api/conversations")
    assert resp.status_code == 200
    conversations = resp.json()
    assert len(conversations) > 0

    conv_id = conversations[0]["id"]
    copilot_resp = client.get(f"/api/conversations/{conv_id}/copilot")
    assert copilot_resp.status_code == 200
    bundle = copilot_resp.json()
    assert bundle["suggested_reply"]
    assert isinstance(bundle["next_best_actions"], list)


def test_feedback(client):
    resp = client.post(
        "/api/feedback", json={"suggestion_type": "suggested_reply", "rating": "up", "comment": "Great!"}
    )
    assert resp.status_code == 200
