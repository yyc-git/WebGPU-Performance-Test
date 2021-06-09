import { vertexShader, fragmentShader } from './Shader';
import { createBuffer, initCanvas, initPipeline, initWebGPU, initBindGroupData } from './Utils';
import { create } from "../../../utils/Matrix4Utils";
import { addTime, showTime } from '../../../utils/CPUTimeUtils';

// let _recordRenderPass = (device: GPUDevice, passEncoder: GPURenderBundleEncoder | GPURenderPassEncoder, pipeline: GPURenderPipeline, bindGroup: GPUBindGroup, vertexBuffer: GPUBuffer, indexBuffer: GPUBuffer, uniformBuffer: GPUBuffer, instanceCount: number, indexCount: number) => {
let _recordRenderPass = (device: GPUDevice, passEncoder: GPURenderBundleEncoder | GPURenderPassEncoder, pipeline: GPURenderPipeline, vertexBuffer: GPUBuffer, indexBuffer: GPUBuffer, bindGroup: GPUBindGroup, instanceCount: number, indexCount: number) => {
    passEncoder.setPipeline(pipeline);
    passEncoder.setVertexBuffer(0, vertexBuffer);

    passEncoder.setIndexBuffer(indexBuffer, 'uint32')


    // let bindGroups = [];



    // let modelMatrices: Array<Float32Array> = [];
    // let colors: Array<[number, number, number]> = [];

    // for (let i = 0; i < instanceCount; i++) {
    //     uniformBuffer = createBuffer(device, new Float32Array(16), GPUBufferUsage.UNIFORM);
    //     const [layout, bindGroup] = initBindGroupData(device, uniformBuffer);

    //     let modelMatrix = create();

    //     device.queue.writeBuffer(
    //         uniformBuffer,
    //         0,
    //         modelMatrix.buffer,
    //         modelMatrix.byteOffset,
    //         modelMatrix.byteLength
    //     );

    //     bindGroups[i] = bindGroup;


    //     // modelMatrices[i] = create();
    //     // colors[i] = [Math.random(), Math.random(), Math.random()];
    // }


    const uniformBytes = 16 * Float32Array.BYTES_PER_ELEMENT;
    const alignedUniformBytes = Math.ceil(uniformBytes / 256) * 256;
    const alignedUniformFloats = alignedUniformBytes / Float32Array.BYTES_PER_ELEMENT;


    for (let i = 0; i < instanceCount; ++i) {
        passEncoder.setBindGroup(0, bindGroup, [i * alignedUniformBytes]);


        passEncoder.drawIndexed(indexCount, 1, 0, 0, 0);
    }
}

let main = async () => {
    // let instanceCount = 270000;
    // let instanceCount = 270;
    let instanceCount = 110000;
    // let instanceCount = 3;

    document.querySelector("#instance_count").innerHTML = String(instanceCount);

    const canvas: HTMLCanvasElement = initCanvas(document.querySelector("#canvas") as HTMLCanvasElement);
    const gpuContext: GPUCanvasContext = canvas.getContext('gpupresent') as GPUCanvasContext;


    const vertex = new Float32Array([
        0.0, 0.1, 0.0,
        -0.1, -0.1, 0.0,
        0.1, -0.1, 0.0
    ]);

    const index = new Uint32Array([0, 1, 2]);

    const { device, swapChain, swapChainFormat } = await initWebGPU(gpuContext);
    const vertexBuffer = createBuffer(device, vertex, GPUBufferUsage.VERTEX);
    const indexBuffer = createBuffer(device, index, GPUBufferUsage.INDEX);






    const uniformBytes = 16 * Float32Array.BYTES_PER_ELEMENT;
    const alignedUniformBytes = Math.ceil(uniformBytes / 256) * 256;
    const alignedUniformFloats = alignedUniformBytes / Float32Array.BYTES_PER_ELEMENT;

    const uniformBuffer = device.createBuffer({
        size: instanceCount * alignedUniformBytes + Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
        mappedAtCreation: true
    });

    const uniformBufferData = new Float32Array(instanceCount * alignedUniformFloats);
    // console.log(uniformBufferData);


    for (let i = 0; i < instanceCount; i++) {
        uniformBufferData.set(create(), alignedUniformFloats * i);
    }

    new Float32Array(uniformBuffer.getMappedRange()).set(uniformBufferData, 0);
    uniformBuffer.unmap();



    // const uniformBuffer = createBuffer(device, new Float32Array(16), GPUBufferUsage.UNIFORM);
    const [layout, bindGroup] = initBindGroupData(device, uniformBuffer);
    const renderPipeline = initPipeline(device, layout, vertexShader, fragmentShader, swapChainFormat);




    const renderBundleEncoder = device.createRenderBundleEncoder({
        colorFormats: [swapChainFormat],
    });
    _recordRenderPass(device, renderBundleEncoder, renderPipeline, vertexBuffer, indexBuffer, bindGroup, instanceCount, index.length);
    const renderBundle = renderBundleEncoder.finish();

    let cpuTimeSumArr = [];

    setInterval(() => {
        let n1 = performance.now();

        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: swapChain.getCurrentTexture().createView(),
                loadValue: { r: 0, g: 0, b: 0, a: 1.0 },
                storeOp: 'store'
            }]
        })

        passEncoder.setViewport(0, 0, 800, 800, 0, 1);

        passEncoder.executeBundles([renderBundle]);

        passEncoder.endPass();
        device.queue.submit([commandEncoder.finish()]);

        addTime(cpuTimeSumArr, n1);
    }, 16)



    showTime(cpuTimeSumArr);



    // setInterval(() => {
    //     let n1 = performance.now();
    //     const commandEncoder = device.createCommandEncoder();
    //     const passEncoder = commandEncoder.beginRenderPass({
    //         colorAttachments: [{
    //             view: swapChain.getCurrentTexture().createView(),
    //             loadValue: { r: 0, g: 0, b: 0, a: 1.0 },
    //             storeOp: 'store'
    //         }]
    //     })
    //     passEncoder.setViewport(0, 0, 800, 800, 0, 1);

    //     for (let i = 0; i < 105000; i++) {

    //         // passEncoder.setPipeline(renderPipeline);
    //         // passEncoder.setVertexBuffer(0, vertexBuffer);
    //         // passEncoder.setIndexBuffer(indexBuffer, 'uint32')
    //         // passEncoder.drawIndexed(index.length, 1, 0, 0, 0);
    //         passEncoder.setPipeline(renderPipeline);
    //         passEncoder.setVertexBuffer(0, vertexBuffer);

    //         passEncoder.setIndexBuffer(indexBuffer, 'uint32')

    //         const uniformBytes = 16 * Float32Array.BYTES_PER_ELEMENT;
    //         const alignedUniformBytes = Math.ceil(uniformBytes / 256) * 256;
    //         const alignedUniformFloats = alignedUniformBytes / Float32Array.BYTES_PER_ELEMENT;


    //         passEncoder.setBindGroup(0, bindGroup, [i * alignedUniformBytes]);


    //         passEncoder.drawIndexed(index.length, 1, 0, 0, 0);

    //     }

    //     passEncoder.endPass();
    //     device.queue.submit([commandEncoder.finish()]);


    //     console.log(performance.now() - n1);
    // }, 16)
}

window.addEventListener('DOMContentLoaded', main);