# Carte de Vivabilité 🗺️

**Trouvez votre lieu de vie idéal en France**

Une application web interactive permettant d'explorer et de comparer la vivabilité des communes françaises selon des critères personnalisés : proximité à la mer et aux montagnes, qualité de l'air, accès aux soins, transports, emploi, et bien plus encore.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Développement](#-développement)
- [Structure du projet](#-structure-du-projet)
- [API Documentation](#-api-documentation)
- [Tests](#-tests)
- [Contribution](#-contribution)
- [Licence](#-licence)

## ✨ Fonctionnalités

### Carte Interactive
- Visualisation de la France avec toutes les communes
- Code couleur selon le score de vivabilité
- Zoom et navigation fluides
- Sélection et détail des communes

### Filtres Personnalisables
- **10 critères de vivabilité** avec pondération ajustable :
  - 🌊 Proximité à la mer
  - ⛰️ Proximité aux montagnes
  - 💨 Qualité de l'air
  - 🏘️ Densité de population
  - 🏥 Accès aux soins
  - 🚆 Transports en commun
  - 💰 Coût de la vie
  - ☀️ Climat
  - 💼 Marché de l'emploi
  - 🎓 Éducation

### Interface Utilisateur
- Design sombre moderne inspiré de la cartographie
- Responsive (desktop, tablette, mobile)
- Animations fluides
- Persistance des préférences

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │
│    (Next.js)    │◀────│    (FastAPI)    │
└─────────────────┘     └─────────────────┘
        │                       │
        │                       ▼
        │               ┌─────────────────┐
        │               │   PostgreSQL    │
        │               │   (à venir)     │
        │               └─────────────────┘
        │
        ▼
┌─────────────────┐
│  Leaflet Map    │
│  (OpenStreetMap)│
└─────────────────┘
```

### Stack Technique

**Frontend**
- [Next.js 14](https://nextjs.org/) - Framework React avec App Router
- [TypeScript](https://www.typescriptlang.org/) - Typage statique
- [Tailwind CSS](https://tailwindcss.com/) - Styling utility-first
- [Leaflet](https://leafletjs.com/) / [React-Leaflet](https://react-leaflet.js.org/) - Cartographie
- [Zustand](https://zustand-demo.pmnd.rs/) - État global
- [TanStack Query](https://tanstack.com/query) - Gestion des données serveur
- [Zod](https://zod.dev/) - Validation des schémas

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) - API async haute performance
- [Pydantic v2](https://docs.pydantic.dev/) - Validation des données
- [SQLAlchemy 2.0](https://www.sqlalchemy.org/) - ORM async (préparé)
- [Uvicorn](https://www.uvicorn.org/) - Serveur ASGI

## 📦 Prérequis

- **Node.js** >= 18.0
- **Python** >= 3.11
- **npm** ou **pnpm**
- **Docker** (optionnel, recommandé)

## 🚀 Installation

### Option 1 : Développement local

#### Backend

```bash
# Créer l'environnement virtuel
cd backend
python -m venv .venv
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate   # Windows

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
uvicorn app.main:app --reload --port 8000
```

Le backend est accessible sur http://localhost:8000

#### Frontend

```bash
# Installer les dépendances
cd frontend
npm install

# Lancer le serveur de développement
npm run dev
```

Le frontend est accessible sur http://localhost:3000

### Option 2 : Docker Compose

```bash
# Lancer tous les services
docker-compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/api/v1/docs
```

## 🛠️ Développement

### Scripts Frontend

```bash
npm run dev          # Serveur de développement
npm run build        # Build de production
npm run start        # Serveur de production
npm run lint         # Linter ESLint
npm run lint:fix     # Corriger les erreurs lint
npm run format       # Formater avec Prettier
npm run type-check   # Vérification TypeScript
```

### Scripts Backend

```bash
# Linting et formatage
ruff check app/           # Linter
ruff check app/ --fix     # Corriger automatiquement
ruff format app/          # Formater

# Type checking
mypy app/

# Tests
pytest                    # Tous les tests
pytest -v                 # Mode verbose
pytest --cov=app          # Avec couverture
```

### Pre-commit Hooks

```bash
# Installation
pip install pre-commit
pre-commit install

# Exécution manuelle
pre-commit run --all-files
```

## 📁 Structure du projet

```
carto_vivabilite/
├── frontend/                   # Application Next.js
│   ├── src/
│   │   ├── app/               # Pages et layouts (App Router)
│   │   ├── components/        # Composants React
│   │   │   ├── ui/           # Composants UI de base
│   │   │   ├── map/          # Composants cartographiques
│   │   │   ├── filters/      # Panneaux de filtres
│   │   │   └── layout/       # Header, Footer, etc.
│   │   ├── hooks/            # Hooks React personnalisés
│   │   ├── lib/              # Utilitaires et client API
│   │   ├── stores/           # État Zustand
│   │   └── types/            # Types TypeScript
│   ├── public/               # Fichiers statiques
│   └── package.json
│
├── backend/                   # API FastAPI
│   ├── app/
│   │   ├── api/              # Routes API
│   │   │   └── v1/          # Version 1
│   │   │       └── endpoints/
│   │   ├── core/            # Configuration
│   │   ├── db/              # Base de données (placeholder)
│   │   ├── models/          # Schémas Pydantic
│   │   ├── services/        # Logique métier
│   │   └── main.py          # Point d'entrée
│   ├── tests/               # Tests pytest
│   └── requirements.txt
│
├── docker-compose.yml        # Configuration Docker
└── README.md
```

## 📚 API Documentation

Une fois le backend lancé, la documentation interactive est disponible :

- **Swagger UI** : http://localhost:8000/api/v1/docs
- **ReDoc** : http://localhost:8000/api/v1/redoc
- **OpenAPI JSON** : http://localhost:8000/api/v1/openapi.json

### Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/communes` | Liste paginée des communes |
| GET | `/api/v1/communes/{code_insee}` | Détail d'une commune |
| POST | `/api/v1/communes/search` | Recherche avec filtres |
| GET | `/api/v1/geojson/communes` | Données GeoJSON |
| GET | `/api/v1/filters/options` | Options de filtrage |
| GET | `/api/v1/health` | État de l'API |

### Exemple de requête

```bash
# Recherche de communes avec pondération personnalisée
curl -X POST http://localhost:8000/api/v1/communes/search \
  -H "Content-Type: application/json" \
  -d '{
    "weights": {
      "proximite_mer": 80,
      "proximite_montagnes": 20,
      "climat": 70,
      "acces_soins": 60
    },
    "min_score": 50,
    "limit": 10
  }'
```

## 🧪 Tests

### Frontend

```bash
cd frontend
npm run type-check    # Vérification des types
npm run lint          # Linting
```

### Backend

```bash
cd backend
source .venv/bin/activate

# Exécuter tous les tests
pytest

# Avec couverture
pytest --cov=app --cov-report=html

# Tests spécifiques
pytest tests/test_health.py -v
pytest tests/test_communes.py -v
```

## 🤝 Contribution

1. **Fork** le projet
2. Créer une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Installer les hooks pre-commit (`pre-commit install`)
4. Commiter les changements (`git commit -m 'feat: ajoute ma fonctionnalité'`)
5. Pousser la branche (`git push origin feature/ma-fonctionnalite`)
6. Ouvrir une **Pull Request**

### Convention de commits

Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `style:` formatage (pas de changement de code)
- `refactor:` refactoring
- `test:` ajout de tests
- `chore:` maintenance

## 🔮 Roadmap

- [ ] Intégration base de données PostgreSQL avec PostGIS
- [ ] Données réelles des ~35 000 communes françaises
- [ ] Cache Redis pour les scores calculés
- [ ] Export des résultats (PDF, CSV)
- [ ] Comparaison de communes
- [ ] Authentification utilisateur
- [ ] Sauvegarde des recherches favorites
- [ ] Mode hors-ligne (PWA)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

Développé avec ❤️ pour aider les Français à trouver leur lieu de vie idéal.
