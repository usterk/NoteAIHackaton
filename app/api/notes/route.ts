import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Pobierz wszystkie notatki (E2E encrypted - zwracaj zaszyfrowane)
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const archived = searchParams.get('archived') === 'true';
    const folderId = searchParams.get('folderId');
    const tagId = searchParams.get('tagId');

    const notes = await prisma.note.findMany({
      where: {
        userId,
        isArchived: archived,
        ...(folderId && { folderId }),
        ...(tagId && { tags: { some: { id: tagId } } }),
      },
      include: {
        folder: true,
        tags: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Return encrypted data as-is - browser will decrypt
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

// POST - Utwórz nową notatkę (E2E encrypted - przyjmuj zaszyfrowane)
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const { encryptedTitle, encryptedContent, iv, folderId, tagIds } = await request.json();

    if (!encryptedTitle || !encryptedContent || !iv) {
      return NextResponse.json(
        { error: 'Zaszyfrowany tytuł, treść i IV są wymagane' },
        { status: 400 }
      );
    }

    // Store encrypted data directly - no server-side encryption
    const note = await prisma.note.create({
      data: {
        encryptedTitle,
        encryptedContent,
        iv,
        userId,
        folderId: folderId || null,
        tags: tagIds ? { connect: tagIds.map((id: string) => ({ id })) } : undefined,
      },
      include: {
        folder: true,
        tags: true,
      },
    });

    // Return encrypted note - browser will decrypt if needed
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
