'use strict';

angular.module('insight.currency', ['ui.router', 'ui.bootstrap']).controller('CurrencyController',
    function($scope, $rootScope, Currency) {
        $rootScope.currency.symbol = defaultCurrency;

        var _roundFloat = function(x, n) {
            if (!parseInt(n, 10) || !parseFloat(x)) n = 0;

            return Math.round(x * Math.pow(10, n)) / Math.pow(10, n);
        };

        $rootScope.currency.getConvertion = function(value) {
            value = value * 1; // Convert to number

            if (!isNaN(value) && typeof value !== 'undefined' && value !== null) {
                if (value === 0.00000000) return '0 ' + this.symbol; // fix value to show

                var response;

                if (this.symbol === 'USD' || this.symbol === 'EUR' || this.symbol === 'GBP') {
                    response = _roundFloat((value * this.factor), 2);
                } else if (this.symbol === 'mDASH') {
                    this.factor = 1000;
                    response = _roundFloat((value * this.factor), 5);
                } else if (this.symbol === 'uDASH') {
                    this.factor = 1000000;
                    response = _roundFloat((value * this.factor), 2);
                } else if (this.symbol === 'duffs') {
                    this.factor = 100000000;
                    response = Math.round(value * this.factor);
                } else {
                    this.factor = 1;
                    response = value;
                }
                // prevent sci notation
                if (response < 1e-7) response = response.toFixed(8);

                return response + ' ' + this.symbol;
            }

            return 'value error';
        };

        $scope.setCurrency = function(currency) {
            $rootScope.currency.symbol = currency;
            localStorage.setItem('insight-currency', currency);

            if (currency === 'USD') {
                Currency.get({}, function(res) {
                    $rootScope.currency.factor = $rootScope.currency.bitstamp = res.data.bitstamp;
                });
            } else if (currency === 'EUR') {
                Currency.get({}, function(res) {
                    $rootScope.currency.factor = $rootScope.currency.bitstamp = res.data.bitstamp / 1.13;
                });
            } else if (currency === 'GBP') {
                Currency.get({}, function(res) {
                    $rootScope.currency.factor = $rootScope.currency.bitstamp = res.data.bitstamp / 1.31;
                });
            } else if (currency === 'mDASH') {
                $rootScope.currency.factor = 1000;
            } else if (currency === 'duffs') {
                $rootScope.currency.factor = 100000000;
            } else if (currency === 'uDASH') {
                $rootScope.currency.factor = 1000000;
            } else {
                $rootScope.currency.factor = 1;
            }
        };

        // Get initial value
        Currency.get({}, function(res) {
            $rootScope.currency.factor = $rootScope.currency.bitstamp = res.data.bitstamp;
        });

    });