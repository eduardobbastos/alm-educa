document.addEventListener('DOMContentLoaded', () => {
  initLeadForm();
  initPortScrollytelling();
});

function initLeadForm() {
  const form = document.getElementById('leadForm');
  const whatsappInput = document.getElementById('whatsapp');

  if (whatsappInput) {
    whatsappInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '').slice(0, 11);
      if (value.length > 2) value = '(' + value.slice(0, 2) + ') ' + value.slice(2);
      if (value.length > 9) value = value.slice(0, 9) + '-' + value.slice(9, 13);
      e.target.value = value;
    });
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      const nome = form.nome.value.trim();
      const email = form.email.value.trim();
      if (!nome || !email) {
        e.preventDefault();
        alert('Por favor, preencha nome e e-mail antes de continuar.');
        return;
      }

      const params = new URLSearchParams();
      params.set('nome', nome);
      params.set('email', email);
      if (form.whatsapp.value) params.set('whatsapp', form.whatsapp.value.replace(/\D/g, ''));
      if (form.empresa.value) params.set('empresa', form.empresa.value.trim());

      const url = new URL(form.action);
      url.search = '';
      for (const [k, v] of params) { url.searchParams.set(k, v); }
      form.action = url.toString();
    });
  }
}

/* ============================================================
   SCROLLYTELLING 3D — PASSAGEM PELO PORTO UNIFICADA
   Three.js + GSAP ScrollTrigger
   Cada etapa da viagem pelo porto revela uma etapa do site
   ============================================================ */
function initPortScrollytelling() {
  const canvas = document.getElementById('portCanvas');
  const loader = document.getElementById('canvasLoader');
  if (!canvas) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches || ('ontouchstart' in window);

  // ---------- 1. CENA & RENDERER ----------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07111e);
  scene.fog = new THREE.FogExp2(0x09182b, 0.007);

  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.2, 380);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isMobile,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.4 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  if (!isMobile) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  // ---------- 2. ILUMINAÇÃO CINEMATOGRÁFICA DO PORTO ----------
  const ambientLight = new THREE.AmbientLight(0xcfd8dc, 0.65);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffedd5, 1.45);
  sunLight.position.set(-60, 75, -90);
  if (!isMobile) {
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 300;
    sunLight.shadow.camera.left = -95;
    sunLight.shadow.camera.right = 95;
    sunLight.shadow.camera.top = 95;
    sunLight.shadow.camera.bottom = -95;
    sunLight.shadow.bias = -0.0004;
  }
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.5);
  fillLight.position.set(50, 30, 60);
  scene.add(fillLight);

  // ---------- 3. TEXTURAS & MATERIAIS PROCEDURAIS ----------
  function createHazardTexture() {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 32;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 128, 32);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    for (let i = -32; i < 160; i += 32) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 16, 0);
      ctx.lineTo(i + 32, 32);
      ctx.lineTo(i + 16, 32);
    }
    ctx.fill();
    const texture = new THREE.CanvasTexture(c);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(24, 1);
    return texture;
  }

  const hazardTexture = createHazardTexture();

  const materials = {
    water: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.12,
      metalness: 0.25,
      transparent: true,
      opacity: 0.92
    }),
    concrete: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.85 }),
    curbHazard: new THREE.MeshStandardMaterial({ map: hazardTexture, roughness: 0.7 }),
    rubberFender: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 }),
    bollard: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35, metalness: 0.6 }),
    craneOrange: new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.45, metalness: 0.2 }),
    craneYellow: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.45, metalness: 0.2 }),
    craneDark: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.35 }),
    craneCable: new THREE.MeshBasicMaterial({ color: 0x94a3b8 }),
    shipHullRed: new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.5 }),
    shipHullBlack: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.45 }),
    shipDeck: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }),
    shipCabin: new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 }),
    glass: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.85 }),
    lighthouseWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }),
    lighthouseRed: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 }),
    buoyGreen: new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3, emissive: 0x059669, emissiveIntensity: 0.2 }),
    buoyRed: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, emissive: 0xdc2626, emissiveIntensity: 0.2 }),
    containerRed: new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 }),
    containerBlue: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.5 }),
    containerGreen: new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.5 }),
    containerOrange: new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.5 }),
    containerYellow: new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.5 }),
    beaconLight: new THREE.MeshBasicMaterial({ color: 0xfef08a })
  };

  const containerMats = [
    materials.containerRed,
    materials.containerBlue,
    materials.containerGreen,
    materials.containerOrange,
    materials.containerYellow
  ];

  // ---------- 4. ÁGUA COM MALHA ONDULANTE ----------
  const waterGeo = new THREE.PlaneGeometry(170, 500, isMobile ? 60 : 100, isMobile ? 100 : 180);
  const water = new THREE.Mesh(waterGeo, materials.water);
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, -0.1, 0);
  water.receiveShadow = !isMobile;
  scene.add(water);

  const waterPos = waterGeo.attributes.position;
  const waterBaseZ = new Float32Array(waterPos.count);
  for (let i = 0; i < waterPos.count; i++) {
    waterBaseZ[i] = waterPos.getZ(i);
  }

  // ---------- 5. CAIS & DOCAS DOS DOIS LADOS ----------
  const dockGroup = new THREE.Group();

  // Cais Esquerdo
  const leftDockGeo = new THREE.BoxGeometry(45, 2.4, 440);
  const leftDock = new THREE.Mesh(leftDockGeo, materials.concrete);
  leftDock.position.set(-36.5, 0.9, 0);
  leftDock.receiveShadow = !isMobile;
  dockGroup.add(leftDock);

  const leftCurbGeo = new THREE.BoxGeometry(0.8, 0.4, 440);
  const leftCurb = new THREE.Mesh(leftCurbGeo, materials.curbHazard);
  leftCurb.position.set(-13.6, 2.2, 0);
  dockGroup.add(leftCurb);

  // Cais Direito
  const rightDockGeo = new THREE.BoxGeometry(45, 2.4, 440);
  const rightDock = new THREE.Mesh(rightDockGeo, materials.concrete);
  rightDock.position.set(36.5, 0.9, 0);
  rightDock.receiveShadow = !isMobile;
  dockGroup.add(rightDock);

  const rightCurbGeo = new THREE.BoxGeometry(0.8, 0.4, 440);
  const rightCurb = new THREE.Mesh(rightCurbGeo, materials.curbHazard);
  rightCurb.position.set(13.6, 2.2, 0);
  dockGroup.add(rightCurb);

  // Defensas e cabeços de amarração
  const fenderGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.2, 10);
  const bollardGeo = new THREE.CylinderGeometry(0.28, 0.35, 0.8, 12);
  const bollardCapGeo = new THREE.SphereGeometry(0.38, 10, 8);

  for (let z = -180; z <= 180; z += 18) {
    const fLeft = new THREE.Mesh(fenderGeo, materials.rubberFender);
    fLeft.rotation.z = Math.PI / 2;
    fLeft.position.set(-13.8, 0.9, z);
    dockGroup.add(fLeft);

    const bLeft = new THREE.Mesh(bollardGeo, materials.bollard);
    bLeft.position.set(-14.4, 2.4, z);
    const bLeftCap = new THREE.Mesh(bollardCapGeo, materials.bollard);
    bLeftCap.position.set(-14.4, 2.8, z);
    dockGroup.add(bLeft);
    dockGroup.add(bLeftCap);

    const fRight = new THREE.Mesh(fenderGeo, materials.rubberFender);
    fRight.rotation.z = Math.PI / 2;
    fRight.position.set(13.8, 0.9, z);
    dockGroup.add(fRight);

    const bRight = new THREE.Mesh(bollardGeo, materials.bollard);
    bRight.position.set(14.4, 2.4, z);
    const bRightCap = new THREE.Mesh(bollardCapGeo, materials.bollard);
    bRightCap.position.set(14.4, 2.8, z);
    dockGroup.add(bRight);
    dockGroup.add(bRightCap);
  }

  scene.add(dockGroup);

  // ---------- 6. PÁTIOS DE CONTÊINERES PROCEDURAIS ----------
  function createContainerBlock(startX, startZ, rows, cols, maxStack, isRightSide = false) {
    const cWidth = 2.4;
    const cHeight = 2.5;
    const cLength = 6.0;
    const block = new THREE.Group();

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const stackHeight = Math.floor(Math.random() * maxStack) + 1;
        for (let h = 0; h < stackHeight; h++) {
          const mat = containerMats[Math.floor(Math.random() * containerMats.length)];
          const box = new THREE.Mesh(new THREE.BoxGeometry(cWidth, cHeight, cLength), mat);

          const posX = startX + (isRightSide ? c * (cWidth + 0.3) : -c * (cWidth + 0.3));
          const posY = 2.1 + h * cHeight + cHeight / 2;
          const posZ = startZ + r * (cLength + 0.4);

          box.position.set(posX, posY, posZ);
          if (!isMobile) {
            box.castShadow = true;
            box.receiveShadow = true;
          }
          block.add(box);
        }
      }
    }
    return block;
  }

  scene.add(createContainerBlock(-24, -150, 6, 4, 3));
  scene.add(createContainerBlock(-24, -80, 5, 4, 4));
  scene.add(createContainerBlock(-24, 10, 7, 4, 3));
  scene.add(createContainerBlock(-24, 90, 6, 4, 4));

  scene.add(createContainerBlock(20, -140, 5, 5, 4, true));
  scene.add(createContainerBlock(20, -60, 6, 5, 3, true));
  scene.add(createContainerBlock(20, 20, 6, 5, 4, true));
  scene.add(createContainerBlock(20, 100, 5, 5, 3, true));

  // Armazéns e Silos
  function createWarehouse(x, z, width, length) {
    const wh = new THREE.Group();
    const walls = new THREE.Mesh(new THREE.BoxGeometry(width, 7.5, length), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 }));
    walls.position.set(x, 2.1 + 3.75, z);
    wh.add(walls);

    const roof = new THREE.Mesh(new THREE.CylinderGeometry(width / 2 + 0.5, width / 2 + 0.5, length, 12, 1, false, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.5 }));
    roof.rotation.x = Math.PI / 2;
    roof.rotation.z = Math.PI;
    roof.position.set(x, 2.1 + 7.5, z);
    wh.add(roof);
    return wh;
  }

  scene.add(createWarehouse(45, -100, 16, 40));
  scene.add(createWarehouse(45, 60, 16, 45));

  function createSilo(x, z) {
    const silo = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 14, 16), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 }));
    body.position.set(x, 2.1 + 7, z);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x94a3b8 }));
    dome.position.set(x, 2.1 + 14, z);
    silo.add(body);
    silo.add(dome);
    return silo;
  }
  scene.add(createSilo(42, -10));
  scene.add(createSilo(51, -10));
  scene.add(createSilo(42, 12));
  scene.add(createSilo(51, 12));

  // ---------- 7. GUINDASTES PORTUÁRIOS MONUMENTAIS STS ----------
  const cranes = [];

  function createSTSCrane(x, z, hasSuspendedContainer = false) {
    const crane = new THREE.Group();
    crane.position.set(x, 2.1, z);

    const legGeo = new THREE.BoxGeometry(1.1, 26, 1.1);
    const legPositions = [
      [-4.5, 13, -5.5],
      [4.5, 13, -5.5],
      [-4.5, 13, 5.5],
      [4.5, 13, 5.5]
    ];

    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, materials.craneOrange);
      leg.position.set(lx, ly, lz);
      leg.castShadow = !isMobile;
      crane.add(leg);
    });

    const crossBeamGeo = new THREE.BoxGeometry(10.5, 1.2, 1.2);
    const cb1 = new THREE.Mesh(crossBeamGeo, materials.craneDark);
    cb1.position.set(0, 16, -5.5);
    crane.add(cb1);
    const cb2 = new THREE.Mesh(crossBeamGeo, materials.craneDark);
    cb2.position.set(0, 16, 5.5);
    crane.add(cb2);

    const topHousing = new THREE.Mesh(new THREE.BoxGeometry(11, 4.5, 12), materials.craneOrange);
    topHousing.position.set(0, 26, 0);
    topHousing.castShadow = !isMobile;
    crane.add(topHousing);

    // Lança horizontal de 36m projetando-se sobre o canal
    const boom = new THREE.Mesh(new THREE.BoxGeometry(36, 1.6, 2.2), materials.craneYellow);
    boom.position.set(13, 27.5, 0);
    boom.castShadow = !isMobile;
    crane.add(boom);

    const tie = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 22, 6), materials.craneCable);
    tie.position.set(15, 33, 0);
    tie.rotation.z = Math.PI / 4.2;
    crane.add(tie);

    const aFrameGeo = new THREE.CylinderGeometry(0.4, 0.4, 12, 8);
    const af1 = new THREE.Mesh(aFrameGeo, materials.craneDark);
    af1.position.set(-1, 33, 3);
    af1.rotation.z = -0.2;
    const af2 = new THREE.Mesh(aFrameGeo, materials.craneDark);
    af2.position.set(-1, 33, -3);
    af2.rotation.z = -0.2;
    crane.add(af1);
    crane.add(af2);

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 8), new THREE.MeshBasicMaterial({ color: 0xef4444 }));
    beacon.position.set(0, 39, 0);
    crane.add(beacon);

    const spreaderGroup = new THREE.Group();
    const spreaderX = hasSuspendedContainer ? 14 : 9;
    spreaderGroup.position.set(spreaderX, 17, 0);

    const spreaderFrame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 6.2), materials.craneDark);
    spreaderGroup.add(spreaderFrame);

    const cableVertGeo = new THREE.CylinderGeometry(0.04, 0.04, 10, 4);
    [-1, 1].forEach(cx => {
      [-2.6, 2.6].forEach(cz => {
        const cVert = new THREE.Mesh(cableVertGeo, materials.craneCable);
        cVert.position.set(cx, 5, cz);
        spreaderGroup.add(cVert);
      });
    });

    if (hasSuspendedContainer) {
      const suspendedBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 6.0), materials.containerRed);
      suspendedBox.position.set(0, -1.5, 0);
      suspendedBox.castShadow = !isMobile;
      spreaderGroup.add(suspendedBox);
    }

    crane.add(spreaderGroup);

    return {
      mesh: crane,
      spreader: spreaderGroup,
      baseY: spreaderGroup.position.y
    };
  }

  const craneZPositions = [-95, -45, 10, 65];
  craneZPositions.forEach((cz, idx) => {
    const cObj = createSTSCrane(-17, cz, idx === 1 || idx === 2);
    cranes.push(cObj);
    scene.add(cObj.mesh);
  });

  // ---------- 8. NAVIO PORTA-CONTÊINERES DE MAIS DE 100M ----------
  const shipGroup = new THREE.Group();
  shipGroup.position.set(-6.5, 0, -35);

  const lowerHull = new THREE.Mesh(new THREE.BoxGeometry(11, 4.5, 105), materials.shipHullRed);
  lowerHull.position.set(0, 0.8, 0);
  shipGroup.add(lowerHull);

  const upperHull = new THREE.Mesh(new THREE.BoxGeometry(12.5, 5.5, 110), materials.shipHullBlack);
  upperHull.position.set(0, 4.5, 0);
  upperHull.castShadow = !isMobile;
  shipGroup.add(upperHull);

  const bow = new THREE.Mesh(new THREE.ConeGeometry(6.4, 18, 4), materials.shipHullBlack);
  bow.rotateY(Math.PI / 4);
  bow.rotateX(Math.PI / 2);
  bow.position.set(0, 4.5, 62);
  bow.scale.set(1, 0.6, 1);
  shipGroup.add(bow);

  const shipDeck = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 108), materials.shipDeck);
  shipDeck.position.set(0, 7.3, 0);
  shipGroup.add(shipDeck);

  for (let z = -40; z <= 30; z += 6.5) {
    for (let x = -4.2; x <= 4.2; x += 2.8) {
      const tiers = Math.floor(Math.random() * 2) + 3;
      for (let t = 0; t < tiers; t++) {
        const mat = containerMats[Math.floor(Math.random() * containerMats.length)];
        const cBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 6.0), mat);
        cBox.position.set(x, 7.5 + t * 2.5 + 1.25, z);
        cBox.castShadow = !isMobile;
        cBox.receiveShadow = !isMobile;
        shipGroup.add(cBox);
      }
    }
  }

  const bridgeHousing = new THREE.Mesh(new THREE.BoxGeometry(11.5, 12, 14), materials.shipCabin);
  bridgeHousing.position.set(0, 13.5, -45);
  bridgeHousing.castShadow = !isMobile;
  shipGroup.add(bridgeHousing);

  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(15, 2.2, 8), materials.glass);
  bridgeDeck.position.set(0, 19.5, -45);
  shipGroup.add(bridgeDeck);

  const funnel = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 8, 12), materials.shipHullRed);
  funnel.position.set(0, 22, -50);
  funnel.rotation.x = 0.15;
  shipGroup.add(funnel);

  const radarMast = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 7, 8), materials.craneDark);
  radarMast.position.set(0, 23, -44);
  shipGroup.add(radarMast);

  const radarBar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.3, 0.4), materials.shipCabin);
  radarBar.position.set(0, 26, -44);
  shipGroup.add(radarBar);

  scene.add(shipGroup);

  // ---------- 9. REBOCADOR PORTUÁRIO ----------
  const tugGroup = new THREE.Group();
  tugGroup.position.set(6, 0.3, 40);

  const tugHull = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.2, 14), materials.shipHullRed);
  tugGroup.add(tugHull);

  const tugCabin = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 6), materials.shipCabin);
  tugCabin.position.set(0, 2.2, -1);
  tugGroup.add(tugCabin);

  const tugGlass = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.1, 4), materials.glass);
  tugGlass.position.set(0, 3.2, -0.5);
  tugGroup.add(tugGlass);

  const tugFunnel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 3, 8), materials.shipHullBlack);
  tugFunnel.position.set(0, 4.2, -3);
  tugGroup.add(tugFunnel);

  scene.add(tugGroup);

  // ---------- 10. FAROL & BOIAS DE BALIZAMENTO ----------
  const lighthouse = new THREE.Group();
  lighthouse.position.set(22, 2.1, -165);

  const lhBase = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.5, 4, 16), materials.concrete);
  lhBase.position.y = 2;
  lighthouse.add(lhBase);

  const lhTower = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 3.0, 20, 16), materials.lighthouseWhite);
  lhTower.position.y = 14;
  lighthouse.add(lhTower);

  const lhBand = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 5, 16), materials.lighthouseRed);
  lhBand.position.y = 15;
  lighthouse.add(lhBand);

  const lhLantern = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 3, 12), materials.glass);
  lhLantern.position.y = 25;
  lighthouse.add(lhLantern);

  const lhRoof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2.5, 16), materials.lighthouseRed);
  lhRoof.position.y = 27.5;
  lighthouse.add(lhRoof);

  const lhSpot = new THREE.SpotLight(0xfef08a, 4.5, 220, Math.PI / 7, 0.4);
  lhSpot.position.set(0, 25, 0);
  const lhTarget = new THREE.Object3D();
  lhTarget.position.set(0, 10, -50);
  scene.add(lhTarget);
  lhSpot.target = lhTarget;
  lighthouse.add(lhSpot);

  scene.add(lighthouse);

  // Boias Náuticas
  const buoys = [];
  const buoyPoints = [
    { x: -5.5, z: -150, color: 'red' },
    { x: 5.5, z: -150, color: 'green' },
    { x: -7.5, z: -80, color: 'red' },
    { x: 7.5, z: -80, color: 'green' },
    { x: -6.0, z: 0, color: 'red' },
    { x: 7.0, z: 0, color: 'green' },
    { x: -6.0, z: 80, color: 'red' },
    { x: 7.0, z: 80, color: 'green' }
  ];

  buoyPoints.forEach(bp => {
    const buoy = new THREE.Group();
    buoy.position.set(bp.x, 0.4, bp.z);

    const mat = bp.color === 'red' ? materials.buoyRed : materials.buoyGreen;
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 1.8, 10), mat);
    buoy.add(body);

    const top = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.2, 8), mat);
    top.position.y = 1.4;
    buoy.add(top);

    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), materials.beaconLight);
    beacon.position.y = 2.1;
    buoy.add(beacon);

    scene.add(buoy);
    buoys.push({ mesh: buoy, baseY: buoy.position.y, seed: Math.random() * 10 });
  });

  // ---------- 11. TRAJETÓRIA SPLINE DA CÂMERA (VINCULADA ÀS 5 ETAPAS) ----------
  // Etapa 1: Início no canal aberto, vendo as boias e farol
  // Etapa 2: Passando sob os guindastes pórtico STS
  // Etapa 3: Ao lado do navio cargueiro atracado de 100m
  // Etapa 4: Terminal multimodal, silos e rebocador
  // Etapa 5: Vista aérea panorâmica elevada do porto iluminado
  const splinePoints = [
    new THREE.Vector3(1.5, 3.6, -155),   // Etapa 1 (0.00)
    new THREE.Vector3(-1.2, 4.0, -95),   // Transição 1->2
    new THREE.Vector3(-2.2, 4.5, -45),   // Etapa 2 (0.25)
    new THREE.Vector3(-2.8, 4.5, -15),   // Etapa 3 (0.50)
    new THREE.Vector3(0.5, 5.2, 35),     // Transição 3->4
    new THREE.Vector3(2.0, 6.2, 75),     // Etapa 4 (0.75)
    new THREE.Vector3(0.0, 9.5, 115),    // Transição 4->5
    new THREE.Vector3(0.0, 11.5, 135)    // Etapa 5 (1.00)
  ];

  const cameraSpline = new THREE.CatmullRomCurve3(splinePoints, false, 'catmullrom', 0.15);

  const lookAtPoints = [
    new THREE.Vector3(0, 4.5, -110),
    new THREE.Vector3(-1, 5.0, -60),
    new THREE.Vector3(-2, 6.5, -10),
    new THREE.Vector3(-2, 6.0, 15),
    new THREE.Vector3(0, 6.0, 50),
    new THREE.Vector3(1, 6.0, 85),
    new THREE.Vector3(-4, 4.5, 60),
    new THREE.Vector3(-8, 3.5, 20)
  ];

  const lookAtSpline = new THREE.CatmullRomCurve3(lookAtPoints, false, 'catmullrom', 0.15);

  // Inicializa a câmera
  const initialCamPos = cameraSpline.getPointAt(0);
  camera.position.copy(initialCamPos);
  const initialLookAt = lookAtSpline.getPointAt(0);
  camera.lookAt(initialLookAt);

  // ---------- 12. SINCRONIZAÇÃO SCROLLTRIGGER COM AS 5 ETAPAS ----------
  const hudProgressFill = document.getElementById('hudProgressFill');
  const hudShipIndicator = document.getElementById('hudShipIndicator');
  const stepButtons = document.querySelectorAll('.nav-step-btn');
  const stages = [
    document.getElementById('etapa-1'),
    document.getElementById('etapa-2'),
    document.getElementById('etapa-3'),
    document.getElementById('etapa-4'),
    document.getElementById('etapa-5')
  ];

  let currentProgress = 0;
  let targetProgress = 0;
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  if (!isMobile) {
    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  function updateHUD(progress) {
    const pct = Math.min(100, Math.max(0, progress * 100));
    if (hudProgressFill) hudProgressFill.style.width = pct + '%';
    if (hudShipIndicator) hudShipIndicator.style.left = pct + '%';

    // Determina qual etapa está ativa
    let activeIdx = 0;
    if (progress < 0.18) activeIdx = 0;
    else if (progress < 0.40) activeIdx = 1;
    else if (progress < 0.65) activeIdx = 2;
    else if (progress < 0.88) activeIdx = 3;
    else activeIdx = 4;

    stepButtons.forEach((btn, idx) => {
      if (idx === activeIdx) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  }

  // Monitora o scroll da página via ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: '#scrollyMain',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        targetProgress = self.progress;
      }
    });
  } else {
    window.addEventListener('scroll', () => {
      const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = Math.max(0, Math.min(1, window.scrollY / scrollMax));
    }, { passive: true });
  }

  // Cliques nos botões de navegação rápida por etapas
  stepButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSelector = btn.getAttribute('data-target');
      const targetEl = document.querySelector(targetSelector);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Redimensionamento
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.4 : 2));
  }
  window.addEventListener('resize', onWindowResize);

  // ---------- 13. LOOP DE ANIMAÇÃO & RENDER (60 FPS) ----------
  const clock = new THREE.Clock();
  const camPos = new THREE.Vector3();
  const camLookAt = new THREE.Vector3();

  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Interpolação suave do progresso do scroll (dampened lerp)
    currentProgress += (targetProgress - currentProgress) * 0.08;
    updateHUD(currentProgress);

    // Parallax do mouse
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    // Posição base na curva Spline
    cameraSpline.getPointAt(currentProgress, camPos);
    lookAtSpline.getPointAt(currentProgress, camLookAt);

    // Balanço da embarcação (movimento orgânico de onda)
    const boatBob = Math.sin(elapsedTime * 1.6) * 0.12;
    const boatRoll = Math.sin(elapsedTime * 1.2) * 0.018;
    const boatPitch = Math.cos(elapsedTime * 1.4) * 0.012;

    camera.position.set(
      camPos.x + mouseX * 0.8,
      camPos.y + boatBob + -mouseY * 0.4,
      camPos.z
    );

    camera.lookAt(
      camLookAt.x + mouseX * 2.2,
      camLookAt.y + boatBob * 0.5 - mouseY * 1.2,
      camLookAt.z
    );

    camera.rotation.z += boatRoll;
    camera.rotation.x += boatPitch;

    // Animação das ondas da água
    for (let i = 0; i < waterPos.count; i++) {
      const u = waterPos.getX(i);
      const v = waterPos.getY(i);
      const wave = Math.sin(u * 0.35 + elapsedTime * 1.8) * 0.14 +
                   Math.cos(v * 0.25 + elapsedTime * 1.3) * 0.12 +
                   Math.sin((u + v) * 0.18 + elapsedTime * 0.9) * 0.08;
      waterPos.setZ(i, waterBaseZ[i] + wave);
    }
    waterPos.needsUpdate = true;

    // Balanço das boias náuticas
    buoys.forEach(b => {
      b.mesh.position.y = b.baseY + Math.sin(elapsedTime * 2.0 + b.seed) * 0.12;
      b.mesh.rotation.z = Math.sin(elapsedTime * 1.5 + b.seed) * 0.08;
      b.mesh.rotation.x = Math.cos(elapsedTime * 1.7 + b.seed) * 0.06;
    });

    // Rotação do farol e rebocador
    if (lhTarget) {
      const lightAngle = elapsedTime * 0.9;
      lhTarget.position.x = Math.sin(lightAngle) * 60;
      lhTarget.position.z = -165 + Math.cos(lightAngle) * 60;
    }

    if (tugGroup) {
      tugGroup.position.y = 0.3 + Math.sin(elapsedTime * 1.8) * 0.08;
      tugGroup.rotation.z = Math.sin(elapsedTime * 1.4) * 0.02;
    }

    // Movimentação suave de subida/descida do contêiner içado
    if (cranes[1] && cranes[1].spreader) {
      cranes[1].spreader.position.y = cranes[1].baseY + Math.sin(elapsedTime * 0.8) * 1.8;
    }

    renderer.render(scene, camera);
  }

  animate();

  setTimeout(() => {
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => { loader.style.display = 'none'; }, 450);
    }
  }, 300);

  window.addEventListener('beforeunload', () => {
    window.removeEventListener('resize', onWindowResize);
    renderer.dispose();
  });
}
