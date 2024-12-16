# posthog_service.py
# Purpose: Provides a service layer for the PostHog data. This is package that will be imported by the notebook app.
from connectors.adapters.posthog.posthog_adapter import PostHogAdapter
from connectors.sources.posthog.posthog_client import PostHogClient
class PostHogService:
    def __init__(self, credentials: dict):
        self.client = PostHogClient(credentials)
        self.adapter = PostHogAdapter(self.client)
    
    def is_connected(self):
        return self.client.test_connection()

    def get_transformed_data(self):
        return self.adapter.transform_data()
    
    def print_hello(self):
        print("hello")
