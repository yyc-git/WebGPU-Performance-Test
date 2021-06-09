const vertexShader = `
[[block]] struct Uniforms {
  modelMatrix : mat4x4<f32>;
};

[[binding(0), group(0)]] var<uniform> uniforms : Uniforms;

// [[block]] struct Random {
//   randomVal: vec3<f32>;
// };

// [[binding(0), group(1)]] var<uniform> random : Random;

    [[stage(vertex)]]
    fn main([[location(0)]] aVertexPosition:vec3<f32>) -> [[builtin(position)]] vec4<f32> {
      // return uniforms.modelMatrix * vec4<f32>(aVertexPosition.xy,random.randomVal.z * 0.1 + aVertexPosition.z, 1.0);
      return uniforms.modelMatrix * vec4<f32>(aVertexPosition, 1.0);
    }
`;

const fragmentShader = `
[[block]] struct Random {
  randomVal: vec3<f32>;
};

[[binding(0), group(1)]] var<uniform> random : Random;

[[stage(fragment)]]
fn main([[builtin(position)]] coord_in: vec4<f32>) -> [[location(0)]] vec4<f32> {
  return vec4<f32>(coord_in.z, 1.0, 0.0, 1.0);
}
`;

// const fragmentShader = `
// [[block]] struct Random {
//   randomVal: vec3<f32>;
// };

// [[binding(0), group(1)]] var<uniform> random : Random;

// [[stage(fragment)]]
// fn main([[builtin(position)]] coord_in: vec4<f32>) -> [[location(0)]] vec4<f32> {
//   // return vec4<f32>(coord_in.z, 1.0, 0.0, 1.0);
//   return vec4<f32>(coord_in.z,coord_in.z + random.randomVal.x * 0.1 ,0.0, 1.0);
// }
// `;


export { vertexShader, fragmentShader }