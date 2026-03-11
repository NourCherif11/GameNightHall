# Quick Start Guide - PlayStation Controller Options

## Setup (One-time)

### 1. Run Database Migration
```sql
-- In Supabase SQL Editor, run:
UPDATE counters SET type = 'playstation5' WHERE type = 'playstation';
UPDATE bills SET counter_type = 'playstation5' WHERE counter_type = 'playstation';
```

### 2. Add PlayStation 4 Counters (Optional)
As superadmin:
1. Go to Compteurs page
2. Scroll to "PlayStation 4" section
3. Click "+ Ajouter"
4. Enter counter name (e.g., "PS4 - 1")
5. Repeat to add more PS4 counters

### 3. Configure Tariffs
Set pricing for each console type:

**PlayStation 5:**
1. Click "Tarifs" in PS5 section
2. Set base pricing (e.g., 2 TND start, 2 TND per 15min)
3. Save

**PlayStation 4:**
1. Click "Tarifs" in PS4 section
2. Set base pricing (usually same or slightly lower than PS5)
3. Save

## Usage

### Starting a PlayStation Counter

**Option 1: Standard (1 controller)**
- Click the main "Démarrer" button
- Uses base pricing (1x multiplier)

**Option 2: 3 Controllers**
- Click "3 manettes" button below "Démarrer"
- Uses 1.5x pricing
- Example: Base 2 TND → 3 TND

**Option 3: 4 Controllers**
- Click "4 manettes" button below "Démarrer"
- Uses 2x pricing
- Example: Base 2 TND → 4 TND

### Stopping and Billing
- Works the same as before
- Final price reflects the multiplier chosen
- Bill shows correct amount based on:
  - Time played × Pricing rate × Multiplier
  - Plus any drinks added

## Pricing Examples

**Base Tariff: 2 TND départ, 2 TND per 15min**

### 1 Hour Session:

| Controllers | Calc | Total |
|------------|------|-------|
| Standard | 2 + (4 × 2) = 10 TND | 10 TND |
| 3 manettes | 3 + (4 × 3) = 15 TND | 15 TND |
| 4 manettes | 4 + (4 × 4) = 20 TND | 20 TND |

### 30 Minute Session:

| Controllers | Calc | Total |
|------------|------|-------|
| Standard | 2 + (2 × 2) = 6 TND | 6 TND |
| 3 manettes | 3 + (2 × 3) = 9 TND | 9 TND |
| 4 manettes | 4 + (2 × 4) = 12 TND | 12 TND |

## Tips

1. **Before Starting**: Ask customer how many controllers they need
2. **During Session**: Can add drinks normally (Coffee button)
3. **Different Consoles**: PS4 and PS5 have independent pricing
4. **Flexibility**: Adjust base tariffs anytime via settings

## Troubleshooting

**Q: Controller buttons not showing?**
- A: Only visible for PlayStation 4 and PlayStation 5 counters when inactive

**Q: Wrong multiplier applied?**
- A: Cannot change after starting - must stop and restart

**Q: Old counters showing "PlayStation"?**
- A: Run the migration SQL to update to "PlayStation 5"

**Q: Want different PS4/PS5 pricing?**
- A: Set different base tariffs for each type in their respective settings
