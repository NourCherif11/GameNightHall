import { supabase } from './supabaseClient'

// Default admin credentials (still local for now)
const DEFAULT_ADMIN = {
  username: 'admin',
  password: 'admin123',
  name: 'Saddem',
}

// ==================== AUTH ====================
export function authenticate(username, password) {
  if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
    const session = {
      authenticated: true,
      user: { username: DEFAULT_ADMIN.username, name: DEFAULT_ADMIN.name },
      loginTime: new Date().toISOString(),
    }
    localStorage.setItem('poolclub_auth', JSON.stringify(session))
    return session
  }
  return null
}

export function getSession() {
  try {
    const data = localStorage.getItem('poolclub_auth')
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem('poolclub_auth')
}

// ==================== SETTINGS ====================
export async function getSettings() {
  console.log('📖 [STORAGE] Fetching settings from Supabase...')
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')

    if (error) throw error

    console.log('✅ [STORAGE] Settings loaded:', data)

    // Convert array to object
    const settings = {}
    data.forEach(row => {
      if (row.key === 'hourlyRate') {
        settings[row.key] = parseFloat(row.value)
      } else if (row.key === 'tableCount') {
        settings[row.key] = parseInt(row.value)
      } else {
        settings[row.key] = row.value
      }
    })

    return settings
  } catch (error) {
    console.error('Error fetching settings:', error)
    // Fallback to defaults
    return {
      hourlyRate: 10,
      currency: 'TND',
      clubName: 'GamePark',
      tableCount: 4,
    }
  }
}

export async function updateSettings(updates) {
  try {
    // Update each setting individually
    for (const [key, value] of Object.entries(updates)) {
      const { error } = await supabase
        .from('settings')
        .update({ value: String(value), updated_at: new Date().toISOString() })
        .eq('key', key)

      if (error) throw error
    }

    return await getSettings()
  } catch (error) {
    console.error('Error updating settings:', error)
    return null
  }
}

// ==================== COUNTERS ====================
export async function getCounters() {
  console.log('📖 [STORAGE] Fetching counters from Supabase...')
  try {
    const { data, error } = await supabase
      .from('counters')
      .select('*')
      .order('order_index')

    if (error) throw error

    console.log(`✅ [STORAGE] ${data.length} counters loaded`)
    return data.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      orderIndex: c.order_index,
      createdAt: c.created_at,
      // State fields from DB
      active: c.active || false,
      startTime: c.start_time || null,
      drinks: c.drinks || [],
      startedBy: c.started_by || null,
    }))
  } catch (error) {
    console.error('❌ [STORAGE] Error fetching counters:', error)
    return []
  }
}

export async function addCounter(counter) {
  console.log('➕ [STORAGE] Adding counter:', counter.name)
  try {
    const { data, error } = await supabase
      .from('counters')
      .insert({
        name: counter.name,
        type: counter.type,
        order_index: counter.orderIndex,
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ [STORAGE] Counter added successfully:', data.id)
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      orderIndex: data.order_index,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error('❌ [STORAGE] Error adding counter:', error)
    return null
  }
}

export async function updateCounter(counterId, updates) {
  console.log('✏️ [STORAGE] Updating counter:', counterId)
  try {
    const dbUpdates = {}
    if ('name' in updates) dbUpdates.name = updates.name
    if ('type' in updates) dbUpdates.type = updates.type
    if ('orderIndex' in updates) dbUpdates.order_index = updates.orderIndex

    const { data, error } = await supabase
      .from('counters')
      .update(dbUpdates)
      .eq('id', counterId)
      .select()
      .single()

    if (error) throw error

    console.log('✅ [STORAGE] Counter updated successfully')
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      orderIndex: data.order_index,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error('❌ [STORAGE] Error updating counter:', error)
    return null
  }
}

export async function deleteCounter(counterId) {
  console.log('🗑️ [STORAGE] Deleting counter:', counterId)
  try {
    const { error } = await supabase
      .from('counters')
      .delete()
      .eq('id', counterId)

    if (error) throw error

    console.log('✅ [STORAGE] Counter deleted successfully')
    return true
  } catch (error) {
    console.error('❌ [STORAGE] Error deleting counter:', error)
    return false
  }
}

// Update counter state (active/inactive with start time and drinks)
export async function updateCounterState(counterId, stateUpdate) {
  console.log('🔄 [STORAGE] Updating counter state:', counterId, stateUpdate)
  try {
    const updateData = {
      active: stateUpdate.active,
      start_time: stateUpdate.startTime,
      drinks: stateUpdate.drinks || [],
    }
    
    // Include started_by if provided (null to clear, value to set)
    if ('startedBy' in stateUpdate) {
      updateData.started_by = stateUpdate.startedBy
    }
    
    const { data, error } = await supabase
      .from('counters')
      .update(updateData)
      .eq('id', counterId)
      .select()
      .single()

    if (error) throw error

    console.log('✅ [STORAGE] Counter state updated successfully')
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      orderIndex: data.order_index,
      active: data.active,
      startTime: data.start_time,
      drinks: data.drinks || [],
      startedBy: data.started_by || null,
    }
  } catch (error) {
    console.error('❌ [STORAGE] Error updating counter state:', error)
    return null
  }
}

// ==================== COUNTER SETTINGS ====================
export async function getCounterSettings() {
  console.log('📖 [STORAGE] Fetching counter settings from Supabase...')
  try {
    const { data, error } = await supabase
      .from('counter_settings')
      .select('*')

    if (error) throw error

    console.log('✅ [STORAGE] Counter settings loaded:', data)

    // Convert array to object keyed by counter_type
    const settings = {}
    data.forEach(row => {
      settings[row.counter_type] = {
        startingValue: parseFloat(row.starting_value),
        incrementAmount: parseFloat(row.increment_amount),
        incrementInterval: parseFloat(row.increment_interval_seconds),
        gracePeriod: row.grace_period_seconds != null ? parseFloat(row.grace_period_seconds) : 0,
      }
    })

    return settings
  } catch (error) {
    console.error('❌ [STORAGE] Error fetching counter settings:', error)
    // Return defaults (in seconds)
    return {
      billard: {
        startingValue: 0,
        incrementAmount: 2,
        incrementInterval: 900,
        gracePeriod: 300,
      },
      playstation: {
        startingValue: 1,
        incrementAmount: 1,
        incrementInterval: 600,
        gracePeriod: 0,
      },
    }
  }
}

export async function updateCounterSettings(counterType, settings) {
  console.log('✏️ [STORAGE] Updating counter settings for:', counterType)
  try {
    // First, check if the row exists
    const { data: existing } = await supabase
      .from('counter_settings')
      .select('counter_type')
      .eq('counter_type', counterType)
      .maybeSingle()

    let data, error

    if (existing) {
      // Update existing row
      const result = await supabase
        .from('counter_settings')
        .update({
          starting_value: settings.startingValue,
          increment_amount: settings.incrementAmount,
          increment_interval_seconds: settings.incrementInterval,
          grace_period_seconds: settings.gracePeriod || 0,
          updated_at: new Date().toISOString(),
        })
        .eq('counter_type', counterType)
        .select()
        .single()

      data = result.data
      error = result.error
    } else {
      // Insert new row
      const result = await supabase
        .from('counter_settings')
        .insert({
          counter_type: counterType,
          starting_value: settings.startingValue,
          increment_amount: settings.incrementAmount,
          increment_interval_seconds: settings.incrementInterval,
          grace_period_seconds: settings.gracePeriod || 0,
        })
        .select()
        .single()

      data = result.data
      error = result.error
    }

    if (error) throw error

    console.log('✅ [STORAGE] Counter settings updated successfully')
    return {
      success: true,
      data: {
        startingValue: parseFloat(data.starting_value),
        incrementAmount: parseFloat(data.increment_amount),
        incrementInterval: parseFloat(data.increment_interval_seconds),
        gracePeriod: data.grace_period_seconds != null ? parseFloat(data.grace_period_seconds) : 0,
      }
    }
  } catch (error) {
    console.error('❌ [STORAGE] Error updating counter settings:', error)
    return {
      success: false,
      error: error.message || 'Erreur lors de la mise à jour des paramètres'
    }
  }
}

// ==================== DRINKS ====================
export async function getDrinks() {
  console.log('📖 [STORAGE] Fetching drinks from Supabase...')
  try {
    const { data, error } = await supabase
      .from('drinks')
      .select('*')
      .order('category, name')

    if (error) throw error

    console.log(`✅ [STORAGE] ${data.length} drinks loaded`)
    return data.map(d => ({
      id: d.id,
      name: d.name,
      price: parseFloat(d.price),
      category: d.category,
      available: d.available,
      createdAt: d.created_at,
    }))
  } catch (error) {
    console.error('❌ [STORAGE] Error fetching drinks:', error)
    return []
  }
}

export async function addDrink(drink) {
  console.log('➕ [STORAGE] Adding drink:', drink.name)
  try {
    const { data, error } = await supabase
      .from('drinks')
      .insert({
        name: drink.name,
        price: drink.price,
        category: drink.category || 'other',
        available: drink.available !== undefined ? drink.available : true,
      })
      .select()
      .single()

    if (error) throw error

    console.log('✅ [STORAGE] Drink added successfully:', data.id)
    return {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price),
      category: data.category,
      available: data.available,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error('❌ [STORAGE] Error adding drink:', error)
    return null
  }
}

export async function updateDrink(drinkId, updates) {
  console.log('✏️ [STORAGE] Updating drink:', drinkId)
  try {
    const dbUpdates = { updated_at: new Date().toISOString() }
    if ('name' in updates) dbUpdates.name = updates.name
    if ('price' in updates) dbUpdates.price = updates.price
    if ('category' in updates) dbUpdates.category = updates.category
    if ('available' in updates) dbUpdates.available = updates.available

    const { data, error } = await supabase
      .from('drinks')
      .update(dbUpdates)
      .eq('id', drinkId)
      .select()
      .single()

    if (error) throw error

    console.log('✅ [STORAGE] Drink updated successfully')
    return {
      id: data.id,
      name: data.name,
      price: parseFloat(data.price),
      category: data.category,
      available: data.available,
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error('❌ [STORAGE] Error updating drink:', error)
    return null
  }
}

export async function deleteDrink(drinkId) {
  console.log('🗑️ [STORAGE] Deleting drink:', drinkId)
  try {
    const { error } = await supabase
      .from('drinks')
      .delete()
      .eq('id', drinkId)

    if (error) throw error

    console.log('✅ [STORAGE] Drink deleted successfully')
    return true
  } catch (error) {
    console.error('❌ [STORAGE] Error deleting drink:', error)
    return false
  }
}

// ==================== BILL ITEMS ====================
export async function getBillItems(billId) {
  try {
    const { data, error } = await supabase
      .from('bill_items')
      .select('*')
      .eq('bill_id', billId)
      .order('created_at')

    if (error) throw error

    return data.map(item => ({
      id: item.id,
      billId: item.bill_id,
      itemType: item.item_type,
      itemName: item.item_name,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unit_price),
      totalPrice: parseFloat(item.total_price),
      createdAt: item.created_at,
    }))
  } catch (error) {
    console.error('❌ [STORAGE] Error fetching bill items:', error)
    return []
  }
}

export async function addBillItems(billId, items) {
  console.log('➕ [STORAGE] Adding bill items for bill:', billId)
  try {
    const itemsToInsert = items.map(item => ({
      bill_id: billId,
      item_type: item.itemType,
      item_name: item.itemName,
      quantity: item.quantity || 1,
      unit_price: item.unitPrice,
      total_price: (item.quantity || 1) * item.unitPrice,
    }))

    const { data, error } = await supabase
      .from('bill_items')
      .insert(itemsToInsert)
      .select()

    if (error) throw error

    console.log(`✅ [STORAGE] ${data.length} bill items added successfully`)
    return data.map(item => ({
      id: item.id,
      billId: item.bill_id,
      itemType: item.item_type,
      itemName: item.item_name,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unit_price),
      totalPrice: parseFloat(item.total_price),
      createdAt: item.created_at,
    }))
  } catch (error) {
    console.error('❌ [STORAGE] Error adding bill items:', error)
    return null
  }
}

// ==================== PLAYERS ====================
export async function getPlayers() {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(p => ({
      id: p.id,
      name: p.name,
      phone: p.phone || '',
      notes: p.notes || '',
      createdAt: p.created_at,
    }))
  } catch (error) {
    console.error('Error fetching players:', error)
    return []
  }
}

export async function addPlayer(player) {
  console.log('➕ [STORAGE] Adding player:', player.name)
  try {
    const { data, error } = await supabase
      .from('players')
      .insert({
        name: player.name,
        phone: player.phone || '',
        notes: player.notes || '',
      })
      .select()
      .single()

    if (error) throw error
    console.log('✅ [STORAGE] Player added successfully:', data.id)

    return {
      id: data.id,
      name: data.name,
      phone: data.phone || '',
      notes: data.notes || '',
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error('Error adding player:', error)
    return null
  }
}

export async function updatePlayer(playerId, updates) {
  try {
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', playerId)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      phone: data.phone || '',
      notes: data.notes || '',
      createdAt: data.created_at,
    }
  } catch (error) {
    console.error('Error updating player:', error)
    return null
  }
}

export async function deletePlayer(playerId) {
  try {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting player:', error)
    return false
  }
}

// ==================== BILLS ====================
export async function getBills() {
  console.log('📖 [STORAGE] Fetching bills from Supabase...')
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    console.log(`✅ [STORAGE] ${data.length} bills loaded`)

    return data.map(b => ({
      id: b.id,
      counterId: b.counter_id,
      counterType: b.counter_type,
      tableNumber: b.table_number, // Keep for backward compatibility
      playerName: b.player_name,
      cashierName: b.cashier_name,
      startTime: b.start_time,
      endTime: b.end_time,
      duration: b.duration,
      price: parseFloat(b.price),
      paid: b.paid,
      paidAt: b.paid_at,
      createdAt: b.created_at,
      has_items: b.has_items || false,
    }))
  } catch (error) {
    console.error('Error fetching bills:', error)
    return []
  }
}

export async function addBill(bill) {
  console.log('➕ [STORAGE] Adding bill for counter', bill.counterId, '- Player:', bill.playerName)
  try {
    const { data, error } = await supabase
      .from('bills')
      .insert({
        counter_id: bill.counterId,
        counter_type: bill.counterType,
        table_number: bill.tableNumber, // Keep for backward compatibility
        player_name: bill.playerName,
        cashier_name: bill.cashierName,
        start_time: bill.startTime,
        end_time: bill.endTime,
        duration: bill.duration,
        price: bill.price,
        paid: bill.paid || false,
        paid_at: bill.paidAt || null,
        has_items: bill.has_items || false,
      })
      .select()
      .single()

    if (error) throw error
    console.log('✅ [STORAGE] Bill added successfully:', data.id)

    return {
      id: data.id,
      counterId: data.counter_id,
      counterType: data.counter_type,
      tableNumber: data.table_number,
      playerName: data.player_name,
      cashierName: data.cashier_name,
      startTime: data.start_time,
      endTime: data.end_time,
      duration: data.duration,
      price: parseFloat(data.price),
      paid: data.paid,
      paidAt: data.paid_at,
      createdAt: data.created_at,
      has_items: data.has_items || false,
    }
  } catch (error) {
    console.error('Error adding bill:', error)
    return null
  }
}

export async function updateBill(billId, updates) {
  try {
    // Convert camelCase to snake_case for Supabase
    const dbUpdates = {}
    if ('counterId' in updates) dbUpdates.counter_id = updates.counterId
    if ('counterType' in updates) dbUpdates.counter_type = updates.counterType
    if ('tableNumber' in updates) dbUpdates.table_number = updates.tableNumber
    if ('playerName' in updates) dbUpdates.player_name = updates.playerName
    if ('startTime' in updates) dbUpdates.start_time = updates.startTime
    if ('endTime' in updates) dbUpdates.end_time = updates.endTime
    if ('duration' in updates) dbUpdates.duration = updates.duration
    if ('price' in updates) dbUpdates.price = updates.price
    if ('paid' in updates) dbUpdates.paid = updates.paid
    if ('paidAt' in updates) dbUpdates.paid_at = updates.paidAt
    if ('has_items' in updates) dbUpdates.has_items = updates.has_items

    const { data, error } = await supabase
      .from('bills')
      .update(dbUpdates)
      .eq('id', billId)
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      counterId: data.counter_id,
      counterType: data.counter_type,
      tableNumber: data.table_number,
      playerName: data.player_name,
      startTime: data.start_time,
      endTime: data.end_time,
      duration: data.duration,
      price: parseFloat(data.price),
      paid: data.paid,
      paidAt: data.paid_at,
      createdAt: data.created_at,
      has_items: data.has_items || false,
    }
  } catch (error) {
    console.error('Error updating bill:', error)
    return null
  }
}

export async function deleteBill(billId) {
  try {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', billId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting bill:', error)
    return false
  }
}

export async function markBillAsPaid(billId) {
  console.log('💰 [STORAGE] Marking bill as paid:', billId)
  const result = await updateBill(billId, { paid: true, paidAt: new Date().toISOString() })
  if (result) console.log('✅ [STORAGE] Bill marked as paid successfully')
  return result
}

// ==================== DATABASE MANAGEMENT ====================
export async function clearAllData() {
  console.log('🗑️ [STORAGE] CLEARING ALL DATA from database...')
  try {
    // Delete all bills
    const { error: billsError } = await supabase
      .from('bills')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (billsError) throw billsError
    console.log('✅ [STORAGE] All bills deleted')

    // Delete all players
    const { error: playersError } = await supabase
      .from('players')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (playersError) throw playersError
    console.log('✅ [STORAGE] All players deleted')

    console.log('🎉 [STORAGE] Database cleared successfully!')
    return true
  } catch (error) {
    console.error('❌ [STORAGE] Error clearing database:', error)
    return false
  }
}

export async function seedMockData() {
  console.log('🌱 [STORAGE] Seeding mock data...')
  try {
    // Seed players first
    const playerNames = ['Amine', 'Youssef', 'Karim', 'Mehdi', 'Sofiane', 'Riad', 'Walid', 'Nabil', 'Omar', 'Samir']
    console.log(`👥 [STORAGE] Adding ${playerNames.length} players...`)

    for (const name of playerNames) {
      await addPlayer({ name, phone: `+216 ${Math.floor(Math.random() * 90000000) + 10000000}`, notes: 'Joueur régulier' })
    }

    // Seed bills for the last 30 days
    console.log('📄 [STORAGE] Adding bills for the last 30 days...')
    const now = new Date()
    let billCount = 0

    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const sessionsPerDay = Math.floor(Math.random() * 8) + 3 // 3-10 sessions per day

      for (let s = 0; s < sessionsPerDay; s++) {
        const date = new Date(now)
        date.setDate(date.getDate() - daysAgo)
        date.setHours(Math.floor(Math.random() * 12) + 10, Math.floor(Math.random() * 60))

        const durationMinutes = Math.floor(Math.random() * 150) + 30 // 30-180 minutes
        const durationSeconds = durationMinutes * 60
        const endDate = new Date(date.getTime() + durationSeconds * 1000)
        const price = Math.ceil((durationSeconds / 3600) * 10 * 100) / 100 // 10 TND/hour
        const tableNum = Math.floor(Math.random() * 4) + 1 // Tables 1-4
        const playerName = playerNames[Math.floor(Math.random() * playerNames.length)]

        await addBill({
          tableNumber: tableNum,
          playerName: playerName,
          startTime: date.toISOString(),
          endTime: endDate.toISOString(),
          duration: durationSeconds,
          price: price,
          paid: daysAgo > 1 ? Math.random() > 0.15 : Math.random() > 0.5, // Most old bills are paid
          paidAt: daysAgo > 1 && Math.random() > 0.15 ? endDate.toISOString() : null,
        })
        billCount++
      }
    }

    console.log(`✅ [STORAGE] ${billCount} bills added successfully`)
    console.log('🎉 [STORAGE] Mock data seeded successfully!')
    return true
  } catch (error) {
    console.error('❌ [STORAGE] Error seeding mock data:', error)
    return false
  }
}

export function getUnpaidBills() {
  // This will be called synchronously, so we'll handle it in the component
  return []
}

export function getPaidBills() {
  // This will be called synchronously, so we'll handle it in the component
  return []
}

// ==================== TABLE STATE (keep in localStorage for persistence) ====================
export function getTableStates() {
  try {
    const data = localStorage.getItem('poolclub_tables')
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

export function saveTableState(tableId, state) {
  const states = getTableStates()
  states[tableId] = state
  localStorage.setItem('poolclub_tables', JSON.stringify(states))
}

export function clearTableState(tableId) {
  const states = getTableStates()
  delete states[tableId]
  localStorage.setItem('poolclub_tables', JSON.stringify(states))
}

// ==================== UTILITY FUNCTIONS ====================
export async function getBillsInDateRange(startDate, endDate) {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) throw error

    return data.map(b => ({
      id: b.id,
      tableNumber: b.table_number,
      playerName: b.player_name,
      cashierName: b.cashier_name,
      startTime: b.start_time,
      endTime: b.end_time,
      duration: b.duration,
      price: parseFloat(b.price),
      paid: b.paid,
      paidAt: b.paid_at,
      createdAt: b.created_at,
    }))
  } catch (error) {
    console.error('Error fetching bills in date range:', error)
    return []
  }
}

export async function getTodayBills() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return getBillsInDateRange(today, tomorrow)
}

export async function getThisWeekBills() {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)
  return getBillsInDateRange(startOfWeek, endOfWeek)
}

export async function getThisMonthBills() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return getBillsInDateRange(startOfMonth, endOfMonth)
}

// Demo data seeding - only run once
export async function seedDemoData() {
  console.log('🔍 [STORAGE] Checking if demo data is needed...')
  try {
    // Check if we already have data
    const { data: existingBills } = await supabase
      .from('bills')
      .select('id')
      .limit(1)

    if (existingBills && existingBills.length > 0) {
      console.log('✅ [STORAGE] Demo data already exists, skipping seed')
      return
    }

    console.log('🌱 [STORAGE] No data found, seeding demo data...')

    // Seed players first
    const names = ['Amine', 'Youssef', 'Karim', 'Mehdi', 'Sofiane', 'Riad', 'Walid', 'Nabil', 'Omar', 'Samir']

    for (const name of names) {
      await addPlayer({ name, phone: '', notes: '' })
    }

    // Seed bills
    const now = new Date()
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
      const sessionsPerDay = Math.floor(Math.random() * 6) + 2
      for (let s = 0; s < sessionsPerDay; s++) {
        const date = new Date(now)
        date.setDate(date.getDate() - daysAgo)
        date.setHours(Math.floor(Math.random() * 12) + 10, Math.floor(Math.random() * 60))

        const durationMinutes = Math.floor(Math.random() * 150) + 30
        const durationSeconds = durationMinutes * 60
        const endDate = new Date(date.getTime() + durationSeconds * 1000)
        const price = Math.ceil((durationSeconds / 3600) * 10 * 100) / 100
        const tableNum = Math.floor(Math.random() * 4) + 1
        const name = names[Math.floor(Math.random() * names.length)]

        await addBill({
          tableNumber: tableNum,
          playerName: name,
          startTime: date.toISOString(),
          endTime: endDate.toISOString(),
          duration: durationSeconds,
          price: price,
          paid: daysAgo > 1 ? Math.random() > 0.15 : Math.random() > 0.5,
          paidAt: daysAgo > 1 ? endDate.toISOString() : null,
        })
      }
    }

    console.log('✅ Demo data seeded successfully')
  } catch (error) {
    console.error('Error seeding demo data:', error)
  }
}
