import requests
import time

BASE_URL = "http://localhost:8000/risk"

def test_risk_system():
    print("Testing Risk System...")

    # 1. Check existing alerts
    try:
        response = requests.get(f"{BASE_URL}/alerts")
        alerts = response.json()
        print(f"Initial Alerts Count: {len(alerts)}")
        if len(alerts) > 0:
            print(f"Sample Alert: {alerts[0]}")
    except Exception as e:
        print(f"Error fetching alerts: {e}")

    # 2. Simulate a crisis manually
    print("\nSimulating Crisis...")
    payload = {
        "event_text": "Port strike in Rotterdam affecting chemical shipments"
    }
    try:
        # Note: router.py uses query param for GET/POST simulate, let's try passing as query param for simplicity or check router def
        # Router: def simulate_crisis(event_text: str = Query(...))
        response = requests.post(f"{BASE_URL}/simulate", params=payload)
        if response.status_code == 200:
            print("Simulation Success:", response.json())
        else:
            print("Simulation Failed:", response.text)
    except Exception as e:
        print(f"Error simulating crisis: {e}")

    # 3. Trigger News Ingestion
    print("\nTriggering News Ingestion...")
    try:
        response = requests.post(f"{BASE_URL}/ingest-news")
        if response.status_code == 200:
            print("Ingestion Result:", response.json())
        else:
            print("Ingestion Failed:", response.text)
    except Exception as e:
        print(f"Error triggering ingestion: {e}")

    # 4. Check alerts again
    time.sleep(2)
    try:
        response = requests.get(f"{BASE_URL}/alerts")
        alerts = response.json()
        print(f"\nFinal Alerts Count: {len(alerts)}")
    except Exception as e:
        print(f"Error fetching final alerts: {e}")

if __name__ == "__main__":
    test_risk_system()
