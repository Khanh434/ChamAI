'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseCameraResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isStreaming: boolean;
  error: string | null;
  hasPermission: boolean | null;
  facingMode: 'environment' | 'user';
  hasTorch: boolean;
  isTorchOn: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
  toggleTorch: () => Promise<void>;
  captureFrame: () => string | null;
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsTorchOn(false);
  }, [stream]);

  const startCamera = useCallback(async () => {
    stopCamera();
    setError(null);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Thiết bị hoặc trình duyệt không hỗ trợ truy cập Camera');
      setHasPermission(false);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setHasPermission(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play().catch(() => {});
      }

      setIsStreaming(true);

      // Check if torch/flashlight capability is available
      const track = mediaStream.getVideoTracks()[0];
      if (track) {
        const capabilities = (track.getCapabilities?.() || {}) as { torch?: boolean };
        setHasTorch(Boolean(capabilities.torch));
      }
    } catch (err) {
      console.error('Camera access error:', err);
      const e = err as Error;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setError('Quyền truy cập Camera bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.');
        setHasPermission(false);
      } else {
        setError(`Lỗi mở Camera: ${e.message || 'Không thể khởi động camera'}`);
      }
      setIsStreaming(false);
    }
  }, [facingMode, stopCamera]);

  const switchCamera = useCallback(async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
  }, [facingMode]);

  const toggleTorch = useCallback(async () => {
    if (!stream || !hasTorch) return;
    const track = stream.getVideoTracks()[0];
    if (track && 'applyConstraints' in track) {
      try {
        const nextState = !isTorchOn;
        await track.applyConstraints({
          // @ts-expect-error advanced torch constraint
          advanced: [{ torch: nextState }],
        });
        setIsTorchOn(nextState);
      } catch (err) {
        console.error('Failed to toggle torch:', err);
      }
    }
  }, [stream, hasTorch, isTorchOn]);

  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !isStreaming) return null;

    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return null;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  }, [isStreaming]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return {
    videoRef,
    stream,
    isStreaming,
    error,
    hasPermission,
    facingMode,
    hasTorch,
    isTorchOn,
    startCamera,
    stopCamera,
    switchCamera,
    toggleTorch,
    captureFrame,
  };
}
