# 🚀 Szybki Start - Secure Notes App

## Opcja 1: Docker (ZALECANE)

Najprostszy sposób uruchomienia aplikacji:

```bash
# Uruchom skrypt startowy
./start.sh

# LUB ręcznie:
docker-compose up --build
```

Aplikacja będzie dostępna pod adresem: **http://localhost:3000**

## Opcja 2: Lokalne uruchomienie

Jeśli nie chcesz używać Dockera:

```bash
# 1. Zainstaluj zależności
npm install

# 2. Wygeneruj Prisma Client
npx prisma generate

# 3. Uruchom migracje bazy danych
npx prisma migrate deploy

# 4. Uruchom serwer
npm run dev
```

Aplikacja będzie dostępna pod adresem: **http://localhost:3000**

## Pierwsze kroki

1. **Otwórz przeglądarkę** i przejdź do http://localhost:3000
2. **Zarejestruj się** - wybierz zakładkę "Rejestracja"
3. **Zaloguj się** używając utworzonego konta
4. **Utwórz pierwszą notatkę** - kliknij "+ Nowa notatka"
5. **Eksperymentuj**:
   - Twórz foldery (np. "Praca", "Osobiste")
   - Dodawaj tagi (np. "Pilne", "TODO")
   - Archiwizuj stare notatki
   - Wszystko jest szyfrowane! 🔒

## Zmienne środowiskowe

Domyślne wartości w `.env`:

```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
ENCRYPTION_KEY="your-32-character-encryption-key-change-in-production"
```

⚠️ **WAŻNE**: Przed wdrożeniem na produkcję zmień `JWT_SECRET` i `ENCRYPTION_KEY`!

## Zatrzymanie aplikacji

### Docker:
```bash
# Ctrl+C w terminalu, lub:
docker-compose down
```

### Lokalne:
```bash
# Ctrl+C w terminalu
```

## Rozwiązywanie problemów

### Port 3000 jest zajęty
Zmień port w `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Zmień 3001 na dowolny wolny port
```

### Błąd bazy danych
```bash
# Usuń bazę i stwórz od nowa
rm -rf prisma/dev.db data/
npx prisma migrate deploy
```

### Docker nie działa
- Sprawdź czy Docker Desktop jest uruchomiony
- Uruchom `docker --version` aby sprawdzić instalację

## Więcej informacji

Zobacz pełną dokumentację w [README.md](./README.md)
