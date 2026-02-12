import { TABLE_OUTTER_WIDTH, TABLE_OUTTER_HEIGHT, TABLE_INNER_WIDTH, TABLE_INNER_HEIGHT, BALL_RADIUS } from "../common/const";
import { Ball } from "./ball";
import { isPointOnSegment } from "./collision";

export class Game {
  width = 0
  height = 0
  x = 0
  y = 0
  scale = 1
  rotation = 0
  dpi = window.devicePixelRatio || 1
  canvas = document.createElement('canvas')
  ctx = this.canvas.getContext('2d')!
  dom: HTMLElement
  aimAtPoint: { x: number, y: number } | null = null
  cueBall: Ball | null = null
  balls: Ball[] = []

  outterWidth = TABLE_OUTTER_WIDTH
  outterHeight = TABLE_OUTTER_HEIGHT
  innerWidth = TABLE_INNER_WIDTH
  innerHeight = TABLE_INNER_HEIGHT
  _path: Path2D | null = null

  get path () {
    if (!this._path) {
      const path = this._path = new Path2D()
      const r = 100
      const w = this.outterWidth
      const h = this.outterHeight
      path.moveTo(r, 0)
      path.lineTo(w - r, 0)
      path.arcTo(w, 0, w, r, r)
      path.lineTo(w, h - r)
      path.arcTo(w, h, w - r, h, r)
      path.lineTo(r, h)
      path.arcTo(0, h, 0, h - r, r)
      path.lineTo(0, r)
      path.arcTo(0, 0, r, 0, r)
      path.closePath()
    }
    return this._path!
  }

  constructor (dom: HTMLElement) {
    this.dom = dom
    this.resize(dom.clientWidth, dom.clientHeight)
    dom.appendChild(this.canvas)
    this.canvas.style.verticalAlign = 'middle'

    this.lunch()
  }

  lunch () {
    this.render()
    requestAnimationFrame(this.lunch.bind(this))
  }

  render () {
    const ctx = this.ctx

    ctx.save()
    ctx.clearRect(0, 0, this.width, this.height)
    ctx.translate(this.x, this.y)
    ctx.scale(this.scale, this.scale)
    ctx.rotate(this.rotation)
    const x = (this.outterWidth - this.innerWidth) / 2
    const y = (this.outterHeight - this.innerHeight) / 2
    ctx.translate(-x, -y)
    ctx.fillStyle = '#645'
    ctx.fill(this.path)
    ctx.translate(x, y)
    ctx.fillStyle = '#0a0'
    ctx.fillRect(0, 0, this.innerWidth, this.innerHeight)
    this.balls.forEach(ball => {
      ball.render(ctx)
    })

    if (this.cueBall && this.aimAtPoint) {
      this.drawAimLine(ctx)
    }
    ctx.restore()
  }

  drawAimLine (ctx: CanvasRenderingContext2D) {
    if (!this.cueBall || !this.aimAtPoint) return

    const path: { x: number, y: number }[] = []
    let start: { x: number, y: number } = this.cueBall
    let end: { x: number, y: number } = this.aimAtPoint
    let n = -1
    while (n++ < 5) {
      const ball = this.getBallOnLine(start, end, n == 0)
      if (ball) {
        path.push(ball)
        break
      } else {
        const crossPoint = this.getEdgeCrossPoint(start, end)
        path.push(crossPoint)
        const _endX = crossPoint.x * 2 - start.x
        const _endY = crossPoint.y * 2 - start.y
        start = crossPoint
        end = {
          x: crossPoint.x === 0 ? -_endX : crossPoint.x === this.innerWidth ? this.innerWidth * 2 - _endX : _endX,
          y: crossPoint.y === 0 ? -_endY : crossPoint.y === this.innerHeight ? this.innerHeight * 2 - _endY : _endY
        }
      }
    }
    ctx.save()
    ctx.beginPath()
    ctx.setLineDash([5 / this.scale, 5 / this.scale])
    ctx.lineWidth = 1 / this.scale
    ctx.strokeStyle = '#FFF'
    ctx.moveTo(this.cueBall.x, this.cueBall.y)
    path.forEach(point => {
      ctx.lineTo(point.x, point.y)
    })
    ctx.stroke()
    ctx.restore()
  }

  getBallOnLine (p1: { x: number, y: number }, p2: { x: number, y: number }, start = false) {
    return this.balls.find(ball => {
      if (ball === this.cueBall) return false
      return isPointOnSegment(p1.x, p1.y, p2.x, p2.y, ball.x, ball.y,  BALL_RADIUS / 2, start)
    })
  }

  getEdgeCrossPoint (p1: { x: number, y: number }, p2: { x: number, y: number }) {
    if (p2.x === p1.x) {
      return { x: p1.x, y: p2.y > p1.y ? this.innerHeight : 0 }
    } else if (p2.y === p1.y) {
      return { x: p2.x > p1.x ? this.innerWidth : 0, y: p1.y }
    } else {
      const dx = p2.x - p1.x
      const x = dx > 0 ? this.innerWidth : 0
      const y = (x - p1.x) * (p2.y - p1.y) / dx + p1.y

      if (y >= 0 && y <= this.innerHeight) {
        return { x, y }
      } else {
        const y = p2.y > p1.y ? this.innerHeight : 0
        const x = (y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x
        return { x, y }
      }
    }
  }

  resize (width: number, height: number) {
    if (height > width) {
      this.outterHeight = TABLE_OUTTER_WIDTH
      this.outterWidth = TABLE_OUTTER_HEIGHT
      this.innerHeight = TABLE_INNER_WIDTH
      this.innerWidth = TABLE_INNER_HEIGHT
    }
    const s = this.scale = Math.min(width / this.outterWidth, height / this.outterHeight) * 0.8
    this.x = (width - this.outterWidth * s) / 2
    this.y = (height - this.outterHeight * s) / 2
    this.canvas.width = width * this.dpi
    this.canvas.height = height * this.dpi
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
    this.width = width
    this.height = height
    this.ctx.scale(this.dpi, this.dpi)

  }

  addBall (x: number, y: number, number: number) {
    const ball = new Ball(x, y, number)
    this.balls.push(ball)
    return ball
  }

  getRelativePosition (x: number, y: number) {
    return {
      x: (x - this.x) / this.scale,
      y: (y - this.y) / this.scale,
    }
  }
}