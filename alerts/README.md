# Bridge Monitor Alerts

This repository is used to send alert messages to different devices (Slack, etc).

The alerts that will be sent are:

- Low Balance (XDAI or ETH) for validators
- Low Limits for XDAI Native and Foreign Bridge Contracts (dailyLimit and executionDailyLimit)
- Invalid validator: When validator is not signing transactions for threshold amount of time
- Stucked Transaction: When a transaction is initiated but still in 'Collecting' status for threshold amount of time

# Dev

```shell
cp .env.example .env
pnpm install && pnpm typechain && pnpm build
pnpm dev # or pnpm start
```

# Run docker

```shell
docker compose up --build
```

### Validators

A balance is low when is under 0.5 amount of tokens (ETH or XDAI). (TBD)

### XDAI Contracts

A limit is low when it is under 25%? of the total limit per day. (TBD)

## Configuration

Remember to configure Slack App:

- create slack app
- add slack into workspace
- create scope permissions for slack
- Optional: if using bot, add it to the channel
- add credentials into .env file

## Steps

- Setup Env Variables
  - cp .env.example .env
- Install dependencies
  - pnpm install
- Run script
  - pnpm dev

### References

- NPM Library: https://www.npmjs.com/package/@slack/web-api
- Slack Sending Message: https://api.slack.com/messaging/sending
- Slack Access Tokens: https://api.slack.com/authentication/token-types
- Slack Message Layout (blocks): https://api.slack.com/messaging/composing/layouts
- Community guide: https://hackmd.io/@sideex/slack
