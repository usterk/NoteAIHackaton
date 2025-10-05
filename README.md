# 🔒 Secure Notes App

Aplikacja webowa do zarządzania prywatnymi, szyfrowanymi notatkami. Projekt stworzony na hackathon.

## 🚀 Stos technologiczny

- **Framework:** Next.js 14
- **Styling:** Tailwind CSS
- **Baza danych:** SQLite (Prisma ORM)
- **Szyfrowanie:** AES-256 (crypto-js)
- **Uwierzytelnianie:** JWT + bcrypt
- **Konteneryzacja:** Docker + docker-compose

## ✨ Funkcjonalności

### Uwierzytelnianie
- ✅ Rejestracja użytkownika
- ✅ Logowanie
- ✅ Bezpieczne sesje (JWT w cookies)

### Notatki
- ✅ Dodawanie notatek (z folderami i tagami)
- ✅ Edycja notatek (zmiana folderu, tagów, treści)
- ✅ Archiwizowanie notatek
- ✅ Usuwanie notatek
- ✅ **Notatki szyfrowane w bazie danych** (AES-256, server-side)

### Organizacja
- ✅ Tagi (z kolorami) - pełne UI do tworzenia i przypisywania
- ✅ Foldery (z kolorami) - pełne UI do tworzenia i przenoszenia
- ✅ Filtrowanie notatek po tagach i folderach
- ✅ Jedna notatka może mieć wiele tagów
- ✅ Przenoszenie notatek między folderami

## 🐳 Uruchomienie z Docker

### Wymagania
- Docker
- docker-compose

### Kroki:

1. **Sklonuj repozytorium** (lub rozpakuj folder)

2. **Utwórz plik `.env`** (opcjonalnie, aby zmienić domyślne klucze):
```bash
DATABASE_URL="file:/app/data/dev.db"
JWT_SECRET="twoj-super-tajny-klucz-jwt"
ENCRYPTION_KEY="twoj-32-znakowy-klucz-szyfrowania"
```

3. **Uruchom aplikację:**
```bash
docker-compose up --build
```

4. **Otwórz w przeglądarce:**
```
http://localhost:3000
```

5. **Zatrzymanie aplikacji:**
```bash
docker-compose down
```

## 💻 Uruchomienie lokalne (bez Dockera)

### Wymagania
- Node.js 20+
- npm

### Kroki:

1. **Zainstaluj zależności:**
```bash
npm install
```

2. **Wygeneruj Prisma Client:**
```bash
npx prisma generate
```

3. **Utwórz bazę danych:**
```bash
npx prisma migrate dev --name init
```

4. **Uruchom serwer deweloperski:**
```bash
npm run dev
```

5. **Otwórz w przeglądarce:**
```
http://localhost:3000
```

## 🔐 Bezpieczeństwo

### ⚠️ WAŻNE: Szyfrowanie NIE jest End-to-End!

**Obecna implementacja:**
- **Szyfrowanie:** Server-side (na serwerze, nie w przeglądarce)
- **Algorytm:** AES-256-CBC z unikalnym IV dla każdej notatki
- **Gdzie:** Notatki są szyfrowane PRZED zapisem do bazy danych
- **Klucz:** Przechowywany w zmiennej środowiskowej na serwerze

**Co to oznacza:**
- ✅ Notatki są zaszyfrowane w bazie danych
- ✅ Kradzież pliku bazy NIE ujawni treści notatek
- ✅ Silne szyfrowanie AES-256
- ❌ Serwer WIDZI treść notatki przed zaszyfrowaniem
- ❌ Administrator serwera może odczytać notatki
- ❌ NIE jest to prawdziwe E2E encryption

**Inne zabezpieczenia:**
- **Hasła:** hashowane za pomocą bcrypt (10 rund)
- **Sesje:** JWT przechowywane w httpOnly cookies
- **Baza danych:** SQLite z relacyjnym modelem danych

📖 **Szczegóły:** Zobacz `ENCRYPTION_EXPLAINED.md` dla pełnego wyjaśnienia

## 📁 Struktura projektu

```
.
├── app/
│   ├── api/              # API endpoints
│   │   ├── auth/         # Logowanie, rejestracja, wylogowanie
│   │   ├── notes/        # CRUD notatek
│   │   ├── folders/      # Zarządzanie folderami
│   │   └── tags/         # Zarządzanie tagami
│   ├── dashboard/        # Główny widok aplikacji
│   ├── login/            # Strona logowania
│   └── globals.css       # Style globalne
├── components/           # Komponenty React (gotowe do rozbudowy)
├── lib/
│   ├── auth.ts          # Funkcje uwierzytelniania
│   ├── crypto.ts        # Funkcje szyfrowania/deszyfrowania
│   └── prisma.ts        # Klient Prisma
├── prisma/
│   └── schema.prisma    # Schemat bazy danych
├── Dockerfile           # Konfiguracja kontenera
├── docker-compose.yml   # Orkiestracja Docker
└── package.json         # Zależności projektu
```

## 🎯 Roadmap (możliwe rozszerzenia)

- [ ] Rich text editor (np. Tiptap)
- [ ] Udostępnianie notatek innym użytkownikom
- [ ] Eksport notatek (PDF, Markdown)
- [ ] Dark mode toggle
- [ ] Wyszukiwanie pełnotekstowe
- [ ] Załączniki do notatek
- [ ] PWA support
- [ ] Mobile app (React Native)

## 📝 Licencja

MIT - możesz używać tego projektu jak chcesz!

## 🤝 Wkład

Pull requesty mile widziane! Dla większych zmian, najpierw otwórz issue.

---

**Utworzone z ❤️ na hackathon**
