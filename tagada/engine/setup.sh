#!/bin/bash
# Runs at session start. Makes sure trim.py can import Pillow with the python3 on PATH.
# In Claude Code cloud containers python3 is 3.11, but the system Pillow is built for 3.12,
# so `from PIL import Image` fails on _imaging. Installing a 3.11 build fixes it.
if ! python3 -I -c "from PIL import Image" >/dev/null 2>&1; then
  python3 -m pip install --quiet --ignore-installed pillow >/dev/null 2>&1 \
    && echo "setup: installed Pillow for $(python3 --version)" \
    || echo "setup: Pillow install failed; trim.py will not work this session"
fi
exit 0
