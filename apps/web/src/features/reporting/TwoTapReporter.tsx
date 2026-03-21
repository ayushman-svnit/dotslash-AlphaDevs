'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Send, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { saveReportOffline } from '@/lib/cache/offlineStore';

const ANIMALS = [
  { id: 'Elephant', emoji: '🐘' },
  { id: 'Tiger', emoji: '🐅' },
  { id: 'Leopard', emoji: '🐆' },
  { id: 'Deer', emoji: '🦌' },
  { id: 'Roadkill', emoji: '🦴' },
  { id: 'Other', emoji: '🐾' },
];

type Status = 'idle' | 'uploading' | 'submitting' | 'verified' | 'unverified' | 'error';

export const TwoTapReporter = ({ userId = 'user-123' }: { userId?: string }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [speedKmh, setSpeedKmh] = useState(0);
  const [heading, setHeading] = useState<number | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [aiResult, setAiResult] = useState<{ label: string; confidence: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDriverMode = speedKmh > 20;

  // GPS Tracking
  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        if (pos.coords.speed) setSpeedKmh(pos.coords.speed * 3.6);
      },
      (err) => {
        // PERMISSION_DENIED = 1, POSITION_UNAVAILABLE = 2, TIMEOUT = 3
        if (err.code !== 1) console.warn('Geolocation unavailable:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Compass
  useEffect(() => {
    const handle = (e: DeviceOrientationEvent) => {
      const h = (e as any).webkitCompassHeading || e.alpha;
      if (h !== null) setHeading(h);
    };
    window.addEventListener('deviceorientation', handle);
    return () => window.removeEventListener('deviceorientation', handle);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!coords) {
      setStatusMsg('Waiting for GPS signal...');
      setStatus('error');
      return;
    }

    try {
      // 1. Try image upload (non-blocking — skip if it fails)
      let imageUrl: string | undefined;
      if (imageFile) {
        setStatus('uploading');
        setStatusMsg('Uploading photo...');
        try {
          const formData = new FormData();
          formData.append('file', imageFile);
          const uploadRes = await Promise.race([
            fetch('/api/upload', { method: 'POST', body: formData }),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
          ]);
          if (uploadRes.ok) {
            const d = await uploadRes.json();
            imageUrl = d.url;
          }
        } catch {
          // silently skip — backend uses fallback image for AI
        }
      }

      // 2. Submit report
      setStatus('submitting');
      setStatusMsg('AI is verifying your sighting...');

      const payload = {
        user_id: userId,
        lat: coords.lat,
        lng: coords.lng,
        species_id: selectedAnimal || 'Other',
        heading_deg: heading ?? undefined,
        speed_kmh: speedKmh,
        image_url: imageUrl,
        description: description || 'No additional details provided.',
      };

      if (!navigator.onLine) {
        await saveReportOffline(payload);
        setStatus('unverified');
        setStatusMsg('Saved offline. Will sync when connected.');
        return;
      }

      const resp = await fetch('http://localhost:8000/api/v1/report/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok) throw new Error(data.detail || 'Server error');

      // 3. Show AI result
      setAiResult({ label: data.ai_label, confidence: data.ai_confidence });

      if (data.status === 'Verified (AI)' || data.status === 'Verified (Fallback)') {
        setStatus('verified');
        const msg = data.status === 'Verified (Fallback)' 
            ? `Report received via Emergency Fallback! Officer has been notified.`
            : `AI Verified! Officer has been notified via SMS.`;
        setStatusMsg(msg);
      } else if (data.status === 'Verified (Existing)') {
        setStatus('verified');
        setStatusMsg(data.message || 'Already verified in this area. Notification previously sent.');
      } else {
        setStatus('unverified');
        setStatusMsg(`Report received. AI confidence: ${(data.ai_confidence * 100).toFixed(0)}%`);
      }
    } catch (err: any) {
      setStatus('error');
      setStatusMsg(err.message || 'Submission failed.');
    }
  };

  const reset = () => {
    setSelectedAnimal(null);
    setDescription('');
    setImageFile(null);
    setImagePreview(null);
    setStatus('idle');
    setStatusMsg('');
    setAiResult(null);
  };

  const isLoading = status === 'uploading' || status === 'submitting';

  return (
    <div className={`transition-all duration-300 w-full ${
      isDriverMode
        ? 'bg-slate-900 text-white rounded-t-3xl p-6 absolute bottom-0 left-0 right-0 z-40 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'
        : 'bg-white rounded-2xl shadow-lg border border-slate-200 p-5'
    }`}>

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-bold flex items-center gap-2 ${isDriverMode ? 'text-2xl text-amber-400' : 'text-lg text-slate-800'}`}>
          {isDriverMode && <AlertTriangle className="animate-pulse text-amber-400" size={22} />}
          {isDriverMode ? 'DRIVER MODE' : '🐾 Report a Sighting'}
        </h3>
        {coords ? (
          <span className="text-[10px] font-black text-white bg-emerald-600 px-2 py-1 rounded flex items-center gap-1 animate-pulse uppercase tracking-tighter">
            <MapPin size={10} /> Live Location Sharing Active
          </span>
        ) : (
          <span className="text-xs text-slate-400">Acquiring Live GPS...</span>
        )}
      </div>

      {/* Done state */}
      {(status === 'verified' || status === 'unverified') ? (
        <div className={`rounded-xl p-4 text-center space-y-2 ${status === 'verified' ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
          {status === 'verified'
            ? <CheckCircle className="mx-auto text-emerald-500" size={36} />
            : <AlertTriangle className="mx-auto text-amber-500" size={36} />}
          <p className={`font-bold text-sm ${status === 'verified' ? 'text-emerald-700' : 'text-amber-700'}`}>{statusMsg}</p>
          {aiResult && (
            <p className="text-xs text-slate-500">
              AI detected: <b>{aiResult.label}</b> ({(aiResult.confidence * 100).toFixed(0)}% confidence)
            </p>
          )}
          <button onClick={reset} className="text-xs underline text-slate-500 mt-2">Submit another report</button>
        </div>
      ) : (
        <div className="space-y-4">

          {/* Step 1 — Animal (optional hint for fallback label) */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">1 · Animal Type <span className="normal-case font-normal text-slate-400">(optional)</span></p>
            <div className="flex flex-wrap gap-1.5">
              {ANIMALS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelectedAnimal(selectedAnimal === a.id ? null : a.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    selectedAnimal === a.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {a.emoji} {a.id}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Photo Upload */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">2 · Upload Photo (Improves AI Accuracy)</p>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} className="hidden" />
            {imagePreview ? (
              <div className="relative">
                <img src={imagePreview} alt="preview" className="w-full h-32 object-cover rounded-xl border border-slate-200" />
                <button onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow">
                  <XCircle size={18} className="text-red-400" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 rounded-xl py-5 flex flex-col items-center gap-1 text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors">
                <Camera size={24} />
                <span className="text-xs">Tap to take photo</span>
              </button>
            )}
          </div>

          {/* Step 3 — Problem description */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">3 · Describe the Situation</p>
            <textarea
              rows={2}
              placeholder="e.g. Animal crossed road, appears injured, blocking traffic..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Error */}
          {status === 'error' && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{statusMsg}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isLoading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 active:scale-95'
            }`}
          >
            {isLoading ? (
              <><Loader2 size={18} className="animate-spin" /> {statusMsg}</>
            ) : (
              <><Send size={16} /> Submit & Verify with AI</>
            )}
          </button>

        </div>
      )}
    </div>
  );
};
