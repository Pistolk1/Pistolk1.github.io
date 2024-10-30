// Omega.js - Updated with Input and Basic Rendering

class Omega {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl');
        if (!this.gl) throw new Error("WebGL not supported");

        this.scene = [];
        this.isRunning = false;
        this.lastUpdate = performance.now();

        // Camera setup
        this.camera = {
            position: [0, 0, -5],
            lookAt: [0, 0, 0],
            projectionMatrix: this._createProjectionMatrix(canvas.width / canvas.height)
        };

        // Initialize input
        Input.initialize();

        // Game loop
        this.loop = () => {
            const now = performance.now();
            const deltaTime = (now - this.lastUpdate) / 1000;
            this.lastUpdate = now;

            this.update(deltaTime);
            this.render();

            if (this.isRunning) requestAnimationFrame(this.loop);
        };
    }

    start() {
        this.isRunning = true;
        this.loop();
    }

    stop() {
        this.isRunning = false;
    }

    addGameObject(gameObject) {
        this.scene.push(gameObject);
    }

    update(deltaTime) {
        this._handleCameraInput(deltaTime);
        for (const obj of this.scene) obj.update(deltaTime);
    }

    render() {
        const gl = this.gl;
        gl.clearColor(0.1, 0.1, 0.1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        for (const obj of this.scene) obj.render(gl, this.camera);
    }

    _createProjectionMatrix(aspect) {
        const fov = 45 * Math.PI / 180; // 45 degrees
        const near = 0.1;
        const far = 100;
        const f = 1.0 / Math.tan(fov / 2);
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) / (near - far), -1,
            0, 0, (2 * far * near) / (near - far), 0
        ];
    }

    _handleCameraInput(deltaTime) {
        const speed = 2.0;
        if (Input.isKeyPressed('w')) this.camera.position[2] += speed * deltaTime;
        if (Input.isKeyPressed('s')) this.camera.position[2] -= speed * deltaTime;
        if (Input.isKeyPressed('a')) this.camera.position[0] -= speed * deltaTime;
        if (Input.isKeyPressed('d')) this.camera.position[0] += speed * deltaTime;
    }
}

// Input handling class to manage keyboard and mouse events
class Input {
    static keys = {};
    static mouse = {
        x: 0,
        y: 0,
        isDown: false,
    };

    static initialize() {
        window.addEventListener('keydown', (e) => { Input.keys[e.key] = true; });
        window.addEventListener('keyup', (e) => { Input.keys[e.key] = false; });
        window.addEventListener('mousemove', (e) => {
            Input.mouse.x = e.clientX;
            Input.mouse.y = e.clientY;
        });
        window.addEventListener('mousedown', () => { Input.mouse.isDown = true; });
        window.addEventListener('mouseup', () => { Input.mouse.isDown = false; });
    }

    static isKeyPressed(key) {
        return !!Input.keys[key];
    }

    static getMousePosition() {
        return { x: Input.mouse.x, y: Input.mouse.y };
    }

    static isMouseDown() {
        return Input.mouse.isDown;
    }
}

// Basic GameObject class with transformation capabilities
class GameObject {
    constructor() {
        this.position = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];
        this.components = [];
    }

    addComponent(component) {
        component.gameObject = this;
        this.components.push(component);
    }

    update(deltaTime) {
        for (const component of this.components) {
            component.update(deltaTime);
        }
    }

    render(gl, camera) {
        // Override in subclass to define object-specific rendering logic
    }
}

// Shader helper functions
function createShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = createShader(gl, vertexSource, gl.VERTEX_SHADER);
    const fragmentShader = createShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

// Cube class with basic shaders for color and rotation
class Cube extends GameObject {
    constructor(gl) {
        super();
        this.gl = gl;
        this.initShaders();
        this.initBuffers();
    }

    initShaders() {
        const vertexSource = `
            attribute vec4 a_position;
            uniform mat4 u_matrix;
            void main() {
                gl_Position = u_matrix * a_position;
            }
        `;
        const fragmentSource = `
            precision mediump float;
            uniform vec4 u_color;
            void main() {
                gl_FragColor = u_color;
            }
        `;
        this.program = createProgram(this.gl, vertexSource, fragmentSource);
        this.positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.matrixLocation = this.gl.getUniformLocation(this.program, 'u_matrix');
        this.colorLocation = this.gl.getUniformLocation(this.program, 'u_color');
    }

    initBuffers() {
        const gl = this.gl;
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        const positions = [
            -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1,
            -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1, 1,
            -1, -1, -1, -1, 1, -1, -1, 1, 1, -1, -1, 1,
            1, -1, -1, 1, 1, -1, 1, 1, 1, 1, -1, 1,
            -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1,
            -1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    }

    render(gl, camera) {
        gl.useProgram(this.program);

        // Apply transformations
        const matrix = this._computeModelViewProjection(camera);
        gl.uniformMatrix4fv(this.matrixLocation, false, matrix);

        // Set color
        gl.uniform4f(this.colorLocation, 0.2, 0.6, 0.8, 1);

        // Bind the position buffer and set attributes
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    _computeModelViewProjection(camera) {
        const modelMatrix = this._computeTransformMatrix();
        const viewMatrix = this._computeViewMatrix(camera.position, camera.lookAt);
        const projectionMatrix = camera.projectionMatrix;
        return multiplyMatrices(projectionMatrix, multiplyMatrices(viewMatrix, modelMatrix));
    }

    _computeTransformMatrix() {
        return [
            this.scale[0], 0, 0, 0,
            0, this.scale[1], 0, 0,
            0, 0, this.scale[2], 0,
            this.position[0], this.position[1], this.position[2], 1,
        ];
    }

    _computeViewMatrix(position, target) {
        // Simple view matrix for demonstration
        return [
            1, 0, 0, -position[0],
            0, 1, 0, -position[1],
            0, 0, 1, -position[2],
            0, 0, 0, 1
        ];
    }
}

function multiplyMatrices(a, b) {
    const out = new Array(16);
    for (let i = 0; i < 4; ++i) {
        for (let j = 0; j < 4; ++j) {
            out[i * 4 + j] = 0;
            for (let k = 0; k < 4; ++k) {
                out[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
            }
        }
    }
    return out;
}
