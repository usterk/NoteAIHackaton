# ✅ E2E Encryption - Progress

## Co zostało zrobione:

### 1. ✅ Plan architektury (E2E_ENCRYPTION_PLAN.md)
- Szczegółowy plan implementacji
- Bezpieczeństwo i flow danych
- Testowanie

### 2. ✅ Biblioteka crypto (lib/crypto-client.ts)
```typescript
- generateSalt() - generowanie salt dla nowego użytkownika
- deriveKeyFromPassword() - PBKDF2 key derivation
- encryptData() - AES-GCM encryption
- decryptData() - AES-GCM decryption
```

### 3. ✅ Prisma Schema
```prisma
model User {
  salt String  // Do derivacji klucza
}

model Note {
  encryptedTitle   String
  encryptedContent String
  iv               String  // Unikalny IV per notatka
}
```

### 4. ✅ Migracja bazy
```bash
npx prisma migrate dev --name add_e2e_encryption
```

### 5. ✅ API Auth
- `/api/auth/register` - przyjmuje salt, zwraca salt
- `/api/auth/login` - zwraca salt użytkownika

### 6. ✅ React Context (app/context/EncryptionContext.tsx)
- Przechowuje CryptoKey w pamięci
- useEncryption() hook

### 7. ✅ Login/Register (app/login/page.tsx)
- Generuje salt przy rejestracji
- Derivuje klucz po logowaniu
- Zapisuje klucz w Context
- Ostrzeżenie o E2E encryption

### 8. ✅ API Notes
- `POST /api/notes` - przyjmuje `encryptedTitle`, `encryptedContent`, `iv`
- `GET /api/notes` - zwraca zaszyfrowane dane
- `PUT /api/notes/[id]` - przyjmuje zaszyfrowane dane

### 9. ✅ Gradient animation
- Tylko w 2. kolumnie (lista notatek)
- `.gradient-bg` klasa z rotating gradient

---

## Co pozostało:

### ⏳ Dashboard (app/dashboard/page.tsx) - IN PROGRESS

Trzeba dodać:

1. **Import biblioteki crypto**
```typescript
import { encryptData, decryptData } from '@/lib/crypto-client';
import { useEncryption } from '../context/EncryptionContext';
```

2. **Deszyfrowanie po pobraniu notatek**
```typescript
const { encryptionKey } = useEncryption();

// W fetchNotes():
const data = await response.json();
const decryptedNotes = await Promise.all(
  data.map(async (note) => ({
    ...note,
    title: await decryptData(note.encryptedTitle, note.iv, encryptionKey),
    content: await decryptData(note.encryptedContent, note.iv, encryptionKey),
  }))
);
setNotes(decryptedNotes);
```

3. **Szyfrowanie przed wysłaniem**
```typescript
// W createNote():
const { encrypted: encTitle, iv: ivTitle } = await encryptData(title, encryptionKey);
const { encrypted: encContent, iv } = await encryptData(content, encryptionKey);

await fetch('/api/notes', {
  method: 'POST',
  body: JSON.stringify({
    encryptedTitle: encTitle,
    encryptedContent: encContent,
    iv, // Use same IV for both (or separate IVs)
    folderId,
    tagIds
  })
});
```

4. **Podobnie dla updateNote()**

5. **Handling logout** - clear encryption key
```typescript
const logout = async () => {
  clearEncryptionKey(); // Clear from context
  await fetch('/api/auth/logout', { method: 'POST' });
  router.push('/login');
};
```

---

## Status: ~90% ukończone

Pozostaje tylko Dashboard - szyfrowanie/deszyfrowanie w UI.
