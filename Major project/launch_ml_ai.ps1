$mlDir = "C:\Users\Deepika\Desktop\Major project (2)\Major project\ml-service"
$aiDir = "C:\Users\Deepika\Desktop\Major project (2)\Major project\ai-service"
$py = "C:\Users\Deepika\AppData\Local\Python\pythoncore-3.14-64\python.exe"

Start-Process -FilePath $py -ArgumentList "main.py" -WorkingDirectory $mlDir -RedirectStandardOutput "C:\Users\Deepika\Desktop\Major project (2)\Major project\ml.log" -RedirectStandardError "C:\Users\Deepika\Desktop\Major project (2)\Major project\ml_err.log" -WindowStyle Hidden

Start-Process -FilePath $py -ArgumentList "main.py" -WorkingDirectory $aiDir -RedirectStandardOutput "C:\Users\Deepika\Desktop\Major project (2)\Major project\ai.log" -RedirectStandardError "C:\Users\Deepika\Desktop\Major project (2)\Major project\ai_err.log" -WindowStyle Hidden

Start-Sleep -Seconds 3
Write-Host "ML & AI services launched successfully!"

