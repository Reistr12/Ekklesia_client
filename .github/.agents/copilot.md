# Ekklesia Platform — Frontend Architecture Context

Você está trabalhando na Ekklesia Platform, uma plataforma SaaS multimodular para gestão de igrejas modernas.

A aplicação deve transmitir:

* tecnologia
* clareza
* modernidade
* organização
* cuidado humano
* experiência SaaS premium

A stack utilizada é:

* React
* TypeScript
* Vite
* React Router DOM
* TailwindCSS
* Lucide Icons
* Axios
* React Query/TanStack Query
* Zustand (estado global)
* Framer Motion

A arquitetura do frontend deve seguir separação clara de responsabilidades.

IMPORTANTE:

* evitar componentes gigantes
* evitar lógica de negócio dentro de páginas
* evitar chamadas diretas de API dentro de componentes
* priorizar reutilização
* priorizar escalabilidade
* seguir padrão enterprise frontend

Estrutura esperada:

src/
├── assets/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── charts/
│   ├── forms/
│   ├── feedback/
│   └── tables/
│
├── pages/
│   ├── dashboard/
│   ├── ...
│
├── routes/
│
├── services/
│   ├── api/
│   │   ├── dashboard/
│   │   ├   ├── mock.ts
│   │   ├   ├── types.ts
│   │   ├   └── service.ts
│   │   ├── .../
│   │
│   ├── axios/
│   └── env/
│
├── store/
│
├── hooks/
│
├── contexts/
│
├── utils/
│
├── types/
│
├── constants/
│
├── styles/
│
└── main.tsx

Padrões obrigatórios:

* Cada módulo deve possuir:

  * mock.ts
  * types.ts
  * service.ts

* mock.ts:
  contém apenas dados mockados.

* types.ts:
  contém interfaces/types do módulo.

* service.ts:
  simula chamadas HTTP usando Promise e setTimeout.

Exemplo:

* getDashboardData()
* getVisitors()
* getBranches()

As páginas devem:

* consumir apenas services
* nunca acessar mocks diretamente (A menos que a variavel REACT_USE_MOCK esteja como true no .env)

Os componentes devem:

* ser pequenos
* reutilizáveis
* desacoplados

A UI deve seguir:

* visual clean
* dark sidebar
* cards modernos
* bordas suaves
* espaçamento generoso
* dashboard estilo SaaS premium

Paleta principal:

* #081028
* #0057FF
* #003A9B
* #F5F9FF

Tipografia:

* Inter
  ou
* Poppins

A experiência deve parecer:

* Linear
* Notion
* Stripe
* Slack

A plataforma é mobile-first.

Sempre criar:

* loading states
* empty states
* responsive layout
* componentes reutilizáveis

Evitar:

* CSS inline
* lógica duplicada
* componentes enormes
* acoplamento excessivo
* hardcode espalhado

Todo código deve parecer produção real de startup SaaS moderna.
