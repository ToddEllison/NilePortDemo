// auth.js

// Handles token storage, prompt, and validation
import { validateTokenViaApi } from './api.js';
import { updateTokenDisplay } from './ui.js';

//Prompt the user to enter a token

export function getTokenFromUser() {
  return prompt("Please enter your API token:");
}

//Store token in localStorage
export function storeToken(token) {
  localStorage.setItem("authToken", token);
}

// Get token from localStorage
export function getToken() {
  return localStorage.getItem("authToken");
}

// Clear stored token

export function resetToken() {
  localStorage.removeItem("authToken");
}

// Validate token and initialize it if missing or invalid
export async function initToken() {
  let token = getToken();

  // Prompt until a valid token is entered
  while (!token || !(await validateTokenViaApi(token))) {
    token = getTokenFromUser();
    if (!token) return null; // User cancelled prompt
    storeToken(token);
  }

  updateTokenDisplay(token);
  return token;
}