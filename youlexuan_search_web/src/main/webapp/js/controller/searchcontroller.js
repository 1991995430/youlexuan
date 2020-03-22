app.controller('searchController',function ($scope,searchService,$location) {

    $scope.search = function () {
        searchService.search($scope.searchMap).success(function (response) {
            $scope.resultMap = response;
            buildPageLabel();
        })
    }

    //定义搜索对象
    $scope.searchMap = {'keywords':'','category':'','brand':''
        ,'spec':{},'price':'','pageNo':1,'pageSize':40 ,'sortField':'','sort':''};

    $scope.addSearchItem = function(key,value){
        if(key=='category' || key=='brand'||key=='price'){//如果点击的是分类或者是品牌
            $scope.searchMap[key]=value;
        }else{
            $scope.searchMap.spec[key]=value;
        }
        $scope.search();
    }

    $scope.removeSearchItem=function(key){
        if(key=="category" || key=="brand"||key=='price'){//如果是分类或品牌
            $scope.searchMap[key]="";
        }else{//否则是规格
            delete $scope.searchMap.spec[key];//移除此属性
        }
        $scope.search();
    }

    //构建分页标签
    buildPageLabel = function () {
        $scope.pageLabel = [];   //定义页码数组

        var maxPageNo = $scope.resultMap.totalPages;
        var firstPage = 1;
        var lastPage = maxPageNo;
        $scope.firstDot=true;//前面有点
        $scope.lastDot=true;//后边有点
        if($scope.searchMap.totalPages>5){
            if($scope.resultMap.pageNo<=3){
                lastPage = 5;
                $scope.firstDot=false;//前面没点
            }else if($scope.searchMap.pageNo>=lastPage-2){
                firstPage = maxPageNo - 4;
                $scope.lastDot=false;//后边没点
            }else{
                firstPage = $scope.searchMap.pageNo-2;
                lastPage = $scope.searchMap.pageNo+2;
            }
        }else{
            $scope.firstDot=false;//前面无点
            $scope.lastDot=false;//后边无点
        }
        //循环产生的页码标签
        for(var i = firstPage;i<=lastPage;i++){
            $scope.pageLabel.push(i);
        }

    }

    //设置排序
    $scope.sortSearch=function(sortField,sort){
        $scope.searchMap.sortField=sortField;
        $scope.searchMap.sort=sort;
        $scope.search();
    }

    //判断关键字是不是品牌
    $scope.keywordsIsBrand=function(){
        for(var i=0;i<$scope.resultMap.brandList.length;i++){
            if($scope.searchMap.keywords.indexOf($scope.resultMap.brandList[i].text)>=0){//如果包含
                return true;
            }

        }
        return false;
    }

    //加载查询字符串
    $scope.loadkeywords=function(){
        $scope.searchMap.keywords= $location.search()['keywords'];
        $scope.search();
    }

});