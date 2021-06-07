let _generateRandom = () => {
    return (Math.random() * 2 - 1);
}

export let create = () => {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        _generateRandom(), _generateRandom(), _generateRandom(), 1
    ]);
}