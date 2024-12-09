const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('webxr').appendChild(renderer.domElement);

const clock = new THREE.Clock();
let mixer; // Animation mixer
let currentFrameIndex = 0;
let frames = [];

// Load JSON or GLTF data
document.getElementById('fileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const extension = file.name.split('.').pop().toLowerCase();
    if (extension === 'json') {
      frames = JSON.parse(reader.result);
      console.log("Loaded JSON frames:", frames);
      animatePlayback();
    } else if (extension === 'gltf' || extension === 'glb') {
      loadGLTF(reader.result);
    }
  };
  reader.readAsDataURL(file);
});

// Load GLTF/GLB file
function loadGLTF(dataURL) {
  const loader = new THREE.GLTFLoader();
  loader.load(dataURL, (gltf) => {
    scene.add(gltf.scene);
    mixer = new THREE.AnimationMixer(gltf.scene);
    if (gltf.animations.length) {
      const clip = gltf.animations[0];
      mixer.clipAction(clip).play();
    }
    console.log("Loaded GLTF/GLB model");
    animatePlayback();
  });
}

// Animate playback
function animatePlayback() {
  const animate = () => {
    requestAnimationFrame(animate);
    if (frames.length > 0) {
      const frame = frames[currentFrameIndex];
      camera.position.set(frame.camera.position[0], frame.camera.position[1], frame.camera.position[2]);
      camera.rotation.set(frame.camera.rotation[0], frame.camera.rotation[1], frame.camera.rotation[2]);
      currentFrameIndex = (currentFrameIndex + 1) % frames.length;
    }
    if (mixer) mixer.update(clock.getDelta());
    renderer.render(scene, camera);
  };
  animate();
}

// Export full animation as GLTF
document.getElementById('exportAnimation').addEventListener('click', () => {
  const gltfExporter = new THREE.GLTFExporter();
  const options = { animations: [] }; // Add your animations here if applicable
  gltfExporter.parse(scene, (result) => {
    const blob = new Blob([JSON.stringify(result)], { type: 'application/octet-stream' });
    downloadBlob(blob, 'volumetric_animation.gltf');
  });
});

// Export current frame as GLTF
document.getElementById('exportFrame').addEventListener('click', () => {
  if (frames.length > 0 && frames[currentFrameIndex]) {
    const gltfExporter = new THREE.GLTFExporter();
    const options = {}; // Add additional options if needed
    gltfExporter.parse(scene, (result) => {
      const blob = new Blob([JSON.stringify(result)], { type: 'application/octet-stream' });
      downloadBlob(blob, `frame_${currentFrameIndex}.gltf`);
    });
  } else {
    console.warn("No frames available for export.");
  }
});

// Utility function for downloading
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
