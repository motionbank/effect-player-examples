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
let positions = [{
  x: 0,
  y: 0
}]

// define a variable to set how long the trail will be
// (in other words: how many positions are kept)
const maxPositions = 100

/* -- Three.js -- */

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 10;
const controls = new THREE.OrbitControls(camera)

// var geometry = new THREE.BoxGeometry(1, 1, 1);
// var material = new THREE.MeshBasicMaterial({
//   color: 0x00ff00
// });
// var cube = new THREE.Mesh(geometry, material);
// scene.add(cube);

var light = new THREE.AmbientLight(0x404040); // soft white light
scene.add(light);
var light = new THREE.DirectionalLight( 0xffffff, 2 ); // soft white light
scene.add(light);

const path = new THREE.LineCurve3(
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(10, 2, 0)
)

// var geometry = new THREE.BufferGeometry().setFromPoints(path.getPoints());
// var material = new THREE.LineBasicMaterial({
//   color: 0xffffff
// });
// var line = new THREE.Line(geometry, material);
// scene.add(line);

const geometry = new THREE.TubeBufferGeometry(path, 2, 0.1, 8, false)
geometry.position = new THREE.Vector3(0, 0, 0)
const material = new THREE.MeshLambertMaterial({
  color: 0x00ff00
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// define a callback for drawing
const onAnimationFrame = function() {

  // we do not update the drawing instantly, but rather
  // let the browser know we'd like to be notified when it is OK
  // to do so, see: https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
  window.requestAnimationFrame(onAnimationFrame)

  // // define a (empty) variable to be used to collect the positions for
  // // the points attribute of the polyline element: <polyline points="" />
  // let pointsAttr = ''
  //
  // // walk through positions and add the to the string (text) in the variable
  // for (let i = 0, k = positions.length; i < k; i++) {
  //   const point = positions[i]
  //   pointsAttr = pointsAttr + ' ' + point.x + ' ' + point.y
  // }
  // polylineEl.setAttribute('points', pointsAttr)
  //
  // // update the dot (circle) position
  // const last = positions.length - 1
  // circleEl.setAttribute('cx', positions[last].x)
  // circleEl.setAttribute('cy', positions[last].y)

  // controls.update()
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
  if (message.args.length <= 1) return

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
  positions.push({
    x,
    y
  })
}

// register the callback function for events of type "message"
// which is triggered when new messages come in (you guessed it)
oscPort.on('message', onWebSocketMessage)

// now start listening on the socket
oscPort.open()
