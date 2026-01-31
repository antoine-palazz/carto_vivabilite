# Carte de Vivabilité - Backend API

API FastAPI pour la recherche et l'analyse de la vivabilité des communes françaises.

## 🚀 Démarrage rapide

```bash
# Créer l'environnement virtuel
python -m venv .venv
source .venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Lancer le serveur
uvicorn app.main:app --reload --port 8000
```

Documentation API : [http://localhost:8000/api/v1/docs](http://localhost:8000/api/v1/docs)

## 📦 Dépendances

### Production

- **FastAPI** - Framework web async
- **Pydantic v2** - Validation et sérialisation
- **Uvicorn** - Serveur ASGI

### Développement

- **pytest** - Tests
- **ruff** - Linting & formatting
- **mypy** - Type checking

## 🏗️ Architecture

```
app/
├── api/                 # Routes API
│   └── v1/
│       ├── router.py   # Routeur principal
│       └── endpoints/  # Endpoints par domaine
│           ├── communes.py
│           ├── filters.py
│           ├── geojson.py
│           └── health.py
│
├── core/               # Configuration
│   └── config.py      # Settings Pydantic
│
├── db/                 # Base de données (placeholder)
│   └── __init__.py
│
├── models/             # Schémas Pydantic
│   ├── commune.py     # Modèles commune
│   ├── filters.py     # Modèles filtres
│   ├── geojson.py     # Modèles GeoJSON
│   ├── requests.py    # Requêtes API
│   └── responses.py   # Réponses API
│
├── services/           # Logique métier
│   ├── commune_service.py
│   ├── filter_service.py
│   ├── geojson_service.py
│   └── scoring_service.py
│
└── main.py            # Point d'entrée
```

## 📚 API Endpoints

### Santé

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/health` | État de l'API |

### Communes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/communes` | Liste paginée |
| GET | `/api/v1/communes/{code_insee}` | Détail |
| POST | `/api/v1/communes/search` | Recherche |

### GeoJSON

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/geojson/communes` | Toutes les communes |
| POST | `/api/v1/geojson/communes/search` | Communes filtrées |

### Filtres

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/v1/filters/options` | Options disponibles |

## 🔧 Configuration

### Variables d'environnement

```env
# Serveur
DEBUG=true
HOST=0.0.0.0
PORT=8000

# CORS
CORS_ORIGINS=http://localhost:3000

# Base de données (à venir)
# DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/db

# Cache (à venir)
# REDIS_URL=redis://localhost:6379/0
```

## 🧪 Tests

```bash
# Tous les tests
pytest

# Avec couverture
pytest --cov=app

# Tests spécifiques
pytest tests/test_health.py -v
```

## 🔍 Linting & Formatting

```bash
# Vérifier
ruff check app/
mypy app/

# Corriger
ruff check app/ --fix
ruff format app/
```

## 📊 Données Placeholder

Le backend utilise actuellement des données de démonstration avec 12 grandes villes françaises. Les scores sont générés de manière cohérente pour illustrer le fonctionnement.

### Intégration future

Pour intégrer vos données réelles :

1. Configurer la base de données PostgreSQL avec PostGIS
2. Créer les modèles SQLAlchemy dans `app/db/models/`
3. Implémenter les repositories dans `app/db/repositories/`
4. Mettre à jour les services pour utiliser les repositories
5. Ajouter les migrations Alembic

### Sources de données suggérées

- **INSEE** : Données démographiques des communes
- **IGN** : Géométries administratives
- **data.gouv.fr** : Données ouvertes (santé, transports, etc.)
- **Atmo France** : Qualité de l'air
