/* ============================
   CONTROLE ARTERIAL — Charts (Canvas)
   ============================ */

/**
 * Desenha gráfico de linhas no canvas para PAS/PAD ou Pulso.
 * @param {string} canvasId - ID do elemento canvas
 * @param {Array} afericoes - Array de aferições ordenadas por data
 * @param {object} config - Configurações do gráfico
 */
function desenharGrafico(canvasId, afericoes, config = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || afericoes.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Ajustar resolução para telas retina
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const pad = { top: 20, right: 15, bottom: 30, left: 40 };
    const plotW = W - pad.left - pad.right;
    const plotH = H - pad.top - pad.bottom;

    // Limpar
    ctx.clearRect(0, 0, W, H);

    const { linhas = [], series = [], yMin: cfgMin, yMax: cfgMax } = config;

    // Calcular min/max Y
    let allVals = [];
    series.forEach(s => {
        s.dados.forEach(v => { if (v != null) allVals.push(v); });
    });
    linhas.forEach(l => allVals.push(l.valor));

    let yMin = cfgMin != null ? cfgMin : Math.min(...allVals) - 10;
    let yMax = cfgMax != null ? cfgMax : Math.max(...allVals) + 10;
    if (yMax === yMin) { yMax += 10; yMin -= 10; }

    const scaleX = (i) => pad.left + (plotW / Math.max(afericoes.length - 1, 1)) * i;
    const scaleY = (v) => pad.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

    // Grid horizontal
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
        const y = pad.top + (plotH / gridSteps) * i;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(W - pad.right, y);
        ctx.stroke();

        // Labels Y
        const val = Math.round(yMax - ((yMax - yMin) / gridSteps) * i);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(val, pad.left - 6, y + 3);
    }

    // Labels X (datas)
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    const maxLabels = Math.min(afericoes.length, 7);
    const step = Math.max(1, Math.floor(afericoes.length / maxLabels));
    for (let i = 0; i < afericoes.length; i += step) {
        const x = scaleX(i);
        const d = new Date(afericoes[i].data);
        const label = `${d.getDate()}/${d.getMonth() + 1}`;
        ctx.fillText(label, x, H - 6);
    }

    // Linhas de referência (ex: zona vermelha)
    linhas.forEach(l => {
        const y = scaleY(l.valor);
        ctx.strokeStyle = l.cor || 'rgba(248,81,73,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(W - pad.right, y);
        ctx.stroke();
        ctx.setLineDash([]);
    });

    // Séries de dados
    series.forEach(s => {
        const pontos = s.dados.map((v, i) => v != null ? { x: scaleX(i), y: scaleY(v) } : null).filter(Boolean);
        if (pontos.length < 2) return;

        // Linha
        ctx.strokeStyle = s.cor || '#58A6FF';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        pontos.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Pontos
        pontos.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = i === pontos.length - 1 ? '#fff' : (s.cor || '#58A6FF');
            ctx.fill();
            ctx.strokeStyle = s.cor || '#58A6FF';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });
    });
}

/**
 * Renderiza o mini-gráfico resumido no dashboard.
 */
function renderMiniGraficoDashboard() {
    const afericoes = getAfericoes();
    const ultimas = afericoes.slice(-15); // últimas 15
    if (ultimas.length < 2) {
        const container = document.getElementById('dash-chart-container');
        if (container) container.style.display = 'none';
        return;
    }

    const container = document.getElementById('dash-chart-container');
    if (container) container.style.display = '';

    desenharGrafico('chart-pa', ultimas, {
        series: [
            {
                label: 'Sistólica',
                cor: '#F85149',
                dados: ultimas.map(a => a.sistolica)
            },
            {
                label: 'Diastólica',
                cor: '#58A6FF',
                dados: ultimas.map(a => a.diastolica)
            }
        ],
        linhas: [
            { valor: 140, cor: 'rgba(248,81,73,0.35)' },
            { valor: 90, cor: 'rgba(88,166,255,0.35)' }
        ],
        yMin: 40,
        yMax: 200
    });
}

/**
 * Renderiza gráfico de Pulso no dashboard.
 */
function renderGraficoPulso() {
    const afericoes = getAfericoes();
    const ultimas = afericoes.slice(-15);
    if (ultimas.length < 2) {
        const container = document.getElementById('dash-pulse-chart-container');
        if (container) container.style.display = 'none';
        return;
    }

    const container = document.getElementById('dash-pulse-chart-container');
    if (container) container.style.display = '';

    desenharGrafico('chart-pulso', ultimas, {
        series: [
            {
                label: 'Pulso',
                cor: '#3FB950',
                dados: ultimas.map(a => a.pulso)
            }
        ],
        linhas: [
            { valor: 100, cor: 'rgba(248,81,73,0.3)' },
            { valor: 60, cor: 'rgba(63,185,80,0.3)' }
        ],
        yMin: 40,
        yMax: 130
    });
}
