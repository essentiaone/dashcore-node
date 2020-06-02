'use strict';

angular.module('insight.masternodes').controller('MasternodesController',
  function($scope, Masternodes, Coingecko, Status) {
  $scope.loading = false;
  $scope.innerPageRange = 2;
  $scope.length = 10;
  $scope.tiers = [];
  $scope.tierFilter = 'All';
  $scope.statusFilter = 'All';
  $scope.transactionHashFilter = '';
  $scope.addressFilter = '';
  $scope.filtered = [];

  $scope.search = function () {
    var value = $scope.q;

    if (!value) {
      $scope.setCurrentPage(1);
    }

    var searchRes = $scope.nodes.filter(function (node) {
      return ~node.txhash.indexOf(value) || ~node.addr.indexOf(value);
    });
    $scope.searchRes = searchRes;

    if (searchRes.length) {
      $scope.nodesList = searchRes;
    }
  };

  $scope.applyFilter = function () {
    var tier = $scope.tierFilter;
    var status = $scope.statusFilter;
    var transactionHashFilter = $scope.transactionHashFilter;
    var addressFilter = $scope.addressFilter;

    console.log(tier);
    console.log(status);
    console.log(transactionHashFilter);
    console.log(addressFilter);

    if (tier.toUpperCase() !== 'ALL' ||
        status.toUpperCase() !== 'ALL' ||
        !transactionHashFilter ||
        !addressFilter
    ) {
      $scope.setCurrentPage(1);
    }

    var filtered = $scope.nodes.filter(function (node) {
      if (tier.toUpperCase() === 'ALL') {
          return node;
      }
      if (node.tier === tier.toUpperCase()) {
        return node;
      }
    });

    filtered = filtered.filter(function (node) {
      if (status.toUpperCase() === 'ALL') {
          return node;
      }
      if (node.status === status.toUpperCase()) {
          return node;
      }
    });

    filtered = filtered.filter(function (node) {
      if (node.txhash.startsWith(transactionHashFilter)) {
        return node;
      }
    });

    filtered = filtered.filter(function (node) {
      if (node.addr.startsWith(addressFilter)) {
        return node;
      }
    });

    $scope.searchRes = filtered;
    console.log('filtered length: ', filtered.length);
    $scope.nodesList = filtered;

    // $scope.totalCount = $scope.nodesList.length;
    // $scope.initCurrentPage();
  };

  var toUTCDate = function(date){
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  };

  var millisToUTCDate = function(millis){
    if (millis === 0) {
      return null;
    }
    return toUTCDate(new Date(millis* 1000));
  };

  $scope.differenceTime = function(value) {
    var hours = value / 60 / 60

    return hours ? Math.round(hours) + ' hours': 'less than an hour';
  };

  $scope.millisToUTCDate = millisToUTCDate;

  $scope.initCurrentPage = function () {
    var length = $scope.length;

    $scope.totalPages = Math.ceil($scope.nodes.length / length);
    $scope.currentPage = 1;

    $scope.generatePages();
    $scope.generatePagesNodes();
  };

  $scope.generatePages = function() {
    var pages = [];

    for (var i = $scope.rangeStart(); i <= $scope.rangeEnd(); i++) {
      pages.push({
        page: i,
      });
    }

    $scope.pages = pages;
  };

  $scope.generatePagesNodes = function () {
    var pagesNodes = [];

    for (var i = 0; i < $scope.totalPages; i++) {
      var start = i * $scope.length;
      var end = start + $scope.length;

      var pageNodes = (i === $scope.totalPages) ? $scope.nodes.slice(start) : $scope.nodes.slice(start, end);
      pagesNodes.push(pageNodes);
    }
    $scope.pagesNodes = pagesNodes;
    $scope.nodesList = $scope.pagesNodes[0];
  };

  $scope.rangeStart = function ()  {
    var currentPage = $scope.currentPage;

    var start = currentPage - $scope.innerPageRange;

    if (start > 1 && start < currentPage) {
      return start;
    } else {
      return 1;
    }
  };

  $scope.rangeEnd = function () {
    var end = $scope.currentPage + $scope.innerPageRange;

    if (end < $scope.totalPages) {
      return end;
    } else {
      return $scope.totalPages;
    }
  };

  $scope.setCurrentPage = function(page) {
    $scope.currentPage = page;
    $scope.generatePages();
    $scope.nodesList = $scope.pagesNodes[page-1];
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  $scope.getTier = function () {
    var tiers = {}

    $scope.nodes.forEach(function(it) {
      var key = it.tier;

      if (tiers[key]) {
        tiers[key].count++;
      } else {
        tiers[key] = {
          key: key,
          count: 1
        };
      }
    });

    $scope.tiers = tiers;
  };

  $scope.getDailyIncome = function(blocks, tiers) {
      return 1440 / $scope.getRewardFrequency(tiers) * $scope.getCurrentReward(blocks);
  };

  $scope.getCurrentReward = function(blocks) {
      var mnReward = 0;
      var mnCoef = 0.45;
      if (0 < blocks && 525600 >= blocks) {
          mnReward = 190 * mnCoef;
      } else if (525600 < blocks && 1051200 >= blocks) {
          mnReward = 167 * mnCoef;
      } else if (1051200 < blocks && 1576800 >= blocks) {
          mnReward = 142 * mnCoef;
      } else if (1576800 < blocks && 2102400 >= blocks) {
          mnReward = 117 * mnCoef;
      } else if (2102400 < blocks && 2628000 >= blocks) {
          mnReward = 92 * mnCoef;
      } else if (2628000 < blocks && 3153600 >= blocks) {
          mnReward = 75 * mnCoef;
      } else if (3153600 < blocks && 3679200 >= blocks) {
          mnReward = 50 * mnCoef;
      }
      return mnReward;
  };

  $scope.getPaidRewards = function(blocks) {
    var paid = 0;
    var mnCoef = 0.45;

    if (0 < blocks && 525600 >= blocks) {
      paid += blocks * 190;
    } else if (525600 < blocks && 1051200 >= blocks) {
      paid += 525600 * 190;
      paid += (1051200 - blocks) * 167;
    } else if (1051200 < blocks && 1576800 >= blocks) {
      paid += 525600 * 190;
      paid += (1051200 - 525600) * 167;
      paid += (1576800 - blocks) * 142;
    } else if (1576800 < blocks && 2102400 >= blocks) {
      paid += 525600 * 190;
      paid += (1051200 - 525600) * 167;
      paid += (1576800 - 1051200) * 142;
      paid += (2102400 - blocks) * 117;
    } else if (2102400 < blocks && 2628000 >= blocks) {
      paid += 525600 * 190;
      paid += (1051200 - 525600) * 167;
      paid += (1576800 - 1051200) * 142;
      paid += (2102400 - 1576800) * 117;
      paid += (2628000 -blocks) * 92;
    } else if (2628000 < blocks && 3153600 >= blocks) {
      paid += 525600 * 190;
      paid += (1051200 - 525600) * 167;
      paid += (1576800 - 1051200) * 142;
      paid += (2102400 - 1576800) * 117;
      paid += (2628000 - 2102400) * 92;
      paid += (3153600 - blocks) * 75;
    } else if (3153600 < blocks && 3679200 >= blocks) {
      paid += 525600 * 190;
      paid += (1051200 - 525600) * 167;
      paid += (1576800 - 1051200) * 142;
      paid += (2102400 - 1576800) * 117;
      paid += (2628000 - 2102400) * 92;
      paid += (3153600 - 2628000) * 75;
      paid += (3679200 - blocks) * 50;
    } else {
      paid += 525600 * 190;
      paid += (1051200 - 525600) * 167;
      paid += (1576800 - 1051200) * 142;
      paid += (2102400 - 1576800) * 117;
      paid += (2628000 - 2102400) * 92;
      paid += (3153600 - 2628000) * 75;
      paid += (3679200 - 3153600) * 50;
    }

    return paid * mnCoef;
  };

  $scope.getRewardFrequency = function(tiers) {
      var allocated = 100000;
      for (var tier in tiers) {
          if (tier === 'MARS') {
              allocated += 300000 * tiers[tier].count;
          } else if (tier === 'MERCURY') {
              allocated += 100000 * tiers[tier].count;
          }
      }
      return allocated / 100000;
  };

  $scope.getMnWorth = function(price) {
      return price * 100000;
  };

  $scope.list = function() {
    $scope.loading = true;

    Status.get({q: 'getInfo'}).$promise
      .then(function (res) {
        $scope.blockchainInfo = res.info;
      })
      .catch(function (e) {
        $scope.error = 'API ERROR: ' + e.data;
      });

    Coingecko.query().$promise
        .then(function (res) {
          $scope.coinData = res[0];
        })
        .catch(function (error) {
          if (error) {
            $scope.error = error;
          } else {
            $scope.error = 'No error message given (connection error?)';
          }
        });

    // Masternodes.get().$promise
    //   .then(function (res) {
        var res = {
          'list': [
            {
              'network': 'ipv4',
              'txhash': '47c541bee964b6a13e11721b33a3c8cf1ebb9e290ae1970a1db77baf6dffd796',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DMFxE63Lzids6Zu5us9EnJidNfUz31HKhq',
              'version': 70916,
              'lastseen': 1591045742,
              'activetime': 4544230,
              'lastpaid': 1591042785,
              'tier': 'MARS'
            }, {
              'network': 'ipv4',
              'txhash': '70951e512d366a9744982d72ae6de56fa05ae5fc1fd1e24ef44956540ef89552',
              'outidx': 0,
              'status': 'EXPIRED',
              'addr': 'DT259pVThYN4hwCpr4CeJCR9uwE2pQNbci',
              'version': 70916,
              'lastseen': 1591045403,
              'activetime': 2295206,
              'lastpaid': 1591042283,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '0e28b99e79b428d9240db72dc2b4a76379aaa4d4bc5202d7806da7a09ec03b3d',
              'outidx': 1,
              'status': 'EXPIRED',
              'addr': 'D5vsq5sZEdvExEKpvxRn1cYSdeVwqs984e',
              'version': 70916,
              'lastseen': 1591045772,
              'activetime': 2730409,
              'lastpaid': 1591042360,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '4c95a822bc71fb33762a2740f82327d10c71bfe7051be0aeb475f1abd0c03c21',
              'outidx': 1,
              'status': 'EXPIRED',
              'addr': 'DPHCkVRhKFWCGGSnG8x8GkasXK8E41bRd7',
              'version': 70916,
              'lastseen': 1591045572,
              'activetime': 1748401,
              'lastpaid': 1591042493,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': 'a131a200eb39ccebec47ebaf6d52aa55c1083b071b587304c3ff206d009e4e5c',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DRdxU6Nm7eRFNK45wEzygKnWzPWEeCvs9z',
              'version': 70916,
              'lastseen': 1591045777,
              'activetime': 1650321,
              'lastpaid': 1591041581,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': 'cf0703c30f471c84d2b80333a230e67cd478d610ec4cd9b4121945cbf9bc2baa',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'DJZBSg7u42nhQjViX9B5B2dvCD6TxJFW3o',
              'version': 70916,
              'lastseen': 1591041171,
              'activetime': 14713432,
              'lastpaid': 1591042322,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': 'e4558b81637f3d3cf7e282fe1e70555266796029b46dd1b32dc2b029f1f89b8e',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DLWceqsbsgcMNn2ZBFgHRXMVd8jrD3JQSu',
              'version': 70916,
              'lastseen': 1591041210,
              'activetime': 14722846,
              'lastpaid': 1591042342,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '720037639355f18700532d3635270fafb660fd4fd77cc0c5e8451e11c3b8661b',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DKZACRGVF6vZf9qd8rgLXe5Roqw7HfY6mr',
              'version': 70916,
              'lastseen': 1591041527,
              'activetime': 14716664,
              'lastpaid': 0,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '904ad87cf3798ec1211aa98f5ca25b4423b03aa588a01606f7b5858693270af9',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DGSLqXNhvzpRrx7hVk6me2taDteVppsFMY',
              'version': 70916,
              'lastseen': 1591041527,
              'activetime': 14723158,
              'lastpaid': 1591042350,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '4bd03465417dbc89db28d31f5ce5509c46f002e5cfda9246dedba185d4459487',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'DR5qbGETVBLDKATYTizaXuN6r2GnH7xCeD',
              'version': 70916,
              'lastseen': 1591041554,
              'activetime': 14702693,
              'lastpaid': 1591042356,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '3f01a6f81b8023b974903cfa7eeb3b99f608762510a39691bfc0a6da4dd1b554',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'DBxXbS4v9NWo3Dt9NgMTnccmphFEPF1a6e',
              'version': 70916,
              'lastseen': 1591041856,
              'activetime': 14697827,
              'lastpaid': 1591043240,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '6916fb5899aebb37df082fb80a8098a62d26a8f302fe806736f32d6771421ed1',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DNo5Z7YBZoFEedxtcmTB8zr6bh3Pa4hA62',
              'version': 70916,
              'lastseen': 1591041590,
              'activetime': 9954283,
              'lastpaid': 0,
              'tier': 'MARS'
            }, {
              'network': 'ipv4',
              'txhash': 'fbddc47fb7d892d4d1abc03306fee5864958a06907078f3eeb2244f54a87cce2',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DCggCDtB7xFhqXAUL4oaD6u3MtuGewkonQ',
              'version': 70916,
              'lastseen': 1591041883,
              'activetime': 3592070,
              'lastpaid': 1591042426,
              'tier': 'MARS'
            }, {
              'network': 'ipv4',
              'txhash': '347448d7e8a1be3a8cc2d64300c3089a3132f3c957f1e9f15f0d7a68af22f45d',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DEWifPRRBWsuFmdZnxm1nGYd9dptw2cv8m',
              'version': 70916,
              'lastseen': 1591041612,
              'activetime': 3027126,
              'lastpaid': 0,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': 'b6bb8a3daacc51348008f9287da556da9cc03cbe07c9f27f42b98bf5785d7114',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'DCp1xwrZ4xFfJMxX7WEWct5iq1aHiUJkAb',
              'version': 70916,
              'lastseen': 1591041858,
              'activetime': 2413666,
              'lastpaid': 0,
              'tier': 'MARS'
            }, {
              'network': 'ipv4',
              'txhash': '17201edc9981601ea4b7d3b3cf0827e6efebf5b8ee301a24dc6ae8eec92bb245',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'D9cESMG6nHiBBTZAq6MCHgb6VEEqsgeEvQ',
              'version': 70916,
              'lastseen': 1591041883,
              'activetime': 9711302,
              'lastpaid': 0,
              'tier': 'MARS'
            }, {
              'network': 'ipv4',
              'txhash': '9f33d8df1095733007efd82b3db8035560437d4a7c246063ccbed2df891c30f3',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'D6tgfhD9o58By9WZg4C13vfvAjRFVeTD2x',
              'version': 70916,
              'lastseen': 1591041967,
              'activetime': 1946014,
              'lastpaid': 0,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '725d010f97f5abd77ba2ab4687ffd9abd3ead96cbae6606bd6e468fe5aee8eb2',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'DTtoSmKMHY7J1TDR6C6f4dNiv3w4ecJbnk',
              'version': 70916,
              'lastseen': 1591041933,
              'activetime': 10045525,
              'lastpaid': 0,
              'tier': 'MARS'
            }, {
              'network': 'ipv4',
              'txhash': '4f88e3c2c9091bdd88ca3418e27e6dddf7330045ad9fe4d766962bcad8d44552',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DGV9iDB1di5SaYyg4GuhD1g3mpczq5YQLN',
              'version': 70916,
              'lastseen': 1591041929,
              'activetime': 10114009,
              'lastpaid': 0,
              'tier': 'MARS'
            }, {
              'network': 'ipv4',
              'txhash': 'a737514ea5eb3bbafe24324b1d930535d2c0cfabbac690953dc30589bad4cf96',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'D5YyxRh48ftWoBA55jZ8B9HMBwJVCc3VDp',
              'version': 70916,
              'lastseen': 1591041810,
              'activetime': 3399903,
              'lastpaid': 0,
              'tier': 'MARS'
            }, {
              'network': 'ipv4',
              'txhash': '69e42c5d24ffdb2b74e0f505b4bba8703220ce0aa381c548c50cd3dc67ecda53',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'DLUzGKGs1aKbXjjEdQJzxrwdG3EKgMWqJa',
              'version': 70916,
              'lastseen': 1591041466,
              'activetime': 5128723,
              'lastpaid': 0,
              'tier': 'MARS'
            }, {
              'network': 'ipv4',
              'txhash': '8dff280dee86e8f33a7d89459f2c00f957e963b3a0cde95d50bfaf63f1b5c80d',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'D6tgfhD9o58By9WZg4C13vfvAjRFVeTD2x',
              'version': 70916,
              'lastseen': 1591041922,
              'activetime': 4617381,
              'lastpaid': 0,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '106b94cba49af4e9830115cc74a799158002e32f0a3b7b617caa3063037353ec',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'DNuNcZkfTCCiUd9ADhL9CtfTr4QMdAxktr',
              'version': 70916,
              'lastseen': 1591041909,
              'activetime': 4617256,
              'lastpaid': 0,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': 'abd7f3221a5464a7f631df78375d6378b87f81635117889b95dae08a3b9112c8',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'D8B8bbg1M54jVHKbosmU1Po7dQ3n82KgWE',
              'version': 70916,
              'lastseen': 1591041731,
              'activetime': 4089823,
              'lastpaid': 0,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '5a29e6784a51d6c82341f543766b0fcd4d48e6d03162443e217e1f4243b8f058',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'DTv7t9qmKKZoGajZnWuPnY6f6vjbUzfAwu',
              'version': 70916,
              'lastseen': 1591041550,
              'activetime': 3637741,
              'lastpaid': 0,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': 'dc1bbfefe0438d28186dab84f5d233dc948568ec283e00593410717d751cf4ed',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DSeDf7pQE4AQ61wcFx5diCPWdxhkzT8tXB',
              'version': 70916,
              'lastseen': 1591039765,
              'activetime': 14697541,
              'lastpaid': 1591044753,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '30efad5ec66a9bedb8c6a1b885b1ee74ae231a4a0953d1bca9f8403dad90509c',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DK6TeR3EfSneWQvPpB49jTs6JGRb7d5ZV3',
              'version': 70916,
              'lastseen': 1591041733,
              'activetime': 701064,
              'lastpaid': 0,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '71aba9550a2208a651beff01cf58c5e88ce4b91fb28907e584804df33b4907bf',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DTL1uY3NYSQsW4AqjYEsA7n4ZXv2kEHzJ5',
              'version': 70916,
              'lastseen': 1591041707,
              'activetime': 696379,
              'lastpaid': 0,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '8afeb975f184eeacc995b03bfd12499d335c7e3d20f228d623aa1c286451f101',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'DNGNMnHAgpatf3iDKHZeD6rwHt1wxceT8o',
              'version': 70916,
              'lastseen': 1591040204,
              'activetime': 14720349,
              'lastpaid': 1591042747,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '2c5720401cdefa80c5179e3520c8a8795c68c459a8d662aa191077551c08ac7a',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DNGh3YcBeBcmKK5PGc6ubTiSqVYCYkUe7s',
              'version': 70916,
              'lastseen': 1591041673,
              'activetime': 432183,
              'lastpaid': 0,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '5f6f5a264d21580978ef45335f9930db9469469680034ce8628464981aa70790',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'DR2geQfZhJqSZKChP7QN2osEJRw5eeHQ5R',
              'version': 70916,
              'lastseen': 1591039804,
              'activetime': 14702459,
              'lastpaid': 0,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '3ef1307219da57ecdff4688df688943f33d7ef5aa8ef9d0cf9442fdb97a7d164',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'DPHCkVRhKFWCGGSnG8x8GkasXK8E41bRd7',
              'version': 70916,
              'lastseen': 1591041954,
              'activetime': 432457,
              'lastpaid': 1591042424,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': '460340e01dca5a78956ba2aaff711d2396fb16c7fffb5492fe883900f31e721a',
              'outidx': 1,
              'status': 'ENABLED',
              'addr': 'DU6eyXsyGhZ94fKHKD4VQfXLPHWDh8i4JK',
              'version': 70916,
              'lastseen': 1591042000,
              'activetime': 3632299,
              'lastpaid': 0,
              'tier': 'MERCURY'
            }, {
              'network': 'ipv4',
              'txhash': 'b38ec2a55f7ba61817edfb342377a554f2f50fd8d6a9de067e6bd7cf2bf6d4b7',
              'outidx': 0,
              'status': 'ENABLED',
              'addr': 'D5Jn2FKFvRqeSdZfVYN8DAbrNoGBiXdPPN',
              'version': 70916,
              'lastseen': 1591042361,
              'activetime': 5957314,
              'lastpaid': 0,
              'tier': 'MARS'
            }]
        };
        $scope.loading = false;
        $scope.nodes = res.list;
        $scope.totalCount = $scope.nodes.length;
        $scope.initCurrentPage();
        $scope.getTier();
      // });
      // .catch(function (error) {
      //   $scope.loading = false;
      //   if(error) {
      //     $scope.error = error;
      //   } else {
      //     $scope.error = 'No error message given (connection error?)';
      //   }
      // });
  };
});
