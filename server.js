const path = require('path')
const express = require('express')

async function createServer() {
    const app = express()

    app.use('*', function (req, res, next) {
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

        next();
    });

    app.use(express.static(path.join(__dirname)));

    app.get('/test/multi_thread/webgpu/index.html', (req, res) => {
        res.sendFile(path.join(__dirname, "/test/multi_thread/webgpu/index.html"));
    });


    app.listen(8000)

    console.log("success!");
}

createServer()