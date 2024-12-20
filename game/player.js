AFRAME.registerComponent('player', {
  schema: {
    velocityLimit: { type: 'number', default: 2 },
    jumpMultiplier: { type: 'number', default: 1.5 },
    maxArmLength: { type: 'number', default: 1.5 },
  },
  init: function () {
    this.leftHand = null;
    this.rightHand = null;
    this.camera = null;
    this.isWireVisible = false;
    this.isEditMode = false;

    this.lastLeftHandPos = new THREE.Vector3();
    this.lastRightHandPos = new THREE.Vector3();

    this.el.addEventListener('loaded', () => {
      this.leftHand = this.el.querySelector('[oculus-touch-controls][hand="left"]');
      this.rightHand = this.el.querySelector('[oculus-touch-controls][hand="right"]');
      this.camera = this.el.querySelector('a-camera');

      this.initTablet();
    });
  },
  tick: function (time, deltaTime) {
    if (!this.leftHand || !this.rightHand || !this.camera) return;

    // Movement Logic
    const delta = deltaTime / 1000;
    const leftHandPos = this.leftHand.object3D.position.clone();
    const rightHandPos = this.rightHand.object3D.position.clone();

    const leftHandMove = leftHandPos.clone().sub(this.lastLeftHandPos);
    const rightHandMove = rightHandPos.clone().sub(this.lastRightHandPos);

    if (leftHandMove.length() > this.data.maxArmLength) {
      leftHandMove.setLength(this.data.maxArmLength);
    }
    if (rightHandMove.length() > this.data.maxArmLength) {
      rightHandMove.setLength(this.data.maxArmLength);
    }

    const movement = leftHandMove.add(rightHandMove).multiplyScalar(0.5);
    movement.y = 0; // Prevent flying

    const velocity = movement.clone().multiplyScalar(this.data.jumpMultiplier);
    if (velocity.length() > this.data.velocityLimit) {
      velocity.setLength(this.data.velocityLimit);
    }

    this.el.object3D.position.add(velocity);
    this.lastLeftHandPos.copy(leftHandPos);
    this.lastRightHandPos.copy(rightHandPos);
  },
  initTablet: function () {
    const menu = document.createElement('a-plane');
    menu.setAttribute('width', '0.3');
    menu.setAttribute('height', '0.2');
    menu.setAttribute('color', '#000');
    menu.setAttribute('opacity', '0.8');

    const wireToggle = document.createElement('a-text');
    wireToggle.setAttribute('value', 'Toggle Wires');
    wireToggle.setAttribute('position', '-0.12 0.05 0');
    wireToggle.setAttribute('color', '#FFF');
    wireToggle.addEventListener('click', () => {
      this.isWireVisible = !this.isWireVisible;
      document.querySelectorAll('[circuit-wire]').forEach(wire => {
        wire.setAttribute('visible', this.isWireVisible);
      });
    });

    const editToggle = document.createElement('a-text');
    editToggle.setAttribute('value', 'Toggle Edit Mode');
    editToggle.setAttribute('position', '-0.12 -0.05 0');
    editToggle.setAttribute('color', '#FFF');
    editToggle.addEventListener('click', () => {
      this.isEditMode = !this.isEditMode;
    });

    menu.appendChild(wireToggle);
    menu.appendChild(editToggle);
    this.camera.appendChild(menu);
  },
});
