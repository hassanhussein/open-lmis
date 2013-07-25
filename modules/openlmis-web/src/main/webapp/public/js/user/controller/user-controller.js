/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

function UserController($scope, $location, $dialog, Users, Facility, messageService, user, roles, programs, supervisoryNodes, deliveryZones) {

  $scope.userNameInvalid = false;
  $scope.showHomeFacilityRoleMappingError = false;
  $scope.showSupervisorRoleMappingError = false;
  $scope.user = user || {homeFacilityRoles: []};
  $scope.supervisoryNodes = supervisoryNodes;
  $scope.deliveryZones = deliveryZones;
  $scope.$parent.userId = null;

  loadUserFacility();
  preparePrograms(programs);

  $scope.rolesMap = _.groupBy(roles, function (role) {
    return role.type;
  });

  function preparePrograms(programs) {
    if (programs) {
      $.each(programs, function (index, program) {
        program.status = program.active ? messageService.get("label.active") : messageService.get('label.inactive');
      });
    }
    $scope.programsMap = _.groupBy(programs, function (program) {
      return program.push ? 'push' : 'pull';
    });
  }


  function validateHomeFacilityRoles(user) {
    if (!user.homeFacilityRoles) {
      return true;
    }
    var valid = true;
    $.each(user.homeFacilityRoles, function (index, roleAssignment) {
      if (!roleAssignment.programId || !roleAssignment.roleIds || roleAssignment.roleIds.length == 0) {
        valid = false;
        return false;
      }
    });
    return valid;
  }

  function validateSupervisorRoles(user) {
    if (!user.supervisorRoles) {
      return true;
    }

    var valid = true;
    $.each(user.supervisorRoles, function (index, roleAssignment) {
      if (!roleAssignment.programId || !roleAssignment.supervisoryNode || !roleAssignment.supervisoryNode.id || !roleAssignment.roleIds || roleAssignment.roleIds.length == 0) {
        valid = false;
        return false;
      }
    });
    return valid;
  }

  var validateRoleAssignment = function (user) {
    return validateHomeFacilityRoles(user) && validateSupervisorRoles(user);
  };

  $scope.saveUser = function () {
    var successHandler = function (response) {
      $scope.user = response.user;
      $scope.showError = false;
      $scope.error = "";
      $scope.$parent.message = response.success;
      $scope.$parent.userId = $scope.user.id;
      $location.path('');
    };

    var errorHandler = function (response) {
      $scope.showError = true;
      $scope.error = response.data.error;
    };

    var requiredFieldsPresent = function (user) {
      if ($scope.userForm.$error.required || !validateRoleAssignment(user)) {
        $scope.error = messageService.get("form.error");
        $scope.showError = true;
        return false;
      } else {
        return true;
      }
    };

    if (!requiredFieldsPresent($scope.user))  return false;

    if ($scope.user.id) {
      Users.update({id: $scope.user.id}, $scope.user, successHandler, errorHandler);
    } else {
      Users.save({}, $scope.user, successHandler, errorHandler);
    }
    return true;
  };

  $scope.validateUserName = function () {
    $scope.userNameInvalid = $scope.user.userName != null && $scope.user.userName.trim().indexOf(' ') >= 0;
  };

  $scope.showFacilitySearchResults = function () {
    var query = $scope.query;
    var len = (query == undefined) ? 0 : query.length;

    if (len >= 3) {
      if (len == 3) {
        Facility.get({searchParam: query, virtualFacility : false}, function (data) {
          $scope.facilityList = data.facilityList;
          $scope.filteredFacilities = $scope.facilityList;
          $scope.resultCount = $scope.filteredFacilities.length;
        }, {});
      }
      else {
        filterFacilitiesByCodeOrName();
      }
    }
  };

  $scope.setSelectedFacility = function (facility) {
    $scope.user.facilityId = facility.id;
    $scope.facilitySelected = facility;
    loadUserFacility();
    $scope.query = null;
  };

  $scope.clearSelectedFacility = function (result) {
    if (!result) return;

    $scope.facilitySelected = null;
    $scope.allSupportedPrograms = null;
    $scope.user.homeFacilityRoles = null;
    $scope.user.facilityId = null;

    setTimeout(function () {
      angular.element("#searchFacility").focus();
    });
  };

  $scope.confirmFacilityDelete = function () {
    var dialogOpts = {
      id: "deleteFacilityModal",
      header: messageService.get('delete.facility.header'),
      body: messageService.get('confirm.programRole.deletion')
    };
    OpenLmisDialog.newDialog(dialogOpts, $scope.clearSelectedFacility, $dialog, messageService);
  };

  function loadUserFacility() {

    if (!$scope.user) return;

    if (!utils.isNullOrUndefined($scope.user.facilityId)) {
      if (utils.isNullOrUndefined($scope.allSupportedPrograms)) {
        Facility.get({id: $scope.user.facilityId}, function (data) {
          $scope.allSupportedPrograms = _.filter(data.facility.supportedPrograms, function (supportedProgram) {
            return !supportedProgram.program.push;
          });

          $scope.facilitySelected = data.facility;
        }, {});
      }
    }
  }

  var filterFacilitiesByCodeOrName = function () {
    $scope.filteredFacilities = [];

    angular.forEach($scope.facilityList, function (facility) {
      if (facility.code.toLowerCase().indexOf($scope.query.toLowerCase()) >= 0 || facility.name.toLowerCase().indexOf($scope.query.toLowerCase()) >= 0) {
        $scope.filteredFacilities.push(facility);
      }
      $scope.resultCount = $scope.filteredFacilities.length;
    })
  };

}

UserController.resolve = {

  user: function ($q, Users, $route, $timeout) {
    var userId = $route.current.params.userId;
    if (!userId) return undefined;
    var deferred = $q.defer();
    $timeout(function () {
      Users.get({id: userId}, function (data) {
        deferred.resolve(data.user);
      }, function () {
      });
    }, 100);
    return deferred.promise;
  },

  roles: function ($q, Roles, $timeout) {
    var deferred = $q.defer();

    $timeout(function () {
      Roles.get({}, function (data) {
        deferred.resolve(data.roles);
      }, function () {});
    }, 100);

    return deferred.promise;
  },

  programs: function ($q, Program, $timeout) {
    var deferred = $q.defer();

    $timeout(function () {
      Program.get({}, function (data) {
        deferred.resolve(data.programs);
      }, function () {
      });
    }, 100);

    return deferred.promise;
  },

  supervisoryNodes: function ($q, SupervisoryNodes, $timeout) {
    var deferred = $q.defer();

    $timeout(function () {
      SupervisoryNodes.get({}, function (data) {
        deferred.resolve(data.supervisoryNodes);
      }, function () {
      });
    }, 100);

    return deferred.promise;
  },

  deliveryZones: function ($q, DeliveryZone, $timeout) {
    var deferred = $q.defer();

    $timeout(function () {
      DeliveryZone.get({}, function (data) {
        deferred.resolve(data.deliveryZones);
      }, function () {
      });
    }, 100);

    return deferred.promise;
  }



};

