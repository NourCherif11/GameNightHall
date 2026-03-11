import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import {
  getBills, addBill, updateBill as storageUpdateBill, markBillAsPaid, deleteBill,
  getSettings, updateSettings, seedDemoData,
  getPlayers, addPlayer as storageAddPlayer, updatePlayer as storageUpdatePlayer, deletePlayer as storageDeletePlayer,
  getCounters, addCounter as storageAddCounter, updateCounter as storageUpdateCounter, deleteCounter as storageDeleteCounter,
  updateCounterState as storageUpdateCounterState,
  getCounterSettings, updateCounterSettings as storageUpdateCounterSettings,
  getDrinks, addDrink as storageAddDrink, updateDrink as storageUpdateDrink, deleteDrink as storageDeleteDrink,
  getBillItems, addBillItems,
} from '@/lib/storage'
import { generateId, calculatePrice, calculateCounterPrice, formatPrice } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const AppContext = createContext(null)

function createInitialCounters(counters) {
  // Counters now come from DB with their state already set
  return counters.map(counter => {
    if (counter.active && counter.startTime) {
      // Calculate elapsed time from start_time stored in DB
      const startTimestamp = new Date(counter.startTime).getTime()
      const elapsed = Math.floor((Date.now() - startTimestamp) / 1000)

      // Extract multiplier from drinks metadata
      const multiplierMeta = counter.drinks?.find(d => d.__multiplier)
      const multiplier = multiplierMeta?.__multiplier || 1

      console.log('✅ [APPCONTEXT] Restoring counter from DB:', counter.name, {
        startTime: counter.startTime,
        elapsed: `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`,
        multiplier,
        startedBy: counter.startedBy,
      })

      return {
        ...counter,
        elapsed,
        multiplier,
      }
    }
    return {
      ...counter,
      elapsed: 0,
      multiplier: 1,
    }
  })
}

export function AppProvider({ children }) {
  const { user } = useAuth()
  const [counters, setCounters] = useState([])
  const [counterSettings, setCounterSettings] = useState({})
  const [drinks, setDrinks] = useState([])
  const [bills, setBills] = useState([])
  const [settings, setSettings] = useState({
    currency: 'TND',
    clubName: 'GamePark',
  })
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const intervalRefs = useRef({})

  // Initial data load
  useEffect(() => {
    async function loadData() {
      try {
        console.log('🔄 [APPCONTEXT] Loading initial data...')

        // Load all data in parallel
        const [billsData, settingsData, playersData, countersData, counterSettingsData, drinksData] = await Promise.all([
          getBills(),
          getSettings(),
          getPlayers(),
          getCounters(),
          getCounterSettings(),
          getDrinks(),
        ])

        setBills(billsData)
        setSettings(settingsData)
        setPlayers(playersData)
        setCounterSettings(counterSettingsData)
        setDrinks(drinksData)

        // Initialize counters with saved states
        const initializedCounters = createInitialCounters(countersData)
        setCounters(initializedCounters)

        setLoading(false)
      } catch (error) {
        console.error('Error loading data:', error)
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Refresh bills from storage
  const refreshBills = useCallback(async () => {
    const data = await getBills()
    setBills(data)
  }, [])

  // Refresh players from storage
  const refreshPlayers = useCallback(async () => {
    const data = await getPlayers()
    setPlayers(data)
  }, [])

  // Refresh counters from storage
  const refreshCounters = useCallback(async () => {
    const data = await getCounters()
    // Initialize elapsed time for active counters
    const initialized = createInitialCounters(data)
    setCounters(initialized)
  }, [])

  // Refresh counter settings from storage
  const refreshCounterSettings = useCallback(async () => {
    const data = await getCounterSettings()
    setCounterSettings(data)
  }, [])

  // Refresh drinks from storage
  const refreshDrinks = useCallback(async () => {
    const data = await getDrinks()
    setDrinks(data)
  }, [])

  // Timer logic
  useEffect(() => {
    counters.forEach(counter => {
      if (counter.active && !intervalRefs.current[counter.id]) {
        intervalRefs.current[counter.id] = setInterval(() => {
          setCounters(prev => prev.map(c =>
            c.id === counter.id ? { ...c, elapsed: c.elapsed + 1 } : c
          ))
        }, 1000)
      } else if (!counter.active && intervalRefs.current[counter.id]) {
        clearInterval(intervalRefs.current[counter.id])
        delete intervalRefs.current[counter.id]
      }
    })

    return () => { }
  }, [counters.map(c => c.active).join(',')])

  const startCounter = useCallback(async (counterId, multiplier = 1) => {
    const now = new Date().toISOString()
    const userEmail = user?.email || user?.id || 'unknown'
    
    // Update state immediately for UI responsiveness
    setCounters(prev => prev.map(c =>
      c.id === counterId
        ? { ...c, active: true, startTime: now, elapsed: 0, drinks: [], multiplier, startedBy: userEmail }
        : c
    ))
    // Persist to database (multiplier stored in drinks as metadata for now)
    await storageUpdateCounterState(counterId, {
      active: true,
      startTime: now,
      drinks: [{ __multiplier: multiplier }],
      startedBy: userEmail,
    })
  }, [user])

  const stopCounter = useCallback(async (counterId) => {
    const counter = counters.find(c => c.id === counterId)
    if (!counter) return null

    if (intervalRefs.current[counterId]) {
      clearInterval(intervalRefs.current[counterId])
      delete intervalRefs.current[counterId]
    }

    // Calculate price based on counter type settings
    const settings = counterSettings[counter.type] || {}
    const multiplier = counter.multiplier || 1
    const counterPrice = calculateCounterPrice(counter.elapsed, settings, multiplier)

    // Calculate drinks total (exclude multiplier metadata)
    const realDrinks = (counter.drinks || []).filter(d => !d.__multiplier)
    const drinksTotal = realDrinks.reduce((sum, drink) => sum + (drink.price * drink.quantity), 0)
    const totalPrice = counterPrice + drinksTotal

    const sessionInfo = {
      counterId: counter.id,
      counterType: counter.type,
      counterName: counter.name,
      tableNumber: null, // For backward compatibility
      startTime: counter.startTime,
      endTime: new Date().toISOString(),
      duration: counter.elapsed,
      price: totalPrice,
      counterPrice, // Price for counter time only
      drinksPrice: drinksTotal,
      drinks: realDrinks,
      settings, // Include settings for pricing formula display
      multiplier, // Include multiplier for display
    }

    // Update state immediately
    setCounters(prev => prev.map(c =>
      c.id === counterId
        ? { ...c, active: false, startTime: null, elapsed: 0, drinks: [], multiplier: 1, startedBy: null }
        : c
    ))

    // Persist to database
    await storageUpdateCounterState(counterId, {
      active: false,
      startTime: null,
      drinks: [],
      startedBy: null,
    })

    return sessionInfo
  }, [counters, counterSettings])

  // Add drink to an active counter
  const addDrinkToCounter = useCallback(async (counterId, drink, quantity = 1) => {
    setCounters(prev => prev.map(c => {
      if (c.id === counterId && c.active) {
        const existingDrink = c.drinks.find(d => d.id === drink.id)
        const newDrinks = existingDrink
          ? c.drinks.map(d => d.id === drink.id ? { ...d, quantity: d.quantity + quantity } : d)
          : [...c.drinks, { ...drink, quantity }]

        // Persist to database in background
        storageUpdateCounterState(counterId, {
          active: c.active,
          startTime: c.startTime,
          drinks: newDrinks,
        })

        return { ...c, drinks: newDrinks }
      }
      return c
    }))
  }, [])

  // Counter management
  const addNewCounter = useCallback(async (counterData) => {
    const result = await storageAddCounter(counterData)
    if (result) {
      await refreshCounters()
    }
    return result
  }, [refreshCounters])

  const editCounter = useCallback(async (counterId, updates) => {
    const result = await storageUpdateCounter(counterId, updates)
    if (result) {
      await refreshCounters()
    }
    return result
  }, [refreshCounters])

  const removeCounter = useCallback(async (counterId) => {
    const result = await storageDeleteCounter(counterId)
    if (result) {
      await refreshCounters()
    }
    return result
  }, [refreshCounters])

  const updatePricingSettings = useCallback(async (counterType, settings) => {
    const result = await storageUpdateCounterSettings(counterType, settings)
    if (result?.success) {
      await refreshCounterSettings()
    }
    return result
  }, [refreshCounterSettings])

  const createBill = useCallback(async (sessionInfo, playerName) => {
    const bill = {
      id: generateId(),
      ...sessionInfo,
      playerName,
      cashierName: user?.name || user?.email || 'N/A',
      paid: false,
      paidAt: null,
      createdAt: new Date().toISOString(),
      has_items: true, // Flag to indicate this bill has line items
    }

    // Create the bill first
    const createdBill = await addBill(bill)

    if (createdBill) {
      // Create bill items
      const items = []

      // Add counter time as an item if duration > 0
      if (sessionInfo.duration > 0 && sessionInfo.counterPrice > 0) {
        const minutes = Math.floor(sessionInfo.duration / 60)
        const settings = sessionInfo.settings || {}
        const multiplier = sessionInfo.multiplier || 1
        const { startingValue = 0, incrementAmount = 0, incrementInterval = 900 } = settings
        const incrementMinutes = Math.floor(incrementInterval / 60)

        // Apply multiplier to display correct pricing
        const displayStarting = startingValue * multiplier
        const displayIncrement = incrementAmount * multiplier

        // Build pricing formula text
        let formulaText = incrementAmount > 0
          ? `(${formatPrice(displayStarting)} + ${formatPrice(displayIncrement)}/${incrementMinutes} min${incrementMinutes > 1 ? 's' : ''})`
          : `(${formatPrice(displayStarting)})`

        // Add multiplier info for PlayStation with 3 or 4 manettes
        const isPlayStation = sessionInfo.counterType === 'playstation4' || sessionInfo.counterType === 'playstation5'
        if (isPlayStation && multiplier > 1) {
          const manettesCount = multiplier === 1.5 ? '3' : multiplier === 2 ? '4' : '3+'
          formulaText += ` [${manettesCount} manettes]`
        }

        items.push({
          itemType: 'counter',
          itemName: `${minutes} min ${sessionInfo.counterName} ${formulaText}`,
          quantity: 1,
          unitPrice: sessionInfo.counterPrice,
        })
      }

      // Add drinks as items
      if (sessionInfo.drinks && sessionInfo.drinks.length > 0) {
        sessionInfo.drinks.forEach(drink => {
          items.push({
            itemType: 'drink',
            itemName: drink.name,
            quantity: drink.quantity,
            unitPrice: drink.price,
          })
        })
      }

      // Save bill items
      if (items.length > 0) {
        await addBillItems(createdBill.id, items)
      }
    }

    await refreshBills()
    return createdBill
  }, [refreshBills, user])

  const updateBill = useCallback(async (billId, updates) => {
    const result = await storageUpdateBill(billId, updates)
    if (result) {
      await refreshBills()
    }
    return result
  }, [refreshBills])

  const payBill = useCallback(async (billId) => {
    await markBillAsPaid(billId)
    await refreshBills()
  }, [refreshBills])

  const removeBill = useCallback(async (billId) => {
    await deleteBill(billId)
    await refreshBills()
  }, [refreshBills])

  // Player management
  const addNewPlayer = useCallback(async (playerData) => {
    const player = {
      id: generateId(),
      ...playerData,
      createdAt: new Date().toISOString(),
    }
    await storageAddPlayer(player)
    await refreshPlayers()
    return player
  }, [refreshPlayers])

  const editPlayer = useCallback(async (playerId, updates) => {
    await storageUpdatePlayer(playerId, updates)
    await refreshPlayers()
  }, [refreshPlayers])

  const removePlayer = useCallback(async (playerId) => {
    await storageDeletePlayer(playerId)
    await refreshPlayers()
  }, [refreshPlayers])

  // Drink management
  const addNewDrink = useCallback(async (drinkData) => {
    const result = await storageAddDrink(drinkData)
    if (result) {
      await refreshDrinks()
    }
    return result
  }, [refreshDrinks])

  const editDrink = useCallback(async (drinkId, updates) => {
    const result = await storageUpdateDrink(drinkId, updates)
    if (result) {
      await refreshDrinks()
    }
    return result
  }, [refreshDrinks])

  const removeDrink = useCallback(async (drinkId) => {
    const result = await storageDeleteDrink(drinkId)
    if (result) {
      await refreshDrinks()
    }
    return result
  }, [refreshDrinks])

  // Refresh all data (for DB operations)
  const refreshData = useCallback(async () => {
    console.log('🔄 [APPCONTEXT] Refreshing all data...')
    const [billsData, playersData, countersData, counterSettingsData, drinksData] = await Promise.all([
      getBills(),
      getPlayers(),
      getCounters(),
      getCounterSettings(),
      getDrinks(),
    ])
    setBills(billsData)
    setPlayers(playersData)
    setCounterSettings(counterSettingsData)
    setDrinks(drinksData)

    // Initialize counters with their DB state and calculate elapsed time
    const initialized = createInitialCounters(countersData)
    setCounters(initialized)

    console.log('✅ [APPCONTEXT] Data refreshed')
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pool-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider value={{
      counters,
      counterSettings,
      drinks,
      bills,
      settings,
      players,
      startCounter,
      stopCounter,
      addDrinkToCounter,
      addNewCounter,
      editCounter,
      removeCounter,
      updatePricingSettings,
      createBill,
      updateBill,
      payBill,
      removeBill,
      refreshBills,
      refreshCounters,
      refreshCounterSettings,
      refreshDrinks,
      refreshData,
      addNewPlayer,
      editPlayer,
      removePlayer,
      addNewDrink,
      editDrink,
      removeDrink,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
