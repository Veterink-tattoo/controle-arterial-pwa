# 🚀 Plano de Deploy — Controle Arterial PWA

Este documento detalha o passo a passo para enviar o projeto ao GitHub e realizar a hospedagem gratuita na Vercel. O processo resultará em um link público (ex: `https://controle-arterial.vercel.app`), que pode ser acessado de qualquer celular para a instalação do PWA.

---

## Passo 1: Preparar o Repositório Local e Github

1. **Acesse o GitHub (https://github.com):**
   - Acesse sua conta.
   - Clique em **"New repository"** (Novo repositório).
   - Nomeie como `controle-arterial-pwa`.
   - Deixe como Público ou Privado (a Vercel lê ambos via integração oficial).
   - **Não** inicialize com README ou .gitignore (clique direto em *Create repository*).

2. **Inicializar o Git Localmente (pelo Terminal do VSCode):**
   - Garanta que está na pasta `c:\ED_WORKSPACE\001-PROJETOS\001-Projetos_Proprios\002-PASTAS\APP-CONTROLE-MEDIDAS-PESOS\CONTROLE-ARTERIAL`.
   - Execute os seguintes comandos:
     ```bash
     git init
     git add .
     git commit -m "feat: versão inicial do app Controle Arterial (PA, Glicemia, Temperatura)"
     git branch -M main
     git remote add origin https://github.com/SEU-USUARIO/controle-arterial-pwa.git
     git push -u origin main
     ```
   - *(Substitua `SEU-USUARIO` pelo seu usuário do GitHub).*
   - **Nota sobre Autenticação:** Caso peça senha, use o **Personal Access Token (PAT)** do GitHub, ou autentique-se pelo navegador.

---

## Passo 2: Hospedagem na Vercel

1. **Acessar a Vercel:**
   - Acesse [https://vercel.com](https://vercel.com) e faça o login usando a opção **"Continue with GitHub"**.

2. **Importar o Projeto:**
   - Na dashboard da Vercel, clique no botão **"Add New..."** e escolha **"Project"**.
   - Na lista de repositórios do seu GitHub, encontre `controle-arterial-pwa` e clique em **"Import"**.

3. **Configuração de Build (Direto e Fácil):**
   - O projeto é composto apenas de HTML/CSS/JS puro Vanilla. Não há processo de build complexo (como React/Next).
   - O Vercel geralmente auto-detecta projetos estáticos.
   - Deixe o *Framework Preset* como "Other".
   - Deixe *Build Command* e *Output Directory* em branco ou como os valores padrão detectados.
   - Clique em **"Deploy"**.

4. **Conclusão:**
   - Em menos de 1 minuto, a Vercel construirá e publicará o site.
   - Ela fornecerá um ou dois links de domínio (terminados em `.vercel.app`).
   - Clique no link gerado. O seu site estará online e funcional.

---

## Passo 3: Instalação no Celular (PWA)

O aplicativo foi projetado como PWA (Progressive Web App) e possui `manifest.json` e `sw.js` (Service Worker). Isso permite que ele seja instalado e funcione offline independentemente das lojas de aplicativos (App Store/Play Store).

### Como o cliente final (ou você) instala:

**No Android (Chrome/Edge):**
1. Abra o link da Vercel no Chrome do celular.
2. Aguarde alguns segundos. O navegador pode exibir uma barra inferior: **"Adicionar à tela principal"**.
3. Como alternativa, clique nos **Três pontinhos** (menu superior direito).
4. Selecione **"Adicionar à tela inicial"** ou **"Instalar aplicativo"**.
5. Um ícone do Controle Arterial aparecerá na gaveta de aplicativos do celular.

**No iPhone/iOS (Safari):**
1. Abra o link da Vercel pelo **Safari** (o Chrome do iOS não suporta instalação de PWA perfeitamente).
2. Toque no ícone de **"Compartilhar"** (quadrado com seta para cima na barra inferior).
3. Role o menu para baixo e selecione **"Adicionar à Tela de Início"** (Add to Home Screen).
4. Confirme o nome do aplicativo e toque em "Adicionar" (canto superior direito).
5. O ícone aparecerá na tela inicial como um app nativo.

---

## Benefícios Desta Estratégia de Deploy

1. **Gratuito & Ilimitado:** O Vercel e o GitHub não cobram por projetos PWA estáticos para uso pessoal ou baixa/média escala.
2. **Atualizações Contínuas (CI/CD):** 
   - Sempre que nós alterarmos um arquivo no VSCode e você fizer o `git push` para o GitHub, a Vercel atualizará o aplicativo para todos os usuários automaticamente (basta que eles fechem e abram o app no celular na próxima vez em que estiverem conectados ao WiFi).
3. **Escalável:** Os dados da PA/Glicemia/Temperaturas nunca passam pelos servidores da Vercel. Eles ficam embutidos de forma segura no *LocalStorage* (memória interna) do próprio celular da pessoa.
