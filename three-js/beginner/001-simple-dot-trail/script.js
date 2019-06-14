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
 * - disable "Send annotations over OSC"
 * - set Filters to only send one performer (Amber?)
 * - set Filters to only send one joint (Hips?)
 */

// define a variable to be an array
// and add first position at 0,0 to it
let positions = []

// define a variable to set how long the trail will be
// (in other words: how many positions are kept)
const maxPositions = 100

/* -- Three.js -- */

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.y = 20
camera.position.z = 50
const controls = new THREE.OrbitControls(camera)

const light = new THREE.AmbientLight(0x404040) // soft white light
scene.add(light)

const geometry = new THREE.BufferGeometry()
const vertices = new Float32Array(maxPositions * 3)
geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3))
geometry.setDrawRange( 0, 0 )

const material = new THREE.LineBasicMaterial({
  color: 0xffffff
});
const line = new THREE.Line(geometry, material)
scene.add(line)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// define a callback for drawing
const onAnimationFrame = function() {

  // we do not update the drawing instantly, but rather
  // let the browser know we'd like to be notified when it is OK
  // to do so, see: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
  window.requestAnimationFrame(onAnimationFrame)

  renderer.render(scene, camera)
}
onAnimationFrame()

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

  // we are only interested in messages with coordinates (6 values)
  if (message.args.length === 1) return

  // uncomment the following to have a look at the structure
  // of the message received in the browsers console:
  // console.log(message)

  // store the x,y,z part of the message into variables
  const x = message.args[0].value / 100
  const y = message.args[1].value / 100
  const z = message.args[2].value / 100

  // check if our array of positions has not reached the max we set above
  if (positions.length > maxPositions) {
    positions = positions.slice(1) // remove first item
  }

  // now add the new x,y values as object to our array
  positions.push({x, y, z})

  // now update the geometry of the 3D line
  const arr = geometry.attributes.position.array
  positions.forEach((p, i) => {
    const j = i*3
    arr[j] = p.x
    arr[j+1] = p.y
    arr[j+2] = p.z
  })
  // set to draw only as many points as we have
  geometry.setDrawRange( 0, positions.length )
  // let THREE know this geometry needs to be updated (as it's buffered)
  geometry.attributes.position.needsUpdate = true
}

// register the callback function for events of type "message"
// which is triggered when new messages come in (you guessed it)
oscPort.on('message', onWebSocketMessage)

// now start listening on the socket
oscPort.open()
