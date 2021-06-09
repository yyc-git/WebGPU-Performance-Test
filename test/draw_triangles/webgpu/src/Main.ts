import { vertexShader, fragmentShader } from './Shader';
import { createBuffer, initCanvas, initPipeline, initWebGPU, initBindGroupData, initBindGroupData2 } from './Utils';
import { create } from "../../../utils/Matrix4Utils";
import { addTime, showTime } from '../../../utils/CPUTimeUtils';

// let _recordRenderPass = (device: GPUDevice, passEncoder: GPURenderBundleEncoder | GPURenderPassEncoder, pipeline: GPURenderPipeline, bindGroup: GPUBindGroup, vertexBuffer: GPUBuffer, indexBuffer: GPUBuffer, uniformBuffer: GPUBuffer, instanceCount: number, indexCount: number) => {
let _recordRenderPass = (device: GPUDevice, passEncoder: GPURenderBundleEncoder | GPURenderPassEncoder, pipeline: GPURenderPipeline, vertexBuffer: GPUBuffer, indexBuffer: GPUBuffer, [bindGroup, bindGroup2]: [GPUBindGroup, GPUBindGroup], instanceCount: number, indexCount: number) => {
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


    passEncoder.setBindGroup(1, bindGroup2);


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
        size: instanceCount * alignedUniformBytes,
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


    const uniformBuffer2 = device.createBuffer({
        size: 4 * Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
        mappedAtCreation: true
    });

    const uniformBufferData2 = new Float32Array(3);
    // console.log(uniformBufferData);

    new Float32Array(uniformBuffer2.getMappedRange()).set(uniformBufferData2, 0);
    uniformBuffer2.unmap();



    const [layout2, bindGroup2] = initBindGroupData2(device, uniformBuffer2);
    const renderPipeline = initPipeline(device, [layout, layout2], vertexShader, fragmentShader, swapChainFormat);




    const renderBundleEncoder = device.createRenderBundleEncoder({
        colorFormats: [swapChainFormat],
    });
    _recordRenderPass(device, renderBundleEncoder, renderPipeline, vertexBuffer, indexBuffer, [bindGroup, bindGroup2], instanceCount, index.length);
    const renderBundle = renderBundleEncoder.finish();

    let randomVal1 = Math.random(),
        randomVal2 = Math.random(),
        randomVal3 = Math.random();

    setInterval(() => {
        randomVal1 = Math.random();
        randomVal2 = Math.random();
        randomVal3 = Math.random();
    }, 200);

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


        // for (let i = 0; i < instanceCount; i++) {
        //     uniformBufferData.set(create(), alignedUniformFloats * i);
        // }

        // device.queue.writeBuffer(
        //     uniformBuffer,
        //     0,
        //     uniformBufferData.buffer,
        //     uniformBufferData.byteOffset,
        //     uniformBufferData.byteLength
        // );

        uniformBufferData2.set([randomVal1, randomVal2, randomVal3], 0);


        device.queue.writeBuffer(
            uniformBuffer2,
            0,
            uniformBufferData2.buffer,
            uniformBufferData2.byteOffset,
            uniformBufferData2.byteLength
        );


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


    //     // for (let i = 0; i < instanceCount; i++) {
    //     //     uniformBufferData.set(create(), alignedUniformFloats * i);
    //     // }

    //     // // new Float32Array(uniformBuffer.getMappedRange()).set(uniformBufferData, 0);
    //     // // uniformBuffer.unmap();

    //     // device.queue.writeBuffer(
    //     //     uniformBuffer,
    //     //     0,
    //     //     uniformBufferData.buffer,
    //     //     uniformBufferData.byteOffset,
    //     //     uniformBufferData.byteLength
    //     // );


    //     for (let i = 0; i < instanceCount; i++) {

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