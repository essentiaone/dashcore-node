'use strict';

angular.module('insight.masternodes').controller('MasternodesController',
  function($scope, Masternodes) {
  $scope.loading = false;
  $scope.innerPageRange = 2;
  $scope.length = 25;
  $scope.tiers = [];

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

  var toUTCDate = function(date){
    var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    return _utc;
  };

  var millisToUTCDate = function(millis){
    return toUTCDate(new Date(millis* 1000));
  };

  $scope.differenceTime = function(value) {
    var hours = value / 60 / 60

    return hours ? Math.round(hours) + ' hours': 'less than an hour';
  }

  $scope.millisToUTCDate = millisToUTCDate;

  $scope.generatePages = function() {
    var pages = [];

    for (var i = $scope.rangeStart(); i <= $scope.rangeEnd(); i++) {
      pages.push({
        page: i,
      });
    }

    $scope.pages = pages;
  }

  $scope.initCurrentPage = function () {
    var length = $scope.length;

    $scope.totalPages = Math.ceil($scope.totalCount / length);
    $scope.currentPage = 1;

    $scope.generatePages();
    $scope.generatePagesNodes();
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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

  $scope.list = function() {
    $scope.loading = true;

    Masternodes.get().$promise
      .then(function (res) {
        $scope.loading = false;
        $scope.nodes = res.list;
        $scope.totalCount = $scope.nodes.length;
        $scope.initCurrentPage();
        $scope.getTier();
      })
      .catch(function (error) {
        $scope.loading = false;
        if(error) {
          $scope.error = error;
        } else {
          $scope.error = 'No error message given (connection error?)';
        }
      });
  };
});
