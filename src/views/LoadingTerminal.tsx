import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface LoadingTerminalProps {
  onComplete: () => void;
}

const LOGS = [
  'Intercepting .eth protocol route...',
  'Resolving hash via decentralized index...',
  'Downloading sandboxed WASM package files... [OK]',
  'Verifying package cryptographic signature integrity... [OK]',
  'Launching secure Orivon local runtime environment...'
];

export default function LoadingTerminal({ onComplete }: LoadingTerminalProps) {
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [cursor, setCursor] = useState(true);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const showNextLog = (index: number) => {
      if (index < LOGS.length) {
        setVisibleLogs(prev => [...prev, LOGS[index]]);
        timeout = setTimeout(() => showNextLog(index + 1), 450);
      } else {
        timeout = setTimeout(onComplete, 500);
      }
    };

    timeout = setTimeout(() => showNextLog(0), 300);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => setCursor(c => !c), 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-3xl glass-card rounded-none border-orivon-border bg-black p-8 font-mono min-h-[400px] flex flex-col">
        {/* Terminal Header */}
        <div className="flex gap-2 mb-8 border-b border-orivon-border/30 pb-4">
          <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
          <div className="ml-4 text-[10px] text-gray-500 tracking-widest flex items-center gap-2">
            TERMINAL // SECURE_RUNTIME_INIT // SESSION_71
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <AnimatePresence mode="popLayout">
            {visibleLogs.map((log, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-4"
              >
                <span className="text-gray-700 select-none">[{i+1}]</span>
                <span className={log.includes('[OK]') ? 'text-orivon-accent' : 'text-gray-300'}>
                  {log}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <div className="flex gap-4">
            <span className="text-gray-700 select-none">[{visibleLogs.length + 1}]</span>
            <span className="text-orivon-accent font-bold">
              {cursor ? '_' : ' '}
            </span>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-orivon-border/30 flex justify-between items-center text-[10px] text-gray-600">
          <div>LATENCY: 12ms // PACKET_LOSS: 0%</div>
          <div className="animate-pulse flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-orivon-accent"></div>
            KERNEL_RUNNING
          </div>
        </div>
      </div>
    </div>
  );
}
