import { FunctionType, createButton } from "../../util"
import { User, Message, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js"

export class ConfirmationComponentBuilder {
  msgContent: string
  target: User
  timeout: number
  acceptFn: FunctionType
  declineFn: FunctionType
  timeoutFn: FunctionType
  onAccept(fn: FunctionType) {
    this.acceptFn = fn
    return this
  }
  onDecline(fn: FunctionType) {
    this.declineFn = fn
    return this
  }
  onTimeout(fn: FunctionType) {
    this.timeoutFn = fn
    return this
  }
  setMessage(msg: string) {
    this.msgContent = msg
    return this
  }
  setTarget(user: User) {
    this.target = user
    return this
  }
  setTimeout(ms: number) {
    this.timeout = ms
    return this
  }
  async build(msg: Message) {
    const acceptBtn = createButton("confirm-accept", "Accept", ButtonStyle.Success)
    const declineBtn = createButton("confirm-decline", "Decline", ButtonStyle.Danger)

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(acceptBtn, declineBtn)
    
    const response = await msg.channel.send({
      content: this.msgContent,
      components: [row]
    })
    
    const resFilter = i => i.user.id === this.target.id
    try {
      const confirmation = await response.awaitMessageComponent({
        filter: resFilter,
        time: this.timeout ?? 30_000
      })

      switch (confirmation.customId) {
        case "confirm-accept":
            this.acceptFn()
            break;
        case "confirm-decline":
            this.declineFn()
            break;
      }
    } catch (e) {
      this.timeoutFn()
    }
  }
}