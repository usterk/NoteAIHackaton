# 🔐 Plan Implementacji End-to-End Encryption

## Cel:
Notatki mają być szyfrowane **w przeglądarce** przed wysłaniem do serwera i deszyfrowane **w przeglądarce** po pobraniu. Serwer nigdy nie widzi niezaszyfrowanej treści.

---

## Architektura E2E Encryption:

### 1. **Generowanie klucza szyfrującego**
- **Źródło**: Hasło użytkownika (to samo które używa do logowania)
- **Metoda**: PBKDF2 (Password-Based Key Derivation Function 2)
- **Parametry**:
  - Iterations: 100,000
  - Hash: SHA-256
  - Key length: 256 bits (32 bytes)
  - Salt: unikalny per user (przechowywany w bazie - nie tajny)

### 2. **Gdzie dzieje się szyfrowanie/deszyfrowanie**
- **Szyfrowanie**: `browser → Web Crypto API → encrypted data → server`
- **Deszyfrowanie**: `server → encrypted data → browser → Web Crypto API → plain text`
- **Algorytm**: AES-GCM (256-bit)

### 3. **Co jest szyfrowane**
- ✅ Tytuł notatki (`title`)
- ✅ Treść notatki (`content`)
- ❌ Metadane (data utworzenia, folderId, tagIds) - NIE szyfrowane (do wyszukiwania/sortowania)

---

## Przepływ danych:

### **Rejestracja nowego użytkownika:**
```
1. User wpisuje email + password
2. Browser:
   - Generuje random salt (crypto.getRandomValues)
   - Zapisuje salt w bazie (jako hex string)
3. Backend:
   - Hash hasła (bcrypt) → do autoryzacji
   - Zapisuje salt → do derivacji klucza
```

### **Logowanie:**
```
1. User wpisuje email + password
2. Backend:
   - Weryfikuje hasło (bcrypt)
   - Zwraca salt użytkownika
3. Browser:
   - Derivuje klucz z password + salt (PBKDF2)
   - Przechowuje klucz w pamięci (sessionStorage lub React state)
   - NIE wysyła klucza na serwer!
```

### **Tworzenie notatki:**
```
1. User wpisuje tytuł i treść
2. Browser:
   - Generuje random IV (Initialization Vector)
   - Szyfruje title + content (AES-GCM + IV)
   - Wysyła na serwer: {
       encryptedTitle: base64,
       encryptedContent: base64,
       iv: base64,
       folderId: string,
       tagIds: string[]
     }
3. Backend:
   - Zapisuje zaszyfrowane dane w bazie
```

### **Odczyt notatki:**
```
1. Backend zwraca zaszyfrowane dane + IV
2. Browser:
   - Deszyfruje title + content (AES-GCM + IV + klucz z sesji)
   - Wyświetla użytkownikowi
```

---

## Struktura bazy danych (zmiany):

### **User model:**
```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  password String  // bcrypt hash (do autentykacji)
  salt     String  // hex string - do derivacji klucza szyfrującego
  notes    Note[]
  // ...
}
```

### **Note model:**
```prisma
model Note {
  id               String   @id @default(cuid())
  encryptedTitle   String   // Base64 encrypted title
  encryptedContent String   // Base64 encrypted content
  iv               String   // Base64 IV (Initialization Vector)
  isArchived       Boolean  @default(false)
  createdAt        DateTime @default(now())
  // metadata (NIE szyfrowane):
  folderId         String?
  folder           Folder?  @relation(...)
  tags             Tag[]    @relation(...)
  // ...
}
```

---

## Implementacja krok po kroku:

### **Krok 1: Nowa biblioteka crypto (browser-side)**
Plik: `lib/crypto-client.ts`
```typescript
import { webcrypto } from 'crypto';

// Generowanie salt dla nowego użytkownika
export function generateSalt(): string

// Derivacja klucza z hasła
export async function deriveKey(password: string, salt: string): Promise<CryptoKey>

// Szyfrowanie
export async function encryptData(plaintext: string, key: CryptoKey): Promise<{encrypted: string, iv: string}>

// Deszyfrowanie
export async function decryptData(encrypted: string, iv: string, key: CryptoKey): Promise<string>
```

### **Krok 2: Modyfikacja komponentu Login**
- Po udanym logowaniu → pobierz salt
- Derivuj klucz z password + salt
- Zapisz klucz w React Context lub sessionStorage

### **Krok 3: Modyfikacja komponentu Dashboard**
- Przed wysłaniem notatki → szyfruj title + content
- Po pobraniu notatki → deszyfruj title + content

### **Krok 4: Modyfikacja API endpoints**
- `POST /api/auth/register` → zapisz salt
- `POST /api/auth/login` → zwróć salt
- `POST /api/notes` → przyjmuj encryptedTitle, encryptedContent, iv
- `GET /api/notes` → zwracaj zaszyfrowane dane + iv
- Usuń stare szyfrowanie server-side (`lib/crypto.ts`)

### **Krok 5: Migracja bazy danych**
```bash
npx prisma migrate dev --name add_e2e_encryption
```

---

## Bezpieczeństwo:

### ✅ **Co jest bezpieczne:**
- Serwer nigdy nie widzi klucza szyfrującego
- Serwer nigdy nie widzi niezaszyfrowanych notatek
- Hasło jest hashowane (bcrypt) + klucz derivowany (PBKDF2)
- AES-GCM zapewnia autentyczność (nie można podmienić ciphertext)

### ⚠️ **Potencjalne ryzyka:**
- Jeśli user zapomni hasła → **nie ma recovery** (klucz nie da się odzyskać)
- XSS może ukraść klucz z sessionStorage/memory
- Man-in-the-middle może ukraść hasło podczas logowania (wymaga HTTPS!)

### 🛡️ **Rekomendacje:**
- **ZAWSZE używaj HTTPS** w produkcji
- Dodaj opcję "Export backup key" (optional)
- Dodaj ostrzeżenie przy rejestracji: "Jeśli zapomnisz hasła, stracisz dostęp do notatek"

---

## Testowanie:

### **Test 1: Rejestracja + Logowanie**
1. Zarejestruj użytkownika
2. Sprawdź że salt jest zapisany w bazie
3. Zaloguj się → sprawdź że klucz jest derivowany

### **Test 2: Szyfrowanie**
1. Utwórz notatkę
2. Sprawdź w bazie że `encryptedTitle` i `encryptedContent` są Base64
3. Sprawdź że nie da się odczytać plaintext z bazy

### **Test 3: Deszyfrowanie**
1. Pobierz notatkę
2. Sprawdź że jest poprawnie odszyfrowana w UI
3. Sprawdź że różne IV dla każdej notatki

---

## Migracja istniejących notatek:

**Problem**: Stare notatki są zaszyfrowane server-side (AES-256-CBC z kluczem w .env)

**Rozwiązanie**:
1. **Opcja A**: Kasuj stare notatki (to jest projekt hackathonowy)
2. **Opcja B**: Napisz skrypt migracyjny:
   - Odszyfruj stare notatki (server-side key)
   - Dla każdego usera: weź hasło (NIE MOŻLIWE - mamy tylko bcrypt hash!)
   - **Wniosek: Opcja B niemożliwa bez plaintext hasła**

**Decyzja**: Kasujemy bazę i zaczynamy od nowa z E2E encryption.

---

## Status:
- [ ] Implementacja `lib/crypto-client.ts`
- [ ] Modyfikacja Prisma schema
- [ ] Migracja bazy
- [ ] Modyfikacja login/register
- [ ] Modyfikacja dashboard (szyfrowanie/deszyfrowanie)
- [ ] Modyfikacja API endpoints
- [ ] Usuniecie starego `lib/crypto.ts`
- [ ] Testy
- [ ] Dokumentacja

---

**Czas realizacji**: ~2-3 godziny
**Priorytet**: WYSOKI
