import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET - Pobierz wszystkie tagi
export async function GET() {
  try {
    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json({ error: 'Nieautoryzowany' }, { status: 401 });
    }

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}

// POST - Utwórz nowy tag
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

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#10b981',
        userId,
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error) {
    console.error('Create tag error:', error);
    return NextResponse.json({ error: 'Błąd serwera' }, { status: 500 });
  }
}
