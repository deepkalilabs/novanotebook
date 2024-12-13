# posthog_client.py
# Purpose: Interacts with the PostHog API to fetch raw data.
import httpx
from typing import List
from connectors.models.posthog.models import Group, User, Event, Credentials

class PostHogClient:
    def __init__(self, credentials: Credentials):
        self.api_key = credentials.api_key
        self.base_url = credentials.base_url
        self.headers = {"Authorization": f"Beaerer {self.api_key}"}
        self.type = "posthog"

    async def test_connection(self):
        """
        Test the connection to the PostHog API.
        """
        url = f"{self.base_url}/api/projects/"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            if response.status_code == 200:
                return {"status": "success", "message": "Connection to PostHog successful", "data": response.json()}
            else:
                return {"status": "error", "message": "Failed to connect to PostHog", "data": response.json()}
        
    


    async def raw_get_all_groups(self) -> List[Group]:
        """
        Get all groups from PostHog.

        Returns:
            List[Group]: A list of groups.
        """
        url = f"{self.base_url}/api/groups/"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            groups = response.json()
            return [Group(**group) for group in groups]
        

    # Get users
    async def raw_get_all_users(self) -> List[User]:
        url = f"{self.base_url}/api/projects/users/"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            users = response.json()
            return [User(**user) for user in users]
        

    async def raw_get_all_events(self) -> List[Event]:
        url = f"{self.base_url}/api/events/"
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=self.headers)
            response.raise_for_status()
            events = response.json()
            return [Event(**event) for event in events]

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
