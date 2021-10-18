import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js';

/** @type {WebGLRenderingContext} */
let gl;
let canvas;

const table_width = 3.0;
let table_height;
const grid_spacing = 0.05;
let program;
const points = [];
const clicks = [];
const LIMIT_CLICKS = 300;

function animate(time)
{
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    const w = gl.getUniformLocation(program, "table_width");
    const h = gl.getUniformLocation(program, "table_height");
    
    gl.uniform1f(w, table_width);
    gl.uniform1f(h, table_height);

    const color = gl.getUniformLocation(program, "color");

    gl.uniform4f(color, 1.0, 1.0, 1.0, 1.0);

    const point_size = gl.getUniformLocation(program, "point_size");

    gl.uniform1f(point_size, 4.0);
    gl.drawArrays(gl.POINTS, 0, points.length);

    gl.uniform4f(color, 0.0, 1.0, 0.0, 1.0);
    gl.uniform1f(point_size, 10.0);
    gl.drawArrays(gl.POINTS, points.length, clicks.length);

}

function setup(shaders)
{
    canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; 


    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    table_height = table_width / (canvas.width/canvas.height);

    for(let x = -table_width/2; x <= table_width/2; x += grid_spacing) {
        for(let y = -table_height/2; y <= table_height/2; y += grid_spacing) {
            points.push(MV.vec2(x, y));
        }
    }

    const aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, (points.length + LIMIT_CLICKS) * MV.sizeof['vec2'], gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(points));

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    window.addEventListener("resize", function (e) {
        resizeCanvas();
    });

    canvas.addEventListener("click", function(event) {
        // Start by getting x and y coordinates inside the canvas element
        const x = event.offsetX;
        const y = event.offsetY;
        
        console.log("Click at (" + x + ", " + y + ")");

        let table_x = (x - canvas.width/2) / canvas.width * table_width;
        let table_y = -(y - canvas.height/2) / canvas.height * table_height;

        clicks.push(MV.vec2(table_x, table_y));

        gl.bufferSubData(gl.ARRAY_BUFFER, MV.sizeof['vec2']*points.length, MV.flatten(clicks));
    });


    window.requestAnimationFrame(animate);


}

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;  
    gl.viewport(0, 0, canvas.width, canvas.height);
    table_height = table_width / (canvas.width/canvas.height);    
}


UTILS.loadShadersFromURLS(["shader1.vert", "shader1.frag"]).then(s => setup(s));
