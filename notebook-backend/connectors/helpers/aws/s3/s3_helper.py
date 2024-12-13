import boto3
from connectors.models.aws.s3.models import S3
import json
class S3Helper:
    def __init__(self, credentials: S3):
        self.credentials = credentials
        self.type = "s3"
        self.bucket_name = "notebook-lambda-generator"
        self.file_path = "connector_credentials/{user_id}.json"
        self.s3_client = None
        
    async def init_s3(self, user_id: str):
        if not self.check_file_exists(user_id):
            raise ValueError("File does not exist")
        
        self.file_path = self.file_path.format(user_id=user_id)
        self.s3_client = boto3.client('s3', **self.credentials.get_credentials())
        return self.s3_client
        
    async def check_file_exists(self, user_id: str, s3_client: boto3.client):
        if not user_id:
            raise ValueError("User ID is required")
        
        if not self.file_path:
            raise ValueError("File path is required")
        
        if not self.bucket_name:
            raise ValueError("Bucket name is required")
        
        if not s3_client:
            raise ValueError("S3 client is required")
        
        self.file_path = self.file_path.format(user_id=user_id)
        response = self.s3_client.get_object(
            Bucket=self.bucket_name, 
            Key=self.file_path
        )
        if response['ResponseMetadata']['HTTPStatusCode'] == 200:
            return True
        return False
    
    def save_or_update_credentials(self, user_id: str, credentials: dict):
        """
        Save or update credentials in S3.
        This assumes that the contents of the file have already been updated outside of this function.
        """
        if not user_id:
            raise ValueError("User ID is required")
        
        if not credentials:
            raise ValueError("Credentials are required")
        
        if not self.check_file_exists(user_id, self.s3_client):
            raise ValueError("File does not exist")
        
        response = self.s3_client.put_object(Bucket=self.bucket_name, Key=self.file_path, Body=json.dumps(credentials))
        if response['ResponseMetadata']['HTTPStatusCode'] != 200:
            raise ValueError("Failed to save credentials")
        return response
    