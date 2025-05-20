// ----------- Stockage local -----------
const store = {
  getPatients: () => JSON.parse(localStorage.getItem('patients') || "[]"),
  savePatients: (p) => localStorage.setItem('patients', JSON.stringify(p)),
  getRDV: () => JSON.parse(localStorage.getItem('rdv') || "[]"),
  saveRDV: (r) => localStorage.setItem('rdv', JSON.stringify(r))
};

// ----------- Navigation onglets -----------
document.querySelectorAll('nav button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-section').forEach(sec => sec.style.display = 'none');
    document.getElementById(btn.dataset.tab).style.display = '';
    if(btn.dataset.tab === 'calendar') renderCalendar();
    if(btn.dataset.tab === 'dashboard') renderDashboard();
    if(btn.dataset.tab === 'patients') renderPatientList();
  }
});

// ----------- Liste des patients -----------
function renderPatientList(search = '') {
  let patients = store.getPatients();
  if (search) {
    const s = search.toLowerCase();
    patients = patients.filter(p =>
      p.nom.toLowerCase().includes(s) ||
      p.prenom.toLowerCase().includes(s) ||
      (p.tel||"").includes(s) ||
      (p.id+'').includes(s)
    );
  }
  const list = document.getElementById('patientList');
  list.innerHTML = patients.length ? patients.map(p => `
    <div class="patient-row" onclick="loadPatient('${p.id}')">
      <span><b>${p.nom}</b> ${p.prenom} <small style="color:grey;font-size:0.93em;">(${p.tel||''})</small></span>
      <span style="font-size:0.92em;color:#888;">Fiche #${p.id}</span>
    </div>
  `).join('') : '<i>Aucun patient.</i>';
  updatePatientSelect();
}
window.loadPatient = function(id) {
  const p = store.getPatients().find(x=>x.id==id);
  if(!p) return;
  document.getElementById('fiche-id').value = p.id;
  document.getElementById('fiche-nom').value = p.nom;
  document.getElementById('fiche-prenom').value = p.prenom;
  document.getElementById('fiche-naissance').value = p.naissance||"";
  document.getElementById('fiche-tel').value = p.tel||"";
  document.getElementById('fiche-email').value = p.email||"";
  document.getElementById('fiche-raison').value = p.raison||"";
  document.getElementById('fiche-traitement').value = p.traitement||"";
  document.getElementById('fiche-contraception').value = p.contraception||"";
  document.getElementById('fiche-allergies').value = p.allergies||"";
  document.getElementById('fiche-antecedents').value = p.antecedents||"";
  document.getElementById('fiche-consult').value = p.consult||"";
  document.getElementById('ficheSuppr').style.display = '';
  document.getElementById('ficheTitle').textContent = `Fiche de ${p.prenom} ${p.nom}`;
  document.getElementById('fiche-nom').focus();
};

// ----------- Formulaire patient -----------
document.getElementById('fichePatientForm').onsubmit = function(e) {
  e.preventDefault();
  const p = {
    id: document.getElementById('fiche-id').value || (''+Date.now()),
    nom: document.getElementById('fiche-nom').value.trim(),
    prenom: document.getElementById('fiche-prenom').value.trim(),
    naissance: document.getElementById('fiche-naissance').value,
    tel: document.getElementById('fiche-tel').value.trim(),
    email: document.getElementById('fiche-email').value.trim(),
    raison: document.getElementById('fiche-raison').value.trim(),
    traitement: document.getElementById('fiche-traitement').value.trim(),
    contraception: document.getElementById('fiche-contraception').value,
    allergies: document.getElementById('fiche-allergies').value.trim(),
    antecedents: document.getElementById('fiche-antecedents').value.trim(),
    consult: document.getElementById('fiche-consult').value,
  };
  let patients = store.getPatients();
  const i = patients.findIndex(x=>x.id==p.id);
  if(i>-1) patients[i] = p; else patients.push(p);
  store.savePatients(patients);
  renderPatientList();
  loadPatient(p.id);
  saveStatus('Patient enregistré.');
};

function saveStatus(msg) {
  const s = document.getElementById('saveStatus');
  s.textContent = msg;
  s.style.color = 'var(--jade)';
  setTimeout(()=>{ s.textContent=''; }, 1800);
}

document.getElementById('ficheNouveau').onclick = () => {
  document.getElementById('fichePatientForm').reset();
  document.getElementById('fiche-id').value = "";
  document.getElementById('ficheSuppr').style.display = "none";
  document.getElementById('ficheTitle').textContent = "Nouvelle fiche patient";
  document.getElementById('fiche-nom').focus();
};
document.getElementById('ficheSuppr').onclick = () => {
  if(!confirm('Supprimer ce patient ?')) return;
  const id = document.getElementById('fiche-id').value;
  let patients = store.getPatients().filter(p=>p.id!=id);
  store.savePatients(patients);
  renderPatientList();
  document.getElementById('fichePatientForm').reset();
  document.getElementById('ficheSuppr').style.display = "none";
  document.getElementById('ficheTitle').textContent = "Fiche patient";
  saveStatus('Patient supprimé.');
};

document.getElementById('searchPatient').oninput = function() {
  renderPatientList(this.value);
};

// ----------- Sélection patient dans RDV -----------
function updatePatientSelect() {
  const patients = store.getPatients();
  const sel = document.getElementById('rdv-patient');
  if(!sel) return;
  sel.innerHTML = '<option value="">Choisir...</option>' +
    patients.map(p=>`<option value="${p.id}">${p.prenom} ${p.nom}</option>`).join('');
}

// ----------- Gestion rendez-vous -----------
document.getElementById('rdvForm').onsubmit = function(e) {
  e.preventDefault();
  const r = {
    id: ''+Date.now(),
    date: document.getElementById('rdv-date').value,
    heure: document.getElementById('rdv-heure').value,
    patientId: document.getElementById('rdv-patient').value,
    motif: document.getElementById('rdv-motif').value,
  };
  if(!r.patientId) return alert("Sélectionner un patient.");
  let rdv = store.getRDV();
  rdv.push(r);
  store.saveRDV(rdv);
  renderCalendar();
  alert('Rendez-vous ajouté.');
  this.reset();
};

// ----------- Calendrier -----------
function renderCalendar() {
  const days = [];
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth()+1, 0);
  const startDay = first.getDay()||7;
  for(let i=1; i<startDay; ++i) days.push('');
  for(let i=1; i<=last.getDate(); ++i) days.push(i);
  const rdv = store.getRDV().filter(r=>{
    const d = new Date(r.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const patients = store.getPatients();
  let html = '<div class="calendar">';
  for(let i=0;i<days.length;++i) {
    html += `<div class="calendar-day">` + (days[i]?`<b>${days[i]}</b>`:'');
    if(days[i]) {
      const dateStr = now.getFullYear()+'-'+(String(now.getMonth()+1).padStart(2,'0'))+'-'+String(days[i]).padStart(2,'0');
      rdv.filter(r=>r.date==dateStr).forEach(r=>{
        const p = patients.find(p=>p.id==r.patientId);
        html += `<span class="rdv">${r.heure||''} ${p?p.prenom+' '+p.nom:''}<br>${r.motif||''}</span>`;
      });
    }
    html += `</div>`;
  }
  html += '</div>';
  document.getElementById('calendarDays').innerHTML = html;
  updateStats();
}

// ----------- Tableau de bord -----------
function renderDashboard() {
  updateStats();
  // Dernières consultations
  let patients = store.getPatients();
  let consults = [];
  patients.forEach(p=>{
    if(p.consult && p.consult.trim())
      consults.push({ ...p, note: p.consult, ts: Number(p.id) });
  });
  consults = consults.sort((a,b)=>b.ts-a.ts).slice(0,4);
  document.getElementById('lastConsults').innerHTML =
    consults.length ? consults.map(c=>`
      <div style="margin-bottom:1em">
        <b>${c.prenom} ${c.nom}</b> <small style="color:#888;">(Fiche #${c.id})</small><br>
        <span style="font-size:0.95em">${c.note.substring(0,120)}${c.note.length>120?'…':''}</span>
      </div>
    `).join('') : '<i>Aucune consultation récente.</i>';
}

function updateStats() {
  const patients = store.getPatients();
  const rdv = store.getRDV();
  let nbConsults = patients.reduce((acc, p) => acc + (p.consult && p.consult.trim() ? 1 : 0), 0);
  let nbRDV = rdv.filter(r => new Date(r.date) >= new Date()).length;
  document.getElementById('nbPatients').textContent = patients.length;
  document.getElementById('nbSessions').textContent = nbConsults;
  document.getElementById('nbRDV').textContent = nbRDV;
}

// ----------- Import/Export JSON -----------
document.getElementById('btnExport').onclick = () => {
  const data = {
    patients: store.getPatients(),
    rdv: store.getRDV(),
    exportDate: new Date().toISOString()
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)], {type: "application/json"}));
  const a = document.createElement('a');
  a.href = url;
  a.download = `patients-mtc-${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(()=>{document.body.removeChild(a); URL.revokeObjectURL(url);}, 200);
};

document.getElementById('btnImport').onclick = () => {
  document.getElementById('importFile').click();
};
document.getElementById('importFile').onchange = function(e) {
  if(!this.files[0]) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if(!data.patients || !Array.isArray(data.patients)) throw "Format incorrect";
      store.savePatients(data.patients);
      store.saveRDV(data.rdv||[]);
      alert('Base importée.');
      renderPatientList();
      renderDashboard();
      renderCalendar();
    } catch(e) { alert('Erreur lors de l\'import.'); }
  }
  reader.readAsText(this.files[0]);
};

// ----------- Dark mode -----------
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if(localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && prefersDark))
  document.body.classList.add('dark');
document.getElementById('btnTheme').onclick = function() {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
};

// ----------- Init -----------
renderDashboard();
renderPatientList();
renderCalendar();
