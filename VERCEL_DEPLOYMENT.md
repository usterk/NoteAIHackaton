# 🚀 Wdrożenie na Vercel

Ten przewodnik pomoże Ci wdrożyć aplikację Secure Notes na Vercel z bazą danych PostgreSQL.

## Wymagania wstępne

- Konto na [Vercel](https://vercel.com)
- Konto na [Vercel Postgres](https://vercel.com/storage/postgres) LUB zewnętrzna baza PostgreSQL (np. [Neon](https://neon.tech), [Supabase](https://supabase.com))
- Repozytorium GitHub z kodem

## Krok 1: Przygotowanie bazy danych

### Opcja A: Vercel Postgres (Zalecane)

1. Zaloguj się na [Vercel Dashboard](https://vercel.com/dashboard)
2. Przejdź do **Storage** → **Create Database**
3. Wybierz **Postgres**
4. Nazwij bazę (np. `secure-notes-db`)
5. Wybierz region (najlepiej blisko użytkowników)
6. Kliknij **Create**

### Opcja B: Neon (Darmowa alternatywa)

1. Załóż konto na [Neon.tech](https://neon.tech)
2. Utwórz nowy projekt
3. Skopiuj connection string (będzie wyglądał jak: `postgresql://user:pass@host/dbname`)

### Opcja C: Supabase

1. Załóż konto na [Supabase.com](https://supabase.com)
2. Utwórz nowy projekt
3. Przejdź do **Settings** → **Database**
4. Skopiuj **Connection string** (tryb: Session)

## Krok 2: Wdrożenie na Vercel

### Przez Vercel Dashboard

1. Przejdź do [Vercel Dashboard](https://vercel.com/new)
2. Kliknij **Import Project**
3. Wybierz swoje repozytorium GitHub: `usterk/NoteAIHackaton`
4. Kliknij **Import**

### Konfiguracja zmiennych środowiskowych

W sekcji **Environment Variables** dodaj:

```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=twoj-bardzo-długi-i-losowy-sekret-min-32-znaki
ENCRYPTION_KEY=legacy-key-not-used-but-keep-for-compat
```

**Ważne:**
- `DATABASE_URL` - connection string z kroku 1
- `JWT_SECRET` - wygeneruj silny, losowy ciąg znaków (min. 32 znaki)
- `ENCRYPTION_KEY` - legacy, nie jest używany w E2E, ale zostaw dla kompatybilności

### Wygeneruj JWT_SECRET

```bash
# W terminalu:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Skopiuj wynik do `JWT_SECRET`.

## Krok 3: Deploy

1. Kliknij **Deploy**
2. Poczekaj ~2-3 minuty na build
3. Vercel automatycznie:
   - Zainstaluje zależności
   - Wygeneruje Prisma Client (`postinstall` script)
   - Uruchomi migracje (`vercel.json` → `buildCommand`)
   - Zbuduje aplikację Next.js

## Krok 4: Weryfikacja

1. Kliknij na URL deploymentu (np. `https://your-app.vercel.app`)
2. Powinieneś zobaczyć stronę główną
3. Zarejestruj nowego użytkownika
4. Utwórz notatkę - sprawdź czy E2E encryption działa

## Krok 5: Konfiguracja domeny (opcjonalnie)

1. W Vercel Dashboard → **Settings** → **Domains**
2. Dodaj swoją domenę
3. Skonfiguruj DNS zgodnie z instrukcjami Vercel

## Rozwiązywanie problemów

### Build fails: "Can't reach database server"

**Problem:** Vercel nie może połączyć się z bazą podczas build.

**Rozwiązanie:**
- Sprawdź czy `DATABASE_URL` jest poprawny
- Upewnij się, że baza akceptuje połączenia z zewnątrz
- Dla Vercel Postgres: upewnij się, że baza jest w tym samym regionie co projekt

### Build fails: "Prisma schema is not valid"

**Problem:** Błąd w `schema.prisma`.

**Rozwiązanie:**
```bash
# Lokalnie sprawdź schemat:
npx prisma validate
```

### Runtime error: "PrismaClient is unable to run in this browser environment"

**Problem:** Próba użycia Prisma w komponencie client-side.

**Rozwiązanie:**
- Prisma działa **TYLKO** w API routes (`app/api/**/route.ts`)
- Nigdy nie importuj `lib/prisma.ts` w komponentach z `'use client'`

### Notes nie deszyfrują się

**Problem:** Po wdrożeniu stare notatki nie działają.

**Rozwiązanie:**
- To normalne - zmiana z SQLite na PostgreSQL wymaga migracji
- Po pierwszym deployu baza jest pusta
- Zarejestruj nowych użytkowników i utwórz nowe notatki

### Error: "Invalid JWT"

**Problem:** `JWT_SECRET` zmienił się między deploymentami.

**Rozwiązanie:**
- Ustaw ten sam `JWT_SECRET` w Vercel env vars
- Jeśli zmieniłeś - użytkownicy muszą się zalogować ponownie

## Monitorowanie

### Logi

1. Vercel Dashboard → Twój projekt → **Logs**
2. Zobacz real-time logi funkcji serverless

### Baza danych (Vercel Postgres)

1. Vercel Dashboard → **Storage** → Twoja baza
2. Możesz wykonywać SQL queries bezpośrednio

### Prisma Studio (lokalne podgląd bazy produkcyjnej)

```bash
# W .env.local postaw DATABASE_URL z produkcji
npx prisma studio
```

**UWAGA:** Notatki będą zaszyfrowane - zobaczysz tylko Base64.

## Bezpieczeństwo w produkcji

### ✅ Obowiązkowe:

1. **HTTPS** - Vercel zapewnia automatycznie
2. **Silny JWT_SECRET** - min. 32 losowe znaki
3. **Bezpieczne hasła** - zachęcaj użytkowników do silnych haseł

### ⚠️ Zalecane:

1. **CSP Headers** - dodaj w `next.config.mjs`:
```js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

2. **Rate limiting** - użyj `@vercel/edge-rate-limit` dla API routes

3. **CORS** - jeśli nie potrzebujesz API z zewnątrz, zostaw domyślne same-origin

## Automatyczne deploymenty

Vercel automatycznie deployuje przy każdym pushu do `main`/`master`:

- **Push do main** → Production deployment
- **Push do innych branchy** → Preview deployment
- **Pull Request** → Preview deployment z unikalnym URL

## Koszty

### Vercel (Free tier):

- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/miesiąc
- ✅ Automatyczne HTTPS
- ❌ Limit: 100 GB bandwidth

### Vercel Postgres (Hobby - $0):

- ✅ 256 MB storage
- ✅ 60 godzin compute/miesiąc
- Wystarczy na mały projekt (do ~1000 notatek)

### Neon (Free tier):

- ✅ 512 MB storage
- ✅ 1 projekt
- Bardziej hojny free tier niż Vercel Postgres

## Następne kroki

Po wdrożeniu rozważ:

1. **Custom domain** - własna domena (np. `notes.twojadomena.pl`)
2. **Analytics** - Vercel Analytics (bezpłatne)
3. **Monitoring** - Sentry dla error trackingu
4. **Backup bazy** - regularne backup PostgreSQL

---

## Szybki checklist

- [ ] Utworzono bazę PostgreSQL
- [ ] Skopiowano `DATABASE_URL`
- [ ] Wygenerowano silny `JWT_SECRET`
- [ ] Dodano env vars w Vercel
- [ ] Zaimportowano projekt z GitHub
- [ ] Deploy zakończył się sukcesem
- [ ] Testowa rejestracja działa
- [ ] Testowa notatka szyfruje/deszyfruje poprawnie
- [ ] (Opcjonalnie) Dodano custom domain

Gratulacje! 🎉 Twoja aplikacja z E2E encryption działa na Vercel!
