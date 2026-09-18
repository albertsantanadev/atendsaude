# syntax=docker/dockerfile:1
FROM node:20-alpine

WORKDIR /app

# ATENÇÃO: frontend/package.json ainda não existe (será criado na Fase 4 -
# scaffold do React + TypeScript + Vite). O build desta imagem só será
# bem-sucedido a partir da Fase 4.
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

COPY frontend/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
