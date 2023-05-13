import { Message, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonInteraction } from "discord.js"
import { createButton } from "../../util"

export enum ScreenKeys {
  EMPTY = ":black_large_square:",
  RED = ":red_square:",
  GREEN = ":green_square:",
  BLUE = ":blue_square:",
  YELLOW = ":yellow_square:",
  EXPLODE = ":boom:"
}

export abstract class BaseScreen {
  grid: ScreenKeys[][]
  running: boolean

  constructor() {
    this.grid = []
    this.init()
  }

  init() {
    for (let i=0; i<7; i++) {
      this.grid[i] = []
      for (let j=0; j<7; j++) {
        this.setPixel([i,j], ScreenKeys.EMPTY)
      }
    }
  }

  async start(msg: Message) {
    this.running = true
    const response = await msg.channel.send({
      content: this.render(),
      components: [...this.generateActions()]
    })
    
    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === msg.author.id,
      time: 300_000
    })

    collector.on('collect', i => {
      this.onButtonClick(i)
    })
    
    collector.on('end', () => {
      msg.channel.send("5 minutes have passed, activity terminated.")
      return
    })
  }

  end() {
    this.running = false
  }

  render() {
    let str = ""
    for (let i=0; i<this.grid.length; i++) {
      for (let j=0; j<this.grid[i].length; j++) {
        if (!this.grid[i][j]) this.grid[i][j] = ScreenKeys.EMPTY
        str += `${this.grid[i][j]}`
      }
      str += "\n"
    }
    return str
  }

  abstract onButtonClick(interaction: ButtonInteraction)
  abstract generateActions()

  setPixel(pos: [number, number], key: ScreenKeys) {
    this.grid[pos[0]][pos[1]] = key
  }
  
  async update(interaction: ButtonInteraction, sent?: boolean, func?: string, id?: number) {
    if (!sent) sent = false
    console.log("updating", func, id, sent)
    await interaction[sent ? "editReply" : "update"]({
      content: this.render(),
      components: [...this.generateActions()]
    })
    console.log("updated", func, id, sent)
  }
}

export abstract class GameScreen extends BaseScreen {
  currColor: ScreenKeys
  prevPos: [number, number]
  currPos: [number, number]
  safety: boolean

  protected MOVEMENTS = {
    "left": [0,-1],
    "right": [0,1],
    "up": [-1,0],
    "down": [1,0]
  }

  get disabledControls() {
    return {
      "left": this.currPos[1] <= 0 ? true : false,
      "right": this.currPos[1] >= this.grid[this.currPos[0]].length-1 ? true : false,
      "up": this.currPos[0] <= 0 ? true : false,
      "down": this.currPos[0] >= this.grid.length-1 ? true : false
    }
  }

  constructor(safety?: boolean) {
    super()
    this.currColor = ScreenKeys.EMPTY
    this.prevPos = [3,3]
    this.currPos = [3,3]

    this.safety = safety ?? true
  }

  async start(msg: Message) {
    this.setPos(this.currPos)
    super.start(msg)
  }

  onButtonClick(interaction: ButtonInteraction) {
    if (interaction.customId.startsWith("draw-dir")) {
      const direction = interaction.customId.split("-")[2]
      this.onMove(direction, interaction)
    }
  }

  abstract onMove(dir: string, interaction: ButtonInteraction)

  generateActions() {
    const dirNames = ["Left", "Right", "Up", "Down"]
    let buttons = []
    let disabled = !this.running
    for (let i=0; i<dirNames.length; i++) {     
      
      const button = createButton(`draw-dir-${dirNames[i].toLowerCase()}`, dirNames[i]).setDisabled(!this.safety ? disabled : this.disabledControls[dirNames[i].toLowerCase()])
      buttons.push(button)
    }
    
    const directions = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(...buttons)
    
    return [directions]
  }

  setPos(pos: [number, number], color?: ScreenKeys) {
    this.prevPos = this.currPos
    this.setPixel(this.prevPos, ScreenKeys.EMPTY)
    this.currPos = pos
    this.setPixel(this.currPos, color ??ScreenKeys.YELLOW)
  }
}