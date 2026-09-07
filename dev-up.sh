#!/usr/bin/env bash
# Atalho de desenvolvimento: sobe as 3 VMs e, assim que estiverem prontas,
# já inicia o Expo — um único comando
set -e

cd "$(dirname "$0")"

echo "==> Subindo as VMs..."
vagrant up

echo "==> VMs prontas. Iniciando o Expo (mobile-app)..."
cd mobile-app
npm install
npx expo start
