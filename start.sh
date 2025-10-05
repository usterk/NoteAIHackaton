#!/bin/bash

echo "🔒 Secure Notes App - Uruchomienie"
echo "=================================="
echo ""

# Sprawdź czy Docker jest zainstalowany
if ! command -v docker &> /dev/null; then
    echo "❌ Docker nie jest zainstalowany!"
    echo "   Zainstaluj Docker Desktop z: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Sprawdź czy docker-compose jest zainstalowany
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose nie jest zainstalowany!"
    exit 1
fi

echo "✅ Docker i docker-compose są zainstalowane"
echo ""
echo "🚀 Budowanie i uruchamianie aplikacji..."
echo ""

# Utwórz folder dla danych jeśli nie istnieje
mkdir -p data

# Uruchom docker-compose
docker-compose up --build

echo ""
echo "👋 Aplikacja zatrzymana"
