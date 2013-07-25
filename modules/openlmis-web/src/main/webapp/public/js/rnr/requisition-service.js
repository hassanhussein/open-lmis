rnrModule.service('RequisitionService', function ($rootScope, $q, $route, Requisitions, ProgramRnRColumnList,
                                                  ReferenceData, LossesAndAdjustmentsReferenceData,
                                                  FacilityApprovedProducts, FacilityProgramRights,
                                                  ProgramRegimenTemplate, LineItemPageSize, messageService) {

  var promises = [];

  this.initialized = false;

  this.visibleTab = "full-supply";

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

  var lossesAndAdjustmentsTypes = function ($q, LossesAndAdjustmentsReferenceData) {
    var deferred = $q.defer();
    LossesAndAdjustmentsReferenceData.get({}, function (response) {
      deferred.resolve({key: 'lossesAndAdjustmentsTypes', response: response.lossAdjustmentTypes});
    }, {});
    return deferred.promise;
  };

  var facilityApprovedProducts = function ($q, $route, FacilityApprovedProducts) {
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

  var pageSize = function ($q, LineItemPageSize) {
    var deferred = $q.defer();
    LineItemPageSize.get({}, function (data) {
      deferred.resolve({key: 'pageSize', response: data.pageSize});
    }, {});

    return deferred.promise;
  };

  this.data = {};

  this.initialize = function () {
    var self = this;

    if (self.initialized) return this.data;
    promises.push(rnrColumns($q, ProgramRnRColumnList, $route));
    promises.push(requisition($q, Requisitions, $route));
    promises.push(currency($q, ReferenceData));
    promises.push(lossesAndAdjustmentsTypes($q, LossesAndAdjustmentsReferenceData));
    promises.push(facilityApprovedProducts($q, $route, FacilityApprovedProducts));
    promises.push(requisitionRights($q, $route, FacilityProgramRights));
    promises.push(regimenTemplate($q, $route, ProgramRegimenTemplate));
    promises.push(pageSize($q, LineItemPageSize));

    $q.all(promises).then(function (values) {
      var data = {};
      _.each(values, function (value) {
        data[value.key] = value.response;
      });

      data['requisition'] = new Rnr(data['requisition'], data['rnrColumnList']);

      $rootScope.$broadcast('rnrInitialized', data);
      self.data = data;
      self.initialized = true;
    });
  };

  // TODO a better name... any taker?
  this.removeExtraDataForPostFromRnr = function (scope) {
    var rnr = {"id": scope.rnr.id, "fullSupplyLineItems": [], "nonFullSupplyLineItems": [], "regimenLineItems": []};
    if (!scope.pageLineItems.length) return rnr;
    if (scope.pageLineItems[0].fullSupply == false) {
      _.each(scope.rnr.nonFullSupplyLineItems, function (lineItem) {
        rnr.nonFullSupplyLineItems.push(_.omit(lineItem, ['rnr', 'programRnrColumnList']));
      });
    } else if (scope.pageLineItems[0].fullSupply == true) {
      _.each(scope.pageLineItems, function (lineItem) {
        rnr.fullSupplyLineItems.push(_.omit(lineItem, ['rnr', 'programRnrColumnList']));
      });
    }
    else {
      _.each(scope.pageLineItems, function (regimenLineItem) {
        rnr.regimenLineItems.push(regimenLineItem);
      });
    }

    return rnr;
  };

  this.resetFlags = function (scope) {
    scope.submitError = "";
    //TODO confirm if we need to set this in rootScope
    scope.submitMessage = "";
    scope.error = "";
    scope.message = "";
  }

  this.push = function (key, value) {
    this[key] = value;
  }

  this.get = function (key) {
    return this[key];
  }

  this.saveRnr = function (scope, preventMessage) {
    var self = this;
    if (!scope.saveRnrForm.$dirty) {
      return;
    }
    this.resetFlags(scope);
    var rnr = this.removeExtraDataForPostFromRnr(scope);
    Requisitions.update({id: scope.rnr.id, operation: "save"}, rnr, function (data) {
      if (preventMessage) return;
      self.message = data.success;
      setTimeout(function () {
        scope.$apply(function () {
          angular.element("#saveSuccessMsgDiv").fadeOut('slow', function () {
            scope.message = '';
            self.message = '';
          });
        });
      }, 3000);
      scope.saveRnrForm.$setPristine();
      self.data.requisition = scope.rnr;
    }, function (data) {
      scope.error = data.error;
    });
  };

  this.validateRegimenLineItems = function (scope) {
    var setError = false;
    $.each(scope.rnr.regimenLineItems, function (index, regimenLineItem) {
      $.each(scope.visibleRegimenColumns, function (index, regimenColumn) {
        if (regimenColumn.name != "remarks" && isUndefined(regimenLineItem[regimenColumn.name])) {
          setError = true;
          scope.regimenLineItemInValid = true;
          return;
        }
      });
    });
    if (!setError) scope.regimenLineItemInValid = false;
  };

  this.validateAndSetErrorClass = function (scope) {
    scope.inputClass = true;
    var fullSupplyError = scope.rnr.validateFullSupply();
    var nonFullSupplyError = scope.rnr.validateNonFullSupply();
    scope.fullSupplyTabError = !!fullSupplyError;
    scope.nonFullSupplyTabError = !!nonFullSupplyError;

    if (scope.rnr.regimenLineItems) this.validateRegimenLineItems(scope);
    var regimenError;
    if (scope.regimenLineItemInValid) {
      regimenError = messageService.get("error.rnr.validation");
    }

    return fullSupplyError || nonFullSupplyError || regimenError;
  }

  this.fillPagedGridData = function (scope, routeParams) {
    if (scope.visibleTab == "regimen") {
      scope.numberOfPages = 1;
      scope.pageLineItems = scope.rnr.regimenLineItems;
    } else {
      var gridLineItems = scope.visibleTab == "non-full-supply" ?
        scope.rnr.nonFullSupplyLineItems : scope.visibleTab == "full-supply" ? scope.rnr.fullSupplyLineItems : [];
      scope.numberOfPages = Math.ceil(gridLineItems.length / scope.pageSize) ? Math.ceil(gridLineItems.length / scope.pageSize) : 1;
      scope.currentPage = (utils.isValidPage(routeParams.page, scope.numberOfPages)) ? parseInt(routeParams.page, 10) : 1;
      scope.pageLineItems = gridLineItems.slice((scope.pageSize * (scope.currentPage - 1)), scope.pageSize * scope.currentPage);
    }
  };


  this.stuffScope = function (scope, location, routeParams, dialog) {
    var self = this;

    scope.fullScreen = false;
    scope.currentPage = (routeParams.page) ? parseInt(routeParams.page) || 1 : 1;

    var resetErrorPages = function (scope) {
      scope.errorPages = {fullSupply: [], nonFullSupply: []};
    }

    resetErrorPages(scope);

    scope.$on('routeUpdate', function () {
      console.log("full supply routeUpdate");
      if (!utils.isValidPage(page, scope.numberOfPages)) {
        location.search('page', 1);
      }

      if (scope.saveRnrForm && scope.saveRnrForm.$dirty) {
        scope.saveRnr();
      }
      if (scope.rnr) {
        self.fillPagedGridData(scope, routeParams);
      }
    });

    scope.saveRnr = function (preventMessage) {
      self.saveRnr(scope, preventMessage);
    }

    scope.switchSupplyType = function (supplyType) {
      self.visibleTab = supplyType;
      var editRnrPath = '/edit/' + supplyType + '/' + routeParams.rnr + '/' + routeParams.facility + '/' + routeParams.program + "?page=1";

      self.saveRnr(scope);

      location.url(editRnrPath);
    };


    scope.hasPermission = function (permission) {
      return _.find(scope.requisitionRights, function (right) {
        return right.right == permission
      });
    };

    scope.checkErrorOnPage = function (page) {
      return scope.visibleTab == "non-full-supply" ?
        _.contains(scope.errorPages.nonFullSupply, page) : scope.visibleTab == "full-supply" ?
        _.contains(scope.errorPages.fullSupply, page) : [];
    };


    scope.goToPage = function (page, event) {
      angular.element(event.target).parents(".dropdown").click();
      location.search('page', page);
    };


    scope.$watch("currentPage", function () {
      location.search("page", scope.currentPage);
    });


    scope.highlightRequired = function (value) {
      if (scope.inputClass && (isUndefined(value))) {
        return "required-error";
      }
      return null;
    };

    scope.highlightRequiredFieldInModal = function (value) {
      if (isUndefined(value)) return "required-error";
      return null;
    };


    scope.highlightWarning = function (value) {
      if (scope.inputClass && (isUndefined(value) || value == false)) {
        return "warning-error";
      }
      return null;
    };

    scope.showCategory = function (index) {
      return !((index > 0 ) && (scope.pageLineItems[index].productCategory == scope.pageLineItems[index - 1].productCategory));
    };


    var setErrorPages = function (scope) {
      scope.errorPages = scope.rnr.getErrorPages(scope.pageSize);
      scope.fullSupplyErrorPagesCount = scope.errorPages.fullSupply.length;
      scope.nonFullSupplyErrorPagesCount = scope.errorPages.nonFullSupply.length;
    }


    var showConfirmModal = function (scope, dialog) {
      var dialogCloseCallback = function (result) {
        var submitValidatedRnr = function () {
          Requisitions.update({id: scope.rnr.id, operation: "submit"},
            {}, function (data) {
              self.resetFlags(scope);
              scope.rnr.status = "SUBMITTED";
              scope.formDisabled = !scope.hasPermission('AUTHORIZE_REQUISITION');
              scope.submitMessage = data.success;
              scope.saveRnrForm.$setPristine();
            }, function (data) {
              scope.submitError = data.data.error;
            });
        };

        var authorizeValidatedRnr = function () {
          Requisitions.update({id: scope.rnr.id, operation: "authorize"}, {}, function (data) {
            self.resetFlags(scope);
            scope.rnr.status = "AUTHORIZED";
            scope.formDisabled = true;
            scope.submitMessage = data.success;
            scope.saveRnrForm.$setPristine();
          }, function (data) {
            scope.submitError = data.data.error;
          });
        };

        if (result && scope.rnr.status == 'INITIATED')
          submitValidatedRnr();
        if (result && scope.rnr.status == 'SUBMITTED')
          authorizeValidatedRnr();
      };

      var options = {
        id: "confirmDialog",
        header: messageService.get("label.confirm.action"),
        body: messageService.get("msg.question.confirmation")
      };
      OpenLmisDialog.newDialog(options, dialogCloseCallback, dialog, messageService);
    };


    scope.authorizeRnr = function () {
      self.resetFlags(scope);
      resetErrorPages(scope);
      self.saveRnr(scope, true);
      var errorMessage = self.validateAndSetErrorClass(scope);
      if (errorMessage) {
        setErrorPages(scope);
        scope.submitError = errorMessage;
        return;
      }
      showConfirmModal(scope, dialog);
    };

    scope.submitRnr = function () {
      self.resetFlags(scope);
      resetErrorPages(scope);
      self.saveRnr(scope, true);
      var errorMessage = self.validateAndSetErrorClass(scope);
      if (errorMessage) {
        setErrorPages(scope);
        scope.submitError = errorMessage;
        return;
      }
      showConfirmModal(scope, dialog);
    };

    scope.$watch('fullScreen', function () {
      angular.element(window).scrollTop(0);
      if (!$.browser.msie) {
        scope.fullScreen ? angular.element('.toggleFullScreen').slideUp('slow', function () {
        }) : angular.element('.toggleFullScreen').slideDown('slow', function () {
        });
      }
      else {
        scope.fullScreen ? angular.element('.toggleFullScreen').hide() : angular.element('.toggleFullScreen').show();
      }
      scope.fullScreen ? angular.element('.print-button').css('opacity', '1.0') : angular.element('.print-button').css('opacity', '0');
    });
  };


  this.prepareRnr = function (scope, routeParams) {

    function resetCostsIfNull(rnr) {
      if (rnr == null) return;
      if (!rnr.fullSupplyItemsSubmittedCost)
        rnr.fullSupplyItemsSubmittedCost = 0;
      if (!rnr.nonFullSupplyItemsSubmittedCost)
        rnr.nonFullSupplyItemsSubmittedCost = 0;
    }

    resetCostsIfNull(scope.rnr);
    this.fillPagedGridData(scope, routeParams);
    scope.formDisabled = (function () {
      if (scope.rnr) {
        var status = scope.rnr.status;
        if (status == 'INITIATED' && scope.hasPermission('CREATE_REQUISITION')) return false;
        if (status == 'SUBMITTED' && scope.hasPermission('AUTHORIZE_REQUISITION')) return false;
      }
      return true;
    })();
  }


});
