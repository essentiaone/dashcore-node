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
  $scope.activeTab = 'Mercury';

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
    $scope.nodesList = filtered;
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
      var initMn = $scope.activeTab.toUpperCase() === 'MARS' ? 300000 : 100000;
      var allocated = initMn;
      for (var tier in tiers) {
          if (tier === 'MARS') {
              allocated += 300000 * tiers[tier].count;
          } else if (tier === 'MERCURY') {
              allocated += 100000 * tiers[tier].count;
          }
      }
      return allocated / initMn;
  };

  $scope.getMnWorth = function(price) {
      return price * ($scope.activeTab.toUpperCase() === 'STAKING' ?
          10000 : $scope.activeTab.toUpperCase() === 'MARS' ? 300000 : 100000);
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

    Masternodes.get().$promise
      .then(function (res) {
        $scope.loading = false;
        $scope.nodes = res.list;
        $scope.totalCount = $scope.nodes.length;
        $scope.initCurrentPage();
        $scope.getTier();
      }).catch(function (error) {
        $scope.loading = false;
        if(error) {
          $scope.error = error;
        } else {
          $scope.error = 'No error message given (connection error?)';
        }
      });
  };
  $scope.changeTab = function (tab){
    $scope.activeTab = tab;
  };
});
