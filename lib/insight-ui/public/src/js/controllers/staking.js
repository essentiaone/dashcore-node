'use strict';

angular.module('insight.staking').controller('StakingController',
  function($scope) {
  $scope.loading = false;
  $scope.marsCount = null;
  $scope.mercuryCount = null;
  $scope.stakedCoins = null;
  $scope.equipmentCost = null;


  $scope.calculateRewards = function () {
    console.log($scope.marsCount);
    console.log($scope.mercuryCount);
    console.log($scope.stakedCoins);
    console.log($scope.equipmentCost);
  };

});
