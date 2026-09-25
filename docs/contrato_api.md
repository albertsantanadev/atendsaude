<!-- ficheiro: docs/contrato_api.md -->

# Contrato da API REST — AtendSaúde

> Espelha `openapi.yaml` (raiz do projeto) em formato legível. Em caso de divergência, `openapi.yaml` é a fonte de verdade.

**Base URL:** `/api/v1`
**Formato:** todas as respostas de sucesso são envelopadas em `{ "data": ... }` (listagens incluem também `meta` e `links`), seguindo o padrão de API Resources do Laravel.

---

## `POST /solicitacoes`

Cria uma nova solicitação. Status inicial sempre `RECEBIDA`; protocolo gerado automaticamente.

**Parâmetros de corpo (JSON):**

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `nome_solicitante` | string (máx. 150) | sim | |
| `categoria` | enum | sim | `CONSULTA`, `EXAME`, `VACINACAO`, `OUTRO` |
| `prioridade` | enum | sim | `BAIXA`, `MEDIA`, `ALTA`, `URGENTE` |
| `descricao` | string | sim | |
| `justificativa_prioridade` | string \| null | condicional | obrigatório se `prioridade = URGENTE` |

**201 Created**
```json
{
  "data": {
    "id": "b1f2e3a4-5678-90ab-cdef-1234567890ab",
    "protocolo": "SOL-2026-0001",
    "nome_solicitante": "Maria da Silva",
    "categoria": "CONSULTA",
    "prioridade": "ALTA",
    "status": "RECEBIDA",
    "descricao": "Encaminhamento para consulta cardiológica",
    "justificativa_prioridade": null,
    "data_criacao": "2026-09-17T13:00:00Z",
    "data_atualizacao": "2026-09-17T13:00:00Z"
  }
}
```

**422 Unprocessable Entity** (ex.: `URGENTE` sem justificativa)
```json
{
  "message": "Os dados informados são inválidos.",
  "errors": {
    "justificativa_prioridade": ["O campo justificativa da prioridade é obrigatório quando a prioridade é URGENTE."]
  }
}
```

---

## `GET /solicitacoes`

Lista solicitações com paginação e filtros.

**Query params:**

| Param | Tipo | Default | Observação |
|---|---|---|---|
| `page` | integer | `1` | |
| `per_page` | integer | `15` | máx. `100` |
| `status` | enum | — | filtro exato |
| `categoria` | enum | — | filtro exato |
| `prioridade` | enum | — | filtro exato |

**200 OK**
```json
{
  "data": [ { "...solicitação..." } ],
  "meta": { "current_page": 1, "per_page": 15, "total": 42, "last_page": 3 },
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." }
}
```

---

## `GET /solicitacoes/{id}`

Consulta os detalhes de uma solicitação. `{id}` é o UUID.

**200 OK:** objeto único, mesmo formato do `POST`.

**404 Not Found**
```json
{ "message": "Solicitação não encontrada." }
```

---

## `PATCH /solicitacoes/{id}/status`

Atualiza o status respeitando a máquina de estados abaixo. Regra centralizada em `App\Enums\StatusSolicitacao::transicoesPermitidas()`.

| Status atual | Próximos status permitidos |
|---|---|
| `RECEBIDA` | `EM_ANALISE`, `CANCELADA` |
| `EM_ANALISE` | `AGENDADA`, `CANCELADA` |
| `AGENDADA` | `CONCLUIDA`, `CANCELADA` |
| `CONCLUIDA` | *(nenhum — status final)* |
| `CANCELADA` | *(nenhum — status final)* |

**Corpo:**
```json
{ "status": "EM_ANALISE" }
```

**200 OK:** solicitação atualizada, `data_atualizacao` renovado.

**422 Unprocessable Entity** (transição inválida ou status já final)
```json
{
  "message": "Transição de status inválida.",
  "errors": { "status": ["Não é permitido mudar de CONCLUIDA para EM_ANALISE."] }
}
```

**404 Not Found:** solicitação inexistente.

---

## `GET /health`

Health check da API e da conexão com o PostgreSQL.

**200 OK**
```json
{ "status": "ok", "database": "connected", "timestamp": "2026-09-17T13:00:00Z" }
```

**503 Service Unavailable** (Postgres inacessível)
```json
{ "status": "degraded", "database": "unavailable", "timestamp": "2026-09-17T13:00:00Z" }
```
