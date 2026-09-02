'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, X, Check, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../lib/language-context';

interface PhotoCaptureProps {
  onPhotoSelected: (base64: string | null) => void;
  initialPhotoUrl?: string | null;
  required?: boolean;
}

export function PhotoCapture({ onPhotoSelected, initialPhotoUrl, required = false }: PhotoCaptureProps) {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'IDLE' | 'CAMERA' | 'PREVIEW'>('IDLE');
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialPhotoUrl || null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (initialPhotoUrl) {
      setPhotoPreview(initialPhotoUrl);
      setMode('PREVIEW');
    }
  }, [initialPhotoUrl]);

  // Clean up camera stream when unmounting or stopping camera
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser or device.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
      setMode('CAMERA');
    } catch (err: any) {
      console.warn('Camera access failed:', err);
      setCameraError(err.message || 'Unable to access camera. Please upload an image file instead.');
      setMode('IDLE');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 480;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoPreview(dataUrl);
      setMode('PREVIEW');
      stopCamera();
      onPhotoSelected(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCameraError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCameraError('Image size must be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      setMode('PREVIEW');
      setCameraError(null);
      onPhotoSelected(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    stopCamera();
    setPhotoPreview(null);
    setMode('IDLE');
    setCameraError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onPhotoSelected(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          {t.fieldProfilePhoto || 'Profile Photo'}
          {required && <span className="text-rose-500">*</span>}
        </label>
        {photoPreview && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            <Check className="w-3 h-3" />
            {t.photoCaptured || 'Photo Ready'}
          </span>
        )}
      </div>

      {cameraError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Hidden elements for capture/upload */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* PREVIEW MODE */}
      {mode === 'PREVIEW' && photoPreview && (
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-emerald-300">
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md flex-shrink-0 bg-slate-200">
            <img src={photoPreview} alt="Applicant Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <p className="text-xs font-bold text-slate-800">Applicant Identity Photo Attached</p>
            <p className="text-[11px] text-slate-500">This photo will be verified by the admin desk during account approval.</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleRemovePhoto();
                  startCamera();
                }}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition"
              >
                <RefreshCw className="w-3 h-3" />
                {t.retakePhoto || 'Retake'}
              </button>
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl text-xs font-bold text-rose-700 transition"
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CAMERA ACTIVE MODE */}
      {mode === 'CAMERA' && (
        <div className="p-4 bg-slate-900 rounded-2xl border-2 border-emerald-400 text-center space-y-3">
          <div className="relative mx-auto max-w-[320px] aspect-[4/3] rounded-xl overflow-hidden bg-black shadow-inner">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={takeSnapshot}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow transition"
            >
              <Camera className="w-3.5 h-3.5" />
              {t.takePhoto || 'Capture Photo'}
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                setMode('IDLE');
              }}
              className="inline-flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* IDLE SELECTION MODE */}
      {mode === 'IDLE' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={startCamera}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 rounded-2xl text-emerald-900 font-bold text-xs transition active:scale-[0.98]"
          >
            <Camera className="w-4 h-4 text-emerald-700" />
            <span>{t.cameraSnapshot || 'Take Live Photo'}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-2xl text-slate-800 font-bold text-xs transition active:scale-[0.98]"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>{t.uploadPhoto || 'Upload Photo File'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
