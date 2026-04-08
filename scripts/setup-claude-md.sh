#!/usr/bin/env bash
# setup-claude-md.sh - Seed 的 CLAUDE.md 统一安装/合并脚本
# 用法: setup-claude-md.sh <local|global>
#
# 处理：版本提取、备份、合并、版本报告。

set -euo pipefail

MODE="${1:?用法: setup-claude-md.sh <local|global>}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
. "$SCRIPT_DIR/lib/config-dir.sh"

# 从 installed_plugins.json 解析活跃的插件根目录。
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

  # 回退：扫描同级版本目录查找最新版本
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
    echo "跳过 Seed git exclude 配置（不是 git 仓库）"
    return 0
  fi

  mkdir -p "$(dirname "$exclude_path")"

  local block_start="# BEGIN Seed local artifacts"

  if [ -f "$exclude_path" ] && grep -Fq "$block_start" "$exclude_path"; then
    echo "Seed git exclude 已配置"
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

  echo "已配置 git exclude 排除本地 .seed 产物（保留 .seed/skills/）"
}

# 确定目标路径
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
  echo "错误: 无效模式 '$MODE'。请使用 'local' 或 'global'。" >&2
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
    echo "跳过 seed-reference skill 安装（规范 skill 源不可用）"
    return 0
  fi

  if [ ! -s "$temp_skill" ]; then
    rm -f "$temp_skill"
    echo "跳过 seed-reference skill 安装（规范 skill 源为空: $source_label）"
    return 0
  fi

  mkdir -p "$(dirname "$SKILL_TARGET_PATH")"
  cp "$temp_skill" "$SKILL_TARGET_PATH"
  rm -f "$temp_skill"
  echo "已安装 seed-reference skill 到 $SKILL_TARGET_PATH"
}

# 安装前提取旧版本号
OLD_VERSION=$(grep -m1 'SEED:VERSION:' "$TARGET_PATH" 2>/dev/null | sed -E 's/.*SEED:VERSION:([^ ]+).*/\1/' || true)
if [ -z "$OLD_VERSION" ]; then
  OLD_VERSION="none"
fi

# 备份现有文件
BACKUP_DATE=""
if [ -f "$TARGET_PATH" ]; then
  BACKUP_DATE=$(date +%Y-%m-%d_%H%M%S)
  BACKUP_PATH="${TARGET_PATH}.backup.${BACKUP_DATE}"
  cp "$TARGET_PATH" "$BACKUP_PATH"
  echo "已备份现有 CLAUDE.md 到 $BACKUP_PATH"
fi

# 将规范 Seed 内容加载到临时文件
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
  echo "错误: 找不到规范 CLAUDE.md 源。中止操作。"
  rm -f "$TEMP_SEED"
  exit 1
fi

if [ ! -s "$TEMP_SEED" ]; then
  echo "错误: 规范 CLAUDE.md 源为空。中止操作。"
  rm -f "$TEMP_SEED"
  exit 1
fi

if ! grep -q '<!-- SEED:START -->' "$TEMP_SEED" || ! grep -q '<!-- SEED:END -->' "$TEMP_SEED"; then
  echo "错误: 规范 CLAUDE.md 源缺少必需的 SEED 标记: $SOURCE_LABEL" >&2
  exit 1
fi

# 从源内容中剥离已有标记（幂等性）
if grep -q '<!-- SEED:START -->' "$TEMP_SEED"; then
  awk '/<!-- SEED:END -->/{p=0} p; /<!-- SEED:START -->/{p=1}' "$TEMP_SEED" > "${TEMP_SEED}.clean"
  mv "${TEMP_SEED}.clean" "$TEMP_SEED"
fi

if [ ! -f "$TARGET_PATH" ]; then
  # 全新安装：用标记包裹
  write_wrapped_seed_file "$TARGET_PATH"
  rm -f "$TEMP_SEED"
  echo "已安装 CLAUDE.md（全新）"
else
  # 合并：保留 SEED 标记外的用户内容
  if grep -q '<!-- SEED:START -->' "$TARGET_PATH"; then
    # 有标记：移除所有完整的 SEED 块，保留用户文本
    perl -0pe 's/^<!-- SEED:START -->\R[\s\S]*?^<!-- SEED:END -->(?:\R)?//msg; s/^<!-- User customizations(?: \([^)]+\))? -->\R?//mg; s/\A(?:[ \t]*\R)+//; s/(?:\R[ \t]*)+\z//;' \
      "$TARGET_PATH" > "${TARGET_PATH}.preserved"

    if grep -Eq '^<!-- SEED:(START|END) -->$' "${TARGET_PATH}.preserved"; then
      # 标记损坏/不匹配：保留整个原始内容
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
    echo "已更新 Seed 段落（用户自定义内容已保留）"
  else
    # 无标记：包裹新内容，将旧内容追加为用户段落
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
    echo "已迁移现有 CLAUDE.md（添加 Seed 标记，保留旧内容）"
  fi
  rm -f "$TEMP_SEED"
fi

if ! grep -q '<!-- SEED:START -->' "$TARGET_PATH" || ! grep -q '<!-- SEED:END -->' "$TARGET_PATH"; then
  echo "错误: 安装后的 CLAUDE.md 缺少必需的 SEED 标记: $TARGET_PATH" >&2
  exit 1
fi

install_seed_reference_skill

if [ "$MODE" = "local" ]; then
  ensure_local_seed_git_exclude
fi

# 提取新版本号并报告
NEW_VERSION=$(grep -m1 'SEED:VERSION:' "$TARGET_PATH" 2>/dev/null | sed -E 's/.*SEED:VERSION:([^ ]+).*/\1/' || true)
if [ -z "$NEW_VERSION" ]; then
  NEW_VERSION="unknown"
fi
if [ "$OLD_VERSION" = "none" ]; then
  echo "已安装 CLAUDE.md: $NEW_VERSION"
elif [ "$OLD_VERSION" = "$NEW_VERSION" ]; then
  echo "CLAUDE.md 未变更: $NEW_VERSION"
else
  echo "已更新 CLAUDE.md: $OLD_VERSION -> $NEW_VERSION"
fi
