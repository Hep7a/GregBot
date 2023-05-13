import { BotClient } from "../client"
import { Command } from "../struct/command"
import { Message, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, ButtonInteraction } from "discord.js"
import { createButton, randomize } from "../util"

export default class TicTacToe extends Command {
  constructor() {
    super("tictactoe")
  }
  async exec(client:BotClient,msg:Message,args:string[]) {
    const game = new TTTGame()
    game.start(msg)
  }
}

class TTTGame {
  private colors = {
    "?": ButtonStyle.Secondary,
    "O": ButtonStyle.Primary,
    "X": ButtonStyle.Danger
  }
  grid: string[]
  playerTurn: boolean
  winner?: string = "?"
  
  constructor() {
    this.grid = new Array(9).fill("?")
    this.playerTurn = true
  }

  async start(msg: Message) {
    const response = await msg.channel.send({
      content: "Tic Tac Toe:",
      components: [...this.generateGrid()]
    })

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === msg.author.id,
      time: 120_000
    })

    collector.on('collect', i => {
      this.onButtonClick(i)
    })
    
    collector.on('end', () => {
      msg.channel.send("2 minutes have passed, game terminated.")
      return
    })
  }

  generateGrid() {
    let rows = []
    for (let i = 0; i < 3; i++) {
      let buttons = []
      for (let j = 0; j < 3; j++) {
        const move = this.grid[i*3+j]
        const button = createButton(`tictactoe-${i}-${j}`, move, this.colors[move])
        if (move !== "?" || this.winner !== "?") button.setDisabled(true)
        buttons.push(button)
      }
      rows.push(new ActionRowBuilder<ButtonBuilder>()
      .addComponents(...buttons))
    }
    return rows
  }

  update(i: ButtonInteraction) {
    i.update({
      content: this.winner === "?" ? "Tic Tac Toe:" : `Winner is ${this.winner}.`,
      components: [...this.generateGrid()]
    })
  }

  onButtonClick(i: ButtonInteraction) {
    const btnInfo = i.customId.split("-")
    const row = parseInt(btnInfo[1])
    const col = parseInt(btnInfo[2])
    this.makeMove(row*3+col)
    this.cpuMove() 
    this.update(i)
  }

  makeMove(index: number) {
    this.grid[index] = this.playerTurn ? "O" : "X"
    // Check if win
    const wins = [
        [0,1,2],
        [3,4,5],
        [6,7,8],
        [0,3,6],
        [1,4,7],
        [2,5,8],
        [0,4,8],
        [2,4,6]
    ]
    for (let i = 0; i < wins.length; i++) {
      if (
        this.grid[wins[i][0]] === this.grid[wins[i][1]] &&
        this.grid[wins[i][1]] === this.grid[wins[i][2]] &&
        this.grid[wins[i][0]] !== "?"
      ) {
        this.winner = this.grid[wins[i][0]]
        return
      }
    }
    this.playerTurn = !this.playerTurn
  }
  
  cpuMove() {
    if (this.winner !== "?") return
    let moves = []
    for (let i=0;i<this.grid.length;i++) {
      if (this.grid[i] === "?") moves.push(i)
    }
    this.makeMove(moves[randomize(moves.length)])
  }
}