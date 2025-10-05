import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Pobierz wszystkie foldery
export async function GET() {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const folders = await prisma.folder.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error('Get folders error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

// POST - Utwórz nowy folder
export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const { name, color } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Nazwa jest wymagana' }, { status: 400 });
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        color: color || '#3b82f6',
        userId,
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    console.error('Create folder error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
