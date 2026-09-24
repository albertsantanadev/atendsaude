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

📐 Arquitetura detalhada: [`docs/modelo_dados.md`](./docs/modelo_dados.md) (ERD) · [`docs/modelo_c4.md`](./docs/modelo_c4.md) (C4) · [`docs/contrato_api.md`](./docs/contrato_api.md) · [`docs/deploy.md`](./docs/deploy.md) (proposta de produção)

> **Nota:** este projeto foi desenvolvido para o Desafio Técnico Full Stack da seleção V-Lab (CIn-UFPE).

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
- **Pipeline de CI** agora configurado (`.github/workflows/ci.yml`).
- **Testes E2E** (Cypress/Playwright) não foram feitos — a cobertura de frontend é de componente (Testing Library), não de fluxo ponta a ponta no navegador.
- **Logs estruturados/correlação de requisições** não foram implementados além do log padrão do Laravel.
- **Eventos/filas assíncronas** não são usados — não havia processamento longo o suficiente no domínio para justificá-los.
- **Edição/exclusão de solicitações** não faz parte do escopo do desafio (só criação, consulta, listagem e transição de status) e não foi implementada.
- **Deploy em produção** não foi realizado — `docs/deploy.md` é uma proposta de arquitetura, não uma infraestrutura provisionada.

## 🏗️ Arquitetura