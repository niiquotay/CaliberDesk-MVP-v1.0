import React from 'react';
import { MOCK_BLOG_POSTS } from '../constants';

interface BlogWidgetProps {
  onNavigateToBlog: () => void;
  limit?: number;
}

const BlogWidget: React.FC<BlogWidgetProps> = ({ onNavigateToBlog, limit = 2 }) => {
  const latestPosts = MOCK_BLOG_POSTS.slice(0, limit);

  return (
    <div className="glass-premium rounded-[2rem] p-6 border-white/10 space-y-6">
      <div className="space-y-4">
        {latestPosts.map((post) => (
          <div 
            key={post.id}
            onClick={onNavigateToBlog}
            className="group cursor-pointer space-y-1"
          >
            <div className="px-1">
              <h4 className="text-xs font-black text-white group-hover:text-[#F0C927] transition-colors line-clamp-1 leading-tight">
                {post.title}
              </h4>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-white/5">
        <button 
          onClick={onNavigateToBlog}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-[#F0C927] hover:text-[#0a4179] transition-all"
        >
          Read Market Reports
        </button>
      </div>
    </div>
  );
};

export default BlogWidget;
