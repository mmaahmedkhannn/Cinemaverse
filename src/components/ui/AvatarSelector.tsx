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
      { id: "1356210", name: "Millie Bobby Brown", path: "/k9KGzGDVhXKfOGpoN62MNuXL28q.jpg" },
      { id: "1442069", name: "Finn Wolfhard", path: "/gsVIdhYh4DpDXjW5U5baQzcARsB.jpg" },
      { id: "1653291", name: "Gaten Matarazzo", path: "/alVT7oDp8N5G9WLIApI9jqeuqHq.jpg" },
      { id: "1474123", name: "Caleb McLaughlin", path: "/4jVS3EziBn7bf97ErxkW7jsdiLM.jpg" },
      { id: "1393177", name: "Noah Schnapp", path: "/jHS4mG6XW0ZJbMnpseL2reEWpv8.jpg" },
      { id: "1590797", name: "Sadie Sink", path: "/m9OyHAyOx56Pm3JruEBqh4p9XeX.jpg" }
    ]
  },
  {
    category: "Money Heist",
    avatars: [
      { id: "1042728", name: "Úrsula Corberó", path: "/cmH8Z459tw9YkR61QfxlCSlZw9P.jpg" },
      { id: "1340020", name: "Álvaro Morte", path: "/2TGPhdpRC5wjdFEJqnLYiN5kbwg.jpg" },
      { id: "1109836", name: "Pedro Alonso", path: "/38HeVKeOBztVYrLJOWzAtEZiB02.jpg" },
      { id: "1283843", name: "Alba Flores", path: "/vWUZkQKxj63qTNBa8DvEd0CpU64.jpg" },
      { id: "1428896", name: "Miguel Herrán", path: "/eFNlbsaMODCHys35ZQOkMQNh0Jq.jpg" },
      { id: "1972706", name: "Jaime Lorente", path: "/nLaxzU92z14FIbe25sE8jDMIThZ.jpg" }
    ]
  },
  {
    category: "One Piece",
    avatars: [
      { id: "2177750", name: "Iñaki Godoy", path: "/93Z6KuFpqoDD1xN5kuswYQzbWe6.jpg" },
      { id: "1566805", name: "Mackenyu", path: "/y4FTSASxsO1F61p3hFIPMCeprut.jpg" },
      { id: "1568101", name: "Emily Rudd", path: "/y23GTdDPcryBVtSWjY9q2O9nzwV.jpg" },
      { id: "2355316", name: "Jacob Gibson", path: "/c6uP24uFslQ3hnEgqPkojAbYuZn.jpg" },
      { id: "2498631", name: "Taz Skylar", path: "/3EXMkfzB8EXn3ZJPJvK6OfPWLfz.jpg" }
    ]
  },
  {
    category: "Marvel Universe",
    avatars: [
      { id: "3223", name: "Robert Downey Jr.", path: "/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg" },
      { id: "16828", name: "Chris Evans", path: "/jEzGktEMdEkQKemPVR0YGlIYEVl.jpg" },
      { id: "74568", name: "Chris Hemsworth", path: "/piQGdoIQOF3C1EI5cbYZLAW1gfj.jpg" },
      { id: "1245", name: "Scarlett Johansson", path: "/mjReG6rR7NPMEIWb1T4YWtV11ty.jpg" },
      { id: "91606", name: "Tom Hiddleston", path: "/wzfUMqasiYhzwpBvZqkCQ055Ri3.jpg" },
      { id: "1136406", name: "Tom Holland", path: "/wheJbAGkE537n9GsFl3XbkeZLj7.jpg" }
    ]
  },
  {
    category: "DC Universe",
    avatars: [
      { id: "3894", name: "Christian Bale", path: "/7Pxez9J8fuPd2Mn9kex13YALrCQ.jpg" },
      { id: "1810", name: "Heath Ledger", path: "/AdWKVqyWpkYSfKE5Gb2qn8JzHni.jpg" },
      { id: "73968", name: "Henry Cavill", path: "/kN3A5oLgtKYAxa9lAkpsIGYKYVo.jpg" },
      { id: "234352", name: "Margot Robbie", path: "/8LqG2N6j98lFGMpuYsRUAhOunSd.jpg" },
      { id: "117642", name: "Jason Momoa", path: "/3troAR6QbSb6nUFMDu61YCCWLKa.jpg" },
      { id: "90633", name: "Gal Gadot", path: "/AbXKtWQwuDiwhoQLh34VRglwuBE.jpg" }
    ]
  },
  {
    category: "Iconic Cinema",
    avatars: [
      { id: "6384", name: "Keanu Reeves", path: "/8RZLOyYGsoRe9p44q3xin9QkMHv.jpg" },
      { id: "2037", name: "Cillian Murphy", path: "/dm6V24NjjvjMiCtbMkc8Y2WPm2e.jpg" },
      { id: "85", name: "Johnny Depp", path: "/k2xt6EUxQDwYRKIyI4IBdZxfs8n.jpg" },
      { id: "6193", name: "Leonardo DiCaprio", path: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg" },
      { id: "3", name: "Harrison Ford", path: "/zVnHagUvXkR2StdOtquEwsiwSVt.jpg" },
      { id: "500", name: "Tom Cruise", path: "/maf8PhSvDCdEwjEMbYfGpojR5RP.jpg" }
    ]
  }
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
                                       handleActorSelect(actor.path);
                                     }
                                   }}
                                   className={`relative shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 cursor-pointer group transition-all duration-300 snap-center ${
                                     selectedActorId === actor.id ? 'border-primary shadow-[0_0_20px_rgba(229,9,20,0.6)] scale-105' : 'border-transparent hover:border-white/50 hover:scale-105 hover:shadow-2xl'
                                   } ${uploadLoading ? 'opacity-50 pointer-events-none' : ''}`}
                                 >
                                    <img 
                                      src={getImageUrl(actor.path, 'w500')} 
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
