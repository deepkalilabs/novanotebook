from ..base import BaseConnector

class PosthogConnector(BaseConnector):
    def __init__(self, credentials: dict):
        super().__init__(credentials)
        self.connector_type = 'posthog'


    def get_setup_code(self):
        # Inject the connector module in the notebook cell (last cell). Label the cell as a connector cell.
        code = f"""
        from connectors.services.posthog.posthog_service import PostHogService
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
        return code

    def get_cell_metadata(self):
        """
        Inject the connector docstring in the notebook.
        """
        return {
            'cell_type': 'connector',
            'connector_type': 'posthog',
            'trusted': True,
            'editable': False,
        }

    def get_connector_docstring(self):
        """
        Return the connector docstring.
        """
        return "Posthog docstring"