# Cryptonote-Gacha
 
Edit the server.js for your own use

Homepage is in public folder

Zero effort


# How to use

0. Clone this repo
1. Create new wallet
2. Install mongodb (https://docs.mongodb.com/manual/administration/install-community/)
3. Make a new subaddress (Although it won't be use for anything)
4. Run wallet-rpc without login (--disable-rpc-login)
5. Edit Cryptonote-Gacha/server.js
6. nodejs Cryptonote-Gacha/server.js

or

4. Get docker (https://docs.docker.com/engine/install/)
5. sudo docker build -t kuroineko23/cryptonotegacha Cryptonote-Gacha
6. sudo docker run -p 8081:8081 --name crypto_gacha -m 512m --network="host" --detach kuroineko23/cryptonotegacha

then

7. Open mongo and set db.ttls.createIndex({ "date": 1 }, { expireAfterSeconds: 3600 })
