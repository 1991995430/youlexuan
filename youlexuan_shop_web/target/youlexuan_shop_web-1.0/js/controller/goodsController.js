 //控制层 
app.controller('goodsController' ,function($scope,$location,$controller,goodsService,uploadService,itemCatService,typeTemplateService){
	
	$controller('baseController',{$scope:$scope});//继承
	
    //读取列表数据绑定到表单中  
	$scope.findAll=function(){
		goodsService.findAll().success(
			function(response){
				$scope.list=response;
			}			
		);
	}    
	
	//分页
	$scope.findPage=function(page,rows){			
		goodsService.findPage(page,rows).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}



	
	//查询实体 
	$scope.findOne=function(id){

	    var id = $location.search()['id'];

	    if(id==null){
	        return ;
        }

		goodsService.findOne(id).success(
			function(response){
				$scope.entity= response;

				editor.html($scope.entity.goodsDesc.introduction);

				//显示图片列表
                $scope.entity.goodsDesc.itemImages =
                    JSON.parse($scope.entity.goodsDesc.itemImages);

                //显示扩展属性
                $scope.entity.goodsDesc.customAttributeItems =
                    JSON.parse($scope.entity.goodsDesc.customAttributeItems);

                $scope.entity.goodsDesc.specificationItems=JSON.parse($scope.entity.goodsDesc.specificationItems);
                for( var i=0;i<$scope.entity.itemList.length;i++ ){
                    $scope.entity.itemList[i].spec =
                        JSON.parse( $scope.entity.itemList[i].spec);
                }
			}
		);				
	}

    //根据规格名称和选项名称返回是否被勾选
    $scope.checkAttributeValue=function(specName,optionName){
        var items= $scope.entity.goodsDesc.specificationItems;
        var object= $scope.searchObjectByKey(items,'attributeName',specName);
        if(object==null){
            return false;
        }else{
            if(object.attributeValue.indexOf(optionName)>=0){
                return true;
            }else{
                return false;
            }
        }
    }
	
	//保存 
	$scope.save=function(){				
		var serviceObject;//服务层对象
        //判断是新增还是修改 通过entity里面是否有id
		if($scope.entity.id!=null){     //如果有ID
			serviceObject=goodsService.update( $scope.entity ); //修改  
		}else{
			serviceObject=goodsService.add( $scope.entity  );//增加 
		}				
		serviceObject.success(
			function(response){
				if(response.success){
					//重新查询 
		        	$scope.reloadList();//重新加载
				}else{
					alert(response.message);
				}
			}		
		);				
	}
	
	 
	//批量删除 
	$scope.dele=function(){			
		//获取选中的复选框			
		goodsService.dele( $scope.selectIds ).success(
			function(response){
				if(response.success){
					$scope.reloadList();//刷新列表
					$scope.selectIds=[];
				}						
			}		
		);				
	}
	
	$scope.searchEntity={};//定义搜索对象 
	
	//搜索
	$scope.search=function(page,rows){			
		goodsService.search(page,rows,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}

    $scope.add=function(){
        $scope.entity.goodsDesc.introduction=editor.html();
        goodsService.add( $scope.entity ).success(
            function(response){
                if(response.success){
                    alert('保存成功');
                    $scope.entity={};
                    $scope.entity={ goodsDesc:{itemImages:[],specificationItems:[]} };
                    editor.html('');//清空富文本编辑器
                }else{
                    alert(response.message);
                }
            }
        );
    }


    $scope.uploadFile = function () {
        uploadService.uploadFile().success(function (response) {

            if(response.success){
                $scope.image_entity.url = response.message;
            }else{
                alert(response.message);
            }
        }).error(function () {
            alert("上传发生错误");
        });
    }

    //为goods对象开辟空间 goods.goodsDesc
    $scope.entity = {goods:{},goodsDesc:{itemImages:[],specificationItems:[]}};

	//添加图片列表
    $scope.add_image_entity = function () {
        $scope.entity.goodsDesc.itemImages.push($scope.image_entity);
    }

    $scope.selectItemCat1List = function () {
        itemCatService.findByParentId(0).success(function (response) {
            $scope.itemCat1List = response;
        })
    }

    $scope.$watch('entity.goods.category1Id',function (newValue,oldValue) {

        if(newValue){

            itemCatService.findByParentId(newValue).success(function (response) {
                $scope.itemCat2List = response;
            })
        }

    })

    $scope.$watch('entity.goods.category2Id',function (newValue,oldValue) {

        if(newValue){

            itemCatService.findByParentId(newValue).success(function (response) {
                $scope.itemCat3List = response;
            })
        }

    })

    $scope.$watch('entity.goods.category3Id',function (newValue,oldValue) {

        if(newValue){

            itemCatService.findOne(newValue).success(function (response) {
                $scope.entity.goods.typeTemplateId=response.typeId;
            })
        }

    })

    $scope.$watch('entity.goods.typeTemplateId',function (newValue,oldValue) {

        if(newValue){

            typeTemplateService.findOne(newValue).success(function (response) {
                $scope.typeTemplate=response;//获取类型模板
                $scope.typeTemplate.brandIds=
                    JSON.parse( $scope.typeTemplate.brandIds);//品牌列表
            })
        }

    })

//模板 ID 选择后 更新模板对象
    $scope.$watch('entity.goods.typeTemplateId', function(newValue, oldValue) {
        if(newValue){
           // alert($scope.entity.goodsDesc.specificationItems.length);
           $scope.entity.goodsDesc.specificationItems.splice(0,$scope.entity.goodsDesc.specificationItems.length);
            //alert($scope.entity.goodsDesc.specificationItems);

            typeTemplateService.findOne(newValue).success(
                function(response){
                    $scope.typeTemplate=response;//获取类型模板
                    $scope.typeTemplate.brandIds=JSON.parse( $scope.typeTemplate.brandIds);//品牌列表
                    if($location.search()['id']==null) {
                        $scope.entity.goodsDesc.customAttributeItems = JSON.parse($scope.typeTemplate
                            .customAttributeItems);//扩展属性
                    }
                }
            );

            typeTemplateService.findSpecList(newValue).success(function (response) {
                $scope.specList = response;
            })
        }
    });

    //点击规格属性单选框触发方法
    $scope.updateSpecAttribute = function ($event,name,value) {
        //alert($scope.entity.goodsDesc.specificationItems);

      var object = $scope.searchObjectByKey($scope.entity.goodsDesc.specificationItems,'attributeName',name);
      if(object!=null){
          //alert($scope.entity.goodsDesc.specificationItems);
          if($event.target.checked){
              /*if($scope.entity.goodsDesc.specificationItems!=null&&$scope.entity.goodsDesc.specificationItems.attributeName){
              }*/

              object.attributeValue.push(value);
          }else{
              object.attributeValue.splice(object.attributeValue.indexOf(value,1));

              if(object.attributeValue.length==0){
                  $scope.entity.goodsDesc.specificationItems.splice($scope.entity.goodsDesc.specificationItems.indexOf(object),1);
              }
          }
      }else{
          $scope.entity.goodsDesc.specificationItems.push({"attributeName":name,"attributeValue":[value]});
      }
    }

    //创建SKU列表
    $scope.createItemList = function () {

        //创建初始列表
        $scope.entity.itemList = [{spec:{},price:0,status:'0',isDefault:'0'}];
        //获取点击复选框后选择的规格属性 数组
        var items = $scope.entity.goodsDesc.specificationItems;
        //遍历规格数组 获取规格名和规格的值 规格的值是数组
        for(var i=0;i<items.length;i++){
           $scope.entity.itemList = addColumn($scope.entity.itemList,items[i].attributeName,items[i].attributeValue)

        }
    }
//[{"attributeName":"网络制式","attributeValue":["移动4G"]},{"attributeName":"屏幕尺寸","attributeValue":["5.5寸","4.5寸"]}]
    //传过来遍历出来的之前查出来的集合
    addColumn = function (list,columnName,columnValues) {
        var newList = [];  //新的集合
        //遍历传过来初始化的集合
        for(var i=0;i<list.length;i++){
            var oldRow = list[i];

            for(var j=0;j<columnValues.length;j++){
                //深克隆
                var newRow = JSON.parse(JSON.stringify(oldRow));

                newRow.spec[columnName] = columnValues[j];

                newList.push(newRow);
            }
        }
        return newList;
    }

    //根据规格名称和选项名称返回是否被勾选
    $scope.checkAttributeValue=function(specName,optionName){
        var items= $scope.entity.goodsDesc.specificationItems;
        var object= $scope.searchObjectByKey(items,'attributeName',specName);
        if(object==null){
            return false;
        }else{
            if(object.attributeValue.indexOf(optionName)>=0){
                return true;
            }else{
                return false;
            }
        }
    }

    $scope.status=['未审核','已审核','审核未通过','关闭'];//商品状态

    $scope.itemCatList = [];

    $scope.findItemCatList = function () {
        itemCatService.findAll().success(function (response) {
            for(var i=0;i<response.length;i++){
                $scope.itemCatList[response[i].id] = response[i].name;
            }
        })
    }
});	