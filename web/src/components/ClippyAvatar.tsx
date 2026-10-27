import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageSquare, Volume2 } from 'lucide-react';
import clippyImg from '../assets/images/clippy_store_ai_1792088731968.jpg';

export type ClippyState = 'idle' | 'talking' | 'thinking' | 'celebrating' | 'scanning';

interface ClippyAvatarProps {
  state?: ClippyState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  speechBubble?: string | null;
  onClick?: () => void;
  showBadge?: boolean;
}

export const ClippyAvatar: React.FC<ClippyAvatarProps> = ({
  state = 'idle',
  size = 'md',
  speechBubble = null,
  onClick,
  showBadge = true
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  };

  const imgSizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  };

  // Variantes de animación para Clippy con Motion
  const animationVariants = {
    idle: {
      y: [0, -6, 0],
      rotate: [0, 1.5, -1.5, 0],
      transition: {
        duration: 3.5,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    talking: {
      y: [0, -4, 0, -3, 0],
      rotate: [-2, 2, -1, 1, 0],
      scale: [1, 1.04, 0.98, 1.02, 1],
      transition: {
        duration: 0.9,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    thinking: {
      rotate: [0, -8, -6, -8],
      y: [0, -2, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    celebrating: {
      y: [0, -18, 0, -10, 0],
      rotate: [0, 12, -12, 6, 0],
      scale: [1, 1.15, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
    scanning: {
      scale: [1, 1.08, 1],
      rotate: [-3, 3, -3],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <div className="relative inline-flex flex-col items-center select-none" onClick={onClick}>
      
      {/* Globo de Diálogo de Clippy (Estilo nostálgico y amigable) */}
      <AnimatePresence>
        {speechBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-30 min-w-[160px] max-w-[260px] bg-amber-50 border-2 border-amber-300 text-slate-800 text-xs font-bold rounded-2xl p-3 shadow-lg pointer-events-none"
          >
            <p className="leading-snug">{speechBubble}</p>
            {/* Pico del globo */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-amber-300" />
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[2px] w-0 h-0 border-x-7 border-x-transparent border-t-7 border-t-amber-50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenedor Animado de Clippy */}
      <motion.div
        variants={animationVariants}
        animate={state}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className={`relative ${sizeMap[size]} cursor-pointer filter drop-shadow-md`}
      >
        <img
          src={clippyImg}
          alt="Clippy Asistente de Tienda"
          className={`${imgSizeMap[size]} object-contain rounded-2xl transition-transform`}
        />

        {/* Indicador de estado animado */}
        {showBadge && (
          <>
            {state === 'talking' && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 text-white items-center justify-center text-[9px] font-bold">
                  <Volume2 className="w-2.5 h-2.5" />
                </span>
              </span>
            )}

            {state === 'thinking' && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black shadow-sm animate-bounce">
                💭
              </span>
            )}

            {state === 'celebrating' && (
              <span className="absolute -top-2 -right-2 text-base animate-spin">
                ✨
              </span>
            )}

            {state === 'scanning' && (
              <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-sm animate-pulse">
                📷
              </span>
            )}
          </>
        )}
      </motion.div>

    </div>
  );
};
