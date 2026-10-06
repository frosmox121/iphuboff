// Base JSON compatible con las llamadas db.get().find().assign().write() sin lodash.
const fs = require('fs');
function match(obj, q) {
  if (!q) return true;
  return Object.keys(q).every(k => obj && obj[k] === q[k]);
}
function Mini(state, persist) {
  const save = () => { try { persist(state); } catch (_) {} };
  function wrap(list, key) {
    return {
      value() { return state[key]; },
      find(q) {
        const i = (state[key] || []).findIndex(x => match(x, q));
        return {
          value: () => (i >= 0 ? state[key][i] : undefined),
          assign(patch) { if (i >= 0) Object.assign(state[key][i], patch); return this; },
          write() { save(); return state[key]; },
        };
      },
      filter(q) { return { value: () => (state[key] || []).filter(x => match(x, q)) }; },
      push(row) { (state[key] = state[key] || []).push(row); return { write: () => save() }; },
      unshift(row) { (state[key] = state[key] || []).unshift(row); return { write: () => save() }; },
      remove(q) { state[key] = (state[key] || []).filter(x => !match(x, q)); return { write: () => save() }; },
      write() { save(); return state[key]; },
    };
  }
  return {
    get: key => wrap(state[key], key),
    set(key, val) { state[key] = val; return { write: save }; },
    defaults(obj) { for (const k of Object.keys(obj)) if (state[k] == null) state[k] = obj[k]; return { write: save }; },
  };
}
module.exports = function miniDb(initial, persist) { return Mini(initial, persist); };
