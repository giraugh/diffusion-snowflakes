import './style.css'

type Point = {
  x: number,
  y: number,
}

type Particle = Point & {
  index: number,
}

type Cluster = Particle[]


const distance = (p1: Point, p2: Point) =>
  Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))

const isTouchingCluster = (particle: Particle): boolean =>
  cluster.some(otherParticle =>
    distance(particle, otherParticle) < 2 * PARTICLE_RADIUS 
  )

const newParticle = (cluster: Cluster): Particle => {
  const angle = Math.random() * SEGMENT_ANGLE
  const dist = width / 2

  return {
    x: target.x + Math.cos(angle) * dist,
    y: target.y + Math.sin(angle) * dist,
    index: cluster.length
  }
}

const drawClusterSegment = (cluster: Cluster) => {
  cluster.forEach(particle => {
    ctx.fillStyle = `hsl(${START_HUE + (particle.index * HUE_ROT_SPEED)|0} 80% 50%)`
    ctx.beginPath()
    ctx.arc(particle.x, particle.y, 2, 0, Math.PI*2)
    ctx.fill()
  })
}


const SEGMENT_ANGLE = Math.PI / 6
const NOISE = .05
const PARTICLE_RADIUS = 2
const SPEED = .5
const START_HUE = 230
const HUE_ROT_SPEED = -.1

// Setup canvas
const [width, height] = [800, 800]
const canvas = document.querySelector('#canvas')! as HTMLCanvasElement
canvas.width = width
canvas.height = height
const ctx = canvas.getContext('2d')!
ctx.imageSmoothingEnabled = false

// Create resources
let cluster: Particle[] = []
let target: Point = {
  x: 0,
  y: 0,
}
let done = false
let particle = newParticle(cluster)

// Setup "regenerate" button
const regenerateBtn = document.querySelector('button')! as HTMLButtonElement
regenerateBtn.addEventListener('click', () => {
  cluster = []
  done = false
  particle = newParticle(cluster)
})

// Setup draw loop
const draw = () => {
  if (!done) {
    // Clear screen
    ctx.clearRect(0, 0, width, height)

    // Brownian motion until touching
    while (!(particle.x <= target.x+1 || isTouchingCluster(particle))) {
      // Get polar coordinate
      let dist = distance(particle, target)
      let angle = Math.atan2(particle.y - target.y, particle.x - target.x)
      
      // Apply brownian motion
      angle += NOISE * ((Math.random() * 2) - 1)
      dist -= SPEED

      const correctedAngle = Math.max(Math.min(angle, SEGMENT_ANGLE), 0)
      particle.x = target.x + Math.cos(correctedAngle) * dist
      particle.y = target.y + Math.sin(correctedAngle) * dist
    }

    // Did it hit the cluster, far away?
    let dist = distance(particle, target)
    if (dist >= width/2) {
      done = true
    }
    
    // Add to cluster
    cluster.push(particle)  
    particle = newParticle(cluster)
  }

  // Draw the cluster
  ctx.save()
  ctx.translate(width/2, height/2)

  // Draw each rotated segment
  for (let i = 0; i < 6; i++) {
    // Draw the flipped and unflipped portion of the segment
    ctx.save()
    ctx.rotate(i*Math.PI/3)
    drawClusterSegment(cluster)
    ctx.scale(1, -1)
    drawClusterSegment(cluster)
    ctx.restore()
  }
  
  // Restore transform for next frame
  ctx.restore()

  requestAnimationFrame(draw)
}

// Start draw loop
requestAnimationFrame(draw)
