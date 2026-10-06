/* Perfil, IA, manual y ayuda corta al lado de cada sección. */
(function () {
  const HELP = {
    dashboard: ['Panel', 'Resume tu actividad en IPHub.', 'Los números salen de tu propia auditoría: eventos, consultas de IP, escaneos y DNS. No mira la red de otra cuenta.'],
    topology: ['Topología', 'Muestra la red que publicó tu exe o un archivo importado.', 'Cada cuenta tiene su propio inventario. El mapa pone el router arriba, los switch en el medio y los hosts abajo. Un switch se reconoce por el fabricante (Cisco, Aruba, Ubiquiti, TP-Link y similares) o por servicios de administración. La tabla de ruteo es la que se puede inferir: ruta por defecto hacia el gateway y la red local conectada.'],
    tools: ['Herramientas', 'Diagnóstico real: IP, puertos, traceroute, DNS, subredes, ARP y velocidad.', 'Las consultas salen del servidor o de tu equipo, solo contra el objetivo que escribís. No usa datos de otra cuenta.'],
    audit: ['Auditoría', 'Historial de lo que hiciste en la plataforma.', 'Se guarda en tu usuario: inicio de sesión, herramientas y cambios de perfil.'],
    learn: ['Aprender', 'Quizzes de redes generados con la IA que elegiste.', 'El enunciado usa el prompt de aprendizaje de tu cuenta. Si no hay clave del proveedor elegido, se usa el banco local.'],
    leaderboard: ['Ranking', 'Ordena cuentas por XP.', 'El XP sale de herramientas y quizzes de cada usuario.'],
    support: ['Soporte', 'Tickets y reseñas.', 'El ticket se guarda y se avisa al correo de soporte.'],
    account: ['Mi cuenta', 'Perfil personal o empresa, IA y clave API.', 'La clave API autoriza las mismas funciones que la sesión. Mandala en el encabezado X-API-Key.'],
    empresa: ['Empresa', 'Roles y enlaces para compartir.', 'Solo el dueño asigna roles y define qué sección ve cada correo.'],
  };
  const $ = id => document.getElementById(id);

  function mark() {
    document.querySelectorAll('.section-header h2').forEach(h => {
      if (h.querySelector('.qmark')) return;
      const sec = h.closest('.section');
      const key = sec && sec.id;
      const item = HELP[key]; if (!item) return;
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'qmark'; b.textContent = '?'; b.title = item[1];
      b.onclick = () => openHelp(key);
      h.appendChild(b);
    });
  }

  function openHelp(key) {
    const item = HELP[key] || ['Ayuda', '', ''];
    location.hash = 'manual-' + key;
    const box = $('manual-body');
    if (box) box.innerHTML = `<h3>${item[0]}</h3><p>${item[1]}</p><p>${item[2]}</p>`;
    if (typeof showSection === 'function') showSection('manual');
  }

  function manual() {
    const box = $('manual-body'); if (!box || box.dataset.ready) return;
    box.dataset.ready = '1';
    box.innerHTML = Object.entries(HELP).map(([k, v]) => `<article id="manual-${k}" class="card glass"><h3>${v[0]}</h3><p>${v[1]}</p><p>${v[2]}</p></article>`).join('');
  }

  async function profileCard() {
    const host = $('profile-box'); if (!host || !window.ME) return;
    let d = {};
    try { d = await api('/api/profile'); } catch (_) { return; }
    host.innerHTML = `<h3>Perfil <button type="button" class="qmark" id="q-profile">?</button></h3>
      <p class="muted small">Si no elegís nada, la cuenta queda personal.</p>
      <div class="tool-form">
        <select id="pf-type"><option value="0">Personal</option><option value="1">Empresa</option></select>
        <select id="pf-ai"><option value="auto">IA automática</option><option value="groq">Groq</option><option value="gemini">Gemini</option><option value="openrouter">OpenRouter</option></select>
        <button class="btn btn-primary" id="pf-save" type="button">Guardar perfil</button>
      </div>
      <label>Prompt de Aprender</label>
      <textarea id="pf-prompt" rows="3">${d.learnPrompt || ''}</textarea>
      <p class="muted small">La clave API de esta cuenta sirve para todas las funciones: encabezado <code>X-API-Key</code>.</p>`;
    $('pf-type').value = d.profile && d.profile.isBusiness ? '1' : '0';
    $('pf-ai').value = d.aiProvider || 'auto';
    $('pf-save').onclick = async () => {
      await api('/api/profile', { method: 'PUT', body: { isBusiness: $('pf-type').value === '1', aiProvider: $('pf-ai').value, learnPrompt: $('pf-prompt').value } });
      if (typeof toast === 'function') toast('Perfil guardado');
    };
    $('q-profile').onclick = () => openHelp('account');
  }

  async function traces() {
    const box = $('trace-box'); if (!box) return;
    try {
      const d = await api('/api/agent/snapshot');
      const rows = (d.snapshot && d.snapshot.traces) || [];
      const routes = (d.snapshot && d.snapshot.routes) || [];
      box.innerHTML = `<h3>Trazas de esta cuenta</h3>
        <p class="muted small">${rows.length ? '' : 'Todavía no hay trazas del exe.'}</p>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Cuando</th><th>Protocolo</th><th>IP</th><th>Info</th></tr></thead><tbody>
        ${rows.map(t => `<tr><td>${t.at || ''}</td><td>${t.proto || ''}</td><td>${t.ip || ''}</td><td>${t.info || ''} ${t.ttl ? 'TTL ' + t.ttl : ''}</td></tr>`).join('') || '<tr><td colspan="4">Sin trazas</td></tr>'}
        </tbody></table></div>
        <h3>Tabla de ruteo inferida</h3>
        <div class="table-wrap"><table class="data-table"><thead><tr><th>Destino</th><th>Vía</th><th>Protocolo</th></tr></thead><tbody>
        ${routes.map(r => `<tr><td>${r.dest}</td><td>${r.via}</td><td>${r.proto}</td></tr>`).join('') || '<tr><td colspan="3">Sin datos</td></tr>'}
        </tbody></table></div>`;
    } catch (_) {}
  }

  const orig = window.showSection;
  if (orig) window.showSection = function (id) { orig(id); if (id === 'account') profileCard(); if (id === 'manual') manual(); if (id === 'topology') traces(); };
  setInterval(() => { if (window.ME) { mark(); manual(); } }, 1000);
})();
