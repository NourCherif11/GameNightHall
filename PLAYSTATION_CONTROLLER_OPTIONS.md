# PlayStation Controller Options - Implementation Summary

## Changes Made

### 1. Counter Types
- **Old**: Single "PlayStation" type
- **New**: Two separate types:
  - `playstation5` - PlayStation 5 counters
  - `playstation4` - PlayStation 4 counters (new)

### 2. Controller Options for PlayStation Counters
All PlayStation counters (both PS4 and PS5) now have **3 start options**:

1. **Démarrer** (Normal button) - 1x multiplier (standard pricing)
2. **3 manettes** button - 1.5x multiplier on all prices
3. **4 manettes** button - 2x multiplier on all prices

The controller buttons appear below the main "Démarrer" button when the counter is inactive.

### 3. Pricing System
The multiplier is applied to both:
- Starting value (Prix de départ)
- Increment amount (Montant d'incrément)

**Example:**
- Base: 2 TND starting, 2 TND per 15min
- 3 manettes: 3 TND starting, 3 TND per 15min (×1.5)
- 4 manettes: 4 TND starting, 4 TND per 15min (×2)

### 4. UI Changes
The Compteurs page now shows **3 sections**:
1. **Billard** - Pool tables
2. **PlayStation 5** - PS5 counters with controller options
3. **PlayStation 4** - PS4 counters with controller options (new)

Each section has:
- Counter count display
- Tarifs (Pricing) settings button (superadmin only)
- Ajouter (Add counter) button (superadmin only)

## Database Migration Required

**IMPORTANT**: Run the migration to update existing data:

1. Go to Supabase Dashboard → SQL Editor
2. Copy/paste the SQL from `migration-playstation-types.sql`
3. Click "Run"

This will:
- Rename existing 'playstation' counters to 'playstation5'
- Update historical bills counter types
- Optionally create 2 default PlayStation 4 counters

## How It Works

### For Regular Users:
1. Click a PlayStation counter
2. Choose start option:
   - Main button: Standard pricing
   - "3 manettes": +50% price boost
   - "4 manettes": +100% price boost (double)
3. Counter runs with selected multiplier
4. Bill reflects the adjusted pricing

### For Superadmins:
1. Can add counters to any section
2. Can manage tariffs separately for:
   - Billard
   - PlayStation 5
   - PlayStation 4
3. Can rename/delete counters
4. Base tariffs are set normally, multipliers apply on top

## Technical Details

### Files Modified:
- `src/lib/utils.js` - Added multiplier parameter to calculateCounterPrice
- `src/context/AppContext.jsx` - Updated startCounter/stopCounter to handle multiplier
- `src/pages/Compteurs.jsx` - Added PS4/PS5 sections and controller buttons
- `src/context/AppContext.jsx` - createInitialCounters extracts multiplier from DB

### Multiplier Storage:
- Stored temporarily in drinks array as metadata: `{ __multiplier: 1.5 }`
- Filtered out when calculating drinks total
- Restored when loading active counter from database
- Included in bill sessionInfo for pricing calculations

### Backward Compatibility:
- Existing counters without multiplier default to 1x
- Bills created before this change work normally
- Migration updates types but preserves all data
