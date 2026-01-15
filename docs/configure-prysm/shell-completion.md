---
id: shell-completion
title: Shell completion
sidebar_label: Shell completion
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import {HeaderBadgesWidget} from '@site/src/components/HeaderBadgesWidget.js';

<HeaderBadgesWidget commaDelimitedContributors="Willian"/>

Prysm's `beacon-chain` and `validator` CLIs support shell completion for **Bash**, **Zsh**, and **Fish** shells. Once enabled, you can press `TAB` to auto-complete subcommands, nested commands, and flags, significantly improving your command-line experience.

## Generating completion scripts

Each binary includes a `completion` subcommand that generates shell-specific completion scripts.

<Tabs groupId="shell">
  <TabItem value="bash" label="Bash">

```bash
# Generate the completion script
beacon-chain completion bash

# Or for the validator
validator completion bash
```

  </TabItem>
  <TabItem value="zsh" label="Zsh">

```bash
# Generate the completion script
beacon-chain completion zsh

# Or for the validator
validator completion zsh
```

  </TabItem>
  <TabItem value="fish" label="Fish">

```bash
# Generate the completion script
beacon-chain completion fish

# Or for the validator
validator completion fish
```

  </TabItem>
</Tabs>

## Loading completions

### Temporary (current session only)

Load completions for the current terminal session:

<Tabs groupId="shell">
  <TabItem value="bash" label="Bash">

```bash
# Load beacon-chain completions
source <(beacon-chain completion bash)

# Load validator completions
source <(validator completion bash)
```

  </TabItem>
  <TabItem value="zsh" label="Zsh">

```bash
# Load beacon-chain completions
source <(beacon-chain completion zsh)

# Load validator completions
source <(validator completion zsh)
```

  </TabItem>
  <TabItem value="fish" label="Fish">

```bash
# Load beacon-chain completions
beacon-chain completion fish | source

# Load validator completions
validator completion fish | source
```

  </TabItem>
</Tabs>

### Persistent (all future sessions)

To enable completions automatically in all new terminal sessions, save the completion scripts to the appropriate location for your shell:

<Tabs groupId="shell">
  <TabItem value="bash" label="Bash">

```bash
# User-local installation (recommended)
mkdir -p ~/.local/share/bash-completion/completions
beacon-chain completion bash > ~/.local/share/bash-completion/completions/beacon-chain
validator completion bash > ~/.local/share/bash-completion/completions/validator
```

:::note
The user-local directory requires bash-completion 2.0 or later. On older systems, you may need to install completions to the system-wide `/etc/bash_completion.d/` directory as root.
:::

  </TabItem>
  <TabItem value="zsh" label="Zsh">

```bash
# Create a user-local completions directory and add to fpath
mkdir -p ~/.zsh/completion
beacon-chain completion zsh > ~/.zsh/completion/_beacon-chain
validator completion zsh > ~/.zsh/completion/_validator
```

:::tip
If you haven't already, add the completions directory to your fpath in `~/.zshrc`:
```bash
echo 'fpath=(~/.zsh/completion $fpath)' >> ~/.zshrc
echo 'autoload -Uz compinit && compinit' >> ~/.zshrc
```
:::

You may need to start a new shell or run `compinit` for completions to take effect.

  </TabItem>
  <TabItem value="fish" label="Fish">

```bash
# Save to Fish completions directory
beacon-chain completion fish > ~/.config/fish/completions/beacon-chain.fish
validator completion fish > ~/.config/fish/completions/validator.fish
```

  </TabItem>
</Tabs>

## Using completions

Once completions are loaded, press `TAB` to see available options:

### Command completion

```bash
# Type partial command and press TAB
beacon-chain db<TAB>
# Completes to: beacon-chain db

beacon-chain db <TAB>
# Shows: restore  ...
```

### Flag completion

```bash
# Type -- and press TAB to see all flags
beacon-chain --<TAB>
# Shows: --datadir  --execution-endpoint  --checkpoint-sync-url  ...

# Type partial flag name and press TAB
beacon-chain --exec<TAB>
# Shows: --execution-endpoint  --execution-headers
```

### Contextual completion

Completions are context-aware. The available suggestions change based on the subcommand you're using:

```bash
# Global beacon-chain flags
beacon-chain --<TAB>

# Subcommand-specific flags
beacon-chain db restore --<TAB>
```

## Using with prysm.sh

If you run Prysm using the `prysm.sh` script, you can still use completion by first building or downloading the binaries. The completion scripts work with the standalone `beacon-chain` and `validator` binaries.

```bash
# Example: If using downloaded binaries
./beacon-chain completion bash > ~/.local/share/bash-completion/completions/beacon-chain
```

## How it works

The shell completion scripts use urfave/cli's built-in completion mechanism. When you press `TAB`, the shell runs the binary with a hidden `--generate-bash-completion` flag appended to your current input. The binary returns a list of valid completions for your context, which the shell then presents as suggestions.

This means completions always reflect the current binary's actual flags and commands - they're never out of date.

## Troubleshooting

### Completions not working after installation

1. **Start a new terminal session** - Completion scripts are typically loaded when the shell starts
2. **Check the script location** - Ensure the completion script is in the correct directory for your shell
3. **Verify bash-completion is installed** (Bash only):
   ```bash
   # Debian/Ubuntu
   apt install bash-completion
   
   # macOS with Homebrew
   brew install bash-completion@2
   ```

### Zsh completions not loading

Ensure compinit is called in your `~/.zshrc`:
```bash
autoload -Uz compinit && compinit
```

If completions still don't work, try rebuilding the completion cache:
```bash
rm -f ~/.zcompdump && compinit
```

### Permission denied errors

If you get permission errors when installing to system directories, use the user-local installation method instead (see persistent installation above). User-local completions work identically and don't require elevated privileges.
