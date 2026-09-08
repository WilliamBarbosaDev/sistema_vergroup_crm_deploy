---
name: multi-remote-deploy
description: >-
  Use this skill to save, build, and deploy the project to multiple remotes (origin and deploy) when the user asks to save and run the deploy workflow.
---

# Multi-Remote Deploy Workflow

This skill ensures that all changes are properly built, committed, and pushed to both the official organizational remote (`origin`) and the secondary personal remote (`deploy`).

## Prerequisites
- The user must explicitly ask to run the deploy or "salvar" (save) workflow.
- Ensure there are changes to commit, or that the user wants to sync existing commits.

## Steps to Execute

1. **Build and Validate**:
   - Run `npm run build` in the workspace root (`c:\Users\William\Downloads\sistema_vergroup_crm`).
   - Verify the build completes successfully without errors.

2. **Commit Changes**:
   - Check `git status`.
   - Add all changes using `git add .`.
   - Ask the user for a commit message if one isn't obvious, or commit with a descriptive message of the recent changes. Example: `git commit -m "feat: <description>"`

3. **Push to Remotes**:
   - Push to the official repository: `git push origin main`
   - Push to the secondary repository: `git push deploy main`

4. **Verify and Report**:
   - Confirm that both push commands succeeded.
   - Report the final Git HEAD SHA to the user.
