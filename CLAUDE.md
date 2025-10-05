# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a secure note-taking application built for a hackathon with **true end-to-end encryption (E2E)**. Notes are encrypted client-side before being sent to the server, meaning the server never sees plaintext content.

**Key Tech Stack:**
- Next.js 14 (App Router)
- Prisma ORM with SQLite
- TypeScript
- Tailwind CSS (Cyberpunk theme)
- Web Crypto API (E2E encryption)

## Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Generate Prisma Client (MUST run after schema changes or git pull)
npx prisma generate

# Run database migrations
npx prisma migrate dev --name <migration_name>

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

### Docker Development
```bash
# Build and run with Docker
docker-compose up --build

# Stop containers
docker-compose down

# Quick start script
./start.sh
```

### Database Operations
```bash
# Open Prisma Studio (database GUI)
npx prisma studio

# Deploy migrations (production)
npx prisma migrate deploy

# Reset database (DESTRUCTIVE - deletes all data)
npx prisma migrate reset
```

## Critical Architecture Concepts

### End-to-End Encryption Flow

**The E2E encryption is the core feature of this application. Understanding it is essential.**

1. **User Registration:**
   - Browser generates random salt (16 bytes)
   - Salt + email + password sent to server
   - Server: hashes password with bcrypt → stores hash + salt
   - Browser: derives encryption key from password+salt using PBKDF2 (100k iterations)
   - Encryption key stored ONLY in React Context (memory, never sent to server)

2. **User Login:**
   - Server returns user's salt after authentication
   - Browser derives encryption key from password+salt (same PBKDF2 process)
   - Key stored in EncryptionContext

3. **Creating/Updating Notes:**
   - Browser encrypts title + content using AES-256-GCM
   - Generates unique IV (initialization vector) per note
   - Sends encrypted data + IV to server
   - **Server stores encrypted data - never sees plaintext**

4. **Reading Notes:**
   - Server returns encrypted data + IV
   - Browser decrypts using key from EncryptionContext
   - Plaintext shown to user

**Important Files:**
- `lib/crypto-client.ts` - Web Crypto API wrapper (client-side encryption)
- `app/context/EncryptionContext.tsx` - Stores encryption key in memory
- `app/api/notes/route.ts` - Note CRUD API (handles encrypted data)
- `prisma/schema.prisma` - Database schema with encrypted fields

### Authentication & Authorization

- JWT tokens stored in httpOnly cookies (7-day expiration)
- Middleware (`middleware.ts`) protects `/dashboard/*` routes
- Redirects unauthenticated users to `/login`
- Redirects authenticated users away from `/login` to `/dashboard`

**Key Functions (lib/auth.ts):**
- `getCurrentUser()` - Gets userId from JWT cookie
- `hashPassword()` - bcrypt hashing for authentication
- `verifyPassword()` - bcrypt verification
- `generateToken()` - Creates JWT
- `setAuthCookie()` / `clearAuthCookie()` - Cookie management

### Database Schema (Prisma)

**User** → has many Notes, Folders, Tags
- Stores `salt` (hex string) for E2E key derivation
- Stores `password` (bcrypt hash) for authentication only

**Note** → belongs to User, optional Folder, many Tags
- `encryptedTitle` (Base64) - client-encrypted
- `encryptedContent` (Base64) - client-encrypted
- `iv` (Base64) - initialization vector for decryption
- `isArchived` - soft delete flag

**Folder** → has many Notes
- `name`, `color` - NOT encrypted (needed for UI filtering)

**Tag** → many-to-many with Notes
- `name`, `color` - NOT encrypted (needed for UI filtering)

### API Routes Structure

All API routes are in `app/api/`:

**Authentication:**
- `POST /api/auth/register` - Accepts salt, returns salt + JWT
- `POST /api/auth/login` - Returns salt + JWT
- `POST /api/auth/logout` - Clears cookie

**Notes:**
- `GET /api/notes` - List user's notes (returns encrypted data)
- `POST /api/notes` - Create note (expects encrypted data)
- `GET /api/notes/[id]` - Get single note (encrypted)
- `PUT /api/notes/[id]` - Update note (encrypted)
- `DELETE /api/notes/[id]` - Delete note

**Organization:**
- `GET /api/folders` - List folders
- `POST /api/folders` - Create folder
- `GET /api/tags` - List tags
- `POST /api/tags` - Create tag

### Frontend Architecture

**Layout Wrapper:**
- `app/layout.tsx` wraps everything in `EncryptionProvider`
- Encryption key persists in React Context during session

**Main Pages:**
- `app/page.tsx` - Landing/welcome page
- `app/login/page.tsx` - Login/Register (derives encryption key)
- `app/dashboard/page.tsx` - Main app (encrypts/decrypts notes)

**Client Components:**
- `app/components/SoundEffects.tsx` - Cyberpunk UI sounds
- Uses `'use client'` directive (all encryption happens client-side)

## Important Constraints & Considerations

### Security

1. **Password Recovery is IMPOSSIBLE** - This is E2E encryption. If user forgets password, notes are permanently lost. This is by design.

2. **HTTPS Required in Production** - Encryption key in memory is vulnerable to XSS. Use HTTPS + CSP headers.

3. **Metadata is NOT Encrypted** - Folder names, tag names, timestamps are plaintext (needed for filtering/sorting). Only note title + content are encrypted.

4. **Salt is Public** - The user's salt is returned by login API. This is safe because PBKDF2 with 100k iterations makes brute force infeasible.

### Database Migrations

**CRITICAL:** After changing `prisma/schema.prisma`, you MUST:
```bash
npx prisma generate    # Regenerate TypeScript types
npx prisma migrate dev # Create migration
```

The app will crash if Prisma Client is out of sync with schema.

### Environment Variables

Required in `.env`:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="<random-secret>"
ENCRYPTION_KEY="<legacy-not-used-but-keep-for-compat>"
```

The `ENCRYPTION_KEY` env var is legacy from server-side encryption. It's no longer used (E2E uses client-derived keys), but exists for backwards compatibility.

### Docker Considerations

- Database persists in `data/` volume (see `docker-compose.yml`)
- Multi-stage build in `Dockerfile`
- `docker-entrypoint.sh` runs migrations on container start
- Binary targets in Prisma schema include Linux musl for Alpine containers

## Cyberpunk Theme

The app has a distinct cyberpunk aesthetic with:
- Neon green/cyan colors (#00ff00, #00ffff)
- CRT monitor effects (scanlines, glitch animations)
- Gradient animations in the main column
- Sound effects on interactions

When modifying UI, maintain this theme. See `app/globals.css` for global styles.

## Common Pitfalls

1. **Forgetting `npx prisma generate`** after schema changes → Runtime errors
2. **Not wrapping client-side crypto code in `'use client'`** → Hydration errors
3. **Trying to decrypt without encryption key in context** → Returns garbage/errors
4. **Changing encryption algorithm** → Breaks all existing notes (no migration path)
5. **Using server-side encryption functions** → The old `lib/crypto.ts` is unused, client uses `lib/crypto-client.ts`

## Testing the E2E Flow

To verify encryption works:
1. Register a new user
2. Create a note with test content
3. Check database: `encryptedContent` should be Base64 gibberish
4. Refresh page - note decrypts correctly
5. Logout and login - note still decrypts
6. Try decrypting DB content manually → impossible without user password
