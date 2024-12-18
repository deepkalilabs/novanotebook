# Services
Services apply business logic to the data. 

## Example of a service:
`services/posthog/posthog_service.py`

## Rule of thumb:
- Apply business logic to the data such as churn prediction and return the data.
- Apply authentication or authorization.
    - Determine whether the requester is allowed to access the data.
    - Use credentials obtain from the source or user to validate the requester.


## Example of a service function:
"""
#Churn prediction using PostHog
def churn_prediction(user_id: str, data_id: str):
    # Check if the user has access to the data
    if not user_has_access(user_id, data_id):
        raise HTTPException(status_code=403, detail="User does not have access to this data")
    # Get the data
    data = get_data_from_source(data_id)
    # Apply business logic
    churn_prediction = apply_churn_prediction(data)
    return churn_prediction
"""
