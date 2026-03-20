const KEY = 'atelier_offline_queue';

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

function save(queue) {
  localStorage.setItem(KEY, JSON.stringify(queue));
}

export function enqueue(action) {
  const queue = load();
  queue.push({ ...action, queuedAt: Date.now() });
  save(queue);
}

export async function flushQueue(api) {
  const queue = load();
  if (!queue.length) return 0;

  const rest = [];
  for (const item of queue) {
    try {
      await api({ method: item.method, url: item.url, data: item.data });
    } catch {
      rest.push(item);
    }
  }

  save(rest);
  return queue.length - rest.length;
}

export function queuedCount() {
  return load().length;
}
