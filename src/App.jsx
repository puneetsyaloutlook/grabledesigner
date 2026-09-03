import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Features from './pages/Features';
import Experience from './pages/Experience';
import Standards from './pages/Standards';
import Documentation from './pages/Documentation';
import Framework from './pages/Framework';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/standards" element={<Standards />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/framework" element={<Framework />} />
      </Route>
    </Routes>
  );
}
