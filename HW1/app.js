/*
* eraser düzelicek (z index)
*/
/* 
*/
var canvas;
var gl;

var scale = 1;
var maxNumTriangles = 3600;
var maxNumVertices = 3 * maxNumTriangles;
var index = 0;
UNIT_SQUARE_DIM = 20
var MAX_NUMBER_OF_UNDO = 20;
var MAX_NUMBER_OF_REDO = 20;
var undoIndexArray = [];
var undoCounter = 0;
var redoIndexArray = [];
var vertexData = [];
var colorData = [];
var rectangularSelectTrianglesIndex = [];
var currentActiveZIndex = -1;
var rectangularCopyGrayAreaTransitionVector = vec2(0, 0);

var redraw = false;
var eraseMode = false;
var zoomMode = false;
var rectangularSelectMode = false;
var rectangularSelectCopyMode = false;
var rectangularSelectTransitionMode = false;
var rectangularSelectCopyTransitionMode = false;
var rectangularSelectBeginnngPoint = null;
var rectangularSelectEndingPoint = null;


var colors = [
  vec4(0.0, 0.0, 0.0, 1.0),  // black
  vec4(1.0, 0.0, 0.0, 1.0),  // red
  vec4(0.0, 1.0, 0.0, 1.0),  // green
  vec4(0.0, 0.0, 1.0, 1.0),  // blue
  vec4(1.0, 1.0, 0.0, 1.0),  // yellow
  vec4(1.0, 0.0, 1.0, 1.0),  // magenta
  vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

var selectedColor = colors[0];

function transformPoints(x, y) {
  var t = vec3(2 * x / canvas.width - 1,
    2 * (canvas.height - y) / canvas.height - 1, currentActiveZIndex);
  return t;
}

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  canvas.addEventListener("mousedown", function (event) {
    redraw = true;
    if (rectangularSelectMode) {
      redraw = false;
      // get the coordinates of the mouse click
      rectangularSelectBeginnngPoint = transformPoints(event.layerX, event.layerY);
    } else if (rectangularSelectCopyMode) {
      redraw = false;
      // get the coordinates of the mouse click
      rectangularSelectBeginnngPoint = transformPoints(event.layerX, event.layerY);
    }
  });
  
  document.getElementById("rectangularSelectCopy").onclick = function (event) {
    rectangularSelectCopyMode = !rectangularSelectCopyMode;
    if (rectangularSelectCopyMode) {
      document.getElementById("rectangularSelectCopy").innerHTML = "Rectangular Select Copy is Active";
    } else {
      document.getElementById("rectangularSelectCopy").innerHTML = "Rectangular Select Copy is Inactive";
    }
  }

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Define variables to keep track of keys being pressed
var keys = {
    'w': false,
    'a': false,
    's': false,
    'd': false,
    'c': false,
    'p': false,
};


function handleKeyDown(event) {
    if (event.key in keys) {
        keys[event.key] = true;
        if (keys['w'] || keys['a'] || keys['s'] || keys['d']) {
            moveSelectedTriangles();
        }
        else if (keys['c']) {
          console.log(rectangularSelectCopyMode, rectangularSelectMode);
          if (rectangularSelectMode || rectangularSelectCopyMode) {
            finishRectangularSelect();
          } 
        } 
        else if (keys['p']) {
          pasteSelectedTriangles();
        }
    } 
}

function pasteSelectedTriangles() {
  if (rectangularSelectCopyMode && keys['p']) {
    var newVerticesToPaste = [];

    for (var i = 0; i < rectangularSelectTrianglesIndex.length; i++) {
      var triangleIndex = rectangularSelectTrianglesIndex[i];
      for (var j = 0; j < 9; j += 3) {
        var temp = vec3(vertexData[triangleIndex + j], vertexData[triangleIndex + j + 1], vertexData[triangleIndex + j + 2]);
        newVerticesToPaste.push(temp);
      }
    }

    //also get the color data for new vertices to paste
    var newColorsToPaste = [];
    for (var i = 0; i < rectangularSelectTrianglesIndex.length; i++) {
      var triangleIndex = rectangularSelectTrianglesIndex[i] * 4 / 3;
      for (var j = 0; j < 12; j+=4) {
        var temp = vec4(colorData[triangleIndex + j], colorData[triangleIndex + j + 1], colorData[triangleIndex + j + 2], colorData[triangleIndex + j + 3]);
        newColorsToPaste.push(temp);
      }
    }

    //translate the new vertices according to rectangularCopyGrayAreaTransitionVector
    for (var i = 0; i < newVerticesToPaste.length; i++ ) {
      newVerticesToPaste[i][0] += rectangularCopyGrayAreaTransitionVector[0];
      newVerticesToPaste[i][1] += rectangularCopyGrayAreaTransitionVector[1];
    }

    var tempArrayForGrayAreaVertices = [];
    var tempArrayForGrayAreaColors = [];

    //remove the gray area from the vertex and color buffers
    var rectStartIndexVertex = vertexData.length - 18; // Index of the first vertex of the rectangular area
    var rectStartIndexColor = colorData.length - 24; // Index of the first color of the rectangular area

    for (var i = rectStartIndexVertex; i < vertexData.length; i++) {
      tempArrayForGrayAreaVertices.push(vertexData[i]);
    }

    for (var i = rectStartIndexColor; i < colorData.length; i++) {
      tempArrayForGrayAreaColors.push(colorData[i]);
    }

    vertexData = vertexData.slice(0, rectStartIndexVertex);
    colorData = colorData.slice(0, rectStartIndexColor);
      

    vertexData.push(...(newVerticesToPaste.flat()));
    colorData.push(...(newColorsToPaste.flat()));

    vertexData.push(...(tempArrayForGrayAreaVertices.flat()));
    colorData.push(...(tempArrayForGrayAreaColors.flat()));

    //update the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertexData));

    //update the color buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorData));

    //draw the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    index = vertexData.length / 3;
    gl.drawArrays(gl.TRIANGLES, 0, index);

  }
}


function handleKeyUp(event) {
    if (event.key in keys) {
        keys[event.key] = false;
    }
}

function finishRectangularSelect() {
  console.log(rectangularSelectCopyTransitionMode);
  if (rectangularSelectTransitionMode && keys['c']) {
      // Reset the rectangular selection mode
      rectangularSelectMode = false;
      rectangularSelectTransitionMode = false;

      var newVertexData = [];
      var newColorData = [];

      // Remove the gray rectangle from the vertex and color buffers
      var rectStartIndexVertex = vertexData.length - 18; // Index of the first vertex of the rectangular area
      var rectStartIndexColor = colorData.length - 24; // Index of the first color of the rectangular area


      for (var i = 0; i < rectStartIndexVertex; i++) {
        newVertexData.push(vertexData[i]);
      }

      for (var i = 0; i < rectStartIndexColor; i++) {
        newColorData.push(colorData[i]);
      }

      vertexData = newVertexData;
      colorData = newColorData;
      index = vertexData.length / 3;

      // bind the vertex buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertexData));

      // bind the color buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorData));

      // Draw the canvas
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, index);

      // Reset the selected triangles
      rectangularSelectTrianglesIndex = [];
      document.getElementById("rectangularSelect").innerHTML = "Rectangular Select is Inactive";

  } else if (rectangularSelectCopyTransitionMode && keys['c']) {
          // Reset the rectangular selection mode
          rectangularSelectCopyMode = false;
          rectangularSelectCopyTransitionMode = false;
    
          var newVertexData = [];
          var newColorData = [];
    
          // Remove the gray rectangle from the vertex and color buffers
          var rectStartIndexVertex = vertexData.length - 18; // Index of the first vertex of the rectangular area
          var rectStartIndexColor = colorData.length - 24; // Index of the first color of the rectangular area
    
    
          for (var i = 0; i < rectStartIndexVertex; i++) {
            newVertexData.push(vertexData[i]);
          }
    
          for (var i = 0; i < rectStartIndexColor; i++) {
            newColorData.push(colorData[i]);
          }
    
          vertexData = newVertexData;
          colorData = newColorData;
          index = vertexData.length / 3;

          rectangularCopyGrayAreaTransitionVector = vec2(0, 0);

          // bind the vertex buffer
          gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertexData));

          // bind the color buffer
          gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
          gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorData));
    
          // Draw the canvas
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          gl.drawArrays(gl.TRIANGLES, 0, index);
    
    
          // Reset the selected triangles
          rectangularSelectTrianglesIndex = [];
          document.getElementById("rectangularSelectCopy").innerHTML = "Rectangular Select Copy is Inactive";
  }
}



function moveSelectedTriangles() {
  if (rectangularSelectTrianglesIndex.length > 0 && rectangularSelectTransitionMode) {
      var deltaX = 0;
      var deltaY = 0;

      if (keys['w']) {
          deltaY += 1/30;
      }
      if (keys['a']) {
          deltaX -= 1/30;
      }
      if (keys['s']) {
          deltaY -= 1/30;
      }
      if (keys['d']) {
          deltaX += 1/30;
      }

      var moveStartIndex = vertexData.length - 18 - rectangularSelectTrianglesIndex.length * 9; // Index of the first vertex of the rectangular area

      for (var i = moveStartIndex; i < vertexData.length; i+= 3) {
          vertexData[i] += deltaX;
          vertexData[i + 1] += deltaY;
      }

      // Update the vertex buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertexData));

      // Draw the canvas
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);

      

  } else if (rectangularSelectTrianglesIndex.length > 0 && rectangularSelectCopyTransitionMode) {
    deltaX = 0;
    deltaY = 0;

    if (keys['w']) {
        deltaY += 0.1;
    }
    if (keys['a']) {
        deltaX -= 0.1;
    }
    if (keys['s']) {
        deltaY -= 0.1;
    }
    if (keys['d']) {
        deltaX += 0.1;
    }

    rectangularCopyGrayAreaTransitionVector[0] += deltaX;
    rectangularCopyGrayAreaTransitionVector[1] += deltaY;

      // Update positions of the gray rectangle
      var rectStartIndex = vertexData.length - 18; // Index of the first vertex of the rectangular area
      for (var i = 0; i < 6; i++) {
          vertexData[rectStartIndex + i * 3] += deltaX;
          vertexData[rectStartIndex + i * 3 + 1] += deltaY;
      }

      // Update the vertex buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertexData));

      // Draw the canvas
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, vertexData.length / 3);
    }

}


  canvas.addEventListener("mouseup", function (event) {
    if (rectangularSelectMode) {
      
      // get the coordinates of the mouse release
      rectangularSelectEndingPoint = transformPoints(event.layerX, event.layerY);
      // find the min and max x and y values
      var minX = Math.min(rectangularSelectBeginnngPoint[0], rectangularSelectEndingPoint[0]);
      var maxX = Math.max(rectangularSelectBeginnngPoint[0], rectangularSelectEndingPoint[0]);
      var minY = Math.min(rectangularSelectBeginnngPoint[1], rectangularSelectEndingPoint[1]);
      var maxY = Math.max(rectangularSelectBeginnngPoint[1], rectangularSelectEndingPoint[1]);

      //find all triangles that are inside the rectangle

      console.log(vertexData.length, colorData.length, "before");
      rectangularSelectTrianglesIndex = [];
      var  tempVertexStorageData = [];
      var tempColorStorageData = [];
      for (var i = 0; i < vertexData.length; i += 9) {
        var vertex1 = vertexData.slice(i, i + 3);
        var vertex2 = vertexData.slice(i + 3, i + 6);
        var vertex3 = vertexData.slice(i + 6, i + 9);
        if (vertex1[0] >= minX && vertex1[0] <= maxX && vertex1[1] >= minY && vertex1[1] <= maxY &&
          vertex2[0] >= minX && vertex2[0] <= maxX && vertex2[1] >= minY && vertex2[1] <= maxY &&
          vertex3[0] >= minX && vertex3[0] <= maxX && vertex3[1] >= minY && vertex3[1] <= maxY && 
          vertex1[2] == Number(currentActiveZIndex) && vertex2[2] == Number(currentActiveZIndex) && vertex3[2] == Number(currentActiveZIndex)) {
          rectangularSelectTrianglesIndex.push(i);
          tempVertexStorageData.push(...vertex1);
          tempVertexStorageData.push(...vertex2);
          tempVertexStorageData.push(...vertex3);
        }
      }

      var rectangularSelectTrianglesColorIndex = rectangularSelectTrianglesIndex.map(x => x * 4 / 3);

      for (var i = 0; i < rectangularSelectTrianglesColorIndex.length; i++) {
        var color1 = colorData.slice(rectangularSelectTrianglesColorIndex[i], rectangularSelectTrianglesColorIndex[i] + 4);
        var color2 = colorData.slice(rectangularSelectTrianglesColorIndex[i] + 4, rectangularSelectTrianglesColorIndex[i] + 8);
        var color3 = colorData.slice(rectangularSelectTrianglesColorIndex[i] + 8, rectangularSelectTrianglesColorIndex[i] + 12);
        tempColorStorageData.push(...color1);
        tempColorStorageData.push(...color2);
        tempColorStorageData.push(...color3);
      }

      var newArrayData = [];
      var newArrayColorData = [];
      for (var i = 0; i < vertexData.length; i+=9) {
        var vertex1 = vertexData.slice(i, i + 3);
        var vertex2 = vertexData.slice(i + 3, i + 6);
        var vertex3 = vertexData.slice(i + 6, i + 9);
        if (rectangularSelectTrianglesIndex.includes(i)) {
          continue;
        } else {
          newArrayData.push(...vertex1);
          newArrayData.push(...vertex2);
          newArrayData.push(...vertex3);
        }
      }

      for (var i = 0; i < colorData.length; i+=12) {
        var color1 = colorData.slice(i, i + 4);
        var color2 = colorData.slice(i + 4, i + 8);
        var color3 = colorData.slice(i + 8, i + 12);

        if (rectangularSelectTrianglesColorIndex.includes(i)) {
          continue;
        } else {
          newArrayColorData.push(...color1);
          newArrayColorData.push(...color2);
          newArrayColorData.push(...color3);
        }

      }

      vertexData = newArrayData;
      colorData = newArrayColorData;

      vertexData.push(...tempVertexStorageData);
      colorData.push(...tempColorStorageData);
      
      var vertices = [
        minX, minY, 1,
        minX, maxY, 1,
        maxX, maxY, 1,
        maxX, minY, 1,
        minX, minY, 1,
        maxX, maxY, 1
      ];

      vertexData.push(...vertices);
      
      //update the color buffer
      // colors are vec4 objects
      var newColors = [];
      for (var i = 0; i < 6; i++) {
        newColors.push(0, 0, 0, 0.2);
      }

      colorData.push(...newColors);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertexData));

      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(colorData));


      //draw the canvas
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      index = vertexData.length / 3;
      gl.drawArrays(gl.TRIANGLES, 0, index);
      rectangularSelectMode = true;
      rectangularSelectTransitionMode = true;
    } else if (rectangularSelectCopyMode) {
        
      // get the coordinates of the mouse release
      rectangularSelectEndingPoint = transformPoints(event.layerX, event.layerY);
      // find the min and max x and y values
      var minX = Math.min(rectangularSelectBeginnngPoint[0], rectangularSelectEndingPoint[0]);
      var maxX = Math.max(rectangularSelectBeginnngPoint[0], rectangularSelectEndingPoint[0]);
      var minY = Math.min(rectangularSelectBeginnngPoint[1], rectangularSelectEndingPoint[1]);
      var maxY = Math.max(rectangularSelectBeginnngPoint[1], rectangularSelectEndingPoint[1]);

      //find all triangles that are inside the rectangle
      rectangularSelectTrianglesIndex = [];
      for (var i = 0; i < vertexData.length; i += 9) {
        var vertex1 = vertexData.slice(i, i + 3);
        var vertex2 = vertexData.slice(i + 3, i + 6);
        var vertex3 = vertexData.slice(i + 6, i + 9);
        if (vertex1[0] >= minX && vertex1[0] <= maxX && vertex1[1] >= minY && vertex1[1] <= maxY &&
          vertex2[0] >= minX && vertex2[0] <= maxX && vertex2[1] >= minY && vertex2[1] <= maxY &&
          vertex3[0] >= minX && vertex3[0] <= maxX && vertex3[1] >= minY && vertex3[1] <= maxY && 
          vertex1[2] == Number(currentActiveZIndex) && vertex2[2] == Number(currentActiveZIndex) && vertex3[2] == Number(currentActiveZIndex)) {
          rectangularSelectTrianglesIndex.push(i);
        }
      }

      // draw a gray rectangle on the canvas using 2 triangles
      //update the vertex buffer
      // vertices are vec3 objects

      var vertices = [
        vec3(minX, minY, 1),
        vec3(minX, maxY, 1),
        vec3(maxX, maxY, 1),
        vec3(maxX, minY, 1),
        vec3(minX, minY, 1),
        vec3(maxX, maxY, 1)
      ];

      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 12 * index, flatten(vertices));
      vertexData.push(...(vertices.flat()));

      //update the color buffer
      // colors are vec4 objects
      var newColors = [];
      for (var i = 0; i < 6; i++) {
        newColors.push(vec4(0, 0, 0, 0.2));
      }

      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(newColors));
      colorData.push(...(newColors.flat()));


      //draw the canvas
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      index = vertexData.length / 3;
      gl.drawArrays(gl.TRIANGLES, 0, index);
      rectangularSelectCopyMode = true;
      rectangularSelectCopyTransitionMode = true;
    }

    redraw = false;
    if (undoIndexArray.length == MAX_NUMBER_OF_UNDO) {
      undoIndexArray.shift();
    }
    undoIndexArray.push(undoCounter);
    undoCounter = 0;
  });

  document.getElementById("erase").onclick = function (event) {
    eraseMode = !eraseMode;
    if (eraseMode) {
      document.getElementById("erase").innerHTML = "Draw";
    } else {
      document.getElementById("erase").innerHTML = "Erase";
    }
  }
  
  canvas.addEventListener("mousemove", function (event) {
    if (zoomMode && !eraseMode && redraw && !rectangularSelectMode && !rectangularSelectCopyMode) {
      console.log("zooming");
      // find a transition vector for moving objects on the canvas
      var deltaX = event.movementX;
      var deltaY = event.movementY * -1;

      // scale the transition vector
      deltaX *= 1 / scale;
      deltaY *= 1 / scale;

      //normalize the transition vector
      var normalizedDeltaX = deltaX / canvas.width;
      var normalizedDeltaY = deltaY / canvas.height;

      //apply the transition vector to vertices
      for (var i = 0; i < vertexData.length; i += 3) {
        vertexData[i] += normalizedDeltaX;
        vertexData[i + 1] += normalizedDeltaY;
      }

      //update the vertex buffer
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertexData));

      //draw the canvas
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, index);

    }

    else if (!eraseMode && redraw && !zoomMode && !rectangularSelectMode && !rectangularSelectCopyMode) {
      console.log({vertexData, colorData});
      var squareX = Math.floor(event.layerX / UNIT_SQUARE_DIM);
      var squareY = Math.floor(event.layerY / UNIT_SQUARE_DIM);
      // Calculate the center of the square unit
      var squareCenterX = squareX * UNIT_SQUARE_DIM + (UNIT_SQUARE_DIM / 2);
      var squareCenterY = squareY * UNIT_SQUARE_DIM + (UNIT_SQUARE_DIM / 2);

      // Calculate the relative distance from the mouse to the square center
      var deltaX = event.layerX - squareCenterX;
      var deltaY = event.layerY - squareCenterY;
      // Determine which triangle within the square the mouse is on
      let vertices = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Mouse is closer to the left or right triangle
        if (deltaX < 0) {
          vertices = [
            transformPoints(squareX * UNIT_SQUARE_DIM, squareY * UNIT_SQUARE_DIM),
            transformPoints(squareX * UNIT_SQUARE_DIM, (squareY + 1) * UNIT_SQUARE_DIM),
            transformPoints(squareCenterX, squareCenterY)
          ];
        } else {
          vertices = [
            transformPoints((squareX + 1) * UNIT_SQUARE_DIM, squareY * UNIT_SQUARE_DIM),
            transformPoints((squareX + 1) * UNIT_SQUARE_DIM, (squareY + 1) * UNIT_SQUARE_DIM),
            transformPoints(squareCenterX, squareCenterY)
          ];
        }
      } else {
        // Mouse is closer to the top or bottom triangle
        if (deltaY < 0) {
          vertices = [
            transformPoints(squareX * UNIT_SQUARE_DIM, squareY * UNIT_SQUARE_DIM),
            transformPoints((squareX + 1) * UNIT_SQUARE_DIM, squareY * UNIT_SQUARE_DIM),
            transformPoints(squareCenterX, squareCenterY)
          ];
        } else {
          vertices = [
            transformPoints(squareX * UNIT_SQUARE_DIM, (squareY + 1) * UNIT_SQUARE_DIM),
            transformPoints((squareX + 1) * UNIT_SQUARE_DIM, (squareY + 1) * UNIT_SQUARE_DIM),
            transformPoints(squareCenterX, squareCenterY)
          ];
        }
      }
      undoCounter = undoCounter + 3;
      
      //update the vertex buffer
      // vertices are vec4 objects
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 12 * index, flatten(vertices));
      vertexData.push(...vertices.flat());

      //update the color buffer
      // colors are vec4 objects
      var newColors = [];
      for (var i = 0; i < 3; i++) {
        newColors.push(selectedColor);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(newColors));
      colorData.push(...newColors.flat());

      //draw the canvas
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      index += 3;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, index);
    }

    else if (eraseMode && redraw && !zoomMode) {
      console.log("erasing");
      var squareX = Math.floor(event.layerX / UNIT_SQUARE_DIM);
      var squareY = Math.floor(event.layerY / UNIT_SQUARE_DIM);
      // Calculate the center of the square unit
      var squareCenterX = squareX * UNIT_SQUARE_DIM + (UNIT_SQUARE_DIM / 2);
      var squareCenterY = squareY * UNIT_SQUARE_DIM + (UNIT_SQUARE_DIM / 2);

      // Calculate the relative distance from the mouse to the square center
      var deltaX = event.layerX - squareCenterX;
      var deltaY = event.layerY - squareCenterY;
      // Determine which triangle within the square the mouse is on
      let vertices = null;
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Mouse is closer to the left or right triangle
        if (deltaX < 0) {
          vertices = [
            transformPoints(squareX * UNIT_SQUARE_DIM, squareY * UNIT_SQUARE_DIM),
            transformPoints(squareX * UNIT_SQUARE_DIM, (squareY + 1) * UNIT_SQUARE_DIM),
            transformPoints(squareCenterX, squareCenterY)
          ];
        } else {
          vertices = [
            transformPoints((squareX + 1) * UNIT_SQUARE_DIM, squareY * UNIT_SQUARE_DIM),
            transformPoints((squareX + 1) * UNIT_SQUARE_DIM, (squareY + 1) * UNIT_SQUARE_DIM),
            transformPoints(squareCenterX, squareCenterY)
          ];
        }
      } else {
        // Mouse is closer to the top or bottom triangle
        if (deltaY < 0) {
          vertices = [
            transformPoints(squareX * UNIT_SQUARE_DIM, squareY * UNIT_SQUARE_DIM),
            transformPoints((squareX + 1) * UNIT_SQUARE_DIM, squareY * UNIT_SQUARE_DIM),
            transformPoints(squareCenterX, squareCenterY)
          ];
        } else {
          vertices = [
            transformPoints(squareX * UNIT_SQUARE_DIM, (squareY + 1) * UNIT_SQUARE_DIM),
            transformPoints((squareX + 1) * UNIT_SQUARE_DIM, (squareY + 1) * UNIT_SQUARE_DIM),
            transformPoints(squareCenterX, squareCenterY)
          ];
        }
      }
      //remove vertices all vertices elements from the vertexData array
      var newVertexData = [];
      var newColorData = [];
      var found = false;
      var k = 0;

      function compareWithEpsilon(a, b) {
        return Math.abs(a - b) <  0.06;
      }

      for (var i = 0; i < vertexData.length; i += 9) {
        var vertex = vertexData.slice(i, i + 9);
        var color = colorData.slice(k, k + 12);

        // check if vertices exists in the vertex buffer and if exists don't add it to the new vertex buffer
        if (compareWithEpsilon(vertex[0], vertices[0][0]) && compareWithEpsilon(vertex[1], vertices[0][1]) &&
          compareWithEpsilon(vertex[3], vertices[1][0]) && compareWithEpsilon(vertex[4], vertices[1][1]) &&
          compareWithEpsilon(vertex[6], vertices[2][0]) && compareWithEpsilon(vertex[7], vertices[2][1]) &&
          vertex[2] == Number(currentActiveZIndex) && vertex[5] == Number(currentActiveZIndex) && vertex[8] == Number(currentActiveZIndex)) {
            
          found = true;
          index -= 3;
        } else {
          newVertexData.push(...vertex);
          newColorData.push(...color);
        }
        k += 12;
      }
      if (found) {
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(newVertexData));
        vertexData = newVertexData;
        //remove vertices from the color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(newColorData));
        colorData = newColorData;
      }
    }
  });

  document.getElementById("ColorPicker").onclick = function (event) {
    switch (event.target.index) {
      case 0:
        selectedColor = colors[0];
        break;
      case 1:
        selectedColor = colors[1];
        break;
      case 2:
        selectedColor = colors[2];
        break;
      case 3:
        selectedColor = colors[3];
        break;
      case 4:
        selectedColor = colors[4];
        break;
      case 5:
        selectedColor = colors[5];
        break;
      case 6:
        selectedColor = colors[6];
        break;
    }
  };

  document.getElementById("LayerControls").onclick = function (event) {
    switch (event.target.index) {
      case 0:
        currentActiveZIndex = -1;
        break;
      case 1:
        currentActiveZIndex = 0;
        break;
      case 2:
        currentActiveZIndex = 0.9;
        break;
    }
  }

  document.getElementById("ZoomControls").onclick = function (event) {
    switch (event.target.index) {
      case 0:
        scale += 0.2;
        break;
      case 1:
        if (scale > 0.2){
          scale -= 0.2;
        }
        break;
    }
    scaleLoc = gl.getUniformLocation(program, "scale");
    gl.uniform1f(scaleLoc, scale);
    document.getElementById("zoomScale").innerHTML = "Zoom Scale: " + scale.toFixed(1);
    zoomMode = scale != 1;
  };

  document.getElementById("rectangularSelect").onclick = function (event) {
    rectangularSelectMode = !rectangularSelectMode;
    if (rectangularSelectMode) {
      document.getElementById("rectangularSelect").innerHTML = "Rectangular Select is Active";
    } else {
      document.getElementById("rectangularSelect").innerHTML = "Rectangular Select is Inactive";
    }
  }

  document.getElementById("save").onclick = function (event) {
    // Save and load options for the current canvas. It is enough to keep the vertex, index, and color information; 
    // you do not need to save the scale or the selected color.
    var saveData = {
        "index": index * 8,
        "vertices": flatten(vertexData),
        "colors": flatten(colorData)
    };

    //download save data as a file
    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(saveData));
    var a = document.createElement('a');
    a.href = 'data:' + data;
    a.download = 'data.json';
    a.innerHTML = 'download JSON';
    a.click();

  };
  
  document.getElementById("load").onchange = function (event) {
    // Load the saved data into the current canvas. 
    // You should clear the current canvas before loading the saved data.
    var file = event.target.files[0];
    var reader = new FileReader();
    reader.onload = function (event) {
        var saveData = JSON.parse(event.target.result);
        index = saveData.index / 8;
        newVertices = Object.values(saveData.vertices);
        newColors = Object.values(saveData.colors);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(newVertices));
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(newColors));

        gl.drawArrays(gl.TRIANGLES, 0, index);
        vertexData.push(...newVertices);
        colorData.push(...newColors);
    };
    reader.readAsText(file);

    this.value = null;
  };

   document.getElementById("undo").onclick = function (event) {
    if (undoIndexArray.length > 0) {
      var decrease_index = undoIndexArray.pop();
      redoIndexArray.push(decrease_index);
      index -= decrease_index;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, index);
    } else {
      alert("Nothing to undo");
    }
   };

   document.getElementById("redo").onclick = function (event) {
    if (redoIndexArray.length > 0) {
      var increase_index = redoIndexArray.pop();
      undoIndexArray.push(increase_index);
      index += increase_index;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, index);
   } else {
      alert("Nothing to redo");
   } 
  }


const layerControls = document.getElementById("LayerControls");
const moveLayerUpButton = document.getElementById("moveCurrentLayerUp");
const moveLayerDownButton = document.getElementById("moveCurrentLayerDown");

moveLayerUpButton.onclick = function() {
    var selectedOption = layerControls.options[layerControls.selectedIndex];
    var currentIndex = selectedOption.index;

    if (currentIndex > 0) {
        var z_current = Number(selectedOption.value);
        var z_above = Number(layerControls.options[currentIndex - 1].value);
        var z_third = currentIndex === 2 ?  -1 : 0.9;

        // Swap the current option with the one above it
        // also update values of options such that the z-index is swapped
        // top layer has z-index of -1, middle layer has z-index of 0, bottom layer has z-index of 1
        var previousOption = layerControls.options[currentIndex - 1];
        var tempValue = Number(selectedOption.value);
        var tempText = selectedOption.text;

        selectedOption.text = previousOption.text;

        previousOption.text = tempText;

        // Change the selected index to maintain user selection
        layerControls.selectedIndex = currentIndex - 1;


        // update vertexData and colorData such that the selected layer is on top and swap the z-index with the layer above it
        for (var i = 0; i < vertexData.length; i += 3) {
            var x = vertexData[i];
            var y = vertexData[i + 1];
            var z = vertexData[i + 2];
            if (z == z_current) {
                vertexData[i + 2] = z_above;
            } else if (z == z_above) {
                vertexData[i + 2] = z_current;
            } else {
                vertexData[i + 2] = z_third;
            }
        }
        currentActiveZIndex = Number(z_above);

        //update the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertexData));

        //draw the canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, index);
    } else {
        alert("Cannot move layer up, already at top");
    }
};

moveLayerDownButton.onclick = function() {
    const selectedOption = layerControls.options[layerControls.selectedIndex];
    const currentIndex = selectedOption.index;

    if (currentIndex < layerControls.length - 1) {
        var z_current = Number(selectedOption.value);
        var z_below = Number(layerControls.options[currentIndex + 1].value); 
        var z_third = currentIndex === 0 ? 0.9 : -1;
        // Swap the current option with the one below it
        const nextOption = layerControls.options[currentIndex + 1];
        const tempText = selectedOption.text;

        selectedOption.text = nextOption.text;
        nextOption.text = tempText;

        // Change the selected index to maintain user selection
        layerControls.selectedIndex = currentIndex + 1;


        // update vertexData and colorData such that the selected layer is on top and swap the z-index with the layer above it


        for (var i = 0; i < vertexData.length; i += 3) {
            var x = vertexData[i];
            var y = vertexData[i + 1];
            var z = vertexData[i + 2];
            if (z == z_current) {
                vertexData[i + 2] = z_below;
            } else if (z == z_below) {
                vertexData[i + 2] = z_current;
            } else {
                vertexData[i + 2] = z_third;
            }
        }
        currentActiveZIndex = Number(z_below);

        //update the vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertexData));

        //draw the canvas
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, index);
    } else {
        alert("Cannot move layer down, already at bottom");
    }
};


  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1.0);


  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 12 * maxNumVertices, gl.DYNAMIC_DRAW);

  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  scaleLoc = gl.getUniformLocation(program, "scale");
  gl.uniform1f(scaleLoc, scale);


  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 16 * maxNumVertices, gl.DYNAMIC_DRAW);

  var vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);


  render();
}


function render() {

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, index);

  setTimeout(
    function () { requestAnimFrame(render); },
    50
  );

}