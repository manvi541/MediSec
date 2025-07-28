# MediSec - Local Web Application (Updated)

This repository contains the latest version of the MediSec web application, designed to run entirely locally in your browser using HTML, CSS, and JavaScript.

## How to Run Locally

1.  **Clone or Download:** Get these files onto your local machine.
2.  **Organize Files:** Ensure `index.html`, `style.css`, and `script.js` are all placed in the **same folder**.
3.  **Open `index.html`:**
    * **Simple Way:** Double-click the `index.html` file in your file explorer. It will open in your default web browser (e.g., Chrome, Firefox, Edge).
    * **Recommended for VS Code (with Live Server):**
        * If you don't have it, install the "Live Server" extension from the VS Code Extensions marketplace.
        * Right-click `index.html` in VS Code's file explorer.
        * Select "Open with Live Server." This provides a local development server (`http://127.0.0.1:5500/`) with live reloading, which is more convenient for development.

## Features

* **Informative Sections:** Explore MediSec's mission, values, team, and contact information.
* **Dynamic "Projects & Blogs" Section with Local Persistence:**
    * You can "upload" new project details (title, description, optional image, optional link) using the provided form.
    * **Persistence Mechanism:** Project data (including images converted to Base64 strings) is saved directly into your **web browser's `localStorage`**.
    * **Data will NOT vanish upon page refresh or closing/reopening the browser** (on the *same* computer and browser).
    * **Important Limitations (Please Read):**
        * **Local Only:** Projects saved are **only visible to you** on the specific browser and computer where they were uploaded. They are **not shared** with other users or accessible from different devices.
        * **Storage Limits:** Storing images as Base64 strings is inefficient. `localStorage` has a limited capacity (typically 5-10MB). Uploading many large images will quickly fill this space, potentially preventing further uploads or slowing down the page.
        * **Data Loss:** Clearing your browser's data, cache, or `localStorage` will permanently delete all your saved projects.
* **Instagram Feed:** Integrates an external Instagram feed using the Elfsight script (this is embedded content, not a data storage service for your projects).
* **Interactive Elements:** Smooth scrolling navigation, responsive design, and animated statistics.
* **Fundraising/Donation Link:** A direct link to your HackClub donations page has been added for easy support.

## Troubleshooting Tips (If Projects Still Don't Appear on Refresh)

1.  **Check Developer Console (Most Important!):**
    * While on your website, press `F12` or right-click and "Inspect," then go to the "Console" tab.
    * **Look for any red error messages.** Copy and paste them here if you see any.
    * **Look for `console.log` messages:** After uploading a project, you should see messages like "Projects successfully saved to localStorage" and "Displayed X projects." If you don't see these, it indicates the JavaScript isn't executing as expected.
2.  **Inspect Local Storage:**
    * In the Developer Console, go to the "Application" (Chrome/Edge) or "Storage" (Firefox) tab.
    * Under "Local Storage," click on your website's URL.
    * Confirm that there is a key named `medisecProjects` and that its value is a valid JSON array containing your project data.
3.  **Clear Browser Cache:** Sometimes your browser might be serving an older version of `script.js`.
    * In the Developer Console, go to the "Network" tab.
    * Check the "Disable cache" box.
    * Refresh the page (`Ctrl+F5` on Windows, `Cmd+Shift+R` on Mac).

Please try these steps and let me know what you find in the console, or if you still face issues!