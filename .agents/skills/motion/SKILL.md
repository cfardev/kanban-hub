---
name: motion
description: Guide for building animations with Motion (motion/react) in React/Next.js. Use when adding enter/exit animations, layout animations, gesture animations (hover, tap, in-view), variants, AnimatePresence, or scroll-linked effects. Covers motion component, transitions, keyframes, layout, and useAnimate.
---

# Motion for React

Reference: [Motion for React](https://motion.dev/docs/react), [React animation](https://motion.dev/docs/react-animation), [AnimatePresence](https://motion.dev/docs/react-animate-presence), [Layout animation](https://motion.dev/docs/react-layout-animations).

## Install and import

```bash
pnpm add motion
```

```tsx
import { motion, AnimatePresence } from "motion/react"
```

Every HTML/SVG element has a `motion` counterpart: `motion.div`, `motion.button`, `motion.span`, `motion.circle`, etc.

## Core animation props

- **`animate`**: Target values. When they change, the element animates.
- **`initial`**: Starting values (enter animation). Use `initial={false}` to skip enter animation.
- **`exit`**: Values when leaving the DOM (requires `AnimatePresence` wrapper).
- **`transition`**: `{ duration, ease, type: "spring", stiffness, damping }` etc. Can be set per-prop inside `animate` or globally via `MotionConfig`.

```tsx
<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
<motion.button animate={{ x: 100 }} transition={{ duration: 0.5, ease: "easeOut" }} />
```

## Transforms (shorthand)

Use shorthand instead of raw `transform` when possible (independent axes, good defaults):

- Translate: `x`, `y`, `z`
- Scale: `scale`, `scaleX`, `scaleY`
- Rotate: `rotate`, `rotateX`, `rotateY`, `rotateZ`
- Skew: `skewX`, `skewY`
- Origin: `originX`, `originY`, `originZ` (0–1 or px)

SVG attributes like `x`/`y` on `<circle>` use `attrX`/`attrY`.

```tsx
<motion.div animate={{ x: 100, scale: 1.1, rotate: 5 }} />
```

## Animatable values

- Any CSS value: `opacity`, `filter`, `backgroundColor`, etc.
- Colors: hex, rgba, hsla (interpolated between each other).
- `width`/`height` can animate to/from `"auto"`. If also toggling `display: none`, use `visibility: "hidden"` instead so the element can be measured.
- CSS variables: animate `'--name': 'value'` or use as target `backgroundColor: "var(--action-bg)"`. Animating CSS vars triggers paint; for many children consider MotionValue.

## Enter and exit

- **Enter**: On mount, element animates from `initial` (or DOM/CSS) to `animate`. Disable with `initial={false}`.
- **Exit**: Wrap in `AnimatePresence` and set `exit` on the child. Conditional must be *inside* `AnimatePresence`, not wrapping it.

```tsx
<AnimatePresence>
  {show && (
    <motion.div
      key="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

- Direct children of `AnimatePresence` must have a **stable unique `key`** (e.g. `item.id`, not `index`).
- **Modes**: `mode="sync"` (default), `mode="wait"` (enter after exit), `mode="popLayout"` (exit pops out of layout; use with `layout`). For `popLayout`, parent often needs `style={{ position: "relative" }}`; custom component children must `forwardRef` to the DOM node.
- **Hooks**: `useIsPresent()`, `usePresenceData()` (data from `AnimatePresence` `custom`), `usePresence()` for manual `safeToRemove`.

## Keyframes

Pass arrays to any animation prop to sequence values. Use `null` as “current value” (wildcard) for smoother interruption.

```tsx
<motion.div animate={{ x: [0, 100, 0] }} />
<motion.div animate={{ x: [null, 100, 0] }} />
```

Keyframe timing via `transition.times` (0–1 progress per keyframe):

```tsx
<motion.div
  animate={{ opacity: [0, 1, 0] }}
  transition={{ duration: 2, times: [0, 0.2, 1] }}
/>
```

## Gestures

- **`whileHover`**, **`whileTap`**, **`whileFocus`**, **`whileDrag`**, **`whileInView`**: Object of values to animate to while the gesture is active; on end, animates back to `animate`/`initial`.

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.98 }}
  whileInView={{ opacity: 1 }}
/>
```

`whileInView` can take options: `{ amount: 0.5 }`, `once: true`, etc.

## Variants

Named targets for reuse and tree orchestration. Pass `variants` and use labels in `initial`, `animate`, `exit`, and gesture props.

```tsx
const variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
}
<motion.div variants={variants} initial="hidden" animate="visible" exit="hidden" />
```

- **Propagation**: Variants flow down; when parent gets e.g. `animate="visible"`, children with matching variant names animate too.
- **Orchestration**: In a variant, use `transition: { when: "beforeChildren" | "afterChildren", delayChildren, staggerChildren }`. Import `stagger` from `motion/react` for stagger values.

```tsx
const list = {
  visible: {
    opacity: 1,
    transition: { when: "beforeChildren", delayChildren: 0.1, staggerChildren: 0.05 },
  },
  hidden: { opacity: 0, transition: { when: "afterChildren" } },
}
```

- **Dynamic variants**: Variant value can be a function; it receives `custom` and returns the target object. Use `custom={index}` (or similar) on the motion component.

```tsx
const variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({ opacity: 1, transition: { delay: i * 0.1 } }),
}
items.map((item, i) => <motion.div key={item.id} custom={i} variants={variants} initial="hidden" animate="visible" />)
```

## Layout animation

- **`layout`**: Animates size/position when layout changes (via React re-render). Drive layout with `style` or `className`, not `animate`/`whileHover` for the changing layout.

```tsx
<motion.div layout style={{ height: isOpen ? "auto" : 0 }} />
```

- **`layoutId`**: Shared element transition. When another element with the same `layoutId` mounts, it animates from the first. Use with `AnimatePresence` to animate back to origin on close.

```tsx
<>
  <motion.button layoutId="modal" onClick={() => setOpen(true)}>Open</motion.button>
  <AnimatePresence>
    {open && <motion.dialog layoutId="modal" onClose={() => setOpen(false)} />}
  </AnimatePresence>
</>
```

- **Scroll/fixed**: Scrollable container needs `layoutScroll`; fixed container needs `layoutRoot` so Motion accounts for scroll.
- **LayoutGroup**: Wrap siblings that affect each other’s layout so they all re-run layout animation when one changes.
- **Distortion**: Layout uses transform/scale. Give children `layout` for scale correction; set `borderRadius`/`boxShadow` via `style` so Motion can correct. For aspect-ratio changes, try `layout="position"`. Avoid `border` on layout-animating element (use wrapper with padding as “border”).

## Imperative and values

- **`useAnimate()`**: Returns `[scopeRef, animate]`. Use `animate(scopeRef.current, { x: 100 })` or selectors + keyframes for sequences. Good for non-motion elements and full control (play, pause, speed).
- **MotionValue + content**: Pass a `MotionValue` as child of a motion component to render its current value (e.g. animated counter). Use `animate(motionValue, target, options)` for imperative number animation. Prefer this over React state for smooth ticking when possible.

## Scroll

- **Scroll-triggered**: `whileInView={{ ... }}` for animate when in viewport.
- **Scroll-linked**: `useScroll()` returns e.g. `scrollYProgress` (0–1). Pass to `style` or `useTransform` for parallax/progress effects.

```tsx
const { scrollYProgress } = useScroll()
<motion.div style={{ scaleX: scrollYProgress }} />
```

## Best practices

- Prefer `motion` + `animate`/`initial`/`exit` and gestures for declarative UI; use `useAnimate` or MotionValues when you need sequences or scroll-linked behavior.
- For exit animations, conditional must be inside `<AnimatePresence>{condition && <motion.div exit={...} />}</AnimatePresence>`.
- Use stable keys (id, not index) for list items in AnimatePresence.
- Layout changes: drive with `style`/`className`; use `layout` or `layoutId`; in scroll/fixed containers add `layoutScroll`/`layoutRoot` as needed.
