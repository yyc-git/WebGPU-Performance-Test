export let getSize = () => {
    return [
        window.innerWidth,
        Math.floor(window.innerHeight * 0.8)
    ];
}

export let setCanvasSize = (canvas) => {
    let [width, height] = getSize();

    canvas.width = width;
    canvas.style.width = width + "px";
    canvas.height = height;
    canvas.style.height = height + "px";
}
