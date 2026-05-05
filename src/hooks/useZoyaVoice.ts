import { useState, useCallback, useRef, useEffect } from "react";
import { getRaviResponse, getZoyaSpeech } from "../geminiService";

// Extend window for webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export type VoiceState = "idle" | "listening" | "processing" | "speaking";

export const useZoyaVoice = () => {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [intensity, setIntensity] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const isListeningManual = useRef(false);
  const isRecognitionActive = useRef(false);
  const stateRef = useRef<VoiceState>("idle");

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Helper to start recognition safely
  const startRecognitionSafely = useCallback(() => {
    if (!recognitionRef.current || isRecognitionActive.current) return;
    try {
      recognitionRef.current.start();
      isRecognitionActive.current = true;
    } catch (e) {
      console.warn("Speech Recognition failed to start correctly:", e);
      isRecognitionActive.current = false;
    }
  }, []);

  // Mic Intensity Tracking
  const startMicTracking = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      micAnalyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateIntensity = () => {
        if (!micAnalyserRef.current) return;
        micAnalyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(1, average / 100); // Normalize to 0-1
        setIntensity(normalized);
        animationFrameRef.current = requestAnimationFrame(updateIntensity);
      };

      updateIntensity();
    } catch (e) {
      console.warn("Mic tracking failed:", e);
    }
  }, []);

  const stopMicTracking = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    micAnalyserRef.current = null;
    setIntensity(0);
  }, []);

  // Keep stateRef in sync
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "en-IN";

      recognitionRef.current.onstart = () => {
        isRecognitionActive.current = true;
        setError(null);
        if (isListeningManual.current) {
          setState("listening");
        }
      };

      recognitionRef.current.onresult = (event: any) => {
        if (stateRef.current === "speaking") return; // Ignore if Ravi is speaking

        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          isListeningManual.current = false;
          recognitionRef.current?.stop();
          stopMicTracking();
          setError(null);
          setTranscript(finalTranscript);
          handleCommand(finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        isRecognitionActive.current = false;
        if (isListeningManual.current && stateRef.current !== "speaking") {
          setTimeout(() => {
            if (isListeningManual.current && !isRecognitionActive.current) {
              startRecognitionSafely();
            }
          }, 100);
        } else if (!isListeningManual.current) {
          stopMicTracking();
          if (stateRef.current === "listening") {
            setState("idle");
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        isRecognitionActive.current = false;
        console.warn("Recognition Error Observed:", event.error);
        
        if (event.error === 'not-allowed') {
          setError("Microphone access is blocked. Please check site permissions.");
          isListeningManual.current = false;
        } else if (event.error === 'network') {
          // Robust silent reconnect for network issues
          if (isListeningManual.current) {
            setTimeout(() => {
              if (isListeningManual.current && !isRecognitionActive.current) {
                startRecognitionSafely();
              }
            }, 2000);
          }
        } else if (event.error === 'no-speech') {
           // Standard for Chrome continuous mode - ignore
        } else if (event.error === 'aborted') {
           // Recognition was aborted - usually fine
        } else {
          setError(`Mic Error: ${event.error}`);
        }
        
        if (!isListeningManual.current) {
          setState("idle");
        }
      };
    }

    return () => {
      if (currentSourceRef.current) {
        currentSourceRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const playSpeech = async (text: string, existingAudioData?: string) => {
    setState("processing");
    const audioData = existingAudioData || await getZoyaSpeech(text);
    
    // Fallback logic removed as requested by user
    if (!audioData) {
      console.warn("AI Voice unavailable. Ravi will be silent but text is shown.");
      setState("idle");
      return;
    }

    try {
      // Decode Base64 to ArrayBuffer
      const binaryString = window.atob(audioData);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      console.log("Audio Data received. Length:", len, "First 4 bytes:", bytes[0], bytes[1], bytes[2], bytes[3]);

      // Detect format: WAV starts with "RIFF" (82, 73, 70, 70)
      const isWav = bytes[0] === 82 && bytes[1] === 73 && bytes[2] === 70 && bytes[3] === 70;

      // Ensure AudioContext is ready if we need it
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      if (isWav) {
        console.log("Playing as WAV via Audio element");
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        audio.onplay = () => {
          setState("speaking");
          setIntensity(0.5);
        };
        
        audio.onended = () => {
          setState("idle");
          setIntensity(0);
          URL.revokeObjectURL(url);
        };

        audio.onerror = (e) => {
          console.error("Audio playback error:", e);
          setState("idle");
          URL.revokeObjectURL(url);
        };

        // Visualizer intensity logic
        const interval = setInterval(() => {
          if (!audio.paused && !audio.ended) {
            setIntensity(Math.random() * 0.6 + 0.2);
          } else {
            clearInterval(interval);
          }
        }, 80);

        await audio.play();
      } else {
        // Assume PCM 16-bit, Mono, 24000Hz (standard Gemini 3.1 TTS output)
        const pcmData = new Int16Array(bytes.buffer);
        
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 24000);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < pcmData.length; i++) {
          channelData[i] = pcmData[i] / 32768.0;
        }
        
        if (currentSourceRef.current) {
          try {
            currentSourceRef.current.stop();
          } catch (e) {
            // Ignore
          }
        }

        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        currentSourceRef.current = source;

        source.onended = () => {
          setState("idle");
          setIntensity(0);
          currentSourceRef.current = null;
        };

        setState("speaking");
        
        // Visualizer intensity logic
        const interval = setInterval(() => {
          if (stateRef.current === "speaking") {
            setIntensity(Math.random() * 0.6 + 0.2);
          } else {
            clearInterval(interval);
          }
        }, 80);

        source.start();
        
        source.addEventListener('ended', () => {
          clearInterval(interval);
        });
      }
    } catch (e) {
      console.error("Audio Playback Error:", e);
      setState("idle");
    }
  };

  const handleCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase();
    setState("processing");
    setError(null);
    setTranscript(""); // Clear transcript immediately to show we're working

    // Command Routing Logic
    
    // 1. WhatsApp Web
    if (lowerCommand.includes("whatsapp") && (lowerCommand.includes("message") || lowerCommand.includes("bhejo") || lowerCommand.includes("send"))) {
      const match = command.match(/whatsapp message to (\d+) saying (.+)/i) || 
                    command.match(/(\d+) ko whatsapp message bhejo (.+)/i) ||
                    command.match(/(\d+) ko message bhejo (.+)/i);
      if (match) {
        const [_, number, message] = match;
        const url = `https://web.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
        window.open(url, "_blank");
        playSpeech("Opening WhatsApp message box for you... aur kuch kaam hai?");
        return;
      }
    }

    // 2. YouTube Search/Play - Improved Regex
    if (lowerCommand.includes("youtube") || lowerCommand.includes("video") || lowerCommand.includes("chalao") || lowerCommand.includes("dikhao")) {
      let query = lowerCommand
        .replace(/youtube|open|play|kholo|chalao|search|dhundo|dikhao|video|par|on|per|karo|kero|search|dhundho|dikhao/gi, "")
        .replace(/\s+/g, " ")
        .trim();
      
      const url = query 
        ? `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
        : "https://www.youtube.com";
      
      window.open(url, "_blank");
      playSpeech(query ? `Theek hai Shan, YouTube par ${query} dhoond raha hoon.` : `YouTube khol raha hoon... enjoy karo.`);
      return;
    }

    // 3. Spotify Search
    if (lowerCommand.includes("spotify") || lowerCommand.includes("gana") || lowerCommand.includes("song") || lowerCommand.includes("music")) {
       let query = lowerCommand.replace(/spotify|search|play|dhundo|gana|song|on|par|per|chalao|music/gi, "").trim();
       const url = query 
        ? `https://open.spotify.com/search/${encodeURIComponent(query)}`
        : "https://open.spotify.com";
       window.open(url, "_blank");
       playSpeech(query ? `Searching for ${query} on Spotify. Kya taste hai Shan... anyway.` : `Spotify open kar diya.`);
       return;
    }

    // 4. Open Any Site
    if (lowerCommand.includes("open") || lowerCommand.includes("kholo")) {
      const site = lowerCommand.replace(/open|kholo/gi, "").trim().split(" ")[0];
      if (site && site.length > 2) {
        const url = `https://www.${site}.com`;
        window.open(url, "_blank");
        playSpeech(`Opening ${site}. Basic kaam toh khud kar liya karo.`);
        return;
      }
    }

    // 5. Default Chat (Unified Gemini Response & Speech)
    const { text, audio } = await getRaviResponse(command);
    
    setResponse(text);
    playSpeech(text, audio);
  };

  const toggleListening = useCallback(async () => {
    if (isListeningManual.current) {
      isListeningManual.current = false;
      recognitionRef.current?.stop();
      isRecognitionActive.current = false;
      stopMicTracking();
      setState("idle");
    } else {
      isListeningManual.current = true;
      setError(null);
      setTranscript("");
      setResponse("");
      setState("listening");
      startMicTracking();
      
      // Initialize AudioContext on user gesture and warm it up thoroughly
      try {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        // Very silent oscillate to unlock audio on mobile browsers definitively
        const osc = audioContextRef.current.createOscillator();
        const silent = audioContextRef.current.createGain();
        silent.gain.setValueAtTime(0, audioContextRef.current.currentTime);
        osc.connect(silent);
        silent.connect(audioContextRef.current.destination);
        osc.start(0);
        osc.stop(audioContextRef.current.currentTime + 0.1);
      } catch (e) {
        console.warn("Audio Context Warmup failed", e);
      }

      startRecognitionSafely();
    }
  }, [state]);

  return {
    state,
    transcript,
    response,
    intensity,
    error,
    toggleListening
  };
};
