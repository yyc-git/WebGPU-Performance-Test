let _generateRandom = () => {
    return (Math.random() * 2 - 1);
}


let _generateRandomZ = () => {
    return Math.random();
}

export let create = () => {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        _generateRandom(), _generateRandom(), _generateRandomZ(), 1
        // 0,0, _generateRandomZ(), 1
    ]);
}


// export let create2 = () => {
//     return new Float32Array([
//         1, 0, 0, 0,
//         0, 1, 0, 0,
//         0, 0, 1, 0,
//         // _generateRandom(), _generateRandom(), 1.0, 1
//         0, 0.1, 1.0, 1
//     ]);
// }