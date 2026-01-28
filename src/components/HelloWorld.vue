<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const wrapperRef = ref(null)
const canvasRef = ref(null)

let resizeObserver = null
let rafId = 0
let startTs = 0
let scene = null

function rand(seed) {
  let t = seed + 0x6d2b79f5
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

function buildScene(w, h) {
  const base = Math.floor(w * 13 + h * 37)

  const clouds = Array.from({ length: 6 }).map((_, i) => {
    const r1 = rand(base + i * 17)
    const r2 = rand(base + i * 17 + 1)
    const r3 = rand(base + i * 17 + 2)
    const scale = 0.65 + r1 * 1.1
    return {
      x: r2 * (w + 320) - 160,
      y: 40 + r3 * (h * 0.32),
      scale,
      speed: (12 + r1 * 28) * (0.6 + (1.2 - scale) * 0.4)
    }
  })

  const sparkles = Array.from({ length: 22 }).map((_, i) => {
    const r1 = rand(base + 200 + i * 9)
    const r2 = rand(base + 200 + i * 9 + 1)
    const r3 = rand(base + 200 + i * 9 + 2)
    return {
      x: r1 * w,
      y: r2 * h * 0.55,
      r: 0.6 + r3 * 1.6,
      a: 0.04 + r2 * 0.08,
      p: r1 * Math.PI * 2
    }
  })

  const hills = [
    { y: h * 0.70, a: 0.55, c1: '#dfe7f3', c2: '#cfd9ea' },
    { y: h * 0.77, a: 0.75, c1: '#c7d2e7', c2: '#b8c6de' }
  ]

  return { clouds, sparkles, hills }
}

function drawPilot(ctx, w, h, t, droneX, droneY, scale) {
  const ps = scale * 1.15
  const groundY = h * 0.86
  const px = w * 0.22
  const sway = Math.sin(t * 0.7) * 2 * ps
  const py = groundY + sway

  function roundRectPath(x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2))
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + width, y, x + width, y + height, r)
    ctx.arcTo(x + width, y + height, x, y + height, r)
    ctx.arcTo(x, y + height, x, y, r)
    ctx.arcTo(x, y, x + width, y, r)
    ctx.closePath()
  }

  ctx.save()
  const g = ctx.createLinearGradient(0, groundY - 90 * ps, 0, h)
  g.addColorStop(0, 'rgba(255,255,255,0)')
  g.addColorStop(0.45, 'rgba(210,226,244,0.35)')
  g.addColorStop(1, 'rgba(173,196,225,0.55)')
  ctx.fillStyle = g
  ctx.fillRect(0, groundY - 90 * ps, w, h - (groundY - 90 * ps))
  ctx.restore()

  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.14)'
  ctx.beginPath()
  ctx.ellipse(px, groundY + 18 * ps, 46 * ps, 10 * ps, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const headR = 8.5 * ps
  const bodyH = 44 * ps
  const bodyW = 24 * ps
  const legH = 34 * ps

  const neckY = py - bodyH - headR * 1.3
  const bodyTopY = py - bodyH
  const ctrlX = px + 30 * ps
  const ctrlY = bodyTopY + 18 * ps

  ctx.save()
  const skin = ctx.createLinearGradient(px, neckY - headR, px, neckY + headR)
  skin.addColorStop(0, '#2f3a4d')
  skin.addColorStop(1, '#222a38')
  ctx.fillStyle = skin
  ctx.beginPath()
  ctx.arc(px, neckY, headR, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  ctx.save()
  const jacket = ctx.createLinearGradient(px, bodyTopY, px, py)
  jacket.addColorStop(0, '#2f3a4d')
  jacket.addColorStop(1, '#1f2633')
  ctx.fillStyle = jacket
  ctx.beginPath()
  roundRectPath(px - bodyW / 2, bodyTopY, bodyW, bodyH, 8 * ps)
  ctx.fill()
  ctx.globalAlpha = 0.35
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  roundRectPath(px - bodyW / 2 + 3 * ps, bodyTopY + 4 * ps, bodyW * 0.35, bodyH * 0.85, 8 * ps)
  ctx.fill()
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = '#1f2633'
  ctx.lineWidth = 7 * ps
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(px - 8 * ps, py)
  ctx.lineTo(px - 12 * ps, py + legH)
  ctx.moveTo(px + 8 * ps, py)
  ctx.lineTo(px + 12 * ps, py + legH)
  ctx.stroke()
  ctx.strokeStyle = '#2f3a4d'
  ctx.lineWidth = 8 * ps
  ctx.beginPath()
  ctx.moveTo(px - 12 * ps, py + legH)
  ctx.lineTo(px - 18 * ps, py + legH + 2 * ps)
  ctx.moveTo(px + 12 * ps, py + legH)
  ctx.lineTo(px + 20 * ps, py + legH + 2 * ps)
  ctx.stroke()
  ctx.restore()

  const elbowX = px + 16 * ps
  const elbowY = bodyTopY + 22 * ps
  ctx.save()
  ctx.strokeStyle = '#1f2633'
  ctx.lineWidth = 7 * ps
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(px + 2 * ps, bodyTopY + 16 * ps)
  ctx.lineTo(elbowX, elbowY)
  ctx.lineTo(ctrlX - 4 * ps, ctrlY)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(px - 2 * ps, bodyTopY + 16 * ps)
  ctx.lineTo(px - 14 * ps, bodyTopY + 22 * ps)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  const ctrlGrad = ctx.createLinearGradient(ctrlX, ctrlY - 10 * ps, ctrlX, ctrlY + 10 * ps)
  ctrlGrad.addColorStop(0, '#ffffff')
  ctrlGrad.addColorStop(1, '#e9eef6')
  ctx.fillStyle = ctrlGrad
  ctx.strokeStyle = '#bfc9dc'
  ctx.lineWidth = 2 * ps
  ctx.beginPath()
  roundRectPath(ctrlX - 16 * ps, ctrlY - 8 * ps, 32 * ps, 16 * ps, 6 * ps)
  ctx.fill()
  ctx.stroke()
  ctx.strokeStyle = '#bfc9dc'
  ctx.lineWidth = 2 * ps
  ctx.beginPath()
  ctx.moveTo(ctrlX - 6 * ps, ctrlY - 8 * ps)
  ctx.lineTo(ctrlX - 10 * ps, ctrlY - 18 * ps)
  ctx.moveTo(ctrlX + 6 * ps, ctrlY - 8 * ps)
  ctx.lineTo(ctrlX + 10 * ps, ctrlY - 18 * ps)
  ctx.stroke()
  ctx.fillStyle = '#2f3a4d'
  ctx.beginPath()
  ctx.arc(ctrlX - 7 * ps, ctrlY, 1.6 * ps, 0, Math.PI * 2)
  ctx.arc(ctrlX + 7 * ps, ctrlY, 1.6 * ps, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const dx = droneX - ctrlX
  const dy = droneY - ctrlY
  const dist = Math.hypot(dx, dy)
  const ux = dx / (dist || 1)
  const uy = dy / (dist || 1)
  const sx = ctrlX + ux * 20 * ps
  const sy = ctrlY + uy * 20 * ps
  const ex = droneX - ux * 28 * ps
  const ey = droneY - uy * 28 * ps

  ctx.save()
  ctx.strokeStyle = 'rgba(64,158,255,0.55)'
  ctx.lineWidth = 2 * ps
  ctx.setLineDash([8 * ps, 8 * ps])
  ctx.lineDashOffset = -t * 40 * ps
  ctx.beginPath()
  ctx.moveTo(sx, sy)
  ctx.lineTo(ex, ey)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.strokeStyle = 'rgba(64,158,255,0.5)'
  ctx.lineWidth = 2 * ps
  ctx.lineCap = 'round'
  for (let i = 0; i < 3; i++) {
    const r = (10 + i * 7 + (Math.sin(t * 2 + i) + 1) * 1.5) * ps
    ctx.globalAlpha = 0.38 - i * 0.1
    ctx.beginPath()
    ctx.arc(ctrlX, ctrlY, r, -0.7, 0.7)
    ctx.stroke()
  }
  ctx.restore()
}

function drawDrone(ctx, w, h, t) {
  ctx.clearRect(0, 0, w, h)

  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#eaf4ff')
  bg.addColorStop(0.55, '#f7fbff')
  bg.addColorStop(1, '#f4f8ff')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)

  const sunX = w * 0.18
  const sunY = h * 0.22
  const sunR = Math.min(w, h) * 0.18
  ctx.save()
  const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR)
  sun.addColorStop(0, 'rgba(255,196,90,0.22)')
  sun.addColorStop(0.55, 'rgba(255,196,90,0.08)')
  sun.addColorStop(1, 'rgba(64,158,255,0)')
  ctx.fillStyle = sun
  ctx.beginPath()
  ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  if (scene?.sparkles?.length) {
    ctx.save()
    for (const s of scene.sparkles) {
      const tw = 0.5 + 0.5 * Math.sin(t * 1.2 + s.p)
      ctx.globalAlpha = s.a * (0.6 + tw)
      ctx.fillStyle = '#409eff'
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  if (scene?.clouds?.length) {
    const cloudYShift = Math.sin(t * 0.25) * 2
    for (const c of scene.clouds) {
      const x = ((c.x + t * c.speed) % (w + 360)) - 180
      const y = c.y + cloudYShift * (0.5 + c.scale * 0.5)
      const s = c.scale
      ctx.save()
      ctx.globalAlpha = 0.85
      ctx.fillStyle = '#ffffff'
      ctx.strokeStyle = 'rgba(207,214,230,0.75)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.ellipse(x + 40 * s, y + 22 * s, 38 * s, 22 * s, 0, 0, Math.PI * 2)
      ctx.ellipse(x + 70 * s, y + 18 * s, 44 * s, 26 * s, 0, 0, Math.PI * 2)
      ctx.ellipse(x + 104 * s, y + 24 * s, 34 * s, 20 * s, 0, 0, Math.PI * 2)
      ctx.ellipse(x + 78 * s, y + 34 * s, 58 * s, 26 * s, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()
      ctx.restore()
    }
  }

  if (scene?.hills?.length) {
    for (const hill of scene.hills) {
      const grad = ctx.createLinearGradient(0, hill.y - 120, 0, h)
      grad.addColorStop(0, hill.c1)
      grad.addColorStop(1, hill.c2)
      ctx.save()
      ctx.globalAlpha = hill.a
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(0, h)
      ctx.lineTo(0, hill.y)
      ctx.bezierCurveTo(w * 0.18, hill.y - 60, w * 0.32, hill.y + 40, w * 0.5, hill.y)
      ctx.bezierCurveTo(w * 0.68, hill.y - 40, w * 0.82, hill.y + 60, w, hill.y - 10)
      ctx.lineTo(w, h)
      ctx.closePath()
      ctx.fill()
      ctx.restore()
    }
  }

  const cx = w / 2
  const cy = h / 2 + 10 + Math.sin(t * 1.6) * 6
  const scale = Math.min(w, h) / 420

  const shadowW = 220 * scale
  const shadowH = 34 * scale
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.12)'
  ctx.beginPath()
  ctx.ellipse(cx, cy + 110 * scale, shadowW, shadowH, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const armLen = 140 * scale
  const armOffset = 70 * scale
  const rotorR = 34 * scale

  function roundRectPath(x, y, width, height, radius) {
    const r = Math.max(0, Math.min(radius, Math.min(width, height) / 2))
    ctx.moveTo(x + r, y)
    ctx.arcTo(x + width, y, x + width, y + height, r)
    ctx.arcTo(x + width, y + height, x, y + height, r)
    ctx.arcTo(x, y + height, x, y, r)
    ctx.arcTo(x, y, x + width, y, r)
    ctx.closePath()
  }

  function rotor(x, y, phase) {
    ctx.save()
    ctx.translate(x, y)
    ctx.globalAlpha = 0.95
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#cfd6e6'
    ctx.lineWidth = 2 * scale
    ctx.beginPath()
    ctx.arc(0, 0, rotorR, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.globalAlpha = 0.18
    ctx.strokeStyle = '#2f3a4d'
    ctx.lineWidth = 5 * scale
    for (let i = 0; i < 3; i++) {
      const a = phase + (i * Math.PI * 2) / 3
      ctx.beginPath()
      ctx.arc(0, 0, rotorR - 8 * scale, a, a + Math.PI / 2.2)
      ctx.stroke()
    }

    ctx.globalAlpha = 1
    ctx.fillStyle = '#2f3a4d'
    ctx.beginPath()
    ctx.arc(0, 0, 6 * scale, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  const x1 = cx - armOffset - armLen / 2
  const x2 = cx + armOffset + armLen / 2
  const y1 = cy - 70 * scale
  const y2 = cy + 20 * scale

  ctx.save()
  ctx.strokeStyle = '#2f3a4d'
  ctx.lineWidth = 14 * scale
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(cx - armOffset, cy - 10 * scale)
  ctx.lineTo(cx + armOffset, cy - 10 * scale)
  ctx.lineTo(x2, y1)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x1, y2)
  ctx.lineTo(cx - armOffset, cy + 20 * scale)
  ctx.lineTo(cx + armOffset, cy + 20 * scale)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  const bodyGrad = ctx.createLinearGradient(cx - 80 * scale, cy - 60 * scale, cx + 80 * scale, cy + 80 * scale)
  bodyGrad.addColorStop(0, '#3b4a62')
  bodyGrad.addColorStop(0.55, '#2f3a4d')
  bodyGrad.addColorStop(1, '#1f2633')
  ctx.fillStyle = bodyGrad
  ctx.strokeStyle = '#1b2230'
  ctx.lineWidth = 2 * scale
  ctx.beginPath()
  roundRectPath(cx - 90 * scale, cy - 52 * scale, 180 * scale, 110 * scale, 28 * scale)
  ctx.fill()
  ctx.stroke()

  const panel = ctx.createLinearGradient(cx, cy - 18 * scale, cx, cy + 18 * scale)
  panel.addColorStop(0, '#66b1ff')
  panel.addColorStop(1, '#2f83e6')
  ctx.fillStyle = panel
  ctx.beginPath()
  roundRectPath(cx - 36 * scale, cy - 18 * scale, 72 * scale, 36 * scale, 12 * scale)
  ctx.fill()

  const gloss = ctx.createLinearGradient(cx - 90 * scale, cy - 52 * scale, cx + 90 * scale, cy + 58 * scale)
  gloss.addColorStop(0, 'rgba(255,255,255,0.14)')
  gloss.addColorStop(0.55, 'rgba(255,255,255,0.04)')
  gloss.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gloss
  ctx.beginPath()
  roundRectPath(cx - 90 * scale, cy - 52 * scale, 180 * scale, 110 * scale, 28 * scale)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.globalAlpha = 0.9
  ctx.beginPath()
  ctx.arc(cx - 60 * scale, cy + 10 * scale, 6 * scale, 0, Math.PI * 2)
  ctx.arc(cx + 60 * scale, cy + 10 * scale, 6 * scale, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  const spin = t * 7.4
  rotor(x1, y1, 0.3 + spin)
  rotor(x2, y1, 1.2 + spin * 1.03)
  rotor(x1, y2, 2.1 + spin * 0.98)
  rotor(x2, y2, 0.8 + spin * 1.01)

  ctx.save()
  ctx.fillStyle = '#2f3a4d'
  ctx.lineWidth = 6 * scale
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(cx - 70 * scale, cy + 58 * scale)
  ctx.lineTo(cx - 90 * scale, cy + 95 * scale)
  ctx.moveTo(cx + 70 * scale, cy + 58 * scale)
  ctx.lineTo(cx + 90 * scale, cy + 95 * scale)
  ctx.stroke()
  ctx.restore()

  ctx.save()
  ctx.fillStyle = '#1b2230'
  ctx.globalAlpha = 0.9
  ctx.beginPath()
  ctx.ellipse(cx, cy + 62 * scale, 18 * scale, 10 * scale, 0, 0, Math.PI * 2)
  ctx.fill()
  const lens = ctx.createRadialGradient(cx + 4 * scale, cy + 60 * scale, 1, cx + 4 * scale, cy + 60 * scale, 12 * scale)
  lens.addColorStop(0, 'rgba(64,158,255,0.75)')
  lens.addColorStop(1, 'rgba(64,158,255,0)')
  ctx.fillStyle = lens
  ctx.beginPath()
  ctx.arc(cx, cy + 62 * scale, 16 * scale, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  drawPilot(ctx, w, h, t, cx, cy - 30 * scale, scale)

  ctx.save()
  const vig = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.1, cx, cy, Math.max(w, h) * 0.7)
  vig.addColorStop(0, 'rgba(0,0,0,0)')
  vig.addColorStop(1, 'rgba(0,0,0,0.06)')
  ctx.fillStyle = vig
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
}

function resizeAndDraw() {
  const canvas = canvasRef.value
  const wrapper = wrapperRef.value
  if (!canvas || !wrapper) return

  const rect = wrapper.getBoundingClientRect()
  const cssW = Math.max(320, Math.min(rect.width, 980))
  const cssH = Math.max(320, Math.min(window.innerHeight - 180, 520))
  const dpr = window.devicePixelRatio || 1

  canvas.style.width = `${cssW}px`
  canvas.style.height = `${cssH}px`
  canvas.width = Math.floor(cssW * dpr)
  canvas.height = Math.floor(cssH * dpr)

  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  scene = buildScene(cssW, cssH)
  if (!startTs) startTs = performance.now()
  drawDrone(ctx, cssW, cssH, 0)
}

function onResize() {
  resizeAndDraw()
}

function tick(ts) {
  const canvas = canvasRef.value
  const wrapper = wrapperRef.value
  if (!canvas || !wrapper) return

  const rect = wrapper.getBoundingClientRect()
  const cssW = Math.max(320, Math.min(rect.width, 980))
  const cssH = Math.max(320, Math.min(window.innerHeight - 180, 520))
  const dpr = window.devicePixelRatio || 1

  if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
    resizeAndDraw()
  }

  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  const t = (ts - startTs) / 1000
  drawDrone(ctx, cssW, cssH, t)
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  resizeAndDraw()
  window.addEventListener('resize', onResize)
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => resizeAndDraw())
    if (wrapperRef.value) resizeObserver.observe(wrapperRef.value)
  }
  rafId = requestAnimationFrame((ts) => {
    startTs = ts
    tick(ts)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (resizeObserver) resizeObserver.disconnect()
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
})
</script>

<template>
  <div class="home">
    <div ref="wrapperRef" class="canvas-wrap">
      <canvas ref="canvasRef" class="drone-canvas"></canvas>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 8px;
}

.canvas-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
}

.drone-canvas {
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}
</style>
