import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './features/start/Home';
import Templates from './features/templates/Templates';
import { TemplateEdit } from './features/templates/TemplateEdit';
import ActiveWorkout from './features/workout/ActiveWorkout';
import History from './features/history/History';
import Exercises from './features/exercises/Exercises';
import Analytics from './features/analytics/Analytics';
import Layout from './ui/Layout';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { auth } from './firebase';
import { getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { syncNow } from './data/cloudSync';

const SYNC_INTERVAL_MS = 2 * 60 * 1000;

function App() {
    const { user, setUser } = useAuthStore();

    useEffect(() => {
        if (!auth) return;
        getRedirectResult(auth).catch((err) => console.error('Google sign-in failed', err));
        return onAuthStateChanged(auth, setUser);
    }, [setUser]);

    useEffect(() => {
        if (!user) return;

        const trySync = () => {
            if (navigator.onLine) syncNow(user).catch(console.error);
        };

        trySync();
        const interval = setInterval(trySync, SYNC_INTERVAL_MS);
        document.addEventListener('visibilitychange', trySync);
        window.addEventListener('online', trySync);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', trySync);
            window.removeEventListener('online', trySync);
        };
    }, [user]);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="workout" element={<ActiveWorkout />} />
                    <Route path="templates" element={<Templates />} />
                    <Route path="templates/:id" element={<TemplateEdit />} />
                    <Route path="exercises" element={<Exercises />} />
                    <Route path="history" element={<History />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
