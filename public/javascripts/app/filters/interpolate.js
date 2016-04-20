define(['./module'], function (filters) {
    'use strict';

    return filters.filter('dataMark_ymd', function () {
        //格式化日期  年月日
        return function (dataTime) {
            var dateformat = function (dataTime, fomartstr) {
                try {
                    return dataTime == null ? "" : (eval(dataTime.replace(/\/Date\((\d+)\)\//gi, "new Date($1)"))).pattern(fomartstr);
                } catch (e) {
                    return '';
                }
            };

            return dateformat(dataTime, 'yyyy-MM-dd');
        };
    }).filter("dataMark_ymdhms", function () {
        //格式化日期   年月日 时分
        var fn = function (dataTime) {
            //console.log(dataTime)
            var dateformat = function (dataTime, fomartstr) {
                try {
                    if (dataTime) {
                        return dataTime == null ? "" : (eval(dataTime.replace(/\/Date\((\d+)\)\//gi, "new Date($1)"))).pattern(fomartstr);
                    }
                } catch (e) {

                    return '';
                }
            };
            //console.log(dateformat(dataTime, 'yyyy-MM-dd HH:mm:ss'))
            return dateformat(dataTime, 'yyyy-MM-dd HH:mm:ss');
        };
        return fn;
    }).filter("getStatus", function () {
        var fn = function (username) {
            var result = function (username) {
                if (username != undefined && username != null)
                    return username + "(离线)"
                return "";
            };
            return result(username);
        }
        return fn;
    })
});




