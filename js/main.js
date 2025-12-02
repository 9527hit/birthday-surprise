/**
 * Main Application Controller
 * Manages scene transitions and application state
 */

const App = {
    currentScene: -1, // -1 = loading
    scenes: [],
    sceneElements: [],
    isInitialized: false,
    
    /**
     * Initialize the application
     */
    async init() {
        Utils.debug('Initializing application...');
        
        // Show loading screen
        this.showLoading();
        
        // Initialize camera
        const cameraReady = await CameraModule.init();
        
        if (!cameraReady) {
            alert('无法访问摄像头。请确保已授予摄像头权限。');
            return;
        }
        
        // Initialize all scenes
        StarfieldScene.init();
        await PhotoWallScene.init();
        TimelineScene.init();
        FireworksScene.init();
        CandlesScene.init();
        FinaleScene.init();
        
        // Store scene references
        this.scenes = [
            StarfieldScene,
            PhotoWallScene,
            TimelineScene,
            FireworksScene,
            CandlesScene,
            FinaleScene
        ];
        
        // Get scene DOM elements
        this.sceneElements = [
            document.getElementById('scene-starfield'),
            document.getElementById('scene-photowall'),
            document.getElementById('scene-timeline'),
            document.getElementById('scene-fireworks'),
            document.getElementById('scene-candles'),
            document.getElementById('scene-finale')
        ];
        
        // Start animation loops for all scenes
        this.scenes.forEach(scene => {
            if (scene.animate) {
                scene.animate();
            }
        });
        
        this.isInitialized = true;
        
        // Hide loading and start first scene
        setTimeout(() => {
            this.hideLoading();
            this.nextScene();
        }, 1000);
        
        Utils.debug('Application initialized successfully');
    },
    
    /**
     * Show loading screen
     */
    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('active');
        }
    },
    
    /**
     * Hide loading screen
     */
    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('active');
        }
    },
    
    /**
     * Transition to next scene
     */
    nextScene() {
        if (!this.isInitialized) return;
        
        const nextSceneIndex = this.currentScene + 1;
        
        if (nextSceneIndex >= this.scenes.length) {
            Utils.debug('All scenes completed!');
            return;
        }
        
        this.transitionToScene(nextSceneIndex);
    },
    
    /**
     * Transition to specific scene
     */
    transitionToScene(sceneIndex) {
        if (sceneIndex < 0 || sceneIndex >= this.scenes.length) return;
        
        Utils.debug(`Transitioning to scene ${sceneIndex}`);
        
        // Deactivate current scene
        if (this.currentScene >= 0) {
            const currentScene = this.scenes[this.currentScene];
            const currentElement = this.sceneElements[this.currentScene];
            
            if (currentScene.deactivate) {
                currentScene.deactivate();
            }
            
            if (currentElement) {
                currentElement.classList.remove('active');
            }
            
            // Update progress indicator
            this.updateProgressIndicator(this.currentScene, 'completed');
        }
        
        // Activate new scene
        this.currentScene = sceneIndex;
        const newScene = this.scenes[sceneIndex];
        const newElement = this.sceneElements[sceneIndex];
        
        if (newElement) {
            newElement.classList.add('active');
        }
        
        if (newScene.activate) {
            newScene.activate();
        }
        
        // Update progress indicator
        this.updateProgressIndicator(sceneIndex, 'active');
        
        Utils.debug(`Scene ${sceneIndex} activated`);
    },
    
    /**
     * Update progress indicator
     */
    updateProgressIndicator(sceneIndex, state) {
        const dots = document.querySelectorAll('.progress-dot');
        if (dots[sceneIndex]) {
            dots[sceneIndex].classList.remove('active', 'completed');
            if (state) {
                dots[sceneIndex].classList.add(state);
            }
        }
    },
    
    /**
     * Go to specific scene (for testing/debugging)
     */
    goToScene(sceneIndex) {
        this.transitionToScene(sceneIndex);
    },
    
    /**
     * Reset application
     */
    reset() {
        this.currentScene = -1;
        
        // Reset all scenes
        this.scenes.forEach((scene, index) => {
            if (scene.deactivate) {
                scene.deactivate();
            }
            if (this.sceneElements[index]) {
                this.sceneElements[index].classList.remove('active');
            }
        });
        
        // Reset progress indicators
        document.querySelectorAll('.progress-dot').forEach(dot => {
            dot.classList.remove('active', 'completed');
        });
        
        // Restart from first scene
        setTimeout(() => {
            this.nextScene();
        }, 500);
        
        Utils.debug('Application reset');
    }
};

// Start application when page loads
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});

// Make App globally available for debugging
window.App = App;

// Keyboard shortcuts for debugging
document.addEventListener('keydown', (e) => {
    // Press number keys 1-6 to jump to scenes
    if (e.key >= '1' && e.key <= '6') {
        const sceneIndex = parseInt(e.key) - 1;
        App.goToScene(sceneIndex);
    }
    
    // Press 'R' to reset
    if (e.key === 'r' || e.key === 'R') {
        App.reset();
    }
    
    // Press 'N' for next scene
    if (e.key === 'n' || e.key === 'N') {
        App.nextScene();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
