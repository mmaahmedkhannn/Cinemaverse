import { motion } from 'framer-motion';
import { TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

const BOX_OFFICE_DATA = [
  { year: 2026, highest: 'Avengers: Doomsday', revenue: 2000000000, color: 'bg-red-500', poster: '/jbwZ21z8B2F9q0N3zT6X1A47Bpe.jpg' }, 
  { year: 2025, highest: 'Superman', revenue: 1500000000, color: 'bg-blue-500', poster: '/7f1aUExm0yB9zQ1rBYrM60k1T9a.jpg' }, // Mock placeholders using random popular paths
  { year: 2024, highest: 'Inside Out 2', revenue: 1690000000, color: 'bg-yellow-500', poster: '/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg' },
  { year: 2023, highest: 'Barbie', revenue: 1445000000, color: 'bg-pink-500', poster: '/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg' },
  { year: 2022, highest: 'Avatar: The Way of Water', revenue: 2320000000, color: 'bg-cyan-500', poster: '/t6HIqrHezINNdIEe3t0dY521wE0.jpg' },
  { year: 2021, highest: 'Spider-Man: No Way Home', revenue: 1921000000, color: 'bg-red-600', poster: '/1g0dhYtq4irTY1R50vDWeK9KkLp.jpg' },
  { year: 2020, highest: 'The Eight Hundred', revenue: 461000000, color: 'bg-gray-500', poster: '/p1ZLXocGZihkXzONyP1wVp0gEMH.jpg' },
];

const MAX_REVENUE = 2500000000;

export const BoxOfficeWars = () => {
  return (
    <section className="bg-gradient-to-b from-[#080810] to-[#0a0a0f] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
          <div>
            <h2 className="font-bebas text-4xl md:text-5xl text-white flex items-center gap-3 mb-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              Box Office Wars
            </h2>
            <p className="text-gray-400 font-sans max-w-2xl">
              The highest grossing cinematic giants of the decade. Witness the relentless battle for the box office crown.
            </p>
          </div>
          <Link to="/movies" className="text-sm font-sans font-bold text-gray-400 hover:text-white border border-white/10 hover:border-white/30 px-6 py-2.5 rounded-full transition-all duration-300">
            Explore All Movies
          </Link>
        </div>

        <div className="space-y-6">
          {BOX_OFFICE_DATA.map((data, index) => {
            const widthPercentage = Math.max((data.revenue / MAX_REVENUE) * 100, 15); // min 15% width for visual weight
            const formattedRevenue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 3 }).format(data.revenue);
            
            return (
              <div key={data.year} className="flex flex-col md:flex-row gap-4 md:items-center w-full">
                
                <div className="flex items-center gap-4 w-full md:w-56 shrink-0">
                  <span className="font-bebas text-3xl text-gray-500 hidden md:block">{data.year}</span>
                  <div className="h-14 w-10 flex-shrink-0 bg-[#222] rounded overflow-hidden relative border border-white/10 hidden md:block">
                     <img src={`https://image.tmdb.org/t/p/w200${data.poster}`} alt={data.highest} className="w-full h-full object-cover" />
                  </div>
                  <div className="font-sans">
                     <span className="font-bebas text-xl text-white block md:hidden">{data.year}</span>
                     <span className="text-gray-200 font-bold text-sm block leading-tight">{data.highest}</span>
                  </div>
                </div>

                {/* Animated Bar */}
                <div className="flex-grow h-12 md:h-14 bg-white/5 rounded-r-xl md:rounded-xl relative overflow-hidden flex items-center border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${widthPercentage}%` }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.5, delay: index * 0.1, ease: "easeOut" }}
                    className={`absolute left-0 top-0 bottom-0 ${data.color} opacity-40 rounded-r-xl md:rounded-xl`}
                  />
                  {/* Highlight core component of bar */}
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${widthPercentage}%` }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 1.5, delay: index * 0.1, ease: "easeOut" }}
                    className={`absolute left-0 top-0 bottom-0 w-1 ${data.color} rounded-r-xl md:rounded-xl z-10 shadow-[0_0_20px_rgba(255,255,255,0.8)]`}
                    style={{ left: `calc(${widthPercentage}% - 4px)` }}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: (index * 0.1) + 1 }}
                    className="relative z-20 px-4 flex items-center gap-1.5 font-bebas text-2xl text-white tracking-widest drop-shadow-md"
                  >
                    <DollarSign className="w-5 h-5 text-green-400" strokeWidth={3} />
                    {formattedRevenue}
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
