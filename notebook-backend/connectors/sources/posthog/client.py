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
        """Test connection to PostHog by getting all organizations"""
        try:
            response = requests.get(
                f"{self.base_url}/api/organizations/",
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
    
    """
    Section: Organization API
    url: https://posthog.com/docs/api/organizations
    """
    def get_organizations(self) -> Dict[str, Any]:
      """Get all organizations"""
      try:
            response = requests.get(
                f"{self.base_url}/api/organizations/",
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
    

    def get_project(self, project_id: str) -> Dict[str, Any]:
        """Get a project"""
        if not project_id:
            return {
                "status": "error",
                "message": "Project ID is required",
                "data": None
            }
        try:
            response = requests.get(
                f"{self.base_url}/api/projects/{project_id}",
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return {
                "status": "success",
                "message": "Project retrieved successfully",
                "data": response.json()
            }
        except requests.RequestException as e:
            return {
                "status": "error",
                "message": f"Failed to fetch project: {str(e)}",
                "data": None
            }

    """
    Section: Group API
    url: https://posthog.com/docs/api/groups
    """
    def get_groups(self, project_id: str) -> List[Group]:
        """
        Description: List all groups for a project
        url: https://posthog.com/docs/api/groups#get-api-projects-project_id-groups
        TODO: Add query params such as cursor, search, group_type
        """
        if not project_id:
            return {
                "status": "error",
                "message": "Project ID is required",
                "data": None
            }
        
        try:
            response = requests.get(
                f"{self.base_url}/api/projects/{project_id}/groups/",
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return {
                "status": "success",
                "message": "Group retrieved successfully",
                "data": response.json()
            }
        except requests.RequestException as e:
            return {
                "status": "error",
                "message": f"Failed to fetch group: {str(e)}",
                "data": None
            }
        
    def get_group_find(self, project_id) -> List[Group]:
        """
        Description: Find a group by key or group index
        url: https://posthog.com/docs/api/groups#get-api-projects-project_id-groups
        TODO: Add query params such as group_key, group_type_index
        """
        if not project_id:
            return {
                "status": "error",
                "message": "Project ID is required",
                "data": None
            }
        
        try:
            response = requests.get(
                f"{self.base_url}/api/projects/{project_id}/groups/find/",
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return {
                "status": "success",
                "message": "Group retrieved successfully",
                "data": response.json()
            }
        except requests.RequestException as e:
            return {
                "status": "error",
                "message": f"Failed to fetch group: {str(e)}",
                "data": None
            }

    def get_group_types(self, project_id) -> List[Group]:
        """
        Description: Get group types
        url: https://posthog.com/docs/api/groups-types
        """
        if not project_id:
            return {
                "status": "error",
                "message": "Project ID is required",
                "data": None
            }
        
        try:
            response = requests.get(
                f"{self.base_url}/api/projects/{project_id}/group-types/",
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return {
                "status": "success",
                "message": "Group types retrieved successfully",
                "data": response.json()
            }
        except requests.RequestException as e:
            return {
                "status": "error",
                "message": f"Failed to fetch group types: {str(e)}",
                "data": None
            }



    def generate_test_data(self, project_id: str, organization_id: str) -> Dict[str, Any]:
        """
        Description: Generate test data
        url: https://posthog.com/docs/api/projects#get-api-organizations-organization_id-projects-id-is_generating_demo_data
        """
        if not project_id:
            return {
                "status": "error",
                "message": "Project ID is required",
                "data": None
            }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/organizations/{organization_id}/projects/{project_id}/is_generating_demo_data/",
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return {
                "status": "success",
                "message": "Test data generated successfully",
                "data": response.json()
            }
        except requests.RequestException as e:
            return {
                "status": "error",
                "message": f"Failed to generate test data: {str(e)}",
                "data": None
            }
