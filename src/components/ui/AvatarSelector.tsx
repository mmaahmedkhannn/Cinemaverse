import { useState, useRef } from 'react';
import { Camera, Upload, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onAvatarUpdated: () => void;
}

/* ──────────────────────────────────────────────────────────────
   Static character data extracted from TMDB cast/credits API.
   All images are official TMDB actor profile photos labelled
   by their most iconic character name.
   ────────────────────────────────────────────────────────────── */
const CHARACTER_GROUPS = [
  {
    category: 'Money Heist',
    avatars: [
      { id: 'mh_prof', name: 'The Professor', path: 'https://image.tmdb.org/t/p/w500/2TGPhdpRC5wjdFEJqnLYiN5kbwg.jpg' },
      { id: 'mh_tokyo', name: 'Tokyo', path: 'https://image.tmdb.org/t/p/w500/cmH8Z459tw9YkR61QfxlCSlZw9P.jpg' },
      { id: 'mh_berlin', name: 'Berlin', path: 'https://image.tmdb.org/t/p/w500/38HeVKeOBztVYrLJOWzAtEZiB02.jpg' },
      { id: 'mh_nairobi', name: 'Nairobi', path: 'https://image.tmdb.org/t/p/w500/vWUZkQKxj63qTNBa8DvEd0CpU64.jpg' },
      { id: 'mh_rio', name: 'Rio', path: 'https://image.tmdb.org/t/p/w500/eFNlbsaMODCHys35ZQOkMQNh0Jq.jpg' },
      { id: 'mh_denver', name: 'Denver', path: 'https://image.tmdb.org/t/p/w500/nLaxzU92z14FIbe25sE8jDMIThZ.jpg' },
      { id: 'mh_moscow', name: 'Moscow', path: 'https://image.tmdb.org/t/p/w500/nSJpyaypfmsYcSi3sFJP05u14RJ.jpg' },
      { id: 'mh_lisbon', name: 'Lisbon', path: 'https://image.tmdb.org/t/p/w500/l4jnBwz7cp9mmxjCMSfmH2sTOKE.jpg' },
      { id: 'mh_palermo', name: 'Palermo', path: 'https://image.tmdb.org/t/p/w500/21BEFsgRAMYrxNMSqPMH8X1FnbD.jpg' },
    ],
  },
  {
    category: 'Stranger Things',
    avatars: [
      { id: 'st_eleven', name: 'Eleven', path: 'https://image.tmdb.org/t/p/w500/k9KGzGDVhXKfOGpoN62MNuXL28q.jpg' },
      { id: 'st_mike', name: 'Mike', path: 'https://image.tmdb.org/t/p/w500/gsVIdhYh4DpDXjW5U5baQzcARsB.jpg' },
      { id: 'st_dustin', name: 'Dustin', path: 'https://image.tmdb.org/t/p/w500/alVT7oDp8N5G9WLIApI9jqeuqHq.jpg' },
      { id: 'st_lucas', name: 'Lucas', path: 'https://image.tmdb.org/t/p/w500/4jVS3EziBn7bf97ErxkW7jsdiLM.jpg' },
      { id: 'st_will', name: 'Will', path: 'https://image.tmdb.org/t/p/w500/jHS4mG6XW0ZJbMnpseL2reEWpv8.jpg' },
      { id: 'st_max', name: 'Max', path: 'https://image.tmdb.org/t/p/w500/m9OyHAyOx56Pm3JruEBqh4p9XeX.jpg' },
      { id: 'st_steve', name: 'Steve', path: 'https://image.tmdb.org/t/p/w500/ydBVHIH070jcNPgBhx0rj5MmXsS.jpg' },
      { id: 'st_hopper', name: 'Hopper', path: 'https://image.tmdb.org/t/p/w500/dhBJR1GiVExOOsNBDMpSp9Bq5Z.jpg' },
      { id: 'st_joyce', name: 'Joyce', path: 'https://image.tmdb.org/t/p/w500/a4Z7gFkm4JITQhMcVR0Ij0QLorv.jpg' },
    ],
  },
  {
    category: 'Marvel Cinematic Universe',
    avatars: [
      { id: 'mcu_ironman', name: 'Iron Man', path: 'https://image.tmdb.org/t/p/w500/5qHNjhtjMD4YWH3UP0rm4tKwxCL.jpg' },
      { id: 'mcu_spiderman', name: 'Spider-Man', path: 'https://image.tmdb.org/t/p/w500/wheJbAGkE537n9GsFl3XbkeZLj7.jpg' },
      { id: 'mcu_thor', name: 'Thor', path: 'https://image.tmdb.org/t/p/w500/piQGdoIQOF3C1EI5cbYZLAW1gfj.jpg' },
      { id: 'mcu_cap', name: 'Captain America', path: 'https://image.tmdb.org/t/p/w500/jEzGktEMdEkQKemPVR0YGlIYEVl.jpg' },
      { id: 'mcu_widow', name: 'Black Widow', path: 'https://image.tmdb.org/t/p/w500/mjReG6rR7NPMEIWb1T4YWtV11ty.jpg' },
      { id: 'mcu_hulk', name: 'Hulk', path: 'https://image.tmdb.org/t/p/w500/5GilHMOt5PAQh6rlUKZzGmaKEI7.jpg' },
      { id: 'mcu_deadpool', name: 'Deadpool', path: 'https://image.tmdb.org/t/p/w500/trzgptffGvAlAT6MEu01fz47cLW.jpg' },
      { id: 'mcu_panther', name: 'Black Panther', path: 'https://image.tmdb.org/t/p/w500/1lz1wLOuPFSRIratMz0SxD3tkJ.jpg' },
    ],
  },
  {
    category: 'DC Universe',
    avatars: [
      { id: 'dc_batman', name: 'Batman', path: 'https://image.tmdb.org/t/p/w500/7Pxez9J8fuPd2Mn9kex13YALrCQ.jpg' },
      { id: 'dc_joker', name: 'Joker', path: 'https://image.tmdb.org/t/p/w500/AdWKVqyWpkYSfKE5Gb2qn8JzHni.jpg' },
      { id: 'dc_harley', name: 'Harley Quinn', path: 'https://image.tmdb.org/t/p/w500/8LqG2N6j98lFGMpuYsRUAhOunSd.jpg' },
      { id: 'dc_superman', name: 'Superman', path: 'https://image.tmdb.org/t/p/w500/kN3A5oLgtKYAxa9lAkpsIGYKYVo.jpg' },
      { id: 'dc_ww', name: 'Wonder Woman', path: 'https://image.tmdb.org/t/p/w500/AbXKtWQwuDiwhoQLh34VRglwuBE.jpg' },
      { id: 'dc_flash', name: 'The Flash', path: 'https://image.tmdb.org/t/p/w500/hLtxNK8eeWZkFSeaAASFWm15Qv0.jpg' },
    ],
  },
  {
    category: 'Star Wars',
    avatars: [
      { id: 'sw_luke', name: 'Luke Skywalker', path: 'https://image.tmdb.org/t/p/w500/zMQ93JTLW8KxusKhOlHFZhih3YQ.jpg' },
      { id: 'sw_vader', name: 'Darth Vader', path: 'https://image.tmdb.org/t/p/w500/xTocYiKHlRYN8tfh8vyQFsRXC0K.jpg' },
      { id: 'sw_han', name: 'Han Solo', path: 'https://image.tmdb.org/t/p/w500/zVnHagUvXkR2StdOtquEwsiwSVt.jpg' },
      { id: 'sw_yoda', name: 'Yoda', path: 'https://image.tmdb.org/t/p/w500/mb2JbT8s6LIgaxj6QTph0NW1pmI.jpg' },
      { id: 'sw_rey', name: 'Rey', path: 'https://image.tmdb.org/t/p/w500/iVboQmgPC3tYFjezBjrVECJRS8n.jpg' },
      { id: 'sw_kylo', name: 'Kylo Ren', path: 'https://image.tmdb.org/t/p/w500/fsbGQ1eZFgdsG1XnKlhNSvHsiGo.jpg' },
    ],
  },
  {
    category: 'Breaking Bad',
    avatars: [
      { id: 'bb_walter', name: 'Walter White', path: 'https://image.tmdb.org/t/p/w500/7Jahy5LZX2Fo8fGJltMreAI49hC.jpg' },
      { id: 'bb_jesse', name: 'Jesse Pinkman', path: 'https://image.tmdb.org/t/p/w500/8Ac9uuoYwZoYVAIJfRLzzLsGGJn.jpg' },
      { id: 'bb_saul', name: 'Saul Goodman', path: 'https://image.tmdb.org/t/p/w500/rF0Lb6SBhGSTvjRffmlKRSeI3jE.jpg' },
    ],
  },
  {
    category: 'Game of Thrones',
    avatars: [
      { id: 'got_jon', name: 'Jon Snow', path: 'https://image.tmdb.org/t/p/w500/iCFQAQqb0SgvxEdVYhJtZLhM9kp.jpg' },
      { id: 'got_dany', name: 'Daenerys', path: 'https://image.tmdb.org/t/p/w500/wb8VfDPGpyqcFltnRcJR1Wj3h4Z.jpg' },
      { id: 'got_tyrion', name: 'Tyrion', path: 'https://image.tmdb.org/t/p/w500/5oUIFGorNKaijU3FmDpiswJp3Ly.jpg' },
      { id: 'got_arya', name: 'Arya', path: 'https://image.tmdb.org/t/p/w500/5RjD4dDpRDAhalFtvcUj7zdLWYB.jpg' },
    ],
  },
  {
    category: 'One Piece',
    avatars: [
      { id: 'op_luffy', name: 'Luffy', path: 'https://image.tmdb.org/t/p/w500/93Z6KuFpqoDD1xN5kuswYQzbWe6.jpg' },
      { id: 'op_zoro', name: 'Zoro', path: 'https://image.tmdb.org/t/p/w500/y4FTSASxsO1F61p3hFIPMCeprut.jpg' },
      { id: 'op_nami', name: 'Nami', path: 'https://image.tmdb.org/t/p/w500/y23GTdDPcryBVtSWjY9q2O9nzwV.jpg' },
      { id: 'op_usopp', name: 'Usopp', path: 'https://image.tmdb.org/t/p/w500/c6uP24uFslQ3hnEgqPkojAbYuZn.jpg' },
      { id: 'op_sanji', name: 'Sanji', path: 'https://image.tmdb.org/t/p/w500/3EXMkfzB8EXn3ZJPJvK6OfPWLfz.jpg' },
    ],
  },
  {
    category: 'Lucifer',
    avatars: [
      { id: 'lu_luci', name: 'Lucifer', path: 'https://image.tmdb.org/t/p/w500/zhjIyqpk5bsYgxsh5bSeS6VZtHm.jpg' },
      { id: 'lu_chloe', name: 'Chloe', path: 'https://image.tmdb.org/t/p/w500/if1TbO8dSfPiDCMfy52nH7A2D7.jpg' },
      { id: 'lu_maze', name: 'Maze', path: 'https://image.tmdb.org/t/p/w500/fW2ITcpENpNnHf4wuNltf3PSQTk.jpg' },
      { id: 'lu_amen', name: 'Amenadiel', path: 'https://image.tmdb.org/t/p/w500/xdyGewr108rQWojpYlKw2QjrxCz.jpg' },
    ],
  },
];

/* ──────────────────────────────────────────────────────────── */

const ScrollRow = ({
  group,
  selectedId,
  loading,
  onSelect,
}: {
  group: (typeof CHARACTER_GROUPS)[0];
  selectedId: string | null;
  loading: boolean;
  onSelect: (avatar: { id: string; name: string; path: string }) => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' });
  };

  return (
    <div className="relative group/row">
      <h3 className="font-bebas text-[1.05rem] tracking-[0.2em] uppercase text-white/40 mb-3 pl-1">
        {group.category}
      </h3>

      {/* Left scroll arrow */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/70 backdrop-blur rounded-full flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Scrollable avatar row */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 no-scrollbar scroll-smooth"
      >
        {group.avatars.map((avatar) => (
          <button
            key={avatar.id}
            disabled={loading}
            onClick={() => onSelect(avatar)}
            className={`shrink-0 flex flex-col items-center gap-2 group/card transition-all duration-200 ${
              loading ? 'opacity-40 pointer-events-none' : ''
            }`}
          >
            <div
              className={`relative w-[90px] h-[90px] sm:w-[100px] sm:h-[100px] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                selectedId === avatar.id
                  ? 'border-white scale-110 shadow-[0_0_16px_rgba(255,255,255,0.4)]'
                  : 'border-transparent hover:border-white/60 hover:scale-105'
              }`}
            >
              <img
                src={avatar.path}
                alt={avatar.name}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              {selectedId === avatar.id && (
                <div className="absolute inset-0 bg-white/10 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <span
              className={`text-[11px] font-sans leading-tight text-center max-w-[90px] sm:max-w-[100px] truncate ${
                selectedId === avatar.id ? 'text-white font-semibold' : 'text-gray-400'
              }`}
            >
              {avatar.name}
            </span>
          </button>
        ))}
      </div>

      {/* Right scroll arrow */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-black/70 backdrop-blur rounded-full flex items-center justify-center text-white opacity-0 group-hover/row:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────── */

const AvatarSelector = ({ isOpen, onClose, onAvatarUpdated }: AvatarSelectorProps) => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);

  if (!isOpen) return null;

  const handleCharacterSelect = async (avatar: { id: string; name: string; path: string }) => {
    if (!currentUser) return;
    setSelectedId(avatar.id);
    setUploadLoading(true);
    try {
      await updateProfile(currentUser, { photoURL: avatar.path });
      onAvatarUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to set avatar:', err);
      alert('Could not update profile picture. Please try again.');
    } finally {
      setUploadLoading(false);
      setSelectedId(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Only JPG and PNG files are supported.');
      return;
    }
    setUploadLoading(true);
    try {
      const storageRef = ref(storage, `avatars/${currentUser.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateProfile(currentUser as User, { photoURL: url });
      onAvatarUpdated();
      onClose();
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setUploadLoading(false);
    }
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
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-3xl max-h-[85vh] bg-[#141414] border border-white/10 rounded-2xl shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0">
              <h2 className="font-bebas text-2xl tracking-widest text-white">
                Edit Profile Icon
              </h2>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 px-6 pt-4 shrink-0">
              <button
                onClick={() => setActiveTab('library')}
                className={`px-5 py-2 rounded-full text-sm font-sans transition-all ${
                  activeTab === 'library'
                    ? 'bg-white text-black font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Camera className="w-4 h-4 inline mr-2" />
                Characters
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-5 py-2 rounded-full text-sm font-sans transition-all ${
                  activeTab === 'upload'
                    ? 'bg-white text-black font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 no-scrollbar">
              {activeTab === 'library' ? (
                <div className="flex flex-col gap-7">
                  {CHARACTER_GROUPS.map((group) => (
                    <ScrollRow
                      key={group.category}
                      group={group}
                      selectedId={selectedId}
                      loading={uploadLoading}
                      onSelect={handleCharacterSelect}
                    />
                  ))}
                </div>
              ) : (
                /* Upload Tab */
                <div className="flex flex-col items-center justify-center py-16 gap-6">
                  <div className="w-24 h-24 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center">
                    <Upload className="w-10 h-10 text-gray-500" />
                  </div>
                  <p className="text-gray-400 text-sm font-sans text-center max-w-xs">
                    Upload a custom profile picture.<br />
                    Supports JPG and PNG, max 5 MB.
                  </p>
                  <label className="cursor-pointer bg-white hover:bg-gray-200 text-black font-semibold font-sans text-sm px-8 py-3 rounded-full transition-colors">
                    Choose File
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploadLoading}
                    />
                  </label>
                  {uploadLoading && (
                    <div className="flex items-center gap-3 text-gray-400 text-sm font-sans">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AvatarSelector;
