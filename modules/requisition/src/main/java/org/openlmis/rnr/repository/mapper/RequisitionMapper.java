/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.openlmis.rnr.repository.mapper;

import org.apache.ibatis.annotations.*;
import org.openlmis.core.domain.Facility;
import org.openlmis.core.domain.ProcessingPeriod;
import org.openlmis.core.domain.Program;
import org.openlmis.core.domain.RoleAssignment;
import org.openlmis.rnr.domain.Rnr;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RequisitionMapper {

  @Insert("INSERT INTO requisitions(facilityId, programId, periodId, status, modifiedBy, createdBy) " +
    "VALUES (#{facility.id}, #{program.id}, #{period.id}, #{status}, #{modifiedBy}, #{createdBy})")
  @Options(useGeneratedKeys = true)
  void insert(Rnr requisition);

  @Update({"UPDATE requisitions SET",
    "modifiedBy = #{modifiedBy},",
    "status = #{status},",
    "modifiedDate = CURRENT_TIMESTAMP,",
    "fullSupplyItemsSubmittedCost = #{fullSupplyItemsSubmittedCost},",
    "nonFullSupplyItemsSubmittedCost = #{nonFullSupplyItemsSubmittedCost},",
    "supervisoryNodeId = #{supervisoryNodeId},",
    "supplyingFacilityId = #{supplyingFacility.id}",
    "WHERE id = #{id}"})
  void update(Rnr requisition);

  @Select("SELECT * FROM requisitions WHERE id = #{rnrId}")
  @Results(value = {
    @Result(property = "id", column = "id"),
    @Result(property = "program.id", column = "programId"),
    @Result(property = "facility.id", column = "facilityId"),
    @Result(property = "period.id", column = "periodId"),
    @Result(property = "supplyingFacility.id", column = "supplyingFacilityId"),
    @Result(property = "fullSupplyLineItems", javaType = List.class, column = "id",
      many = @Many(select = "org.openlmis.rnr.repository.mapper.RnrLineItemMapper.getRnrLineItemsByRnrId")),
    @Result(property = "nonFullSupplyLineItems", javaType = List.class, column = "id",
      many = @Many(select = "org.openlmis.rnr.repository.mapper.RnrLineItemMapper.getNonFullSupplyRnrLineItemsByRnrId")),
    @Result(property = "regimenLineItems", javaType = List.class, column = "id",
      many = @Many(select = "org.openlmis.rnr.repository.mapper.RegimenLineItemMapper.getRegimenLineItemsByRnrId")),
  })
  Rnr getById(Long rnrId);

  @Select({"SELECT id, programId, facilityId, periodId, modifiedDate",
    "FROM requisitions ",
    "WHERE programId =  #{programId}",
    "AND supervisoryNodeId =  #{supervisoryNode.id}"})
  @Results({@Result(property = "program.id", column = "programId"),
    @Result(property = "facility.id", column = "facilityId"),
    @Result(property = "period.id", column = "periodId")})
  List<Rnr> getAuthorizedRequisitions(RoleAssignment roleAssignment);

  @Select("SELECT * FROM requisitions WHERE facilityId = #{facility.id} AND programId= #{program.id} AND periodId = #{period.id}")
  @Results(value = {
    @Result(property = "id", column = "id"),
    @Result(property = "facility.id", column = "facilityId"),
    @Result(property = "program.id", column = "programId"),
    @Result(property = "period.id", column = "periodId"),
    @Result(property = "fullSupplyLineItems", javaType = List.class, column = "id",
      many = @Many(select = "org.openlmis.rnr.repository.mapper.RnrLineItemMapper.getRnrLineItemsByRnrId")),
    @Result(property = "nonFullSupplyLineItems", javaType = List.class, column = "id",
      many = @Many(select = "org.openlmis.rnr.repository.mapper.RnrLineItemMapper.getNonFullSupplyRnrLineItemsByRnrId")),
    @Result(property = "regimenLineItems", javaType = List.class, column = "id",
      many = @Many(select = "org.openlmis.rnr.repository.mapper.RegimenLineItemMapper.getRegimenLineItemsByRnrId")),
  })
  Rnr getRequisitionWithLineItems(@Param("facility") Facility facility,
                                  @Param("program") Program program,
                                  @Param("period") ProcessingPeriod period);


  @Select({"SELECT * FROM requisitions R",
    "WHERE facilityId = #{facilityId}",
    "AND programId = #{programId} ",
    "AND status NOT IN ('INITIATED', 'SUBMITTED')",
    "ORDER BY (select startDate from processing_periods where id=R.periodId) DESC",
    "LIMIT 1"})
  @Results(value = {
    @Result(property = "facility.id", column = "facilityId"),
    @Result(property = "program.id", column = "programId"),
    @Result(property = "period.id", column = "periodId")
  })
  Rnr getLastRequisitionToEnterThePostSubmitFlow(@Param(value = "facilityId") Long facilityId,
                                                 @Param(value = "programId") Long programId);

  @Select("SELECT id, programId, facilityId, periodId, supplyingFacilityId, modifiedDate FROM requisitions WHERE STATUS='APPROVED'")
  @Results(value = {
    @Result(property = "facility.id", column = "facilityId"),
    @Result(property = "program.id", column = "programId"),
    @Result(property = "period.id", column = "periodId"),
    @Result(property = "supplyingFacility.id", column = "supplyingFacilityId")
  })
  List<Rnr> getApprovedRequisitions();

  @Select({"SELECT * FROM requisitions WHERE",
    "facilityId = #{facility.id} AND",
    "programId = #{program.id} AND ",
    "periodId = ANY (#{periods}::INTEGER[]) AND ",
    "status NOT IN ('INITIATED', 'SUBMITTED')"})
  @Results(value = {
    @Result(property = "facility.id", column = "facilityId"),
    @Result(property = "program.id", column = "programId"),
    @Result(property = "period.id", column = "periodId")
  })
  List<Rnr> getPostSubmitRequisitions(@Param("facility") Facility facility, @Param("program") Program program, @Param("periods") String periodIds);

  @Select({"SELECT * FROM requisitions WHERE",
    "facilityId = #{facilityId} AND",
    "programId = #{programId} AND ",
    "periodId = #{periodId}"
  })
  @Results(value = {
    @Result(property = "facility.id", column = "facilityId"),
    @Result(property = "program.id", column = "programId"),
    @Result(property = "period.id", column = "periodId")
  })
  Rnr getRequisitionWithoutLineItems(@Param("facilityId") Long facilityId,
                                     @Param("programId") Long programId,
                                     @Param("periodId") Long periodId);



  @Select("SELECT * FROM requisitions WHERE id = #{rnrId}")
  @Results(value = {
    @Result(property = "id", column = "id"),
    @Result(property = "program.id", column = "programId"),
    @Result(property = "facility.id", column = "facilityId"),
    @Result(property = "period.id", column = "periodId"),
    @Result(property = "supplyingFacility.id", column = "supplyingFacilityId")
  })
  Rnr getLWById(Long rnrId);

}
