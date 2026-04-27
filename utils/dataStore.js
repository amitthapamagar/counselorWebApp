/**
 * utils/dataStore.js  — MongoDB edition
 *
 * Exact same public API as the original JSON-file version.
 * Routes and middleware require zero changes.
 *
 *   store.getAll({ search })
 *   store.getById(id)
 *   store.create(fields)
 *   store.update(id, fields)
 *   store.delete(id)
 */
const connectDB = require('./db');
const Counselor = require('../models/Counselor');

const store = {

  async getAll({ search } = {}) {
    await connectDB();
    const query = {};
    if (search) {
      const rx = new RegExp(search, 'i');
      query.$or = [{ name: rx }, { university: rx }];
    }
    const list = await Counselor.find(query).sort({ name: 1 });
    return list.map(c => c.toJSON());
  },

  async getById(id) {
    await connectDB();
    try {
      const doc = await Counselor.findById(id);
      return doc ? doc.toJSON() : null;
    } catch {
      return null;
    }
  },

  async create(fields) {
    await connectDB();
    const doc = await Counselor.create({
      name:       fields.name.trim(),
      university: fields.university.trim(),
      email:      (fields.email  || '').trim(),
      phone:      (fields.phone  || '').trim(),
      image:      (fields.image  || '').trim(),
    });
    return doc.toJSON();
  },

  async update(id, fields) {
    await connectDB();
    const allowed = ['name', 'email', 'phone', 'university', 'image'];
    const update  = {};
    allowed.forEach(key => {
      if (fields[key] !== undefined) {
        update[key] = typeof fields[key] === 'string' ? fields[key].trim() : fields[key];
      }
    });
    try {
      const doc = await Counselor.findByIdAndUpdate(id, update, { new: true });
      return doc ? doc.toJSON() : null;
    } catch {
      return null;
    }
  },

  async delete(id) {
    await connectDB();
    try {
      const result = await Counselor.findByIdAndDelete(id);
      return result !== null;
    } catch {
      return false;
    }
  },
};

module.exports = store;
