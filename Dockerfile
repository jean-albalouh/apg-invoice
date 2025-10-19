# Étape 1 : builder
FROM node:20-alpine AS builder

WORKDIR /app

# Installer bash pour scripts éventuels
RUN apk add --no-cache bash git

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier tout le code
COPY . .

# Builder le frontend et backend
RUN npm run build

# Étape 2 : image finale légère
FROM node:20-alpine AS prod

WORKDIR /app

# Installer uniquement ce qui est nécessaire pour exécuter
COPY package*.json ./
RUN npm ci

# Copier le build final
COPY --from=builder /app/dist ./dist

# Exposer le port backend
EXPOSE 4000

# Lancer le backend
CMD ["node", "dist/index.js"]
