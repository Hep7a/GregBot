import { Command } from "../struct/command"
import { BotClient } from "../client"
import { Message, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonInteraction } from "discord.js"
import { createButton, randomize, vectorsEqual, vectorsAdd, sleep } from "../util"
import { GameScreen, ScreenKeys } from "../struct/components/screen"

export default class Snake extends Command {
  constructor() {
    super("snake")
  }

  async exec(client:BotClient, msg:Message, args:string[]) {
    const screen = new SnakeGame(client.ws.ping)
    screen.start(msg)
  }
}

class SnakeGame extends GameScreen {
  count: number
  points: number;
  applePos: [number, number]
  snake: [number, number][]
  currDir: string
  updating: boolean
  ping: number
  constructor(ping: number) {
    super(false)
    this.points = 0
  }

  get snakeHead() {
    return this.snake[this.snake.length-1]
  }

  initSnake() {
    this.snake = [
      [2,3],
      [3,3],
      [4,3]
    ]
    this.setPixel(this.snakeHead, ScreenKeys.GREEN)
    this.setPixel(this.snake[1], ScreenKeys.YELLOW)
    this.setPixel(this.snake[0], ScreenKeys.YELLOW)
  }
  
  async start(msg: Message) {
    this.count = 0
    this.initSnake()
    this.generateApple()
    await super.start(msg)
  }

  render() {
    return `Points: ${this.points}\n` + super.render()
  }

  async renderFrames(interaction, sent?: boolean) {
    const count = this.count
    if (!this.running) {
      await this.gameOver(interaction)
      return
    }
    const pos = vectorsAdd(this.snakeHead, this.MOVEMENTS[this.currDir])
    console.log("update pos", this.count)
    await this.handlePos(pos, interaction)
    await this.update(interaction, sent, "renderFrames", this.count)
    if (!sent) sent = true
    await sleep(800)
    if (count !== this.count) return
    console.log("next frame", this.count)
    this.renderFrames(interaction, sent)
  }

  onMove(dir: string, i: ButtonInteraction) {
    this.count++
    this.currDir = dir
    this.renderFrames(i)
  }

  async handlePos(pos, i) {
    if (this.isOOB(pos) || this.isInSnake(pos)) {
      this.end()
      this.setPixel(this.snakeHead, ScreenKeys.EXPLODE)
      return
    }
    this.snake.push(pos)
    let deleted: [number, number]
    if (vectorsEqual(this.snakeHead, this.applePos)) {
      this.onAppleEaten()
    } else deleted = this.snake.shift()
    this.updateSnake(deleted)
  }

  updateSnake(deleted?: [number, number]) {
    if (deleted) this.setPixel(deleted, ScreenKeys.EMPTY)
    this.setPixel(this.snakeHead, ScreenKeys.GREEN)
    for (let i=0; i<this.snake.length-1; i++) {
      this.setPixel(this.snake[i], ScreenKeys.YELLOW)
    }
  }
  
  generateApple() {
    let applePos: [number, number] = this.currPos
    let currKey = ScreenKeys.YELLOW
    while (currKey !== ScreenKeys.EMPTY && this.isInSnake(applePos)) {
      const posX = randomize(this.grid.length)
      const posY = randomize(this.grid[posX].length)
      currKey = this.grid[posX][posY]
      applePos = [posX, posY]
    }
    this.applePos = applePos
    this.setPixel(applePos, ScreenKeys.RED)
  }

  isOOB(pos: [number, number]): boolean {
    return pos[0] < 0 || pos[0] > this.grid.length-1 || pos[1] < 0 || pos[1] > this.grid[pos[0]].length-1
  }
  
  onAppleEaten() {
    this.points++
    this.generateApple()
  }

  isInSnake(pos: [number, number]): boolean {
    const y = this.snake.filter(x => vectorsEqual(x, pos))
    return y.length > 0
  }

  async gameOver(i) {
    this.update(i, true, "gameOver", this.count)
    i.followUp(`You scored ${this.points} points!`)
    this.points = 0
  }
}