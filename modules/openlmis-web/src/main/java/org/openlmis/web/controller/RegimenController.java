package org.openlmis.web.controller;

import org.openlmis.core.domain.Regimen;
import org.openlmis.core.domain.RegimenCategory;
import org.openlmis.core.exception.DataException;
import org.openlmis.core.service.ProgramService;
import org.openlmis.core.service.RegimenService;
import org.openlmis.rnr.domain.RegimenTemplate;
import org.openlmis.rnr.service.RegimenColumnService;
import org.openlmis.web.form.RegimenFormDTO;
import org.openlmis.web.response.OpenLmisResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

import static org.openlmis.web.response.OpenLmisResponse.*;
import static org.springframework.web.bind.annotation.RequestMethod.GET;
import static org.springframework.web.bind.annotation.RequestMethod.POST;

@Controller
public class RegimenController extends BaseController {

  public static final String REGIMENS_SAVED_SUCCESSFULLY = "regimens.saved.successfully";

  @Autowired
  RegimenService regimenService;

  @Autowired
  RegimenColumnService regimenColumnService;

  @Autowired
  ProgramService programService;

  public static final String REGIMENS = "regimens";
  public static final String REGIMEN_CATEGORIES = "regimen_categories";

  @RequestMapping(value = "/programId/{programId}/regimens", method = POST, headers = ACCEPT_JSON)
  @PreAuthorize("@permissionEvaluator.hasPermission(principal,'MANAGE_REGIMEN_TEMPLATE')")
  public ResponseEntity<OpenLmisResponse> save(@PathVariable Long programId, @RequestBody RegimenFormDTO regimenFormDTO, HttpServletRequest request) {
    regimenService.save(regimenFormDTO.getRegimens(), loggedInUserId(request));
    RegimenTemplate regimenTemplate = new RegimenTemplate(programId, regimenFormDTO.getRegimenColumnList());
    regimenColumnService.save(regimenTemplate, loggedInUserId(request));
    return success(REGIMENS_SAVED_SUCCESSFULLY);
  }

  @RequestMapping(value = "/programId/{programId}/regimens", method = GET, headers = ACCEPT_JSON)
  @PreAuthorize("@permissionEvaluator.hasPermission(principal,'MANAGE_REGIMEN_TEMPLATE')")
  public ResponseEntity<OpenLmisResponse> getByProgram(@PathVariable("programId") Long programId) {
    try {
      ResponseEntity<OpenLmisResponse> response;
      List<Regimen> regimens = regimenService.getByProgram(programId);
      response = response(REGIMENS, regimens);
      return response;
    } catch (DataException dataException) {
      return error(UNEXPECTED_EXCEPTION, HttpStatus.BAD_REQUEST);
    }
  }

  @RequestMapping(value = "/regimenCategories", method = GET, headers = ACCEPT_JSON)
  @PreAuthorize("@permissionEvaluator.hasPermission(principal,'MANAGE_REGIMEN_TEMPLATE')")
  public ResponseEntity<OpenLmisResponse> getAllRegimenCategories() {
    try {
      ResponseEntity<OpenLmisResponse> response;
      List<RegimenCategory> regimenCategories = regimenService.getAllRegimenCategories();
      response = response(REGIMEN_CATEGORIES, regimenCategories);
      return response;
    } catch (DataException dataException) {
      return error(UNEXPECTED_EXCEPTION, HttpStatus.BAD_REQUEST);
    }
  }

}
