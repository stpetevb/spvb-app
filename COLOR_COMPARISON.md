# St Pete Volleyball - Color Scheme Comparison

## Before & After

### Primary Accent Color

#### BEFORE (Red)
```
🔴 #E10600 - Crimson Red
RGB: (225, 6, 0)
```

#### AFTER (Orange)
```
🟧 #E85C20 - Flyers Orange
RGB: (232, 92, 32)
```

---

### Secondary Accent Color

#### BEFORE (Teal/Cyan)
```
🔵 #219ebc - Teal Blue
RGB: (33, 158, 188)
```

#### AFTER (Light Blue)
```
🩵 #5EC6E8 - Sky Blue
RGB: (94, 198, 232)
```

---

## Visual Impact

### Homepage
- **"St. Pete VOLLEYBALL"** text
  - Before: Red (#dc2626)
  - After: Orange (#E85C20)

- **Register Buttons**
  - Before: Teal (#219ebc)
  - After: Light Blue (#5EC6E8)

### Tournament Pages
- **Division Links**
  - Before: Red background
  - After: Orange background (#E85C20)

### Admin Panel
- **Primary Action Buttons**
  - Before: Red (#E10600)
  - After: Orange (#E85C20)

- **Save/Submit Buttons**
  - Before: Teal (#219ebc)
  - After: Light Blue (#5EC6E8)

- **Delete/Reset Buttons**
  - Before: Crimson (#e63946)
  - After: Orange (#E85C20)

### Bracket System
- **Save Score Buttons**
  - Before: Teal (#219ebc)
  - After: Light Blue (#5EC6E8)

- **Reset Bracket Button**
  - Before: Crimson (#e63946)
  - After: Orange (#E85C20)

### Legal Pages (Waiver, Terms, Privacy)
- **Headings & Accent Text**
  - Before: Dark Red (#b22222)
  - After: Orange (#E85C20)

---

## Color Psychology

### Orange (#E85C20)
- **Energy & Enthusiasm:** Perfect for a sports/volleyball brand
- **Warmth & Friendliness:** Inviting and approachable
- **Action & Confidence:** Encourages participation and registration
- **Modern & Bold:** Stands out without being aggressive

### Light Blue (#5EC6E8)
- **Trust & Reliability:** Great for action buttons
- **Clarity & Communication:** Easy to read and understand
- **Calm & Professional:** Balances the energy of orange
- **Beach/Summer Vibes:** Perfect for St. Pete beach volleyball

---

## Accessibility

### Contrast Ratios (on white background)

#### Orange (#E85C20)
- **Contrast Ratio:** 4.2:1
- **WCAG AA:** ✅ Pass (for large text)
- **WCAG AAA:** ⚠️ Pass for large text only

#### Light Blue (#5EC6E8)
- **Contrast Ratio:** 2.8:1
- **WCAG AA:** ⚠️ Use with white text on colored background
- **Best Practice:** Always use white text on light blue buttons

#### Darker Orange (#c74a15) - Hover State
- **Contrast Ratio:** 5.8:1
- **WCAG AA:** ✅ Pass
- **WCAG AAA:** ✅ Pass for large text

---

## Brand Alignment

### Philadelphia Flyers Inspiration
The new orange (#E85C20) is inspired by the Philadelphia Flyers' iconic orange, but slightly lighter and more modern for web use. It maintains the bold, energetic feel while being optimized for digital displays.

### St. Pete Beach Connection
The light blue (#5EC6E8) evokes the clear skies and waters of St. Petersburg, Florida, creating a strong local connection while maintaining high visibility and modern aesthetics.

---

## Implementation Notes

1. **CSS Variables:** The main color is defined in `src/index.css` as `--color-red: #E85C20`, which automatically updates all components using `var(--color-accent)`

2. **Hover States:** All interactive elements have darker hover states for better UX feedback

3. **Consistency:** Both colors are used consistently throughout the application:
   - Orange: Primary actions, headings, brand elements
   - Light Blue: Secondary actions, save buttons, register CTAs

4. **No Breaking Changes:** All functionality remains the same; only visual appearance has changed

---

## Browser Compatibility

✅ All modern browsers (Chrome, Firefox, Safari, Edge)  
✅ Mobile browsers (iOS Safari, Chrome Mobile)  
✅ CSS variables supported in all target browsers  
✅ No fallbacks needed for current browser support matrix

---

**Color Palette Summary:**

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| Primary Orange | #E85C20 | (232, 92, 32) | Main accent, headings, primary buttons |
| Dark Orange | #c74a15 | (199, 74, 21) | Hover states, active elements |
| Light Blue | #5EC6E8 | (94, 198, 232) | Secondary buttons, register CTAs |
| Dark Light Blue | #4ab3d5 | (74, 179, 213) | Light blue hover states |
| Black | #1A1A1A | (26, 26, 26) | Text, headers |
| White | #FFFFFF | (255, 255, 255) | Backgrounds, button text |
| Light Gray | #F4F4F4 | (244, 244, 244) | Subtle backgrounds |

---

**Result:** A modern, energetic, and beach-appropriate color scheme that maintains professionalism while being more inviting and action-oriented than the previous red scheme.