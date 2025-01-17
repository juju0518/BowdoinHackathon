cd /Users/jcodd/Downloads
eval "$(brew/bin/brew shellenv)"     
brew services restart mongodb-community@8.0
cd /Users/jcodd/Documents/BowdoinHackathon/backend
node server.js