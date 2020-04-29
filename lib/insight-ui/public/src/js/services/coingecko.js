'use strict';

angular.module('coingecko')
  .factory('Coingecko', function($resource) {
    return $resource('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&symbols=ess');
  });
