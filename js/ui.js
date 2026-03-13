/* ============================
   CONTROLE ARTERIAL — UI Controls
   ============================ */

// =================== NAVEGAÇÃO ===================

/**
 * Alterna a tela ativa (SPA)
 */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
        target.classList.add('active');
    }

    // Atualiza Bottom Nav
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.screen === screenId);
    });
}

/**
 * Inicializa a Bottom Nav
 */
function initNav() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;

    nav.addEventListener('click', (e) => {
        const btn = e.target.closest('.nav-item');
        if (!btn) return;
        const screenId = btn.dataset.screen;
        showScreen(screenId);

        // Callbacks por tela
        if (screenId === 'dashboard') renderDashboard();
        if (screenId === 'historico') renderHistorico();
        if (screenId === 'perfil') renderPerfil();
        if (screenId === 'registrar') prepararFormRegistro();
        if (screenId === 'pacientes') renderPacientes();
    });
}

/**
 * Exibe a Bottom Nav (após onboarding)
 */
function showNav() {
    const nav = document.getElementById('bottom-nav');
    if (nav) nav.style.display = '';
}

/**
 * Esconde a Bottom Nav (durante onboarding)
 */
function hideNav() {
    const nav = document.getElementById('bottom-nav');
    if (nav) nav.style.display = 'none';
}

// =================== TOAST ===================

/**
 * Exibe uma notificação temporária.
 * @param {string} msg - Mensagem
 * @param {'success'|'error'|'info'} tipo - Tipo do toast
 */
function showToast(msg, tipo = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;

    const icons = {
        success: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
        error: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
        info: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };

    toast.innerHTML = `<span class="toast-icon">${icons[tipo] || icons.info}</span><span class="toast-msg">${msg}</span>`;
    container.appendChild(toast);

    // Animar entrada
    requestAnimationFrame(() => toast.classList.add('toast-show'));

    // Remover após 3s
    setTimeout(() => {
        toast.classList.remove('toast-show');
        toast.classList.add('toast-hide');
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

// =================== MODAL ===================

let _modalResolve = null;

/**
 * Exibe modal de confirmação.
 * @returns {Promise<boolean>}
 */
function showModal(titulo, mensagem, labelConfirm = 'Confirmar') {
    return new Promise(resolve => {
        _modalResolve = resolve;
        const overlay = document.getElementById('modal-overlay');
        document.getElementById('modal-title').textContent = titulo;
        document.getElementById('modal-message').textContent = mensagem;
        document.getElementById('modal-confirm').textContent = labelConfirm;
        overlay.style.display = '';
        overlay.classList.add('modal-visible');
    });
}

function initModal() {
    document.getElementById('modal-cancel')?.addEventListener('click', () => {
        fecharModal(false);
    });
    document.getElementById('modal-confirm')?.addEventListener('click', () => {
        fecharModal(true);
    });
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) fecharModal(false);
    });
}

function fecharModal(resultado) {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('modal-visible');
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 250);
    if (_modalResolve) {
        _modalResolve(resultado);
        _modalResolve = null;
    }
}

// =================== HELPERS DE RENDERIZAÇÃO ===================

/**
 * Cria o badge de classificação com a cor correta.
 */
function criarBadgePA(classif) {
    return `<span class="badge badge-pa ${classif.classe}" style="--badge-color: ${classif.cor}">${classif.label}</span>`;
}

/**
 * Cria o indicador circular de cor.
 */
function criarIndicadorCor(classif) {
    return `<span class="indicator-dot" style="background: ${classif.cor}"></span>`;
}

/**
 * Cria o delta (diferença em relação à aferição anterior).
 */
function criarDelta(valorAtual, valorAnterior, unidade = '') {
    if (valorAnterior == null) return '';
    const diff = valorAtual - valorAnterior;
    if (diff === 0) return `<span class="delta delta-neutral">= ${unidade}</span>`;
    const seta = diff > 0 ? '▲' : '▼';
    const cls = diff > 0 ? 'delta-up' : 'delta-down';
    return `<span class="delta ${cls}">${seta} ${Math.abs(diff)}${unidade}</span>`;
}
