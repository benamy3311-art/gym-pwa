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
import { useThemeStore } from './store/themeStore';

function App() {
    const { theme } = useThemeStore();

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (t: 'dark' | 'light') => {
            root.setAttribute('data-theme', t);
        };

        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
            applyTheme(mediaQuery.matches ? 'light' : 'dark');

            const listener = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'light' : 'dark');
            mediaQuery.addEventListener('change', listener);
            return () => mediaQuery.removeEventListener('change', listener);
        } else {
            applyTheme(theme);
        }
    }, [theme]);
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
