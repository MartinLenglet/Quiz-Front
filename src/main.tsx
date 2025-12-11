import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import AppRoutes from "@/app/router"
import { Navbar } from "@/components/ui/custom_navbar"
import "./index.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename="/Quiz-Front">

      <Navbar />

      <AppRoutes />

    </BrowserRouter >
  </StrictMode>,
)
