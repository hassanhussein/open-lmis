/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

describe("Facility Controller", function () {
  beforeEach(module('openlmis.services'));
  beforeEach(module('ui.bootstrap.dialog'));
  beforeEach(module('openlmis.localStorage'));

  describe("Create Facility", function () {
    var scope, $httpBackend, ctrl, routeParams, facility, messageService;

    beforeEach(inject(function ($rootScope, _$httpBackend_, $controller, $routeParams, _messageService_) {
      messageService = _messageService_;
      scope = $rootScope.$new();
      routeParams = $routeParams;
      $httpBackend = _$httpBackend_;
      var facilityReferenceData = {"facilityTypes": [
        {"type": "warehouse"}
      ], "programs": [
        {"code": "programCode", "id": "programId"}
      ], "geographicZones": [
        {"zoneId": "testId"}
      ], "facilityOperators": [
        {"operatorCode": "testCode"}
      ]};
      $rootScope.fixToolBar = function () {
      };
      ctrl = $controller(FacilityController, {$scope: scope, $routeParams: routeParams, facilityReferenceData: facilityReferenceData, facility: undefined,
        messageService: messageService});
      scope.facilityForm = {$error: { pattern: "" }};
    }));

    it('should set facility reference data', function () {
      expect(scope.facilityTypes).toEqual([
        {"type": "warehouse"}
      ]);
      expect(scope.facilityOperators).toEqual([
        {"operatorCode": "testCode"}
      ]);
      expect(scope.geographicZones).toEqual([
        {"zoneId": "testId"}
      ]);
      expect(scope.programs).toEqual([
        {"code": "programCode", "id": "programId"}
      ]);
    });

    it('should give success message if save successful', function () {
      facility = {"code": "code", supportedPrograms: []};
      $httpBackend.expectPOST('/facilities.json').respond(200, {"success": "Saved successfully", "facility": facility});
      scope.saveFacility();
      $httpBackend.flush();
      expect("Saved successfully").toEqual(scope.$parent.message);
      expect("").toEqual(scope.error);
    });

    it('should give error if save failed', function () {
      $httpBackend.expectPOST('/facilities.json').respond(404, {"error": "Save failed"});
      scope.saveFacility();
      $httpBackend.flush();
      expect("Save failed").toEqual(scope.error);
      expect("").toEqual(scope.message);
    });

    it('should give field validation error message if form has pattern errors', function () {
      spyOn(messageService, 'get');
      scope.facilityForm.$error.pattern = "{}";
      scope.saveFacility();
      expect(messageService.get).toHaveBeenCalledWith("form.error");
      expect("true").toEqual(scope.showError);
    });

    it('should give field validation error message if form has required errors', function () {
      spyOn(messageService, 'get');
      scope.facilityForm.$error.required = "{}";
      scope.saveFacility();
      expect(messageService.get).toHaveBeenCalledWith("form.error");
      expect("").toEqual(scope.message);
      expect("true").toEqual(scope.showError);
    });

    it('should not add program supported to facility if active program does not contain start date', function () {
      spyOn(messageService, 'get');
      scope.facilityForm.$error.required = "{}";
      scope.facility.supportedPrograms = [
        {"code": "ARV", "name": "ARV", "description": "ARV", "active": true, "startDate": "1/12/12"},
        {"code": "HIV", "name": "HIV", "description": "HIV", "active": true}
      ];
      scope.saveFacility();
      expect(messageService.get).toHaveBeenCalledWith("form.error");

      expect("").toEqual(scope.message);
      expect("true").toEqual(scope.showError);
    });

    it('should add program supported to facility', function () {
      scope.facility.supportedPrograms = [];
      var supportedProgram = {"code": "ARV", "name": "ARV", "description": "ARV", "active": true, "editedStartDate": "1/12/12", "program": {"id": "programId"}};

      scope.addSupportedProgram(supportedProgram);

      expect(scope.facility.supportedPrograms[0].code).toEqual("ARV");
      expect(scope.facility.supportedPrograms[0].name).toEqual("ARV");
      expect(scope.facility.supportedPrograms[0].active).toEqual(true);
      expect(scope.facility.supportedPrograms[0].program.id).toEqual("programId");
      expect(scope.supportedProgram).toBeUndefined();
    });

    it('should remove program supported to facility', function () {
      scope.facility.supportedPrograms = [];
      var arvProgram = {"code": "ARV", "name": "ARV", "description": "ARV", "active": true, "startDate": "1/12/12", "program": {"id": 1}};
      scope.facility.supportedPrograms = [
        arvProgram,
        {"code": "HIV", "name": "HIV", "description": "HIV", "active": true, "program": {"id": 2}}
      ];

      scope.selectedSupportedProgram = arvProgram;

      scope.removeSupportedProgramConfirm(true);

      expect(scope.facility.supportedPrograms.length).toEqual(1);
      expect(scope.facility.supportedPrograms[0].code).toEqual("HIV");
      expect(scope.facility.supportedPrograms[0].program.id).toEqual(2);
      expect(scope.selectedSupportedProgram).toEqual(undefined);
    });

    it('should not remove program supported when not confirmed on dialog', function () {
      scope.facility.supportedPrograms = [];
      var arvProgram = {"code": "ARV", "name": "ARV", "description": "ARV", "active": true, "startDate": "1/12/12", "program": {"id": 1}};
      scope.facility.supportedPrograms = [
        arvProgram,
        {"code": "HIV", "name": "HIV", "description": "HIV", "active": true, "program": {"id": 2}}
      ];

      scope.selectedSupportedProgram = arvProgram;

      scope.removeSupportedProgramConfirm(false);

      expect(scope.facility.supportedPrograms.length).toEqual(2);
      expect(scope.facility.supportedPrograms[0].code).toEqual("ARV");
      expect(scope.facility.supportedPrograms[0].program.id).toEqual(1);
      expect(scope.selectedSupportedProgram).toEqual(undefined);
    });

    it('should edit start date', function () {
      window.program = {'startDate': 2, 'editedStartDate': 7};
      scope.dateChangeCallback(true);
      expect(window.program.startDate).toEqual(7);
    });

    it('should reset old start date', function () {
      window.program = {'startDate': 2, 'editedStartDate': 7};
      scope.dateChangeCallback(false);
      expect(window.program.editedStartDate).toEqual(2);
    });
  });

  describe("Facility resolve", function () {
    var $httpBackend, ctrl, $timeout, $route, $q;
    var deferredObject;
    beforeEach(module('openlmis.services'));

    beforeEach(inject(function(_$httpBackend_, $controller, _$timeout_, _$route_) {
      $httpBackend = _$httpBackend_;
      deferredObject = {promise: {id: 1}, resolve: function () {}};
      spyOn(deferredObject, 'resolve');
      $q = {defer: function() {return deferredObject}};
      $timeout = _$timeout_;
      ctrl = $controller;
      $route = _$route_;
    }));

    it('should get facility reference data', function () {
      $httpBackend.expect('GET', '/facilities/reference-data.json').respond({facility: {'id' : '23'}});
      ctrl(FacilityController.resolve.facilityReferenceData, {$q: $q});
      $timeout.flush();
      $httpBackend.flush();
      expect(deferredObject.resolve).toHaveBeenCalled();
    });

    it('should get facility if edit route contains id', function () {
      $route = {current: {params:{facilityId: 1}}};
      $httpBackend.expect('GET', '/facilities/1.json').respond({'id' : '23'});
      ctrl(FacilityController.resolve.facility, {$route: $route});
      $timeout.flush();
    });
  });

    describe("Edit/Delete Facility", function () {
      var scope, httpBackend;

      beforeEach(inject(function ($rootScope, _$httpBackend_, $controller, $routeParams) {
        httpBackend = _$httpBackend_;
        scope = $rootScope.$new();
        $rootScope.fixToolBar = function () {
        };
        var routeParams = $routeParams;
        routeParams.facilityId = "1";
        var facilityReferenceData = {"facilityTypes": [
          {"type": "warehouse"}
        ], "programs": [
          {"code": "ARV", "name": "ARV", "description": "ARV", "active": true},
          {"code": "HIV", "name": "HIV", "description": "HIV", "active": true},
          {"code": "ABC", "name": "ABC", "description": "ABC", "active": false}
        ],
          "geographicZones": [
            {"zoneId": "testId"}
          ], "facilityOperators": [
            {"operatorCode": "testCode"}
          ]};
        var facility = {"id": 1, "code": "F1756", "name": "Village Dispensary", "description": "IT department", "gln": "G7645", "mainPhone": "9876234981",
          "fax": "fax", "address1": "A", "address2": "B", "geographicZone": {"id": 1}, "facilityType": {"code": "warehouse"}, "catchmentPopulation": 333,
          "latitude": 22.1, "longitude": 1.2, "altitude": 3.3, "operatedBy": {"code": "NGO"}, "coldStorageGrossCapacity": 9.9, "coldStorageNetCapacity": 6.6,
          "suppliesOthers": true, "sdp": true, "hasElectricity": true, "online": true, "hasElectronicScc": true, "hasElectronicDar": null, "active": true,
          "goLiveDate": 1352572200000, "goDownDate": -2592106200000, "satellite": true, "satelliteParentId": null, "comment": "fc", "dataReportable": true,
          "supportedPrograms": [
            {"code": "ARV", "name": "ARV", "description": "ARV", "active": true, "program": {"id": 1}, "startDate": 1352572200000},
            {"code": "HIV", "name": "HIV", "description": "HIV", "active": true, "program": {"id": 1}, "startDate": 1352572200000}
          ], "modifiedBy": null, "modifiedDate": null};
        $controller(FacilityController, {$scope: scope, $routeParams: routeParams, facilityReferenceData: facilityReferenceData, facility: facility});
        scope.facilityForm = {$error: { pattern: "" }};
      }));

      it('should get facility if defined', function () {
        expect(scope.facility.goLiveDate).toEqual(new Date(1352572200000));
        expect(scope.facility.goDownDate).toEqual(new Date(-2592106200000));
        expect(scope.facility.supportedPrograms).toEqual([
          {"code": "ARV", "name": "ARV", "description": "ARV", "active": true, "program": {"id": 1}, "startDate": new Date(1352572200000)},
          {"code": "HIV", "name": "HIV", "description": "HIV", "active": true, "program": {"id": 1}, "startDate": new Date(1352572200000)}
        ]);
      });

      it('should delete a facility', function () {
        httpBackend.expect('DELETE', '/facilities/1.json').respond(200, {"success": "Deleted successfully", "facility": scope.facility});

        scope.deleteFacilityCallBack(true);
        httpBackend.flush();

        expect(scope.message).toEqual("Deleted successfully");
        expect(scope.facility.goLiveDate).toEqual(new Date(1352572200000));
        expect(scope.facility.goDownDate).toEqual(new Date(-2592106200000));
        expect(scope.originalFacilityCode).toEqual(scope.facility.code);
        expect(scope.originalFacilityName).toEqual(scope.facility.name);
      });

      it('should not delete a facility if error occurs', function () {
        httpBackend.expect('DELETE', '/facilities/1.json').respond(404, {"error": "something went wrong", "facility": scope.facility});

        scope.deleteFacilityCallBack(true);
        httpBackend.flush();

        expect(scope.error).toEqual("something went wrong");
        expect(scope.facility.goLiveDate).toEqual(new Date(1352572200000));
        expect(scope.facility.goDownDate).toEqual(new Date(-2592106200000));
        expect(scope.originalFacilityCode).toEqual(scope.facility.code);
        expect(scope.originalFacilityName).toEqual(scope.facility.name);
      });

      it('should restore a facility', function () {
        httpBackend.expect('PUT', '/facilities/1/restore.json?active=true').respond(200, {"success": "Restored Successfully", "facility": scope.facility});

        scope.restoreFacility(true);
        httpBackend.flush();

        expect(scope.message).toEqual("Restored Successfully");
        expect(scope.facility.goLiveDate).toEqual(new Date(1352572200000));
        expect(scope.facility.goDownDate).toEqual(new Date(-2592106200000));
        expect(scope.originalFacilityCode).toEqual(scope.facility.code);
        expect(scope.originalFacilityName).toEqual(scope.facility.name);
      });

      it('should not restore a facility if error occurs', function () {
        httpBackend.expect('PUT', '/facilities/1/restore.json?active=true').respond(400, {"error": "something went wrong", "facility": scope.facility});

        scope.restoreFacility(true);
        httpBackend.flush();

        expect(scope.error).toEqual("something went wrong");
        expect(scope.facility.goLiveDate).toEqual(new Date(1352572200000));
        expect(scope.facility.goDownDate).toEqual(new Date(-2592106200000));
        expect(scope.originalFacilityCode).toEqual(scope.facility.code);
        expect(scope.originalFacilityName).toEqual(scope.facility.name);
      });
    });
  });