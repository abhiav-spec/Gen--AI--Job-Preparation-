import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, CameraOff, AlertTriangle, ShieldCheck, 
  Smile, UserCheck, Eye, Activity, RefreshCcw
} from 'lucide-react';
import * as faceapi from '@vladmandic/face-api';
import { loadModels, detectFace, calculateConfidence } from '../../utils/faceDetection';

const VideoMonitor = ({ 
    onStatusUpdate, 
    isActive = true,
    isInterviewing = false, 
    onBehaviorLogged,
    onAutoEnd = null,
    onPermissionGranted = null
}) => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [permissionStatus, setPermissionStatus] = useState('pending'); // 'pending', 'granted', 'denied'
    
    const [detection, setDetection] = useState(null);
    const [confidenceScore, setConfidenceScore] = useState(0);
    const [behaviorLog, setBehaviorLog] = useState([]);
    const [warnings, setWarnings] = useState([]);

    // Timers for behavioral rules
    const faceMissingTimer = useRef(null);
    const cameraOffTimer = useRef(null);
    const [faceMissingTime, setFaceMissingTime] = useState(0); // in format of seconds
    const visionReadySinceRef = useRef(null);
    const faceDetectedOnceRef = useRef(false);

    // 1. Initialize models
    useEffect(() => {
        const init = async () => {
            try {
                await loadModels();
                setModelsLoaded(true);
            } catch (err) {
                console.error('[VideoMonitor] Model init failed:', err);
                setError('Failed to load neural vision models.');
            } finally {
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // 2. Access Camera
    const startCamera = async () => {
        if (!isActive) return;
        
        // Prevent multiple simultaneous starts
        if (streamRef.current) {
            console.log('[VideoMonitor] Camera already active, skipping start');
            return;
        }

        setPermissionStatus('pending');
        setError('');
        try {
            console.log('[VideoMonitor] Requesting media stream...');

            if (!window.isSecureContext) {
                throw new Error('Insecure Context: Camera access requires HTTPS or localhost. If testing on an IP, please enable the Chrome flag.');
            }

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('MediaDevices API not available. This usually happens on insecure connections (HTTP).');
            }

            const userStream = await navigator.mediaDevices.getUserMedia({ 
                video: { width: 640, height: 480, frameRate: { ideal: 15 } },
                audio: false 
            });
            
            // Check if isActive changed while we were waiting for permission
            if (!isActive) {
                console.log('[VideoMonitor] isActive became false during request, stopping stream');
                userStream.getTracks().forEach(track => track.stop());
                return;
            }

            setStream(userStream);
            streamRef.current = userStream;
            if (videoRef.current) {
                videoRef.current.srcObject = userStream;
            }
            setPermissionStatus('granted');
            if (onPermissionGranted) onPermissionGranted(true);
        } catch (err) {
            console.error('[VideoMonitor] Camera access error:', err);
            setPermissionStatus('denied');
            setError('Camera and microphone permission are mandatory for the AI interview.');
            if (onPermissionGranted) onPermissionGranted(false);
        }
    };

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log('[VideoMonitor] Stopped track:', track.kind);
            });
            streamRef.current = null;
        }
        setStream(null);
    }, []);

    useEffect(() => {
        if (isActive) {
            startCamera();
        } else {
            console.log('[VideoMonitor] isActive is false, calling stopCamera');
            stopCamera();
        }
        
        return () => {
            console.log('[VideoMonitor] Unmounting, stopping camera tracks...');
            // Stop whatever stream is in the ref at unmount time
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => {
                    track.stop();
                    console.log('[VideoMonitor] Stopped track on unmount:', track.kind);
                });
                streamRef.current = null;
            }
        };
    }, [isActive, stopCamera]);

    // 3. Main detection loop & Policy Enforcement
    useEffect(() => {
        const interval = setInterval(async () => {
            if (!isInterviewing) {
                setFaceMissingTime(0);
                visionReadySinceRef.current = null;
                faceDetectedOnceRef.current = false;
                return;
            }

            const videoReady = videoRef.current && videoRef.current.readyState >= 2;
            const visionReady = modelsLoaded && permissionStatus === 'granted' && !!stream && videoReady;

            if (visionReady && !visionReadySinceRef.current) {
                visionReadySinceRef.current = Date.now();
            }

            const warmupElapsed = visionReadySinceRef.current
                ? Date.now() - visionReadySinceRef.current
                : 0;
            const policyArmed = warmupElapsed >= 15000 || faceDetectedOnceRef.current;

            // Do not enforce face-missing policy until the camera and models are fully ready.
            if (!visionReady || !policyArmed) {
                setFaceMissingTime(0);
                setDetection(null);
                setConfidenceScore(0);
                if (onStatusUpdate) onStatusUpdate({ faceDetected: true, emotion: 'pending', confidenceScore: 0 });
                return;
            }

            // Case 1: Vision feed is active
            if (isActive && stream && videoRef.current) {
                const result = await detectFace(videoRef.current);
                setDetection(result);

                if (result) {
                    const score = calculateConfidence(result);
                    setConfidenceScore(score);
                    setFaceMissingTime(0);
                    faceDetectedOnceRef.current = true;

                    // emotion tracker
                    const expressions = result.expressions;
                    const dom = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
                    
                    if (onStatusUpdate) {
                        onStatusUpdate({ faceDetected: true, emotion: dom, confidenceScore: score });
                    }
                } else {
                    // Face not found in active stream
                    setFaceMissingTime(prev => prev + 0.5);
                    setConfidenceScore(prev => Math.max(0, prev - 5));
                    if (onStatusUpdate) onStatusUpdate({ faceDetected: false, emotion: 'unknown', confidenceScore: 0 });
                }
            } else {
                // Case 2: Vision feed is disabled or missing during interview
                setDetection(null);
                setFaceMissingTime(prev => prev + 0.5);
                setConfidenceScore(0);
                if (onStatusUpdate) onStatusUpdate({ faceDetected: false, emotion: 'disabled', confidenceScore: 0 });
            }
        }, 500);

        return () => clearInterval(interval);
    }, [modelsLoaded, permissionStatus, stream, isActive, isInterviewing, onStatusUpdate]);

    // 4. Rule checking
    useEffect(() => {
        if (faceMissingTime > 5 && isInterviewing) {
            const warningMsg = "Face not detected! Please stay centered in the frame.";
            if (!warnings.includes(warningMsg)) {
                setWarnings(prev => [...prev, warningMsg]);
                setBehaviorLog(prev => [...prev, { timestamp: new Date(), event: 'face_missing', duration: faceMissingTime }]);
            }
        }
        
           if (faceMissingTime > 20 && isInterviewing && onAutoEnd) {
             onAutoEnd("Disconnected from user due to face missing policy violations.");
        }
    }, [faceMissingTime, isInterviewing]);

    const getExpressionIcon = (expressions) => {
        if (!expressions) return <AlertTriangle className="text-[#94a3b8]" />;
        const dom = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
        switch(dom) {
            case 'happy': return <Smile className="text-[#22c55e]" />;
            case 'neutral': return <UserCheck className="text-[#5de6ff]" />;
            case 'sad': return <AlertTriangle className="text-yellow-500" />;
            case 'angry': return <AlertTriangle className="text-red-500" />;
            default: return <UserCheck className="text-[#5de6ff]" />;
        }
    };

    return (
        <div className="relative w-full h-full rounded-2xl overflow-hidden group">
            {/* Background State Layer */}
            {permissionStatus !== 'granted' && (
                <div className="absolute inset-0 bg-[#0c0c1d] flex flex-col items-center justify-center p-6 text-center z-20">
                    {permissionStatus === 'denied' ? (
                        <>
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4">
                                <CameraOff className="text-red-400" size={32} />
                            </div>
                            <h3 className="font-space font-bold text-white mb-2">Access Denied</h3>
                            <p className="text-xs text-[#94a3b8] mb-6 max-w-xs">{error}</p>
                            <button 
                                onClick={startCamera}
                                className="px-6 py-2.5 rounded-xl ai-gradient-bg text-[#0c0c1d] font-space font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                            >
                                <RefreshCcw size={14} /> Retry Permissions
                            </button>
                        </>
                    ) : (
                        <>
                             <div className="spinner mb-6" />
                             <h3 className="font-space font-bold text-white mb-2">Requesting Camera access</h3>
                             <p className="text-xs text-[#94a3b8]">Preparing your neural vision feed...</p>
                        </>
                    )}
                </div>
            )}

            {/* Video Feed */}
            <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover bg-black"
                style={{ filter: stream ? 'none' : 'grayscale(1) blur(10px)' }}
            />

            {/* Status Overlays */}
            <AnimatePresence>
                {stream && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"
                    >
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${detection ? 'bg-[#22c55e] shadow-[0_0_8px_#22c55e]' : 'bg-red-500 animate-pulse'}`} />
                                <span className="font-space font-bold text-[10px] uppercase tracking-wider text-white/90">
                                    {detection ? 'Vision Locked' : 'Vision Lost...'}
                                </span>
                            </div>
                            
                            {/* Confidence Score */}
                            <div className="flex items-center gap-2">
                                <div className="text-right">
                                    <span className="block text-[8px] uppercase tracking-widest text-[#94a3b8] font-bold">Confidence</span>
                                    <span className="block font-space font-bold text-xs text-[#5de6ff]">{Math.round(confidenceScore)}%</span>
                                </div>
                                <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                                     <motion.div 
                                        animate={{ width: `${confidenceScore}%` }}
                                        className="h-full ai-gradient-bg" 
                                     />
                                </div>
                            </div>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Live Landmarks Overlay (Subtle) */}
            {detection && (
                <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen">
                    {/* Just a symbolic scanning effect */}
                    <div className="absolute inset-0 border-2 border-[#5de6ff]/20 animate-pulse m-4 rounded-xl" />
                </div>
            )}

            {/* Prominent Warning Alert */}
            <AnimatePresence>
                {faceMissingTime > 3 && isInterviewing && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-red-900/60 backdrop-blur-sm"
                    >
                        <motion.div 
                           animate={{ scale: [1, 1.05, 1] }}
                           transition={{ repeat: Infinity, duration: 1 }}
                           className="bg-[#0c0c1d] border-2 border-red-500/50 p-6 rounded-[2rem] shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center max-w-[280px] w-full"
                        >
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 mx-auto mb-4">
                                <AlertTriangle className="text-red-500" size={32} />
                            </div>
                            <h3 className="font-space font-bold text-white text-lg mb-2 uppercase tracking-tighter">Vision Alert</h3>
                            <p className="text-xs text-[#94a3b8] mb-6 leading-relaxed">
                                {isActive ? "Face missing from vision feed." : "Camera feed has been disabled."}
                                <br />
                                <span className="text-red-400 font-bold mt-2 block">
                                   Interview will end in {Math.max(0, 10 - Math.floor(faceMissingTime))} seconds.
                                </span>
                            </p>
                            <div className="flex justify-center gap-1">
                               {[...Array(10)].map((_, i) => (
                                  <div 
                                     key={i} 
                                     className={`h-1.5 w-4 rounded-full transition-colors ${i < Math.floor(faceMissingTime) ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-white/10'}`} 
                                  />
                               ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading Models Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-[#0c0c1d]/90 flex flex-col items-center justify-center z-50">
                     <div className="w-10 h-10 border-2 border-[#5de6ff]/20 border-t-[#5de6ff] rounded-full animate-spin mb-4" />
                     <p className="font-space text-[10px] font-bold uppercase tracking-widest text-[#5de6ff]">Loading Neural Models</p>
                </div>
            )}
        </div>
    );
};

export default VideoMonitor;
