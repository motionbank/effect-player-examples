/**
 *  A simple dot and trail example.
 *
 *  Use a recent browser with this as we are using ES6+ JavaScript syntax.
 */

/*
* BEFORE YOU START ...
* - download the Effect Player: effect.motionbank.org
* - start it and press play
* - enable "Send OSC packages"
* - enable "Use WebSockets"
* - set Filters to only send one performer (Amber?)
* - set Filters to only send one joint (Hips?)
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

/* -- WebSocket part -- */

// we are using a JavaScript library that brings OSC style messages
// to the browser: https://github.com/colinbdclark/osc.js

// OSC messages are received via a WebSocket adapter, we need to
// initialize this first giving the address of the WebSocket
const oscPort = new osc.WebSocketPort({
  url: "ws://127.0.0.1:8888",
  metadata: true
})

// now we define a callback function to handle data that
// comes in from the Effect Player
const onWebSocketMessage = function(message) {

  // uncomment the following to have a look at the structure
  // of the message received in the browsers console:
  // console.log(message)

  // store the x,y part of the message in two handy variables
  const x = message.args[0].value / 10
  const y = message.args[2].value / 10

  // check if our array of positions has not reached the max we set above
  if (positions.length > maxPositions) {
    positions = positions.slice(1) // remove first item
  }

  // now add the new x,y values as object to our array
  positions.push({x,y})
}

// register the callback function for events of type "message"
// which is triggered when new messages come in (you guessed it)
oscPort.on('message', onWebSocketMessage)

// now start listening on the socket
oscPort.open()
