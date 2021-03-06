/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

function ViewRnrListController($scope, facilities, RequisitionsForViewing, ProgramsToViewRequisitions, $location,
                               messageService) {
  $scope.facilities = facilities;
  $scope.facilityLabel = (!$scope.facilities.length) ? messageService.get("label.none.assigned") : messageService.get("label.select.facility");
  $scope.programLabel = messageService.get("label.none.assigned");
  $scope.selectedItems = [];

  var selectionFunc = function (rowItem, event) {
    $scope.$parent.rnrStatus = $scope.selectedItems[0].status;
    $scope.openRequisition()
  };

  $scope.rnrListGrid = { data: 'filteredRequisitions',
    displayFooter: false,
    multiSelect: false,
    selectedItems: $scope.selectedItems,
    afterSelectionChange: selectionFunc,
    displaySelectionCheckbox: false,
    enableColumnResize: true,
    showColumnMenu: false,
    showFilter: false,
    rowHeight: 44,
    enableSorting: true,
    sortInfo: { fields: ['submittedDate'], directions: ['asc'] },
    columnDefs: [
      {field: 'programName', displayName: messageService.get("program.header") },
      {field: 'facilityCode', displayName: messageService.get("option.value.facility.code")},
      {field: 'facilityName', displayName: messageService.get("option.value.facility.name")},
      {field: 'periodStartDate', displayName: messageService.get("label.period.start.date"), cellFilter: "date:'dd/MM/yyyy'"},
      {field: 'periodEndDate', displayName: messageService.get("label.period.end.date"), cellFilter: "date:'dd/MM/yyyy'"},
      {field: 'submittedDate', displayName: messageService.get("label.date.submitted"), cellFilter: "date:'dd/MM/yyyy'"},
      {field: 'modifiedDate', displayName: messageService.get("label.date.modified"), cellFilter: "date:'dd/MM/yyyy'"},
      {field: 'status', displayName: messageService.get("label.status")}
    ]
  };

  $scope.openRequisition = function () {
    var url = "requisition/";
    url += $scope.selectedItems[0].id + "/" + $scope.selectedItems[0].programId + "?supplyType=full-supply&page=1";
    $location.url(url);
  };

  function setProgramsLabel() {
    $scope.selectedProgramId = undefined;
    $scope.programLabel = (!$scope.programs.length) ? messageService.get("label.none.assigned") : messageService.get("label.all");
  }

  $scope.loadProgramsForFacility = function () {
    ProgramsToViewRequisitions.get({facilityId: $scope.selectedFacilityId},
      function (data) {
        $scope.programs = data.programList;
        setProgramsLabel();
      }, function () {
        $scope.programs = [];
        setProgramsLabel();
      })
  };

  function setRequisitionsFoundMessage() {
    $scope.requisitionFoundMessage = ($scope.requisitions.length) ? "" : messageService.get("msg.no.rnr.found");
  }

  $scope.filterRequisitions = function () {
    $scope.filteredRequisitions = [];
    var query = $scope.query || "";

    $scope.filteredRequisitions = $.grep($scope.requisitions, function (rnr) {
      return contains(rnr.status, query);
    });

  };

  function contains(string, query) {
    return string.toLowerCase().indexOf(query.toLowerCase()) != -1;
  }

  $scope.loadRequisitions = function () {
    if ($scope.viewRequisitionForm.$invalid) {
      $scope.errorShown = true;
      return;
    }
    var requisitionQueryParameters = {
      facilityId: $scope.selectedFacilityId,
      dateRangeStart: $scope.startDate.toUTCString(),
      dateRangeEnd: $scope.endDate.toUTCString()
    };

    if ($scope.selectedProgramId) requisitionQueryParameters.programId = $scope.selectedProgramId;

    RequisitionsForViewing.get(requisitionQueryParameters, function (data) {

      $scope.requisitions = $scope.filteredRequisitions = data.rnr_list;

      setRequisitionsFoundMessage();
    }, function () {
    })
  };
  $scope.setEndDateOffset = function () {
    if ($scope.endDate < $scope.startDate) {
      $scope.endDate = undefined;
    }
    $scope.endDateOffset = Math.ceil(($scope.startDate.getTime() + oneDay - Date.now()) / oneDay);
  };
}

var oneDay = 1000 * 60 * 60 * 24;

ViewRnrListController.resolve = {

  preAuthorize: function (AuthorizationService) {
    AuthorizationService.preAuthorize('VIEW_REQUISITION');
  },

  facilities: function ($q, $timeout, UserFacilityWithViewRequisition) {
    var deferred = $q.defer();
    $timeout(function () {
      UserFacilityWithViewRequisition.get({}, function (data) {
        deferred.resolve(data.facilities);
      }, {});
    }, 100);
    return deferred.promise;
  }
};