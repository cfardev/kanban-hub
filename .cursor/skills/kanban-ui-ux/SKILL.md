---
name: kanban-ui-ux
description: Expert UI/UX guidance for Kanban boards. Use when designing or implementing kanban boards, columns, cards, drag-and-drop flows, empty states, or workflow UIs. Covers layout, hierarchy, affordances, accessibility, and mobile patterns.
---

# Kanban UI/UX Best Practices

Act as a Kanban UI/UX expert. Apply these practices when designing or implementing board layout, columns, cards, and interactions.

## Terminology (use consistently)

- **Board**: The full canvas (all columns).
- **Column** (or **lane**): Vertical container for a workflow stage (e.g. To Do, In Progress, Done).
- **Card**: Single work item inside a column.
- **Swimlane**: Optional horizontal grouping (e.g. by assignee or epic).

---

## Layout & hierarchy

1. **Columns**
   - Fixed or min-width columns so horizontal scroll is predictable; avoid squashing columns on wide screens.
   - Clear column header: title + optional count. Count helps scan "where work lives."
   - Subtle visual separation between columns (border or background tint), not heavy shadows.

2. **Information hierarchy**
   - Primary: card title (or first line). Secondary: key metadata (assignee, due date, labels) without crowding.
   - One clear primary action per card in the default view (e.g. open); secondary actions in hover/menu.

3. **Density**
   - Offer compact/comfortable density if the board is used for many items; default to comfortable.
   - Avoid more than ~7–9 columns without horizontal scroll or collapsing; cognitive load grows with column count.

---

## Cards

1. **Content**
   - Title is scannable (truncate with ellipsis; full text in detail/drawer).
   - Optional: assignee avatar, due date, priority/label pill. Don’t show more than ~4–5 elements per card.

2. **States**
   - Default, hover (e.g. slight elevation or border), selected/focused (clear ring or background), dragging (opacity + shadow, use DragOverlay for smooth drag).
   - Completed/done cards: optional subtle style change (e.g. muted text or strikethrough), not a full redesign.

3. **Affordances**
   - Entire card is the drag handle, or a visible handle (e.g. grip icon). If only part is draggable, make the handle obvious and use `cursor-grab` / `cursor-grabbing`.
   - Clickable areas must have `cursor-pointer`; non-clickable areas must not.

---

## Drag and drop

1. **Feedback**
   - On drag start: card in DragOverlay, original placeholder (e.g. same height, subtle border) so column doesn’t jump.
   - On hover over column: clear drop target (e.g. background tint, border, or “drop here” hint).
   - On drop: brief success feedback (e.g. animation or toast) and optimistic update.

2. **Accessibility**
   - Keyboard: move card between columns (e.g. arrow keys or dedicated shortcuts); focus management after move.
   - Screen readers: announce column and position (e.g. “Moved to In Progress, position 2”).

---

## Empty states & onboarding

1. **Empty column**
   - Message like “No items” or “Drag cards here” + optional CTA (“Add card”).
   - Don’t leave columns completely blank with no hint.

2. **Empty board**
   - Short explanation of the board + primary action (“Create your first column” or “Add a card”).
   - Optional short tips (e.g. “Drag cards between columns to update status”).

---

## Mobile & responsive

1. **Small screens**
   - Prefer horizontal scroll of columns over stacking columns vertically (keeps mental model of “stages”).
   - Cards: tap to open detail; long-press or explicit “Move” for drag if needed.
   - Sticky column header or board name while scrolling can help orientation.

2. **Touch**
   - Hit targets at least 44px; spacing between cards so drag doesn’t accidentally trigger tap.
   - Consider “move” sheet (pick column) as alternative to drag on touch when columns are narrow.

---

## Performance & perception

1. **Perceived speed**
   - Optimistic updates: update UI on drag-end immediately; reconcile with server in background.
   - Skeleton or placeholder for columns/cards while loading; avoid blank flash.

2. **Real-time**
   - If multiple users: show subtle indicator when another user moves/edits a card (e.g. avatar or “just now”); avoid jarring full-board refresh.

---

## Accessibility checklist

- [ ] Column headers and card titles in a logical heading order (e.g. board title → column headers).
- [ ] All interactive elements focusable and visible focus ring.
- [ ] Drag-and-drop available via keyboard (move between columns, reorder).
- [ ] Color not the only indicator for status/priority (icons or labels as well).
- [ ] Sufficient contrast for text and key UI (WCAG AA minimum).

---

## Anti-patterns to avoid

- **Too much on the card**: Long descriptions, many tags, or multiple actions clutter the board.
- **Hidden drag handle**: If only a small area is draggable, users assume the whole card is; make handle obvious or make the whole card draggable.
- **No drop feedback**: Dropping with no visual change or confirmation feels broken.
- **Endless columns**: Horizontal scroll is fine; 15+ columns without grouping or filters become hard to use.
- **Ignoring empty states**: Empty columns/boards without guidance feel unfinished.

---

## Quick reference: card layout

```
┌─────────────────────────────┐
│ [handle] Title (truncated)  │  ← Primary
│ assignee · due · label      │  ← Secondary, 1 line
└─────────────────────────────┘
```

Column header: `Column name (count)` with optional “Add card” action.
