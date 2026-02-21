import { scene, renderer } from './scene.js';
import { camera } from './camera.js';
import { controls } from './controls.js';

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
