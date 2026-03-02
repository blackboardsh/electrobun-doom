// doom-native.ts — Native C Doom (doomgeneric) launcher via FFI
// Loads libdoom.dylib, pushes keyboard events, reads framebuffer, renders via wgpu

import { dlopen, FFIType, ptr, CString } from "bun:ffi";
import { GpuFramebuffer } from "./gpu-framebuffer";
import { macKeyToDoomGenericKey } from "./doom-keys";
import { resolve, join } from "path";

let gpu: GpuFramebuffer | null = null;
let running = false;

const DOOM_WIDTH = 640;
const DOOM_HEIGHT = 400;

export async function launchNativeDoom(): Promise<void> {
    if (running) {
        console.log("Native Doom is already running");
        return;
    }
    running = true;

    // Find the dylib
    const dylibPath = findDylibPath();
    console.log(`Loading native doom from: ${dylibPath}`);

    // Load the dylib
    const lib = dlopen(dylibPath, {
        doom_init: {
            args: [FFIType.i32, FFIType.ptr],
            returns: FFIType.void,
        },
        doom_tick: {
            args: [],
            returns: FFIType.void,
        },
        doom_get_build_tag: {
            args: [],
            returns: FFIType.ptr,
        },
        doom_push_key: {
            args: [FFIType.i32, FFIType.i32],
            returns: FFIType.void,
        },
        doom_get_framebuffer: {
            args: [],
            returns: FFIType.ptr,
        },
        doom_copy_framebuffer: {
            args: [FFIType.ptr, FFIType.u64],
            returns: FFIType.void,
        },
        doom_get_screen_width: {
            args: [],
            returns: FFIType.i32,
        },
        doom_get_screen_height: {
            args: [],
            returns: FFIType.i32,
        },
    });

    const buildTagPtr = lib.symbols.doom_get_build_tag();
    if (buildTagPtr) {
        const tag = new CString(buildTagPtr as any);
        console.log(`Native Doom build tag: ${tag}`);
    }

    // Find WAD file
    const wadPath = findWadPath();

    // Initialize doom with command line args
    // Build argc/argv pointing to the WAD file
    const arg0 = cstring("doom");
    const arg1 = cstring("-iwad");
    const arg2 = cstring(wadPath);
    const argv = new BigUint64Array([
        BigInt(ptr(arg0)),
        BigInt(ptr(arg1)),
        BigInt(ptr(arg2)),
    ]);

    lib.symbols.doom_init(3, ptr(argv));

    const screenWidth = lib.symbols.doom_get_screen_width() as number;
    const screenHeight = lib.symbols.doom_get_screen_height() as number;

    console.log(`Native Doom screen: ${screenWidth}x${screenHeight}`);

    // Create GPU window
    gpu = new GpuFramebuffer(
        "Electrobun Doom — Native C Engine",
        screenWidth,
        screenHeight,
        screenWidth,
        screenHeight,
    );

    // Wire keyboard
    gpu.setKeyCallback((keyCode: number, pressed: boolean) => {
        const doomKey = macKeyToDoomGenericKey(keyCode);
        if (doomKey !== null) {
            lib.symbols.doom_push_key(doomKey, pressed ? 1 : 0);
        }
        const arrowAscii = macArrowToAscii(keyCode);
        if (arrowAscii !== null) {
            lib.symbols.doom_push_key(arrowAscii, pressed ? 1 : 0);
        }

        const ascii = macKeyToAsciiLower(keyCode);
        if (ascii !== null) {
            lib.symbols.doom_push_key(ascii, pressed ? 1 : 0);
        }
    });

    const pixelCount = screenWidth * screenHeight;
    const rawBuffer = new Uint8Array(pixelCount * 4);
    const rawView = new Uint32Array(rawBuffer.buffer);
    const rgbaBuffer = new Uint8Array(pixelCount * 4);

    // Game loop
    function gameLoop() {
        if (!running || !gpu) return;

        try {
            // Run one tick
            lib.symbols.doom_tick();

            // Read framebuffer into Bun-managed buffer
            lib.symbols.doom_copy_framebuffer(ptr(rawBuffer), rawBuffer.byteLength);

            // Convert RGB888 (packed as 0x00RRGGBB) to RGBA
            for (let i = 0; i < pixelCount; i++) {
                const pixel = rawView[i]!;
                    rgbaBuffer[i * 4] = (pixel >> 16) & 0xff;     // R
                    rgbaBuffer[i * 4 + 1] = (pixel >> 8) & 0xff;  // G
                    rgbaBuffer[i * 4 + 2] = pixel & 0xff;          // B
                    rgbaBuffer[i * 4 + 3] = 255;                    // A
            }
            gpu.uploadFrame(rgbaBuffer);
            gpu.present();
        } catch (err) {
            console.error("Native doom loop error:", err);
        }

        setTimeout(gameLoop, 1000 / 35);
    }

    gameLoop();
    console.log("Native C Doom is running!");
}

export function stopNativeDoom(): void {
    running = false;
    if (gpu) {
        gpu.stop();
        gpu.close();
        gpu = null;
    }
}

function findDylibPath(): string {
    const candidates = [
        join(import.meta.dir, "../native/libdoom.dylib"),
        join(import.meta.dir, "../../native/libdoom.dylib"),
        resolve("native/libdoom.dylib"),
        resolve("libdoom.dylib"),
    ];

    for (const path of candidates) {
        try {
            const file = Bun.file(path);
            if (file.size > 0) return path;
        } catch {}
    }

    throw new Error(
        `Could not find libdoom.dylib! Build it first:\n  cd native && make\nSearched:\n${candidates.join("\n")}`,
    );
}

function findWadPath(): string {
    const candidates = [
        join(import.meta.dir, "../../assets/freedoom1.wad"),
        join(import.meta.dir, "../assets/freedoom1.wad"),
        resolve("src/assets/freedoom1.wad"),
        resolve("assets/freedoom1.wad"),
    ];

    for (const path of candidates) {
        try {
            const file = Bun.file(path);
            if (file.size > 0) return path;
        } catch {}
    }

    throw new Error(`Could not find freedoom1.wad!`);
}

function cstring(value: string): Uint8Array {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(value);
    const buf = new Uint8Array(bytes.length + 1);
    buf.set(bytes, 0);
    buf[buf.length - 1] = 0;
    return buf;
}

function macKeyToAsciiLower(keyCode: number): number | null {
    // macOS virtual keycodes
    const map: Record<number, number> = {
        0x00: 0x61, // A
        0x0b: 0x62, // B
        0x08: 0x63, // C
        0x02: 0x64, // D
        0x0e: 0x65, // E
        0x03: 0x66, // F
        0x05: 0x67, // G
        0x04: 0x68, // H
        0x22: 0x69, // I
        0x26: 0x6a, // J
        0x28: 0x6b, // K
        0x25: 0x6c, // L
        0x2e: 0x6d, // M
        0x2d: 0x6e, // N
        0x1f: 0x6f, // O
        0x23: 0x70, // P
        0x0c: 0x71, // Q
        0x0f: 0x72, // R
        0x01: 0x73, // S
        0x11: 0x74, // T
        0x20: 0x75, // U
        0x09: 0x76, // V
        0x0d: 0x77, // W
        0x07: 0x78, // X
        0x10: 0x79, // Y
        0x06: 0x7a, // Z
    };
    if (keyCode in map) return map[keyCode]!;

    // DOM/ASCII keycodes
    if (keyCode >= 65 && keyCode <= 90) return keyCode + 32;
    if (keyCode >= 97 && keyCode <= 122) return keyCode;

    return null;
}

function macArrowToAscii(keyCode: number): number | null {
    // macOS arrow virtual keycodes
    switch (keyCode) {
        case 0x7e: // up
            return 0x77; // 'w'
        case 0x7d: // down
            return 0x73; // 's'
        case 0x7b: // left
            return 0x61; // 'a'
        case 0x7c: // right
            return 0x64; // 'd'
        default:
            break;
    }
    // DOM arrow keycodes
    switch (keyCode) {
        case 38:
            return 0x77;
        case 40:
            return 0x73;
        case 37:
            return 0x61;
        case 39:
            return 0x64;
        default:
            return null;
    }
}
