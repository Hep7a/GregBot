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
exports.ConfirmationComponentBuilder = void 0;
const util_1 = require("../../util");
const discord_js_1 = require("discord.js");
class ConfirmationComponentBuilder {
    onAccept(fn) {
        this.acceptFn = fn;
        return this;
    }
    onDecline(fn) {
        this.declineFn = fn;
        return this;
    }
    onTimeout(fn) {
        this.timeoutFn = fn;
        return this;
    }
    setMessage(msg) {
        this.msgContent = msg;
        return this;
    }
    setTarget(user) {
        this.target = user;
        return this;
    }
    setTimeout(ms) {
        this.timeout = ms;
        return this;
    }
    build(msg) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const acceptBtn = (0, util_1.createButton)("confirm-accept", "Accept", discord_js_1.ButtonStyle.Success);
            const declineBtn = (0, util_1.createButton)("confirm-decline", "Decline", discord_js_1.ButtonStyle.Danger);
            const row = new discord_js_1.ActionRowBuilder()
                .addComponents(acceptBtn, declineBtn);
            const response = yield msg.channel.send({
                content: this.msgContent,
                components: [row]
            });
            const resFilter = i => i.user.id === this.target.id;
            try {
                const confirmation = yield response.awaitMessageComponent({
                    filter: resFilter,
                    time: (_a = this.timeout) !== null && _a !== void 0 ? _a : 30000
                });
                switch (confirmation.customId) {
                    case "confirm-accept":
                        this.acceptFn();
                        break;
                    case "confirm-decline":
                        this.declineFn();
                        break;
                }
            }
            catch (e) {
                this.timeoutFn();
            }
        });
    }
}
exports.ConfirmationComponentBuilder = ConfirmationComponentBuilder;
