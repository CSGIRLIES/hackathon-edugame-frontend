import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const IntroPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((e) => console.error('Video play failed:', e));
    }
  }, []);

  const handleVideoEnd = () => {
    navigate('/landing');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'black',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <video
        ref={videoRef}
        src="/pawintro.mov"
        onEnded={handleVideoEnd}
        muted={false}
        playsInline
        style={{
          width: '100vh',
          height: '56.25vw',
          transform: 'rotate(90deg)',
          transformOrigin: 'center'
        }}
      >
        Votre navigateur ne supporte pas la vidéo.
      </video>
    </div>
  );
};

export default IntroPage;
