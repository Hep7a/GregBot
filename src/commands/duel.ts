import { BotClient } from "../client"
import { Command } from "../struct/command"
import { Message, ActionRowBuilder, ButtonBuilder, ComponentType, ButtonStyle, ButtonInteraction, User } from "discord.js"
import { createButton, randomize } from "../util"
import { ConfirmationComponentBuilder } from "../struct/components/confirm"

export default class Duel extends Command {
  constructor() {
    super("duel")
  }

  async exec(client: BotClient, msg: Message, args: string[]) {
    const player = msg.author
    const opp = msg.mentions.users.first()
    console.log(opp)
    if (!opp || opp?.bot) {
      msg.channel.send("idk who you're tryna challenge, so here's big black barry")
      const game = new DuelGame(player)
      game.start(msg)
    } else {
      const confirm = new ConfirmationComponentBuilder()
        .setMessage(`<@${opp.id}>, <@${msg.author.id}> has challenged you! Do you accept?`)
        .setTarget(opp)
        .onAccept(() => {
          msg.channel.send({
            content: "Opponent accepted, starting game..."
          })
          const game = new DuelGame(player, opp)
          game.start(msg)
        })
        .onDecline(() => {
          msg.channel.send({
            content: "Opponent declined, game cancelled."
          })
        })
        .onTimeout(() => {
          msg.channel.send({
            content: "No response, game cancelled."
          })
        })
        .build(msg)
    }
  }
}

class DuelGame {
  private STATS = {
    atk: 10,
    hp: 50
  }
  
  private CHANCES = [
    "hp:+10",
    "hp:-5",
    "atk:+10",
    "atk:+5",
    "hp:-25",
    "hp:+20"
  ]

  player;
  opp;
  playerTurn: boolean;
  winner;
  aiFight: boolean = false

  get currPlayer() {
    if (this.aiFight) return this.player
    else return this.playerTurn ? this.player : this.opp
  }

  get otherPlayer() {
    if (this.aiFight) return this.opp
    return this.playerTurn ? this.player : this.opp
  }

  constructor(player: User, opp?: User) {
    this.player = Object.assign(this.STATS, {name: player.username})
    if (!opp) {
      this.aiFight = true
      this.CHANCES.push("hp:+999")
      this.CHANCES.push("atk:+999")
      this.CHANCES.push("hp:+70")
      this.opp = {
        name: "big black barry",
        atk: 69,
        hp: 420
      }
    } else {
      this.opp = Object.assign(this.STATS, {name: opp.username})
    }
    
    this.playerTurn = randomize(2) === 1 ? true : false
    this.winner = null
  }

  start(msg: Message) {
    msg.channel.send(`${this.player.name}'s Health: ${this.player.hp}HP\n${this.opp.name}'s Health: ${this.opp.hp}HP'`)
    this.doMove(msg)
  }
  
  async doMove(msg: Message | ButtonInteraction) {
    const response = await msg.channel.send({
      content: `${this.currPlayer.name}'s turn:`,
      components: [this.generateActions()]
    })
    const resFilter = i => i.user.username === this.currPlayer.name
    try {
      const i = await response.awaitMessageComponent({
        componentType: ComponentType.Button,
        filter: resFilter,
        time: 30_000
      })
      this.onActionClick(i)
    } catch (e) {
      msg.channel.send(`${this.currPlayer.name} was too indecisive, and lost health.`)
      this.applyAction("hp:-5", this.currPlayer)
    }
  }
  
  generateActions() {
    const atkBtn = createButton("duel-atk").setLabel("Attack")
    const healBtn = createButton("duel-heal").setLabel("Heal")
    const chanceBtn = createButton("duel-chance").setLabel("Chance")
    const actionsRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(atkBtn, healBtn, chanceBtn)
    return actionsRow
  }

  async onActionClick(i: ButtonInteraction) {
    switch (i.customId) {
      case "duel-atk":
          i.reply({
            content: this.applyAction(`hp:-${this.currPlayer.atk}`, this.otherPlayer)
          })
          break;
      case "duel-heal":
          i.reply({
            content: this.applyAction("hp:+5", this.currPlayer)
          })
          break;
      case "duel-chance":
          const response = await i.reply({
            content: `${this.currPlayer.name}, take your pick.`,
            components: [this.generateChances()],
            ephemeral: true
          })

          const resFilter = i => i.user.username === this.currPlayer.name
          try {
            const chanceInteraction = await response.awaitMessageComponent({
              componentType: ComponentType.Button,
              filter: resFilter,
              time: 30_000
            })
            i.channel.send("Chance time!")
              this.onChanceClick(chanceInteraction)
          } catch (e) {
            i.update({
              content: "Guess you don't wanna take the risk."
            })
          }
          break;
    }
    this.sendStats(i)
    this.checkWin(i)
    if (this.winner !== null) return
    if (this.aiFight) this.aiMove(i)
    else this.doMove(i)
  }

  sendStats(i: ButtonInteraction) {
    i.channel.send(`${this.player.name}'s Health: ${this.player.hp}HP\n${this.opp.name}'s Health: ${this.opp.hp}HP`)
  }
  
  aiMove(i: ButtonInteraction) {
    this.applyAction(`hp:-${this.opp.atk}`, this.player)
    i.channel.send(`barry slams you with his mile long schlong, dealing ${this.opp.atk} damage`)
    this.sendStats(i)
    this.checkWin(i)
    if (this.winner !== null) return
    this.doMove(i)
  }
  
  applyAction(action, player) {
    let [prop, stat] = action.split(":")
    stat = parseInt(stat)
    player[prop] += stat
    const convert = {
      "atk": "Attack",
      "hp": "Health"
    }
    const propStr = convert[prop]
    const sign = stat >= 0 ? "increased" : "decreased"
    const amount = Math.abs(stat)
    return `${player.name}'s ${propStr} ${sign} by ${amount}.`
  }

  generateChances() {
    let buttons = []
    for (let i=1; i<=3; i++) {
      buttons.push(createButton(`duel-chance-${i}`).setLabel(i.toString()))
    }
    return new ActionRowBuilder<ButtonBuilder>()
      .addComponents(...buttons)
  }

  onChanceClick(i: ButtonInteraction) {
    const randomChance = this.CHANCES[randomize(this.CHANCES.length)]
    const action = this.applyAction(randomChance, this.currPlayer)
    i.reply({
      content: action
    })
  }

  checkWin(i: ButtonInteraction) {
    if (this.player.hp <= 0 || this.opp.hp <= 0) {
      this.winner = Math.max(this.player.hp, this.opp.hp) === this.player.hp ? this.player.name : this.opp.name
      if (this.aiFight) i.channel.send(this.winner === this.player.name ? "how the fuck did you beat barry" : "barry wins, next time challenge a real person smh")
      else i.channel.send({
          content: `Winner is ${this.winner}.`
      })
      return
    } else {
      this.playerTurn = !this.aiFight ? !this.playerTurn : this.playerTurn
    }
  }
}