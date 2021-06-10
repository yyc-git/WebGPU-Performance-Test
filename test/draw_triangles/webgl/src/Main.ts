import { initShader } from "../../../utils/WebGLUtils"
import { create } from "../../../utils/Matrix4Utils";
import { addTime, showTime } from "../../../utils/CPUTimeUtils";
import { setCanvasSize, getSize } from "../../../utils/CanvasUtils";


const vShader =
  `precision highp float;
  attribute vec3 a_position;
  uniform mat4 u_modelMatrix;
  uniform vec3 u_random;


   void main() {
      //  float seed = tea(tea(gl_VertexID, u_random.z), totalSampleCount);
    // gl_Position = u_modelMatrix * vec4(a_position.xy, u_random.z * 0.1 + a_position.z, 1.0);
    gl_Position = u_modelMatrix * vec4(a_position, 1.0);
  }`;

const fShader =
  `precision highp float;
   uniform vec3 u_color;

  uniform vec3 u_random;

//   float rand(vec2 co){
//     return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
// }

// float PHI = 1.61803398874989484820459;  // Φ = Golden Ratio   

// float rand(in vec2 xy, in float seed){
//        return fract(tan(distance(xy*PHI, xy)*seed)*xy.x);
// }

  void main() {
      //  int seed = tea(tea(int(gl_FragCoord.x), int(gl_FragCoord.y)), u_random.x);
    // gl_FragColor = vec4(gl_FragCoord.z,rand(gl_FragCoord.xy,  u_random.x),0.0, 1.0);
    gl_FragColor = vec4(u_color, 1.0);
    // gl_FragColor = vec4(gl_FragCoord.z,gl_FragCoord.x / 1500.0,gl_FragCoord.y/1500.0, 1.0);
  }`;

let main = () => {
  let instanceCount = 70000;

  document.querySelector("#instance_count").innerHTML = String(instanceCount);

  let canvas = document.querySelector("#canvas") as HTMLCanvasElement

  setCanvasSize(canvas);

  let gl = canvas.getContext("webgl");

  let [isSuccess, program] = initShader(gl, vShader, fShader);

  if (!isSuccess) {
    console.log('Failed to intialize shaders.');
    return;
  }

  let [vertexBuffer, indexBuffer] = initVertexBuffers(gl, program);


  let u_modelMatrix = gl.getUniformLocation(program, "u_modelMatrix");
  let u_color = gl.getUniformLocation(program, "u_color");

  let modelMatrices: Array<Float32Array> = [];

  for (let i = 0; i < instanceCount; i++) {
    modelMatrices[i] = create();
  }

  let colors = [];

  for (let i = 0; i < instanceCount; i++) {
    let random = Math.random();
    colors.push([random, random, random]);
  }

  let copiedColors = colors.slice();


  let cpuTimeSumArr = [];

  setInterval(() => {
    let n1 = performance.now();

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    let [width, height] = getSize();
    gl.viewport(0, 0, width, height);
    gl.disable(gl.DEPTH_TEST);

    gl.useProgram(program);

    for (let i = 0; i < instanceCount - 1000; i++) {
      gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrices[i]);

      let [r, g, b] = colors[i];
      gl.uniform3f(u_color, r, g, b);

      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

      gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_BYTE, 0);
    }

    let randomArr = [];

    for (let i = 0; i < 100; i++) {
      randomArr.push(Math.ceil(Math.random() * 1000));
    }

    for (let i = instanceCount - 1000; i < instanceCount; i++) {
      gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrices[i]);

      if (randomArr.includes(i - instanceCount + 1000)) {
        let [r, g, b] = copiedColors[i];
        let random = Math.random();
        r *= random;
        g *= random;
        b *= random;

        colors[i] = [r, g, b];
        gl.uniform3f(u_color, r, g, b);
      }
      else {
        let [r, g, b] = colors[i];

        gl.uniform3f(u_color, r, g, b);
      }


      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

      gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_BYTE, 0);
    }

    addTime(cpuTimeSumArr, n1);
  }, 16);

  showTime(cpuTimeSumArr);
}

function initVertexBuffers(gl, program) {
  // let vertices = new Float32Array([
  //   0.0, 0.5, 0.0,
  //   -0.5, -0.5, 0.0,
  //   0.5, -0.5, 0.0
  // ]);


  let vertices = new Float32Array([
    0.0, 0.1, 0.0,
    -0.1, -0.1, 0.0,
    0.1, -0.1, 0.0
  ]);

  let indices = new Uint8Array([
    0, 1, 2
  ]);

  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  let indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  let a_position = gl.getAttribLocation(program, "a_position");
  gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_position);

  return [vertexBuffer, indexBuffer]

}

window.addEventListener('DOMContentLoaded', main);