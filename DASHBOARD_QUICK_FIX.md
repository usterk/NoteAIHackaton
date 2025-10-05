# Dashboard - Szybka naprawa widoczności

## Problem:
Wszystko jest pod tłem (z-index problem) + stare kolory niewidoczne na ciemnym tle

## Rozwiązanie (2 minuty):

### 1. Główny div - już naprawione ✅
```tsx
<div className="flex h-screen relative z-10">
```

### 2. Zamień wszystkie:

**Panele (sidebar, notes list, detail):**
```
bg-white dark:bg-gray-800  →  cyber-panel
```

**Teksty:**
```
text-gray-900 dark:text-white  →  neon-text terminal-text
text-gray-600 dark:text-gray-400  →  neon-text opacity-70
text-gray-500 dark:text-gray-400  →  neon-text-green
```

**Przyciski:**
```
bg-blue-600 hover:bg-blue-700 text-white  →  neon-glow-btn
bg-red-600 hover:bg-red-700 text-white  →  neon-glow-btn-magenta
bg-yellow-600  →  neon-glow-btn-green
```

**Inputy:**
```
border rounded-lg dark:bg-gray-700 dark:text-white  →  cyber-input
```

**Bordery:**
```
border-gray-200 dark:border-gray-700  →  border-cyan-900
```

## Najważniejsze (absolutne minimum):

1. Główny container: `relative z-10` ✅ DONE
2. Wszystkie 3 główne panele: dodaj `cyber-panel`
3. Wszystkie teksty: dodaj `neon-text`

To wystarczy żeby było widoczne!
