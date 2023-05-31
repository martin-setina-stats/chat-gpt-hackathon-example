# Chat GPT Hackathon

Please create .env file in the root of the project with the variable `OPENAI_API_KEY`

Require node version 18.12 and higher

## Load S3

You need to first run unstructured via this command:
docker run -p 8000:8000 -d --rm --name unstructured-api quay.io/unstructured-io/unstructured-api:latest --port 8000 --host 0.0.0.0
