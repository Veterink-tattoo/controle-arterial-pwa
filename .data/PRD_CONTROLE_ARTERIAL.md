# 📄 PRD — Controle Arterial: App de Acompanhamento de Saúde Cardiovascular

---

## 1. 📌 Visão Geral do Produto

**Nome do Produto:** Controle Arterial
**Plataforma:** Web App (Mobile-first / PWA)
**Tecnologias:** HTML, CSS (Vanilla), JavaScript (Vanilla)
**Armazenamento:** LocalStorage (offline-first)
**Versão Inicial:** MVP

### 🎯 Objetivo

Permitir que o usuário acompanhe sua saúde cardiovascular e geral de forma prática e visual, com controle de **Pressão Arterial** (Sistólica/Diastólica), **Batimentos Cardíacos** (Pulso), **Saturação de Oxigênio** (SpO2), **Glicemia** e **Temperatura Corporal**. Conta com classificação automática e gráficos.

---

## 2. 🎯 Problema

Muitas pessoas precisam monitorar sua saúde cardiovascular diariamente, mas:

- Não registram as aferições de forma consistente.
- Não sabem interpretar os valores (o que é normal, pré-hipertensão, etc.).
- Dependem de aplicativos pagos, complexos ou em outros idiomas.
- Não possuem um histórico organizado para apresentar ao médico.

---

## 3. 💡 Solução

Desenvolver um aplicativo simples, em português, que:

- Registra Pressão Arterial, Pulso, Saturação, Glicemia e Temperatura.
- Classifica automaticamente a PA segundo a tabela da SBC 2025.
- Exibe indicadores visuais coloridos por nível de risco.
- Mostra gráficos de tendência (últimos 7, 30 dias e tudo).
- Agrupa o histórico por dia com visual claro.
- Funciona offline como PWA instalável.

---

## 4. 👤 Público-Alvo

### Primário

- Hipertensos e pré-hipertensos em acompanhamento médico.
- Idosos e familiares que auxiliam no controle da saúde.

### Secundário

- Atletas e praticantes de atividade física que monitoram saúde cardiovascular.
- Pessoas em consultas regulares que desejam apresentar histórico ao médico.

---

## 5. 🎯 Proposta de Valor

> "Sua saúde cardiovascular sob controle, direto no seu celular."

O app permite:

- Registrar aferições em segundos.
- Entender imediatamente se os valores estão normais ou críticos.
- Acompanhar a evolução ao longo do tempo com gráficos claros.
- Exportar dados em CSV, JSON ou texto via WhatsApp para compartilhar com o médico.

---

## 6. 🧩 Funcionalidades (Requisitos Funcionais)

### RF01 – Cadastro de Perfil

- Nome
- Data de nascimento
- Medicamentos em uso (texto livre, opcional)

---

### RF02 – Registro de Aferição

Campos:

- **Sistólica** (SIS) e **Diastólica** (DIA) — mmHg
- **Pulso** (PUL) — bpm
- **Saturação** (SpO2) — %
- **Glicemia** — mg/dL (com Momento e Refeição)
- **Temperatura** — °C
- **Data/Hora** — automática (editável)
- **Observação/Tag** — texto curto (opcional)

---

### RF03 – Classificação Automática da PA

Baseada na tabela da SBC 2025:

| Classificação       | PAS (mmHg) |       | PAD (mmHg) |
| ------------------- | ---------- | ----- | ---------- |
| PA Normal           | < 120      | e     | < 80       |
| Pré-Hipertensão     | 120–139    | e/ou  | 80–89      |
| HA Estágio 1        | 140–159    | e/ou  | 90–99      |
| HA Estágio 2        | 160–179    | e/ou  | 100–109    |
| HA Estágio 3        | ≥ 180      | e/ou  | ≥ 110      |

Cada classificação terá um **indicador visual colorido**:

- 🟢 Verde: PA Normal
- 🟡 Amarelo: Pré-Hipertensão
- 🟠 Laranja: HA Estágio 1
- 🔴 Vermelho: HA Estágio 2
- 🔴 Vermelho Escuro: HA Estágio 3

---

### RF04 – Dashboard (Home)

Exibir:

- Última aferição (SIS / DIA / PUL / SpO2)
- Classificação da PA com cor
- Barra visual indicando a faixa de PA
- Médias (SIS, DIA, PUL) da semana/mês
- Mini-gráfico de tendência recente (últimos 7 registros)
- Data/hora da última atualização

---

### RF05 – Histórico

- Lista de aferições agrupadas por dia ("Hoje", "Ontem", data).
- Cada item mostra: SIS, DIA, PUL, SpO2, horário e indicador de cor.
- Opção de excluir registro individual.
- Filtro por período (semana, mês, todos).

---

### RF06 – Gráficos de Tendência

- Gráfico de linha para PAS e PAD (com linhas de referência vermelha/verde).
- Gráfico de linha para Pulso Cardíaco (bpm).
- Gráfico de linha para Saturação (SpO2).
- Períodos: Semana, Mês, Tudo.

---

### RF07 – Perfil

- Visualizar e editar dados pessoais (Nome, Data Nascimento, Medicamentos).
- Tabela de classificação da PA (referência visual).
- Exportar dados em JSON (Backup) e CSV (Excel).
- Compartilhar resumo em texto via WhatsApp.
- Importar dados de backup JSON.
- Apagar todos os dados (com confirmação).

---

### RF08 – Persistência de Dados

- Armazenamento via LocalStorage
- Dados persistem após fechar o app
- Backup e restauração via arquivo `.json`

---

## 7. ⚙️ Requisitos Não Funcionais

### RNF01 – Usabilidade

- Interface escura (Dark Mode) com cores vibrantes para indicadores.
- Navegação via Bottom Tab Bar (4 abas: Home, Registrar, Histórico, Perfil).
- Fontes grandes e legíveis para os valores.

---

### RNF02 – Performance

- Carregamento < 2 segundos.
- Operações instantâneas.

---

### RNF03 – Responsividade

- Mobile-first (otimizado para telas 360~414px).
- Compatível com desktop.

---

### RNF04 – PWA / Offline

- Service Worker com cache-first strategy.
- Manifest para instalação na tela inicial.
- Ícones 192x192 e 512x512.

---

### RNF05 – Segurança

- Dados armazenados somente no dispositivo do usuário.
- Sem envio para servidores externos.

---

## 8. 🧮 Regras de Negócio

- RN01: A classificação da PA deve usar o **maior nível** entre PAS e PAD.
- RN02: O usuário deve ter apenas um perfil (MVP).
- RN03: Campos SIS, DIA e PUL são obrigatórios ao registrar.
- RN04: Data/Hora são preenchidas automaticamente, mas editáveis.
- RN05: SpO2 é opcional.
- RN06: Registros são ordenados por data (mais recente primeiro no histórico).
- RN07: Os gráficos devem exibir linhas de referência nas zonas de risco.

---

## 9. 🗄️ Modelagem de Dados

### Estrutura no LocalStorage

```json
{
  "perfil": {},
  "afericoes": [],
  "glicemias": [],
  "temperaturas": []
}
```

---

### Perfil

- nome (string)
- data_nascimento (string, ISO)
- medicamentos (string, texto livre)
- data_criacao (string, ISO)

---

### Aferição

- id (string, UUID)
- sistolica (number, mmHg)
- diastolica (number, mmHg)
- pulso (number, bpm)
- saturacao (number | null, %)
- observacao (string | null)
- data (string, ISO 8601 — data + hora)

---

## 10. 🎨 UX/UI

### Diretrizes Visuais

- **Tema escuro** (fundo `#0D1117`, painéis `#161B22`, bordes `#30363D`).
- Cores vivas para indicadores de saúde (verde, amarelo, laranja, vermelho).
- Tipografia: Google Fonts **Inter** (body) e **Outfit** (títulos/números grandes).
- Números de pressão em tamanho grande e coloridos (conforme screenshot de referência).
- Ícones SVG inline para a Bottom Nav.
- Animações suaves de transição entre telas.

---

### Telas

1. **Onboarding** — Cadastro inicial do perfil.
2. **Home (Dashboard)** — Resumo com última aferição, classificação, médias e mini-gráfico.
3. **Registrar** — Formulário para nova aferição.
4. **Histórico** — Lista agrupada por dia com indicadores de cor.
5. **Perfil** — Edição de dados, tabela de referência PA, exportar/importar.

---

### Navegação (Bottom Tab Bar)

| Ícone | Label      | Tela       |
| ----- | ---------- | ---------- |
| 🏠    | Início     | Dashboard  |
| ➕    | Registrar  | Registrar  |
| 🕐    | Histórico  | Histórico  |
| 👤    | Perfil     | Perfil     |

---

## 11. 🧠 Jornada do Usuário

1. Usuário abre o app pela primeira vez.
2. Preenche o cadastro (nome, data nascimento, medicamentos).
3. É redirecionado ao Dashboard (vazio).
4. Clica em "Registrar" e insere: SIS 125, DIA 82, PUL 74, SpO2 97.
5. É notificado visualmente: "Pré-Hipertensão" (amarelo).
6. No Dashboard, vê sua última aferição e classificação.
7. Com o tempo, acumula registros e acompanha gráficos de tendência.
8. Antes de ir ao médico, exporta o histórico em JSON.

---

## 12. 🚧 Restrições (MVP)

- Sem backend.
- Dados não sincronizados entre dispositivos.
- Um único perfil por dispositivo.
- Sem notificações push (futuro).

---

## 13. ⚠️ Riscos

| Risco                                | Impacto |
| ------------------------------------ | ------- |
| Perda de dados ao limpar navegador   | Alto    |
| Sem backup automático                | Médio   |
| Uso em múltiplos dispositivos        | Alto    |

---

## 14. 🚀 Roadmap

### MVP (V1)

- Cadastro (onboarding)
- Registro de aferição
- Classificação da PA
- Dashboard
- Histórico
- Perfil com exportar/importar

### V2

- Gráficos de tendência (PAS/PAD, Pulso, SpO2)
- Filtros avançados no histórico (ex: filtrar apenas por "Febre")

### V3

- Exportação em PDF para o médico
- Suporte a múltiplos perfis (para cuidadores e técnicos de enfermagem)

### V4

- Backend (sincronização na nuvem)
- Notificações de lembretes
- Integração com wearables

---

## 15. 🔐 Segurança

- Dados armazenados localmente no navegador.
- Sem autenticação (MVP).
- Sem envio de dados para servidores.

---

## 16. 🧪 Critérios de Aceitação

### Cadastro

- Usuário consegue salvar perfil e acessar o Dashboard.

### Registro

- Usuário registra aferição com SIS, DIA, PUL e a classificação é exibida corretamente.
- SpO2 é opcional e pode ser deixado vazio.

### Dashboard

- Exibe última aferição com classificação colorida correta.
- Médias são calculadas corretamente.

### Histórico

- Registros são agrupados por dia.
- Indicadores de cor refletem a classificação de cada aferição.
- Exclusão de registro funciona com confirmação.

### Perfil

- Exportação gera arquivo `.json` válido.
- Importação restaura dados corretamente.
- Apagar dados limpa tudo com confirmação.

---

## 17. 📌 Referência Visual

O app é inspirado nas seguintes referências (screenshots fornecidas):

- App de aferição arterial com tema escuro e lista agrupada por dia.
- Cartão de controle da pressão arterial (papel).
- App de registro com barra de classificação e tabela de tipo.
- App de tendências com gráficos de linha.
- Tabela SBC 2025 de classificação da PA.

---

## 18. 📌 Observações Finais

- Stack idêntica ao projeto de referência "Medida Fácil": HTML + CSS + JS puros, PWA com Service Worker.
- MVP focado em simplicidade, usabilidade e rapidez de desenvolvimento.
- Estrutura preparada para evolução futura (backend, sync, PDF).
