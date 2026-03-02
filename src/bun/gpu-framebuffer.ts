import { GpuWindow, Screen, WGPU, WGPUBridge } from "electrobun/bun";
import { CString, ptr } from "bun:ffi";

const WGPUNative = WGPU.native;
const WGPU_STRLEN = 0xffffffffffffffffn;
const WGPU_DEPTH_SLICE_UNDEFINED = 0xffffffff;
const WGPUTextureFormat_BGRA8UnormSrgb = 0x0000001c;
const WGPUTextureFormat_RGBA8Unorm = 0x00000016;
const WGPUTextureFormat_RGBA8UnormSrgb = 0x00000017;
const WGPUTextureUsage_RenderAttachment = 0x0000000000000010n;
const WGPUTextureUsage_TextureBinding = 0x0000000000000004n;
const WGPUTextureUsage_CopyDst = 0x0000000000000002n;
const WGPUPrimitiveTopology_TriangleList = 0x00000004;
const WGPUFrontFace_CCW = 0x00000001;
const WGPUCullMode_None = 0x00000001;
const WGPUPresentMode_Fifo = 0x00000001;
const WGPUTextureDimension_2D = 0x00000002;
const WGPUTextureAspect_All = 0x00000001;
const WGPUAddressMode_ClampToEdge = 0x00000001;
const WGPUFilterMode_Nearest = 0x00000001;
const WGPUMipmapFilterMode_Nearest = 0x00000001;

type KeyCallback = (keyCode: number, pressed: boolean) => void;
type ResizeCallback = (width: number, height: number) => void;

// --- Struct marshalling helpers (matching electrobun wgpu template patterns) ---

function writePtr(view: DataView, offset: number, value: number | bigint | null) {
	view.setBigUint64(offset, BigInt(value ?? 0), true);
}

function writeU32(view: DataView, offset: number, value: number | bigint) {
	view.setUint32(offset, Number(value) >>> 0, true);
}

function writeU64(view: DataView, offset: number, value: bigint) {
	view.setBigUint64(offset, value, true);
}

function makeSurfaceSourceMetalLayer(layerPtr: number) {
	const buffer = new ArrayBuffer(24);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);
	writeU32(view, 8, 0x00000004); // WGPUSType_SurfaceSourceMetalLayer
	writeU32(view, 12, 0);
	writePtr(view, 16, layerPtr);
	return { buffer, ptr: ptr(buffer) };
}

function makeSurfaceDescriptor(nextInChainPtr: number) {
	const buffer = new ArrayBuffer(24);
	const view = new DataView(buffer);
	writePtr(view, 0, nextInChainPtr);
	writePtr(view, 8, 0);
	writeU64(view, 16, 0n);
	return { buffer, ptr: ptr(buffer) };
}

function makeSurfaceConfiguration(
	devicePtr: number,
	width: number,
	height: number,
	format: number,
) {
	const buffer = new ArrayBuffer(64);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);
	writePtr(view, 8, devicePtr);
	writeU32(view, 16, format);
	writeU32(view, 20, 0);
	writeU64(view, 24, WGPUTextureUsage_RenderAttachment);
	writeU32(view, 32, width);
	writeU32(view, 36, height);
	writeU64(view, 40, 0n);
	writePtr(view, 48, 0);
	writeU32(view, 56, 1);
	writeU32(view, 60, WGPUPresentMode_Fifo);
	return { buffer, ptr: ptr(buffer) };
}

function makeShaderSourceWGSL(codePtr: number) {
	const buffer = new ArrayBuffer(32);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);
	writeU32(view, 8, 0x00000002); // WGPUSType_ShaderSourceWGSL
	writeU32(view, 12, 0);
	writePtr(view, 16, codePtr);
	writeU64(view, 24, WGPU_STRLEN);
	return { buffer, ptr: ptr(buffer) };
}

function makeShaderModuleDescriptor(nextInChainPtr: number) {
	const buffer = new ArrayBuffer(24);
	const view = new DataView(buffer);
	writePtr(view, 0, nextInChainPtr);
	writePtr(view, 8, 0);
	writeU64(view, 16, 0n);
	return { buffer, ptr: ptr(buffer) };
}

function makeColorTargetState(format: number) {
	const buffer = new ArrayBuffer(32);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);
	writeU32(view, 8, format);
	writeU32(view, 12, 0);
	writePtr(view, 16, 0); // blend: null
	writeU64(view, 24, 0x0fn); // writeMask: all
	return { buffer, ptr: ptr(buffer) };
}

function makeVertexStateNoBuffers(modulePtr: number, entryPointPtr: number) {
	const buffer = new ArrayBuffer(64);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);        // nextInChain
	writePtr(view, 8, modulePtr); // module
	writePtr(view, 16, entryPointPtr); // entryPoint
	writeU64(view, 24, WGPU_STRLEN);  // entryPointLen
	writeU64(view, 32, 0n);      // constantCount
	writePtr(view, 40, 0);       // constants
	writeU64(view, 48, 0n);      // bufferCount = 0 (no vertex buffers)
	writePtr(view, 56, 0);       // buffers = null
	return { buffer, ptr: ptr(buffer) };
}

function makeFragmentState(modulePtr: number, entryPointPtr: number, targetPtr: number) {
	const buffer = new ArrayBuffer(64);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);
	writePtr(view, 8, modulePtr);
	writePtr(view, 16, entryPointPtr);
	writeU64(view, 24, WGPU_STRLEN);
	writeU64(view, 32, 0n);
	writePtr(view, 40, 0);
	writeU64(view, 48, 1n);
	writePtr(view, 56, targetPtr);
	return { buffer, ptr: ptr(buffer) };
}

function makePrimitiveState() {
	const buffer = new ArrayBuffer(32);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);
	writeU32(view, 8, WGPUPrimitiveTopology_TriangleList);
	writeU32(view, 12, 0);
	writeU32(view, 16, WGPUFrontFace_CCW);
	writeU32(view, 20, WGPUCullMode_None);
	writeU32(view, 24, 0);
	writeU32(view, 28, 0);
	return { buffer, ptr: ptr(buffer) };
}

function makeMultisampleState() {
	const buffer = new ArrayBuffer(24);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);
	writeU32(view, 8, 1);
	writeU32(view, 12, 0xffffffff);
	writeU32(view, 16, 0);
	writeU32(view, 20, 0);
	return { buffer, ptr: ptr(buffer) };
}

function makeRenderPipelineDescriptor(
	vertexState: { buffer: ArrayBuffer },
	primitiveState: { buffer: ArrayBuffer },
	multisampleState: { buffer: ArrayBuffer },
	fragmentState: { buffer: ArrayBuffer; ptr: number | bigint },
	layoutPtr: number = 0,
) {
	const buffer = new ArrayBuffer(168);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);        // nextInChain
	writePtr(view, 8, 0);        // label
	writeU64(view, 16, 0n);      // labelLen
	writePtr(view, 24, layoutPtr); // layout (0 = auto)
	// vertex state inline (64 bytes at offset 32)
	new Uint8Array(buffer, 32, 64).set(new Uint8Array(vertexState.buffer));
	// primitive state inline (32 bytes at offset 96)
	new Uint8Array(buffer, 96, 32).set(new Uint8Array(primitiveState.buffer));
	// depthStencil ptr at offset 128
	writePtr(view, 128, 0);
	// multisample state inline (24 bytes at offset 136)
	new Uint8Array(buffer, 136, 24).set(new Uint8Array(multisampleState.buffer));
	// fragment state ptr at offset 160
	writePtr(view, 160, fragmentState.ptr as unknown as number);
	return { buffer, ptr: ptr(buffer) };
}

function makeTextureDescriptor(
	width: number,
	height: number,
	format: number,
	usage: bigint,
) {
	const buffer = new ArrayBuffer(80);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);        // nextInChain
	writePtr(view, 8, 0);        // label
	writeU64(view, 16, 0n);      // labelLen
	writeU64(view, 24, usage);   // usage
	writeU32(view, 32, WGPUTextureDimension_2D); // dimension
	writeU32(view, 36, width);   // size.width
	writeU32(view, 40, height);  // size.height
	writeU32(view, 44, 1);       // size.depthOrArrayLayers
	writeU32(view, 48, format);  // format
	writeU32(view, 52, 1);       // mipLevelCount
	writeU32(view, 56, 1);       // sampleCount
	writeU32(view, 60, 0);       // padding
	writeU64(view, 64, 0n);      // viewFormatCount
	writePtr(view, 72, 0);       // viewFormats
	return { buffer, ptr: ptr(buffer) };
}

function makeSamplerDescriptor() {
	const buffer = new ArrayBuffer(64);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);                          // nextInChain
	writePtr(view, 8, 0);                          // label
	writeU64(view, 16, 0n);                        // labelLen
	writeU32(view, 24, WGPUAddressMode_ClampToEdge); // addressModeU
	writeU32(view, 28, WGPUAddressMode_ClampToEdge); // addressModeV
	writeU32(view, 32, WGPUAddressMode_ClampToEdge); // addressModeW
	writeU32(view, 36, WGPUFilterMode_Nearest);    // magFilter
	writeU32(view, 40, WGPUFilterMode_Nearest);    // minFilter
	writeU32(view, 44, WGPUMipmapFilterMode_Nearest); // mipmapFilter
	view.setFloat32(48, 0, true);                   // lodMinClamp
	view.setFloat32(52, 32, true);                  // lodMaxClamp
	writeU32(view, 56, 0);                          // compare (undefined)
	view.setUint16(60, 1, true);                    // maxAnisotropy
	view.setUint16(62, 0, true);                    // padding
	return { buffer, ptr: ptr(buffer) };
}

function makeBindGroupEntrySampler(binding: number, samplerPtr: number) {
	const buffer = new ArrayBuffer(56);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);          // nextInChain
	writeU32(view, 8, binding);    // binding
	writeU32(view, 12, 0);         // padding
	writePtr(view, 16, 0);         // buffer (null)
	writeU64(view, 24, 0n);        // offset
	writeU64(view, 32, 0n);        // size
	writePtr(view, 40, samplerPtr); // sampler
	writePtr(view, 48, 0);         // textureView (null)
	return { buffer, ptr: ptr(buffer) };
}

function makeBindGroupEntryTexture(binding: number, textureViewPtr: number) {
	const buffer = new ArrayBuffer(56);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);
	writeU32(view, 8, binding);
	writeU32(view, 12, 0);
	writePtr(view, 16, 0);
	writeU64(view, 24, 0n);
	writeU64(view, 32, 0n);
	writePtr(view, 40, 0);             // sampler (null)
	writePtr(view, 48, textureViewPtr); // textureView
	return { buffer, ptr: ptr(buffer) };
}

function makeBindGroupDescriptor(layoutPtr: number, entriesPtr: number, count: number) {
	const buffer = new ArrayBuffer(48);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);        // nextInChain
	writePtr(view, 8, 0);        // label
	writeU64(view, 16, 0n);      // labelLen
	writePtr(view, 24, layoutPtr); // layout
	writeU64(view, 32, BigInt(count)); // entryCount
	writePtr(view, 40, entriesPtr);    // entries
	return { buffer, ptr: ptr(buffer) };
}

function makeTexelCopyTextureInfo(texturePtr: number) {
	const buffer = new ArrayBuffer(32);
	const view = new DataView(buffer);
	writePtr(view, 0, texturePtr); // texture
	writeU32(view, 8, 0);         // mipLevel
	writeU32(view, 12, 0);        // origin.x
	writeU32(view, 16, 0);        // origin.y
	writeU32(view, 20, 0);        // origin.z
	writeU32(view, 24, WGPUTextureAspect_All); // aspect
	writeU32(view, 28, 0);        // padding
	return { buffer, ptr: ptr(buffer) };
}

function makeTexelCopyBufferLayout(bytesPerRow: number, rowsPerImage: number) {
	const buffer = new ArrayBuffer(16);
	const view = new DataView(buffer);
	writeU64(view, 0, 0n);        // offset
	writeU32(view, 8, bytesPerRow);
	writeU32(view, 12, rowsPerImage);
	return { buffer, ptr: ptr(buffer) };
}

function makeExtent3D(width: number, height: number, depth: number) {
	const buffer = new ArrayBuffer(12);
	const view = new DataView(buffer);
	writeU32(view, 0, width);
	writeU32(view, 4, height);
	writeU32(view, 8, depth);
	return { buffer, ptr: ptr(buffer) };
}

function makeCommandEncoderDescriptor() {
	const buffer = new ArrayBuffer(24);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);
	writePtr(view, 8, 0);
	writeU64(view, 16, 0n);
	return { buffer, ptr: ptr(buffer) };
}

function makeSurfaceTexture() {
	const buffer = new ArrayBuffer(24);
	return { buffer, view: new DataView(buffer), ptr: ptr(buffer) };
}

function makeRenderPassColorAttachment(viewPtr: number) {
	const buffer = new ArrayBuffer(72);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);          // nextInChain
	writePtr(view, 8, viewPtr);    // view
	writeU32(view, 16, WGPU_DEPTH_SLICE_UNDEFINED);
	writeU32(view, 20, 0);
	writePtr(view, 24, 0);         // resolveTarget
	writeU32(view, 32, 2);         // loadOp = Clear
	writeU32(view, 36, 1);         // storeOp = Store
	view.setFloat64(40, 0.0, true);  // clearValue.r
	view.setFloat64(48, 0.0, true);  // clearValue.g
	view.setFloat64(56, 0.0, true);  // clearValue.b
	view.setFloat64(64, 1.0, true);  // clearValue.a
	return { buffer, ptr: ptr(buffer) };
}

function makeRenderPassDescriptor(colorAttachmentPtr: number) {
	const buffer = new ArrayBuffer(64);
	const view = new DataView(buffer);
	writePtr(view, 0, 0);
	writePtr(view, 8, 0);
	writeU64(view, 16, 0n);
	writeU64(view, 24, 1n);             // colorAttachmentCount
	writePtr(view, 32, colorAttachmentPtr);
	writePtr(view, 40, 0);              // depthStencilAttachment
	writePtr(view, 48, 0);              // occlusionQuerySet
	writePtr(view, 56, 0);              // timestampWrites
	return { buffer, ptr: ptr(buffer) };
}

function makeCommandBufferArray(cmdPtr: number) {
	const buffer = new BigUint64Array([BigInt(cmdPtr)]);
	return { buffer, ptr: ptr(buffer) };
}

// --- WGSL Shader ---

const FRAMEBUFFER_SHADER = `
@group(0) @binding(0) var framebufferTexture: texture_2d<f32>;
@group(0) @binding(1) var framebufferSampler: sampler;

struct VSOut {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> VSOut {
  var pos = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  var out: VSOut;
  out.position = vec4<f32>(pos[vertex_index], 0.0, 1.0);
  out.uv = pos[vertex_index] * vec2<f32>(0.5, -0.5) + vec2<f32>(0.5, 0.5);
  return out;
}

@fragment
fn fs_main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  return textureSample(framebufferTexture, framebufferSampler, uv);
}
`;

// --- GpuFramebuffer class ---

export class GpuFramebuffer {
	private win: GpuWindow;
	private device: number;
	private queue: number;
	private surface: number;
	private instance: number;
	private pipeline: number;
	private texture: number;
	private textureView: number;
	private sampler: number;
	private bindGroup: number;
	private fbWidth: number;
	private fbHeight: number;
	private surfaceWidth: number;
	private surfaceHeight: number;
	private onKey: KeyCallback | null = null;
	private onResize: ResizeCallback | null = null;
	private running = false;
	private loopTimer: ReturnType<typeof setInterval> | null = null;

	// KEEPALIVE array to prevent GC of buffers passed to native
	private KEEPALIVE: any[] = [];

	// Reusable descriptors
	private encoderDesc: { buffer: ArrayBuffer; ptr: number | bigint };

	constructor(
		title: string,
		fbWidth: number,
		fbHeight: number,
		windowWidth: number,
		windowHeight: number,
	) {
		this.fbWidth = fbWidth;
		this.fbHeight = fbHeight;
		this.surfaceWidth = windowWidth;
		this.surfaceHeight = windowHeight;

		// Create GpuWindow
		const display = Screen.getPrimaryDisplay();
		const workArea = display.workArea;
		const x = workArea.x + Math.floor((workArea.width - windowWidth) / 2);
		const y = workArea.y + Math.floor((workArea.height - windowHeight) / 2);

		this.win = new GpuWindow({
			title,
			frame: { width: windowWidth, height: windowHeight, x, y },
			titleBarStyle: "default",
			transparent: false,
		});

		// Get native handle and init WGPU
		const layerPtr = this.win.wgpuView.getNativeHandle();
		if (!WGPUNative.available || !layerPtr) {
			throw new Error("WGPU not available");
		}

		this.instance = WGPUNative.symbols.wgpuCreateInstance(0) as number;
		const metalLayerDesc = makeSurfaceSourceMetalLayer(layerPtr as number);
		const surfaceDesc = makeSurfaceDescriptor(metalLayerDesc.ptr as number);
		this.KEEPALIVE.push(metalLayerDesc.buffer, surfaceDesc.buffer);

		this.surface = WGPUBridge.instanceCreateSurface(
			this.instance,
			surfaceDesc.ptr as number,
		) as number;

		const adapterDevice = new BigUint64Array(2);
		WGPUBridge.createAdapterDeviceMainThread(
			this.instance,
			this.surface,
			ptr(adapterDevice),
		);
		const adapter = Number(adapterDevice[0]);
		this.device = Number(adapterDevice[1]);
		if (!adapter || !this.device) {
			throw new Error("Failed to get WGPU adapter/device");
		}

		this.queue = WGPUNative.symbols.wgpuDeviceGetQueue(this.device) as number;

		// Configure surface
		const surfaceConfig = makeSurfaceConfiguration(
			this.device,
			windowWidth,
			windowHeight,
			WGPUTextureFormat_BGRA8UnormSrgb,
		);
		this.KEEPALIVE.push(surfaceConfig.buffer);
		WGPUBridge.surfaceConfigure(this.surface, surfaceConfig.ptr as number);

		// Preallocate reusable descriptor
		this.encoderDesc = makeCommandEncoderDescriptor();
		this.KEEPALIVE.push(this.encoderDesc.buffer);

		// Init pipeline, texture, sampler, bind group
		this.pipeline = 0;
		this.texture = 0;
		this.textureView = 0;
		this.sampler = 0;
		this.bindGroup = 0;
		this.initPipeline();

		// Wire up keyboard events
		this.win.on("keyDown", (event: any) => {
			if (this.onKey) {
				this.onKey(event.data.keyCode, true);
			}
		});
		this.win.on("keyUp", (event: any) => {
			if (this.onKey) {
				this.onKey(event.data.keyCode, false);
			}
		});

		// Wire up resize events
		this.win.on("resize", (event: any) => {
			const { width, height } = event.data;
			if (width > 0 && height > 0 && (width !== this.surfaceWidth || height !== this.surfaceHeight)) {
				this.surfaceWidth = width;
				this.surfaceHeight = height;
				const newConfig = makeSurfaceConfiguration(
					this.device,
					width,
					height,
					WGPUTextureFormat_BGRA8UnormSrgb,
				);
				this.KEEPALIVE.push(newConfig.buffer);
				WGPUBridge.surfaceConfigure(this.surface, newConfig.ptr as number);
				if (this.onResize) {
					this.onResize(width, height);
				}
			}
		});
	}

	private initPipeline() {
		// Create shader module
		const shaderBytes = new TextEncoder().encode(FRAMEBUFFER_SHADER + "\0");
		const shaderBuf = new Uint8Array(shaderBytes);
		this.KEEPALIVE.push(shaderBuf);
		const shaderPtr = ptr(shaderBuf);
		const shaderSource = makeShaderSourceWGSL(shaderPtr as number);
		const shaderDesc = makeShaderModuleDescriptor(shaderSource.ptr as number);
		this.KEEPALIVE.push(shaderSource.buffer, shaderDesc.buffer);
		const shaderModule = WGPUNative.symbols.wgpuDeviceCreateShaderModule(
			this.device,
			shaderDesc.ptr as number,
		);

		// Entry points
		const vsEntry = new CString("vs_main");
		const fsEntry = new CString("fs_main");
		this.KEEPALIVE.push(vsEntry, fsEntry);

		// Vertex state with no vertex buffers (fullscreen triangle from vertex_index)
		const vertexState = makeVertexStateNoBuffers(shaderModule as number, vsEntry.ptr as number);
		this.KEEPALIVE.push(vertexState.buffer);

		// Fragment state
		const colorTarget = makeColorTargetState(WGPUTextureFormat_BGRA8UnormSrgb);
		const fragmentState = makeFragmentState(shaderModule as number, fsEntry.ptr as number, colorTarget.ptr as number);
		this.KEEPALIVE.push(colorTarget.buffer, fragmentState.buffer);

		// Primitive and multisample states
		const primitiveState = makePrimitiveState();
		const multisampleState = makeMultisampleState();

		// Pipeline descriptor (layout = 0 for auto-layout)
		const pipelineDesc = makeRenderPipelineDescriptor(
			vertexState,
			primitiveState,
			multisampleState,
			fragmentState,
		);
		this.KEEPALIVE.push(pipelineDesc.buffer);
		this.pipeline = WGPUNative.symbols.wgpuDeviceCreateRenderPipeline(
			this.device,
			pipelineDesc.ptr as number,
		) as number;
		if (!this.pipeline) {
			throw new Error("Failed to create render pipeline");
		}

		// Create framebuffer texture (RGBA8Unorm)
		const texDesc = makeTextureDescriptor(
			this.fbWidth,
			this.fbHeight,
			WGPUTextureFormat_RGBA8UnormSrgb,
			WGPUTextureUsage_TextureBinding | WGPUTextureUsage_CopyDst,
		);
		this.KEEPALIVE.push(texDesc.buffer);
		this.texture = WGPUNative.symbols.wgpuDeviceCreateTexture(
			this.device,
			texDesc.ptr as number,
		) as number;
		if (!this.texture) {
			throw new Error("Failed to create framebuffer texture");
		}

		// Create texture view (default view with null descriptor)
		this.textureView = WGPUNative.symbols.wgpuTextureCreateView(this.texture, 0) as number;
		if (!this.textureView) {
			throw new Error("Failed to create framebuffer texture view");
		}

		// Create sampler with nearest-neighbor filtering
		const samplerDesc = makeSamplerDescriptor();
		this.KEEPALIVE.push(samplerDesc.buffer);
		this.sampler = WGPUNative.symbols.wgpuDeviceCreateSampler(
			this.device,
			samplerDesc.ptr as number,
		) as number;
		if (!this.sampler) {
			throw new Error("Failed to create sampler");
		}

		// Get bind group layout from pipeline (auto-derived, group 0)
		const bindGroupLayout = WGPUNative.symbols.wgpuRenderPipelineGetBindGroupLayout(
			this.pipeline,
			0,
		) as number;

		// Create bind group entries: binding 0 = texture, binding 1 = sampler
		const textureEntry = makeBindGroupEntryTexture(0, this.textureView);
		const samplerEntry = makeBindGroupEntrySampler(1, this.sampler);
		const entriesBuf = new ArrayBuffer(56 * 2);
		new Uint8Array(entriesBuf, 0, 56).set(new Uint8Array(textureEntry.buffer));
		new Uint8Array(entriesBuf, 56, 56).set(new Uint8Array(samplerEntry.buffer));
		const entriesPtr = ptr(entriesBuf);
		this.KEEPALIVE.push(entriesBuf);

		// Create bind group
		const bindGroupDesc = makeBindGroupDescriptor(
			bindGroupLayout,
			entriesPtr as number,
			2,
		);
		this.KEEPALIVE.push(bindGroupDesc.buffer);
		this.bindGroup = WGPUNative.symbols.wgpuDeviceCreateBindGroup(
			this.device,
			bindGroupDesc.ptr as number,
		) as number;
		if (!this.bindGroup) {
			throw new Error("Failed to create bind group");
		}
	}

	setKeyCallback(cb: KeyCallback): void {
		this.onKey = cb;
	}

	setResizeCallback(cb: ResizeCallback): void {
		this.onResize = cb;
	}

	uploadFrame(pixels: Uint8Array): void {
		const expectedSize = this.fbWidth * this.fbHeight * 4;
		if (pixels.byteLength < expectedSize) {
			throw new Error(
				`Pixel buffer too small: got ${pixels.byteLength}, expected ${expectedSize}`,
			);
		}

		const copyTex = makeTexelCopyTextureInfo(this.texture);
		const bytesPerRow = this.fbWidth * 4;
		const layout = makeTexelCopyBufferLayout(bytesPerRow, this.fbHeight);
		const extent = makeExtent3D(this.fbWidth, this.fbHeight, 1);

		WGPUNative.symbols.wgpuQueueWriteTexture(
			this.queue,
			copyTex.ptr as number,
			ptr(pixels),
			pixels.byteLength,
			layout.ptr as number,
			extent.ptr as number,
		);
	}

	present(): void {
		WGPUNative.symbols.wgpuInstanceProcessEvents(this.instance);

		// Get surface texture
		const surfaceTexture = makeSurfaceTexture();
		WGPUBridge.surfaceGetCurrentTexture(this.surface, surfaceTexture.ptr as number);
		const status = surfaceTexture.view.getUint32(16, true);
		if (status !== 1 && status !== 2) return;
		const texPtr = Number(surfaceTexture.view.getBigUint64(8, true));
		if (!texPtr) return;

		const surfaceView = WGPUNative.symbols.wgpuTextureCreateView(texPtr, 0);
		if (!surfaceView) return;

		// Create render pass
		const colorAttachment = makeRenderPassColorAttachment(surfaceView as number);
		const renderPassDesc = makeRenderPassDescriptor(colorAttachment.ptr as number);
		const encoder = WGPUNative.symbols.wgpuDeviceCreateCommandEncoder(
			this.device,
			this.encoderDesc.ptr as number,
		);
		const pass = WGPUNative.symbols.wgpuCommandEncoderBeginRenderPass(
			encoder,
			renderPassDesc.ptr as number,
		);

		// Draw fullscreen triangle
		WGPUNative.symbols.wgpuRenderPassEncoderSetPipeline(pass, this.pipeline);
		WGPUNative.symbols.wgpuRenderPassEncoderSetBindGroup(pass, 0, this.bindGroup, 0, 0);
		WGPUNative.symbols.wgpuRenderPassEncoderDraw(pass, 3, 1, 0, 0);
		WGPUNative.symbols.wgpuRenderPassEncoderEnd(pass);

		// Submit and present
		const commandBuffer = WGPUNative.symbols.wgpuCommandEncoderFinish(encoder, 0);
		const commandArray = makeCommandBufferArray(commandBuffer as number);
		WGPUNative.symbols.wgpuQueueSubmit(this.queue, 1, commandArray.ptr as number);
		WGPUBridge.surfacePresent(this.surface);

		// Release per-frame resources
		WGPUNative.symbols.wgpuTextureViewRelease(surfaceView);
		WGPUNative.symbols.wgpuTextureRelease(texPtr);
		WGPUNative.symbols.wgpuCommandBufferRelease(commandBuffer);
		WGPUNative.symbols.wgpuCommandEncoderRelease(encoder);
	}

	startLoop(fps: number = 35): void {
		if (this.running) return;
		this.running = true;
		const interval = Math.floor(1000 / fps);
		this.loopTimer = setInterval(() => {
			if (this.running) {
				this.present();
			}
		}, interval);
	}

	stop(): void {
		this.running = false;
		if (this.loopTimer) {
			clearInterval(this.loopTimer);
			this.loopTimer = null;
		}
	}

	close(): void {
		this.stop();
		this.win.close();
	}
}
