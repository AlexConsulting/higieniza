// =============================================
// HIGIENIZA AÍ — app.js
// =============================================

// =============================================
// TABELA DE PREÇOS-BASE (espelha as Configurações do painel)
// Se mudar um preço no painel admin, atualize aqui também.
// =============================================
const PRECOS_BASE = {
  carro:   { bancos: 250, completo: 300, _default: 250 },
  colchao: { solteiro: 150, '2solteiros': 200, casal: 200, queen: 200, king: 200, _default: 150 },
  cadeira: { _default: 20 },        // por unidade, mínimo 6
  poltrona:{ _default: 50 }         // por unidade
};
// Preço do sofá por número de pessoas sentadas
function precoSofaPorPessoas(n) {
  n = parseInt(n) || 2;
  if (n <= 2) return 250;
  if (n === 3) return 280;
  if (n === 4) return 300;
  return 350;                       // 5 ou mais
}
const MIN_CADEIRAS = 6;            // pedido mínimo de cadeiras
const MAX_PARCELAS = 5;            // crédito em até 5x

// Calcula o valor estimado de uma lista de serviços
function calcularEstimativa(servicos) {
  let total = 0;
  servicos.forEach(s => {
    if (s.tipo === 'sofa') {
      total += precoSofaPorPessoas(s.pessoas);
    } else if (s.tipo === 'cadeira') {
      const qtd = Math.max(s.quantidade || MIN_CADEIRAS, MIN_CADEIRAS);
      total += 20 * qtd;
    } else if (s.tipo === 'poltrona') {
      total += 50 * (s.quantidade || 1);
    } else {
      const tabela = PRECOS_BASE[s.tipo] || {};
      let preco = tabela[s.subtipo] != null ? tabela[s.subtipo] : (tabela._default || 0);
      total += preco * (s.quantidade || 1);
    }
  });
  return total;
}

// THEME TOGGLE
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// NAVBAR SCROLL
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar?.classList.toggle('scrolled', window.scrollY > 20);
});

// MOBILE NAV
const navBurger = document.getElementById('navBurger');
const navMobile = document.getElementById('navMobile');
navBurger?.addEventListener('click', () => {
  navMobile?.classList.toggle('open');
});
navMobile?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navMobile.classList.remove('open'));
});

// CEP MASK
const cepInput = document.getElementById('cep');
cepInput?.addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length > 5) v = v.slice(0,5) + '-' + v.slice(5,8);
  e.target.value = v;
});

// WhatsApp MASK
const whatsInput = document.getElementById('whatsapp');
whatsInput?.addEventListener('input', (e) => {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0,11);
  if (v.length > 6) v = '(' + v.slice(0,2) + ') ' + v.slice(2,7) + '-' + v.slice(7);
  else if (v.length > 2) v = '(' + v.slice(0,2) + ') ' + v.slice(2);
  else if (v.length > 0) v = '(' + v;
  e.target.value = v;
});

// BUSCAR CEP
document.getElementById('btnBuscarCep')?.addEventListener('click', buscarCep);
cepInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); buscarCep(); } });

async function buscarCep() {
  const cep = cepInput.value.replace(/\D/g, '');
  if (cep.length !== 8) { showToast('CEP inválido. Digite 8 dígitos.', 'error'); return; }
  const btn = document.getElementById('btnBuscarCep');
  btn.textContent = '...';
  btn.disabled = true;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) { showToast('CEP não encontrado.', 'error'); return; }
    document.getElementById('endereco').value = `${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`;
    showToast('Endereço encontrado! ✓', 'success');
  } catch {
    showToast('Erro ao buscar CEP. Tente novamente.', 'error');
  } finally {
    btn.textContent = 'Buscar';
    btn.disabled = false;
  }
}

// SERVICE SELECTOR
const serviceOptions = document.querySelectorAll('.service-option');
const serviceDetails = document.getElementById('serviceDetails');
const selectedServices = new Set();

serviceOptions.forEach(opt => {
  opt.addEventListener('click', () => {
    const val = opt.dataset.value;
    opt.classList.toggle('selected');
    if (opt.classList.contains('selected')) {
      selectedServices.add(val);
    } else {
      selectedServices.delete(val);
    }
    renderServiceDetails();
  });
});

function renderServiceDetails() {
  serviceDetails.innerHTML = '';
  selectedServices.forEach(service => {
    const block = document.createElement('div');
    block.className = 'service-detail-block';
    block.innerHTML = getServiceDetailHTML(service);
    serviceDetails.appendChild(block);
  });
}

// Seletor de número de pessoas (estilo bolinhas)
window.selecionarPessoas = function(btn) {
  const container = btn.closest('.pessoas-selector');
  container.querySelectorAll('.pessoa-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('sofaPessoas').value = btn.dataset.pessoas;
};

// Seletor de modelo de sofá (pílulas)
window.selecionarModelo = function(btn) {
  const container = btn.closest('.modelo-selector');
  container.querySelectorAll('.modelo-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('sofaModelo').value = btn.dataset.modelo;
};

function getServiceDetailHTML(service) {
  const configs = {
    carro: {
      label: '🚗 Veículo',
      fields: `
        <div class="detail-grid">
          <div class="form-group">
            <label>Tipo de veículo</label>
            <select name="carro_tipo">
              <option value="hatch">Hatch</option>
              <option value="sedan">Sedan</option>
              <option value="suv">SUV / Crossover</option>
              <option value="van">Van / Minivan</option>
              <option value="pickup">Pickup</option>
            </select>
          </div>
          <div class="form-group">
            <label>Itens a higienizar</label>
            <select name="carro_itens">
              <option value="bancos">Somente bancos (R$ 250)</option>
              <option value="completo">Bancos + teto (R$ 300)</option>
            </select>
          </div>
        </div>`
    },
    sofa: {
      label: '🛋️ Sofá',
      fields: `
        <div class="sofa-pessoas-block">
          <label class="sofa-q-label">Número de pessoas sentadas</label>
          <span class="sofa-hint-inline">Cada pessoa adulta equivale a aproximadamente 60 cm.</span>
          <div class="pessoas-selector" id="pessoasSelector">
            ${[2,3,4,5,6,7,8,9,10,11,12].map(n => `<button type="button" class="pessoa-btn" data-pessoas="${n}" onclick="selecionarPessoas(this)">${n}</button>`).join('')}
          </div>
          <div class="sofa-hint">
            <span class="sofa-hint-icon">️</span>
            <div>
              <strong></strong>
            </div>
          </div>
          <input type="hidden" name="sofa_pessoas" id="sofaPessoas" value="" />
        </div>

        <div class="form-group" style="margin-top:16px">
          <label class="sofa-q-label">Modelo</label>
          <div class="modelo-selector" id="modeloSelector">
            <button type="button" class="modelo-btn" data-modelo="retratil" onclick="selecionarModelo(this)">Sofá Retrátil</button>
            <button type="button" class="modelo-btn" data-modelo="comum" onclick="selecionarModelo(this)">Sofá Comum</button>
            <button type="button" class="modelo-btn" data-modelo="canto" onclick="selecionarModelo(this)">Sofá de Canto</button>
            <button type="button" class="modelo-btn" data-modelo="chaise" onclick="selecionarModelo(this)">Sofá com Chaise</button>
            <button type="button" class="modelo-btn" data-modelo="cama" onclick="selecionarModelo(this)">Sofá-Cama</button>
          </div>
          <input type="hidden" name="sofa_modelo" id="sofaModelo" value="" />
        </div>

        <div class="detail-grid" style="margin-top:16px">
          <div class="form-group">
            <label>Tecido ou couro?</label>
            <select name="sofa_tecido">
              <option value="linho">Tecido — Linho / Algodão</option>
              <option value="chenille">Tecido — Chenille</option>
              <option value="suede">Tecido — Suéde / Veludo</option>
              <option value="couro">Couro / Couro sintético</option>
              <option value="naosei">Não sei informar</option>
            </select>
          </div>
        </div>`
    },
    poltrona: {
      label: '🪑 Poltrona',
      fields: `
        <div class="detail-grid">
          <div class="form-group">
            <label>Quantidade de poltronas</label>
            <select name="poltrona_qtd">
              <option value="1">1 poltrona</option>
              <option value="2">2 poltronas</option>
              <option value="3">3 poltronas</option>
              <option value="4">4 poltronas</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tecido ou couro?</label>
            <select name="poltrona_tecido">
              <option value="linho">Tecido — Linho / Algodão</option>
              <option value="chenille">Tecido — Chenille</option>
              <option value="suede">Tecido — Suéde / Veludo</option>
              <option value="couro">Couro / Couro sintético</option>
              <option value="naosei">Não sei informar</option>
            </select>
          </div>
        </div>`
    },
    colchao: {
      label: '😴 Colchão',
      fields: `
        <div class="detail-grid">
          <div class="form-group">
            <label>Tamanho</label>
            <select name="colchao_tipo">
              <option value="solteiro">Solteiro (R$ 150)</option>
              <option value="2solteiros">2 Solteiros (R$ 200)</option>
              <option value="casal">Casal (R$ 200)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Quantidade</label>
            <select name="colchao_qtd">
              <option value="1">1 colchão</option>
              <option value="2">2 colchões</option>
              <option value="3">3 colchões</option>
            </select>
          </div>
        </div>`
    },
    cadeira: {
      label: '🪑 Cadeiras',
      fields: `
        <div class="detail-grid">
          <div class="form-group">
            <label>Quantidade (mínimo 6)</label>
            <select name="cadeira_qtd">
              <option value="6">6 cadeiras</option>
              <option value="8">8 cadeiras</option>
              <option value="10">10 cadeiras</option>
              <option value="12">12 cadeiras</option>
            </select>
          </div>
          <div class="form-group">
            <label>Tipo</label>
            <select name="cadeira_tipo">
              <option value="jantar">Jantar / Sala</option>
              <option value="escritorio">Escritório</option>
              <option value="gamer">Gamer</option>
            </select>
          </div>
        </div>`
    }
  };
  const c = configs[service];
  return `<h4>${c.label}</h4>${c.fields}`;
}

// CUPOM
let appliedCoupon = null;
document.getElementById('btnCupom')?.addEventListener('click', async () => {
  const code = document.getElementById('cupom').value.trim().toUpperCase();
  const msgEl = document.getElementById('cupomMsg');
  if (!code) return;

  try {
    const db = window._db;
    const { ref, get, query, orderByChild, equalTo } = window._rtdb;
    const cuponsRef = query(ref(db, 'cupons'), orderByChild('codigo'), equalTo(code));
    const snap = await get(cuponsRef);
    let found = null;
    if (snap.exists()) {
      snap.forEach(c => {
        const val = c.val();
        if (val.ativo) found = val;
      });
    }
    if (!found) {
      msgEl.textContent = '❌ Cupom inválido ou expirado.';
      msgEl.className = 'cupom-msg error';
      appliedCoupon = null;
    } else {
      appliedCoupon = found;
      msgEl.textContent = `✓ Cupom aplicado! ${found.desconto}% de desconto.`;
      msgEl.className = 'cupom-msg success';
    }
  } catch {
    // Fallback: aceita cupons demo
    const demoMap = { 'DEMO5': 5, 'DEMO7': 7, 'DEMO10': 10 };
    if (demoMap[code]) {
      appliedCoupon = { codigo: code, desconto: demoMap[code] };
      document.getElementById('cupomMsg').textContent = `✓ Cupom aplicado! ${demoMap[code]}% de desconto.`;
      document.getElementById('cupomMsg').className = 'cupom-msg success';
    } else {
      document.getElementById('cupomMsg').textContent = '❌ Cupom inválido.';
      document.getElementById('cupomMsg').className = 'cupom-msg error';
      appliedCoupon = null;
    }
  }
});

// FORM SUBMIT
document.getElementById('orcamentoForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (selectedServices.size === 0) {
    showToast('Selecione pelo menos um serviço!', 'error');
    return;
  }

  const btn = document.getElementById('btnSubmit');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Enviando...';

  // Coletar dados dos serviços
  const servicos = [];
  selectedServices.forEach(sv => {
    const item = { tipo: sv };
    if (sv === 'sofa') {
      item.pessoas = document.getElementById('sofaPessoas')?.value || '2';
      item.modelo = document.getElementById('sofaModelo')?.value || 'comum';
      item.tecido = document.querySelector('[name="sofa_tecido"]')?.value || 'naosei';
      item.subtipo = `${item.pessoas} pessoas`;
      item.quantidade = 1;
    } else if (sv === 'poltrona') {
      item.quantidade = parseInt(document.querySelector('[name="poltrona_qtd"]')?.value) || 1;
      item.tecido = document.querySelector('[name="poltrona_tecido"]')?.value || 'naosei';
      item.subtipo = `${item.quantidade} un`;
    } else if (sv === 'cadeira') {
      item.subtipo = document.querySelector('[name="cadeira_tipo"]')?.value || '';
      item.quantidade = parseInt(document.querySelector('[name="cadeira_qtd"]')?.value) || 6;
    } else {
      item.subtipo = document.querySelector(`[name="${sv}_tipo"]`)?.value || document.querySelector(`[name="${sv}_itens"]`)?.value || '';
      item.quantidade = parseInt(document.querySelector(`[name="${sv}_qtd"]`)?.value) || 1;
    }
    servicos.push(item);
  });

  // Montar endereço completo com número e complemento
  const enderecoBase = document.getElementById('endereco').value.trim();
  const numEndereco = document.getElementById('numero')?.value.trim() || '';
  const complemento = document.getElementById('complemento')?.value.trim() || '';
  let enderecoCompleto = enderecoBase;
  if (numEndereco) enderecoCompleto += `, nº ${numEndereco}`;
  if (complemento) enderecoCompleto += ` (${complemento})`;

  const valorEstimado = calcularEstimativa(servicos);
  const pedido = {
    nome: document.getElementById('nome').value.trim(),
    whatsapp: document.getElementById('whatsapp').value.trim(),
    cep: document.getElementById('cep').value.replace(/\D/g,''),
    endereco: enderecoCompleto,
    numeroEndereco: numEndereco,
    complemento: complemento,
    observacoes: document.getElementById('obs').value.trim(),
    servicos,
    valorEstimado: valorEstimado,
    cupom: appliedCoupon ? appliedCoupon.codigo : null,
    status: 'pre-aprovado',
    criadoEm: Date.now(),
    numero: null
  };

  try {
    const db = window._db;
    const { ref, push, get } = window._rtdb;

    // Gerar número sequencial
    const snap = await get(ref(db, 'orcamentos'));
    const total = snap.exists() ? Object.keys(snap.val()).length : 0;
    pedido.numero = `ORC-${String(total + 1).padStart(4,'0')}`;

    // Salva e captura o ID gerado (para vincular ao agendamento)
    const novoRef = await push(ref(db, 'orcamentos'), pedido);
    window._ultimoOrcamentoId = novoRef.key;

    // Mostrar modal
    document.getElementById('modalNumero').textContent = pedido.numero;

    // Calcula e exibe o valor estimado + parcelamento
    const estimativa = valorEstimado;
    const fmt = (v) => 'R$ ' + v.toFixed(2).replace('.', ',');
    document.getElementById('orcValorEstimado').textContent = fmt(estimativa);
    const parcela = estimativa / MAX_PARCELAS;
    document.getElementById('orcParcela').textContent =
      `à vista no Pix/débito ou em até ${MAX_PARCELAS}x de ${fmt(parcela)} no crédito`;

    document.getElementById('successModal').classList.add('open');

    // Rastreia conversão no Meta Pixel (orçamento enviado)
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', { content_name: 'Orçamento solicitado' });
    }

    e.target.reset();
    selectedServices.clear();
    serviceOptions.forEach(o => o.classList.remove('selected'));
    serviceDetails.innerHTML = '';
    appliedCoupon = null;

  } catch (err) {
    console.error(err);
    showToast('Erro ao enviar. Tente novamente ou fale pelo WhatsApp.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> Enviar Orçamento';
  }
});

function closeModal() {
  document.getElementById('successModal').classList.remove('open');
}
window.closeModal = closeModal;

// Leva o cliente para a página de agendamento, vinculando o orçamento criado
window.irParaAgendamento = function() {
  const id = window._ultimoOrcamentoId;
  if (id) {
    window.location.href = `agendar.html?id=${id}`;
  } else {
    window.location.href = 'agendar.html';
  }
};

// TOAST SYSTEM
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span>${msg}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}
window.showToast = showToast;

// ANIMATE ON SCROLL
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .step-card, .testimonial-card, .benefit-item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
