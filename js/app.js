/* ============================
   CONTROLE ARTERIAL — App Principal
   ============================ */

let editingAfericaoId = null;
let editingGlicemiaId = null;
let editingTemperaturaId = null;
let activeRegisterType = 'afericao'; // 'afericao', 'glicemia', 'temperatura'
let activeHistoryType = 'afericao'; // 'afericao', 'glicemia', 'temperatura'

document.addEventListener('DOMContentLoaded', () => {
    initModal();
    initNav();
    initOnboarding();
    initRegistro();
    initPerfil();
    initHistorico();
    initTypeTabs();

    // Verificar se tem perfil salvo
    const perfil = getPerfil();
    if (perfil) {
        hideNav();
        showNav();
        showScreen('dashboard');
        renderDashboard();
    } else {
        hideNav();
        showScreen('onboarding');
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
});

// =================== ONBOARDING ===================

function initOnboarding() {
    const form = document.getElementById('form-onboarding');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('onb-nome').value.trim();
        const nascimento = document.getElementById('onb-nascimento').value;
        const medicamentos = document.getElementById('onb-medicamentos').value.trim();
        const tecnico = document.getElementById('onb-tecnico').value.trim();

        if (!nome) {
            showToast('Informe o nome do paciente.', 'error');
            return;
        }

        savePerfil({ nome, data_nascimento: nascimento || null, medicamentos: medicamentos || null, tecnico: tecnico || null });
        showToast('Perfil criado com sucesso!', 'success');
        showNav();
        showScreen('dashboard');
        renderDashboard();
    });
}

// =================== DASHBOARD ===================

function renderDashboard() {
    const perfil = getPerfil();
    if (!perfil) return;

    // Saudação — mostra Técnico/Cuidador no greeting
    const greetEl = document.getElementById('dash-greeting');
    if (greetEl) {
        const hora = new Date().getHours();
        let saudacao = 'Boa noite';
        if (hora >= 5 && hora < 12) saudacao = 'Bom dia';
        else if (hora >= 12 && hora < 18) saudacao = 'Boa tarde';
        const nomeGreeting = perfil.tecnico || perfil.nome;
        greetEl.textContent = `${saudacao}, ${nomeGreeting}!`;
    }

    // Nome do Paciente — exibe no canto direito do header
    const pacienteEl = document.getElementById('dash-paciente-nome');
    if (pacienteEl) pacienteEl.textContent = perfil.nome || '--';

    // Frase motivacional
    const quoteEl = document.getElementById('dash-quote');
    if (quoteEl) quoteEl.textContent = fraseAleatoria();

    const ultima = getUltimaAfericao();
    const penultima = getPenultimaAfericao();

    // Card última aferição
    const cardUltima = document.getElementById('dash-ultima-card');
    if (cardUltima) {
        if (ultima) {
            const classif = classificarPA(ultima.sistolica, ultima.diastolica);
            const pulsoClass = classificarPulso(ultima.pulso);
            const spo2Class = classificarSpO2(ultima.saturacao);

            document.getElementById('dash-sis').textContent = ultima.sistolica;
            document.getElementById('dash-sis').style.color = classif.cor;
            document.getElementById('dash-dia').textContent = ultima.diastolica;
            document.getElementById('dash-dia').style.color = classif.cor;
            document.getElementById('dash-pul').textContent = ultima.pulso;
            document.getElementById('dash-pul').style.color = pulsoClass.cor;

            const spo2El = document.getElementById('dash-spo2');
            if (spo2El) {
                spo2El.textContent = ultima.saturacao != null ? `${ultima.saturacao}%` : '--';
                spo2El.style.color = spo2Class.cor;
            }

            const badgeEl = document.getElementById('dash-pa-badge');
            if (badgeEl) badgeEl.innerHTML = criarBadgePA(classif);

            // Barra de classificação — posição mapeada por zona
            const barEl = document.getElementById('dash-pa-bar');
            if (barEl) {
                const percent = calcularPosicaoBarra(ultima.sistolica);
                barEl.querySelector('.pa-bar-indicator').style.left = `${percent}%`;
            }

            const lastUpdateEl = document.getElementById('dash-last-update');
            if (lastUpdateEl) lastUpdateEl.textContent = `Última aferição: ${formatarDataHora(ultima.data)}`;

            // Deltas
            const deltaSis = document.getElementById('dash-delta-sis');
            if (deltaSis) deltaSis.innerHTML = criarDelta(ultima.sistolica, penultima?.sistolica);
            const deltaDia = document.getElementById('dash-delta-dia');
            if (deltaDia) deltaDia.innerHTML = criarDelta(ultima.diastolica, penultima?.diastolica);
            const deltaPul = document.getElementById('dash-delta-pul');
            if (deltaPul) deltaPul.innerHTML = criarDelta(ultima.pulso, penultima?.pulso);

            cardUltima.style.display = '';
        } else {
            cardUltima.style.display = 'none';
        }
    }

    // Estado vazio
    const emptyEl = document.getElementById('dash-empty');
    if (emptyEl) emptyEl.style.display = ultima ? 'none' : '';

    // ================== GLICEMIA DASHBOARD ==================
    const ultimaGli = getUltimaGlicemia();
    const cardGli = document.getElementById('dash-gli-card');
    const chartGliContainer = document.getElementById('dash-gli-chart-container');

    if (ultimaGli) {
        const classifGli = classificarGlicemia(ultimaGli.glicemia, ultimaGli.momento);
        
        document.getElementById('dash-gli-badge').innerHTML = criarBadgePA(classifGli); // reuso de estilo badge
        document.getElementById('dash-gli-valor').textContent = ultimaGli.glicemia;
        document.getElementById('dash-gli-valor').style.color = classifGli.cor;
        
        document.getElementById('dash-gli-momento').textContent = MOMENTOS_GLICEMIA[ultimaGli.momento] || '';
        document.getElementById('dash-gli-refeicao').textContent = ultimaGli.refeicao ? REFEICOES_GLICEMIA[ultimaGli.refeicao] : '';

        // Medias glicemia no dashboard
        const glicemias = getGlicemias();
        const gliSem = filtrarPorPeriodo(glicemias, 7);
        const gliMes = filtrarPorPeriodo(glicemias, 30);
        
        const mediaGliSem = calcularMediasGlicemia(gliSem);
        const mediaGliMes = calcularMediasGlicemia(gliMes);

        document.getElementById('dash-gli-media-sem').textContent = mediaGliSem.count > 0 ? mediaGliSem.media : '--';
        document.getElementById('dash-gli-media-mes').textContent = mediaGliMes.count > 0 ? mediaGliMes.media : '--';

        cardGli.style.display = '';
        chartGliContainer.style.display = '';
        renderGraficoGlicemia();
    } else {
        cardGli.style.display = 'none';
        chartGliContainer.style.display = 'none';
    }

    // ================== TEMPERATURA DASHBOARD ==================
    const ultimaTemp = getUltimaTemperatura();
    const cardTemp = document.getElementById('dash-temp-card');

    if (ultimaTemp) {
        const classifTemp = classificarTemperatura(ultimaTemp.temperatura);
        
        document.getElementById('dash-temp-badge').innerHTML = criarBadgePA(classifTemp); // reuso
        document.getElementById('dash-temp-valor').textContent = ultimaTemp.temperatura.toFixed(1);
        document.getElementById('dash-temp-valor').style.color = classifTemp.cor;
        
        cardTemp.style.display = '';
    } else {
        if (cardTemp) cardTemp.style.display = 'none';
    }

    // Médias PA
    renderMedias();

    // Gráficos PA
    renderMiniGraficoDashboard();
    renderGraficoPulso();
}

function renderMedias() {
    const afericoes = getAfericoes();

    // Médias da semana
    const semana = filtrarPorPeriodo(afericoes, 7);
    const mediaSem = calcularMedias(semana);

    document.getElementById('media-sis-sem').textContent = mediaSem.count > 0 ? mediaSem.sis : '--';
    document.getElementById('media-dia-sem').textContent = mediaSem.count > 0 ? mediaSem.dia : '--';
    document.getElementById('media-pul-sem').textContent = mediaSem.count > 0 ? mediaSem.pul : '--';

    // Médias do mês
    const mes = filtrarPorPeriodo(afericoes, 30);
    const mediaMes = calcularMedias(mes);

    document.getElementById('media-sis-mes').textContent = mediaMes.count > 0 ? mediaMes.sis : '--';
    document.getElementById('media-dia-mes').textContent = mediaMes.count > 0 ? mediaMes.dia : '--';
    document.getElementById('media-pul-mes').textContent = mediaMes.count > 0 ? mediaMes.pul : '--';
}

// =================== ABAS (TIPO) ===================

function initTypeTabs() {
    // Abas de Registro
    const regTabs = document.querySelectorAll('#registrar-type-tabs .type-tab');
    regTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            if (editingAfericaoId || editingGlicemiaId || editingTemperaturaId) return; // Nao trocar de aba editando
            regTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeRegisterType = btn.dataset.type;
            
            document.getElementById('form-afericao-container').style.display = activeRegisterType === 'afericao' ? '' : 'none';
            document.getElementById('form-glicemia-container').style.display = activeRegisterType === 'glicemia' ? '' : 'none';
            document.getElementById('form-temperatura-container').style.display = activeRegisterType === 'temperatura' ? '' : 'none';
        });
    });

    // Abas do Histórico
    const histTabs = document.querySelectorAll('#historico-type-tabs .type-tab');
    histTabs.forEach(btn => {
        btn.addEventListener('click', () => {
            histTabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeHistoryType = btn.dataset.type;
            renderHistorico();
        });
    });
}

// =================== REGISTRAR ===================

function initRegistro() {
    // Form PA
    const formAfericao = document.getElementById('form-registro');
    if (formAfericao) {
        formAfericao.addEventListener('submit', (e) => {
            e.preventDefault();

            const sis = document.getElementById('reg-sis').value;
            const dia = document.getElementById('reg-dia').value;
            const pul = document.getElementById('reg-pul').value;
            const spo2 = document.getElementById('reg-spo2').value;
            const dataVal = document.getElementById('reg-data').value;
            const obs = document.getElementById('reg-obs').value.trim();
            const editId = document.getElementById('reg-edit-id').value;

            if (!sis || !dia || !pul) {
                showToast('Preencha Sistólica, Diastólica e Pulso.', 'error');
                return;
            }

            const dados = {
                sistolica: sis,
                diastolica: dia,
                pulso: pul,
                saturacao: spo2 || null,
                observacao: obs || null,
                data: inputParaISO(dataVal)
            };

            if (editId) {
                updateAfericao(editId, dados);
                showToast('Aferição atualizada!', 'success');
            } else {
                const afericao = addAfericao(dados);
                const classif = classificarPA(afericao.sistolica, afericao.diastolica);
                showToast(`Aferição salva! ${classif.label}`, 'success');
            }

            cancelarEdicaoAfericao();
            showScreen('dashboard');
            renderDashboard();
        });

        document.getElementById('btn-cancelar-edicao')?.addEventListener('click', () => {
            cancelarEdicaoAfericao();
            showScreen('historico');
            renderHistorico();
        });
    }

    // Form Glicemia
    const formGlicemia = document.getElementById('form-glicemia');
    if (formGlicemia) {
        formGlicemia.addEventListener('submit', (e) => {
            e.preventDefault();

            const gli = document.getElementById('reg-gli').value;
            const momento = document.getElementById('reg-gli-momento').value;
            const refeicao = document.getElementById('reg-gli-refeicao').value;
            const dataVal = document.getElementById('reg-gli-data').value;
            const obs = document.getElementById('reg-gli-obs').value.trim();
            const editId = document.getElementById('reg-gli-edit-id').value;

            if (!gli) {
                showToast('Preencha a glicemia.', 'error');
                return;
            }

            const dados = {
                glicemia: gli,
                momento: momento,
                refeicao: refeicao || null,
                observacao: obs || null,
                data: inputParaISO(dataVal)
            };

            if (editId) {
                updateGlicemia(editId, dados);
                showToast('Glicemia atualizada!', 'success');
            } else {
                const glicemia = addGlicemia(dados);
                const classif = classificarGlicemia(glicemia.glicemia, glicemia.momento);
                showToast(`Glicemia salva! ${classif.label}`, 'success');
            }

            cancelarEdicaoGlicemia();
            showScreen('dashboard');
            renderDashboard();
        });

        document.getElementById('btn-cancelar-edicao-gli')?.addEventListener('click', () => {
            cancelarEdicaoGlicemia();
            showScreen('historico');
            renderHistorico();
        });
    }

    // Form Temperatura
    const formTemperatura = document.getElementById('form-temperatura');
    if (formTemperatura) {
        formTemperatura.addEventListener('submit', (e) => {
            e.preventDefault();

            const temp = document.getElementById('reg-temp').value;
            const dataVal = document.getElementById('reg-temp-data').value;
            const obs = document.getElementById('reg-temp-obs').value.trim();
            const editId = document.getElementById('reg-temp-edit-id').value;

            if (!temp) {
                showToast('Preencha a temperatura.', 'error');
                return;
            }

            const dados = {
                temperatura: temp,
                observacao: obs || null,
                data: inputParaISO(dataVal)
            };

            if (editId) {
                updateTemperatura(editId, dados);
                showToast('Temperatura atualizada!', 'success');
            } else {
                const temperatura = addTemperatura(dados);
                const classif = classificarTemperatura(temperatura.temperatura);
                showToast(`Temperatura salva! ${classif.label}`, 'success');
            }

            cancelarEdicaoTemperatura();
            showScreen('dashboard');
            renderDashboard();
        });

        document.getElementById('btn-cancelar-edicao-temp')?.addEventListener('click', () => {
            cancelarEdicaoTemperatura();
            showScreen('historico');
            renderHistorico();
        });
    }
}

function prepararFormRegistro() {
    cancelarEdicaoAfericao();
    cancelarEdicaoGlicemia();
    cancelarEdicaoTemperatura();
    if (activeRegisterType === 'afericao') {
        const dataInput = document.getElementById('reg-data');
        if (dataInput) dataInput.value = dataLocalAgora();
    } else if (activeRegisterType === 'glicemia') {
        const dataInput = document.getElementById('reg-gli-data');
        if (dataInput) dataInput.value = dataLocalAgora();
    } else {
        const dataInput = document.getElementById('reg-temp-data');
        if (dataInput) dataInput.value = dataLocalAgora();
    }
}

function editarAfericao(id) {
    const a = getAfericaoById(id);
    if (!a) return;

    editingAfericaoId = id;
    
    // Forçar aba aferição
    document.querySelector('#registrar-type-tabs [data-type="afericao"]').click();

    document.getElementById('reg-edit-id').value = id;
    document.getElementById('reg-sis').value = a.sistolica;
    document.getElementById('reg-dia').value = a.diastolica;
    document.getElementById('reg-pul').value = a.pulso;
    document.getElementById('reg-spo2').value = a.saturacao || '';
    document.getElementById('reg-obs').value = a.observacao || '';

    // Converter ISO para datetime-local
    const d = new Date(a.data);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    document.getElementById('reg-data').value = local.toISOString().slice(0, 16);

    // UI de edição
    document.getElementById('registrar-titulo').textContent = 'Editar Aferição';
    document.getElementById('btn-salvar-afericao').textContent = 'Atualizar Aferição';
    document.getElementById('btn-cancelar-edicao').style.display = '';

    showScreen('registrar');
}

function cancelarEdicaoAfericao() {
    editingAfericaoId = null;
    const form = document.getElementById('form-registro');
    if (form) form.reset();
    document.getElementById('reg-edit-id').value = '';
    document.getElementById('registrar-titulo').textContent = 'Novo Registro';
    document.getElementById('btn-salvar-afericao').textContent = 'Salvar Aferição';
    document.getElementById('btn-cancelar-edicao').style.display = 'none';
}

function editarGlicemia(id) {
    const g = getGlicemiaById(id);
    if (!g) return;

    editingGlicemiaId = id;

    // Forçar aba glicemia
    document.querySelector('#registrar-type-tabs [data-type="glicemia"]').click();

    document.getElementById('reg-gli-edit-id').value = id;
    document.getElementById('reg-gli').value = g.glicemia;
    document.getElementById('reg-gli-momento').value = g.momento || 'jejum';
    document.getElementById('reg-gli-refeicao').value = g.refeicao || '';
    document.getElementById('reg-gli-obs').value = g.observacao || '';

    const d = new Date(g.data);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    document.getElementById('reg-gli-data').value = local.toISOString().slice(0, 16);

    document.getElementById('registrar-titulo').textContent = 'Editar Glicemia';
    document.getElementById('btn-salvar-glicemia').textContent = 'Atualizar Glicemia';
    document.getElementById('btn-cancelar-edicao-gli').style.display = '';

    showScreen('registrar');
}

function cancelarEdicaoGlicemia() {
    editingGlicemiaId = null;
    const form = document.getElementById('form-glicemia');
    if (form) form.reset();
    document.getElementById('reg-gli-edit-id').value = '';
    document.getElementById('registrar-titulo').textContent = 'Novo Registro';
    document.getElementById('btn-salvar-glicemia').textContent = 'Salvar Glicemia';
    document.getElementById('btn-cancelar-edicao-gli').style.display = 'none';
}

function editarTemperatura(id) {
    const t = getTemperaturaById(id);
    if (!t) return;

    editingTemperaturaId = id;

    // Forçar aba temperatura
    document.querySelector('#registrar-type-tabs [data-type="temperatura"]').click();

    document.getElementById('reg-temp-edit-id').value = id;
    document.getElementById('reg-temp').value = t.temperatura;
    document.getElementById('reg-temp-obs').value = t.observacao || '';

    const d = new Date(t.data);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    document.getElementById('reg-temp-data').value = local.toISOString().slice(0, 16);

    document.getElementById('registrar-titulo').textContent = 'Editar Temperatura';
    document.getElementById('btn-salvar-temperatura').textContent = 'Atualizar Temperatura';
    document.getElementById('btn-cancelar-edicao-temp').style.display = '';

    showScreen('registrar');
}

function cancelarEdicaoTemperatura() {
    editingTemperaturaId = null;
    const form = document.getElementById('form-temperatura');
    if (form) form.reset();
    document.getElementById('reg-temp-edit-id').value = '';
    document.getElementById('registrar-titulo').textContent = 'Novo Registro';
    document.getElementById('btn-salvar-temperatura').textContent = 'Salvar Temperatura';
    document.getElementById('btn-cancelar-edicao-temp').style.display = 'none';
}

// =================== HISTÓRICO ===================

function initHistorico() {
    // Filtro de período
    const filtros = document.querySelectorAll('.filter-tab');
    filtros.forEach(btn => {
        btn.addEventListener('click', () => {
            filtros.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderHistorico();
        });
    });
}

function renderHistorico() {
    const container = document.getElementById('historico-list');
    if (!container) return;

    const filtroAtivo = document.querySelector('.filter-tab.active');
    const periodo = filtroAtivo ? parseInt(filtroAtivo.dataset.filter) || null : null;

    let items = activeHistoryType === 'afericao' ? getAfericoes() : (activeHistoryType === 'glicemia' ? getGlicemias() : getTemperaturas());
    const filtrados = periodo ? filtrarPorPeriodo(items, periodo) : items;

    if (filtrados.length === 0) {
        let label = 'uma aferição';
        if (activeHistoryType === 'glicemia') label = 'uma glicemia';
        if (activeHistoryType === 'temperatura') label = 'uma temperatura';
        container.innerHTML = `<p class="empty-state">Nenhum registro encontrado. Comece registrando ${label}!</p>`;
        return;
    }

    const grupos = agruparPorDia(filtrados);
    let html = '';

    for (const [label, diarios] of Object.entries(grupos)) {
        html += `<div class="timeline-group">`;
        html += `<h3 class="timeline-date">${label}</h3>`;

        diarios.forEach(item => {
            if (activeHistoryType === 'afericao') {
                const classif = classificarPA(item.sistolica, item.diastolica);
                const spo2Text = item.saturacao != null ? `${item.saturacao}%` : '--';

                html += `
                <div class="timeline-item" data-id="${item.id}">
                    <div class="timeline-item-left">
                        ${criarIndicadorCor(classif)}
                    </div>
                    <div class="timeline-item-center">
                        <div class="timeline-values">
                            <div class="timeline-val">
                                <span class="timeline-val-label">SIS.</span>
                                <span class="timeline-val-num" style="color:${classif.cor}">${item.sistolica}</span>
                            </div>
                            <div class="timeline-val">
                                <span class="timeline-val-label">DIA.</span>
                                <span class="timeline-val-num" style="color:${classif.cor}">${item.diastolica}</span>
                            </div>
                            <div class="timeline-val">
                                <span class="timeline-val-label">PUL.</span>
                                <span class="timeline-val-num">${item.pulso}</span>
                            </div>
                            <div class="timeline-val">
                                <span class="timeline-val-label">SpO2</span>
                                <span class="timeline-val-num">${spo2Text}</span>
                            </div>
                        </div>
                        ${item.observacao ? `<div class="timeline-obs">${item.observacao}</div>` : ''}
                    </div>
                    <div class="timeline-item-right">
                        <span class="timeline-time">${formatarHora(item.data)}</span>
                        <div class="timeline-actions">
                            <button class="btn-edit-afericao" data-id="${item.id}" title="Editar">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="btn-delete-afericao" data-id="${item.id}" title="Excluir">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                        </div>
                    </div>
                </div>`;
            } else if (activeHistoryType === 'glicemia') {
                const classifGli = classificarGlicemia(item.glicemia, item.momento);
                const descMomento = MOMENTOS_GLICEMIA[item.momento];
                const descRef = item.refeicao ? ` • ${REFEICOES_GLICEMIA[item.refeicao]}` : '';

                html += `
                <div class="timeline-item" data-id="${item.id}">
                    <div class="timeline-item-left">
                        <span class="indicator-dot" style="background:${classifGli.cor};"></span>
                    </div>
                    <div class="timeline-item-center">
                        <div class="timeline-values">
                            <div class="timeline-val">
                                <span class="timeline-val-label">GLI.</span>
                                <span class="timeline-val-num" style="color:${classifGli.cor}">${item.glicemia}</span>
                            </div>
                            <div class="timeline-val" style="align-items:flex-start; margin-left:8px; justify-content:center;">
                                <span class="timeline-val-label" style="text-transform:none; font-size:0.75rem; color:var(--text-secondary);">${descMomento}${descRef}</span>
                            </div>
                        </div>
                        ${item.observacao ? `<div class="timeline-obs">${item.observacao}</div>` : ''}
                    </div>
                    <div class="timeline-item-right">
                        <span class="timeline-time">${formatarHora(item.data)}</span>
                        <div class="timeline-actions">
                            <button class="btn-edit-glicemia" data-id="${item.id}" title="Editar">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="btn-delete-glicemia" data-id="${item.id}" title="Excluir">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                        </div>
                    </div>
                </div>`;
            } else {
                const classifTemp = classificarTemperatura(item.temperatura);

                html += `
                <div class="timeline-item" data-id="${item.id}">
                    <div class="timeline-item-left">
                        <span class="indicator-dot" style="background:${classifTemp.cor};"></span>
                    </div>
                    <div class="timeline-item-center">
                        <div class="timeline-values">
                            <div class="timeline-val">
                                <span class="timeline-val-label">TEMP.</span>
                                <span class="timeline-val-num" style="color:${classifTemp.cor}">${item.temperatura.toFixed(1)}°C</span>
                            </div>
                             <div class="timeline-val" style="align-items:flex-start; margin-left:8px; justify-content:center;">
                                <span class="timeline-val-label" style="text-transform:none; font-size:0.75rem; color:var(--text-secondary);">${classifTemp.label}</span>
                            </div>
                        </div>
                        ${item.observacao ? `<div class="timeline-obs">${item.observacao}</div>` : ''}
                    </div>
                    <div class="timeline-item-right">
                        <span class="timeline-time">${formatarHora(item.data)}</span>
                        <div class="timeline-actions">
                            <button class="btn-edit-temperatura" data-id="${item.id}" title="Editar">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button class="btn-delete-temperatura" data-id="${item.id}" title="Excluir">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            </button>
                        </div>
                    </div>
                </div>`;
            }
        });

        html += `</div>`;
    }

    container.innerHTML = html;

    // Listeners de edição - Aferição
    container.querySelectorAll('.btn-edit-afericao').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editarAfericao(btn.dataset.id);
        });
    });

    // Listeners de exclusão - Aferição
    container.querySelectorAll('.btn-delete-afericao').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const ok = await showModal('Excluir Aferição', 'Tem certeza que deseja excluir esta aferição?', 'Excluir');
            if (ok) {
                deleteAfericao(id);
                showToast('Aferição excluída.', 'info');
                renderHistorico();
                renderDashboard();
            }
        });
    });

    // Listeners de edição - Glicemia
    container.querySelectorAll('.btn-edit-glicemia').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editarGlicemia(btn.dataset.id);
        });
    });

    // Listeners de exclusão - Glicemia
    container.querySelectorAll('.btn-delete-glicemia').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const ok = await showModal('Excluir Glicemia', 'Tem certeza que deseja excluir este registro de glicemia?', 'Excluir');
            if (ok) {
                deleteGlicemia(id);
                showToast('Glicemia excluída.', 'info');
                renderHistorico();
                renderDashboard();
            }
        });
    });

    // Listeners de edição - Temperatura
    container.querySelectorAll('.btn-edit-temperatura').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            editarTemperatura(btn.dataset.id);
        });
    });

    // Listeners de exclusão - Temperatura
    container.querySelectorAll('.btn-delete-temperatura').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const ok = await showModal('Excluir Temperatura', 'Tem certeza que deseja excluir este registro de temperatura?', 'Excluir');
            if (ok) {
                deleteTemperatura(id);
                showToast('Temperatura excluída.', 'info');
                renderHistorico();
                renderDashboard();
            }
        });
    });
}

// =================== PERFIL ===================

function initPerfil() {
    // Editar perfil
    const formEdit = document.getElementById('form-editar-perfil');
    if (formEdit) {
        formEdit.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('edit-nome').value.trim();
            const nascimento = document.getElementById('edit-nascimento').value;
            const medicamentos = document.getElementById('edit-medicamentos').value.trim();
            const tecnico = document.getElementById('edit-tecnico').value.trim();

            if (!nome) {
                showToast('Informe o nome do paciente.', 'error');
                return;
            }

            savePerfil({ nome, data_nascimento: nascimento || null, medicamentos: medicamentos || null, tecnico: tecnico || null });
            showToast('Perfil atualizado!', 'success');
            renderPerfil();
        });
    }

    // Exportar JSON
    document.getElementById('btn-exportar')?.addEventListener('click', () => {
        exportarDados();
        showToast('Backup JSON gerado!', 'success');
    });

    // Exportar CSV
    document.getElementById('btn-exportar-csv')?.addEventListener('click', () => {
        const dados = carregarDados();
        const csv = gerarConteudoCSV(dados);
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const d = new Date();
        const dataStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
        a.download = `historico_saude_${dataStr}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        showToast('Planilha CSV gerada!', 'success');
    });

    // Exportar WhatsApp
    document.getElementById('btn-exportar-wa')?.addEventListener('click', async () => {
        const dados = carregarDados();
        const txt = gerarTextoWhatsApp(dados, 7); // Últimos 7 dias
        
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Meu Histórico de Saúde',
                    text: txt
                });
                showToast('Compartilhado com sucesso!', 'success');
            } catch (err) {
                console.log('Erro no share:', err);
                // Fallback para Clipboard
                navigator.clipboard.writeText(txt).then(() => {
                    showToast('Copiado para colar no WhatsApp!', 'success');
                }).catch(() => {
                    showToast('Erro ao copiar.', 'error');
                });
            }
        } else {
            navigator.clipboard.writeText(txt).then(() => {
                showToast('Copiado para colar no WhatsApp!', 'success');
            }).catch(() => {
                showToast('Erro ao copiar.', 'error');
            });
        }
    });

    // Importar
    document.getElementById('input-importar')?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const ok = importarDados(reader.result);
            if (ok) {
                showToast('Dados importados com sucesso!', 'success');
                renderPerfil();
                renderDashboard();
            } else {
                showToast('Arquivo inválido.', 'error');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    // Limpar dados
    document.getElementById('btn-limpar-dados')?.addEventListener('click', async () => {
        const ok = await showModal('Apagar Dados', 'Todos os seus registros serão perdidos permanentemente. Deseja continuar?', 'Apagar Tudo');
        if (ok) {
            limparTodosDados();
            showToast('Todos os dados foram apagados.', 'info');
            hideNav();
            showScreen('onboarding');
        }
    });
}

function renderPerfil() {
    const perfil = getPerfil();
    if (!perfil) return;

    const nomeEl = document.getElementById('perfil-nome');
    if (nomeEl) nomeEl.textContent = perfil.nome || '--';

    const infoEl = document.getElementById('perfil-info-line');
    if (infoEl) {
        const parts = [];
        if (perfil.data_nascimento) {
            const idade = calcularIdade(perfil.data_nascimento);
            parts.push(`${idade} anos`);
        }
        if (perfil.medicamentos) {
            parts.push(perfil.medicamentos);
        }
        infoEl.textContent = parts.length > 0 ? parts.join(' • ') : '';
    }

    // Preencher form de edição
    const editNome = document.getElementById('edit-nome');
    if (editNome) editNome.value = perfil.nome || '';
    const editNasc = document.getElementById('edit-nascimento');
    if (editNasc) editNasc.value = perfil.data_nascimento || '';
    const editMed = document.getElementById('edit-medicamentos');
    if (editMed) editMed.value = perfil.medicamentos || '';
    const editTec = document.getElementById('edit-tecnico');
    if (editTec) editTec.value = perfil.tecnico || '';

    // Estatísticas
    const afericoes = getAfericoes();
    const totalEl = document.getElementById('perfil-total');
    if (totalEl) totalEl.textContent = afericoes.length;
}

function calcularIdade(dataNascimento) {
    const nasc = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
}

// =================== GRÁFICOS ===================

function renderGraficoGlicemia() {
    const canvas = document.getElementById('chart-glicemia');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Config layout canvas
    const dpi = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpi;
    canvas.height = rect.height * dpi;
    ctx.scale(dpi, dpi);
    
    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    const glicemias = getGlicemias().slice(0, 30).reverse(); // max 30 pontos
    if (glicemias.length < 2) {
        ctx.fillStyle = 'var(--text-secondary)';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Dados insuficientes para o gráfico', width / 2, height / 2);
        return;
    }

    const padding = { top: 10, right: 10, bottom: 20, left: 30 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxGli = Math.max(...glicemias.map(g => parseInt(g.glicemia))) + 20;
    const minGli = Math.max(0, Math.min(...glicemias.map(g => parseInt(g.glicemia))) - 20);
    const rangeGli = maxGli - minGli;

    const getX = (i) => padding.left + (i * (chartW / (glicemias.length - 1)));
    const getY = (val) => padding.top + chartH - (((val - minGli) / rangeGli) * chartH);

    // Desenhar grid
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (i * chartH / 4);
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
    }
    ctx.stroke();

    // Labels eixo Y
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.font = '10px Inter';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const val = Math.round(maxGli - (i * rangeGli / 4));
        const y = padding.top + (i * chartH / 4);
        ctx.fillText(val, padding.left - 5, y + 3);
    }

    // Desenhar Linha de Glicemia
    ctx.beginPath();
    ctx.strokeStyle = 'var(--gli-normal)'; // cor base
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    glicemias.forEach((g, i) => {
        const x = getX(i);
        const y = getY(parseInt(g.glicemia));
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Área sob a linha
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(46, 204, 113, 0.3)');
    gradient.addColorStop(1, 'rgba(46, 204, 113, 0)');
    
    ctx.lineTo(getX(glicemias.length - 1), height - padding.bottom);
    ctx.lineTo(getX(0), height - padding.bottom);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Desenhar pontos e labels eixo X (ex: dia/mes)
    ctx.fillStyle = 'var(--text-secondary)';
    ctx.textAlign = 'center';
    glicemias.forEach((g, i) => {
        const x = getX(i);
        const y = getY(parseInt(g.glicemia));

        // Cor do ponto baseado na classificação
        const classif = classificarGlicemia(g.glicemia, g.momento);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = classif.cor;
        ctx.fill();
        ctx.strokeStyle = '#1e1e2d';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label X
        if (i % Math.ceil(glicemias.length / 5) === 0 || i === glicemias.length - 1) {
            const d = new Date(g.data);
            const strDate = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
            ctx.fillStyle = 'var(--text-secondary)';
            ctx.fillText(strDate, x, height - 2);
        }
    });

}
