// ui.js

// Handles all DOM manipulation and rendering
import { SEGMENT_COLOR_PALETTE } from './constants.js';

// Set the color of a port element by ID
export function setPortColor(portId, color, source = 'unknown') {
  const el = document.getElementById(portId);
  if (el) {
    if (color === null) {
      console.log(`%c[${source}] Resetting port color: ${portId}`, 'color: gray');
      el.style.backgroundColor = '';
    } else {
      console.log(`%c[${source}] Applying color ${color} to port: ${portId}`, 'color: green');
      el.style.backgroundColor = color;
    }
  } else {
    console.warn(`[${source}] Port ID not found in DOM:`, portId);
  }
}

// Map a numeric index to a color from the palette
export function getSegmentColor(index) {
  return SEGMENT_COLOR_PALETTE[index % SEGMENT_COLOR_PALETTE.length];
}

// Display the segment legend in a visual box
export function displaySegmentLegend(segmentNames) {
  const legendContainer = document.getElementById("legend-container");
  if (!legendContainer) {
    console.warn("Legend container not found.");
    return;
  }

  // Clear any existing content first
  legendContainer.innerHTML = "";

  // Create and populate the new legend
  const legend = document.createElement("div");
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

  // Append the freshly built legend
  legendContainer.appendChild(legend);
}

// Show the current token in the page
export function updateTokenDisplay(token) {
  const tokenDiv = document.getElementById("token-display");
  if (tokenDiv) {
    tokenDiv.textContent = token;
  }
}

export function updateTokenStatus(message, isError = false) {
  const statusDiv = document.getElementById('status');
  if (statusDiv) {
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? 'red' : 'green';
  }
}
