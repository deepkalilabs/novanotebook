from typing import Tuple
from connectors.sources.posthog_client import PostHogClient
from connectors.adapters.posthog_adapter import PostHogAdapter
import httpx
from IPython.core.getipython import get_ipython
from IPython.display import display, HTML
import logging

logging.basicConfig(level=logging.INFO)
async def init_posthog(api_key: str, host_url: str) -> Tuple[PostHogClient, PostHogAdapter]:
    """
    Initialize the PostHog client and adapter and return them.
   
    Example usage:
    posthog_client, posthog_adapter = init_posthog(api_key, host_url)
    """
    try:
        posthog_client = PostHogClient(api_key, host_url)
        posthog_adapter = PostHogAdapter(api_key, host_url)
        logging.info("posthog_client", posthog_client)
        logging.info("posthog_adapter", posthog_adapter)
        return posthog_client, posthog_adapter
    except httpx.HTTPError as e:
        logging.error(f"Error in init_posthog: {e}")
        raise ConnectionError(f"Failed to connect to PostHog: {e}")
    except Exception as e:
        logging.error(f"Error in init_posthog: {e}")
        raise ConnectionError(f"Unexpected error connecting to PostHog: {e}")


async def setup_posthog_in_notebook(api_key: str, host_url: str):
    """
    Designed to be used in the notebook.
    The functions will be automatically added to the notebook after passing the api key and host url.
    """
    
    try:
        # Initialize PostHog client and adapter
        posthog_client = PostHogClient(api_key, host_url)
        posthog_adapter = PostHogAdapter(api_key, host_url)        

        logging.info("posthog_client", posthog_client)
        logging.info("posthog_adapter", posthog_adapter)

        return posthog_client, posthog_adapter
    except Exception as e:
        logging.error(f"Error in setup_posthog_in_notebook: {e}")
        raise ConnectionError(f"Failed to connect to PostHog: {e}")
