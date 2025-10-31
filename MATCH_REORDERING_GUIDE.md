# Match Reordering Feature - Implementation Guide

## Overview
Admins can now reorder pool play and playoff matches using a drag-and-drop interface. Each match is automatically numbered (Match 1, Match 2, etc.) and can be reordered in any way the admin desires.

## Features

### 1. **Automatic Sequence Assignment**
- When pools are generated, each match automatically gets a `sequence` number (1, 2, 3, etc.)
- When manually adding matches, the next available sequence number is assigned automatically
- Matches are sorted by sequence number in normal view

### 2. **Drag-and-Drop Reordering**
- Click the "🔄 Reorder Matches" button in the Manage Matches section
- Drag matches to reorder them
- Matches can be reordered within and across pools
- Visual drag handle (⋮⋮) indicates which part to grab

### 3. **Save & Cancel**
- After reordering, click "✓ Save Order" to persist changes to Firestore
- Changes update the sequence number of each match
- Click "✕ Cancel" to discard changes without saving

### 4. **Display**
- Each match shows its current sequence number: "Match 1", "Match 2", etc.
- Sequence numbers update automatically after saving
- Scores and match status remain visible during reordering

## User Interface

### Normal Mode
```
[🔄 Reorder Matches]

Pool A
├─ Match 1: Team A vs Team B (5-3)
├─ Match 2: Team C vs Team D (7-4)
└─ Match 3: Team A vs Team C (5-2)

Pool B
├─ Match 4: Team E vs Team F (4-4)
└─ Match 5: Team G vs Team H (8-6)
```

### Reorder Mode
```
[✓ Save Order] [✕ Cancel]

Pool A
├─ ⋮⋮ Match 1: Team A vs Team B [Edit] [Delete]
├─ ⋮⋮ Match 2: Team C vs Team D [Edit] [Delete]
└─ ⋮⋮ Match 3: Team A vs Team C [Edit] [Delete]

Pool B
├─ ⋮⋮ Match 4: Team E vs Team F [Edit] [Delete]
└─ ⋮⋮ Match 5: Team G vs Team H [Edit] [Delete]

(Drag matches to reorder, sequence numbers update automatically)
```

## Technical Details

### Files Modified

1. **src/services/poolService.js**
   - Added sequence number (index + 1) to each generated match
   - Maintains order during pool creation

2. **src/components/AdminMatchesPanel.jsx**
   - Created `SortableMatchItem` component for drag-and-drop items
   - Added reorder mode toggle and state management
   - Implemented `handleDragEnd` for drag-and-drop logic
   - Implemented `handleSaveReorder` for batch Firestore updates
   - Updated `handleAdd` to assign next sequence number
   - Added sorting by sequence in normal view

3. **src/components/AdminMatchesPanel.module.css**
   - Added `.controlBar` styling
   - Added `.reorderButton`, `.dragHandle`, `.matchNumber` styles
   - Updated `.matchItem` with cursor feedback

### Dependencies Added
- `@dnd-kit/core` - Core drag-and-drop functionality
- `@dnd-kit/sortable` - Sortable list management
- `@dnd-kit/utilities` - Utility functions

## Data Model

### Match Object Structure
```javascript
{
  id: "match-id",
  pool: "Pool A",
  teamA: { id, name },
  teamB: { id, name },
  scoreA: 5,
  scoreB: 3,
  sequence: 1,        // ✅ NEW FIELD
  status: "final",
  adminLocked: true,
  // ... other fields
}
```

## Backwards Compatibility

- Existing matches without a `sequence` field will display with sequence = 0
- When reordered, all matches will have sequence numbers assigned (1, 2, 3, etc.)
- No data loss or migration required

## Usage Workflow

1. **After generating pools:**
   - Matches automatically numbered sequentially (Match 1, 2, 3...)
   - Displayed in order in the Manage Matches panel

2. **To reorder matches:**
   - Click "🔄 Reorder Matches" button
   - Drag and drop matches to new positions
   - Watch sequence numbers update in real-time
   - Click "✓ Save Order" to persist
   - Or click "✕ Cancel" to discard changes

3. **Scoring still works normally:**
   - Enter scores for matches in normal mode
   - In reorder mode, matches cannot be edited (edit/delete buttons are disabled)
   - Switch back to normal mode to edit scores

## Keyboard Accessibility

- Tab through matches
- Space to grab/release
- Arrow keys to move matches (dnd-kit support)

## Notes

- ✅ Multiple pools supported (matches can be reordered across pools)
- ✅ Sequence numbers auto-renumber after each save
- ✅ Works with existing score entry workflow
- ✅ Admin-only feature (no player-side changes)
- ✅ No impact on playoff brackets (separate feature)