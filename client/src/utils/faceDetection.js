import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

/**
 * Loads the face-api models from the specified URL.
 */
export const loadModels = async () => {
    try {
        console.log('[FaceAPI] Loading models from:', MODEL_URL);
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        console.log('[FaceAPI] Models loaded successfully.');
    } catch (error) {
        console.error('[FaceAPI] Error loading models:', error);
        throw error;
    }
};

/**
 * Detects face, landmarks, and expressions from a video element.
 */
export const detectFace = async (videoElement) => {
    if (!videoElement || videoElement.paused || videoElement.ended) return null;

    try {
        const result = await faceapi.detectSingleFace(
            videoElement,
            new faceapi.TinyFaceDetectorOptions()
        )
            .withFaceLandmarks()
            .withFaceExpressions();

        return result;
    } catch (error) {
        console.warn('[FaceAPI] Detection failed:', error);
        return null;
    }
};

/**
 * Calculates a confidence score based on face presence, expressions, and landmark stability.
 */
export const calculateConfidence = (detection, history = []) => {
    if (!detection) return 0;

    let score = 50; // Base score

    // 1. Detection confidence
    score += detection.detection.score * 20;

    // 2. Emotion check (positive/neutral is better for formal interviews)
    const expressions = detection.expressions;
    if (expressions.neutral > 0.5) score += 10;
    if (expressions.happy > 0.3) score += 10;
    if (expressions.angry > 0.1 || expressions.sad > 0.1) score -= 15;

    // 3. Eye contact / Head position (simplified check using landmarks)
    // Calculating the center of the face and checking if it's looking mostly forward.
    const landmarks = detection.landmarks.positions;
    const leftEye = landmarks[36];
    const rightEye = landmarks[45];
    const nose = landmarks[30];

    // Simple heuristic: nose should be between eyes horizontally
    const midPointX = (leftEye.x + rightEye.x) / 2;
    const deviation = Math.abs(nose.x - midPointX);
    const eyeDistance = rightEye.x - leftEye.x;
    
    if (deviation < eyeDistance * 0.25) {
        score += 10; // Good eye contact/facing forward
    } else {
        score -= 5;
    }

    return Math.max(0, Math.min(100, score));
};
