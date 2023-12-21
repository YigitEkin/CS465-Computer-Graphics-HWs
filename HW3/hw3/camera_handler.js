class Camera {
    constructor(){
        this.eye = vec3(0, 0 , 3);
        this.at = vec3(0.0, 0.0, 0.0)
        this.up = vec3(0.0, 1.0, 0.0);
        this.fovy = 60
        this.aspect = 1
        this.near = 1
        this.far = 100

        this.projection_matrix = null;
        this.view_matrix = null;
        this.radius = Math.sqrt( Math.pow(this.eye[0], 2) + Math.pow(this.eye[1], 2) + Math.pow(this.eye[2],2));
        this.theta = 0;
        this.phi = 0;
        this.setup_camera_matrix();
        
    }

    move_camera(){
        this.eye = vec3(this.radius*Math.sin(this.phi), this.radius*Math.sin(this.theta),this.radius*Math.cos(this.phi))
        this.setup_camera_matrix();


    }
    
    setup_camera_matrix(){
        this.view_matrix =  lookAt(this.eye, this.at, this.up);
        this.projection_matrix = perspective(this.fovy, this.aspect, this.near, this.far)
        gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(this.view_matrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(this.projection_matrix));
        if (CURRENT_RENDERING == 'phong')
            gl.uniformMatrix4fv(fViewMatrixLoc, false, flatten(this.view_matrix))
    }

}