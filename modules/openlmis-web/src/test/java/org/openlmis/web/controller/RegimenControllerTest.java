package org.openlmis.web.controller;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.openlmis.core.domain.Regimen;
import org.openlmis.core.domain.RegimenCategory;
import org.openlmis.core.service.ProgramService;
import org.openlmis.core.service.RegimenService;
import org.openlmis.rnr.domain.RegimenColumn;
import org.openlmis.rnr.domain.RegimenTemplate;
import org.openlmis.rnr.service.RegimenColumnService;
import org.openlmis.web.form.RegimenFormDTO;
import org.openlmis.web.response.OpenLmisResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.openlmis.authentication.web.UserAuthenticationSuccessHandler.USER;
import static org.openlmis.authentication.web.UserAuthenticationSuccessHandler.USER_ID;
import static org.openlmis.web.controller.RegimenController.REGIMENS;
import static org.openlmis.web.controller.RegimenController.REGIMEN_CATEGORIES;

@RunWith(MockitoJUnitRunner.class)
public class RegimenControllerTest {

  @Mock
  RegimenService regimenService;

  @Mock
  ProgramService programService;

  @Mock
  RegimenColumnService regimenColumnService;

  @InjectMocks
  RegimenController controller;

  MockHttpServletRequest httpServletRequest;

  Long userId = 1L;

  @Before
  public void setUp() throws Exception {
    httpServletRequest = new MockHttpServletRequest();
    MockHttpSession mockHttpSession = new MockHttpSession();
    httpServletRequest.setSession(mockHttpSession);
    mockHttpSession.setAttribute(USER, USER);
    mockHttpSession.setAttribute(USER_ID, userId);
  }


  @Test
  public void shouldGetRegimenByProgram() {
    List<Regimen> expectedRegimens = new ArrayList<>();
    Long programId = 1l;
    when(regimenService.getByProgram(programId)).thenReturn(expectedRegimens);

    ResponseEntity<OpenLmisResponse> response = controller.getByProgram(programId);

    assertThat((List<Regimen>) response.getBody().getData().get(REGIMENS), is(expectedRegimens));
    verify(regimenService).getByProgram(programId);
  }

  @Test
  public void shouldGetAllRegimenCategories() throws Exception {
    List<RegimenCategory> expectedRegimenCategories = new ArrayList<>();
    when(regimenService.getAllRegimenCategories()).thenReturn(expectedRegimenCategories);

    ResponseEntity<OpenLmisResponse> response = controller.getAllRegimenCategories();

    assertThat((List<RegimenCategory>) response.getBody().getData().get(REGIMEN_CATEGORIES), is(expectedRegimenCategories));
    verify(regimenService).getAllRegimenCategories();
  }

  @Test
  public void shouldSaveRegimenTemplate() throws Exception {
    Long programId = 1L;
    List<RegimenColumn> columns = new ArrayList<>();
    List<Regimen> regimens = new ArrayList<>();
    RegimenTemplate regimenTemplate = new RegimenTemplate(programId, columns);
    RegimenFormDTO regimenFormDTO = new RegimenFormDTO(regimens, columns);

    controller.save(programId, regimenFormDTO, httpServletRequest);

    verify(regimenColumnService).save(regimenTemplate, userId);
    verify(regimenService).save(regimens, userId);
    assertThat(regimenTemplate.getProgramId(), is(programId));
  }

}
