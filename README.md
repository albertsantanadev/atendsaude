# 💙 AtendSaúde

### Registro e Acompanhamento de Solicitações de Atendimento

Aplicação full stack para registrar, consultar, filtrar e acompanhar solicitações de atendimento encaminhadas a unidades públicas de saúde, com uma máquina de estados de status auditável e protocolo gerado automaticamente.

![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?logo=php&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![Licença](https://img.shields.io/badge/Licença-Avalia%C3%A7%C3%A3o%20T%C3%A9cnica-lightgrey)

📄 Especificação da API: [`openapi.yaml`](./openapi.yaml) · 📚 Documentação da Fase 0: `Documentação/` (User Stories, Modelo de Dados, Contrato de API, ADRs, Variáveis de Ambiente)

📐 Arquitetura detalhada: [`docs/modelo_dados.md`](./docs/modelo_dados.md) (ERD) · [`docs/modelo_c4.md`](./docs/modelo_c4.md) (C4) · [`docs/contrato_api.md`](./docs/contrato_api.md) · [`docs/ADRs.md`](./docs/ADRs.md) · [`docs/deploy.md`](./docs/deploy.md)

---

## 🌐 Live Demo & Deploy

**Live Demo:** https://atendsaude-uo48y9cey-albert-8553.vercel.app/

---

## 📋 Descrição do Projeto

O **AtendSaúde** foi desenvolvido em resposta ao desafio técnico full stack do V-Lab (CIn-UFPE) para a área de saúde pública. O sistema permite registrar solicitações de atendimento (consulta, exame, vacinação ou outro), com prioridade e protocolo únicos, e acompanhar sua evolução por uma máquina de estados que impede transições inválidas (por exemplo, pular de "Recebida" direto para "Concluída", ou alterar uma solicitação já finalizada).

O frontend React consome exclusivamente a API Laravel — não há dados estáticos ou mocks como fonte principal — e todo o ambiente (frontend, backend e PostgreSQL) sobe integrado via Docker Compose.

## 🚀 Funcionalidades Implementadas

- 📝 **Cadastro de solicitações** com validação de campos e regra de negócio: prioridade `URGENTE` exige justificativa preenchida.
- 🔢 **Protocolo único gerado automaticamente** no formato `SOL-{ano}-{sequencial}`, via contador atômico (sem colisão sob concorrência).
- 🔄 **Máquina de estados de status** (`RECEBIDA → EM_ANALISE/CANCELADA → AGENDADA/CANCELADA → CONCLUIDA/CANCELADA`), com transições ilegais bloqueadas tanto no backend (regra central, testada) quanto na UI (só oferece opções válidas).
- 📋 **Listagem paginada com filtros** por status, categoria e prioridade.
- 🔍 **Detalhes da solicitação** em modal, com atualização de status inline.
- 🩺 **Health check** (`GET /api/v1/health`) validando a conexão real com o PostgreSQL.
- 🌱 **Seeders/Factories** para popular o banco com dados fictícios realistas em todos os status.
- 🎨 **Interface própria**, com identidade visual "MedTech" (Tailwind CSS + Lucide React), estados de carregamento/erro/vazio e responsividade básica.
- ✅ **Testes automatizados** de backend (regras de negócio e endpoints) e frontend (formulário).

## 🚧 Não Implementado / Limitações Conhecidas

Transparência conforme pedido no edital — nada abaixo invalida o fluxo principal, mas fica registrado:

- **Autenticação/autorização** (diferencial da seção 2.5) não foi implementada — todos os endpoints estão abertos.
- **Pipeline de CI** (lint + testes automatizados a cada push) não foi configurado nesta entrega.
- **Testes E2E** (Cypress/Playwright) não foram feitos — a cobertura de frontend é de componente (Testing Library), não de fluxo ponta a ponta no navegador.
- **Logs estruturados/correlação de requisições** não foram implementados além do log padrão do Laravel.
- **Eventos/filas assíncronas** não são usados — não havia processamento longo o suficiente no domínio para justificá-los.
- **Edição/exclusão de solicitações** não faz parte do escopo do desafio (só criação, consulta, listagem e transição de status) e não foi implementada.

## 🏗️ Arquitetura

```
[Navegador]
     |
     |  HTTP
     v
[Frontend React + Vite — :5173]
     |
     |  HTTP/REST (/api/v1)
     v
[Backend Laravel 11 (PHP 8.3) — :8000]
     |
     |  SQL
     v
[PostgreSQL 16 — :5432]

Todos os três serviços compartilham a rede Docker "atendsaude_net";
o frontend nunca acessa o banco diretamente, apenas via API.
```

**Decisões arquiteturais principais** (detalhadas em `Documentação/ADRs_Decisoes_Arquiteturais.docx`):

| Decisão | Resumo |
|---|---|
| Service/Action Pattern | A transição de status e a geração de protocolo vivem em Actions dedicadas (`app/Actions/Solicitacao/`), não no Controller — regra testável isoladamente, sem subir HTTP. |
| Enum como máquina de estados | `StatusSolicitacao` (PHP enum nativo) centraliza o mapa de transições permitidas — única fonte de verdade, consultada pela Action e pelos testes. |
| Protocolo atômico | Contador por ano (`protocolo_sequences`) via `INSERT ... ON CONFLICT ... DO UPDATE ... RETURNING`, na mesma transação da criação da solicitação. |
| Enums nativos do Postgres | `categoria_solicitacao`, `prioridade_solicitacao`, `status_solicitacao` são tipos `ENUM` do Postgres (não apenas `VARCHAR + CHECK`), criados via SQL puro na migration. |
| Contrato tipado no frontend | Tipos TypeScript em `frontend/src/types/solicitacao.ts` espelham manualmente os DTOs da API — sem geração automática a partir do OpenAPI. |

### 🔧 Ajustes de Ambiente Aplicados

Durante a validação local em Docker, quatro ajustes foram necessários em relação à configuração inicial — registrados aqui para reprodutibilidade e transparência (nenhum deles indica um problema na lógica de negócio, apenas na configuração de build):

| # | Problema | Causa | Ajuste aplicado |
|---|---|---|---|
| 1 | Build do backend falhava ao resolver dependências do Composer | `composer.lock` referenciava pacotes Symfony que exigiam PHP 8.4, incompatíveis com a imagem `php:8.3-cli-alpine` | `composer.lock` apagado e regenerado localmente com PHP 8.3, travando as dependências na versão compatível |
| 2 | Build do backend falhava com exit code 1 no `composer install` | Scripts pós-instalação do Composer (`@php artisan package:discover`, etc.) tentavam rodar antes do código do Laravel existir no container | Dockerfile ajustado para `composer install --no-scripts --no-autoloader` → `COPY` do código → `composer dump-autoload --optimize` |
| 3 | Build do frontend falhava com `/frontend: not found` | Comando `COPY frontend/ .` não correspondia ao contexto de build configurado | Ajustado para `COPY . .`, consistente com o contexto de build definido no `docker-compose.yml` |
| 4 | Container do `db` não subia / conflito de porta | PostgreSQL local da máquina host já ocupava a porta `5432` | Conflito de porta identificado e resolvido no ambiente local antes de subir o Compose |

## 📐 Mapeamento das Regras de Negócio

### Protocolo único

- Formato: `SOL-{ano}-{sequencial:04d}` (ex.: `SOL-2026-0001`).
- Gerado por `GerarProtocoloAction`, via `INSERT ... ON CONFLICT (ano) DO UPDATE ... RETURNING` na tabela `protocolo_sequences` — atômico, sem colisão sob concorrência.
- Executado na **mesma transação** da criação da solicitação (`CriarSolicitacaoAction`): se a criação falhar, o incremento do contador é revertido junto.

### Prioridade `URGENTE` exige justificativa

- Validado em duas camadas independentes (defesa em profundidade):
  1. **Aplicação:** `StoreSolicitacaoRequest::withValidator()` rejeita com `422` quando `prioridade = URGENTE` e `justificativa_prioridade` está vazia.
  2. **Banco de dados:** `CONSTRAINT chk_justificativa_urgente CHECK (prioridade <> 'URGENTE' OR justificativa_prioridade IS NOT NULL)` — protege a integridade mesmo contra inserts que não passem pela validação do Laravel.

### Máquina de estados de status

Única fonte de verdade: `App\Enums\StatusSolicitacao::transicoesPermitidas()`, consultada por `AtualizarStatusSolicitacaoAction` e pelos testes.

| Status atual | Transições permitidas | Transições bloqueadas (exemplos) |
|---|---|---|
| `RECEBIDA` | `EM_ANALISE`, `CANCELADA` | `AGENDADA`, `CONCLUIDA` (pulam etapas) |
| `EM_ANALISE` | `AGENDADA`, `CANCELADA` | `RECEBIDA` (retrocesso) |
| `AGENDADA` | `CONCLUIDA`, `CANCELADA` | `EM_ANALISE` (retrocesso) |
| `CONCLUIDA` | *nenhuma — status final* | qualquer alteração |
| `CANCELADA` | *nenhuma — status final* | qualquer alteração |

Toda transição fora da tabela acima é rejeitada com `422` e `TransicaoStatusInvalidaException`, nunca falha silenciosamente ou aplica parcialmente.

## 🛠️ Tecnologias e Versões

| Camada | Tecnologia | Função |
|---|---|---|
| Backend | PHP 8.3 (imagem `php:8.3-cli-alpine`) + Laravel 11 | API REST, validação, Eloquent ORM |
| Backend | PostgreSQL 16 (`postgres:16-alpine`) | Persistência relacional, enums nativos |
| Backend | PHPUnit (bundled no Laravel) | Testes de regra de negócio e de endpoints |
| Frontend | React 18 + TypeScript + Vite | SPA com HMR, porta `5173` |
| Frontend | Tailwind CSS 3 | Estilização via classes utilitárias e camada de componentes |
| Frontend | Lucide React | Ícones vetoriais |
| Frontend | Axios | Cliente HTTP |
| Frontend | Vitest + Testing Library | Testes de componente |
| Infraestrutura | Docker + Docker Compose | Orquestração de backend, frontend e banco |
| Documentação | OpenAPI 3.0 | Contrato da API (`openapi.yaml`) |

## ⚙️ Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- Git

## 📁 Estrutura de Pastas

```
atendsaude/
├── docker-compose.yml
├── openapi.yaml
├── README.md
├── .env.example
├── docs/                          # Documentação de arquitetura
│   ├── modelo_dados.md            # ERD (Mermaid) + dicionário de dados
│   ├── modelo_c4.md               # Modelo C4 — Contexto e Contêineres
│   ├── contrato_api.md            # Contrato da API em Markdown
│   ├── ADRs.md                    # Registros de Decisão Arquitetural
│   ├── deploy.md                  # Guia prático de deploy (VPS ou Render)
│   └── Revisao_Documentacao.docx  # Gerado por generate_docs.py, para revisão no Word
├── generate_docs.py               # Consolida /docs em um único .docx
├── docker/
│   ├── backend/{Dockerfile,entrypoint.sh}
│   └── frontend/Dockerfile
├── .github/workflows/
│   ├── ci.yml                     # Lint + testes de backend e frontend
│   └── deploy.yml                 # CD ilustrativo via SSH
├── backend/                       # Laravel 11
│   ├── app/
│   │   ├── Actions/Solicitacao/   # GerarProtocolo, CriarSolicitacao, AtualizarStatus
│   │   ├── Enums/                 # CategoriaSolicitacao, PrioridadeSolicitacao, StatusSolicitacao
│   │   ├── Exceptions/            # TransicaoStatusInvalidaException
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/SolicitacaoController.php
│   │   │   ├── Requests/          # Store/UpdateStatus SolicitacaoRequest
│   │   │   └── Resources/SolicitacaoResource.php
│   │   └── Models/Solicitacao.php
│   ├── database/{migrations,factories,seeders}/
│   ├── routes/api.php
│   ├── tests/Feature/{Actions,Api/V1}/
│   └── phpunit.xml
└── frontend/                      # React 18 + TypeScript + Vite
    ├── index.html
    ├── tailwind.config.js
    ├── public/favicon.svg
    └── src/
        ├── types/solicitacao.ts
        ├── services/{api.ts,solicitacaoService.ts}
        ├── components/            # Badges, KpiCard, Filtros, Formulário, Modal
        │   └── __tests__/FormularioSolicitacao.test.tsx
        ├── pages/Dashboard.tsx
        ├── styles/app.css
        └── test/setup.ts
```

## 📦 Instalação e Execução (Docker Compose)

```bash
# 1. Clonar o repositório
git clone https://github.com/albertsantanadev/atendsaude.git
cd atendsaude

# 2. Configurar variáveis de ambiente (arquivo consumido pelo docker-compose.yml)
cp .env.example .env

# 3. Subir os containers (build + start)
docker compose up -d --build
```

Ao subir, o container do backend automaticamente:
1. Aguarda o PostgreSQL ficar disponível (`pg_isready`);
2. Cria `backend/.env` a partir do `.env.example` do Laravel, caso ainda não exista;
3. Gera a `APP_KEY`, se estiver vazia (`php artisan key:generate --force`);
4. Roda as migrations (`php artisan migrate --force`);
5. Executa os seeders com dados fictícios (`php artisan db:seed --force`).

Se precisar repetir algum desses passos manualmente (por exemplo, após alterar uma migration):
```bash
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate --seed
```

**Serviços disponíveis após o `up`:**
- Frontend: http://localhost:5173
- API: http://localhost:8000/api/v1
- Health check: http://localhost:8000/api/v1/health

## 🔑 Variáveis de Ambiente

O arquivo `.env` na **raiz** do projeto alimenta o `docker-compose.yml` (nomes de containers, portas, credenciais do Postgres) e é repassado ao container do backend via `env_file`:

```env
APP_NAME=AtendSaude
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=atendsaude
DB_USERNAME=postgres
DB_PASSWORD=postgres

VITE_API_BASE_URL=http://localhost:8000/api/v1
```

> ⚠️ **Nunca suba o arquivo `.env` real para o repositório.** Apenas `.env.example` é versionado — `.env` já está listado no `.gitignore`.

## 🧪 Testes Automatizados

### Backend (PHPUnit)

| Arquivo | Cobre |
|---|---|
| `tests/Feature/Actions/AtualizarStatusSolicitacaoActionTest.php` | Todas as transições válidas, transições inválidas, e bloqueio de alteração em status final |
| `tests/Feature/Api/V1/StoreSolicitacaoTest.php` | Criação de solicitação, geração sequencial de protocolo, rejeição de `URGENTE` sem justificativa (422) |
| `tests/Feature/Api/V1/HealthCheckTest.php` | Resposta `200/ok` e `503/degraded` do health check |

O banco de testes é isolado (`atendsaude_test`, configurado em `phpunit.xml`) para não afetar os dados de desenvolvimento.

```bash
docker compose exec backend php artisan test
```

### Frontend (Vitest + Testing Library)

`src/components/__tests__/FormularioSolicitacao.test.tsx` cobre a exibição condicional do campo de justificativa, o payload enviado e a exibição de erros de validação vindos do backend.

```bash
cd frontend
npm run test
```

## 📑 Documentação da API (OpenAPI)

A especificação completa (endpoints, parâmetros, schemas de enum, DTOs de entrada e envelopes de resposta/erro) está em [`openapi.yaml`](./openapi.yaml), na raiz do projeto. Pode ser visualizada em qualquer editor com suporte a OpenAPI (ex.: extensão Swagger Viewer do VS Code) ou colada em https://editor.swagger.io.

## 🌿 Convenção de Commits

O histórico segue [Conventional Commits](https://www.conventionalcommits.org/):
```
feat(api): adiciona endpoint de atualização de status
fix(docker): corrige contexto de build do frontend
test(domain): cobre transições da máquina de estados
docs(readme): documenta ajustes de ambiente
style(frontend): aplica identidade visual MedTech com Tailwind
```

## 🤖 Declaração de Uso de Inteligência Artificial

Em conformidade com a seção 3 do edital, este projeto foi desenvolvido com apoio intensivo de IA (Claude, Anthropic), usada como par de arquitetura e desenvolvimento ao longo de todas as fases:

- **Planejamento (Fase 0):** geração das User Stories, modelo de dados relacional, contrato de API e ADRs a partir dos requisitos do edital, para validação prévia antes de escrever código.
- **Infraestrutura (Fase 1):** geração do `docker-compose.yml` e dos `Dockerfile`s iniciais de backend e frontend.
- **Backend (Fase 2):** geração das migrations, enums, Model, Factory/Seeder, FormRequests, Actions da máquina de estados e Controller/Resources, a partir das decisões já validadas na Fase 0.
- **Testes e OpenAPI (Fase 3):** geração da especificação `openapi.yaml` e dos testes PHPUnit de regra de negócio e de endpoint.
- **Frontend (Fase 4-5):** geração dos tipos TypeScript, serviços de API, componentes React e da identidade visual (Tailwind CSS + Lucide React), incluindo o teste de componente com Vitest/Testing Library.
- **Documentação de engenharia:** geração dos diagramas ERD e C4 (Mermaid), dos ADRs consolidados (`docs/ADRs.md`), do guia de deploy (`docs/deploy.md`), dos workflows de CI/CD e do script `generate_docs.py` usado para consolidar a documentação em `.docx` para revisão.
- **Depuração de ambiente:** a resolução prática dos 4 ajustes de Docker/Composer listados na seção de Arquitetura acima (incompatibilidade PHP 8.3/8.4, ordem de scripts no build do Composer, contexto de build do frontend e conflito de porta) foi feita **pelo candidato**, rodando e depurando o ambiente localmente — a IA documentou essas correções a pedido, mas não executou o ambiente Docker diretamente.

Todo o código gerado foi revisado, executado e compreendido pelo candidato antes da entrega, que também validou manualmente o fluxo ponta a ponta (criação → listagem/filtros → transição de status) em ambiente Docker local.

## 📄 Licença

Projeto desenvolvido para fins de avaliação técnica (Seleção V-Lab, CIn-UFPE).
