#!/usr/bin/env python3
"""
Startup script for the WindBorne Vendor API
"""
import os
import sys
import subprocess
from pathlib import Path

def main():
    # Get the directory containing this script
    script_dir = Path(__file__).parent
    
    # Change to the API directory
    os.chdir(script_dir)
    
    # Check if virtual environment exists
    venv_path = script_dir / ".venv"
    if not venv_path.exists():
        print("❌ Virtual environment not found at .venv")
        print("Please create one with: python -m venv .venv")
        sys.exit(1)
    
    # Check if .env file exists
    env_path = script_dir / ".env"
    if not env_path.exists():
        print("❌ .env file not found")
        print("Please create .env with ALPHA_VANTAGE_API_KEY=your_key")
        sys.exit(1)
    
    # Activate virtual environment and run the server
    if os.name == 'nt':  # Windows
        python_exe = venv_path / "Scripts" / "python.exe"
    else:  # Unix/Linux/macOS
        python_exe = venv_path / "bin" / "python"
    
    if not python_exe.exists():
        print(f"❌ Python executable not found at {python_exe}")
        sys.exit(1)
    
    print("🚀 Starting WindBorne Vendor API...")
    print("📡 API will be available at: http://127.0.0.1:8000")
    print("📖 API docs will be available at: http://127.0.0.1:8000/docs")
    print("🔍 Test endpoint available at: http://127.0.0.1:8000/test/AAPL")
    print("⚡ Press Ctrl+C to stop the server\n")
    
    # Run the main.py file
    try:
        subprocess.run([str(python_exe), "main.py"], check=True)
    except KeyboardInterrupt:
        print("\n✅ Server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()