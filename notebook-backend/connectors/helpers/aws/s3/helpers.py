import boto3
from connectors.models.aws.s3.models import S3
import json
import logging

logger = logging.getLogger(__name__)

class S3Helper:
    def __init__(self, credentials: S3):
        self.credentials = credentials
        self.type = "s3"
        self.bucket_name = "notebook-lambda-generator"
        self.file_path = "connector_credentials/{user_id}.json"
        self.s3_client = None
        
    async def init_s3(self, user_id: str):
        if not user_id:
            raise ValueError("User ID is required")
        self.file_path = self.file_path.format(user_id=user_id)
        self.s3_client = boto3.client('s3', **self.credentials)
        
        if not self.s3_client:
            return False
        return True
    
    
    def save_or_update_credentials(self, user_id: str, credentials: dict):
        """
        Save or update credentials in S3.
        Credentials should contain connector type and its credentials.
        Example: {"posthog": {"credentials": {"api_key": "...", "base_url": "..."}}}
        """
        if not user_id:
            raise ValueError("User ID is required")
        
        if not credentials:
            raise ValueError("Credentials are required")
        
        try:
            # Try to load existing file
            existing_file = self.s3_client.get_object(Bucket=self.bucket_name, Key=self.file_path)
            existing_data = json.loads(existing_file['Body'].read().decode('utf-8'))
        except self.s3_client.exceptions.NoSuchKey:
            # If file doesn't exist, create new structure
            existing_data = {
                "user_id": user_id,
                "connectors": {},
                "notebooks": {}
            }

        # Update the credentials
        updated_data = self.update_json_credentials(existing_data, credentials)
        logger.info("updated_data", updated_data)

        # Save the updated data back to S3
        response = self.s3_client.put_object(
            Bucket=self.bucket_name, 
            Key=self.file_path, 
            Body=json.dumps(updated_data)
        )
        if response['ResponseMetadata']['HTTPStatusCode'] != 200:
            logger.error("Failed to save credentials")
            logger.error("Error response", response)
            raise ValueError("Failed to save credentials")
        return response

    def update_json_credentials(self, existing_data: dict, new_credentials: dict):
        """
        Updates the existing credentials with new connector credentials.
        Maintains the structure of connectors and notebooks.

        Example structure:
        {
            "user_id": "123",
            "connectors": {
                "posthog": {
                    "credentials": {
                        "api_key": "phx_123...",
                        "base_url": "https://app.posthog.com"
                    }
                },
                "snowflake": {
                    "credentials": {
                        "api_key": "sf_123...",
                        "base_url": "https://app.snowflake.com"
                    }
                }
            },
            "notebooks": {
                "notebook_456": {
                    "connectors": ["posthog", "snowflake"]
                },
            "notebook_789": {
                    "connectors": ["posthog"]
                }
            }
        }

        TODO: Migrate to DB

        user ->
          user_id 

        notebook ->
          user_id , notebook_id, .... 
        
        connector ->
          user_id , notebook_id , connector_type, credentials: Json
          1, 1, posthog, {"api_key": "sf_123...", "base_url": "https://app.snowflake.com"}

        connector.notebook_id == notebook.id
        connector.user_id == user.id
        
        """
        if not existing_data:
            raise ValueError("Existing data is required")
        
        if not new_credentials:
            raise ValueError("New credentials are required")
        
        # Update or add new connector credentials
        for connector_type, connector_data in new_credentials.items():
            existing_data["connectors"][connector_type] = connector_data
        
        return existing_data