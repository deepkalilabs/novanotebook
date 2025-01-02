from abc import ABC, abstractmethod #Use instead of duck typing to extend different connectors
from ..types import ConnectorResponse
from ..supabase.connector_credentials import create_connector_credentials

class BaseConnector(ABC):
    """
    Base class for all connectors.
    Can be extended to create new connectors by implementing the abstract methods.
    """
    def __init__(self, credentials: dict):
        self.user_id = credentials.get('user_id')
        self.notebook_id = credentials.get('notebook_id')
        self.connector_type = 'base'
        self.credentials = credentials.get('credentials', {})

    @abstractmethod
    def get_setup_code(self) -> str:
        """Return code to initialize the connector"""
        pass

    @abstractmethod
    def get_cell_metadata(self) -> dict:
        """Return metadata for the connector cell"""
        pass

    async def setup(self) -> ConnectorResponse:
        """Setup connector and store credentials"""
        try:
            print("Storing credentials to database")
            # 1. Store credentials
            response = await create_connector_credentials(
                user_id=self.user_id,
                notebook_id=self.notebook_id,
                connector_type=self.connector_type,
                credentials=self.credentials
            )
            print("Response from database", response)

            if response.get('statusCode') != 200:
                print("Error storing credentials to database", response)
                return {
                    'success': False,
                    'message': response.get('message'),
                    'cell': None
                }

            print("Credentials stored successfully to database", response)
            print("Preparing cell data for connector")
            # 2. Create cell data
            cell_data = {
                'cell_type': 'connector',
                'connector_type': self.connector_type,
                'source': self.get_setup_code(),
                'outputs': []
            }

            return {
                'success': True,
                'message': 'Connector setup successful',
                'cell': cell_data
            }

        except Exception as e:
            return {
                'success': False,
                'message': str(e),
                'cell': None
            } 
        
    @abstractmethod
    def get_connector_docstring(self) -> str:
        """Return docstring for the connector"""
        pass
