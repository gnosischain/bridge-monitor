import { Block, KnownBlock, WebClient } from '@slack/web-api'
import { Message } from './alerts/messages';

const token = process.env.SLACK_TOKEN || ''
const channel = process.env.SLACK_CHANNEL || ''

const web = new WebClient(token);

const createBlocksMessage = (msg: Message): (Block | KnownBlock)[] => {
  return [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": msg.title,
        "emoji": true
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": `*Type:*\n${msg.type}`
        },
        {
          "type": "mrkdwn",
          "text": `*Contract:*\n<${msg.createdByLink}|${msg.createdBy}>`
        },
      ]
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": `*When:*\n${msg.timestamp.toISOString()}`
        },
      ]
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": `*Message:*\n${msg.body}`,
        }
      ]
    },
  ]
}

const channels = async () => {
  try {
    const result = await web.conversations.list()
    return result.channels
  } catch(e) {
    return Promise.resolve([])
  }
}

const sendMessageToChannel = async (msg: Message, channelId: string) => {
  try {
    const result = await web.chat.postMessage({
      text: msg.title,
      channel: channelId,
      blocks: createBlocksMessage(msg)
    })
    const timestamp = result.ts ? new Date(parseInt(result.ts) * 1000) : new Date()

    console.log(`Successfully send message at ${timestamp} in channel ${channelId}`)
  } catch (e) {
    console.log({ e })
    const timestamp = new Date()
    console.log(`Unsuccessfully send message at ${timestamp} in channel ${channelId}`)
  }
}

const sendMessage = (msg: Message) => sendMessageToChannel(msg, channel)

export { sendMessage, channels }
