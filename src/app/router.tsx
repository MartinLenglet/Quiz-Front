import { Routes, Route } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import AboutPage from "@/pages/AboutPage"
import CreateGamePage from "@/pages/CreateGamePage"
import GamePage from "@/pages/GamePage"

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/create_game" element={<CreateGamePage />} />
      <Route path="/game/:id" element={<GamePage />} />
    </Routes>
  );
}