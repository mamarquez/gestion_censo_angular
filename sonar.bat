@echo off
set SONAR_TOKEN=sqa_c76e399bf979b380c8510cbf4e031c3d11897983

echo Generando cobertura...
call ng test --watch=false --browsers=ChromeHeadless --code-coverage

echo Enviando a SonarQube...
call npx sonar-scanner -Dsonar.token=%SONAR_TOKEN%

pause