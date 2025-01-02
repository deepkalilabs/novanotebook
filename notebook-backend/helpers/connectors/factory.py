from typing import Type
from .base import BaseConnector
from .posthog.connector import PosthogConnector

class ConnectorFactory:
    """
    Factory design pattern for creating connector instances.
    """
    _connectors = {
        "posthog": PosthogConnector
        # Add more connectors here
        # "EX: snowflake": SnowflakeConnector
    }

    @classmethod
    def create(cls, connector_type: str, credentials: dict) -> BaseConnector:
        """Create a connector instance"""
        connector_class = cls._connectors.get(connector_type)
        if not connector_class:
            raise ValueError(f"Unknown connector type: {connector_type}")
        return connector_class(credentials)

    @classmethod
    def register(cls, connector_type: str, connector_class: Type[BaseConnector]):
        """Register a new connector type"""
        cls._connectors[connector_type] = connector_class 