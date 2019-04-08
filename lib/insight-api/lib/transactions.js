'use strict';

var dashcore = require('@dashevo/dashcore-lib');
var _ = dashcore.deps._;
var $ = dashcore.util.preconditions;
var Common = require('./common');
var async = require('async');

var MAXINT = 0xffffffff; // Math.pow(2, 32) - 1;

function TxController(node) {
  this.node = node;
  this.common = new Common({log: this.node.log});
}

TxController.prototype.show = function(req, res) {
  if (req.transaction) {
    res.jsonp(req.transaction);
  }
};

/**
 * Find transaction by hash ...
 */
TxController.prototype.transaction = function(req, res, next) {
  var self = this;
  var txid = req.params.txid;

  this.node.getDetailedTransaction(txid, function(err, transaction) {
    if (err && err.code === -5) {
      return self.common.handleErrors(null, res);
    } else if(err) {
      return self.common.handleErrors(err, res);
    }

    self.transformTransaction(transaction, function(err, transformedTransaction) {
      if (err) {
        return self.common.handleErrors(err, res);
      }
      req.transaction = transformedTransaction;
      next();
    });

  });
};

TxController.prototype.tryToFindKnownAddress = function(addr, transformed) {
//https://chainz.cryptoid.info/dash/address.dws?9244347.htm
if (addr === "XfcLDYdv97tc8YYbQqmR1gxBdLq4xfPNdy")
  transformed.knownaddress = "Binance HotWallet";
//https://chainz.cryptoid.info/dash/wallet.dws?7616452.htm
else if (addr === "XvhExSNNr97U1ZenWFjJmgD8wc7v88ZUF7")
  transformed.knownaddress = "AntPool";
//https://chainz.cryptoid.info/dash/wallet.dws?8811300.htm
else if (addr === "XssjzLKgsfATYGqTQmiJURQzeKdpL5K1k3")
  transformed.knownaddress = "ViaBTC";
//https://chainz.cryptoid.info/dash/wallet.dws?17019252.htm
else if (addr === "XbUutDsgJbf7Sjjq4omhusNtkT8ih1d7oQ" ||
  addr === "XkNPrBSJtrHZUvUqb3JF4g5rMB3uzaJfEL" ||
  addr === "XfYm8vfjh3pKN3eKxzqAqACyAo9RQiVeBs" ||
  addr === "Xx59rxahxZy38ef3CPYt2LBUk74W1HCZy3")
  transformed.knownaddress = "Genesis Mining Wallet";
//https://chainz.cryptoid.info/dash/wallet.dws?27347.htm
else if (addr === "XpZiE4UFcrbit7SXhJPGNEepwsnA1M6iwD" ||
  addr === "XeJiAvTAaggjFXVMmTctYJS3Da17rFFQMg" ||
  addr === "XuqHAeKJT8C1mLCAyjome9tcZ4eqQBw7u2" ||
  addr === "XjW2EdppmXwyiTpem4pMfna6HaZYZ7MMv5" ||
  addr === "XvNUQYWB1unYVHy1wUy8SSF9rcrrFbmtRc" ||
  addr === "XxvZrFS7vc57jhJ5go1dy5nTcGmP5msAe8" ||
  addr === "Xhoin2s1uALkVdwonv8qZpCwNKnMd1pJ4R" ||
  addr === "Xt7JwCakLXY2v1YXaj2ZvWuLxuYJEZm6Vs" ||
  addr === "XgdXC1KqN2fMyRH8TpEyr39xa8N138G2NT" ||
  addr === "XngJQbGj6ewpNACfBsu7j5xxgsyEsk3Weh" ||
  addr === "XoUv6GhQ9FQxN4GysgaNKWzPcTJUJkeXNs" ||
  addr === "Xtbzdg3ZWCT933B9MYjwDyhaStEBhmpQUn" ||
  addr === "XspKveZTtFescadVBUDvbha2BngUNn6HRx" ||
  addr === "Xw63vn1HFwYRTJmDTCffSK5v5FyStiTwsy" ||
  addr === "XxjxnQ2nPWzV426v4Cpky9udjyURpB3CwV" ||
  addr === "XsMbatFVfXR2UtnSpTnCYPSunTq5CFdq8z" ||
  addr === "XkoLBy2hjGmbaqnyMNfy8dg5ozvTXS9UMQ" ||
  addr === "XncbJU6SmpVgCQZXxvfsZJpjJuGGbVfiok" ||
  addr === "XxNcCCapgiyYXGmKcyjFYriSMBpJThb1o5" ||
  addr === "Xn2dtpkQTe9kFWEyGSCPJHevNcMwF9mgPC" ||
  addr === "XpokSFQnKifVS1u117V6bVWok78VGokK2h" ||
  addr === "Xsyou5zcNLhhnf6cBhwCmDpcNmdtqYKMUR" ||
  addr === "XcVEgTqJC2RyPedpqm1nNJRGHq4J9rhwbF" ||
  addr === "XgD9ojtg6J9vBbKfBeWi214btGb14wjfGs" ||
  addr === "XyoJviC9nmoUZsU86Lrco2onarF9sEmtXM" ||
  addr === "Xx4bUrHdUKgLpFXnYfzry549WoGwttPQTG" ||
  addr === "Xyi3UqLBdKjpMvEAN1gd8ojYhDX62SMH7f" ||
  addr === "XpFRXCH9mxWu7a2D3yAbvA9GeQ1NVUAVEX" ||
  addr === "XfyuAqUjRtoLXShRtR36JkfkYPCsQkn59H" ||
  addr === "XvzYYre4ddcS8jNCNeTAcH9AFQ4ZbExERj" ||
  addr === "XbUgJbfcFM4KGiNNwRNVf4pV7HV32tyPc6" ||
  addr === "XkGCzouGbLCtFGkRXnQDuk4kpieMJ9seTK" ||
  addr === "Xhf5SEkzH7e9Crr5sd4HBQzDyKEtpTW3kc" ||
  addr === "XnQGL3mSpCWVMHQGjKdFTDqsve3H4XTchr" ||
  addr === "XmsjwVZu93fw8AJbFBXZ35xVtg6f7Thk4Q" ||
  addr === "Xt8Xeg3aP17LQy24nBNswNLPujhqYMcUeQ")
  transformed.knownaddress = "Poloniex";
//https://chainz.cryptoid.info/dash/wallet.dws?107753.htm
else if (addr === "XxsTca1ATYAuZdCo6E8ePQQovGG5bvayeN" ||
  addr === "Xb9D8uXTShV66GXH9pvJRhLuuFEK3qdSxY" ||
  addr === "XgmUarxLhp6x7Aa2FUVbvr7qHRYPBq9BPv" ||
  addr === "Xr5ru37XLRHsqzfoTiT8H9RcoWM7umsDBw" ||
  addr === "Xd8JJ1LSCQDJHqWeR4bH6qt4CMacruw7WY" ||
  addr === "XuvToNj5bmgR2fsRdN9Ve9uB4EZopwUPo6" ||
  addr === "XegpJfp9ct1u6SddLQYzwNwwasLRtVMgxL" ||
  addr === "XwBvLgkPu7g2TBjEVzoYSBzEDLckmiMdKB" ||
  addr === "XgwHVMa7GS12crzWijFr9redEcA5VQ7JLh" ||
  addr === "XuqaWEirFCPWrQn3Wtjj1FyqdKoXSNieKv" ||
  addr === "XsoeBjvKHed4jETmrjQdkrrbnTKe6E6Kgt" ||
  addr === "XyQPWW6c3YEzMwcwqk49okC7oMrpPnKa5D" ||
  addr === "Xv8xrVgNoR3xkch6Anv73Y7s1mKLHrvSmF" ||
  addr === "XpN69dYnK7VRQzeRg1rRrBkarmKorDZZQM" ||
  addr === "XijQKfWD5Ezm9BCYLjBgJN4XsXgEd4QwSX" ||
  addr === "XxvKxH7wcLLfYWKL5po4449M7B896T2LbQ" ||
  addr === "Xk8e3QXLB2TBvsx1GVKf7eCQWGJnfNjfmm" ||
  addr === "XxA2Wwcuzxuj7R5VzqNrkmLWxSWjF5XstS" ||
  addr === "XwhbQFiW7sAedw7KWECZ9hBpgqnihGZVd1" ||
  addr === "XdUNcDDjiCafFYiZCzJGRDrzEeREwK7Eep" ||
  addr === "XqGZmwQymQoUsYH8H44vu2rHDEGmTLXg2R" ||
  addr === "XdKP2kYZmCEn1Ty3KgnJrRn8W8sbiB7cpF" ||
  addr === "XfcfhvDYuRkkqDYz1ozifqbk8DwpwMba3d" ||
  addr === "XxZPB3vpgjNWEWhqBi7jKfPZSwVN3A16Lg" ||
  addr === "Xv6B32gfcWeaNbeZf4XgoNCDKWRdL9V5uB" ||
  addr === "XyTZNgNoxu7qz1BSNhrSL993W2fmLnXapW" ||
  addr === "XmHeFxijepMrsWrdLVMgyxj8YAaeN63QGJ" ||
  addr === "XgDobrnjMhr8gPGmvnm7Aj3NoYRBMPNm9N" ||
  addr === "Xm5XvdHPGeUi4eQFV9bX3odgQBKceGRyHS" ||
  addr === "Xir568mQFqrYMKurYGR71nmGh3sBqp8D4S" ||
  addr === "XcTsiLYXZUe9yyhQff12ynJLhCcnHs2pdV" ||
  addr === "XyREjjWmBjMqsUvNHY19434VEh9LnToRQ5" ||
  addr === "XhrYVd2Ymt6LUhUMeCQpY66w4zXU2AQNnv" ||
  addr === "XwMt9d32DaNEzdpUgw6tHLZYAKikSiEoCs" ||
  addr === "XnK29KPwg7u6F8z5Sm7rF6EABoPcp5wtHS" ||
  addr === "XtYHfMCpfrwYD7rFtvbW3PCnzeiDcw8tqR" ||
  addr === "XxvqJf7MQWHMiTiCB92yHgFJQYYQTMBjUf" ||
  addr === "XtbDPe29V13Tub9ycSZiw4eEgmKLnsJa7S" ||
  addr === "XdMSC6UBGV443s4gfFbHe6X34YJc5WFgbP" ||
  addr === "Xj2sdhKpbiLY3E6bNKPJkzgetfLKRrZukT" ||
  addr === "Xt66Ug8YAJNLS2Wz9uagWwPc4BoWuuMnqj" ||
  addr === "XfXn1PgCnDEzbqPe9SiwGd2LhPyQx2o9pc" ||
  addr === "XwcrfqpPMBQ8m2es51nBU5ngtkRqz5867b" ||
  addr === "Xugw5ioh98wp1LVbfAM78KptkwBFac5QiE" ||
  addr === "XqLsQdxuGXRPMfAMRwR7qGrtFE2cbdeB23" ||
  addr === "Xc9BxTHE3Wp41BGhYbPohJesZduFrd9dRn" ||
  addr === "XcoYQYXe9g1iKzphoiF3DmPWd67C98UH3h" ||
  addr === "XswCsF6N7YCZQpkQavKMg8ip2caY6nePZB" ||
  addr === "Xtvr9KTqvc7oa7VaZBzbXC2w7ecgfTo1eD" ||
  addr === "XkbiDLUaBy9tcMGHKhAg52BDV4gVoZjUtv" ||
  addr === "XmfTMgDQyDLqNePrkp1ELXGmCDyRgh6spr" ||
  addr === "XazkBM63wQ81De6k25q3sVeyMy3kxjaJ1G" ||
  addr === "XgYpfAbyjBTXA3PDdnKPEY9E1cHJgNW5wD" ||
  addr === "XgKPr8yBtNGN8cQcX2HPQc1SpJWHSnYXPg" ||
  addr === "XmGzpNZmgsm2LbdyBFM9JLJfoYHCJWwr78" ||
  addr === "XtS4XCJ517DV8GyeXZmJc8dySBwpm2GXkB" ||
  addr === "Xcg6P7wfUBG4cAXhpWBWytNarSk2wfurMQ" ||
  addr === "XfrGLUeqxFf92DuegTrGG1KHfD6RWckXQu" ||
  addr === "XqdA1Md2xCNRfW35A9ycyecqQYZgJYetnd" ||
  addr === "XaxWtd7Y1zFd6bMNVSfZMxLZuBncgXpjLf" ||
  addr === "XwjSUpMqwhny2zDSob1eFUw3BxaR6JePXX" ||
  addr === "XyhzBM65QyokptPGNmHrZouppdxFCT1YUi" ||
  addr === "Xv6CSbyeRYD9x46Gk5XGUfsTrKhYULFWi3" ||
  addr === "XcjqmZwsN8Pi6qyVrQWWSE4oJYmTZ7kCT5" ||
  addr === "Xh1e2vhjk9F4eCmp9QH3bhZ7Yn3tCbmdqJ" ||
  addr === "XkJsAtojU5fL1RXYtA7F2CrPKFBH5B4Uid" ||
  addr === "Xm97vUhBUnt3ZfdkuknhYisq5rKxenQGzn" ||
  addr === "XvbL3wi8y71xHAgFxNFJ458zdY8sUvkaTe" ||
  addr === "XcyUgBHcvaKzJsReUpwiiyhTz2NJDd9kXw" ||
  addr === "Xqa7B6ik1444RNAydqhMbWb1wMjaPrThNL" ||
  addr === "XcPwobFMe7TWg39EZohJBBQVZrb5z3aYvR" ||
  addr === "XkGaUzRTPK2j98kjXkJCkME3X1v7PTKtg7" ||
  addr === "XohRyq7bSyBkNXC8V8yvhT3jAbfMswVwiK" ||
  addr === "XpowBm1BWj6PuTRYMQMJKxdp8Erwyb5Kzk" ||
  addr === "XbxerF4mrKZJ3g3Jw6YYzN14of7PnoYWpX" ||
  addr === "Xyhq9qLiTzhjijdPLfk2sP7ex4mkymFwz6" ||
  addr === "XePJRiFVunezxuQTTWLeKh9fvYjg9XzjWY" ||
  addr === "XsmFegNeyjgxpkCrYCkXJp94hYEKR4XxNE" ||
  addr === "XvjmtePbebRyHGVKTaRJL9DGKg5XALW49X" ||
  addr === "XnBEwJfx8eixM6uUtwCifwwcfYfRpcXPoy" ||
  addr === "XfRa7pSA2EHrUAgUDeyY5ihCB5dRC9ELHJ" ||
  addr === "Xgp5e6oGjJD5zggx9A9729ibmCSudxeRqv" ||
  addr === "Xc1NxtW1mbNPx2RvRooHEPCJk5HrPzoaMt" ||
  addr === "XdNNkpLqeCTF7K28urreFfgkjNu2yzYZQb" ||
  addr === "XetK547nMbU2werHqSxSByYyKK4t1QvKy2" ||
  addr === "Xj2TYarumKYWS3uSsMYAwbw5jmZErcrwPX" ||
  addr === "XqYwSG697nKYEsuRZGNNRfJugKGRaoUf9y" ||
  addr === "XhtfSihdtaFXdwVAwxytGiMDRq8LdktsCA" ||
  addr === "XkUJuAZSoL5W92yyVY4s46gXAU3DPRUnNb" ||
  addr === "Xb2TwRsFsyrtMbZScnyYfEDbg7vKbZjXCH" ||
  addr === "XfrscqE9p6mTVaPjw3dhEL6fz54pzMNxtu" ||
  addr === "Xg7D5K25DwoCnLCPMmnEBKVRawpN27xSiZ" ||
  addr === "XmSF3YLzwbgAUKSutMcY2L6AjGnfwMdf4z" ||
  addr === "XoVB1epe5vxd3feHDZHKDNnjcJp792m1ry" ||
  addr === "Xi1iCnjpQi6KS3F6JYJQUCaB6hq8CwVUWC")
  transformed.knownaddress = "Bittrex";
// See https://chainz.cryptoid.info/dash/#!rich
else if (addr === "XtAG1982HcYJVibHxRZrBmdzL5YTzj4cA1" ||
  addr === "XtbJQV8RWC39gMYsVdbRMCwMBDTAYPP99R" ||
  addr === "XdAUmwtig27HBG6WfYyHAzP8n6XC9jESEw" ||
  addr === "XfLDmoktT8Heb599C4tuhpnfj7hvGEzCCg" ||
  addr === "XkWNbbBZHCviDQX8NE1Ga9YEe6737Lt5hT" ||
  addr === "XvwKzdsn46psqy6WhZ2wfhRPyRkD6GL2BG" ||
  addr === "XbtvGzi2JgjYTbTqabUjSREWeovDxznoyh" ||
  addr === "XmbEiJ18q2ntiqk74fXpUY7m6BmGDrT3NU" ||
  addr === "XcKvX5SeAwPSfyiKBw6QKt6EnA9FtWvk1r" ||
  addr === "XxsTca1ATYAuZdCo6E8ePQQovGG5bvayeN" ||
  addr === "XduTu2A3HjVcTgcSSzfFwnZqb6WRWX37pe" ||
  addr === "XxXhd59h44sRdvT3h5t2WXatox8Jhng9ob" ||
  addr === "XfcR4wHQdaMtNibXk5bSuwQqGd5bh8B51S" ||
  addr === "XiuyLbVTwEkonKRokjehjZjZKg6nHfvCuG" ||
  addr === "XggQ9vx7fjZNiv28EfpwGfm6dRfvZFM13Q" ||
  addr === "7jkG9qvVrtfzos1W2VKkox5ScAd7pQUccx" ||
  addr === "XfCxcQZTtGxh2299dfhNFbBb2cJv3Dw57h" ||
  addr === "Xi4AV4soEBcGeS48DT8y83rNG5pQ8vwvHR" ||
  addr === "XcG3dm2sWnkdzDbFgxfa5qw3pjtijmCbVB" ||
  addr === "XtiHGDigSVJKsxQvtV99EmDBbMgdec92qb" ||
  addr === "XsP9RQAqCaFyeuaeu8fcGjynjVaJKT2zR7" ||
  addr === "XkdmZDUAcr6HivQCJ99rpgQJ2MP8sMLrvN" ||
  addr === "XqLEYh2WFAVjvgbLEFdbe5hHhnQYDiDq9g" ||
  addr === "XwckhMP3jcpwLE9QLY2jduFPvzrpZZjJq1" ||
  addr === "XapT1ets8C9QVpYQ5nt5yGTKoMFbmEWR5a" ||
  addr === "XnCNWLPLfC7ybDNN1PH7qNpqRrK2N1uYry" ||
  addr === "XsV3BZ2tnNd3PDdRXnELxoDcc1i1iZpiTh" ||
  addr === "XdareKL9Fx7SKkJCf3A3ude6mt7faM2Twc" ||
  addr === "XcjsEhr3hzxQHRpttwqz3Yui9FQQKfWU1A" ||
  addr === "XgyWsrvEEn2HRaP3Nv66trqzKC86Ghq1uK" ||
  addr === "XeJiAvTAaggjFXVMmTctYJS3Da17rFFQMg" ||
  addr === "XpZiE4UFcrbit7SXhJPGNEepwsnA1M6iwD" ||
  addr === "XwEnAiv3we3cyw6PpcETHXhapVojxzu2DF" ||
  addr === "Xsrif7wjHFpBeQoeBTH7ypZWTm9TVHAPpW" ||
  addr === "XwMxH8QvqWe4XwEg8i2Kdg7XFpiENcvV4r" ||
  addr === "XpuifCt6NyVV3okqW9iQoGrrzn8gtnbD47" ||
  addr === "XtWsxHGANPgSMCLycThkfnZAGFZEMe3iyy" ||
  addr === "Xvcaqfw6rmJZNmUESNQqJ1aEhAMSbEG9KV" ||
  addr === "XttXF4ksfySqNuBRKNvq94pGVKrYN2ZSQG" ||
  addr === "XsEjekQag6VX2bK44Erdt58HBg6Q4J54gZ" ||
  addr === "XwkWHzrh1eVXa4m5ND7YPrC7htgJmTt1G4" ||
  addr === "XgL99x85PcoqLzHwkknTJMXXvtZgtVLHUq" ||
  addr === "Xrxj471GS44z5T6vABf3syocnV9Hef3zsy" ||
  addr === "Xy7hwCrEyi14jMErJap38Drok9qrzzjwdZ" ||
  addr === "XpSb6n51bAp9knuqBgxKPm4rX4dy3rjSjY" ||
  addr === "XuQ7auRqt5aqRsB881AEYjWd4pBuTXgYfR" ||
  addr === "XpveJT9TcPj8hVsuhDoa8yUPkshsg8jqRU" ||
  addr === "Xj2VZih5gvi18zAA3u2DQHmBmeYfv1PHoe" ||
  addr === "XoiawEeCgpzLew4qeZYsE2XziUPBsX3ivp" ||
  addr === "7hsBsvNQ7PdJDpy3yE65cCCtDBpmjFuhaD" ||
  addr === "7gecCsmTSTFM53hhX5gZ29CV55b7KWV4SH" ||
  addr === "7bC9ausqN3ZiJTxg5tqmqkqHnK1a6DvoT2" ||
  addr === "7fFFwQyRETD9pbeKSGptiGX1K2QbKo2vk2" ||
  addr === "7XuBjZSxo2b2aXs5bbzYVZfHAyhmpmNKZy" ||
  addr === "7qjJ5jQDbWgwFQgskTvKoZC2XgthuXPFgu" ||
  addr === "7hywo2ajNrVc1SUPRJGwFsTzwwZAUCuqNs" ||
  addr === "7iMbHNjGeFW7EpbAEkNkzkxnfm4T5TiU5K" ||
  addr === "7SsjkN31SauYyk9qbbtJ5HG5ekDDes8YbL" ||
  addr === "7aCT7f5pju1EcckrSXWWbU191SnJJVJKrj" ||
  addr === "7dwBzq2LAyXBNacmBndtbsz8eynVfWi4nE" ||
  addr === "7orsS3J2UTc2Dnw5BZ3MANcxVkVMyh7jd8" ||
  addr === "7be8KQpnCWv1AiAeqFo5JiQLAKirjZSFZp" ||
  addr === "7SVFKoKx9CPCQ1XRiHFmtjgxTyTNRFVaAC" ||
  addr === "7owB5dtoXxTfcd299X9noFLQNSLmnaXmFx" ||
  addr === "7iZoVXgXAYPHkuPJh5KYPuEWUX14gdMEjs" ||
  addr === "Xb9D8uXTShV66GXH9pvJRhLuuFEK3qdSxY" ||
  addr === "Xb8zJSTiqPWgY8rPcrQacLxy8a6zE66tuz" ||
  addr === "XwzTMqhtav5UCiNxdvP9vJsbgac74Mruqv" ||
  addr === "Xkvqqooqzsn5YbZ5ANRPEHFtPGaLBY3eZB" ||
  addr === "XdgYzUZ9j1w6LWgquzd39jreqFLc3mK7jZ" ||
  addr === "XuqHAeKJT8C1mLCAyjome9tcZ4eqQBw7u2" ||
  addr === "7h3XqDt2Du9xaDMi45qPnPve5UKSFhNGAi" ||
  addr === "XewTPWJw5K38xZ8nio3VSRmzhr2t2hgFgA" ||
  addr === "7mcEycaXLVvHbFvoVAA6AaA8Bedfb4zdho" ||
  addr === "Xs16SXtjBGAVGnTRTXr5qyXj4WNqfZ94Ut" ||
  addr === "XtLg4FJF6xsMjNe4rm5zpWoVqffYzw4L5u" ||
  addr === "Xy7NuQEGDdWfKW95NJqRn8jfLRfCXmTxnX" ||
  addr === "XbvCawHcK4QuWn3Pd7GdwBcQJEKZ2pWdUv" ||
  addr === "Xcb7qKm3g85eH7A1kxDzoejqtM4NyEV738" ||
  addr === "Xp8v31ctxKAte41SUzB8bkHNrz9pjmKVph" ||
  addr === "XkyvtNvWt1kpkAZNUfcYhP7KsbkWgu9y6i" ||
  addr === "7TjoY1Cb5RG1S8DGCnFFZvtcwD3ahcxMHp" ||
  addr === "XjW2EdppmXwyiTpem4pMfna6HaZYZ7MMv5" ||
  addr === "XmQRPANbRKsVF4NAyvesPEYm1mBg8codCH" ||
  addr === "XtWk6fkabqyrVUfGSYfhh84AqZEvrfF2pH" ||
  addr === "Xup3UynFUV7ysWQqN5wzQmNfmbZYnkfCZe" ||
  addr === "XeoegsaFNVKTVUg7dgtjoiVC1zTqJ1hqu8" ||
  addr === "XdkbgSEZ58imrRWQ8BH6ackCjYuUhmJRJm" ||
  addr === "XoWazk9dG4PVmKr9ubmKBqLThqyZvnNotp" ||
  addr === "XmdWbgfCfRV9TMUoG5MigASqNJkv8gwjec" ||
  addr === "XkHLE4itFiHj2XfX2JmK9h4sF1PeDPVHPB" ||
  addr === "Xh2xub27k4hPHFy87D2bVMFqaH2NjiShJy" ||
  addr === "XdUApbRdZF93RqKQHj5zGL5QKxbyHgsa6q" ||
  addr === "Xs9hmz3nXcpMVA3neJyGhED3whkDwHm2xG" ||
  addr === "XwC2gYShFK8txHR4TNzxohNn1udSQjoZoR" ||
  addr === "XiygTcRRKXKXZR46A4yzm5fqn9rXqKnN12" ||
  addr === "Xhn6w9Mw23i4oM9iAnH7BGbof6qj94LAFr" ||
  addr === "Xz27g2VcJ5ZuUYmbvEN82abKwaJrq56SVz" ||
  addr === "XmbaagDtKuKSWbw9tMBC2oarJdoGqrR7Do" ||
  addr === "XcN1FU7ShFBnfyvwYte266WKrbRMS4rZpz")
  transformed.knownaddress = "Top100";
}
TxController.prototype.transformTransaction = function(transaction, options, callback) {
  if (_.isFunction(options)) {
    callback = options;
    options = {};
  }
  $.checkArgument(_.isFunction(callback));

  var confirmations = 0;
  if(transaction.height >= 0) {
    confirmations = this.node.services.essd.height - transaction.height + 1;
  }

  var transformed = {
    txid: transaction.hash,
    version: transaction.version,
  };
  if (transaction.type) {
    transformed.type = transaction.type;
  }
  transformed.locktime = transaction.locktime;
  if (transaction.extraPayloadSize) {
    transformed.extraPayloadSize = transaction.extraPayloadSize;
  }
  if (transaction.extraPayload) {
    transformed.extraPayload = transaction.extraPayload;
  }

  if(transaction.coinbase) {
    transformed.vin = [
      {
        coinbase: transaction.inputs[0].script,
        sequence: transaction.inputs[0].sequence,
        n: 0
      }
    ];
  } else {
    transformed.vin = transaction.inputs.map(this.transformInput.bind(this, options));
  }

  transformed.vout = transaction.outputs.map(this.transformOutput.bind(this, options));

  transformed.blockhash = transaction.blockHash;
  transformed.blockheight = transaction.height;
  transformed.confirmations = confirmations;
  // TODO consider mempool txs with receivedTime?
  var time = transaction.blockTimestamp ? transaction.blockTimestamp : Math.round(Date.now() / 1000);
  transformed.time = time;
  if (transformed.confirmations) {
    transformed.blocktime = transformed.time;
  }

  if(transaction.coinbase) {
    transformed.isCoinBase = true;
  }

  transformed.valueOut = transaction.outputSatoshis / 1e8;
  transformed.size = transaction.hex.length / 2; // in bytes
  if (!transaction.coinbase) {
    transformed.valueIn = transaction.inputSatoshis / 1e8;
    transformed.fees = transaction.feeSatoshis / 1e8;
  }

  transformed.txlock = transaction.txlock;
  if (transformed.vout.length >= 1 && transformed.vout[0].scriptPubKey && transformed.vout[0].scriptPubKey.asm && transformed.vout[0].scriptPubKey.asm.includes("OP_RETURN")) {
    var hex = transformed.vout[0].scriptPubKey.asm.replace("OP_RETURN ", "");
    var message = '';
    for (var n = 0; n < hex.length; n += 2) {
      message += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    transformed.op_return_message = message;
  }
  for (var i = 0; i < transformed.vin.length; i++) {
    var input = transformed.vin[i];
    this.tryToFindKnownAddress(input.addr, transformed);
  }
  for (var i = 0; i < transformed.vout.length; i++) {
    var output = transformed.vout[i];
    if (output.scriptPubKey && output.scriptPubKey.addresses && output.scriptPubKey.addresses.length > 0)
      this.tryToFindKnownAddress(output.scriptPubKey.addresses[0], transformed);
  }

  if (transaction.proRegTx !== undefined) {
    transformed.proRegTx = transaction.proRegTx;
  }
  if (transaction.proUpServTx !== undefined) {
    transformed.proUpServTx = transaction.proUpServTx;
  }
  if (transaction.proUpRegTx !== undefined) {
    transformed.proUpRegTx = transaction.proUpRegTx;
  }
  if (transaction.proUpRevTx !== undefined) {
    transformed.proUpRevTx = transaction.proUpRevTx;
  }
  if (transaction.cbTx !== undefined) {
    transformed.cbTx = transaction.cbTx;
  }
  if (transaction.qcTx !== undefined) {
    transformed.qcTx = transaction.qcTx;
  }

  callback(null, transformed);
};

TxController.prototype.transformInput = function(options, input, index) {
  // Input scripts are validated and can be assumed to be valid
  var transformed = {
    txid: input.prevTxId,
    vout: input.outputIndex,
    sequence: input.sequence,
    n: index
  };

  if (!options.noScriptSig) {
    transformed.scriptSig = {
      hex: input.script
    };
    if (!options.noAsm) {
      transformed.scriptSig.asm = input.scriptAsm;
    }
  }

  transformed.addr = input.address;
  transformed.valueSat = input.satoshis;
  transformed.value = input.satoshis / 1e8;
  transformed.doubleSpentTxID = null;
  return transformed;
};

TxController.prototype.transformOutput = function(options, output, index) {
  var transformed = {
    value: (output.satoshis / 1e8).toFixed(8),
    n: index,
    scriptPubKey: {
      hex: output.script
    }
  };

  if (!options.noAsm) {
    transformed.scriptPubKey.asm = output.scriptAsm;
  }

  if (!options.noSpent) {
    transformed.spentTxId = output.spentTxId || null;
    transformed.spentIndex = _.isUndefined(output.spentIndex) ? null : output.spentIndex;
    transformed.spentHeight = output.spentHeight || null;
  }

  if (output.address) {
    transformed.scriptPubKey.addresses = [output.address];
    var address = dashcore.Address(output.address); //TODO return type from essx-node
    transformed.scriptPubKey.type = address.type;
  }
  return transformed;
};

TxController.prototype.transformInvTransaction = function(transaction) {
  var self = this;

  var valueOut = 0;
  var vout = [];
  for (var i = 0; i < transaction.outputs.length; i++) {
    var output = transaction.outputs[i];
    valueOut += output.satoshis;
    if (output.script) {
      var address = output.script.toAddress(self.node.network);
      if (address) {
        var obj = {};
        obj[address.toString()] = output.satoshis;
        vout.push(obj);
      }
    }
  }

  var transformed = {
    txid: transaction.hash,
    valueOut: valueOut / 1e8,
    vout: vout,
    vin: transaction.inputs,
    //isRBF: isRBF,/*unused: var isRBF = _.some(_.map(transaction.inputs, 'sequenceNumber'), function(seq) { return seq < MAXINT - 1; });*/
    version: transaction.version,
    type: transaction.type,
    txlock: transaction.txlock
  };
  for (var i = 0; i < transaction.outputs.length; i++) {
    var output = transaction.outputs[i];
    if (output.script) {
      var address = output.script.toAddress(self.node.network);
      if (address)
        this.tryToFindKnownAddress(address, transformed);
    }
  }
  return transformed;
};

TxController.prototype.rawTransaction = function(req, res, next) {
  var self = this;
  var txid = req.params.txid;

  this.node.getTransaction(txid, function(err, transaction) {
    if (err && err.code === -5) {
      return self.common.handleErrors(null, res);
    } else if(err) {
      return self.common.handleErrors(err, res);
    }

    req.rawTransaction = {
      'rawtx': transaction.toBuffer().toString('hex')
    };

    next();
  });
};

TxController.prototype.showRaw = function(req, res) {
  if (req.rawTransaction) {
    res.jsonp(req.rawTransaction);
  }
};

TxController.prototype.list = function(req, res) {
  var self = this;

  var blockHash = req.query.block;
  var address = req.query.address;
  var page = parseInt(req.query.pageNum) || 0;
  var pageLength = 10;
  var pagesTotal = 1;

  if(blockHash) {
    self.node.getBlockOverview(blockHash, function(err, block) {
      if(err && err.code === -5) {
        return self.common.handleErrors(null, res);
      } else if(err) {
        return self.common.handleErrors(err, res);
      }

      var totalTxs = block.txids.length;
      var txids;

      if(!_.isUndefined(page)) {
        var start = page * pageLength;
        txids = block.txids.slice(start, start + pageLength);
        pagesTotal = Math.ceil(totalTxs / pageLength);
      } else {
        txids = block.txids;
      }

      async.mapSeries(txids, function(txid, next) {
        self.node.getDetailedTransaction(txid, function(err, transaction) {
          if (err) {
            return next(err);
          }
          self.transformTransaction(transaction, next);
        });
      }, function(err, transformed) {
        if(err) {
          return self.common.handleErrors(err, res);
        }

        res.jsonp({
          pagesTotal: pagesTotal,
          txs: transformed
        });
      });

    });
  } else if(address) {
    var options = {
      from: page * pageLength,
      to: (page + 1) * pageLength
    };

    self.node.getAddressHistory(address, options, function(err, result) {
      if(err) {
        return self.common.handleErrors(err, res);
      }

      var txs = result.items.map(function(info) {
        return info.tx;
      }).filter(function(value, index, self) {
        return self.indexOf(value) === index;
      });

      async.map(
        txs,
        function(tx, next) {
          self.transformTransaction(tx, next);
        },
        function(err, transformed) {
          if (err) {
            return self.common.handleErrors(err, res);
          }
          res.jsonp({
            pagesTotal: Math.ceil(result.totalCount / pageLength),
            txs: transformed
          });
        }
      );
    });
  } else {
    return self.common.handleErrors(new Error('Block hash or address expected'), res);
  }
};

TxController.prototype.send = function(req, res) {
  var self = this;
	if(_.isUndefined(req.body.rawtx)){
		return self.common.handleErrors({
			message:"Missing parameter (expected 'rawtx' a string)",
			code:1
		}, res);
	}
  if(!_.isUndefined(req.body.isArray) && req.body.isArray === true){
    let txs = JSON.parse(req.body.rawtx)
    async.concat(txs,  this.node.sendTransaction,function(err, txid) {
      if (err) {
        console.log('ERROR IN ARRAY', err)
          return self.common.handleErrors(err, res);
        }
      res.json({'txid': txid});
    })
  } else {
	this.node.sendTransaction(req.body.rawtx, function(err, txid) {
      if(err) {
        console.log('ERR FROM RAWTX', err)
        // TODO handle specific errors
        return self.common.handleErrors(err, res);
      }

      res.json({'txid': txid});
	});
  }
};
//Handler for InstantSend
TxController.prototype.sendix = function(req, res) {
	var self = this;
	if(_.isUndefined(req.body.rawtx)){
		return self.common.handleErrors({
			message:"Missing parameter (expected 'rawtx' a string)",
			code:1
		}, res);
	}
	var options = {allowAbsurdFees: false, isInstantSend: true};
	this.node.sendTransaction(req.body.rawtx, options, function(err, txid) {
		if(err) {
			// TODO handle specific errors
			return self.common.handleErrors(err, res);
		}
		res.json({'txid': txid});
	});
};
module.exports = TxController;
