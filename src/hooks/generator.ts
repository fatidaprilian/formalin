import fs from 'fs';
import path from 'path';

export interface GeneratedHooksResult {
  claudePath: string;
  geminiPath: string;
  gitHookPath?: string;
}

/**
 * Generates automated agent hook configuration files across multiple AI coding hosts
 * (Claude Code, Gemini CLI / Antigravity), and installs the Git post-commit hook.
 */
export function generateAgentHooks(rootDir: string = process.cwd()): GeneratedHooksResult {
  // 1. Claude Code Hooks (.claude/settings.json)
  const claudeDir = path.join(rootDir, '.claude');
  if (!fs.existsSync(claudeDir)) {
    fs.mkdirSync(claudeDir, { recursive: true });
  }

  const claudeSettingsPath = path.join(claudeDir, 'settings.json');
  const claudeHookConfig = {
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

  fs.writeFileSync(claudeSettingsPath, JSON.stringify(claudeHookConfig, null, 2), 'utf-8');

  // 2. Gemini CLI / Antigravity Agent Hooks (.gemini/settings.json)
  const geminiDir = path.join(rootDir, '.gemini');
  if (!fs.existsSync(geminiDir)) {
    fs.mkdirSync(geminiDir, { recursive: true });
  }

  const geminiSettingsPath = path.join(geminiDir, 'settings.json');
  const geminiHookConfig = {
    hooks: {
      SessionStart: [
        {
          type: 'command',
          command: 'npx formalin brief'
        }
      ],
      BeforeToolExecution: [
        {
          matcher: 'write_to_file|replace_file_content|multi_replace_file_content',
          hooks: [
            {
              type: 'command',
              command: 'npx formalin gate "$TOOL_INPUT_CONTENT"'
            }
          ]
        }
      ],
      AfterToolExecution: [
        {
          matcher: 'write_to_file|replace_file_content|multi_replace_file_content',
          hooks: [
            {
              type: 'command',
              command: 'npx formalin snapshot "$TOOL_INPUT_FILE_PATH"'
            }
          ]
        }
      ],
      SessionEnd: [
        {
          type: 'command',
          command: 'npx formalin check'
        }
      ]
    }
  };

  fs.writeFileSync(geminiSettingsPath, JSON.stringify(geminiHookConfig, null, 2), 'utf-8');

  // 3. Git post-commit hook (.git/hooks/post-commit)
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
      // Ignore chmod errors
    }
  }

  return { claudePath: claudeSettingsPath, geminiPath: geminiSettingsPath, gitHookPath };
}
