"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../struct/command");
const screen_1 = require("../struct/components/screen");
const util_1 = require("../util");
class Maze extends command_1.Command {
    constructor() {
        super("maze");
    }
    exec(client, msg, args) {
        const screen = new MazeGame();
        screen.start(msg);
    }
}
exports.default = Maze;
class MazeGame extends screen_1.GameScreen {
    constructor() {
        super();
    }
    onMove(dir, i) {
        this.setPos((0, util_1.vectorsAdd)(this.currPos, this.MOVEMENTS[dir]));
        console.log(this.prevPos, this.currPos);
        this.update(i);
    }
}
