//https://www.tutorialspoint.com/nodejs/nodejs_express_framework.htm

var express = require('express');
var app = express();
var axios = require('axios').default;
var randomNumber = require("random-number-csprng");

var balance = 0;
var address = "";
var rpc_url = "http://127.0.0.1:22223/json_rpc";

//https://steemit.com/utopian-io/@prodicode/how-to-use-ejs-displaying-data-from-nodejs-in-html
app.set("view engine", "ejs");
app.set("views", __dirname + "/public");
app.use(express.urlencoded({extended: true}));

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
        res.render('index', { balance: balance, address: address })
        console.log("Success");
    }).catch(error => {
        console.log(error);
        res.render('result', { number: "", result: "Internal server error occured, please try again later!", txhash : "", txkey: ""});
        console.log("Error");
    });
})

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
        console.log(error);
        console.log("Error");
        res.render('result', { number: "", result: "Internal server error occured, please try again later!", txhash : "", txkey: ""});
    });
}

async function doTransfer2(wallet_target, luck, prize, currentBalance, res)
{
    var transferAmount;
    var luck = luck;
    switch(prize)
    {
        case 1:
            transferAmount = currentBalance * 0.1;
            break;
        case 2:
            transferAmount = currentBalance * 0.01;
            break;
        case 3:
            transferAmount = 10000000000;
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
            mixin : 0,
            ring_size : 0,
            unlock_time : 0,
            get_tx_key : true
        }
    });

    axios.post(rpc_url, data, config).then(resp => {
        res.render('result', { number: luck, result: resp.data.result.amount/1000000000000 + " CRYPTO!", txhash: "txhash : " + resp.data.result.tx_hash, txkey: "txkey : " + resp.data.result.tx_key });
    }).catch(error => {
        console.log(error);
        console.log("Error");
        res.render('result', { number: "", result: "Internal server error occured, please try again later!", txhash : "", txkey: ""});
    });
}
app.post('/do_gacha', async (req, res) => {

    var wallet_target = req.body.wallet_address;
    var wallet_prefix = wallet_target.slice(0,4);
    if(wallet_prefix.localeCompare("cash") == 0)
    {
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
                case luck < 511000:
                    doTransfer1(wallet_target, luck, 3, res);
                    break;
                default:
                    res.render('result', { number: luck, result: "0 CRYPTO!", txhash : "", txkey: ""});
            }
        }).catch(error => {
            console.log(error);
            res.render('result', { number: "", result: "Internal server error occured, please try again later!", txhash : "", txkey: ""});
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
