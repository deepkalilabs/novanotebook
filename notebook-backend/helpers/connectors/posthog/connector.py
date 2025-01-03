from ..base import BaseConnector
from helpers.types import ConnectorResponse
from helpers.supabase.connector_credentials import create_connector_credentials
from connectors.services.posthog.service import PostHogService
import logging

logger = logging.getLogger(__name__)

class PosthogConnector(BaseConnector):
    def __init__(self, credentials: dict):
        logger.info(f"Initializing PosthogConnector with credentials: {credentials}")
        # Extract the nested credentials
        self.user_id = credentials.get('user_id')
        self.notebook_id = credentials.get('notebook_id')
        self.connector_type = 'posthog'
        self.credentials = credentials.get('credentials')
         
    async def setup(self) -> ConnectorResponse:
        try:
            logger.info(f"Setting up PosthogConnector with credentials: {self.credentials}")
            
            if not isinstance(self.credentials, dict):
                return {
                    'success': False,
                    'message': f"Invalid credentials format. Expected dict, got {type(self.credentials)}",
                    'code': None,
                    'docstring': None
                }
            
            if 'api_key' not in self.credentials:
                logger.error(f"Missing api_key in credentials. Available keys: {self.credentials.keys()}")
                return {
                    'success': False,
                    'message': "Missing required credential: 'api_key'. Available keys: " + 
                              ", ".join(self.credentials.keys()),
                    'code': None,
                    'docstring': None
                }
            
            # Submit connector credentials to database
            response = await create_connector_credentials(
                user_id=self.user_id,
                notebook_id=self.notebook_id,
                connector_type=self.connector_type,
                credentials=self.credentials
            )
            logger.info(f"Connector credentials response: {response}")

            if response['statusCode'] != 200:
                return {
                    'success': False,
                    'message': response['message'],
                    'code': None,
                    'docstring': None
                }

            return {
                'success': True,
                'message': 'Posthog submitted to database',
                'code': self.get_connector_code(),
                'docstring': self.get_connector_docstring()
            }

        except Exception as e:
            logger.error(f"Error in setup: {e}")
            return {
                'success': False,
                'message': f"Failed to setup PostHog connector: {str(e)}",
                'code': None,
                'docstring': None
            }

    def get_connector_code(self):
        code = f"""
from connectors.services.posthog.service import PostHogService
from IPython import get_ipython

# Initialize PostHog service
posthog_service = PostHogService({self.credentials})

# Get IPython instance and inject into namespace
ipython = get_ipython()
if ipython:
    globals()['posthog_service'] = posthog_service
    globals()['posthog_client'] = posthog_service.client
    globals()['posthog_adapter'] = posthog_service.adapter

print("PostHog connector initialized successfully! ✅")
print("Available objects: posthog_service, posthog_client, posthog_adapter")
"""
        return code.lstrip()

    def get_connector_docstring(self):
        """
        Return the connector docstring that will be displayed in the notebook cell.
        """
        doc = """
        # Posthog notebook connector

        1. To fetch raw data from PostHog, use the library `posthog_client`. Link: https://github.com/deepkalilabs/cosmicnotebook/tree/main/docs/posthog/client`
        2. To fetch transformed data using our own format, use `posthog_adapter`. Link: https://github.com/deepkalilabs/cosmicnotebook/tree/main/docs/posthog/adapter`
        3. To try own our own AI recipes, use `posthog_service`. Link: https://github.com/deepkalilabs/cosmicnotebook/tree/main/docs/posthog/service`

        # Try out the following examples:
    
        ## Get all organizations:
        Description: Fetch all organizations from PostHog.
        ```python
        posthog_client.get_organizations()
        ```
        """
        return doc
