# Handler for notebook connectors after a user submits a connector

class NotebookConnectorHandler:
    """
    Handler for notebook connectors after a user submits a connector

    1. Submit the data to the backend
    2. Inject the connector in the backend notebook environment
    3. Inject the connector in the notebook cell (last cell). Label the cell as a connector cell d
    """
    def __init__(self, user_id: str, notebook_id: str, connector_type: str, credentials: dict):
        self.user_id = user_id
        self.notebook_id = notebook_id
        self.connector_type = connector_type
        self.credentials = self.credentials


    def connector_setup(self, connector_type: str):
        pass

    def inject_connector_in_notebook(self, connector: str):
        pass

    def inject_connector_in_notebook_cell(self, connector: str):
        pass