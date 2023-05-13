"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("../struct/command");
const util_1 = require("../util");
const screen_1 = require("../struct/components/screen");
class Snake extends command_1.Command {
    constructor() {
        super("snake");
    }
    exec(client, msg, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const screen = new SnakeGame(client.ws.ping);
            screen.start(msg);
        });
    }
}
exports.default = Snake;
class SnakeGame extends screen_1.GameScreen {
    constructor(ping) {
        super(false);
        this.points = 0;
    }
    get snakeHead() {
        return this.snake[this.snake.length - 1];
    }
    initSnake() {
        this.snake = [
            [2, 3],
            [3, 3],
            [4, 3]
        ];
        this.setPixel(this.snakeHead, screen_1.ScreenKeys.GREEN);
        this.setPixel(this.snake[1], screen_1.ScreenKeys.YELLOW);
        this.setPixel(this.snake[0], screen_1.ScreenKeys.YELLOW);
    }
    start(msg) {
        const _super = Object.create(null, {
            start: { get: () => super.start }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.count = 0;
            this.initSnake();
            this.generateApple();
            yield _super.start.call(this, msg);
        });
    }
    render() {
        return `Points: ${this.points}\n` + super.render();
    }
    renderFrames(interaction, sent) {
        return __awaiter(this, void 0, void 0, function* () {
            const count = this.count;
            if (!this.running) {
                yield this.gameOver(interaction);
                return;
            }
            const pos = (0, util_1.vectorsAdd)(this.snakeHead, this.MOVEMENTS[this.currDir]);
            console.log("update pos", this.count);
            yield this.handlePos(pos, interaction);
            yield this.update(interaction, sent, "renderFrames", this.count);
            if (!sent)
                sent = true;
            yield (0, util_1.sleep)(800);
            if (count !== this.count)
                return;
            console.log("next frame", this.count);
            this.renderFrames(interaction, sent);
        });
    }
    onMove(dir, i) {
        this.count++;
        this.currDir = dir;
        this.renderFrames(i);
    }
    handlePos(pos, i) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isOOB(pos) || this.isInSnake(pos)) {
                this.end();
                this.setPixel(this.snakeHead, screen_1.ScreenKeys.EXPLODE);
                return;
            }
            this.snake.push(pos);
            let deleted;
            if ((0, util_1.vectorsEqual)(this.snakeHead, this.applePos)) {
                this.onAppleEaten();
            }
            else
                deleted = this.snake.shift();
            this.updateSnake(deleted);
        });
    }
    updateSnake(deleted) {
        if (deleted)
            this.setPixel(deleted, screen_1.ScreenKeys.EMPTY);
        this.setPixel(this.snakeHead, screen_1.ScreenKeys.GREEN);
        for (let i = 0; i < this.snake.length - 1; i++) {
            this.setPixel(this.snake[i], screen_1.ScreenKeys.YELLOW);
        }
    }
    generateApple() {
        let applePos = this.currPos;
        let currKey = screen_1.ScreenKeys.YELLOW;
        while (currKey !== screen_1.ScreenKeys.EMPTY && this.isInSnake(applePos)) {
            const posX = (0, util_1.randomize)(this.grid.length);
            const posY = (0, util_1.randomize)(this.grid[posX].length);
            currKey = this.grid[posX][posY];
            applePos = [posX, posY];
        }
        this.applePos = applePos;
        this.setPixel(applePos, screen_1.ScreenKeys.RED);
    }
    isOOB(pos) {
        return pos[0] < 0 || pos[0] > this.grid.length - 1 || pos[1] < 0 || pos[1] > this.grid[pos[0]].length - 1;
    }
    onAppleEaten() {
        this.points++;
        this.generateApple();
    }
    isInSnake(pos) {
        const y = this.snake.filter(x => (0, util_1.vectorsEqual)(x, pos));
        return y.length > 0;
    }
    gameOver(i) {
        return __awaiter(this, void 0, void 0, function* () {
            this.update(i, true, "gameOver", this.count);
            i.followUp(`You scored ${this.points} points!`);
            this.points = 0;
        });
    }
}
