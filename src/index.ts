import { BotClient } from "./client"
import { join } from "path"
import { TOKEN } from "./config"

const bot = new BotClient({
  token: TOKEN
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