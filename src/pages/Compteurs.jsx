import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { useAuth, useIsSuperAdmin } from '@/context/AuthContext'
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
import DrinkSelectionDialog from '@/components/DrinkSelectionDialog'
import { formatDuration, formatPrice, formatTime, calculateCounterPrice } from '@/lib/utils'
import { Play, Square, Clock, DollarSign, Timer, Plus, Trash2, Settings, Coffee } from 'lucide-react'

function CounterCard({ counter, settings, onStart, onStop, onEdit, onDelete, onOpenDrinks, isSuperAdmin, currentUser }) {
    const isActive = counter.active
    const multiplier = counter.multiplier || 1
    const price = isActive ? calculateCounterPrice(counter.elapsed, settings, multiplier) : 0
    const [editing, setEditing] = useState(false)
    const [editName, setEditName] = useState(counter.name)
    const inputRef = useRef(null)

    const drinksCount = counter.drinks?.length > 0
        ? counter.drinks.filter(d => !d.__multiplier).reduce((sum, d) => sum + d.quantity, 0)
        : 0

    const isPlayStation = counter.type === 'playstation4' || counter.type === 'playstation5'
    
    // Check if current user can stop this counter
    const currentUserEmail = currentUser?.email || currentUser?.id
    const canStop = isSuperAdmin || !isActive || counter.startedBy === currentUserEmail
    const isStartedByOther = isActive && !isSuperAdmin && counter.startedBy && counter.startedBy !== currentUserEmail

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [editing])

    const handleDoubleClick = () => {
        if (isSuperAdmin && !isActive) {
            setEditName(counter.name)
            setEditing(true)
        }
    }

    const handleSaveName = () => {
        const trimmed = editName.trim()
        if (trimmed && trimmed !== counter.name) {
            onEdit({ ...counter, name: trimmed })
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
                            <Timer className="w-6 h-6" />
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
                                    title={isSuperAdmin && !isActive ? "Double-cliquez pour renommer" : ""}
                                >
                                    {counter.name}
                                </h3>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={isActive ? 'success' : 'default'} className={`text-xs ${isActive ? '' : 'bg-green-500/10 text-green-600 border-green-500/20'
                            }`}>
                            {isActive ? 'ACTIF' : 'LIBRE'}
                        </Badge>
                        {isActive && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 relative text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                onClick={() => onOpenDrinks(counter)}
                                title="Ajouter des boissons"
                            >
                                <Coffee className="w-4 h-4" />
                                {drinksCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                        {drinksCount}
                                    </span>
                                )}
                            </Button>
                        )}
                        {isSuperAdmin && !isActive && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => onDelete(counter)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        )}
                    </div>
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
                        {formatDuration(counter.elapsed)}
                    </div>
                    {isActive && (
                        <div className="flex items-center justify-center gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Début {formatTime(counter.startTime)}
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
                    <>
                        <Button
                            onClick={() => onStop(counter.id)}
                            disabled={isStartedByOther}
                            variant="destructive"
                            className="w-full h-12 text-base font-semibold bg-red-600/80 hover:bg-red-600 border border-red-500/30 shadow-lg shadow-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Square className="w-4 h-4 mr-2" />
                            Terminer la session
                        </Button>
                        {isStartedByOther && (
                            <p className="text-xs text-orange-400 text-center mt-2">
                                Démarré par un autre utilisateur
                            </p>
                        )}
                    </>
                ) : (
                    <>
                        <Button
                            onClick={() => onStart(counter.id, 1)}
                            className="w-full h-12 text-base font-semibold bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Démarrer
                        </Button>
                        {isPlayStation && (
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <Button
                                    onClick={() => onStart(counter.id, 1.5)}
                                    className="h-10 text-sm font-medium text-white hover:opacity-90"
                                    style={{ backgroundColor: '#1d9edb' }}
                                >
                                    3 manettes
                                </Button>
                                <Button
                                    onClick={() => onStart(counter.id, 2)}
                                    className="h-10 text-sm font-medium text-white hover:opacity-90"
                                    style={{ backgroundColor: '#d49fd3' }}
                                >
                                    4 manettes
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default function Compteurs() {
    const { counters, counterSettings, startCounter, stopCounter, createBill, updateBill, addNewCounter, editCounter, removeCounter, updatePricingSettings } = useApp()
    const { user } = useAuth()
    const isSuperAdmin = useIsSuperAdmin()
    const [sessionInfo, setSessionInfo] = useState(null)
    const [createdBillId, setCreatedBillId] = useState(null)
    const [playerName, setPlayerName] = useState('')
    const [addCounterOpen, setAddCounterOpen] = useState(false)
    const [newCounterName, setNewCounterName] = useState('')
    const [newCounterType, setNewCounterType] = useState('billard')
    const [deletingCounter, setDeletingCounter] = useState(null)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [settingsType, setSettingsType] = useState('billard')
    const [settingsValues, setSettingsValues] = useState({})
    const [settingsError, setSettingsError] = useState(null)
    const [drinkDialogCounter, setDrinkDialogCounter] = useState(null)

    const handleStart = (counterId, multiplier = 1) => {
        startCounter(counterId, multiplier)
    }

    const handleStop = async (counterId) => {
        const info = await stopCounter(counterId)
        if (info) {
            if (!isSuperAdmin) {
                // Non-superadmin: Create bill immediately with default name
                const now = new Date()
                const hours = String(now.getHours()).padStart(2, '0')
                const minutes = String(now.getMinutes()).padStart(2, '0')
                const defaultName = `Client ${info.counterName} ${hours}:${minutes}`
                
                const bill = await createBill(info, defaultName)
                if (bill) {
                    setCreatedBillId(bill.id)
                    setSessionInfo(info)
                    setPlayerName('')
                }
            } else {
                // Superadmin: Show dialog to create bill
                setCreatedBillId(null)
                setSessionInfo(info)
                setPlayerName('')
            }
        }
    }

    const handleCreateBill = async () => {
        if (createdBillId) {
            // Bill already created (non-superadmin), just update the name if changed
            if (playerName.trim()) {
                await updateBill(createdBillId, { playerName: playerName.trim() })
            }
        } else {
            // Superadmin: Create new bill
            let finalPlayerName = playerName.trim()
            
            if (!finalPlayerName) {
                const now = new Date()
                const hours = String(now.getHours()).padStart(2, '0')
                const minutes = String(now.getMinutes()).padStart(2, '0')
                finalPlayerName = `Client ${sessionInfo.counterName} ${hours}:${minutes}`
            }
            
            await createBill(sessionInfo, finalPlayerName)
        }
        
        setSessionInfo(null)
        setPlayerName('')
        setCreatedBillId(null)
    }

    const handleAddCounter = async () => {
        if (!newCounterName.trim()) return

        // Get max order index for this type
        const typeCounters = counters.filter(c => c.type === newCounterType)
        const maxOrderIndex = typeCounters.length > 0
            ? Math.max(...typeCounters.map(c => c.orderIndex))
            : 0

        await addNewCounter({
            name: newCounterName.trim(),
            type: newCounterType,
            orderIndex: maxOrderIndex + 1,
        })

        setAddCounterOpen(false)
        setNewCounterName('')
        setNewCounterType('billard')
    }

    const handleEditCounter = async (counter) => {
        if (!counter || !counter.name.trim()) return

        await editCounter(counter.id, {
            name: counter.name.trim(),
        })
    }

    const handleDeleteCounter = async () => {
        if (!deletingCounter) return
        await removeCounter(deletingCounter.id)
        setDeletingCounter(null)
    }

    const handleOpenSettings = (type) => {
        setSettingsType(type)
        setSettingsValues(counterSettings[type] || {})
        setSettingsError(null)
        setSettingsOpen(true)
    }

    const handleSaveSettings = async () => {
        setSettingsError(null)
        const result = await updatePricingSettings(settingsType, settingsValues)
        if (result?.success) {
            setSettingsOpen(false)
        } else {
            setSettingsError(result?.error || 'Erreur lors de la sauvegarde des paramètres')
        }
    }

    // Group counters by type
    const billardCounters = counters.filter(c => c.type === 'billard')
    const playstation4Counters = counters.filter(c => c.type === 'playstation4')
    const playstation5Counters = counters.filter(c => c.type === 'playstation5')

    return (
        <div className="space-y-8">
            {/* Billard Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">Billard</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {billardCounters.length} compteur{billardCounters.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    {isSuperAdmin && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenSettings('billard')}
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Tarifs
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                    setNewCounterType('billard')
                                    setAddCounterOpen(true)
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter
                            </Button>
                        </div>
                    )}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {billardCounters.map(counter => (
                        <CounterCard
                            key={counter.id}
                            counter={counter}
                            settings={counterSettings.billard || {}}
                            onStart={handleStart}
                            onStop={handleStop}
                            onEdit={handleEditCounter}
                            onDelete={setDeletingCounter}
                            onOpenDrinks={setDrinkDialogCounter}
                            isSuperAdmin={isSuperAdmin}
                            currentUser={user}
                        />
                    ))}
                </div>
            </div>

            {/* PlayStation 5 Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">PlayStation 5</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {playstation5Counters.length} compteur{playstation5Counters.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    {isSuperAdmin && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenSettings('playstation5')}
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Tarifs
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                    setNewCounterType('playstation5')
                                    setAddCounterOpen(true)
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter
                            </Button>
                        </div>
                    )}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {playstation5Counters.map(counter => (
                        <CounterCard
                            key={counter.id}
                            counter={counter}
                            settings={counterSettings.playstation5 || {}}
                            onStart={handleStart}
                            onStop={handleStop}
                            onEdit={handleEditCounter}
                            onDelete={setDeletingCounter}
                            onOpenDrinks={setDrinkDialogCounter}
                            isSuperAdmin={isSuperAdmin}
                            currentUser={user}
                        />
                    ))}
                </div>
            </div>

            {/* PlayStation 4 Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold">PlayStation 4</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {playstation4Counters.length} compteur{playstation4Counters.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    {isSuperAdmin && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenSettings('playstation4')}
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Tarifs
                            </Button>
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                    setNewCounterType('playstation4')
                                    setAddCounterOpen(true)
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter
                            </Button>
                        </div>
                    )}
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {playstation4Counters.map(counter => (
                        <CounterCard
                            key={counter.id}
                            counter={counter}
                            settings={counterSettings.playstation4 || {}}
                            onStart={handleStart}
                            onStop={handleStop}
                            onEdit={handleEditCounter}
                            onDelete={setDeletingCounter}
                            onOpenDrinks={setDrinkDialogCounter}
                            isSuperAdmin={isSuperAdmin}
                            currentUser={user}
                        />
                    ))}
                </div>
            </div>

            {/* Session Complete Dialog */}
            <Dialog open={!!sessionInfo} onOpenChange={(open) => {
                if (!open) {
                    setSessionInfo(null)
                    setCreatedBillId(null)
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{createdBillId ? 'Facture créée' : 'Session terminée'}</DialogTitle>
                        <DialogDescription>
                            {createdBillId ? 'Modifier le nom du client (optionnel)' : 'Créer une facture pour cette session'}
                        </DialogDescription>
                    </DialogHeader>
                    {sessionInfo && (
                        <div className="space-y-4">
                            {createdBillId && (
                                <div className="flex items-center gap-2 text-sm text-white bg-green-800 px-3 py-2 rounded-md">
                                    <span>La facture a été créée automatiquement</span>
                                </div>
                            )}
                            <div className="rounded-lg bg-muted/30 p-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Compteur:</span>
                                    <span className="font-medium">{sessionInfo.counterName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Durée:</span>
                                    <span className="font-medium font-mono-timer">{formatDuration(sessionInfo.duration)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Montant:</span>
                                    <span className="font-bold text-orange-400">{formatPrice(sessionInfo.price)}</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="player-name">Nom du joueur (optionnel)</Label>
                                <Input
                                    id="player-name"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    placeholder="Ex: Ahmed"
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreateBill()}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {playerName.trim() ? '' : `Par défaut: Client ${sessionInfo.counterName} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`}
                                </p>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setSessionInfo(null)
                                setCreatedBillId(null)
                            }}
                        >
                            {createdBillId ? 'Fermer' : 'Annuler'}
                        </Button>
                        <Button onClick={handleCreateBill}>
                            {createdBillId ? 'Mettre à jour' : 'Créer la facture'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Counter Dialog */}
            <Dialog open={addCounterOpen} onOpenChange={setAddCounterOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ajouter un compteur</DialogTitle>
                        <DialogDescription>
                            Créer un nouveau compteur {
                                newCounterType === 'billard' ? 'de billard' :
                                    newCounterType === 'playstation5' ? 'PlayStation 5' :
                                        newCounterType === 'playstation4' ? 'PlayStation 4' : 'PlayStation'
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="counter-name">Nom du compteur</Label>
                            <Input
                                id="counter-name"
                                value={newCounterName}
                                onChange={(e) => setNewCounterName(e.target.value)}
                                placeholder={`Ex: ${newCounterType === 'billard' ? 'Table 5' :
                                    newCounterType === 'playstation5' ? 'PS5 - 1' :
                                        newCounterType === 'playstation4' ? 'PS4 - 1' : 'Compteur 1'
                                    }`}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddCounter()}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddCounterOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleAddCounter}>
                            Ajouter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deletingCounter} onOpenChange={(open) => !open && setDeletingCounter(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer le compteur</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer "{deletingCounter?.name}" ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingCounter(null)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteCounter}>
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Settings Dialog */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Tarification {
                                settingsType === 'billard' ? 'Billard' :
                                    settingsType === 'playstation5' ? 'PlayStation 5' :
                                        settingsType === 'playstation4' ? 'PlayStation 4' : 'PlayStation'
                            }
                        </DialogTitle>
                        <DialogDescription>
                            Configurer le modèle de tarification pour ce type de compteur
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="starting-value">Prix de départ (TND)</Label>
                            <Input
                                id="starting-value"
                                type="number"
                                step="0.5"
                                min="0"
                                value={settingsValues.startingValue || 0}
                                onChange={(e) => setSettingsValues({ ...settingsValues, startingValue: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="increment-amount">Montant d'incrément (TND)</Label>
                            <Input
                                id="increment-amount"
                                type="number"
                                step="0.5"
                                min="0"
                                value={settingsValues.incrementAmount || 0}
                                onChange={(e) => setSettingsValues({ ...settingsValues, incrementAmount: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="increment-interval">Intervalle d'incrément (secondes)</Label>
                            <Input
                                id="increment-interval"
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={settingsValues.incrementInterval || 900}
                                onChange={(e) => setSettingsValues({ ...settingsValues, incrementInterval: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grace-period">Période de grâce (secondes)</Label>
                            <Input
                                id="grace-period"
                                type="number"
                                step="0.1"
                                min="0"
                                value={settingsValues.gracePeriod || 0}
                                onChange={(e) => setSettingsValues({ ...settingsValues, gracePeriod: parseFloat(e.target.value) })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Temps gratuit avant le premier incrément
                            </p>
                        </div>
                    </div>
                    {settingsError && (
                        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
                            <p className="font-semibold">Erreur</p>
                            <p>{settingsError}</p>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={handleSaveSettings}>
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Drink Selection Dialog */}
            <DrinkSelectionDialog
                open={!!drinkDialogCounter}
                onOpenChange={(open) => !open && setDrinkDialogCounter(null)}
                counter={drinkDialogCounter}
            />
        </div>
    )
}
