# St Pete Volleyball - Color Scheme Update

## New Color Palette

### 🟧 Primary Accent (Orange)
- **Hex:** `#E85C20`
- **RGB:** `(232, 92, 32)`
- **Description:** A rich, deep orange with warm undertones — bold like the Flyers' orange but slightly lighter and more modern.
- **Usage:** Primary buttons, headings, links, brand elements

### 🟧 Darker Orange (Hover States)
- **Hex:** `#c74a15`
- **RGB:** `(199, 74, 21)`
- **Description:** Darker shade of orange for hover states and interactive elements
- **Usage:** Button hovers, link hovers, active states

### 🩵 Light Blue (Secondary Accent)
- **Hex:** `#5EC6E8`
- **RGB:** `(94, 198, 232)`
- **Description:** A bright, clean sky blue that pairs perfectly with orange, white, and black — energetic but not neon.
- **Usage:** Register buttons, save buttons, secondary CTAs

### 🩵 Darker Light Blue (Hover States)
- **Hex:** `#4ab3d5`
- **RGB:** `(74, 179, 213)`
- **Description:** Darker shade of light blue for hover states
- **Usage:** Button hovers for light blue elements

---

## Files Modified

### 1. **src/index.css**
- Updated `--color-red` from `#E10600` to `#E85C20`
- Updated link hover color from `#b50500` to `#c74a15`

### 2. **src/pages/HomePage.module.css**
- Updated `.redText` (Volleyball text) from `#dc2626` to `#E85C20`
- Updated `.registerBtn` background from `#219ebc` to `#5EC6E8`
- Updated `.registerBtn:hover` from `#1a8ca8` to `#4ab3d5`

### 3. **src/components/Bracket.module.css**
- Updated `.resetBtn` background from `#e63946` to `#E85C20`
- Updated `.saveBtn` background from `#219ebc` to `#5EC6E8`
- Updated `.saveBtn:hover` from `#197793` to `#4ab3d5`

### 4. **src/components/AdminRegistrationsPanel.module.css**
- Updated button background from `#219ebc` to `#5EC6E8`
- Updated button:hover from `#197793` to `#4ab3d5`

### 5. **src/components/ScoreSubmissionForm.module.css**
- Updated `.button:hover` from `#b50500` to `#c74a15`

### 6. **src/components/AdminPoolsPanel.module.css**
- Updated `.generator button:hover` from `#b90500` to `#c74a15`
- Updated `.resetButton` from `#e63946` to `#E85C20`
- Updated `.resetButton:hover` from `#c92a35` to `#c74a15`

### 7. **src/components/AdminMatchesPanel.module.css**
- Updated `.deleteButton` from `#e63946` to `#E85C20`
- Updated `.deleteButton:hover` from `#c92a35` to `#c74a15`
- Updated `.addButton:hover` from `#b90500` to `#c74a15`

### 8. **src/pages/TournamentPage.module.css**
- Updated `.divisionLink:hover` from `#b90500` to `#c74a15`

### 9. **src/pages/AdminLogin.module.css**
- Updated `.button:hover` from `#b50500` to `#c74a15`

### 10. **src/pages/AdminPage.module.css**
- Updated `.button:hover` from `#b50500` to `#c74a15`
- Updated `.buttonSmall:hover` from `#b50500` to `#c74a15`

### 11. **src/pages/RegisterPage.module.css**
- Updated `.waiverLink:hover` from `#8b1a1a` to `#c74a15`
- Updated `.button:hover` from `#b90500` to `#c74a15`

### 12. **src/pages/Waiver.module.css**
- Updated `.title` color from `#b22222` to `#E85C20`
- Updated `.content h3` color from `#b22222` to `#E85C20`

### 13. **src/pages/LegalPage.module.css**
- Updated `.content a:hover` from `#b90500` to `#c74a15`
- Updated `.inlineLink:hover` from `#b90500` to `#c74a15`

---

## Color Replacement Summary

### Red → Orange Replacements
| Old Color | New Color | Usage |
|-----------|-----------|-------|
| `#E10600` | `#E85C20` | Primary accent (CSS variable) |
| `#b50500` | `#c74a15` | Darker red hover states |
| `#b90500` | `#c74a15` | Button hover states |
| `#dc2626` | `#E85C20` | "Volleyball" text on homepage |
| `#e63946` | `#E85C20` | Delete/reset buttons |
| `#c92a35` | `#c74a15` | Delete button hover |
| `#b22222` | `#E85C20` | Waiver page headings |
| `#8b1a1a` | `#c74a15` | Waiver link hover |

### Light Blue Replacements
| Old Color | New Color | Usage |
|-----------|-----------|-------|
| `#219ebc` | `#5EC6E8` | Register buttons, save buttons |
| `#197793` | `#4ab3d5` | Light blue hover states |
| `#1a8ca8` | `#4ab3d5` | Register button hover |

---

## Testing Checklist

- [x] Build completed successfully
- [ ] Homepage displays with orange "Volleyball" text
- [ ] Register buttons are light blue
- [ ] All button hover states work correctly
- [ ] Admin panel buttons use new orange color
- [ ] Bracket save buttons are light blue
- [ ] Waiver page headings are orange
- [ ] Legal page links use orange accent
- [ ] All interactive elements respond with correct hover colors

---

## Notes

- All CSS variable references (`var(--color-accent)`) automatically use the new orange color
- The color scheme maintains high contrast for accessibility
- Orange and light blue complement each other well with the existing black and white palette
- Build completed with no errors or warnings (except standard chunk size warning)

---

**Date Updated:** December 2024  
**Updated By:** AI Assistant  
**Build Status:** ✅ Successful