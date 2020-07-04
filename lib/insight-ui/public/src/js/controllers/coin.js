'use strict';

angular.module('insight.system').controller('CoinController',
  function($scope, Coingecko) {
  $scope.isCoinDataShow = false;
  $scope.coinData = [];

  $scope.hideModal = function() {
      $scope.isCoinDataShow = false;
  };

  $scope.retrieveCoinData = function () {
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
      $scope.isCoinDataShow = true;
  };
});
