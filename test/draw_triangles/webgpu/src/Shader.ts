const vertexShader = `
[[block]] struct Uniforms {
  modelMatrix : mat4x4<f32>;
};

[[binding(0), group(0)]] var<uniform> uniforms : Uniforms;

    [[stage(vertex)]]
    fn main([[location(0)]] aVertexPosition:vec3<f32>) -> [[builtin(position)]] vec4<f32> {
      return uniforms.modelMatrix * vec4<f32>(aVertexPosition, 1.0);
    }
`;

const fragmentShader = `
[[stage(fragment)]]
fn main([[builtin(position)]] coord_in: vec4<f32>) -> [[location(0)]] vec4<f32> {
  return vec4<f32>(coord_in.z, 1.0, 0.0, 1.0);
}
`;

// const vertexShader = `#version 450
//   layout(location = 0) in vec3 position;
 
//       void main() {
//           gl_Position = vec4(position, 1.0);
//       }
//     `;

// const fragmentShader = `#version 450
//       layout(location = 0) out vec4 outColor;
 
//       void main() {
//           outColor = vec4(1.0, 0.0, 0.0, 1.0);
//       }
//     `;

export { vertexShader, fragmentShader }