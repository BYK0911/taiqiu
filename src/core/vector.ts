
export class Vec2  {
  x: number
  y: number
  
  constructor (x: number, y: number) {
    this.x = x
    this.y = y
  }

  transform (m: number[]) {
    const { x, y } = this
    const [a, b, c, d, e, f] = m
    this.x = x * a! + y * c! + e!
    this.y = x * b! + y * d! + f!

    return this
  }
  
  add (x: number, y: number) {
    this.x += x
    this.y += y

    return this
  }

  sub (x: number, y: number) {
    this.x -= x
    this.y -= y
    
    return this
  }

  lengthSquare () {
    return this.x * this.x + this.y * this.y
  }
 
  length () {
    return Math.sqrt(this.lengthSquare())
  }

  normalize () {
    const len = this.length()
    this.x /= len
    this.y /= len
    return this
  }

  negate () {
    this.x *= -1
    this.y *= -1
    return this
  }

  mul (x: number, y: number) {
    this.x *= x
    this.y *= y
    return this
  }

  div (x: number, y: number) {
    this.x /= x
    this.y /= y
    return this
  }

  scale (n: number) {
    this.x *= n
    this.y *= n
    return this
  }

  dot (x: number, y: number) {
    return this.x * x + this.y * y
  }

  min (x: number, y: number) {
    return [Math.min(this.x, x), Math.min(this.y, y)]
  }

  max (x: number, y: number) {
    return [Math.max(this.x, x), Math.max(this.y, y)]
  }

  rotate (rad: number): this
  rotate (rad: number, x: number, y: number): this
  rotate (rad: number, x = 0, y = 0) {
    // 数学里的y轴是向上的，canvas里的y轴是向下的，所以rad要取反
    const c = Math.cos(-rad)
    const s = Math.sin(-rad)

    return this.sub(x, y).transform([c, -s, s, c, 0, 0] as any).add(x, y)
  }

  cross (x: number, y: number) {
    return this.x * y - x * this.y
  }

  angle (x = 1, y = 0): number {
    const n = this.length()
    const n2 = Math.sqrt(x * x + y * y);
    if (n * n2 === 0) return 0
    const d = this.dot(x, y);
    const rad = Math.acos(Math.min(1, Math.max(d / n / n2, -1)));
    const dir = this.cross(x, y) > 0 ? 1 : -1
    
    return rad * dir;
  }

  flip(x0: number, y0: number, x1: number, y1: number) {
    const { x, y } = this;
    const [m, n] = [x - x0, y - y0];
    const [p, q] = [x1 - x0, y1 - y0];
    if (p !== 0 || q !== 0){
      const d = p * p + q * q;
      this.x = (m * (p * p - q * q) + 2 * n * p * q) / d + x0;
      this.y = (n * (q * q - p * p) + 2 * m * p * q) / d + y0;
    }
    return this;
  }
}

export function vec2 (x: number, y: number) {
  return new Vec2(x, y)
}