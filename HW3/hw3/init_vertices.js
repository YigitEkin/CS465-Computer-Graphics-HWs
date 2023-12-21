var pointsArray = []
var normalsArray = []
var textureArray = []


function turritella_location(u, v, aa){
    const wsqr = 1 - aa * aa;
    const w = Math.sqrt(wsqr);
    // create variables for data array indexing
    const denom =
        aa * (Math.pow(w * Math.cosh(aa * u), 2) + Math.pow(aa * Math.sin(w * v), 2));
    
    var x = -u + (2 * wsqr * Math.cosh(aa * u) * Math.sinh(aa * u)) / denom;
    var y = (2 * w * Math.cosh(aa * u) * (-(w * Math.cos(v) * Math.cos(w * v)) - (Math.sin(v) * Math.sin(w * v)))) /
    denom;
    var z = (2 * w * Math.cosh(aa * u) * (-(w * Math.sin(v) * Math.cos(w * v)) + (Math.cos(v) * Math.sin(w * v)))) /
    denom;
    
    // SPHERE

    // x = Math.cos(Math.PI * (0.5-v)) * Math.sin(2 * Math.PI * (u-0.5))
    // y = Math.sin(Math.PI * (0.5-v))
    // z = Math.cos(Math.PI * (0.5-v)) * Math.cos(2 * Math.PI * (u-0.5))

    return vec4(x, y, z, 1)
}

// Partial Derivative of x with respect to u
const partialXU = (a, u, v) => {
  const numerator = 2 * (1 - a**2) * (Math.cosh(a*u) * Math.sinh(a*u) + a**2 * u * Math.cosh(a*u) * Math.sinh(a*u));
  const denominator = a * ((1 - a**2) * Math.cosh(a*u)**2 + a**2 * Math.sin(v)**2);
  return -1 + numerator / denominator;
};

// Partial Derivative of y with respect to u
const partialYU = (a, u, v) => {
  const numerator = 2 * Math.sqrt(1 - a**2) * (
    Math.cosh(a*u) * (-Math.sqrt(1 - a**2) * Math.cos(v) * Math.cos(Math.sqrt(1 - a**2) * v) - Math.sin(v) * Math.sin(Math.sqrt(1 - a**2) * v)) +
    a**2 * u * Math.cosh(a*u) * Math.sinh(a*u)
  );
  const denominator = a * ((1 - a**2) * Math.cosh(a*u)**2 + a**2 * Math.sin(v)**2);
  return numerator / denominator;
};

// Partial Derivative of z with respect to u
const partialZU = (a, u, v) => {
  const numerator = 2 * Math.sqrt(1 - a**2) * (
    Math.cosh(a*u) * (-Math.sqrt(1 - a**2) * Math.sin(v) * Math.cos(Math.sqrt(1 - a**2) * v) + Math.cos(v) * Math.sin(Math.sqrt(1 - a**2) * v)) +
    a**2 * u * Math.cosh(a*u) * Math.sinh(a*u)
  );
  const denominator = a * ((1 - a**2) * Math.cosh(a*u)**2 + a**2 * Math.sin(v)**2);
  return numerator / denominator;
};

// Partial Derivative of x with respect to v
const partialXV = (a, u, v) => {
  return 4 * a * (1 - a**2) * Math.cosh(a*u) * Math.sin(Math.sqrt(1 - a**2) * v) * Math.cos(Math.sqrt(1 - a**2) * v) /
         ((1 - a**2) * Math.cosh(a*u)**2 + a**2 * Math.sin(v)**2)**2;
};

// Partial Derivative of y with respect to v
const partialYV = (a, u, v) => {
  return 2 * a * Math.sqrt(1 - a**2) * Math.cosh(a*u) *
         (Math.cos(v) * Math.cos(Math.sqrt(1 - a**2) * v) - Math.sqrt(1 - a**2) * Math.sin(v) * Math.sin(Math.sqrt(1 - a**2) * v)) /
         ((1 - a**2) * Math.cosh(a*u)**2 + a**2 * Math.sin(v)**2)**2;
};

// Partial Derivative of z with respect to v
const partialZV = (a, u, v) => {
  return 2 * a * Math.sqrt(1 - a**2) * Math.cosh(a*u) *
         (Math.sin(v) * Math.cos(Math.sqrt(1 - a**2) * v) + Math.sqrt(1 - a**2) * Math.cos(v) * Math.sin(Math.sqrt(1 - a**2) * v)) /
         ((1 - a**2) * Math.cosh(a*u)**2 + a**2 * Math.sin(v)**2)**2;
};

function derivative_v(u,v,aa){
    var dx = partialXV(aa, u, v)
    var dy = partialYV(aa, u, v)
    var dz = partialZV(aa, u, v)
    return vec3(dx, dy, dz)
}

function derivative_u(u,v, aa){ 
    var dx = partialXU(aa, u, v)
    var dy = partialYU(aa, u, v)
    var dz = partialZU(aa, u, v)
    return vec3(dx, dy, dz)
}
function calc_normal(du, dv){
    return normalize( cross(du, dv))
}


function create_turritella(aa, du, dv, rangeU, rangeV){
    var u_1,v_1, u_2,v_2, p_1, p_2, p_3, p_4;
    
    pointsArray = []
    normalsArray = []
    textureArray = []
    delta = 1
    for (var i = -rangeU; i < rangeU; i+= du){
        u_1 = i 
        u_2 = (i+du) 
        for (var ii = -rangeV; ii <= rangeV; ii+= dv){
            v_1 = ii
            v_2 = (ii+dv) 

            p_1 = turritella_location(u_1, v_1, aa)
            p_2 = turritella_location(u_2, v_1, aa)
            p_3 = turritella_location(u_2, v_2, aa)
            p_4 = turritella_location(u_1, v_2, aa)
            
            if (CURRENT_RENDERING != "wire"){
                pointsArray.push(p_1)
                pointsArray.push(p_2)
                pointsArray.push(p_3)

                pointsArray.push(p_1)
                pointsArray.push(p_4)
                pointsArray.push(p_3)
            
                if(CURRENT_RENDERING == "gouraud" || CURRENT_RENDERING == "phong"){
                    
                    normalsArray.push( calc_normal(derivative_u(u_1, v_1, aa), derivative_v(u_1, v_1, aa) ) )
                    normalsArray.push( calc_normal(derivative_u(u_2, v_1, aa), derivative_v(u_2, v_1, aa) ) )
                    normalsArray.push( calc_normal(derivative_u(u_2, v_2, aa), derivative_v(u_2, v_2, aa) ) )
                    normalsArray.push( calc_normal(derivative_u(u_1, v_1, aa), derivative_v(u_1, v_1, aa) ) )
                    normalsArray.push( calc_normal(derivative_u(u_1, v_2, aa), derivative_v(u_1, v_2, aa) ) )
                    normalsArray.push( calc_normal(derivative_u(u_2, v_2, aa), derivative_v(u_2, v_2, aa) ) )
                }

                if (CURRENT_RENDERING == "texture"){

                    var u_1_texture = u_1/(2 * Math.PI) * 15 % 1
                    var u_2_texture = u_2/(2 * Math.PI) * 15 % 1
                    var v_1_texture = v_1/(2 * Math.PI) 
                    var v_2_texture = v_2/(2 * Math.PI) 

                    textureArray.push( vec2( u_1_texture, v_1_texture ))
                    textureArray.push( vec2( u_2_texture, v_1_texture ))
                    textureArray.push( vec2( u_2_texture, v_2_texture ))

                    textureArray.push( vec2( u_1_texture, v_1_texture ))
                    textureArray.push( vec2( u_1_texture, v_2_texture ))
                    textureArray.push( vec2( u_2_texture, v_2_texture ))
                }
            }

            else{
                pointsArray.push(p_1)
                pointsArray.push(p_2)

                pointsArray.push(p_2)
                pointsArray.push(p_3)

                pointsArray.push(p_3)
                pointsArray.push(p_4)

                pointsArray.push(p_4)
                pointsArray.push(p_1)
            }

        }
    }

    
   

}




