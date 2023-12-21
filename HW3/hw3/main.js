var gl;
var CANVAS_WIDTH = null;
var CANVAS_HEIGHT = null;
var camera;
var viewMatrixLoc;
var projectionMatrixLoc;
var precision;
var aa, du, dv, rangeU, rangeV;
aa = 0.4
du = 1
dv = 1
rangeU = 14
rangeV = 37

function updateWindow() {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(CURRENT_RENDERING != "wire" ){
        gl.drawArrays(gl.TRIANGLES, 0, pointsArray.length);
    }
    else{
        gl.drawArrays(gl.LINES, 0, pointsArray.length);
    }

    requestAnimationFrame(function() {
        updateWindow();
    });
}

window.onload = function init()
{   
    // window.onresize = function() {
    //     CANVAS_WIDTH = (window.innerWidth)
    //     CANVAS_HEIGHT = (window.innerHeight);
    //     canvas.width  = CANVAS_WIDTH-100;
    //     canvas.height = CANVAS_HEIGHT-210;
    //     gl.viewport(0, 0, canvas.height, canvas.width); 
    // }
    // window.onresize();

    // Camera sliders
    var camera_rotate_y_slider = document.getElementById("thetaSlider");
    camera_rotate_y_slider.oninput = function() {
        camera.theta = parseFloat(this.value) *  Math.PI/180.0;
        camera.move_camera();
    }
    var camera_rotate_x_slider = document.getElementById("phiSlider");
    camera_rotate_x_slider.oninput = function() {
        camera.phi = parseFloat(this.value) *  Math.PI/180.0;
        camera.move_camera();
    }
    var radius_slider = document.getElementById("radiusSlider");
    radius_slider.oninput = function() {
        camera.radius = parseFloat(this.value);
        camera.move_camera();
    }

    var aa_slider = document.getElementById("aa_value_input");
    aa_slider.oninput = function() {
        aa = parseFloat(this.value);
        create_turritella(aa, du, dv, rangeU, rangeV);
        updateBuffers();
        updateWindow();
    }

    var du_slider = document.getElementById("scale_u_value_input");
    du_slider.oninput = function() {
        console.log(this.value);
        du = parseFloat(this.value);
        create_turritella(aa, du, dv, rangeU, rangeV);
        updateBuffers();
        updateWindow();
    }

    var dv_slider = document.getElementById("scale_v_value_input");
    dv_slider.oninput = function() {
        dv = parseFloat(this.value);
        create_turritella(aa, du, dv, rangeU, rangeV);
        updateBuffers();
        updateWindow();
    }

    var rangeU_slider = document.getElementById("range_u_input");
    rangeU_slider.oninput = function() {
        rangeU = parseFloat(this.value);
        create_turritella(aa, du, dv, rangeU, rangeV);
        updateBuffers();
        updateWindow();
    }

    var rangeV_slider = document.getElementById("range_v_value_input");
    rangeV_slider.oninput = function() {
        rangeV = parseFloat(this.value);
        create_turritella(aa, du, dv, rangeU, rangeV);
        updateBuffers();
        updateWindow();
    }

    var canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl')
    if (!gl) { alert("WebGL isn't available");}

    gl.viewport(0, 0, canvas.height, canvas.width); 
    gl.enable(gl.DEPTH_TEST);


    camera = new Camera();

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    
    
    create_turritella(aa, du, dv, rangeU, rangeV);
    init_wire_shader()

    requestAnimationFrame(function() {
        updateWindow();
    });
};

