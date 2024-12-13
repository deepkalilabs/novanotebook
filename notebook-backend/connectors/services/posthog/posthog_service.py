# posthog_service.py
# Purpose: Provides a service layer for the PostHog data. This is package that will be imported by the notebook app.
from connectors.adapters.posthog.posthog_adapter import PostHogAdapter
from connectors.sources.posthog.posthog_client import PostHogClient
class PostHogService:
    def __init__(self, api_key: str, base_url: str):
        self.client = PostHogClient(api_key, base_url)
        self.adapter = PostHogAdapter(self.client)

    def fetch_client(self):
        return self.client

    def fetch_adapter(self):
        return self.adapter
    
    def is_connected(self):
        return self.client.test_connection()

    def get_transformed_data(self):
        return self.adapter.transform_data()
    
    def churn_rate(self, group_key: str, start_date: str, end_date: str):
        """
        Calculates the churn rate for a given group and date range.
        """
        pass

    def get_user_engagement(self, user_id: str, start_date: str, end_date: str):
        """
        Calculates the user engagement for a given user and date range.
        """
        pass
