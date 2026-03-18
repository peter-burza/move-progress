'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { CheckCircle2, History, Plus, Trash2 } from 'lucide-react'
import { Exercise, ExerciseLog, SetEntry } from '@/lib/store'

interface ExerciseCardProps {
  exercise: Exercise
  onSaveProgress: (exerciseId: string, log: Omit<ExerciseLog, 'id'>) => void
  onViewHistory?: (exerciseId: string) => void
}

export default function ExerciseCard({ exercise, onSaveProgress, onViewHistory }: ExerciseCardProps) {
  const [pendingSets, setPendingSets] = useState<SetEntry[]>([])
  const [reps, setReps] = useState('')
  const [negatives, setNegatives] = useState('')
  const [sessionNote, setSessionNote] = useState('')
  const [isSaved, setIsSaved] = useState(false)

  const handleAddSet = (e: React.FormEvent) => {
    e.preventDefault()
    if (reps.trim() !== '') {
      setPendingSets(prev => [...prev, { reps: reps.trim(), negatives: negatives.trim() }])
      setReps('')
      setNegatives('')
    }
  }

  const handleRemoveSet = (index: number) => {
    setPendingSets(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    if (pendingSets.length > 0 || sessionNote.trim() !== '') {
      onSaveProgress(exercise.id, {
        timestamp: Date.now(),
        setsList: pendingSets,
        note: sessionNote.trim(),
      })
      setPendingSets([])
      setSessionNote('')
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
  }

  const hasLastLog = !!exercise.lastLog

  const renderSetsList = (setsList?: SetEntry[], fallbackText?: string, note?: string) => {
    if (setsList && setsList.length > 0) {
      return (
        <div className="space-y-1 mt-2">
          {note && <p className="text-gray-300 font-medium italic mb-2">"{note}"</p>}
          {setsList.map((s, idx) => (
            <div key={idx} className="text-gray-200 font-sans tracking-wide">
              {s.reps}x {s.negatives ? ` + ${s.negatives}x negative` : ''}
            </div>
          ))}
        </div>
      )
    }
    if (fallbackText) {
      return (
        <pre className="text-base text-gray-200 font-sans tracking-wide leading-relaxed whitespace-pre-wrap mt-2">
          {fallbackText}
        </pre>
      )
    }
    return null
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-5 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
      {/* Subtle gradient glow effect */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      <div className="flex justify-between items-center mb-6 relative">
        <h3 className="text-2xl font-bold tracking-tight text-white/95">{exercise.name}</h3>
        {onViewHistory && (
          <button
            onClick={() => onViewHistory(exercise.id)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            title="View History"
          >
            <History className="w-5 h-5" />
          </button>
        )}
      </div>

      {hasLastLog ? (
        <div className="bg-black/30 rounded-2xl p-4 mb-6 border border-white/5 relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400/80">Last Session</span>
            <span className="text-xs text-gray-500 font-medium">
              {format(exercise.lastLog!.timestamp, 'MMM d, yyyy')}
            </span>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border-l-2 border-blue-500/50">
            {renderSetsList(exercise.lastLog!.setsList, exercise.lastLog!.text, exercise.lastLog!.note)}
          </div>
        </div>
      ) : (
        <div className="bg-black/20 rounded-2xl p-4 mb-6 border border-white/5 flex items-center justify-center min-h-[100px]">
          <p className="text-sm text-gray-400/80 italic font-medium">No history yet. Log your first session!</p>
        </div>
      )}

      <div className="space-y-4 relative">
        <div>
          <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">
            Session Note
          </label>
          <input
            type="text"
            value={sessionNote}
            onChange={(e) => setSessionNote(e.target.value)}
            className="w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:bg-black/70 focus:border-transparent outline-none transition-all placeholder-gray-600 shadow-inner"
            placeholder="E.g. sirka ramien vacsia"
          />
        </div>

        <form onSubmit={handleAddSet} className="space-y-3 p-4 bg-black/20 border border-white/5 rounded-2xl">
          <label className="block text-xs uppercase tracking-widest font-bold text-gray-400">
            Add Set
          </label>
          <div className="flex gap-2">
            <div className='flex flex-col xs:flex-row w-full gap-2'>
              <input
                type="number"
                min="1"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className="xs:w-[100px] w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:bg-black/70 focus:border-transparent outline-none transition-all placeholder-gray-600 shadow-inner"
                placeholder="Reps"
              />
              <input
                type="number"
                min="1"
                value={negatives}
                onChange={(e) => setNegatives(e.target.value)}
                className="flex-1 w-full bg-black/50 border border-white/10 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 focus:bg-black/70 focus:border-transparent outline-none transition-all placeholder-gray-600 shadow-inner"
                placeholder="+ Negatives (opt)"
              />
            </div>
            <button
              type="submit"
              disabled={reps.trim() === ''}
              className="bg-blue-600/80 hover:bg-blue-500 disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-md active:scale-95 border border-blue-500/50"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </form>

        {pendingSets.length > 0 && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/5 max-h-[160px] overflow-y-auto">
            <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-3">Current Session</h4>
            <div className="space-y-2">
              {pendingSets.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5">
                  <span className="text-gray-200 font-medium">
                    {s.reps}x {s.negatives ? ` + ${s.negatives}x negative` : ''}
                  </span>
                  <button onClick={() => handleRemoveSet(idx)} className="text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={(pendingSets.length === 0 && sessionNote.trim() === '') || isSaved}
          className={`w-full mt-2 flex items-center justify-center gap-2 font-bold py-4 rounded-xl transition-all shadow-xl active:scale-[0.98] ${isSaved
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-800 disabled:to-gray-900 disabled:text-gray-600 text-white border border-transparent'
            }`}
        >
          <CheckCircle2 className={`w-5 h-5 ${isSaved ? 'text-green-400' : ''}`} />
          {isSaved ? 'Saved!' : "Save today's progress"}
        </button>
      </div>
    </div>
  )
}
