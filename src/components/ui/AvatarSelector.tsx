import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Camera } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getImageUrl } from '../../services/tmdb';
import { storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdated: () => void;
}

const PREDEFINED_AVATARS = [
  { id: 'rdj', name: 'Robert Downey Jr.', path: '/im9SAqJPZKEbVJoX4ZfQQE4LyqK.jpg' }, 
  { id: 'keanu', name: 'Keanu Reeves', path: '/4D0PpNIIQBDZxxRPE1M1n7r1QEr.jpg' }, 
  { id: 'margot', name: 'Margot Robbie', path: '/vgALNMZFTGUKy1ccPzbW1E7oYfT.jpg' }, 
  { id: 'cillian', name: 'Cillian Murphy', path: '/3oJE2516vCEx82t2VqBvB63cKzW.jpg' }, 
  { id: 'bale', name: 'Christian Bale', path: '/b7fTC9WFkgqGOv77mLQtmD8B1Sw.jpg' }, 
  { id: 'tom', name: 'Tom Cruise', path: '/gThaIXflqG8g7W7o0iE4y0eUo8n.jpg' }, 
  { id: 'leo', name: 'Leonardo DiCaprio', path: '/pjkFeVA5ytAPALHID29R5XcdvY.jpg' },
  { id: 'heath', name: 'Heath Ledger', path: '/7yOITKqCgI7iA0uOpBqfB5nO3E1.jpg' }, 
  { id: 'scarlett', name: 'Scarlett Johansson', path: '/6NsMbJXRlbZuDzatV2AKoziQ4ZJ.jpg' }, 
  { id: 'harrison', name: 'Harrison Ford', path: '/5M7oN3sznpB9aHtgAWeZ20d0fP.jpg' }, 
  { id: 'ryan', name: 'Ryan Reynolds', path: '/gD8vg0J22kOOXruHjXvQONuGk7c.jpg' }, 
  { id: 'chris', name: 'Chris Hemsworth', path: '/piqD0a1pS32Fp48qH6D2p1oT2P.jpg' }, 
  { id: 'johnd', name: 'Johnny Depp', path: '/1Gvbh2bKMWXyEavxK7h8r609L3H.jpg' }, 
  { id: 'henry', name: 'Henry Cavill', path: '/hErUwonrQgYV80XhR83k05o23D.jpg' }, 
  { id: 'anyataylor', name: 'Anya Taylor-Joy', path: '/xXNqYAL8T5C9wB3x0rP0D5P6A8h.jpg' },
  { id: 'daniel', name: 'Daniel Radcliffe', path: '/yX36UOMpBvO0Wtvk32sLtyNssm6.jpg' }, 
  { id: 'emilia', name: 'Emilia Clarke', path: '/nBEqQ0jDng2Y7N661E63O7Yj0M0.jpg' }, 
  { id: 'zendaya', name: 'Zendaya', path: '/rMiyg2cKnd5v1F2H9fV6Eus5gO7.jpg' }, 
  { id: 'pedro', name: 'Pedro Pascal', path: '/i0sdjEun3AEvEq9U42tUerS4H9h.jpg' }, 
  { id: 'tomhardy', name: 'Tom Hardy', path: '/d81K0RH8UX7tZj49tZaQhZ9ewH.jpg' }, 
  { id: 'chrisevans', name: 'Chris Evans', path: '/3bOGNsHlrswhyW79uvIvd1ewILj.jpg' }, 
  { id: 'tomhiddleston', name: 'Tom Hiddleston', path: '/mclHx2C6La0SBCaKkRz7j91SXYo.jpg' }, 
  { id: 'jason', name: 'Jason Momoa', path: '/hhFOtEFpL0FhOtsK0tWbheX0A9f.jpg' }
];

const AvatarSelector = ({ isOpen, onClose, onAvatarUpdated }: AvatarSelectorProps) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActorSelect = async (profilePath: string) => {
    if (!currentUser) return;
    setUploadLoading(true);
    try {
      const tmdbUrl = getImageUrl(profilePath, 'original');
      await updateProfile(currentUser, { photoURL: tmdbUrl });
      onAvatarUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating profile with Actor image:", error);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Validate type (jpg, png)
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
       alert("Please upload a JPG or PNG file.");
       return;
    }
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
       alert("File size exceeds 5MB limit.");
       return;
    }

    setUploadLoading(true);
    try {
      const storageRef = ref(storage, `users/${currentUser.uid}/profile_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(currentUser, { photoURL: url });
      onAvatarUpdated();
      onClose();
    } catch (error) {
      console.error("Error uploading custom image:", error);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           onClick={onClose}
           className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-[#0f0f16] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
             <h2 className="text-2xl font-bebas text-white tracking-widest flex items-center gap-3">
               <Camera className="w-6 h-6 text-primary" /> Edit Profile Picture
             </h2>
             <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
               <X className="w-5 h-5" />
             </button>
          </div>

          {/* Toggle Tabs */}
          <div className="flex gap-4 px-6 pt-6 shrink-0">
             <button 
               onClick={() => setActiveTab('library')}
               className={`flex-1 py-3 text-sm font-sans font-bold uppercase tracking-wider transition-all duration-300 border-b-2 ${
                 activeTab === 'library' ? 'border-primary text-white shadow-[0_10px_20px_rgba(229,9,20,0.2)]' : 'border-transparent text-gray-500 hover:text-gray-300'
               }`}
             >
               Cinematic Library
             </button>
             <button 
               onClick={() => setActiveTab('upload')}
               className={`flex-1 py-3 text-sm font-sans font-bold uppercase tracking-wider transition-all duration-300 border-b-2 ${
                 activeTab === 'upload' ? 'border-primary text-white shadow-[0_10px_20px_rgba(229,9,20,0.2)]' : 'border-transparent text-gray-500 hover:text-gray-300'
               }`}
             >
               Custom Upload
             </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar bg-gradient-to-b from-transparent to-background-dark/50">
             
             {/* Upload View */}
             {activeTab === 'upload' && (
               <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                  <div className="w-40 h-40 rounded-full bg-black/40 border-2 border-dashed border-gray-600 flex flex-col items-center justify-center mb-6 relative group hover:border-primary transition-colors cursor-pointer overflow-hidden">
                     {uploadLoading ? (
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                     ) : (
                        <>
                           <Upload className="w-10 h-10 text-gray-500 group-hover:text-primary transition-colors mb-2" />
                           <span className="text-xs font-sans text-gray-500 font-bold uppercase tracking-widest group-hover:text-white transition-colors">Select PNG/JPG</span>
                        </>
                     )}
                     <input 
                       type="file" 
                       accept="image/png, image/jpeg"
                       onChange={handleFileUpload}
                       disabled={uploadLoading}
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                     />
                  </div>
                  <p className="text-gray-400 font-sans text-sm text-center max-w-sm">
                    Upload a custom profile picture from your device. For best results, use a square image with a clean background. Maximum 5MB.
                  </p>
               </div>
             )}

             {/* TMDB Actor Library View */}
             {activeTab === 'library' && (
               <div className="flex flex-col h-full">
                    <p className="text-gray-400 font-sans text-sm mb-6 text-center">
                       Select an iconic global star from the TMDB database to represent your cinematic identity.
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                       {PREDEFINED_AVATARS.map((actor) => (
                         <div 
                           key={actor.id}
                           onClick={() => {
                             if(!uploadLoading) {
                               setSelectedActorId(actor.id);
                               handleActorSelect(actor.path);
                             }
                           }}
                           className={`relative aspect-square rounded-full overflow-hidden border-4 cursor-pointer group transition-all duration-300 ${
                             selectedActorId === actor.id ? 'border-primary scale-105 shadow-[0_0_20px_rgba(229,9,20,0.6)]' : 'border-black/50 hover:border-white/50 hover:scale-105 hover:shadow-2xl'
                           } ${uploadLoading ? 'opacity-50 pointer-events-none' : ''}`}
                         >
                            <img 
                              src={getImageUrl(actor.path, 'w500')} 
                              alt={actor.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Hover Overlay Title */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2 text-center pointer-events-none">
                               <span className="text-white font-bebas text-lg tracking-widest drop-shadow-lg leading-tight">
                                 {selectedActorId === actor.id || uploadLoading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                 ) : actor.name}
                               </span>
                            </div>
                         </div>
                       ))}
                    </div>
               </div>
             )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AvatarSelector;
