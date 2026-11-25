#!/bin/bash
cd "$(dirname "$0")"
npm install
[ -f .env ] || npm run configurar
(sleep 6 && open http://localhost:3000) &
npm start
