import { BotClient } from "../client"
import { Command } from "../struct/command"
import { Message } from "discord.js"

export default class Ping extends Command {
  x: number = 0
  constructor() {
    super("test")
  }

  exec(client: BotClient, msg: Message) {
    msg.channel.send(`Test: ${this.x}`)
    this.x += 1
  }
}