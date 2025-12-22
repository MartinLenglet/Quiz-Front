import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppRoutes from "@/app/router"
import { Navbar } from "@/components/custom/navbar"
import "./index.css"

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/">

        <Navbar />

        <AppRoutes />

      </BrowserRouter >
    </QueryClientProvider>
  </StrictMode>,
)
