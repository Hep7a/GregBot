import { BotClient } from "../client"
import { Command } from "../struct/command"
import { Message } from "discord.js"

export default class Ping extends Command {
  constructor() {
    super("ping")
  }

  async exec(client: BotClient, msg: Message) {
    const m = await msg.channel.send("Pong!")
    msg.channel.send(`Latency: \`${m.createdTimestamp - msg.createdTimestamp}ms\`\nAPI Latency: \`${client.ws.ping}ms\``)
  }
}