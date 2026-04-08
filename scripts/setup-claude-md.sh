#!/usr/bin/env bash
# setup-claude-md.sh - Unified CLAUDE.md install/merge script for Seed
# Usage: setup-claude-md.sh <local|global>
#
# Handles: version extraction, backup, merge, version reporting.

set -euo pipefail

MODE="${1:?Usage: setup-claude-md.sh <local|global>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
. "$SCRIPT_DIR/lib/config-dir.sh"

# Resolve active plugin root from installed_plugins.json.
resolve_active_plugin_root() {
  local config_dir
  config_dir="$(resolve_claude_config_dir)"
  local installed_plugins="${config_dir}/plugins/installed_plugins.json"

  if [ -f "$installed_plugins" ] && command -v jq >/dev/null 2>&1; then
    local active_path
    active_path=$(jq -r '
      (.plugins // .)
      | to_entries[]
      | select(.key | startswith("seed"))
      | .value[0].installPath // empty
    ' "$installed_plugins" 2>/dev/null)

    if [ -n "$active_path" ] && [ -d "$active_path" ]; then
      echo "$active_path"
      return 0
    fi
  fi

  # Fallback: scan sibling version directories for the latest
  local cache_base
  cache_base="$(dirname "$SCRIPT_PLUGIN_ROOT")"
  if [ -d "$cache_base" ]; then
    local latest
    latest=$(ls -1 "$cache_base" | grep -E '^[0-9]+\.[0-9]+\.[0-9]+' | sort -t. -k1,1nr -k2,2nr -k3,3nr | head -1)
    if [ -n "$latest" ] && [ -d "${cache_base}/${latest}" ]; then
      echo "${cache_base}/${latest}"
      return 0
    fi
  fi

  echo "$SCRIPT_PLUGIN_ROOT"
}

ACTIVE_PLUGIN_ROOT="$(resolve_active_plugin_root)"
CANONICAL_CLAUDE_MD="${ACTIVE_PLUGIN_ROOT}/docs/CLAUDE.md"
CANONICAL_SEED_REFERENCE_SKILL="${ACTIVE_PLUGIN_ROOT}/skills/seed-reference/SKILL.md"

ensure_local_seed_git_exclude() {
  local exclude_path

  if ! exclude_path=$(git rev-parse --git-path info/exclude 2>/dev/null); then
    echo "Skipped Seed git exclude setup (not a git repository)"
    return 0
  fi

  mkdir -p "$(dirname "$exclude_path")"

  local block_start="# BEGIN Seed local artifacts"

  if [ -f "$exclude_path" ] && grep -Fq "$block_start" "$exclude_path"; then
    echo "Seed git exclude already configured"
    return 0
  fi

  if [ -f "$exclude_path" ] && [ -s "$exclude_path" ]; then
    printf '\n' >> "$exclude_path"
  fi

  cat >> "$exclude_path" <<'EOF'
# BEGIN Seed local artifacts
.seed/*
!.seed/skills/
!.seed/skills/**
# END Seed local artifacts
EOF

  echo "Configured git exclude for local .seed artifacts (preserving .seed/skills/)"
}

# Determine target path
CONFIG_DIR="$(resolve_claude_config_dir)"
if [ "$MODE" = "local" ]; then
  mkdir -p .claude/skills/seed-reference
  TARGET_PATH=".claude/CLAUDE.md"
  SKILL_TARGET_PATH=".claude/skills/seed-reference/SKILL.md"
elif [ "$MODE" = "global" ]; then
  mkdir -p "$CONFIG_DIR/skills/seed-reference"
  TARGET_PATH="$CONFIG_DIR/CLAUDE.md"
  SKILL_TARGET_PATH="$CONFIG_DIR/skills/seed-reference/SKILL.md"
else
  echo "ERROR: Invalid mode '$MODE'. Use 'local' or 'global'." >&2
  exit 1
fi


install_seed_reference_skill() {
  local source_label=""
  local temp_skill
  temp_skill=$(mktemp /tmp/seed-reference-skill-XXXXXX.md)

  if [ -f "$CANONICAL_SEED_REFERENCE_SKILL" ]; then
    cp "$CANONICAL_SEED_REFERENCE_SKILL" "$temp_skill"
    source_label="$CANONICAL_SEED_REFERENCE_SKILL"
  elif [ -n "${CLAUDE_PLUGIN_ROOT:-}" ] && [ -f "${CLAUDE_PLUGIN_ROOT}/skills/seed-reference/SKILL.md" ]; then
    cp "${CLAUDE_PLUGIN_ROOT}/skills/seed-reference/SKILL.md" "$temp_skill"
    source_label="${CLAUDE_PLUGIN_ROOT}/skills/seed-reference/SKILL.md"
  else
    rm -f "$temp_skill"
    echo "Skipped seed-reference skill install (canonical skill source unavailable)"
    return 0
  fi

  if [ ! -s "$temp_skill" ]; then
    rm -f "$temp_skill"
    echo "Skipped seed-reference skill install (empty canonical skill source: $source_label)"
    return 0
  fi

  mkdir -p "$(dirname "$SKILL_TARGET_PATH")"
  cp "$temp_skill" "$SKILL_TARGET_PATH"
  rm -f "$temp_skill"
  echo "Installed seed-reference skill to $SKILL_TARGET_PATH"
}

# Extract old version before install
OLD_VERSION=$(grep -m1 'SEED:VERSION:' "$TARGET_PATH" 2>/dev/null | sed -E 's/.*SEED:VERSION:([^ ]+).*/\1/' || true)
if [ -z "$OLD_VERSION" ]; then
  OLD_VERSION="none"
fi

# Backup existing
BACKUP_DATE=""
if [ -f "$TARGET_PATH" ]; then
  BACKUP_DATE=$(date +%Y-%m-%d_%H%M%S)
  BACKUP_PATH="${TARGET_PATH}.backup.${BACKUP_DATE}"
  cp "$TARGET_PATH" "$BACKUP_PATH"
  echo "Backed up existing CLAUDE.md to $BACKUP_PATH"
fi

# Load canonical Seed content to temp file
TEMP_SEED=$(mktemp /tmp/seed-claude-XXXXXX.md)
trap 'rm -f "$TEMP_SEED"' EXIT

write_wrapped_seed_file() {
  local destination="$1"
  mkdir -p "$(dirname "$destination")"
  {
    echo '<!-- SEED:START -->'
    cat "$TEMP_SEED"
    echo '<!-- SEED:END -->'
  } > "$destination"
}

SOURCE_LABEL=""
if [ -f "$CANONICAL_CLAUDE_MD" ]; then
  cp "$CANONICAL_CLAUDE_MD" "$TEMP_SEED"
  SOURCE_LABEL="$CANONICAL_CLAUDE_MD"
elif [ -n "${CLAUDE_PLUGIN_ROOT:-}" ] && [ -f "${CLAUDE_PLUGIN_ROOT}/docs/CLAUDE.md" ]; then
  cp "${CLAUDE_PLUGIN_ROOT}/docs/CLAUDE.md" "$TEMP_SEED"
  SOURCE_LABEL="${CLAUDE_PLUGIN_ROOT}/docs/CLAUDE.md"
else
  echo "ERROR: Failed to find canonical CLAUDE.md source. Aborting."
  rm -f "$TEMP_SEED"
  exit 1
fi

if [ ! -s "$TEMP_SEED" ]; then
  echo "ERROR: Canonical CLAUDE.md source is empty. Aborting."
  rm -f "$TEMP_SEED"
  exit 1
fi

if ! grep -q '<!-- SEED:START -->' "$TEMP_SEED" || ! grep -q '<!-- SEED:END -->' "$TEMP_SEED"; then
  echo "ERROR: Canonical CLAUDE.md source is missing required SEED markers: $SOURCE_LABEL" >&2
  exit 1
fi

# Strip existing markers from source content (idempotency)
if grep -q '<!-- SEED:START -->' "$TEMP_SEED"; then
  awk '/<!-- SEED:END -->/{p=0} p; /<!-- SEED:START -->/{p=1}' "$TEMP_SEED" > "${TEMP_SEED}.clean"
  mv "${TEMP_SEED}.clean" "$TEMP_SEED"
fi

if [ ! -f "$TARGET_PATH" ]; then
  # Fresh install: wrap in markers
  write_wrapped_seed_file "$TARGET_PATH"
  rm -f "$TEMP_SEED"
  echo "Installed CLAUDE.md (fresh)"
else
  # Merge: preserve user content outside SEED markers
  if grep -q '<!-- SEED:START -->' "$TARGET_PATH"; then
    # Has markers: remove all complete SEED blocks, preserve user text
    perl -0pe 's/^<!-- SEED:START -->\R[\s\S]*?^<!-- SEED:END -->(?:\R)?//msg; s/^<!-- User customizations(?: \([^)]+\))? -->\R?//mg; s/\A(?:[ \t]*\R)+//; s/(?:\R[ \t]*)+\z//;' \
      "$TARGET_PATH" > "${TARGET_PATH}.preserved"

    if grep -Eq '^<!-- SEED:(START|END) -->$' "${TARGET_PATH}.preserved"; then
      # Corrupted/unmatched markers: preserve whole original
      OLD_CONTENT=$(cat "$TARGET_PATH")
      {
        echo '<!-- SEED:START -->'
        cat "$TEMP_SEED"
        echo '<!-- SEED:END -->'
        echo ""
        echo "<!-- User customizations (recovered from corrupted markers) -->"
        printf '%s\n' "$OLD_CONTENT"
      } > "${TARGET_PATH}.tmp"
    else
      PRESERVED_CONTENT=$(cat "${TARGET_PATH}.preserved")
      {
        echo '<!-- SEED:START -->'
        cat "$TEMP_SEED"
        echo '<!-- SEED:END -->'
        if printf '%s' "$PRESERVED_CONTENT" | grep -q '[^[:space:]]'; then
          echo ""
          echo "<!-- User customizations -->"
          printf '%s\n' "$PRESERVED_CONTENT"
        fi
      } > "${TARGET_PATH}.tmp"
    fi

    mv "${TARGET_PATH}.tmp" "$TARGET_PATH"
    rm -f "${TARGET_PATH}.preserved"
    echo "Updated Seed section (user customizations preserved)"
  else
    # No markers: wrap new content, append old content as user section
    OLD_CONTENT=$(cat "$TARGET_PATH")
    {
      echo '<!-- SEED:START -->'
      cat "$TEMP_SEED"
      echo '<!-- SEED:END -->'
      echo ""
      echo "<!-- User customizations (migrated from previous CLAUDE.md) -->"
      printf '%s\n' "$OLD_CONTENT"
    } > "${TARGET_PATH}.tmp"
    mv "${TARGET_PATH}.tmp" "$TARGET_PATH"
    echo "Migrated existing CLAUDE.md (added Seed markers, preserved old content)"
  fi
  rm -f "$TEMP_SEED"
fi

if ! grep -q '<!-- SEED:START -->' "$TARGET_PATH" || ! grep -q '<!-- SEED:END -->' "$TARGET_PATH"; then
  echo "ERROR: Installed CLAUDE.md is missing required SEED markers: $TARGET_PATH" >&2
  exit 1
fi

install_seed_reference_skill

if [ "$MODE" = "local" ]; then
  ensure_local_seed_git_exclude
fi

# Extract new version and report
NEW_VERSION=$(grep -m1 'SEED:VERSION:' "$TARGET_PATH" 2>/dev/null | sed -E 's/.*SEED:VERSION:([^ ]+).*/\1/' || true)
if [ -z "$NEW_VERSION" ]; then
  NEW_VERSION="unknown"
fi
if [ "$OLD_VERSION" = "none" ]; then
  echo "Installed CLAUDE.md: $NEW_VERSION"
elif [ "$OLD_VERSION" = "$NEW_VERSION" ]; then
  echo "CLAUDE.md unchanged: $NEW_VERSION"
else
  echo "Updated CLAUDE.md: $OLD_VERSION -> $NEW_VERSION"
fi
