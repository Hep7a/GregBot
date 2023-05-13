import { Command } from "../struct/command"
import { GameScreen } from "../struct/components/screen"
import { vectorsAdd } from "../util"

export default class Maze extends Command {
  constructor() {
    super("maze")
  }

  exec(client,msg,args) {
    const screen = new MazeGame()
    screen.start(msg)
  }
}

class MazeGame extends GameScreen {
  constructor() {
    super()
  }

  onMove(dir, i) {
    this.setPos(vectorsAdd(this.currPos, this.MOVEMENTS[dir]) as [number, number])
    console.log(this.prevPos, this.currPos)
    this.update(i)
  }
}