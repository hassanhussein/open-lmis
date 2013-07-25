/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

function CreateRegimenLineItemController($scope, $location, $routeParams, $dialog, RequisitionService) {

  $scope.visibleTab = "regimen";


  $scope.getId = function (prefix, parent) {
    return prefix + "_" + parent.$parent.$index;
  };

  $scope.$on('rnrInitialized', function (event, data) {
    initController(data);
  });

  RequisitionService.stuffScope($scope, $location, $routeParams, $dialog);

  function initController(data) {
    $scope.pageSize = data.pageSize;
    $scope.rnr = data.requisition;
    $scope.allTypes = data.lossesAndAdjustmentsTypes;
    $scope.facilityApprovedProducts = data.facilityApprovedProducts;
    $scope.visibleColumns = _.where(data.rnrColumnList, {'visible': true});
    $scope.programRnrColumnList = data.rnrColumnList;
    $scope.requisitionRights = data.requisitionRights;
    $scope.regimenColumns = data.regimenTemplate ? data.regimenTemplate.columns : [];
    $scope.visibleRegimenColumns = _.where($scope.regimenColumns, {'visible': true});
    $scope.addNonFullSupplyLineItemButtonShown = _.findWhere($scope.programRnrColumnList, {'name': 'quantityRequested'});
    $scope.regimenCount = $scope.rnr.regimenLineItems.length;
    $scope.currency = data.currency;

    RequisitionService.prepareRnr($scope, $routeParams);

    $scope.showCategory = function (index) {
      return !((index > 0 ) && ($scope.rnr.regimenLineItems[index].category.name == $scope.rnr.regimenLineItems[index - 1].category.name));
    };

  }


  var data = RequisitionService.initialize();
  if (data) {
    initController(data);
  }
  $scope.message = RequisitionService.message;

};