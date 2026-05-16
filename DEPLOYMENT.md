# Deployment Guide

This document outlines the deployment infrastructure and workflow for CinemaDiscovery.

## CI/CD Workflow

Deployment is fully automated using GitHub Actions and Hostinger's auto-deploy features.

1. **GitHub Actions Workflow:**
   - Pushes to the `main` branch trigger a GitHub Actions workflow.
   - The workflow provisions a Node.js 20 environment.
   - It runs `npm install`, followed by `npm run build`.
   - The build process compiles the TypeScript code, bundles the application, and executes the post-build scripts to generate the sitemap and pre-render static HTML.
2. **Hostinger Auto-Deploy:**
   - Hostinger is connected to the GitHub repository.
   - Once the branch is updated, Hostinger automatically pulls the latest changes and updates the public directory with the new `dist/` contents.

## Post-Deploy Checklist

**> [!CAUTION]**
**> FLUSH HOSTINGER CDN CACHE**
**> This is a critical and required step after every deployment. Failure to flush the CDN cache will result in users receiving stale JavaScript bundles, leading to blank screens, routing errors, or 403 Forbidden errors due to mismatched SPA routing rules.**

After every successful deployment, perform the following verification steps:
1. **Flush CDN:** Log into the Hostinger control panel and purge the CDN cache.
2. **Incognito Verification:** Open `https://cinemadiscovery.com` in a new Incognito/Private window. Navigate through 3-4 distinct routes (e.g., Home, a Movie Detail page, a Blog post) to ensure hydration and routing are functioning correctly.
3. **Search Console:** If new pages or blog posts were added, navigate to Google Search Console and submit the updated `sitemap.xml`. Use the URL Inspection tool to request indexing for high-priority new URLs.

## Rollback Procedure

If a deployment introduces a critical regression in production:
1. Identify the last known good commit in the Git history.
2. Revert to that commit: `git revert <bad-commit-hash>` (or perform a hard reset and force push if appropriate for your workflow).
3. Push the fix to the `main` branch to trigger a new automated deployment.
4. **CRITICAL:** Flush the Hostinger CDN cache immediately after the rollback deploy completes.

## Infrastructure Overview (DNS & SSL)

- **DNS:** Domain Name System records are managed through Hostinger. The primary A record points to the Hostinger server IP. Additional TXT and CNAME records are configured for EmailJS and external verification services.
- **SSL:** TLS/SSL certificates are automatically provisioned and managed by Hostinger using Let's Encrypt, ensuring HTTPS enforcement across the application.
