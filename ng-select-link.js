/*global angular*/
angular.module('NGSelectLink', []);
angular
  .module('NGSelectLink')
  .directive(
    'ngSelectLink',
    function() {
      return {
        restrict: 'A',
        priority: 1000,
        compile: function(element, attrs, transclude) {
          var optionsAttr = attrs.ngSelectLink;
          var getterAttr = attrs.ngSelectLinkFunction;
          var toAttr = attrs.ngSelectLinkTo;

          var sourceAttr = optionsAttr.split(' in ')[1]; //TODO: very lammer, only for proto

          attrs.ngOptions = optionsAttr;

          return {
            post: function(scope, element, attrs) {
              scope.$watch(toAttr, onModelChanged);

              function onModelChanged(model) {
                var promise = scope[getterAttr].call(scope, model);
                promise.then(function(items) {
                  scope[sourceAttr] = items;
                });
              }
            }
          };
        }
      };
    });