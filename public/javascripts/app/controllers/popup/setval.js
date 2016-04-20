/**
 * Created by zhuxijun on 16-3-15.
 */

define(['../module'], function (controllers) {
    'use strict';

    controllers.controller('popup_setval', ['$scope', '$rootScope', '$modalInstance', 'items', '$http', function ($scope, $rootScope, $modalInstance, items, $http) {

        var arr = [];
        if (items != null && items.length > 0 && items[0] != undefined) {
            arr = items[0];
        }

        //保存
        $scope.save = function () {
            $modalInstance.close($scope.username);
        };

        //取消
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }])
})
