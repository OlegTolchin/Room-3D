import { camera } from './camera.js';
import { room } from './scene.js';

export const controls = {
  isDragging: false,
  previousMousePosition: { x: 0, y: 0 },
  rotationSpeed: 0.01,
  zoomSpeed: 0.1,
  minZoom: 1,
  maxZoom: 20,

  // Обновление — пока не нужно, всё в событиях
  update: function() {}
};

// --- Вращение модели при нажатой левой кнопке мыши ---
document.addEventListener('mousedown', (event) => {
  if (event.button === 0) {
    controls.isDragging = true;
    controls.previousMousePosition = { x: event.clientX, y: event.clientY };
  }
});

document.addEventListener('mouseup', () => {
  controls.isDragging = false;
});

document.addEventListener('mousemove', (event) => {
  if (controls.isDragging && room) {
    const deltaX = event.clientX - controls.previousMousePosition.x;
    const deltaY = event.clientY - controls.previousMousePosition.y;

    room.rotation.y += deltaX * controls.rotationSpeed;
    room.rotation.x += deltaY * controls.rotationSpeed;

    // Ограничение наклона по X (чтобы не перевернуть комнату)
    room.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, room.rotation.x));
  }

  controls.previousMousePosition = { x: event.clientX, y: event.clientY };
});

// --- Зум колёсиком мыши ---
document.addEventListener('wheel', (event) => {
  const delta = event.deltaY * 0.01; // Чем меньше число, тем мягче зум
  const newZ = camera.position.z + delta * controls.zoomSpeed * camera.position.z;

  // Ограничение диапазона зума
  camera.position.z = Math.max(controls.minZoom, Math.min(controls.maxZoom, newZ));
});
