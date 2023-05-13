import { BotClient } from "../client"
import { Command } from "../struct/command"
import { Message } from "discord.js"

export default class Random extends Command {
  constructor() {
    super("random")
  }

  exec(client:BotClient, msg:Message, args: string[]) {
    const max = parseInt(args[1])
    if (isNaN(max)) {
      msg.channel.send("Invalid arguments.")
      return
    }
    const rng = Math.floor(Math.random() * max) + 1
    msg.channel.send(`Random number: ${rng}`)
  }
}