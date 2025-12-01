import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, BarChart3, FileText, Globe, TrendingUp, Users, PieChart } from 'lucide-react';
import { BlogState } from '../types';
import { api } from '../services/api';
import { Card, StatCard } from './ui/MaterialComponents';
import { calculateSEOScore } from '../utils/seoAudit';

// Mock data generator for the graph if real dates aren't sufficient
const generateMockHistory = () => {
  return Array.from({ length: 7 }, (_, i) => ({
    day: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
    views: Math.floor(Math.random() * 500) + 100,
  }));
};

export const Dashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogState[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0,
    avgSeo: 0,
    categories: {} as Record<string, number>
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getAllBlogs();
      setBlogs(data);
      
      // Calculate Stats
      const published = data.filter(b => b.status === 'PUBLISHED').length;
      const drafts = data.length - published;
      
      // Calculate Avg SEO Score for published posts
      const seoScores = data
        .filter(b => b.status === 'PUBLISHED')
        .map(b => {
            const audit = calculateSEOScore(b);
            // Convert Grade to rough number for average
            const gradeMap: Record<string, number> = { 'A': 95, 'B': 85, 'C': 75, 'D': 65, 'F': 50 };
            return gradeMap[audit.overallSEOGrade] || 70;
        });
      const avgSeo = seoScores.length ? Math.round(seoScores.reduce((a, b) => a + b, 0) / seoScores.length) : 0;

      // Category Dist
      const cats: Record<string, number> = {};
      data.forEach(b => {
        const c = b.category || 'Uncategorized';
        cats[c] = (cats[c] || 0) + 1;
      });

      setStats({
        total: data.length,
        published,
        drafts,
        avgSeo,
        categories: cats
      });
    } catch (e) {
      console.error("Dashboard data load failed", e);
    } finally {
      setIsLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading Dashboard...</div>;

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of your blog performance and content velocity.</p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Posts" 
          value={stats.total} 
          icon={FileText} 
          color="primary"
          delay={0}
        />
        <StatCard 
          title="Published" 
          value={stats.published} 
          icon={Globe} 
          trend="+12%" 
          trendUp={true}
          color="green"
          delay={0.1}
        />
        <StatCard 
          title="Avg SEO Score" 
          value={stats.avgSeo > 0 ? `${stats.avgSeo}%` : 'N/A'} 
          icon={BarChart3} 
          trend={stats.avgSeo > 80 ? "Excellent" : "Needs Work"}
          trendUp={stats.avgSeo > 80}
          color="purple"
          delay={0.2}
        />
        <StatCard 
          title="Total Views (Est)" 
          value="12.5k" 
          icon={Users} 
          trend="+5.2%"
          trendUp={true}
          color="blue"
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Graph Area */}
        <Card className="lg:col-span-2 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity size={18} className="text-primary-500" />
              Traffic Overview
            </h3>
            <select className="text-xs border-none bg-slate-50 rounded-lg px-2 py-1 text-slate-500 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-4">
            {generateMockHistory().map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="relative w-full h-full flex items-end justify-center">
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${(item.views / 600) * 100}%` }}
                     transition={{ duration: 1, delay: index * 0.1, type: "spring" }}
                     className="w-full bg-primary-500/20 rounded-t-lg group-hover:bg-primary-500/40 transition-colors relative"
                   >
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: "40%" }} // Simulate "unique views" or secondary metric
                        transition={{ duration: 1.2, delay: index * 0.1 }}
                        className="absolute bottom-0 w-full bg-primary-500 rounded-t-lg"
                      />
                   </motion.div>
                   {/* Tooltip */}
                   <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10">
                     {item.views} views
                   </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">{item.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Category Distribution */}
        <Card className="h-[400px] flex flex-col overflow-y-auto">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <PieChart size={18} className="text-purple-500" />
            Categories
          </h3>
          <div className="flex-1 flex flex-col justify-center space-y-6">
            {Object.entries(stats.categories).map(([cat, count], idx) => {
               const percentage = Math.round((count / stats.total) * 100);
               return (
                 <div key={cat} className="space-y-1">
                   <div className="flex justify-between text-sm">
                     <span className="capitalize text-slate-600 font-medium">{cat}</span>
                     <span className="text-slate-400">{percentage}%</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${percentage}%` }}
                       transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                       className={`h-full rounded-full ${['bg-primary-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'][idx % 4]}`}
                     />
                   </div>
                 </div>
               );
            })}
            {Object.keys(stats.categories).length === 0 && (
              <div className="text-center text-slate-400 text-sm">No data available</div>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-500" />
            Recent Posts
        </h3>
        <div className="overflow-x-auto">
           <table className="w-full text-sm text-left">
             <thead className="text-xs text-slate-400 uppercase bg-slate-50/50">
               <tr>
                 <th className="px-4 py-3 rounded-l-lg">Title</th>
                 <th className="px-4 py-3">Category</th>
                 <th className="px-4 py-3">Status</th>
                 {/* <th className="px-4 py-3 text-right rounded-r-lg">Published</th> */}
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {blogs.slice(0, 5).map((blog) => (
                  <tr key={blog.id || blog.slug} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-700">{blog.title || 'Untitled'}</td>
                    <td className="px-4 py-3">
                       <span className="px-2 py-1 bg-primary-50 text-primary-600 rounded-md text-xs font-semibold capitalize">
                         {blog.category}
                       </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        blog.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    {/* <td className="px-4 py-3 text-right text-slate-500">
                      {blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString() : '-'}
                    </td> */}
                  </tr>
                ))}
             </tbody>
           </table>
        </div>
      </Card>
    </motion.div>
  );
};