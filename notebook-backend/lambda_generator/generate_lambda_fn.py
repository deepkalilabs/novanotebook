import os
import shutil
import boto3
import sh
import re
from botocore.exceptions import ClientError
import base64
from lambda_generator.helpers.ecr_manager import ECRManager
import json
import uuid

class LambdaGenerator:
    # TODO: Dynamically generate IAM roles.
    def __init__(self, code_chunk_dirty: str, user_id: str, notebook_name: str, dependencies: str):
        self.code_chunk_dirty = code_chunk_dirty
        self.user_id = user_id
        self.notebook_name = notebook_name.split('.')[0]
        self.lambda_fn_name = f"{user_id}_{self.notebook_name}_lambda"
        self.api_name = f"{user_id}_{self.notebook_name}_api"
        self.lambda_zip_folder = ''
        self.code_chunk_clean = ''
        self.dependencies = dependencies
        self.lambda_handler = 'lambda_function.lambda_handler'
        
        self.base_folder_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "lambda_dumps",
            self.lambda_fn_name
        )

        self.helper_script_path = os.path.join(
            os.path.dirname(__file__),
            "helpers",
            "scripts"
        )
        
        self.aws_role_identifier = "notebook-lambda-generator"
        self.region = "us-west-1"
        
        self.ecr_manager = ECRManager(self.lambda_fn_name, self.base_folder_path)
        
        self.lambda_client = boto3.client('lambda', region_name='us-west-1')
        
        self.api_gateway_client = boto3.client('apigateway')

        self.lambda_fn_arn = ''
        
        if os.path.exists(self.base_folder_path):
            shutil.rmtree(self.base_folder_path)
        os.makedirs(self.base_folder_path)
    
    @property
    def ARN(self):
        iam = boto3.client('iam')
        response = iam.get_role(RoleName=self.aws_role_identifier)
        arn = response['Role']['Arn']
        return arn
    
    @property
    def account_id(self):
        sts_client = boto3.client('sts')
        return sts_client.get_caller_identity()['Account']

    
    def save_lambda_code(self):
        #TODO: Use LLM gods to generate this code
        trigger_code_path = os.path.join(self.helper_script_path, 'lambda_trigger_code.py')
        trigger_code = open(trigger_code_path, 'r').read()
        self.code_chunk_clean = self.code_chunk_dirty + '\n' + trigger_code
        
        with open(os.path.join(self.base_folder_path, 'lambda_function.py'), 'w') as f:
            f.write(self.code_chunk_clean)
            
        return self.code_chunk_clean
    
    def prepare_container(self):
        with open(os.path.join(self.base_folder_path, 'requirements.txt'), 'w') as f:
            f.write(self.dependencies)
            
        docker_file_sample = open(os.path.join(self.helper_script_path, 'dockerfile_sample'), 'r').read()
        
        with open(os.path.join(self.base_folder_path, 'Dockerfile'), 'w') as f:
            f.write(docker_file_sample)
            
    def build_and_push_container(self):
        # self.image_uri = self.ecr_manager.build_and_push_image()
        self.image_uri = "891377239624.dkr.ecr.us-west-1.amazonaws.com/1_testground_lambda:latest"

    def create_lambda_fn(self):
        """
        Create or update AWS Lambda function using boto3.
        """    
        try:
            self.lambda_client.delete_function(
                FunctionName=self.lambda_fn_name
            )
            print(f"Successfully deleted Lambda function: {self.lambda_fn_name}")
        except ClientError as e:
            print(f"Lambda function not found: {str(e)}")
            
        print(f"Creating new Lambda function: {self.lambda_fn_name}")
        response = self.lambda_client.create_function(
            FunctionName=self.lambda_fn_name,
            PackageType='Image',
            Role=self.ARN,
            Code={
                'ImageUri': self.image_uri
            },
            Timeout=900,  # 15 minutes
            MemorySize=1024
        )
        
        self.lambda_fn_arn = response['FunctionArn']
        return response
        
    def delete_existing_api(self):
        """Delete API if it exists with the same name"""
        try:
            # List all APIs
            apis = self.api_gateway_client.get_rest_apis()
            
            # Find API with matching name
            for api in apis['items']:
                if api['name'] == self.api_name:
                    print(f"Deleting existing API: {api['name']} ({api['id']})")
                    self.api_gateway_client.delete_rest_api(
                        restApiId=api['id']
                    )
                    # Wait a bit after deletion (API Gateway has eventual consistency)
                    # time.sleep(30)
        except Exception as e:
            print(f"Error checking/deleting existing API: {str(e)}")
    
    def create_api_endpoint(self):
        try:
            self.delete_existing_api()
            
            api = self.api_gateway_client.create_rest_api(
                name=self.api_name,
                description=f"API Gateway for {self.lambda_fn_name}",
                endpointConfiguration={
                    'types': ['REGIONAL']
                }
            )
            self.api_id = api['id']
            
            resources = self.api_gateway_client.get_resources(restApiId=self.api_id)
            self.api_root_id = resources['items'][0]['id']
            
            endpoint_resource = self.api_gateway_client.create_resource(
                restApiId=self.api_id,
                parentId=self.api_root_id,
                pathPart='endpoint'
            )
            
            endpoint_resource_id = endpoint_resource['id']
            
            self.api_gateway_client.put_method(
                restApiId=self.api_id,
                resourceId=endpoint_resource_id,
                httpMethod='POST',
                authorizationType='NONE',
                apiKeyRequired=False,
                requestParameters={
                    'method.request.header.Content-Type': True
                }
            )
            
            validator = self.api_gateway_client.create_request_validator(
                restApiId=self.api_id,
                name='ValidateJSON',
                validateRequestBody=True,
                validateRequestParameters=True
            )
            
            self.api_gateway_client.create_model(
                restApiId=self.api_id,
                name='JSONModel',
                contentType='application/json',
                schema=json.dumps({
                    "$schema": "http://json-schema.org/draft-04/schema#",
                    "type": "object"
                })
            )
            
            self.api_gateway_client.put_integration(
                restApiId=self.api_id,
                resourceId=endpoint_resource_id,
                httpMethod='POST',
                integrationHttpMethod='POST',
                type='AWS_PROXY',
                uri=f'arn:aws:apigateway:{self.region}:lambda:path/2015-03-31/functions/{self.lambda_fn_arn}/invocations'
            )
            
            self.lambda_client.add_permission(
                FunctionName=self.lambda_fn_arn,
                StatementId=f'APIGateway-{self.api_name}-{uuid.uuid4()}',
                Action='lambda:InvokeFunction',
                Principal='apigateway.amazonaws.com',
                SourceArn=f'arn:aws:execute-api:{self.region}:{self.account_id}:{self.api_id}/*/*/endpoint'
            )
            
            self.api_gateway_client.create_deployment(
                restApiId=self.api_id,
                stageName='prod'
            )
            
            endpoint = f'https://{self.api_id}.execute-api.{self.region}.amazonaws.com/prod/endpoint'

            return True, endpoint
        
        except Exception as e:
            return False, str(e)

            # {
            #   "csv_file_uri": "s3://llm-data-viz-agentkali/data_uploads/00328009-93c5-4816-93f5-b33ce9aea716.csv"
            # }
        

# if __name__ == "__main__":
#     pass
#     # Your code as a string
#     #TODO: think about how to pass args here.
#     code_str = '''
#     def hello_world(name: str): 
#         return f"Hello {name}"
#     print(hello_world("om"))
    
#     def lambda_handler(event, context):
#         # Place your existing code here
#         result = hello_world()
#         return result
#     '''