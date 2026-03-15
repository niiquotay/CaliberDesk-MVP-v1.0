import React, { useState } from 'react';
import { 
  BookOpen, Calendar, Clock, User, Tag, ArrowLeft, 
  Plus, Edit3, Trash2, Save, X, Image as ImageIcon,
  ChevronRight, Sparkles, Share2, Bookmark, MapPin, ExternalLink,
  TrendingUp, BarChart3, PieChart, Activity, Globe, Briefcase, Zap, CheckCircle2
} from 'lucide-react';
import { BlogPost, UserProfile, CaliberEvent, Job, Application } from '../types';
import { MOCK_BLOG_POSTS, MOCK_EVENTS } from '../constants';
import Markdown from 'react-markdown';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';

const MARKET_STATS = [
  { month: 'Jan', demand: 45, supply: 30, salary: 65000 },
  { month: 'Feb', demand: 52, supply: 32, salary: 67000 },
  { month: 'Mar', demand: 48, supply: 35, salary: 66500 },
  { month: 'Apr', demand: 61, supply: 38, salary: 69000 },
  { month: 'May', demand: 55, supply: 40, salary: 71000 },
  { month: 'Jun', demand: 67, supply: 42, salary: 73000 },
];

const SKILL_DEMAND = [
  { name: 'AI/ML', value: 85, color: '#F0C927' },
  { name: 'Cybersecurity', value: 72, color: '#41d599' },
  { name: 'Cloud Arch', value: 68, color: '#60a5fa' },
  { name: 'Data Eng', value: 64, color: '#f472b6' },
  { name: 'DevOps', value: 58, color: '#a78bfa' },
];

const PremiumAd: React.FC<{ type: 'banner' | 'sidebar' | 'inline', className?: string }> = ({ type, className = "" }) => {
  const ads = {
    banner: {
      title: "Scale Your Engineering Team",
      desc: "Get 20% off your first professional hiring campaign with CaliberDesk Premium.",
      cta: "Learn More",
      img: "https://picsum.photos/seed/ad1/1200/200"
    },
    sidebar: {
      title: "AI Resume Builder",
      desc: "Optimize your CV for ATS in seconds.",
      cta: "Try Now",
      img: "https://picsum.photos/seed/ad2/400/300"
    },
    inline: {
      title: "Global Talent Summit 2026",
      desc: "Join the world's leading HR tech conference. Early bird tickets available.",
      cta: "Register",
      img: "https://picsum.photos/seed/ad3/600/400"
    }
  };

  const ad = ads[type];

  if (type === 'banner') {
    return (
      <div 
        onClick={() => window.open('https://caliberdesk.com/premium', '_blank')}
        className={`relative overflow-hidden rounded-[2rem] border border-[#F0C927]/20 bg-gradient-to-r from-white to-gray-100 p-8 flex flex-col md:flex-row items-center justify-between gap-6 group cursor-pointer hover:border-[#F0C927]/40 transition-all ${className}`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0C927]/5 rounded-full blur-[80px]"></div>
        <div className="relative z-10 flex items-center gap-6">
          <div>
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#F0C927] mb-1 block">Sponsored Insight</span>
            <h4 className="text-2xl font-black text-gray-900">{ad.title}</h4>
            <p className="text-sm text-gray-500 font-medium">{ad.desc}</p>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div className={`bg-white shadow-xl border border-gray-200 rounded-[2rem] overflow-hidden border-[#F0C927]/20 group ${className}`}>
        <div className="h-32 relative overflow-hidden">
          <img src={ad.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Ad" referrerPolicy="no-referrer" />
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-gray-200 backdrop-blur-md text-[#F0C927] text-[6px] font-black uppercase tracking-widest">
            Ad
          </div>
        </div>
        <div className="p-5 space-y-3">
          <h4 className="text-sm font-black text-gray-900">{ad.title}</h4>
          <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{ad.desc}</p>
          <button className="w-full py-3 rounded-xl bg-gray-100 border border-gray-200 text-[9px] font-black uppercase tracking-widest text-[#F0C927] hover:bg-[#F0C927] hover:text-[#0a4179] transition-all">
            {ad.cta}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow-xl border border-gray-200 rounded-[2rem] overflow-hidden border-gray-100 group ${className}`}>
      <div className="h-40 relative overflow-hidden">
        <img src={ad.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Ad" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-gray-200 backdrop-blur-md text-[#F0C927] text-[7px] font-black uppercase tracking-widest">
          Partner Content
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h4 className="text-base font-black text-gray-900">{ad.title}</h4>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{ad.desc}</p>
        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#F0C927] group-hover:translate-x-1 transition-transform">
          {ad.cta} <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

interface BlogProps {
  user: UserProfile;
  category?: string | null;
  jobs: Job[];
  applications: Application[];
}

const BlogCard: React.FC<{ post: BlogPost; onClick: () => void; isFeatured?: boolean }> = ({ post, onClick, isFeatured }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isHovered && post.videoUrl && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      timeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }, 8000);
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered, post.videoUrl]);

  if (isFeatured) {
    return (
      <div 
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative h-[320px] rounded-[2rem] overflow-hidden border border-gray-200 cursor-pointer shadow-2xl transition-all duration-500 hover:border-[#F0C927]/30"
      >
        {post.videoUrl && isHovered ? (
          <video 
            ref={videoRef}
            src={post.videoUrl} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            muted 
            loop 
            playsInline
          />
        ) : (
          <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={post.title} referrerPolicy="no-referrer" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-gray-100/40 to-transparent"></div>
        <div className="absolute bottom-8 left-10 right-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-[#41d599] text-[#06213f] text-[9px] font-black uppercase tracking-widest">Featured</span>
            <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{post.readTime}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-gray-900 mb-4 group-hover:text-[#F0C927] transition-colors">
            {post.title}
          </h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 font-black text-xs">
              {post.author[0]}
            </div>
            <div>
              <p className="text-xs font-black text-gray-900">{post.author}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{post.authorRole}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white shadow-xl border border-gray-200 rounded-[2rem] overflow-hidden border-gray-100 cursor-pointer hover:border-[#F0C927]/20 transition-all duration-500 hover:-translate-y-1"
    >
      <div className="h-40 relative overflow-hidden">
        {post.videoUrl && isHovered ? (
          <video 
            ref={videoRef}
            src={post.videoUrl} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            muted 
            loop 
            playsInline
          />
        ) : (
          <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={post.title} referrerPolicy="no-referrer" />
        )}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-gray-200 backdrop-blur-md text-gray-700 text-[6px] font-black uppercase tracking-widest">
          {post.readTime}
        </div>
      </div>
      <div className="p-5 space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[7px] font-black uppercase tracking-widest text-[#F0C927] opacity-60">#{tag}</span>
          ))}
        </div>
        <h3 className="text-sm font-black tracking-tight leading-tight text-gray-900 group-hover:text-[#F0C927] transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-500 text-[10px] font-medium line-clamp-2 leading-relaxed">
          {post.content.substring(0, 100)}...
        </p>
        <div className="pt-2.5 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-900 font-black text-[8px]">
              {post.author[0]}
            </div>
            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{post.author}</span>
          </div>
          <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

const MarketNewsCard: React.FC<{ post: BlogPost; onClick: () => void }> = ({ post, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isHovered && post.videoUrl && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      timeoutRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }, 8000);
    } else if (!isHovered && videoRef.current) {
      videoRef.current.pause();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isHovered, post.videoUrl]);

  return (
    <div 
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group bg-white shadow-xl border border-gray-200 rounded-[2rem] overflow-hidden border-gray-100 cursor-pointer hover:border-[#F0C927]/20 transition-all duration-500"
    >
      <div className="h-36 relative overflow-hidden">
        {post.videoUrl && isHovered ? (
          <video 
            ref={videoRef}
            src={post.videoUrl} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            muted 
            loop 
            playsInline
          />
        ) : (
          <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={post.title} referrerPolicy="no-referrer" />
        )}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-gray-200 backdrop-blur-md text-gray-700 text-[6px] font-black uppercase tracking-widest">
          {post.readTime}
        </div>
      </div>
      <div className="p-5 space-y-2.5">
        <h3 className="text-sm font-black tracking-tight leading-tight text-gray-900 group-hover:text-[#F0C927] transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-gray-500 text-[10px] font-medium line-clamp-2 leading-relaxed">
          {post.content.substring(0, 100)}...
        </p>
        <div className="pt-2.5 flex items-center justify-between border-t border-gray-100">
          <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{new Date(post.publishedAt).toLocaleDateString()}</span>
          <ChevronRight size={12} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
};

const Blog: React.FC<BlogProps> = ({ user, category, jobs, applications }) => {
  const [posts, setPosts] = useState<BlogPost[]>(MOCK_BLOG_POSTS);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editPost, setEditPost] = useState<Partial<BlogPost> | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(category || 'Market Data');
  const [selectedEvent, setSelectedEvent] = useState<CaliberEvent | null>(null);

  React.useEffect(() => {
    if (category) {
      setActiveCategory(category);
    }
  }, [category]);

  const isAdmin = user.isAdmin || user.opRole === 'super_admin';

  const filteredPosts = activeCategory && activeCategory !== 'All' 
    ? posts.filter(p => p.tags.some(t => {
        const tag = t.toLowerCase();
        const cat = activeCategory.toLowerCase();
        if (tag === cat) return true;
        if (cat === 'market data' && (tag === 'tech' || tag === 'trends' || tag === 'data')) return true;
        if (cat === 'events' && tag === 'event') return true;
        if (cat === 'thought leadership' && (tag === 'career' || tag === 'ai' || tag === 'recruitment' || tag === 'future of work')) return true;
        if (cat === 'company news' && (tag === 'expansion' || tag === 'global' || tag === 'news')) return true;
        return false;
      }))
    : posts;

  const categories = ['Thought Leadership', 'Market Data', 'Events', 'Company News', 'Job Seekers', 'Employers'];

  const handleCreatePost = () => {
    const newPost: Partial<BlogPost> = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      content: '',
      author: user.name,
      authorRole: user.role || 'Administrator',
      publishedAt: new Date().toISOString(),
      tags: [],
      readTime: '5 min read',
      imageUrl: 'https://picsum.photos/seed/blog/800/400'
    };
    setEditPost(newPost);
    setIsEditing(true);
  };

  const handleEditPost = (post: BlogPost) => {
    setEditPost(post);
    setIsEditing(true);
  };

  const handleSavePost = () => {
    if (!editPost?.title || !editPost?.content) return;

    const postToSave = editPost as BlogPost;
    setPosts(prev => {
      const exists = prev.find(p => p.id === postToSave.id);
      if (exists) {
        return prev.map(p => p.id === postToSave.id ? postToSave : p);
      }
      return [postToSave, ...prev];
    });
    setIsEditing(false);
    setEditPost(null);
    if (selectedPost?.id === postToSave.id) {
      setSelectedPost(postToSave);
    }
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setPosts(prev => prev.filter(p => p.id !== id));
      if (selectedPost?.id === id) setSelectedPost(null);
    }
  };

  if (isEditing && editPost) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Cancel</span>
          </button>
          <button 
            onClick={handleSavePost}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#41d599] text-[#0a4179] font-black text-xs uppercase tracking-widest shadow-xl shadow-[#41d599]/20 hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Save size={18} /> Save Post
          </button>
        </div>

        <div className="space-y-8 bg-white shadow-xl border border-gray-200 rounded-[2rem] p-10 rounded-[2.5rem] border-gray-200">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Article Title</label>
            <input 
              type="text"
              value={editPost.title}
              onChange={e => setEditPost({ ...editPost, title: e.target.value })}
              className="w-full bg-gray-100 border border-gray-200 rounded-2xl p-5 text-xl font-black focus:border-[#F0C927] outline-none transition-all"
              placeholder="Enter a compelling title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Cover Image URL</label>
              <div className="relative">
                <input 
                  type="text"
                  value={editPost.imageUrl}
                  onChange={e => setEditPost({ ...editPost, imageUrl: e.target.value })}
                  className="w-full bg-gray-100 border border-gray-200 rounded-2xl p-4 pl-12 text-sm font-bold focus:border-[#F0C927] outline-none transition-all"
                  placeholder="https://..."
                />
                <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Tags (comma separated)</label>
              <div className="relative">
                <input 
                  type="text"
                  value={editPost.tags?.join(', ')}
                  onChange={e => setEditPost({ ...editPost, tags: e.target.value.split(',').map(t => t.trim()) })}
                  className="w-full bg-gray-100 border border-gray-200 rounded-2xl p-4 pl-12 text-sm font-bold focus:border-[#F0C927] outline-none transition-all"
                  placeholder="Tech, Career, AI..."
                />
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-2">Content (Markdown Supported)</label>
            <textarea 
              value={editPost.content}
              onChange={e => setEditPost({ ...editPost, content: e.target.value })}
              className="w-full bg-gray-100 border border-gray-200 rounded-2xl p-6 text-sm font-medium min-h-[400px] focus:border-[#F0C927] outline-none transition-all resize-none custom-scrollbar"
              placeholder="Write your article here..."
            />
          </div>
        </div>
      </div>
    );
  }

  if (selectedPost) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setSelectedPost(null)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back to Feed</span>
          </button>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button onClick={() => handleEditPost(selectedPost)} className="p-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:text-[#F0C927] hover:border-[#F0C927]/30 transition-all">
                  <Edit3 size={18} />
                </button>
                <button onClick={() => handleDeletePost(selectedPost.id)} className="p-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:text-red-400 hover:border-red-400/30 transition-all">
                  <Trash2 size={18} />
                </button>
              </>
            )}
            <button className="p-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-900 transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </div>

        <article className="bg-white shadow-xl border border-gray-200 rounded-[3rem] overflow-hidden border-gray-200 shadow-2xl">
          {selectedPost.imageUrl && (
            <div className="h-[400px] w-full relative">
              <img src={selectedPost.imageUrl} className="w-full h-full object-cover" alt={selectedPost.title} referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedPost.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-[#F0C927] text-[#0a4179] text-[10px] font-black uppercase tracking-widest">
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-gray-900 mb-4">
                  {selectedPost.title}
                </h1>
                <div className="flex items-center gap-6 text-gray-600 text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-[#F0C927]" />
                    <span>{selectedPost.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#41d599]" />
                    <span>{new Date(selectedPost.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-blue-400" />
                    <span>{selectedPost.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="p-10 md:p-16">
            <div className="prose prose-invert max-w-none">
              <div className="markdown-body">
                <Markdown>{selectedPost.content}</Markdown>
              </div>
            </div>

            <div className="mt-16 pt-10 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F0C927]/10 flex items-center justify-center text-[#F0C927] font-black text-lg">
                  {selectedPost.author[0]}
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">{selectedPost.author}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{selectedPost.authorRole}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 transition-all text-[10px] font-black uppercase tracking-widest">
                <Bookmark size={16} /> Save for later
              </button>
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-full w-full p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Main Header Removed per request */}


      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white shadow-xl border border-gray-200 rounded-[2rem] w-full max-w-2xl rounded-[3rem] overflow-hidden border-gray-200 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="relative h-64">
              <img src={selectedEvent.imageUrl} className="w-full h-full object-cover" alt={selectedEvent.title} referrerPolicy="no-referrer" />
              <button 
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 p-3 rounded-full bg-gray-200 backdrop-blur-md text-gray-900 hover:bg-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-6 left-8">
                <span className="px-3 py-1 rounded-full bg-[#F0C927] text-[#0a4179] text-[10px] font-black uppercase tracking-widest">
                  {selectedEvent.type}
                </span>
              </div>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-black tracking-tight text-gray-900 leading-tight">
                  {selectedEvent.title}
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-3 text-gray-600 text-xs font-bold">
                    <Calendar size={16} className="text-[#F0C927]" />
                    <div>
                      <p className="text-gray-500 uppercase tracking-widest text-[8px]">Date & Time</p>
                      <p>{new Date(selectedEvent.date).toLocaleDateString()} @ {selectedEvent.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600 text-xs font-bold">
                    <MapPin size={16} className="text-[#41d599]" />
                    <div>
                      <p className="text-gray-500 uppercase tracking-widest text-[8px]">Location</p>
                      <p>{selectedEvent.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-gray-500 uppercase tracking-widest text-[8px] font-black">About this event</p>
                <p className="text-gray-600 text-sm leading-relaxed font-medium">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#F0C927] font-black">
                    {selectedEvent.organizer[0]}
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-900">{selectedEvent.organizer}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Organizer</p>
                  </div>
                </div>
                <a 
                  href={selectedEvent.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-[#F0C927] text-[#0a4179] font-black text-xs uppercase tracking-widest shadow-xl shadow-[#F0C927]/20 hover:scale-[1.05] active:scale-95 transition-all"
                >
                  Book Participation <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeCategory === 'Events' ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar Box */}
            <div className="lg:col-span-1 bg-white shadow-xl border border-gray-200 rounded-[2.5rem] p-6 border-gray-200 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black tracking-tighter uppercase text-gray-900">Upcoming <span className="text-[#F0C927]">Events</span></h3>
                <Calendar className="text-[#F0C927]" size={18} />
              </div>
              
              <div className="space-y-4">
                {MOCK_EVENTS.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full group flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-100 transition-all text-left"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 flex flex-col items-center justify-center border border-gray-200 group-hover:border-[#F0C927]/30 transition-colors">
                      <span className="text-[8px] font-black uppercase tracking-tighter text-gray-500">
                        {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                      <span className="text-lg font-black text-[#F0C927]">
                        {new Date(event.date).getDate()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-900 group-hover:text-[#F0C927] transition-colors line-clamp-1">{event.title}</p>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{event.time} • {event.type}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                  Sync with your calendar
                </p>
              </div>

              {/* Sidebar Ad in Events */}
              <PremiumAd type="sidebar" />
            </div>

            {/* Events Feed */}
            <div className="lg:col-span-2 space-y-5">
              {MOCK_EVENTS.map((event, idx) => (
                <React.Fragment key={event.id}>
                  <div 
                    onClick={() => setSelectedEvent(event)}
                    className="group bg-white shadow-xl border border-gray-200 rounded-[2rem] overflow-hidden border-gray-100 cursor-pointer hover:border-[#F0C927]/20 transition-all duration-500 flex flex-col md:flex-row h-full md:h-48"
                  >
                    <div className="md:w-52 h-36 md:h-full relative overflow-hidden">
                      <img src={event.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={event.title} referrerPolicy="no-referrer" />
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-gray-200 backdrop-blur-md text-[#F0C927] text-[6px] font-black uppercase tracking-widest">
                        {event.type}
                      </div>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5 text-[8px] font-black uppercase tracking-widest text-gray-500">
                          <span className="flex items-center gap-1"><Calendar size={10} className="text-[#F0C927]" /> {new Date(event.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><MapPin size={10} className="text-[#41d599]" /> {event.location}</span>
                        </div>
                        <h3 className="text-lg font-black tracking-tight leading-tight text-gray-900 group-hover:text-[#F0C927] transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-gray-500 text-[10px] font-medium line-clamp-2 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                      <div className="pt-2.5 flex items-center justify-between border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center text-[7px] font-black text-[#F0C927]">
                            {event.organizer[0]}
                          </div>
                          <span className="text-[8px] font-black text-gray-500">{event.organizer}</span>
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#F0C927] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          View Details <ChevronRight size={10} />
                        </span>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      ) : activeCategory === 'Market Data' ? (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Platform Performance Metrics */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Activity className="text-[#F0C927]" size={20} />
              <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">Platform <span className="text-[#F0C927]">Insights</span></h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'All-Time Listings', value: (jobs.length * 12).toLocaleString(), icon: BookOpen, color: 'text-blue-400' },
                { label: 'Current Active', value: jobs.filter(j => j.status === 'active').length.toLocaleString(), icon: Zap, color: 'text-[#F0C927]' },
                { label: 'Candidates Hired', value: (applications.filter(a => a.status === 'hired').length + 1240).toLocaleString(), icon: CheckCircle2, color: 'text-[#41d599]' },
                { label: 'Total Employers', value: (new Set(jobs.map(j => j.company)).size + 45).toLocaleString(), icon: Briefcase, color: 'text-purple-400' },
                { label: 'Active Hiring', value: new Set(jobs.filter(j => j.status === 'active').map(j => j.company)).size.toLocaleString(), icon: TrendingUp, color: 'text-emerald-400' },
                { label: 'Avg. Match Rate', value: '74%', icon: Sparkles, color: 'text-pink-400' },
              ].map((stat, i) => (
                <div key={i} className="bg-white shadow-xl border border-gray-200 rounded-[2rem] p-4 rounded-2xl border-gray-100 flex flex-col justify-between gap-2">
                  <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={16} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-lg font-black text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Dashboard Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow-xl border border-gray-200 rounded-[2rem] p-6 border-gray-200 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">Platform <span className="text-[#41d599]">Growth</span></h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">User & Job Acquisition (Last 6 Months)</p>
                </div>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { month: 'Oct', users: 1200, jobs: 450 },
                    { month: 'Nov', users: 1800, jobs: 620 },
                    { month: 'Dec', users: 2400, jobs: 890 },
                    { month: 'Jan', users: 3100, jobs: 1100 },
                    { month: 'Feb', users: 4200, jobs: 1450 },
                    { month: 'Mar', users: 5600, jobs: 1890 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 900 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 900 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', color: '#111827' }} />
                    <Bar dataKey="users" fill="#41d599" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="jobs" fill="#F0C927" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <PremiumAd type="sidebar" className="h-full" />
          </div>

          <div className="bg-white shadow-xl border border-gray-200 rounded-[2rem] p-6 border-gray-200 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">Hiring <span className="text-blue-400">Efficiency</span></h3>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Time-to-Hire & Success Rate</p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-gray-100 border border-gray-100 space-y-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Avg. Time to Hire</p>
                <p className="text-2xl font-black text-gray-900">18 <span className="text-xs text-gray-500">Days</span></p>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 w-[65%]"></div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-100 border border-gray-100 space-y-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Placement Success</p>
                <p className="text-2xl font-black text-gray-900">92 <span className="text-xs text-gray-500">%</span></p>
                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#41d599] w-[92%]"></div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gray-100 border border-gray-100 space-y-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Interview Ratio</p>
                <p className="text-2xl font-black text-gray-900">1:5</p>
                <p className="text-[8px] font-bold text-[#41d599]">Top 5% Industry</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-100 border border-gray-100 space-y-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Offer Acceptance</p>
                <p className="text-2xl font-black text-gray-900">88%</p>
                <p className="text-[8px] font-bold text-[#F0C927]">+4.2% vs Last Mo</p>
              </div>
            </div>
          </div>

          {/* Market Dashboard Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Global Job Growth', value: '+12.4%', icon: TrendingUp, color: 'text-[#41d599]' },
              { label: 'Avg. Tech Salary', value: '$112k', icon: BarChart3, color: 'text-[#F0C927]' },
              { label: 'Remote Adoption', value: '68%', icon: Globe, color: 'text-blue-400' },
              { label: 'Market Volatility', value: 'Low', icon: Activity, color: 'text-purple-400' },
            ].map((stat, i) => (
              <div key={i} className="bg-white shadow-xl border border-gray-200 rounded-[2rem] p-4 rounded-2xl border-gray-100 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={20} />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">{stat.label}</p>
                  <p className="text-xl font-black text-gray-900">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white shadow-xl border border-gray-200 rounded-[2rem] p-6 border-gray-200 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">Hiring <span className="text-[#F0C927]">Trends</span></h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Demand vs Supply Analysis (2026)</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#F0C927]"></div>
                    <span className="text-[10px] font-bold text-gray-600">Demand</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#41d599]"></div>
                    <span className="text-[10px] font-bold text-gray-600">Supply</span>
                  </div>
                </div>
              </div>

              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MARKET_STATS}>
                    <defs>
                      <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F0C927" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F0C927" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorSupply" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#41d599" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#41d599" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 900 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(0,0,0,0.4)', fontSize: 10, fontWeight: 900 }} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '16px', color: '#111827' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="demand" stroke="#F0C927" strokeWidth={3} fillOpacity={1} fill="url(#colorDemand)" />
                    <Area type="monotone" dataKey="supply" stroke="#41d599" strokeWidth={3} fillOpacity={1} fill="url(#colorSupply)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Skill Demand Chart */}
            <div className="bg-white shadow-xl border border-gray-200 rounded-[2rem] p-6 border-gray-200 space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black tracking-tight text-gray-900 uppercase">Skill <span className="text-[#41d599]">Demand</span></h3>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Top Emerging Skills index</p>
              </div>

              <div className="space-y-6">
                {SKILL_DEMAND.map((skill, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-gray-600">{skill.name}</span>
                      <span className="text-gray-900">{skill.value}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${skill.value}%`, backgroundColor: skill.color }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button className="w-full py-4 rounded-2xl bg-gray-100 border border-gray-200 text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all">
                  Download Full Report
                </button>
              </div>
            </div>
          </div>

          {/* Market News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredPosts.map((post, idx) => (
              <React.Fragment key={post.id}>
                <MarketNewsCard post={post} onClick={() => setSelectedPost(post)} />
                {idx === 2 && <PremiumAd type="inline" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Featured Post */}
      {filteredPosts.length > 0 && (
        <BlogCard post={filteredPosts[0]} onClick={() => setSelectedPost(filteredPosts[0])} isFeatured />
      )}

      {/* Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPosts.slice(1).map((post, idx) => (
            <React.Fragment key={post.id}>
              <BlogCard post={post} onClick={() => setSelectedPost(post)} />
              {idx === 2 && <PremiumAd type="inline" />}
            </React.Fragment>
          ))}
        </div>
        <div className="lg:col-span-1 space-y-6">
          <PremiumAd type="sidebar" />
          <PremiumAd type="sidebar" />
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="bg-white shadow-xl border border-gray-200 rounded-[3rem] p-12 md:p-20 border-gray-200 relative overflow-hidden text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0C927]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#41d599]/5 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase text-gray-900">
            Join the <span className="text-[#F0C927]">Inner Circle</span>
          </h2>
          <p className="text-gray-500 text-sm font-medium leading-relaxed">
            Get the latest insights, market trends, and career advice delivered straight to your inbox. 
            No spam, just pure intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="email" 
              placeholder="Enter your professional email"
              className="flex-1 bg-gray-100 border border-gray-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-[#F0C927] outline-none transition-all"
            />
            <button className="px-8 py-4 rounded-2xl bg-[#F0C927] text-[#0a4179] font-black text-xs uppercase tracking-widest shadow-xl shadow-[#F0C927]/20 hover:scale-[1.05] active:scale-95 transition-all">
              Subscribe
            </button>
          </div>
        </div>
      </div>
        </>
      )}
      </div>
    </div>
  );
};

export default Blog;
