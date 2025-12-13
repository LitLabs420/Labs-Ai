"""Bootstrap the cooking agent workspace."""

from __future__ import annotations

import os
import subprocess
import sys

REQUIRED_PYTHON = (3, 10)
ROOT = os.path.dirname(os.path.abspath(__file__))
VENV_PATH = os.path.join(ROOT, "venv")


def check_python_version() -> None:
    if sys.version_info[:2] < REQUIRED_PYTHON:
        defined = ".".join(map(str, REQUIRED_PYTHON))
        raise SystemExit(f"Python {defined} or higher is required.")


def ensure_virtualenv() -> None:
    if not os.path.exists(VENV_PATH):
        subprocess.run([sys.executable, "-m", "venv", VENV_PATH], check=True)


def install_dependencies() -> None:
    pip = os.path.join(VENV_PATH, "Scripts", "pip.exe") if os.name == "nt" else os.path.join(VENV_PATH, "bin", "pip")
    if not os.path.isfile(pip):
        raise SystemExit("Pip not found in the virtual environment.")
    subprocess.run([pip, "install", "-r", "requirements.txt"], check=True)


def main() -> None:
    check_python_version()
    ensure_virtualenv()
    install_dependencies()
    print("Setup complete. Activate the virtual environment before running the agent.")


if __name__ == "__main__":
    main()
