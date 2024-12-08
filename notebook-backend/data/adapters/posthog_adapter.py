# posthog_adapter.py
from data.sources.posthog_client import PostHogClient

class PostHogAdapter:
    def __init__(self, api_key: str, base_url: str):
        self.client = PostHogClient(api_key, base_url)

    def get_user_engagement(self, user_id: str, start_date: str, end_date: str) -> list[dict]:
        """
        Retrieve data and aggregate metrics for a given user within a given start and end date range.

        Args:
            user_id (str): The user ID to filter events by.
            start_date (str): The start date of the range to fetch.
            end_date (str): The end date of the range to fetch.

        Returns:
            dict: A dictionary containing the total number of sessions and the average session duration.
        """
          
        events = self.client.get_events(user_id, start_date, end_date)


        # Aggregate total sessions for a given month
        total_sessions = sum(1 for event in events if event['event'] == 'session_started')
        average_session_duration = sum(event['duration'] for event in events if event['event'] == 'session_ended') / total_sessions
    
        return {
            'total_sessions': total_sessions,
            'average_session_duration': average_session_duration
        }

    def get_churn_risk_score(self, user_id: str, start_date: str, end_date: str) -> float:
        """
        Get the churn risk score for a given user within a given start and end date range.

        Args:
            user_id (str): The user ID to filter events by.
            start_date (str): The start date of the range to fetch.
            end_date (str): The end date of the range to fetch.

        Returns:
            float: The churn score for the user.
        """
        engagement_score = self.get_user_engagement(user_id, start_date, end_date)

        if engagement_score['total_sessions'] == 0:
            return 1.0 # If the user has no sessions, they are at risk of churn
        
        elif engagement_score['average_session_duration'] < 5:
            return 0.8 # If the user has a low average session duration, they are medium risk
        else:
            return 0.2 # Low churn risk