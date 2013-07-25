/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

function CreateFullSupplyController($scope, $location, $dialog, RequisitionService, $routeParams, messageService) {
  $scope.visibleTab = "full-supply";
  $scope.baseUrl = "/edit/full-supply/" + $routeParams.rnr + '/' + $routeParams.facility + '/' + $routeParams.program;

  $scope.currentRnrLineItem = undefined;

  $scope.getId = function (prefix, parent) {
    return prefix + "_" + parent.$parent.$parent.$index;
  };

  $scope.saveLossesAndAdjustmentsForRnRLineItem = function () {
    $scope.modalError = '';

    if (!$scope.currentRnrLineItem.validateLossesAndAdjustments()) {
      $scope.modalError = 'Please correct the highlighted fields before submitting';
      return;
    }

    $scope.currentRnrLineItem.reEvaluateTotalLossesAndAdjustments();
    $scope.clearAndCloseLossesAndAdjustmentModal();
  };

  $scope.clearAndCloseLossesAndAdjustmentModal = function () {
    $scope.lossAndAdjustment = undefined;
    $scope.lossesAndAdjustmentsModal = false;
  };

  $scope.resetModalErrorAndSetFormDirty = function () {
    $scope.modalError = '';
    $scope.saveRnrForm.$dirty = true;
  };

  $scope.showLossesAndAdjustments = function (lineItem) {
    $scope.currentRnrLineItem = lineItem;
    updateLossesAndAdjustmentTypesToDisplayForLineItem(lineItem);
    $scope.lossesAndAdjustmentsModal = true;
  };

  $scope.removeLossAndAdjustment = function (lossAndAdjustmentToDelete) {
    $scope.currentRnrLineItem.removeLossAndAdjustment(lossAndAdjustmentToDelete);
    updateLossesAndAdjustmentTypesToDisplayForLineItem($scope.currentRnrLineItem);
    $scope.resetModalErrorAndSetFormDirty();
  };

  $scope.addLossAndAdjustment = function (newLossAndAdjustment) {
    $scope.currentRnrLineItem.addLossAndAdjustment(newLossAndAdjustment);
    updateLossesAndAdjustmentTypesToDisplayForLineItem($scope.currentRnrLineItem);
    $scope.saveRnrForm.$dirty = true;
  };

  function updateLossesAndAdjustmentTypesToDisplayForLineItem(lineItem) {
    var lossesAndAdjustmentTypesForLineItem = _.pluck(_.pluck(lineItem.lossesAndAdjustments, 'type'), 'name');

    $scope.lossesAndAdjustmentTypesToDisplay = $.grep($scope.allTypes, function (lAndATypeObject) {
      return $.inArray(lAndATypeObject.name, lossesAndAdjustmentTypesForLineItem) == -1;
    });
  }

  $scope.highlightWarningBasedOnField = function (value, field) {
    if ($scope.inputClass && (isUndefined(value) || value == false) && field) {
      return "warning-error";
    }
    return null;
  };

  $scope.getRowErrorClass = function (rnrLineItem) {
    return $scope.getCellErrorClass(rnrLineItem) ? 'row-error-highlight' : '';
  };

  $scope.getCellErrorClass = function (rnrLineItem) {
    return (typeof(rnrLineItem.getErrorMessage) != "undefined" && rnrLineItem.getErrorMessage()) ? 'cell-error-highlight' : '';
  };

  $scope.lineItemErrorMessage = function (rnrLineItem) {
    return messageService.get(rnrLineItem.getErrorMessage());
  }


//---------------------//////////////////

  RequisitionService.stuffScope($scope, $location, $routeParams, $dialog);


  //-------------------------------


  $scope.$on('rnrInitialized', function (event, data) {
    initController(data);
  });


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

    RequisitionService.prepareRnr($scope);

    if (!$scope.programRnrColumnList || $scope.programRnrColumnList.length == 0) {
      $scope.error = "error.rnr.template.not.defined";
      $location.path("/init-rnr");
    }
  }


  var data = RequisitionService.initialize();
  if (data) {
    initController(data);
  }
  $scope.message = RequisitionService.message;

}
