import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { AppProvider } from '@/context/AppContext'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import Login from '@/pages/Login'
import Compteurs from '@/pages/Compteurs'
import Bills from '@/pages/Bills'
import Dashboard from '@/pages/Dashboard'
import Players from '@/pages/Players'
import Boissons from '@/pages/Boissons'

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pool-bg">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}

function SuperAdminRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center pool-bg">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Chargement...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role !== 'superadmin') {
        return <Navigate to="/compteurs" replace />
    }

    return children
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) return null

    if (user) {
        return <Navigate to="/compteurs" replace />
    }

    return children
}

function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <Login />
                    </PublicRoute>
                }
            />
            <Route
                element={
                    <ProtectedRoute>
                        <AppProvider>
                            <Layout />
                        </AppProvider>
                    </ProtectedRoute>
                }
            >
                <Route path="/compteurs" element={<Compteurs />} />
                <Route path="/boissons" element={<Boissons />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/players" element={<Players />} />
                <Route
                    path="/dashboard"
                    element={
                        <SuperAdminRoute>
                            <Dashboard />
                        </SuperAdminRoute>
                    }
                />
            </Route>
            <Route path="*" element={<Navigate to="/compteurs" replace />} />
        </Routes>
    )
}

export default function App() {
    return (
        <HashRouter>
            <AuthProvider>
                <TooltipProvider>
                    <AppRoutes />
                </TooltipProvider>
            </AuthProvider>
        </HashRouter>
    )
}
