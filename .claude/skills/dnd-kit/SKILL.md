---
name: dnd-kit
description: Guide for building drag-and-drop and sortable UIs with @dnd-kit in React/Next.js. Use when implementing draggable items, droppable zones, kanban columns, sortable lists, or reorderable content. Covers DndContext, useDraggable, useDroppable, DragOverlay, and @dnd-kit/sortable.
---

# @dnd-kit

Reference: [Getting started](https://docs.dndkit.com/introduction/getting-started), [DragOverlay](https://docs.dndkit.com/api-documentation/draggable/drag-overlay), [Sortable preset](https://docs.dndkit.com/presets/sortable).

## Packages

- `@dnd-kit/core` – DndContext, useDraggable, useDroppable, DragOverlay, sensors, collision detection
- `@dnd-kit/utilities` – `CSS.Translate.toString(transform)` for draggable style
- `@dnd-kit/sortable` – SortableContext, useSortable, arrayMove, strategies (install when building sortable lists/kanban)

Install sortable preset when needed: `pnpm add @dnd-kit/sortable`

## Core setup

Wrap draggable/droppable tree in `DndContext`. Handle reordering or moving in `onDragEnd`.

```tsx
import { DndContext } from "@dnd-kit/core";

<DndContext onDragEnd={handleDragEnd}>
  {/* draggables and droppables */}
</DndContext>
```

### useDroppable

Attach ref and unique `id`. Use `isOver` for hover styling.

```tsx
import { useDroppable } from "@dnd-kit/core";

function Droppable({ id, children }: { id: string; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={isOver ? "ring-2 ring-primary" : ""}>
      {children}
    </div>
  );
}
```

### useDraggable

Attach ref, `...listeners`, `...attributes`, and `transform`-based style. Use `CSS.Translate.toString(transform)` from `@dnd-kit/utilities` for the style. Prefer `transform` over position; consider higher `z-index` while dragging.

```tsx
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function Draggable({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 1 }
    : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
}
```

### onDragEnd: move between containers

`event` has `active` (what was dragged) and `over` (drop target or null). Use them to update state (e.g. which container owns the item).

```tsx
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (over) {
    // e.g. setParent(over.id) or moveItem(active.id, over.id)
  }
}
```

## DragOverlay

Use when items move between containers, lists are scrollable, or you want a floating drag preview and drop animation. Renders outside normal flow (viewport-relative).

- Keep `<DragOverlay>` always mounted; conditionally render its **children** so drop animation works.
- Do **not** put components that use `useDraggable` inside DragOverlay. Use a presentational copy (same look, no hook).
- Optional: `dropAnimation={{ duration: 250, easing: "ease" }}` or `dropAnimation={null}` to disable.

```tsx
import { DndContext, DragOverlay } from "@dnd-kit/core";

const [activeId, setActiveId] = useState<string | null>(null);

<DndContext onDragStart={(e) => setActiveId(e.active.id as string)} onDragEnd={handleDragEnd}>
  {/* ... draggables ... */}
  <DragOverlay>
    {activeId ? <ItemPresentation id={activeId} /> : null}
  </DragOverlay>
</DndContext>;

function handleDragEnd() {
  setActiveId(null);
}
```

Presentational component: same UI as the draggable item but no `useDraggable`. Use wrapper nodes or ref-forwarding so one presentational component is used both in the list and in DragOverlay.

## Sortable preset (lists / kanban)

Use for reorderable lists or multiple sortable columns (e.g. kanban). Install: `@dnd-kit/sortable`.

### Structure

- One `DndContext` (sensors, collision, onDragEnd).
- Per list/column: one `SortableContext` with `items` (array of sortable ids in order) and `strategy`.
- Each list item uses `useSortable` (id, ref, attributes, listeners, transform, transition).

### Minimal vertical list

```tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
);

<DndContext
  sensors={sensors}
  collisionDetection={closestCenter}
  onDragEnd={handleDragEnd}
>
  <SortableContext items={items} strategy={verticalListSortingStrategy}>
    {items.map((id) => (
      <SortableItem key={id} id={id} />
    ))}
  </SortableContext>
</DndContext>;

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event;
  if (over && active.id !== over.id) {
    setItems((items) => {
      const oldIndex = items.indexOf(active.id);
      const newIndex = items.indexOf(over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }
}
```

### useSortable item

Apply `transform` and `transition` from the hook; use `CSS.Transform.toString(transform)`.

```tsx
function SortableItem({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {/* content */}
    </div>
  );
}
```

### Strategies

- `verticalListSortingStrategy` – vertical lists, supports virtualization
- `horizontalListSortingStrategy` – horizontal lists
- `rectSortingStrategy` – default, grids; no virtualized lists
- `rectSwappingStrategy` – swap two items

### Multiple containers (e.g. kanban)

- One `DndContext` for the whole board.
- One `SortableContext` per column; `items` = ids in that column.
- Optional: wrap each column in a droppable zone so you can drop into empty columns.
- In `onDragEnd` (and optionally `onDragOver`): detect which container is `over`, then update which column owns the item and reorder within/among columns (e.g. with `arrayMove` per column).

### Sortable + DragOverlay

Use a presentational item in `<DragOverlay>` (no `useSortable`/`useDraggable` inside). Track `activeId` in `onDragStart`, clear in `onDragEnd`. Recommended for scrollable or long lists.

## Sensors

Default: pointer + keyboard. Customize activation to avoid accidental drags (e.g. 10px movement or 250ms delay on touch):

```tsx
useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
);
```

## Collision detection

- `closestCenter` – good for sortable lists
- `closestCorners` – alternative for sortable
- Default rectangle intersection – stricter, often less forgiving for lists

Pass to `DndContext`: `collisionDetection={closestCenter}`.

## Conventions in this project

- Use TypeScript: type `DragEndEvent`, `DragStartEvent` from `@dnd-kit/core`.
- Prefer `transform` (and `CSS.Translate` / `CSS.Transform`) over top/left for movement.
- Keep DragOverlay mounted; toggle only its children.
- For sortable lists: use `@dnd-kit/sortable` with `SortableContext` + `useSortable` and `arrayMove` in `onDragEnd`.
- Sync order/ownership with Convex in `onDragEnd` (e.g. call a mutation to update board/column order).
