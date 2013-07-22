rnrModule.service('RequisitionService', function ($rootScope, $q, $route,
                                                  Requisitions,
                                                  ProgramRnRColumnList,
                                                  ReferenceData,
                                                  LossesAndAdjustmentsReferenceData,
                                                  FacilityApprovedProducts,
                                                  FacilityProgramRights,
                                                  ProgramRegimenTemplate) {

    var promises = [];

    var requisition = function ($q, Requisitions, $route) {
      var deferred = $q.defer();
      Requisitions.get({id: $route.current.params.rnr}, function (response) {
        deferred.resolve({key: 'requisition', response: response.rnr});
      }, {});
      return deferred.promise;
    };

    var rnrColumns = function ($q, ProgramRnRColumnList, $route) {
      var deferred = $q.defer();
      ProgramRnRColumnList.get({programId: $route.current.params.program}, function (response) {
        deferred.resolve({key: 'rnrColumnList', response: response.rnrColumnList});
      }, {});
      return deferred.promise;
    };

    var currency = function ($q, ReferenceData) {
      var deferred = $q.defer();
      ReferenceData.get({}, function (response) {
        deferred.resolve({key: 'currency', response: response.currency});
      }, {});
      return deferred.promise;
    };

    var lossesAndAdjustmentsTypes = function ($q,
                                              LossesAndAdjustmentsReferenceData) {
      var deferred = $q.defer();
      LossesAndAdjustmentsReferenceData.get({}, function (response) {
        deferred.resolve({key: 'lossesAndAdjustmentsTypes', response: response.lossAdjustmentTypes});
      }, {});
      return deferred.promise;
    };

    var facilityApprovedProducts = function ($q, $route,
                                             FacilityApprovedProducts) {
      var deferred = $q.defer();
      FacilityApprovedProducts.get({facilityId: $route.current.params.facility, programId: $route.current.params.program}, function (response) {
        deferred.resolve({key: 'facilityApprovedProducts', response: response.nonFullSupplyProducts});
      }, {});
      return deferred.promise;
    };

    var requisitionRights = function ($q, $route, FacilityProgramRights) {
      var deferred = $q.defer();
      FacilityProgramRights.get({facilityId: $route.current.params.facility, programId: $route.current.params.program}, function (response) {
        deferred.resolve({key: 'requisitionRights', response: response.rights});
      }, {});
      return deferred.promise;
    };

    var regimenTemplate = function ($q, $route, ProgramRegimenTemplate) {
      var deferred = $q.defer();
      ProgramRegimenTemplate.get({programId: $route.current.params.program}, function (response) {
        deferred.resolve({key: 'regimenTemplate', response: response.template});
      }, {});
      return deferred.promise;
    };

    this.initializeService = function () {

      promises.push(requisition($q, Requisitions, $route));
      promises.push(currency($q, ReferenceData));
      promises.push(rnrColumns($q, ProgramRnRColumnList, $route));
      promises.push(lossesAndAdjustmentsTypes($q, LossesAndAdjustmentsReferenceData));
      promises.push(facilityApprovedProducts($q, $route, FacilityApprovedProducts));
      promises.push(requisitionRights($q, $route, FacilityProgramRights));
      promises.push(regimenTemplate($q, $route, ProgramRegimenTemplate));

      $q.all(promises).then(function (values) {
        var data = {};
        _.each(values, function (value) {
          data[value.key] = value.response;
        });
        $rootScope.$broadcast('rnrInitialized', data);
      });
    };

    this.initializeService();
  }
);