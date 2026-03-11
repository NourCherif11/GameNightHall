import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Lock, User, Eye, EyeOff, CircleDot } from 'lucide-react'

export default function Login() {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const result = await login(email, password)
        if (!result.success) {
            setError(result.error || 'Identifiants invalides. Veuillez réessayer.')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 pool-bg relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/3 rounded-full blur-3xl" />
            </div>

            {/* Floating pool balls decoration */}
            <div className="absolute top-20 left-20 opacity-10">
                <CircleDot className="w-16 h-16 text-orange-400" />
            </div>
            <div className="absolute bottom-32 right-32 opacity-10">
                <CircleDot className="w-12 h-12 text-orange-400" />
            </div>
            <div className="absolute top-40 right-40 opacity-5">
                <CircleDot className="w-24 h-24 text-orange-400" />
            </div>

            <div className="relative w-full max-w-md animate-fade-in-up">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-2xl overflow-hidden mb-4 logo-container">
                        <img src="https://zvxvjztilxoqmadhukwc.supabase.co/storage/v1/object/public/images/gameparklogo.png" alt="GamePark Logo" className="w-full h-full object-cover logo-spin" />
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">GamePark</h1>
                    <p className="text-muted-foreground mt-1">Système de gestion de billard</p>
                </div>

                <Card className="border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl">
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-muted-foreground">Email</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="votre@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 bg-background/50 border-border/50 focus:border-orange-500/50 h-12"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-muted-foreground">Mot de passe</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Entrez votre mot de passe"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-orange-500/50 h-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-semibold bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Connexion en cours...
                                    </div>
                                ) : (
                                    'Se connecter'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-border/50">
                            <p className="text-xs text-muted-foreground text-center">
                                🔐 Authentification Supabase activée
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
