
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, X, Sparkles, Volume2, Waveform, Loader2, Bot } from 'lucide-react';

// Audio decoding helper as per guidelines
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const AiConcierge: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState('');
  const nextStartTime = useRef(0);
  const audioCtx = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sources = useRef<Set<AudioBufferSourceNode>>(new Set());

  const startSession = async () => {
    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey: 'AIzaSyC7xcbx_ZRgjC_CaXK1u8Ge8lsGeDjq14w' });
    
    audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const inputCtx = new AudioContext({ sampleRate: 16000 });
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
        systemInstruction: "You are the NXB Betting Concierge. You help users find match odds, explain betting markets, and provide AI insights. Keep responses concise and professional. You cannot actually process financial transactions, but you can suggest bets.",
        inputAudioTranscription: {},
        outputAudioTranscription: {}
      },
      callbacks: {
        onopen: () => {
          setIsConnecting(false);
          setIsActive(true);
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            sessionPromise.then(s => s.sendRealtimeInput({ 
              media: { data: encodeBase64(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
            }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
            const audioData = decodeBase64(msg.serverContent.modelTurn.parts[0].inlineData.data);
            const buffer = await decodeAudioData(audioData, audioCtx.current!, 24000, 1);
            const source = audioCtx.current!.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.current!.destination);
            nextStartTime.current = Math.max(nextStartTime.current, audioCtx.current!.currentTime);
            source.start(nextStartTime.current);
            nextStartTime.current += buffer.duration;
            sources.current.add(source);
          }
          if (msg.serverContent?.inputTranscription) {
            setTranscription(msg.serverContent.inputTranscription.text);
          }
        },
        onclose: () => {
          setIsActive(false);
          onClose();
        },
        onerror: () => setIsConnecting(false)
      }
    });

    sessionRef.current = await sessionPromise;
  };

  const endSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    sources.current.forEach(s => s.stop());
    setIsActive(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-slate-950/80 backdrop-blur-xl p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className={`absolute inset-0 bg-emerald-500/20 rounded-full animate-ping ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
            <div className={`relative w-full h-full rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-white shadow-xl ${isActive ? 'animate-pulse' : ''}`}>
              {isConnecting ? <Loader2 className="animate-spin" size={40} /> : <Bot size={40} />}
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 italic">Zephyr AI Concierge</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 px-4">
            {isActive ? "Listening for your instructions..." : "Ready to assist with odds, insights, and account info."}
          </p>

          <div className="h-20 flex items-center justify-center mb-8">
            {isActive ? (
              <div className="flex gap-1 items-center h-8">
                {[1,2,3,4,5,6,7,8].map(i => (
                  <div key={i} className="w-1 bg-emerald-500 rounded-full animate-music" style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            ) : transcription ? (
               <p className="text-slate-600 dark:text-slate-300 italic text-sm">"{transcription}"</p>
            ) : null}
          </div>

          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 transition-all">
              DISMISS
            </button>
            {!isActive ? (
              <button onClick={startSession} className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2">
                <Mic size={20} /> START VOICE
              </button>
            ) : (
              <button onClick={endSession} className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-500 transition-all">
                STOP
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiConcierge;
