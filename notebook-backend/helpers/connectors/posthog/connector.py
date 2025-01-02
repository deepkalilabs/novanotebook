from ..base import BaseConnector
from helpers.types import ConnectorResponse
import logging

logger = logging.getLogger(__name__)

class PosthogConnector(BaseConnector):
    def __init__(self, credentials: dict):
        logger.info(f"Initializing PosthogConnector with credentials: {credentials}")
        # Extract the nested credentials
        self.user_id = credentials.get('user_id')
        self.notebook_id = credentials.get('notebook_id')
        super().__init__(credentials.get('credentials', {}))  # Pass the nested credentials to super
        self.connector_type = 'posthog'

    async def setup(self) -> ConnectorResponse:
        try:
            logger.info(f"Setting up PosthogConnector with credentials: {self.credentials}")
            
            if not isinstance(self.credentials, dict):
                return {
                    'success': False,
                    'message': f"Invalid credentials format. Expected dict, got {type(self.credentials)}",
                    'cell': None
                }
            
            if 'apiKey' not in self.credentials:  # Note: Using camelCase here since that's what's in the nested credentials
                logger.error(f"Missing apiKey in credentials. Available keys: {self.credentials.keys()}")
                return {
                    'success': False,
                    'message': "Missing required credential: 'apiKey'. Available keys: " + 
                              ", ".join(self.credentials.keys()),
                    'cell': None
                }

            transformed_credentials = {
                'api_key': self.credentials['apiKey'],  # Transform from camelCase to snake_case
                'base_url': self.credentials['baseUrl']
            }
            logger.info(f"Using credentials: {transformed_credentials}")

            # Use the credentials in the cell source
            cell_source = f"""
            from connectors.services.posthog.service import PostHogService
            from IPython import get_ipython
            # Initialize PostHog service
            posthog_service = PostHogService({transformed_credentials})
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
        Return the connector docstring.
        """
        return "Posthog docstring"