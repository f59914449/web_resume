"use client";

import React, { useEffect, useRef } from "react";

type BackgroundAnimationProps = {
  speed?: number; // global time scale
  intensity?: number; // visual strength
  className?: string;
  // If true, animation will render even when prefers-reduced-motion is set.
  respectReducedMotion?: boolean;
};

// Lightweight palette helper — subtle color variations
const defaultColors = {
  base: [10 / 255, 25 / 255, 47 / 255], // matches --background
  accent: [1.0, 0.42, 0.21], // approx neon orange in linear-ish space
  light: [0.90, 0.93, 0.95],
};

// Vertex shader (pass-through)
const VERT_SRC = `#version 300 es
layout(location = 0) in vec2 a_pos;
out vec2 v_uv;
void main() {
  v_uv = a_pos * 0.5 + 0.5; // from [-1,1] to [0,1]
  gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

// Fragment shader implementing multiple mathematical visualizations and crossfade
// Modes:
// 0 = Flowing wave interference
// 1 = FBM fractal noise
// 2 = Vector-field swirls (noise driven)
const FRAG_SRC = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_intensity;
uniform int u_modeA;
uniform int u_modeB;
uniform float u_mix;
uniform vec3 u_colorBase;
uniform vec3 u_colorAccent;
uniform vec3 u_colorLight;

// Utility: rotate 2D
mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, -s, s, c);
}

// Hash-based pseudo-random
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

// Value noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  // Four corners
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

// Fractal Brownian Motion
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p = m * p + vec2(0.123, 0.456);
    a *= 0.5;
  }
  return v;
}

// Visualization: 0 - flowing waves
vec3 viz_waves(vec2 uv, float t) {
  uv -= 0.5; // center
  uv *= rot(0.15 * sin(t * 0.1));
  float w1 = sin(uv.x * 8.0 + t * 1.2);
  float w2 = sin((uv.x + uv.y) * 6.0 - t * 1.1);
  float w3 = sin(uv.y * 10.0 + t * 0.9);
  float w = (w1 + w2 + w3) / 3.0;
  // Color blend
  vec3 base = mix(u_colorBase, u_colorLight, 0.25 + 0.25 * sin(t * 0.25));
  vec3 accent = u_colorAccent;
  return base + accent * (0.15 + 0.35 * w);
}

// Visualization: 1 - FBM fractal noise flow
vec3 viz_fbm(vec2 uv, float t) {
  vec2 p = uv * 3.0;
  // Domain warp
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.05)), fbm(p + vec2(1.0, t * 0.04)));
  vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7)), fbm(p + 4.0 * q + vec2(9.2)));
  float f = fbm(p + 4.0 * r);
  vec3 base = mix(u_colorBase, u_colorLight, 0.3 + 0.2 * f);
  vec3 accent = u_colorAccent * (0.2 + 0.6 * smoothstep(0.3, 0.7, f));
  return base + accent;
}

// Visualization: 2 - vector-field swirls
vec3 viz_field(vec2 uv, float t) {
  vec2 p = (uv - 0.5) * 2.0;
  p *= rot(0.5 * sin(t * 0.07));
  float a = fbm(p * 2.0 + vec2(t * 0.1, -t * 0.08));
  float b = fbm(p * 3.0 + vec2(-t * 0.06, t * 0.09));
  float v = smoothstep(0.2, 0.8, a * 0.6 + b * 0.4);
  vec3 base = mix(u_colorBase, u_colorLight, 0.2 + 0.4 * v);
  vec3 accent = u_colorAccent * (0.15 + 0.5 * v);
  return base + accent;
}

vec3 render_mode(int mode, vec2 uv, float t) {
  if (mode == 0) return viz_waves(uv, t);
  if (mode == 1) return viz_fbm(uv, t);
  return viz_field(uv, t);
}

void main() {
  // Pixel coordinates to UV, account for aspect ratio
  vec2 uv = v_uv;
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect;

  float t = u_time * u_speed;
  vec3 colA = render_mode(u_modeA, uv, t);
  vec3 colB = render_mode(u_modeB, uv, t + 0.5);
  vec3 col = mix(colA, colB, smoothstep(0.0, 1.0, u_mix));

  // Subtle vignetting for depth
  float d = distance(v_uv, vec2(0.5));
  col *= 1.0 - 0.25 * d * u_intensity;

  outColor = vec4(col, 1.0);
}
`;

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader) || "Unknown shader compile error";
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vert: string, frag: string) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vert);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, frag);
  const program = gl.createProgram()!;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program) || "Unknown program link error";
    gl.deleteProgram(program);
    throw new Error(info);
  }
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  return program;
}

export default function BackgroundAnimation({
  speed = 1.0,
  intensity = 0.6,
  className,
  respectReducedMotion = true,
}: BackgroundAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // If user prefers reduced motion, degrade to static gradient unless overridden
    if (prefersReducedMotion && respectReducedMotion) {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const setSize = () => {
        const { innerWidth: w, innerHeight: h, devicePixelRatio: dprRaw } = window;
        const dpr = Math.min(1.5, dprRaw || 1);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
      };
      setSize();
      const draw = () => {
        // Static subtle gradient for accessibility
        const w = canvas.width, h = canvas.height;
        const g = ctx!.createRadialGradient(w * 0.7, h * 0.3, h * 0.1, w * 0.5, h * 0.6, h * 0.9);
        g.addColorStop(0, "rgba(255, 107, 53, 0.15)");
        g.addColorStop(1, "rgba(255, 255, 255, 0.06)");
        ctx!.fillStyle = g;
        ctx!.fillRect(0, 0, w, h);
      };
      draw();
      window.addEventListener("resize", setSize);
      cleanupRef.current = () => {
        window.removeEventListener("resize", setSize);
      };
      return cleanupRef.current;
    }

    // Try WebGL2
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "high-performance",
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    }) as WebGL2RenderingContext | null;

    if (!gl) {
      // Fallback to a low-motion canvas animation
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      let running = true;
      let last = performance.now();
      let t = 0;
      const setSize = () => {
        const { innerWidth: w, innerHeight: h, devicePixelRatio: dprRaw } = window;
        const dpr = Math.min(1.5, dprRaw || 1);
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
      };
      const draw2D = () => {
        const w = canvas.width, h = canvas.height;
        ctx!.clearRect(0, 0, w, h);
        // Soft waves using sine + gradient for subtle motion
        const img = ctx!.createLinearGradient(0, 0, w, h);
        img.addColorStop(0, "rgba(255,107,53,0.10)");
        img.addColorStop(1, "rgba(255,255,255,0.04)");
        ctx!.fillStyle = img;
        ctx!.fillRect(0, 0, w, h);

        ctx!.globalAlpha = 0.25;
        ctx!.fillStyle = "rgba(255, 107, 53, 0.06)";
        const rows = 10;
        for (let i = 0; i < rows; i++) {
          const y = (i / rows) * h;
          const amp = (h * 0.02) * intensity;
          const freq = 0.002 + i * 0.0005;
          ctx!.beginPath();
          for (let x = 0; x <= w; x += 8) {
            const yy = y + Math.sin(x * freq + t * 0.001 * speed) * amp;
            if (x === 0) ctx!.moveTo(x, yy); else ctx!.lineTo(x, yy);
          }
          ctx!.lineTo(w, h);
          ctx!.lineTo(0, h);
          ctx!.closePath();
          ctx!.fill();
        }
        ctx!.globalAlpha = 1;
      };
      const loop = () => {
        if (!running) return;
        const now = performance.now();
        const dt = now - last;
        last = now;
        t += dt;
        draw2D();
        rafRef.current = requestAnimationFrame(loop);
      };
      setSize();
      loop();
      window.addEventListener("resize", setSize);
      cleanupRef.current = () => {
        running = false;
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        window.removeEventListener("resize", setSize);
      };
      return cleanupRef.current;
    }

    // WebGL2 pipeline
    const program = createProgram(gl, VERT_SRC, FRAG_SRC);
    gl.useProgram(program);

    // Geometry: full-screen triangle strip
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    const quad = new Float32Array([
      -1, -1,
      1, -1,
      -1, 1,
      1, 1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const u_resolution = gl.getUniformLocation(program, "u_resolution");
    const u_time = gl.getUniformLocation(program, "u_time");
    const u_speed = gl.getUniformLocation(program, "u_speed");
    const u_intensity = gl.getUniformLocation(program, "u_intensity");
    const u_modeA = gl.getUniformLocation(program, "u_modeA");
    const u_modeB = gl.getUniformLocation(program, "u_modeB");
    const u_mix = gl.getUniformLocation(program, "u_mix");
    const u_colorBase = gl.getUniformLocation(program, "u_colorBase");
    const u_colorAccent = gl.getUniformLocation(program, "u_colorAccent");
    const u_colorLight = gl.getUniformLocation(program, "u_colorLight");

    // Resolve CSS variables to color uniforms if available
    const getCssColor = (name: string, fallback: [number, number, number]) => {
      const styles = getComputedStyle(document.documentElement);
      const val = styles.getPropertyValue(name).trim();
      if (!val) return fallback;
      // Expect hex or rgb(a)
      try {
        if (val.startsWith("#")) {
          const hex = val.replace("#", "");
          const bigint = parseInt(hex.length === 3 ? hex.replace(/(.)/g, "$1$1") : hex, 16);
          const r = ((bigint >> 16) & 255) / 255;
          const g = ((bigint >> 8) & 255) / 255;
          const b = (bigint & 255) / 255;
          return [r, g, b];
        }
        if (val.startsWith("rgb")) {
          const nums = val.match(/\d+\.?\d*/g);
          if (nums && nums.length >= 3) {
            return [parseFloat(nums[0]) / 255, parseFloat(nums[1]) / 255, parseFloat(nums[2]) / 255];
          }
        }
      } catch {}
      return fallback;
    };

    const baseCol = getCssColor("--background", defaultColors.base as [number, number, number]);
    const lightCol = getCssColor("--foreground", defaultColors.light as [number, number, number]);
    const accentCol = getCssColor("--accent", defaultColors.accent as [number, number, number]);

    // Resize handling with DPR capping
    const setSize = () => {
      const { innerWidth: w, innerHeight: h, devicePixelRatio: dprRaw } = window;
      const dpr = Math.min(2, dprRaw || 1);
      const cw = Math.floor(w * dpr);
      const ch = Math.floor(h * dpr);
      canvas.width = cw;
      canvas.height = ch;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      gl.viewport(0, 0, cw, ch);
      gl.uniform2f(u_resolution, cw, ch);
    };
    setSize();

    // Animation state
    const start = performance.now();
    let lastReport = start;
    let frameCount = 0;
    let modeA = 0;
    let modeB = 1;
    let mixVal = 0;
    let transitioning = false;

    const startTransition = () => {
      transitioning = true;
      modeA = modeB;
      modeB = (modeB + 1) % 3; // cycle 0->1->2->0
      mixVal = 0;
    };

    const loop = () => {
      const now = performance.now();
      const t = (now - start) / 1000; // seconds
      frameCount++;

      // Cycle every 12s, transition ~3s
      const cycle = Math.floor(t / 12);
      if (!transitioning && (t - cycle * 12) > 9) {
        startTransition();
      }
      if (transitioning) {
        mixVal += 0.008 * speed; // ~3s fade at speed=1
        if (mixVal >= 1) {
          mixVal = 1;
          transitioning = false;
        }
      }

      gl.useProgram(program);
      gl.uniform1f(u_time, t);
      gl.uniform1f(u_speed, speed);
      gl.uniform1f(u_intensity, intensity);
      gl.uniform1i(u_modeA, modeA);
      gl.uniform1i(u_modeB, modeB);
      gl.uniform1f(u_mix, mixVal);
      gl.uniform3f(u_colorBase, baseCol[0], baseCol[1], baseCol[2]);
      gl.uniform3f(u_colorAccent, accentCol[0], accentCol[1], accentCol[2]);
      gl.uniform3f(u_colorLight, lightCol[0], lightCol[1], lightCol[2]);

      gl.disable(gl.DEPTH_TEST);
      gl.disable(gl.BLEND);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      // FPS reporting every ~5s
      if (now - lastReport > 5000) {
        const fps = (frameCount * 1000) / (now - lastReport);
        const event = new CustomEvent("backgroundAnimation:fps", {
          detail: { fps, renderer: "webgl2" },
        });
        window.dispatchEvent(event);
        // Reset counters
        frameCount = 0;
        lastReport = now;
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    const onResize = () => {
      // Use idle callback to avoid jank on continuous resize
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(setSize, { timeout: 300 });
      } else {
        setSize();
      }
    };
    window.addEventListener("resize", onResize);
    loop();

    cleanupRef.current = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", onResize);
      gl.bindVertexArray(null);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.deleteBuffer(vbo);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    };
    return cleanupRef.current;
  }, [speed, intensity, respectReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={
        [
          "fixed inset-0 z-0 pointer-events-none",
          // Backdrop blur to subtly blend with content if supported
          "[filter:contrast(105%)]",
          className || "",
        ].join(" ")
      }
    />
  );
}