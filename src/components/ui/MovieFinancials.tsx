import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface FinancialsProps {
  budget: number;
  revenue: number;
}

export const MovieFinancials = ({ budget, revenue }: FinancialsProps) => {
  // If we don't have revenue data (common for older or very new movies on TMDB)
  // we shouldn't show a broken chart. Budget is usually more reliably present but
  // without revenue, a comparison chart is meaningless.
  if (!budget && !revenue) return null;

  const maxVal = Math.max(budget, revenue);
  const budgetPercentage = maxVal > 0 ? (budget / maxVal) * 100 : 0;
  const revenuePercentage = maxVal > 0 ? (revenue / maxVal) * 100 : 0;

  const formatCurrency = (val: number) => {
    if (val === 0) return 'Unknown';
    if (val >= 1000000000) return `$${(val / 1000000000).toFixed(2)}B`;
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    return `$${val.toLocaleString()}`;
  };

  const isProfit = revenue > budget;
  const hasBoth = budget > 0 && revenue > 0;
  
  let StatusIcon = Minus;
  let statusColor = 'text-gray-400';
  let statusBg = 'bg-gray-500/10 border-gray-500/20';
  let rawProfit = 0;

  if (hasBoth) {
      rawProfit = revenue - budget;
      if (isProfit) {
          StatusIcon = TrendingUp;
          statusColor = 'text-green-400';
          statusBg = 'bg-green-500/10 border-green-500/20';
      } else {
          StatusIcon = TrendingDown;
          statusColor = 'text-red-400';
          statusBg = 'bg-red-500/10 border-red-500/20';
      }
  }

  return (
    <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 md:p-8 w-full">
      <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
         <h3 className="text-2xl font-bebas text-white flex items-center gap-2">
           <DollarSign className="w-6 h-6 text-green-500" />
           Box Office Financials
         </h3>
         
         {hasBoth && (
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${statusBg}`}>
               <StatusIcon className={`w-4 h-4 ${statusColor}`} />
               <span className={`font-sans font-bold text-sm ${statusColor}`}>
                  {isProfit ? 'Profit:' : 'Loss:'} {formatCurrency(Math.abs(rawProfit))}
               </span>
            </div>
         )}
      </div>

      <div className="space-y-6">
         {/* Budget Bar */}
         <div>
            <div className="flex justify-between text-sm font-sans mb-2">
               <span className="text-gray-400 uppercase tracking-wider font-bold">Budget</span>
               <span className="text-white font-bold">{formatCurrency(budget)}</span>
            </div>
            <div className="h-4 bg-black rounded-full overflow-hidden border border-white/5 relative">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: `${budgetPercentage}%` }}
                 viewport={{ once: true }}
                 transition={{ duration: 1, ease: "easeOut" }}
                 className="absolute left-0 top-0 bottom-0 bg-red-500/80 rounded-full"
               />
            </div>
         </div>

         {/* Revenue Bar */}
         <div>
            <div className="flex justify-between text-sm font-sans mb-2">
               <span className="text-gray-400 uppercase tracking-wider font-bold">Worldwide Revenue</span>
               <span className="text-white font-bold">{formatCurrency(revenue)}</span>
            </div>
            <div className="h-4 bg-black rounded-full overflow-hidden border border-white/5 relative">
               <motion.div 
                 initial={{ width: 0 }}
                 whileInView={{ width: `${revenuePercentage}%` }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                 className="absolute left-0 top-0 bottom-0 bg-green-500/80 rounded-full"
               />
            </div>
         </div>
      </div>
    </div>
  );
};
