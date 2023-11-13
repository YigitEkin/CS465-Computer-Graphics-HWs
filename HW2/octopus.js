var canvas;
var gl;
var program;
var projectionMatrix;
var modelViewMatrix;
var instanceMatrix;
var modelViewMatrixLoc;


var colors = [
  vec4(0.0, 0.0, 0.0, 1.0),
  vec4(1.0, 0.0, 0.0, 1.0),
  vec4(1.0, 1.0, 0.0, 1.0),
  vec4(0.0, 1.0, 0.0, 1.0),
  vec4(0.0, 0.0, 1.0, 1.0),
];

var vertices = [

  vec4(-0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, 0.5, 0.5, 1.0),
  vec4(0.5, 0.5, 0.5, 1.0),
  vec4(0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, -0.5, -0.5, 1.0),
  vec4(-0.5, 0.5, -0.5, 1.0),
  vec4(0.5, 0.5, -0.5, 1.0),
  vec4(0.5, -0.5, -0.5, 1.0)
];

var flag = 0;
var selectedBodyPart = 0;

var torsoId = 0;
var torsoIdX = 0;
var torsoIdY = 1;
var torsoIdZ = 2;

var eye1Id = 3;
var eye1IdX = 3;
var eye1IdY = 4;
var eye1IdZ = 5;

var eye2Id = 6;
var eye2IdX = 6;
var eye2IdY = 7;
var eye2IdZ = 8;

var upperLeg1Id = 9;
var upperLeg1IdX = 9;
var upperLeg1IdY = 10;
var upperLeg1IdZ = 11;

var upperLeg2Id = 12;
var upperLeg2IdX = 12;
var upperLeg2IdY = 13;
var upperLeg2IdZ = 14;

var upperLeg3Id = 15;
var upperLeg3IdX = 15;
var upperLeg3IdY = 16;
var upperLeg3IdZ = 17;

var upperLeg4Id = 18;
var upperLeg4IdX = 18;
var upperLeg4IdY = 19;
var upperLeg4IdZ = 20;

var upperLeg5Id = 21;
var upperLeg5IdX = 21;
var upperLeg5IdY = 22;
var upperLeg5IdZ = 23;

var upperLeg6Id = 24;
var upperLeg6IdX = 24;
var upperLeg6IdY = 25;
var upperLeg6IdZ = 26;

var upperLeg7Id = 27;
var upperLeg7IdX = 27;
var upperLeg7IdY = 28;
var upperLeg7IdZ = 29;

var upperLeg8Id = 30;
var upperLeg8IdX = 30;
var upperLeg8IdY = 31;
var upperLeg8IdZ = 32;

var midLeg1Id = 33;
var midLeg1IdX = 33;
var midLeg1IdY = 34;
var midLeg1IdZ = 35;

var midLeg2Id = 36;
var midLeg2IdX = 36;
var midLeg2IdY = 37;
var midLeg2IdZ = 38;

var midLeg3Id = 39;
var midLeg3IdX = 39;
var midLeg3IdY = 40;
var midLeg3IdZ = 41;

var midLeg4Id = 42;
var midLeg4IdX = 42;
var midLeg4IdY = 43;
var midLeg4IdZ = 44;

var midLeg5Id = 45;
var midLeg5IdX = 45;
var midLeg5IdY = 46;
var midLeg5IdZ = 47;

var midLeg6Id = 48;
var midLeg6IdX = 48;
var midLeg6IdY = 49;
var midLeg6IdZ = 50;

var midLeg7Id = 51;
var midLeg7IdX = 51;
var midLeg7IdY = 52;
var midLeg7IdZ = 53;

var midLeg8Id = 54;
var midLeg8IdX = 54;
var midLeg8IdY = 55;
var midLeg8IdZ = 56;

var lowerLeg1Id = 57;
var lowerLeg1IdX = 57;
var lowerLeg1IdY = 58;
var lowerLeg1IdZ = 59;

var lowerLeg2Id = 60;
var lowerLeg2IdX = 60;
var lowerLeg2IdY = 61;
var lowerLeg2IdZ = 62;

var lowerLeg3Id = 63;
var lowerLeg3IdX = 63;
var lowerLeg3IdY = 64;
var lowerLeg3IdZ = 65;

var lowerLeg4Id = 66;
var lowerLeg4IdX = 66;
var lowerLeg4IdY = 67;
var lowerLeg4IdZ = 68;

var lowerLeg5Id = 69;
var lowerLeg5IdX = 69;
var lowerLeg5IdY = 70;
var lowerLeg5IdZ = 71;

var lowerLeg6Id = 72;
var lowerLeg6IdX = 72;
var lowerLeg6IdY = 73;
var lowerLeg6IdZ = 74;

var lowerLeg7Id = 75;
var lowerLeg7IdX = 75;
var lowerLeg7IdY = 76;
var lowerLeg7IdZ = 77;

var lowerLeg8Id = 78;
var lowerLeg8IdX = 78;
var lowerLeg8IdY = 79;
var lowerLeg8IdZ = 80;

var torsoHeight = 50.0;
var torsoWidth = 50.0;
var eyeHeight = 5.0;
var eyeWidth = 5.0;
var upperLegHeight = 20.0;
var upperLegWidth = 8.0;
var midLegHeight = 15.0;
var midLegWidth = 6.0;
var lowerLegHeight = 10.0;
var lowerLegWidth = 4.0;


var numNodes = 80;
var numAngles = 81;
var angle = 0;

var theta = [];
for (var i = 0; i < numAngles; i++) theta[i] = 0.0;

var stack = [];

var figure = [];

for (var i = 0; i < numNodes; i += 3) figure[i] = createNode(null, null, null, null);
var vBuffer;
var modelViewLoc;
var colorBuffer;
var pointsArray = [];
var colorArray = [];

//-------------------------------------------

function scale4(a, b, c) {
  var result = mat4();
  result[0][0] = a;
  result[1][1] = b;
  result[2][2] = c;
  return result;
}

//--------------------------------------------


function createNode(transform, render, sibling, child) {
  var node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
  }
  return node;
}


function initNodes(Id) {

  var m = mat4();

  switch (Id) {

    case torsoId:
    case torsoIdX:
    case torsoIdY:
    case torsoIdZ:

      m = rotate(theta[torsoIdX], 1, 0, 0);
      m = mult(m, rotate(theta[torsoIdY], 0, 1, 0));
      m = mult(m, rotate(theta[torsoIdZ], 0, 0, 1));
      figure[torsoId] = createNode(m, torso, null, eye1Id);
      break;

    case eye1Id:
    case eye1IdX:
    case eye1IdY:
    case eye1IdZ:

      m = translate((-torsoWidth * 0.25) / 2, torsoHeight * 0.30, torsoWidth * 0.5 + eyeWidth * 0.5)
      m = mult(m, rotate(theta[eye1IdX], 1, 0, 0));
      m = mult(m, rotate(theta[eye1IdZ], 0, 0, 1));
      m = mult(m, rotate(theta[eye1IdY], 0, 1, 0));
      m = mult(m, translate((-torsoWidth * 0.25) / 2, torsoHeight * 0.30, 0));
      figure[eye1Id] = createNode(m, eye, eye2Id, null);
      break;

    case eye2Id:
    case eye2IdX:
    case eye2IdY:
    case eye2IdZ:

      m = translate((torsoWidth * 0.25) / 2, torsoHeight * 0.30, torsoWidth * 0.5 + eyeWidth * 0.5);
      m = mult(m, rotate(theta[eye2IdX], 1, 0, 0));
      m = mult(m, rotate(theta[eye2IdY], 0, 1, 0));
      m = mult(m, rotate(theta[eye2IdZ], 0, 0, 1));
      m = mult(m, translate((torsoWidth * 0.25) / 2, torsoHeight * 0.30, 0));
      figure[eye2Id] = createNode(m, eye, upperLeg1Id, null);
      break;

    case upperLeg1Id:
    case upperLeg1IdX:
    case upperLeg1IdY:
    case upperLeg1IdZ:

      m = translate(-torsoWidth * 0.5 + upperLegWidth * 0.5, 0, torsoWidth * 0.5 - upperLegWidth * 0.5);
      m = mult(m, rotate(theta[upperLeg1IdX], 1, 0, 0));
      m = mult(m, rotate(theta[upperLeg1IdY], 0, 1, 0));
      m = mult(m, rotate(theta[upperLeg1IdZ], 0, 0, 1));
      m = mult(m, translate(0, -upperLegHeight, 0));
      figure[upperLeg1Id] = createNode(m, upperLeg, upperLeg2Id, midLeg1Id);
      break;

    case upperLeg2Id:
    case upperLeg2IdX:
    case upperLeg2IdY:
    case upperLeg2IdZ:

      m = translate(0, 0, torsoWidth * 0.5 - upperLegWidth * 0.5);
      m = mult(m, rotate(theta[upperLeg2IdX], 1, 0, 0));
      m = mult(m, rotate(theta[upperLeg2IdY], 0, 1, 0));
      m = mult(m, rotate(theta[upperLeg2IdZ], 0, 0, 1));
      m = mult(m, translate(0, -upperLegHeight, 0));
      figure[upperLeg2Id] = createNode(m, upperLeg, upperLeg3Id, midLeg2Id);
      break;

    case upperLeg3Id:
    case upperLeg3IdX:
    case upperLeg3IdY:
    case upperLeg3IdZ:

      m = translate(torsoWidth * 0.5 - upperLegWidth * 0.5, 0, torsoWidth * 0.5 - upperLegWidth * 0.5);
      m = mult(m, rotate(theta[upperLeg3IdX], 1, 0, 0));
      m = mult(m, rotate(theta[upperLeg3IdY], 0, 1, 0));
      m = mult(m, rotate(theta[upperLeg3IdZ], 0, 0, 1));
      m = mult(m, translate(0, -upperLegHeight, 0));
      figure[upperLeg3Id] = createNode(m, upperLeg, upperLeg4Id, midLeg3Id);
      break;

    case upperLeg4Id:
    case upperLeg4IdX:
    case upperLeg4IdY:
    case upperLeg4IdZ:

      m = translate(torsoWidth * 0.5 - upperLegWidth * 0.5, 0, 0);
      m = mult(m, rotate(theta[upperLeg4IdX], 1, 0, 0));
      m = mult(m, rotate(theta[upperLeg4IdY], 0, 1, 0));
      m = mult(m, rotate(theta[upperLeg4IdZ], 0, 0, 1));
      m = mult(m, translate(0, -upperLegHeight, 0));
      figure[upperLeg4Id] = createNode(m, upperLeg, upperLeg5Id, midLeg4Id);
      break;

    case upperLeg5Id:
    case upperLeg5IdX:
    case upperLeg5IdY:

      m = translate(torsoWidth * 0.5 - upperLegWidth * 0.5, 0, -torsoWidth * 0.5 + upperLegWidth * 0.5);
      m = mult(m, rotate(theta[upperLeg5IdX], 1, 0, 0));
      m = mult(m, rotate(theta[upperLeg5IdY], 0, 1, 0));
      m = mult(m, rotate(theta[upperLeg5IdZ], 0, 0, 1));
      m = mult(m, translate(0, -upperLegHeight, 0));
      figure[upperLeg5Id] = createNode(m, upperLeg, upperLeg6Id, midLeg5Id);
      break;

    case upperLeg6Id:
    case upperLeg6IdX:
    case upperLeg6IdY:
    case upperLeg6IdZ:

      m = translate(0, 0, -torsoWidth * 0.5 + upperLegWidth * 0.5);
      m = mult(m, rotate(theta[upperLeg6IdX], 1, 0, 0));
      m = mult(m, rotate(theta[upperLeg6IdY], 0, 1, 0));
      m = mult(m, rotate(theta[upperLeg6IdZ], 0, 0, 1));
      m = mult(m, translate(0, -upperLegHeight, 0));
      figure[upperLeg6Id] = createNode(m, upperLeg, upperLeg7Id, midLeg6Id);
      break;

    case upperLeg7Id:
    case upperLeg7IdX:
    case upperLeg7IdY:
    case upperLeg7IdZ:

      m = translate(-torsoWidth * 0.5 + upperLegWidth * 0.5, 0, -torsoWidth * 0.5 + upperLegWidth * 0.5);
      m = mult(m, rotate(theta[upperLeg7IdX], 1, 0, 0));
      m = mult(m, rotate(theta[upperLeg7IdY], 0, 1, 0));
      m = mult(m, rotate(theta[upperLeg7IdZ], 0, 0, 1));
      m = mult(m, translate(0, -upperLegHeight, 0));
      figure[upperLeg7Id] = createNode(m, upperLeg, upperLeg8Id, midLeg7Id);
      break;

    case upperLeg8Id:
    case upperLeg8IdX:
    case upperLeg8IdY:
    case upperLeg8IdZ:

      m = translate(-torsoWidth * 0.5 + upperLegWidth * 0.5, 0, 0);
      m = mult(m, rotate(theta[upperLeg8IdX], 1, 0, 0));
      m = mult(m, rotate(theta[upperLeg8IdY], 0, 1, 0));
      m = mult(m, rotate(theta[upperLeg8IdZ], 0, 0, 1));
      m = mult(m, translate(0, -upperLegHeight, 0));
      figure[upperLeg8Id] = createNode(m, upperLeg, null, midLeg8Id);
      break;

    case midLeg1Id:
    case midLeg1IdX:
    case midLeg1IdY:
    case midLeg1IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[midLeg1IdX], 1, 0, 0));
      m = mult(m, rotate(theta[midLeg1IdY], 0, 1, 0));
      m = mult(m, rotate(theta[midLeg1IdZ], 0, 0, 1));
      m = mult(m, translate(0, -midLegHeight, 0));
      figure[midLeg1Id] = createNode(m, midLeg, null, lowerLeg1Id);
      break;

    case midLeg2Id:
    case midLeg2IdX:
    case midLeg2IdY:
    case midLeg2IdZ:
      m = translate(0, 0, 0);
      console.log(theta[midLeg2IdX], theta[midLeg2IdY], theta[midLeg2IdZ]);
      m = mult(m, rotate(theta[midLeg2IdX], 1, 0, 0));
      m = mult(m, rotate(theta[midLeg2IdY], 0, 1, 0));
      m = mult(m, rotate(theta[midLeg2IdZ], 0, 0, 1));
      m = mult(m, translate(0, -midLegHeight, 0));
      figure[midLeg2Id] = createNode(m, midLeg, null, lowerLeg2Id);
      break;

    case midLeg3Id:
    case midLeg3IdX:
    case midLeg3IdY:
    case midLeg3IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[midLeg3IdX], 1, 0, 0));
      m = mult(m, rotate(theta[midLeg3IdY], 0, 1, 0));
      m = mult(m, rotate(theta[midLeg3IdZ], 0, 0, 1));
      m = mult(m, translate(0, -midLegHeight, 0));
      figure[midLeg3Id] = createNode(m, midLeg, null, lowerLeg3Id);
      break;

    case midLeg4Id:
    case midLeg4IdX:
    case midLeg4IdY:
    case midLeg4IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[midLeg4IdX], 1, 0, 0));
      m = mult(m, rotate(theta[midLeg4IdY], 0, 1, 0));
      m = mult(m, rotate(theta[midLeg4IdZ], 0, 0, 1));
      m = mult(m, translate(0, -midLegHeight, 0));
      figure[midLeg4Id] = createNode(m, midLeg, null, lowerLeg4Id);
      break;

    case midLeg5Id:
    case midLeg5IdX:
    case midLeg5IdY:
    case midLeg5IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[midLeg5IdX], 1, 0, 0));
      m = mult(m, rotate(theta[midLeg5IdY], 0, 1, 0));
      m = mult(m, rotate(theta[midLeg5IdZ], 0, 0, 1));
      m = mult(m, translate(0, -midLegHeight, 0));
      figure[midLeg5Id] = createNode(m, midLeg, null, lowerLeg5Id);
      break;

    case midLeg6Id:
    case midLeg6IdX:
    case midLeg6IdY:
    case midLeg6IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[midLeg6IdX], 1, 0, 0));
      m = mult(m, rotate(theta[midLeg6IdY], 0, 1, 0));
      m = mult(m, rotate(theta[midLeg6IdZ], 0, 0, 1));
      figure[midLeg6Id] = createNode(m, midLeg, null, lowerLeg6Id);
      break;

    case midLeg7Id:
    case midLeg7IdX:
    case midLeg7IdY:
    case midLeg7IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[midLeg7IdX], 1, 0, 0));
      m = mult(m, rotate(theta[midLeg7IdY], 0, 1, 0));
      m = mult(m, rotate(theta[midLeg7IdZ], 0, 0, 1));
      m = mult(m, translate(0, -midLegHeight, 0));
      figure[midLeg7Id] = createNode(m, midLeg, null, lowerLeg7Id);
      break;

    case midLeg8Id:
    case midLeg8IdX:
    case midLeg8IdY:
    case midLeg8IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[midLeg8IdX], 1, 0, 0));
      m = mult(m, rotate(theta[midLeg8IdY], 0, 1, 0));
      m = mult(m, rotate(theta[midLeg8IdZ], 0, 0, 1));
      m = mult(m, translate(0, -midLegHeight, 0));
      figure[midLeg8Id] = createNode(m, midLeg, null, lowerLeg8Id);
      break;

    case lowerLeg1Id:
    case lowerLeg1IdX:
    case lowerLeg1IdY:
    case lowerLeg1IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[lowerLeg1IdX], 1, 0, 0));
      m = mult(m, rotate(theta[lowerLeg1IdY], 0, 1, 0));
      m = mult(m, rotate(theta[lowerLeg1IdZ], 0, 0, 1));
      m = mult(m, translate(0, -lowerLegHeight, 0));
      figure[lowerLeg1Id] = createNode(m, lowerLeg, null, null);
      break;

    case lowerLeg2Id:
    case lowerLeg2IdX:
    case lowerLeg2IdY:
    case lowerLeg2IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[lowerLeg2IdX], 1, 0, 0));
      m = mult(m, rotate(theta[lowerLeg2IdY], 0, 1, 0));
      m = mult(m, rotate(theta[lowerLeg2IdZ], 0, 0, 1));
      m = mult(m, translate(0, -lowerLegHeight, 0));
      figure[lowerLeg2Id] = createNode(m, lowerLeg, null, null);
      break;

    case lowerLeg3Id:
    case lowerLeg3IdX:
    case lowerLeg3IdY:
    case lowerLeg3IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[lowerLeg3IdX], 1, 0, 0));
      m = mult(m, rotate(theta[lowerLeg3IdY], 0, 1, 0));
      m = mult(m, rotate(theta[lowerLeg3IdZ], 0, 0, 1));
      m = mult(m, translate(0, -lowerLegHeight, 0));
      figure[lowerLeg3Id] = createNode(m, lowerLeg, null, null);
      break;

    case lowerLeg4Id:
    case lowerLeg4IdX:
    case lowerLeg4IdY:
    case lowerLeg4IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[lowerLeg4IdX], 1, 0, 0));
      m = mult(m, rotate(theta[lowerLeg4IdY], 0, 1, 0));
      m = mult(m, rotate(theta[lowerLeg4IdZ], 0, 0, 1));
      m = mult(m, translate(0, -lowerLegHeight, 0));
      figure[lowerLeg4Id] = createNode(m, lowerLeg, null, null);
      break;

    case lowerLeg5Id:
    case lowerLeg5IdX:
    case lowerLeg5IdY:
    case lowerLeg5IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[lowerLeg5IdX], 1, 0, 0));
      m = mult(m, rotate(theta[lowerLeg5IdY], 0, 1, 0));
      m = mult(m, rotate(theta[lowerLeg5IdZ], 0, 0, 1));
      m = mult(m, translate(0, -lowerLegHeight, 0));
      figure[lowerLeg5Id] = createNode(m, lowerLeg, null, null);
      break;

    case lowerLeg6Id:
    case lowerLeg6IdX:
    case lowerLeg6IdY:
    case lowerLeg6IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[lowerLeg6IdX], 1, 0, 0));
      m = mult(m, rotate(theta[lowerLeg6IdY], 0, 1, 0));
      m = mult(m, rotate(theta[lowerLeg6IdZ], 0, 0, 1));
      m = mult(m, translate(0, -lowerLegHeight, 0));
      figure[lowerLeg6Id] = createNode(m, lowerLeg, null, null);
      break;

    case lowerLeg7Id:
    case lowerLeg7IdX:
    case lowerLeg7IdY:
    case lowerLeg7IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[lowerLeg7IdX], 1, 0, 0));
      m = mult(m, rotate(theta[lowerLeg7IdY], 0, 1, 0));
      m = mult(m, rotate(theta[lowerLeg7IdZ], 0, 0, 1));
      m = mult(m, translate(0, -lowerLegHeight, 0));
      figure[lowerLeg7Id] = createNode(m, lowerLeg, null, null);
      break;

    case lowerLeg8Id:
    case lowerLeg8IdX:
    case lowerLeg8IdY:
    case lowerLeg8IdZ:

      m = translate(0, 0, 0);
      m = mult(m, rotate(theta[lowerLeg8IdX], 1, 0, 0));
      m = mult(m, rotate(theta[lowerLeg8IdY], 0, 1, 0));
      m = mult(m, rotate(theta[lowerLeg8IdZ], 0, 0, 1));
      m = mult(m, translate(0, -lowerLegHeight, 0));
      figure[lowerLeg8Id] = createNode(m, lowerLeg, null, null);
      break;
  }

}

function traverse(Id) {
  if (Id == null) return;
  if (flag == 0) console.log(Id);
  stack.push(modelViewMatrix);
  modelViewMatrix = mult(modelViewMatrix, figure[Id].transform);
  figure[Id].render();
  if (figure[Id].child != null) traverse(figure[Id].child);
  modelViewMatrix = stack.pop();
  if (figure[Id].sibling != null) traverse(figure[Id].sibling);
  flag += 1;
}

function torso() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * torsoHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(torsoWidth, torsoHeight, torsoWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function eye() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * eyeHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(eyeWidth, eyeHeight, eyeWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function upperLeg() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * upperLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(upperLegWidth, upperLegHeight, upperLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function lowerLeg() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * lowerLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(lowerLegWidth, lowerLegHeight, lowerLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}

function midLeg() {

  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * midLegHeight, 0.0));
  instanceMatrix = mult(instanceMatrix, scale4(midLegWidth, midLegHeight, midLegWidth));
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix));
  for (var i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4);
}


function quad(a, b, c, d) {
  var color = vec4(Math.random(), Math.random(), Math.random(), 1.0);
  // var color = vec4(203 / 255, 137 / 255, 127 / 255, 1.0);
  pointsArray.push(vertices[a]);
  colorArray.push(color);
  pointsArray.push(vertices[b]);
  colorArray.push(color);
  pointsArray.push(vertices[c]);
  colorArray.push(color);
  pointsArray.push(vertices[d]);
  colorArray.push(color);
}


function cube() {
  quad(1, 0, 3, 2);
  quad(2, 3, 7, 6);
  quad(3, 0, 4, 7);
  quad(6, 5, 1, 2);
  quad(4, 5, 6, 7);
  quad(5, 4, 0, 1);
}


window.onload = function init() {

  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader");


  gl.useProgram(program);
  console.log(gl.getProgramInfoLog(program))

  instanceMatrix = mat4();

  projectionMatrix = ortho(-100.0, 100.0, -100.0, 100.0, -100.0, 100.0);
  modelViewMatrix = mat4();


  gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewMatrix"), false, flatten(modelViewMatrix));
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

  cube();

  vBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colorArray), gl.STATIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  document.getElementById("x_slider").onchange = function () {
    theta[selectedBodyPart] = event.srcElement.value;
    initNodes(selectedBodyPart);
  };
  document.getElementById("y_slider").onchange = function () {
    theta[selectedBodyPart + 1] = event.srcElement.value;
    initNodes(selectedBodyPart);
  };
  document.getElementById("z_slider").onchange = function () {
    theta[selectedBodyPart + 2] = event.srcElement.value;
    initNodes(selectedBodyPart);
  };
  document.getElementById("body_parts_select").onchange = function () {
    console.log(event.srcElement.value);
    selectedBodyPart = parseInt(event.srcElement.value);
  };
  for (i = 0; i < numNodes; i += 3) initNodes(i);
  render();
}


var render = function () {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  traverse(torsoId);
  requestAnimFrame(render);

}