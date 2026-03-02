// doomgeneric_electrobun.c
// Platform implementation for doomgeneric running in Electrobun via FFI

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>

// doomgeneric expects these to be defined externally
#include "doomgeneric.h"
#include "m_controls.h"

static const char* DOOM_ELECTROBUN_BUILD_TAG = "electrobun-doom-c-1";

// Key event ring buffer (pushed from Bun via FFI)
#define MAX_KEY_EVENTS 64

typedef struct {
    unsigned char keycode;
    unsigned char pressed;
} KeyEvent;

static KeyEvent key_ring[MAX_KEY_EVENTS];
static int key_ring_head = 0;
static int key_ring_tail = 0;

// Shared framebuffer (read from Bun via FFI)
// DG_ScreenBuffer is provided by doomgeneric

// === Exported functions for Bun FFI ===

void doom_push_key(int keycode, int pressed) {
    int next = (key_ring_head + 1) % MAX_KEY_EVENTS;
    if (next != key_ring_tail) {
        key_ring[key_ring_head].keycode = (unsigned char)keycode;
        key_ring[key_ring_head].pressed = (unsigned char)pressed;
        key_ring_head = next;
    }
}

uint32_t* doom_get_framebuffer(void) {
    return DG_ScreenBuffer;
}

const char* doom_get_build_tag(void) {
    return DOOM_ELECTROBUN_BUILD_TAG;
}

void doom_copy_framebuffer(void* dst, size_t bytes) {
    if (!dst || !DG_ScreenBuffer || bytes == 0) return;
    memcpy(dst, DG_ScreenBuffer, bytes);
}

int doom_get_screen_width(void) {
    return DOOMGENERIC_RESX;
}

int doom_get_screen_height(void) {
    return DOOMGENERIC_RESY;
}

void doom_init(int argc, char **argv) {
    doomgeneric_Create(argc, argv);
}

void doom_tick(void) {
    doomgeneric_Tick();
}

// === doomgeneric platform callbacks ===

void DG_Init(void) {
    // Nothing to initialize — rendering is handled by Bun/wgpu
    // Use WASD for movement so ASCII letters drive movement + cheats.
    key_up = 'w';
    key_down = 's';
    key_left = 'a';
    key_right = 'd';
}

void DG_DrawFrame(void) {
    // DG_ScreenBuffer already contains the frame.
    // Bun will read it via doom_get_framebuffer() after each tick.
}

void DG_SleepMs(uint32_t ms) {
    usleep(ms * 1000);
}

uint32_t DG_GetTicksMs(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return (uint32_t)(ts.tv_sec * 1000 + ts.tv_nsec / 1000000);
}

int DG_GetKey(int *pressed, unsigned char *doomKey) {
    if (key_ring_tail == key_ring_head) {
        return 0;  // no keys
    }

    *pressed = key_ring[key_ring_tail].pressed;
    *doomKey = key_ring[key_ring_tail].keycode;
    key_ring_tail = (key_ring_tail + 1) % MAX_KEY_EVENTS;
    return 1;
}

void DG_SetWindowTitle(const char *title) {
    // Handled by Bun/Electrobun
}
