define(['../module'], function (controllers) {
    'use strict';
    controllers.controller('home_home', ['$scope', '$rootScope', '$http', '$cookieStore', '$modal', "$location", "CommHttp", '$filter', '$timeout', '$window', function ($scope, $rootScope, $http, $cookieStore, $modal, $location, CommHttp, $filter, $timeout, $window) {

        $scope.showDialog = function () {
            var modalInstance = $modal.open({
                templateUrl: 'templates/popup/setval.html',
                controller: 'popup_setval',
                backdrop: 'static',
                resolve: {
                    items: function () {
                        return [1,2];
                    }
                }
            });

            modalInstance.result.then(function (dialogResult) {
                if (!!dialogResult) {
                    $scope.$broadcast('info', dialogResult);
                }
            });
        }
        $scope.$on('providerKey_on', function (e, data) {
            $scope.providerKey = data;
        });
    }])
});

