import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email i hasło są wymagane' },
        { status: 400 }
      );
    }

    // Znajdź użytkownika
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Nieprawidłowe dane logowania' },
        { status: 401 }
      );
    }

    // Weryfikuj hasło
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Nieprawidłowe dane logowania' },
        { status: 401 }
      );
    }

    // Wygeneruj token
    const token = generateToken(user.id);
    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: 'Zalogowano pomyślnie',
        userId: user.id,
        salt: user.salt // Return salt for E2E key derivation
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}
