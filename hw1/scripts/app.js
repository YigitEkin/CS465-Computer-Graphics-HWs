/*
1 done
2 done
3 done
4 done 
5 eraser
6 done
7 rectangular selection
8 rectangular selection copy
9 3 layers
10 done
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
var currentActiveZIndex = -0.5;

var redraw = false;
var eraseMode = false;
var zoomMode = false;


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

  });

  canvas.addEventListener("mouseup", function (event) {
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

    if (zoomMode && !eraseMode && redraw) {
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

    if (!eraseMode && redraw && !zoomMode) {
      var squareX = Math.floor(event.clientX / UNIT_SQUARE_DIM);
      var squareY = Math.floor(event.clientY / UNIT_SQUARE_DIM);
      // Calculate the center of the square unit
      var squareCenterX = squareX * UNIT_SQUARE_DIM + (UNIT_SQUARE_DIM / 2);
      var squareCenterY = squareY * UNIT_SQUARE_DIM + (UNIT_SQUARE_DIM / 2);

      // Calculate the relative distance from the mouse to the square center
      var deltaX = event.clientX - squareCenterX;
      var deltaY = event.clientY - squareCenterY;
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

      
      //update the vertex buffer
      // vertices are vec4 objects
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 12 * index, flatten(vertices));
      vertexData.push(...flatten(vertices));

      //update the color buffer
      // colors are vec4 objects
      var newColors = [];
      for (var i = 0; i < 3; i++) {
        newColors.push(selectedColor);
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 16 * index, flatten(newColors));
      colorData.push(...flatten(newColors));

      //draw the canvas
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      index += 3;
      undoCounter += 3;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, index + 3);
    }

    if (eraseMode && redraw && !zoomMode) {
      //TODO: erase mode
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
      case -0.5:
        currentActiveZIndex = -0.5;
        break;
      case 0:
        currentActiveZIndex = 0;
        break;
      case 0.5:
        currentActiveZIndex = 0.5;
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
    document.getElementById("zoomScale").innerHTML = scale.toFixed(1);
    zoomMode = scale != 1;
  };

  document.getElementById("ClearButton").onclick = function (event) {
    index = 0;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    undoIndexArray = [];
    undoCounter = 0;
    redoIndexArray = [];
  };

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

    console.log(saveData);
  };
  
  document.getElementById("load").onchange = function (event) {
    // Load the saved data into the current canvas. 
    // You should clear the current canvas before loading the saved data.
    var file = event.target.files[0];
    var reader = new FileReader();
    document.getElementById("ClearButton").click();
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
           gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, index);
         } else {
            alert("Nothing to redo");
        }

    }


  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1.0);


  //
  //  Load shaders and initialize attribute buffers
  //
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);


  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, 8 * maxNumVertices, gl.DYNAMIC_DRAW);

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