class BinaryPixelArt {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext('2d');
      this.cellSize = 10;
      this.rows = 16;
      this.cols = 16;
      this.pixelData = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
      this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
      this.drawGrid();
    }
  
    drawGrid() {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          this.ctx.fillStyle = this.pixelData[row][col] === 1 ? '#000' : '#fff';
          this.ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
          this.ctx.strokeRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
        }
      }
    }
  
    handleCanvasClick(event) {
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const col = Math.floor(x / this.cellSize);
      const row = Math.floor(y / this.cellSize);
      this.pixelData[row][col] = this.pixelData[row][col] === 0 ? 1 : 0;
      this.drawGrid();
    }
  
    clearGrid() {
      this.pixelData = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
      this.drawGrid();
    }
  
    generateFingerprint() {
      return btoa(this.pixelData.flat().join(''));
    }
  }
  
  class FingerprintAuth {
    constructor() {
      this.accounts = {}; // Store accounts with fingerprints
    }
  
    register(fingerprint) {
      if (this.accounts[fingerprint]) {
        return false; // Account already exists
      }
      this.accounts[fingerprint] = true;
      return true; // Registration successful
    }
  
    verify(fingerprint) {
      return !!this.accounts[fingerprint];
    }
  }
  
  // Export the classes for use in other sites
  export { BinaryPixelArt, FingerprintAuth };
  