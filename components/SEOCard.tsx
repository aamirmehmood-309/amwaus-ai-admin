import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEOAuditResult } from '../types';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { Card } from './ui/MaterialComponents';
import { clsx } from 'clsx';

interface SEOCardProps {
  audit: SEOAuditResult | null;
  onRefresh: () => void;
}

const ScoreRing = ({ score }: { score: number }) => {
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let color = 'text-red-500';
  if (score >= 60) color = 'text-yellow-500';
  if (score >= 80) color = 'text-green-500';

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="24" cy="24" r="18" className="stroke-slate-200" strokeWidth="4" fill="none" />
        <circle 
          cx="24" cy="24" r="18" 
          className={clsx("transition-all duration-1000 ease-out", color)}
          strokeWidth="4" 
          fill="none" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-xs font-bold text-slate-700">{score}</span>
    </div>
  );
};

export const SEOCard: React.FC<SEOCardProps> = ({ audit, onRefresh }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  if (!audit) return (
    <Card className="flex items-center justify-center h-32">
        <button onClick={onRefresh} className="flex items-center text-indigo-600 gap-2 font-medium">
            <RefreshCw className="animate-spin" /> Analyzing SEO...
        </button>
    </Card>
  );

  return (
    <Card className="bg-white border-l-4 border-indigo-500 relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={clsx(
            "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg",
            audit.overallSEOGrade === 'A' ? 'bg-green-500' : 
            audit.overallSEOGrade === 'B' ? 'bg-teal-500' :
            audit.overallSEOGrade === 'C' ? 'bg-yellow-500' : 'bg-red-500'
          )}>
            {audit.overallSEOGrade}
          </div>
          <div>
            <h3 className="font-bold text-slate-800">SEO Score</h3>
            <p className="text-xs text-slate-500">{audit.issues.length} improvements found</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-slate-100 rounded-full">
            {isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100">
                <div className="text-center">
                    <ScoreRing score={audit.titleLengthScore} />
                    <span className="text-[10px] uppercase text-slate-400 font-bold mt-1 block">Title</span>
                </div>
                <div className="text-center">
                    <ScoreRing score={audit.metaDescriptionScore} />
                    <span className="text-[10px] uppercase text-slate-400 font-bold mt-1 block">Meta</span>
                </div>
                <div className="text-center">
                    <ScoreRing score={audit.keywordPresenceScore} />
                    <span className="text-[10px] uppercase text-slate-400 font-bold mt-1 block">Keywords</span>
                </div>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {audit.issues.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                        <CheckCircle size={16} /> All systems go!
                    </div>
                ) : (
                    audit.issues.map((issue) => (
                        <div key={issue.id} className="flex gap-2 items-start text-sm p-2 rounded bg-slate-50">
                            <AlertCircle size={16} className={clsx(
                                "mt-0.5 flex-shrink-0",
                                issue.severity === 'high' ? 'text-red-500' : 'text-yellow-500'
                            )} />
                            <span className="text-slate-600">{issue.message}</span>
                        </div>
                    ))
                )}
            </div>
            
            <div className="pt-2 text-center">
                 <button onClick={onRefresh} className="text-xs text-indigo-600 font-medium hover:underline flex items-center justify-center gap-1 w-full">
                    <RefreshCw size={12} /> Re-run Audit
                 </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};