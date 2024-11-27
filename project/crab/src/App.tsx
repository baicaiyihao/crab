import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./ui/Layout"; // 引入 Layout 组件
import HomePage from "./ui/Home";
import Dashboard from "./ui/Dashboard";
import Pools from "./ui/Pools";
import Risk from "./ui/Risk";
import Rewards from "./ui/Rewards";
import About from "./ui/About";
import NotFound from "./ui/NotFound";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<HomePage />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="pools" element={<Pools />} />
                    <Route path="risk" element={<Risk />} />
                    <Route path="rewards" element={<Rewards />} />
                    <Route path="about" element={<About />} />
                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </Router>
    );
};

export default App;
