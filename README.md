# 🫀 Controle Arterial (PWA)

O **Controle Arterial** é um aplicativo Web / PWA mobile-first desenvolvido para auxiliar no acompanhamento e monitoramento da saúde (com foco cardiovascular). Ele registra **Pressão Arterial**, **Batimentos Cardíacos**, **Saturação de Oxigênio**, **Glicemia** e **Temperatura Corporal**, fornecendo uma classificação visual imediata.

![Status: Em Desenvolvimento](https://img.shields.io/badge/Status-Estável-success)
![PWA: Sim](https://img.shields.io/badge/PWA-Pronto_para_Instalar-blue)

---

## ✨ Funcionalidades Principais

*   **📱 Mobile-First PWA:** Pode ser instalado em Android e iOS, agindo como um aplicativo nativo e funcionando offline.
*   **📊 Registro Completo de Saúde:**
    *   **Pressão Arterial:** Sistólica, Diastólica e Pulso (Classificação SBC 2025).
    *   **Glicemia:** Foco pré e pós-prandial (Classificação SBD 2024).
    *   **Temperatura:** Controle de febre e hipotermia.
    *   **SpO2:** Monitoramento da saturação de oxigênio.
*   **🎨 Classificação Visual:** O aplicativo identifica através de cores em qual estágio as suas medidas corporais se enquadram (ex: Verde para Normal, Amarelo para Atenção, Vermelho para Alta).
*   **📈 Gráficos de Tendência:** Acompanhe a evolução de sua saúde com gráficos que mostram os últimos 30 registros de Pressão Arterial e Glicemia.
*   **🗓️ Histórico Agrupado:** Exibição elegante em linha do tempo (timeline) dos resultados, filtrados por tipo e período (7 dias, 30 dias ou Todos).
*   **💾 Compartilhamento e Backup:**
    *   **WhatsApp:** Exporte e envie relatórios textuais de 7 dias diretos para seu médico via WhatsApp.
    *   **Excel (CSV):** Baixe planilhas prontas dos seus dados.
    *   **JSON:** Importação e exportação de backups offline.
*   **🔒 Focado na Privacidade:** Nenhum dado é enviado para a nuvem. Todas as informações de saúde são armazenadas unicamente no armazenamento interno do seu celular (`LocalStorage`).

---

## 🚀 Como Usar e Instalar (Vercel)

Esta aplicação não precisa ser baixada na Play Store ou App Store.

1.  Acesse o link oficial gerado pela Vercel: **[Insira o link da Vercel aqui]**
2.  **No Android (Chrome):** Clique nos três pontinhos superiores e escola **"Adicionar à Tela Inicial"** ou **"Instalar Aplicativo"**.
3.  **No iOS (Safari):** Toque no botão "Compartilhar" e escolha **"Adicionar à Tela de Início"**.
4.  Pronto! O aplicativo abrirá em tela cheia na próxima vez.

---

## 🛠️ Tecnologias Utilizadas

Este foi um projeto construído sem o uso de frameworks modernos, focado em alta velocidade, baixo consumo de bateria inteligente e PWA offline:

*   **HTML5 Semântico**
*   **CSS3 (Vanilla):** CSS Custom Properties (Variáveis), Grid, Flexbox e Dark Mode.
*   **JavaScript (Vanilla ES6+):** Utilizado para toda a lógica da aplicação, manipulações do DOM e geração de relatórios.
*   **LocalStorage API:** Para persistência do banco de dados na aplicação.
*   **Service Workers e Web App Manifest:** Para configuração e suporte à experiência PWA offline.

---

## 👨‍💻 Desenvolvedor e Direitos

Projeto de desenvolvimento próprio. Elaborado para simplificar e incentivar o acompanhamento autônomo e responsável da saúde dos pacientes.

*Lembre-se: Este aplicativo atua como um facilitador do dia-a-dia, mas não substitui a orientação nem diagnósticos médicos oficiais.*
