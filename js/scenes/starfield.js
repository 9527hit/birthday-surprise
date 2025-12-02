/**
 * Scene 1: Starfield - Star particles that follow face and form heart on wave
 */

const StarfieldScene = {
    canvas: null,
    ctx: null,
    particles: [],
    isActive: false,
    heartFormed: false,
    transitionTimer: 0,
    
    /**
     * Initialize the scene
     */
    init() {
        this.canvas = document.getElementById('starfield-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Create star particles
        this.particles = ParticleSystem.createStarField(2000, this.canvas.width, this.canvas.height);
        
        // Listen for window resize
        window.addEventListener('resize', () => this.resize());
        
        Utils.debug('Starfield scene initialized');
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
        this.heartFormed = false;
        this.transitionTimer = 0;
        
        // Register gesture callback for waving
        CameraModule.on('wave', () => {
            if (this.isActive && !this.heartFormed) {
                this.formHeart();
            }
        });
        
        Utils.debug('Starfield scene activated');
    },
    
    /**
     * Deactivate scene
     */
    deactivate() {
        this.isActive = false;
    },
    
    /**
     * Form heart shape
     */
    formHeart() {
        this.heartFormed = true;
        ParticleSystem.formHeart(this.particles, this.canvas.width, this.canvas.height);
        Utils.debug('Heart formation triggered');
        
        // Transition to next scene after delay
        setTimeout(() => {
            if (this.isActive) {
                this.transitionTimer = 60; // 1 second at 60fps
            }
        }, 3000);
    },
    
    /**
     * Update scene
     */
    update() {
        if (!this.isActive) return;
        
        // Update particles
        if (this.heartFormed) {
            // Move particles to heart positions
            this.particles.forEach(particle => {
                particle.moveToTarget(0.05);
            });
            
            // Handle transition
            if (this.transitionTimer > 0) {
                this.transitionTimer--;
                if (this.transitionTimer === 0) {
                    // Trigger scene transition
                    if (window.App) {
                        window.App.nextScene();
                    }
                }
            }
        } else {
            // Follow face
            const facePosition = CameraModule.getFacePosition();
            ParticleSystem.updateStarFieldWithFace(
                this.particles,
                facePosition,
                this.canvas.width,
                this.canvas.height
            );
        }
    },
    
    /**
     * Render scene
     */
    render() {
        if (!this.isActive) return;
        
        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles
        ParticleSystem.drawParticles(this.ctx, this.particles);
        
        // Add glow effect for heart
        if (this.heartFormed) {
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#ff69b4';
            ParticleSystem.drawParticles(this.ctx, this.particles);
            this.ctx.shadowBlur = 0;
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
    module.exports = StarfieldScene;
}
