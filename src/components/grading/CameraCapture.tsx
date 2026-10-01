'use client';

import { useEffect, useRef } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { Camera, RefreshCw, Zap, ZapOff, Upload, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  activeSlotIndex: number;
  totalSlots: number;
}

export function CameraCapture({ onCapture, activeSlotIndex, totalSlots }: CameraCaptureProps) {
  const {
    videoRef,
    isStreaming,
    error,
    hasTorch,
    isTorchOn,
    startCamera,
    stopCamera,
    switchCamera,
    toggleTorch,
    captureFrame,
  } = useCamera();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = () => {
    const frame = captureFrame();
    if (frame) {
      onCapture(frame);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onCapture(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-slate-950 shadow-2xl">
      {/* Hidden file input for upload fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Viewfinder Video */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="h-full w-full object-cover"
        />

        {/* Framing Overlay Guide (Alignment Corners) */}
        <div className="pointer-events-none absolute inset-6 sm:inset-10 flex flex-col justify-between">
          <div className="flex justify-between">
            <div className="h-8 w-8 rounded-tl-xl border-t-4 border-l-4 border-blue-400/90 shadow-sm" />
            <div className="h-8 w-8 rounded-tr-xl border-t-4 border-r-4 border-blue-400/90 shadow-sm" />
          </div>

          <div className="flex items-center justify-center">
            <div className="rounded-full bg-slate-900/60 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md">
              Căn chỉnh phiếu thi vào giữa khung hình
            </div>
          </div>

          <div className="flex justify-between">
            <div className="h-8 w-8 rounded-bl-xl border-b-4 border-l-4 border-blue-400/90 shadow-sm" />
            <div className="h-8 w-8 rounded-br-xl border-b-4 border-r-4 border-blue-400/90 shadow-sm" />
          </div>
        </div>

        {/* Current Slot Overlay Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
          <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          <span>Đang chụp Trang {activeSlotIndex + 1}/{totalSlots}</span>
        </div>

        {/* Top Floating Controls */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {hasTorch && (
            <button
              type="button"
              onClick={toggleTorch}
              className={`rounded-full p-2.5 backdrop-blur transition ${
                isTorchOn ? 'bg-amber-500 text-white' : 'bg-slate-900/70 text-white hover:bg-slate-800'
              }`}
              title="Bật/Tắt Đèn Flash"
            >
              {isTorchOn ? <Zap className="h-4 w-4 fill-current" /> : <ZapOff className="h-4 w-4" />}
            </button>
          )}

          <button
            type="button"
            onClick={switchCamera}
            className="rounded-full bg-slate-900/70 p-2.5 text-white backdrop-blur transition hover:bg-slate-800"
            title="Đổi camera trước/sau"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Error / Permission fallback state */}
        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 p-6 text-center text-white">
            <AlertCircle className="h-10 w-10 text-amber-400 mb-3" />
            <p className="text-sm font-semibold max-w-xs">{error}</p>
            <p className="mt-2 text-xs text-slate-400 max-w-xs">
              Bạn có thể tải ảnh chụp trực tiếp từ thư viện ảnh thiết bị
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700"
            >
              <Upload className="h-4 w-4" />
              Chọn ảnh từ máy
            </button>
          </div>
        )}
      </div>

      {/* Bottom Shutter & Controls Bar */}
      <div className="flex items-center justify-between bg-slate-900 px-6 py-4">
        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
            <Upload className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-medium">Tải ảnh</span>
        </button>

        {/* Big Shutter Capture Button */}
        <button
          type="button"
          onClick={handleCapture}
          className="group relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-white/80 bg-blue-600 shadow-lg shadow-blue-500/40 transition hover:scale-105 active:scale-95"
          title="Chụp ảnh bài thi"
        >
          <div className="h-14 w-14 rounded-full bg-white transition group-active:scale-90" />
        </button>

        {/* Retry Camera trigger */}
        <button
          type="button"
          onClick={startCamera}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
            <Camera className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-medium">Làm mới</span>
        </button>
      </div>
    </div>
  );
}
