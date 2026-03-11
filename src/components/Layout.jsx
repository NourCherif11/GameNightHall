import React, { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    LayoutDashboard,
    Grid3X3,
    Receipt,
    LogOut,
    Menu,
    X,
    CircleDot,
    ChevronRight,
    Users,
    Check,
    UserCog,
    Coffee,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

const navItems = [
    { path: '/compteurs', label: 'Compteurs', icon: Grid3X3, description: 'Gérer les compteurs' },
    { path: '/boissons', label: 'Boissons', icon: Coffee, description: 'Vendre des boissons' },
    { path: '/bills', label: 'Factures', icon: Receipt, description: 'Voir & gérer les factures' },
    { path: '/players', label: 'Joueurs', icon: Users, description: 'Gérer les joueurs' },
    { path: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, description: 'Analytiques & statistiques' },
]

export default function Layout() {
    const { user, logout, refreshUser } = useAuth()
    const { settings } = useApp()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [editProfileOpen, setEditProfileOpen] = useState(false)
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [profileLoading, setProfileLoading] = useState(false)
    const [profileError, setProfileError] = useState('')
    const [profileSuccess, setProfileSuccess] = useState('')

    const currentPage = navItems.find(item => location.pathname.startsWith(item.path))

    const handleEditProfile = () => {
        setProfileData({
            name: user?.name || '',
            email: user?.email || '',
            newPassword: '',
            confirmPassword: '',
        })
        setProfileError('')
        setProfileSuccess('')
        setEditProfileOpen(true)
    }

    const handleSaveProfile = async () => {
        setProfileError('')
        setProfileSuccess('')
        setProfileLoading(true)

        try {
            console.log('👤 [PROFILE] Updating profile...')

            // Validate passwords match if provided
            if (profileData.newPassword || profileData.confirmPassword) {
                if (profileData.newPassword !== profileData.confirmPassword) {
                    setProfileError('Les mots de passe ne correspondent pas')
                    setProfileLoading(false)
                    return
                }
                if (profileData.newPassword.length < 6) {
                    setProfileError('Le mot de passe doit contenir au moins 6 caractères')
                    setProfileLoading(false)
                    return
                }
            }

            // Update user data - separate email changes from other updates
            const hasEmailChange = profileData.email && profileData.email !== user?.email
            const updates = {}
            
            if (profileData.newPassword) {
                updates.password = profileData.newPassword
            }
            if (profileData.name !== user?.name) {
                // Preserve role when updating name
                updates.data = {
                    name: profileData.name,
                    role: user?.role || 'admin'
                }
            }

            // Apply name/password updates first
            if (Object.keys(updates).length > 0) {
                const { error } = await supabase.auth.updateUser(updates)

                if (error) {
                    console.error('❌ [PROFILE] Update failed:', error.message)
                    setProfileError(error.message)
                    setProfileLoading(false)
                    return
                }

                console.log('✅ [PROFILE] Profile updated successfully')

                // Refresh user data from Supabase
                await refreshUser()
            }

            // Handle email change separately (requires confirmation)
            if (hasEmailChange) {
                const { error: emailError } = await supabase.auth.updateUser({
                    email: profileData.email
                })

                if (emailError) {
                    console.error('❌ [PROFILE] Email update failed:', emailError.message)
                    setProfileError(`Erreur email: ${emailError.message}`)
                    setProfileLoading(false)
                    return
                }

                console.log('✅ [PROFILE] Email confirmation sent')
                setProfileSuccess('Un email de confirmation a été envoyé à votre nouvelle adresse')
                
                setTimeout(() => {
                    setEditProfileOpen(false)
                    setProfileSuccess('')
                }, 3000)
            } else if (Object.keys(updates).length > 0) {
                setProfileSuccess('Profil mis à jour avec succès!')

                // Close dialog after 1.5 seconds
                setTimeout(() => {
                    setEditProfileOpen(false)
                    setProfileSuccess('')
                }, 1500)
            } else {
                setProfileError('Aucune modification détectée')
            }
        } catch (error) {
            console.error('❌ [PROFILE] Error:', error)
            setProfileError('Une erreur est survenue')
        }

        setProfileLoading(false)
    }

    return (
        <div className="min-h-screen flex pool-bg">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50
        w-72 bg-card/95 backdrop-blur-xl border-r border-border/50
        flex flex-col h-screen overflow-hidden
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="p-6 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden logo-container">
                            <img src="https://zvxvjztilxoqmadhukwc.supabase.co/storage/v1/object/public/images/gameparklogo.png" alt="GamePark Logo" className="w-full h-full object-cover logo-spin" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold gradient-text">GamePark</h1>
                            <p className="text-xs text-muted-foreground">Système de gestion</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <Separator className="opacity-50 shrink-0" />

                {/* Navigation - takes available space but doesn't scroll */}
                <nav className="flex-1 p-4 space-y-1 overflow-hidden">
                    {navItems
                        .filter(item => {
                            // Hide dashboard for non-superadmin users
                            if (item.path === '/dashboard' && user?.role !== 'superadmin') {
                                return false
                            }
                            return true
                        })
                        .map(item => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) => `
                group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 glow-emerald'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                    }
              `}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                <div className="flex-1">
                                    <div>{item.label}</div>
                                    <div className="text-xs opacity-60 mt-0.5">{item.description}</div>
                                </div>
                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />
                            </NavLink>
                        ))}
                </nav>

                {/* Bottom section: User — always pinned at bottom */}
                <div className="shrink-0 mt-auto">
                    {/* User */}
                    <div className="p-4">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-accent/50 transition-colors">
                                    <Avatar className="h-9 w-9 border border-orange-500/20">
                                        <AvatarFallback className="bg-orange-500/10 text-orange-400 text-sm font-semibold">
                                            {user?.name?.charAt(0) || 'A'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 text-left">
                                        <div className="text-sm font-medium">{user?.name || 'Admin'}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {(() => {
                                                console.log('🎭 [LAYOUT] User role check:', user?.role)
                                                return user?.role === 'superadmin' ? 'Super-Admin' : 'Caissier'
                                            })()}
                                        </div>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleEditProfile}
                                    className="cursor-pointer"
                                >
                                    <UserCog className="w-4 h-4 mr-2" />
                                    Modifier le profil
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={logout}
                                    className="text-red-400 focus:text-red-400 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Déconnexion
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </aside>

            {/* Edit Profile Dialog */}
            <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modifier le profil</DialogTitle>
                        <DialogDescription>
                            Mettez à jour vos informations de compte
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="profile-name">Nom</Label>
                            <Input
                                id="profile-name"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                placeholder="Votre nom"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile-email">Email</Label>
                            <Input
                                id="profile-email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                placeholder="votre@email.com"
                            />
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="profile-password">Nouveau mot de passe (optionnel)</Label>
                            <Input
                                id="profile-password"
                                type="password"
                                value={profileData.newPassword}
                                onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                                placeholder="Laisser vide pour ne pas changer"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile-confirm">Confirmer le mot de passe</Label>
                            <Input
                                id="profile-confirm"
                                type="password"
                                value={profileData.confirmPassword}
                                onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                                placeholder="Confirmer le nouveau mot de passe"
                            />
                        </div>

                        {profileError && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-3 py-2 rounded-lg">
                                {profileError}
                            </div>
                        )}

                        {profileSuccess && (
                            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm px-3 py-2 rounded-lg">
                                {profileSuccess}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditProfileOpen(false)}
                            disabled={profileLoading}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSaveProfile}
                            disabled={profileLoading}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {profileLoading ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen lg:ml-72">
                {/* Top bar */}
                <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
                    <div className="flex items-center justify-between px-4 lg:px-8 h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-lg font-semibold">{currentPage?.label || 'GamePark'}</h2>
                                <p className="text-xs text-muted-foreground hidden sm:block">{currentPage?.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground bg-card/50 px-3 py-1.5 rounded-full border border-border/50">
                                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                                Système en ligne
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
