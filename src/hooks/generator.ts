import fs from 'fs';
import path from 'path';

/**
 * Generates automated agent hook configuration files for Claude Code and Gemini CLI.
 */
export function generateAgentHooks(rootDir: string = process.cwd()): string {
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
  return settingsPath;
}
