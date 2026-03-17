'use client';

import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useExerciseStore, Exercise } from '@/lib/store';
import Auth from '@/components/Auth';
import AddExercise from '@/components/AddExercise';
import ExerciseCard from '@/components/ExerciseCard';
import { Activity, Dumbbell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { user, setUser, exercises, setExercises, addExercise, updateExerciseLog } = useExerciseStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [setUser]);

  useEffect(() => {
    if (!user) return;

    // Fetch exercises
    const q = query(collection(db, 'users', user.uid, 'exercises'), orderBy('createdAt', 'desc'));
    const unsubscribeExecs = onSnapshot(q, async (snapshot) => {
      const execsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Exercise[];
      
      setExercises(execsData);
      setLoading(false);
    });

    return () => unsubscribeExecs();
  }, [user, setExercises]);

  const handleAddExercise = async (name: string) => {
    if (!user) return;
    try {
      const newExecRef = doc(collection(db, 'users', user.uid, 'exercises'));
      await setDoc(newExecRef, {
        name,
        createdAt: Date.now(),
        lastLog: null
      });
    } catch (error) {
      console.error("Error adding exercise:", error);
    }
  };

  const handleSaveProgress = async (exerciseId: string, log: any) => {
    if (!user) return;
    try {
      // 1. Add log to subcollection
      const logsRef = collection(db, 'users', user.uid, 'exercises', exerciseId, 'logs');
      await addDoc(logsRef, log);

      // 2. Update lastLog on the exercise document for quick dashboard access
      const execRef = doc(db, 'users', user.uid, 'exercises', exerciseId);
      await setDoc(execRef, { lastLog: log }, { merge: true });

      updateExerciseLog(exerciseId, log);
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  };

  const handleSignOut = () => auth.signOut();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Activity className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl border border-white/5 shadow-inner">
            <Dumbbell className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white/95">Dashboard</h1>
            <p className="text-sm text-gray-400 font-medium tracking-wide">Ready to work out?</p>
          </div>
        </div>
        <button 
          onClick={handleSignOut}
          className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-2xl transition-all border border-transparent hover:border-white/10"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <AddExercise onAdd={handleAddExercise} />

      <div className="space-y-6">
        {exercises.length === 0 ? (
          <div className="text-center py-16 px-6 border-2 border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-5 rotate-12">
              <Dumbbell className="w-8 h-8 text-blue-400/50" />
            </div>
            <h3 className="text-xl font-bold text-white/90 mb-2">No exercises yet</h3>
            <p className="text-gray-400 font-medium">Add your first exercise above to start tracking your progress.</p>
          </div>
        ) : (
          exercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onSaveProgress={handleSaveProgress}
              onViewHistory={(id) => router.push(`/history?exerciseId=${id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}
