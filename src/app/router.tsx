import { Routes, Route } from "react-router-dom"

import HomePage from "@/pages/HomePage"
import AboutPage from "@/pages/AboutPage"
import CreateGamePage from "@/pages/CreateGamePage"
import GamePage from "@/pages/GamePage"
import SignInPage from "@/pages/SignInPage"
import SignUpPage from "@/pages/SignUpPage"
import AccountPage from "@/pages/AccountPage"
import MyThemesPage from "@/pages/MyThemesPage";

import { ProtectedRoute } from "@/features/auth"

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />

      {/* Routes protégées */}
      <Route element={<ProtectedRoute />}>
        <Route path="/my-themes" element={<MyThemesPage />} />
        <Route path="/game/:id" element={<GamePage />} />
        <Route path="/create_game" element={<CreateGamePage />} />
        <Route path="/account" element={<AccountPage />} />
      </Route>

      {/* Protégé (admin only) - exemple */}
      <Route element={<ProtectedRoute requireAdmin />}>
        {/* <Route path="/admin" element={<AdminPage />} /> */}
      </Route>

    </Routes>
  );
}