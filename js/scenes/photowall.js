/**
 * Scene 2: Photo Wall - Photos float like fireflies and respond to gestures
 */

const PhotoWallScene = {
    canvas: null,
    ctx: null,
    photoParticles: [],
    isActive: false,
    photos: [],
    currentPhotoIndex: 0,
    armsSpread: false,
    handsTogether: false,
    mergedPhoto: null,
    mergeProgress: 0,
    transitionTimer: 0,
    
    /**
     * Initialize the scene
     */
    async init() {
        this.canvas = document.getElementById('photowall-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Load sample photos
        this.photos = [
            'assets/photos/photo1.jpg',
            'assets/photos/photo2.jpg',
            'assets/photos/photo3.jpg',
            'assets/photos/photo4.jpg',
            'assets/photos/photo5.jpg'
        ];
        
        // Listen for window resize
        window.addEventListener('resize', () => this.resize());
        
        Utils.debug('Photo wall scene initialized');
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
    async activate() {
        this.isActive = true;
        this.armsSpread = false;
        this.handsTogether = false;
        this.mergeProgress = 0;
        
        // Create explosion effect from center
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Load and create photo particles
        await this.loadPhotoParticles();
        
        // Register gesture callbacks
        CameraModule.on('arms_spread', () => {
            if (this.isActive && !this.armsSpread) {
                this.spreadPhotos();
            }
        });
        
        CameraModule.on('hands_together', () => {
            if (this.isActive && this.armsSpread && !this.handsTogether) {
                this.mergePhotos();
            }
        });
        
        Utils.debug('Photo wall scene activated');
    },
    
    /**
     * Deactivate scene
     */
    deactivate() {
        this.isActive = false;
    },
    
    /**
     * Load photo particles
     */
    async loadPhotoParticles() {
        // Create floating particles from first photo
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Create simple particles that look like photo fragments
        for (let i = 0; i < 100; i++) {
            const angle = (Math.PI * 2 * i) / 100;
            const distance = Utils.random(50, 200);
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            this.photoParticles.push(new PhotoParticle(
                x, y,
                { r: Utils.randomInt(100, 255), g: Utils.randomInt(100, 255), b: Utils.randomInt(150, 255) },
                {
                    size: Utils.random(10, 20),
                    vx: Math.cos(angle) * 0.5,
                    vy: Math.sin(angle) * 0.5,
                    life: Infinity,
                    maxLife: Infinity
                }
            ));
        }
    },
    
    /**
     * Spread photos around user
     */
    spreadPhotos() {
        this.armsSpread = true;
        Utils.debug('Photos spreading around user');
        
        // Make particles orbit around center
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.photoParticles.forEach((particle, index) => {
            const angle = (Math.PI * 2 * index) / this.photoParticles.length;
            const radius = 300;
            particle.targetX = centerX + Math.cos(angle) * radius;
            particle.targetY = centerY + Math.sin(angle) * radius;
            particle.speed = 0.05;
        });
    },
    
    /**
     * Merge photos together
     */
    mergePhotos() {
        this.handsTogether = true;
        Utils.debug('Merging photos together');
        
        // Converge all particles to center
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.photoParticles.forEach(particle => {
            particle.targetX = centerX + Utils.random(-50, 50);
            particle.targetY = centerY + Utils.random(-50, 50);
            particle.speed = 0.08;
        });
        
        // Transition after merge
        setTimeout(() => {
            if (this.isActive) {
                this.transitionTimer = 60;
            }
        }, 3000);
    },
    
    /**
     * Update scene
     */
    update() {
        if (!this.isActive) return;
        
        // Update particles
        this.photoParticles.forEach(particle => {
            if (this.armsSpread || this.handsTogether) {
                particle.moveToTarget();
            } else {
                // Float like fireflies
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Add floating motion
                particle.x += Math.sin(Date.now() * 0.001 + particle.originalX) * 0.5;
                particle.y += Math.cos(Date.now() * 0.001 + particle.originalY) * 0.5;
                
                // Bounce off edges
                if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;
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
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles with glow
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#fff';
        ParticleSystem.drawParticles(this.ctx, this.photoParticles);
        this.ctx.shadowBlur = 0;
        
        // Draw merged photo if complete
        if (this.handsTogether && this.mergeProgress < 1) {
            this.mergeProgress += 0.02;
            
            if (this.mergeProgress >= 1) {
                // Draw a representation of merged photo
                const centerX = this.canvas.width / 2;
                const centerY = this.canvas.height / 2;
                this.ctx.save();
                this.ctx.globalAlpha = 0.8;
                this.ctx.fillStyle = '#fff';
                this.ctx.fillRect(centerX - 200, centerY - 150, 400, 300);
                this.ctx.strokeStyle = '#ffd700';
                this.ctx.lineWidth = 5;
                this.ctx.strokeRect(centerX - 200, centerY - 150, 400, 300);
                this.ctx.restore();
            }
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
    module.exports = PhotoWallScene;
}
