import { ButtonStyle, ButtonBuilder, User, ActionRowBuilder, Message } from "discord.js"

export function createButton(id:string, name?:string, style?: string | ButtonStyle) {
    const dict = {
      "RED": ButtonStyle.Danger,
      "BLUE": ButtonStyle.Primary,
      "GREEN": ButtonStyle.Success,
      "GRAY": ButtonStyle.Secondary
    }

    if (!style) style = ButtonStyle.Primary
  
    return new ButtonBuilder()
     .setLabel(name ?? id)
     .setStyle(typeof style === "string" ? dict[style] : style)
     .setCustomId(id)
}

export function randomize(range:number,base?:number) {
  if (!base) base = 0
  return Math.floor(Math.random() * range) + base
}

export function vectorsEqual(a: number[],b: number[]): boolean {
  if (a.length !== b.length) return false
  let equal = true
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      equal = false
      break
    }
  }
  return equal
}

export function vectorsAdd(a: number[],b: number[]): number[] {
  if (a.length !== b.length) return
  let result = new Array(a.length)
  for (let i=0; i<a.length;i++) {
    result[i] = a[i] + b[i]
  }
  return result
}

export function sleep(ms:number) {
  return new Promise(x => setTimeout(x, ms))
}

export type FunctionType = (...args: any[]) => void | Promise<void>