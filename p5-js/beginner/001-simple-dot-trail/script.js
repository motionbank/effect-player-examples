/**
 *  A simple dot and trail example.
 *
 *  Use a recent browser with this as we are using ES6+ JavaScript syntax.
 */

// define a variable to be an array
// and add first position at 0,0 to it
let positions = [{
  x: 0,
  y: 0
}]

// define a variable to set how long the trail will be
// (in other words: how many positions are kept)
const maxPositions = 100

// setup drawing area
function setup() {
  // the real stage was 8 x 8 meters, values are in millimeters
  // we draw at 1/10th size (1 pixel == 10 mm)
  createCanvas(800, 800)
}

// define draw loop
function draw() {
  background(235)

  // values come in centered in relation to the 8000x8000 stage:
  // -4000 <--> 4000
  // so we translate to the center of the drawing area to compensate for that
  translate(width / 2, height / 2)

  stroke(0)
  noFill()
  for (let i = 1, k = positions.length; i < k; i++) {
    const p1 = positions[i-1]
    const p2 = positions[i]
    line(p1.x, p1.y, p2.x, p2.y)
  }

  noStroke()
  fill(0)
  const last = positions.length-1
  ellipse(positions[last].x, positions[last].y, 10, 10)
}

const oscPort = new osc.WebSocketPort({
  url: "ws://127.0.0.1:8888",
  metadata: true
})

const onWebSocketMessage = function(message) {

  const x = message.args[0].value / 10
  const y = message.args[2].value / 10

  if (positions.length > maxPositions) {
    positions = positions.slice(1,maxPositions)
  }

  positions.push({
    x,
    y
  })
}

oscPort.on('message', onWebSocketMessage)

oscPort.open()
