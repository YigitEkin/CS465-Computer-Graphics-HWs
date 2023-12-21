var program;
var vBuffer, nBuffer, texCoordBuffer;
var CURRENT_RENDERING = "wire"
var CURRENT_TEXTURE = "textures/checkerboard.png"

function init_phong_shader(){
    program = initShaders(gl, "phong-vertex-shader", "phong-fragment-shader");
    gl.useProgram(program);

    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(camera.view_matrix));

    fViewMatrixLoc = gl.getUniformLocation(program, "fViewMatrix");
    gl.uniformMatrix4fv(fViewMatrixLoc, false, flatten(camera.view_matrix));
    

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(camera.projection_matrix));
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    var vPositionLoc = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPositionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPositionLoc );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    var vNormalLoc = gl.getAttribLocation( program, "vNormal" );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    gl.vertexAttribPointer( vNormalLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormalLoc );

    var lightPosition = vec4(-1, -1.0, -1.0, 1.0 );
    var lightAmbient = vec4(0.25, 0.25, 0.25, 1.0 );
    let lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
    let lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    // Setup material properties
    let materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
    let materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
    let materialSpecular = vec4(1.0 , 1.0, 1.0, 1.0 );
    let materialShininess = 50.0;
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);

    var color = vec4(0.0, 0.0, 1.0, 1.0);
    var colorLoc = gl.getUniformLocation(program, "color")
    gl.uniform4fv(colorLoc, flatten(color));

}

function init_gouraud_shader(){
    program = initShaders(gl, "gouraud-vertex-shader", "gouraud-fragment-shader");
    gl.useProgram(program);

    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(camera.view_matrix));

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(camera.projection_matrix));
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    var vPositionLoc = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPositionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPositionLoc );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    var vNormalLoc = gl.getAttribLocation( program, "vNormal" );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    gl.vertexAttribPointer( vNormalLoc, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormalLoc );

    var lightPosition = vec4(-1, -1, -1, 1.0 );
    var lightAmbient = vec4(0.25, 0.25, 0.25, 1.0 );
    let lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
    let lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
    // Setup material properties
    let materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
    let materialDiffuse = vec4( 1.0, 1.0, 1.0, 1.0);
    let materialSpecular = vec4(1.0 , 1.0, 1.0, 1.0 );
    let materialShininess = 50.0;
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition) );
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);

    var color = vec4(0.0, 0.0, 1.0, 1.0);
    var colorLoc = gl.getUniformLocation(program, "color")
    gl.uniform4fv(colorLoc, flatten(color));

}

function init_wire_shader(){
    program = initShaders(gl, "wire-vertex-shader", "wire-fragment-shader");
    gl.useProgram(program);

    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(camera.view_matrix));

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(camera.projection_matrix));
    
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    var vPositionLoc = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPositionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPositionLoc );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var color = vec4(0.0, 0.0, 1.0, 1.0);
    var colorLoc = gl.getUniformLocation(program, "color")
    gl.uniform4fv(colorLoc, flatten(color));
}

function init_texture_shader(){
    program = initShaders(gl, "texture-vertex-shader", "texture-fragment-shader");
    gl.useProgram(program);
    // Buffer Data
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    let vPositionLoc = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPositionLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPositionLoc );

    // Buffer Texture Coords
    texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(textureArray), gl.STATIC_DRAW);
    let vTexCoordLoc = gl.getAttribLocation(program, "vTexcoord");
    gl.vertexAttribPointer(vTexCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoordLoc);

    // Add Texture
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // Temporary texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255]));
    let image = new Image();
    image.src = CURRENT_TEXTURE;
    image.addEventListener('load', function() {
          // Load Actual Texture
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
          gl.generateMipmap(gl.TEXTURE_2D);
        });

    viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(camera.view_matrix));

    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(camera.projection_matrix));
}

function updateBuffers(){
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    if(CURRENT_RENDERING == "gouraud" || CURRENT_RENDERING == "phong" ){
        gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    }

    if (CURRENT_RENDERING == "texture"){
        gl.bindBuffer( gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(textureArray), gl.STATIC_DRAW);

    }
}


function selectRender(src){
    
    CURRENT_RENDERING = src.value
    create_turritella(aa, du, dv, rangeU, rangeV);
    if (src.value == 'wire'){
        init_wire_shader();
    }
    else if (src.value == 'gouraud'){
        init_gouraud_shader();
    }
    else if (src.value == 'phong'){
        init_phong_shader();
    }
    else if (src.value == 'texture'){
        init_texture_shader();
    }
    updateBuffers()
}

function selectTexture(src){
    CURRENT_TEXTURE = src.value
    if (CURRENT_RENDERING == "texture"){
        init_texture_shader()
    }
}