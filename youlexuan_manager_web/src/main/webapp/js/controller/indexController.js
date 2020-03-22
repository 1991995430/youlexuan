app.controller('indexController',function ($scope,$controller,loginService) {
    
    loginService.loginName().success(function (response) {
        $scope.loginName=response.loginName;
    })
    
});