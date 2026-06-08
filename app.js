// ==================== INICIALIZAÇÃO ====================
let fiscalizacoes = JSON.parse(localStorage.getItem('pavFiscal')) || [];
let config = JSON.parse(localStorage.getItem('pavFiscalConfig')) || {
  cloudSync: false,
  notifications: true,
  darkMode: false,
  autoBackup: true
};

document.addEventListener('DOMContentLoaded', function() {
  atualizarDashboard();
  carregarHistorico();
  aplicarConfiguracao();
  setarDataAtual();
});

// ==================== NAVEGAÇÃO ====================
function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.menu li').forEach(m => m.classList.remove('active'));

  document.getElementById(page).classList.add('active');
  event.target.classList.add('active');

  if (page === 'fotos') {
    carregarGaleria();
  } else if (page === 'nao-conformidades') {
    carregarNaoConformidades();
  } else if (page === 'progresso') {
    atualizarProgresso();
  }
}

// ==================== DASHBOARD ====================
function atualizarDashboard() {
  const total = fiscalizacoes.length;
  const nc = fiscalizacoes.filter(x => x.naoConformidade && x.naoConformidade.trim() !== '').length;
  const totalFotos = fiscalizacoes.reduce((acc, f) => acc + (f.fotos ? f.fotos.length : 0), 0);
  const taxa = total > 0 ? Math.round(((total - nc) / total) * 100) : 0;

  document.getElementById('totalFiscalizacoes').innerText = total;
  document.getElementById('totalNC').innerText = nc;
  document.getElementById('totalFotos').innerText = totalFotos;
  document.getElementById('taxaConformidade').innerText = taxa + '%';

  gerarChartEtapas();
  carregarUltimasFiscalizacoes();
}

function gerarChartEtapas() {
  const etapas = {};
  fiscalizacoes.forEach(f => {
    etapas[f.etapa] = (etapas[f.etapa] || 0) + 1;
  });

  let html = '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">';
  for (let [etapa, count] of Object.entries(etapas)) {
    html += `<div style="background: white; padding: 15px; border-radius: 8px; text-align: center; border-top: 4px solid #2563eb;"><p style="color: #64748b; margin-bottom: 5px;">${etapa}</p><h2 style="color: #2563eb; margin: 0;">${count}</h2></div>`;
  }
  html += '</div>';
  document.getElementById('chartEtapas').innerHTML = html;
}

function carregarUltimasFiscalizacoes() {
  const ultimas = fiscalizacoes.slice(0, 3);
  let html = '';

  if (ultimas.length === 0) {
    html = '<p style="color: #64748b; text-align: center; padding: 20px;">Nenhuma fiscalização registrada</p>';
  } else {
    ultimas.forEach(item => {
      const badge = item.naoConformidade ? `<span class="badge" style="background: #f59e0b;">⚠️ ${item.severidade || 'Desvio'}</span>` : '<span class="badge" style="background: #10b981;">✅ Conforme</span>';
      html += `<div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #2563eb;"><div style="display: flex; justify-content: space-between;"><div><h3>${item.etapa}</h3><p><b>Data:</b> ${item.data}</p><p><b>Trecho:</b> ${item.trecho}</p></div>${badge}</div></div>`;
    });
  }

  document.getElementById('ultimasFiscalizacoes').innerHTML = html;
}

// ==================== FORMULÁRIO ====================
function setarDataAtual() {
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('data').value = hoje;
}

function salvarFiscalizacao() {
  if (!document.getElementById('data').value || !document.getElementById('trecho').value || !document.getElementById('etapa').value) {
    alert('⚠️ Preencha os campos obrigatórios!');
    return;
  }

  let arquivos = document.getElementById('fotos').files;
  let fotos = [];

  if (arquivos.length === 0) {
    gravar([]);
    return;
  }

  let carregadas = 0;

  for (let arquivo of arquivos) {
    if (arquivo.size > 5242880) {
      alert('❌ Imagem muito grande! Máximo 5MB');
      continue;
    }

    let reader = new FileReader();
    reader.onload = function(e) {
      fotos.push(e.target.result);
      carregadas++;

      if (carregadas === arquivos.length) {
        gravar(fotos);
      }
    };
    reader.readAsDataURL(arquivo);
  }
}

function gravar(fotos) {
  let checklist = [];
  document.querySelectorAll('.checklist input:checked').forEach(c => {
    checklist.push(c.value);
  });

  let registro = {
    id: Date.now(),
    data: document.getElementById('data').value,
    trecho: document.getElementById('trecho').value,
    municipio: document.getElementById('municipio').value,
    etapa: document.getElementById('etapa').value,
    responsavel: document.getElementById('responsavel').value,
    observacao: document.getElementById('observacao').value,
    naoConformidade: document.getElementById('naoConformidade').value,
    severidade: document.getElementById('severidade').value,
    checklist: checklist,
    fotos: fotos,
    timestamp: new Date().toISOString()
  };

  fiscalizacoes.unshift(registro);
  localStorage.setItem('pavFiscal', JSON.stringify(fiscalizacoes));

  if (config.notifications) {
    mostrarNotificacao('✅ Fiscalização salva com sucesso!');
  }

  document.querySelectorAll('.formulario input, .formulario select, .formulario textarea').forEach(el => {
    if (el.type !== 'checkbox') el.value = '';
  });
  document.querySelectorAll('.formulario input[type="checkbox"]').forEach(el => el.checked = false);

  atualizarDashboard();
  carregarHistorico();
  setarDataAtual();
}

// ==================== HISTÓRICO ====================
function carregarHistorico() {
  let historico = document.getElementById('historico');
  historico.innerHTML = '';

  if (fiscalizacoes.length === 0) {
    historico.innerHTML = '<p style="text-align: center; color: #64748b; padding: 20px;">Nenhuma fiscalização registrada</p>';
    return;
  }

  fiscalizacoes.forEach((item) => {
    let htmlFotos = '';
    if (item.fotos && item.fotos.length > 0) {
      item.fotos.forEach((f) => {
        htmlFotos += `<img src="${f}" style="width: 150px; height: 100px; object-fit: cover; border-radius: 8px; margin-right: 10px; margin-bottom: 10px; cursor: pointer;" onclick="abrirLightbox('${f}')">`;
      });
    }

    const badge = item.naoConformidade ? `<span class="badge" style="background: #f59e0b;">⚠️ ${item.severidade}</span>` : '<span class="badge" style="background: #10b981;">✅ Conforme</span>';

    historico.innerHTML += `
      <div style="background: white; padding: 25px; margin-bottom: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border-left: 4px solid #2563eb;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
          <div>
            <h3>${item.etapa}</h3>
            <p><b>Data:</b> ${item.data}</p>
            <p><b>Trecho:</b> ${item.trecho}</p>
            ${item.municipio ? `<p><b>Município:</b> ${item.municipio}</p>` : ''}
          </div>
          <div>
            ${badge}
            <button onclick="deletarFiscalizacao(${item.id})" class="btn-danger" style="margin-top: 10px; padding: 8px 12px; font-size: 0.9rem;">Deletar</button>
          </div>
        </div>
        ${item.observacao ? `<p><b>Observação:</b> ${item.observacao}</p>` : ''}
        ${item.checklist.length > 0 ? `<p><b>Checklist:</b> ${item.checklist.join(', ')}</p>` : ''}
        ${item.naoConformidade ? `<p><b>Não Conformidade:</b> ${item.naoConformidade}</p>` : ''}
        ${htmlFotos ? `<div style="margin-top: 15px;">${htmlFotos}</div>` : ''}
      </div>
    `;
  });
}

function deletarFiscalizacao(id) {
  if (confirm('Tem certeza que deseja deletar esta fiscalização?')) {
    fiscalizacoes = fiscalizacoes.filter(f => f.id !== id);
    localStorage.setItem('pavFiscal', JSON.stringify(fiscalizacoes));
    atualizarDashboard();
    carregarHistorico();
    mostrarNotificacao('✅ Fiscalização deletada');
  }
}

// ==================== GALERIA ====================
function carregarGaleria() {
  let galeria = document.getElementById('galeria');
  galeria.innerHTML = '';

  let todasAsFotos = [];

  fiscalizacoes.forEach(f => {
    if (f.fotos && f.fotos.length > 0) {
      f.fotos.forEach((foto) => {
        todasAsFotos.push({
          src: foto,
          etapa: f.etapa,
          data: f.data,
          trecho: f.trecho
        });
      });
    }
  });

  if (todasAsFotos.length === 0) {
    galeria.innerHTML = '<p style="text-align: center; color: #64748b; grid-column: 1/-1; padding: 20px;">Nenhuma foto registrada</p>';
    return;
  }

  todasAsFotos.forEach(foto => {
    const div = document.createElement('div');
    div.className = 'foto-item';
    div.innerHTML = `
      <img src="${foto.src}" onclick="abrirLightbox('${foto.src}')">
      <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent); color: white; padding: 20px 15px 15px; font-size: 0.9rem;">
        <p><b>${foto.etapa}</b></p>
        <p>${foto.data}</p>
        <p>${foto.trecho}</p>
      </div>
    `;
    galeria.appendChild(div);
  });
}

// ==================== NÃO CONFORMIDADES ====================
function carregarNaoConformidades() {
  const container = document.getElementById('naoConformidadesContainer');
  container.innerHTML = '';

  const ncs = fiscalizacoes.filter(f => f.naoConformidade && f.naoConformidade.trim() !== '');

  if (ncs.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #64748b; padding: 20px;">Nenhuma não conformidade registrada</p>';
    return;
  }

  ncs.forEach(nc => {
    const div = document.createElement('div');
    div.className = 'registro';
    div.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <h3>${nc.etapa}</h3>
          <p><b>Data:</b> ${nc.data}</p>
          <p><b>Trecho:</b> ${nc.trecho}</p>
          <p><b>Descrição:</b> ${nc.naoConformidade}</p>
        </div>
        <span class="badge" style="background: ${nc.severidade === 'Crítica' ? '#ef4444' : nc.severidade === 'Alta' ? '#f97316' : nc.severidade === 'Média' ? '#f59e0b' : '#06b6d4'}">
          ${nc.severidade || 'Sem severidade'}
        </span>
      </div>
    `;
    container.appendChild(div);
  });
}

// ==================== PROGRESSO ====================
function atualizarProgresso() {
  const etapas = [
    'Terraplenagem', 'Sub-base', 'Base', 'Meio-fio', 'Drenagem',
    'Imprimação', 'Pintura de Ligação', 'CBUQ', 'Sinalização'
  ];

  etapas.forEach(etapa => {
    const count = fiscalizacoes.filter(f => f.etapa === etapa).length;
    const percent = count > 0 ? Math.min((count / 5) * 100, 100) : 0;

    const elementId = 'prog-' + etapa.toLowerCase().replace(/\s+/g, '').replace(/ã/g, 'a');
    const element = document.getElementById(elementId);

    if (element) {
      element.style.width = percent + '%';
      element.textContent = Math.round(percent) + '%';
    }
  });
}

// ==================== RELATÓRIOS ====================
function gerarRelatorioPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text('RELATÓRIO - PavFiscal Pro', 10, 10);
  doc.setFontSize(10);
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 10, 20);
  doc.text(`Total: ${fiscalizacoes.length}`, 10, 25);
  
  const nc = fiscalizacoes.filter(x => x.naoConformidade && x.naoConformidade.trim() !== '').length;
  doc.text(`Não Conformidades: ${nc}`, 10, 30);
  
  doc.save('relatorio-pavfiscal.pdf');
  mostrarNotificacao('✅ PDF gerado!');
}

function exportarCSV() {
  let csv = 'Data,Etapa,Trecho,Município,Observação,Não Conformidade,Severidade\n';

  fiscalizacoes.forEach(item => {
    csv += `"${item.data}","${item.etapa}","${item.trecho}","${item.municipio || ''}","${item.observacao || ''}","${item.naoConformidade || ''}","${item.severidade || ''}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `pavfiscal-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();

  mostrarNotificacao('✅ CSV exportado!');
}

function gerarRelatorioPorEtapa() {
  let html = '<h3>Relatório por Etapa</h3>';
  const etapas = {};
  fiscalizacoes.forEach(f => {
    etapas[f.etapa] = (etapas[f.etapa] || 0) + 1;
  });

  html += '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;"><tr style="background: #2563eb; color: white;"><th style="padding: 10px; text-align: left;">Etapa</th><th style="padding: 10px;">Total</th></tr>';
  for (let [etapa, count] of Object.entries(etapas)) {
    html += `<tr style="border-bottom: 1px solid #ddd;"><td style="padding: 10px;">${etapa}</td><td style="padding: 10px; text-align: center;">${count}</td></tr>`;
  }
  html += '</table>';
  document.getElementById('relatorio-content').innerHTML = html;
}

function gerarRelatorioPorData() {
  let html = '<h3>Relatório por Período</h3>';
  const porData = {};
  fiscalizacoes.forEach(f => {
    porData[f.data] = (porData[f.data] || 0) + 1;
  });

  html += '<table style="width: 100%; border-collapse: collapse; margin-top: 15px;"><tr style="background: #2563eb; color: white;"><th style="padding: 10px; text-align: left;">Data</th><th style="padding: 10px;">Fiscalizações</th></tr>';
  for (let [data, count] of Object.entries(porData).sort().reverse()) {
    html += `<tr style="border-bottom: 1px solid #ddd;"><td style="padding: 10px;">${data}</td><td style="padding: 10px; text-align: center;">${count}</td></tr>`;
  }
  html += '</table>';
  document.getElementById('relatorio-content').innerHTML = html;
}

// ==================== CONFIGURAÇÕES ====================
function abrirConfiguracao() {
  document.getElementById('configuracao-modal').classList.add('show');
  document.getElementById('cloudSync').checked = config.cloudSync;
  document.getElementById('notifications').checked = config.notifications;
  document.getElementById('darkMode').checked = config.darkMode;
}

function fecharConfiguracao() {
  document.getElementById('configuracao-modal').classList.remove('show');
}

function salvarConfiguracao() {
  config = {
    cloudSync: document.getElementById('cloudSync').checked,
    notifications: document.getElementById('notifications').checked,
    darkMode: document.getElementById('darkMode').checked,
    autoBackup: document.getElementById('autoBackup').checked
  };

  localStorage.setItem('pavFiscalConfig', JSON.stringify(config));
  aplicarConfiguracao();
  fecharConfiguracao();
  mostrarNotificacao('✅ Configurações salvas!');
}

function aplicarConfiguracao() {
  if (config.darkMode) {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// ==================== DADOS ====================
function exportarDados() {
  const dados = {
    fiscalizacoes: fiscalizacoes,
    config: config,
    exportadoEm: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `pavfiscal-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();

  mostrarNotificacao('✅ Backup exportado!');
}

function limparDados() {
  if (confirm('⚠️ Deletar todos os dados permanentemente?')) {
    if (confirm('⚠️ ÚLTIMA CONFIRMAÇÃO!')) {
      localStorage.removeItem('pavFiscal');
      localStorage.removeItem('pavFiscalConfig');
      fiscalizacoes = [];
      config = { cloudSync: false, notifications: true, darkMode: false, autoBackup: true };
      atualizarDashboard();
      carregarHistorico();
      mostrarNotificacao('✅ Dados deletados!');
    }
  }
}

// ==================== UTILIDADES ====================
function abrirLightbox(src) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.9); display: flex; align-items: center;
    justify-content: center; z-index: 3000; cursor: pointer;
  `;
  modal.innerHTML = `
    <div style="position: relative; max-width: 90%; max-height: 90%;">
      <img src="${src}" style="max-width: 100%; max-height: 90vh; border-radius: 8px;">
      <span onclick="this.parentElement.parentElement.remove()" style="
        position: absolute; top: -40px; right: 0; color: white; font-size: 30px;
        cursor: pointer; font-weight: bold;
      ">&times;</span>
    </div>
  `;
  modal.onclick = function() { this.remove(); };
  document.body.appendChild(modal);
}

function mostrarNotificacao(mensagem) {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; background: #10b981;
    color: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 2000;
  `;
  notif.innerText = mensagem;
  document.body.appendChild(notif);

  setTimeout(() => notif.remove(), 3000);
}

window.onclick = function(event) {
  const modal = document.getElementById('configuracao-modal');
  if (event.target === modal) {
    modal.classList.remove('show');
  }
}
