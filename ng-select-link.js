/*global angular*/
angular.module('NGSelectLink', []);
angular
  .module('NGSelectLink')
  .directive(
    'ngSelectLink', [
      '$parse',
      '$q',
      function($parse, $q) {
        //.......................000011111111110000000000022222222220000000000000000000003333333333000000000000004444444444444440000000005555555555555550000000666666666666666000000000000000777777777700000000000000000008888888888
        var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/;

        var LINK_REGEXP = /^\s*([\s\S]+?)\(([\s\S]+?)\)\s*$/;

        function parseOptions(optionsExpr) {
          var match = optionsExpr.match(NG_OPTIONS_REGEXP);
          if (!match) {
            throw new Error('illegal options'); //TODO
          }

          var displayFn = $parse(match[2] || match[1]),
            valueName = match[4] || match[6],
            keyName = match[5],
            groupByFn = $parse(match[3] || ''),
            valueFn = $parse(match[2] ? match[1] : valueName),
            valuesFn = $parse(match[7]),
            track = match[8],
            trackFn = track ? $parse(match[8]) : null;

          return {
            displayFn: displayFn,
            valueName: valueName,
            keyName: keyName,
            groupByFn: groupByFn,
            valueFn: valueFn,
            valuesFn: valuesFn,
            // track: track,
            trackFn: trackFn
          };
        }

        function parseLink(linkExpr) {
          var match = linkExpr.match(LINK_REGEXP);
          if (!match) {
            throw new Error('illegal link'); //TODO
          }
          var load = match[1];
          var key = match[2];
          return {
            loadFn: $parse(load),
            keyFn: $parse(key)
          };
        }

        function findItem(scope, opt, modelFn) {
          var model = modelFn(scope);
          var items = opt.valuesFn(scope);
          if (!items) {
            return;
          }
          var context = {};
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            context[opt.valueName] = item;
            var val = opt.valueFn(context);
            if (val === model) {
              return item;
            }
          }
          return undefined;
        }

        function verifyIntegrity(scope, opt, items, modelFn) {
          var item = findItem(scope, opt, modelFn);
          if (!item) {
            modelFn.assign(scope, undefined);
          }
        }

        function fillItem(scope, opt, modelFn, fullFn) {
          var item = findItem(scope, opt, modelFn);
          fullFn.assign(scope, item);
        }

        function createEmptyItem(scope, opt, emptyFn) {
          var item = {};
          opt.displayFn.assign(item, emptyFn(scope));
          opt.valueFn.assign(item, undefined);
          item = item[opt.valueName];
          return item;
        }

        return {
          restrict: 'A',

          link: function(scope, element, attrs) {

            var optionsAttr = attrs.ngOptions;
            var opt = parseOptions(optionsAttr);

            var linkAttr = attrs.ngSelectLink;
            var link = parseLink(linkAttr);

            var modelAttr = attrs.ngModel;
            var modelFn = $parse(modelAttr);

            var fullAttr = attrs.ngSelectLinkItem;
            var fullFn = $parse(fullAttr);

            var emptyAttr = attrs.ngSelectLinkEmpty;
            var emptyFn = $parse(emptyAttr);

            scope.$watch(link.keyFn, onKeyChanged);
            scope.$watch(modelFn, onModelChanged);


            function onModelChanged() {
              if (fullAttr) {
                fillItem(scope, opt, modelFn, fullFn);
              }
            }

            function onKeyChanged() {
              var loader = link.loadFn(scope);
              var promise = $q.when(loader.call(scope, link.keyFn(scope)));
              promise.then(onItemsLoaded);
            }

            function onItemsLoaded(items) {
              if (emptyAttr) {
                var empty = createEmptyItem(scope, opt, emptyFn);
                items = Array.prototype.slice.call(items);
                items.unshift(empty);
              }
              opt.valuesFn.assign(scope, items);
              verifyIntegrity(scope, opt, items, modelFn);
              if (fullAttr) {
                fillItem(scope, opt, modelFn, fullFn);
              }
            }
          }

        };
      }
    ]);