'use strict';

angular.module('insight.search').controller('SearchController',
    function($scope, $routeParams, $location, $timeout, Global, Block, Transaction, Address, BlockByHeight) {
      $scope.global = Global;
      $scope.loading = false;

      var _badQuery = function() {
        $scope.badQuery = true;

        $timeout(function() {
          $scope.badQuery = false;
        }, 2000);
      };

      var _resetSearch = function() {
        $scope.q = '';
        $scope.loading = false;
      };

      $scope.search = function() {
        var q = $scope.q;
        $scope.badQuery = false;
        $scope.loading = true;

        if (q.length === 64) {
          Block.get({
            blockHash: q
          }, function(e) {
            if (e.status) {
              Transaction.get({
                txId: q
              }, function(e) {
                if (e.status) {
                  Address.get({
                    addrStr: q
                  }, function(e) {
                    if (e.status) {
                      if (isFinite(q)) { // ensure that q is a finite number. A logical height value.
                        BlockByHeight.get({
                          blockHeight: q
                        }, function (hash) {
                          _resetSearch();
                          $location.path('/block/' + hash.blockHash);
                        }, function () { //not found, fail :(
                          $scope.loading = false;
                          _badQuery();
                        });
                      }
                    }
                    _resetSearch();
                    $location.path('address/' + q);
                  });
                }
                _resetSearch();
                $location.path('tx/' + q);
              });
            }
            _resetSearch();
            $location.path('block/' + q);
          });
        } else if (q.length === 34) {
          Address.get({
            addrStr: q
          }, function(e) {
            if (e.status) {
              if (isFinite(q)) { // ensure that q is a finite number. A logical height value.
                BlockByHeight.get({
                  blockHeight: q
                }, function(hash) {
                  _resetSearch();
                  $location.path('/block/' + hash.blockHash);
                }, function() { //not found, fail :(
                  $scope.loading = false;
                  _badQuery();
                });
              }
              else {
                $scope.loading = false;
                _badQuery();
              }
            }
            _resetSearch();
            $location.path('address/' + q);
          });
        } else {
          if (isFinite(q)) { // ensure that q is a finite number. A logical height value.
            BlockByHeight.get({
              blockHeight: q
            }, function(hash) {
              _resetSearch();
              $location.path('/block/' + hash.blockHash);
            }, function() { //not found, fail :(
              $scope.loading = false;
              _badQuery();
            });
          }
          else {
            $scope.loading = false;
            _badQuery();
          }
        }
      };
    });