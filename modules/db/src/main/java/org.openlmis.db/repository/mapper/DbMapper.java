package org.openlmis.db.repository.mapper;

import org.apache.ibatis.annotations.Select;
import org.springframework.stereotype.Repository;

import java.util.Date;

@Repository
public interface DbMapper {

  @Select("SELECT CURRENT_TIMESTAMP")
  public Date getCurrentTimeStamp();


  @Select("SELECT COUNT(*) FROM users")
  int getCount(String table);
}