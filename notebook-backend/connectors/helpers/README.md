# Helpers
Shared functions for the different 3rd party services like S3 or authentication.

## Example of a helper function:
`helpers/aws/s3/s3_helper.py`


# Rule of thumb:
- Move functions here when they become shared between multiple services. 
  - Source level authentication should be handled at the source level.
  - Service level authentication should be handled at the service level.
  - App level authentication should be handled here such as JWT, OAuth, etc.



