# Subgraph Dynamic URL Configuration

This feature allows for dynamic configuration of URLs based on network IDs and environment variables. It is designed to provide flexibility for maintaining and scaling an application, enabling the addition of new URL pairs and dynamic selection of network pairs.

Please note that:

The meaning of each environment variable varies depending on whether the dapp is running in a development or production environment. This is because the endpoints used by each environment are constructed differently.

## JSON Configuration

The JSON configuration file is located at [`src/constants/config/subgraph-endpoints.json`](../src/constants/config/subgraph-endpoints.json) and has the following structure:

```json
{
  "100:1": {
    "home": {
      "development": "https://api.studio.thegraph.com/query/{{accessId}}/gbc-bridge-gnosis/{{resourceId}}",
      "production": "https://gateway-arbitrum.network.thegraph.com/api/{{accessId}}/subgraphs/id/{{resourceId}}"
    },
    "foreign": {
      "development": "https://api.studio.thegraph.com/query/{{accessId}}/gbc-bridge-mainnet/{{resourceId}}",
      "production": "https://gateway-arbitrum.network.thegraph.com/api/{{accessId}}/subgraphs/id/{{resourceId}}"
    }
  }
}
```

- `"100:1"`: Network ID pair, where "100" is considered the home network, and "1" is the foreign network.
- `"home"`: Configuration for the home subgraph.
- `"foreign"`: Configuration for the foreign subgraph.
- `"environment"`: URL for the specific environment.

Please note that:

- It's essential that the first value of they key refers to home and the second one to foreign.
- it's essential to ensure that the resulting URLs created based on this configuration actually exist and are accessible. Failure to have valid URLs may lead to issues during the app's build and runtime.

## Environment Variables

### `NEXT_PUBLIC_SUBGRAPH_ENVIRONMENT`

The value of this variable must be either `development` or `production`.

### `NEXT_PUBLIC_SUBGRAPH_ACCESS_ID`

The `{{accessId}}` tag within the URLs will be replaced by the value of the `NEXT_PUBLIC_SUBGRAPH_ACCESS_ID` environment variable, which must be defined at build time.

### `NEXT_PUBLIC_SUBGRAPH_CHAINS_RESOURCE_IDS`

The `{{resourceId}}` tag within the URLs will be replaced with the parsed value for the specified chain pair based on the `NEXT_PUBLIC_SUBGRAPH_ACCESS_ID` environment variable. This variable must be defined at build time and should follow the format: `chainId:resourceId`. Multiple values can be specified by separating them with a comma.

Some examples:
for development `NEXT_PUBLIC_SUBGRAPH_CHAINS_RESOURCE_IDS=100:v.0.0.2-develop,1:v0.0.1-develop`
for production `NEXT_PUBLIC_SUBGRAPH_CHAINS_RESOURCE_IDS=100:9W7Ye5xFfefNYDxXD4StqAuj7TU8eLq5PLmuPUnhFbeQ,1:2ths6FTZhCBggnyakh7PL5KH91zjRv8xPNfzaCRKogJ`

## Usage

This dynamic URL configuration is useful during development and allows developers to iterate faster by adjusting the subgraph URLs.

- **Local Development**: Developers must define all the environment variables in the `env.local` file since this feature is intended for Next.js applications.

## Scalability

This feature is designed to be scalable. You can easily add new home:foreign pairs in the JSON configuration, allowing the application to handle multiple network pairs.
