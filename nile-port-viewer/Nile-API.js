
const API_VALIDATE_URL = "https://u1.nile-global.cloud/api/v1/client-configs"; 
const colorPalette = [
    "#333c61",
    "#4f6295",
    "#7d58a0",
    "#a38d99",
    "#2d7ea2",
    "#a5a497"
    ];
    function getSegmentColor(index) {
        return colorPalette[index % colorPalette.length];
    }
/**
 * setPortColor: Update the background color of a port.
 * @param {string} portId - The ID of the port div (e.g. "port1").
 * @param {string} color  - The CSS color (e.g. "red", "#00ff00").
 */
function setPortColor(portId, color) {
  const port = document.getElementById(portId);
  if (port) {
    port.style.backgroundColor = color;
  }
}

function getTokenFromUser() {
    const token = prompt("Enter your Nile API token:");
    if (token) {
        localStorage.setItem("authToken", token);
        return token;
    } else {
        updateStatus("❌ No token provided. Token is required to proceed.", false);
        return null;
    }
}

function updateTokenDisplay(token) {
  document.getElementById("token-display").textContent = token || "(no token)";
}

function updateStatus(message, isSuccess = true) {
  const statusDiv = document.getElementById("status");
  statusDiv.textContent = message;
  statusDiv.className = isSuccess ? "success" : "error";
}

async function validateToken(token) {
    updateStatus("Validating token...");

    try {
        const res = await fetch(API_VALIDATE_URL, {
        method: "GET",
        headers: {
            "x-nile-api-key": token.trim()
        }
        });

        if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
        }

        updateStatus("✅ Token is valid", true);
        return true;
    } catch (err) {
        console.error("Token validation failed:", err.message);
        updateStatus("❌ Invalid token. Please reset.", false);
        return false;
    }
}

async function initToken() {
    let token = localStorage.getItem("authToken");

    if (!token) {
        token = getTokenFromUser();
        if (!token) {
        updateStatus("❌ No token provided. Cannot continue.", false);
        return null;
        }
    }

    updateTokenDisplay(token);

    const isValid = await validateToken(token);
    if (!isValid) {
        updateStatus("❌ Token is invalid. Please click 'Reset Token' to try again.", false);
        return null; // Stop retrying automatically
    }

    return token;
}

async function fetchSegments(token) {
    const SEGMENT_URL = "https://u1.nile-global.cloud/api/v1/settings/segments";

    try {
            const response = await fetch(SEGMENT_URL, {
            headers: {
                "x-nile-api-key": token.trim()
            }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            const segments = result?.data?.content || [];

            return segments.map(seg => seg.instanceName); // Just get the names
        } catch (err) {
            console.error("Failed to fetch segments:", err);
            return [];
    }
}
function displaySegmentLegend(segmentNames) {
    const legend = document.createElement("div");
    legend.innerHTML = "<h3>Segment Legend</h3>";
    legend.style.marginTop = "20px";

    segmentNames.forEach((name, index) => {
        const color = getSegmentColor(index);
        const item = document.createElement("div");
        item.innerHTML = `
        <span style="display:inline-block;width:20px;height:20px;background:${color};margin-right:8px;border:1px solid #000;"></span>
        ${name}
        `;
        legend.appendChild(item);
    });

    document.body.appendChild(legend);
}

async function updateLivePortStatus(token, segments, segmentIdToName) {
    const clients = await fetchClientConfigs(token);

    clients.forEach((entry) => {
        const port = entry.clientConfig.lastPort; // like "0/29"
        const segId = entry.clientConfig.segmentId;

        if (!port || !segId || segId === "Unknown") return;

        const segmentName = segmentIdToName[segId] || "Unknown";
        const segIndex = segments.indexOf(segmentName);
        const color = getSegmentColor(segIndex);

        // Map port string to DOM ID (e.g., "port29")
        const portId = `port${parseInt(port.split("/")[1])}`;

        setPortColor(portId, color);
    });
}

async function startApp(token) {
    const segments = await fetchSegments(token);
    displaySegmentLegend(segments);

    // Build segmentId → name map
    const SEGMENT_URL = "https://u1.nile-global.cloud/api/v1/settings/segments";
    const res = await fetch(SEGMENT_URL, {
        headers: { "x-nile-api-key": token.trim() }
    });
    const segmentData = await res.json();
    const segmentIdToName = {};
    (segmentData?.data?.content || []).forEach(seg => {
        segmentIdToName[seg.id] = seg.instanceName;
    });

    // Initial call
    await updateLivePortStatus(token, segments, segmentIdToName);

    // 🔁 Update every 5 seconds
    setInterval(() => {
        updateLivePortStatus(token, segments, segmentIdToName);
    }, 5000);
}

async function fetchClientConfigs(token) {
    const CLIENTS_URL = "https://u1.nile-global.cloud/api/v1/client-configs-list";

    try {
        const res = await fetch(CLIENTS_URL, {
        headers: { "x-nile-api-key": token.trim() }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        return data;
    } catch (err) {
        console.error("Failed to fetch client configs:", err);
        return [];
    }
}

document.getElementById("reset-button").addEventListener("click", async () => {
    localStorage.removeItem("authToken");
    const newToken = getTokenFromUser();
    updateTokenDisplay(newToken);

    const isValid = await validateToken(newToken);
    if (isValid) {
        await startApp(newToken); // ✅ run the app with the new valid token
    }
});

window.addEventListener("DOMContentLoaded", async () => {
    const token = await initToken();
    if (!token) return;
    await startApp(token);
});



