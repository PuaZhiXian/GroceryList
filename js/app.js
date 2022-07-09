var app = angular.module("groceryListApp",["ngRoute"])

app.controller("HomeController",["$scope",function ($scope){
    $scope.appTitle = "Grocery List";

}])
app.service("GroceryService",function($http){
    var GroceryService ={};

    GroceryService.groceryItems=[];

    $http({
        method: 'GET',
        url: 'data/server_data.json'
    }).then(function (response){
        GroceryService.groceryItems=response.data;
        for (var item in GroceryService.groceryItems){
            GroceryService.groceryItems[item].createdDate= new Date(GroceryService.groceryItems[item].createdDate);
        }
    },function (error){
        alert("Something wrong!!");
    });

    GroceryService.getNewId = function(){
        if(GroceryService.newId){
            GroceryService.newId++;
            return GroceryService.newId;
        }else{
            var maxId = _.max(GroceryService.groceryItems, function(entry){
                return entry.id;
            })
            GroceryService.newId = maxId.id +1;
            return GroceryService.newId;
        }
    }
    GroceryService.findById = function(id){
        for (var item in GroceryService.groceryItems){
            if(GroceryService.groceryItems[item].id === id){
                return GroceryService.groceryItems[item]
            }
        }
    }

    GroceryService.saveItem= function(itemObj){
        var updatedItem = GroceryService.findById(itemObj.id)


        if(updatedItem){
            $http({
                method:'GET',
                url : 'data/updated_item.json'
            }).then(function(response){
                if(response.data.status ===1 ){
                    updatedItem.itemName = itemObj.itemName;
                    updatedItem.createdDate = itemObj.createdDate;
                    updatedItem.completed = itemObj.completed;
                }
            },function (error){
                alert("Something wrong!!");
            });
        }else{
            $http({
                method: 'GET',
                url: 'data/add_item.json'
            }).then(function (response){
                // itemObj.id=response.data.newId;
                itemObj.id = GroceryService.getNewId();
                GroceryService.groceryItems.push(itemObj);
                console.log(GroceryService.groceryItems)
            },function (error){
                alert("Something wrong!!");
            });
        }
    };

    GroceryService.removeItem = function(item){
        $http({
            method: "GET",
            url : 'data/delete_item.json'
        }).then(function(response){
            if(response.data.status ===1){
                var index = GroceryService.groceryItems.indexOf(item);
                GroceryService.groceryItems.splice(index,1);
            }
        },function(error){
            alert("Something wrong!!")
        })
    }

    GroceryService.CompletionToggle = function(item){
        item.completed = !item.completed;
    }
    return GroceryService
})

app.controller("GroceryItemListController",["$scope","GroceryService","$location","$routeParams",function ($scope,GroceryService,$location,$routeParams){
    $scope.groceryItems = GroceryService.groceryItems
    $scope.myRegex = /^[a-zA-Z]*$/ ;

    if(!$routeParams.id){
        $scope.groceryItem = {
            id:0,
            completed : false,
            itemName : "",
            createdDate : new Date()
        }
    }else{
        $scope.groceryItem = _.clone(GroceryService.findById(parseInt($routeParams.id)));
    }
    $scope.saveItem = function(){
        GroceryService.saveItem($scope.groceryItem);
        $location.path('/');
    };
    $scope.removeItem = function(entry){
        GroceryService.removeItem(entry)
    };
    $scope.CompletionToggle = function(entry){
        GroceryService.CompletionToggle(entry)
    };
    $scope.$watch( function(){return GroceryService.groceryItems; }, function(groceryItems) {
        $scope.groceryItems = groceryItems;
    });

}])

app.config(function($routeProvider){
    $routeProvider
        .when('/',{
            templateUrl:"views/groceryItem.html",
            controller:"GroceryItemListController"
        })
        .when('/inputItemPage',{
            templateUrl:"views/inputItem.html",
            controller:"GroceryItemListController"
        })
        .when("/inputItemPage/edit/:id",{
            templateUrl:"views/inputItem.html",
            controller : "GroceryItemListController"
        })
        .otherwise({
            redirectTo:'/'
        })
})