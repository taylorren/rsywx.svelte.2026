#!/usr/bin/env bash
# Detached dev-server launcher (LAN-exposed). Safe to run from a non-interactive shell.
cd "$(dirname "$0")"
pkill -f 'vite dev' 2>/dev/null
setsid pnpm dev:lan >/tmp/rsywx-dev.log 2>&1 </dev/null &
disown