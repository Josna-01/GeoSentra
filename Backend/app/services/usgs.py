import asyncio
import json
import logging
import sqlite3
from contextlib import closing
from datetime import datetime, timezone
from pathlib import Path

import requests


FEED_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_day.geojson"
POLL_SECONDS = 60
STALE_SECONDS = 180
STORE_PATH = Path(__file__).resolve().parents[2] / "usgs_events.sqlite3"
logger = logging.getLogger(__name__)


def _timestamp(milliseconds):
    return datetime.fromtimestamp(milliseconds / 1000, timezone.utc).isoformat()


class UsgsFeed:
    def __init__(self, path=STORE_PATH):
        self.path = path
        self.last_success = None
        self.generated_at = None
        self.failed = False

    def _connect(self):
        connection = sqlite3.connect(self.path)
        connection.execute("""
            CREATE TABLE IF NOT EXISTS earthquakes (
                id TEXT PRIMARY KEY,
                updated INTEGER NOT NULL,
                occurred_at TEXT NOT NULL,
                alert TEXT NOT NULL
            )
        """)
        return connection

    def refresh(self):
        response = requests.get(FEED_URL, timeout=15)
        response.raise_for_status()
        feed = response.json()
        if feed["type"] != "FeatureCollection" or not isinstance(feed["features"], list):
            raise ValueError("Invalid USGS feature collection")
        generated = _timestamp(feed["metadata"]["generated"])
        ingested = datetime.now(timezone.utc).isoformat()
        rows = []
        for feature in feed["features"]:
            properties = feature["properties"]
            if properties["type"] != "earthquake" or properties["mag"] is None:
                continue
            longitude, latitude, _depth = feature["geometry"]["coordinates"]
            source_id = feature["id"]
            occurred = _timestamp(properties["time"])
            alert = {
                "id": f"usgs:{source_id}",
                "source": "USGS",
                "source_id": source_id,
                "source_url": f"https://earthquake.usgs.gov/earthquakes/eventpage/{source_id}",
                "source_updated_at": _timestamp(properties["updated"]),
                "ingested_at": ingested,
                "timestamp": occurred,
                "event_type": "Disaster",
                "summary": properties["title"],
                "magnitude": properties["mag"],
                "location": {"city": properties["place"] or "Unknown", "country": "", "coordinates": [latitude, longitude]},
            }
            rows.append((source_id, properties["updated"], occurred, json.dumps(alert)))

        with closing(self._connect()) as connection, connection:
            connection.executemany("""
                INSERT INTO earthquakes (id, updated, occurred_at, alert)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    updated = excluded.updated,
                    occurred_at = excluded.occurred_at,
                    alert = excluded.alert
                WHERE excluded.updated > earthquakes.updated
            """, rows)
        self.generated_at = generated
        self.last_success = ingested
        self.failed = False

    def latest_alerts(self, limit=20):
        if not self.path.exists():
            return []
        with closing(self._connect()) as connection:
            rows = connection.execute(
                "SELECT alert FROM earthquakes ORDER BY occurred_at DESC, id LIMIT ?", (limit,)
            ).fetchall()
        return [json.loads(alert) for (alert,) in rows]

    def status(self):
        if self.last_success is None:
            state = "unavailable" if self.failed else "starting"
        else:
            now = datetime.now(timezone.utc)
            freshness = min(self.last_success, self.generated_at)
            expired = (now - datetime.fromisoformat(freshness)).total_seconds() > STALE_SECONDS
            state = "stale" if self.failed or expired else "current"
        return {"status": state, "last_success_at": self.last_success, "generated_at": self.generated_at}

    async def poll(self):
        while True:
            try:
                await asyncio.to_thread(self.refresh)
            except (requests.RequestException, ValueError, KeyError, TypeError, sqlite3.Error) as exc:
                self.failed = True
                logger.warning("USGS feed refresh failed: %s", exc)
            await asyncio.sleep(POLL_SECONDS)


usgs_feed = UsgsFeed()
