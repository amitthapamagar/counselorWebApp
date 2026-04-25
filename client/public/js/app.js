'use strict';

let counselors     = [];
let selectedEmails = new Set();
let editingId      = null;
let deletingId     = null;

// Boot
document.addEventListener('DOMContentLoaded', init);

async function init() {
  renderShell();
  attachListeners();
  await loadCounselors();
}

// ── Shell ─────────────────────────────────────────────────────────────────────
function renderShell() {
  document.getElementById('app').innerHTML = `
    <header>
      <div>
        <h1>School Counselor Directory</h1>
        <p>Manage counselors, contacts &amp; outreach</p>
      </div>
    </header>

    <main>
      <div class="tabs">
        <button class="tab-btn active" data-tab="directory">Directory</button>
        <button class="tab-btn"        data-tab="email">Compose Email</button>
      </div>

      <div class="panel active" id="panel-directory">
        <div class="toolbar">
          <div class="search-wrap">
            <svg class="search-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input id="search-input" type="text" placeholder="Search by name or school…" />
          </div>
          <span class="count" id="count-badge"></span>
          <button class="btn-download" id="btn-download">⬇ Download CSV</button>
          <button class="btn-add" id="btn-add">+ Add counselor</button>
        </div>
        <div class="grid" id="counselor-grid"></div>
      </div>

      <div class="panel" id="panel-email">
        <div class="email-layout">
          <div class="email-box">
            <h4>Select recipients</h4>
            <label class="select-all">
              <input type="checkbox" id="select-all-cb" /> Select all with email
            </label>
            <div class="divider"></div>
            <div class="recipient-list" id="recipient-list"></div>
          </div>
          <div>
            <div class="email-box" style="margin-bottom:1rem">
              <h4>Recipients</h4>
              <div class="chips" id="chips"></div>
            </div>
            <div class="email-box">
              <h4>Compose</h4>
              <div class="compose-field">
                <label>Subject</label>
                <input id="email-subject" type="text" placeholder="Subject line…" />
              </div>
              <div class="compose-field">
                <label>Message</label>
                <textarea id="email-body" rows="6" placeholder="Write your message…"></textarea>
              </div>
              <div class="compose-actions">
                <button class="btn-clear" id="btn-clear">Clear</button>
                <button class="btn-send"  id="btn-send">Send email</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Edit / Add modal -->
    <div class="modal-bg hidden" id="edit-modal">
      <div class="modal">
        <h3 id="modal-title">Edit counselor</h3>
        <div class="field"><label>Name *</label><input id="ef-name"   type="text" /></div>
        <div class="field"><label>School *</label><input id="ef-school" type="text" /></div>
        <div class="field"><label>Phone</label><input id="ef-phone"   type="text" /></div>
        <div class="field"><label>Email</label><input id="ef-email"   type="email" /></div>
        <div class="field"><label>Photo URL (optional)</label><input id="ef-image" type="text" /></div>
        <div class="modal-actions">
          <button class="btn-cancel" id="btn-edit-cancel">Cancel</button>
          <button class="btn-save"   id="btn-edit-save">Save</button>
        </div>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <div class="modal-bg hidden" id="delete-modal">
      <div class="modal modal-delete">
        <h3>Delete counselor</h3>
        <p>Remove <strong id="del-name"></strong>? This cannot be undone.</p>
        <div class="modal-actions">
          <button class="btn-cancel"      id="btn-del-cancel">Cancel</button>
          <button class="btn-confirm-del" id="btn-del-confirm">Delete</button>
        </div>
      </div>
    </div>

    <div class="toast" id="toast"></div>`;
}

// ── Listeners ─────────────────────────────────────────────────────────────────
function attachListeners() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn, .panel').forEach(el => el.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
      if (btn.dataset.tab === 'email') renderRecipientList();
    });
  });

  document.getElementById('search-input').addEventListener('input', e => loadCounselors(e.target.value));
  document.getElementById('btn-add').addEventListener('click', openAddModal);
  document.getElementById('btn-download').addEventListener('click', () => {
    API.downloadCSV();
    toast('Downloading CSV…');
  });

  document.getElementById('btn-edit-cancel').addEventListener('click', closeEditModal);
  document.getElementById('btn-edit-save').addEventListener('click', saveEdit);
  document.getElementById('edit-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeEditModal(); });

  document.getElementById('btn-del-cancel').addEventListener('click', closeDeleteModal);
  document.getElementById('btn-del-confirm').addEventListener('click', confirmDelete);
  document.getElementById('delete-modal').addEventListener('click', e => { if (e.target === e.currentTarget) closeDeleteModal(); });

  document.getElementById('select-all-cb').addEventListener('change', toggleAll);
  document.getElementById('btn-send').addEventListener('click', sendEmail);
  document.getElementById('btn-clear').addEventListener('click', clearEmail);
}

// ── Data ──────────────────────────────────────────────────────────────────────
async function loadCounselors(search = '') {
  try {
    const res = await API.getCounselors(search);
    counselors = res.data;
    renderGrid();
  } catch {
    toast('Failed to load counselors');
  }
}

// ── Grid ──────────────────────────────────────────────────────────────────────
function renderGrid() {
  const grid  = document.getElementById('counselor-grid');
  const badge = document.getElementById('count-badge');
  badge.textContent = counselors.length + ' counselor' + (counselors.length !== 1 ? 's' : '');

  if (!counselors.length) {
    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:2rem">No counselors found.</p>';
    return;
  }

  grid.innerHTML = counselors.map(c => {
    const av = c.image
      ? `<img class="avatar" src="${c.image}" alt="${c.name}" onerror="this.style.display='none';this.nextSibling.style.display='flex'" /><div class="avatar-fallback" style="display:none">${initials(c.name)}</div>`
      : `<div class="avatar-fallback">${initials(c.name)}</div>`;
    return `
      <div class="card">
        <div class="card-header">
          ${av}
          <div>
            <div class="card-name">${c.name}</div>
            <div class="card-school">${c.university}</div>
          </div>
        </div>
        <div class="card-body">
          <div class="detail">Phone: ${c.phone ? `<span>${c.phone}</span>` : '<span class="no-val">—</span>'}</div>
          <div class="detail">Email: ${c.email ? `<span>${c.email}</span>` : '<span class="no-val">—</span>'}</div>
        </div>
        <div class="card-actions">
          <button class="btn-edit"   onclick="openEditModal('${c.id}')">Edit</button>
          <button class="btn-delete" onclick="openDeleteModal('${c.id}')">Delete</button>
        </div>
      </div>`;
  }).join('');
}

// ── Edit / Add modal ──────────────────────────────────────────────────────────
function openAddModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Add counselor';
  ['ef-name','ef-school','ef-phone','ef-email','ef-image'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('edit-modal').classList.remove('hidden');
}

function openEditModal(id) {
  const c = counselors.find(x => String(x.id) === String(id));
  if (!c) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit counselor';
  document.getElementById('ef-name').value   = c.name;
  document.getElementById('ef-school').value = c.university;
  document.getElementById('ef-phone').value  = c.phone;
  document.getElementById('ef-email').value  = c.email;
  document.getElementById('ef-image').value  = c.image || '';
  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
  editingId = null;
}

async function saveEdit() {
  const payload = {
    name:       document.getElementById('ef-name').value.trim(),
    university: document.getElementById('ef-school').value.trim(),
    phone:      document.getElementById('ef-phone').value.trim(),
    email:      document.getElementById('ef-email').value.trim(),
    image:      document.getElementById('ef-image').value.trim(),
  };
  try {
    if (editingId) {
      await API.updateCounselor(editingId, payload);
      toast('Counselor updated');
    } else {
      await API.createCounselor(payload);
      toast('Counselor added');
    }
    closeEditModal();
    await loadCounselors(document.getElementById('search-input').value);
  } catch (err) {
    toast(err.message);
  }
}

// ── Delete modal ──────────────────────────────────────────────────────────────
function openDeleteModal(id) {
  deletingId = id;
  const c = counselors.find(x => String(x.id) === String(id));
  document.getElementById('del-name').textContent = c ? c.name : '';
  document.getElementById('delete-modal').classList.remove('hidden');
}

function closeDeleteModal() {
  document.getElementById('delete-modal').classList.add('hidden');
  deletingId = null;
}

async function confirmDelete() {
  try {
    await API.deleteCounselor(deletingId);
    toast('Counselor deleted');
    closeDeleteModal();
    await loadCounselors(document.getElementById('search-input').value);
  } catch (err) {
    toast(err.message);
  }
}

// ── Email panel ───────────────────────────────────────────────────────────────
function renderRecipientList() {
  document.getElementById('recipient-list').innerHTML = counselors.map(c => {
    const has     = !!c.email;
    const checked = has && selectedEmails.has(c.email);
    return `<label class="recipient-row">
      <input type="checkbox" ${checked ? 'checked' : ''} ${!has ? 'disabled' : ''} onchange="toggleEmail('${c.email}', this.checked)" />
      <div>
        <div class="rcp-name">${c.name}</div>
        ${has ? `<div class="rcp-email">${c.email}</div>` : '<div class="rcp-no-email">No email on record</div>'}
      </div>
    </label>`;
  }).join('');
  renderChips();
  updateSelectAll();
}

function toggleEmail(email, checked) {
  checked ? selectedEmails.add(email) : selectedEmails.delete(email);
  renderChips();
  updateSelectAll();
}

function toggleAll() {
  const all = counselors.filter(c => c.email).map(c => c.email);
  const selectAll = !all.every(e => selectedEmails.has(e));
  selectAll ? all.forEach(e => selectedEmails.add(e)) : all.forEach(e => selectedEmails.delete(e));
  renderRecipientList();
}

function updateSelectAll() {
  const all = counselors.filter(c => c.email).map(c => c.email);
  document.getElementById('select-all-cb').checked = all.length > 0 && all.every(e => selectedEmails.has(e));
}

function renderChips() {
  const wrap = document.getElementById('chips');
  if (!selectedEmails.size) {
    wrap.innerHTML = '<span style="font-size:12px;color:#aaa">None selected</span>';
    return;
  }
  wrap.innerHTML = [...selectedEmails].map(email => {
    const c = counselors.find(x => x.email === email);
    const label = c ? c.name.split(' ').pop() : email;
    return `<div class="chip">${label} <span class="chip-x" onclick="removeChip('${email}')">×</span></div>`;
  }).join('');
}

function removeChip(email) {
  selectedEmails.delete(email);
  renderRecipientList();
}

async function sendEmail() {
  if (!selectedEmails.size) { toast('Select at least one recipient'); return; }
  const subject = document.getElementById('email-subject').value.trim();
  const text    = document.getElementById('email-body').value.trim();
  if (!subject) { toast('Subject is required'); return; }
  if (!text)    { toast('Message body is required'); return; }

  try {
    await API.sendEmail({ to: [...selectedEmails], subject, text });
    toast('Email sent successfully');
    clearEmail();
  } catch (err) {
    toast('Send failed: ' + err.message);
  }
}

function clearEmail() {
  selectedEmails.clear();
  document.getElementById('email-subject').value = '';
  document.getElementById('email-body').value    = '';
  renderRecipientList();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(name) {
  return name.split(' ').filter(p => /[A-Za-z]/.test(p)).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2600);
}
