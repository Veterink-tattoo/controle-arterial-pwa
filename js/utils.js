/* ============================
   CONTROLE ARTERIAL — Utilitários
   ============================ */

/**
 * Gera UUID v4
 */
function gerarId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

/**
 * Formata data ISO para "dd/mm/aaaa"
 */
function formatarData(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Formata hora ISO para "HH:mm"
 */
function formatarHora(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formata data ISO para "dd/mm/aaaa HH:mm"
 */
function formatarDataHora(iso) {
    return `${formatarData(iso)} ${formatarHora(iso)}`;
}

/**
 * Retorna rótulo relativo ao dia: "Hoje", "Ontem" ou "dd/mm/aaaa"
 */
function rotuloData(iso) {
    const d = new Date(iso);
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);

    const dStr = d.toDateString();
    if (dStr === hoje.toDateString()) return 'Hoje';
    if (dStr === ontem.toDateString()) return 'Ontem';
    return formatarData(iso);
}

/**
 * Retorna a data ISO de hoje no formato "YYYY-MM-DDTHH:mm"
 */
function dataLocalAgora() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
}

/**
 * Converte input datetime-local para ISO completa
 */
function inputParaISO(val) {
    if (!val) return new Date().toISOString();
    return new Date(val).toISOString();
}

// =================== POSIÇÃO BARRA PA ===================

/**
 * Calcula a posição percentual do indicador na barra de PA.
 * Mapeia SIS para a zona correta (5 zonas de 20% cada).
 */
function calcularPosicaoBarra(sis) {
    if (sis < 120) {
        // Normal: mapeia 60-119 para 0-20%
        return Math.max(0, ((sis - 60) / (120 - 60)) * 20);
    } else if (sis < 140) {
        // Pré-Hipertensão: mapeia 120-139 para 20-40%
        return 20 + ((sis - 120) / (140 - 120)) * 20;
    } else if (sis < 160) {
        // HA Estágio 1: mapeia 140-159 para 40-60%
        return 40 + ((sis - 140) / (160 - 140)) * 20;
    } else if (sis < 180) {
        // HA Estágio 2: mapeia 160-179 para 60-80%
        return 60 + ((sis - 160) / (180 - 160)) * 20;
    } else {
        // HA Estágio 3: mapeia 180-220 para 80-100%
        return Math.min(100, 80 + ((sis - 180) / (220 - 180)) * 20);
    }
}

// =================== CLASSIFICAÇÃO PA (SBC 2025) ===================

const CLASSIFICACAO_PA = [
    { nivel: 0, label: 'PA Normal',         cor: 'var(--pa-normal)', classe: 'pa-normal',  sisMax: 119, diaMax: 79  },
    { nivel: 1, label: 'Pré-Hipertensão',   cor: 'var(--pa-pre)',    classe: 'pa-pre',     sisMax: 139, diaMax: 89  },
    { nivel: 2, label: 'HA Estágio 1',      cor: 'var(--pa-ha1)',    classe: 'pa-ha1',     sisMax: 159, diaMax: 99  },
    { nivel: 3, label: 'HA Estágio 2',      cor: 'var(--pa-ha2)',    classe: 'pa-ha2',     sisMax: 179, diaMax: 109 },
    { nivel: 4, label: 'HA Estágio 3',      cor: 'var(--pa-ha3)',    classe: 'pa-ha3',     sisMax: Infinity, diaMax: Infinity }
];

/**
 * Classifica a pressão arterial baseado nas diretrizes SBC 2025.
 * Retorna o MAIOR nível entre PAS e PAD.
 * @param {number} sis - Pressão sistólica
 * @param {number} dia - Pressão diastólica
 * @returns {{ nivel, label, cor, classe }}
 */
function classificarPA(sis, dia) {
    let nivelSis = 0, nivelDia = 0;

    for (let i = 0; i < CLASSIFICACAO_PA.length; i++) {
        if (sis <= CLASSIFICACAO_PA[i].sisMax) { nivelSis = i; break; }
    }
    for (let i = 0; i < CLASSIFICACAO_PA.length; i++) {
        if (dia <= CLASSIFICACAO_PA[i].diaMax) { nivelDia = i; break; }
    }

    const nivelFinal = Math.max(nivelSis, nivelDia);
    return CLASSIFICACAO_PA[nivelFinal];
}

/**
 * Classifica a Saturação de Oxigênio (SpO2)
 */
function classificarSpO2(spo2) {
    if (spo2 == null || spo2 === '') return { label: '--', cor: 'var(--text-secondary)', classe: '' };
    if (spo2 >= 95) return { label: 'Normal', cor: 'var(--spo2-normal)', classe: 'spo2-normal' };
    if (spo2 >= 91) return { label: 'Atenção', cor: 'var(--pa-pre)', classe: 'spo2-atencao' };
    return { label: 'Crítico', cor: 'var(--spo2-baixa)', classe: 'spo2-critico' };
}

/**
 * Classifica o Pulso (bpm)
 */
function classificarPulso(pulso) {
    if (pulso == null) return { label: '--', cor: 'var(--text-secondary)' };
    if (pulso < 60) return { label: 'Bradicardia', cor: 'var(--pa-pre)' };
    if (pulso <= 100) return { label: 'Normal', cor: 'var(--pa-normal)' };
    return { label: 'Taquicardia', cor: 'var(--pa-ha2)' };
}

// =================== CÁLCULOS AGREGADOS ===================

/**
 * Calcula médias de SIS, DIA e PUL para um array de aferições.
 */
function calcularMedias(afericoes) {
    if (!afericoes || afericoes.length === 0) {
        return { sis: 0, dia: 0, pul: 0, spo2: 0, count: 0 };
    }
    const sum = afericoes.reduce((acc, a) => {
        acc.sis += a.sistolica || 0;
        acc.dia += a.diastolica || 0;
        acc.pul += a.pulso || 0;
        acc.spo2 += a.saturacao || 0;
        acc.spo2Count += a.saturacao ? 1 : 0;
        return acc;
    }, { sis: 0, dia: 0, pul: 0, spo2: 0, spo2Count: 0 });

    const n = afericoes.length;
    return {
        sis: Math.round(sum.sis / n),
        dia: Math.round(sum.dia / n),
        pul: Math.round(sum.pul / n),
        spo2: sum.spo2Count > 0 ? Math.round(sum.spo2 / sum.spo2Count) : null,
        count: n
    };
}

/**
 * Filtra aferições por período (últimos N dias).
 */
function filtrarPorPeriodo(afericoes, dias) {
    if (dias === 'all' || !dias) return afericoes;
    
    // Se for uma string de data (YYYY-MM-DD)
    if (typeof dias === 'string' && dias.includes('-')) {
        return afericoes.filter(a => a.data.split('T')[0] === dias);
    }

    // Se for número de dias
    const n = parseInt(dias);
    const limite = new Date();
    limite.setHours(0, 0, 0, 0); // Começo do dia de hoje
    limite.setDate(limite.getDate() - (n - 1));
    
    return afericoes.filter(a => new Date(a.data) >= limite);
}

/**
 * Agrupa aferições por dia (retorna objeto { "Hoje": [...], "Ontem": [...], "10/03/2026": [...] }).
 * Ordenado por data mais recente primeiro.
 */
function agruparPorDia(afericoes) {
    const sorted = [...afericoes].sort((a, b) => new Date(b.data) - new Date(a.data));
    const grupos = {};
    sorted.forEach(a => {
        const label = rotuloData(a.data);
        if (!grupos[label]) grupos[label] = [];
        grupos[label].push(a);
    });
    return grupos;
}

/**
 * Frases motivacionais de saúde.
 */
const FRASES_MOTIVACIONAIS = [
    "Cuidar da saúde é um ato de amor próprio. 💙",
    "Cada aferição é um passo para uma vida mais saudável.",
    "Monitore hoje para viver melhor amanhã. 🫀",
    "Sua saúde cardiovascular merece atenção diária.",
    "Pequenos hábitos geram grandes resultados. 💪",
    "Controlar a pressão é prevenir o futuro.",
    "Registre, acompanhe e cuide-se. Você merece!",
    "A prevenção é o melhor remédio. ❤️",
    "Conhecer seus números é poder sobre sua saúde.",
    "Um passo de cada vez. Sua saúde agradece! 🌟"
];

function fraseAleatoria() {
    return FRASES_MOTIVACIONAIS[Math.floor(Math.random() * FRASES_MOTIVACIONAIS.length)];
}

// =================== GLICEMIA (SBD 2024) ===================

const MOMENTOS_GLICEMIA = {
    'jejum':         'Jejum',
    'pre-prandial':  'Pré-prandial',
    'pos-prandial':  'Pós-prandial'
};

const REFEICOES_GLICEMIA = {
    'cafe':    'Café da manhã',
    'almoco':  'Almoço',
    'lanche':  'Lanche',
    'jantar':  'Jantar'
};

/**
 * Classifica a glicemia baseado nas diretrizes SBD 2024.
 * @param {number} valor - Glicemia em mg/dL
 * @param {string} momento - "jejum", "pre-prandial" ou "pos-prandial"
 * @returns {{ label, cor, classe }}
 */
function classificarGlicemia(valor, momento) {
    if (valor == null) return { label: '--', cor: 'var(--text-secondary)', classe: '' };

    const isPos = momento === 'pos-prandial';
    const limiteNormal = isPos ? 140 : 100;
    const limiteAtencao = isPos ? 200 : 126;

    if (valor < limiteNormal) {
        return { label: 'Normal', cor: 'var(--gli-normal)', classe: 'gli-normal' };
    } else if (valor < limiteAtencao) {
        return { label: 'Atenção', cor: 'var(--gli-atencao)', classe: 'gli-atencao' };
    } else {
        return { label: 'Alto', cor: 'var(--gli-alto)', classe: 'gli-alto' };
    }
}

/**
 * Calcula média geral de glicemias.
 */
function calcularMediasGlicemia(glicemias) {
    if (!glicemias || glicemias.length === 0) return { media: 0, count: 0 };
    const sum = glicemias.reduce((acc, g) => acc + (g.glicemia || 0), 0);
    return { media: Math.round(sum / glicemias.length), count: glicemias.length };
}

// =================== TEMPERATURA ===================

/**
 * Classifica a temperatura corporal.
 * @param {number} valor - Temperatura em °C
 * @returns {{ label, cor, classe }}
 */
function classificarTemperatura(valor) {
    if (valor == null) return { label: '--', cor: 'var(--text-secondary)', classe: '' };
    
    if (valor < 35.0) {
        return { label: 'Hipotermia', cor: 'var(--temp-baixa)', classe: 'temp-baixa' };
    } else if (valor <= 37.2) {
        return { label: 'Normal', cor: 'var(--temp-normal)', classe: 'temp-normal' };
    } else if (valor <= 37.7) {
        return { label: 'Febrícula', cor: 'var(--temp-atencao)', classe: 'temp-atencao' };
    } else {
        return { label: 'Febre', cor: 'var(--temp-alta)', classe: 'temp-alta' };
    }
}

// =================== EXPORTAÇÃO ===================

/**
 * Gera conteúdo em formato CSV a partir dos dados do LocalStorage.
 */
function gerarConteudoCSV(dados) {
    let csv = "Data,Hora,Tipo,Valor Principal,Sistolica/Ref.,Diastolica,Pulso,SpO2,Classificacao,Observacao\n";
    
    const linhas = [];

    // PA
    if (dados.afericoes) {
        dados.afericoes.forEach(a => {
            const classif = classificarPA(a.sistolica, a.diastolica);
            const d = new Date(a.data);
            linhas.push({
                time: d.getTime(),
                txt: `${formatarData(a.data)},${formatarHora(a.data)},Pressão Arterial,${a.sistolica}x${a.diastolica},${a.sistolica},${a.diastolica},${a.pulso},${a.saturacao || '-'},${classif.label},"${escapeCSV(a.observacao)}"`
            });
        });
    }

    // Glicemia
    if (dados.glicemias) {
        dados.glicemias.forEach(g => {
            const classif = classificarGlicemia(g.glicemia, g.momento);
            const d = new Date(g.data);
            const m = MOMENTOS_GLICEMIA[g.momento] || '';
            const r = g.refeicao ? REFEICOES_GLICEMIA[g.refeicao] : '';
            linhas.push({
                time: d.getTime(),
                txt: `${formatarData(g.data)},${formatarHora(g.data)},Glicemia,${g.glicemia} mg/dL,${m} ${r},-,-,-,${classif.label},"${escapeCSV(g.observacao)}"`
            });
        });
    }

    // Temperatura
    if (dados.temperaturas) {
        dados.temperaturas.forEach(t => {
            const classif = classificarTemperatura(t.temperatura);
            const d = new Date(t.data);
            linhas.push({
                time: d.getTime(),
                txt: `${formatarData(t.data)},${formatarHora(t.data)},Temperatura,${t.temperatura.toFixed(1)} °C,-,-,-,-,${classif.label},"${escapeCSV(t.observacao)}"`
            });
        });
    }

    linhas.sort((a, b) => b.time - a.time);
    linhas.forEach(l => csv += l.txt + "\n");
    return csv;
}

function escapeCSV(str) {
    if (!str) return '';
    return str.replace(/"/g, '""');
}

/**
 * Gera texto formatado para compartilhar no WhatsApp (últimos N dias).
 */
function gerarTextoWhatsApp(perfil, dados, dias = 7) {
    if (!dados) return "Nenhum dado encontrado para exportação.";

    // Prepara o rótulo do período para o cabeçalho
    let rotuloPeriodo = `Últimos ${dias} dias`;
    if (dias === 'all') rotuloPeriodo = "Histórico Completo";
    else if (dias === '1') rotuloPeriodo = "Hoje";
    else if (typeof dias === 'string' && dias.includes('-')) {
        const [y, m, d] = dias.split('-');
        rotuloPeriodo = `${d}/${m}/${y}`;
    }

    // Tenta pegar o nome do paciente ativo se o perfil estiver incompleto
    let nomeP = perfil?.nome;
    if (!nomeP && typeof getActivePaciente === 'function') {
        const pAtivo = getActivePaciente();
        if (pAtivo) nomeP = pAtivo.nome;
    }

    let txt = `📊 *Histórico de Saúde*\n`;
    if (nomeP) txt += `👤 *Paciente:* ${nomeP}\n`;
    
    // Suporte a "profissional" ou "tecnico" (casos legados ou novos)
    const prof = perfil?.tecnico || perfil?.profissional;
    if (prof) txt += `🩺 *Profissional:* ${prof}\n`;
    
    txt += `📅 *Período:* ${rotuloPeriodo}\n`;
    txt += `──────────────────\n`;

    const afericoes = filtrarPorPeriodo(dados.afericoes || [], dias);
    if (afericoes.length > 0) {
        txt += `\n🩸 *Pressão Arterial*\n`;
        const subset = [...afericoes].sort((a, b) => new Date(b.data) - new Date(a.data));
        subset.forEach(a => {
            const classif = classificarPA(a.sistolica, a.diastolica);
            const dataStr = formatarData(a.data);
            const horaStr = formatarHora(a.data);
            txt += `- ${dataStr} ${horaStr}: ${a.sistolica}x${a.diastolica} mmHg, Pulso ${a.pulso} (${classif.label})\n`;
        });
    }

    const glicemias = filtrarPorPeriodo(dados.glicemias || [], dias);
    if (glicemias.length > 0) {
        txt += `\n💧 *Glicemia*\n`;
        const subset = [...glicemias].sort((a, b) => new Date(b.data) - new Date(a.data));
        subset.forEach(g => {
            const classif = classificarGlicemia(g.glicemia, g.momento);
            const dataStr = formatarData(g.data);
            const horaStr = formatarHora(g.data);
            const m = MOMENTOS_GLICEMIA[g.momento] || g.momento || '';
            const r = g.refeicao ? ` • ${REFEICOES_GLICEMIA[g.refeicao] || g.refeicao}` : '';
            txt += `- ${dataStr} ${horaStr}: ${g.glicemia} mg/dL - ${m}${r} (${classif.label})\n`;
        });
    }

    const temperaturas = filtrarPorPeriodo(dados.temperaturas || [], dias);
    if (temperaturas.length > 0) {
        txt += `\n🌡️ *Temperatura*\n`;
        const subset = [...temperaturas].sort((a, b) => new Date(b.data) - new Date(a.data));
        subset.forEach(t => {
            const c = classificarTemperatura(t.temperatura).label;
            txt += `- ${formatarData(t.data)} ${formatarHora(t.data)}: ${t.temperatura.toFixed(1)} °C (${c})\n`;
        });
    }

    if (afericoes.length === 0 && glicemias.length === 0 && temperaturas.length === 0) {
        txt += `\nNenhum registro encontrado nos últimos ${dias} dias.`;
    }

    return txt.trim();
}
