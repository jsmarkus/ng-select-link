/*global angular*/
angular.module('NGSelectLink', []);
angular
  .module('NGSelectLink')
  .directive('ngSelectLink', [
    '$parse',
    '$q',
    '$log',
    function($parse, $q, $log) {
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

      function arrayToMap(arr) {
        return arr.reduce(function(map, item) {
          map[item] = 1;
          return map;
        }, {});
      }

      function getItemValue(opt, item) {
        var context = {};
        context[opt.valueName] = item;
        return opt.valueFn(context);
      }

      function findItemList(scope, opt, modelFn) {
        var model = modelFn(scope) || [];

        var items = opt.valuesFn(scope);
        if (!items) {
          return [];
        }

        var found = items.filter(function(item) {
          var val = getItemValue(opt, item);
          return -1 !== model.indexOf(val);
        });

        return found;
      }

      function findItem(scope, opt, modelFn) {
        var model = modelFn(scope);

        var items = opt.valuesFn(scope);
        if (!items) {
          return undefined;
        }

        for (var i = 0; i < items.length; i++) {
          var item = items[i];
          if (getItemValue(opt, item) === model) {
            return item;
          }
        }

        return undefined;
      }

      function arrayIntersection(arr0, arr1) {
        return arr0.filter(function(item) {
          return -1 !== arr1.indexOf(item);
        });
      }

      function verifyIntegrity(scope, opt, items, modelFn, multiple, onReset) {
        if (multiple) {
          var chosenItems = findItemList(scope, opt, modelFn).map(getItemValue.bind(null, opt));
          var prevItems = modelFn(scope);
          var newModel = arrayIntersection(chosenItems, prevItems);
          modelFn.assign(scope, newModel);
          if (onReset) {
            onReset.call(scope);
          }
        } else {
          var item = findItem(scope, opt, modelFn);
          if (!item) {
            modelFn.assign(scope, undefined);
            if (onReset) {
              onReset.call(scope);
            }
          }
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
          var loadingCounter = 0;

          var optionsAttr = attrs.ngSelectLinkOptions || attrs.ngOptions;
          var opt = parseOptions(optionsAttr);

          var linkAttr = attrs.ngSelectLink;
          var link = parseLink(linkAttr);

          var modelAttrName = attrs.ngSelectLinkModelAttr || 'ngModel';
          var modelAttr = attrs[modelAttrName];
          var modelFn = $parse(modelAttr);

          var fullAttr = attrs.ngSelectLinkItem;
          var fullFn = $parse(fullAttr);

          var emptyAttr = attrs.ngSelectLinkEmpty;
          var emptyFn = $parse(emptyAttr);

          var clearAttr = attrs.ngSelectLinkIsClear;
          var clearFn = $parse(clearAttr);

          var multipleAttr = attrs.hasOwnProperty('ngSelectLinkMultiple') || attrs.multiple;

          var onResetAttr = attrs.ngSelectLinkOnReset;
          var onReset;
          if (onResetAttr) {
            onReset = function() {
              scope.$eval(onResetAttr);
            };
          }

          scope.$watch(link.keyFn, onKeyChanged, true);
          scope.$watch(modelFn, onModelChanged);


          function onModelChanged() {
            if (fullAttr) {
              fillItem(scope, opt, modelFn, fullFn);
            }
          }

          function onKeyChanged() {
            var loader = link.loadFn(scope);
            var promise = $q.when(loader.call(scope, link.keyFn(scope)));
            loadingCounter++;
            promise.then(onItemsLoaded.bind(null, loadingCounter));
          }

          function onItemsLoaded(counter, items) {
            if (counter !== loadingCounter) {
              $log.debug('data race', counter, loadingCounter, linkAttr, items);
              return;
            }
            items = items || [];
            if (clearAttr) {
              if (!items.length) {
                clearFn.assign(scope, true);
              } else {
                clearFn.assign(scope, false);
              }
            }
            if (emptyAttr && emptyFn(scope)) {
              var empty = createEmptyItem(scope, opt, emptyFn);
              items = Array.prototype.slice.call(items);
              items.unshift(empty);
            }
            opt.valuesFn.assign(scope, items);
            verifyIntegrity(scope, opt, items, modelFn, multipleAttr, onReset);
            if (fullAttr) {
              fillItem(scope, opt, modelFn, fullFn);
            }
          }
        }

      };
    }
  ]);
