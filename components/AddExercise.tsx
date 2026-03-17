'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface AddExerciseProps {
  onAdd: (name: string) => void;
}

export default function AddExercise({ onAdd }: AddExerciseProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 mt-6 mb-8 relative group">
      <div className="relative flex-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New exercise (e.g. Bench Press)"
          className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all font-medium text-lg shadow-inner"
        />
      </div>
      <button
        type="submit"
        disabled={!name.trim()}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] flex items-center justify-center active:scale-[0.98]"
      >
        <Plus className="w-6 h-6" />
      </button>
    </form>
  );
}
