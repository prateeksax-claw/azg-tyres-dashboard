#!/usr/bin/env python3
"""Fail CI if obvious private data/secrets are tracked."""
from __future__ import annotations

import re
import subprocess
import sys

DENY = re.compile(r"(\.env$|\.env\.|\.db$|\.sqlite$|\.sqlite3$|\.duckdb$|\.xlsx$|\.xls$|(^|/)data/|(^|/)reports/|api-keys|whatsapp|media)", re.I)
ALLOW = {".env.example"}

files = subprocess.check_output(["git", "ls-files"], text=True).splitlines()
bad = [f for f in files if f not in ALLOW and DENY.search(f)]
if bad:
    print("Blocked tracked private-data patterns:")
    for item in bad:
        print(f"- {item}")
    sys.exit(1)
print("OK: no obvious private data tracked")
