import { Client, Collection, Message } from "discord.js"
import { Command } from "./struct/command"
import { readdirSync, lstatSync } from "fs"

interface BotConfig {
  token: string
  prefix?: string
}

export class BotClient extends Client {
  commands: Collection<string, Command>
  token: string
  prefix: string
  
  constructor(config: BotConfig) {
    super({
      intents: [
        "Guilds",
        "GuildMessages",
        "MessageContent"
      ]
    })
    this.commands = new Collection()
    this.token = config.token;
    this.prefix = config.prefix ?? "!"
  }

  registerCommand(command: Command) {
    console.log(`Registering command: ${command.name}`)
    this.commands.set(command.name, command)
  }
  
  loadCommands(dir: string) {
    for (const cmdDir of readdirSync(dir)) {
      if (!cmdDir.endsWith(".js")) continue
      const cmdPath = `${dir}/${cmdDir}`
      if (lstatSync(cmdPath).isDirectory()) this.loadCommands(cmdPath) 
      else
        import(cmdPath)
          .then(({ default: commandClass }) => {
            const command = new commandClass()
            this.registerCommand(command)
          })
          .catch(e => {
            console.log(`Failed to load path ${cmdPath}`)
          })
        
    }
  }
  
  handleMessage(msg:Message) {
    if (msg.author.bot) return
      if (!msg.content.startsWith(this.prefix)) return
      const args = msg.content.toLowerCase().slice(1).split(" ")
      if (this.commands.has(args[0]))
        this.commands.get(args[0]).exec(this, msg, args)
  }
  
  start(startMsg?:string) {
    this.on("ready", () => {
      console.log(startMsg ?? "balls")
    })
    
    this.on("messageCreate", msg => {
      this.handleMessage(msg)
    })
    
    this.login(this.token)
  }
}