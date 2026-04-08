# Contributor's Guide

Welcome to the Gnosis Bridge project! We value contributions from the community to help improve the codebase and documentation. Please follow the guidelines below to get started.

---

## Environments

- **Development**: [https://bridge-explorer.dev.gnosisdev.com/](https://bridge-explorer.dev.gnosisdev.com/)
- **Staging**: [https://bridge-explorer.staging.gnosisdev.com/](https://bridge-explorer.staging.gnosisdev.com/)
- **Production**: [https://bridge.gnosischain.com/](https://bridge.gnosischain.com/)

---

## Git Workflow

- **develop** branch: Represents the latest state of the development environment.
- **staging** branch: Represents the staging environment for pre-production testing.
- **main** branch: Represents the production environment.
- **Feature branches**: Each feature or fix should be developed in its own branch, created from `develop`.

### Branch Flow

1. Create a feature branch from `develop`.
2. Submit a PR to the `develop` branch for review.
3. Once approved, changes from `develop` are promoted to `staging` and eventually to `main` for production.

---

## Project Structure

The repository is a **monorepo**, containing:

- `/app`: React application repository.
- `/alerts`: Alert repository.
- `/tests`: Test plans and records.

---

## Running the Project frontend locally

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) version 18.20.1 or higher.
- [Docker](https://www.docker.com/)
- Any required environment variables for your local setup.

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/gnosischain/bridge-monitor.git
   cd bridge-monitor/app
   ```

2. Install dependencies:

   ```bash
   nvm use
   pnpm install
   ```

3. Start the project:

   ```bash
   pnpm run dev
   ```

This will launch the React application in development mode. Changes are reflected live.

---

## Deploying to Environments

The project uses an automated pipeline for deployments.

### Triggers

- Push to the `develop` or `staging` branches triggers deployment to Development or Staging environments.
- Tag creation (e.g., `v1.0.0`) triggers deployment to the Production environment.

### Monitoring

Check the pipeline execution logs to ensure successful deployment.

---

## Creating a Release

For production deployments:

1. Create a tag for the release (e.g., `v1.0.0`).
2. The pipeline will:
   - Create a GitHub release using the tag.
   - Deploy the release to the Production environment.

To manually create a release, use the GitHub interface or CLI to tag the codebase.

---

## Writing Style

Follow these guidelines to maintain consistency:

- **Code**: Adhere to the project's linting and formatting rules. Run `pnpm lint` to check for issues before submitting a PR.
- **Documentation**: Ensure all new features and updates are reflected in the `README` or relevant documentation files.

Refer to:

- [General Writing Guidelines (by OpenStack)](https://docs.openstack.org/doc-contrib-guide/writing-style/general-writing-guidelines.html)
- [Bias-free communication (by Microsoft)](https://learn.microsoft.com/en-us/style-guide/bias-free-communication)

---

## Submitting Issues

1. Search for existing issues to avoid duplication.
2. If the issue does not exist, [open a new issue](https://github.com/gnosischain/bridge-monitor/issues/new) using the appropriate template.

---

## Creating Pull Requests

1. Fork the repository and create a feature branch from `develop`.
2. Ensure your branch is up-to-date with `develop` before creating a PR.
3. Follow the PR template:
   - Provide a descriptive title.
   - Reference any linked issues (e.g., "Closes #123").
   - Describe your changes clearly.
4. Ensure all CI checks pass.

---

## Testing

1. Write tests for all new features or bug fixes.
2. Add test plans or records to the `/tests` folder if applicable.
3. Run the test suite:

   ```bash
   pnpm test
   ```

---

By following this guide, you'll help maintain the quality and consistency of the Gnosis Bridge project. Thank you for contributing!
