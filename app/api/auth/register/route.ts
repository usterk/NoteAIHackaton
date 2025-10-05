import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, salt } = await request.json();

    if (!email || !password || !salt) {
      return NextResponse.json(
        { error: 'Email, hasło i salt są wymagane' },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik już istnieje
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Użytkownik już istnieje' },
        { status: 400 }
      );
    }

    // Utwórz nowego użytkownika z solą dla E2E encryption
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        salt, // Salt for E2E encryption key derivation
      },
    });

    // Wygeneruj token
    const token = generateToken(user.id);
    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: 'Użytkownik utworzony pomyślnie',
        userId: user.id,
        salt: user.salt // Return salt for immediate key derivation
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
