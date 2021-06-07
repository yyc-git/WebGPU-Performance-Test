type initCanvasType = (canvas: HTMLCanvasElement, width?: number, height?: number) => HTMLCanvasElement

type typedArray = Float32Array | Uint32Array | Uint8Array

type bufferConstrutorType = new (buffer: ArrayBuffer) => typedArray


export { initCanvasType, typedArray, bufferConstrutorType}