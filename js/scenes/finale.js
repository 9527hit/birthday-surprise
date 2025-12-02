/**
 * Scene 6: Finale - Final confession with name, heart and falling petals
 */

const FinaleScene = {
    canvas: null,
    ctx: null,
    isActive: false,
    particles: [],
    nameParticles: [],
    petalContainer: null,
    musicStarted: false,
    animationPhase: 0,
    
    /**
     * Initialize the scene
     */
    init() {
        this.canvas = document.getElementById('finale-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Listen for window resize
        window.addEventListener('resize', () => this.resize());
        
        Utils.debug('Finale scene initialized');
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
        this.animationPhase = 0;
        this.particles = [];
        this.nameParticles = [];
        
        // Show content elements with animation
        setTimeout(() => this.showName(), 500);
        setTimeout(() => this.startPetals(), 2000);
        setTimeout(() => this.showPhotos(), 4000);
        
        // Play background music if available
        this.playMusic();
        
        Utils.debug('Finale scene activated');
    },
    
    /**
     * Deactivate scene
     */
    deactivate() {
        this.isActive = false;
        this.clearPetals();
    },
    
    /**
     * Show name with particle effect
     */
    showName() {
        const nameElement = document.getElementById('finale-name');
        if (nameElement) {
            nameElement.textContent = '亲爱的'; // Customize with actual name
            nameElement.style.opacity = '1';
        }
        
        // Create name particle effect
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2 - 100;
        
        this.nameParticles = ParticleSystem.createTextParticles('亲爱的', centerX, centerY, 72);
        
        Utils.debug('Name displayed');
    },
    
    /**
     * Start falling petals
     */
    startPetals() {
        this.petalContainer = document.createElement('div');
        this.petalContainer.className = 'petal-container';
        document.body.appendChild(this.petalContainer);
        
        // Create falling petals
        Utils.createFallingElements(this.petalContainer, 50, 'petal');
        
        Utils.debug('Petals started');
    },
    
    /**
     * Clear petals
     */
    clearPetals() {
        if (this.petalContainer) {
            this.petalContainer.remove();
            this.petalContainer = null;
        }
    },
    
    /**
     * Show photo wall again
     */
    showPhotos() {
        // Create floating photo particles
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 * i) / 30;
            const radius = Utils.random(200, 400);
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            this.particles.push(new PhotoParticle(
                x, y,
                { 
                    r: Utils.randomInt(150, 255), 
                    g: Utils.randomInt(150, 255), 
                    b: Utils.randomInt(200, 255) 
                },
                {
                    size: Utils.random(20, 40),
                    vx: Math.cos(angle) * 0.2,
                    vy: Math.sin(angle) * 0.2,
                    life: Infinity,
                    maxLife: Infinity,
                    alpha: 0.8
                }
            ));
        }
        
        Utils.debug('Photos reappeared');
    },
    
    /**
     * Play background music
     */
    playMusic() {
        // Try to play audio if available
        const audio = document.getElementById('background-music');
        if (audio) {
            audio.play().catch(err => {
                Utils.debug('Audio playback failed', err.message);
            });
        }
    },
    
    /**
     * Update scene
     */
    update() {
        if (!this.isActive) return;
        
        this.animationPhase += 0.01;
        
        // Update floating particles
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Add orbital motion
            const centerX = this.canvas.width / 2;
            const centerY = this.canvas.height / 2;
            const dx = centerX - particle.x;
            const dy = centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                particle.vx += (dx / distance) * 0.01;
                particle.vy += (dy / distance) * 0.01;
            }
            
            // Apply friction
            particle.vx *= 0.99;
            particle.vy *= 0.99;
            
            // Wrap around
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
        });
    },
    
    /**
     * Render scene
     */
    render() {
        if (!this.isActive) return;
        
        // Create gradient background
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, '#1a0033');
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sparkle effect
        this.drawSparkles();
        
        // Draw particles
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#fff';
        ParticleSystem.drawParticles(this.ctx, this.particles);
        this.ctx.shadowBlur = 0;
        
        // Draw name particles with shimmer
        if (this.nameParticles.length > 0) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.3 + Math.sin(this.animationPhase * 2) * 0.2;
            ParticleSystem.drawParticles(this.ctx, this.nameParticles);
            this.ctx.restore();
        }
        
        // Draw heart particles
        this.drawHeartParticles();
    },
    
    /**
     * Draw sparkle effect
     */
    drawSparkles() {
        const sparkleCount = 50;
        for (let i = 0; i < sparkleCount; i++) {
            const x = (Math.sin(this.animationPhase * 2 + i) + 1) * this.canvas.width / 2;
            const y = (Math.cos(this.animationPhase * 1.5 + i * 2) + 1) * this.canvas.height / 2;
            const size = Math.sin(this.animationPhase * 5 + i) * 2 + 2;
            const alpha = Math.sin(this.animationPhase * 3 + i) * 0.5 + 0.5;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    },
    
    /**
     * Draw heart particles
     */
    drawHeartParticles() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Create pulsing heart effect
        const scale = 1 + Math.sin(this.animationPhase * 3) * 0.1;
        const heartPoints = Utils.createHeartShape(centerX, centerY, 5 * scale);
        
        heartPoints.forEach((point, index) => {
            if (index % 3 === 0) { // Draw every 3rd point for performance
                const alpha = Math.sin(this.animationPhase * 2 + index * 0.1) * 0.3 + 0.5;
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = '#ff69b4';
                this.ctx.beginPath();
                this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        });
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
    module.exports = FinaleScene;
}
