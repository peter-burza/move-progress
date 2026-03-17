'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useExerciseStore, ExerciseLog } from '@/lib/store'
import { format } from 'date-fns'
import { ArrowLeft, History as HistoryIcon, Activity } from 'lucide-react'

interface HistoryLog extends ExerciseLog {
  exerciseId: string
}

function HistoryContent() {
  const searchParams = useSearchParams()
  const exerciseId = searchParams.get('exerciseId')
  const router = useRouter()
  const { user, exercises } = useExerciseStore()
  const [logs, setLogs] = useState<HistoryLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    // We expect the user to have chosen an exercise
    if (!exerciseId) {
      setLoading(false)
      return
    }

    const logsRef = collection(db, 'users', user.uid, 'exercises', exerciseId, 'logs')
    const q = query(logsRef, orderBy('timestamp', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          exerciseId: exerciseId,
          timestamp: data.timestamp,
          note: data.note,
          setsList: data.setsList,
          text: data.text || (data.sets ? `${data.sets} Sets x ${data.reps} Reps\n${data.note || ''}`.trim() : ''),
        } as HistoryLog
      })
      setLogs(logsData)
      setLoading(false)
    }, (error) => {
      console.error("Error fetching logs:", error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, exerciseId, router])

  const exerciseName = exercises.find(e => e.id === exerciseId)?.name || 'Exercise History'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Activity className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.push('/')}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white/95">History</h1>
          <p className="text-sm text-gray-400 font-medium tracking-wide">{exerciseName}</p>
        </div>
      </header>

      <div className="space-y-4 pb-10">
        {!exerciseId ? (
          <div className="text-center py-16 px-6 border border-white/10 rounded-3xl bg-white/5">
            <p className="text-gray-400">Select an exercise from the dashboard to view its history.</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 px-6 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-3">
              <HistoryIcon className="w-8 h-8 text-blue-400/50" />
            </div>
            <h3 className="text-xl font-bold text-white/90 mb-2">No history</h3>
            <p className="text-gray-400 font-medium leading-relaxed">You haven't logged any workouts for this exercise yet.</p>
          </div>
        ) : (
          logs.map(log => (
            <div key={log.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-md relative overflow-hidden group hover:bg-white/10 transition-colors">
              <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-4 flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400/80 bg-blue-500/10 px-3 py-1.5 rounded-lg">Workout session</span>
                <span className="text-sm text-gray-400 font-medium">
                  {format(log.timestamp, 'MMM d, yyyy - h:mm a')}
                </span>
              </div>

              {log.note && (
                <div className="mb-4">
                  <p className="text-base text-gray-300 font-medium italic">"{log.note}"</p>
                </div>
              )}

              {log.setsList && log.setsList.length > 0 ? (
                <div className="mt-2 bg-black/20 rounded-2xl p-5 border-l-2 border-blue-500/50 space-y-2">
                  {log.setsList.map((s, idx) => (
                    <div key={idx} className="text-gray-200 font-sans tracking-wide text-lg">
                      <span className="text-gray-500 mr-2">{idx + 1}.</span>
                      <span className="font-bold">{s.reps}x</span>
                      {s.negatives && <span className="text-gray-400 italic"> + {s.negatives}x negative</span>}
                    </div>
                  ))}
                </div>
              ) : log.text ? (
                <div className="mt-2 bg-black/20 rounded-2xl p-5 border-l-2 border-blue-500/50">
                  <pre className="text-base text-gray-200 font-sans tracking-wide leading-relaxed whitespace-pre-wrap">
                    {log.text}
                  </pre>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh]">
        <Activity className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <HistoryContent />
    </Suspense>
  )
}
