import type { PrimitiveKind, RenderSnapshot } from '@mochi/core';

import { geometries } from './geometry';

export interface WebGLRendererOptions {
  clearColor?: [number, number, number, number];
  lighting?: WebGLLightingOptions;
}

export interface WebGLLightingOptions {
  ambient?: number;
  direction?: [number, number, number];
  directional?: number;
}

export interface WebGLGameRenderer {
  readonly canvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  readonly width: number;
  readonly height: number;
  setSize(width: number, height: number, pixelRatio?: number): void;
  render(snapshot: RenderSnapshot): void;
  dispose(): void;
}

interface GpuGeometry {
  vao: WebGLVertexArrayObject;
  vertexBuffer: WebGLBuffer;
  normalBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  indexCount: number;
}

const vertexShaderSource = `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in vec3 aNormal;

uniform mat4 uViewProjection;
uniform mat4 uWorld;

out vec3 vNormal;

void main() {
  vNormal = normalize(mat3(uWorld) * aNormal);
  gl_Position = uViewProjection * uWorld * vec4(aPosition, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;

uniform vec3 uColor;
uniform float uAmbientLight;
uniform vec3 uLightDirection;
uniform float uDirectionalLight;

in vec3 vNormal;

out vec4 outColor;

void main() {
  float lit = max(dot(normalize(vNormal), normalize(-uLightDirection)), 0.0);
  float light = uAmbientLight + lit * uDirectionalLight;
  outColor = vec4(uColor * light, 1.0);
}
`;

export function createWebGLRenderer(
  canvas: HTMLCanvasElement,
  options: WebGLRendererOptions = {},
): WebGLGameRenderer {
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: true,
  });

  if (!gl) {
    throw new Error('mochi requires WebGL2 support.');
  }

  const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);
  const uniforms = {
    viewProjection: getUniform(gl, program, 'uViewProjection'),
    world: getUniform(gl, program, 'uWorld'),
    color: getUniform(gl, program, 'uColor'),
    ambientLight: getUniform(gl, program, 'uAmbientLight'),
    lightDirection: getUniform(gl, program, 'uLightDirection'),
    directionalLight: getUniform(gl, program, 'uDirectionalLight'),
  };
  const clearColor = options.clearColor ?? [0.04, 0.04, 0.08, 1];
  const lighting = {
    ambient: options.lighting?.ambient ?? 0.42,
    direction: normalizeLightDirection(options.lighting?.direction ?? [-0.45, -0.8, -0.35]),
    directional: options.lighting?.directional ?? 0.72,
  };
  const gpuGeometry: Record<PrimitiveKind, GpuGeometry> = {
    cube: uploadGeometry(gl, geometries.cube),
    plane: uploadGeometry(gl, geometries.plane),
  };

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);

  let currentWidth = 1;
  let currentHeight = 1;
  let disposed = false;

  return {
    canvas,
    gl,
    get width() {
      return currentWidth;
    },
    get height() {
      return currentHeight;
    },
    setSize(width, height, pixelRatio = 1) {
      currentWidth = Math.max(1, Math.floor(width));
      currentHeight = Math.max(1, Math.floor(height));
      canvas.width = Math.max(1, Math.floor(currentWidth * pixelRatio));
      canvas.height = Math.max(1, Math.floor(currentHeight * pixelRatio));
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    render(snapshot) {
      if (disposed) return;

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(program);
      gl.uniformMatrix4fv(uniforms.viewProjection, false, snapshot.viewProjectionMatrix);
      gl.uniform1f(uniforms.ambientLight, lighting.ambient);
      gl.uniform3f(
        uniforms.lightDirection,
        lighting.direction[0],
        lighting.direction[1],
        lighting.direction[2],
      );
      gl.uniform1f(uniforms.directionalLight, lighting.directional);

      for (const object of snapshot.objects) {
        const geometry = gpuGeometry[object.primitive];

        gl.bindVertexArray(geometry.vao);
        gl.uniformMatrix4fv(uniforms.world, false, object.worldMatrix);
        gl.uniform3f(uniforms.color, object.color.x, object.color.y, object.color.z);
        gl.drawElements(gl.TRIANGLES, geometry.indexCount, gl.UNSIGNED_SHORT, 0);
      }

      gl.bindVertexArray(null);
    },
    dispose() {
      if (disposed) return;
      disposed = true;

      for (const geometry of Object.values(gpuGeometry)) {
        gl.deleteVertexArray(geometry.vao);
        gl.deleteBuffer(geometry.vertexBuffer);
        gl.deleteBuffer(geometry.normalBuffer);
        gl.deleteBuffer(geometry.indexBuffer);
      }
      gl.deleteProgram(program);
    },
  };
}

function uploadGeometry(
  gl: WebGL2RenderingContext,
  geometry: { positions: Float32Array; normals: Float32Array; indices: Uint16Array },
): GpuGeometry {
  const vao = gl.createVertexArray();
  const vertexBuffer = gl.createBuffer();
  const normalBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();

  if (!vao || !vertexBuffer || !normalBuffer || !indexBuffer) {
    throw new Error('Unable to allocate WebGL geometry buffers.');
  }

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, geometry.positions, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, geometry.normals, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
  gl.bindVertexArray(null);

  return {
    vao,
    vertexBuffer,
    normalBuffer,
    indexBuffer,
    indexCount: geometry.indices.length,
  };
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): WebGLProgram {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();

  if (!program) {
    throw new Error('Unable to create WebGL program.');
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'Unknown WebGL link error.';
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);

  if (!shader) {
    throw new Error('Unable to create WebGL shader.');
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Unknown WebGL shader error.';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function getUniform(
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  name: string,
): WebGLUniformLocation {
  const location = gl.getUniformLocation(program, name);

  if (!location) {
    throw new Error(`Missing WebGL uniform: ${name}`);
  }

  return location;
}

function normalizeLightDirection(direction: [number, number, number]): [number, number, number] {
  const length = Math.hypot(direction[0], direction[1], direction[2]);
  if (length === 0) {
    throw new Error('WebGL light direction must not be zero.');
  }

  return [
    direction[0] / length,
    direction[1] / length,
    direction[2] / length,
  ];
}
