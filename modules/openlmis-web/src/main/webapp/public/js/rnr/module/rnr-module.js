/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

var rnrModule = angular.module('rnr', ['openlmis', 'ngGrid', 'ui.bootstrap.modal', 'ui.bootstrap.dropdownToggle', 'ui.bootstrap.dialog']).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.
      when('/init-rnr', {controller: InitiateRnrController, templateUrl: 'partials/create/init.html', resolve: InitiateRnrController.resolve}).
      when('/create-rnr/:rnr/:facility/:program', {controller: CreateRequisitionController, templateUrl: 'partials/create/index.html', resolve: CreateRequisitionController.resolve, reloadOnSearch: false}).
      when('/rnr-for-approval', {controller: ApproveRnrListController, templateUrl: 'partials/approve/list-for-approval.html', resolve: ApproveRnrListController.resolve}).
      when('/requisitions-for-convert-to-order', {controller: ConvertToOrderListController, templateUrl: 'partials/convert-to-order-list.html', resolve: ConvertToOrderListController.resolve}).
      when('/view-requisitions', {controller: ViewRnrListController, templateUrl: 'partials/view/index.html', resolve: ViewRnrListController.resolve}).
      when('/rnr-for-approval/:rnr/:program', {controller: ApproveRnrController, templateUrl: 'partials/approve/approve.html', resolve: ApproveRnrController.resolve, reloadOnSearch: false}).
      when('/requisition/:rnr/:program', {controller: ViewRnrController, templateUrl: 'partials/view/view.html', resolve: ViewRnrController.resolve, reloadOnSearch: false}).
      otherwise({redirectTo: '/init-rnr'});
  }]).directive('rnrValidator',function () {
    return {
      require: '?ngModel',
      link: function (scope, element, attrs, ctrl) {
        rnrModule[attrs.rnrValidator](element, ctrl, scope);
      }
    };
  }).run(function ($rootScope) {
    $rootScope.pageSize = 20;
  });

rnrModule.factory('RequisitionService', ["$rootScope", "$q", function ($rootScope) {

  var data = {};

  var promises = [];

  var initialized = false;

  var initializeService = function ($q, $timeout, $route, Requisitions, ProgramRnRColumnList, LossesAndAdjustmentsReferenceData, FacilityApprovedProducts, FacilityProgramRights, ProgramRegimenTemplate, ReferenceData) {
    promises.push(dataGetter.requisition($q, $timeout, Requisitions, $route));
    promises.push(dataGetter.currency($q, $timeout, ReferenceData));
    promises.push(dataGetter.rnrColumns($q, $timeout, ProgramRnRColumnList, $route));
    promises.push(dataGetter.lossesAndAdjustmentsTypes($q, $timeout, LossesAndAdjustmentsReferenceData));
    promises.push(dataGetter.facilityApprovedProducts($q, $timeout, $route, FacilityApprovedProducts));
    promises.push(dataGetter.requisitionRights($q, $timeout, $route, FacilityProgramRights));
    promises.push(dataGetter.regimenTemplate($q, $timeout, $route, ProgramRegimenTemplate));

    $q.all(promises).then(function () {
      initialized = true;
      $rootScope.$broadcast('rnrInitialized', data);
    });
  };

  var dataGetter = {

    requisition: function ($q, $timeout, Requisitions, $route) {
      var deferred = $q.defer();
      var rnr = data.requisition;
      if (rnr) {
        deferred.resolve(rnr);
      } else {
        Requisitions.get({id: $route.current.params.rnr}, function (response) {
          data.requisition = response.rnr;
          deferred.resolve(response.rnr);
        }, {});
      }
      return deferred.promise;
    },

    rnrColumns: function ($q, $timeout, ProgramRnRColumnList, $route) {
      var deferred = $q.defer();
      ProgramRnRColumnList.get({programId: $route.current.params.program}, function (response) {
        data.rnrColumnList = response.rnrColumnList;
        deferred.resolve(data.rnrColumnList);
      }, {});
      return deferred.promise;
    },

    currency: function ($q, $timeout, ReferenceData) {
      var deferred = $q.defer();
      ReferenceData.get({}, function (response) {
        data.currency = response.currency;
        deferred.resolve(data.currency);
      }, {});
      return deferred.promise;
    },

    lossesAndAdjustmentsTypes: function ($q, $timeout, LossesAndAdjustmentsReferenceData) {
      var deferred = $q.defer();
      LossesAndAdjustmentsReferenceData.get({}, function (response) {
        data.lossesAndAdjustmentsTypes = response.lossAdjustmentTypes;
        deferred.resolve(data.lossesAndAdjustmentsTypes);
      }, {});
      return deferred.promise;
    },

    facilityApprovedProducts: function ($q, $timeout, $route, FacilityApprovedProducts) {
      var deferred = $q.defer();
      FacilityApprovedProducts.get({facilityId: $route.current.params.facility, programId: $route.current.params.program}, function (response) {
        data.facilityApprovedProducts = response.nonFullSupplyProducts;
        deferred.resolve(data.facilityApprovedProducts);
      }, {});
      return deferred.promise;
    },

    requisitionRights: function ($q, $timeout, $route, FacilityProgramRights) {
      var deferred = $q.defer();
      FacilityProgramRights.get({facilityId: $route.current.params.facility, programId: $route.current.params.program}, function (response) {
        data.requisitionRights = response.rights;
        deferred.resolve(data.requisitionRights);
      }, {});
      return deferred.promise;
    },

    regimenTemplate: function ($q, $timeout, $route, ProgramRegimenTemplate) {
      var deferred = $q.defer();
      ProgramRegimenTemplate.get({programId: $route.current.params.program}, function (response) {
        data.regimenTemplate = response.template;
        deferred.resolve(data.regimenTemplate);
      }, {});
      return deferred.promise;
    }

  };

  return {
    init: initializeService
  }

}]);

rnrModule.positiveInteger = function (element, ctrl) {
  element.bind('blur', function () {
    validationFunction(ctrl.$viewValue, element.attr('name'));
  });
  ctrl.$parsers.unshift(function (viewValue) {
    if (validationFunction(viewValue, element.attr('name'))) {
      if (viewValue == "")  viewValue = undefined;
      return viewValue;
    } else {
      ctrl.$viewValue = ctrl.$modelValue;
      ctrl.$render();
      return ctrl.$modelValue;
    }
  });
  function validationFunction(value, errorHolder) {
    var INTEGER_REGEXP = /^\d*$/;
    var valid = (value == undefined) ? true : INTEGER_REGEXP.test(value);
    if (errorHolder != undefined) {
      document.getElementById(errorHolder).style.display = (valid) ? 'none' : 'block';
    }
    return valid;
  }
};

rnrModule.date = function (element, ctrl, scope) {

  var shouldSetError = element.attr('showError');

  scope.$watch(shouldSetError, function () {
    ctrl.setError = scope[shouldSetError];
    setTimeout(validationFunction, 0);
  });

  element.keyup(function () {
    if (isUndefined(ctrl.$viewValue)) document.getElementById(element.attr('name')).style.display = 'none';
  });
  element.bind('blur', validationFunction);

  element.bind('focus', function () {
    document.getElementById(element.attr('name')).style.display = 'none';
  });

  function validationFunction() {
    var DATE_REGEXP = /^(0[1-9]|1[012])[/]((2)\d\d\d)$/;
    var valid = (isUndefined(ctrl.$viewValue)) ? true : DATE_REGEXP.test(ctrl.$viewValue);

    var errorHolder = document.getElementById(element.attr('name'));
    errorHolder.style.display = (valid) ? 'none' : 'block';
    if (ctrl.setError)
      ctrl.$setValidity('date', valid);
  }
};
