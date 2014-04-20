/*global angular*/
angular.module('demo', ['NGSelectLink']);
angular
  .module('demo')
  .controller(
    'DemoCtrl', [
      '$scope',
      '$q',
      function($scope, $q) {
        var authorsToBooks = {
          'Salinger': [{
            isbn: '9788976100146',
            title: 'The Catcher in the Rye'
          }, {
            isbn: '9780553146646',
            title: 'Nine Stories'
          }, ],
          'Bradbury': [{
            isbn: '9789703707034',
            title: 'Fahrenheit 451'
          }, {
            isbn: '9780590031004',
            title: 'Dandelion Wine'
          }]
        };

        $scope.authors = ['Salinger', 'Bradbury'];

        $scope.selectedAuthor = 'Salinger';

        $scope.getBooksByAuthor = function(author) {
          var def = $q.defer();
          def.resolve(authorsToBooks[author]);
          return def.promise;
        };
      }
    ]
);