// =============================================
// HIGIENIZA AÍ — app.js
// =============================================

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

// Mostra/esconde o campo de tecido conforme "fibra original"
window.toggleTecido = function(select) {
  const wrap = select.closest('.detail-grid').querySelector('.sofa-tecido-wrap');
  if (!wrap) return;
  wrap.style.display = select.value === 'sim' ? 'flex' : 'none';
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
              <option value="completo">Completo (bancos + teto + tapetes)</option>
              <option value="bancos">Somente bancos</option>
              <option value="tapetes">Somente tapetes</option>
            </select>
          </div>
        </div>`
    },
    sofa: {
      label: '🛋️ Sofá / Poltrona',
      fields: `
        <div class="detail-grid">
          <div class="form-group">
            <label>Tipo</label>
            <select name="sofa_tipo">
              <option value="2lugares">2 lugares</option>
              <option value="3lugares">3 lugares</option>
              <option value="4lugares">4 lugares</option>
              <option value="5lugares">5 lugares ou +</option>
              <option value="chaise">Com chaise</option>
              <option value="poltrona">Poltrona</option>
            </select>
          </div>
          <div class="form-group">
            <label>Quantidade</label>
            <select name="sofa_qtd">
              <option value="1">1 peça</option>
              <option value="2">2 peças</option>
              <option value="3">3 peças</option>
            </select>
          </div>
          <div class="form-group">
            <label>É retrátil/reclinável?</label>
            <select name="sofa_retratil">
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
              <option value="naosei">Não sei informar</option>
            </select>
          </div>
          <div class="form-group">
            <label>É de fibra original?</label>
            <select name="sofa_fibra" onchange="toggleTecido(this)">
              <option value="nao">Não</option>
              <option value="sim">Sim</option>
              <option value="naosei">Não sei informar</option>
            </select>
          </div>
          <div class="form-group sofa-tecido-wrap" style="display:none">
            <label>Tipo de tecido</label>
            <select name="sofa_tecido">
              <option value="linho">Linho / Algodão</option>
              <option value="chenille">Chenille</option>
              <option value="couro">Couro / Couro sintético</option>
              <option value="suede">Suéde / Veludo</option>
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
              <option value="solteiro">Solteiro</option>
              <option value="casal">Casal</option>
              <option value="queen">Queen</option>
              <option value="king">King</option>
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
            <label>Tipo</label>
            <select name="cadeira_tipo">
              <option value="jantar">Jantar / Sala</option>
              <option value="escritorio">Escritório</option>
              <option value="gamer">Gamer</option>
              <option value="cadeirao">Cadeirão</option>
            </select>
          </div>
          <div class="form-group">
            <label>Quantidade</label>
            <select name="cadeira_qtd">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="4">4</option>
              <option value="6">6</option>
              <option value="8">8 ou +</option>
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
    const tipo = document.querySelector(`[name="${sv}_tipo"]`)?.value || '';
    const qtd = document.querySelector(`[name="${sv}_qtd"]`)?.value || '1';
    const item = { tipo: sv, subtipo: tipo, quantidade: parseInt(qtd) || 1 };
    // Campos extras específicos do sofá
    if (sv === 'sofa') {
      item.retratil = document.querySelector('[name="sofa_retratil"]')?.value || 'nao';
      item.fibra = document.querySelector('[name="sofa_fibra"]')?.value || 'nao';
      item.tecido = document.querySelector('[name="sofa_fibra"]')?.value === 'sim'
        ? (document.querySelector('[name="sofa_tecido"]')?.value || 'naosei')
        : null;
    }
    servicos.push(item);
  });

  const pedido = {
    nome: document.getElementById('nome').value.trim(),
    whatsapp: document.getElementById('whatsapp').value.trim(),
    cep: document.getElementById('cep').value.replace(/\D/g,''),
    endereco: document.getElementById('endereco').value.trim(),
    observacoes: document.getElementById('obs').value.trim(),
    servicos,
    cupom: appliedCoupon ? appliedCoupon.codigo : null,
    status: 'novo',
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

    await push(ref(db, 'orcamentos'), pedido);

    // Notificar admin via WhatsApp (substitua pelo número do admin)
    const adminWhats = '5511992067073';
    const msg = encodeURIComponent(
      `🔔 *Novo Pedido de Orçamento!*\n\n` +
      `📋 *Número:* ${pedido.numero}\n` +
      `👤 *Cliente:* ${pedido.nome}\n` +
      `📱 *WhatsApp:* ${pedido.whatsapp}\n` +
      `📍 *Endereço:* ${pedido.endereco}\n` +
      `🛋️ *Serviços:* ${servicos.map(s => `${s.tipo} (${s.subtipo})`).join(', ')}\n` +
      `${appliedCoupon ? `🎟️ *Cupom:* ${appliedCoupon.codigo} (${appliedCoupon.desconto}%)\n` : ''}` +
      `\n_Acesse o painel para calcular e enviar o orçamento._`
    );
    // Abre WA em nova aba (admin recebe notificação)
    window.open(`https://wa.me/${adminWhats}?text=${msg}`, '_blank');

    // Mostrar modal
    document.getElementById('modalWhats').textContent = pedido.whatsapp;
    document.getElementById('modalNumero').textContent = pedido.numero;
    document.getElementById('successModal').classList.add('open');

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
    btn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg> Solicitar Orçamento Grátis';
  }
});

function closeModal() {
  document.getElementById('successModal').classList.remove('open');
}
window.closeModal = closeModal;

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
