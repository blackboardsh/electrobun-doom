# Electrobun DOOM

This repo demonstrates **two DOOM implementations inside Electrobun** to showcase Electrobun’s robust **WGPU** integration.

It’s intentionally pragmatic: a real game rendering in a **native GPU window** (no webview) and a second implementation in **pure TypeScript**. Both are playable; the C version is fully functional, and the TypeScript port is playable but still a work in progress.

Thanks to Electrobun’s packaging and update system, the shipped **.dmg is 29.5MB**, and updates can be **as small as 4KB** when rolling out new features.

Project home:
```
https://github.com/blackboardsh/electrobun
```

## What This Demo Shows

Electrobun can open a **native GPU window** (`gpuWindow`) backed by a **Metal layer** on macOS. In that window, Bun/TypeScript can talk directly to **WGPU via FFI** — no webview in the rendering pipeline.

This repo provides:
- A **C implementation** (based on DoomGeneric) rendered into a GPU window.
- A **TypeScript port** of DOOM that renders into the same kind of GPU window, using Electrobun’s WGPU APIs from Bun.

There is also a **launcher webview** window that lets you choose between the two demos.

## How It’s Wired

### GPU Window
- A native Electrobun `gpuWindow` is created.
- It is backed by a native Metal surface.
- Rendering is done with WGPU (via Electrobun), no webview involved.

### C Version (Native)
- A small native bridge loads `libdoom.dylib`.
- The DoomGeneric framebuffer is copied into a WGPU texture each frame.
- Input is passed from the Electrobun window to the native library.
- This version is **fully functional**.

### TypeScript Version
- A pure TypeScript port of DOOM runs inside Bun.
- It renders to WGPU directly via Electrobun’s APIs.
- Input is handled in TS and forwarded into the game loop.
- This version is **playable but still in progress**.

## Setup

From repo root:

```
bun install
```

Build the native Doom library (macOS only for now):

```
bun run build:native
```

Run the app:

```
bun start
```

## Notes

- The **C version** is the reference implementation and is fully playable.
- The **TypeScript version** is actively being ported and improved.
- Audio and mouse input are currently out of scope; keyboard input is supported.
