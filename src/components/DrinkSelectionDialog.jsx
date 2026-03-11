import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { formatPrice } from '@/lib/utils'
import { Plus, Minus, Coffee, X, ShoppingCart, Wine, Droplet, Soup, Apple, Zap, MoreHorizontal } from 'lucide-react'

const CATEGORIES = [
    { value: 'all', label: 'Tout', icon: MoreHorizontal },
    { value: 'soft_drinks', label: 'Soft', icon: Wine },
    { value: 'water', label: 'Eau', icon: Droplet },
    { value: 'hot_drinks', label: 'Chaud', icon: Soup },
    { value: 'juices', label: 'Jus', icon: Apple },
    { value: 'energy_drinks', label: 'Energy', icon: Zap },
]

export default function DrinkSelectionDialog({ open, onOpenChange, counter }) {
    const { drinks, addDrinkToCounter } = useApp()
    const [selectedDrinks, setSelectedDrinks] = useState({})
    const [activeCategory, setActiveCategory] = useState('all')

    const handleAddDrink = (drink) => {
        setSelectedDrinks(prev => ({
            ...prev,
            [drink.id]: (prev[drink.id] || 0) + 1
        }))
    }

    const handleRemoveDrink = (drinkId) => {
        setSelectedDrinks(prev => {
            const newQty = (prev[drinkId] || 0) - 1
            if (newQty <= 0) {
                const { [drinkId]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [drinkId]: newQty }
        })
    }

    const handleConfirm = () => {
        Object.entries(selectedDrinks).forEach(([drinkId, quantity]) => {
            if (quantity > 0) {
                const drink = drinks.find(d => d.id === drinkId)
                if (drink) {
                    addDrinkToCounter(counter.id, drink, quantity)
                }
            }
        })
        setSelectedDrinks({})
        onOpenChange(false)
    }

    const handleCancel = () => {
        setSelectedDrinks({})
        onOpenChange(false)
    }

    const totalItems = Object.values(selectedDrinks).reduce((sum, qty) => sum + qty, 0)
    const totalPrice = Object.entries(selectedDrinks).reduce((sum, [drinkId, qty]) => {
        const drink = drinks.find(d => d.id === drinkId)
        return sum + (drink ? drink.price * qty : 0)
    }, 0)

    // Current drinks on the counter
    const currentDrinks = counter?.drinks || []
    const currentDrinksTotal = currentDrinks.reduce((sum, d) => sum + (d.price * d.quantity), 0)

    // Filter drinks by category
    const filteredDrinks = activeCategory === 'all'
        ? drinks
        : drinks.filter(d => d.category === activeCategory)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[85vh] p-0 gap-0 flex flex-col">
                {/* Fixed Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Coffee className="w-5 h-5 text-orange-500" />
                        <span>Boissons - {counter?.name}</span>
                    </DialogTitle>
                </DialogHeader>

                {/* Current drinks banner - only if has drinks */}
                {currentDrinks.length > 0 && (
                    <div className="px-6 pt-4 shrink-0">
                        <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4 text-orange-600" />
                                    <span className="font-semibold text-sm">
                                        {currentDrinks.reduce((sum, d) => sum + d.quantity, 0)} boisson{currentDrinks.reduce((sum, d) => sum + d.quantity, 0) > 1 ? 's' : ''} sur ce compteur
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-orange-600">
                                    {formatPrice(currentDrinksTotal)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Category Tabs */}
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 pt-4 shrink-0">
                        <TabsList className="w-full grid grid-cols-6 h-auto">
                            {CATEGORIES.map(cat => {
                                const Icon = cat.icon
                                const categoryCount = cat.value === 'all'
                                    ? drinks.length
                                    : drinks.filter(d => d.category === cat.value).length
                                return (
                                    <TabsTrigger
                                        key={cat.value}
                                        value={cat.value}
                                        className="flex flex-col items-center gap-1 py-2"
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="text-xs">{cat.label}</span>
                                        <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                            {categoryCount}
                                        </Badge>
                                    </TabsTrigger>
                                )
                            })}
                        </TabsList>
                    </div>

                    {/* Scrollable Content */}
                    <TabsContent
                        value={activeCategory}
                        className="flex-1 mt-0 overflow-y-auto px-6 py-4"
                        style={{ minHeight: 0 }}
                    >
                        {filteredDrinks.length > 0 ? (
                            <div className="grid gap-3 pb-2">
                                {filteredDrinks.map(drink => {
                                    const qty = selectedDrinks[drink.id] || 0
                                    return (
                                        <div
                                            key={drink.id}
                                            className={`
                                                flex items-center justify-between p-4 rounded-lg border transition-all
                                                ${qty > 0
                                                    ? 'border-orange-500 bg-orange-500/10 shadow-sm'
                                                    : 'border-border bg-card hover:bg-muted/50 hover:border-orange-300'
                                                }
                                            `}
                                        >
                                            <div className="flex-1 min-w-0 pr-4">
                                                <p className="font-semibold text-base truncate">{drink.name}</p>
                                                <p className="text-lg font-bold text-orange-500 mt-0.5">
                                                    {formatPrice(drink.price)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {qty > 0 ? (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-9 w-9 p-0"
                                                            onClick={() => handleRemoveDrink(drink.id)}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </Button>
                                                        <div className="w-12 text-center">
                                                            <Badge className="bg-orange-500 hover:bg-orange-600 text-base px-3 py-1">
                                                                {qty}
                                                            </Badge>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-9 w-9 p-0"
                                                            onClick={() => handleAddDrink(drink)}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        className="bg-orange-500 hover:bg-orange-600 h-9 px-4"
                                                        onClick={() => handleAddDrink(drink)}
                                                    >
                                                        <Plus className="w-4 h-4 mr-1" />
                                                        Ajouter
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                                <Coffee className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg">Aucune boisson disponible</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Fixed Footer */}
                <div className="border-t bg-background shrink-0">
                    {/* Selection Summary */}
                    {totalItems > 0 && (
                        <div className="px-6 pt-4">
                            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            Sélection: {totalItems} article{totalItems > 1 ? 's' : ''}
                                        </p>
                                        <p className="text-2xl font-bold text-orange-600 mt-1">
                                            {formatPrice(totalPrice)}
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setSelectedDrinks({})}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Vider
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="px-6 py-4 flex justify-end gap-3">
                        <Button variant="outline" onClick={handleCancel} className="px-6">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="bg-orange-500 hover:bg-orange-600 px-6"
                            disabled={totalItems === 0}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Ajouter au compteur
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
