@echo off
chcp 65001 > nul
echo ===================================================
echo 🏫 숭실중학교 영어 오픈월드 RPG - 방화벽 포트 3000 원클릭 허용
echo ===================================================
echo.
echo 관리자 권한으로 방화벽 규칙을 추가합니다...
netsh advfirewall firewall delete rule name="SoongsilRPG" > nul 2>&1
netsh advfirewall firewall add rule name="SoongsilRPG" dir=in action=allow protocol=TCP localport=3000 profile=any
echo.
if %errorlevel% == 0 (
    echo ===================================================
    echo ✅ 방화벽 해제 완료!
    echo 이제 학교 와이파이(senWiFi_Free)를 잡은 학생 태블릿에서
    echo 아래 주소로 즉시 접속할 수 있습니다:
    echo.
    echo 👉 http://172.30.6.182:3000
    echo ===================================================
) else (
    echo ⚠️ 관리자 권한이 필요합니다.
    echo 이 파일을 [우클릭] -> [관리자 권한으로 실행]해 주세요!
)
pause
