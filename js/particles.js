/**
 * Particle System for various effects
 */

class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || 0;
        this.vy = options.vy || 0;
        this.size = options.size || 2;
        this.color = options.color || '#ffffff';
        this.alpha = options.alpha || 1;
        this.life = options.life || 1;
        this.maxLife = options.maxLife || 1;
        this.targetX = options.targetX || x;
        this.targetY = options.targetY || y;
        this.speed = options.speed || 0.05;
        this.originalX = x;
        this.originalY = y;
    }
    
    update() {
        // Update position with velocity
        this.x += this.vx;
        this.y += this.vy;
        
        // Reduce life
        this.life -= 0.01;
        this.alpha = this.life / this.maxLife;
        
        return this.life > 0;
    }
    
    moveToTarget(speed = null) {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
            const moveSpeed = speed || this.speed;
            this.x += dx * moveSpeed;
            this.y += dy * moveSpeed;
        }
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class PhotoParticle extends Particle {
    constructor(x, y, imageData, options = {}) {
        super(x, y, options);
        this.imageData = imageData;
        this.rotation = 0;
        this.rotationSpeed = Utils.random(-0.02, 0.02);
        // Store original position for floating animation
        if (this.originalX === undefined) this.originalX = x;
        if (this.originalY === undefined) this.originalY = y;
    }
    
    update() {
        this.rotation += this.rotationSpeed;
        return super.update();
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = `rgba(${this.imageData.r}, ${this.imageData.g}, ${this.imageData.b}, ${this.alpha})`;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

const ParticleSystem = {
    /**
     * Create star field particles
     */
    createStarField(count, width, height) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle(
                Utils.random(0, width),
                Utils.random(0, height),
                {
                    vx: Utils.random(-0.5, 0.5),
                    vy: Utils.random(-0.5, 0.5),
                    size: Utils.random(1, 3),
                    alpha: Utils.random(0.3, 1),
                    life: Infinity,
                    maxLife: Infinity
                }
            ));
        }
        return particles;
    },
    
    /**
     * Update star field to follow face
     */
    updateStarFieldWithFace(particles, facePosition, width, height) {
        const faceX = facePosition.x * width;
        const faceY = facePosition.y * height;
        const attractionStrength = 0.001;
        
        particles.forEach(particle => {
            const dx = faceX - particle.x;
            const dy = faceY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                particle.vx += (dx / distance) * attractionStrength;
                particle.vy += (dy / distance) * attractionStrength;
            }
            
            // Apply friction
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Wrap around screen
            if (particle.x < 0) particle.x = width;
            if (particle.x > width) particle.x = 0;
            if (particle.y < 0) particle.y = height;
            if (particle.y > height) particle.y = 0;
        });
    },
    
    /**
     * Form particles into heart shape
     */
    formHeart(particles, width, height) {
        const centerX = width / 2;
        const centerY = height / 2;
        const heartPoints = Utils.createHeartShape(centerX, centerY, 8);
        
        particles.forEach((particle, index) => {
            const targetPoint = heartPoints[index % heartPoints.length];
            particle.targetX = targetPoint.x;
            particle.targetY = targetPoint.y;
            particle.speed = 0.05;
        });
    },
    
    /**
     * Create photo particles from image
     */
    async createPhotoParticles(imagePath, sampleRate = 5) {
        try {
            const image = await Utils.loadImage(imagePath);
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const pixels = Utils.sampleImagePixels(image, canvas, ctx, sampleRate);
            const particles = [];
            
            pixels.forEach(pixel => {
                particles.push(new PhotoParticle(
                    pixel.x,
                    pixel.y,
                    { r: pixel.r, g: pixel.g, b: pixel.b },
                    {
                        size: sampleRate,
                        vx: Utils.random(-2, 2),
                        vy: Utils.random(-2, 2),
                        life: Infinity,
                        maxLife: Infinity
                    }
                ));
            });
            
            return { particles, width: image.width, height: image.height };
        } catch (error) {
            Utils.debug('Error creating photo particles', error.message);
            return { particles: [], width: 0, height: 0 };
        }
    },
    
    /**
     * Create explosion effect
     */
    createExplosion(x, y, count = 50) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Utils.random(2, 8);
            particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Utils.random(2, 5),
                color: Utils.randomColor(),
                life: 1,
                maxLife: 1
            }));
        }
        return particles;
    },
    
    /**
     * Create firework particles
     */
    createFirework(x, y, color) {
        const particles = [];
        const count = Utils.randomInt(50, 100);
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Utils.random(1, 5);
            particles.push(new Particle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                size: Utils.random(2, 4),
                color: color || Utils.randomColor(),
                life: Utils.random(0.8, 1.2),
                maxLife: 1
            }));
        }
        return particles;
    },
    
    /**
     * Update particles with gravity
     */
    updateWithGravity(particles, gravity = 0.1) {
        return particles.filter(particle => {
            particle.vy += gravity;
            return particle.update();
        });
    },
    
    /**
     * Draw all particles
     */
    drawParticles(ctx, particles) {
        particles.forEach(particle => particle.draw(ctx));
    },
    
    /**
     * Create text particles
     */
    createTextParticles(text, x, y, size = 48) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        ctx.font = `${size}px Arial`;
        const metrics = ctx.measureText(text);
        
        canvas.width = metrics.width;
        canvas.height = size * 1.5;
        
        ctx.font = `${size}px Arial`;
        ctx.fillStyle = 'white';
        ctx.textBaseline = 'top';
        ctx.fillText(text, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const particles = [];
        
        for (let py = 0; py < canvas.height; py += 2) {
            for (let px = 0; px < canvas.width; px += 2) {
                const index = (py * canvas.width + px) * 4;
                const alpha = imageData.data[index + 3];
                
                if (alpha > 128) {
                    particles.push(new Particle(
                        x + px - canvas.width / 2,
                        y + py - canvas.height / 2,
                        {
                            size: 2,
                            alpha: 1,
                            life: Infinity,
                            maxLife: Infinity
                        }
                    ));
                }
            }
        }
        
        return particles;
    },
    
    /**
     * Animate particles to positions
     */
    animateToPositions(particles, positions, speed = 0.05) {
        particles.forEach((particle, index) => {
            if (positions[index]) {
                particle.targetX = positions[index].x;
                particle.targetY = positions[index].y;
                particle.speed = speed;
                particle.moveToTarget();
            }
        });
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Particle, PhotoParticle, ParticleSystem };
}
