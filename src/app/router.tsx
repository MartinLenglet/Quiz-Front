import { Routes, Route } from "react-router-dom"

import HomePage from "@/pages/HomePage"
import AboutPage from "@/pages/AboutPage"
import MyGamesPage from "@/pages/MyGamesPage"
import GamePage from "@/pages/GamePage"
import SignInPage from "@/pages/SignInPage"
import SignUpPage from "@/pages/SignUpPage"
import AccountPage from "@/pages/AccountPage"
import MyThemesPage from "@/pages/MyThemesPage";
import UpdateThemePage from "@/pages/UpdateThemePage";
import GameResultsPage from "@/pages/GameResultsPage";

import { ProtectedRoute } from "@/features/auth"
import { ThemeOwnerRoute } from "@/features/themes/components/ThemeOwnerRoute";
// import { GameOwnerRoute } from "@/features/games/components/GameOwnerRoute";

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />

      {/* Routes protégées */}
      <Route element={<ProtectedRoute />}>
        <Route path="/account" element={<AccountPage />} />
        <Route path="/my-themes" element={<MyThemesPage />} />

        {/* Owner-only */}
        <Route element={<ThemeOwnerRoute redirectTo="/my-themes" />}>
          <Route path="/themes/:themeId/update" element={<UpdateThemePage />} />
        </Route>

        <Route path="/my-games" element={<MyGamesPage />} />
        <Route path="/games/:gameUrl" element={<GamePage />} />
        <Route path="/games/:gameUrl/results" element={<GameResultsPage />} />

        {/* Owner-only
        <Route element={<GameOwnerRoute redirectTo="/my-games" />}>
          <Route path="/games/:gameUrl" element={<GamePage />} />
        </Route> */}
      </Route>

      {/* Protégé (admin only) - exemple */}
      <Route element={<ProtectedRoute requireAdmin />}>
        {/* <Route path="/admin" element={<AdminPage />} /> */}
      </Route>

    </Routes>
  );
}