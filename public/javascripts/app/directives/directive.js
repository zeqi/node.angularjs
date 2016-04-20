define(['./module'], function (directives) {
    'use strict';
    //表格功能模块
    directives.directive('ngCisGrid', function ($route, $compile) {
        return {
            restrict: "A",
            scope: true,
            compile: function (ele, attr) {
                //compile函数在link函数执行前对DOM进行改造，这个时候获取不到scope对象,此方法return的函数即为link函数
                var tableModule = {
                    //未设置表格宽度时的默认宽度值
                    defaultWidth: '150',
                    //th的html
                    thHtml: '',
                    //table宽度
                    nTableWidth: 0,
                    //设置的表格列宽度
                    colwidth: '',
                    //设置的表格列标识
                    colName: '',
                    //是否允许调整表格列宽度
                    allowresize: '',
                    //是否嵌套溢出隐藏dom
                    allowwrap: '',
                    //是否排序
                    allowsort: '',
                    //克隆table
                    cloneTable: null,
                    //获取当前url,
                    getUrl: function () {
                        var url = location.hash.replace("#/", '');
                        if (url.indexOf('?') >= 0) {
                            url = url.slice(0, url.indexOf('?'));
                        } else {
                            if (url.indexOf('/') >= 0) {
                                url = url.replace('/', '');
                            }
                        }
                        return url;
                    },
                    //判断值 是否为 空 ，undefined, null,
                    //只能判断1个值，空字符串，空对象，空数组，undefined，null，function无返回值或返回值为null时都为true
                    isEmpty: function (o) {
                        var flag = true;
                        switch (typeof (o)) {
                            case 'string':
                                if (o.replace(/\s/g, '').length > 0) {
                                    flag = false;
                                }
                                break;
                            case 'object':
                                if ((o instanceof Object) == true) {
                                    if ((o instanceof Array) == true) {
                                        //数组
                                        if (o.length != 0) {
                                            flag = false;
                                        }
                                    } else {
                                        //{}对象
                                        for (var k in o) {
                                            flag = false;
                                        }
                                    }
                                }
                                break;
                            case 'number':
                                flag = false;
                                break;
                            case 'function':
                                if (o() != undefined || o() != null) {
                                    flag = false;
                                }
                                break;
                            case 'undefined':
                                break;
                            default:
                                break;
                        }
                        return flag;
                    },
                    //向表格th,td及subdiv赋值
                    setThWidth: function (th, storeInfo_code) {
                        ////==============如果列宽度等信息未存储过，则读取表格上的设置， 如果存储过，则读取存储信息，并赋值===========================
                        this.colwidth = th.attr('colwidth');
                        //如果未储存过信息
                        if (storeInfo_code == false) {
                            //colwidth 已定义 且 为纯数字 且 数值不为0；
                            if (this.colwidth != undefined && isNaN(this.colwidth) == false && Number(this.colwidth) != 0) {
                                th.css('width', this.colwidth);
                                if (th.children('div.subdiv').length > 0) {
                                    th.children('.subdiv').css('width', Number(this.colwidth) - 5);
                                }
                                tableModule.nTableWidth += parseInt(this.colwidth)
                            } else {
                                //否则设置默认值
                                th.css('width', this.defaultWidth);
                                if (th.children('div.subdiv').length > 0) {
                                    th.children('.subdiv').css('width', Number(this.defaultWidth - 5));
                                }
                                tableModule.nTableWidth += parseInt(this.defaultWidth)
                            }
                        } else {
                            th.css('width', storeInfo_code);
                            if (th.children('div.subdiv').length > 0) {
                                th.children('.subdiv').css('width', Number(storeInfo_code) - 5);
                            }
                            tableModule.nTableWidth += parseInt(storeInfo_code)
                        }
                    },
                    //为table添加样式及计算初始宽度
                    setInitTable: function () {
                        ele.css({
                            "table-layout": "fixed",
                            "width": tableModule.nTableWidth,
                            "max-width": "auto"
                        });
                    },
                    //向th添加dom并设置初始宽度
                    setTh: function () {
                        var thDom = '';
                        var tableMark = ele.attr('ng-cis-grid');

                        if (!!$route.current) {
                            var controllerName = $route.current.controller;
                        } else {
                            var controllerName = 'cis';
                        }

                        var tableIdentify = controllerName + tableMark;
                        //读取存储的表格宽度信息
                        var storeInfo = tableModule.RWtableStyle.read(tableIdentify);
                        var storeInfo_code = '';

                        ele.children("thead").children('tr').children('th').each(function () {
                            tableModule.thHtml = $(this).html();
                            //判断是否允许排序，添加dom
                            tableModule.colName = $(this).attr('colname');
                            if (tableModule.colName == null || tableModule.colName == undefined) {
                                console.error('Colname is not defined');
                            } else if (tableModule.colName.replace(/\s/g, '').length == 0) {
                                console.error("Colname's value can't be empty");
                            }

                            tableModule.allowsort = $(this).attr('allowsort');
                            if (tableModule.isEmpty(tableModule.allowsort)) {
                                $(this).attr({
                                    "ng-click": "tableSort.toggle($event)"
                                });
                                thDom = tableModule.thHtml +
                                '<i class="tableSortIcon glyphicon {{ ' + tableMark + '.sortCode.' + tableModule.colName + '.sortOrder| orderClass}}"></i>';
                            } else {
                                thDom = tableModule.thHtml;
                                $(this).addClass('noSortCursor')
                            }
                            //判断是否可拖拽,添加dom
                            tableModule.allowresize = $(this).attr('allowresize');
                            if (tableModule.allowresize == 'true' || tableModule.allowresize == undefined) {
                                thDom += '<span class="moveBorder"></span>';
                            }
                            //获取表格宽度并赋值
                            $(this).addClass('subdiv').html(thDom);

                            //给表格宽度赋值
                            if (storeInfo == false) {
                                storeInfo_code = false;
                            } else {
                                storeInfo_code = storeInfo[tableModule.colName];
                            }
                            tableModule.setThWidth($(this), storeInfo_code);
                        });



                        //设置table宽度
                        tableModule.setInitTable();
                    },
                    //向td添加dom并设置初始宽度
                    setTd: function () {
                        ele.find('tbody>tr>td').each(function () {
                            $(this).addClass('subdiv');
                        })
                    },
                    //存储表格列宽度
                    RWtableStyle: {
                        tableStyle: {},
                        add: function (key, val) {
                            var local = JSON.parse(sessionStorage.getItem('RWtableStyle'));
                            if (local) {
                                this.tableStyle = local;
                            }
                            var url = tableModule.getUrl();


                            if (!!$route.current) {
                                var controllerName = $route.current.controller;
                            } else {
                                var controllerName = 'cis';
                            }
                            if (!this.tableStyle[url]) {
                                this.tableStyle[url] = {};
                            }
                            //key = controllerName + '-' + key;
                            this.tableStyle[url][key] = val;
                            sessionStorage.setItem('RWtableStyle', JSON.stringify(this.tableStyle));
                        },
                        read: function (key) {
                            var local = JSON.parse(sessionStorage.getItem('RWtableStyle'));
                            if (local == null || local == undefined) return false;
                            var url = tableModule.getUrl();


                            if (!!$route.current) {
                                var controllerName = $route.current.controller;
                            } else {
                                var controllerName = 'cis';
                            }
                            if (!local[url]) {
                                return false;
                            };
                            //key = controllerName + '-' + key;
                            var value = local[url][key];
                            if (value == null || value == undefined) return false;
                            return value;
                        }
                    },
                    ///表格排序存储
                    tableSortService: {
                        //数据对象
                        sortCode: {},
                        //新增
                        add: function (key, val) {
                            var local = JSON.parse(localStorage.getItem('tableSortModel'));
                            if (local) {
                                this.sortCode = local;
                            }
                            var url = tableModule.getUrl();

                            if (!!$route.current) {
                                var controllerName = $route.current.controller;
                            } else {
                                var controllerName = 'cis';
                            }




                            if (!this.sortCode[url]) {
                                this.sortCode[url] = {};
                            }

                            //key = controllerName + '-' + key;
                            this.sortCode[url][key] = val;
                            localStorage.setItem('tableSortModel', JSON.stringify(this.sortCode));
                        },
                        read: function (key) {
                            var local = JSON.parse(localStorage.getItem('tableSortModel'))
                            if (local == null || local == undefined) return false;
                            if (!!$route.current) {
                                var controllerName = $route.current.controller;
                            } else {
                                var controllerName = 'cis';
                            }

                            var url = tableModule.getUrl();
                            if (!local[url]) {
                                return false;
                            };
                            var value = local[url][key];
                            if (value == null || value == undefined) return false;
                            return value;
                        }
                    }
                }
                //初始化各项系数
                tableModule.setTh();
                tableModule.setTd();




                ///link函数
                return {
                    pre: function (scope, element, controller) {
                        //获取控制器名称
                        if (!!$route.current) {
                            var controllerName = $route.current.controller;
                        } else {
                            var controllerName = 'cis';
                        }
                        //向table的span.moveBorder绑定拖放事件
                        element.find('thead').tableMoveFn(tableModule.RWtableStyle, controllerName, $compile, scope);
                    },
                    post: function (scope, element, controller) {
                        ////创建读取排序记录的对象
                        //表格排序
                        var tableSort = scope.tableSort = {
                            //判断第一次点击的时候表格项是否为默认排序
                            flag: '',
                            //同一th的点击次数
                            nClick: 0,
                            toggle: function (ev) {

                                //获取th
                                var target = $(ev.target);
                                if (target.is('div.subdiv') || target.is('i.tableSortIcon')) {
                                    target = target.parents("th:first");
                                }

                                //记录同一th的点击次数
                                this.nClick++;
                                //获取th标识和控制器名称
                                var colName = target.attr('colname');
                                var tableMark = target.parents('table:first').attr('ng-cis-grid-copyHead');

                                if (!!$route.current) {
                                    var controllerName = $route.current.controller;
                                } else {
                                    var controllerName = 'cis';
                                }

                                var tableIdentify = controllerName + tableMark;
                                //删除除点击之外的th记录,只保持记录一条排序项
                                for (var k in this.sortCode[tableIdentify]) {
                                    if (k != colName) {
                                        delete this.sortCode[tableIdentify][k];
                                    }
                                }
                                //如果该th未被点击过，则记录点击项和排序顺序

                                if (this.sortCode[tableIdentify][colName] == null || this.sortCode[tableIdentify][colName] == undefined) {
                                    this.sortCode[tableIdentify][colName] = {
                                        colName: colName,
                                        sortOrder: ''
                                    }
                                }
                                var sortOrder = this.sortCode[tableIdentify][colName].sortOrder;
                                if ((tableIdentify + '-' + colName) != this.prevOth) {
                                    this.nClick = 1;
                                }
                                if (sortOrder == 0) {
                                    this.flag = true;
                                }

                                //判断点击次数，改变排列顺序
                                //sortOrder:  ''默认顺序，asc正序，desc倒序
                                switch (this.nClick) {
                                    case 1:
                                        if (sortOrder == '') {
                                            this.sortCode[tableIdentify][colName].sortOrder = 'desc';
                                        } else if (sortOrder == 'desc') {
                                            this.sortCode[tableIdentify][colName].sortOrder = 'asc';
                                        } else if (sortOrder == 'desc') {
                                            this.sortCode[tableIdentify][colName].sortOrder = 'desc';
                                        }
                                        break;
                                    case 2:
                                        if (this.flag == true) {
                                            this.sortCode[tableIdentify][colName].sortOrder = 'asc';
                                        } else {
                                            if (sortOrder == 'desc') {
                                                this.sortCode[tableIdentify][colName].sortOrder = '';
                                                delete this.sortCode[tableIdentify][colName];
                                            } else if (sortOrder == 'asc') {
                                                this.sortCode[tableIdentify][colName].sortOrder = '';
                                                delete this.sortCode[tableIdentify][colName];
                                            }
                                        }
                                        break;
                                    case 3:
                                        if (this.flag == true) {
                                            this.sortCode[tableIdentify][colName].sortOrder = '';
                                            delete this.sortCode[tableIdentify][colName];
                                            this.flag = false;
                                        } else {
                                            this.sortCode[tableIdentify][colName].sortOrder = 'desc';
                                        }
                                        this.nClick = 0;
                                        break;
                                }


                                //记录上次点击的th
                                this.prevOth = tableIdentify + '-' + colName;

                                //存储排序项
                                //tableModule.tableSortService.add(tableIdentify, this.sortCode[tableIdentify]);

                                //记录在未加载数据前的排序情况
                                if (!!this.sortCode[tableIdentify][colName]) {
                                    scope[tableMark].queryPrarms.tableOrderName = this.sortCode[tableIdentify][colName].colName;
                                    scope[tableMark].queryPrarms.tableOrderSort = this.sortCode[tableIdentify][colName].sortOrder;
                                } else {
                                    scope[tableMark].queryPrarms.tableOrderName = '';
                                    scope[tableMark].queryPrarms.tableOrderSort = '';
                                }
                                //回调函数，执行控制器中的获取数据的方法
                                if (scope[tableMark].items != undefined && scope[tableMark].items != null && scope[tableMark].items.length != 0) {
                                    if (!!scope[tableMark].sort) {
                                        if (!!this.sortCode[tableIdentify][colName]) {
                                            scope[tableMark].sort(this.sortCode[tableIdentify][colName].colName, this.sortCode[tableIdentify][colName].sortOrder);
                                        } else {
                                            scope[tableMark].sort('', '');
                                        }
                                    } else {
                                        console.error('$scope.' + tableMark + '.sort is not defined');
                                    }
                                }

                            },
                            //上次点击的th
                            prevOth: '',
                            //排序的字段和顺序
                            sortCode: {}
                        };

                        //获取控制器名称
                        if (!!$route.current) {
                            var controllerName = $route.current.controller;
                        } else {
                            var controllerName = 'cis';
                        }
                        var tableMark = element.attr('ng-cis-grid');
                        var tableIdentify = controllerName + tableMark;
                        //读取存储的排序值
                        var o = tableModule.tableSortService.read(tableIdentify);
                        if (!!scope[tableMark]) {
                            //储存排序
                            //if (o != null && o != undefined && o != false) {
                            //    tableSort.sortCode[tableIdentify] = scope[tableMark].sortCode = o;
                            //    for (var k in tableSort.sortCode[tableIdentify]) {
                            //        scope[tableMark].queryPrarms.tableOrderName = tableSort.sortCode[tableIdentify][k].colName;
                            //        scope[tableMark].queryPrarms.tableOrderSort = tableSort.sortCode[tableIdentify][k].sortOrder;
                            //    }

                            //} else {
                            //    tableSort.sortCode[tableIdentify] = {};
                            //}

                            //不存储排序
                            tableSort.sortCode[tableIdentify] = scope[tableMark].sortCode = {};
                        } else {
                            console.error('$scope.' + tableMark + ' is not defined');
                        }

                    }

                }
            }
        }
    })


    //提示工具
    directives.directive('rel', function () {
        return {
            restrict: "A",
            link: function (scope, element, attr) {
                if (attr.rel != 'tooltip') return;
                var tool = element.attr('ng-bind');
                scope.$watch(tool, function (a, b) {
                    if (a != undefined || a != b) {
                        $(element).tooltip();
                        //$(element).attr('data-original-title', a)
                    }
                })
            }
        }

    })

    //新分页
    directives.directive('ngCisGridPager', function () {
        return {
            restrict: "EA",
            replace: true,
            transclude: true,
            scope: {
                ngCisGridPager: '='
            },
            templateUrl: "./templates/templates/lgPagelist.html",
            link: function ($scope, $element, $attr, ctrl) {

                var pageModule = $scope.pageModule = {
                    pageSize: 10,
                    arrPageSize: [10, 25, 50],
                    pageIndex: 1,
                    //分页按钮的最大数量
                    maxPageCount: 7,
                    pageStarIndex: 0,
                    pageEndInde: 0,
                    pages: [],
                    TotalPages: 0,
                    TotalCount: 0,
                    getPages: function (TotalCount) {
                        this.pages = [];
                        this.TotalCount = TotalCount;
                        this.TotalPages = Math.ceil(TotalCount / this.pageSize);
                        var pageMathIndex = Math.floor(this.maxPageCount / 2);
                        if (this.TotalPages < this.maxPageCount) {
                            //如果分页总数个数小于要显示的分页按钮数量
                            this.pageStarIndex = 1;
                            this.pageEndInde = this.TotalPages;
                        } else {
                            //总数大于显示按钮数量
                            if (this.TotalPages - pageMathIndex < this.pageIndex) {
                                //当前页数大于
                                this.pageStarIndex = this.TotalPages - this.maxPageCount + 1;
                                this.pageEndInde = this.TotalPages;
                            }
                            else {
                                if (this.pageIndex - pageMathIndex < 1) {
                                    //当前页数小于
                                    this.pageStarIndex = 1;
                                    this.pageEndInde = this.maxPageCount;
                                } else {
                                    //当前页数大于分页按钮数量的中间数的时候，pages更改
                                    this.pages = [1, 2, '...', this.pageIndex - 1, this.pageIndex, this.pageIndex + 1, '....', this.TotalPages - 1, this.TotalPages];
                                    return;
                                }
                            }
                        }
                        for (var i = this.pageStarIndex; i <= this.pageEndInde; i++) {
                            this.pages.push(i)
                        }
                    },
                    //条数
                    lgPageSelectChange: function (size) {
                        $scope.ngCisGridPager.pageIndex = $scope.pageModule.pageIndex = 1;
                        if (!!$scope.ngCisGridPager.paging) {
                            $scope.ngCisGridPager.paging(pageModule.pageIndex, pageModule.pageSize);

                            if ($scope.ngCisGridPager.totalCount != undefined) {
                                pageModule.getPages($scope.ngCisGridPager.totalCount);
                            }
                        } else {
                            console.error('paging is not defined');
                            return;
                        }
                    },
                    //分页
                    chanePageIndex: function (page) {
                        if (page == '...' || page == '....') {
                            return;
                        }
                        if (page < 1) {
                            pageModule.pageIndex = 1;
                            return;
                        } else if (page > pageModule.TotalPages) {
                            pageModule.pageIndex = pageModule.TotalPages
                            return;
                        }
                        pageModule.pageIndex = page;

                        if (!!$scope.ngCisGridPager.paging) {
                            $scope.ngCisGridPager.paging(pageModule.pageIndex, pageModule.pageSize);
                            pageModule.getPages($scope.ngCisGridPager.totalCount);
                        } else {
                            console.error('paging is not defined');
                            return;
                        }

                    }
                }


                //初次加载时，为控制器中和指令中的 pageIndex,pageSize同步值
                //if ($scope.ngCisGridPager.queryPrarms.pageSize == undefined || $scope.ngCisGridPager.queryPrarms.pageIndex == undefined) {
                //    $scope.ngCisGridPager.queryPrarms.pageSize = $scope.pageModule.pageSize;
                //    $scope.ngCisGridPager.queryPrarms.pageIndex = $scope.pageModule.pageIndex;
                //} else {
                //    console.log($scope.ngCisGridPager.queryPrarms.pageSize)
                //    $scope.pageModule.pageSize = $scope.ngCisGridPager.queryPrarms.pageSize;
                //    $scope.pageModule.pageIndex = $scope.ngCisGridPager.queryPrarms.pageIndex;
                //}


                //监视数据总条数，渲染分页栏
                $scope.$watch('ngCisGridPager.totalCount', function (a, b) {
                    if (a != undefined) {
                        $scope.pageModule.pageIndex = $scope.ngCisGridPager.queryPrarms.pageIndex;
                        $scope.pageModule.pageSize = $scope.ngCisGridPager.queryPrarms.pageSize;
                        pageModule.getPages($scope.ngCisGridPager.totalCount);
                    }
                })
                //监视当前页数，同步控制器与指令中的 当前页数数据   渲染分页栏
                $scope.$watch('ngCisGridPager.queryPrarms.pageIndex', function (a, b) {
                    if ($scope.ngCisGridPager.totalCount != undefined) {
                        $scope.pageModule.pageIndex = a;
                        $scope.pageModule.pageSize = $scope.ngCisGridPager.queryPrarms.pageSize;
                        pageModule.getPages($scope.ngCisGridPager.totalCount);
                    }
                })





            }
        }
    })



    //新分页
    directives.directive('ngWindowCisGridPager', function () {
        return {
            restrict: "EA",
            replace: true,
            transclude: true,
            scope: {
                ngWindowCisGridPager: '='
            },
            templateUrl: "../../templates/templates/lgPagelist.html",
            link: function ($scope, $element, $attr, ctrl) {

                var pageModule = $scope.pageModule = {
                    pageSize: 10,
                    arrPageSize: [10, 25, 50],
                    pageIndex: 1,
                    //分页按钮的最大数量
                    maxPageCount: 7,
                    pageStarIndex: 0,
                    pageEndInde: 0,
                    pages: [],
                    TotalPages: 0,
                    TotalCount: 0,
                    getPages: function (TotalCount) {
                        this.pages = [];
                        this.TotalCount = TotalCount;
                        this.TotalPages = Math.ceil(TotalCount / this.pageSize);
                        var pageMathIndex = Math.floor(this.maxPageCount / 2);
                        if (this.TotalPages < this.maxPageCount) {
                            //如果分页总数个数小于要显示的分页按钮数量
                            this.pageStarIndex = 1;
                            this.pageEndInde = this.TotalPages;
                        } else {
                            //总数大于显示按钮数量
                            if (this.TotalPages - pageMathIndex < this.pageIndex) {
                                //当前页数大于
                                this.pageStarIndex = this.TotalPages - this.maxPageCount + 1;
                                this.pageEndInde = this.TotalPages;
                            }
                            else {
                                if (this.pageIndex - pageMathIndex < 1) {
                                    //当前页数小于
                                    this.pageStarIndex = 1;
                                    this.pageEndInde = this.maxPageCount;
                                } else {
                                    //当前页数大于分页按钮数量的中间数的时候，pages更改
                                    this.pages = [1, 2, '...', this.pageIndex - 1, this.pageIndex, this.pageIndex + 1, '....', this.TotalPages - 1, this.TotalPages];
                                    return;
                                }
                            }
                        }
                        for (var i = this.pageStarIndex; i <= this.pageEndInde; i++) {
                            this.pages.push(i)
                        }
                    },
                    //条数
                    lgPageSelectChange: function (size) {
                        $scope.ngWindowCisGridPager.pageIndex = $scope.pageModule.pageIndex = 1;
                        if (!!$scope.ngWindowCisGridPager.paging) {
                            $scope.ngWindowCisGridPager.paging(pageModule.pageIndex, pageModule.pageSize);

                            if ($scope.ngWindowCisGridPager.totalCount != undefined) {
                                pageModule.getPages($scope.ngWindowCisGridPager.totalCount);
                            }
                        } else {
                            console.error('paging is not defined');
                            return;
                        }
                    },
                    //分页
                    chanePageIndex: function (page) {
                        if (page == '...' || page == '....') {
                            return;
                        }
                        if (page < 1) {
                            pageModule.pageIndex = 1;
                            return;
                        } else if (page > pageModule.TotalPages) {
                            pageModule.pageIndex = pageModule.TotalPages
                            return;
                        }
                        pageModule.pageIndex = page;

                        if (!!$scope.ngWindowCisGridPager.paging) {
                            $scope.ngWindowCisGridPager.paging(pageModule.pageIndex, pageModule.pageSize);
                            pageModule.getPages($scope.ngWindowCisGridPager.totalCount);
                        } else {
                            console.error('paging is not defined');
                            return;
                        }

                    }
                }

                //监视数据总条数，渲染分页栏
                $scope.$watch('ngWindowCisGridPager.totalCount', function (a, b) {
                    if (a != undefined) {
                        $scope.pageModule.pageIndex = $scope.ngWindowCisGridPager.queryPrarms.pageIndex;
                        $scope.pageModule.pageSize = $scope.ngWindowCisGridPager.queryPrarms.pageSize;
                        pageModule.getPages($scope.ngWindowCisGridPager.totalCount);
                    }
                })
                //监视当前页数，同步控制器与指令中的 当前页数数据   渲染分页栏
                $scope.$watch('ngWindowCisGridPager.queryPrarms.pageIndex', function (a, b) {
                    console.log($scope.ngWindowCisGridPager)
                    if ($scope.ngWindowCisGridPager.totalCount != undefined) {
                        $scope.pageModule.pageIndex = a;
                        $scope.pageModule.pageSize = $scope.ngWindowCisGridPager.queryPrarms.pageSize;
                        pageModule.getPages($scope.ngWindowCisGridPager.totalCount);
                    }
                })





            }
        }
    })


    //循环渲染完成
    directives.directive('onFinishRender', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attr) {
                if (scope.$last == true) {
                    var finishFun = scope.$parent[attr.onFinishRender];
                    if (finishFun) {
                        finishFun();
                    }
                }
            }
        }
    })


    //点击导航添加tab
    directives.directive('navList', function () {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope, ele) {
                //点击添加右侧内容区tab
                scope.clickNav = function (ev) {
                    var target = $(ev.target);
                    if (target.is('a')) {
                        target = target.parent('li');
                    }
                    var item = {};
                    item.url = target.attr('data-url');
                    item.name = target.children('a').text();
                    var isHave = false;
                    if (scope.navChoose.arr.length > 0) {
                        for (var i = 0, len = scope.navChoose.arr.length; i < len; i++) {
                            if (scope.navChoose.arr[i].url == item.url) {
                                isHave = true;
                            }
                        }
                    };
                    if (isHave == false) {
                        scope.navChoose.arr.push(item);
                        scope.navChoose.checked = item.url;
                    } else {
                        if (item.url == scope.navChoose.checked) {
                            return;
                        }
                        scope.navChoose.checked = item.url;
                    }
                }

                //菜单动画
                ele.find('a.leve1Select').click(function () {
                    var $th = $(this);
                    $th.next('ul.navBar_level2').slideToggle('fast', function () {
                        var img = $th.siblings('.navIcon_right').children('img');
                        if (img.hasClass('rotate180')) {
                            img.removeClass('rotate180');
                        } else {
                            img.addClass('rotate180');
                        }


                    });
                })
            }
        }
    })


    //日期控件获取值
    directives.directive('formDatetime', function () {
        return {
            restrict: 'C',
            link: function (scope, ele) {
                $(ele).blur(function () {
                    var model = $(this).attr("ng-model");
                    scope[model] = $(this).val();
                })
            }
        }

    })


    //tab标题点击移动效果
    directives.directive('tabMoveHandler', function () {
        return {
            restrict: "A",
            link: function (scope, ele, attr) {
                var moveHandler = scope.moveHandler = {
                    options: {
                        outerBox: $(".h_tabout"),
                        innerBox: $(".h_tabList"),
                        next: $(".h_rightBtn"),
                        prev: $(".h_leftBtn"),
                        w: null,
                        innerLeft: null,
                        thLeft: null
                    },
                    init: function () {
                        if (!this.options.next.attr("data-cli")) {
                            this.options.next.bind("click", this.rightMove);
                            this.options.next.attr("data-cli", "true");

                        }
                        if (!this.options.prev.attr("data-cli")) {
                            this.options.prev.bind("click", this.leftMove);
                            this.options.prev.attr("data-cli", "true");
                        }
                    },
                    leftMove: function () {
                        var options = moveHandler.options;
                        options.next.unbind("click", moveHandler.rightMove);
                        options.prev.unbind("click", moveHandler.leftMove);
                        var allW = null;
                        options.innerLeft = parseInt(Math.abs(options.innerBox.position().left));

                        $(".h_tabList>li").each(function () {
                            var th = $(this);
                            options.thLeft = parseInt(th.position().left);
                            allW += parseInt(th.outerWidth(true));
                            if (options.thLeft == options.innerLeft) {
                                options.w = parseInt(th.outerWidth(true));
                            }
                        })
                        if (options.innerLeft != 0 && options.innerLeft + options.w == allW) {
                            options.innerBox.css({ "left": -options.innerLeft });
                            options.next.bind("click", moveHandler.rightMove);
                            return;
                        } else {
                            options.innerBox.animate({ "left": parseInt(-(options.innerLeft + options.w)) }, 200, function () {
                                options.next.bind("click", moveHandler.rightMove);
                                options.prev.bind("click", moveHandler.leftMove);
                            })
                        }
                    },
                    rightMove: function () {
                        var options = moveHandler.options;
                        options.next.unbind("click", moveHandler.rightMove);
                        options.prev.unbind("click", moveHandler.leftMove);
                        $(".h_tabList>li").each(function () {
                            var th = $(this);
                            options.thLeft = parseInt(th.position().left);
                            options.innerLeft = parseInt(Math.abs(options.innerBox.css("left").replace("px", "")));
                            if (parseInt(th.outerWidth(true)) == options.innerLeft - options.thLeft) {
                                options.w = parseInt(th.outerWidth(true));
                            }
                        })
                        if (options.innerLeft == 0) {
                            options.innerBox.css({ "left": 0 });
                            options.prev.bind("click", moveHandler.leftMove);
                            return;
                        } else {
                            options.innerBox.animate({ "left": parseInt(-(options.innerLeft - options.w)) }, 200, function () {
                                options.next.bind("click", moveHandler.rightMove);
                                options.prev.bind("click", moveHandler.leftMove);
                            })
                        }
                    }
                }
                moveHandler.init();
            }
        }
    })

    //设置元素占位隐藏
    directives.directive('ngVisibility', ['$rootScope', '$animate', function ($rootScope, $animate) {
        return {
            restrict: "A",
            link: function ($scope, $element, $attr) {
                $scope.$watch($attr.ngVisibility, function ngVisibilityAction(value) {
                    $animate[$rootScope.baseCommonFn.toBoolean(value) ? 'addClass' : 'removeClass']($element, 'visibility');
                });
            }
        }
    }])



    //弹窗页面列表详情展示收起效果
    directives.directive('showTriangle', function () {
        return {
            restrict: "A",
            link: function (scope, ele, attr) {
                scope.trShowHandler = {
                    ShowTriangle: function (id) {
                        var trCont = $(".m_CallTable tbody>tr[data-mark='" + id + "toggle" + "']");
                        if (trCont.is(":visible")) {
                            trCont.hide();
                            ele.children('img').removeClass('rotate90');

                        } else {
                            trCont.show();
                            ele.children('img').addClass('rotate90');
                        }
                    }
                }
            }
        }
    })

    //多选按钮选择
    directives.directive('allCheckbox', function ($compile) {
        return {
            restrict: 'A',
            //scope: false,
            link: function ($scope, $element) {
                //如果点击的是模拟的固定表头里面的checkbox；
                var allCheckBoxFn = {
                    eleClick: function () {
                        var th = $(this);
                        if (th.prop('checked') == true) {
                            tbody.find(":checkbox").prop('checked', true);
                        } else {
                            tbody.find(":checkbox").prop('checked', false);
                        }
                    },
                    bodyClick: function () {
                        var headCheckBox = $(this).parents('.tableInnerOverflow').prev('.tableHeadOverflow').children('table').children('thead').find(':checkbox[all-checkbox]');
                        $(this).parents('tbody').find(':checkbox').each(function () {
                            if ($(this).prop("checked") == false) {
                                headCheckBox.prop('checked', false);
                                return false;
                            } else {
                                headCheckBox.prop('checked', true);
                            }
                        })
                    }
                }

                var eleParent = $element.parents('table:first').parent();
                if (eleParent.length == 1 && eleParent.is('.tableInnerOverflow')) {
                    var ele = eleParent.prev('.tableHeadOverflow').children('table').children('thead').find(':checkbox[all-checkbox]');
                    var tableCheck = eleParent.next('.tableInnerOverflow').children('table').children('thead').find(':checkbox[all-checkbox]');
                    var tbody = $element.parents('table:first').children('tbody');
                } else {
                    return;
                }


                ele.off('click', allCheckBoxFn.eleClick);
                ele.on('click', allCheckBoxFn.eleClick)

                $(document).off('click', 'tbody :checkbox', allCheckBoxFn.bodyClick);
                $(document).on('click', 'tbody :checkbox', allCheckBoxFn.bodyClick);

            }
        }
    })


    ////获取失败列表
    directives.directive('isFail', function () {
        return {
            restrict: "A",
            link: function (scope, ele, attr) {
                ele.click(function () {
                    scope.policyInformationGrid.search();
                })
            }
        }
    })


    //获取保险产品弹窗
    directives.directive('getPmodal', ['$modal', function ($modal) {
        return {
            restrict: "A",
            link: function (scope, ele, attr) {
                scope.getPmoal = function () {
                    var modalInstance = $modal.open({
                        templateUrl: '/public/templates/Business/SelectInsurance.html',
                        controller: 'Business_SelectInsurance',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                        }
                    });
                    modalInstance.result.then(function (dialogResult) {
                        if (!!dialogResult) {
                            scope.getPmodal_code = dialogResult;
                            //$scope.$broadcast('SelectInsuranceModel_On', dialogResult);
                        }
                    });
                }
            }
        }

    }])

});
