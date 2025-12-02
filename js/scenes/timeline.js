/**
 * Scene 3: Timeline - 3D tunnel with photos from important moments
 */

const TimelineScene = {
    canvas: null,
    ctx: null,
    isActive: false,
    photos: [],
    currentPhotoIndex: 0,
    zPosition: 0,
    targetZPosition: 0,
    hoveredPhoto: null,
    hoverTimer: 0,
    transitionTimer: 0,
    
    // Timeline data
    timelineData: [
        { date: '2020-01-15', text: '我们第一次相遇，你的笑容让我心动' },
        { date: '2020-03-20', text: '第一次牵手，感觉世界都变得温暖' },
        { date: '2020-06-01', text: '我们一起看的第一场电影' },
        { date: '2020-09-10', text: '你说愿意做我的女朋友' },
        { date: '2021-02-14', text: '第一个情人节，我送你玫瑰花' },
        { date: '2021-07-20', text: '我们的第一次旅行' },
        { date: '2022-01-01', text: '新年第一天，我们许下白头偕老的愿望' },
        { date: '2023-05-20', text: '我向你求婚，你含泪说我愿意' },
    ],
    
    /**
     * Initialize the scene
     */
    init() {
        this.canvas = document.getElementById('timeline-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize();
        
        // Initialize photo positions
        this.photos = this.timelineData.map((data, index) => ({
            ...data,
            z: index * 500 + 200,
            x: (index % 2 === 0) ? -200 : 200,
            y: 0,
            scale: 1
        }));
        
        // Listen for window resize
        window.addEventListener('resize', () => this.resize());
        
        Utils.debug('Timeline scene initialized');
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
        this.zPosition = 0;
        this.targetZPosition = 0;
        this.hoveredPhoto = null;
        this.hoverTimer = 0;
        
        Utils.debug('Timeline scene activated');
    },
    
    /**
     * Deactivate scene
     */
    deactivate() {
        this.isActive = false;
    },
    
    /**
     * Update scene
     */
    update() {
        if (!this.isActive) return;
        
        // Get distance from camera to control movement
        const distance = CameraModule.getDistanceFromCamera();
        
        // Map distance to z position (closer = move forward, farther = move back)
        if (distance > 0.25) {
            this.targetZPosition += 10; // Move forward
        } else if (distance < 0.15) {
            this.targetZPosition -= 10; // Move backward
        }
        
        // Clamp z position
        this.targetZPosition = Utils.clamp(this.targetZPosition, 0, (this.photos.length - 1) * 500);
        
        // Smooth z position movement
        this.zPosition += (this.targetZPosition - this.zPosition) * 0.1;
        
        // Check for hovered photo
        this.checkHoveredPhoto();
        
        // Check if reached the end
        if (this.zPosition > (this.photos.length - 2) * 500) {
            this.transitionTimer++;
            if (this.transitionTimer > 180 && window.App) { // 3 seconds
                window.App.nextScene();
            }
        }
    },
    
    /**
     * Check which photo is being looked at
     */
    checkHoveredPhoto() {
        // Find photo closest to camera
        let closestPhoto = null;
        let minDistance = Infinity;
        
        this.photos.forEach((photo, index) => {
            const distance = Math.abs(photo.z - this.zPosition);
            if (distance < minDistance && distance < 300) {
                minDistance = distance;
                closestPhoto = photo;
            }
        });
        
        if (closestPhoto === this.hoveredPhoto) {
            this.hoverTimer++;
            
            // Show details after 3 seconds (180 frames)
            if (this.hoverTimer > 180) {
                this.showPhotoDetails(closestPhoto);
            }
        } else {
            this.hoveredPhoto = closestPhoto;
            this.hoverTimer = 0;
            this.hidePhotoDetails();
        }
    },
    
    /**
     * Show photo details
     */
    showPhotoDetails(photo) {
        const dateElement = document.getElementById('timeline-date');
        const textElement = document.getElementById('timeline-text');
        const infoElement = document.querySelector('.timeline-info');
        
        if (dateElement && textElement && infoElement) {
            dateElement.textContent = photo.date;
            textElement.textContent = photo.text;
            infoElement.classList.add('active');
        }
    },
    
    /**
     * Hide photo details
     */
    hidePhotoDetails() {
        const infoElement = document.querySelector('.timeline-info');
        if (infoElement) {
            infoElement.classList.remove('active');
        }
    },
    
    /**
     * Render scene
     */
    render() {
        if (!this.isActive) return;
        
        // Clear canvas with gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#001a33');
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw tunnel effect
        this.drawTunnel();
        
        // Draw photos
        this.drawPhotos();
    },
    
    /**
     * Draw tunnel walls
     */
    drawTunnel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Draw perspective lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const startX = centerX + Math.cos(angle) * 100;
            const startY = centerY + Math.sin(angle) * 100;
            const endX = centerX + Math.cos(angle) * 500;
            const endY = centerY + Math.sin(angle) * 500;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.stroke();
        }
        
        // Draw depth rings
        for (let z = 0; z < 3000; z += 200) {
            const relZ = z - (this.zPosition % 200);
            if (relZ < 0 || relZ > 2000) continue;
            
            const scale = 500 / (relZ + 500);
            const radius = 300 * scale;
            
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `rgba(100, 150, 255, ${0.2 * scale})`;
            this.ctx.stroke();
        }
    },
    
    /**
     * Draw photos in 3D space
     */
    drawPhotos() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Sort photos by distance (far to near)
        const sortedPhotos = [...this.photos].sort((a, b) => {
            return (b.z - this.zPosition) - (a.z - this.zPosition);
        });
        
        sortedPhotos.forEach(photo => {
            const relZ = photo.z - this.zPosition;
            
            if (relZ < 50 || relZ > 2000) return; // Don't draw if too close or far
            
            // Calculate perspective
            const scale = 500 / (relZ + 500);
            const screenX = centerX + photo.x * scale;
            const screenY = centerY + photo.y * scale;
            const size = 200 * scale;
            
            // Draw photo placeholder
            this.ctx.save();
            
            // Highlight hovered photo
            if (photo === this.hoveredPhoto) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#ffd700';
            }
            
            this.ctx.globalAlpha = Math.min(1, scale * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
            
            // Draw border
            this.ctx.strokeStyle = photo === this.hoveredPhoto ? '#ffd700' : '#666';
            this.ctx.lineWidth = 3 * scale;
            this.ctx.strokeRect(screenX - size / 2, screenY - size / 2, size, size);
            
            // Draw date
            this.ctx.fillStyle = '#ffd700';
            this.ctx.font = `${16 * scale}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText(photo.date, screenX, screenY + size / 2 + 30 * scale);
            
            this.ctx.restore();
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
    module.exports = TimelineScene;
}
