import { getCoordinatesOfIsoscelesTriangles, NUMBER_OF_SQUARES_IN_A_ROW, INITIAL_COLOR } from './utils.js'; 

const canvas = document.getElementById('gl-canvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Your browser does not support WebGL');
}

const vertexData = [];


// make the vertex points such that the whole canvas is a 30x30 grid
for( let i = 0; i <= NUMBER_OF_SQUARES_IN_A_ROW; i++ ){
    for( let j = 0; j < NUMBER_OF_SQUARES_IN_A_ROW; j++ ){
        vertexData.push(...getCoordinatesOfIsoscelesTriangles(
            -1 + 2*i/NUMBER_OF_SQUARES_IN_A_ROW, -1 + 2*j/NUMBER_OF_SQUARES_IN_A_ROW,
            -1 + 2*(i+1)/NUMBER_OF_SQUARES_IN_A_ROW, -1 + 2*(j+1)/NUMBER_OF_SQUARES_IN_A_ROW
        )); 
    }
} 


const colorData = [];
for( let i = 0; i < vertexData.length/3; i++ ){
    colorData.push(0,1,1);
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW);


const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW);


const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
precision mediump float;
attribute vec3 position;
varying vec3 fColor;
attribute vec3 vColor;

void main() {
    gl_Position = vec4(position,  1);
    fColor = vColor;

}
`);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
precision mediump float;
varying vec3 fColor;

void main() {
    gl_FragColor = vec4(fColor, 1);
}
`);
gl.compileShader(fragmentShader);
console.log(gl.getShaderInfoLog(fragmentShader));

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

const positionLocation = gl.getAttribLocation(program, `position`);
gl.enableVertexAttribArray(positionLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);


const colorLocation = gl.getAttribLocation(program, `vColor`);
gl.enableVertexAttribArray(colorLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);


gl.useProgram(program);
gl.drawArrays(gl.TRIANGLES, 0, vertexData.length/3);
