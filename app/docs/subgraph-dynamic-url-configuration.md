# Subgraph Dynamic URL Configuration

This feature allows for dynamic configuration of URLs based on network IDs and environment variables. It is designed to provide flexibility for maintaining and scaling an application, enabling the addition of new URL pairs and dynamic selection of network pairs.

## JSON Configuration

The JSON configuration file is located at [`src/constants/config/subgraph-endpoints.json`](../src/constants/config/subgraph-endpoints.json) and has the following structure:
```json
{
  "100:1": {
    "home": "https://api.thegraph.com/subgraphs/name/{{org}}/gnosis",
    "foreign": "https://api.thegraph.com/subgraphs/name/{{org}}/mainnet"
  }
}
```

- `"100:1"`: Network ID pair, where "100" is considered the home network, and "1" is the foreign network.
- `"home"`: URL for the home network.
- `"foreign"`: URL for the foreign network.

Please note that it's essential to ensure that the resulting URLs created based on this configuration actually exist and are accessible. Failure to have valid URLs may lead to issues during the app's build and runtime.

## Environment Variables

### `NEXT_PUBLIC_SUBGRAPH_ORGANIZATION`

The `{{org}}` tag within the URLs will be replaced by the value of the `NEXT_PUBLIC_SUBGRAPH_ORGANIZATION` environment variable, which must be defined at build time.

### `NEXT_PUBLIC_SUBGRAPH_SUFFIX`

Optionally, you can add a suffix to the URLs using the `NEXT_PUBLIC_SUBGRAPH_SUFFIX` environment variable. If present, the URLs will end with `-{SUFFIX}`.

For example, during development, you can create a reduced subgraph with less historical data by naming it "gnosis-dev" and setting the `NEXT_PUBLIC_SUBGRAPH_SUFFIX` environment variable to "dev" (`NEXT_PUBLIC_SUBGRAPH_SUFFIX=dev`).

## Usage

This dynamic URL configuration is useful during development and allows developers to iterate faster by adjusting the subgraph URLs.

- **Local Development**: Developers must define the `NEXT_PUBLIC_SUBGRAPH_ORGANIZATION` and `NEXT_PUBLIC_SUBGRAPH_SUFFIX` variables in the `env.local` file since this feature is intended for Next.js applications.

## Scalability

This feature is designed to be scalable. You can easily add new home:foreign pairs in the JSON configuration, allowing the application to handle multiple network pairs.

## Mandatory Configuration

It's important to note that the `NEXT_PUBLIC_SUBGRAPH_ORGANIZATION` environment variable is mandatory. If it is not defined, the application will throw an error.

By following this dynamic URL configuration, you can create a flexible structure that allows for easy maintenance and scaling of your application.