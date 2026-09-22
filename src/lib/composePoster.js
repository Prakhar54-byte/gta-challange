// Builds the base "wanted poster" image by compositing an uploaded photo
// onto a paper-and-frame background. The result is a single flattened
// image that gets handed to the Image Editor, so the editor's own tools
// (text, stamps, filters, crop) then apply on top of a real poster, not
// a bare photo.

const CANVAS_W = 900
const CANVAS_H = 1160

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function drawPaperTexture(ctx, w, h) {
  ctx.fillStyle = '#ebdfc2'
  ctx.fillRect(0, 0, w, h)

  // subtle mottled aging - random low-alpha blotches
  const seedSpots = 140
  for (let i = 0; i < seedSpots; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 20 + Math.random() * 70
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, 'rgba(120, 94, 52, 0.06)')
    grad.addColorStop(1, 'rgba(120, 94, 52, 0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // vignette edges
  const vignette = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.35,
    w / 2, h / 2, Math.max(w, h) * 0.75
  )
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(1, 'rgba(29, 26, 21, 0.35)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, w, h)
}

function drawFrame(ctx, w, h) {
  ctx.strokeStyle = '#1d1a15'
  ctx.lineWidth = 10
  ctx.strokeRect(24, 24, w - 48, h - 48)
  ctx.lineWidth = 2
  ctx.strokeRect(40, 40, w - 80, h - 80)
}

function drawHeader(ctx, w) {
  ctx.textAlign = 'center'
  ctx.fillStyle = '#1d1a15'
  ctx.font = '700 92px "Anton", sans-serif'
  ctx.fillText('WANTED', w / 2, 150)

  ctx.font = '400 26px "Courier Prime", monospace'
  ctx.fillText('VICE CITY POLICE DEPARTMENT \u2014 ALL PRECINCTS', w / 2, 190)

  ctx.strokeStyle = '#1d1a15'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(120, 212)
  ctx.lineTo(w - 120, 212)
  ctx.stroke()
}

function drawFooter(ctx, w, h) {
  ctx.textAlign = 'center'
  ctx.fillStyle = '#1d1a15'
  ctx.font = '400 22px "Courier Prime", monospace'
  ctx.fillText('REWARD FOR INFORMATION LEADING TO ARREST', w / 2, h - 70)
  ctx.font = '400 16px "Courier Prime", monospace'
  ctx.fillText('CONTACT YOUR NEAREST PRECINCT \u2014 DO NOT APPROACH', w / 2, h - 42)
}

/**
 * Composite the uploaded photo into a poster frame and return a data URL.
 * @param {string} photoSrc data URL or object URL of the uploaded photo
 */
export async function composePoster(photoSrc) {
  const canvas = document.createElement('canvas')
  canvas.width = CANVAS_W
  canvas.height = CANVAS_H
  const ctx = canvas.getContext('2d')

  drawPaperTexture(ctx, CANVAS_W, CANVAS_H)
  drawFrame(ctx, CANVAS_W, CANVAS_H)
  drawHeader(ctx, CANVAS_W)

  // photo slot
  const slot = { x: 130, y: 250, w: CANVAS_W - 260, h: 680 }
  ctx.fillStyle = '#1d1a15'
  ctx.fillRect(slot.x - 8, slot.y - 8, slot.w + 16, slot.h + 16)

  if (photoSrc) {
    const img = await loadImage(photoSrc)
    // cover-fit the photo into the slot
    const scale = Math.max(slot.w / img.width, slot.h / img.height)
    const dw = img.width * scale
    const dh = img.height * scale
    const dx = slot.x + (slot.w - dw) / 2
    const dy = slot.y + (slot.h - dh) / 2
    ctx.save()
    ctx.beginPath()
    ctx.rect(slot.x, slot.y, slot.w, slot.h)
    ctx.clip()
    // slight desaturated/sepia tint for the "mugshot" feel
    ctx.filter = 'grayscale(35%) contrast(1.05) sepia(15%)'
    ctx.drawImage(img, dx, dy, dw, dh)
    ctx.filter = 'none'
    ctx.restore()
  } else {
    ctx.fillStyle = '#cabb92'
    ctx.fillRect(slot.x, slot.y, slot.w, slot.h)
    ctx.fillStyle = '#1d1a15'
    ctx.font = '400 24px "Courier Prime", monospace'
    ctx.textAlign = 'center'
    ctx.fillText('PHOTO NOT ON FILE', slot.x + slot.w / 2, slot.y + slot.h / 2)
  }

  drawFooter(ctx, CANVAS_W, CANVAS_H)

  return canvas.toDataURL('image/png')
}

export const POSTER_CANVAS_SIZE = { width: CANVAS_W, height: CANVAS_H }
