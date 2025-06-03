#!/bin/bash
if [ ! -d "backend/venv" ]; then
    echo "Virtual Environment not found!"
    exit 1
fi
if [ ! -d "frontend/node_modules" ]; then
    echo "Node Modules not found!"
    exit 1
fi
cd frontend
NODE_ENV=development npm run electron-dev
