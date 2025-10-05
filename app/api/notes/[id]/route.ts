import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// PUT - Aktualizuj notatkę (E2E encrypted)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const { id } = await params;
    const { encryptedTitle, encryptedContent, iv, folderId, tagIds, isArchived } = await request.json();

    // Sprawdź czy notatka należy do użytkownika
    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Notatka nie znaleziona' }, { status: 404 });
    }

    // Przygotuj dane do aktualizacji
    const updateData: any = {};

    // Update encrypted fields if provided
    if (encryptedTitle !== undefined) updateData.encryptedTitle = encryptedTitle;
    if (encryptedContent !== undefined) updateData.encryptedContent = encryptedContent;
    if (iv !== undefined) updateData.iv = iv;

    // Update metadata (not encrypted)
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    if (folderId !== undefined) updateData.folderId = folderId;

    // Aktualizuj tagi jeśli podano
    if (tagIds !== undefined) {
      updateData.tags = {
        set: tagIds.map((id: string) => ({ id })),
      };
    }

    const note = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        folder: true,
        tags: true,
      },
    });

    // Return encrypted note - browser will decrypt
    return NextResponse.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

// DELETE - Usuń notatkę
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const { id } = await params;

    // Sprawdź czy notatka należy do użytkownika
    const existingNote = await prisma.note.findFirst({
      where: { id, userId },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Notatka nie znaleziona' }, { status: 404 });
    }

    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Notatka usunięta' });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
