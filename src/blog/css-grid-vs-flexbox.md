---
title: CSS Grid vs Flexbox
description: When to use CSS Grid and when to stick with Flexbox - a practical comparison with examples.
date: 2023-12-05
tags: [CSS, Layout, Frontend]
---

CSS Grid and Flexbox are powerful layout tools, but knowing when to use each can be confusing. Let's break it down.

## The Simple Rule

- **Grid**: 2D layouts (rows AND columns)
- **Flexbox**: 1D layouts (rows OR columns)

## When to Use Grid

Grid excels at page-level layouts and complex 2D arrangements:

```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
```

## When to Use Flexbox

Flexbox is perfect for components and 1D alignments:

```css
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
```

## Combining Both

In practice, you'll often use both together - Grid for the overall page structure and Flexbox for individual components.
