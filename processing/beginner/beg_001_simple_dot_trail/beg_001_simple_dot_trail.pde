/**
 * BEFORE YOU START ...
 *
 * - download the Effect Player: effect.motionbank.org
 * - start it and press play
 * - enable "Send OSC packages"
 * - disable "Use WebSockets" (player will send only either / or)
 * - disable "Send annotations over OSC"
 * - set Filters to only send one performer (Amber?)
 * - set Filters to only send one joint (Hips?)
 */

import oscP5.*;

OscP5 oscP5;
float[][] positions;
int maxPositions = 100;

void setup() {
  size(800, 800);

  oscP5 = new OscP5(this, 8888);
}

void draw () {
  background(255);
  translate(width / 2, height / 2);

  if (positions != null) {
    stroke(0);
    strokeWeight(2);
    noFill();
    beginShape();
    for (int i = 0; i < maxPositions; i++) {
      float[] position = positions[i];
      vertex(position[0], position[1]);
    }
    endShape();

    noStroke();
    fill(0);
    ellipse(positions[0][0], positions[0][1], 10, 10);
  }
}

/* incoming osc message are forwarded to the oscEvent method. */
void oscEvent(OscMessage theOscMessage) {

  Object[] values = theOscMessage.arguments();
  float x = (float)(values[0]) / 10;
  float y = (float)(values[1]) / 10;
  float z = (float)(values[2]) / 10;

  if (positions == null) {
    positions = new float[maxPositions][2];
    for (int i = 0; i < maxPositions; i++) positions[i] = new float[]{x, z};
  }

  for (int i = maxPositions-1; i > 0; i--) {
    positions[i] = positions[i-1];
  }

  positions[0] = new float[]{x, z};
}
