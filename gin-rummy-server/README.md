# Gin Rummy Server

## Build

```bash
docker build gin-rummy-server:latest .
```

## Login

To authorize (for testing locally)

```bash
gcloud auth application-default login
```

## Setup cred

```bash
export GOOGLE_GENAI_USE_VERTEXAI="true"
export GOOGLE_CLOUD_PROJECT="[GCP_PROJECT_ID]"
export GOOGLE_CLOUD_LOCATION="[LOCATION]"
```

## Test

```bash
docker run -it --rm -p 8080:8080 -e GOOGLE_GENAI_USE_VERTEXAI="${GOOGLE_GENAI_USE_VERTEXAI}" -e GOOGLE_CLOUD_PROJECT="${GOOGLE_CLOUD_PROJECT}" -e GOOGLE_CLOUD_LOCATION="${GOOGLE_CLOUD_LOCATION}" gin-rummy-server:latest
```