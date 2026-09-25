<!-- ficheiro: docs/deploy.md -->

# Guia de Deploy — AtendSaúde

> **Escopo:** este guia é o objetivo de **Prioridade 2** do projeto (bônus para portfólio pessoal / live demo). A avaliação da seleção V-Lab (Prioridade 1) considera exclusivamente a execução local via Docker Compose descrita no `README.md` — nenhum passo abaixo é pré-requisito para a entrega do desafio. Até o deploy ser executado, o link de "Live Demo" no README permanece como placeholder.

Duas rotas práticas são descritas: **(A) VPS com Docker Compose** (mais controle, custo fixo baixo) e **(B) Render** (zero manutenção de servidor, adequado para uma demo de portfólio). Escolha uma — não são complementares.

---

## Rota A — VPS + Docker Compose + Nginx + Certbot

### A.1 Provisionar o servidor

```bash
# Numa VPS Ubuntu 24.04 nova (ex.: 2 vCPU / 4GB RAM)
sudo apt update && sudo apt install -y ca-certificates curl gnupg

# Instalar Docker Engine + Compose plugin (repositório oficial Docker)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker
```

### A.2 Clonar e configurar

```bash
git clone https://github.com/albertsantanadev/atendsaude.git /srv/atendsaude
cd /srv/atendsaude

cp .env.example .env
# Editar .env: gerar valores de produção reais para
#   APP_ENV=production
#   APP_DEBUG=false
#   APP_URL=https://seu-dominio.com
#   DB_PASSWORD=<senha forte, não a de desenvolvimento>
```

> ⚠️ Nunca reutilize a senha de desenvolvimento (`postgres`/`postgres`) em produção.

### A.3 Criar o compose de produção

O `docker-compose.yml` do repositório é otimizado para desenvolvimento (`php artisan serve`, Vite dev server). Para produção, crie `docker-compose.prod.yml` ao lado dele:

```yaml
# ficheiro: docker-compose.prod.yml (a criar)
services:
  db:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - atendsaude_pgdata_prod:/var/lib/postgresql/data
    networks: [atendsaude_net]

  backend:
    build:
      context: .
      dockerfile: docker/backend/Dockerfile.prod   # variante PHP-FPM (a criar)
    restart: always
    env_file: .env
    environment:
      DB_HOST: db
    networks: [atendsaude_net]

  frontend:
    build:
      context: .
      dockerfile: docker/frontend/Dockerfile.prod   # variante multi-stage -> Nginx (a criar)
    restart: always
    networks: [atendsaude_net]

  nginx:
    image: nginx:alpine
    restart: always
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - certbot_www:/var/www/certbot
      - certbot_certs:/etc/letsencrypt
    depends_on: [frontend, backend]
    networks: [atendsaude_net]

volumes:
  atendsaude_pgdata_prod:
  certbot_www:
  certbot_certs:

networks:
  atendsaude_net:
    driver: bridge
```

> `Dockerfile.prod` do backend (PHP-FPM em vez de `artisan serve`) e do frontend (`npm run build` → `nginx:alpine` servindo `/dist`) ainda **não existem** no repositório — são o próximo passo antes do primeiro deploy real nesta rota.

### A.4 Subir e migrar

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend php artisan key:generate --force
docker compose -f docker-compose.prod.yml exec backend php artisan migrate --force
```

`--force` é obrigatório: o Artisan bloqueia `migrate` em `APP_ENV=production` sem essa flag, como proteção contra execução acidental.

### A.5 TLS com Certbot

```bash
docker run --rm \
  -v certbot_www:/var/www/certbot \
  -v certbot_certs:/etc/letsencrypt \
  certbot/certbot certonly --webroot -w /var/www/certbot \
  -d seu-dominio.com --email voce@exemplo.com --agree-tos --non-interactive
```
Configurar renovação automática via cron (`certbot renew`) rodando a cada 12h.

### A.6 Automação (CD)

`.github/workflows/deploy.yml` (já no repositório) executa os passos A.4 via SSH sempre que o workflow `CI` conclui com sucesso na branch `main`. Requer os secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` configurados no GitHub.

---

## Rota B — Render (managed, menor esforço)

Recomendada para uma demo pública rápida sem gerenciar servidor.

1. **Banco de dados:** criar um PostgreSQL gerenciado no Render (ou usar [Neon](https://neon.tech)). Copiar a connection string.
2. **Backend:** novo *Web Service* no Render, "Build and deploy from a Dockerfile", apontando para `docker/backend/Dockerfile`. Em *Environment*, configurar as variáveis (`DB_CONNECTION=pgsql`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` extraídos da connection string, `APP_KEY` gerado localmente com `php artisan key:generate --show`, `APP_ENV=production`, `APP_DEBUG=false`).
3. **Migrations em produção:** no Render, usar o campo *Pre-Deploy Command* (ou um *Job* manual) com:
   ```bash
   php artisan migrate --force
   ```
   executado automaticamente a cada novo deploy, antes do serviço receber tráfego.
4. **Frontend:** novo *Static Site* no Render — *Build Command* `npm run build` (dentro de `frontend/`), *Publish Directory* `frontend/dist`. Variável de build `VITE_API_BASE_URL` apontando para a URL pública do backend (`https://<backend>.onrender.com/api/v1`).
5. **Domínio e TLS:** Render provisiona HTTPS automaticamente para o domínio `*.onrender.com`; um domínio próprio pode ser apontado via CNAME nas configurações do serviço.

---

## Gerenciamento de Variáveis de Ambiente em Produção

| Variável | Origem em produção | Nunca fazer |
|---|---|---|
| `APP_KEY` | Gerada uma única vez (`artisan key:generate --show`) e fixada como secret | Regenerar a cada deploy (invalida sessões/dados criptografados existentes) |
| `DB_PASSWORD` | Secret do provedor (Render/GitHub Actions) ou gerenciador de secrets da VPS | Reutilizar a senha de desenvolvimento (`postgres`) |
| `APP_DEBUG` | `false` | Deixar `true` em produção — vaza stack traces nas respostas de erro |
| `VITE_API_BASE_URL` | Definida em **build-time** do frontend (Vite embute no bundle) | Esperar que funcione como variável de runtime — precisa de rebuild se a URL da API mudar |

## Próximos Passos Antes do Primeiro Deploy Real

1. Criar `docker/backend/Dockerfile.prod` (PHP-FPM) e `docker/frontend/Dockerfile.prod` (multi-stage → Nginx) — hoje só existem as variantes de desenvolvimento.
2. Decidir a Rota A ou B e provisionar a infraestrutura correspondente.
3. Substituir o placeholder de "Live Demo" no `README.md` pela URL real.
4. Adicionar monitoramento básico (uptime check em `GET /api/v1/health`) — ver observação em ADR/README sobre observabilidade não implementada.
