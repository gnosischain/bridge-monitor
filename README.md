# Bridge Monitor

## Description

This monorepository contains the following folders:

- /app: React Application repository
- /subgraph: Subgraph repository
- /envio-indexer: Envio Indexer repository
- /alerts: Alert repository
- /tests: Test plan and records

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
     - [https://bridge-explorer.dev.gnosisdev.com/](https://bridge-explorer.dev.gnosisdev.com/)
   - **Staging Environment:**
     - [https://bridge-explorer.staging.gnosisdev.com/](https://bridge-explorer.staging.gnosisdev.com/)
   - **Production Environment:**
     - [https://bridge.gnosischain.com/](https://bridge.gnosischain.com/)
