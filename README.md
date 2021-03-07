# Cryptonote-Gacha
 
Edit the server.js for your own use

Homepage is in public folder

Zero effort


# How to use

0. Clone this repo (git clone https://github.com/kuroineko23/Cryptonote-Gacha/)
1. Create new wallet
2. Make a new subaddress (Although it won't be use for anything)
3. Run wallet-rpc without login (--disable-rpc-login)
4. nodejs Cryptonote-Gacha/server.js

OR

4. Get docker (https://docs.docker.com/engine/install/)
5. sudo docker build -t kuroineko23/cryptonotegacha Cryptonote-Gacha
6. sudo docker run -p 8081:8081 --name crypto_gacha -m 512m --network="host" --detach kuroineko23/cryptonotegacha
