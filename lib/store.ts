import { create } from 'zustand';
import type { User } from 'firebase/auth';

export interface SetEntry {
  reps: string;
  negatives?: string;
}

export interface ExerciseLog {
  id: string;
  timestamp: number;
  note?: string;      // The session note "sirka ramien vacsia ako su ramena:"
  setsList?: SetEntry[];  // Array of sets for the session
  text?: string;      // Legacy
}

export interface Exercise {
  id: string;
  name: string;
  lastLog?: ExerciseLog;
}

interface ExerciseState {
  user: User | null;
  setUser: (user: User | null) => void;
  exercises: Exercise[];
  setExercises: (exercises: Exercise[]) => void;
  addExercise: (exercise: Exercise) => void;
  updateExerciseLog: (exerciseId: string, log: ExerciseLog) => void;
}

export const useExerciseStore = create<ExerciseState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  exercises: [],
  setExercises: (exercises) => set({ exercises }),
  addExercise: (exercise) => 
    set((state) => ({ exercises: [exercise, ...state.exercises] })),
  updateExerciseLog: (exerciseId, log) =>
    set((state) => ({
      exercises: state.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, lastLog: log } : ex
      ),
    })),
}));
