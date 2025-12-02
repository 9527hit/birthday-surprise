/**
 * Scene 5: Birthday Candles - Candles that can be blown out
 */

const CandlesScene = {
    canvas: null,
    ctx: null,
    isActive: false,
    candles: [],
    stillnessTimer: 0,
    candlesAppeared: false,
    blowingTimer: 0,
    transitionTimer: 0,
    
    /**
     * Initialize the scene
     */
    init() {
        this.canvas = document.getElementById('candles-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Initialize candles
        this.initCandles();
        
        // Listen for window resize
        window.addEventListener('resize', () => this.resize());
        
        Utils.debug('Candles scene initialized');
    },
    
    /**
     * Resize canvas
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    /**
     * Initialize candles
     */
    initCandles() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const candleCount = 5; // Can be customized for age
        
        this.candles = [];
        for (let i = 0; i < candleCount; i++) {
            const angle = (Math.PI * 2 * i) / candleCount - Math.PI / 2;
            const radius = 120;
            this.candles.push({
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius + 50,
                lit: true,
                flameHeight: Utils.random(20, 30),
                flamePhase: Utils.random(0, Math.PI * 2)
            });
        }
    },
    
    /**
     * Activate scene
     */
    activate() {
        this.isActive = true;
        this.stillnessTimer = 0;
        this.candlesAppeared = false;
        this.blowingTimer = 0;
        this.transitionTimer = 0;
        
        // Reset candles
        this.candles.forEach(candle => {
            candle.lit = true;
        });
        
        // Register gesture callback for blowing
        CameraModule.on('blow', () => {
            if (this.isActive && this.candlesAppeared) {
                this.blowCandle();
            }
        });
        
        Utils.debug('Candles scene activated');
    },
    
    /**
     * Deactivate scene
     */
    deactivate() {
        this.isActive = false;
    },
    
    /**
     * Blow out a candle
     */
    blowCandle() {
        // Find first lit candle and blow it out
        const litCandle = this.candles.find(c => c.lit);
        if (litCandle) {
            litCandle.lit = false;
            Utils.debug('Candle blown out');
            
            // Create smoke particles
            this.createSmoke(litCandle.x, litCandle.y - 40);
        }
        
        // Check if all candles are out
        const allOut = this.candles.every(c => !c.lit);
        if (allOut) {
            Utils.debug('All candles blown out!');
            this.transitionTimer = 120; // 2 seconds
        }
    },
    
    /**
     * Create smoke effect
     */
    createSmoke(x, y) {
        // Simple smoke particles rising
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = new Particle(x, y, {
                    vx: Utils.random(-1, 1),
                    vy: Utils.random(-2, -1),
                    size: Utils.random(3, 8),
                    color: '#888',
                    life: Utils.random(0.5, 1),
                    maxLife: 1
                });
                // Store in a smoke particles array if needed
            }, i * 50);
        }
    },
    
    /**
     * Update scene
     */
    update() {
        if (!this.isActive) return;
        
        // Check for stillness
        if (CameraModule.currentGesture === 'still' || CameraModule.currentGesture === null) {
            this.stillnessTimer++;
            
            if (this.stillnessTimer > 300 && !this.candlesAppeared) { // 5 seconds
                this.candlesAppeared = true;
                Utils.debug('Candles appeared!');
            }
        } else {
            this.stillnessTimer = Math.max(0, this.stillnessTimer - 10);
        }
        
        // Update candle flames
        this.candles.forEach(candle => {
            if (candle.lit) {
                candle.flamePhase += 0.1;
                candle.flameHeight = 25 + Math.sin(candle.flamePhase) * 5;
            }
        });
        
        // Handle transition
        if (this.transitionTimer > 0) {
            this.transitionTimer--;
            if (this.transitionTimer === 0 && window.App) {
                window.App.nextScene();
            }
        }
    },
    
    /**
     * Render scene
     */
    render() {
        if (!this.isActive) return;
        
        // Dark background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.98)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.candlesAppeared) {
            // Show stillness progress
            const progress = Math.min(1, this.stillnessTimer / 300);
            const hintElement = document.getElementById('candle-hint');
            if (hintElement) {
                hintElement.textContent = `保持静止 ${Math.floor(progress * 100)}%...`;
            }
            return;
        }
        
        // Hide hint
        const hintElement = document.getElementById('candle-hint');
        if (hintElement && this.candlesAppeared) {
            hintElement.textContent = '吹气熄灭蜡烛 🕯️';
        }
        
        // Draw cake
        this.drawCake();
        
        // Draw candles
        this.candles.forEach(candle => {
            this.drawCandle(candle);
        });
    },
    
    /**
     * Draw birthday cake
     */
    drawCake() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Cake layers
        this.ctx.fillStyle = '#ffb6c1';
        this.ctx.fillRect(centerX - 200, centerY + 80, 400, 60);
        this.ctx.fillStyle = '#ff69b4';
        this.ctx.fillRect(centerX - 180, centerY + 20, 360, 60);
        this.ctx.fillStyle = '#ffb6c1';
        this.ctx.fillRect(centerX - 160, centerY - 40, 320, 60);
        
        // Decorations
        this.ctx.fillStyle = '#ffd700';
        for (let i = 0; i < 5; i++) {
            const x = centerX - 160 + i * 80;
            this.ctx.beginPath();
            this.ctx.arc(x, centerY - 40, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
    },
    
    /**
     * Draw single candle
     */
    drawCandle(candle) {
        // Candle stick
        this.ctx.fillStyle = candle.lit ? '#fff' : '#ccc';
        this.ctx.fillRect(candle.x - 5, candle.y, 10, 40);
        
        if (candle.lit) {
            // Flame
            const flameHeight = candle.flameHeight;
            
            // Glow
            this.ctx.save();
            const gradient = this.ctx.createRadialGradient(
                candle.x, candle.y - 20, 0,
                candle.x, candle.y - 20, 30
            );
            gradient.addColorStop(0, 'rgba(255, 200, 50, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(candle.x - 30, candle.y - 50, 60, 60);
            this.ctx.restore();
            
            // Flame shape
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.beginPath();
            this.ctx.moveTo(candle.x, candle.y - flameHeight);
            this.ctx.bezierCurveTo(
                candle.x - 8, candle.y - flameHeight * 0.7,
                candle.x - 8, candle.y - flameHeight * 0.3,
                candle.x, candle.y
            );
            this.ctx.bezierCurveTo(
                candle.x + 8, candle.y - flameHeight * 0.3,
                candle.x + 8, candle.y - flameHeight * 0.7,
                candle.x, candle.y - flameHeight
            );
            this.ctx.fill();
            
            // Inner flame
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.moveTo(candle.x, candle.y - flameHeight * 0.8);
            this.ctx.bezierCurveTo(
                candle.x - 4, candle.y - flameHeight * 0.6,
                candle.x - 4, candle.y - flameHeight * 0.2,
                candle.x, candle.y - 5
            );
            this.ctx.bezierCurveTo(
                candle.x + 4, candle.y - flameHeight * 0.2,
                candle.x + 4, candle.y - flameHeight * 0.6,
                candle.x, candle.y - flameHeight * 0.8
            );
            this.ctx.fill();
        }
    },
    
    /**
     * Animation loop
     */
    animate() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CandlesScene;
}
