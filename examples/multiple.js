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

        $scope.selectedAuthors = [];
        // $scope.selectedBooks = [];

        $scope.getBooksByAuthors = function(authors) {
          var def = $q.defer();
          $timeout(function() {
            if(!authors || !authors.length) {
              authors = Object.keys(authorsToBooks);
            }

            var items = authors.reduce(function(acc, author) {
                return acc.concat(authorsToBooks[author]);
              }, []);
            def.resolve(items);
          });
          return def.promise;
        };
      }
    ]
);
