import boto3
import base64
import subprocess
from botocore.exceptions import ClientError
import sh
import os

class ECRManager:
    def __init__(self, repository_name, file_base_path, region='us-west-1'):
        self.region = region
        self.ecr_client = boto3.client('ecr', region_name=region)
        self.account_id = boto3.client('sts').get_caller_identity()['Account']
        self.registry_url = f"{self.account_id}.dkr.ecr.{self.region}.amazonaws.com"
        self.repository_name = repository_name
        self.file_base_path = file_base_path

    def get_auth_credentials(self):
        """Get ECR authentication credentials"""
        try:
            token = self.ecr_client.get_authorization_token()
            auth_data = token['authorizationData'][0]
            token_bytes = base64.b64decode(auth_data['authorizationToken'])
            username, password = token_bytes.decode('utf-8').split(':')
            return username, password
        except ClientError as e:
            print(f"Failed to get auth token: {str(e)}")
            raise

    def docker_login(self):
        """Perform Docker login to ECR"""
        try:
            username, password = self.get_auth_credentials()
            sh.docker.login(
                '--username', username,
                '--password', password,
                self.registry_url
            )
            return True
        except subprocess.CalledProcessError as e:
            print(f"Docker login failed: {e.stderr.decode()}")
            raise
            
    def create_repository(self):
        """Create new ECR repository"""
        try:
            response = self.ecr_client.create_repository(
                repositoryName=self.repository_name,
                imageScanningConfiguration={'scanOnPush': True},
                imageTagMutability='MUTABLE'
            )
            repository_uri = response['repository']['repositoryUri']
            print(f"Created repository: {repository_uri}")
            return repository_uri
        except ClientError as e:
            if e.response['Error']['Code'] == 'RepositoryAlreadyExistsException':
                return self.get_repository_uri(self.repository_name)
            raise

    def get_repository_uri(self, repository_name):
        """Get repository URI"""
        try:
            response = self.ecr_client.describe_repositories(
                repositoryNames=[self.repository_name]
            )
            return response['repositories'][0]['repositoryUri']
        except ClientError as e:
            print(f"Failed to get repository URI: {str(e)}")
            raise

    def delete_repository(self, force=False):
        """Delete ECR repository"""
        try:
            self.ecr_client.delete_repository(
                repositoryName=self.repository_name,
                force=force  # Set force=True to delete repository with images
            )
            print(f"Deleted repository: {self.repository_name}")
            return True
        except ClientError as e:
            print(f"Failed to delete repository: {str(e)}")
            raise

    def list_repositories(self):
        """List all ECR repositories"""
        try:
            response = self.ecr_client.describe_repositories()
            return response['repositories']
        except ClientError as e:
            print(f"Failed to list repositories: {str(e)}")
            raise

    def list_images(self):
        """List all images in repository"""
        try:
            response = self.ecr_client.describe_images(
                repositoryName=self.repository_name
            )
            return response['imageDetails']
        except ClientError as e:
            print(f"Failed to list images: {str(e)}")
            raise

    def delete_image(self, image_id):
        """Delete specific image from repository"""
        try:
            self.ecr_client.batch_delete_image(
                repositoryName=self.repository_name,
                imageIds=[image_id]
            )
            print(f"Deleted image {image_id} from {self.repository_name}")
            return True
        except ClientError as e:
            print(f"Failed to delete image: {str(e)}")
            raise

    def get_image_uri(self, tag='latest'):
        """Get full image URI with tag"""
        repository_uri = self.get_repository_uri(self.repository_name)
        return f"{repository_uri}:{tag}"

    def build_and_push_image(self, tag='latest', dockerfile_path='.'):
        """Build and push image to ECR"""
        try:
            # Ensure logged in
            self.docker_login()
            
            repository_uri = self.create_repository()
            
            # Get image URI
            image_uri = self.get_image_uri(tag)

            os.chdir(self.file_base_path)
            
            # Build image
            sh.docker.build(
                '-t', image_uri,
                dockerfile_path)
            
            # Push image
            sh.docker.push(image_uri)
            
            return image_uri
            
        except Exception as e:
            print(f"Failed to push image: {str(e)}")
            print(f"Stderr: {e.stderr}")
            raise

    def cleanup_untagged_images(self):
        """Remove untagged images from repository"""
        try:
            images = self.ecr_client.describe_images(
                repositoryName=self.repository_name,
                filter={'tagStatus': 'UNTAGGED'}
            )
            
            if images['imageDetails']:
                self.ecr_client.batch_delete_image(
                    repositoryName=self.repository_name,
                    imageIds=[{'imageDigest': img['imageDigest']} 
                             for img in images['imageDetails']]
                )
                print(f"Cleaned up untagged images in {self.repository_name}")
            
            return True
        except ClientError as e:
            print(f"Failed to cleanup images: {str(e)}")
            raise

# Usage example:
if __name__ == "__main__":
    file_base_path = "/Users/shikharsakhuja/Desktop/projects/agentic_vibes/lambda_dumps/1_testground_lambda"
    repo_name = "my-lambda-function"
    ecr = ECRManager(repo_name, file_base_path)
    
    # Create repository
    repo_uri = ecr.create_repository()
    
    # Build and push image
    image_uri = ecr.build_and_push_image(repo_name)
    
    # List images
    # images = ecr.list_images()
    # for image in images:
    #     print(f"Image: {image.get('imageTags', ['untagged'])} - {image['imageDigest']}")
    
    # # Cleanup untagged images
    # ecr.cleanup_untagged_images()
    
    # Optional: Delete repository
    # ecr.delete_repository(repo_name, force=True)