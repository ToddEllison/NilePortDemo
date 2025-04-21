// api.js

// Handles all API calls to the Nile backend
import { API_BASE_URL } from './constants.js';

// Validate the API token with a known safe endpoint
export async function validateTokenViaApi(token) {
  const url = `${API_BASE_URL}/client-configs`;
  try {
    const res = await fetch(url, {
      headers: { 'x-nile-api-key': token.trim() }
    });
    return res.ok;
  } catch (err) {
    console.error("Token validation failed:", err);
    return false;
  }
}

// Fetch list of segments
export async function fetchSegments(token) {
  const url = `${API_BASE_URL}/settings/segments`;
  try {
    const res = await fetch(url, {
      headers: { 'x-nile-api-key': token.trim() }
    });
    const result = await res.json();
    return result?.data?.content || [];
  } catch (err) {
    console.error("Failed to fetch segments:", err);
    return [];
  }
}

// Fetch list of connected clients with port and segment info
export async function fetchClientConfigs(token) {
  const url = `${API_BASE_URL}/client-configs-list`;
  try {
    const res = await fetch(url, {
      headers: { 'x-nile-api-key': token.trim() }
    });
    return await res.json();
  } catch (err) {
    console.error("Failed to fetch client configs:", err);
    return [];
  }
}

export async function fetchOnlineMacs(token) {
  const endTime = new Date().toISOString().split('.')[0] + 'Z';
  const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('.')[0] + 'Z';
  const url = `https://u1.nile-global.cloud/api/v1/public/client-list-paginated-details?endTime=${encodeURIComponent(endTime)}&startTime=${encodeURIComponent(startTime)}&pageNumber=0&pageSize=99999`;

  try {
    const res = await fetch(url, {
      headers: { 'x-nile-api-key': token.trim() }
    });
    const data = await res.json();
    const onlineClients = (data.clientList || []).filter(c => c.clientStatus === "ONLINE");
    return new Set(onlineClients.map(c => c.macAddress.toLowerCase()));
  } catch (err) {
    console.error("Failed to fetch online MACs:", err);
    return new Set();
  }
}
