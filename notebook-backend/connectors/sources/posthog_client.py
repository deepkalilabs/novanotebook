# posthog_client.py
# Purpose: Interacts with the PostHog API to fetch data.
import httpx
from typing import List
from connectors.models.posthog_models import Group, User, Event

class PostHogClient:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {"Authorization": f"Beaerer {self.api_key}"}


    async def get_all_groups(self) -> List[Group]:
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
        

    async def get_users_by_group(self, group_id: str) -> List[User]:
        """
        Get all users in a group from PostHog.

        Args:
            group_id (str): The ID of the group to fetch users for.

        Returns:
            List[User]: A list of users in the group.
        """
        url = f"{self.base_url}/api/projects/users/"
        params = {
            "group_id[group_id]": group_id
        }
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=self.headers)
            response.raise_for_status()
            users = response.json()
            return [User(**user) for user in users]
        

    async def get_events_by_user(self, user_id: str) -> List[Event]:
        """
        Get all events for a user from PostHog.

        Args:
            user_id (str): The ID of the user to fetch events for.

        Returns:
            List[Event]: A list of events for the user.
        """
        url = f"{self.base_url}/api/projects/events/"
        params = {
            "properties[user_id]": user_id
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=self.headers)
            response.raise_for_status()
            events = response.json()
            return [Event(**event) for event in events]
        

    async def get_groups_with_users_and_events(self) -> List[Group]:
        """
        Get all groups, for each group get all users, and for each user get all events.

        Returns:
            List[Group]: A list of groups, each containing a list of users, and each user containing a list of events.
        """
        groups = await self.get_all_groups()
        for group in groups:
            group.users = await self.get_users_by_group(group.id)
            for user in group.users:
                user.events = await self.get_events_by_user(user.id)
        return groups
