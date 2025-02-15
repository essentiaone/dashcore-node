'use strict';

angular.module('insight.blocks').controller('BlocksController',
  function($scope, $rootScope, $routeParams, $location, Global, Block, Blocks, BlockByHeight) {
  $scope.global = Global;
  $scope.loading = false;
  $scope.innerPageRange = 2;

  if ($routeParams.blockHeight) {
    BlockByHeight.get({
      blockHeight: $routeParams.blockHeight
    }, function(hash) {
      $location.path('/block/' + hash.blockHash);
    }, function() {
      $rootScope.flashMessage = 'Bad Request';
      $location.path('/');
    });
  }

  var toUTCDate = function(date){
    var _utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    return _utc;
  };

  var millisToUTCDate = function(millis){
    return toUTCDate(new Date(millis* 1000));
  };

  $scope.toUTCDate = toUTCDate;
  $scope.millisToUTCDate = millisToUTCDate;

  //Datepicker
  var _formatTimestamp = function (date) {
    var yyyy = date.getUTCFullYear().toString();
    var mm = (date.getUTCMonth() + 1).toString(); // getMonth() is zero-based
    var dd  = date.getUTCDate().toString();

    return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]); //padding
  };

  $scope.$watch('dt', function(newValue, oldValue) {
    if (newValue !== oldValue) {
      $location.path('/blocks-date/' + _formatTimestamp(newValue));
    }
  });

  $scope.openCalendar = function($event) {
    $scope.opened = true;
    setTimeout(function(){ angular.element(document.querySelector('.uib-datepicker-popup'))[0].style.display = "block"; }, 100);
  };

  $scope.humanSince = function(time) {
    var m = moment.unix(time).startOf('day');
    var b = moment().startOf('day');
    return m.max().from(b);
  };

  function setCurrentPage() {
    var length = $scope.length;
    var prev = $scope.pagination.prev

    $scope.totalPages = Math.ceil($scope.totalCount / length);
    $scope.currentPage = Math.ceil(($scope.totalCount - prev) / length) || 1;

    var pages = [];
    var next = $scope.totalCount;

    for (var i = $scope.rangeStart(); i <= $scope.rangeEnd(); i++) {
      var toNext = next - ((i-1) * length);

      pages.push({
        page: i,
        to: toNext > 50 ? toNext : 50
      });
    }

    $scope.pages = pages;
  }

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



  $scope.list = function() {
    $scope.loading = true;

    if ($routeParams.blockDate) {
      $scope.detail = 'On ' + $routeParams.blockDate;
    }

    if ($routeParams.startTimestamp) {
      var d=new Date($routeParams.startTimestamp*1000);
      var m=d.getMinutes();
      if (m<10) m = '0' + m;
      $scope.before = ' before ' + d.getHours() + ':' + m;
    }

    $rootScope.titleDetail = $scope.detail;

    Blocks.get({
      blockDate: $routeParams.blockDate,
      from: $routeParams.prev
    }, function(res) {
      $scope.loading = false;
      $scope.blocks = res.blocks;
      $scope.length = res.length;
      $scope.pagination = res.pagination;
      // $scope.totalPage =
      // $scope.currentPage =
      if (!$routeParams.prev) {
        $scope.totalCount = res.pagination.next;
        $scope.getTotalCount = new Intl.NumberFormat().format(res.pagination.next);
        setCurrentPage();
      } else {
        Blocks.get({
          blockDate: undefined,
          from: undefined
        }, function(res) {
          $scope.totalCount = res.pagination.next;
          $scope.getTotalCount = new Intl.NumberFormat().format(res.pagination.next);
          setCurrentPage();
        });
      }


      $scope.pagination.olderBlocks = $scope.pagination.moreTs;
      for (var key in $scope.blocks) {
        if($scope.blocks[key].time < $scope.pagination.olderBlocks){
          $scope.pagination.olderBlocks = $scope.blocks[key].time;
        }
		  }
    });
  };

  $scope.findOne = function() {
    $scope.loading = true;

    Block.get({
      blockHash: $routeParams.blockHash
    }, function(block) {
      $rootScope.titleDetail = block && block.height;
      $rootScope.flashMessage = null;
      $scope.loading = false;
      $scope.block = block;
    }, function(e) {
      if (e.status === 400) {
        $rootScope.flashMessage = 'Invalid Transaction ID: ' + $routeParams.txId;
      }
      else if (e.status === 503) {
        $rootScope.flashMessage = 'Backend Error. ' + e.data;
      }
      else {
        $rootScope.flashMessage = 'Block Not Found';
      }
      $location.path('/');
    });
  };

  $scope.getMasternodeRewardByHeight = function(height, type) {
    var reward = 0;
    var coef = type === 'staker' ? 0.38 : 0.45;
    if (0 < height && 525600 >= height) {
      reward = 190 * coef;
    } else if (525600 < height && 1051200 >= height) {
      reward = 167 * coef;
    } else if (1051200 < height && 1576800 >= height) {
      reward = 142 * coef;
    } else if (1576800 < height && 2102400 >= height) {
      reward = 117 * coef;
    } else if (2102400 < height && 2628000 >= height) {
      reward = 92 * coef;
    } else if (2628000 < height && 3153600 >= height) {
      reward = 75 * coef;
    } else if (3153600 < height && 3679200 >= height) {
      reward = 50 * coef;
    }
    return reward + ' ESS';
  };

  $scope.blocks = [];

  $scope.params = $routeParams;
});
