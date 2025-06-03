#!/usr/bin/env python3
import sys
import os

# Füge den aktuellen Ordner zum Python-Pfad hinzu
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
sys.path.insert(0, os.path.join(current_dir, '..'))

if __name__ == "__main__":
    try:
        import uvicorn
        # Importiere direkt aus main statt backend.main
        from main import app

        print("Starting Authron Backend Server...")
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
    except ImportError as e:
        print(f"Import error: {e}")
        print("Python path:", sys.path)
        print("Current directory:", os.getcwd())
        sys.exit(1)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
