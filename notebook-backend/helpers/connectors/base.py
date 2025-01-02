from abc import ABC, abstractmethod
from typing import Dict, Any
from ..types import ConnectorResponse

class BaseConnector(ABC):
    def __init__(self, credentials: dict):
        self.credentials = credentials
        self.connector_type = None

    @abstractmethod
    async def setup(self) -> ConnectorResponse:
        """Setup the connector and return the cell data"""
        pass
