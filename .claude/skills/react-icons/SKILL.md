---
name: react-icons
description: Use react-icons to add SVG icons in React/Next.js. Use when adding icons, choosing icon sets, or importing from react-icons (Fa*, Hi*, Lu*, Md*, etc.). Covers installation, import paths, and set prefixes.
---

# React Icons

Include popular icon sets in React via ES imports; only the icons you use are bundled.

## Installation

```bash
pnpm add react-icons
```

## Import pattern

Import from `react-icons/{set}`. Icon names are PascalCase.

```tsx
import { FaBeer } from "react-icons/fa";
import { HiOutlineUser } from "react-icons/hi2";
import { LuChevronRight } from "react-icons/lu";

export function Example() {
  return (
    <>
      <FaBeer />
      <HiOutlineUser className="size-5" />
      <LuChevronRight aria-hidden />
    </>
  );
}
```

## Icon set prefixes (import path)

| Set | Path | Example |
|-----|------|--------|
| Font Awesome 5 | `react-icons/fa` | FaBeer, FaUser |
| Font Awesome 6 | `react-icons/fa6` | Fa6Beer |
| Heroicons | `react-icons/hi` | HiUser |
| Heroicons 2 | `react-icons/hi2` | HiOutlineUser, HiSolidUser |
| Lucide | `react-icons/lu` | LuChevronRight, LuHome |
| Material Design | `react-icons/md` | MdSettings |
| Bootstrap | `react-icons/bs` | BsHouse |
| Radix | `react-icons/rx` | RxAvatar |
| Phosphor | `react-icons/pi` | PiCaretRight |
| Remix Icon | `react-icons/ri` | RiAddLine |
| Tabler | `react-icons/tb` | TbUser |
| Feather | `react-icons/fi` | FiUser |
| Simple Icons (brands) | `react-icons/si` | SiGithub, SiVercel |

## Usage in this project

- **Next.js / React**: Use as components; they render inline SVG.
- **Styling**: Pass `className` (e.g. Tailwind `size-5`, `text-muted-foreground`) or `style`. Default size is 1em.
- **A11y**: For decorative icons, add `aria-hidden="true"`. For meaningful icons, pair with visible text or use `aria-label` on a wrapper.

## Finding icon names

- Browse by set: https://react-icons.github.io/react-icons/icons/ (e.g. `/icons/fa/`, `/icons/lu/`).
- Naming: set prefix + PascalCase (e.g. `Fa` + `Beer` → `FaBeer`, `Lu` + `ChevronRight` → `LuChevronRight`).

## Large projects (optional)

For very large apps (e.g. Gatsby) where install time matters:

```bash
pnpm add @react-icons/all-files
```

```tsx
import { FaBeer } from "@react-icons/all-files/fa/FaBeer";
```

Prefer the default `react-icons` package unless bundle/install size is an issue.
