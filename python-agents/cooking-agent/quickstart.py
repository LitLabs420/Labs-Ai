"""
Quick start script for Cooking AI Agent (Windows/Cross-platform)
Run with: python quickstart.py
"""

import os
import sys
import subprocess
from pathlib import Path


def main():
    """Run quick start setup"""
    print("🍳 Cooking AI Agent - Quick Start")
    print("=" * 50)
    print()
    
    # Check Python version
    version = f"{sys.version_info.major}.{sys.version_info.minor}"
    print(f"✅ Python version: {version}")
    
    # Create virtual environment
    venv_dir = Path("venv")
    if not venv_dir.exists():
        print("📦 Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"])
    
    # Get Python executable in venv
    if sys.platform == "win32":
        python_exe = venv_dir / "Scripts" / "python.exe"
    else:
        python_exe = venv_dir / "bin" / "python"
    
    # Install dependencies
    print("📚 Installing dependencies...")
    subprocess.run([str(python_exe), "-m", "pip", "install", "-q", "-r", "requirements.txt"])
    
    # Setup .env
    env_file = Path(".env")
    if not env_file.exists():
        print("🔐 Creating .env file...")
        env_example = Path(".env.example")
        if env_example.exists():
            env_file.write_text(env_example.read_text())
        print("⚠️  Please configure GITHUB_TOKEN in .env")
        print("   Get one from: https://github.com/settings/tokens?type=beta")
    
    print()
    print("✅ Setup complete!")
    print()
    print("🚀 Start the agent with:")
    if sys.platform == "win32":
        print("   venv\\Scripts\\python.exe main.py")
    else:
        print("   source venv/bin/activate")
        print("   python main.py")
    print()
    print("📖 For more information, see README.md")


if __name__ == "__main__":
    main()
