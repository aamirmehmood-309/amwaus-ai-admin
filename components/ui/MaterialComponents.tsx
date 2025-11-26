import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className, variant = 'primary', size = 'md', isLoading, children, ...props 
}, ref) => {
  const base = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-md hover:shadow-lg focus:ring-primary-500",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm focus:ring-slate-400",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200",
  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base",
  };

  return (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"/> : null}
      {children}
    </button>
  );
});

// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow disabled:cursor-not-allowed disabled:bg-slate-50",
        className
      )}
      {...props}
    />
  );
});

// Card
interface CardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className, ...props }: CardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn("bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6", className)}
    {...props}
  >
    {children}
  </motion.div>
);

// Stat Card for Dashboard
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
  color?: string;
  delay?: number;
}

export const StatCard = ({ title, value, icon: Icon, trend, trendUp, color = "primary", delay = 0 }: StatCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-lg bg-opacity-10", 
        color === 'primary' || color === 'indigo' ? "bg-primary-500 text-primary-600" : 
        `bg-${color}-500 text-${color}-600`
      )}>
        <Icon size={24} />
      </div>
      {trend && (
        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600")}>
          {trend}
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <div className="text-3xl font-bold text-slate-900">{value}</div>
  </motion.div>
);

// Label
export const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <label className={cn("text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block", className)}>
    {children}
  </label>
);

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="p-6">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:bg-slate-50 pr-8",
        className
      )}
      {...props}
    />
    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  </div>
));

// Badge
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'neutral' | 'info';
  className?: string;
}

export const Badge = ({ children, variant = 'neutral', className }: BadgeProps) => {
  const variants = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", variants[variant], className)}>
      {children}
    </span>
  );
};

// Table Helper
export const TableHeader = ({ children }: { children: React.ReactNode }) => (
  <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
    <tr>{children}</tr>
  </thead>
);

export const TableCell = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <td className={cn("px-6 py-4", className)}>{children}</td>
);