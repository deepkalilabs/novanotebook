# Connector folder
This folder contains the connectors for the different 3rd party services that Cosmic Notebook can connect to that are relevant to the agent workflow.

# High level overview:
- **Sources**: Get raw data from a 3rd party service.
- **Models**: Validates model data integrity using the pydantic library.
- **Adapters**: Transform data into a format that can be used internally.
- **Services**: Receives requests and focuses on business logic.
- **Helpers**: Shared functions for the different 3rd party services like S3 or authentication.

## Product Analytics
- PostHog ✅
- Amplitude 
- Mixpanel
- Google Analytics
- Sentry
- Datadog

## Warehouse
- Clickhouse
- Snowflake
- BigQuery
- Databricks
 

##Business Intelligence
- Looker
- Metabase
- Looker Studio
- Mode
- Microsoft Power BI
- Tableau

##Transformations
- DBT
- Airbyte