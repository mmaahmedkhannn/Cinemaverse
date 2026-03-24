import { useState, useCallback } from 'react';
import { Upload, X, ZoomIn, ZoomOut, Check, RotateCcw } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdated: () => void;
}

/* ─── Helper: crop + compress image on a canvas ────────────── */
async function getCroppedAndCompressedImage(
  imageSrc: string,
  crop: Area,
  outputSize = 400
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = outputSize;
  canvas.height = outputSize;

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      },
      'image/jpeg',
      0.85 // quality — keeps file small while looking good
    );
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/* ────────────────────────────────────────────────────────────── */

const AvatarSelector = ({ isOpen, onClose, onAvatarUpdated }: AvatarSelectorProps) => {
  const { currentUser } = useAuth();
  const [uploadLoading, setUploadLoading] = useState(false);

  // Crop state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPG, PNG, and WebP files are supported.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    };
    reader.readAsDataURL(file);
  };

  const handleCropAndUpload = async () => {
    if (!currentUser || !imageSrc || !croppedAreaPixels) return;
    setUploadLoading(true);
    try {
      // Crop and compress client-side → tiny JPEG blob
      const croppedBlob = await getCroppedAndCompressedImage(
        imageSrc,
        croppedAreaPixels,
        400 // 400×400 output — perfect for avatars, fast upload
      );

      const storageRef = ref(storage, `avatars/${currentUser.uid}/${Date.now()}.jpg`);
      await uploadBytes(storageRef, croppedBlob, { contentType: 'image/jpeg' });
      const url = await getDownloadURL(storageRef);
      await updateProfile(currentUser as User, { photoURL: url });

      setImageSrc(null);
      onAvatarUpdated();
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadLoading(false);
    }
  };

  const resetCropper = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-md bg-[#141414] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
              <h2 className="font-bebas text-2xl tracking-widest text-white">
                {imageSrc ? 'Crop Your Photo' : 'Change Profile Picture'}
              </h2>
              <button
                onClick={() => { resetCropper(); onClose(); }}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {imageSrc ? (
              /* ===== CROP VIEW ===== */
              <div className="flex flex-col">
                {/* Crop area */}
                <div className="relative w-full h-[340px] bg-black">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                  />
                </div>

                {/* Zoom controls */}
                <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-white/10">
                  <ZoomOut className="w-4 h-4 text-gray-500" />
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-40 h-1 accent-white bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <ZoomIn className="w-4 h-4 text-gray-500" />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 px-6 pb-6">
                  <button
                    onClick={resetCropper}
                    disabled={uploadLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white transition-all font-sans text-sm disabled:opacity-50"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Change Photo
                  </button>
                  <button
                    onClick={handleCropAndUpload}
                    disabled={uploadLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-white text-black font-semibold font-sans text-sm hover:bg-gray-200 transition-all disabled:opacity-50"
                  >
                    {uploadLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* ===== FILE PICKER VIEW ===== */
              <div className="flex flex-col items-center justify-center py-16 px-6 gap-6">
                <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-gray-500" />
                </div>
                <p className="text-gray-400 text-sm font-sans text-center max-w-xs">
                  Upload a photo and crop it to fit your profile.<br />
                  Supports JPG, PNG, and WebP.
                </p>
                <label className="cursor-pointer bg-white hover:bg-gray-200 text-black font-semibold font-sans text-sm px-8 py-3 rounded-full transition-colors">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AvatarSelector;
