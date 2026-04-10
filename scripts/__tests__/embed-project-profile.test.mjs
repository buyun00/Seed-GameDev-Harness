import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runEmbedProjectProfile, withTempProject } from '../embed-project-profile.mjs';

const SCRIPT_PATH = fileURLToPath(new URL('../embed-project-profile.mjs', import.meta.url));
const FIXED_NOW = '2026-04-10T08:00:00.000Z';

function writeText(root, relPath, content) {
  const fullPath = join(root, ...relPath.split('/'));
  mkdirSync(join(fullPath, '..'), { recursive: true });
  writeFileSync(fullPath, content, 'utf8');
}

function readJson(root, relPath) {
  return JSON.parse(readFileSync(join(root, ...relPath.split('/')), 'utf8'));
}

test('Unity with Lua bridge writes profile memory and preserves user memory fields', () => {
  withTempProject((cwd) => {
    writeText(cwd, 'ProjectSettings/ProjectVersion.txt', 'm_EditorVersion: 2022.3.15f1\n');
    writeText(cwd, 'Assets/Lua/main.lua', 'require("game.main")\n');
    writeText(cwd, 'Assets/Scripts/LuaHost.cs', 'using XLua; public class LuaHost { LuaEnv env; }\n');
    writeText(cwd, '.seed/state/ignored.lua', 'ignored = true\n');
    writeText(cwd, 'Library/Ignored.cs', 'public class Ignored {}\n');
    writeText(cwd, '.seed/project-memory.json', JSON.stringify({
      techStack: { engine: '', languages: [], buildTool: 'custom build', testTool: '' },
      hotPaths: [{ path: 'Assets/Scripts/LuaHost.cs', count: 2 }],
      userDirectives: ['Keep generated bindings untouched.'],
      customNotes: ['Existing note.'],
      lastScanned: null,
    }, null, 2));

    const result = runEmbedProjectProfile({ cwd, now: FIXED_NOW });
    const memory = readJson(cwd, '.seed/project-memory.json');

    assert.equal(result.written, true);
    assert.equal(memory.techStack.engine, 'Unity 2022.3.15f1');
    assert.deepEqual(memory.techStack.languages, ['C#', 'Lua']);
    assert.equal(memory.techStack.buildTool, 'custom build');
    assert.equal(memory.projectProfile.engine.name, 'unity');
    assert.equal(memory.projectProfile.languages.fileCounts.cs, 1);
    assert.equal(memory.projectProfile.languages.fileCounts.lua, 1);
    assert.equal(memory.projectProfile.languages.primary, 'lua');
    assert.equal(memory.projectProfile.languages.roles.find((item) => item.language === 'Lua')?.role, 'gameplay_primary');
    assert.equal(memory.projectProfile.languages.roles.find((item) => item.language === 'C#')?.role, 'engine_host_bridge_tooling');
    assert.equal(memory.hotPaths.length, 1);
    assert.equal(memory.userDirectives[0], 'Keep generated bindings untouched.');
    assert.equal(memory.customNotes[0], 'Existing note.');
    assert.equal(memory.lastScanned, FIXED_NOW);
    assert.ok(existsSync(join(cwd, '.seed', 'project-profile.md')));
    assert.ok(memory.projectProfile.directories.some((dir) => dir.path === 'Assets/Lua'));
    assert.ok(memory.projectProfile.directories.some((dir) => dir.path === 'ProjectSettings'));
    assert.ok(!memory.projectProfile.directories.some((dir) => dir.path.startsWith('.seed')));
    assert.ok(!memory.projectProfile.directories.some((dir) => dir.path.startsWith('Library')));
  });
});

test('Unity C# only project marks C# as gameplay/runtime primary', () => {
  withTempProject((cwd) => {
    writeText(cwd, 'ProjectSettings/ProjectVersion.txt', 'm_EditorVersion: 2021.3.1f1\n');
    writeText(cwd, 'Assets/Scripts/PlayerController.cs', 'public class PlayerController {}\n');

    const result = runEmbedProjectProfile({ cwd, check: true, now: FIXED_NOW });

    assert.equal(result.engine.name, 'unity');
    assert.equal(result.languages.primary, 'cs');
    assert.equal(result.languages.roles.find((item) => item.language === 'C#')?.role, 'gameplay_runtime_primary');
  });
});

test('detects Cocos, Godot, and Unreal minimal projects', () => {
  withTempProject((cwd) => {
    writeText(cwd, 'package.json', JSON.stringify({
      dependencies: { 'cocos-creator': '3.8.0' },
    }));
    writeText(cwd, 'assets/scripts/Game.ts', 'export class Game {}\n');
    const result = runEmbedProjectProfile({ cwd, check: true, now: FIXED_NOW });
    assert.equal(result.engine.name, 'cocos');
    assert.equal(result.languages.primary, 'ts');
  });

  withTempProject((cwd) => {
    writeText(cwd, 'project.godot', 'config_version=5\n');
    writeText(cwd, 'scripts/player.gd', 'extends Node\n');
    const result = runEmbedProjectProfile({ cwd, check: true, now: FIXED_NOW });
    assert.equal(result.engine.name, 'godot');
    assert.equal(result.languages.primary, 'gd');
  });

  withTempProject((cwd) => {
    writeText(cwd, 'Demo.uproject', JSON.stringify({ EngineAssociation: '5.3' }));
    writeText(cwd, 'Source/Demo/GameMode.cpp', 'UCLASS() class AGameMode {}\n');
    writeText(cwd, 'Content/Blueprints/BP_Player.uasset', 'binary-ish');
    const result = runEmbedProjectProfile({ cwd, check: true, now: FIXED_NOW });
    assert.equal(result.engine.name, 'unreal');
    assert.equal(result.languages.primary, 'cpp');
    assert.equal(result.languages.roles.find((item) => item.language === 'C++')?.role, 'native_runtime_primary');
    assert.ok(result.languages.roles.some((item) => item.language === 'Blueprint'));
  });
});

test('--check CLI prints a summary and does not write project files', () => {
  withTempProject((cwd) => {
    writeText(cwd, 'project.godot', 'config_version=5\n');
    writeText(cwd, 'scripts/main.gd', 'extends Node\n');

    const stdout = execFileSync(process.execPath, [SCRIPT_PATH, '--cwd', cwd, '--check'], {
      encoding: 'utf8',
    });
    const result = JSON.parse(stdout);

    assert.equal(result.written, false);
    assert.equal(result.engine.name, 'godot');
    assert.ok(!existsSync(join(cwd, '.seed', 'project-memory.json')));
    assert.ok(!existsSync(join(cwd, '.seed', 'project-profile.md')));
  });
});

test('directory entries respect maxDirectoryEntries while keeping high-priority paths first', () => {
  withTempProject((cwd) => {
    writeText(cwd, '.seed/config.json', JSON.stringify({
      embed: { maxDirectoryEntries: 3 },
    }));
    writeText(cwd, 'ProjectSettings/ProjectVersion.txt', 'm_EditorVersion: 2022.3.15f1\n');
    writeText(cwd, 'Assets/Lua/main.lua', 'return {}\n');
    writeText(cwd, 'Assets/Scripts/App.cs', 'public class App {}\n');
    writeText(cwd, 'Assets/Art/readme.txt', 'art\n');
    writeText(cwd, 'Tools/build.ps1', 'Write-Host build\n');

    const result = runEmbedProjectProfile({ cwd, check: true, now: FIXED_NOW });
    const paths = result.directories.map((dir) => dir.path);

    assert.equal(result.directories.length, 3);
    assert.ok(paths.includes('ProjectSettings'));
    assert.ok(paths.some((path) => path === 'Assets/Lua' || path === 'Assets/Scripts'));
  });
});
