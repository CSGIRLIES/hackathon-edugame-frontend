import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getFoodItemsForAnimal, canAccessSpecialFood, getFoodItem } from '../data/foodItems';

interface AnimalProps {
  type: string;
  color: string;
  level: 'baby' | 'adolescent' | 'adult' | string;
  xp?: number;
  context?: 'dashboard' | 'learning' | 'break' | 'quiz' | 'onboarding';
  onFoodClick?: (food: string, cost: number) => void;
}

interface DashboardProps {
  t: (key: string) => string;
}

type AnimationType = 'idle' | 'walk' | 'run' | 'sit' | 'happy';

const Animal: React.FC<AnimalProps> = ({ type, color, level, xp = 0, context = 'dashboard', onFoodClick }) => {
  const { t } = useTranslation();
  const [messageIndex, setMessageIndex] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>('idle');
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [facing, setFacing] = useState<'left' | 'right'>('right');
  const [currentFrame, setCurrentFrame] = useState(0);
  const [showFoodMenu, setShowFoodMenu] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [canPlaySound, setCanPlaySound] = useState(false);

  // Get available food items for this animal
  const availableFoods = useMemo(() => {
    const foods = getFoodItemsForAnimal(type);
    const accessToSpecial = canAccessSpecialFood(level as 'baby' | 'adolescent' | 'adult');

    const filteredFoods = Object.entries(foods).filter(([, foodData]: [string, any]) => {
      return foodData.type === 'regular' || accessToSpecial;
    });

    return Object.fromEntries(filteredFoods);
  }, [type, level]);

  const handleFoodBubbleClick = () => {
    setShowFoodMenu(!showFoodMenu);
  };

  const handleFoodItemClick = (foodId: string, cost: number) => {
    if (onFoodClick) {
      onFoodClick(foodId, cost);
    }
    setShowFoodMenu(false);
  };

  const messages = useMemo(() => {
    switch (context) {
      case 'learning':
        return t('animal.contextLearning', { returnObjects: true }) as string[];
      case 'break':
        return t('animal.contextBreak', { returnObjects: true }) as string[];
      case 'quiz':
        return t('animal.contextQuiz', { returnObjects: true }) as string[];
      case 'onboarding':
        return t('animal.contextOnboarding', { returnObjects: true }) as string[];
      case 'dashboard':
      default:
        return t('animal.contextDashboard', { returnObjects: true }) as string[];
    }
  }, [context, t]);

  // Animation frames based on animal type
  const animationFrames = useMemo(() => {
    if (type === 'af') {
      return {
        idle: ['af_face.png', 'af_dos.png'], // Reduced face repetition
        walk: ['af_run_gauche.png', 'af_run_gauche1.png', 'af_gauche.png', 'af_n_gauche.png', 'af_run_gauche.png'],
        run: ['af_pride_gauche.png', 'af_run_gauche.png', 'af_run_gauche1.png', 'af_pride_gauche.png'],
        sit: ['af_face.png'],
        happy: ['af_face_happy.png', 'af_face_happy2.png', 'af_face_happy.png']
      };
    } else if (type === 'chiot') {
      return {
        idle: ['chiot_face.png', 'chiot_dos.png'], // Reduced face repetition
        walk: ['chiot_walk1.png', 'chiot_walk2.png', 'chiot_walk3.png'],
        run: ['chiot_run.png', 'chiot_walk2.png'],
        sit: ['chiot_gauche_sit1.png', 'chiot_droite_sit2.png'],
        happy: ['chiot_face.png']
      };
    }
    // Fallback to generic if type not found
    return {
      idle: ['chiot_face.png'],
      walk: ['chiot_walk1.png'],
      run: ['chiot_run.png'],
      sit: ['chiot_face.png'],
      happy: ['chiot_face.png']
    };
  }, [type]);

  // Food emoji based on animal type
  const foodEmoji = useMemo(() => {
    if (type === 'af') return '🍡'; // Dango (for the fantastical animal)
    if (type === 'chiot') return '🍖'; // Bone for puppy
    return '🍴';
  }, [type]);



  useEffect(() => {
    // Message appears for 7 seconds, then disappears for 22 seconds
    const SHOW_DURATION = 7000; // 7 seconds visible
    const HIDE_DURATION = 22000; // 22 seconds hidden
    
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;
    
    const cycleMessage = () => {
      // Show the message
      setIsVisible(true);

      // Only try to play sound after at least one user interaction
      if (canPlaySound) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.3; // keep it subtle
          audio.play().catch((err) => {
            if (process.env.NODE_ENV === 'development') {
              // eslint-disable-next-line no-console
              console.info('[Animal] Notification sound play blocked:', err);
            }
          });
        } catch (err) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.info('[Animal] Notification sound error:', err);
          }
        }
      }
      
      // Hide after SHOW_DURATION
      showTimer = setTimeout(() => {
        setIsVisible(false);
        
        // Change to next message and show again after HIDE_DURATION
        hideTimer = setTimeout(() => {
          setMessageIndex((prev) => (prev + 1) % messages.length);
          cycleMessage();
        }, HIDE_DURATION);
      }, SHOW_DURATION);
    };
    
    // Start the cycle
    cycleMessage();
    
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [messages.length, canPlaySound]);

  useEffect(() => {
    // reset when context changes
    setMessageIndex(0);
  }, [context]);

  // Track whether the user has interacted with the page at least once,
  // so we know when it's safe to try playing sounds without hitting
  // browser autoplay restrictions.
  useEffect(() => {
    const enableSound = () => setCanPlaySound(true);

    window.addEventListener('click', enableSound, { once: true });
    window.addEventListener('keydown', enableSound, { once: true });
    window.addEventListener('touchstart', enableSound, { once: true });

    return () => {
      window.removeEventListener('click', enableSound);
      window.removeEventListener('keydown', enableSound);
      window.removeEventListener('touchstart', enableSound);
    };
  }, []);

  // Random animation system (only changes animation type, no position movement)
  useEffect(() => {
    const changeAnimation = () => {
      const animations: AnimationType[] = ['idle', 'walk', 'run', 'sit', 'happy'];
      const randomAnim = animations[Math.floor(Math.random() * animations.length)];
      setCurrentAnimation(randomAnim);

      // Random facing direction (only for idle, sit, happy)
      if (randomAnim !== 'walk' && randomAnim !== 'run') {
        setFacing(Math.random() > 0.5 ? 'left' : 'right');
      }
    };

    changeAnimation();
    const interval = setInterval(changeAnimation, 3000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, []);

  // Movement during walk animation
  useEffect(() => {
    if (currentAnimation !== 'walk') return;

    // Start walking movement
    let isWalking = true;
    const walkSpeed = 2; // pixels per frame

    const walk = () => {
      if (!isWalking) return;
      setPosition(prev => {
        let newX = prev.x;
        const direction = facing === 'right' ? 1 : -1;
        newX += walkSpeed * direction;

        // Bounce at edges
        if (newX <= 15 || newX >= 85) {
          setFacing(prevFacing => prevFacing === 'right' ? 'left' : 'right');
          newX = Math.max(15, Math.min(85, newX));
        }

        return { x: newX, y: prev.y };
      });
    };

    const walkInterval = setInterval(walk, 50);
    return () => {
      isWalking = false;
      clearInterval(walkInterval);
    };
  }, [currentAnimation, facing]);

  // Frame animation with smoother transitions
  useEffect(() => {
    const frames = animationFrames[currentAnimation] || animationFrames.idle;
    if (frames.length > 1) {
      const frameInterval = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % frames.length);
      }, 1000); // Slower, more natural transitions
      return () => clearInterval(frameInterval);
    }
  }, [currentAnimation, animationFrames]);

  const orbLevelClass =
    level === 'baby'
      ? 'animal-orb animal-orb--baby animal-orb-glow-baby'
      : level === 'adolescent'
      ? 'animal-orb animal-orb--adolescent animal-orb-glow-adolescent'
      : 'animal-orb animal-orb--adult animal-orb-glow-adult';

  const currentMessage = messages[messageIndex];

  const xpHint = xp < 20 ? "On est encore bébé, on prend nos marques." : xp < 60 ? "On grandit bien, continue comme ça !" : "Wow, niveau adulte ! On devient une légende.";

  const orbStyle: React.CSSProperties = {
    background: `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.8), transparent 55%),
      radial-gradient(circle at 80% 90%, ${color}, transparent 55%),
      rgba(15, 23, 42, 0.98)` as string,
  };

  const currentImage = useMemo(() => {
    const frames = animationFrames[currentAnimation] || animationFrames.idle;
    return frames[currentFrame] || frames[0];
  }, [animationFrames, currentAnimation, currentFrame]);

  return (
    <div className="animal-container">
      {context !== 'onboarding' && (
        <div className="animal-name">
          <button
            className="animal-food-bubble"
            onClick={handleFoodBubbleClick}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: '0.25rem',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title={t('dashboard.feedCompanion')}
          >
            {foodEmoji}
          </button>
        </div>
      )}

      {showFoodMenu && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'white',
            border: '2px solid #1f2937',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            width: '200px',
            maxHeight: '250px',
            overflowY: 'auto'
          }}
        >
          <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: '600' }}>
              Nourrir {type === 'chiot' ? 'votre chiot' : 'votre compagnon fantastique'}
            </h4>
            <p style={{ margin: '0', fontSize: '0.75rem', color: '#6b7280' }}>
              Choisissez une nourriture à donner :
            </p>
          </div>
          <div style={{ padding: '8px' }}>
            {Object.entries(availableFoods).map(([foodKey, foodData]: [string, any]) => (
              <button
                key={foodKey}
                onClick={() => handleFoodItemClick(foodData.id, foodData.cost)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  padding: '8px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  marginBottom: '4px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <img
                  src={foodData.image || foodData.bowlFullImage || foodData.bowlEmptyImage}
                  alt={foodData.name}
                  style={{
                    width: '32px',
                    height: '32px',
                    objectFit: 'contain',
                    marginRight: '8px'
                  }}
                />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                    {foodData.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {foodData.description}
                  </div>
                </div>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#059669',
                  fontWeight: '600',
                  backgroundColor: '#d1fae5',
                  padding: '2px 6px',
                  borderRadius: '12px'
                }}>
                  {foodData.cost} XP
                </div>
              </button>
            ))}
          </div>
          <div style={{ padding: '8px', borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <button
              onClick={() => setShowFoodMenu(false)}
              style={{
                border: 'none',
                background: '#6b7280',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="animal-orb-wrapper">
        <img
          src={`/${currentImage}`}
          alt={`${type} ${currentAnimation}`}
          className={`animal-image ${currentAnimation === 'walk' ? 'animal-walking' : ''} ${facing === 'left' ? 'animal-flip' : ''}`}
          style={{
            maxWidth: '180px',
            maxHeight: '180px',
            objectFit: 'contain',
            position: 'relative',
            transform: facing === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        />
        {isVisible && (
          <div className="animal-message">
            <div className="animal-message-text">
              <div>{currentMessage}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Animal;
