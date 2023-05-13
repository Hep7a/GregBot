"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = exports.vectorsAdd = exports.vectorsEqual = exports.randomize = exports.createButton = void 0;
const discord_js_1 = require("discord.js");
function createButton(id, name, style) {
    const dict = {
        "RED": discord_js_1.ButtonStyle.Danger,
        "BLUE": discord_js_1.ButtonStyle.Primary,
        "GREEN": discord_js_1.ButtonStyle.Success,
        "GRAY": discord_js_1.ButtonStyle.Secondary
    };
    if (!style)
        style = discord_js_1.ButtonStyle.Primary;
    return new discord_js_1.ButtonBuilder()
        .setLabel(name !== null && name !== void 0 ? name : id)
        .setStyle(typeof style === "string" ? dict[style] : style)
        .setCustomId(id);
}
exports.createButton = createButton;
function randomize(range, base) {
    if (!base)
        base = 0;
    return Math.floor(Math.random() * range) + base;
}
exports.randomize = randomize;
function vectorsEqual(a, b) {
    if (a.length !== b.length)
        return false;
    let equal = true;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            equal = false;
            break;
        }
    }
    return equal;
}
exports.vectorsEqual = vectorsEqual;
function vectorsAdd(a, b) {
    if (a.length !== b.length)
        return;
    let result = new Array(a.length);
    for (let i = 0; i < a.length; i++) {
        result[i] = a[i] + b[i];
    }
    return result;
}
exports.vectorsAdd = vectorsAdd;
function sleep(ms) {
    return new Promise(x => setTimeout(x, ms));
}
exports.sleep = sleep;
