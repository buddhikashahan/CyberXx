## First you need to Fork the repo & Scan QR code using the given link. Then upload the session file to your forked repo. After that follow the given steps.

[![Run on Repl.it](https://replit.com/@KingBuddhika/CyberX-QR?v=1)]

Upload session.json File To Your Forked Repo

## Deploy on VPS or PC.
- You need to Install git,ffmpeg,curl,nodejs,yarn with pm2 
   1. Install git ffmpeg curl 
      ```
       sudo apt -y update &&  sudo apt -y upgrade 
       sudo apt -y install git ffmpeg curl
      ```
   2. Install nodejs 
      ```
      sudo apt -y remove nodejs
      curl -fsSl https://deb.nodesource.com/setup_lts.x | sudo bash - && sudo apt -y install nodejs
      ```

   3. Install yarn
      ```
      curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - 
      echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
      sudo apt -y update && sudo apt -y install yarn
      ```

   4. Install pm2
      ```
      sudo yarn global add pm2
      ```

   5. Clone Repo and install required packages
      ```
      git clone https://github.com/edm-official/CyberX
      cd CyberX
      yarn install --network-concurrency 1
      ```
  
   6. Start bot
      ```
      npm i -g pm2 && pm2 start index.js && pm2 save && pm2 logs
      ```
      
      ##
      
      If you are facing any problem restart using this command
      ``` 
      npm i -g pm2 && pm2 restart index.js && pm2 save && pm2 logs
      ```
