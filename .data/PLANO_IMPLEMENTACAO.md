# Plano de Implementação — Controle Arterial (PWA)

## 📌 Visão Geral

App PWA mobile-first para acompanhamento de **Pressão Arterial**, **Batimentos Cardíacos** e **Saturação O2**.
Design moderno em Dark Mode, classificação automática da PA (SBC 2025), gráficos de tendência e histórico visual.

## 🛠 Stack Tecnológica

Idêntica ao projeto de referência **Medida Fácil**:

| Componente     | Tecnologia                          |
| -------------- | ----------------------------------- |
| Estrutura      | HTML5 semântico                     |
| Estilização    | CSS3 Vanilla (variáveis CSS, flexbox, grid) |
| Lógica         | JavaScript Vanilla (ES6+)           |
| Armazenamento  | LocalStorage                        |
| Gráficos       | Canvas API (Chart.js ou manual)     |
| Tipografia     | Google Fonts (Inter + Outfit)       |
| PWA            | manifest.json + Service Worker      |
| Ícones         | SVG inline                          |

---

## 🧱 Estrutura de Arquivos

```
CONTROLE-ARTERIAL/
├── .data/                     # Documentação do projeto
│   ├── PRD_CONTROLE_ARTERIAL.md
│   └── PLANO_IMPLEMENTACAO.md
├── .SOMENTE-CONSULTA/         # Referência (não alterar)
│   └── MEDIDA-FACIL/
├── index.html                 # Página principal (SPA)
├── manifest.json              # Manifesto PWA
├── sw.js                      # Service Worker
├── css/
│   └── styles.css             # Estilos globais (Dark Mode)
├── js/
│   ├── utils.js               # Utilitários (UUID, formatação de data, etc.)
│   ├── storage.js             # Camada de persistência (LocalStorage)
│   ├── charts.js              # Gráficos Canvas (tendências)
│   ├── ui.js                  # Controles de UI (toasts, modais, navegação)
│   └── app.js                 # Lógica principal e inicialização
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── icon-maskable-512.png
```

---

## 🔧 Componentes Detalhados

### 1. `index.html` — Estrutura Single-Page

Todas as telas como `<section class="screen">`, alternando visibilidade via classe `.active`.

#### Telas:

- **`#screen-onboarding`** — Cadastro inicial (nome, data nascimento, medicamentos).
- **`#screen-dashboard`** — Home com resumo da última aferição, PA, Glicemia, Temperatura.
- **`#screen-registrar`** — Formulário duplo/triplo: PA, Glicemia (mg/dL) e Temperatura (°C).
- **`#screen-historico`** — Lista de aferições agrupadas por dia com indicadores de cor por tipo.
- **`#screen-perfil`** — Dados do perfil, exportar (CSV, JSON, WhatsApp).

#### Elementos Compartilhados:

- **Bottom Nav** (`#bottom-nav`) — 4 abas: Início, Registrar, Histórico, Perfil.
- **Toast Container** (`#toast-container`) — Feedback visual.
- **Modal Overlay** (`#modal-overlay`) — Confirmações (ex: apagar dados).

---

### 2. `css/styles.css` — Design System Dark Mode

#### Variáveis CSS:

```css
:root {
  --bg-primary: #0D1117;
  --bg-card: #161B22;
  --bg-input: #1C2128;
  --border: #30363D;
  --text-primary: #E6EDF3;
  --text-secondary: #8B949E;
  --accent: #58A6FF;
  
  /* Classificação PA */
  --pa-normal: #3FB950;
  --pa-pre: #D29922;
  --pa-ha1: #DB6D28;
  --pa-ha2: #F85149;
  --pa-ha3: #DA3633;
  
  /* SpO2 */
  --spo2-normal: #58A6FF;
  --spo2-baixa: #F85149;
}
```

#### Características:

- Fundo escuro com cards elevados.
- Números de métricas em fonte grande e colorida.
- Bottom Nav com efeito de tab ativo.
- Inputs com fundo escuro e bordas sutis.
- Transições suaves entre telas (slide/fade).
- Indicadores circulares de cor ao lado de cada aferição no histórico.

---

### 3. `js/storage.js` — Camada de Persistência

```
STORAGE_KEY = 'controle_arterial_data'
```

#### Estrutura de dados:

```json
{
  "perfil": {
    "nome": "João",
    "data_nascimento": "1975-05-10",
    "medicamentos": "Losartana 50mg",
    "data_criacao": "2026-03-10T21:00:00Z"
  },
  "afericoes": [
    {
      "id": "uuid-...",
      "sistolica": 125,
      "diastolica": 82,
      "pulso": 74,
      "saturacao": 97,
      "observacao": "Após caminhada",
      "data": "2026-03-10T18:30:00Z"
    }
  ],
  "glicemias": [],
  "temperaturas": []
}
```

#### Funções:

- `carregarDados()` / `salvarDados(data)`
- `getAfericoes()`, `getGlicemias()`, `getTemperaturas()`
- Funções CRUD para Aferições, Glicemias e Temperaturas.
- `exportarDados()`, `importarDados(json)`, `limparTodosDados()`

---

### 4. `js/utils.js` — Utilitários

- `gerarId()` — UUID v4.
- `formatarData(iso)`, `formatarHora(iso)`, `formatarDataHora(iso)`.
- `classificarPA(sis, dia)`, `classificarGlicemia(valor, momento)`, `classificarTemperatura(valor)`.
- `calcularMedias()`, `calcularMediasGlicemia()`.
- `agruparPorDia(afericoes)` — Agrupa para exibição no histórico.
- **Exportação:** `gerarConteudoCSV(dados)` e `gerarTextoWhatsApp(dados, dias)`.

#### Classificação PA (SBC 2025):

| Nível | PAS        | PAD       | Label             | Cor         |
| ----- | ---------- | --------- | ----------------- | ----------- |
| 0     | < 120      | e < 80    | PA Normal         | 🟢 Verde    |
| 1     | 120–139    | e/ou 80–89| Pré-Hipertensão   | 🟡 Amarelo  |
| 2     | 140–159    | e/ou 90–99| HA Estágio 1      | 🟠 Laranja  |
| 3     | 160–179    | e/ou 100–109 | HA Estágio 2   | 🔴 Vermelho |
| 4     | ≥ 180      | e/ou ≥ 110| HA Estágio 3      | 🔴 Vermelho Escuro |

A classificação é determinada pelo **maior nível** entre PAS e PAD.

---

### 5. `js/charts.js` — Gráficos Canvas

- Gráfico de linha: PAS e PAD ao longo do tempo.
- Linhas de referência horizontais (zona limite, ex: vermelha em 140/90).
- Gráfico de Pulso (bpm).
- Exibido no Dashboard (mini-gráfico) e possível tela de tendências futura.

---

### 6. `js/ui.js` — Controle de Interface

- `showScreen(screenId)` — Alterna telas ativas.
- `showToast(msg, tipo)` — Exibe notificação temporária.
- `showModal(titulo, msg, onConfirm)` — Modal de confirmação.
- Animações de transição entre telas.
- Renderização da Bottom Nav ativa.

---

### 7. `js/app.js` — Lógica Principal

- Inicialização: verifica se há perfil, mostra onboarding ou dashboard.
- Event listeners de formulários e navegação.
- Renderização do Dashboard com dados dinâmicos.
- Renderização do Histórico com agrupamento por dia.
- Lógica de exportar/importar/limpar.

---

## 🧪 Plano de Verificação

### Testes Manuais

1. **Onboarding**: Preencher dados e verificar que o perfil é salvo e redireciona ao Dashboard.
2. **Registro**: Inserir SIS 155/DIA 95/PUL 80 → Classificação "HA Estágio 1" (laranja).
3. **Dashboard**: Verificar que exibe a última aferição com cor e classificação corretas.
4. **Histórico**: Adicionar 3+ aferições em dias diferentes → Verificar agrupamento por dia.
5. **Exclusão**: Excluir uma aferição e verificar que sai da lista.
6. **Persistência**: Recarregar a página e verificar que os dados permanecem.
7. **Export/Import**: Exportar JSON, limpar dados, importar JSON → Dados restaurados.
8. **PWA**: Instalar como app mobile, verificar funcionamento offline.

### Verificação Automática

- `npm run dev` (live-server) para teste em browser.
- DevTools → Application → Service Worker e Cache Storage.
- DevTools → Application → Manifest → verificar ícones e configuração.
