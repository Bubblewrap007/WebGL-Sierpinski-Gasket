// Get the WebGL context from the canvas element
const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('Unable to initialize WebGL. Your browser may not support it.');
}

// Vertex shader program
const vsSource = `
    attribute vec4 aVertexPosition;
    void main(void) {
        gl_Position = aVertexPosition;
        gl_PointSize = 1.0;
    }
`;

// Fragment shader program
const fsSource = `
    void main(void) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // Set the color to white
    }
`;

// Function to compile shaders
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    
    return shader;
}

// Function to initialize the shader program
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    
    return shaderProgram;
}

// Initialize the shader program
const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

// Look up the location of the attribute and uniform variables in the shader program
const programInfo = {
    program: shaderProgram,
    attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
    },
};

// Function to create a buffer for the gasket's vertices
function initBuffers(gl) {
    const positions = generateSierpinskiGasketVertices(5); // 5 levels of recursion
    
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
    return {
        position: positionBuffer,
        count: positions.length / 2,
    };
}

// Function to generate vertices for the Sierpinski Gasket
function generateSierpinskiGasketVertices(depth, a = [-0.5, -0.5], b = [0.5, -0.5], c = [0, 0.5]) {
    if (depth === 0) {
        return [...a, ...b, ...c];
    } else {
        const ab = mix(a, b);
        const ac = mix(a, c);
        const bc = mix(b, c);
        return [
            ...generateSierpinskiGasketVertices(depth - 1, a, ab, ac),
            ...generateSierpinskiGasketVertices(depth - 1, ab, b, bc),
            ...generateSierpinskiGasketVertices(depth - 1, ac, bc, c)
        ];
    }
}

// Linear interpolation function to find midpoint
function mix(p1, p2) {
    return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
}

// Initialize buffers
const buffers = initBuffers(gl);

// Draw the scene
function drawScene(gl, programInfo, buffers) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(programInfo.program);
    
    // Bind the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    
    // Draw the gasket
    gl.drawArrays(gl.TRIANGLES, 0, buffers.count);
}

drawScene(gl, programInfo, buffers);
