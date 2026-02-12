<template>
<div class="game-container" ref="gameContainer"></div>
</template>

<script setup lang='ts'>
import { Game } from './core/game'
import { onMounted } from 'vue'
import { ref } from 'vue'
import type { Ball } from './core/ball'

const gameContainer = ref<HTMLDivElement>()
  
onMounted(() => {
  function getTouchingBall (x: number, y: number) {
    const p = game.getRelativePosition(x, y)
    return game.balls.find((ball) => {
      const dx = p.x - ball.x
      const dy = p.y - ball.y
      return dx * dx + dy * dy <= ball.radius * ball.radius / 4
    })
  }

  const game = new Game(gameContainer.value!)
  let ballsCount = 0
  let mousedown = false
  let mousemove = false
  let touchingBall: Ball | null = null
  let prevX = 0
  let prevY = 0

  game.resize(gameContainer.value!.clientWidth, gameContainer.value!.clientHeight)

  game.canvas.addEventListener('touchstart', (e) => {
    mousemove = false
    e.preventDefault()
    prevX = e.touches[0]!.clientX
    prevY = e.touches[0]!.clientY
    touchingBall = getTouchingBall(e.touches[0]!.clientX, e.touches[0]!.clientY) || null
  })
  game.canvas.addEventListener('touchmove', (e) => {
    mousemove = true
    e.preventDefault()
    if (touchingBall) {
      const dx = (e.touches[0]!.clientX - prevX) / game.scale
      const dy = (e.touches[0]!.clientY - prevY) / game.scale
      touchingBall.x = Math.max(0, Math.min(game.innerWidth - touchingBall.radius, touchingBall.x + dx))
      touchingBall.y = Math.max(0, Math.min(game.innerHeight - touchingBall.radius, touchingBall.y + dy))
      prevX = e.touches[0]!.clientX
      prevY = e.touches[0]!.clientY
    } else {
      game.aimAtPoint = game.getRelativePosition(e.touches[0]!.clientX, e.touches[0]!.clientY)
    }
  })
  game.canvas.addEventListener('touchend', (e) => {
    e.preventDefault()
    if (!mousemove) {
      const num = ballsCount == 0 ? 0 : ballsCount === 1 ? 8 : 3
      const { x, y } = game.getRelativePosition(e.touches[0]!.clientX, e.touches[0]!.clientY)
      const ball = game.addBall(x, y, num)
      if (num === 0) {
        game.cueBall = ball
      }
      ballsCount++
    }
    mousemove = false
  })

  game.canvas.addEventListener('mousedown', (e) => {
    mousedown = true
    mousemove = false
    prevX = e.clientX
    prevY = e.clientY
    touchingBall = getTouchingBall(e.clientX, e.clientY) || null
  })

  game.canvas.addEventListener('mouseup', (e) => {
    if (!mousemove) {
      const num = ballsCount == 0 ? 0 : ballsCount === 1 ? 8 : 3
      const { x, y } = game.getRelativePosition(e.clientX, e.clientY)
      const ball = game.addBall(x, y, num)
      if (num === 0) {
        game.cueBall = ball
      }
      ballsCount++
    }
    mousedown = false
    mousemove = false
  })

  game.canvas.addEventListener('mousemove', (e) => {
    if (mousedown) {
      if (touchingBall) {
        const dx = (e.clientX - prevX) / game.scale
        const dy = (e.clientY - prevY) / game.scale
        touchingBall.x = Math.max(0, Math.min(game.innerWidth - touchingBall.radius, touchingBall.x + dx))
        touchingBall.y = Math.max(0, Math.min(game.innerHeight - touchingBall.radius, touchingBall.y + dy))
        prevX = e.clientX
        prevY = e.clientY
      } else {
        game.aimAtPoint = game.getRelativePosition(e.clientX, e.clientY)
      }
      mousemove = true
    }
  })
})
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100%;
}
</style>
