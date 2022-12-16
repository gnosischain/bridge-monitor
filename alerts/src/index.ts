import * as dotenv from "dotenv"
dotenv.config()
import { messages } from "./alerts/messages"
import { sendMessage } from "./slack"

const main = async () => {
  console.log('Creating messages to send...')
  const msgs = await messages()
  console.log(`Sending ${msgs.length} total of messages...`)
  const promises = msgs.map(msg => {
    return sendMessage(msg)
  })
  await Promise.all(promises)
  console.log('Messages sent')
}

main()
