
import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
    const [cameraActive, setCameraActive] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const startCamera = useCallback(async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            setStream(s);
            if (videoRef.current) {
                videoRef.current.srcObject = s;
            }
            setCameraActive(true);
        } catch (err) {
            console.error("Erro ao acessar câmera:", err);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setCameraActive(false);
    }, [stream]);

    const capturePhoto = useCallback(() => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0);
            const photo = canvas.toDataURL('image/png');
            setCapturedPhoto(photo);
            stopCamera();
            return photo;
        }
        return null;
    }, [stopCamera]);

    return {
        cameraActive,
        videoRef,
        capturedPhoto,
        setCapturedPhoto,
        startCamera,
        stopCamera,
        capturePhoto,
        setCameraActive
    };
};
