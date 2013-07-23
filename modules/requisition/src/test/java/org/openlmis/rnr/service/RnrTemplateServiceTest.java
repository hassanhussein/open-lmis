/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.openlmis.rnr.service;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.openlmis.core.message.OpenLmisMessage;
import org.openlmis.core.service.ProgramService;
import org.openlmis.db.categories.UnitTests;
import org.openlmis.rnr.domain.Column;
import org.openlmis.rnr.domain.ProgramRnrTemplate;
import org.openlmis.rnr.domain.RnrColumn;
import org.openlmis.rnr.repository.RnrTemplateRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import static org.hamcrest.CoreMatchers.is;
import static org.junit.Assert.assertThat;
import static org.mockito.Mockito.*;

@Category(UnitTests.class)
@RunWith(MockitoJUnitRunner.class)
public class RnrTemplateServiceTest {

  @Mock
  private RnrTemplateRepository repository;

  @Mock
  private ProgramService programService;

  @InjectMocks
  private RnrTemplateService service;
  private final static Long EXISTING_PROGRAM_ID = 1L;


  @Test
  public void shouldFetchAllRnRColumns() throws Exception {
    service.fetchAllRnRColumns(EXISTING_PROGRAM_ID);
    verify(repository).fetchRnrTemplateColumnsOrMasterColumns(EXISTING_PROGRAM_ID);
  }

  @Test
  public void shouldSaveRnRTemplateForAProgramWithGivenColumns() throws Exception {
    ProgramRnrTemplate programRnrTemplate = mock(ProgramRnrTemplate.class);
    List<? extends Column> rnrColumns = new ArrayList<>();
    doReturn(rnrColumns).when(programRnrTemplate).getColumns();
    when(programRnrTemplate.getProgramId()).thenReturn(1L);

    when(programRnrTemplate.validateToSave()).thenReturn(new HashMap<String, OpenLmisMessage>());
    service.saveRnRTemplateForProgram(programRnrTemplate);
    verify(repository).saveProgramRnrTemplate(programRnrTemplate);
    verify(programService).setTemplateConfigured(1L);
  }

  @Test
  public void shouldNotSaveIfErrorInTemplate() throws Exception {
    ProgramRnrTemplate programRnrTemplate = mock(ProgramRnrTemplate.class);
    ArrayList<? extends RnrColumn> rnrColumns = new ArrayList<>();
    doReturn(rnrColumns).when(programRnrTemplate).getColumns();

    HashMap<String, OpenLmisMessage> errors = new HashMap<>();
    errors.put("error-code", new OpenLmisMessage("error-message"));
    when(programRnrTemplate.validateToSave()).thenReturn(errors);
    service.saveRnRTemplateForProgram(programRnrTemplate);
    verify(repository, never()).saveProgramRnrTemplate(programRnrTemplate);
  }

  @Test
  public void shouldFetchProgramTemplate() throws Exception {
    List<? extends Column> columns = new ArrayList<>();
    doReturn(columns).when(repository).fetchRnrTemplateColumnsOrMasterColumns(1L);

    ProgramRnrTemplate template = service.fetchProgramTemplate(1L);

    verify(repository).fetchRnrTemplateColumnsOrMasterColumns(1l);
    assertThat(template.getColumns().size(), is(columns.size()));
  }
}
