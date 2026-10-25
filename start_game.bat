@echo off
cd /d "%~dp0"
title Soongsil English Open World Server

set "NODE_EXE=C:\Program Files (x86)\HncTools\McpServers\Node\node.exe"

echo ========================================================
echo   Soongsil English Open World Server
echo ========================================================

if exist "%NODE_EXE%" (
    echo Starting server with Node: "%NODE_EXE%"
    echo Opening browser at http://localhost:3000
    start http://localhost:3000
    "%NODE_EXE%" server.js
) else (
    echo Node not found at default location. Trying PATH node...
    start http://localhost:3000
    node server.js
)

pause
