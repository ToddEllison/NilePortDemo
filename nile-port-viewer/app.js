// app.js

// Main entry point of the app
import { initToken, resetToken, getToken } from './auth.js';
import { fetchSegments, fetchClientConfigs, fetchOnlineMacs } from './api.js';
import { updateTokenStatus, setPortColor, displaySegmentLegend, getSegmentColor } from './ui.js';

let previouslyColoredPorts = new Set();

// Initialize the app once DOM is loaded
window.addEventListener("DOMContentLoaded", async () => {
  const token = await initToken();

  if (!token) {
    updateTokenStatus("❌ API token missing or invalid", true);
    return;
  }

  updateTokenStatus("✅ API Token Valid");

  await startApp(token);

  // Reset token button handler
  document.getElementById("reset-button")?.addEventListener("click", async () => {
    resetToken();
    updateTokenStatus("🔄 Token reset. Please enter a new one.", true);
    const newToken = await initToken();
    if (newToken) {
      updateTokenStatus("✅ API Token Valid");
      startApp(newToken);
    }
  });
});


// Main application logic
async function startApp(token) {
  const segments = (await fetchSegments(token)).map(s => s.instanceName);
  displaySegmentLegend(segments);

  // Build segmentId -> name map
  const allSegments = await fetchSegments(token);
  const segmentIdToName = {};
  allSegments.forEach(seg => {
    segmentIdToName[seg.id] = seg.instanceName;
  });

  // Start polling for device-port-segment updates
  updateLivePortStatus(token, segments, segmentIdToName);
  setInterval(() => {
    updateLivePortStatus(token, segments, segmentIdToName);
  }, 10000);
}

// Polling logic to update the port display
async function updateLivePortStatus(token, segments, segmentIdToName) {
  const [clients, onlineMacs] = await Promise.all([
    fetchClientConfigs(token),
    fetchOnlineMacs(token)
  ]);

  // Step 1: Reset previously colored ports
  previouslyColoredPorts.forEach(portId => {
    setPortColor(portId, null, 'reset'); // null tells setPortColor to revert to default
  });
  previouslyColoredPorts.clear();

  // Step 2: Color ports for current online clients
  clients.forEach((entry) => {
    const config = entry.clientConfig;
    if (!config || !config.macAddress) return;

    const mac = config.macAddress.toLowerCase();
    if (!onlineMacs.has(mac)) return;

    const port = config.lastPort;
    const segId = config.segmentId;
    if (!port || !segId || segId === "Unknown") return;

    const segmentName = segmentIdToName[segId] || "Unknown";
    const segIndex = segments.indexOf(segmentName);
    const color = getSegmentColor(segIndex);

    const portId = `port${parseInt(port.split("/")[1])}`;
    setPortColor(portId, color, 'live-update');
    previouslyColoredPorts.add(portId);
  });
}