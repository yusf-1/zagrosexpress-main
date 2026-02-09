

# Amazon-Style Product Cards for Wholesale Products

## Overview
This plan will redesign the wholesale product cards to follow Amazon's proven e-commerce layout pattern, making products easier to browse and compare.

## Visual Comparison

**Current Layout:**
- Images displayed in a grid with text overlay on top of images
- Name, price, and date shown on dark gradient at bottom of image
- All information compressed into image area

**New Amazon-Style Layout:**
- Clean white product cards with clear separation
- Large product image on top (single main image)
- Product information below the image on white background
- Clear price hierarchy with USD prominent, RMB secondary
- Date shown subtly at bottom

## Design Changes

### Product Card Structure
```text
+---------------------------+
|                           |
|      [Product Image]      |
|      (square, centered)   |
|                           |
+---------------------------+
|  Product Name             |
|  (2 lines max, truncated) |
|                           |
|  $12.50  (large, bold)    |
|  ¥87.50  (small, muted)   |
|                           |
|  Added: 05/02/2026        |
|  [Ask for Price] button   |
+---------------------------+
```

### Key Visual Elements

1. **Product Image Area**
   - White/light background
   - Square aspect ratio
   - Single featured image (first image from gallery)
   - Clean padding around image
   - Hover effect for interactivity

2. **Product Information Section**
   - Clean white background
   - Clear text hierarchy
   - Product name: 2-line clamp, dark text
   - USD price: Large, bold, prominent
   - RMB price: Smaller, muted color
   - Upload date: Small text with calendar icon

3. **Grid Layout**
   - 2 columns on mobile
   - Products side by side like Amazon mobile app
   - Consistent card heights
   - Small gap between cards

---

## Technical Details

### File Changes

**`src/pages/WholesaleWithPrice.tsx`**

1. Change product grid from vertical stack (`space-y-4`) to 2-column grid (`grid grid-cols-2 gap-3`)

2. Redesign product card structure:
   - Remove dark gradient overlay
   - Move all product info to CardContent below image
   - Display only the first/main image instead of image gallery
   - Add proper text truncation (2 lines for name)

3. Price display changes:
   - USD price: Large and bold (`text-lg font-bold`)
   - RMB price: Smaller and muted (`text-sm text-muted-foreground`)

4. Date display:
   - Small text at bottom
   - Calendar icon with subtle styling

5. "Ask for Price" button:
   - Moves to card content area
   - Full-width button style for products without price

### CSS Utilities
- Use `line-clamp-2` for product name (limit to 2 lines)
- Clean card shadows and hover states using existing design system
- Consistent padding and spacing

### Layout Adjustments
- Container max-width increased for better 2-column display
- Responsive adjustments for different screen sizes

