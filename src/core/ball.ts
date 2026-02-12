import { BALL_RADIUS, BALL_COLOR } from "../common/const";

export class Ball {
  radius = BALL_RADIUS
  x: number
  y: number
  number: string
  color: string

  constructor(x: number, y: number, number: number) {
    if (number > 15) {
      throw new Error('number must be less than 16')
    }
    
    this.x = x
    this.y = y
    this.number = number.toString()
    this.color = BALL_COLOR[number]!
  }

  render (ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius / 2, 0, 2 * Math.PI)
    ctx.fillStyle = this.color
    ctx.fill()
  }
}