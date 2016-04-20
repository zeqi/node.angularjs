/**
 * Created by zhuxijun on 16-3-15.
 */

define(['../module'], function (controllers) {
    'use strict';

    controllers.controller('home_child', ['$scope', '$http', '$location', 'users', function ($scope, $http, $location, users) {

        $scope.$on('info', function (e, data) {
            $scope.username = data;
        });


        $scope.getAllUsers = function () {
            users.getAll({}, function (data) {
                console.log(data);
                $scope.userlist = data;
            });
        };

        $scope.getUser = function (id) {
            users.query({id: id}, function (data) {
                console.log(data);
                $scope.userlist = [data];
            });
        };
        //$http.post()
    }])
})

