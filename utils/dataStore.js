/**
 * Simple JSON-file-backed data store.
 * Reads from / writes to data/counselors.json.
 * Swap this module for a real DB adapter (e.g. Mongoose, pg) without
 * touching any route handlers.
 */
const fs   = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const FILE = path.join(__dirname, '..', 'data', 'counselors.json');

function readAll() {
  const raw = fs.readFileSync(FILE, 'utf8');
  return JSON.parse(raw);
}

function writeAll(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf8');
}

const store = {
  /** Return all counselors, optionally filtered by name or university. */
  getAll({ search } = {}) {
    let list = readAll();
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.university.toLowerCase().includes(q)
      );
    }
    return list;
  },

  /** Return one counselor by id, or null if not found. */
  getById(id) {
    return readAll().find(c => String(c.id) === String(id)) || null;
  },

  /** Create a new counselor and persist it. Returns the created record. */
  create(fields) {
    const list = readAll();
    const counselor = {
      id:         uuidv4(),
      name:       fields.name.trim(),
      email:      (fields.email      || '').trim(),
      phone:      (fields.phone      || '').trim(),
      university: fields.university.trim(),
      image:      (fields.image      || '').trim(),
    };
    list.push(counselor);
    writeAll(list);
    return counselor;
  },

  /** Update an existing counselor (partial update). Returns updated record or null. */
  update(id, fields) {
    const list = readAll();
    const idx  = list.findIndex(c => String(c.id) === String(id));
    if (idx === -1) return null;

    const allowed = ['name', 'email', 'phone', 'university', 'image'];
    allowed.forEach(key => {
      if (fields[key] !== undefined) {
        list[idx][key] = typeof fields[key] === 'string' ? fields[key].trim() : fields[key];
      }
    });

    writeAll(list);
    return list[idx];
  },

  /** Delete a counselor by id. Returns true if deleted, false if not found. */
  delete(id) {
    const list = readAll();
    const next = list.filter(c => String(c.id) !== String(id));
    if (next.length === list.length) return false;
    writeAll(next);
    return true;
  },
};

module.exports = store;
