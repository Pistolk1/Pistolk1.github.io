class Engine3D {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext("webgl");

        if (!this.gl) {
            console.error("WebGL not supported.");
            return;
        }

        this.program = this.createProgram();
        this.gl.useProgram(this.program);

        this.objects = [];
        this.camera = {
            position: { x: 0, y: 1, z: 5 },
            target: { x: 0, y: 0, z: 0 },
        };

        this.lastTime = 0;

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);

        this.initCameraControls();
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error("Shader error:", this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram() {
        const vertexShaderSource = `
            attribute vec3 position;
            attribute vec3 normal;
            attribute vec2 texCoord;

            uniform mat4 modelMatrix;
            uniform mat4 viewMatrix;
            uniform mat4 projectionMatrix;

            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vTexCoord;

            void main() {
                vNormal = mat3(modelMatrix) * normal;
                vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
                vTexCoord = texCoord;

                gl_Position = projectionMatrix * viewMatrix * vec4(vPosition, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;

            varying vec3 vNormal;
            varying vec3 vPosition;
            varying vec2 vTexCoord;

            uniform vec3 lightPosition;
            uniform vec3 lightColor;
            uniform sampler2D texture;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 lightDir = normalize(lightPosition - vPosition);

                float diff = max(dot(normal, lightDir), 0.0);
                vec3 diffuse = diff * lightColor;

                vec4 texColor = texture2D(texture, vTexCoord);

                gl_FragColor = vec4(diffuse, 1.0) * texColor;
            }
        `;

        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error("Program error:", this.gl.getProgramInfoLog(program));
            return null;
        }

        return program;
    }

    addObject(vertices, normals, texCoords, indices, texturePath) {
        const object = {
            vertices: new Float32Array(vertices),
            normals: new Float32Array(normals),
            texCoords: new Float32Array(texCoords),
            indices: new Uint16Array(indices),
            texture: this.loadTexture(texturePath),
        };

        object.vertexBuffer = this.createBuffer(this.gl.ARRAY_BUFFER, object.vertices);
        object.normalBuffer = this.createBuffer(this.gl.ARRAY_BUFFER, object.normals);
        object.texCoordBuffer = this.createBuffer(this.gl.ARRAY_BUFFER, object.texCoords);
        object.indexBuffer = this.createBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.indices);

        this.objects.push(object);
    }

    createBuffer(type, data) {
        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(type, buffer);
        this.gl.bufferData(type, data, this.gl.STATIC_DRAW);
        return buffer;
    }

    loadTexture(path) {
        const texture = this.gl.createTexture();
        const image = new Image();

        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        };

        image.src = path;
        return texture;
    }

    initCameraControls() {
        window.addEventListener("keydown", (e) => {
            const speed = 0.1;
            if (e.key === "w") this.camera.position.z -= speed;
            if (e.key === "s") this.camera.position.z += speed;
            if (e.key === "a") this.camera.position.x -= speed;
            if (e.key === "d") this.camera.position.x += speed;
        });
    }

    render(deltaTime) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const positionLocation = this.gl.getAttribLocation(this.program, "position");
        const normalLocation = this.gl.getAttribLocation(this.program, "normal");
        const texCoordLocation = this.gl.getAttribLocation(this.program, "texCoord");

        const modelMatrixLocation = this.gl.getUniformLocation(this.program, "modelMatrix");
        const viewMatrixLocation = this.gl.getUniformLocation(this.program, "viewMatrix");
        const projectionMatrixLocation = this.gl.getUniformLocation(this.program, "projectionMatrix");
        const lightPositionLocation = this.gl.getUniformLocation(this.program, "lightPosition");
        const lightColorLocation = this.gl.getUniformLocation(this.program, "lightColor");

        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, Math.PI / 4, this.canvas.width / this.canvas.height, 0.1, 100);

        const viewMatrix = mat4.create();
        mat4.lookAt(viewMatrix, [this.camera.position.x, this.camera.position.y, this.camera.position.z], [this.camera.target.x, this.camera.target.y, this.camera.target.z], [0, 1, 0]);

        this.objects.forEach((object) => {
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.vertexBuffer);
            this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(positionLocation);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.normalBuffer);
            this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(normalLocation);

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.texCoordBuffer);
            this.gl.vertexAttribPointer(texCoordLocation, 2, this.gl.FLOAT, false, 0, 0);
            this.gl.enableVertexAttribArray(texCoordLocation);

            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, object.indexBuffer);

            this.gl.uniformMatrix4fv(modelMatrixLocation, false, mat4.create());
            this.gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
            this.gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

            this.gl.uniform3fv(lightPositionLocation, [5, 5, 5]);
            this.gl.uniform3fv(lightColorLocation, [1, 1, 1]);

            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, object.texture);
            this.gl.uniform1i(this.gl.getUniformLocation(this.program, "texture"), 0);

            this.gl.drawElements(this.gl.TRIANGLES, object.indices.length, this.gl.UNSIGNED_SHORT, 0);
        });
    }

    start() {
        const loop = (currentTime) => {
            const deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;

            this.render(deltaTime);

            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}
