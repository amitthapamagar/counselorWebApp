/**
 * api.js — thin fetch wrapper around the REST API.
 * All functions return Promises.
 */
const API = (() => {
  const BASE = '/api';

  async function request(method, path, body) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(BASE + path, opts);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Request failed');
    return json;
  }

  return {
    getCounselors:   (search) => request('GET', `/counselors${search ? '?search=' + encodeURIComponent(search) : ''}`),
    getCounselor:    (id)     => request('GET', `/counselors/${id}`),
    createCounselor: (data)   => request('POST', '/counselors', data),
    updateCounselor: (id, data) => request('PATCH', `/counselors/${id}`, data),
    deleteCounselor: (id)     => request('DELETE', `/counselors/${id}`),
    sendEmail:       (payload) => request('POST', '/email/send', payload),
  };
})();
