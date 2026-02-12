const {
  isPointInPath,
  isPointInStroke
} = (() => {
  const ctx = document.createElement('canvas').getContext('2d')!
  return {
    isPointInPath: (path: Path2D, x: number, y: number, threshold = 5) => {
      ctx.lineWidth = Math.max(threshold, 5)
      return ctx.isPointInPath(path, x, y)
    },
    isPointInStroke: (path: Path2D, x: number, y: number, threshold = 5) => {
      ctx.lineWidth = Math.max(threshold, 5)
      return ctx.isPointInStroke(path, x, y)
    }
  }
})()

export {
  isPointInPath,
  isPointInStroke
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}
export function isRectsIntersects(rect1: Rect, rect2: Rect) {
  return !(rect1.x + rect1.width < rect2.x || rect1.x > rect2.x + rect2.width || rect1.y + rect1.height < rect2.y || rect1.y > rect2.y + rect2.height)
}
export function isRectContainsRect(rect1: Rect, rect2: Rect) {
  return rect1.x <= rect2.x && rect1.x + rect1.width >= rect2.x + rect2.width && rect1.y <= rect2.y && rect1.y + rect1.height >= rect2.y + rect2.height
}

export function isPointInRect(rect: Rect, x: number, y: number) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height
}


export function isPointOnSegment(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x: number,
  y: number,
  d: number,
  start: boolean = false
): boolean {
  const v1 = [x1 - x0, y1 - y0];
  const v2 = [x - x0, y - y0];

  // 向量的模
  const n1 = Math.sqrt(v1[0]! * v1[0]! + v1[1]! * v1[1]!);
  const n2 = Math.sqrt(v2[0]! * v2[0]! + v2[1]! * v2[1]!);

  if (n1 === 0) return n2 <= d;

  // 点 (x, y) 到线段 (x0, y0)(x1, y1) 的距离
  const cross = Math.abs(v1[0]! * v2[1]! - v2[0]! * v1[1]!) / n1;
  if (cross > d) return false;

  // 向量v2在v1上的投影
  const mul = (v1[0]! * v2[0]! + v1[1]! * v2[1]!) / n1;
  
  return !start ||  mul >= -d
}

export function isPointOnLine (points: number[], x: number, y: number, d = 5): boolean {
  for (let i = 0; i < points.length - 2; i += 2) {
    const x0 = points[i]!;
    const y0 = points[ i + 1]!;
    const x1 = points[i + 2]!;
    const y1 = points[i + 3]!;
    if (isPointOnSegment(x0, y0, x1, y1, x, y, d)) {
      return true;
    }
  }

  return false;
}
