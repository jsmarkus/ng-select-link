/*global angular*/
angular.module('demo', ['NGSelectLink']);
angular
  .module('demo')
  .controller(
    'DemoCtrl', [
      '$scope',
      '$q',
      '$timeout',
      function($scope, $q, $timeout) {
        var authors = [{
          id: 1,
          name: 'Salinger'
        }, {
          id: 2,
          name: 'Bradburry'
        }];

        var authorsToBooks = {
          1: [{
            isbn: '9788976100146',
            title: 'The Catcher in the Rye'
          }, {
            isbn: '9780553146646',
            title: 'Nine Stories'
          }],

          2: [{
            isbn: '9789703707034',
            title: 'Fahrenheit 451'
          }, {
            isbn: '9780590031004',
            title: 'Dandelion Wine'
          }]
        };

        $scope.authors = authors;

        $scope.selectedAuthor = 1;

        $scope.getBooksByAuthor = function(author) {
          var def = $q.defer();
          $timeout(function() {
            var items = angular.copy(authorsToBooks[author]);
            def.resolve(items);
          }, 500);
          return def.promise;
        };
      }
    ]
);