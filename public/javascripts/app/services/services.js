define(['./module'], function (services) {
    'use strict';
    //services.value('version', '0.1');

    services.factory("cisHttp", ["$http", function ($http) {
        return function (url, pars, method) {
            return $http({
                url: url,
                params: pars || {},
                method: method || "post"
            });
        }
    }]).factory("CommHttp", ["cisHttp",'$resource', function (cisHttp,$resource) {
        return {
            getMenus: function () { return cisHttp("/partialviews/getmymenus"); }
        };
    }]).factory("users", ['$resource', function ($resource) {
        return $resource('/users/:id', {}, {
            query: { method: 'GET'},
            getAll: { method: 'GET', params: {}},
            add: { method: 'POST', params: {} },
        });
    }]);



});



