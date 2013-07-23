/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

function CreateNonFullSupplyController($scope, $routeParams, messageService, RequisitionService) {
  $scope.visibleNonFullSupplyColumns = _.filter($scope.visibleColumns, function (column) {
    return _.contains(RnrLineItem.visibleForNonFullSupplyColumns, column.name);
  });

  var map = _.map($scope.facilityApprovedProducts, function (facilitySupportedProduct) {
    return facilitySupportedProduct.programProduct.product.category;
  });

  $scope.nonFullSupplyProductsCategories = _.uniq(map, false, function (category) {
    return category.id;
  });

  $scope.getId = function (prefix, parent) {
    return prefix + "_" + parent.$parent.$index;
  };


  $scope.addNonFullSupplyLineItemsToRnr = function () {
    var validNonFullSupplyLineItems = [];
    var lineItem;
    var invalid = false;

    function displayProductsAddedMessage() {
      if ($scope.addedNonFullSupplyProducts.length > 0) {
        $scope.$parent.$parent.$parent.message = "msg.product.added";
        setTimeout(function () {
          $scope.$apply(function () {
            angular.element("#saveSuccessMsgDiv").fadeOut('slow', function () {
              $scope.$parent.$parent.$parent.message = '';
            });
          });
        }, 3000);
      }
    }

    $($scope.addedNonFullSupplyProducts).each(function (i, nonFullSupplyProduct) {
      lineItem = nonFullSupplyProduct;
      if (lineItem.validateQuantityRequestedAndReason()) {
        invalid = true;
        return false;
      }
      validNonFullSupplyLineItems.push(lineItem);
    });

    if (invalid) {
      $scope.modalError = 'error.correct.highlighted';
      return;
    }
    $scope.modalError = undefined;

    $(validNonFullSupplyLineItems).each(function (i, rnrLineItem) {
      $scope.rnr.nonFullSupplyLineItems.push(rnrLineItem);
      $scope.rnr.fillPacksToShip(rnrLineItem);
    });

    $scope.rnr.nonFullSupplyLineItems.sort(function (lineItem1, lineItem2) {
      return lineItem1.compareTo(lineItem2);
    });

    $scope.fillPagedGridData();
    displayProductsAddedMessage();
    //TODO form's dirty flag should not be changed
    $scope.saveRnrForm.$dirty = (validNonFullSupplyLineItems.length > 0);
    $scope.nonFullSupplyProductsModal = false;
  };


  $scope.showAddNonFullSupplyModal = function () {
    $scope.addedNonFullSupplyProducts = [];
    $scope.nonFullSupplyProductCategory = undefined;
    $scope.nonFullSupplyProductsToDisplay = undefined;
    $scope.clearNonFullSupplyProductModalData();
    $scope.nonFullSupplyProductsModal = true;
  };

  $scope.clearNonFullSupplyProductModalData = function () {
    $scope.facilityApprovedProduct = undefined;
    $scope.newNonFullSupply = undefined;
  };

  $scope.labelForRnrColumn = function (columnName) {
    if ($scope.$parent.programRnrColumnList) return _.findWhere($scope.$parent.programRnrColumnList, {'name': columnName}).label + ":";
  };

  $scope.shouldDisableAddButton = function () {
    return !($scope.newNonFullSupply && $scope.newNonFullSupply.quantityRequested && $scope.newNonFullSupply.reasonForRequestedQuantity
      && $scope.facilityApprovedProduct);
  };

  $scope.addNonFullSupplyProductsByCategory = function () {
    var prepareNFSLineItemFields = function () {
      populateProductInformation();
      $(['quantityReceived', 'quantityDispensed', 'beginningBalance', 'stockInHand', 'totalLossesAndAdjustments', 'calculatedOrderQuantity', 'newPatientCount',
        'stockOutDays', 'normalizedConsumption', 'amc', 'maxStockQuantity']).each(function (index, field) {
          $scope.newNonFullSupply[field] = 0;
        });
      $scope.newNonFullSupply.rnrId = $scope.$parent.rnr.id;
    }

    prepareNFSLineItemFields();
    var rnrLineItem = new RnrLineItem($scope.newNonFullSupply, $scope.rnr.period.numberOfMonths, $scope.programRnrColumnList, $scope.rnr.status);
    $scope.addedNonFullSupplyProducts.push(rnrLineItem);
    $scope.updateNonFullSupplyProductsToDisplay();
    $scope.clearNonFullSupplyProductModalData();
  };

  $scope.updateNonFullSupplyProductsToDisplay = function () {
    var addedNonFullSupplyProductList = _.pluck($scope.addedNonFullSupplyProducts, 'productCode').concat(_.pluck($scope.rnr.nonFullSupplyLineItems, 'productCode'));
    if ($scope.nonFullSupplyProductCategory != undefined) {
      $scope.nonFullSupplyProductsToDisplay = $.grep($scope.facilityApprovedProducts, function (facilityApprovedProduct) {
        return $.inArray(facilityApprovedProduct.programProduct.product.code, addedNonFullSupplyProductList) == -1
          && $.inArray(facilityApprovedProduct.programProduct.product.category.name, [$scope.nonFullSupplyProductCategory.name]) == 0;
      });
    }
  };

  $scope.deleteCurrentNonFullSupplyLineItem = function (index) {
    $scope.addedNonFullSupplyProducts.splice(index, 1);
    $scope.updateNonFullSupplyProductsToDisplay();
  };


  function populateProductInformation() {
    var product = {};
    if ($scope.facilityApprovedProduct != undefined) {
      angular.copy($scope.facilityApprovedProduct.programProduct.product, product);
      $scope.newNonFullSupply.productCode = product.code;
      $scope.newNonFullSupply.productName = product.primaryName;
      $scope.newNonFullSupply.product = (product.primaryName == null ? "" : (product.primaryName + " ")) +
        (product.form.code == null ? "" : (product.form.code + " ")) +
        (product.strength == null ? "" : (product.strength + " ")) +
        (product.dosageUnit.code == null ? "" : product.dosageUnit.code);
      $(['dosesPerDispensingUnit', 'packSize', 'roundToZero', 'packRoundingThreshold', 'dispensingUnit', 'fullSupply']).each(function (index,
                                                                                                                                       field) {
        $scope.newNonFullSupply[field] = product[field];
      });
      $scope.newNonFullSupply.maxMonthsOfStock = $scope.facilityApprovedProduct.maxMonthsOfStock;
      $scope.newNonFullSupply.dosesPerMonth = $scope.facilityApprovedProduct.programProduct.dosesPerMonth;
      $scope.newNonFullSupply.price = $scope.facilityApprovedProduct.programProduct.currentPrice;
      $scope.newNonFullSupply.productCategory = $scope.facilityApprovedProduct.programProduct.product.category.name;
      $scope.newNonFullSupply.productDisplayOrder = $scope.facilityApprovedProduct.programProduct.product.displayOrder;
      $scope.newNonFullSupply.productCategoryDisplayOrder = $scope.nonFullSupplyProductCategory.displayOrder;
    }
  }


  $scope.highlightRequiredFieldInModal = function (value) {
    if (isUndefined(value)) return "required-error";
    return null;
  };

  $scope.formatNoMatches = function () {
    return messageService.get('msg.no.matches.found');
  };

}


