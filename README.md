# Ekklesia Client

Frontend React do sistema Ekklesia para gestao de igreja.

## Requisitos

- Node.js 20+
- npm 10+

## Ambiente

Crie um arquivo `.env` com:

```env
VITE_API_URL=http://localhost:3000
VITE_REACT_USE_MOCKS=false
```

Notas:
- Em ambientes fora de desenvolvimento, `VITE_API_URL` e obrigatorio.
- Em ambientes fora de desenvolvimento, mock (`VITE_REACT_USE_MOCKS=true`) e bloqueado por seguranca.

## Scripts

- `npm run dev`: inicia ambiente local
- `npm run lint`: valida regras de lint
- `npm run test`: executa testes unitarios (Vitest)
- `npm run build`: gera build de producao
- `npm run preview`: serve build localmente

## Funcionalidades principais

- Dashboard com metricas, crescimento acumulado e atividades recentes
- CRUD de membros, eventos, cultos, avisos, oracao e cultos registrados
- Vinculacao de evento ao Google Agenda com pre-preenchimento
- Controle de acesso por perfil (ADMIN, SUPERVISOR, SUPERADMIN)
- Tratamento padronizado de erros de API (`message` + `error`)

## Seguranca e sessao

- Token JWT validado no cliente com checagem de expiracao (`exp`)
- Interceptor global para `401/403` com logout local e redirecionamento para autenticacao
- Limpeza de cache de queries ao invalidar sessao

## Estrutura (resumo)

- `src/pages`: telas por dominio
- `src/services/api`: modulos por recurso (`types`, `service`, `mock`, `index`)
- `src/services/axios`: cliente HTTP e interceptors
- `src/utils`: utilitarios transversais

## Observacoes

- Se o backend nao permitir criacao de ADMIN via endpoint de usuarios, a tela de pessoas respeita essa regra e evita envio invalido no frontend.
