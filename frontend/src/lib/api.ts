const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Backend server is unreachable');
    return await res.json();
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
}