# posthog_client.py
# Purpose: Interacts with the PostHog API to fetch raw data.
import logging
from typing import List, Dict, Any
from connectors.models.posthog.models import Group, User, Event
import requests


logger = logging.getLogger(__name__)
class PostHogClient:
    def __init__(self, credentials: dict):
        self.api_key = credentials['api_key']
        self.base_url = credentials['base_url']
        self.headers = {"Authorization": f"Bearer {self.api_key}"}

    def test_connection(self) -> Dict[str, Any]:
        """Test connection to PostHog"""
        try:
            response = requests.get(
                f"{self.base_url}/api/projects/",
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return {
                "status": "success", 
                "message": "Connected to PostHog",
                "data": response.json()
            }
        except requests.RequestException as e:
            return {
                "status": "error",
                "message": f"PostHog connection failed: {str(e)}",
                "data": None
            }

    def get_all_groups(self) -> List[Group]:
        """Get all groups"""
        response = self.app.get(
            f"{self.base_url}/api/groups/",
            headers=self.headers
        )
        return [Group(**group) for group in response.json()]

    def get_all_users(self) -> List[User]:
        """Get all users"""
        response = self.app.get(
            f"{self.base_url}/api/projects/users/",
            headers=self.headers
        )
        return [User(**user) for user in response.json()]

    def get_all_events(self) -> List[Event]:
        """Get all events"""
        response = self.app.get(
            f"{self.base_url}/api/events/",
            headers=self.headers
        )
        return [Event(**event) for event in response.json()]

    # Get sessions
    """ 
    async def raw_get_all_sessions(self) -> List[Session]:
        url = f"{self.base_url}/api/sessions/"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            sessions = response.json()
            return [Session(**session) for session in sessions]
    """

    def get_events(self) -> Dict[str, Any]:
        """Get PostHog events"""
        try:
            response = requests.get(
                f"{self.base_url}/api/events/",
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return {
                "status": "success",
                "message": "Events retrieved successfully",
                "data": response.json()
            }
        except requests.RequestException as e:
            return {
                "status": "error",
                "message": f"Failed to fetch events: {str(e)}",
                "data": None
            }
