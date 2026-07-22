import fs from 'fs';
import path from 'path';

/**
 * Generates automated agent hook configuration files for Claude Code and Gemini CLI,
 * and installs the Git post-commit hook for automated preference recording.
 */
export function generateAgentHooks(rootDir: string = process.cwd()): { claudePath: string; gitHookPath?: string } {
  // 1. Agent Lifecycle Hooks (.claude/settings.json)
  const claudeDir = path.join(rootDir, '.claude');
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  const settingsPath = path.join(claudeDir, 'settings.json');
  const hookConfig = {
    hooks: {
      SessionStart: [
        {
          type: 'command',
          command: 'npx formalin brief'
        }
      ],
      PreToolUse: [
        {
          matcher: 'Write|Edit',
          hooks: [
            {
              type: 'command',
              command: 'npx formalin gate "$CLAUDE_TOOL_INPUT_CONTENT"'
            }
          ]
        }
      ],
      PostToolUse: [
        {
          matcher: 'Write|Edit',
          hooks: [
            {
              type: 'command',
              command: 'npx formalin snapshot "$CLAUDE_TOOL_INPUT_FILE_PATH"'
            }
          ]
        }
      ],
      Stop: [
        {
          type: 'command',
          command: 'npx formalin check'
        }
      ]
    }
  };

  fs.writeFileSync(settingsPath, JSON.stringify(hookConfig, null, 2), 'utf-8');

  // 2. Git post-commit hook (.git/hooks/post-commit)
  const gitDir = path.join(rootDir, '.git');
  let gitHookPath: string | undefined;

  if (fs.existsSync(gitDir)) {
    const gitHooksDir = path.join(gitDir, 'hooks');
    if (!fs.existsSync(gitHooksDir)) {
      fs.mkdirSync(gitHooksDir, { recursive: true });
    }

    gitHookPath = path.join(gitHooksDir, 'post-commit');
    const gitHookScript = `#!/bin/sh\n# Formalin Automated Preference Record Hook\nnpx formalin record\n`;

    fs.writeFileSync(gitHookPath, gitHookScript, 'utf-8');
    try {
      fs.chmodSync(gitHookPath, 0o755);
    } catch {
      // Ignore chmod errors on systems without posix permissions
    }
  }

  return { claudePath: settingsPath, gitHookPath };
}
