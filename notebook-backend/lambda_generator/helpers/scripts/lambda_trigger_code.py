def lambda_handler(event, context):
    try:
        # Validate parameters using Pydantic
        params = EntrypointParams(**event)
        
        # Call entrypoint with validated parameters
        result = entrypoint(params)
        
        print('Data processed successfully.')
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }
    except Exception as e:
        print(f"Error processing data: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
