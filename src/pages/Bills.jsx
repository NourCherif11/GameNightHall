import React, { useState, useMemo, useEffect } from 'react'
import { useApp } from '@/context/AppContext'
import { useAuth } from '@/context/AuthContext'
import { getBillItems } from '@/lib/storage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import PrintReceipt from '@/components/PrintReceipt'
import { formatDuration, formatPrice, formatDate, formatTime, formatDateTime } from '@/lib/utils'
import {
    Search,
    CheckCircle2,
    Clock,
    User,
    DollarSign,
    Trash2,
    AlertCircle,
    Filter,
    CreditCard,
    Grid3X3,
    ChevronDown,
    ChevronUp,
    Receipt,
    Printer,
} from 'lucide-react'

function BillCard({ bill, onPay, onDelete, user }) {
    const [showConfirmPay, setShowConfirmPay] = useState(false)
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [billItems, setBillItems] = useState([])
    const [loadingItems, setLoadingItems] = useState(false)
    const [showPrint, setShowPrint] = useState(false)

    const loadBillItems = () => {
        if (bill.has_items && billItems.length === 0) {
            setLoadingItems(true)
            getBillItems(bill.id)
                .then(items => setBillItems(items || []))
                .catch(err => console.error('Error loading bill items:', err))
                .finally(() => setLoadingItems(false))
        }
    }

    useEffect(() => {
        if (bill.has_items && expanded && billItems.length === 0) {
            loadBillItems()
        }
    }, [bill.has_items, bill.id, expanded, billItems.length])

    const handlePrint = () => {
        if (bill.has_items && billItems.length === 0) {
            // Load items first if not loaded
            setLoadingItems(true)
            getBillItems(bill.id)
                .then(items => {
                    setBillItems(items || [])
                    setShowPrint(true)
                })
                .catch(err => console.error('Error loading bill items:', err))
                .finally(() => setLoadingItems(false))
        } else {
            setShowPrint(true)
        }
    }

    return (
        <>
            <Card className={`
        card-hover border-border/50 overflow-hidden
        ${!bill.paid ? 'bg-gradient-to-br from-card to-amber-950/5 border-l-2 border-l-amber-500/50' : 'bg-card'}
      `}>
                <CardContent className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Left: Table & Player info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center shrink-0
                ${bill.paid
                                    ? 'bg-orange-500/10 border border-orange-500/20'
                                    : 'bg-amber-500/10 border border-amber-500/20'
                                }
              `}>
                                <span className="text-lg font-bold font-mono-timer">T{bill.tableNumber}</span>
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    <span className="font-semibold truncate">{bill.playerName}</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDuration(bill.duration)}
                                    </span>
                                    <span>{formatDate(bill.createdAt)}</span>
                                    <span>{formatTime(bill.startTime)} – {formatTime(bill.endTime)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Price & Actions */}
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="text-right">
                                <div className="text-lg font-bold text-orange-400 font-mono-timer">
                                    {formatPrice(bill.price)}
                                </div>
                                <Badge variant={bill.paid ? 'success' : 'warning'} className="text-[10px]">
                                    {bill.paid ? 'PAYÉE' : 'IMPAYÉE'}
                                </Badge>
                            </div>

                            {!bill.paid && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => setShowConfirmPay(true)}
                                        className="bg-orange-600 hover:bg-orange-700 h-9"
                                    >
                                        <CreditCard className="w-3.5 h-3.5 mr-1" />
                                        Payer
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handlePrint}
                                        style={{ backgroundColor: '#fe8541' }}
                                        className="hover:opacity-90 h-9 w-9 p-0"
                                        title="Imprimer"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                    </Button>
                                    {user?.role === 'superadmin' && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setShowConfirmDelete(true)}
                                            className="h-9 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    )}
                                </div>
                            )}
                            {bill.paid && (
                                <Button
                                    size="sm"
                                    onClick={handlePrint}
                                    style={{ backgroundColor: '#fe8541' }}
                                    className="hover:opacity-90 h-9 w-9 p-0"
                                    title="Imprimer"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Itemized breakdown */}
                    {bill.has_items && (
                        <div className="mt-4 pt-4 border-t border-border/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-between h-auto py-2 text-muted-foreground hover:text-foreground"
                                onClick={() => setExpanded(!expanded)}
                            >
                                <span className="flex items-center gap-2">
                                    <Receipt className="w-4 h-4" />
                                    <span className="text-sm font-medium">Détails de la facture</span>
                                </span>
                                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>

                            {expanded && (
                                <div className="mt-3 space-y-2 bg-muted/20 rounded-lg p-3">
                                    {loadingItems ? (
                                        <p className="text-sm text-muted-foreground text-center py-2">Chargement...</p>
                                    ) : billItems.length > 0 ? (
                                        <>
                                            {bill.cashierName && (
                                                <div className="flex justify-between text-sm pb-2 border-b border-border/50 mb-2">
                                                    <span className="text-muted-foreground">Caissier:</span>
                                                    <span className="font-medium">{bill.cashierName}</span>
                                                </div>
                                            )}
                                            {billItems.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        {item.quantity > 1 && `${item.quantity}x `}
                                                        {item.itemName}
                                                    </span>
                                                    <span className="font-medium font-mono-timer">
                                                        {formatPrice(item.totalPrice)}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="border-t border-border/50 pt-2 mt-2">
                                                <div className="flex justify-between font-semibold">
                                                    <span>Total:</span>
                                                    <span className="text-orange-400 font-mono-timer">
                                                        {formatPrice(bill.price)}
                                                    </span>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-2">Aucun détail disponible</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Confirm Pay Dialog */}
            <Dialog open={showConfirmPay} onOpenChange={setShowConfirmPay}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-orange-400" />
                            Confirmer le paiement
                        </DialogTitle>
                        <DialogDescription>
                            Marquer cette facture comme payée pour <strong>{bill.playerName}</strong> ?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Table {bill.tableNumber}</span>
                            <span className="font-mono-timer">{formatDuration(bill.duration)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Montant</span>
                            <span className="text-lg font-bold text-orange-400">{formatPrice(bill.price)}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmPay(false)}>Annuler</Button>
                        <Button
                            onClick={() => { onPay(bill.id); setShowConfirmPay(false) }}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Confirmer le paiement
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Delete Dialog */}
            <Dialog open={showConfirmDelete} onOpenChange={setShowConfirmDelete}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertCircle className="w-5 h-5" />
                            Supprimer la facture
                        </DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowConfirmDelete(false)}>Annuler</Button>
                        <Button
                            variant="destructive"
                            onClick={() => { onDelete(bill.id); setShowConfirmDelete(false) }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Print Receipt Dialog */}
            {showPrint && (
                <Dialog open={showPrint} onOpenChange={setShowPrint}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Aperçu de l'impression</DialogTitle>
                            <DialogDescription>
                                Ticket prêt pour imprimante thermique
                            </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto border rounded-lg p-4" style={{ backgroundColor: '#f9fafb' }}>
                            <PrintReceipt
                                bill={bill}
                                billItems={billItems}
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowPrint(false)}>
                                Fermer
                            </Button>
                            <Button
                                onClick={() => window.print()}
                                style={{ backgroundColor: '#fe8541' }}
                                className="hover:opacity-90"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Imprimer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}

export default function Bills() {
    const { bills, payBill, removeBill } = useApp()
    const { user } = useAuth()
    const [search, setSearch] = useState('')
    const [tableFilter, setTableFilter] = useState('all')

    const unpaidBills = useMemo(() => bills.filter(b => !b.paid), [bills])
    const paidBills = useMemo(() => bills.filter(b => b.paid), [bills])

    const filterBills = (billList) => {
        return billList.filter(b => {
            const matchSearch = !search || b.playerName.toLowerCase().includes(search.toLowerCase())
            const matchTable = tableFilter === 'all' || b.tableNumber === parseInt(tableFilter)
            return matchSearch && matchTable
        })
    }

    const totalUnpaid = unpaidBills.reduce((sum, b) => sum + b.price, 0)
    const totalPaid = paidBills.reduce((sum, b) => sum + b.price, 0)

    return (
        <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Factures impayées</p>
                            <p className="text-xl font-bold text-amber-400">{unpaidBills.length}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Montant impayé total</p>
                            <p className="text-xl font-bold text-red-400">{formatPrice(totalUnpaid)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50 bg-card/50">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">Total encaissé</p>
                            <p className="text-xl font-bold text-orange-400">{formatPrice(totalPaid)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom de joueur..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 bg-card/50 border-border/50 h-10"
                    />
                </div>
                <div className="flex gap-2">
                    {['all', '1', '2', '3', '4'].map(t => (
                        <Button
                            key={t}
                            variant={tableFilter === t ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setTableFilter(t)}
                            className={`h-10 ${tableFilter === t ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                        >
                            {t === 'all' ? (
                                <><Filter className="w-3.5 h-3.5 mr-1" /> Tout</>
                            ) : (
                                <><Grid3X3 className="w-3.5 h-3.5 mr-1" /> T{t}</>
                            )}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Bills tabs */}
            <Tabs defaultValue="unpaid" className="space-y-4">
                <TabsList className="bg-card border border-border/50 p-1">
                    <TabsTrigger value="unpaid" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-400">
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Impayées ({filterBills(unpaidBills).length})
                    </TabsTrigger>
                    <TabsTrigger value="paid" className="data-[state=active]:bg-orange-500/10 data-[state=active]:text-orange-400">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Payées ({filterBills(paidBills).length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="unpaid">
                    <div className="space-y-3">
                        {filterBills(unpaidBills).length === 0 ? (
                            <Card className="border-border/50 bg-card/50">
                                <CardContent className="p-12 text-center">
                                    <ReceiptIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-1">Aucune facture impayée</h3>
                                    <p className="text-sm text-muted-foreground/60">Toutes les factures ont été réglées !</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filterBills(unpaidBills).map(bill => (
                                <BillCard
                                    key={bill.id}
                                    bill={bill}
                                    onPay={payBill}
                                    onDelete={removeBill}
                                    user={user}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="paid">
                    <div className="space-y-3">
                        {filterBills(paidBills).length === 0 ? (
                            <Card className="border-border/50 bg-card/50">
                                <CardContent className="p-12 text-center">
                                    <ReceiptIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-1">Aucune facture payée</h3>
                                    <p className="text-sm text-muted-foreground/60">Les factures payées apparaîtront ici.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            filterBills(paidBills).slice(0, 50).map(bill => (
                                <BillCard
                                    key={bill.id}
                                    bill={bill}
                                    onPay={payBill}
                                    onDelete={removeBill}
                                    user={user}
                                />
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
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
