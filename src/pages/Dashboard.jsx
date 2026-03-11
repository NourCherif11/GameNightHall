import React, { useMemo, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
    BarChart, Bar, LineChart, Line, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { formatPrice } from '@/lib/utils'
import { clearAllData, seedMockData } from '@/lib/storage'
import {
    TrendingUp, TrendingDown, DollarSign, Clock,
    Users, CalendarDays, Flame, Trophy,
    BarChart3, Timer, Target, Zap, Trash2, Database,
} from 'lucide-react'

const COLORS = ['#10B981', '#06B6D4', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#6366F1']
const DAYS_FR = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
const DAY_SHORT_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function StatCard({ icon: Icon, label, value, subValue, trend, color = 'emerald' }) {
    const colorMap = {
        emerald: 'bg-orange-500/10 text-orange-400',
        blue: 'bg-blue-500/10 text-blue-400',
        amber: 'bg-amber-500/10 text-amber-400',
        purple: 'bg-purple-500/10 text-purple-400',
        red: 'bg-red-500/10 text-red-400',
        cyan: 'bg-cyan-500/10 text-cyan-400',
    }

    return (
        <Card className="border-border/50 bg-card/50 card-hover">
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
                            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div className="mt-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold mt-0.5">{value}</p>
                    {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
                </div>
            </CardContent>
        </Card>
    )
}

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border/50 rounded-lg p-3 shadow-xl">
                <p className="text-sm font-medium mb-1">{label}</p>
                {payload.map((entry, i) => (
                    <p key={i} className="text-xs" style={{ color: entry.color }}>
                        {entry.name}: {typeof entry.value === 'number' && entry.name?.toLowerCase().includes('revenu')
                            ? formatPrice(entry.value)
                            : entry.value}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default function Dashboard() {
    const { bills, refreshData } = useApp()
    const [isClearing, setIsClearing] = useState(false)
    const [isSeeding, setIsSeeding] = useState(false)

    const handleClearDatabase = async () => {
        if (!confirm('⚠️ ATTENTION: Cette action va SUPPRIMER TOUTES les données (factures et joueurs). Êtes-vous sûr ?')) {
            return
        }

        console.log('🔴 [DASHBOARD] User confirmed: Clearing database...')
        setIsClearing(true)
        const success = await clearAllData()

        if (success) {
            console.log('✅ [DASHBOARD] Database cleared, refreshing data...')
            await refreshData()
            alert('✅ Base de données vidée avec succès!')
        } else {
            alert('❌ Erreur lors du vidage de la base de données')
        }
        setIsClearing(false)
    }

    const handleSeedDatabase = async () => {
        if (!confirm('📊 Cette action va ajouter des données fictives (joueurs et factures). Continuer ?')) {
            return
        }

        console.log('🌱 [DASHBOARD] User confirmed: Seeding database...')
        setIsSeeding(true)
        const success = await seedMockData()

        if (success) {
            console.log('✅ [DASHBOARD] Database seeded, refreshing data...')
            await refreshData()
            alert('✅ Données fictives ajoutées avec succès!')
        } else {
            alert('❌ Erreur lors de l\'ajout des données')
        }
        setIsSeeding(false)
    }

    const analytics = useMemo(() => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

        const todayBills = bills.filter(b => new Date(b.createdAt) >= today)
        const weekBills = bills.filter(b => new Date(b.createdAt) >= startOfWeek)
        const monthBills = bills.filter(b => new Date(b.createdAt) >= startOfMonth)
        const lastMonthBills = bills.filter(b => {
            const d = new Date(b.createdAt)
            return d >= startOfLastMonth && d <= endOfLastMonth
        })

        const todayRevenue = todayBills.reduce((s, b) => s + b.price, 0)
        const weekRevenue = weekBills.reduce((s, b) => s + b.price, 0)
        const monthRevenue = monthBills.reduce((s, b) => s + b.price, 0)
        const lastMonthRevenue = lastMonthBills.reduce((s, b) => s + b.price, 0)
        const monthTrend = lastMonthRevenue > 0
            ? Math.round(((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
            : 0

        const avgDuration = bills.length > 0
            ? Math.round(bills.reduce((s, b) => s + b.duration, 0) / bills.length)
            : 0

        const avgValue = bills.length > 0
            ? bills.reduce((s, b) => s + b.price, 0) / bills.length
            : 0

        const uniquePlayers = new Set(bills.map(b => b.playerName.toLowerCase())).size

        const playerMap = {}
        bills.forEach(b => {
            const name = b.playerName
            if (!playerMap[name]) playerMap[name] = { sessions: 0, revenue: 0, totalDuration: 0 }
            playerMap[name].sessions++
            playerMap[name].revenue += b.price
            playerMap[name].totalDuration += b.duration
        })
        const topPlayers = Object.entries(playerMap)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5)

        const dayData = DAYS_FR.map((day, i) => {
            const dayBills = bills.filter(b => new Date(b.createdAt).getDay() === i)
            return {
                day: DAY_SHORT_FR[i],
                fullDay: day,
                sessions: dayBills.length,
                revenue: dayBills.reduce((s, b) => s + b.price, 0),
                avgDuration: dayBills.length > 0
                    ? Math.round(dayBills.reduce((s, b) => s + b.duration, 0) / dayBills.length / 60)
                    : 0,
            }
        })

        const bestDay = [...dayData].sort((a, b) => b.revenue - a.revenue)[0]

        const hourlyData = Array.from({ length: 14 }, (_, i) => {
            const hour = i + 10
            const hourBills = bills.filter(b => new Date(b.startTime).getHours() === hour)
            return {
                hour: `${hour}h`,
                sessions: hourBills.length,
                revenue: hourBills.reduce((s, b) => s + b.price, 0),
            }
        })

        const peakHour = [...hourlyData].sort((a, b) => b.sessions - a.sessions)[0]

        const dailyRevenue = []
        for (let i = 13; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)
            const nextDay = new Date(date)
            nextDay.setDate(nextDay.getDate() + 1)
            const dayBills = bills.filter(b => {
                const d = new Date(b.createdAt)
                return d >= date && d < nextDay
            })
            dailyRevenue.push({
                date: date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
                revenue: dayBills.reduce((s, b) => s + b.price, 0),
                sessions: dayBills.length,
            })
        }

        const tableData = [1, 2, 3, 4].map(t => {
            const tableBills = bills.filter(b => b.tableNumber === t)
            return {
                name: `Table ${t}`,
                sessions: tableBills.length,
                revenue: tableBills.reduce((s, b) => s + b.price, 0),
                avgDuration: tableBills.length > 0
                    ? Math.round(tableBills.reduce((s, b) => s + b.duration, 0) / tableBills.length / 60)
                    : 0,
            }
        })

        const monthlyRevenue = []
        for (let i = 5; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59)
            const mBills = bills.filter(b => {
                const d = new Date(b.createdAt)
                return d >= start && d <= end
            })
            monthlyRevenue.push({
                month: start.toLocaleDateString('fr-FR', { month: 'short' }),
                revenue: mBills.reduce((s, b) => s + b.price, 0),
                sessions: mBills.length,
            })
        }

        const paidCount = bills.filter(b => b.paid).length
        const collectionRate = bills.length > 0 ? Math.round((paidCount / bills.length) * 100) : 0

        return {
            todayRevenue, weekRevenue, monthRevenue, monthTrend,
            todaySessions: todayBills.length,
            weekSessions: weekBills.length,
            monthSessions: monthBills.length,
            avgDuration, avgValue, uniquePlayers,
            topPlayers, dayData, hourlyData, dailyRevenue,
            tableData, monthlyRevenue, bestDay, peakHour,
            collectionRate, totalBills: bills.length,
        }
    }, [bills])

    return (
        <div className="space-y-6">
            {/* Database Control Buttons - TEMPORARY */}
            <div className="flex gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-400 mb-1">🔧 Contrôles de base de données (TEMPORAIRE)</p>
                    <p className="text-xs text-muted-foreground">Utilisez ces boutons pour tester la connexion Supabase</p>
                </div>
                <Button
                    onClick={handleClearDatabase}
                    disabled={isClearing}
                    variant="destructive"
                    size="sm"
                    className="bg-red-500 hover:bg-red-600"
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {isClearing ? 'Vidage...' : 'Vider la DB'}
                </Button>
                <Button
                    onClick={handleSeedDatabase}
                    disabled={isSeeding}
                    variant="default"
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600"
                >
                    <Database className="w-4 h-4 mr-2" />
                    {isSeeding ? 'Ajout...' : 'Remplir la DB'}
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={DollarSign}
                    label="Revenu du jour"
                    value={formatPrice(analytics.todayRevenue)}
                    subValue={`${analytics.todaySessions} sessions`}
                    color="emerald"
                />
                <StatCard
                    icon={CalendarDays}
                    label="Cette semaine"
                    value={formatPrice(analytics.weekRevenue)}
                    subValue={`${analytics.weekSessions} sessions`}
                    color="blue"
                />
                <StatCard
                    icon={BarChart3}
                    label="Ce mois"
                    value={formatPrice(analytics.monthRevenue)}
                    subValue={`${analytics.monthSessions} sessions`}
                    trend={analytics.monthTrend}
                    color="purple"
                />
                <StatCard
                    icon={Users}
                    label="Joueurs uniques"
                    value={analytics.uniquePlayers}
                    subValue={`${analytics.totalBills} sessions au total`}
                    color="cyan"
                />
            </div>

            {/* Secondary KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Timer}
                    label="Durée moy. de session"
                    value={`${Math.floor(analytics.avgDuration / 60)}m ${analytics.avgDuration % 60}s`}
                    color="amber"
                />
                <StatCard
                    icon={Target}
                    label="Valeur moy. de session"
                    value={formatPrice(analytics.avgValue)}
                    color="emerald"
                />
                <StatCard
                    icon={Flame}
                    label="Meilleur jour"
                    value={analytics.bestDay?.fullDay || '—'}
                    subValue={analytics.bestDay ? `${formatPrice(analytics.bestDay.revenue)} de revenu` : ''}
                    color="red"
                />
                <StatCard
                    icon={Zap}
                    label="Heure de pointe"
                    value={analytics.peakHour?.hour || '—'}
                    subValue={analytics.peakHour ? `${analytics.peakHour.sessions} sessions` : ''}
                    color="purple"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <Card className="border-border/50 bg-card/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-400" />
                            Tendance des revenus (14 jours)
                        </CardTitle>
                        <CardDescription>Aperçu des revenus quotidiens</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.dailyRevenue}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 34%, 17%)" />
                                    <XAxis dataKey="date" tick={{ fill: '#6B7280', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                                    <ReTooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Revenu"
                                        stroke="#10B981"
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Day of Week Heatmap */}
                <Card className="border-border/50 bg-card/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Flame className="w-4 h-4 text-amber-400" />
                            Performance par jour
                        </CardTitle>
                        <CardDescription>Sessions & revenus par jour de la semaine</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.dayData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 34%, 17%)" />
                                    <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                                    <ReTooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="sessions" name="Sessions" fill="#10B981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="revenue" name="Revenu" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Distribution */}
                <Card className="border-border/50 bg-card/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            Distribution par heure
                        </CardTitle>
                        <CardDescription>Nombre de sessions par heure</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.hourlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 34%, 17%)" />
                                    <XAxis dataKey="hour" tick={{ fill: '#6B7280', fontSize: 10 }} />
                                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                                    <ReTooltip content={<CustomTooltip />} />
                                    <Bar dataKey="sessions" name="Sessions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Utilization */}
                <Card className="border-border/50 bg-card/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-purple-400" />
                            Performance des tables
                        </CardTitle>
                        <CardDescription>Comparaison entre les tables</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={analytics.tableData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 34%, 17%)" />
                                    <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 11 }} />
                                    <YAxis dataKey="name" type="category" tick={{ fill: '#6B7280', fontSize: 11 }} width={60} />
                                    <ReTooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="sessions" name="Sessions" fill="#10B981" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey="revenue" name="Revenu" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Revenue */}
                <Card className="border-border/50 bg-card/50 lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarDays className="w-4 h-4 text-orange-400" />
                            Tendance mensuelle des revenus
                        </CardTitle>
                        <CardDescription>Aperçu des 6 derniers mois</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analytics.monthlyRevenue}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 34%, 17%)" />
                                    <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} />
                                    <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} />
                                    <ReTooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        name="Revenu"
                                        stroke="#10B981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
                                        activeDot={{ r: 7 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="sessions"
                                        name="Sessions"
                                        stroke="#8B5CF6"
                                        strokeWidth={2}
                                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Players */}
                <Card className="border-border/50 bg-card/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-amber-400" />
                            Meilleurs joueurs
                        </CardTitle>
                        <CardDescription>Par dépenses totales</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {analytics.topPlayers.map((player, i) => (
                                <div key={player.name} className="flex items-center gap-3">
                                    <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                    ${i === 0 ? 'bg-amber-500/20 text-amber-400' :
                                            i === 1 ? 'bg-gray-400/20 text-gray-400' :
                                                i === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-muted text-muted-foreground'}
                  `}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{player.name}</div>
                                        <div className="text-xs text-muted-foreground">{player.sessions} sessions</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-orange-400">{formatPrice(player.revenue)}</div>
                                    </div>
                                </div>
                            ))}
                            {analytics.topPlayers.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">Aucune donnée</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Day Heatmap Visual */}
            <Card className="border-border/50 bg-card/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Flame className="w-4 h-4 text-red-400" />
                        Carte thermique hebdomadaire
                    </CardTitle>
                    <CardDescription>Intensité d'activité par jour de la semaine</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-3">
                        {analytics.dayData.map(day => {
                            const maxSessions = Math.max(...analytics.dayData.map(d => d.sessions), 1)
                            const intensity = day.sessions / maxSessions
                            return (
                                <div
                                    key={day.day}
                                    className="rounded-xl p-4 text-center border transition-all hover:scale-105"
                                    style={{
                                        backgroundColor: `rgba(16, 185, 129, ${intensity * 0.3})`,
                                        borderColor: `rgba(16, 185, 129, ${intensity * 0.4})`,
                                    }}
                                >
                                    <div className="text-xs text-muted-foreground mb-1">{day.day}</div>
                                    <div className="text-2xl font-bold font-mono-timer">{day.sessions}</div>
                                    <div className="text-xs text-muted-foreground mt-1">sessions</div>
                                    <div className="text-xs text-orange-400 mt-0.5 font-medium">{formatPrice(day.revenue)}</div>
                                    <div className="text-[10px] text-muted-foreground mt-0.5">~{day.avgDuration}min moy.</div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Collection Rate */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 mb-3">
                            <span className="text-2xl font-bold text-orange-400">{analytics.collectionRate}%</span>
                        </div>
                        <h3 className="font-medium">Taux d'encaissement</h3>
                        <p className="text-xs text-muted-foreground mt-1">Factures payées vs total</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 mb-3">
                            <span className="text-2xl font-bold text-blue-400">{analytics.totalBills}</span>
                        </div>
                        <h3 className="font-medium">Total des sessions</h3>
                        <p className="text-xs text-muted-foreground mt-1">Nombre total de sessions</p>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-6 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
                            <span className="text-2xl font-bold text-amber-400">{Math.round(analytics.avgDuration / 60)}</span>
                        </div>
                        <h3 className="font-medium">Durée moy. (min)</h3>
                        <p className="text-xs text-muted-foreground mt-1">Durée moyenne des sessions</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
