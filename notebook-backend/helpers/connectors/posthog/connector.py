from ..base import BaseConnector
from helpers.types import ConnectorResponse
from helpers.supabase.connector_credentials import create_connector_credentials
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
                    'cell': None
                }
            
            if 'api_key' not in self.credentials:
                logger.error(f"Missing api_key in credentials. Available keys: {self.credentials.keys()}")
                return {
                    'success': False,
                    'message': "Missing required credential: 'api_key'. Available keys: " + 
                              ", ".join(self.credentials.keys()),
                    'cell': None
                }
            
            # Submit connector credentials to database
            response = await create_connector_credentials(
                user_id=self.user_id,
                notebook_id=self.notebook_id,
                connector_type=self.connector_type,
                credentials=self.credentials
            )
            logger.info(f"Connector credentials response: {response}")

            # Map the response to our expected format
            if response['statusCode'] != 200:
                return {
                    'success': False,
                    'message': response['message'],
                    'cell': None
                }

            # Use the credentials in the cell source
            cell_source = f"""
            from connectors.services.posthog.service import PostHogService
            from IPython import get_ipython
            # Initialize PostHog service
            posthog_service = PostHogService({self.credentials})
            # Get IPython instance and inject into namespace
            ipython = get_ipython()
            ipython.user_ns['posthog_service'] = posthog_service
            ipython.user_ns['posthog_client'] = posthog_service.client
            ipython.user_ns['posthog_adapter'] = posthog_service.adapter

            print("Posthog connected ✅! Use posthog_service, posthog_client, posthog_adapter to access the connector.")
            """

            return {
                'success': True,
                'message': 'Connector setup successful',
                'cell': {
                    'cell_type': 'connector',
                    'connector_type': 'posthog',
                    'source': cell_source,
                    'outputs': []
                }
            }
        except KeyError as e:
            return {
                'success': False,
                'message': f"Missing required credential: {str(e)}. Please provide both 'apiKey' and 'baseUrl'.",
                'cell': None
            }
        except Exception as e:
            return {
                'success': False,
                'message': f"Failed to setup PostHog connector: {str(e)}",
                'cell': None
            }

    def get_connector_docstring(self):
        """
        Return the connector docstring that will be displayed in the notebook cell.
        """
        doc = """
        # Posthog notebook connector

        1. To fetch raw data from PostHog, use the library `posthog_client`. Link: https://github.com/deepkalilabs/cosmicnotebook/tree/main/docs`
        2. To fetch transformed data using our own format, use `posthog_adapter`. Link: https://github.com/deepkalilabs/cosmicnotebook/tree/main/docs
        3. To try own our own AI recipes, use `posthog_service`. Link: https://github.com/deepkalilabs/cosmicnotebook/tree/main/docs

        # Try out the following examples:
    
        ## Get all organizations:
        Description: Fetch all organizations from PostHog.
        ```python
        posthog_client.get_organizations()

        ## Get a project:
        Description: Fetch a project from PostHog.
        ```python
        posthog_client.get_project(project_id)
        ```
        """
        return doc
