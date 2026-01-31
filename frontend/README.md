# Carte de Vivabilité - Frontend

Application web Next.js pour visualiser la vivabilité des communes françaises.

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

## 📦 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement avec hot-reload |
| `npm run build` | Build de production optimisé |
| `npm run start` | Serveur de production |
| `npm run lint` | Vérification ESLint |
| `npm run lint:fix` | Correction automatique ESLint |
| `npm run format` | Formatage Prettier |
| `npm run format:check` | Vérification Prettier |
| `npm run type-check` | Vérification TypeScript |

## 🏗️ Architecture

```
src/
├── app/                  # Next.js App Router
│   ├── layout.tsx       # Layout racine
│   ├── page.tsx         # Page principale
│   ├── providers.tsx    # Providers React Query
│   └── globals.css      # Styles globaux
│
├── components/          # Composants React
│   ├── ui/             # Composants UI réutilisables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Slider.tsx
│   │   ├── Toggle.tsx
│   │   └── ScoreBadge.tsx
│   │
│   ├── map/            # Composants de carte
│   │   ├── MapContainer.tsx
│   │   ├── ScoreCard.tsx
│   │   └── Legend.tsx
│   │
│   ├── filters/        # Filtres et contrôles
│   │   ├── FilterPanel.tsx
│   │   └── MobileFilterSheet.tsx
│   │
│   └── layout/         # Composants de mise en page
│       └── Header.tsx
│
├── hooks/              # Hooks React personnalisés
│   └── useCommunes.ts  # Hooks TanStack Query
│
├── lib/                # Utilitaires
│   ├── api.ts         # Client API
│   └── utils.ts       # Fonctions utilitaires
│
├── stores/            # État global Zustand
│   ├── filterStore.ts
│   └── mapStore.ts
│
└── types/             # Types TypeScript
    ├── commune.ts
    ├── filters.ts
    └── api.ts
```

## 🎨 Design System

### Couleurs

Le thème est basé sur une palette sombre cartographique :

- **Background** : Dégradés de bleu nuit (#0a0f1a → #1a2332)
- **Accent** : Bleu primaire (#3b82f6)
- **Scores** : Gradient rouge → vert pour la vivabilité

### Composants

Les composants UI sont dans `src/components/ui/` et suivent ces principes :

- Accessibles (ARIA)
- Responsives
- Thème cohérent
- Animations fluides

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env.local` :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### ESLint & Prettier

Configuration stricte avec :
- TypeScript strict
- React Hooks rules
- Tailwind CSS ordering
- Import sorting

## 📱 Responsive Design

- **Desktop** (>= 1024px) : Sidebar fixe + carte
- **Tablette** (768-1023px) : Sidebar réduite
- **Mobile** (< 768px) : Bottom sheet pour filtres

## 🗺️ Cartographie

La carte utilise Leaflet avec :
- Tuiles CartoDB dark
- GeoJSON pour les communes
- Tooltips informatifs
- Zoom contrôlé sur la France
