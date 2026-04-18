"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Camera, Move, Check, X, Upload } from "lucide-react";

interface DraggableCoverPhotoProps {
  /** Current cover image URL from API/state */
  src?: string | null;
  /** Called with the File when user picks a new image */
  onFileChange?: (file: File) => void;
  /** Called with the Y-offset percentage (0–100) when user repositions */
  onPositionChange?: (yPercent: number) => void;
  /** Initial Y position percentage (default: 50) */
  initialY?: number;
  /** Height of the cover area in px (default: 260) */
  height?: number;
  /** Show upload/drag controls (true = edit mode) */
  editable?: boolean;
  /** Fallback gradient when no src */
  fallbackClassName?: string;
  children?: React.ReactNode;
}

/**
 * DraggableCoverPhoto
 * A Facebook-style cover photo component:
 * - Click "Change Cover" → pick new image
 * - After picking: drag to reposition (up/down)
 * - "Set as Cover" saves, "Cancel" discards
 */
export default function DraggableCoverPhoto({
  src,
  onFileChange,
  onPositionChange,
  initialY = 50,
  height = 260,
  editable = true,
  fallbackClassName = "bg-linear-to-br from-[#121433] to-[#1a1f4e]",
  children,
}: DraggableCoverPhotoProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [yPercent, setYPercent] = useState(initialY);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartPercent, setDragStartPercent] = useState(50);
  const [isRepositioning, setIsRepositioning] = useState(false);

  const activeSrc = preview || src;

  // ── File pick ─────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setYPercent(50);
    setIsRepositioning(true);
    onFileChange?.(file);
    // Reset input so same file can be picked again
    e.target.value = "";
  };

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const startDrag = useCallback(
    (clientY: number) => {
      if (!isRepositioning) return;
      setIsDragging(true);
      setDragStartY(clientY);
      setDragStartPercent(yPercent);
    },
    [isRepositioning, yPercent]
  );

  const moveDrag = useCallback(
    (clientY: number) => {
      if (!isDragging || !containerRef.current) return;
      const containerH = containerRef.current.clientHeight;
      const delta = clientY - dragStartY;
      // Invert: dragging down shifts image up (lower Y%)
      const deltaPercent = -(delta / containerH) * 100;
      const newY = Math.min(100, Math.max(0, dragStartPercent + deltaPercent));
      setYPercent(newY);
    },
    [isDragging, dragStartY, dragStartPercent]
  );

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => startDrag(e.clientY);
  const onMouseMove = (e: React.MouseEvent) => moveDrag(e.clientY);
  const onMouseUp = () => endDrag();
  const onMouseLeave = () => { if (isDragging) endDrag(); };

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => startDrag(e.touches[0].clientY);
  const onTouchMove = (e: React.TouchEvent) => { e.preventDefault(); moveDrag(e.touches[0].clientY); };
  const onTouchEnd = () => endDrag();

  // Confirm reposition
  const handleConfirm = () => {
    setIsRepositioning(false);
    onPositionChange?.(yPercent);
  };

  // Cancel reposition
  const handleCancel = () => {
    setIsRepositioning(false);
    setPreview(null);
    setYPercent(initialY);
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none"
      style={{ height }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Image */}
      {activeSrc ? (
        <img
          src={activeSrc}
          alt="Cover"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-none"
          style={{ objectPosition: `center ${yPercent}%` }}
        />
      ) : (
        <div className={`absolute inset-0 w-full h-full ${fallbackClassName}`} />
      )}

      {/* Drag overlay */}
      {isRepositioning && (
        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          style={{ touchAction: "none" }}
        >
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
            <Move size={18} className="text-white" />
            <span className="text-white text-sm font-bold">Drag to Reposition</span>
          </div>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Children (profile info strip, buttons etc.) */}
      {!isRepositioning && children}

      {/* Controls */}
      {editable && !isRepositioning && (
        <button
          onClick={() => fileRef.current?.click()}
          className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm border border-white/20 text-white text-xs font-bold rounded-xl hover:bg-black/70 transition-all"
        >
          <Camera size={14} /> Change Cover
        </button>
      )}

      {isRepositioning && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-4 py-2 bg-black/60 border border-white/20 text-white text-xs font-bold rounded-xl hover:bg-black/80 transition-all"
          >
            <X size={13} /> Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-2 bg-cyan-400 text-[#0B0E1E] text-xs font-black rounded-xl hover:bg-cyan-300 transition-all"
          >
            <Check size={13} /> Set as Cover
          </button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
