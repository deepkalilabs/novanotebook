# posthog_adapter.py
# Purpose: Adapts the PostHog client raw data to a format that can be used by the services.

from connectors.sources.posthog.client import PostHogClient

class PostHogAdapter:
    def __init__(self, client: PostHogClient):
        self.client = client

    def transform_data(self):
        """
        Transforms the raw data from the PostHog client into a hierarchical structure.
        Each group has a list of users and each user has a list of events.
          - Groups are the top level of the hierarchy.
          - Users are the second level of the hierarchy.
          - Events are the third level of the hierarchy.

        Visualization:
          - Group
            - User
              - Event

        Returns:
            dict: A dictionary with the hierarchical structure of the data.  
        """
        # Fetch all data
        groups = self.client.get_all_groups()
        users = self.client.get_all_users()
        events = self.client.get_all_events()

        # Create hierarchical structure
        hierarchical_data = {}
        
        # Initialize groups
        for group in groups:
            group_key = group.get('group_key')
            hierarchical_data[group_key] = {
                'group_properties': group.get('group_properties', {}),
                'users': {}
            }
        
        # Add users to their groups
        for user in users:
            user_id = user.get('distinct_id')
            group_key = user.get('group_key')  # Assuming users have group_key property
            
            if group_key in hierarchical_data:
                hierarchical_data[group_key]['users'][user_id] = {
                    'user_properties': user.get('properties', {}),
                    'events': []
                }
        
        # Add events to their users
        for event in events:
            user_id = event.get('distinct_id')
            group_key = event.get('group_key')  # Assuming events have group_key property
            
            if (group_key in hierarchical_data and 
                user_id in hierarchical_data[group_key]['users']):
                hierarchical_data[group_key]['users'][user_id]['events'].append({
                    'event': event.get('event'),
                    'timestamp': event.get('timestamp'),
                    'properties': event.get('properties', {})
                })
        
        return hierarchical_data
    

    def get_users_by_group(self, group_key: str):
        pass

    def get_events_by_user(self, user_key: str):
        pass

    def get_events_by_group(self, group_key: str):
        pass


   