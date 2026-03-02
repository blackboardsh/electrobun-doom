// Doom engine key constants (from linuxdoom-1.10 doomdef.h)
export const KEY_RIGHTARROW = 0xae;
export const KEY_LEFTARROW = 0xac;
export const KEY_UPARROW = 0xad;
export const KEY_DOWNARROW = 0xaf;
export const KEY_ESCAPE = 27;
export const KEY_ENTER = 13;
export const KEY_TAB = 9;
export const KEY_F1 = 0x80 + 0x3b;
export const KEY_F2 = 0x80 + 0x3c;
export const KEY_F3 = 0x80 + 0x3d;
export const KEY_F4 = 0x80 + 0x3e;
export const KEY_F5 = 0x80 + 0x3f;
export const KEY_F6 = 0x80 + 0x40;
export const KEY_F7 = 0x80 + 0x41;
export const KEY_F8 = 0x80 + 0x42;
export const KEY_F9 = 0x80 + 0x43;
export const KEY_F10 = 0x80 + 0x44;
export const KEY_F11 = 0x80 + 0x57;
export const KEY_F12 = 0x80 + 0x58;
export const KEY_BACKSPACE = 127;
export const KEY_PAUSE = 0xff;
export const KEY_EQUALS = 0x3d;
export const KEY_MINUS = 0x2d;
export const KEY_RSHIFT = 0x80 + 0x36;
export const KEY_RCTRL = 0x80 + 0x1d;
export const KEY_RALT = 0x80 + 0x38;
export const KEY_FIRE = KEY_RCTRL;
export const KEY_USE = 32; // space
export const KEY_STRAFE = KEY_RALT;

// doomgeneric key constants (doomkeys.h)
export const DG_KEY_STRAFE_L = 0xa0;
export const DG_KEY_STRAFE_R = 0xa1;
export const DG_KEY_USE = 0xa2;
export const DG_KEY_FIRE = 0xa3;

// macOS virtual keycodes
const kVK_Return = 0x24;
const kVK_Tab = 0x30;
const kVK_Space = 0x31;
const kVK_Delete = 0x33;
const kVK_Escape = 0x35;
const kVK_LeftArrow = 0x7b;
const kVK_RightArrow = 0x7c;
const kVK_DownArrow = 0x7d;
const kVK_UpArrow = 0x7e;
const kVK_F1 = 0x7a;
const kVK_F2 = 0x78;
const kVK_F3 = 0x63;
const kVK_F4 = 0x76;
const kVK_F5 = 0x60;
const kVK_F6 = 0x61;
const kVK_F7 = 0x62;
const kVK_F8 = 0x64;
const kVK_F9 = 0x65;
const kVK_F10 = 0x6d;
const kVK_F11 = 0x67;
const kVK_F12 = 0x6f;
const kVK_ANSI_A = 0x00;
const kVK_ANSI_S = 0x01;
const kVK_ANSI_D = 0x02;
const kVK_ANSI_W = 0x0d;
const kVK_ANSI_E = 0x0e;
const kVK_ANSI_1 = 0x12;
const kVK_ANSI_2 = 0x13;
const kVK_ANSI_3 = 0x14;
const kVK_ANSI_4 = 0x15;
const kVK_ANSI_5 = 0x17;
const kVK_ANSI_6 = 0x16;
const kVK_ANSI_7 = 0x1a;
const kVK_ANSI_8 = 0x1c;
const kVK_ANSI_9 = 0x19;
const kVK_ANSI_0 = 0x1d;
const kVK_ANSI_Minus = 0x1b;
const kVK_ANSI_Equal = 0x18;
const kVK_Shift = 0x38;
const kVK_Control = 0x3b;
const kVK_Option = 0x3a;
const kVK_RightShift = 0x3c;
const kVK_RightControl = 0x3e;
const kVK_RightOption = 0x3d;
const kVK_ANSI_Y = 0x10;
const kVK_ANSI_N = 0x2d;
const kVK_ANSI_M = 0x2e;
const kVK_ANSI_Period = 0x2f;
const kVK_ANSI_Comma = 0x2b;

// Map from macOS virtual keycode to Doom keycode
const macToDoom = new Map<number, number>([
	// Arrow keys
	[kVK_UpArrow, KEY_UPARROW],
	[kVK_DownArrow, KEY_DOWNARROW],
	[kVK_LeftArrow, KEY_LEFTARROW],
	[kVK_RightArrow, KEY_RIGHTARROW],

	// Action keys
	[kVK_Space, KEY_USE],
	[kVK_Control, KEY_FIRE],
	[kVK_RightControl, KEY_FIRE],
	[kVK_Shift, KEY_RSHIFT],
	[kVK_RightShift, KEY_RSHIFT],
	[kVK_Option, KEY_RALT],
	[kVK_RightOption, KEY_RALT],

	// WASD movement
	[kVK_ANSI_W, KEY_UPARROW],
	[kVK_ANSI_S, KEY_DOWNARROW],
	[kVK_ANSI_A, KEY_LEFTARROW], // turn left
	[kVK_ANSI_D, KEY_RIGHTARROW], // turn right

	// General keys
	[kVK_Escape, KEY_ESCAPE],
	[kVK_Return, KEY_ENTER],
	[kVK_Tab, KEY_TAB],
	[kVK_Delete, KEY_BACKSPACE],
	[kVK_ANSI_Minus, KEY_MINUS],
	[kVK_ANSI_Equal, KEY_EQUALS],

	// Function keys
	[kVK_F1, KEY_F1],
	[kVK_F2, KEY_F2],
	[kVK_F3, KEY_F3],
	[kVK_F4, KEY_F4],
	[kVK_F5, KEY_F5],
	[kVK_F6, KEY_F6],
	[kVK_F7, KEY_F7],
	[kVK_F8, KEY_F8],
	[kVK_F9, KEY_F9],
	[kVK_F10, KEY_F10],
	[kVK_F11, KEY_F11],
	[kVK_F12, KEY_F12],

	// Number keys (weapon selection)
	[kVK_ANSI_1, 0x31], // '1'
	[kVK_ANSI_2, 0x32], // '2'
	[kVK_ANSI_3, 0x33], // '3'
	[kVK_ANSI_4, 0x34], // '4'
	[kVK_ANSI_5, 0x35], // '5'
	[kVK_ANSI_6, 0x36], // '6'
	[kVK_ANSI_7, 0x37], // '7'
	[kVK_ANSI_8, 0x38], // '8'
	[kVK_ANSI_9, 0x39], // '9'
	[kVK_ANSI_0, 0x30], // '0'

	// Menu / misc keys
	[kVK_ANSI_Y, 0x79], // 'y'
	[kVK_ANSI_N, 0x6e], // 'n'
	[kVK_ANSI_M, 0x6d], // 'm' (automap toggle)
	[kVK_ANSI_Comma, 0x2c], // ',' (strafe left)
	[kVK_ANSI_Period, 0x2e], // '.' (strafe right)

	// DOM/ASCII-style keycodes (fallback for other platforms)
	[37, KEY_LEFTARROW], // ArrowLeft
	[38, KEY_UPARROW], // ArrowUp
	[39, KEY_RIGHTARROW], // ArrowRight
	[40, KEY_DOWNARROW], // ArrowDown
	[65, KEY_LEFTARROW], // 'A'
	[68, KEY_RIGHTARROW], // 'D'
	[87, KEY_UPARROW], // 'W'
	[83, KEY_DOWNARROW], // 'S'
	[97, KEY_LEFTARROW], // 'a'
	[100, KEY_RIGHTARROW], // 'd'
	[119, KEY_UPARROW], // 'w'
	[115, KEY_DOWNARROW], // 's'
	[32, KEY_USE], // space
	[17, KEY_FIRE], // ctrl
	[16, KEY_RSHIFT], // shift
	[18, KEY_RALT], // alt/option
]);

/**
 * Convert a macOS virtual keycode to a Doom engine keycode.
 * Returns null if the key has no mapping.
 */
export function macKeyToDoomKey(macKeyCode: number): number | null {
	return macToDoom.get(macKeyCode) ?? null;
}

// Map for doomgeneric (native C) which expects doomkeys.h codes
const macToDoomGeneric = new Map<number, number>([
	// Arrow keys
	[kVK_UpArrow, KEY_UPARROW],
	[kVK_DownArrow, KEY_DOWNARROW],
	[kVK_LeftArrow, KEY_LEFTARROW],
	[kVK_RightArrow, KEY_RIGHTARROW],

	// Action keys (native)
	[kVK_Space, DG_KEY_USE],
	[kVK_Control, DG_KEY_FIRE],
	[kVK_RightControl, DG_KEY_FIRE],
	[kVK_ANSI_E, DG_KEY_USE],
	[kVK_Shift, KEY_RSHIFT],
	[kVK_RightShift, KEY_RSHIFT],
	[kVK_Option, KEY_RALT],
	[kVK_RightOption, KEY_RALT],

	// General keys
	[kVK_Escape, KEY_ESCAPE],
	[kVK_Return, KEY_ENTER],
	[kVK_Tab, KEY_TAB],
	[kVK_Delete, KEY_BACKSPACE],
	[kVK_ANSI_Minus, KEY_MINUS],
	[kVK_ANSI_Equal, KEY_EQUALS],

	// Function keys
	[kVK_F1, KEY_F1],
	[kVK_F2, KEY_F2],
	[kVK_F3, KEY_F3],
	[kVK_F4, KEY_F4],
	[kVK_F5, KEY_F5],
	[kVK_F6, KEY_F6],
	[kVK_F7, KEY_F7],
	[kVK_F8, KEY_F8],
	[kVK_F9, KEY_F9],
	[kVK_F10, KEY_F10],
	[kVK_F11, KEY_F11],
	[kVK_F12, KEY_F12],

	// Number keys (weapon selection)
	[kVK_ANSI_1, 0x31],
	[kVK_ANSI_2, 0x32],
	[kVK_ANSI_3, 0x33],
	[kVK_ANSI_4, 0x34],
	[kVK_ANSI_5, 0x35],
	[kVK_ANSI_6, 0x36],
	[kVK_ANSI_7, 0x37],
	[kVK_ANSI_8, 0x38],
	[kVK_ANSI_9, 0x39],
	[kVK_ANSI_0, 0x30],

	// Menu / misc keys
	[kVK_ANSI_Y, 0x79],
	[kVK_ANSI_N, 0x6e],
	[kVK_ANSI_M, 0x6d],
	[kVK_ANSI_Comma, DG_KEY_STRAFE_L],
	[kVK_ANSI_Period, DG_KEY_STRAFE_R],

	// DOM/ASCII fallbacks
	[37, KEY_LEFTARROW],
	[38, KEY_UPARROW],
	[39, KEY_RIGHTARROW],
	[40, KEY_DOWNARROW],
	[32, DG_KEY_USE],
	[17, DG_KEY_FIRE],
	[16, KEY_RSHIFT],
	[18, KEY_RALT],
	[69, DG_KEY_USE],
	[101, DG_KEY_USE],
]);

export function macKeyToDoomGenericKey(macKeyCode: number): number | null {
	return macToDoomGeneric.get(macKeyCode) ?? null;
}
