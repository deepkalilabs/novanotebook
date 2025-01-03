from typing import Optional
from fastapi import WebSocket
from .factory import ConnectorFactory
from ..types import ConnectorResponse, ConnectorCredentials
import logging

logging.basicConfig(level=logging.INFO)

class ConnectorManager:
    """
    Manager for connectors.
    Manages the setup of connectors and the execution of setup code in the notebook via a websocket.
    """
    def __init__(self, websocket: Optional[WebSocket] = None):
        self.websocket = websocket

    async def send_status(self, success: bool, message: str):
        """Send status update to frontend"""
        if self.websocket:
            await self.websocket.send_json({
                'type': 'connector_status',
                'success': success,
                'message': message,
                'cell': None,
                'code': None,
                'docstring': None
            })

    async def setup_connector(
        self,
        credentials: ConnectorCredentials,
        code_executor
    ) -> ConnectorResponse:
        """Setup a new connector"""
        try:
            print(f"Searching for connector {credentials['connector_type']}")
            # 1. Create connector instance
            connector = ConnectorFactory.create(
                credentials['connector_type'],
                credentials
            )
            print(f"Connector {credentials['connector_type']} created")

            # 2. Setup connector and get cell data
            result = await connector.setup()
            if not result['success']:
                return ConnectorResponse(
                    type='connector_created',
                    success=False,
                    message=result['message'],
                    cell=None,
                    code=None,
                    docstring=None
                )           

            # 3. Return response
            return ConnectorResponse(
                type='connector_created',
                success=True,
                message='Ready to use posthog connector',
                cell={  # cell needs to be a dictionary
                    'cell_type': 'code',
                    'source': result['code'],
                    'outputs': []
                },
                code=result['code'],
                docstring=result['docstring']
            )

        except Exception as e:
            print(f"Error setting up connector {credentials['connector_type']}: {e}")
            return ConnectorResponse(
                type='connector_created',
                success=False,
                message=str(e),
                cell=None,
                code=None,
                docstring=None
            )
