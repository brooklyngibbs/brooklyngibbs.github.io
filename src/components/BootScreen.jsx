import { useEffect, useState, useRef } from 'react';
import floorImg from '../assets/floor.png';
import frogImg from '../assets/frog.png';
import ambience from '../assets/ambience.mp3';
import volumeOn from '../assets/volumeOn.png';
import volumeOff from '../assets/volumeOff.png';

export default function BootScreen({ onFinish }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [bootComplete, setBootComplete] = useState(false);
  const [muted, setMuted] = useState(true);
  const audioRef = useRef(null);
  // Ref to scroll container for auto-scroll
  const logRef = useRef(null);

  // Generate ascii star field once
  const [starField] = useState(() => {
    const rows = 100;
    const cols = 240;
    const star = '✦';
    let txt = '';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        txt += Math.random() < 0.01 ? star : ' ';
      }
      txt += '\n';
    }
    return txt;
  });

  const bootSteps = [
    { text: 'PondOS v2.4.1 - Brooklyn Gibbs Edition', delay: 800 },
    { text: 'Starting feelings.js...', delay: 800 },
    { text: 'Deploying narrative UX protocol...', delay: 700 },
    { text: 'Importing digital folklore library...', delay: 800 },
    { text: 'Infusing interface with subtext...', delay: 600 },
    { text: 'Spinning up Substack //offline_crush_writer...', delay: 800 },
    { text: 'Mounting /Projects/Aurify.app', delay: 700 },
    { text: 'Tuning magic-to-code ratio [optimal]', delay: 700 },
    { text: 'Unpacking emotional artifacts...', delay: 800 },
    { text: 'Portfolio launch sequence complete.', delay: 800 }
  ];

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    // Setup looping ambience audio
    const audio = new Audio(ambience);
    audio.loop = true;
    audio.volume = 0.4;
    audio.muted = muted;
    // Autoplay might be blocked unless muted
    audio.play().catch(() => {});
    audioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  // Update mute setting on toggle
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = muted;
      // Attempt to play if unmuted after user interaction
      if (!muted) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [muted]);

  useEffect(() => {
    if (currentStep < bootSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setProgress(((currentStep + 1) / bootSteps.length) * 100);
      }, bootSteps[currentStep].delay);

      return () => clearTimeout(timer);
    } else {
      const completeTimer = setTimeout(() => setBootComplete(true), 500);
      return () => clearTimeout(completeTimer);
    }
  }, [currentStep, onFinish]);

  // Auto-scroll status container whenever a new step is added
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [currentStep]);

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#1a1a2e] to-[#2a2f4a] text-slate-100 flex flex-col justify-center items-center font-mono text-sm md:text-base p-8 pb-60 overflow-hidden">
      {/* ASCII Star background */}
      <pre className="fixed inset-0 z-0 m-0 text-[#3a3f5a] leading-3 text-2xl whitespace-pre font-mono overflow-hidden pointer-events-none select-none">
        {starField}
      </pre>
      {/* Volume toggle */}
      <button
        onClick={() => setMuted(prev => !prev)}
        className="absolute top-4 right-4 z-50 select-none"
        aria-label={muted ? 'Unmute ambience' : 'Mute ambience'}
      >
        <img
          src={muted ? volumeOn : volumeOff}
          alt={muted ? 'Sound off' : 'Sound on'}
          className="w-9 h-9"
        />
      </button>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-[600px] px-4">
        <div className="mb-8">
          <div className="text-blue-100 text-3xl md:text-5xl mb-4 font-semibold tracking-wide whitespace-nowrap">
            {'>'} Welcome to PondOS.
          </div>
          <div className="w-full bg-sky-900 h-4 rounded-full mb-4 mx-auto">
            <div
              className={`h-4 rounded-full transition-all duration-300 ${bootComplete ? 'bg-cyan-300 shadow-[0_0_10px_3px_rgba(34,255,200,0.6)] animate-pulse' : 'bg-cyan-300'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-gray-400 text-sm mb-4">
            [{Math.round(progress)}%] {bootComplete ? 'Complete ✶' : 'Loading...'}
          </div>
        </div>
        <div
          ref={logRef}
          className="space-y-1 tabular-nums h-60 overflow-y-auto w-full px-4 mx-auto"
        >
          {bootSteps.slice(0, currentStep).map((step, index) => (
            <div key={index} className="flex">
              <span className="text-gray-500 mr-2">[{String(index + 1).padStart(2, '0')}]</span>
              <span className="inline-block min-h-[22px]">{step.text}</span>
            </div>
          ))}
          {currentStep < bootSteps.length && (
            <div className="flex">
              <span className="text-gray-500 mr-2">[{String(currentStep + 1).padStart(2, '0')}]</span>
              <span className="inline-block min-h-[22px]">
                {bootSteps[currentStep].text}
                <span className={`ml-1 ${showCursor ? 'opacity-100 text-cyan-100' : 'opacity-0'}`}>✶</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {bootComplete && (
        <div className="absolute left-80 bottom-90 z-30 fade-in float">
          <button
            onClick={onFinish}
            className="bg-white/10 text-white border border-white/20 px-4 py-2 rounded-lg backdrop-blur-md shadow-md text-sm hover:bg-white/20 transition-all"
          >
            "You're all set, traveler. Shall we hop in?"
          </button>
        </div>
      )}

      <div className="absolute top-4 left-4 text-xs text-gray-500">
        <div>System: PondOS (Fairy Mode Enabled)</div>
        <div>Codename: Digital Folklore Terminal</div>
        <div>Memory: Endless Daydream Storage Detected</div>
      </div>

      <img
        src={frogImg}
        alt="frog mascot"
        className="absolute bottom-[0rem] left-15 w-96 h-auto pointer-events-none select-none drop-shadow-lg z-20"
      />

      <div className="absolute bottom-0 left-0 w-full flex pointer-events-none select-none translate-y-7">
        {Array.from({ length: 4 }).map((_, i) => (
          <img
            key={i}
            src={floorImg}
            alt="decorative floor"
            className="w-1/4 h-auto"
          />
        ))}
      </div>
    </div>
  );
}