<template>
<div class="game-container" ref="gameContainer"></div>
<span class="game-title" v-if="game && started"> {{ game.cueLimit === 1 ? '一库解球' : game.cueLimit === 2 ? '两库解球' : '三库解球' }}</span>

<div class="tools">
  <span class="flex">
    <i class="iconfont icon-back" @click="exitGame"></i>
    <i class="iconfont icon-reset" @click="resetGame"></i>
  </span>
  <span class="flex">
    <i class="iconfont icon-taiqiu" @click="setMode('addBall')" :class="{'active': mode === 'addBall'}"></i>
    <i class="iconfont icon-Aim" @click="setMode('aim')" :class="{'active': mode === 'aim'}"></i>
  </span>
</div>
<i class="random-ball iconfont icon-random" v-if="mode === 'addBall'" @click="randomBall"></i>
<i class="show-aim-line iconfont icon-a-2-polyline" v-if="mode === 'aim' && aimed" @click="showAimLine()"></i>

<div class="game-rules" v-if="!started">
  <div class="card" @click="start(1)">
    <div class="title">一库解球</div>
  </div>
  <div class="card" @click="start(2)">
    <div class="title">两库解球</div>
  </div>
  <div class="card" @click="start(3)">
    <div class="title">三库解球</div>
  </div>
</div>

<div class="dialog-modal" v-if="showDialog">
  <div class="dialog">
    <div v-if="success" class="dialog-title success">成功</div>
    <div v-else class="dialog-title fail">失败</div>

    <div class="dialog-footter">
      <span v-if="!success" @click="showDialog = false">重试</span>
      <span @click="restartGame">再来一局</span>
    </div>
  </div>
</div>
</template>

<script setup lang='ts'>
import { Game } from './core/game'
import { onMounted } from 'vue'
import { ref } from 'vue'
import type { Ball } from './core/ball'
import { vec2 } from './core/vector'
import { BALL_RADIUS } from './common/const'

const gameContainer = ref<HTMLDivElement>()
let mode = ref('addBall')
let game: Game
let started = ref(false)
let aimed = ref(false)
let showDialog = ref(false)
let success = ref(false)

const start = (limit: number) => {
  game.cueLimit = limit
  mode.value = 'addBall'
  started.value = true
}

const exitGame = () => {
  game.reset()
  mode.value = 'addBall'
  started.value = false
}
const resetGame = () => {
  game.reset()
  mode.value = 'addBall'
}
const restartGame = () => {
  showDialog.value = false
  game.reset()
  mode.value = 'addBall'
}

const setMode = (m: string) => {
  mode.value = m
}
const showAimLine = () => {
  game.aimLineVisible = true
  showDialog.value = true
  success.value = game.calcAimLine().length == game.cueLimit + 1
}

const addBall = (x: number, y: number) => {
  const ballCount = game.balls.length
  const num = ballCount == 0 ? 0 : ballCount === 1 ? 8 : 3
  const ball = game.addBall(x, y, num)
  if (ball && num === 0) {
    game.cueBall = ball
  }
}
const randomBall = () => {
  const x = Math.random() * (game.innerWidth - BALL_RADIUS) + BALL_RADIUS / 2
  const y = Math.random() * (game.innerHeight - BALL_RADIUS) + BALL_RADIUS
  addBall(x, y)
}
  
onMounted(() => {
  let mousedown = false
  let mousemove = false
  let touchingBall: Ball | null = null
  let prevX = 0
  let prevY = 0

  const handleMouseDown = (x: number, y: number) => {
    mousedown = true
    mousemove = false
    prevX = x
    prevY = y
    touchingBall = game.getBallAtPoint(x, y) || null
  }
  const handleMouseMove = (x: number, y: number) => {
    if (mousedown) {
      if (mode.value === 'addBall' && touchingBall) {
        game.moveBall(touchingBall, (x - prevX) / game.scale, (y - prevY) / game.scale)
      } else if (mode.value === 'aim') {
        if (!game.aimAtPoint) {
          game.aimAtPoint = game.getRelativePosition(x, y)
        } else {
          const { x: x0, y: y0 } = game.getRelativePosition(prevX, prevY)
          const { x: x1, y: y1 } = game.getRelativePosition(x, y)
          const { x: xo, y: yo } = game.cueBall!
          const v0 = vec2(x0, y0).sub(xo, yo)
          const v1 = vec2(x1, y1).sub(xo, yo)
          const angle = v0.angle(v1.x, v1.y)
          const v = vec2(game.aimAtPoint.x, game.aimAtPoint.y).sub(xo, yo).rotate(angle).add(xo, yo)
          game.aimAtPoint = { x: v.x, y: v.y }
        }
        game.aimLineVisible = false
        aimed.value = true
      }
      prevX = x
      prevY = y
    }
    mousemove = true
  }
  const handleMouseUp = () => {
    if (!mousemove) {
      const { x, y } = game.getRelativePosition(prevX, prevY)
      if (mode.value === 'addBall') {
        const ballsCount = game.balls.length
        const num = ballsCount == 0 ? 0 : ballsCount === 1 ? 8 : 3
        const ball = game.addBall(x, y, num)
        if (ball) {
          if (num === 0) {
            game.cueBall = ball
          }
        }
      } else if (mode.value === 'aim' && !mousemove) {
        game.aimAtPoint = { x, y }
      }
    }
    
    mousedown = false
    mousemove = false
  }

  game = new Game(gameContainer.value!)
  game.resize(gameContainer.value!.clientWidth, gameContainer.value!.clientHeight)

  game.canvas.addEventListener('touchstart', (e) => {
    e.preventDefault()
    handleMouseDown(e.touches[0]!.clientX, e.touches[0]!.clientY)
  })
  game.canvas.addEventListener('touchmove', (e) => {
    e.preventDefault()
    handleMouseMove(e.touches[0]!.clientX, e.touches[0]!.clientY)
  })
  game.canvas.addEventListener('touchend', (e) => {
    e.preventDefault()
    handleMouseUp()
  })
  game.canvas.addEventListener('mousedown', (e) => handleMouseDown(e.clientX, e.clientY))
  game.canvas.addEventListener('mouseup', () => handleMouseUp())
  game.canvas.addEventListener('mousemove', (e) => handleMouseMove(e.clientX, e.clientY))
})
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100%;
}

.game-title {
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14px;
  color: #a5f;
  line-height: 50px;
}

.tools {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px;
  display: flex;
  justify-content: space-between;
}
.flex {
  display: flex;
  align-items: center;
  gap: 20px;
}
.tools i {
  cursor: pointer;
  font-size: 14px;
}

.random-ball, .show-aim-line {
  position: fixed;
  bottom: 20px;
  right: 20px;
  cursor: pointer;
  font-size: 18px;
}

.tools i.active {
  color: #00f;
}

.game-rules {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  font-size: 12px;
  padding: 20px;
  background: linear-gradient(-30deg, #5af, #7a5);
}

.game-rules .card {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 15px;
  height: 100px;
}
.game-rules .card .title {
  font-size: 18px;
  font-weight: bold;
  color: #fff;
}
.game-rules .card:first-child {
  background: linear-gradient(-50deg, #0088ff, #0000ff);
}
.game-rules .card:nth-child(2) {
  background: linear-gradient(-50deg, #a93, #8a3);
}
.game-rules .card:nth-child(3) {
  background: linear-gradient(-50deg, #fa9, #f80);
}

.dialog-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dialog {
  width: 80vw;
  background: rgba(255,255,255,.6);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
.dialog-title {
  font-size: 18px;
  font-weight: bold;
  padding: 0 30px;
  color: #000;
}
.dialog-title.success {
  color: #00f;
}
.dialog-title.fail {
  color: #f00;
}
.dialog-footter {
  display: flex;
  gap: 10px;
}
.dialog-footter span {
  cursor: pointer;
  font-size: 14px;
}
.dialog-footter span.active {
  color: #00f;
}
</style>
