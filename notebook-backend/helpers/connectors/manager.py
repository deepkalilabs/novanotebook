from typing import Optional
from fastapi import WebSocket
from .factory import ConnectorFactory
from ..types import ConnectorResponse, ConnectorCredentials

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
                'cell': None
            })

    async def setup_connector(
        self,
        credentials: ConnectorCredentials,
        code_executor
    ) -> ConnectorResponse:
        """Setup a new connector"""
        try:
            # 1. Create connector instance
            connector = ConnectorFactory.create_connector(
                credentials['connector_type'],
                credentials
            )

            # 2. Setup connector and get cell data
            result = await connector.setup()
            if not result['success']:
                await self.send_status(False, result['message'])
                return result

            # 3. Execute setup code in notebook
            if result['cell']:
                await code_executor(result['cell']['source'])
                await self.send_status(True, 'Connector initialized successfully')

            return result

        except Exception as e:
            error_response = {
                'success': False,
                'message': str(e),
                'cell': None
            }
            await self.send_status(False, str(e))
            return error_response 