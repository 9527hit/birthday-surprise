/**
 * Scene 4: Fireworks - Fireworks triggered by gestures with blessing text
 */

const FireworksScene = {
    canvas: null,
    ctx: null,
    isActive: false,
    particles: [],
    blessings: [
        '生日快乐', '永远幸福', '心想事成', '爱你一万年',
        '天天开心', '越来越美', '永远年轻', '梦想成真',
        '健康平安', '笑口常开', '万事如意', '心心相印'
    ],
    activeBlessings: [],
    transitionTimer: 0,
    fireworkCount: 0,
    
    /**
     * Initialize the scene
     */
    init() {
        this.canvas = document.getElementById('fireworks-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Listen for window resize
        window.addEventListener('resize', () => this.resize());
        
        Utils.debug('Fireworks scene initialized');
    },
    
    /**
     * Resize canvas
     */
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    },
    
    /**
     * Activate scene
     */
    activate() {
        this.isActive = true;
        this.particles = [];
        this.activeBlessings = [];
        this.fireworkCount = 0;
        this.transitionTimer = 0;
        
        // Register gesture callbacks
        CameraModule.on('heart', () => {
            if (this.isActive) {
                this.launchFirework();
            }
        });
        
        CameraModule.on('clap', () => {
            if (this.isActive) {
                this.launchMultipleFireworks(3);
            }
        });
        
        CameraModule.on('hands_raised', () => {
            if (this.isActive) {
                this.launchBigExplosion();
            }
        });
        
        Utils.debug('Fireworks scene activated');
    },
    
    /**
     * Deactivate scene
     */
    deactivate() {
        this.isActive = false;
    },
    
    /**
     * Launch single firework
     */
    launchFirework() {
        const x = Utils.random(this.canvas.width * 0.2, this.canvas.width * 0.8);
        const y = Utils.random(this.canvas.height * 0.2, this.canvas.height * 0.5);
        const color = Utils.randomColor();
        
        const fireworkParticles = ParticleSystem.createFirework(x, y, color);
        this.particles.push(...fireworkParticles);
        
        // Add blessing text
        this.addBlessing(x, y);
        
        this.fireworkCount++;
        this.checkTransition();
        
        Utils.debug('Firework launched');
    },
    
    /**
     * Launch multiple fireworks
     */
    launchMultipleFireworks(count) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.launchFirework();
            }, i * 200);
        }
    },
    
    /**
     * Launch big explosion
     */
    launchBigExplosion() {
        Utils.debug('Big explosion!');
        
        // Create multiple fireworks across the screen
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                const x = Utils.random(this.canvas.width * 0.1, this.canvas.width * 0.9);
                const y = Utils.random(this.canvas.height * 0.1, this.canvas.height * 0.6);
                const color = Utils.randomColor();
                
                const fireworkParticles = ParticleSystem.createFirework(x, y, color);
                this.particles.push(...fireworkParticles);
                
                // Add blessing
                this.addBlessing(x, y);
            }, i * 100);
        }
        
        this.fireworkCount += 10;
        this.checkTransition();
    },
    
    /**
     * Add blessing text
     */
    addBlessing(x, y) {
        const blessing = this.blessings[Utils.randomInt(0, this.blessings.length - 1)];
        const element = document.createElement('div');
        element.className = 'blessing-item';
        element.textContent = blessing;
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.color = Utils.randomColor();
        
        document.getElementById('blessing-text').appendChild(element);
        
        // Remove after animation
        setTimeout(() => {
            element.remove();
        }, 3000);
    },
    
    /**
     * Check if should transition
     */
    checkTransition() {
        if (this.fireworkCount >= 15) {
            this.transitionTimer++;
            if (this.transitionTimer > 120 && window.App) { // 2 seconds
                window.App.nextScene();
            }
        }
    },
    
    /**
     * Update scene
     */
    update() {
        if (!this.isActive) return;
        
        // Update particles with gravity
        this.particles = ParticleSystem.updateWithGravity(this.particles, 0.1);
        
        // Auto-launch fireworks occasionally
        if (Math.random() < 0.02 && this.fireworkCount < 20) {
            this.launchFirework();
        }
    },
    
    /**
     * Render scene
     */
    render() {
        if (!this.isActive) return;
        
        // Clear canvas with fade
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles with glow
        this.ctx.shadowBlur = 10;
        this.particles.forEach(particle => {
            this.ctx.shadowColor = particle.color;
            particle.draw(this.ctx);
        });
        this.ctx.shadowBlur = 0;
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
    module.exports = FireworksScene;
}
