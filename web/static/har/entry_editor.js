// Generated by CoffeeScript 1.7.1
(function() {
  define(function(require, exports, module) {
    var utils;
    require('jquery');
    require('bootstrap');
    require('angular');
    require('/static/har/contenteditable');
    require('/static/har/editablelist');
    utils = require('/static/utils');
    return angular.module('entry_editor', ['contenteditable']).controller('EntryCtrl', function($scope, $rootScope, $sce, $http) {
      $scope.panel = 'request';
      $scope.$on('edit-entry', function(ev, entry) {
        var _base, _base1, _base2;
        console.log(entry);
        $scope.entry = entry;
        if ((_base = $scope.entry).success_asserts == null) {
          _base.success_asserts = [
            {
              re: '' + $scope.entry.response.status,
              from: 'status'
            }
          ];
        }
        if ((_base1 = $scope.entry).failed_asserts == null) {
          _base1.failed_asserts = [];
        }
        if ((_base2 = $scope.entry).extract_variables == null) {
          _base2.extract_variables = [];
        }
        angular.element('#edit-entry').modal('show');
        return $scope.alert_hide();
      });
      angular.element('#edit-entry').on('hidden.bs.modal', function(ev) {
        var _ref;
        if ((_ref = $scope.panel) === 'preview-headers' || _ref === 'preview') {
          $scope.$apply(function() {
            var env, ret, rule, _i, _len, _ref1;
            $scope.panel = 'test';
            env = utils.list2dict($scope.env);
            _ref1 = $scope.entry.extract_variables;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              rule = _ref1[_i];
              if (ret = $scope.preview_match(rule.re, rule.from)) {
                env[rule.name] = ret;
              }
            }
            return $scope.env = utils.dict2list(env);
          });
        }
        $scope.$apply(function() {
          return $scope.preview = void 0;
        });
        console.log('har-change');
        return $rootScope.$broadcast('har-change');
      });
      $scope.alert = function(message) {
        return angular.element('.panel-test .alert').text(message).show();
      };
      $scope.alert_hide = function() {
        return angular.element('.panel-test .alert').hide();
      };
      $scope.$watch('entry.request.url', function() {
        var key, queryString, value;
        if ($scope.entry == null) {
          return;
        }
        queryString = (function() {
          var _ref, _results;
          _ref = utils.url_parse($scope.entry.request.url, true).query;
          _results = [];
          for (key in _ref) {
            value = _ref[key];
            _results.push({
              name: key,
              value: value
            });
          }
          return _results;
        })();
        if (!angular.equals(queryString, $scope.entry.request.queryString)) {
          return $scope.entry.request.queryString = queryString;
        }
      });
      $scope.$watch('entry.request.queryString', (function() {
        var each, query, url, _i, _len, _ref;
        if ($scope.entry == null) {
          return;
        }
        url = utils.url_parse($scope.entry.request.url);
        query = {};
        _ref = $scope.entry.request.queryString;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          each = _ref[_i];
          query[each.name] = each.value;
        }
        query = utils.querystring_unparse_with_variables(query);
        if (query) {
          url.search = "?" + query;
        }
        url = utils.url_unparse(url);
        if (url !== $scope.entry.request.url) {
          return $scope.entry.request.url = url;
        }
      }), true);
      $scope.$watch('entry.request.postData.params', (function() {
        var obj, param, _i, _len, _ref, _ref1;
        if (((_ref = $scope.entry) != null ? _ref.postData : void 0) == null) {
          return;
        }
        obj = {};
        _ref1 = $scope.entry.request.postData.params;
        for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
          param = _ref1[_i];
          obj[param.name] = param.value;
        }
        return $scope.entry.request.postData.text = utils.querystring_unparse_with_variables(obj);
      }), true);
      $scope["delete"] = function(hashKey, array) {
        var each, index, _i, _len;
        for (index = _i = 0, _len = array.length; _i < _len; index = ++_i) {
          each = array[index];
          if (each.$$hashKey === hashKey) {
            array.splice(index, 1);
            return;
          }
        }
      };
      $scope.variables_wrapper = function(string, place_holder) {
        var re;
        if (place_holder == null) {
          place_holder = '';
        }
        string = string || place_holder;
        re = /{{\s*([\w]+?)\s*}}/g;
        return $sce.trustAsHtml(string.replace(re, '<span class="label label-primary">$&</span>'));
      };
      return $scope.do_test = function() {
        var c, h, _ref;
        angular.element('.do-test').button('loading');
        $http.post('/har/test', {
          request: {
            method: $scope.entry.request.method,
            url: $scope.entry.request.url,
            headers: (function() {
              var _i, _len, _ref, _results;
              _ref = $scope.entry.request.headers;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                h = _ref[_i];
                if (h.checked) {
                  _results.push({
                    name: h.name,
                    value: h.value
                  });
                }
              }
              return _results;
            })(),
            cookies: (function() {
              var _i, _len, _ref, _results;
              _ref = $scope.entry.request.cookies;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                c = _ref[_i];
                if (c.checked) {
                  _results.push({
                    name: c.name,
                    value: c.value
                  });
                }
              }
              return _results;
            })(),
            data: (_ref = $scope.entry.request.postData) != null ? _ref.text : void 0
          },
          rule: {
            success_asserts: $scope.entry.success_asserts,
            failed_asserts: $scope.entry.failed_asserts,
            extract_variables: $scope.entry.extract_variables
          },
          env: {
            variables: utils.list2dict($scope.env),
            session: $scope.session
          }
        }).success(function(data, status, headers, config) {
          var _ref, _ref1;
          angular.element('.do-test').button('reset');
          if (status !== 200) {
            $scope.alert(data);
            return;
          }
          $scope.preview = data.har;
          $scope.preview.success = data.success;
          $scope.env = utils.dict2list(data.env.variables);
          $scope.session = data.env.session;
          $scope.panel = 'preview';
          if (((_ref = data.har.response) != null ? (_ref1 = _ref.content) != null ? _ref1.text : void 0 : void 0) != null) {
            return setTimeout((function() {
              return angular.element('.panel-preview iframe').attr("src", "data:" + data.har.response.content.mimeType + ";base64," + data.har.response.content.text);
            }), 0);
          }
        }).error(function(data, status, headers, config) {
          angular.element('.do-test').button('reset');
          console.log('error', data, status, headers, config);
          return $scope.alert(data);
        });
        return $scope.preview_match = function(re, from) {
          var content, data, error, header, m, _i, _len, _ref1;
          data = null;
          if (!from) {
            return null;
          } else if (from === 'content') {
            if (!(content = $scope.preview.response.content).text) {
              return null;
            }
            if (!content.decoded) {
              content.decoded = atob(content.text);
            }
            data = content.decoded;
          } else if (from === 'status') {
            data = '' + $scope.preview.response.status;
          } else if (from.indexOf('header-')) {
            from = from.slice(7);
            _ref1 = $scope.preview.response.headers;
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              header = _ref1[_i];
              if (header.name.toLowerCase() === from) {
                data = header.value;
              }
            }
          }
          if (!data) {
            return null;
          }
          try {
            re = new RegExp(re);
          } catch (_error) {
            error = _error;
            return null;
          }
          if (m = data.match(re)) {
            if (m[1]) {
              return m[1];
            } else {
              return m[0];
            }
          }
          return null;
        };
      };
    });
  });

}).call(this);
