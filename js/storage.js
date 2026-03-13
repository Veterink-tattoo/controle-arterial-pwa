/* ============================
   CONTROLE ARTERIAL — Storage Layer
   ============================ */

const REGISTRY_KEY = 'controle_arterial_patients';
const ACTIVE_PATIENT_KEY = 'controle_arterial_current_patient';
const OLD_STORAGE_KEY = 'controle_arterial_data';

/**
 * Setup inicial / Migração de dados antigos
 */
function initStorage() {
    const pacientes = getPacientes();
    const rawOld = localStorage.getItem(OLD_STORAGE_KEY);
    
    if (pacientes.length === 0 && rawOld) {
        try {
            const oldData = JSON.parse(rawOld);
            const nomePaciente = oldData.perfil?.nome || 'Paciente 1';
            
            const newPatientId = 'paciente_' + gerarId();
            localStorage.setItem(ACTIVE_PATIENT_KEY, newPatientId);
            salvarPacientes([{ id: newPatientId, nome: nomePaciente, dataCriacao: new Date().toISOString() }]);
            
            localStorage.setItem(getStorageKey(), JSON.stringify(oldData));
            localStorage.removeItem(OLD_STORAGE_KEY);
        } catch (e) {
            console.error("Erro na migração:", e);
        }
    }
    
    if (!localStorage.getItem(ACTIVE_PATIENT_KEY)) {
        localStorage.setItem(ACTIVE_PATIENT_KEY, '');
    }
}

function getStorageKey() {
    const active = localStorage.getItem(ACTIVE_PATIENT_KEY);
    return `controle_arterial_data_${active || 'default'}`;
}

// ==== PACIENTES ====

function getPacientes() {
    try {
        const raw = localStorage.getItem(REGISTRY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function salvarPacientes(lista) {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(lista));
}

function getActivePacienteId() {
    return localStorage.getItem(ACTIVE_PATIENT_KEY) || null;
}

function getActivePaciente() {
    const id = getActivePacienteId();
    if (!id) return null;
    return getPacientes().find(p => p.id === id) || null;
}

function setActivePaciente(id) {
    localStorage.setItem(ACTIVE_PATIENT_KEY, id);
}

function criarPaciente(nome) {
    const id = 'paciente_' + gerarId();
    const pacientes = getPacientes();
    const novo = { id, nome, dataCriacao: new Date().toISOString() };
    pacientes.push(novo);
    salvarPacientes(pacientes);
    setActivePaciente(id);
    salvarDados(getDefaultData());
    return novo;
}

function atualizarNomePaciente(nome) {
    const id = getActivePacienteId();
    if (!id) return;
    const pacientes = getPacientes();
    const p = pacientes.find(x => x.id === id);
    if (p && p.nome !== nome) {
        p.nome = nome;
        salvarPacientes(pacientes);
    }
}

function excluirPaciente(id) {
    let pacientes = getPacientes();
    pacientes = pacientes.filter(p => p.id !== id);
    salvarPacientes(pacientes);
    localStorage.removeItem(`controle_arterial_data_${id}`);
    
    if (getActivePacienteId() === id) {
        setActivePaciente(pacientes.length > 0 ? pacientes[0].id : '');
    }
}

// ============================

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
        const raw = localStorage.getItem(getStorageKey());
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
    localStorage.setItem(getStorageKey(), JSON.stringify(data));
    if (data.perfil && data.perfil.nome) {
        atualizarNomePaciente(data.perfil.nome);
    }
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
    localStorage.removeItem(getStorageKey());
}
