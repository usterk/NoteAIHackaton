# 📖 Przewodnik Użytkownika - Secure Notes

## 🚀 Jak zacząć

### 1. Uruchom aplikację
```bash
./start.sh
# LUB
docker-compose up --build
```

### 2. Otwórz przeglądarkę
```
http://localhost:3000
```

### 3. Zarejestruj się
- Kliknij zakładkę "Rejestracja"
- Wpisz email i hasło
- Kliknij "Zarejestruj się"

---

## 📁 Tworzenie folderów

### Krok po kroku:

1. **W lewym panelu** znajdź sekcję "FOLDERY"
2. **Kliknij przycisk "+"** obok nagłówka "Foldery"
3. **Wpisz nazwę folderu** (np. "Praca", "Osobiste", "Projekty")
4. **Wybierz kolor** - kliknij jeden z 8 kolorowych kwadratów
5. **Kliknij "Utwórz"**

### Wskazówki:
- Foldery pojawiają się w lewym panelu
- Liczba obok folderu pokazuje ile notatek zawiera
- Możesz mieć nieograniczoną liczbę folderów

---

## 🏷️ Tworzenie tagów

### Krok po kroku:

1. **W lewym panelu** znajdź sekcję "TAGI"
2. **Kliknij przycisk "+"** obok nagłówka "Tagi"
3. **Wpisz nazwę tagu** (np. "Pilne", "TODO", "Pomysł")
4. **Wybierz kolor** - kliknij jeden z 8 kolorowych kwadratów
5. **Kliknij "Utwórz"**

### Wskazówki:
- Tagi są widoczne w lewym panelu
- Liczba obok tagu pokazuje ile notatek posiada ten tag
- Jedna notatka może mieć wiele tagów

---

## 📝 Tworzenie notatki

### Krok po kroku:

1. **Kliknij "+ Nowa notatka"** (górny przycisk w środkowej kolumnie)
2. **Wpisz tytuł** notatki
3. **[OPCJONALNIE] Wybierz folder** z listy rozwijanej
4. **[OPCJONALNIE] Wybierz tagi** - kliknij na nazwę tagu aby go dodać (zaznaczone na niebiesko)
5. **Wpisz treść** notatki w dużym polu tekstowym
6. **Kliknij "Zapisz"**

### Przykład:
```
Tytuł: "Spotkanie z zespołem - 15.10"
Folder: Praca
Tagi: Pilne, TODO
Treść:
- Omówić status projektu
- Zaplanować sprint
- Code review
```

---

## ✏️ Edycja notatki

### Krok po kroku:

1. **Kliknij na notatkę** w środkowej kolumnie (lista notatek)
2. **Kliknij "Edytuj"** (prawy górny róg)
3. **Edytuj tytuł, treść, folder lub tagi:**
   - Tytuł: wpisz bezpośrednio
   - Folder: wybierz z listy rozwijanej
   - Tagi: kliknij na tagi aby dodać/usunąć (niebieskie = zaznaczone)
   - Treść: edytuj w dużym polu tekstowym
4. **Kliknij "Zapisz"** aby zapisać zmiany
5. **LUB "Anuluj"** aby odrzucić zmiany

---

## 🔄 Przenoszenie notatki między folderami

### Metoda 1: Podczas edycji
1. Otwórz notatkę
2. Kliknij "Edytuj"
3. W polu "Folder" wybierz nowy folder (lub "Brak folderu")
4. Kliknij "Zapisz"

### Metoda 2: Podczas tworzenia
1. Podczas tworzenia nowej notatki
2. Wybierz folder z listy rozwijanej
3. Notatka zostanie utworzona w wybranym folderze

---

## 🏷️ Dodawanie tagów do notatki

### Podczas tworzenia notatki:
1. Kliknij "+ Nowa notatka"
2. W sekcji "Tagi" kliknij na nazwy tagów które chcesz dodać
3. Zaznaczone tagi są podświetlone na niebiesko
4. Zapisz notatkę

### Podczas edycji notatki:
1. Otwórz notatkę
2. Kliknij "Edytuj"
3. W sekcji "Tagi" kliknij na tagi aby dodać/usunąć
4. Kliknij "Zapisz"

### Wskazówki:
- Możesz dodać wiele tagów do jednej notatki
- Aby usunąć tag - kliknij na niego ponownie (zniknie podświetlenie)
- Tagi są widoczne na liście notatek jako kolorowe etykietki

---

## 📦 Archiwizowanie notatki

### Krok po kroku:
1. Otwórz notatkę
2. Kliknij "Archiwizuj" (żółty przycisk)
3. Notatka zniknie z głównej listy

### Jak zobaczyć zarchiwizowane notatki:
1. W lewym panelu kliknij **"📦 Archiwum"**
2. Zobaczysz wszystkie zarchiwizowane notatki
3. Możesz je przywrócić edytując i zmieniając status

---

## 🗑️ Usuwanie notatki

### Krok po kroku:
1. Otwórz notatkę
2. Kliknij "Usuń" (czerwony przycisk)
3. Potwierdź usunięcie w oknie dialogowym
4. **UWAGA:** Usunięcie jest trwałe - nie można przywrócić!

---

## 🔍 Filtrowanie notatek

### Po folderze:
1. W lewym panelu kliknij na nazwę folderu
2. Zobaczysz tylko notatki z tego folderu

### Po tagu:
1. W lewym panelu kliknij na nazwę tagu
2. Zobaczysz tylko notatki z tym tagiem

### Wszystkie notatki:
1. Kliknij "📝 Wszystkie notatki" w lewym panelu

---

## 🔐 Bezpieczeństwo

### Jak działa szyfrowanie?

**⚠️ WAŻNE:** Szyfrowanie NIE jest end-to-end!

- Notatki są szyfrowane **NA SERWERZE** algorytmem AES-256
- Serwer **WIDZI** treść notatki przed zaszyfrowaniem
- Notatki są **ZASZYFROWANE W BAZIE DANYCH**
- Każda notatka ma unikalny IV (Initialization Vector)

**Co to oznacza?**
- ✅ Jeśli ktoś ukradnie plik bazy danych - nie odczyta notatek
- ❌ Administrator serwera może odczytać notatki
- ❌ To NIE jest prawdziwe E2E encryption

Więcej szczegółów: zobacz plik `ENCRYPTION_EXPLAINED.md`

---

## 💡 Wskazówki i triki

### Organizacja notatek:
- **Foldery** - użyj do głównych kategorii (Praca, Dom, Projekty)
- **Tagi** - użyj do krzyżujących się kategorii (Pilne, TODO, Pomysł)
- Jedna notatka może być w jednym folderze ale mieć wiele tagów

### Przykładowa struktura:
```
📁 Foldery:
   - Praca (niebieski)
   - Osobiste (zielony)
   - Projekty (fioletowy)

🏷️ Tagi:
   - Pilne (czerwony)
   - TODO (pomarańczowy)
   - Pomysł (żółty)
   - Gotowe (zielony)
```

### Przykładowe notatki:
```
Notatka 1:
  Tytuł: "Prezentacja dla klienta"
  Folder: Praca
  Tagi: Pilne, TODO

Notatka 2:
  Tytuł: "Pomysły na urodziny"
  Folder: Osobiste
  Tagi: Pomysł

Notatka 3:
  Tytuł: "Refaktoryzacja modułu auth"
  Folder: Projekty
  Tagi: TODO, Praca
```

---

## 🚪 Wylogowanie

1. Przewiń w dół lewego panelu
2. Kliknij czerwony przycisk "Wyloguj"
3. Zostaniesz przeniesiony do strony logowania

---

## ❓ Najczęściej zadawane pytania

**Q: Czy mogę zmienić folder notatki?**
A: Tak! Edytuj notatkę i wybierz nowy folder z listy.

**Q: Ile tagów mogę dodać do notatki?**
A: Nieograniczoną liczbę!

**Q: Czy mogę przywrócić zarchiwizowaną notatkę?**
A: Obecnie nie ma dedykowanego przycisku, ale możesz ją usunąć z archiwum.

**Q: Co się stanie jeśli usunę folder z notatkami?**
A: Obecnie usuwanie folderów nie jest zaimplementowane. Notatki byłyby bez folderu.

**Q: Czy mogę wyszukiwać notatki?**
A: Obecnie nie ma funkcji wyszukiwania - użyj folderów i tagów do organizacji.

**Q: Czy moje notatki są bezpieczne?**
A: Są szyfrowane w bazie danych AES-256, ale NIE jest to E2E. Zobacz `ENCRYPTION_EXPLAINED.md`.

---

## 🆘 Pomoc

Jeśli masz problemy:
1. Sprawdź czy aplikacja działa: http://localhost:3000
2. Sprawdź logi Dockera: `docker-compose logs`
3. Zrestartuj aplikację: `docker-compose restart`
4. Zobacz dokumentację w `README.md`

---

**Miłego korzystania z Secure Notes! 🎉**
