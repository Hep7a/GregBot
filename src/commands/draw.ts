import { Command } from "../struct/command"
import { BotClient } from "../client"
import { Message, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonInteraction } from "discord.js"
import { createButton, randomize } from "../util"
import { BaseScreen, ScreenKeys } from "../struct/components/screen"

export default class Draw extends Command {
  constructor() {
    super("draw")
  }

  async exec(client:BotClient, msg:Message, args:string[]) {
    const screen = new DrawingScreen()
    screen.start(msg)
  }
}

class DrawingScreen extends BaseScreen {
  currColor: ScreenKeys
  prevPos: [number, number]
  currPos: [number, number]
  toggled: boolean
  coveredColor: ScreenKeys

  get disabledControls() {
    return {
      "left": this.currPos[1] <= 0 ? true : false,
      "right": this.currPos[1] >= this.grid[this.currPos[0]].length-1 ? true : false,
      "up": this.currPos[0] <= 0 ? true : false,
      "down": this.currPos[0] >= this.grid.length-1 ? true : false
    }
  }

  constructor() {
    super()
    this.currColor = ScreenKeys.EMPTY
    this.currPos = [3,3]
    this.toggled = false
    this.coveredColor = ScreenKeys.EMPTY
  }

  async start(msg: Message) {
    this.setPos([3,3])
    super.start(msg)
  }

  onButtonClick(interaction: ButtonInteraction) {
    switch (interaction.customId) {
      case "draw-random":
        const colors = ["EMPTY","RED","GREEN","BLUE"]
        for (let i=0; i<this.grid.length; i++) {
          for (let j=0; j<this.grid[i].length; j++) {
            this.setPixel([i,j], ScreenKeys[randomize(colors.length)])
          }
        }
        this.update(interaction)
        break;
      case "draw-toggle":
        this.toggled = !this.toggled
        interaction.reply({
          content: this.toggled ? "Toggled pen on." : "Toggled pen off.",
          ephemeral: true
        })
        break;
      case "draw-fill":
        for (let i=0; i<this.grid.length; i++) {
          for (let j=0; j<this.grid.length; j++) {
            this.setPixel([i,j], this.currColor)
          }
        }
        this.update(interaction)
        break;
    }

    if (interaction.customId.startsWith("draw-color")) {
      const color = interaction.customId.split("-")[2]
      this.currColor = ScreenKeys[color.toUpperCase()]
      interaction.reply({
        content: `Set color to ${color}`,
        ephemeral: true
      })
    }

    if (interaction.customId.startsWith("draw-dir")) {
      const dict = {
        "up": [-1,0],
        "down": [1,0],
        "left": [0,-1],
        "right": [0,1]
      }
      const direction = interaction.customId.split("-")[2]
      const posX = this.currPos[0]+dict[direction][0]
      const posY = this.currPos[1]+dict[direction][1]
      this.setPos([posX, posY])
      this.update(interaction)
    }
  }

  generateActions() {
    const randomBtn = createButton("draw-random", "Random")
    const togglePen = createButton("draw-toggle", "Toggle")
    const fillBtn = createButton("draw-fill", "Fill")
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(randomBtn, togglePen, fillBtn)

    const redColor = createButton("draw-color-red", "Red", "RED")
    const blueColor = createButton("draw-color-blue", "Blue", "BLUE")
    const greenColor = createButton("draw-color-green", "Green", "GREEN")
    const blackColor = createButton("draw-color-black", "Black", "GRAY")
    
    const colors = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(redColor, blueColor, greenColor, blackColor)

    const dirNames = ["Left", "Right", "Up", "Down"]
    let buttons = []
    for (let i=0; i<dirNames.length; i++) {
      const button = createButton(`draw-dir-${dirNames[i].toLowerCase()}`, dirNames[i]).setDisabled(this.disabledControls[dirNames[i].toLowerCase()])
      buttons.push(button)
    }
    
    const directions = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(...buttons)
    
    return [row, colors, directions]
  }

  setPos(pos: [number, number]) {
    this.prevPos = this.currPos
    this.currPos = pos
    this.coveredColor = this.grid[pos[0]][pos[1]]
    this.setPixel(this.prevPos, this.toggled ? this.currColor : this.coveredColor)
    this.setPixel(this.currPos, ScreenKeys.YELLOW)
    console.log(this.currPos, this.disabledControls)
  }
}