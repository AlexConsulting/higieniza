// =============================================
// HIGIENIZA AÍ — admin.js
// =============================================

// THEME
const html = document.documentElement;
const saved = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', saved);
document.getElementById('themeToggleAdmin')?.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  atualizarGraficos();
});

// SIDEBAR MOBILE
document.getElementById('sidebarToggle')?.addEventListener('click', () => {
  document.getElementById('adminSidebar').classList.toggle('open');
});
if (window.innerWidth <= 768) {
  document.getElementById('sidebarToggle').style.display = 'flex';
}

// NAVEGAÇÃO
let paginaAtual = 'dashboard';
document.querySelectorAll('[data-page]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;
    navegarPara(page);
  });
});
document.querySelectorAll('.nav-page-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navegarPara(link.dataset.page);
  });
});

function navegarPara(page) {
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  const el = document.getElementById(`page-${page}`);
  if (el) el.style.display = 'block';
  document.querySelectorAll('.sidebar-nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === page);
  });
  document.getElementById('pageTitle').textContent = {
    dashboard: 'Dashboard',
    orcamentos: 'Orçamentos',
    agenda: 'Agenda',
    financeiro: 'Financeiro',
    clientes: 'Clientes',
    cupons: 'Cupons',
    configuracoes: 'Configurações'
  }[page] || page;
  paginaAtual = page;
  if (page === 'orcamentos') carregarOrcamentos();
  if (page === 'agenda') renderAdminCalendar();
  if (page === 'financeiro') renderFinanceiro();
  if (page === 'clientes') carregarClientes();
  if (page === 'cupons') carregarCupons();
  if (page === 'configuracoes') carregarConfiguracoes();
}

// =============================================
// CONFIGURAÇÕES (preços, combustível, etc.)
// =============================================
const CONFIG_KEY = 'higieniza_config';

function getConfig() {
  const def = {
    precos: {
      carro_hatch: 150, carro_sedan: 170, carro_suv: 200, carro_van: 250, carro_pickup: 220,
      sofa_2lugares: 120, sofa_3lugares: 150, sofa_4lugares: 180, sofa_5lugares: 220,
      sofa_chaise: 200, sofa_poltrona: 80,
      colchao_solteiro: 100, colchao_casal: 130, colchao_queen: 160, colchao_king: 190,
      cadeira_jantar: 35, cadeira_escritorio: 70, cadeira_gamer: 90
    },
    combustivel: {
      gasolina: 5.89, etanol: 3.99, tipo: 'gasolina', kmL: 9,
      adicional_10km: 5, adicional_30km: 10, adicional_31km: 15
    },
    cidades: { santoandre: 5, saocaetano: 10, outras: 0 },
    geral: {
      meta_mensal: 5000,
      admin_whats: '5511999999999',
      empresa_whats: '5511999999999',
      sede_cep: '09361250',
      horarios: '08:00,09:00,10:00,11:00,13:00,14:00,15:00,16:00,17:00'
    }
  };
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? { ...def, ...JSON.parse(saved) } : def;
  } catch { return def; }
}

function saveConfig(cfg) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
}

function carregarConfiguracoes() {
  const cfg = getConfig();
  Object.entries(cfg.precos).forEach(([k, v]) => {
    const el = document.getElementById(`preco_${k}`);
    if (el) el.value = v;
  });
  Object.entries(cfg.combustivel).forEach(([k, v]) => {
    const el = document.getElementById(k === 'gasolina' || k === 'etanol' ? `preco_${k}` : k === 'tipo' ? 'combustivel_tipo' : k === 'kmL' ? 'carro_kmL' : `adicional_${k.replace('adicional_','')}`);
    if (el) el.value = v;
  });
  const el_ga = document.getElementById('preco_gasolina'); if (el_ga) el_ga.value = cfg.combustivel.gasolina;
  const el_et = document.getElementById('preco_etanol'); if (el_et) el_et.value = cfg.combustivel.etanol;
  const el_ti = document.getElementById('combustivel_tipo'); if (el_ti) el_ti.value = cfg.combustivel.tipo;
  const el_km = document.getElementById('carro_kmL'); if (el_km) el_km.value = cfg.combustivel.kmL;
  const el_a10 = document.getElementById('adicional_10km'); if (el_a10) el_a10.value = cfg.combustivel.adicional_10km;
  const el_a30 = document.getElementById('adicional_30km'); if (el_a30) el_a30.value = cfg.combustivel.adicional_30km;
  const el_a31 = document.getElementById('adicional_31km'); if (el_a31) el_a31.value = cfg.combustivel.adicional_31km;
  const el_sa = document.getElementById('adicional_santoandre'); if (el_sa) el_sa.value = cfg.cidades.santoandre;
  const el_sc = document.getElementById('adicional_saocaetano'); if (el_sc) el_sc.value = cfg.cidades.saocaetano;
  const el_ou = document.getElementById('adicional_outras'); if (el_ou) el_ou.value = cfg.cidades.outras;
  const el_me = document.getElementById('meta_mensal'); if (el_me) el_me.value = cfg.geral.meta_mensal;
  const el_aw = document.getElementById('admin_whats'); if (el_aw) el_aw.value = cfg.geral.admin_whats;
  const el_ew = document.getElementById('empresa_whats'); if (el_ew) el_ew.value = cfg.geral.empresa_whats;
  const el_sc2 = document.getElementById('sede_cep'); if (el_sc2) el_sc2.value = cfg.geral.sede_cep;
  const el_ho = document.getElementById('horarios_disponiveis'); if (el_ho) el_ho.value = cfg.geral.horarios;
}

window.salvarPrecos = function(grupo) {
  const cfg = getConfig();
  const keys = Object.keys(cfg.precos).filter(k => k.startsWith(grupo));
  keys.forEach(k => {
    const el = document.getElementById(`preco_${k}`);
    if (el) cfg.precos[k] = parseFloat(el.value) || 0;
  });
  saveConfig(cfg);
  toast('Preços salvos com sucesso! ✓', 'success');
};

window.salvarCombustivel = function() {
  const cfg = getConfig();
  cfg.combustivel.gasolina = parseFloat(document.getElementById('preco_gasolina')?.value) || 5.89;
  cfg.combustivel.etanol = parseFloat(document.getElementById('preco_etanol')?.value) || 3.99;
  cfg.combustivel.tipo = document.getElementById('combustivel_tipo')?.value || 'gasolina';
  cfg.combustivel.kmL = parseFloat(document.getElementById('carro_kmL')?.value) || 9;
  cfg.combustivel.adicional_10km = parseFloat(document.getElementById('adicional_10km')?.value) || 5;
  cfg.combustivel.adicional_30km = parseFloat(document.getElementById('adicional_30km')?.value) || 10;
  cfg.combustivel.adicional_31km = parseFloat(document.getElementById('adicional_31km')?.value) || 15;
  saveConfig(cfg);
  toast('Configurações de combustível salvas! ✓', 'success');
};

window.salvarCidades = function() {
  const cfg = getConfig();
  cfg.cidades.santoandre = parseFloat(document.getElementById('adicional_santoandre')?.value) || 0;
  cfg.cidades.saocaetano = parseFloat(document.getElementById('adicional_saocaetano')?.value) || 0;
  cfg.cidades.outras = parseFloat(document.getElementById('adicional_outras')?.value) || 0;
  saveConfig(cfg);
  toast('Adicionais por cidade salvos! ✓', 'success');
};

window.salvarGeral = function() {
  const cfg = getConfig();
  cfg.geral.meta_mensal = parseFloat(document.getElementById('meta_mensal')?.value) || 5000;
  cfg.geral.admin_whats = document.getElementById('admin_whats')?.value || '';
  cfg.geral.empresa_whats = document.getElementById('empresa_whats')?.value || '';
  cfg.geral.sede_cep = document.getElementById('sede_cep')?.value || '';
  cfg.geral.horarios = document.getElementById('horarios_disponiveis')?.value || '';
  saveConfig(cfg);
  toast('Configurações gerais salvas! ✓', 'success');
};

// =============================================
// CÁLCULO DE PREÇO
// =============================================
function calcularDistanciaKm(cepOrigem, cepDestino) {
  // Simula distância baseada na diferença numérica dos CEPs
  // Em produção, use Google Maps Distance Matrix API
  const o = parseInt(cepOrigem.replace(/\D/g,'').slice(0,5));
  const d = parseInt(cepDestino.replace(/\D/g,'').slice(0,5));
  const diff = Math.abs(o - d);
  // Aproximação: cada 100 unidades de diff ≈ 1km
  return Math.max(1, Math.min(80, diff / 80));
}

function detectarCidade(endereco) {
  if (!endereco) return 'outra';
  const lower = endereco.toLowerCase();
  if (lower.includes('santo andré') || lower.includes('santo andre')) return 'santoandre';
  if (lower.includes('são caetano') || lower.includes('sao caetano')) return 'saocaetano';
  return 'outra';
}

function calcularPrecoServico(servico, cfg) {
  const p = cfg.precos;
  let base = 0;
  const tipo = servico.subtipo || '';
  const qtd = servico.quantidade || 1;

  switch(servico.tipo) {
    case 'carro':
      const mapCarro = { hatch: p.carro_hatch, sedan: p.carro_sedan, suv: p.carro_suv, van: p.carro_van, pickup: p.carro_pickup };
      base = mapCarro[tipo] || p.carro_hatch;
      break;
    case 'sofa':
      const mapSofa = { '2lugares': p.sofa_2lugares, '3lugares': p.sofa_3lugares, '4lugares': p.sofa_4lugares, '5lugares': p.sofa_5lugares, chaise: p.sofa_chaise, poltrona: p.sofa_poltrona };
      base = (mapSofa[tipo] || p.sofa_3lugares) * qtd;
      break;
    case 'colchao':
      const mapColchao = { solteiro: p.colchao_solteiro, casal: p.colchao_casal, queen: p.colchao_queen, king: p.colchao_king };
      base = (mapColchao[tipo] || p.colchao_casal) * qtd;
      break;
    case 'cadeira':
      const mapCadeira = { jantar: p.cadeira_jantar, escritorio: p.cadeira_escritorio, gamer: p.cadeira_gamer, cadeirao: p.cadeira_escritorio };
      base = (mapCadeira[tipo] || p.cadeira_jantar) * qtd;
      break;
  }
  return base;
}

function calcularCustoDeslocamento(distanciaKm, cfg) {
  const c = cfg.combustivel;
  const precoComb = c.tipo === 'etanol' ? c.etanol : c.gasolina;
  const custoPorKm = precoComb / c.kmL;
  return custoPorKm * distanciaKm * 2; // ida e volta
}

function calcularOrcamentoCompleto(orcamento) {
  const cfg = getConfig();
  const cep = orcamento.cep || '';
  const sedeCep = cfg.geral.sede_cep || '09361250';
  const distancia = calcularDistanciaKm(sedeCep, cep);
  const cidade = detectarCidade(orcamento.endereco || '');

  let totalServicos = 0;
  const breakdown = [];

  (orcamento.servicos || []).forEach(sv => {
    const val = calcularPrecoServico(sv, cfg);
    breakdown.push({ label: `${sv.tipo} (${sv.subtipo})`, valor: val, qtd: sv.quantidade });
    totalServicos += val;
  });

  // Adicional por distância
  const c = cfg.combustivel;
  let adicionalKmPct = 0;
  if (distancia <= 10) adicionalKmPct = c.adicional_10km;
  else if (distancia <= 30) adicionalKmPct = c.adicional_30km;
  else adicionalKmPct = c.adicional_31km;

  const adicionalKm = totalServicos * adicionalKmPct / 100;

  // Adicional por cidade
  const addCidadePct = cidade === 'santoandre' ? cfg.cidades.santoandre : cidade === 'saocaetano' ? cfg.cidades.saocaetano : cfg.cidades.outras;
  const adicionalCidade = totalServicos * addCidadePct / 100;

  // Custo deslocamento (interno)
  const custoDesl = calcularCustoDeslocamento(distancia, cfg);

  // Desconto cupom
  let desconto = 0;
  if (orcamento.cupom) {
    const pctMap = { 5: 0.05, 7: 0.07, 10: 0.10 };
    // Tenta buscar desconto do cupom no storage
    const cupons = JSON.parse(localStorage.getItem('higieniza_cupons') || '[]');
    const cupomObj = cupons.find(c => c.codigo === orcamento.cupom);
    if (cupomObj) desconto = totalServicos * (cupomObj.desconto / 100);
  }

  const subtotal = totalServicos + adicionalKm + adicionalCidade;
  const total = Math.max(0, subtotal - desconto);

  return {
    breakdown, totalServicos, adicionalKm, adicionalKmPct,
    adicionalCidade, addCidadePct, cidade, custoDesl,
    distancia, desconto, subtotal, total
  };
}

// =============================================
// ORÇAMENTOS
// =============================================
let orcamentoAtual = null;
let orcamentoIdAtual = null;

async function carregarOrcamentos() {
  const tbody = document.getElementById('tabelaOrcamentos');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-mid);padding:40px">Carregando...</td></tr>';

  try {
    const db = window._db;
    const { ref, get } = window._rtdb;
    const snap = await get(ref(db, 'orcamentos'));

    if (!snap.exists()) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-mid);padding:40px">Nenhum orçamento encontrado.</td></tr>';
      return;
    }

    // Converter objeto em array com id, ordenar por data desc
    const docs = [];
    snap.forEach(c => docs.push({ id: c.key, ...c.val() }));
    docs.sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0));

    tbody.innerHTML = '';
    docs.forEach(d => {
      const id = d.id;
      const calc = calcularOrcamentoCompleto(d);
      const data = d.criadoEm ? new Date(d.criadoEm).toLocaleDateString('pt-BR') : '—';
      const servicos = (d.servicos || []).map(s => s.tipo).join(', ');
      const cidadeLabel = d.endereco?.split(' - ')[1]?.split('/')[0] || '—';

      const statusMap = { novo: 'novo', enviado: 'enviado', confirmado: 'confirmado', concluido: 'concluido' };
      const statusLabel = { novo: '🔵 Novo', enviado: '🟡 Enviado', confirmado: '🟢 Confirmado', concluido: '⚫ Concluído' };

      tbody.innerHTML += `
        <tr>
          <td><strong>${d.numero || '—'}</strong></td>
          <td>${data}</td>
          <td>${d.nome}</td>
          <td style="font-size:0.8rem">${servicos}</td>
          <td>${cidadeLabel}</td>
          <td><strong>R$ ${(d.valorFinal || calc.total).toFixed(2).replace('.',',')}</strong></td>
          <td><span class="status-badge ${statusMap[d.status] || 'novo'}">${statusLabel[d.status] || '🔵 Novo'}</span></td>
          <td>
            <div style="display:flex;gap:6px">
              <button class="btn-sm primary" onclick="abrirOrcamento('${id}')">Ver</button>
              <button class="btn-sm secondary" onclick="mudarStatus('${id}','concluido')">✓</button>
            </div>
          </td>
        </tr>`;
    });

    // Atualizar badge
    const novos = docs.filter(d => d.status === 'novo').length;
    document.getElementById('badgeCount').textContent = novos;

  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-mid);padding:40px">Erro ao carregar. Verifique o Firebase.</td></tr>';
    console.error(e);
  }
}

window.abrirOrcamento = async function(id) {
  try {
    const db = window._db;
    const { ref, get } = window._rtdb;
    const snap = await get(ref(db, `orcamentos/${id}`));
    if (!snap.exists()) return;
    const d = snap.val();
    orcamentoAtual = d;
    orcamentoIdAtual = id;

    const calc = calcularOrcamentoCompleto(d);

    document.getElementById('modalOrcNumero').textContent = `Orçamento ${d.numero || ''}`;
    document.getElementById('oNome').textContent = d.nome;
    document.getElementById('oWhats').textContent = d.whatsapp;
    document.getElementById('oEndereco').textContent = d.endereco || '—';
    document.getElementById('oCep').textContent = d.cep || '—';
    document.getElementById('oDistancia').textContent = `≈ ${calc.distancia.toFixed(1)} km`;
    document.getElementById('oCidade').textContent = calc.cidade === 'santoandre' ? 'Santo André (+5%)' : calc.cidade === 'saocaetano' ? 'São Caetano do Sul (+10%)' : 'Outras';

    // Serviços
    document.getElementById('oServicos').innerHTML = (d.servicos || []).map(s =>
      `<div class="info-row"><span>${s.tipo} — ${s.subtipo}</span><span>Qtd: ${s.quantidade}</span></div>`
    ).join('');

    // Breakdown de preços
    let precosHTML = '';
    calc.breakdown.forEach(b => {
      precosHTML += `<div class="price-row"><div class="info-row" style="margin:0"><span>${b.label} (x${b.qtd})</span><span>R$ ${b.valor.toFixed(2).replace('.',',')}</span></div></div>`;
    });
    precosHTML += `<div class="info-row"><span>Adicional distância (${calc.adicionalKmPct}%)</span><span>R$ ${calc.adicionalKm.toFixed(2).replace('.',',')}</span></div>`;
    if (calc.adicionalCidade > 0) precosHTML += `<div class="info-row"><span>Adicional cidade (${calc.addCidadePct}%)</span><span>R$ ${calc.adicionalCidade.toFixed(2).replace('.',',')}</span></div>`;
    precosHTML += `<div class="info-row"><span>Custo deslocamento (interno)</span><span>R$ ${calc.custoDesl.toFixed(2).replace('.',',')}</span></div>`;
    if (calc.desconto > 0) precosHTML += `<div class="info-row"><span>Desconto cupom</span><span style="color:#22c55e">- R$ ${calc.desconto.toFixed(2).replace('.',',')}</span></div>`;
    document.getElementById('oPrecos').innerHTML = precosHTML;

    const valorFinal = d.valorFinal || calc.total;
    document.getElementById('valorFinalAjuste').value = valorFinal.toFixed(2);
    document.getElementById('oTotal').textContent = `R$ ${valorFinal.toFixed(2).replace('.',',')}`;

    document.getElementById('modalOrcamento').classList.add('open');
  } catch(e) { console.error(e); toast('Erro ao abrir orçamento.', 'error'); }
};

window.recalcularTotal = function() {
  const val = parseFloat(document.getElementById('valorFinalAjuste').value) || 0;
  document.getElementById('oTotal').textContent = `R$ ${val.toFixed(2).replace('.',',')}`;
};

window.aprovarEEnviar = async function() {
  if (!orcamentoIdAtual || !orcamentoAtual) return;
  const valorFinal = parseFloat(document.getElementById('valorFinalAjuste').value) || 0;
  const cfg = getConfig();

  try {
    const db = window._db;
    const { ref, update } = window._rtdb;
    await update(ref(db, `orcamentos/${orcamentoIdAtual}`), {
      status: 'enviado',
      valorFinal
    });

    // Montar mensagem para cliente
    const d = orcamentoAtual;
    const servicos = (d.servicos || []).map(s => `• ${s.tipo} (${s.subtipo}) x${s.quantidade}`).join('\n');
    const linkAgendar = `${window.location.origin}/agendar.html?id=${orcamentoIdAtual}`;

    const msg = encodeURIComponent(
      `Olá, *${d.nome}*! 😊\n\n` +
      `Segue o orçamento *${d.numero}* da *Higieniza Aí — Lavagem a Seco*:\n\n` +
      `📋 *Serviços:*\n${servicos}\n\n` +
      `💰 *Valor Total: R$ ${valorFinal.toFixed(2).replace('.',',')}*\n\n` +
      `✅ *Confirmar e Agendar:*\n${linkAgendar}\n\n` +
      `💬 *Falar com especialista:*\nhttps://wa.me/${cfg.geral.empresa_whats}\n\n` +
      `_Orçamento válido por 48 horas. Sem compromisso!_ 🙌`
    );

    const whats = d.whatsapp.replace(/\D/g,'');
    window.open(`https://wa.me/55${whats}?text=${msg}`, '_blank');

    toast('Orçamento enviado ao cliente! ✓', 'success');
    fecharModalOrc();
    carregarOrcamentos();
  } catch(e) { console.error(e); toast('Erro ao enviar.', 'error'); }
};

window.abrirWhatsCliente = function() {
  if (!orcamentoAtual) return;
  const whats = orcamentoAtual.whatsapp.replace(/\D/g,'');
  window.open(`https://wa.me/55${whats}`, '_blank');
};

window.mudarStatus = async function(id, status) {
  try {
    const db = window._db;
    const { ref, update } = window._rtdb;
    await update(ref(db, `orcamentos/${id}`), { status });
    toast('Status atualizado! ✓', 'success');
    carregarOrcamentos();
  } catch(e) { toast('Erro ao atualizar.', 'error'); }
};

window.fecharModalOrc = function() {
  document.getElementById('modalOrcamento').classList.remove('open');
};

// =============================================
// DASHBOARD
// =============================================
let chartReceita, chartServicos, chartCidades, chartMargens;

async function carregarDashboard() {
  try {
    const db = window._db;
    const { ref, get } = window._rtdb;
    const snap = await get(ref(db, 'orcamentos'));
    const docs = [];
    if (snap.exists()) snap.forEach(c => docs.push({ id: c.key, ...c.val() }));
    docs.sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0));

    const agora = new Date();
    const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    const inicioSemana = new Date(hoje); inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

    const cfg = getConfig();
    let receitaHoje = 0, receitaSemana = 0, receitaMes = 0;
    let agConfirmados = 0, agPendentes = 0, custoTotalKm = 0;
    const servicosCount = { carro: 0, sofa: 0, colchao: 0, cadeira: 0 };
    const cidadesCount = {};

    docs.forEach(d => {
      const data = d.criadoEm ? new Date(d.criadoEm) : new Date();
      const calc = calcularOrcamentoCompleto(d);
      const valor = d.valorFinal || calc.total;

      if (data >= hoje) receitaHoje += valor;
      if (data >= inicioSemana) receitaSemana += valor;
      if (data >= inicioMes) receitaMes += valor;

      if (d.status === 'confirmado') { agConfirmados++; custoTotalKm += calc.custoDesl; }
      if (d.status === 'novo' || d.status === 'enviado') agPendentes++;

      (d.servicos || []).forEach(s => { if (servicosCount[s.tipo] !== undefined) servicosCount[s.tipo]++; });

      const cidadeLabel = d.endereco?.split(' - ')[1]?.split('/')[0] || 'Outras';
      cidadesCount[cidadeLabel] = (cidadesCount[cidadeLabel] || 0) + 1;
    });

    // KPIs
    document.getElementById('kpiHoje').textContent = `R$ ${receitaHoje.toFixed(0)}`;
    document.getElementById('kpiSemana').textContent = `R$ ${receitaSemana.toFixed(0)}`;
    document.getElementById('kpiMes').textContent = `R$ ${receitaMes.toFixed(0)}`;
    const conversao = docs.length ? Math.round((docs.filter(d => d.status === 'confirmado' || d.status === 'concluido').length / docs.length) * 100) : 0;
    document.getElementById('kpiConversao').textContent = `${conversao}%`;

    const meta = cfg.geral.meta_mensal;
    const pct = Math.min(100, Math.round((receitaMes / meta) * 100));
    document.getElementById('metaFill').style.width = `${pct}%`;
    document.getElementById('metaLabel').textContent = `${pct}% da meta de R$ ${meta.toLocaleString('pt-BR')}`;

    // Projeção
    const diasPassados = agora.getDate();
    const diasMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0).getDate();
    const projecao = diasPassados > 0 ? (receitaMes / diasPassados) * diasMes : 0;
    document.getElementById('projecaoMes').textContent = `R$ ${projecao.toFixed(0)}`;
    document.getElementById('agConfirmados').textContent = agConfirmados;
    document.getElementById('agPendentes').textContent = agPendentes;
    document.getElementById('custoKm').textContent = `R$ ${custoTotalKm.toFixed(0)}`;

    // Alertas
    renderAlertas(docs);

    // Semana
    renderWeekGrid(docs);

    // Gráficos
    renderGraficos(docs, servicosCount, cidadesCount);

  } catch(e) {
    console.error(e);
    // Demo data para visualização
    renderGraficosDemoMode();
  }
}

function renderAlertas(docs) {
  const area = document.getElementById('alertsArea');
  if (!area) return;
  const alertas = [];
  const novos24h = docs.filter(d => {
    const data = d.criadoEm ? new Date(d.criadoEm) : null;
    return data && (Date.now() - data.getTime()) < 86400000 && d.status === 'novo';
  });
  if (novos24h.length > 0) alertas.push(`<div class="alert-banner danger">🔴 <strong>${novos24h.length} orçamento(s)</strong> novo(s) aguardando resposta nas últimas 24h.</div>`);

  const pendentes = docs.filter(d => d.status === 'novo' && d.criadoEm && (Date.now() - new Date(d.criadoEm).getTime()) > 86400000);
  if (pendentes.length > 0) alertas.push(`<div class="alert-banner warning">🟡 <strong>${pendentes.length} orçamento(s)</strong> sem resposta há mais de 24h. Considere ativar um cupom.</div>`);

  area.innerHTML = alertas.join('') + (alertas.length ? '<div style="margin-bottom:20px"></div>' : '');
}

function renderWeekGrid(docs) {
  const grid = document.getElementById('weekGrid');
  if (!grid) return;
  const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const hoje = new Date();
  const inicioSemana = new Date(hoje); inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  grid.innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(inicioSemana); d.setDate(inicioSemana.getDate() + i);
    const isHoje = d.toDateString() === hoje.toDateString();
    const dosDia = docs.filter(o => {
      const od = o.criadoEm ? new Date(o.criadoEm) : null;
      return od && od.toDateString() === d.toDateString();
    });
    const confirmados = dosDia.filter(o => o.status === 'confirmado').length;
    const pendentes = dosDia.filter(o => o.status !== 'confirmado' && o.status !== 'concluido').length;
    grid.innerHTML += `
      <div class="week-day ${isHoje ? 'today' : ''}">
        <div class="week-day-name">${dias[i]}</div>
        <div class="week-day-date">${d.getDate()}</div>
        <div class="week-day-count">${dosDia.length > 0 ? `${dosDia.length} ag.` : '—'}</div>
        <div class="week-day-dots">
          ${'<span class="dot confirmed"></span>'.repeat(confirmados)}
          ${'<span class="dot pending"></span>'.repeat(pendentes)}
        </div>
      </div>`;
  }
}

function renderGraficos(docs, servicosCount, cidadesCount) {
  const isDark = html.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#9ea3c8' : '#4a4a6a';
  const gridColor = isDark ? '#1e2545' : '#dde0f5';

  Chart.defaults.color = textColor;

  // RECEITA (últimos 7 dias)
  const labels7 = [];
  const values7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    labels7.push(d.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' }));
    const soma = docs.filter(o => {
      const od = o.criadoEm ? new Date(o.criadoEm) : null;
      return od && od.toDateString() === d.toDateString();
    }).reduce((acc, o) => acc + (o.valorFinal || calcularOrcamentoCompleto(o).total), 0);
    values7.push(parseFloat(soma.toFixed(2)));
  }

  const ctxR = document.getElementById('chartReceita');
  if (ctxR) {
    if (chartReceita) chartReceita.destroy();
    chartReceita = new Chart(ctxR, {
      type: 'line',
      data: {
        labels: labels7,
        datasets: [{
          label: 'Receita (R$)',
          data: values7,
          borderColor: '#0D1B6E',
          backgroundColor: 'rgba(13,27,110,0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#E8521A',
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: gridColor }, ticks: { callback: v => `R$ ${v}` } },
          x: { grid: { color: gridColor } }
        }
      }
    });
  }

  // SERVIÇOS DONUT
  const ctxS = document.getElementById('chartServicos');
  if (ctxS) {
    if (chartServicos) chartServicos.destroy();
    chartServicos = new Chart(ctxS, {
      type: 'doughnut',
      data: {
        labels: ['Veículo', 'Sofá', 'Colchão', 'Cadeira'],
        datasets: [{
          data: [servicosCount.carro, servicosCount.sofa, servicosCount.colchao, servicosCount.cadeira],
          backgroundColor: ['#0D1B6E', '#E8521A', '#2a3fb5', '#ff8c42'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 12 } } } }
      }
    });
  }

  // CIDADES
  const ctxC = document.getElementById('chartCidades');
  if (ctxC) {
    if (chartCidades) chartCidades.destroy();
    const cidadesLabels = Object.keys(cidadesCount).slice(0, 6);
    const cidadesVals = cidadesLabels.map(k => cidadesCount[k]);
    chartCidades = new Chart(ctxC, {
      type: 'bar',
      data: {
        labels: cidadesLabels,
        datasets: [{
          label: 'Agendamentos',
          data: cidadesVals,
          backgroundColor: '#0D1B6E',
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { grid: { color: gridColor }, ticks: { stepSize: 1 } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // MARGENS
  const ctxM = document.getElementById('chartMargens');
  if (ctxM) {
    if (chartMargens) chartMargens.destroy();
    chartMargens = new Chart(ctxM, {
      type: 'bar',
      data: {
        labels: ['Veículo', 'Sofá', 'Colchão', 'Cadeira'],
        datasets: [
          { label: 'Receita', data: [0,0,0,0], backgroundColor: '#0D1B6E', borderRadius: 4 },
          { label: 'Custo Desl.', data: [0,0,0,0], backgroundColor: '#E8521A', borderRadius: 4 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom' } },
        scales: {
          y: { grid: { color: gridColor }, ticks: { callback: v => `R$ ${v}` } },
          x: { grid: { display: false } }
        }
      }
    });
  }
}

function renderGraficosDemoMode() {
  const isDark = html.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? '#1e2545' : '#dde0f5';
  Chart.defaults.color = isDark ? '#9ea3c8' : '#4a4a6a';

  const ctxR = document.getElementById('chartReceita');
  if (ctxR) {
    if (chartReceita) chartReceita.destroy();
    chartReceita = new Chart(ctxR, {
      type: 'line',
      data: {
        labels: ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
        datasets: [{ label: 'Receita (R$)', data: [320,450,280,600,420,750,380], borderColor: '#0D1B6E', backgroundColor: 'rgba(13,27,110,0.08)', borderWidth: 2.5, fill: true, tension: 0.4, pointBackgroundColor: '#E8521A', pointRadius: 5 }]
      },
      options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor }, ticks: { callback: v => `R$ ${v}` } }, x: { grid: { color: gridColor } } } }
    });
  }
  const ctxS = document.getElementById('chartServicos');
  if (ctxS) {
    if (chartServicos) chartServicos.destroy();
    chartServicos = new Chart(ctxS, {
      type: 'doughnut',
      data: { labels: ['Veículo','Sofá','Colchão','Cadeira'], datasets: [{ data: [12,18,8,6], backgroundColor: ['#0D1B6E','#E8521A','#2a3fb5','#ff8c42'], borderWidth: 0 }] },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  }
  const days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const hoje = new Date();
  const inicioSemana = new Date(hoje); inicioSemana.setDate(hoje.getDate() - hoje.getDay());
  const grid = document.getElementById('weekGrid');
  if (grid) {
    grid.innerHTML = '';
    [2,1,3,0,2,1,0].forEach((count, i) => {
      const d = new Date(inicioSemana); d.setDate(inicioSemana.getDate() + i);
      const isHoje = d.toDateString() === hoje.toDateString();
      grid.innerHTML += `<div class="week-day ${isHoje ? 'today' : ''}"><div class="week-day-name">${days[i]}</div><div class="week-day-date">${d.getDate()}</div><div class="week-day-count">${count > 0 ? `${count} ag.` : '—'}</div><div class="week-day-dots">${count > 0 ? '<span class="dot confirmed"></span>'.repeat(count) : ''}</div></div>`;
    });
  }

  const ctxC = document.getElementById('chartCidades');
  if (ctxC) {
    if (chartCidades) chartCidades.destroy();
    chartCidades = new Chart(ctxC, { type: 'bar', data: { labels: ['SBC', 'Santo André', 'S. Caetano', 'Diadema', 'Mauá'], datasets: [{ label: 'Agendamentos', data: [14, 8, 6, 5, 3], backgroundColor: '#0D1B6E', borderRadius: 6 }] }, options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: gridColor }, ticks: { stepSize: 2 } }, x: { grid: { display: false } } } } });
  }

  document.getElementById('kpiHoje').textContent = 'R$ 380';
  document.getElementById('kpiSemana').textContent = 'R$ 2.200';
  document.getElementById('kpiMes').textContent = 'R$ 7.840';
  document.getElementById('kpiConversao').textContent = '73%';
  document.getElementById('kpiHojeDelta').textContent = '↑ 12% vs ontem';
  document.getElementById('kpiSemanaDelta').textContent = '↑ 8% vs semana passada';
  document.getElementById('projecaoMes').textContent = 'R$ 9.200';
  document.getElementById('agConfirmados').textContent = '14';
  document.getElementById('agPendentes').textContent = '3';
  document.getElementById('custoKm').textContent = 'R$ 280';
  document.getElementById('metaFill').style.width = '78%';
  document.getElementById('metaLabel').textContent = '78% da meta de R$ 10.000';
}

function atualizarGraficos() {
  setTimeout(() => carregarDashboard(), 100);
}

// =============================================
// FINANCEIRO
// =============================================
let chartFinanceiro, chartTicket;

async function renderFinanceiro() {
  const isDark = html.getAttribute('data-theme') === 'dark';
  const gridColor = isDark ? '#1e2545' : '#dde0f5';
  Chart.defaults.color = isDark ? '#9ea3c8' : '#4a4a6a';

  // Demo data
  const meses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const receitas = [4200,3800,5600,6100,4900,7200,6800,5400,8100,7600,6900,8400];
  const custos = [280,310,420,380,350,510,490,380,560,520,480,580];

  document.getElementById('finTotal').textContent = `R$ ${receitas.reduce((a,b)=>a+b,0).toLocaleString('pt-BR')}`;
  document.getElementById('finCusto').textContent = `R$ ${custos.reduce((a,b)=>a+b,0).toLocaleString('pt-BR')}`;
  document.getElementById('finMargem').textContent = `R$ ${(receitas.reduce((a,b)=>a+b,0) - custos.reduce((a,b)=>a+b,0)).toLocaleString('pt-BR')}`;
  document.getElementById('finCupons').textContent = `R$ 840`;

  const ctxF = document.getElementById('chartFinanceiro');
  if (ctxF) {
    if (chartFinanceiro) chartFinanceiro.destroy();
    chartFinanceiro = new Chart(ctxF, {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [
          { label: 'Receita', data: receitas, backgroundColor: '#0D1B6E', borderRadius: 6 },
          { label: 'Custo Desl.', data: custos, backgroundColor: '#E8521A', borderRadius: 6 }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { grid: { color: gridColor }, ticks: { callback: v => `R$ ${v}` } }, x: { grid: { display: false } } } }
    });
  }

  const ctxT = document.getElementById('chartTicket');
  if (ctxT) {
    if (chartTicket) chartTicket.destroy();
    chartTicket = new Chart(ctxT, {
      type: 'bar',
      data: {
        labels: ['Veículo', 'Sofá', 'Colchão', 'Cadeira'],
        datasets: [{ label: 'Ticket Médio (R$)', data: [195, 165, 145, 75], backgroundColor: ['#0D1B6E','#E8521A','#2a3fb5','#ff8c42'], borderRadius: 8 }]
      },
      options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: gridColor }, ticks: { callback: v => `R$ ${v}` } }, y: { grid: { display: false } } } }
    });
  }
}

// =============================================
// CLIENTES
// =============================================
async function carregarClientes() {
  const tbody = document.getElementById('tabelaClientes');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-mid);padding:40px">Carregando...</td></tr>';
  try {
    const db = window._db;
    const { ref, get } = window._rtdb;
    const snap = await get(ref(db, 'orcamentos'));
    const docs = [];
    if (snap.exists()) snap.forEach(c => docs.push(c.val()));
    docs.sort((a, b) => (b.criadoEm || 0) - (a.criadoEm || 0));

    const clientesMap = {};
    docs.forEach(data => {
      const key = data.whatsapp;
      if (!clientesMap[key]) {
        clientesMap[key] = { nome: data.nome, whatsapp: data.whatsapp, cidade: data.endereco?.split(' - ')[1]?.split('/')[0] || '—', servicos: 0, total: 0, ultimo: data.criadoEm ? new Date(data.criadoEm) : new Date() };
      }
      clientesMap[key].servicos += (data.servicos || []).length;
      clientesMap[key].total += data.valorFinal || calcularOrcamentoCompleto(data).total;
    });

    const clientes = Object.values(clientesMap);
    if (!clientes.length) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px">Nenhum cliente ainda.</td></tr>'; return; }

    tbody.innerHTML = '';
    clientes.forEach(c => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${c.nome}</strong></td>
          <td>${c.whatsapp}</td>
          <td>${c.cidade}</td>
          <td>${c.servicos}</td>
          <td><strong>R$ ${c.total.toFixed(2).replace('.',',')}</strong></td>
          <td>${c.ultimo.toLocaleDateString('pt-BR')}</td>
          <td><button class="btn-sm secondary" onclick="window.open('https://wa.me/55${c.whatsapp.replace(/\D/g,'')}','_blank')">💬 WhatsApp</button></td>
        </tr>`;
    });
  } catch(e) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px">Erro ao carregar clientes.</td></tr>';
  }
}

// =============================================
// CUPONS
// =============================================
function carregarCupons() {
  const list = document.getElementById('couponList');
  const cupons = JSON.parse(localStorage.getItem('higieniza_cupons') || '[]');
  if (!cupons.length) { list.innerHTML = '<p style="color:var(--text-mid);font-size:0.875rem">Nenhum cupom ativo.</p>'; return; }
  list.innerHTML = cupons.map((c, i) => `
    <div class="coupon-item">
      <div>
        <div class="coupon-code">${c.codigo}</div>
        <div class="coupon-info">${c.desconto}% de desconto${c.validade ? ` · válido até ${c.validade}` : ''}</div>
      </div>
      <button class="coupon-del" onclick="deletarCupom(${i})">🗑️</button>
    </div>`).join('');
}

window.setCupomDesconto = function(val) {
  document.getElementById('novoCupomDesconto').value = val;
};

window.criarCupom = async function() {
  const codigo = document.getElementById('novoCupomCodigo').value.trim().toUpperCase();
  const desconto = parseInt(document.getElementById('novoCupomDesconto').value);
  const validade = document.getElementById('novoCupomValidade').value;
  const usos = parseInt(document.getElementById('novoCupomUsos').value) || 0;

  if (!codigo || !desconto) { toast('Preencha código e desconto!', 'error'); return; }

  const cupons = JSON.parse(localStorage.getItem('higieniza_cupons') || '[]');

  try {
    const db = window._db;
    const { ref, push } = window._rtdb;
    await push(ref(db, 'cupons'), { codigo, desconto, validade: validade || null, usos, ativo: true, criadoEm: Date.now() });
  } catch {}

  cupons.push({ codigo, desconto, validade, usos, ativo: true });
  localStorage.setItem('higieniza_cupons', JSON.stringify(cupons));
  toast(`Cupom ${codigo} criado com ${desconto}% de desconto! ✓`, 'success');
  document.getElementById('novoCupomCodigo').value = '';
  document.getElementById('novoCupomDesconto').value = '';
  carregarCupons();
};

window.deletarCupom = function(index) {
  if (!confirm('Deseja excluir este cupom?')) return;
  const cupons = JSON.parse(localStorage.getItem('higieniza_cupons') || '[]');
  cupons.splice(index, 1);
  localStorage.setItem('higieniza_cupons', JSON.stringify(cupons));
  carregarCupons();
  toast('Cupom removido.', 'info');
};

// =============================================
// ADMIN CALENDAR
// =============================================
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

function renderAdminCalendar() {
  const container = document.getElementById('adminCalendar');
  if (!container) return;
  const dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const hoje = new Date();

  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
      <button onclick="mudaMes(-1)" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:var(--text)">←</button>
      <strong>${meses[calendarMonth]} ${calendarYear}</strong>
      <button onclick="mudaMes(1)" style="background:none;border:none;cursor:pointer;font-size:1.2rem;color:var(--text)">→</button>
    </div>
    <div class="calendar-grid">`;

  dias.forEach(d => { html += `<div class="cal-header">${d}</div>`; });
  for (let i = 0; i < firstDay; i++) html += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isHoje = d === hoje.getDate() && calendarMonth === hoje.getMonth() && calendarYear === hoje.getFullYear();
    const isPast = new Date(calendarYear, calendarMonth, d) < new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    html += `<div class="cal-day ${isHoje ? 'today' : ''} ${isPast ? 'disabled' : ''}" onclick="selecionarDia(${d})">${d}</div>`;
  }
  html += `</div>`;
  container.innerHTML = html;
}

window.mudaMes = function(dir) {
  calendarMonth += dir;
  if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
  if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
  renderAdminCalendar();
};

window.selecionarDia = function(dia) {
  const data = new Date(calendarYear, calendarMonth, dia);
  document.getElementById('agendaDayTitle').textContent = data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  document.getElementById('agendaDayList').innerHTML = '<p style="color:var(--text-mid);font-size:0.875rem">Nenhum agendamento nesta data.</p>';
};

// =============================================
// EXPORTAR
// =============================================
window.exportarRelatorio = function() {
  toast('Gerando relatório...', 'info');
  const linha = ['Numero,Data,Cliente,WhatsApp,Servicos,Valor,Status'];
  // Demo
  linha.push('ORC-0001,01/06/2025,João Silva,(11)99999-1111,sofa,150.00,confirmado');
  const csv = linha.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `higieniza_relatorio_${new Date().toLocaleDateString('pt-BR').replace(/\//g,'-')}.csv`;
  a.click();
  toast('Relatório exportado! ✓', 'success');
};

// =============================================
// TOAST
// =============================================
function toast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 5000);
}
window.toast = toast;

// PERIOD TABS
document.querySelectorAll('.period-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.period-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
  });
});

// INIT — só carrega o painel quando o usuário estiver autenticado
let painelIniciado = false;
function iniciarPainel() {
  if (painelIniciado) return;
  painelIniciado = true;
  carregarConfiguracoes();
  carregarDashboard();
  setTimeout(() => {
    document.querySelectorAll('.page').forEach(p => { if (p.id !== 'page-dashboard') p.style.display = 'none'; });
  }, 100);
}

// Aguarda o Firebase Auth confirmar o login antes de montar o painel.
// Verifica periodicamente se a função de auth já está disponível.
const authWaiter = setInterval(() => {
  if (window._authFns && window._auth) {
    clearInterval(authWaiter);
    window._authFns.onAuthStateChanged(window._auth, (user) => {
      if (user) iniciarPainel();
    });
  }
}, 150);
