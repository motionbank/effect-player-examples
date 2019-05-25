let position = {
  x: 0,
  y: 0
}

function setup() {
  createCanvas(800, 800)
}

function draw() {
  background(235)
  noStroke()
  fill(0)
  translate(width / 2, height / 2)
  ellipse(position.x, position.y, 10, 10)
}

const oscPort = new osc.WebSocketPort({
  url: "ws://127.0.0.1:8888",
  metadata: true
})

const onWebSocketMessage = function (message) {

  console.log(message)

  const x = message.args[0].value / 10
  const y = message.args[2].value / 10

  position = {
    x, y
  }
}

oscPort.on('message', onWebSocketMessage)

oscPort.open()
