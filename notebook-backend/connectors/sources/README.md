# Data Sources
Purpose: Handles direct data access and storage. Such as querying data from a database, or saving data to a database.
Doesn't contain any logic for data transformation.
Example 1:
`posthog_client.py` would include functions to query data, and update data in PostHog.

Example 3:
`snowflake_client.py` would include functions to query data, and update data in Snowflake.

# Storage
- S3 

## Product Analytics
- PostHog
- Mixpanel
- Amplitude
- Google Analytics

## LLM
- OpenAI
- Anthropic
- Gemini

## Databases
- PostgreSQL
- MySQL
- BigQuery
- Snowflake