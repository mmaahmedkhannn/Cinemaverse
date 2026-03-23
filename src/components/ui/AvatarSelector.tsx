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

const PREDEFINED_AVATAR_GROUPS = [
  {
    category: "Stranger Things",
    avatars: [
      { id: "eleven", name: "Eleven", path: "https://static.wikia.nocookie.net/strangerthings8338/images/e/e2/Eleven_-_Sorcerer.png/revision/latest/scale-to-width-down/444?cb=20260313155200" },
      { id: "mike", name: "Mike Wheeler", path: "https://static.wikia.nocookie.net/strangerthings8338/images/9/97/Mike_Wheeler_Finale.png/revision/latest/scale-to-width-down/577?cb=20260313155900" },
      { id: "dustin", name: "Dustin Henderson", path: "https://static.wikia.nocookie.net/strangerthings8338/images/4/4f/Dustin_Henderson_1989.png/revision/latest/scale-to-width-down/590?cb=20260313155936" },
      { id: "lucas", name: "Lucas Sinclair", path: "https://static.wikia.nocookie.net/strangerthings8338/images/7/70/Lucas_Sinclair_Finale.png/revision/latest/scale-to-width-down/512?cb=20260313155517" },
      { id: "will", name: "Will Byers", path: "https://static.wikia.nocookie.net/strangerthings8338/images/5/5e/Will_Byers_Finale.png/revision/latest/scale-to-width-down/587?cb=20260313155557" },
      { id: "max", name: "Max Mayfield", path: "https://static.wikia.nocookie.net/strangerthings8338/images/2/2a/1989.png/revision/latest/scale-to-width-down/489?cb=20260313154711" }
    ]
  },
  {
    category: "Marvel Cinematic Universe",
    avatars: [
      { id: "ironman", name: "Iron Man", path: "https://image.tmdb.org/t/p/w500/78lPtwv72eTNqFW9O53WE01HPTQ.jpg" },
      { id: "cap", name: "Captain America", path: "https://static.wikia.nocookie.net/marvelcinematicuniverse/images/b/b7/Steve_Rogers_Infobox.jpg/revision/latest/scale-to-width-down/456?cb=20231025163634" },
      { id: "spider", name: "Spider-Man", path: "https://image.tmdb.org/t/p/w500/c24sv2weTHPsmDa7jEMN0m2P3RT.jpg" },
      { id: "deadpool", name: "Deadpool", path: "https://image.tmdb.org/t/p/w500/yGSxMiF0cFlAiwkADicXU0E2o6L.jpg" },
    ]
  },
  {
    category: "DC Universe",
    avatars: [
      { id: "batman", name: "The Batman", path: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg" },
      { id: "joker", name: "Joker", path: "https://image.tmdb.org/t/p/w500/udDclJoHjfpt8Wa5bL1U4Mcd0mE.jpg" },
      { id: "harley", name: "Harley Quinn", path: "https://image.tmdb.org/t/p/w500/1Xddsy2Z1sR2h1Wf5p0yF7cOItn.jpg" }
    ]
  },
  {
    category: "Star Wars",
    avatars: [
      { id: "anakin", name: "Anakin Skywalker", path: "https://static.wikia.nocookie.net/starwars/images/6/6f/Anakin_Skywalker_RotS.png/revision/latest/scale-to-width-down/480?cb=20130621175844" },
      { id: "luke", name: "Luke Skywalker", path: "https://static.wikia.nocookie.net/starwars/images/3/3d/LukeSkywalker.png/revision/latest/scale-to-width-down/450?cb=20241221010122" },
      { id: "obiwan", name: "Obi-Wan Kenobi", path: "https://static.wikia.nocookie.net/starwars/images/4/4e/ObiWanHS-SWE.jpg/revision/latest/scale-to-width-down/450?cb=20111115052816" },
      { id: "mando", name: "Din Djarin", path: "https://static.wikia.nocookie.net/starwars/images/4/46/DinDjarinArmor-CGSWG.png/revision/latest/scale-to-width-down/483?cb=20241206044557" }
    ]
  },
  {
    category: "Money Heist",
    avatars: [
      { id: "mask", name: "Dali Mask", path: "https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg" },
      { id: "professor", name: "The Professor", path: "https://upload.wikimedia.org/wikipedia/en/0/0c/Professor_%28Money_Heist%29.jpg" },
      { id: "tokyo", name: "Tokyo", path: "https://upload.wikimedia.org/wikipedia/en/7/7a/Tokyo_%28Money_Heist%29.jpg" },
      { id: "berlin", name: "Berlin", path: "https://upload.wikimedia.org/wikipedia/en/2/23/Berlin_%28Money_Heist%29.jpg" },
      { id: "nairobi", name: "Nairobi", path: "https://upload.wikimedia.org/wikipedia/en/8/8e/Nairobi_%28Money_Heist%29.jpg" }
    ]
  }
];

const AvatarSelector = ({ isOpen, onClose, onAvatarUpdated }: AvatarSelectorProps) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedActorId, setSelectedActorId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActorSelect = async (tmdbUrl: string) => {
    if (!currentUser) return;
    setUploadLoading(true);
    try {
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
                    <div className="flex flex-col gap-8 pb-4">
                       {PREDEFINED_AVATAR_GROUPS.map((group) => (
                         <div key={group.category} className="flex flex-col">
                            <h3 className="text-sm font-sans font-bold uppercase tracking-widest text-white/50 mb-3 px-1">{group.category}</h3>
                            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x snap-mandatory">
                               {group.avatars.map((actor) => (
                                 <div 
                                   key={actor.id}
                                   onClick={() => {
                                     if(!uploadLoading) {
                                       setSelectedActorId(actor.id);
                                       const tmdbUrl = actor.path.startsWith('http') ? actor.path : getImageUrl(actor.path, 'original');
                                       handleActorSelect(tmdbUrl);
                                     }
                                   }}
                                   className={`relative shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 cursor-pointer group transition-all duration-300 snap-center ${
                                     selectedActorId === actor.id ? 'border-primary shadow-[0_0_20px_rgba(229,9,20,0.6)] scale-105' : 'border-transparent hover:border-white/50 hover:scale-105 hover:shadow-2xl'
                                   } ${uploadLoading ? 'opacity-50 pointer-events-none' : ''}`}
                                 >
                                    <img 
                                      src={actor.path.startsWith('http') ? actor.path : getImageUrl(actor.path, 'w500')} 
                                      alt={actor.name}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {/* Hover Overlay Title */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-2 text-center pointer-events-none">
                                       <span className="text-white font-bebas text-[1.1rem] tracking-wider drop-shadow-lg leading-tight">
                                         {selectedActorId === actor.id || uploadLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                         ) : actor.name}
                                       </span>
                                    </div>
                                 </div>
                               ))}
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
