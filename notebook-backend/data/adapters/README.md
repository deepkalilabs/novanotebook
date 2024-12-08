# Data Adapters
Purpose: Transforms raw data from data sources into formats required by downstream components (like models or APIs).

Example 1:
`posthog_adapter.py` would convert raw PostHog event logs into features or aggregates (e.g., user engagement scores, session durations) that can be analyzed for churn prediction.

Example 2:
`openai_adapter.py` would convert a pandas DataFrame into a list of messages formatted for OpenAI's API.

Example 3:
`snowflake_adapter.py` would convert a pandas DataFrame into a list of tuples formatted for Snowflake's COPY INTO command.

# Data Adapter Types

## Product Analytics
- PostHog
- Mixpanel
- Amplitude

