import { motion, AnimatePresence } from "motion/react";
import React from "react";
import { Theme } from "../types";

interface ZoyaVisualizerProps {
  isListening: boolean;
  isSpeaking: boolean;
  intensity: number; // 0 to 1
  theme: Theme;
}

export default function ZoyaVisualizer({ isListening, isSpeaking, intensity, theme }: ZoyaVisualizerProps) {
  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Cinematic Deep Space Background with Pulsing Blinking */}
      <motion.div 
        animate={{
          opacity: isSpeaking ? [0.3, 0.8, 0.4, 0.9, 0.3] : [0.2, 0.4, 0.2],
          scale: isSpeaking ? [1, 1.1, 1.05, 1.15, 1] : [1, 1.1, 1],
        }}
        transition={{ 
          duration: isSpeaking ? 0.8 : 8, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute w-[1200px] h-[1200px] rounded-full blur-[200px] transition-colors duration-1000"
        style={{ 
          background: `radial-gradient(circle, ${theme.bgGlow} 0%, transparent 80%)` 
        }}
      />

      {/* Technical Coordinate Grid Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]">
        <div 
          className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] transition-all duration-1000" 
          style={{ backgroundImage: `linear-gradient(${theme.primary}1a 1px,transparent 1px),linear-gradient(90deg,${theme.primary}1a 1px,transparent 1px)` }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
      </div>

      {/* Advanced Neural Holographic Rings (SVG Based) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg width="800" height="800" viewBox="0 0 800 800" className="absolute overflow-visible">
          {/* Outer Segmented Scanning Ring */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="400" cy="400" r="360" fill="none" stroke={theme.primary} strokeWidth="0.5" strokeDasharray="2, 10" className="opacity-20 transition-all duration-1000" />
            {[0, 90, 180, 270].map((r) => (
              <path key={r} d="M 400 40 A 360 360 0 0 1 600 100" fill="none" stroke={theme.primary} strokeWidth="2" transform={`rotate(${r} 400 400)`} className="opacity-40 transition-all duration-1000" />
            ))}
          </motion.g>

          {/* Middle Dotted Connection Ring */}
          <motion.g
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="400" cy="400" r="300" fill="none" stroke={theme.secondary} strokeWidth="1" strokeDasharray="1, 15" className="opacity-30 transition-all duration-1000" />
            {/* Pulsing connection nodes */}
            {[0, 60, 120, 180, 240, 300].map((r) => (
              <motion.circle
                key={r}
                cx="400"
                cy="100"
                r="3"
                fill={theme.primary}
                transform={`rotate(${r} 400 400)`}
                animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: r/60 * 0.3 }}
                style={{ filter: `drop-shadow(0 0 5px ${theme.primary})` }}
                className="transition-all duration-1000"
              />
            ))}
          </motion.g>

          {/* Inner Technical Tick Ring */}
          <motion.g
            animate={{ rotate: 180 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(36)].map((_, i) => (
              <line
                key={i}
                x1="400" y1="140" x2="400" y2="155"
                stroke={theme.primary}
                strokeWidth={i % 3 === 0 ? "2" : "0.5"}
                transform={`rotate(${i * 10} 400 400)`}
                className="opacity-20 transition-all duration-1000"
              />
            ))}
          </motion.g>

          {/* Dynamic "Sound Wave" SVG Path (Reacts to Intensity) */}
          <motion.path
            d="M 250 400 Q 400 350 550 400"
            fill="none"
            stroke={theme.primary}
            strokeWidth="1"
            className="opacity-10 transition-all duration-1000"
            animate={{ 
              d: isSpeaking ? `M 250 400 Q 400 ${400 - (intensity * 200)} 550 400` : "M 250 400 Q 400 400 550 400"
            }}
          />
        </svg>

        {/* Moving Particles along paths (Floating Data Nodes) */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              rotate: 360,
              opacity: [0, 0.6, 0]
            }}
            transition={{ duration: 8 + i, repeat: Infinity, ease: "linear" }}
            className="absolute"
            style={{ width: `${400 + i * 20}px`, height: `${400 + i * 20}px` }}
          >
            <div 
              className="w-1 h-1 rounded-full blur-[1px] transition-all duration-1000" 
              style={{ backgroundColor: theme.primary, boxShadow: `0 0 8px ${theme.primary}` }}
            />
          </motion.div>
        ))}
      </div>

      {/* Atmospheric Focus Beams */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className="absolute w-full h-full opacity-10 transition-all duration-1000"
        style={{ 
          background: `conic-gradient(from 0deg, transparent, ${theme.primary}33, transparent 20%, transparent 50%, ${theme.secondary}33, transparent 70%)` 
        }}
      />

      {/* The Raja Neural Core */}
      <div className="relative w-[380px] h-[380px] flex items-center justify-center">
        {/* Core Lighting Aura */}
        <AnimatePresence>
          {(isSpeaking || isListening) && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: [0.2, 0.8, 0.4, 0.9, 0.2],
                scale: [1.1, 1.5, 1.2, 1.6, 1.1]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 rounded-full blur-[120px] transition-all duration-1000"
              style={{ backgroundColor: `${theme.secondary}66` }}
            />
          )}
        </AnimatePresence>

        <motion.div 
          animate={{ 
            scale: isSpeaking ? 1.05 : 1,
            // Deep blue intensity pulsing (Headlight/Blinking effect)
            boxShadow: [
              `0 0 40px ${theme.secondary}4d`,
              `0 0 150px ${theme.primary}cc`,
              `0 0 60px ${theme.secondary}66`,
              `0 0 180px ${theme.primary}`,
              `0 0 40px ${theme.secondary}4d`
            ],
            borderColor: [
              `${theme.secondary}33`,
              `${theme.primary}cc`,
              `${theme.secondary}66`,
              theme.primary,
              `${theme.secondary}33`
            ]
          }}
          transition={{
            duration: isSpeaking ? 0.8 : 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.2, 0.5, 0.8, 1]
          }}
          className="raja-pill backdrop-blur-[100px] relative overflow-hidden border-[3px] bg-[#00081a]/40 z-10 transition-all duration-1000"
        >
          {/* Inner Light Source Glow */}
          <motion.div
            animate={{
              opacity: [0.1, 0.6, 0.2, 0.8, 0.1]
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 blur-xl pointer-events-none transition-all duration-1000"
            style={{ backgroundColor: `${theme.secondary}33` }}
          />
          {/* Inner Glitch Light */}
          <div 
            className="absolute inset-0 bg-gradient-to-tr via-transparent pointer-events-none transition-all duration-1000" 
            style={{ backgroundImage: `linear-gradient(to top right, ${theme.secondary}66, transparent, ${theme.primary}66)` }}
          />
          
          <div className="flex flex-col items-center gap-14 z-[2]">
            <motion.div className="flex flex-col items-center">
              <span className="text-[20px] text-white font-display translate-x-[0.75em] font-black tracking-[1.5em] drop-shadow-[0_0_10px_white]">
                RAJA
              </span>
              <motion.div 
                animate={{ 
                  width: isSpeaking ? [40, 90, 40] : 60,
                  opacity: [0.6, 1, 0.6] 
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mt-4 h-[3px] rounded-full transition-all duration-1000" 
                style={{ 
                  background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent}, ${theme.primary})`,
                  boxShadow: `0 0 10px ${theme.primary}`
                }}
              />
            </motion.div>
            
            {/* High-Performance Neural Spectrum */}
            <div className="flex items-end gap-2.5 h-28">
              {[...Array(9)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: isSpeaking ? [12, 70 * (0.3 + intensity) + (Math.random() * 40), 12] : isListening ? [12, 35, 12] : 10,
                    opacity: (isSpeaking || isListening) ? 1 : 0.2
                  }}
                  transition={{ duration: 0.15, delay: i * 0.03, repeat: Infinity }}
                  className="w-1.5 rounded-full transition-all duration-1000"
                  style={{ 
                    background: `linear-gradient(to top, ${theme.secondary}, ${theme.primary})`,
                    boxShadow: `0 0 15px ${theme.primary}66`
                   }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
