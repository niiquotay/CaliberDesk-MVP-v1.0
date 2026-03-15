
import React from 'react';

const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#0a4179]">
      {/* 3D Perspective Container */}
      <div className="absolute inset-0" style={{ perspective: '1200px' }}>
        
        {/* Animated 3D Neural Mesh */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20" 
             style={{ 
               transformStyle: 'preserve-3d',
               animation: 'float-3d 30s ease-in-out infinite alternate'
             }}>
          
          {/* Layer 1: Gold Grid */}
          <div className="absolute w-[200%] h-[200%] border-[0.5px] border-[#F0C927]/10"
               style={{ transform: 'rotateX(60deg) translateZ(-200px)' }}></div>
          
          {/* Layer 2: Emerald Orbs */}
          <div className="absolute w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full blur-[100px]"
                style={{
                  width: `${200 + i * 50}px`,
                  height: `${200 + i * 50}px`,
                  background: i % 2 === 0 ? 'rgba(240, 201, 39, 0.15)' : 'rgba(65, 213, 153, 0.15)',
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  transform: `translateZ(${Math.random() * 400 - 200}px)`,
                  animation: `orb-float-${i} ${20 + i * 5}s ease-in-out infinite alternate`
                }}
              />
            ))}
          </div>

          {/* Layer 3: Secondary Tilt Grid */}
          <div className="absolute w-[200%] h-[200%] border-[0.5px] border-[#1F8E85]/5"
               style={{ transform: 'rotateX(-45deg) rotateY(15deg) translateZ(100px)' }}></div>
        </div>
      </div>

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-3d {
          0% { transform: rotateY(-5deg) rotateX(0deg); }
          100% { transform: rotateY(5deg) rotateX(2deg); }
        }

        ${[...Array(6)].map((_, i) => `
          @keyframes orb-float-${i} {
            0% { transform: translate3d(0, 0, ${Math.random() * 200}px) scale(1); }
            100% { transform: translate3d(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px, ${Math.random() * -200}px) scale(1.2); }
          }
        `).join('\n')}
      `}} />
    </div>
  );
};

export default Background3D;
