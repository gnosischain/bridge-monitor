# Bridge Monitor

## Description

This monorepository contains the following folders:

- /app: React Application repository
- /envio-indexer: Envio Indexer repository
- /alerts: Alert repository
- /tests: Test plan and records

deleted:
- /subgraph: Subgraph repository on commit 270f27bec9b80386cceba1fb5dee67b9ad5c5430 and replace with envio-indexer

## Deploy Bridge-Explorer Pipeline

### Pipeline Trigger
The pipeline is triggered on push events to the DEVELOP and STAGING branches, as well as on any tag creation events for PRODUCTION versions.

### Create Release (For Tags Only - PROD Deployments):

- Creates a GitHub release for each tag.
- Extracts the latest release tag. It will skip if the release already exists.
- Uses GitHub REST API to create a release with the extracted tag name.

### Execution
To execute the pipeline:

 - Ensure the required environment variables are correctly set.
 - Push changes to the develop or staging branches, or create a new tag.
 - Monitor the pipeline execution and check the deployment status in the respective environment:
   - **Development Environment:**
     - [https://dev.bridge.gnosisdev.com/](https://dev.bridge.gnosisdev.com/)
   - **Staging Environment:**
     - [https://staging.bridge.gnosisdev.com/](https://staging.bridge.gnosisdev.com/)
   - **Production Environment:**
     - [https://bridge.gnosischain.com/](https://bridge.gnosischain.com/)

