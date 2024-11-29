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

### 2. AWS Setup

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

4. AWS Configure 
   ```bash
   aws configure
   ```

### 3. Package Installation

Install miniconda and activate conda in your environment

As of Nov 28, 2024:
```bash
mkdir -p ~/miniconda3
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm ~/miniconda3/miniconda.sh
source ~/.bashrc
source ~/miniconda3/bin/activate
```

Install Docker
As of Nov 28, 2024
```bash
# Add Docker's official GPG key:
sudo apt-get update
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
# Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update

sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo docker run hello-world

docker info # Verify docker has the right permissions
```

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

### 7. Creating your first notebook

We've decided to rebuild the notebook interface from scratch we're getting the interface to feature parity. There's two main things you should know:

1. Run all !pip install commands in a new cell in the first line. If `!pip` is not on the first line of a cell, the magic command won't work.

```bash
> Add new cell
> !pip install a b c
```

2. Define the interface for your code. Think of it as a clean function/parameter set invoking your code. There's two parts to this:
   2.1. Define the interface for the function parameters.
   
   ```bash
      class EntrypointParams(BaseModel):
         param1: param1_type
         param2: param2_type
         .
         paramN: paramN_type
   ```

   2.2 Define the interface for the code execution.
   
   ```bash
      def entrypoint(data: EntrypointParams):
         param1 = data.param1
         param2 = data.param2
         paramN = data.paramN

         result = driver_func(param1, param2, paramN)
         return result
   ```

   This helps us understand how to execute your code and how the invocations work so we can generate an API that works!


## What's Next?

- [Create your first notebook](link-to-docs) #TODO: Loom video
- [Deploy an API](link-to-docs) # TODO: Loom video for DatasetEnrich
- [View example projects](link-to-docs) # TODO: Include Recipes

## Contributing

We welcome contributions! See our [Contributing Guide](link-to-contributing) to get started.