import { initShader } from "../../../utils/WebGLUtils"
import { addTime, showTime } from "../../../utils/CPUTimeUtils";
import { setCanvasSize, getSize } from "../../../utils/CanvasUtils";

const vShader =
  `precision highp float;
  attribute vec2 a_pos;
  attribute vec4 a_particleData;

   void main() {
     vec2 a_particlePos = a_particleData.xy;
     vec2 a_particleVel = a_particleData.zw;
    //  vec2 a_particleVel = vec2(a_particleData.z, a_particleData.z);

    float angle = -atan(a_particleVel.x, a_particleVel.y);
    vec2 pos = vec2(a_pos.x * cos(angle) - a_pos.y * sin(angle),
            a_pos.x * sin(angle) + a_pos.y * cos(angle));
            vec2 data = pos + a_particlePos;
    gl_Position = vec4(data.x, data.y, 0, 1);
    // gl_Position = vec4( a_particlePos, 0, 1);
  }`;

const fShader =
  `precision highp float;

  void main() {
    gl_FragColor = vec4(1.0);
  }`;

let main = () => {
  let instanceCount = 500;

  document.querySelector("#instance_count").innerHTML = String(instanceCount);

  let canvas = document.querySelector("#canvas") as HTMLCanvasElement

  setCanvasSize(canvas);

  let gl = canvas.getContext("webgl");

  let [isSuccess, program] = initShader(gl, vShader, fShader);

  if (!isSuccess) {
    console.log('Failed to intialize shaders.');
    return;
  }


  const simParamData = {
    deltaT: 0.04,
    rule1Distance: 0.1,
    rule2Distance: 0.025,
    rule3Distance: 0.025,
    rule1Scale: 0.02,
    rule2Scale: 0.05,
    rule3Scale: 0.005
  };


  const targetParticleData = new Float32Array(instanceCount * 4);

  const initialParticleData = new Float32Array(instanceCount * 4);
  for (let i = 0; i < instanceCount; ++i) {
    initialParticleData[4 * i + 0] = 2 * (Math.random() - 0.5);
    initialParticleData[4 * i + 1] = 2 * (Math.random() - 0.5);
    initialParticleData[4 * i + 2] = 2 * (Math.random() - 0.5) * 0.1;
    initialParticleData[4 * i + 3] = 2 * (Math.random() - 0.5) * 0.1;
  }

  let _distance = ([x1, x2]: [number, number], [y1, y2]: [number, number]): number => {
    return Math.sqrt(Math.pow(x1 - y1, 2) + Math.pow(x2 - y2, 2));
  }

  let _sub = ([x1, x2]: [number, number], [y1, y2]: [number, number]): [number, number] => {
    return [x1 - y1, x2 - y2];
  }

  let _add = ([x1, x2]: [number, number], [y1, y2]: [number, number]): [number, number] => {
    return [x1 + y1, x2 + y2];
  }

  let _divide = ([x1, x2]: [number, number], [y1, y2]: [number, number]): [number, number] => {
    return [x1 / y1, x2 / y2];
  }

  let _divideScalar = ([x1, x2]: [number, number], scalar: number): [number, number] => {
    return [x1 / scalar, x2 / scalar];
  }

  let _multiScalar = ([x1, x2]: [number, number], scalar: number): [number, number] => {
    return [x1 * scalar, x2 * scalar];
  }

  let _length = ([x1, x2]: [number, number]): number => {
    return Math.sqrt(x1 * x1 + x2 * x2);
  }

  let _normalize = ([x1, x2]: [number, number]): [number, number] => {
    let length = _length([x1, x2]);

    return [
      x1 / length,
      x2 / length
    ];
  }

  let _clamp = (x, min, max) => {
    return Math.min(Math.max(x, min), max);
  }

  let _compute = (instanceCount, initialParticleData, targetParticleData, simParamData) => {
    for (let i = 0; i < instanceCount; ++i) {
      let vPos: [number, number] = [initialParticleData[4 * i], initialParticleData[4 * i + 1]];
      let vVel: [number, number] = [initialParticleData[4 * i + 2], initialParticleData[4 * i + 3]];

      let cMass: [number, number] = [0.0, 0.0];
      let cVel: [number, number] = [0.0, 0.0];
      let colVel: [number, number] = [0.0, 0.0];
      let cMassCount = 0;
      let cVelCount = 0;

      let pos: [number, number];
      let vel: [number, number];

      for (let j = 0; j < instanceCount; ++j) {
        if (j === i) {
          continue;
        }

        pos = [initialParticleData[4 * j], initialParticleData[4 * j + 1]];
        vel = [initialParticleData[4 * j + 2], initialParticleData[4 * j + 3]];

        if (_distance(pos, vPos) < simParamData.rule1Distance) {
          cMass = _add(cMass, pos);
          cMassCount++;
        }
        if (_distance(pos, vPos) < simParamData.rule2Distance) {
          colVel = _sub(colVel, _sub(pos, vPos));
        }
        if (_distance(pos, vPos) < simParamData.rule3Distance) {
          cVel = _add(cVel, vel);
          cVelCount++;
        }
      }

      if (cMassCount > 0) {
        cMass = _sub(_divideScalar(cMass, cMassCount), vPos);
      }
      if (cVelCount > 0) {
        cVel = _divideScalar(cVel, cVelCount);
      }

      vVel = _add(
        vVel, _add(_add(_multiScalar(cMass, simParamData.rule1Scale), _multiScalar(colVel, simParamData.rule2Scale)), _multiScalar(cVel, simParamData.rule3Scale))
      );

      // vVel += cMass * simParamData.rule1Scale + colVel * simParamData.rule2Scale + cVel * simParamData.rule3Scale;

      // clamp velocity for a more pleasing simulation.
      // vVel = normalize(vVel) * clamp(length(vVel), 0.0, 0.1);
      vVel = _multiScalar(
        _normalize(vVel),
        _clamp(
          _length(vVel), 0.0, 1.0
        )
      );

      // kinematic update
      vPos = _add(vPos, _multiScalar(vVel, simParamData.deltaT));

      // Wrap around boundary
      if (vPos[0] < -1.0) vPos[0] = 1.0;
      if (vPos[0] > 1.0) vPos[0] = -1.0;
      if (vPos[1] < -1.0) vPos[1] = 1.0;
      if (vPos[1] > 1.0) vPos[1] = -1.0;

      targetParticleData[4 * i] = vPos[0];
      targetParticleData[4 * i + 1] = vPos[1];
      targetParticleData[4 * i + 2] = vVel[0];
      targetParticleData[4 * i + 3] = vVel[1];
    }
  }




  const vertexBufferData = new Float32Array([-0.01, -0.02, 0.01, -0.02, 0.00, 0.02]);

  let vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexBufferData, gl.STATIC_DRAW);


  let particleVertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, initialParticleData.byteLength, gl.DYNAMIC_DRAW);




  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  let a_pos = gl.getAttribLocation(program, "a_pos");
  gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_pos);







  const ext = gl.getExtension('ANGLE_instanced_arrays');
  if (!ext) {
    return alert('need ANGLE_instanced_arrays');
  }



  gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexBuffer);
  let a_particleData = gl.getAttribLocation(program, "a_particleData");
  // gl.vertexAttribPointer(a_particleData, 4, gl.FLOAT, false, 0, 0);
  // gl.enableVertexAttribArray(a_particleData);

  gl.enableVertexAttribArray(a_particleData);
  gl.vertexAttribPointer(
    a_particleData,              // location
    4,                // size (num values to pull from buffer per iteration)
    gl.FLOAT,         // type of data in buffer
    false,            // normalize
    0,   // stride, num bytes to advance to get to next set of values
    0,           // offset in buffer
  );
  // this line says this attribute only changes for each 1 instance
  ext.vertexAttribDivisorANGLE(a_particleData, 1);




  let indices = new Uint8Array([
    0, 1, 2
  ]);

  let indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);


  // let t = 0;

  let cpuTimeSumArr = [];

  let sourceData = initialParticleData;
  let targetData = targetParticleData;

  setInterval(() => {
    let n1 = performance.now();

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    let [width, height] = getSize();
    gl.viewport(0, 0, width, height);
    gl.disable(gl.DEPTH_TEST);

    // if (t % 2 === 0) {
    //   // sourceData = initialParticleData;
    //   // targetData = targetParticleData;
    // }
    // else {
    //   sourceData = targetData;
    //   targetData = sourceData;
    // }

    _compute(instanceCount, sourceData, targetData, simParamData);


    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);


    gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, targetData);
    // console.log(targetData)


    ext.drawElementsInstancedANGLE(
      gl.TRIANGLES,
      3,
      gl.UNSIGNED_BYTE,
      0,             // offset
      instanceCount,  // num instances
    );

    // for (let i = 0; i < instanceCount; i++) {
    //   gl.useProgram(program);


    //   gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    //   gl.bindBuffer(gl.ARRAY_BUFFER, particleVertexBuffer);

    //   // console.log(targetData.subarray(i * 4 * 3, (i + 1) * 4 * 3));
    //   console.log(targetData);
    //   gl.bufferData(gl.ARRAY_BUFFER, targetData.subarray(i * 4 * 3, (i + 1) * 4 * 3), gl.DYNAMIC_DRAW);

    //   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    //   gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_BYTE, 0);
    // }



    let temp = sourceData;
    sourceData = targetData;
    targetData = temp;

    addTime(cpuTimeSumArr, n1);
  }, 16);

  showTime(cpuTimeSumArr);

  // let sum = 0;

  // for (let i = 0; i < 10; i++) {
  //   let n1 = performance.now();
  //   _compute(instanceCount, sourceData, targetData, simParamData);
  //   sum += performance.now() - n1;
  // }

  // console.log(sum / 10);
  // console.log((performance.now() - n1));
}

window.addEventListener('DOMContentLoaded', main);