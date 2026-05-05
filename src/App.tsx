/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Command, Sparkles, Layout } from "lucide-react";
import ZoyaVisualizer from "./components/ZoyaVisualizer";
import { useZoyaVoice } from "./hooks/useZoyaVoice";

import { THEMES } from "./types";

export default function App() {
  const { state, transcript, response, intensity, error, toggleListening } = useZoyaVoice();
  const [themeIndex, setThemeIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setThemeIndex((prev) => (prev + 1) % THEMES.length);
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const theme = THEMES[themeIndex];

  return (
    <div className="relative w-screen h-[100dvh] flex flex-col items-center justify-center overflow-hidden bg-[#000208] selection:bg-cyan-500/30 transition-all duration-1000">
      {/* Cinematic Background Layer */}
      <div className="ambient-glow" style={{ background: `radial-gradient(circle at 50% 50%, ${theme.bgGlow}, transparent)` }} />
      
      {/* Deep Background Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-[20%] left-[15%] w-[400px] h-[400px] blur-[140px] rounded-full transition-colors duration-1000"
          style={{ backgroundColor: theme.secondary }}
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 60, 0], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-[25%] right-[20%] w-[500px] h-[500px] blur-[160px] rounded-full transition-colors duration-1000"
          style={{ backgroundColor: theme.primary }}
        />
      </div>

      {/* Top Details (Minimal High-Tech) */}
      <header className="absolute top-12 left-12 flex items-center gap-5 z-20">
         <motion.div 
           animate={{ 
             boxShadow: [
               `0 0 15px ${theme.secondary}33`, 
               `0 0 30px ${theme.secondary}66`, 
               `0 0 15px ${theme.secondary}33`
             ] 
           }}
           transition={{ duration: 3, repeat: Infinity }}
           className="w-12 h-12 rounded-xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-[14px] font-black shadow-2xl skew-x-[-12deg] transition-all duration-1000"
           style={{ color: theme.primary, borderColor: `${theme.primary}4d` }}
         >
           R
         </motion.div>
         <div className="flex flex-col">
            <span className="text-[12px] tracking-[0.5em] uppercase text-white font-bold">Ravi Engine</span>
            <div className="flex items-center gap-2 mt-1">
               <span className="w-1.5 h-1.5 rounded-full animate-pulse transition-colors duration-1000" style={{ backgroundColor: theme.primary }} />
               <span className="text-[9px] tracking-[0.2em] uppercase font-mono transition-colors duration-1000" style={{ color: `${theme.primary}99` }}>Syncing Neural-Network...</span>
            </div>
         </div>
      </header>

      <main className="relative flex flex-col items-center justify-center z-10 w-full max-w-4xl">
        <ZoyaVisualizer 
          isListening={state === "listening"} 
          isSpeaking={state === "speaking"}
          intensity={intensity}
          theme={theme}
        />

        {/* Dynamic Transcription & Response Overlay */}
        <div className="absolute bottom-48 left-1/2 -translate-x-1/2 w-full max-w-2xl pointer-events-none z-30 flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
             {state === "listening" && transcript && (
               <motion.div
                 key="transcript-overlay"
                 initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                 exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                 className="text-center p-6 bg-black/40 backdrop-blur-xl rounded-3xl border border-white/10"
                 style={{ borderColor: `${theme.primary}1a` }}
               >
                 <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 block mb-2">User Command</span>
                 <p className="text-xl font-medium text-white leading-relaxed tracking-tight">
                   {transcript}
                 </p>
               </motion.div>
             )}

             {response && (
               <motion.div
                 key="response-overlay"
                 initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
                 animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                 exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                 className="text-center p-8 bg-blue-500/5 backdrop-blur-2xl rounded-3xl border shadow-2xl relative overflow-hidden"
                 style={{ 
                   borderColor: `${theme.primary}4d`,
                   boxShadow: `0 0 40px ${theme.primary}1a`
                 }}
               >
                 {/* Decorative background glow for Ravi's box */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 100%, ${theme.primary}, transparent)` }} />
                 
                 <div className="flex items-center justify-center gap-2 mb-3">
                   <Sparkles className="w-3 h-3" style={{ color: theme.primary }} />
                   <span className="text-[10px] uppercase font-black tracking-[0.4em] transition-colors duration-1000" style={{ color: theme.primary }}>Ravi</span>
                 </div>
                 <p className="text-2xl md:text-3xl font-bold text-white leading-snug tracking-tight drop-shadow-lg">
                   {response}
                 </p>
                 
                 {/* Visualizer bars bottom Ravi's text */}
                 <div className="flex justify-center gap-1.5 mt-4 h-1 items-end opacity-40">
                   {[...Array(6)].map((_, i) => (
                     <motion.div 
                        key={i}
                        animate={{ height: state === 'speaking' ? [4, 12, 4] : 4 }}
                        transition={{ duration: 0.5 + (i * 0.1), repeat: Infinity }}
                        className="w-1 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                     />
                   ))}
                 </div>
               </motion.div>
             )}
          </AnimatePresence>
        </div>

        {/* User Friendly Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div 
              key="error-overlay"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-40 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-full text-xs font-mono z-40"
            >
              System Error: {error}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Control Console */}
      <footer className="absolute bottom-16 flex flex-col items-center gap-10 z-20">
        <div className="relative">
          {/* Subtle Cyber Glow */}
          <motion.div 
            animate={{
              opacity: state === 'listening' ? [0.3, 0.6, 0.3] : 0.1,
              scale: state === 'listening' ? [1.3, 1.6, 1.3] : 1,
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute inset-0 rounded-full blur-[60px] z-[-1] transition-all duration-1000"
            style={{ backgroundColor: state === 'listening' ? theme.primary : `${theme.secondary}33` }}
          />
          
          {/* Dynamic Voice Ripple Effect */}
          <AnimatePresence>
            {state === 'listening' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0.5 }}
                    animate={{
                      scale: [1, 1.5 + (intensity * 2.5) + (i * 0.3)],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: "easeOut",
                    }}
                    className="absolute w-24 h-24 rounded-full border-2 transition-all duration-300"
                    style={{ borderColor: `${theme.primary}66`, boxShadow: `0 0 15px ${theme.primary}33` }}
                  />
                ))}
                {/* Instant Feedback Glow */}
                <motion.div
                  animate={{
                    scale: 1 + (intensity * 0.8),
                    opacity: 0.2 + (intensity * 0.5),
                  }}
                  className="absolute w-24 h-24 rounded-full transition-all duration-100"
                  style={{ backgroundColor: theme.primary }}
                />
              </div>
            )}
          </AnimatePresence>
          
          <button 
            onClick={toggleListening}
            className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center backdrop-blur-3xl border-2 transition-all duration-1000 active:scale-95 shadow-black/80 z-10 ${
              state === 'listening' ? 'bg-cyan-600/20' : 'bg-blue-600/5 hover:border-blue-500/40'
            }`}
            style={{ 
              borderColor: state === 'listening' ? theme.primary : `${theme.secondary}33`,
              backgroundColor: state === 'listening' ? `${theme.primary}1a` : 'transparent'
            }}
          >
            <motion.div
              animate={state === 'listening' ? {
                scale: [1, 1 + (intensity * 0.4), 1],
                color: [theme.primary, '#fff', theme.primary]
              } : {}}
              transition={{ duration: 0.2 }}
            >
              {state === 'listening' ? (
                <MicOff className="w-10 h-10 transition-all duration-1000 text-white" />
              ) : (
                <Mic className="w-10 h-10 transition-all duration-1000 text-white" />
              )}
            </motion.div>
          </button>
        </div>
        
        <div className="text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={state}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <span 
                className="text-[12px] tracking-[1em] font-black uppercase font-display block drop-shadow-sm transition-all duration-1000"
                style={{ color: state === 'listening' ? theme.primary : 'rgba(255,255,255,0.4)' }}
              >
                {state === 'listening' ? 'Listening' : state === 'speaking' ? 'Ravi Speaking' : state === 'processing' ? 'Thinking...' : 'Command Ravi'}
              </span>
              <div className="h-[1px] w-16 bg-white/10 mx-auto overflow-hidden">
                 <motion.div 
                   animate={{ x: ['-100%', '100%'] }} 
                   transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                   className="w-1/2 h-full transition-all duration-1000"
                   style={{ backgroundColor: theme.primary }}
                 />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </footer>

      {/* Decorative Session Details */}
      <div className="absolute bottom-12 right-12 flex flex-col items-end opacity-40 text-[10px] uppercase tracking-[0.4em] font-mono">
        <span className="transition-all duration-1000" style={{ color: theme.primary }}>Ravi-Core-01 / Secure</span>
        <span className="text-white/30 text-[8px] mt-1">Status: Active Listening</span>
      </div>
    </div>
  );
}
