# Getting Started with Nova Notebook 🚀

Nova Notebook is a next-generation Jupyter environment that enables data teams to deploy notebook code directly to production and create production-ready APIs. This guide will help you set up Nova Notebook in your local environment.

## Prerequisites

- AWS Account with appropriate permissions
- Supabase Account
- Python 3.8 or higher
- UV package manager
- Git

## System Architecture

Nova Notebook uses:
- **AWS Lambda & API Gateway** for serverless functions.
- **AWS ECR** for containerizing the code.
- **Supabase** for authentication and data storage.
- **JupyterClient** to support the jupyter kernel.
- **FastAPI** to support async communication.
- **UV** for Python package management.
- **NextJS** for our the notebook interface.

## Setup Instructions

### 1. Environment Configuration

1. Copy the template environment file:
   ```bash
   cp .env.template .env
   ```

2. Update the `.env` file with your credentials:
   ```plaintext
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_key
   ```

### 2. AWS Lambda Setup

1. Create an AWS Lambda execution role:
   ```bash
   aws iam create-role \
     --role-name notebook-lambda-generator \
     --assume-role-policy-document file://notebook-backend/lambda_generator/trust_policy.json
   ```

2. Attach the required policy:
   ```bash
   aws iam put-role-policy \
     --role-name notebook-lambda-generator \
     --policy-name notebook-lambda-policy \
     --policy-document file://notebook-backend/lambda_generator/role_policy.json
   ```

3. Update the ARN in your `.env` file:
   ```plaintext
   LAMBDA_EXECUTION_ROLE=arn:aws:iam::YOUR_ACCOUNT_ID:role/notebook-lambda-generator
   ```

### 3. Package Installation

Install dependencies using UV:
```bash
uv init
uv pip install --requirements pyproject.toml
```

### 4. Supabase Configuration

1. Navigate to `lambda_generator/helpers/scripts/dockerfile_sample`
2. Update the following variables:
   ```plaintext
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   ```

> 📝 **Note**: We currently use Supabase as our database provider. We plan to migrate to PostgreSQL in the future. Contributions are welcome - see [Issue #XX](link-to-issue).

### 5. Running the Server

Start the Nova Notebook server:
```bash
python main.py
```

### 6. Running the frontend

1. Copy the template environment file:
   ```bash
   cp .env.template .env
   ```

2. Update the `.env` file with your credentials:
   ```plaintext
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   SUPABASE_URL=your_url
   SUPABASE_KEY=your_key
   ```

3. Install frontend dependencies and spin up project with
    ```bash
        yarn install
        yarn dev
    ```

## What's Next?

- [Create your first notebook](link-to-docs) #TODO: Loom video
- [Deploy an API](link-to-docs) # TODO: Loom video for DatasetEnrich
- [View example projects](link-to-docs) # TODO: Include Recipes

## Contributing

We welcome contributions! See our [Contributing Guide](link-to-contributing) to get started.