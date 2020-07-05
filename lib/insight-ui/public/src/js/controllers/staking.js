'use strict';

angular.module('insight.staking').controller('StakingController',
  function($scope, Masternodes, Coingecko, Status) {
  $scope.isStatsLoaded = false;
  $scope.mnTotalAllocated = 100000;
  $scope.stakingTotalAllocated = 10000000;
  $scope.currentMnReward = 0;
  $scope.currentStakingReward = 0;

  $scope.marsCount = null;
  $scope.mercuryCount = null;
  $scope.stakedCoins = null;
  $scope.equipmentCost = null;

  $scope.dailyReward = 0;
  $scope.dailyRoi = 0;
  $scope.dailyFiatReward = 0;

  $scope.calculateRewards = function () {
    if (false === $scope.isStatsLoaded) {
      console.log('stats is not loaded yet, trying to load...');
      $scope.loadStats();
    }

    $scope.dailyReward = 0;

    var allocatedMnByUser = ($scope.marsCount > 0 ? $scope.marsCount * 300000 : 0) +
        ($scope.mercuryCount > 0 ? $scope.mercuryCount * 100000 : 0);

    if (allocatedMnByUser > 0) {
      $scope.dailyReward += $scope.calculateMnDailyReward(allocatedMnByUser);
    }

    if ($scope.stakedCoins > 0) {
      $scope.dailyReward += $scope.calculateStakingDailyReward();
    }

    var dailyEquipmentCost = 0;
    if ($scope.equipmentCost > 0) {
      dailyEquipmentCost = ($scope.equipmentCost / 30);
    }

    if ($scope.dailyReward !== 0) {
      $scope.dailyRoi = $scope.dailyReward /
          (allocatedMnByUser + $scope.stakedCoins + (dailyEquipmentCost / $scope.coinPrice)) * 100;
      $scope.dailyFiatReward = $scope.dailyReward * $scope.coinPrice - dailyEquipmentCost;
    } else {
      $scope.dailyRoi = 0;
      $scope.dailyFiatReward = 0;
    }

    console.log('calculated result reward: ' + $scope.dailyReward);
  };

  $scope.calculateMnDailyReward = function(allocatedByUser) {
    var reward = ((allocatedByUser / $scope.mnTotalAllocated) * $scope.currentMnReward) * 60 * 24;
    console.log('calculateMnDailyReward allocatedByUser ' + allocatedByUser);
    console.log('calculateMnDailyReward: ' + reward);
    return reward;
  };

  $scope.calculateStakingDailyReward = function() {
    var reward = (($scope.stakedCoins / $scope.stakingTotalAllocated) * $scope.currentStakingReward) * 60 * 24;
    console.log('calculateStakingDailyReward: ' + reward);
    return reward;
  };

  $scope.loadStats = function () {
    $scope.isStatsLoaded = false;

    $scope.setMnTotalAllocated();
    $scope.setStakingTotalAllocated();
    $scope.setCoinPrice();
    $scope.setCurrentRewards();

    $scope.isStatsLoaded = true;
  };

  $scope.setMnTotalAllocated = function () {
    Masternodes.get().$promise
      .then(function (res) {
        var mnTotalAllocated = 0;
        console.log(res);
        res.list.forEach(function(it) {
          if (it.tier === 'MARS') {
            mnTotalAllocated += 300000;
          } else if (it.tier === 'MERCURY') {
            mnTotalAllocated += 100000;
          }
        });
        if (0 === mnTotalAllocated) {
          mnTotalAllocated = 100000;
        }
        $scope.mnTotalAllocated = mnTotalAllocated;
        console.log('mnTotalAllocated: ' + mnTotalAllocated);
    }).catch(function (error) {
      if(error) {
        $scope.error = error;
      } else {
        $scope.error = 'Error during request masternodes data';
      }
    });

    $scope.setStakingTotalAllocated = function () {
      $scope.stakingTotalAllocated = 10000000;
      console.log('stakingTotalAllocated: ' + $scope.stakingTotalAllocated);
    };

    $scope.setCoinPrice = function () {
       Coingecko.query().$promise
        .then(function (res) {
          $scope.coinPrice = res[0].current_price;
          console.log('coinPrice: ' + $scope.coinPrice);
        })
        .catch(function (error) {
          if (error) {
            $scope.error = error;
          } else {
            $scope.error = 'Error during request coin data';
          }
        });
    };

    $scope.setCurrentRewards = function() {
      var blockHeight = 0;
      Status.get({q: 'getInfo'}).$promise
        .then(function (res) {
          blockHeight = res.info.blocks;
          $scope.currentMnReward = $scope.getCurrentReward(blockHeight, 0.45);
          $scope.currentStakingReward = $scope.getCurrentReward(blockHeight, 0.38);
          console.log('blockHeight: ' + blockHeight);
        })
        .catch(function (e) {
          $scope.error = 'API ERROR: ' + e.data;
        });

    };

    $scope.getCurrentReward = function(blocks, coef) {
      var reward = 0;
      if (0 < blocks && 525600 >= blocks) {
        reward = 190 * coef;
      } else if (525600 < blocks && 1051200 >= blocks) {
        reward = 167 * coef;
      } else if (1051200 < blocks && 1576800 >= blocks) {
        reward = 142 * coef;
      } else if (1576800 < blocks && 2102400 >= blocks) {
        reward = 117 * coef;
      } else if (2102400 < blocks && 2628000 >= blocks) {
        reward = 92 * coef;
      } else if (2628000 < blocks && 3153600 >= blocks) {
        reward = 75 * coef;
      } else if (3153600 < blocks && 3679200 >= blocks) {
        reward = 50 * coef;
      }
      // console.log('getCurrentReward blocks: ' + blocks + ' coef: ' + coef + ' reward: ' + reward);
      return reward;
    };
  };
});
