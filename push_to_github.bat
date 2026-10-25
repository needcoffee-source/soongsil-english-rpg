@echo off
echo ===================================================
echo Soongsil English RPG - GitHub Upload
echo ===================================================
echo.
cd /d "C:\Users\user\Desktop\Antigravity\Open World"
"C:\Program Files\Git\cmd\git.exe" add data/craft_recipes.json public/
"C:\Program Files\Git\cmd\git.exe" commit -m "update RPG contents" 2>nul
"C:\Program Files\Git\cmd\git.exe" push -u origin main
echo.
echo ===================================================
echo Done! Please check Render.com now.
echo ===================================================
pause