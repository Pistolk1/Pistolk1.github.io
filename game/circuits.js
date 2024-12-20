// Circuit Wire Component
AFRAME.registerComponent('circuit-wire', {
  schema: {
    start: { type: 'selector' },
    end: { type: 'selector' },
    color: { type: 'string', default: '#FF0000' },
    thickness: { type: 'number', default: 0.05 },
  },
  init: function () {
    // Create the wire line
    this.line = document.createElement('a-cylinder');
    this.line.setAttribute('radius', this.data.thickness / 2);
    this.line.setAttribute('color', this.data.color);
    this.line.setAttribute('segments-radial', 8);
    this.el.appendChild(this.line);

    // Create grab handles for both ends
    this.startHandle = document.createElement('a-sphere');
    this.startHandle.setAttribute('radius', this.data.thickness * 2);
    this.startHandle.setAttribute('color', this.data.color);
    this.startHandle.setAttribute('class', 'grabbable');
    this.startHandle.setAttribute('dynamic-body', '');
    this.el.appendChild(this.startHandle);

    this.endHandle = document.createElement('a-sphere');
    this.endHandle.setAttribute('radius', this.data.thickness * 2);
    this.endHandle.setAttribute('color', this.data.color);
    this.endHandle.setAttribute('class', 'grabbable');
    this.endHandle.setAttribute('dynamic-body', '');
    this.el.appendChild(this.endHandle);
  },
  tick: function () {
    const start = this.data.start.object3D.position;
    const end = this.data.end.object3D.position;

    // Position and orient the wire
    const midPoint = start.clone().add(end).multiplyScalar(0.5);
    const distance = start.distanceTo(end);
    const direction = new THREE.Vector3().subVectors(end, start).normalize();

    this.line.object3D.position.copy(midPoint);
    this.line.object3D.scale.set(1, distance / 2, 1);
    this.line.object3D.lookAt(end);

    // Position the grab handles
    this.startHandle.object3D.position.copy(start);
    this.endHandle.object3D.position.copy(end);
  },
});

// Pressure Plate Component
AFRAME.registerComponent('pressure-plate', {
  schema: {},
  init: function () {
    this.isActive = false;
  },
  tick: function () {
    const box = document.querySelector('#grab-box');
    const platePosition = this.el.object3D.position;
    const boxPosition = box.object3D.position;

    if (boxPosition.distanceTo(platePosition) < 0.5) {
      this.isActive = true;
      this.el.setAttribute('color', '#00FF00');
    } else {
      this.isActive = false;
      this.el.setAttribute('color', '#A9A9A9');
    }
  },
});

// Door Component
AFRAME.registerComponent('door', {
  schema: {},
  init: function () {
    this.isOpen = false;
  },
  tick: function () {
    const plate = document.querySelector('#pressure-plate');
    if (plate.getAttribute('pressure-plate').isActive) {
      this.isOpen = true;
      this.el.setAttribute('position', '4 3 -2'); // Open door
    } else {
      this.isOpen = false;
      this.el.setAttribute('position', '4 1 -2'); // Close door
    }
  },
});
