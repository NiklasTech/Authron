import PyInstaller.__main__
import os
import sys

def build_backend():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dist_dir = os.path.join(current_dir, "..", "dist")

    os.makedirs(dist_dir, exist_ok=True)

    PyInstaller.__main__.run([
        'standalone_server.py',
        '--onefile',
        '--name=authron-backend',
        f'--distpath={dist_dir}',
        '--workpath=build',
        '--specpath=.',
        '--add-data=translations:translations',
        '--paths=.',
        '--paths=..',
        '--hidden-import=uvicorn.main',
        '--hidden-import=uvicorn.server',
        '--hidden-import=fastapi',
        '--hidden-import=sqlalchemy',
        '--hidden-import=main',
        '--hidden-import=api',
        '--hidden-import=database',
        '--hidden-import=security',
        '--hidden-import=passlib.handlers.argon2',
        '--hidden-import=passlib.handlers',
        '--hidden-import=passlib.context',
        '--hidden-import=argon2',
        '--hidden-import=cryptography.fernet',
        '--hidden-import=jose.jwt',
        '--hidden-import=pyotp',
        '--hidden-import=qrcode',
        '--hidden-import=PIL',
        '--collect-submodules=passlib',
        '--collect-submodules=cryptography',
        '--collect-submodules=jose',
        '--collect-submodules=pyotp',
        '--collect-submodules=backend',
        '--console',
        '--clean'
    ])

if __name__ == "__main__":
    build_backend()
