import * as THREE from 'three';

export const camera = new THREE.PerspectiveCamera(
  27,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Камера смотрит в комнату через открытую стену
camera.position.set(0, 0, 0);
camera.lookAt(0, 0, 0);
