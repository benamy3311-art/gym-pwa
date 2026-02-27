import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './features/start/Home';
import Templates from './features/templates/Templates';
import ActiveWorkout from './features/workout/ActiveWorkout';
import History from './features/history/History';
import Exercises from './features/exercises/Exercises';
import Analytics from './features/analytics/Analytics';
import Layout from './ui/Layout';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="workout" element={<ActiveWorkout />} />
                    <Route path="templates" element={<Templates />} />
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
