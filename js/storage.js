/* ============================
   CONTROLE ARTERIAL — Storage Layer
   ============================ */

const STORAGE_KEY = 'controle_arterial_data';

/**
 * Estrutura inicial de dados
 */
function getDefaultData() {
    return {
        perfil: null,
        afericoes: [],
        glicemias: [],
        temperaturas: []
    };
}

/**
 * Carrega todos os dados do LocalStorage
 */
function carregarDados() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return getDefaultData();
        const data = JSON.parse(raw);
        return {
            perfil: data.perfil || null,
            afericoes: data.afericoes || [],
            glicemias: data.glicemias || [],
            temperaturas: data.temperaturas || []
        };
    } catch {
        return getDefaultData();
    }
}

/**
 * Salva todos os dados no LocalStorage
 */
function salvarDados(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// =================== PERFIL ===================

function getPerfil() {
    return carregarDados().perfil;
}

function savePerfil(perfil) {
    const data = carregarDados();
    data.perfil = {
        ...data.perfil,
        ...perfil,
        data_criacao: data.perfil?.data_criacao || new Date().toISOString()
    };
    salvarDados(data);
    return data.perfil;
}

// =================== AFERIÇÕES ===================

function getAfericoes() {
    return carregarDados().afericoes;
}

function addAfericao(dados) {
    const data = carregarDados();
    const afericao = {
        id: gerarId(),
        sistolica: parseInt(dados.sistolica),
        diastolica: parseInt(dados.diastolica),
        pulso: parseInt(dados.pulso),
        saturacao: dados.saturacao ? parseInt(dados.saturacao) : null,
        observacao: dados.observacao || null,
        data: dados.data || new Date().toISOString()
    };
    data.afericoes.push(afericao);
    data.afericoes.sort((a, b) => new Date(a.data) - new Date(b.data));
    salvarDados(data);
    return afericao;
}

function updateAfericao(id, dados) {
    const data = carregarDados();
    const idx = data.afericoes.findIndex(a => a.id === id);
    if (idx === -1) return null;
    data.afericoes[idx] = {
        ...data.afericoes[idx],
        sistolica: parseInt(dados.sistolica),
        diastolica: parseInt(dados.diastolica),
        pulso: parseInt(dados.pulso),
        saturacao: dados.saturacao ? parseInt(dados.saturacao) : null,
        observacao: dados.observacao || null,
        data: dados.data || data.afericoes[idx].data
    };
    data.afericoes.sort((a, b) => new Date(a.data) - new Date(b.data));
    salvarDados(data);
    return data.afericoes[idx];
}

function deleteAfericao(id) {
    const data = carregarDados();
    data.afericoes = data.afericoes.filter(a => a.id !== id);
    salvarDados(data);
}

function getUltimaAfericao() {
    const afericoes = getAfericoes();
    return afericoes.length > 0 ? afericoes[afericoes.length - 1] : null;
}

function getPenultimaAfericao() {
    const afericoes = getAfericoes();
    return afericoes.length > 1 ? afericoes[afericoes.length - 2] : null;
}

function getAfericaoById(id) {
    return getAfericoes().find(a => a.id === id) || null;
}

// =================== GLICEMIAS ===================

function getGlicemias() {
    return carregarDados().glicemias;
}

function addGlicemia(dados) {
    const data = carregarDados();
    const glicemia = {
        id: gerarId(),
        glicemia: parseInt(dados.glicemia),
        momento: dados.momento || 'jejum',
        refeicao: dados.refeicao || null,
        observacao: dados.observacao || null,
        data: dados.data || new Date().toISOString()
    };
    data.glicemias.push(glicemia);
    data.glicemias.sort((a, b) => new Date(a.data) - new Date(b.data));
    salvarDados(data);
    return glicemia;
}

function updateGlicemia(id, dados) {
    const data = carregarDados();
    const idx = data.glicemias.findIndex(g => g.id === id);
    if (idx === -1) return null;
    data.glicemias[idx] = {
        ...data.glicemias[idx],
        glicemia: parseInt(dados.glicemia),
        momento: dados.momento || 'jejum',
        refeicao: dados.refeicao || null,
        observacao: dados.observacao || null,
        data: dados.data || data.glicemias[idx].data
    };
    data.glicemias.sort((a, b) => new Date(a.data) - new Date(b.data));
    salvarDados(data);
    return data.glicemias[idx];
}

function deleteGlicemia(id) {
    const data = carregarDados();
    data.glicemias = data.glicemias.filter(g => g.id !== id);
    salvarDados(data);
}

function getUltimaGlicemia() {
    const glicemias = getGlicemias();
    return glicemias.length > 0 ? glicemias[glicemias.length - 1] : null;
}

function getGlicemiaById(id) {
    return getGlicemias().find(g => g.id === id) || null;
}

// =================== TEMPERATURAS ===================

function getTemperaturas() {
    return carregarDados().temperaturas || [];
}

function addTemperatura(dados) {
    const data = carregarDados();
    const temperatura = {
        id: gerarId(),
        temperatura: parseFloat(dados.temperatura),
        observacao: dados.observacao || null,
        data: dados.data || new Date().toISOString()
    };
    if (!data.temperaturas) data.temperaturas = [];
    data.temperaturas.push(temperatura);
    data.temperaturas.sort((a, b) => new Date(a.data) - new Date(b.data));
    salvarDados(data);
    return temperatura;
}

function updateTemperatura(id, dados) {
    const data = carregarDados();
    if (!data.temperaturas) return null;
    const idx = data.temperaturas.findIndex(t => t.id === id);
    if (idx === -1) return null;
    data.temperaturas[idx] = {
        ...data.temperaturas[idx],
        temperatura: parseFloat(dados.temperatura),
        observacao: dados.observacao || null,
        data: dados.data || data.temperaturas[idx].data
    };
    data.temperaturas.sort((a, b) => new Date(a.data) - new Date(b.data));
    salvarDados(data);
    return data.temperaturas[idx];
}

function deleteTemperatura(id) {
    const data = carregarDados();
    if (!data.temperaturas) return;
    data.temperaturas = data.temperaturas.filter(t => t.id !== id);
    salvarDados(data);
}

function getUltimaTemperatura() {
    const temps = getTemperaturas();
    return temps.length > 0 ? temps[temps.length - 1] : null;
}

function getTemperaturaById(id) {
    return getTemperaturas().find(t => t.id === id) || null;
}

// =================== EXPORT / IMPORT ===================

function exportarDados() {
    const data = carregarDados();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `controle-arterial-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importarDados(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        if (!data.perfil && !data.afericoes && !data.glicemias && !data.temperaturas) {
            throw new Error('Formato inválido');
        }
        salvarDados({
            perfil: data.perfil || null,
            afericoes: data.afericoes || [],
            glicemias: data.glicemias || [],
            temperaturas: data.temperaturas || []
        });
        return true;
    } catch (e) {
        return false;
    }
}

function limparTodosDados() {
    localStorage.removeItem(STORAGE_KEY);
}
