package org.openlmis.rnr.repository.mapper;

import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.junit.runner.RunWith;
import org.openlmis.core.builder.ProcessingPeriodBuilder;
import org.openlmis.core.builder.ProcessingScheduleBuilder;
import org.openlmis.core.builder.SupervisoryNodeBuilder;
import org.openlmis.core.domain.*;
import org.openlmis.core.repository.mapper.FacilityMapper;
import org.openlmis.core.repository.mapper.ProcessingPeriodMapper;
import org.openlmis.core.repository.mapper.ProcessingScheduleMapper;
import org.openlmis.core.repository.mapper.SupervisoryNodeMapper;
import org.openlmis.db.categories.IntegrationTests;
import org.openlmis.rnr.builder.RequisitionBuilder;
import org.openlmis.rnr.domain.RequisitionStatusChange;
import org.openlmis.rnr.domain.Rnr;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.transaction.TransactionConfiguration;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

import static com.natpryce.makeiteasy.MakeItEasy.*;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.junit.Assert.assertThat;
import static org.openlmis.core.builder.FacilityBuilder.defaultFacility;
import static org.openlmis.core.builder.ProcessingPeriodBuilder.defaultProcessingPeriod;
import static org.openlmis.core.builder.ProcessingPeriodBuilder.scheduleId;
import static org.openlmis.rnr.domain.RnrStatus.*;

@Category(IntegrationTests.class)
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath:test-applicationContext-requisition.xml")
@TransactionConfiguration(defaultRollback = true, transactionManager = "openLmisTransactionManager")
@Transactional
public class RequisitionStatusChangeMapperIT {

  @Autowired
  RequisitionMapper requisitionMapper;

  @Autowired
  FacilityMapper facilityMapper;

  @Autowired
  ProcessingScheduleMapper processingScheduleMapper;
  @Autowired
  private ProcessingPeriodMapper processingPeriodMapper;

  @Autowired
  private SupervisoryNodeMapper supervisoryNodeMapper;

  @Autowired
  private RequisitionStatusChangeMapper mapper;


  private ProcessingSchedule processingSchedule;
  private Facility facility;
  private ProcessingPeriod processingPeriod;
  private SupervisoryNode supervisoryNode;
  private RequisitionStatusChange statusChange;
  private Rnr requisition;

  @Before
  public void setUp() throws Exception {
    facility = make(a(defaultFacility));
    facilityMapper.insert(facility);

    processingSchedule = make(a(ProcessingScheduleBuilder.defaultProcessingSchedule));
    processingScheduleMapper.insert(processingSchedule);

    processingPeriod = insertPeriod("Period 1");
    supervisoryNode = insertSupervisoryNode();
    Program program = new Program();
    program.setId(1L);

    requisition = make(a(RequisitionBuilder.defaultRnr, with(RequisitionBuilder.periodId, processingPeriod.getId()),
      with(RequisitionBuilder.facility, facility), with(RequisitionBuilder.program, program)));
    requisitionMapper.insert(requisition);

    statusChange = new RequisitionStatusChange(requisition);
  }

  @Test
  public void shouldLogStatusChangesToRequisition() throws Exception {
    mapper.insert(statusChange);

    RequisitionStatusChange change = mapper.getById(statusChange.getId());
    assertThat(change.getCreatedDate(), is(notNullValue()));
    change.setCreatedDate(null);

    assertThat(change, is(statusChange));
  }

  @Test @Ignore
  public void shouldGetOperationDateForRequisitionForStatus() throws Exception {
    mapper.insert(statusChange);

    Date initiatedDate = mapper.getOperationDateFor(requisition.getId(), INITIATED.toString());
    assertThat(statusChange.getCreatedDate(), is(initiatedDate));
  }

  private ProcessingPeriod insertPeriod(String name) {
    ProcessingPeriod processingPeriod = make(a(defaultProcessingPeriod,
      with(scheduleId, processingSchedule.getId()),
      with(ProcessingPeriodBuilder.name, name)));

    processingPeriodMapper.insert(processingPeriod);

    return processingPeriod;
  }

  private SupervisoryNode insertSupervisoryNode() {
    supervisoryNode = make(a(SupervisoryNodeBuilder.defaultSupervisoryNode));
    supervisoryNode.setFacility(facility);

    supervisoryNodeMapper.insert(supervisoryNode);
    return supervisoryNode;
  }
}
