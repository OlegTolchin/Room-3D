import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';

RectAreaLightUniformsLib.init();

/**
 * Базовый свет сцены (Ambient + Directional)
 */
export function setupLights(scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 0.2);
  key.position.set(0, 0, 0);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffffff, 0.2);
  fill.position.set(0, 0, 0);
  scene.add(fill);
}

/**
 * Потолочные споты, привязанные к Spot_*
 */
export function setupRoomLights(room) {
  const spotNames = [
    'Spot_001','Spot_002','Spot_003','Spot_004',
    'Spot_005','Spot_006','Spot_007','Spot_008'
  ];

  spotNames.forEach((spotName) => {
    const spotObject = room.getObjectByName(spotName);
    if (!spotObject) {
      console.warn(`Объект не найден: ${spotName}`);
      return;
    }

    // === СПОТ-СВЕТ ===
    const spotLight = new THREE.SpotLight(
      0xffffff,
      5,              // intensity
      80,             // distance
      Math.PI / 4,    // angle
      0.5,            // penumbra
      1.5               // decay (физически корректный)
    );

    spotObject.add(spotLight);
    spotLight.position.set(0, 0, 0);

    // === Target (локально по -Z) ===
    spotObject.add(spotLight.target);
    spotLight.target.position.set(0, 0, -1);
    spotLight.target.updateMatrixWorld(true);

    // === ВИЗУАЛЬНЫЙ СВЕТЯЩИЙСЯ КРУГ (LED-линза) ===
    const bulb = new THREE.Mesh(
      new THREE.CircleGeometry(0.01, 24),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 2.5,
        roughness: 0.2,
        metalness: 0.0,
        side: THREE.DoubleSide
      })
    );

    // CircleGeometry смотрит по +Z → поворачиваем вниз
    bulb.rotation.x = -Math.PI;
    bulb.position.set(0, 0, 0.001);

    spotObject.add(bulb);

    console.log(`Спот корректно создан: ${spotName}`);
  });
}

/**
 * Создает LED-ленту с рассеянным светом на объекте ceilinglight
 * @param {THREE.Object3D} ceilinglight - объект для привязки LED-ленты
 * @param {Object} options - настройки { position: [x,y,z], rotationDeg: [x,y,z], ... }
 */
function createLEDStrip(ceilinglight, options = {}) {
  // Конвертация градусов в радианы
  const toRad = (deg) => deg * Math.PI / 180;

  // Размеры LED-ленты (подстрой под модель)
  const width = options.width || 0.01;
  const height = options.height || 1.0;

  // RectAreaLight - рассеянный свет
  const rectLight = new THREE.RectAreaLight(
    options.color || 0xffffff,
    options.intensity || 6,
    width,
    height
  );
  ceilinglight.add(rectLight);

  // Позиция
  if (options.position) {
    rectLight.position.set(...options.position);
  }

  // Поворот (градусы)
  if (options.rotationDeg) {
    rectLight.rotation.set(...options.rotationDeg.map(toRad));
  }

  // Направление света (target - локальные координаты)
  if (options.target) {
    const targetObj = new THREE.Object3D();
    targetObj.position.set(...options.target);
    ceilinglight.add(targetObj);
    rectLight.target = targetObj;
  }

  // Визуальная полоса LED
  const ledMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2,
      side: THREE.DoubleSide
    })
  );
  if (options.position) {
    ledMesh.position.set(...options.position);
  }
  if (options.rotationDeg) {
    ledMesh.rotation.set(...options.rotationDeg.map(toRad));
  }
  ceilinglight.add(ledMesh);

  // Helper для визуализации RectAreaLight
  const rectLightHelper = new RectAreaLightHelper(rectLight, 0xff0000);
  if (options.position) {
    rectLightHelper.position.set(...options.position);
  }
  if (options.rotationDeg) {
    rectLightHelper.rotation.set(...options.rotationDeg.map(toRad));
  }
  ceilinglight.add(rectLightHelper);

  // DirectionalLight для теней
  const shadowLight = new THREE.DirectionalLight(0xffffff, 0.5);
  shadowLight.castShadow = true;
  shadowLight.shadow.mapSize.width = 1024;
  shadowLight.shadow.mapSize.height = 1024;
  shadowLight.shadow.camera.near = 0.1;
  shadowLight.shadow.camera.far = 10;
  shadowLight.shadow.camera.left = -5;
  shadowLight.shadow.camera.right = 5;
  shadowLight.shadow.camera.top = 5;
  shadowLight.shadow.camera.bottom = -5;
  shadowLight.shadow.bias = -0.001;

  if (options.shadowPosition) {
    shadowLight.position.set(...options.shadowPosition);
  } else {
    shadowLight.position.set(0, 0, 0);
  }
  shadowLight.target.position.set(0, 1, 0);
  ceilinglight.add(shadowLight);
  ceilinglight.add(shadowLight.target);
}

/**
 * Создает LED-ленты на всех объектах ceilinglight_001 - ceilinglight_004
 * @param {THREE.Object3D} room - объект комнаты, содержащий ceilinglight объекты
 */
export function setupLEDStrip(room) {
  // Настройки для каждой ленты
  const ledConfigs = {
    ceilinglight_001: {
      position: [0, 0, 0.01],
      rotationDeg: [0, 0, 0],
      target: [0, 1, 0],
      shadowPosition: [0, 0, 0],
      width: 0.01,
      height: 1.75,
      color: 0xffffff,
      intensity: 50
    },
    ceilinglight_002: {
      position: [0, 0, 0.01],
      rotationDeg: [0, 0, 90],
      target: [0, 1, 0],
      shadowPosition: [0, 0, 0],
      width: 0.01,
      height: 3.6,
      color: 0xffffff,
      intensity: 50
    },
    ceilinglight_003: {
      position: [0, 0, 0.01],
      rotationDeg: [0, 0, 0],
      target: [0, 1, 0],
      shadowPosition: [0, 0, 0],
      width: 0.01,
      height: 1.75,
      color: 0xffffff,
      intensity: 50
    },
    ceilinglight_004: {
      position: [0, 0, 0.01],
      rotationDeg: [0, 0, 90],
      target: [0, 1, 0],
      shadowPosition: [0, 0, 0],
      width: 0.01,
      height: 3.6,
      color: 0xffffff,
      intensity: 50
    }
  };

  let created = 0;

  for (let i = 1; i <= 4; i++) {
    const name = `ceilinglight_${String(i).padStart(3, '0')}`;
    const ceilinglight = room.getObjectByName(name);
    const options = ledConfigs[name] || {};
    if (ceilinglight) {
      createLEDStrip(ceilinglight, options);
      const worldPos = new THREE.Vector3();
      ceilinglight.getWorldPosition(worldPos);
      console.log(`LED-лента создана: ${name} | позиция: (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}, ${worldPos.z.toFixed(2)})`);
      created++;
    } else {
      console.warn(`Объект не найден: ${name}`);
    }
  }

  console.log(`Создано LED-лент: ${created}`);
}
