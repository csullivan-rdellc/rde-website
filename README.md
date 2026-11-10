# Resilient Digital Ecosystem website

This repository contains a snapshot of the deployed static website, retrieved from Wix on November 10, 2026. It is not the original framework source or build pipeline. Wix remains the live host and CMS; pushing here does not publish the site.

## Preview

With Node.js installed, run `node preview.mjs` from the repository root and open http://localhost:8000/. Set `PORT` to use another port. Stop the server with Ctrl+C.

Wix CMS and Forms requests may depend on Wix's allowed origins and may not work on localhost; pages have fallback copy. Check the live site after a Wix release. Do not submit test contact forms unless intended.

## Editing and publishing

Page layouts, styles and client scripts are here. CMS copy remains in the Wix `RDEPageContent` collection; this repository is not a backup of Wix CMS or Forms data. `js/page-content.js` loads CMS copy and uses the HTML as fallback.

The snapshot can become stale. Before publishing, retrieve the current deployed versions of the files being edited and reconcile concurrent changes. Upload only complete changed files to the existing Wix site, preserving all other files. The Wix site ID is `65dccce0-d2fa-4a58-809c-bd5f31aa604a`. Do not replace the entire live site from an old snapshot without reconciling it first.
