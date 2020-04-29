'use strict';

var TRANSACTION_DISPLAYED = 10;
var BLOCKS_DISPLAYED = 5;

angular.module('insight.system').controller('IndexController',
  function($scope, Global, getSocket, Blocks) {
    $scope.global = Global;

    var _getBlocks = function() {
      Blocks.get({
        limit: BLOCKS_DISPLAYED
      }, function(res) {
        $scope.blocks = res.blocks;
        $scope.blocksLength = res.length;
      });
    };

    var socket = getSocket($scope);

    var _startSocket = function() {
      socket.emit('subscribe', 'inv');
      socket.on('tx', function(tx) {
          console.log('socket.on(\'tx\'')
        $scope.txs.unshift(tx);
        if ($scope.txs.length >= 10) {
          $scope.txs = $scope.txs.splice(0, 10);
        }
      });
      socket.on('txlock', function(tx) {
          console.log('socket.on(\'txlock\'')
        for (var transaction in $scope.txs) {
          if (transaction.txid === tx.txid) {
            transaction.txlock = tx.txlock;
            $scope.txs.unshift(tx);
          }

        }
        if ($scope.txs.length >= 10) {
          $scope.txs = $scope.txs.splice(0, 10);
        }
      });
      socket.on('block', function() {
          console.log('socket.on(\'block\'')
        _getBlocks();
      });
        socket.on('message', function() {
            console.log('socket.on(\'message\'')
            _getBlocks();
        });
    };

    socket.on('connect', function() {
      _startSocket();
    });

    $scope.humanSince = function(time) {
      var m = moment.unix(time);
      return m.max().fromNow();
    };

    $scope.index = function() {
      _getBlocks();
      _startSocket();
    };

    $scope.txs = [];
    $scope.blocks = [];
  });
