'use strict';

angular.module('insight.staking').controller('StakingController',
  function($scope, Masternodes, Coingecko, Status) {

  $scope.isMercuryActive = true;
  $scope.isMarsActive = false;

  $scope.isStatsLoaded = false;
  $scope.mnTotalAllocated = 10000000;
  $scope.stakingTotalAllocated = 10000000;
  $scope.currentMnReward = 0;
  $scope.currentStakingReward = 0;

  $scope.mnCount = 0;
  $scope.mnTime = 0;
  $scope.mnTimeRange = 0;
  $scope.mnRangedReward = 0;
  $scope.equipmentCost = 0;
  $scope.equipmentRangeCost = null;

  $scope.mnDailyRewardESS = 0;

  $scope.stakedCoins = null;
  $scope.stakingTime = 0;
  $scope.stakingTimeRange = 0;
  $scope.stakingRangeReward = 0;

  $scope.dailyMnReward = 0;
  $scope.dailyMnRoi = 0;

  $scope.dailyStReward = 0;
  $scope.dailyStRoi = 0;

  $scope.dailyRoi = 0;
  $scope.dailyFiatReward = 0;

  $scope.changeTierToMercury = function () {
    $scope.isMercuryActive = true;
    $scope.isMarsActive = false;
    $scope.mnCount = 0;
    $scope.equipmentCost = 0;
    $scope.mnTime = 0;
    $scope.calculateMnRewards();
  };

  $scope.changeTierToMars = function () {
    $scope.isMarsActive = true;
    $scope.isMercuryActive = false;
    $scope.mnCount = 0;
    $scope.equipmentCost = 0;
    $scope.mnTime = 0;
    $scope.calculateMnRewards();
  };

  $scope.changeRangeEquipmentCost = function(equipmentCost) {
    if (equipmentCost === 0) {
      $scope.equipmentRangeCost = 0;
    } else if (equipmentCost === 1 ) {
      $scope.equipmentRangeCost = 5;
    } else if (equipmentCost === 2 ) {
      $scope.equipmentRangeCost = 10;
    } else if (equipmentCost === 3 ) {
      $scope.equipmentRangeCost = 15;
    } else if (equipmentCost === 4 ) {
      $scope.equipmentRangeCost = 20;
    } else if (equipmentCost === 5 ) {
      $scope.equipmentRangeCost = 30;
    } else if (equipmentCost === 6 ) {
      $scope.equipmentRangeCost = 50;
    } else if (equipmentCost === 7 ) {
      $scope.equipmentRangeCost = 100;
    } else if (equipmentCost === 8 ) {
      $scope.equipmentRangeCost = 500;
    } else if (equipmentCost === 9 ) {
      $scope.equipmentRangeCost = 800;
    } else {
      $scope.equipmentRangeCost = 1000;
    }
  };

  $scope.changeTimeRange = function(time) {
    if (time === 0) {
      $scope.stakingTimeRange = 0;
    } else if (time === 1 ) {
      $scope.stakingTimeRange = 40;
    } else if (time === 2 ) {
      $scope.stakingTimeRange = 80;
    } else if (time === 3 ) {
      $scope.stakingTimeRange = 120;
    } else if (time === 4 ) {
      $scope.stakingTimeRange = 160;
    } else if (time === 5 ) {
      $scope.stakingTimeRange = 200;
    } else if (time === 6 ) {
      $scope.stakingTimeRange = 240;
    } else if (time === 7 ) {
      $scope.stakingTimeRange = 280;
    } else if (time === 8 ) {
      $scope.stakingTimeRange = 320;
    } else if (time === 9 ) {
      $scope.stakingTimeRange = 350;
    } else {
      $scope.stakingTimeRange = 365;
    }
  };

  $scope.changeMnTimeRange = function(time) {
    if (time === 0) {
      $scope.mnTimeRange = 0;
    } else if (time === 1 ) {
      $scope.mnTimeRange = 40;
    } else if (time === 2 ) {
      $scope.mnTimeRange = 80;
    } else if (time === 3 ) {
      $scope.mnTimeRange = 120;
    } else if (time === 4 ) {
      $scope.mnTimeRange = 160;
    } else if (time === 5 ) {
      $scope.mnTimeRange = 200;
    } else if (time === 6 ) {
      $scope.mnTimeRange = 240;
    } else if (time === 7 ) {
      $scope.mnTimeRange = 280;
    } else if (time === 8 ) {
      $scope.mnTimeRange = 320;
    } else if (time === 9 ) {
      $scope.mnTimeRange = 350;
    } else {
      $scope.mnTimeRange = 365;
    }
  };

  $scope.calculateMnRewards = function() {

    $scope.dailyReward = 0;

    var allocatedMnByUser = $scope.mnCount * ($scope.isMercuryActive ? 100000 : 300000);
    $scope.mnDailyReward = $scope.calculateMnDailyReward(allocatedMnByUser);

    $scope.changeRangeEquipmentCost($scope.equipmentCost);
    $scope.changeMnTimeRange($scope.mnTime);

    var dailyEquipmentCostEss = 0;
    if ($scope.equipmentRangeCost !== 0) {
      dailyEquipmentCostEss = $scope.equipmentRangeCost / $scope.coinPrice /30;
    }

    $scope.mnRangedReward = ($scope.mnDailyReward - dailyEquipmentCostEss) * $scope.mnTimeRange;

    if ($scope.mnDailyReward !== 0) {
      $scope.dailyMnRoi = $scope.mnDailyReward / (allocatedMnByUser + (dailyEquipmentCostEss)) * 100;
      $scope.mnDailyRewardESS = $scope.mnDailyReward - dailyEquipmentCostEss;
      $scope.mnRewardFrequency = $scope.humanRewardFrequency(
          Math.floor(1 / ($scope.mnDailyReward / ($scope.currentMnReward * 60 * 24)))
      );
    } else {
      $scope.dailyMnRoi = 0;
      $scope.mnDailyRewardESS = 0;
      $scope.mnRewardFrequency = '';
    }

  };

  $scope.humanRewardFrequency = function (minutes) {

    var seconds = minutes * 60;
    var frequency = [];

    frequency.y = Math.floor(seconds / 31536000);
    frequency.d = Math.floor((seconds % 31536000) / 86400);
    frequency.h = Math.floor(((seconds % 31536000) % 86400) / 3600);
    frequency.m = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);

    var strReturn = '';
    if (frequency.y > 0) {
      strReturn = strReturn + frequency.y.toString() + 'y ';
    }

    if (frequency.d > 0 || frequency.y > 0) {
      strReturn = strReturn + frequency.d.toString() + 'd ';
    }

    if (frequency.h > 0 || frequency.y > 0 || frequency.d > 0) {
      strReturn = strReturn + frequency.h.toString() + 'h ';
    }

    if (frequency.m > 0 || frequency.y > 0 || frequency.d > 0 || frequency.h > 0) {
      strReturn = strReturn + frequency.m.toString() + 'm';
    }

    return strReturn;

  };

  $scope.calculateStRewards = function() {

    $scope.dailyStReward = 0;

    if ($scope.stakedCoins > 0) {
      $scope.dailyStReward = $scope.calculateStakingDailyReward();
    }

    $scope.changeTimeRange($scope.stakingTime);
    if ($scope.stakingTimeRange !== 0) {
      $scope.totalStakingReward = $scope.stakingTimeRange * $scope.dailyStReward;
    }

    if ($scope.dailyStReward !== 0) {
      $scope.dailyStRoi = $scope.dailyStReward / $scope.stakedCoins * 100;
      $scope.stRewardFrequency = $scope.humanRewardFrequency(
          Math.floor(1 / ($scope.dailyStReward / ($scope.currentStakingReward * 60 * 24)))
      );
    } else {
      $scope.dailyStRoi = 0;
      $scope.stRewardFrequency = '';
    }
  };

  $scope.calculateRewards = function () {
    if (false === $scope.isStatsLoaded) {
      console.log('stats is not loaded yet, trying to load...');
      $scope.loadStats();
    }

    $scope.dailyReward = 0;

    var allocatedMnByUser = ($scope.marsCount > 0 ? $scope.marsCount * 300000 : 0) +
        ($scope.mercuryCount > 0 ? $scope.mercuryCount * 100000 : 0);

    $scope.dailyReward += $scope.calculateMnDailyReward(allocatedMnByUser);

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
    var reward = ((allocatedByUser / ($scope.mnTotalAllocated + allocatedByUser)) * $scope.currentMnReward) * 60 * 24;
    console.log('calculateMnDailyReward allocatedByUser: ' + allocatedByUser + ' reward: ' + reward);
    return reward;
  };

  $scope.calculateStakingDailyReward = function() {
    var reward = (($scope.stakedCoins / ($scope.stakedCoins + $scope.stakingTotalAllocated)) * $scope.currentStakingReward) * 60 * 24;
    console.log('calculateStakingDailyReward: ' + reward);
    return reward;
  };

  $scope.loadStats = function () {
    $scope.isStatsLoaded = false;

    $scope.setMnTotalAllocated();
    $scope.setStakingTotalAllocated();
    $scope.setCoinPrice();
    $scope.setCurrentRewards();
    $scope.calculateMnRewards();

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