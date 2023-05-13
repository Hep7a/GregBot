import { BotClient } from "../client"
import { Message, ButtonStyle, ActionRowBuilder, BaseInteraction } from "discord.js"
import { createButton } from "../util"

export abstract class Command {
  name: string
  constructor(name) {
    this.name = name
  }
  abstract exec(client: BotClient, msg: Message, args: string[]): void | Promise<void>
}

