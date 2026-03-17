'use client';

import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { LogIn } from 'lucide-react';

export default function Auth() {
  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
          Move Progress
        </h1>
        <p className="text-gray-400 text-lg">Your minimalist fitness companion.</p>
      </div>
      
      <button
        onClick={signIn}
        className="flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/15 active:bg-white/20 hover:scale-105 text-white rounded-2xl transition-all border border-white/10 shadow-xl backdrop-blur-sm group"
      >
        <LogIn className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
        <span className="font-semibold tracking-wide">Sign in with Google</span>
      </button>
    </div>
  );
}
