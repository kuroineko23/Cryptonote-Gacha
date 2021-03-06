//https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm
var express = require('express');
var app = express();
var axios = require('axios').default;
var randomNumber = require("random-number-csprng");
const mongoose = require('mongoose');

var balance = 0;
var address = "";

//fill this
var rpc_url = 'http://127.0.0.1:22223/json_rpc';
var coin_ticker = 'CRYPTO';
var mongoDB_url = 'mongodb://127.0.0.1:27017/cryptogacha';

//https://steemit.com/utopian-io/@prodicode/how-to-use-ejs-displaying-data-from-nodejs-in-html
app.set("view engine", "ejs");
app.set("views", __dirname + "/public");
app.use(express.urlencoded({extended: true}));

//https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/mongoose
var connection = mongoose.connect(mongoDB_url, {useNewUrlParser: true, useUnifiedTopology: true}, function(error){
    if(error){
        console.log("MongoDB connection error");
    } else {
        console.log("MongoDB connection success");
    }
});

var historySchema = new mongoose.Schema({
    address: String,
    date: Date,
    txHash: String,
    amount: String,
});
var historyTx = mongoose.model('History', historySchema);

//https://docs.mongodb.com/manual/tutorial/expire-data/
historySchema.index({ "createdAt": 1 }, { expireAfterSeconds: 3600 });

//function
async function doTransfer1(wallet_target, luck, prize, res)
{
    var luck = luck;
    const config = {
        method: 'POST',
        responseType: 'json',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const data = JSON.stringify({
        jsonrpc: "2.0",
        id: "0",
        method: "get_balance",
        params: {
            account_index: 0
        }
    });

    axios.post(rpc_url, data, config).then(resp => {
        const currentBalance = resp.data.result.per_subaddress[0].unlocked_balance;
        doTransfer2(wallet_target, luck, prize, currentBalance, res);
    }).catch(error => {
        throwError(error, res);
    });
}

async function doTransfer2(wallet_target, luck, prize, currentBalance, res)
{
    var transferAmount;
    var luck = luck;
    switch(prize)
    {
        case 1:
            transferAmount = Math.round(currentBalance/10);
            break;
        case 2:
            transferAmount = Math.round(currentBalance/100);
            break;
        case 3:
            transferAmount = 10000000000;
            break;
        case 4:
            transferAmount = 1000000000;
            break;       
    }
    const config = {
        method: 'POST',
        responseType: 'json',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const data = JSON.stringify({
        jsonrpc: "2.0",
        id: "0",
        method: "transfer",
        params: {
            destinations: [
                {
                    amount: transferAmount,
                    address: wallet_target
                }
            ],
            priority : 0,
            mixin : 3,
            ring_size : 10,
            unlock_time : 3,
            get_tx_key : true
        }
    });

    //https://stackoverflow.com/questions/14597241/setting-expiry-time-for-a-collection-in-mongodb-using-mongoose
    axios.post(rpc_url, data, config).then(resp => {
        historyTx.create({
            address: "*****" + wallet_target.slice((wallet_target.length-11), (wallet_target.length)),
            date: new Date(new Date().toJSON()).toUTCString(),
            txHash: resp.data.result.tx_hash,
            amount: resp.data.result.amount/1000000000000
        }, function (error){
            if(error){
                console.log(error);
            }
        });
        res.render('result', { number: luck, result: resp.data.result.amount/1000000000000 + " " + coin_ticker + "!", txhash: "txhash : " + resp.data.result.tx_hash, txkey: "txkey : " + resp.data.result.tx_key });
    }).catch(error => {
        throwError(error, res);
    });
}

function throwError (error, res)
{
    console.log(error);
    res.render('result', { number: "", result: "Internal server error occured, please try again later!", txhash : "", txkey: ""});
    console.log("Error");
}

//routes
app.get('/', async (req, res) => {
    const config = {
        method: 'POST',
        responseType: 'json',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const data = JSON.stringify({
        jsonrpc: "2.0",
        id: "0",
        method: "get_balance",
        params: {
            account_index: 0
        }
    });

    axios.post(rpc_url, data, config).then(resp => {
        address = resp.data.result.per_subaddress[0].address;
        balance = resp.data.result.per_subaddress[0].unlocked_balance/1000000000000;
        historyTx.find({}, function(error, data){
            if(error){
                console.log(error);
            } else {
                res.render('index', { balance: balance, address: address, historyTx: data, ticker: coin_ticker })
            }
        })
        console.log("Success");
    }).catch(error => {
        throwError(error, res);
    });
})

app.post('/do_gacha', async (req, res) => {

    var wallet_target = req.body.wallet_address;
    var wallet_prefix = wallet_target.slice(0,4);
    //find address in db first
    if(wallet_prefix.localeCompare("cash") == 0)
    {
        var hidden_address = "*****" + wallet_target.slice((wallet_target.length-11), (wallet_target.length));
        historyTx.find({address: hidden_address}, function(error, data) {
            if(error){
                throwError(error, res);
            }
            if(!data.length){
                var credit = 0;
                randomNumber(0,1000000).then(luck => {
                    switch(true)
                    {
                        case luck < 1000:
                            doTransfer1(wallet_target, luck, 1, res);
                            break;
                        case luck < 61000:
                            doTransfer1(wallet_target, luck, 2, res);
                            break;
                        case luck < 911000:
                            doTransfer1(wallet_target, luck, 3, res);
                            break;
                        default:
                            doTransfer1(wallet_target, luck, 4, res);
                            break;
                    }
                }).catch(error => {
                    throwError(error, res);
                });
            }
            else
            {
                res.render('result', { number: "", result: "60 minutes hasn't passed since your last gacha!", txhash : "", txkey: ""});
            }
        });
    }
    else
    {
        res.render('result', { number: "", result: "Invalid Address!", txhash : "", txkey: ""});
    }
})


//server settings
var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Website running on http://%s:%s", host, port)
})