@echo off
echo "Setting up GitHub repository for Discord Clone..."

REM Initialize Git repository
git init

REM Add all files to Git
git add .

REM Create initial commit
git commit -m "Initial commit: Discord Clone"

echo.
echo "Repository initialized locally! Now you can connect it to GitHub with:"
echo "git remote add origin https://github.com/yourusername/discord-clone.git"
echo "git push -u origin main"
echo.
echo "Make sure to replace 'yourusername' with your actual GitHub username."
echo.
pause 