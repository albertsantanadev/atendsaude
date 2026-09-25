<!-- ficheiro: docs/ADRs.md -->

# Registros de Decisão Arquitetural (ADRs) — AtendSaúde

Formato: Contexto → Decisão → Alternativas consideradas → Consequências. Todas as decisões abaixo foram validadas na Fase 0 (planejamento) antes da escrita de código e permanecem em vigor na versão atual do projeto.

---

## ADR-001 — Service/Action Pattern para a máquina de estados

**Status:** Aceito

**Contexto:** a transição de status (`RECEBIDA → EM_ANALISE → AGENDADA → CONCLUIDA/CANCELADA`) é a regra de negócio mais crítica do domínio e a mais fácil de "vazar" para o Controller ao longo do tempo, tornando-a difícil de testar isoladamente.

**Decisão:** o mapa de transições permitidas vive em `App\Enums\StatusSolicitacao::transicoesPermitidas()` (única fonte de verdade). Uma classe dedicada, `AtualizarStatusSolicitacaoAction`, consulta esse mapa, executa a mudança dentro de uma transação de banco e lança `TransicaoStatusInvalidaException` quando a transição é ilegal ou o status atual já é final.

**Alternativas consideradas:**
- *Regra dentro do Model (Eloquent observer/mutator):* rejeitada — acopla a regra ao ciclo de vida do Eloquent, dificultando testar a transição sem side effects de persistência.
- *Regra dentro do Controller:* rejeitada — é exatamente o anti-padrão que o edital pede para evitar ("Controllers não devem concentrar regras de negócio relevantes").

**Consequências:** o Controller vira apenas orquestração (FormRequest → Action → Resource); a regra é testável isoladamente com PHPUnit sem subir HTTP (ver `tests/Feature/Actions/AtualizarStatusSolicitacaoActionTest.php`).

---

## ADR-002 — Geração atômica de protocolo

**Status:** Aceito

**Contexto:** cada solicitação precisa de um protocolo único e legível por humanos, no formato `SOL-{ano}-{sequencial:04d}`, sem colisão mesmo sob criação concorrente.

**Decisão:** uma tabela de apoio (`protocolo_sequences`, chave primária `ano`) é atualizada via `INSERT ... ON CONFLICT (ano) DO UPDATE SET ultimo_numero = ultimo_numero + 1 RETURNING ultimo_numero`, dentro da **mesma transação** que cria a solicitação (`CriarSolicitacaoAction`). Se a criação falhar, o incremento é revertido junto — sem "buracos" na numeração.

**Alternativas consideradas:**
- *Sequência nativa do Postgres (`SERIAL`/`SEQUENCE`):* rejeitada — não reseta por ano automaticamente sem lógica adicional, e o `nextval()` não é transacional (uma sequência consumida e depois revertida por rollback deixa buraco na numeração).
- *UUID como protocolo:* rejeitada — não é amigável para um operador humano (edital pede um código memorável/rastreável).

**Consequências:** garante unicidade e continuidade sob concorrência, ao custo de uma tabela e uma query extra por criação — trade-off aceitável dado o volume esperado do domínio.

---

## ADR-003 — Enums nativos do PostgreSQL

**Status:** Aceito

**Contexto:** os campos `categoria`, `prioridade` e `status` têm um conjunto fechado e pequeno de valores válidos.

**Decisão:** `categoria_solicitacao`, `prioridade_solicitacao` e `status_solicitacao` são tipos `ENUM` nativos do Postgres (criados via `DB::statement` na migration), não `VARCHAR` com `CHECK`. No Laravel, são mapeados para PHP backed enums (`App\Enums\*`) via cast no Model.

**Alternativas consideradas:**
- *`VARCHAR` + `CHECK` constraint:* mais portável entre SGBDs, mas realiza a mesma validação com um tipo menos expressivo — o schema por si só não documenta os valores possíveis ao inspecionar a tabela.

**Consequências:** integridade garantida no nível do banco mesmo para inserts fora da aplicação; ganho de auto-documentação do schema. Custo: menor portabilidade (enums do Postgres não migram automaticamente para outro SGBD), aceitável pois a stack já fixa PostgreSQL.

---

## ADR-004 — Estratégia de containers (Docker Compose)

**Status:** Aceito

**Contexto:** o desafio exige execução integrada e reproduzível via Docker Compose.

**Decisão:** três serviços — `db` (`postgres:16-alpine`, com healthcheck), `backend` (Laravel via `php artisan serve`, atrás de um `entrypoint.sh` que aguarda o banco, gera a `APP_KEY`, roda migrations e seeders) e `frontend` (Vite dev server) — na mesma rede Docker `atendsaude_net`.

**Alternativas consideradas:**
- *PHP-FPM + Nginx no backend:* mais próximo de produção, mas adiciona um serviço e configuração extra sem benefício para o escopo de desenvolvimento/avaliação local. Registrado como ajuste necessário em `docs/deploy.md` para produção.

**Consequências:** setup mais simples para o avaliador (`docker compose up -d --build` e pronto), com a ressalva documentada de que `php artisan serve` não é recomendado para produção.

---

## ADR-005 — Contrato tipado e desacoplamento frontend/backend

**Status:** Aceito

**Contexto:** o edital exige que o frontend consuma exclusivamente a API, com tipos TypeScript consistentes e sem uso indiscriminado de `any`.

**Decisão:** o contrato é versionado em `/api/v1` e documentado em `openapi.yaml` + `docs/contrato_api.md`. Os tipos TypeScript (`frontend/src/types/solicitacao.ts`) espelham manualmente os DTOs da API.

**Alternativas consideradas:**
- *Geração automática de tipos a partir do OpenAPI (ex.: `openapi-typescript`):* avaliada e descartada para o escopo atual — adicionaria uma etapa de build extra e uma dependência de geração de código para um contrato com poucos endpoints, sem benefício proporcional ao esforço. Fica registrada como possível evolução caso a API cresça.

**Consequências:** exige disciplina manual para manter os tipos sincronizados com a API a cada mudança de contrato; aceitável dado o tamanho atual do domínio.

---

## ADR-006 — Estratégia de testes

**Status:** Aceito

**Contexto:** o edital pede testes determinísticos e independentes de dados reais, tanto no backend quanto no frontend.

**Decisão:**
- **Backend:** testes de Feature (PHPUnit) rodando contra um banco Postgres **real e isolado** (`atendsaude_test`, configurado em `phpunit.xml`), não SQLite em memória — necessário porque as migrations usam `CREATE TYPE ... AS ENUM`, sintaxe específica do Postgres que o SQLite não suporta.
- **Frontend:** teste de componente (Vitest + Testing Library) sobre `FormularioSolicitacao`, validando comportamento (exibição condicional do campo de justificativa, payload enviado, exibição de erros de validação), não apenas snapshot ou cobertura de linha.

**Alternativas consideradas:**
- *SQLite em memória para testes de backend:* rejeitada pela incompatibilidade com enums nativos do Postgres (exigiria duplicar a lógica das migrations com um dialeto diferente do de produção, quebrando a garantia de que o teste reflete o schema real).
- *Testes E2E (Cypress/Playwright) no lugar do teste de componente:* considerados, mas não implementados neste ciclo por restrição de tempo — registrado como limitação conhecida em `README.md`.

**Consequências:** suíte de backend mais fiel ao ambiente de produção, ao custo de exigir um Postgres disponível (já satisfeito pelo próprio Docker Compose do projeto) em vez de um banco em memória mais rápido de inicializar.
