import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { formatDuration, formatPrice, formatTime } from '@/lib/utils'
import { Play, Square, Clock, DollarSign, User, Timer, Zap, Check, X, Plus, UserPlus } from 'lucide-react'

function TableCard({ table, onStart, onStop, onRename }) {
    const isActive = table.active
    const { settings } = useApp()
    const price = isActive ? (table.elapsed / 3600 * settings.hourlyRate) : 0
    const [editing, setEditing] = useState(false)
    const [editName, setEditName] = useState(table.name)
    const inputRef = useRef(null)

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [editing])

    const handleDoubleClick = () => {
        setEditName(table.name)
        setEditing(true)
    }

    const handleSaveName = () => {
        const trimmed = editName.trim()
        if (trimmed && trimmed !== table.name) {
            onRename(table.id, trimmed)
        }
        setEditing(false)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSaveName()
        if (e.key === 'Escape') setEditing(false)
    }

    return (
        <Card className={`
      relative overflow-hidden transition-all duration-500 card-hover
      ${isActive
                ? 'border-orange-500/30 glow-emerald-strong bg-gradient-to-br from-card to-emerald-950/20'
                : 'border-border/50 hover:border-border bg-card'
            }
    `}>
            {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-teal-400" />
            )}

            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              ${isActive
                                ? 'bg-orange-500/20 border border-orange-500/30'
                                : 'bg-muted border border-border'
                            }
            `}>
                            <span className="text-xl font-bold font-mono-timer">
                                {table.id}
                            </span>
                        </div>
                        <div>
                            {editing ? (
                                <div className="flex items-center gap-1">
                                    <Input
                                        ref={inputRef}
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        onBlur={handleSaveName}
                                        className="h-7 w-32 text-sm font-semibold bg-background/50"
                                    />
                                </div>
                            ) : (
                                <h3
                                    className="font-semibold text-lg cursor-pointer hover:text-orange-400 transition-colors"
                                    onDoubleClick={handleDoubleClick}
                                    title="Double-cliquez pour renommer"
                                >
                                    {table.name}
                                </h3>
                            )}
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-orange-400 animate-pulse' : 'bg-muted-foreground/30'}`} />
                                <span className="text-xs text-muted-foreground">
                                    {isActive ? 'En session' : 'Disponible'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Badge variant={isActive ? 'success' : 'secondary'} className="text-xs">
                        {isActive ? 'ACTIF' : 'LIBRE'}
                    </Badge>
                </div>

                {/* Timer display */}
                <div className={`
          rounded-xl p-6 mb-6 text-center
          ${isActive
                        ? 'bg-orange-500/5 border border-orange-500/10'
                        : 'bg-muted/30 border border-border/50'
                    }
        `}>
                    <div className={`
            font-mono-timer text-4xl font-bold tracking-wider
            ${isActive ? 'text-orange-400' : 'text-muted-foreground/40'}
          `}>
                        {formatDuration(table.elapsed)}
                    </div>
                    {isActive && (
                        <div className="flex items-center justify-center gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Début {formatTime(table.startTime)}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-orange-400" />
                                <span className="text-orange-400 font-medium">{formatPrice(price)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action button */}
                {isActive ? (
                    <Button
                        onClick={() => onStop(table.id)}
                        variant="destructive"
                        className="w-full h-12 text-base font-semibold bg-red-600/80 hover:bg-red-600 border border-red-500/30 shadow-lg shadow-red-500/10"
                    >
                        <Square className="w-4 h-4 mr-2" />
                        Terminer la session
                    </Button>
                ) : (
                    <Button
                        onClick={() => onStart(table.id)}
                        className="w-full h-12 text-base font-semibold bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Démarrer une session
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}

export default function Tables() {
    const { tables, startTable, stopTable, createBill, renameTable, players, addNewPlayer, settings } = useApp()
    const [showModal, setShowModal] = useState(false)
    const [sessionInfo, setSessionInfo] = useState(null)
    const [selectedPlayer, setSelectedPlayer] = useState('')
    const [showAddPlayer, setShowAddPlayer] = useState(false)
    const [newPlayerName, setNewPlayerName] = useState('')
    const [saving, setSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const handleStart = (tableId) => {
        startTable(tableId)
    }

    const handleStop = (tableId) => {
        const info = stopTable(tableId)
        if (info) {
            setSessionInfo(info)
            setSelectedPlayer('')
            setSearchQuery('')
            setShowAddPlayer(false)
            setNewPlayerName('')
            setShowModal(true)
        }
    }

    const handleSaveBill = async () => {
        const playerName = selectedPlayer || 'Passager'
        setSaving(true)
        await new Promise(r => setTimeout(r, 400))
        createBill(sessionInfo, playerName)
        setSaving(false)
        setShowModal(false)
        setSessionInfo(null)
        setSelectedPlayer('')
    }

    const handleAddAndSelect = () => {
        if (!newPlayerName.trim()) return
        addNewPlayer({ name: newPlayerName.trim(), phone: '', notes: '' })
        setSelectedPlayer(newPlayerName.trim())
        setNewPlayerName('')
        setShowAddPlayer(false)
    }

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const activeTables = tables.filter(t => t.active).length
    const totalRevenue = tables.reduce((sum, t) => sum + (t.active ? (t.elapsed / 3600 * settings.hourlyRate) : 0), 0)

    return (
        <div className="space-y-6">
            {/* Stats bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Tables actives</p>
                            <p className="text-xl font-bold">{activeTables} <span className="text-sm font-normal text-muted-foreground">/ {tables.length}</span></p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <Timer className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Temps actif total</p>
                            <p className="text-xl font-bold font-mono-timer">
                                {formatDuration(tables.reduce((sum, t) => sum + (t.active ? t.elapsed : 0), 0))}
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Revenu en cours</p>
                            <p className="text-xl font-bold text-orange-400">{formatPrice(totalRevenue)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tables grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tables.map((table, i) => (
                    <div key={table.id} className={`animate-fade-in-up animate-delay-${(i + 1) * 100}`}>
                        <TableCard
                            table={table}
                            onStart={handleStart}
                            onStop={handleStop}
                            onRename={renameTable}
                        />
                    </div>
                ))}
            </div>

            {/* Payment Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <ReceiptIcon className="w-5 h-5 text-orange-400" />
                            Session terminée
                        </DialogTitle>
                        <DialogDescription>
                            Sélectionnez le joueur qui paiera cette session.
                        </DialogDescription>
                    </DialogHeader>

                    {sessionInfo && (
                        <div className="space-y-4">
                            {/* Session summary */}
                            <div className="bg-muted/30 rounded-xl p-4 space-y-3 border border-border/50">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Table</span>
                                    <span className="font-medium">Table {sessionInfo.tableNumber}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Durée</span>
                                    <span className="font-mono-timer font-medium">{formatDuration(sessionInfo.duration)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Heure de début</span>
                                    <span className="font-medium">{formatTime(sessionInfo.startTime)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Heure de fin</span>
                                    <span className="font-medium">{formatTime(sessionInfo.endTime)}</span>
                                </div>
                                <div className="border-t border-border/50 pt-3 flex justify-between">
                                    <span className="font-medium">Total</span>
                                    <span className="text-xl font-bold text-orange-400">{formatPrice(sessionInfo.price)}</span>
                                </div>
                            </div>

                            {/* Player selection */}
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    Qui paie ?
                                </Label>

                                {/* Search players */}
                                <Input
                                    placeholder="Rechercher un joueur..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="h-10 bg-background/50"
                                />

                                {/* Player list */}
                                <div className="max-h-40 overflow-y-auto space-y-1 border border-border/50 rounded-lg p-2">
                                    {/* Passager option */}
                                    <button
                                        onClick={() => setSelectedPlayer('Passager')}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedPlayer === 'Passager'
                                                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                                                : 'hover:bg-accent/50 text-muted-foreground'
                                            }`}
                                    >
                                        <User className="w-3.5 h-3.5" />
                                        <span className="italic">Passager</span>
                                        {selectedPlayer === 'Passager' && <Check className="w-3.5 h-3.5 ml-auto" />}
                                    </button>

                                    {filteredPlayers.map(player => (
                                        <button
                                            key={player.id}
                                            onClick={() => setSelectedPlayer(player.name)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${selectedPlayer === player.name
                                                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20'
                                                    : 'hover:bg-accent/50'
                                                }`}
                                        >
                                            <User className="w-3.5 h-3.5" />
                                            {player.name}
                                            {selectedPlayer === player.name && <Check className="w-3.5 h-3.5 ml-auto" />}
                                        </button>
                                    ))}

                                    {filteredPlayers.length === 0 && searchQuery && (
                                        <p className="text-xs text-muted-foreground text-center py-2">Aucun joueur trouvé</p>
                                    )}
                                </div>

                                {/* Add new player inline */}
                                {!showAddPlayer ? (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowAddPlayer(true)}
                                        className="w-full h-9 text-xs"
                                    >
                                        <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                                        Ajouter un nouveau joueur
                                    </Button>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Nom du joueur..."
                                            value={newPlayerName}
                                            onChange={(e) => setNewPlayerName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddAndSelect()}
                                            className="h-9 bg-background/50 text-sm"
                                            autoFocus
                                        />
                                        <Button size="sm" onClick={handleAddAndSelect} disabled={!newPlayerName.trim()} className="h-9 bg-orange-600 hover:bg-orange-700">
                                            <Plus className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => { setShowAddPlayer(false); setNewPlayerName('') }} className="h-9">
                                            <X className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                )}

                                {/* Selected display */}
                                {selectedPlayer && (
                                    <div className="text-sm text-orange-400 flex items-center gap-2 bg-orange-500/5 px-3 py-2 rounded-lg border border-orange-500/10">
                                        <Check className="w-4 h-4" />
                                        Sélectionné : <strong>{selectedPlayer}</strong>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowModal(false)}>
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSaveBill}
                            disabled={saving}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {saving ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Enregistrement...
                                </div>
                            ) : (
                                'Enregistrer la facture'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

function ReceiptIcon(props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
            <path d="M14 8H8" /><path d="M16 12H8" /><path d="M13 16H8" />
        </svg>
    )
}
