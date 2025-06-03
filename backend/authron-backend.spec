# -*- mode: python ; coding: utf-8 -*-
from PyInstaller.utils.hooks import collect_submodules

hiddenimports = ['uvicorn.main', 'uvicorn.server', 'fastapi', 'sqlalchemy', 'main', 'api', 'database', 'security', 'passlib.handlers.argon2', 'passlib.handlers', 'passlib.context', 'argon2', 'cryptography.fernet', 'jose.jwt', 'pyotp', 'qrcode', 'PIL']
hiddenimports += collect_submodules('passlib')
hiddenimports += collect_submodules('cryptography')
hiddenimports += collect_submodules('jose')
hiddenimports += collect_submodules('pyotp')
hiddenimports += collect_submodules('backend')


a = Analysis(
    ['standalone_server.py'],
    pathex=['.', '..'],
    binaries=[],
    datas=[('translations', 'translations')],
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='authron-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
