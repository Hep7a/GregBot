import { BotClient } from "./client"
import { join } from "path"

const bot = new BotClient({
  token: "OTY0MTA4NTc3ODAxMzc1Nzk1.GlYvBj.A0npyXOrq3PIhy_gQtHyAM3tQdHa9Xbx91NdQk"
})

let ioCommands = {
  "ooga": "booga",
  "bing": "bong"
}

bot.on("messageCreate", msg => {
  if (msg.author.bot) return
  console.log(msg.author.username, msg.content)
  if (Object.keys(ioCommands).includes(msg.content.toLowerCase())) {
    msg.channel.send(ioCommands[msg.content.toLowerCase()])
  }
})

bot.loadCommands(join(__dirname, "commands"))
bot.start()