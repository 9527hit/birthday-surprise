/**
 * Utility functions for the birthday surprise application
 */

const Utils = {
    /**
     * Calculate distance between two points
     */
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },

    /**
     * Linear interpolation
     */
    lerp(start, end, t) {
        return start + (end - start) * t;
    },

    /**
     * Map value from one range to another
     */
    map(value, inMin, inMax, outMin, outMax) {
        return outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
    },

    /**
     * Clamp value between min and max
     */
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },

    /**
     * Random number between min and max
     */
    random(min, max) {
        return Math.random() * (max - min) + min;
    },

    /**
     * Random integer between min and max (inclusive)
     */
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    /**
     * Random color in HSL format
     */
    randomColor(hueMin = 0, hueMax = 360) {
        const hue = this.randomInt(hueMin, hueMax);
        return `hsl(${hue}, 70%, 60%)`;
    },

    /**
     * Convert degrees to radians
     */
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Convert radians to degrees
     */
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },

    /**
     * Ease in-out function
     */
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    /**
     * Ease out function
     */
    easeOut(t) {
        return t * (2 - t);
    },

    /**
     * Create falling elements (snow/petals)
     */
    createFallingElements(container, count, type = 'snow') {
        const symbols = type === 'snow' ? ['❄', '❅', '❆'] : ['🌸', '🌺', '🌼', '🌻'];
        
        for (let i = 0; i < count; i++) {
            const element = document.createElement('div');
            element.className = type === 'snow' ? 'snowflake' : 'petal';
            element.textContent = symbols[this.randomInt(0, symbols.length - 1)];
            element.style.left = `${this.random(0, 100)}%`;
            element.style.animationDuration = `${this.random(5, 15)}s`;
            element.style.animationDelay = `${this.random(0, 5)}s`;
            element.style.opacity = this.random(0.3, 1);
            element.style.fontSize = `${this.randomInt(15, 30)}px`;
            container.appendChild(element);
        }
    },

    /**
     * Remove all falling elements
     */
    clearFallingElements(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    },

    /**
     * Create heart shape points
     */
    createHeartShape(centerX, centerY, size) {
        const points = [];
        const steps = 100;
        
        for (let i = 0; i < steps; i++) {
            const t = (i / steps) * Math.PI * 2;
            const x = centerX + size * 16 * Math.pow(Math.sin(t), 3);
            const y = centerY - size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
            points.push({ x, y });
        }
        
        return points;
    },

    /**
     * Sample image pixels for particle effect
     */
    sampleImagePixels(image, canvas, ctx, sampleRate = 5) {
        const width = image.width;
        const height = image.height;
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = [];
        
        for (let y = 0; y < height; y += sampleRate) {
            for (let x = 0; x < width; x += sampleRate) {
                const index = (y * width + x) * 4;
                const r = imageData.data[index];
                const g = imageData.data[index + 1];
                const b = imageData.data[index + 2];
                const a = imageData.data[index + 3];
                
                if (a > 128) { // Only include visible pixels
                    pixels.push({
                        x: x,
                        y: y,
                        r: r,
                        g: g,
                        b: b,
                        a: a
                    });
                }
            }
        }
        
        return pixels;
    },

    /**
     * Load image from path
     */
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    },

    /**
     * Format date to Chinese format
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}年${month}月${day}日`;
    },

    /**
     * Debug log helper
     */
    debug(message, data = null) {
        const debugPanel = document.getElementById('debug-info');
        if (debugPanel) {
            const time = new Date().toLocaleTimeString();
            const logEntry = data 
                ? `[${time}] ${message}: ${JSON.stringify(data)}`
                : `[${time}] ${message}`;
            debugPanel.innerHTML = logEntry + '<br>' + debugPanel.innerHTML;
            
            // Keep only last 10 entries
            const entries = debugPanel.innerHTML.split('<br>');
            if (entries.length > 10) {
                debugPanel.innerHTML = entries.slice(0, 10).join('<br>');
            }
        }
        console.log(message, data);
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Request animation frame with fallback
     */
    requestAnimFrame() {
        return (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function(callback) {
                window.setTimeout(callback, 1000 / 60);
            }
        ).bind(window);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}
