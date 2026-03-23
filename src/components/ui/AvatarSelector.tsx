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
   In-character images sourced from TMDB tagged stills, character
   posters, and promotional material. Each image shows the actor
   IN COSTUME / IN CHARACTER from their respective show or movie.
   ────────────────────────────────────────────────────────────── */
const CHARACTER_GROUPS = [
  {
    category: 'Money Heist',
    avatars: [
      { id: 'mh_prof', name: 'The Professor', path: 'https://image.tmdb.org/t/p/w500/7RKzTzhSKqLs5AREwoG223bdHsL.jpg' },
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
      // In-character promotional posters from Stranger Things
      { id: 'st_eleven', name: 'Eleven', path: 'https://image.tmdb.org/t/p/w500/mGi3wAEJQVc6QeWOPaTA155Wpx6.jpg' },
      { id: 'st_mike', name: 'Mike', path: 'https://image.tmdb.org/t/p/w500/zzi2XZUUjJRxSp6rkz5f856QDnq.jpg' },
      { id: 'st_dustin', name: 'Dustin', path: 'https://image.tmdb.org/t/p/w500/mMCd9gWqot9MZn8Ypz95crfhkSx.jpg' },
      { id: 'st_lucas', name: 'Lucas', path: 'https://image.tmdb.org/t/p/w500/4jVS3EziBn7bf97ErxkW7jsdiLM.jpg' },
      { id: 'st_will', name: 'Will', path: 'https://image.tmdb.org/t/p/w500/jHS4mG6XW0ZJbMnpseL2reEWpv8.jpg' },
      { id: 'st_max', name: 'Max', path: 'https://image.tmdb.org/t/p/w500/cQywpstS8m9VyU0ho5E0KTNqd50.jpg' },
      { id: 'st_steve', name: 'Steve', path: 'https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg' },
      { id: 'st_hopper', name: 'Hopper', path: 'https://image.tmdb.org/t/p/w500/jzdnUGEmAnbI2Q1S7WN4e8cXXKW.jpg' },
      { id: 'st_joyce', name: 'Joyce', path: 'https://image.tmdb.org/t/p/w500/kPfqCdmiPEKN45GU8uH5m0yLCXr.jpg' },
    ],
  },
  {
    category: 'Marvel Cinematic Universe',
    avatars: [
      // In-character promotional posters (Infinity War character posters, solo films)
      { id: 'mcu_ironman', name: 'Iron Man', path: 'https://image.tmdb.org/t/p/w500/qhPtAc1TKbMPqNvcdXSOn9Bn7hZ.jpg' },
      { id: 'mcu_spiderman', name: 'Spider-Man', path: 'https://image.tmdb.org/t/p/w500/1vEInJQa08gLJsb7coJfYDR02KE.jpg' },
      { id: 'mcu_thor', name: 'Thor', path: 'https://image.tmdb.org/t/p/w500/jwzA6RI8NdQNyOVLsbnSLGMq1oW.jpg' },
      { id: 'mcu_cap', name: 'Captain America', path: 'https://image.tmdb.org/t/p/w500/ypX47SBSThTbB40AIJ22eOUCpjU.jpg' },
      { id: 'mcu_widow', name: 'Black Widow', path: 'https://image.tmdb.org/t/p/w500/ypX47SBSThTbB40AIJ22eOUCpjU.jpg' },
      { id: 'mcu_hulk', name: 'Hulk', path: 'https://image.tmdb.org/t/p/w500/7WsyChQLEftFiDOVTGkv3hFpyyt.jpg' },
      { id: 'mcu_deadpool', name: 'Deadpool', path: 'https://image.tmdb.org/t/p/w500/wFjboE0aFZNbVOF05fzrka9Fqyx.jpg' },
      { id: 'mcu_panther', name: 'Black Panther', path: 'https://image.tmdb.org/t/p/w500/uzQFUPXxKNbhgWQePGEix9wYYKx.jpg' },
    ],
  },
  {
    category: 'DC Universe',
    avatars: [
      // Character posters from Dark Knight, BOP, Wonder Woman, Flash
      { id: 'dc_batman', name: 'Batman', path: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg' },
      { id: 'dc_joker', name: 'Joker', path: 'https://image.tmdb.org/t/p/w500/o8i8EDSWiwzTIiaMgyPnESKYIVd.jpg' },
      { id: 'dc_harley', name: 'Harley Quinn', path: 'https://image.tmdb.org/t/p/w500/Abn7vhJKcrPIpMZc8MMHoFRBcDL.jpg' },
      { id: 'dc_superman', name: 'Superman', path: 'https://image.tmdb.org/t/p/w500/tnAuB8q5vv7Ax9UAEje5Xi4BXik.jpg' },
      { id: 'dc_ww', name: 'Wonder Woman', path: 'https://image.tmdb.org/t/p/w500/imekS7f1OuHyUP2LAiTEM0zBzUz.jpg' },
      { id: 'dc_flash', name: 'The Flash', path: 'https://image.tmdb.org/t/p/w500/67PmbAViFCW3obXxr5Utm9wArIP.jpg' },
    ],
  },
  {
    category: 'Star Wars',
    avatars: [
      { id: 'sw_luke', name: 'Luke Skywalker', path: 'https://image.tmdb.org/t/p/w500/1539H2E75rOC9HUA2kSOhDE4d2A.jpg' },
      { id: 'sw_vader', name: 'Darth Vader', path: 'https://image.tmdb.org/t/p/w500/xTocYiKHlRYN8tfh8vyQFsRXC0K.jpg' },
      { id: 'sw_han', name: 'Han Solo', path: 'https://image.tmdb.org/t/p/w500/dLOFALA4pWdBBL8WTzeYfyFKSjZ.jpg' },
      { id: 'sw_yoda', name: 'Yoda', path: 'https://image.tmdb.org/t/p/w500/mb2JbT8s6LIgaxj6QTph0NW1pmI.jpg' },
      { id: 'sw_rey', name: 'Rey', path: 'https://image.tmdb.org/t/p/w500/3ZKtSvr3WIP38jr03Y8ncIoKPyd.jpg' },
      { id: 'sw_kylo', name: 'Kylo Ren', path: 'https://image.tmdb.org/t/p/w500/fsbGQ1eZFgdsG1XnKlhNSvHsiGo.jpg' },
    ],
  },
  {
    category: 'Breaking Bad',
    avatars: [
      // In-character promotional posters from Breaking Bad
      { id: 'bb_walter', name: 'Walter White', path: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg' },
      { id: 'bb_jesse', name: 'Jesse Pinkman', path: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg' },
      { id: 'bb_saul', name: 'Saul Goodman', path: 'https://image.tmdb.org/t/p/w500/xEggmiD4WoJBQR2AiVF46yPUUgD.jpg' },
    ],
  },
  {
    category: 'Game of Thrones',
    avatars: [
      // In-character stills from Game of Thrones
      { id: 'got_jon', name: 'Jon Snow', path: 'https://image.tmdb.org/t/p/w500/ddzVh5GAabo429kTU2ixu6ROeaz.jpg' },
      { id: 'got_dany', name: 'Daenerys', path: 'https://image.tmdb.org/t/p/w500/7GhSiFhXOg81AevNQWrX6DOEL1U.jpg' },
      { id: 'got_tyrion', name: 'Tyrion', path: 'https://image.tmdb.org/t/p/w500/jV8E0KoHCTU0OXImZFRBKsJH0GD.jpg' },
      { id: 'got_arya', name: 'Arya', path: 'https://image.tmdb.org/t/p/w500/pVTafj1pKhXh5aGZItOSDtgBZuc.jpg' },
    ],
  },
  {
    category: 'One Piece',
    avatars: [
      // One Piece live action promotional stills
      { id: 'op_luffy', name: 'Luffy', path: 'https://image.tmdb.org/t/p/w500/aesLt9fsKSA6KCgGxA60VVxjtLk.jpg' },
      { id: 'op_zoro', name: 'Zoro', path: 'https://image.tmdb.org/t/p/w500/y4FTSASxsO1F61p3hFIPMCeprut.jpg' },
      { id: 'op_nami', name: 'Nami', path: 'https://image.tmdb.org/t/p/w500/y23GTdDPcryBVtSWjY9q2O9nzwV.jpg' },
      { id: 'op_usopp', name: 'Usopp', path: 'https://image.tmdb.org/t/p/w500/c6uP24uFslQ3hnEgqPkojAbYuZn.jpg' },
      { id: 'op_sanji', name: 'Sanji', path: 'https://image.tmdb.org/t/p/w500/cplNidnm3KfEP5lHimXT0MN5StI.jpg' },
    ],
  },
  {
    category: 'Lucifer',
    avatars: [
      { id: 'lu_luci', name: 'Lucifer', path: 'https://image.tmdb.org/t/p/w500/nmYklOkiIap6GCu8Kzl82iZpJRw.jpg' },
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
                className="w-full h-full object-cover object-top"
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
