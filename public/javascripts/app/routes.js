/**
 * Defines the main routes in the application.
 * The routes you see here will be anchors '#/' unless specifically configured otherwise.
 */

define(['./app'], function (app) {
    'use strict';
    return app.config(['$routeProvider', '$httpProvider', function ($routeProvider, $httpProvider) {
        $routeProvider.when('/home/error', {
            templateUrl: 'templates/home/error.html',
            controller: 'home_error'
        }).when('/home/child', {
            templateUrl: 'templates/home/child.html',
            controller: 'home_child'
        }).otherwise({
            redirectTo: '/',
            templateUrl: 'templates/home/default.html'
        });

        $httpProvider.interceptors.push('httpInterceptor');
    }]).factory('httpInterceptor', ['$q', '$injector', '$rootScope', function ($q, $injector, $rootScope) {
        var httpInterceptor = {
            'responseError': function (response) {
                //loading隐藏
                var loading = $('#loadding');
                if (loading.length > 0) {
                    loading.hide();
                }
                return $q.reject(response);
            },
            'request': function (config) {
                //心跳
                if (config.url != undefined && config.url.toLowerCase() == '/home/heartbeat') {
                    return config;
                }
                //loading显示
                var loading = $('#loadding');
                if (loading.length > 0) {
                    loading.show();
                }
                return config;
            },
            'response': function (response) {
                //loading隐藏

                var loading = $('#loadding');
                if (loading.length > 0) {
                    loading.hide();
                }

                if (response.data != undefined) {
                    var data = response.data;
                    if (data.code != undefined) {
                        var code = data.code;
                        switch (code) {
                            case 201:
                                //$scope.$emit("Error", data.msg)
                                break;
                            case 403:
                                location.href = '/account/login';
                                break;
                            case 405:
                            case 500:
                                location.href = '/home/error?code=' + data.code + '&msg=' + data.msg;
                                break;
                        }
                    }
                }

                return response;
            },
            'requestError': function (config) {
                //loading隐藏
                var loading = $('#loadding');
                if (loading.length > 0) {
                    loading.hide();
                }
                return $q.reject(config);
            }
        }
        return httpInterceptor;

    }]).config(['$compileProvider', function ($compileProvider) {
        //解决动态添加指令的问题
        $compileProvider.directive('compile', function ($compile) {
            return function (scope, element, attrs) {
                scope.$watch(
                  function (scope) {
                      return scope.$eval(attrs.compile);
                  },
                  function (value) {
                      element.html(value);
                      $compile(element.contents())(scope);
                  }
                );
            };
        });
    }])
});

