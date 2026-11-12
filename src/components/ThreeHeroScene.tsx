import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { SpatialSection, SculptureForm, SpatialWorkItem } from '../types';
import { CAMERA_WAYPOINTS, SELECTED_WORKS } from '../data/portfolioData';
import { soundFx } from '../utils/audio';

interface ThreeHeroSceneProps {
  activeSection: SpatialSection;
  sculptureForm: SculptureForm;
  selectedWork: SpatialWorkItem | null;
  onSelectWork: (work: SpatialWorkItem) => void;
  onHoverPlaneChange: (hovering: boolean, hoveredWork?: SpatialWorkItem | null) => void;
}

// Module-scope reusable math helpers (zero GC in render loop)
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0, 0);
const _mouseVec2 = new THREE.Vector2();
const _dummyMat4 = new THREE.Matrix4();
const _tempVec3 = new THREE.Vector3();
const _tempScale = new THREE.Vector3();
const _tempQuat = new THREE.Quaternion();

// Custom GLSL Simplex 3D Noise & Morphing Iridescent Sculpture Shaders
const MORPH_VERTEX_SHADER = `
  uniform float uTime;
  uniform float uMorphStrength;
  uniform vec2 uMouse;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vDisplacement;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    float n1 = snoise(normal * 1.45 + vec3(uTime * 0.38, uTime * 0.28, uMouse.x * 0.9));
    float n2 = snoise(normal * 2.9 - vec3(uTime * 0.5, uMouse.y * 0.9, uTime * 0.24));
    float displacement = (n1 * 0.65 + n2 * 0.35) * uMorphStrength;

    vDisplacement = displacement;
    vec3 newPosition = position + normal * displacement;

    vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPosition.xyz;
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const MORPH_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying float vDisplacement;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(0.0, dot(viewDir, normalize(vNormal))), 2.3);

    vec3 obsidianCore = vec3(0.04, 0.06, 0.10);
    vec3 midTone = vec3(0.16, 0.32, 0.52);
    vec3 spectralRim = vec3(
      0.45 + 0.45 * sin(vDisplacement * 4.5 + uTime * 0.7),
      0.75 + 0.22 * cos(vDisplacement * 3.8 + uTime * 0.5 + 1.0),
      1.0
    );

    float ridge = smoothstep(-0.35, 0.45, vDisplacement);
    vec3 color = mix(obsidianCore, midTone, ridge * 0.75);
    color = mix(color, spectralRim, fresnel * 0.92);

    vec3 lightDir = normalize(vec3(0.6, 0.8, 0.5));
    float spec = pow(max(0.0, dot(reflect(-lightDir, normalize(vNormal)), viewDir)), 24.0);
    color += vec3(0.9, 0.96, 1.0) * spec * 0.55;

    gl_FragColor = vec4(color, uOpacity);
  }
`;

// Floating 3D Project Plane Shader
const PLANE_VERTEX_SHADER = `
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 pos = position;
    float wave = sin(uv.x * 5.0 + uTime * 3.0) * cos(uv.y * 4.0 + uTime * 2.2) * 0.06 * uHover;
    pos.z += wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const PLANE_FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform float uHover;
  uniform float uSelected;
  varying vec2 vUv;

  void main() {
    vec2 dir = vUv - 0.5;
    float shift = 0.008 * uHover;
    float r = texture2D(uTexture, vUv - dir * shift).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv + dir * shift).b;

    vec3 color = vec3(r, g, b);
    float border = step(0.985, max(abs(vUv.x - 0.5) * 2.0, abs(vUv.y - 0.5) * 2.0));
    vec3 borderCol = mix(vec3(0.25), vec3(0.95), max(uHover, uSelected));
    color = mix(color, borderCol, border * 0.65);

    gl_FragColor = vec4(color, 0.96);
  }
`;

const CHROMATIC_VIGNETTE_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    uAberration: { value: 0.0022 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uAberration;
    varying vec2 vUv;

    void main() {
      vec2 dir = vUv - 0.5;
      float dist = length(dir);
      vec2 offset = dir * dist * uAberration;

      float r = texture2D(tDiffuse, vUv - offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv + offset).b;

      float vignette = smoothstep(0.95, 0.28, dist);
      vec3 finalColor = vec3(r, g, b) * mix(0.65, 1.0, vignette);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

function createArtworkTexture(work: SpatialWorkItem, maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 640;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = '#070709';
    ctx.fillRect(0, 0, 1024, 640);

    const grad = ctx.createRadialGradient(680, 260, 40, 520, 320, 520);
    grad.addColorStop(0, work.palette.accent);
    grad.addColorStop(0.45, work.palette.secondary);
    grad.addColorStop(1, '#070709');
    ctx.globalAlpha = 0.42;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 640);

    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = work.palette.primary;
    ctx.lineWidth = 1.5;
    const rings = 14;
    const seedOffset = parseInt(work.index, 10) * 28;
    for (let i = 0; i < rings; i++) {
      ctx.beginPath();
      ctx.arc(
        660 + Math.sin(i * 0.5) * 40,
        310 + Math.cos(i * 0.4) * 30,
        40 + i * 24 + (seedOffset % 20),
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(64, 96);
    ctx.lineTo(960, 96);
    ctx.moveTo(64, 544);
    ctx.lineTo(960, 544);
    ctx.stroke();

    ctx.globalAlpha = 0.7;
    ctx.fillStyle = work.palette.primary;
    ctx.font = '500 22px "JetBrains Mono", monospace';
    ctx.fillText(`${work.index}  /  ${work.year}`, 64, 72);

    ctx.globalAlpha = 1.0;
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 58px "Outfit", sans-serif';
    ctx.fillText(work.title, 64, 445);

    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#d4d4d8';
    ctx.font = '400 25px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(work.subtitle, 64, 498);

    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '400 20px "JetBrains Mono", monospace';
    ctx.fillText(`${work.client} · ${work.discipline}`, 64, 588);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

export const ThreeHeroScene: React.FC<ThreeHeroSceneProps> = ({
  activeSection,
  sculptureForm,
  selectedWork,
  onSelectWork,
  onHoverPlaneChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef({
    activeSection,
    sculptureForm,
    selectedWorkId: selectedWork?.id || null,
    mouseX: 0,
    mouseY: 0,
    targetMouseX: 0,
    targetMouseY: 0,
    hoveredWorkId: null as string | null,
    onSelectWork,
    onHoverPlaneChange,
  });

  stateRef.current.activeSection = activeSection;
  stateRef.current.sculptureForm = sculptureForm;
  stateRef.current.selectedWorkId = selectedWork?.id || null;
  stateRef.current.onSelectWork = onSelectWork;
  stateRef.current.onHoverPlaneChange = onHoverPlaneChange;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    let isMobileViewport = width < 768;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.FogExp2(0x050505, 0.028);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 150);
    camera.position.set(0, 1.5, 20);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.replaceChildren(renderer.domElement);
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x050505, 0.95);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(10, 16, 12);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    rimLight.position.set(-12, -8, -10);
    scene.add(rimLight);

    // =========================================================================
    // MAIN SCULPTURAL STAGE GROUP (Follows active camera lookAt so it's always visible!)
    // =========================================================================
    const centerpieceGroup = new THREE.Group();
    scene.add(centerpieceGroup);

    // --- FORM A: LIQUID CORE (Morphing Iridescent Simplex-Noise Metaball) ---
    const liquidGroup = new THREE.Group();
    centerpieceGroup.add(liquidGroup);

    const morphGeo = new THREE.IcosahedronGeometry(2.2, isSoftwareGl ? 24 : 44);
    const morphMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorphStrength: { value: 0.48 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uOpacity: { value: 1.0 },
      },
      vertexShader: MORPH_VERTEX_SHADER,
      fragmentShader: MORPH_FRAGMENT_SHADER,
      transparent: true,
    });
    const morphMesh = new THREE.Mesh(morphGeo, morphMat);
    liquidGroup.add(morphMesh);

    const ring1Geo = new THREE.TorusGeometry(3.75, 0.038, 24, 140);
    const ring1Mat = new THREE.MeshPhysicalMaterial({
      color: 0xbae6fd,
      metalness: 0.95,
      roughness: 0.14,
      anisotropy: 0.8,
      clearcoat: 0.7,
    });
    const ring1Mesh = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1Mesh.rotation.x = Math.PI * 0.35;
    liquidGroup.add(ring1Mesh);

    // --- FORM B: GEODESIC MESH (Glowing Architectural TorusKnot & Wireframe Cage) ---
    const geodesicGroup = new THREE.Group();
    centerpieceGroup.add(geodesicGroup);

    const knotGeo = new THREE.TorusKnotGeometry(1.85, 0.48, isSoftwareGl ? 80 : 140, 20, 2, 3);
    const knotWireMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.75,
      wireframe: true,
      roughness: 0.2,
      metalness: 0.9,
      transparent: true,
      opacity: 0.9,
    });
    const knotMesh = new THREE.Mesh(knotGeo, knotWireMat);
    geodesicGroup.add(knotMesh);

    const outerCageGeo = new THREE.IcosahedronGeometry(3.8, 2);
    const outerCageMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.32,
    });
    const outerCageMesh = new THREE.Mesh(outerCageGeo, outerCageMat);
    geodesicGroup.add(outerCageMesh);

    // --- FORM C: CONSTELLATION WAVE (Undulating 3D Harmonic Particle Ribbon) ---
    const waveGroup = new THREE.Group();
    centerpieceGroup.add(waveGroup);

    const waveCols = 42;
    const waveRows = 28;
    const waveCount = waveCols * waveRows;
    const wavePos = new Float32Array(waveCount * 3);
    const waveBase = new Float32Array(waveCount * 2);
    const waveCol = new Float32Array(waveCount * 3);

    const colEmerald = new THREE.Color(0x34d399);
    const colCyan = new THREE.Color(0x38bdf8);
    const colPurple = new THREE.Color(0xc084fc);
    const tmpCol = new THREE.Color();

    let wIdx = 0;
    for (let ix = 0; ix < waveCols; ix++) {
      for (let iz = 0; iz < waveRows; iz++) {
        const x = (ix - waveCols / 2) * 0.42;
        const z = (iz - waveRows / 2) * 0.42;
        waveBase[wIdx * 2] = x;
        waveBase[wIdx * 2 + 1] = z;

        wavePos[wIdx * 3] = x;
        wavePos[wIdx * 3 + 1] = 0;
        wavePos[wIdx * 3 + 2] = z;

        const t = ix / waveCols;
        if (t < 0.5) {
          tmpCol.lerpColors(colEmerald, colCyan, t * 2);
        } else {
          tmpCol.lerpColors(colCyan, colPurple, (t - 0.5) * 2);
        }
        waveCol[wIdx * 3] = tmpCol.r;
        waveCol[wIdx * 3 + 1] = tmpCol.g;
        waveCol[wIdx * 3 + 2] = tmpCol.b;
        wIdx++;
      }
    }

    const waveGeo = new THREE.BufferGeometry();
    const wavePosAttr = new THREE.BufferAttribute(wavePos, 3);
    wavePosAttr.setUsage(THREE.DynamicDrawUsage);
    waveGeo.setAttribute('position', wavePosAttr);
    waveGeo.setAttribute('color', new THREE.BufferAttribute(waveCol, 3));

    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = 64;
    dotCanvas.height = 64;
    const dCtx = dotCanvas.getContext('2d');
    if (dCtx) {
      const grad = dCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.4, 'rgba(56,189,248,0.85)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      dCtx.fillStyle = grad;
      dCtx.fillRect(0, 0, 64, 64);
    }
    const dotTex = new THREE.CanvasTexture(dotCanvas);
    dotTex.colorSpace = THREE.SRGBColorSpace;

    const waveMat = new THREE.PointsMaterial({
      size: 0.24,
      map: dotTex,
      transparent: true,
      opacity: 0.92,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const wavePoints = new THREE.Points(waveGeo, waveMat);
    waveGroup.add(wavePoints);

    // Orbiting Liquid-Metal Satellites (Shared accent across all modes)
    const satCount = 36;
    const satGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const satMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.12,
    });
    const satInstanced = new THREE.InstancedMesh(satGeo, satMat, satCount);
    satInstanced.frustumCulled = false;
    centerpieceGroup.add(satInstanced);

    const satData = Array.from({ length: satCount }, (_, i) => ({
      radius: 3.1 + Math.random() * 3.8,
      angle: (i / satCount) * Math.PI * 2,
      speed: 0.14 + Math.random() * 0.2,
      yOffset: (Math.random() - 0.5) * 3.6,
      scale: 0.75 + Math.random() * 0.6,
    }));

    // =========================================================================
    // AMBIENT STARFIELD CONSTELLATION
    // =========================================================================
    const particleCount = isSoftwareGl ? 600 : 1400;
    const pPositions = new Float32Array(particleCount * 3);
    const pColors = new Float32Array(particleCount * 3);

    const cWhite = new THREE.Color(0xf8fafc);
    const cIce = new THREE.Color(0x7dd3fc);
    const cViolet = new THREE.Color(0xa5b4fc);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 4.5 + Math.pow(Math.random(), 0.7) * 18.0;

      pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);

      const pick = i % 3 === 0 ? cWhite : i % 3 === 1 ? cIce : cViolet;
      pColors[i * 3] = pick.r;
      pColors[i * 3 + 1] = pick.g;
      pColors[i * 3 + 2] = pick.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.15,
      map: dotTex,
      transparent: true,
      opacity: 0.55,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const constellationPoints = new THREE.Points(particleGeo, particleMat);
    scene.add(constellationPoints);

    // =========================================================================
    // FLOATING 3D PROJECT PLANES IN THE "WORK" SPATIAL ZONE
    // =========================================================================
    const galleryGroup = new THREE.Group();
    scene.add(galleryGroup);

    const planeGeo = new THREE.PlaneGeometry(2.35, 1.48, 24, 24);
    const frameGeo = new THREE.PlaneGeometry(2.41, 1.54);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      metalness: 0.85,
      roughness: 0.25,
    });

    interface PlaneEntry {
      group: THREE.Group;
      mesh: THREE.Mesh;
      mat: THREE.ShaderMaterial;
      tex: THREE.CanvasTexture;
      work: SpatialWorkItem;
      basePos: THREE.Vector3;
      baseRot: THREE.Euler;
      hoverProgress: number;
    }

    const projectPlanes: PlaneEntry[] = [];
    const raycastMeshes: THREE.Mesh[] = [];

    SELECTED_WORKS.forEach((work) => {
      const itemGroup = new THREE.Group();
      itemGroup.position.set(...work.position3D);
      itemGroup.rotation.set(...work.rotation3D);

      const tex = createArtworkTexture(work, maxAnisotropy);
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: tex },
          uHover: { value: 0 },
          uSelected: { value: 0 },
          uTime: { value: 0 },
        },
        vertexShader: PLANE_VERTEX_SHADER,
        fragmentShader: PLANE_FRAGMENT_SHADER,
        transparent: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(planeGeo, mat);
      mesh.userData = { workId: work.id, work };
      itemGroup.add(mesh);

      const backFrame = new THREE.Mesh(frameGeo, frameMat);
      backFrame.position.z = -0.025;
      itemGroup.add(backFrame);

      galleryGroup.add(itemGroup);
      raycastMeshes.push(mesh);

      projectPlanes.push({
        group: itemGroup,
        mesh,
        mat,
        tex,
        work,
        basePos: new THREE.Vector3(...work.position3D),
        baseRot: new THREE.Euler(...work.rotation3D),
        hoverProgress: 0,
      });
    });

    // =========================================================================
    // POST-PROCESSING
    // =========================================================================
    let composer: EffectComposer | null = null;
    let chromaticPass: ShaderPass | null = null;
    let bloomPass: UnrealBloomPass | null = null;

    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width / 2, height / 2),
        0.42,
        0.55,
        0.75
      );
      composer.addPass(bloomPass);

      chromaticPass = new ShaderPass(CHROMATIC_VIGNETTE_SHADER);
      composer.addPass(chromaticPass);

      renderer.compile(scene, camera);
    }

    // =========================================================================
    // POINTER & RAYCASTING INTERACTION
    // =========================================================================
    const raycaster = new THREE.Raycaster();

    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      stateRef.current.targetMouseX = nx;
      stateRef.current.targetMouseY = ny;
      _mouseVec2.set(nx, ny);
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('button, a, input, textarea, [data-ui-overlay="true"]')) {
        return;
      }

      raycaster.setFromCamera(_mouseVec2, camera);
      const hits = raycaster.intersectObjects(raycastMeshes, false);
      if (hits.length > 0) {
        const hitWork = hits[0].object.userData.work as SpatialWorkItem;
        if (hitWork) {
          soundFx.playChirp(820, 0.07);
          stateRef.current.onSelectWork(hitWork);
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const nx = (touch.clientX / window.innerWidth) * 2 - 1;
        const ny = -(touch.clientY / window.innerHeight) * 2 + 1;
        stateRef.current.targetMouseX = nx;
        stateRef.current.targetMouseY = ny;
        _mouseVec2.set(nx, ny);
      }
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('click', handleClick);

    // =========================================================================
    // ANIMATION LOOP
    // =========================================================================
    let frameId = 0;
    const clock = new THREE.Clock();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      stateRef.current.mouseX = THREE.MathUtils.damp(
        stateRef.current.mouseX,
        stateRef.current.targetMouseX,
        4.5,
        delta
      );
      stateRef.current.mouseY = THREE.MathUtils.damp(
        stateRef.current.mouseY,
        stateRef.current.targetMouseY,
        4.5,
        delta
      );

      const mx = stateRef.current.mouseX;
      const my = stateRef.current.mouseY;

      // 1. Camera Waypoint Choreography (with mobile distance & framing adjustment)
      const wp = CAMERA_WAYPOINTS[stateRef.current.activeSection];
      const mobileZOffset = isMobileViewport ? 3.2 : 0;
      const parallaxFactor = isMobileViewport ? 0.45 : 1.0;

      _targetCamPos.set(
        (isMobileViewport ? wp.lookAt[0] : wp.position[0]) + mx * 0.95 * parallaxFactor,
        wp.position[1] + my * 0.65 * parallaxFactor,
        wp.position[2] + mobileZOffset
      );
      _targetLookAt.set(
        wp.lookAt[0] + mx * 0.35 * parallaxFactor,
        wp.lookAt[1] + my * 0.25 * parallaxFactor,
        wp.lookAt[2]
      );

      camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCamPos.x, 3.2, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCamPos.y, 3.2, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCamPos.z, 3.2, delta);

      _currentLookAt.x = THREE.MathUtils.damp(_currentLookAt.x, _targetLookAt.x, 4.0, delta);
      _currentLookAt.y = THREE.MathUtils.damp(_currentLookAt.y, _targetLookAt.y, 4.0, delta);
      _currentLookAt.z = THREE.MathUtils.damp(_currentLookAt.z, _targetLookAt.z, 4.0, delta);
      camera.lookAt(_currentLookAt);

      // Keep centerpiece sculpture visible in the camera's focal area across sections
      const targetCenterX = isMobileViewport
        ? wp.lookAt[0]
        : stateRef.current.activeSection === 'overview'
        ? 2.2
        : stateRef.current.activeSection === 'philosophy'
        ? -0.5
        : wp.lookAt[0];
      const targetCenterY = isMobileViewport
        ? stateRef.current.activeSection === 'overview'
          ? wp.lookAt[1] + 1.55
          : wp.lookAt[1] + 0.75
        : wp.lookAt[1];

      centerpieceGroup.position.x = THREE.MathUtils.damp(
        centerpieceGroup.position.x,
        targetCenterX,
        3.0,
        delta
      );
      centerpieceGroup.position.y = THREE.MathUtils.damp(
        centerpieceGroup.position.y,
        targetCenterY,
        3.0,
        delta
      );

      // Scale down the entire 3D sculpture centerpiece on mobile so it fits comfortably
      const targetCenterpieceScale = isMobileViewport ? 0.48 : 1.0;
      centerpieceGroup.scale.setScalar(
        THREE.MathUtils.damp(centerpieceGroup.scale.x, targetCenterpieceScale, 5.0, delta)
      );

      // 2. Distinct Visual Mode Switching (Liquid Core vs Geodesic Mesh vs Constellation Wave)
      const form = stateRef.current.sculptureForm;
      liquidGroup.visible = form === 'metaball';
      geodesicGroup.visible = form === 'wireframe';
      waveGroup.visible = form === 'constellation';

      // Smoothly scale active group for a dramatic morph transition
      const targetLiquidScale = form === 'metaball' ? 1.0 : 0.01;
      const targetGeoScale = form === 'wireframe' ? 1.0 : 0.01;
      const targetWaveScale = form === 'constellation' ? 1.0 : 0.01;

      liquidGroup.scale.setScalar(
        THREE.MathUtils.damp(liquidGroup.scale.x, targetLiquidScale, 6.0, delta)
      );
      geodesicGroup.scale.setScalar(
        THREE.MathUtils.damp(geodesicGroup.scale.x, targetGeoScale, 6.0, delta)
      );
      waveGroup.scale.setScalar(
        THREE.MathUtils.damp(waveGroup.scale.x, targetWaveScale, 6.0, delta)
      );

      // Animate Form A: Liquid Core
      if (liquidGroup.visible) {
        morphMat.uniforms.uTime.value = elapsed;
        morphMat.uniforms.uMouse.value.set(mx, my);
        morphMesh.rotation.y = elapsed * 0.18 + mx * 0.45;
        morphMesh.rotation.x = elapsed * 0.12 - my * 0.35;
        ring1Mesh.rotation.z = elapsed * 0.25 + mx * 0.35;
        ring1Mesh.rotation.y = Math.sin(elapsed * 0.35) * 0.4;
      }

      // Animate Form B: Geodesic TorusKnot Mesh
      if (geodesicGroup.visible) {
        knotMesh.rotation.x = elapsed * 0.32 + my * 0.5;
        knotMesh.rotation.y = elapsed * 0.45 + mx * 0.5;
        outerCageMesh.rotation.y = -elapsed * 0.15;
        outerCageMesh.rotation.z = elapsed * 0.12;
      }

      // Animate Form C: Constellation Wave
      if (waveGroup.visible) {
        const wArr = wavePosAttr.array as Float32Array;
        for (let i = 0; i < waveCount; i++) {
          const bx = waveBase[i * 2];
          const bz = waveBase[i * 2 + 1];
          const dist = Math.sqrt((bx - mx * 5) ** 2 + (bz + my * 5) ** 2);
          const ripple = Math.sin(dist * 1.4 - elapsed * 3.2) * Math.max(0, 1 - dist / 7) * 0.9;
          wArr[i * 3 + 1] =
            Math.sin(bx * 0.65 + elapsed * 1.4) * 0.75 +
            Math.cos(bz * 0.65 + elapsed * 1.1) * 0.65 +
            ripple;
        }
        wavePosAttr.needsUpdate = true;
        waveGroup.rotation.y = elapsed * 0.12 + mx * 0.25;
        waveGroup.rotation.x = 0.35 + my * 0.15;
      }

      // Update Orbiting Satellites
      for (let i = 0; i < satCount; i++) {
        const s = satData[i];
        const angle = s.angle + elapsed * s.speed;
        _tempVec3.set(
          Math.cos(angle) * s.radius,
          s.yOffset + Math.sin(elapsed * 0.8 + i) * 0.3,
          Math.sin(angle) * s.radius
        );
        _tempScale.setScalar(s.scale);
        _dummyMat4.compose(_tempVec3, _tempQuat, _tempScale);
        satInstanced.setMatrixAt(i, _dummyMat4);
      }
      satInstanced.instanceMatrix.needsUpdate = true;

      constellationPoints.rotation.y = elapsed * 0.03 + mx * 0.08;

      // 3. Raycast & Animate Floating 3D Project Planes
      raycaster.setFromCamera(_mouseVec2, camera);
      const intersects = raycaster.intersectObjects(raycastMeshes, false);
      const hitId = intersects.length > 0 ? (intersects[0].object.userData.workId as string) : null;

      if (hitId !== stateRef.current.hoveredWorkId) {
        stateRef.current.hoveredWorkId = hitId;
        const found = projectPlanes.find((p) => p.work.id === hitId)?.work || null;
        stateRef.current.onHoverPlaneChange(Boolean(hitId), found);
        if (hitId) {
          soundFx.playChirp(920, 0.03);
        }
      }

      projectPlanes.forEach((entry, idx) => {
        const isHovered = entry.work.id === hitId;
        const isSelected = entry.work.id === stateRef.current.selectedWorkId;

        entry.hoverProgress = THREE.MathUtils.damp(
          entry.hoverProgress,
          isHovered ? 1.0 : 0.0,
          6.0,
          delta
        );

        entry.mat.uniforms.uHover.value = entry.hoverProgress;
        entry.mat.uniforms.uSelected.value = THREE.MathUtils.damp(
          entry.mat.uniforms.uSelected.value,
          isSelected ? 1.0 : 0.0,
          5.0,
          delta
        );
        entry.mat.uniforms.uTime.value = elapsed;

        const floatY = Math.sin(elapsed * 0.9 + idx * 1.4) * 0.08;
        const targetZ = entry.basePos.z + entry.hoverProgress * 0.45 + (isSelected ? 0.25 : 0);
        entry.group.position.y = entry.basePos.y + floatY;
        entry.group.position.z = THREE.MathUtils.damp(entry.group.position.z, targetZ, 6.0, delta);

        const basePlaneScale = isMobileViewport ? 0.62 : 1.0;
        const targetScale = basePlaneScale * (1.0 + entry.hoverProgress * 0.09);
        entry.group.scale.setScalar(
          THREE.MathUtils.damp(entry.group.scale.x, targetScale, 6.0, delta)
        );

        const targetRotX = entry.baseRot.x + (isHovered ? -my * 0.14 : 0);
        const targetRotY = entry.baseRot.y + (isHovered ? mx * 0.16 : 0);
        entry.group.rotation.x = THREE.MathUtils.damp(entry.group.rotation.x, targetRotX, 5.0, delta);
        entry.group.rotation.y = THREE.MathUtils.damp(entry.group.rotation.y, targetRotY, 5.0, delta);
      });

      if (chromaticPass) {
        const pointerSpeed =
          Math.abs(stateRef.current.targetMouseX - mx) +
          Math.abs(stateRef.current.targetMouseY - my);
        chromaticPass.uniforms.uAberration.value = THREE.MathUtils.damp(
          chromaticPass.uniforms.uAberration.value,
          0.0018 + pointerSpeed * 0.006,
          5.0,
          delta
        );
      }

      if (isSoftwareGl || !composer) {
        renderer.render(scene, camera);
      } else {
        composer.render();
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    if (isSoftwareGl) {
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      isMobileViewport = w < 768;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) {
        composer.setSize(w, h);
      }
      if (bloomPass) {
        bloomPass.resolution.set(w / 2, h / 2);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      if (isSoftwareGl) {
        clearTimeout(frameId);
      } else {
        cancelAnimationFrame(frameId);
      }
      renderer.dispose();
      morphGeo.dispose();
      ring1Geo.dispose();
      knotGeo.dispose();
      outerCageGeo.dispose();
      waveGeo.dispose();
      satGeo.dispose();
      particleGeo.dispose();
      dotTex.dispose();
      planeGeo.dispose();
      frameGeo.dispose();
      projectPlanes.forEach((p) => {
        p.tex.dispose();
        p.mat.dispose();
      });
      container.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-auto"
    />
  );
};
