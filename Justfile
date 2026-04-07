# schema-ui-vue release automation
# Usage: just release 0.1.2

set windows-shell := ["pwsh", "-NoLogo", "-Command"]


# Show available commands
default:
    @just --list

# Run tests
test:
    npm test

# Build the library
build:
    npm run build:lib

# Release: bump version, tag, push, build, publish
# Usage: just release 0.2.0
release version:
    #!/usr/bin/env bash
    set -euo pipefail

    echo "→ Checking working tree is clean..."
    if ! git diff --quiet || ! git diff --cached --quiet; then
        echo "✗ Working tree has uncommitted changes. Commit or stash them first."
        exit 1
    fi

    echo "→ Running tests..."
    npm test

    echo "→ Bumping version to {{version}}..."
    npm version {{version}} --no-git-tag-version

    echo "→ Committing version bump..."
    git add package.json
    git commit -m "chore: bump version to {{version}}"

    echo "→ Creating git tag v{{version}}..."
    git tag "v{{version}}"

    echo "→ Pushing to GitHub..."
    git push && git push --tags

    echo "→ Building library..."
    npm run build:lib

    echo "→ Publishing to npm..."
    npm publish

    echo "✓ Released schema-ui-vue@{{version}}"

# ── Tauri ──────────────────────────────────────────────────────

# Start Tauri desktop app in dev mode
tauri-dev:
    pnpm tauri dev

# Build Tauri app for current platform (Windows → .exe, macOS → .app/.dmg)
tauri-build:
    pnpm tauri build
