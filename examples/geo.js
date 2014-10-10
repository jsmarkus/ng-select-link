/*global angular*/
angular.module('demo', ['NGSelectLink']);
angular
  .module('demo')
  .controller(
    'DemoCtrl', [
      '$scope',
      '$http',

      function($scope, $http) {
        $scope.selectedState = '2347591';
        $scope.selectedCity = '2459115';

        $scope.onCitiesReset = function() {
          console.log('cities reset');
        };

        $scope.getStates = function() {
          return yql('select * from geo.states where place="United States"', 'place');
        };

        $scope.getCityByState = function(stateWoeid) {
          if (!stateWoeid) {
            return [];
          }
          return yql('select * from geo.places.children where parent_woeid=' + stateWoeid + ' and placetype=7', 'place');
        };



        function yql(q, resultName) {
          return $http.jsonp('https://query.yahooapis.com/v1/public/yql', {
            params: {
              q: q,
              format: 'json',
              callback: 'JSON_CALLBACK'
            }
          }).then(function(res) {
            var results = res.data.query.results;
            if (!results) {
              return [];
            }
            return results[resultName];
          });
        }
      }
    ]
);