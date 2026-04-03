---
description: Read project context and history before making any changes
---

# Onboarding — Read Before Working

Before making any changes to the CinemaDiscovery codebase, follow these steps:

1. **Read the Development Notes**
   Read the file `DEVELOPMENT_NOTES.md` in the project root. This contains:
   - Architecture overview and tech stack
   - Where environment variables are configured (both GitHub Secrets AND Hostinger)
   - Complete feature list of what's currently live
   - Recent changes log (what was added, fixed, or modified)
   - Security rules and pre-push checklist
   - Deployment flow details

2. **Read the Workspace Rules**
   The user rules section contains critical project constraints. Pay special attention to:
   - Never remove existing features
   - Never hardcode API keys
   - Always run `npm run build` before pushing
   - Amazon Associates monetization logic must not be modified

3. **Check the Recent Changes Log**
   The bottom section of `DEVELOPMENT_NOTES.md` has a chronological log of recent changes. Check this before starting work to understand what was recently modified.

4. **After completing work**
   Update the "Recent Changes Log" section in `DEVELOPMENT_NOTES.md` with a brief description of what you changed and why.
