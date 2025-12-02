/**
 * Camera and Gesture Recognition Module
 * Handles webcam access and gesture/pose detection using TensorFlow.js
 */

const CameraModule = {
    video: null,
    canvas: null,
    ctx: null,
    handposeModel: null,
    posenetModel: null,
    facemeshModel: null,
    isInitialized: false,
    currentGesture: null,
    callbacks: {},
    
    // Tracking states
    facePosition: { x: 0.5, y: 0.5, size: 0 },
    handPositions: [],
    poseKeypoints: [],
    mouthOpen: false,
    
    /**
     * Initialize camera and models
     */
    async init() {
        try {
            this.video = document.getElementById('camera-feed');
            this.canvas = document.getElementById('camera-canvas');
            this.ctx = this.canvas.getContext('2d');
            
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: false
            });
            
            this.video.srcObject = stream;
            await this.video.play();
            
            // Set canvas size
            this.canvas.width = this.video.videoWidth;
            this.canvas.height = this.video.videoHeight;
            
            Utils.debug('Camera initialized');
            
            // Load models
            await this.loadModels();
            
            this.isInitialized = true;
            this.startDetection();
            
            return true;
        } catch (error) {
            console.error('Camera initialization failed:', error);
            Utils.debug('Camera error', error.message);
            return false;
        }
    },
    
    /**
     * Load TensorFlow models
     */
    async loadModels() {
        try {
            // Load handpose model
            Utils.debug('Loading handpose model...');
            this.handposeModel = await handpose.load();
            
            // Load posenet model
            Utils.debug('Loading posenet model...');
            this.posenetModel = await posenet.load({
                architecture: 'MobileNetV1',
                outputStride: 16,
                inputResolution: { width: 640, height: 480 },
                multiplier: 0.75
            });
            
            // Load facemesh model
            Utils.debug('Loading facemesh model...');
            this.facemeshModel = await facemesh.load();
            
            Utils.debug('All models loaded successfully');
        } catch (error) {
            console.error('Model loading failed:', error);
            Utils.debug('Model loading error', error.message);
        }
    },
    
    /**
     * Start continuous detection
     */
    startDetection() {
        const detect = async () => {
            if (!this.isInitialized) return;
            
            try {
                // Draw video frame to canvas
                this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
                
                // Run detections in parallel
                const [hands, pose, face] = await Promise.all([
                    this.detectHands(),
                    this.detectPose(),
                    this.detectFace()
                ]);
                
                // Update tracking states
                this.handPositions = hands || [];
                this.poseKeypoints = pose ? pose.keypoints : [];
                
                // Detect gestures
                this.detectGestures();
                
            } catch (error) {
                // Silently handle detection errors
            }
            
            requestAnimationFrame(detect);
        };
        
        detect();
    },
    
    /**
     * Detect hands
     */
    async detectHands() {
        if (!this.handposeModel) return null;
        
        try {
            const predictions = await this.handposeModel.estimateHands(this.video);
            return predictions;
        } catch (error) {
            return null;
        }
    },
    
    /**
     * Detect pose
     */
    async detectPose() {
        if (!this.posenetModel) return null;
        
        try {
            const pose = await this.posenetModel.estimateSinglePose(this.video);
            return pose;
        } catch (error) {
            return null;
        }
    },
    
    /**
     * Detect face
     */
    async detectFace() {
        if (!this.facemeshModel) return null;
        
        try {
            const predictions = await this.facemeshModel.estimateFaces(this.video);
            if (predictions.length > 0) {
                const face = predictions[0];
                
                // Calculate face center and size
                const bounds = face.boundingBox;
                this.facePosition = {
                    x: (bounds.topLeft[0] + bounds.bottomRight[0]) / 2 / this.canvas.width,
                    y: (bounds.topLeft[1] + bounds.bottomRight[1]) / 2 / this.canvas.height,
                    size: (bounds.bottomRight[0] - bounds.topLeft[0]) / this.canvas.width
                };
                
                // Check if mouth is open (using specific keypoints)
                this.checkMouthOpen(face.scaledMesh);
                
                return face;
            }
        } catch (error) {
            return null;
        }
    },
    
    /**
     * Check if mouth is open
     */
    checkMouthOpen(mesh) {
        if (!mesh || mesh.length === 0) return;
        
        // Use specific facial landmarks for mouth
        // Upper lip: point 13, Lower lip: point 14
        const upperLip = mesh[13];
        const lowerLip = mesh[14];
        
        if (upperLip && lowerLip) {
            const distance = Math.abs(upperLip[1] - lowerLip[1]);
            this.mouthOpen = distance > 15; // Threshold for mouth open
        }
    },
    
    /**
     * Detect various gestures
     */
    detectGestures() {
        const prevGesture = this.currentGesture;
        
        // Detect waving
        if (this.detectWaving()) {
            this.currentGesture = 'wave';
        }
        // Detect arms spread
        else if (this.detectArmsSpread()) {
            this.currentGesture = 'arms_spread';
        }
        // Detect hands together
        else if (this.detectHandsTogether()) {
            this.currentGesture = 'hands_together';
        }
        // Detect heart gesture
        else if (this.detectHeartGesture()) {
            this.currentGesture = 'heart';
        }
        // Detect clapping
        else if (this.detectClapping()) {
            this.currentGesture = 'clap';
        }
        // Detect hands raised
        else if (this.detectHandsRaised()) {
            this.currentGesture = 'hands_raised';
        }
        // Detect stillness
        else if (this.detectStillness()) {
            this.currentGesture = 'still';
        }
        // Detect blowing (mouth open + forward movement)
        else if (this.detectBlowing()) {
            this.currentGesture = 'blow';
        }
        else {
            this.currentGesture = null;
        }
        
        // Trigger callback if gesture changed
        if (this.currentGesture !== prevGesture && this.currentGesture) {
            this.triggerCallback(this.currentGesture);
        }
    },
    
    /**
     * Detect waving gesture
     */
    detectWaving() {
        // Simple detection: hand moving left-right rapidly
        if (this.handPositions.length > 0) {
            // For simplicity, just check if hands are detected
            return this.handPositions.length >= 1;
        }
        return false;
    },
    
    /**
     * Detect arms spread gesture
     */
    detectArmsSpread() {
        if (this.poseKeypoints.length === 0) return false;
        
        const leftWrist = this.poseKeypoints.find(kp => kp.part === 'leftWrist');
        const rightWrist = this.poseKeypoints.find(kp => kp.part === 'rightWrist');
        const nose = this.poseKeypoints.find(kp => kp.part === 'nose');
        
        if (leftWrist && rightWrist && nose && 
            leftWrist.score > 0.5 && rightWrist.score > 0.5) {
            const distance = Math.abs(rightWrist.position.x - leftWrist.position.x);
            return distance > 300; // Arms spread wide
        }
        return false;
    },
    
    /**
     * Detect hands together gesture
     */
    detectHandsTogether() {
        if (this.handPositions.length >= 2) {
            const hand1 = this.handPositions[0];
            const hand2 = this.handPositions[1];
            
            const distance = Math.sqrt(
                Math.pow(hand1.boundingBox.topLeft[0] - hand2.boundingBox.topLeft[0], 2) +
                Math.pow(hand1.boundingBox.topLeft[1] - hand2.boundingBox.topLeft[1], 2)
            );
            
            return distance < 100; // Hands close together
        }
        return false;
    },
    
    /**
     * Detect heart gesture (hands forming heart shape)
     */
    detectHeartGesture() {
        if (this.handPositions.length >= 2) {
            // Simplified: detect two hands close together in upper part of screen
            const hand1 = this.handPositions[0];
            const hand2 = this.handPositions[1];
            
            const avgY = (hand1.boundingBox.topLeft[1] + hand2.boundingBox.topLeft[1]) / 2;
            return avgY < this.canvas.height * 0.5; // Hands in upper half
        }
        return false;
    },
    
    /**
     * Detect clapping gesture
     */
    detectClapping() {
        // Simplified: rapid hands together and apart
        return this.handPositions.length >= 2;
    },
    
    /**
     * Detect hands raised gesture
     */
    detectHandsRaised() {
        if (this.poseKeypoints.length === 0) return false;
        
        const leftWrist = this.poseKeypoints.find(kp => kp.part === 'leftWrist');
        const rightWrist = this.poseKeypoints.find(kp => kp.part === 'rightWrist');
        const nose = this.poseKeypoints.find(kp => kp.part === 'nose');
        
        if (leftWrist && rightWrist && nose &&
            leftWrist.score > 0.5 && rightWrist.score > 0.5 && nose.score > 0.5) {
            return leftWrist.position.y < nose.position.y && 
                   rightWrist.position.y < nose.position.y; // Both hands above head
        }
        return false;
    },
    
    /**
     * Detect stillness
     */
    detectStillness() {
        // Simplified: if we have pose but minimal movement
        return this.poseKeypoints.length > 0;
    },
    
    /**
     * Detect blowing gesture
     */
    detectBlowing() {
        return this.mouthOpen && this.facePosition.size > 0.2;
    },
    
    /**
     * Get distance from camera (based on face size)
     */
    getDistanceFromCamera() {
        return this.facePosition.size;
    },
    
    /**
     * Register callback for gesture
     */
    on(gesture, callback) {
        if (!this.callbacks[gesture]) {
            this.callbacks[gesture] = [];
        }
        this.callbacks[gesture].push(callback);
    },
    
    /**
     * Trigger callbacks for gesture
     */
    triggerCallback(gesture) {
        Utils.debug(`Gesture detected: ${gesture}`);
        if (this.callbacks[gesture]) {
            this.callbacks[gesture].forEach(cb => cb());
        }
    },
    
    /**
     * Get current face position for particle tracking
     */
    getFacePosition() {
        return this.facePosition;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CameraModule;
}
