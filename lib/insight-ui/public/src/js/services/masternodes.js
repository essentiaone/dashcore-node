'use strict';

angular.module('insight.masternodes')
  .factory('Masternodes', function($resource) {
    return $resource(window.apiPrefix + '/masternodes/list');
  })
