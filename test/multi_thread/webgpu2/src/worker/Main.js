console.log(
    self.crossOriginIsolated
);


const initWebGPU = async (gpuContext) => {
    // 为了测试最佳性能，我们将功率选择为高性能模式「注:WebGPU标准推荐开发者在非必要的情况下选择low-power模式
    let adaper = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });

    let device = await adaper.requestDevice();

    return device;
}

self.onmessage = (event) => {
    // console.log(event.data.device);

    let canvas = event.data.canvas;

    const gpuContext = canvas.getContext('gpupresent');

    // let adaper = await navigator.gpu.requestAdapter();

    initWebGPU(gpuContext).then((device) => {
        console.log(event.data.canvas, device);
    })


};

// self.port.start();
