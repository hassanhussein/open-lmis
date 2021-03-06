/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.openlmis.core.repository.mapper;

import org.apache.ibatis.annotations.*;
import org.openlmis.core.domain.SupervisoryNode;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupervisoryNodeMapper {

  @Select("SELECT * FROM supervisory_nodes where id = #{id}")
  @Results(value = {
      @Result(property = "parent.id", column = "parentId"),
      @Result(property = "facility.id", column = "facilityId")
  })
  SupervisoryNode getSupervisoryNode(Long id);

  @Insert("INSERT INTO supervisory_nodes " +
      "(code, name, parentId, facilityId, description, createdBy, modifiedBy, modifiedDate)" +
      " VALUES (#{code}, #{name}, #{parent.id}, #{facility.id}, #{description}, #{createdBy}, #{modifiedBy}, #{modifiedDate})")
  @Options(useGeneratedKeys = true)
  Integer insert(SupervisoryNode supervisoryNode);

  @Select("SELECT id FROM supervisory_nodes WHERE LOWER(code) = LOWER(#{code})")
  Long getIdForCode(String code);

  @Select("WITH  recursive  supervisoryNodesRec AS " +
      "   (" +
      "   SELECT *" +
      "   FROM supervisory_nodes " +
      "   WHERE id in  (SELECT DISTINCT s.id FROM  " +
      "       supervisory_nodes s " +
      "       INNER JOIN role_assignments ra ON s.id = ra.supervisoryNodeId  " +
      "       INNER JOIN role_rights rr ON ra.roleId = rr.roleId  " +
      "       WHERE rr.rightName = ANY (#{commaSeparatedRights}::VARCHAR[])  " +
      "       AND ra.userId = #{userId}  " +
      "       AND ra.programId = #{programId}) " +
      "   UNION " +
      "   SELECT sn.* " +
      "   FROM supervisory_nodes sn " +
      "   JOIN supervisoryNodesRec " +
      "   ON sn.parentId = supervisoryNodesRec.id " +
      "   )" +
      "SELECT * FROM supervisoryNodesRec")
  List<SupervisoryNode> getAllSupervisoryNodesInHierarchyBy(@Param(value = "userId") Long userId, @Param(value = "programId") Long programId,
                                                            @Param(value = "commaSeparatedRights") String commaSeparatedRights);

  @Select({"SELECT SN.* FROM supervisory_nodes SN INNER JOIN requisition_groups RG ON RG.supervisoryNodeId = SN.id",
      "WHERE RG.code = #{rgCode}"})
  @Results(value = {
      @Result(property = "parent.id", column = "parentId"),
      @Result(property = "facility.id", column = "facilityId")
  })
  SupervisoryNode getFor(String rgCode);

  @Select("SELECT * FROM supervisory_nodes WHERE id = (SELECT parentId FROM supervisory_nodes WHERE id = #{id})")
  @Results(value = {
      @Result(property = "parent.id", column = "parentId"),
      @Result(property = "facility.id", column = "facilityId")
  })
  SupervisoryNode getParent(Long id);

  @Select("SELECT * FROM supervisory_nodes")
  List<SupervisoryNode> getAll();

  @Select({"WITH  recursive  supervisoryNodesRec AS ",
    "   (",
    "   SELECT *",
    "   FROM supervisory_nodes ",
    "   WHERE id in  (SELECT DISTINCT s.id FROM  ",
    "       supervisory_nodes s ",
    "       INNER JOIN role_assignments ra ON s.id = ra.supervisoryNodeId  ",
    "       INNER JOIN role_rights rr ON ra.roleId = rr.roleId  ",
    "       WHERE rr.rightName = ANY (#{commaSeparatedRights}::VARCHAR[])  ",
    "       AND ra.userId = #{userId} ) ",
    "   UNION ",
    "   SELECT sn.* ",
    "   FROM supervisory_nodes sn ",
    "   JOIN supervisoryNodesRec ",
    "   ON sn.parentId = supervisoryNodesRec.id ",
    "   )",
    "SELECT * FROM supervisoryNodesRec"})
  List<SupervisoryNode> getAllSupervisoryNodesInHierarchyByUserAndRights(@Param("userId") Long userId,
                                                                         @Param("commaSeparatedRights") String commaSeparatedRights);

  @Select({"WITH  recursive  supervisoryNodesRec AS ",
      "   (",
      "   SELECT *",
      "   FROM supervisory_nodes ",
      "   WHERE id = #{id}",
      "   UNION ",
      "   SELECT sn.* ",
      "   FROM supervisory_nodes sn ",
      "   JOIN supervisoryNodesRec ",
      "   ON sn.id = supervisoryNodesRec.parentId ",
      "   )",
      "SELECT * FROM supervisoryNodesRec"})
  List<SupervisoryNode> getAllParentSupervisoryNodesInHierarchy(SupervisoryNode supervisoryNode);

  @Select("SELECT * FROM supervisory_nodes WHERE LOWER(code) = LOWER(#{code})")
  SupervisoryNode getByCode(SupervisoryNode supervisoryNode);

  @Update("UPDATE supervisory_nodes " +
    "SET name = #{name}, parentId = #{parent.id}, facilityId = #{facility.id}, " +
    "description = #{description}, modifiedBy = #{modifiedBy}, modifiedDate = #{modifiedDate} " +
    "WHERE id = #{id}")
  void update(SupervisoryNode supervisoryNode);
}
