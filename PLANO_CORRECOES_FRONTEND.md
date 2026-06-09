# Plano de Correcao - Auditoria Frontend

Data da analise: 2026-06-08
Escopo: React + Vite + React Query + Axios + Router + Tailwind

## Objetivo
Consolidar todos os pontos encontrados na analise de arquitetura, padronizacao, qualidade e seguranca, com impacto e acao recomendada.

## Prioridade Alta

### 1) Mock habilitado por padrao (risco de deploy incorreto)
- Evidencia:
  - src/services/env/config.ts (useMock default true)
  - src/services/api/*/index.ts (seleciona mock quando useMock true)
  - src/services/api/auth/mock.ts (credenciais mock fixas)
- Impacto:
  - Possibilidade de ambiente produtivo rodar com dados/mock e autenticacao fraca.
- Correcao:
  - Alterar default de useMock para false.
  - Bloquear inicializacao em producao quando mock estiver ativo.
  - Exigir variavel explicita para ativar mock apenas em desenvolvimento.
- Status: [ ]

### 2) Autenticacao no cliente valida apenas existencia de token
- Evidencia:
  - src/utils/auth.ts (isAuthenticated retorna Boolean(token))
  - src/routes/ProtectedRoute.tsx
  - src/routes/PublicOnlyRoute.tsx
- Impacto:
  - Token expirado/invalido pode manter usuario como "logado" localmente ate falha de API.
- Correcao:
  - Validar exp do JWT no cliente.
  - Invalidar sessao local ao expirar.
  - Tratar 401 globalmente com logout controlado.
- Status: [ ]

### 3) Token armazenado em localStorage
- Evidencia:
  - src/utils/auth.ts (get/set/clear em localStorage)
- Impacto:
  - Em caso de XSS, token pode ser exfiltrado.
- Correcao:
  - Migrar para cookie HttpOnly + Secure + SameSite (dependente de backend).
  - Reduzir superficie XSS e aplicar CSP no deploy.
- Status: [ ]

### 4) Claims de autorizacao sao apenas decodificadas no frontend
- Evidencia:
  - src/utils/auth.ts (parseJwtPayload, hasAnyRole, isChurchAdmin)
- Impacto:
  - Frontend nao verifica assinatura; dados de role/churchId podem ser manipulados no cliente.
- Correcao:
  - Manter frontend apenas como camada de UX.
  - Garantir autorizacao estrita no backend para todas as rotas sensiveis.
- Status: [ ]

## Prioridade Media

### 5) Sem interceptor global de resposta para 401/403
- Evidencia:
  - src/services/axios/client.ts (apenas interceptor de request)
- Impacto:
  - Sessao invalida nao e tratada de forma centralizada.
- Correcao:
  - Adicionar interceptor de response para:
    - limpar credenciais,
    - limpar cache sensivel,
    - redirecionar para login quando aplicavel.
- Status: [ ]

### 6) Falhas parciais da API podem ser mascaradas como "sem dados"
- Evidencia:
  - src/services/api/dashboard/service.ts (Promise.allSettled)
  - src/services/api/settings/service.ts (Promise.allSettled)
- Impacto:
  - Incidentes parciais ficam silenciosos e dificultam diagnostico.
- Correcao:
  - Expor estado degradado quando parte das fontes falhar.
  - Mostrar feedback de erro parcial para usuario/admin.
- Status: [ ]

### 7) Configuracao de ambiente sem guarda forte de base URL
- Evidencia:
  - src/services/env/config.ts (apiBaseUrl pode ser string vazia)
- Impacto:
  - Requisicoes podem ir para origem errada ou falhar de forma confusa.
- Correcao:
  - Tornar VITE_API_URL obrigatoria fora de dev.
  - Fail-fast na inicializacao quando ausente.
- Status: [ ]

### 8) Lint com erros em hooks/efeitos (qualidade e estabilidade)
- Evidencia (7 erros):
  - src/pages/announcements/AnnouncementsPage.tsx
  - src/pages/church-services/ChurchServicesPage.tsx
  - src/pages/events/EventsPage.tsx
  - src/pages/members/MembersPage.tsx
  - src/pages/prayer/PrayerPage.tsx
  - src/pages/recorded-services/RecordedServicesPage.tsx
- Impacto:
  - Risco de render em cascata e comportamento instavel.
- Correcao:
  - Refatorar paginacao derivada sem setState sincronico em effect.
  - Remover chamadas impuras em render (ex.: Date.now direto na renderizacao).
- Status: [ ]

### 9) Bundle principal acima do limite recomendado
- Evidencia:
  - Build reportou chunk principal > 500 kB.
- Impacto:
  - Piora de performance (download, parse e TTI).
- Correcao:
  - Implementar code splitting por rotas (lazy).
  - Revisar imports de bibliotecas e chunks.
- Status: [ ]

## Prioridade Baixa

### 10) Hooks de pagina com sinal de codigo legado/nao utilizado
- Evidencia:
  - src/pages/*/hook/use*Page.tsx existem, mas paginas principais concentram logica propria.
- Impacto:
  - Duplicacao de responsabilidade e confusao arquitetural.
- Correcao:
  - Remover hooks mortos ou padronizar uso deles nas paginas.
- Status: [ ]

### 11) Inconsistencia de estilo entre modulos
- Evidencia:
  - src/services/api/events/index.ts usa estilo diferente do restante.
- Impacto:
  - Ruido em PR e manutencao.
- Correcao:
  - Adotar formatter unico (Prettier) + regras de lint de estilo.
- Status: [ ]

### 12) App.tsx ocioso
- Evidencia:
  - src/App.tsx retorna null e nao e entry principal.
  - src/main.tsx usa AppRoutes diretamente.
- Impacto:
  - Ambiguidade de arquitetura.
- Correcao:
  - Remover App.tsx ocioso ou reutilizar como shell principal.
- Status: [ ]

### 13) README sem documentacao real do projeto
- Evidencia:
  - README.md ainda no template padrao de Vite.
- Impacto:
  - Onboarding e operacao mais dificeis.
- Correcao:
  - Documentar arquitetura, setup, env, convencoes e seguranca.
- Status: [ ]

### 14) Ausencia de suite de testes no fluxo principal
- Evidencia:
  - package.json sem script de teste.
- Impacto:
  - Maior risco de regressao em auth, rotas protegidas e CRUD.
- Correcao:
  - Incluir framework de testes e cobertura minima para fluxos criticos.
- Status: [ ]

### 15) Hardening de seguranca de entrega nao definido no frontend
- Evidencia:
  - Nao ha indicacao de CSP/headers de seguranca no app (esperado no servidor/reverse proxy).
- Impacto:
  - Menor resiliencia contra XSS/clickjacking em producao.
- Correcao:
  - Configurar no servidor de entrega: CSP, frame-ancestors/X-Frame-Options, Referrer-Policy, Permissions-Policy.
- Status: [ ]

## Checklist de Execucao Recomendada

### Fase 1 - Seguranca critica
- [ ] Trocar useMock default para false e proteger ambiente de producao.
- [ ] Implementar tratamento global de 401/403.
- [ ] Revisar estrategia de token (migracao para cookie HttpOnly com backend).
- [ ] Implementar validacao de expiracao do token no cliente.

### Fase 2 - Estabilidade e qualidade
- [ ] Corrigir os 7 erros atuais de lint.
- [ ] Melhorar sinalizacao de erro parcial em servicos com allSettled.
- [ ] Tornar VITE_API_URL obrigatoria fora de desenvolvimento.

### Fase 3 - Padronizacao e manutencao
- [ ] Limpar hooks legados/nao usados.
- [ ] Uniformizar estilo de codigo com formatter + lint.
- [ ] Atualizar README com guias do projeto.
- [ ] Planejar e adicionar testes automatizados.

## Validacoes apos correcao
- [ ] npm run lint sem erros.
- [ ] npm run build sem erros.
- [ ] Smoke test manual de login/logout, protecao de rota e CRUD principal.
- [ ] Verificacao de comportamento com API fora, API parcial e token expirado.
