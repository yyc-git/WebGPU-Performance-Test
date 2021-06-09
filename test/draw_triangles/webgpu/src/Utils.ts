import { bufferConstrutorType, initCanvasType, typedArray } from './Type';

const initCanvas: initCanvasType = (canvas: HTMLCanvasElement, width?: number, height?: number) => {
    canvas.width = width ? width : 800;
    canvas.height = height ? height : 800;
    canvas.style.width = (width ? width : 800) + "px";
    canvas.style.height = (height ? height : 800) + "px";

    return canvas
}

const createBuffer = (device: GPUDevice, data: typedArray, usage: GPUBufferUsageFlags) => {
    const buffer: GPUBuffer = device.createBuffer({
        size: data.byteLength,
        usage: usage | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true
    });

    let constructor: bufferConstrutorType = data.constructor as bufferConstrutorType;

    new constructor(buffer.getMappedRange()).set(data, 0);

    buffer.unmap();
    return buffer
}

const initWebGPU = async (gpuContext: GPUCanvasContext) => {
    // 为了测试最佳性能，我们将功率选择为高性能模式「注:WebGPU标准推荐开发者在非必要的情况下选择low-power模式
    let adaper: GPUAdapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' }) as GPUAdapter;

    let device: GPUDevice = await adaper.requestDevice();

    let swapChainFormat: GPUTextureFormat = 'bgra8unorm';
    let swapChain: GPUSwapChain = gpuContext.configureSwapChain({
        device,
        format: swapChainFormat,
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    return { device, swapChainFormat, swapChain }
}


// const initBindGroupData = (device: GPUDevice, uniformBuffer: GPUBuffer): [GPUBindGroupLayout, GPUBindGroup] => {
//     let layout = device.createBindGroupLayout({
//         entries: [
//             {
//                 binding: 0,
//                 visibility: GPUShaderStage.VERTEX,
//                 buffer: {
//                     type: 'uniform'
//                 }
//             }
//         ]
//     });
//     let bindGroup = device.createBindGroup({
//         layout: layout,
//         entries: [{
//             binding: 0,
//             resource: { buffer: uniformBuffer }
//         }]
//     });

//     return [layout, bindGroup];
// };


const initBindGroupData = (device: GPUDevice, uniformBuffer: GPUBuffer): [GPUBindGroupLayout, GPUBindGroup] => {
    let layout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform',
                    hasDynamicOffset: true
                }
            }
        ]
    });
    let bindGroup = device.createBindGroup({
        layout: layout,
        entries: [{
            binding: 0,
            resource: {
                buffer: uniformBuffer,
                offset: 0,
                size: 16 * Float32Array.BYTES_PER_ELEMENT,
            }
        }]
    });

    return [layout, bindGroup];
};


const initBindGroupData2 = (device: GPUDevice, uniformBuffer: GPUBuffer): [GPUBindGroupLayout, GPUBindGroup] => {
    let layout = device.createBindGroupLayout({
        entries: [
            {
                binding: 0,
                visibility: GPUShaderStage.VERTEX,
                buffer: {
                    type: 'uniform'
                }
            }
        ]
    });
    let bindGroup = device.createBindGroup({
        layout: layout,
        entries: [{
            binding: 0,
            resource: {
                buffer: uniformBuffer,
                offset: 0,
                size: 3 * Float32Array.BYTES_PER_ELEMENT,
            }
        }]
    });

    return [layout, bindGroup];
};

const initPipeline = (device: GPUDevice, bindGroupLayouts: Array<GPUBindGroupLayout>, vertexShader: string, fragmentShader: string, swapChainFormat: GPUTextureFormat) => {

    return device.createRenderPipeline({
        layout: device.createPipelineLayout({
            bindGroupLayouts
        }),
        vertex: {
            module: device.createShaderModule({ code: vertexShader }),
            entryPoint: 'main',
            buffers: [{
                arrayStride: 4 * 3,
                attributes: [
                    {
                        shaderLocation: 0,
                        offset: 0,
                        format: 'float32x3'
                    }
                ]
            }]
        },
        fragment: {
            module: device.createShaderModule({ code: fragmentShader }),
            entryPoint: 'main',
            targets: [
                {
                    format: swapChainFormat
                }
            ]
        },
        primitive: {
            topology: 'triangle-list'
        },
        depthStencilState: {
            depthWriteEnabled: false,
            depthCompare: "less",
            format: "depth24plus-stencil8",
        }
    })
};

export { initCanvas, createBuffer, initWebGPU, initPipeline, initBindGroupData, initBindGroupData2 }