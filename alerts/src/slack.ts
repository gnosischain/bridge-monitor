import { Block, KnownBlock, WebClient } from '@slack/web-api';
import { Message } from './alerts/messages';
import fetch from 'node-fetch';

const token = process.env.SLACK_TOKEN || '';
const channel = process.env.SLACK_CHANNEL || '';
const webhookURL = process.env.SLACK_WEBHOOK_URL || '';

const web = new WebClient(token);

const createBlocksMessage = (msg: Message): (Block | KnownBlock)[] => {
  return [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: msg.title,
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Type:*\n${msg.type}`,
        },
        {
          type: 'mrkdwn',
          text: `*Contract:*\n<${msg.createdByLink}|${msg.createdBy}>`,
        },
      ],
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*When:*\n${(msg.timestamp || new Date()).toISOString()}`,
        },
      ],
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Message:*\n${msg.body}`,
        },
      ],
    },
  ];
};

const channels = async () => {
  try {
    const result = await web.conversations.list();
    return result.channels;
  } catch (e) {
    return Promise.resolve([]);
  }
};

const sendMessageToChannel = async (msg: Message, channelId: string) => {
  try {
    const result = await web.chat.postMessage({
      text: msg.title,
      channel: channelId,
      blocks: createBlocksMessage(msg),
    });
    const timestamp = result.ts ? new Date(parseInt(result.ts) * 1000) : new Date();

    console.log(`Successfully send message at ${timestamp} in channel ${channelId}`);
  } catch (e) {
    console.log({ e });
    const timestamp = new Date();
    console.log(`Unsuccessfully send message at ${timestamp} in channel ${channelId}`);
  }
};

const sendMessageOverWebhook = async (msg: Message) => {
  try {
    const payload = {
      text: msg.title,
      blocks: createBlocksMessage(msg)
    };
    
    const response = await fetch(webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (response.ok) {
      console.log(`Successfully sent message via webhook.`);
    } else {
      const responseText = await response.text();
      console.error(`Failed to send message via webhook: ${response.status} ${response.statusText}`);
      console.error(`Response body: ${responseText}`);
    }
  } catch (e) {
    console.error('Error sending message via webhook:', e);
  }
}

const sendMessage = (msg: Message) => {
  if (webhookURL) {
    return sendMessageOverWebhook(msg);
  }
  if (token && channel) {
    return sendMessageToChannel(msg, channel);
  }
  console.error('No Slack configuration found. Please set SLACK_WEBHOOK_URL or SLACK_TOKEN and SLACK_CHANNEL.');
}

export { sendMessage, channels };
