import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { formatDate, formatPrice } from '@/lib/utils'
import {
    Users, UserPlus, Search, Trash2, Edit3,
    Phone, StickyNote, User, AlertCircle,
    DollarSign, Clock, Hash,
} from 'lucide-react'

function PlayerCard({ player, stats, onEdit, onDelete }) {
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)

    return (
        <>
            <Card className="border-border/50 bg-card card-hover overflow-hidden">
                <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                            <span className="text-lg font-bold text-orange-400">
                                {player.name.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-base truncate">{player.name}</h3>
                                {player.phone && (
                                    <Badge variant="secondary" className="text-[10px] shrink-0">
                                        <Phone className="w-2.5 h-2.5 mr-1" />
                                        {player.phone}
                                    </Badge>
                                )}
                            </div>

                            {player.notes && (
                                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                                    <StickyNote className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{player.notes}</span>
                                </p>
                            )}

                            {/* Stats */}
                            <div className="flex flex-wrap gap-3 mt-2">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Hash className="w-3 h-3" />
                                    <span>{stats.sessions} sessions</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <DollarSign className="w-3 h-3 text-orange-400" />
                                    <span className="text-orange-400 font-medium">{formatPrice(stats.totalSpent)}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>Ajouté le {formatDate(player.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 shrink-0">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onEdit(player)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowConfirmDelete(true)}
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirm Delete Dialog */}
            <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-5 h-5" />
                            Supprimer le joueur
                        </DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer <strong>{player.name}</strong> ? Les factures existantes ne seront pas affectées.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>Annuler</Button>
                        <Button
                            variant="destructive"
                            onClick={() => { onDelete(player.id); setShowConfirmDelete(false) }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default function Players() {
    const { players, bills, addNewPlayer, editPlayer, removePlayer } = useApp()
    const [search, setSearch] = useState('')
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [editingPlayer, setEditingPlayer] = useState(null)
    const [formName, setFormName] = useState('')
    const [formPhone, setFormPhone] = useState('')
    const [formNotes, setFormNotes] = useState('')

    // Calculate stats per player
    const getPlayerStats = (playerName) => {
        const playerBills = bills.filter(b => b.playerName.toLowerCase() === playerName.toLowerCase())
        return {
            sessions: playerBills.length,
            totalSpent: playerBills.reduce((sum, b) => sum + b.price, 0),
            unpaid: playerBills.filter(b => !b.paid).reduce((sum, b) => sum + b.price, 0),
        }
    }

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleAdd = () => {
        if (!formName.trim()) return
        addNewPlayer({ name: formName.trim(), phone: formPhone.trim(), notes: formNotes.trim() })
        setFormName('')
        setFormPhone('')
        setFormNotes('')
        setShowAddDialog(false)
    }

    const handleEdit = (player) => {
        setEditingPlayer(player)
        setFormName(player.name)
        setFormPhone(player.phone || '')
        setFormNotes(player.notes || '')
        setShowEditDialog(true)
    }

    const handleSaveEdit = () => {
        if (!formName.trim() || !editingPlayer) return
        editPlayer(editingPlayer.id, { name: formName.trim(), phone: formPhone.trim(), notes: formNotes.trim() })
        setShowEditDialog(false)
        setEditingPlayer(null)
    }

    const totalPlayers = players.length
    const totalRevenue = players.reduce((sum, p) => sum + getPlayerStats(p.name).totalSpent, 0)

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total joueurs</p>
                            <p className="text-xl font-bold">{totalPlayers}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Revenu total joueurs</p>
                            <p className="text-xl font-bold text-orange-400">{formatPrice(totalRevenue)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <Button
                                onClick={() => { setFormName(''); setFormPhone(''); setFormNotes(''); setShowAddDialog(true) }}
                                className="bg-orange-600 hover:bg-orange-700 h-9"
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                Ajouter un joueur
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher un joueur..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-card/50 border-border/50 h-10"
                />
            </div>

            {/* Players list */}
            <div className="space-y-3">
                {filteredPlayers.length === 0 ? (
                    <Card className="border-border/50 bg-card/50">
                        <CardContent className="p-12 text-center">
                            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-1">
                                {search ? 'Aucun joueur trouvé' : 'Aucun joueur enregistré'}
                            </h3>
                            <p className="text-sm text-muted-foreground/60">
                                {search ? 'Essayez un autre terme de recherche.' : 'Ajoutez votre premier joueur pour commencer.'}
                            </p>
                            {!search && (
                                <Button
                                    onClick={() => { setFormName(''); setFormPhone(''); setFormNotes(''); setShowAddDialog(true) }}
                                    className="mt-4 bg-orange-600 hover:bg-orange-700"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Ajouter un joueur
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    filteredPlayers.map((player, i) => (
                        <div key={player.id} className={`animate-fade-in-up animate-delay-${Math.min((i + 1) * 100, 400)}`}>
                            <PlayerCard
                                player={player}
                                stats={getPlayerStats(player.name)}
                                onEdit={handleEdit}
                                onDelete={removePlayer}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Add Player Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-orange-400" />
                            Ajouter un joueur
                        </DialogTitle>
                        <DialogDescription>
                            Ajoutez un nouveau joueur au club.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="addName" className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                Nom *
                            </Label>
                            <Input
                                id="addName"
                                placeholder="Nom du joueur"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                                className="h-11 bg-background/50"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="addPhone" className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                Téléphone
                            </Label>
                            <Input
                                id="addPhone"
                                placeholder="Numéro de téléphone (optionnel)"
                                value={formPhone}
                                onChange={(e) => setFormPhone(e.target.value)}
                                className="h-11 bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="addNotes" className="flex items-center gap-2">
                                <StickyNote className="w-4 h-4 text-muted-foreground" />
                                Notes
                            </Label>
                            <Input
                                id="addNotes"
                                placeholder="Notes (optionnel)"
                                value={formNotes}
                                onChange={(e) => setFormNotes(e.target.value)}
                                className="h-11 bg-background/50"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>Annuler</Button>
                        <Button
                            onClick={handleAdd}
                            disabled={!formName.trim()}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Ajouter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Player Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit3 className="w-5 h-5 text-orange-400" />
                            Modifier le joueur
                        </DialogTitle>
                        <DialogDescription>
                            Modifier les informations du joueur.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="editName" className="flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" />
                                Nom *
                            </Label>
                            <Input
                                id="editName"
                                placeholder="Nom du joueur"
                                value={formName}
                                onChange={(e) => setFormName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                className="h-11 bg-background/50"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editPhone" className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                Téléphone
                            </Label>
                            <Input
                                id="editPhone"
                                placeholder="Numéro de téléphone (optionnel)"
                                value={formPhone}
                                onChange={(e) => setFormPhone(e.target.value)}
                                className="h-11 bg-background/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="editNotes" className="flex items-center gap-2">
                                <StickyNote className="w-4 h-4 text-muted-foreground" />
                                Notes
                            </Label>
                            <Input
                                id="editNotes"
                                placeholder="Notes (optionnel)"
                                value={formNotes}
                                onChange={(e) => setFormNotes(e.target.value)}
                                className="h-11 bg-background/50"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>Annuler</Button>
                        <Button
                            onClick={handleSaveEdit}
                            disabled={!formName.trim()}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
