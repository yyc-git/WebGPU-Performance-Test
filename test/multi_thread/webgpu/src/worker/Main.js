console.log(
    self.crossOriginIsolated
);

self.onmessage = (event) => {
    console.log(event.data.device);
};

// self.port.start();
