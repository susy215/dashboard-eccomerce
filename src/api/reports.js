const API = import.meta.env.VITE_API_URL;

const auth = (token) => ({ Authorization: `Token ${token}` });

async function httpJson(url, token) {
  const r = await fetch(url, { headers: auth(token) });
  if (!r.ok) {
    const detail = await r.text().catch(() => '');
    throw new Error(`HTTP ${r.status} ${r.statusText}: ${detail}`);
  }
  return r.json();
}

export async function getKpis(token) {
  return httpJson(`${API}/api/reportes/kpis/`, token);
}

export async function getSerie(token, dias = 30) {
  // { serie: [{ fecha, total, cantidad }] }
  return httpJson(`${API}/api/reportes/series/ventas-por-dia/?dias=${dias}`, token);
}

export async function getCategorias(token, dias = 30) {
  // { categorias: [{ categoria, total }] }
  return httpJson(`${API}/api/reportes/ventas/por-categoria/?dias=${dias}`, token);
}

export async function getTopProductos(token, dias = 30, limit = 10) {
  // { productos: [{ producto, sku, total, cantidad }] }
  return httpJson(`${API}/api/reportes/ventas/por-producto/?dias=${dias}&limit=${limit}`, token);
}

export async function getTopClientes(token, dias = 30, limit = 10) {
  // { clientes: [{ cliente, total, cantidad }] }
  return httpJson(`${API}/api/reportes/ventas/top-clientes/?dias=${dias}&limit=${limit}`, token);
}


