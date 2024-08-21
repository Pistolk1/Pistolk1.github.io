AFRAME.registerComponent('gorilla-movement', {
    schema: {
        speed: {type: 'number', default: 0.1},
        jumpStrength: {type: 'number', default: 0.4},
        gravity: {type: 'number', default: -0.02},
        gestureThreshold: {type: 'number', default: 0.1} // Sensitivity for gesture recognition
    },
    
    init: function() {
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.cameraRig = document.getElementById('cameraRig');
        this.leftHand = document.getElementById('leftHand');
        this.rightHand = document.getElementById('rightHand');
        this.groundY = 0;
        this.canJump = false;
        this.prevLeftPos = new THREE.Vector3();
        this.prevRightPos = new THREE.Vector3();
    },
    
    tick: function() {
        const handPositions = this.getHandPositions();
        this.applyMovement(handPositions);
        this.applyGravity();
        this.handleJump(handPositions);

        // Update player position
        this.cameraRig.object3D.position.add(this.velocity);

        // Dampening to simulate friction
        this.velocity.x *= 0.9;
        this.velocity.z *= 0.9;
    },

    getHandPositions: function() {
        const leftPos = new THREE.Vector3();
        const rightPos = new THREE.Vector3();
        this.leftHand.object3D.getWorldPosition(leftPos);
        this.rightHand.object3D.getWorldPosition(rightPos);
        return {leftPos, rightPos};
    },

    applyMovement: function({leftPos, rightPos}) {
        const movementVector = new THREE.Vector3();
        movementVector.subVectors(rightPos, this.prevRightPos);
        movementVector.add(leftPos.sub(this.prevLeftPos));
        this.velocity.add(movementVector.multiplyScalar(-this.data.speed));
        this.prevLeftPos.copy(leftPos);
        this.prevRightPos.copy(rightPos);
    },

    applyGravity: function() {
        this.velocity.y += this.data.gravity;
    },

    handleJump: function({leftPos, rightPos}) {
        const leftVelocityY = this.prevLeftPos.y - leftPos.y;
        const rightVelocityY = this.prevRightPos.y - rightPos.y;

        if (this.cameraRig.object3D.position.y <= this.groundY) {
            this.cameraRig.object3D.position.y = this.groundY;
            this.velocity.y = 0;
            this.canJump = true;
        }

        if (this.canJump && leftVelocityY > this.data.gestureThreshold && rightVelocityY > this.data.gestureThreshold) {
            this.velocity.y = this.data.jumpStrength;
            this.canJump = false;
        }
    }
});

document.getElementById('cameraRig').setAttribute('gorilla-movement', '');
