import React, { useEffect, useRef } from "react";
// import "./webgl2examples.css";
const Triangle = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gl = canvas.getContext("webgl2");
    if (!gl) {
      console.error("WebGL 2 not available");
      return;
    }

    gl.clearColor(0, 0, 0, 1);

    // Vertex shader
    const vsSource = `#version 300 es
    layout (location=0) in vec4 position;
    layout (location=1) in vec3 color;
    out vec3 vColor;
    void main() {
        vColor = color;
        gl_Position = position;
    }`;

    // Fragment shader
    const fsSource = `#version 300 es
    precision highp float;
    in vec3 vColor;
    out vec4 fragColor;
    void main() {
        fragColor = vec4(vColor, 1.0);
    }`;

    const createShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fsSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);

    // Geometry
    const triangleArray = gl.createVertexArray();
    gl.bindVertexArray(triangleArray);

    const positions = new Float32Array([
      -0.5, -0.5, 0.0, 0.5, -0.5, 0.0, 0.0, 0.5, 0.0,
    ]);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    const colors = new Float32Array([
      1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0,
    ]);
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(1);

    // Draw
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }, []);

  return (
    <div>
      <div
        style={{
          margin: "0",
          position: "absolute",
          top: "10px",
          left: "10px",
          color: "white",
          backgroundColor: "gray",
          padding: "0.5em",
          maxWidth: "24%",
        }}
      >
        <header>WebGL 2 Example: Just a Triangle</header>
        <div>Features: Vertex Arrays</div>
        <div>
          <a
            href="https://github.com/tsherif/webgl2examples/blob/master/triangle.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source code
          </a>
        </div>
      </div>

      <canvas
        style={{ width: "1080px", height: "720px" }}
        ref={canvasRef}
        // style={{ display: " }}
      />
    </div>
  );
};

export default Triangle;
