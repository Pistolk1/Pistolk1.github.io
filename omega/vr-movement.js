// vr-movement.js

class VRPlayer {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Settings
        this.maxArmLength = 1.5; // Maximum arm reach
        this.jumpMultiplier = 2.0;
        this.velocityLimit = 10.0;
        this.maxJumpSpeed = 20.0;

        // State variables
        this.leftHandPosition = new THREE.Vector3();
        this.rightHandPosition = new THREE.Vector3();
        this.headPosition = new THREE.Vector3();
        this.lastPosition = new THREE.Vector3();
        this.velocity = new THREE.Vector3();
        this.isLeftHandTouching = false;
        this.isRightHandTouching = false;

        // Helper for calculating velocity
        this.velocityHistory = [];
        this.velocityHistorySize = 10;

        // Hand objects
        this.leftHand = null;
        this.rightHand = null;

        // Movement surfaces
        this.surfaces = [];
    }

    addHand(leftHand, rightHand) {
        this.leftHand = leftHand;
        this.rightHand = rightHand;
    }

    addSurface(surfaceMesh, slipPercentage = 0.05) {
        surfaceMesh.userData.slipPercentage = slipPercentage;
        this.surfaces.push(surfaceMesh);
    }

    update(deltaTime) {
        if (!this.leftHand || !this.rightHand) return;

        // Update positions
        const newLeftPos = this.leftHand.getWorldPosition(new THREE.Vector3());
        const newRightPos = this.rightHand.getWorldPosition(new THREE.Vector3());
        const newHeadPos = this.camera.position.clone();

        // Calculate velocity
        this.updateVelocity(this.camera.position, deltaTime);

        // Check collisions
        this.handleHandCollision(newLeftPos, true);
        this.handleHandCollision(newRightPos, false);

        // Move player
        const movement = this.calculateMovement(newLeftPos, newRightPos, newHeadPos);
        this.scene.position.add(movement);

        // Update last positions
        this.leftHandPosition.copy(newLeftPos);
        this.rightHandPosition.copy(newRightPos);
        this.headPosition.copy(newHeadPos);
    }

    handleHandCollision(handPosition, isLeftHand) {
        const colliding = this.surfaces.some(surface =>
            this.checkCollision(handPosition, surface)
        );
        if (isLeftHand) {
            this.isLeftHandTouching = colliding;
        } else {
            this.isRightHandTouching = colliding;
        }
    }

    checkCollision(position, surface) {
        const distance = position.distanceTo(surface.position);
        const radius = 0.1; // Example hand radius
        return distance < radius + surface.geometry.boundingSphere.radius;
    }

    calculateMovement(newLeftPos, newRightPos, newHeadPos) {
        const leftMovement = newLeftPos.clone().sub(this.leftHandPosition);
        const rightMovement = newRightPos.clone().sub(this.rightHandPosition);

        // Blend movements
        const combinedMovement = leftMovement.add(rightMovement).multiplyScalar(0.5);

        // Apply jump velocity
        if (this.isLeftHandTouching || this.isRightHandTouching) {
            if (this.velocity.length() > this.velocityLimit) {
                this.velocity.setLength(Math.min(this.velocity.length() * this.jumpMultiplier, this.maxJumpSpeed));
            }
            combinedMovement.add(this.velocity);
        }

        return combinedMovement;
    }

    updateVelocity(newPosition, deltaTime) {
        const velocity = newPosition.clone().sub(this.lastPosition).divideScalar(deltaTime);
        this.velocityHistory.push(velocity);
        if (this.velocityHistory.length > this.velocityHistorySize) {
            this.velocityHistory.shift();
        }
        this.velocity.copy(
            this.velocityHistory.reduce((acc, vel) => acc.add(vel), new THREE.Vector3()).divideScalar(this.velocityHistory.length)
        );
        this.lastPosition.copy(newPosition);
    }
}
