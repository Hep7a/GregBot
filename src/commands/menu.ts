import { BotClient } from "../client"
import { Command } from "../struct/command"
import { Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"
import { createButton } from "../util"

export default class Menu extends Command {
  constructor() {
    super("menu")
  }

  exec(client:BotClient,msg:Message,args:string[]) {
    const boop = createButton("boop")
    const doop = createButton("doop")
    const goop = createButton("goop")
    
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(boop,doop,goop)

    msg.channel.send({
      content: "hehehe",
      components: [row]
    })
  }
}