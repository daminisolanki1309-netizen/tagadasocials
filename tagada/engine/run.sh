#!/bin/bash
# Runs one engine command with the right environment. Usage: run.sh <command> <outFile> <args...>
cd "$(dirname "$0")"
export NODE_PATH=$(npm root -g) NODE_USE_ENV_PROXY=1 NODE_NO_WARNINGS=1
cmd="$1"; out="$2"; shift 2
node swipe_engine.js "$cmd" "$out" "$@" > "${out%.json}.log" 2>&1
