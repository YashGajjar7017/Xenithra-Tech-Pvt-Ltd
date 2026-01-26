# Project Reorganization TODO

## Phase 1: Create New Directories
- [ ] Create .config/
- [ ] Create .devcontainer/
- [ ] Create .docker/
- [ ] Create .github/
- [ ] Create docs/
- [ ] Create electron/
- [ ] Create renderer/
- [ ] Create scripts/
- [ ] Create tests/

## Phase 2: Move Existing Directories
- [ ] Move src/main to electron/main
- [ ] Move src/preload to electron/preload
- [ ] Move src/renderer to renderer/
- [ ] Move Documentation to docs/
- [ ] Move Public to renderer/public
- [ ] Move resources to build/ (or appropriate place)

## Phase 3: Organize Renderer Source
- [ ] Create renderer/src/assets/
- [ ] Create renderer/src/components/
- [ ] Create renderer/src/hooks/
- [ ] Create renderer/src/layouts/
- [ ] Create renderer/src/pages/
- [ ] Create renderer/src/routes/
- [ ] Create renderer/src/services/
- [ ] Create renderer/src/styles/
- [ ] Create renderer/src/utils/
- [ ] Move existing files to appropriate subdirectories

## Phase 4: Update Configurations
- [ ] Update electron.vite.config.mjs for new paths
- [ ] Update package.json scripts if needed
- [ ] Update any import paths in code

## Phase 5: Cleanup
- [ ] Remove old src/ directory
- [ ] Verify all files are moved correctly
- [ ] Test the application
