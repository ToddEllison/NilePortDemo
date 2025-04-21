# Switch Port Status Demo

A plug‑and‑play web demo for Nile Solution architects to visualize port connectivity on their demo kit. Ports overlay a switch image and automatically change color based on their assigned network segment—no code edits required.

---

## Prerequisites

- **HTTP server** (required because browsers block API calls from `file://` URLs)  
  - **Python 3**:  
    ```bash
    python3 -m http.server 8080
    ```  
  - **Node.js `http-server`**:  
    ```bash
    npx http-server -p 8080
    ```

---

## Quick Start

1. **Create a Nile API key**
Login to Nile Portal as a user 
Navigate to Global Settings->Security
Under "API Key Management" click "Add Key"
Name the key and select the "MAB Onboarding" workflow
Save the key and download the JSON file
Open the JSON file and find the value for "api_token". This is your API key

2. **Clone the repo**  
   ```bash
   git clone https://github.com/ToddEllison/NilePortDemo.git
   cd NilePortDemo

3. **Run a local HTTP server from the project root**
  ```bash
  python3 -m http.server 8080
  ```

4. **Open the demo:**
Navigate to http://localhost:8080/index.html
On load, you’ll be prompted to enter your Nile API key.

## ⚠️ CORS Warning
You must serve this over HTTP(S). Opening index.html via file://… will block API requests.

📂 Project Structure
```bash
.
├── index.html            # Main demo page (prompts for API key)
├── Switch.png            # Switch front‑view image
└── nile-port-viewer
    ├── constants.js      # Port positions & segment‑color mapping
    ├── ui.js             # DOM creation & event handlers
    ├── auth.js           # API‑key prompt & storage
    ├── api.js            # Fetch port assignments from Nile
    └── app.js            # Initialization & orchestration
```
index.html: loads the switch image, prompts for your API key, and pulls in the JS modules.

Switch.png: the background image showing your demo‑kit switch.

nile-port-viewer/: all application logic is modularized here—no edits needed.

**Usage Notes**
No code edits required. Just enter your API key when prompted at startup.

Pre‑positioned for a 48‑port Nile demo‑kit switch.

If you see “Network request blocked” or CORS errors, confirm you’re using an HTTP server, not opening the file directly.

Enjoy a seamless, zero‑config way to visualize your switch ports on the Nile demo kit!
