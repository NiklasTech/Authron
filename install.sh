#!/bin/bash

set -e

REPO="niklastech/authron"
APP_NAME="Authron"
INSTALL_DIR="$HOME/.local/bin"
DESKTOP_DIR="$HOME/.local/share/applications"

echo "Installing Authron Password Manager..."

mkdir -p "$INSTALL_DIR"
mkdir -p "$DESKTOP_DIR"

echo "Downloading latest release..."
LATEST_URL=$(curl -s "https://api.github.com/repos/$REPO/releases/latest" | grep -o 'https://.*Authron\.AppImage' | head -1)

if [ -z "$LATEST_URL" ]; then
    echo "Error: Could not find AppImage download URL"
    exit 1
fi

echo "Downloading from: $LATEST_URL"
wget -O "$INSTALL_DIR/authron.AppImage" "$LATEST_URL"
chmod +x "$INSTALL_DIR/authron.AppImage"

echo "✅ AppImage downloaded and made executable"

echo "Creating desktop entry..."
cat > "$DESKTOP_DIR/authron.desktop" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Authron Password Manager
Comment=Secure Password Manager with end-to-end encryption
Exec=$INSTALL_DIR/authron.AppImage
Icon=authron
Terminal=false
Categories=Utility;Security;
StartupWMClass=authron
EOF

if [ -d "$HOME/.local/share/icons" ]; then
    mkdir -p "$HOME/.local/share/icons/hicolor/256x256/apps"
fi

echo "Authron has been installed successfully!"
echo ""
echo "You can now:"
echo "  - Run from terminal: authron"
echo "  - Find it in your applications menu"
echo "  - Run directly: $INSTALL_DIR/authron.AppImage"

if ! echo "$PATH" | grep -q "$INSTALL_DIR"; then
    echo ""
    echo "To run 'authron' from anywhere, add this to your ~/.bashrc or ~/.zshrc:"
    echo "  export PATH=\"\$PATH:$INSTALL_DIR\""
fi

ln -sf "$INSTALL_DIR/authron.AppImage" "$INSTALL_DIR/authron" 2>/dev/null || true

echo ""
echo "⚠️  Note: If the AppImage doesn't run, you may need to install FUSE:"
echo "   Ubuntu/Debian: sudo apt install libfuse2"
echo "   Fedora: sudo dnf install fuse"
echo ""
echo "Documentation: https://github.com/$REPO"
echo "Issues: https://github.com/$REPO/issues"
