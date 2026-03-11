# 🚀 Frontend Implementation Plan

## Changes Overview

### 1. **Authentication & Roles**
- ✅ Update AuthContext to extract role from user_metadata
- ✅ Create useRole hook for permission checks
- ✅ Add isSuperAdmin helper

### 2. **Storage Layer (src/lib/storage.js)**
- ✅ Add getCounters()
- ✅ Add addCounter()
- ✅ Add updateCounter()
- ✅ Add deleteCounter()
- ✅ Add getCounterSettings()
- ✅ Add updateCounterSettings()
- ✅ Update bills functions to use counter_id

### 3. **Context (src/context/AppContext.jsx)**
- ✅ Replace tables with counters
- ✅ Add counter settings state
- ✅ Add functions to manage counters
- ✅ Update bill creation logic

### 4. **Pages**
- ✅ Rename Tables.jsx → Compteurs.jsx
- ✅ Update to show Billard and PlayStation sections
- ✅ Add counter management UI (superadmin only)
- ✅ Add settings panel for each counter type (superadmin only)

### 5. **Components**
- ✅ Update Layout navigation (Tables → Compteurs)
- ✅ Remove hourly rate display
- ✅ Add role-based UI elements

### 6. **Routing**
- ✅ Update routes (/tables → /compteurs)

---

## Files to Create/Modify

1. `src/context/AuthContext.jsx` - Add role extraction
2. `src/lib/storage.js` - Add counter functions
3. `src/context/AppContext.jsx` - Replace tables with counters
4. `src/pages/Compteurs.jsx` - New counter management page
5. `src/components/Layout.jsx` - Update navigation
6. `src/App.jsx` - Update routes

---

**Status**: Ready to implement after database migration is complete!
