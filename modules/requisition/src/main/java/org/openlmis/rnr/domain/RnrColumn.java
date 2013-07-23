/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.openlmis.rnr.domain;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode
public class RnrColumn extends Column {

  private int position;
  private RnRColumnSource source;
  private Boolean sourceConfigurable;
  private String formula;
  private String indicator;
  private boolean used;
  private boolean mandatory;
  private String description;
  private boolean formulaValidationRequired = true;
  private Long createdBy;

  @SuppressWarnings(value = "unused")
  public void setSourceString(String sourceString) {
    this.source = RnRColumnSource.getValueOf(sourceString);
  }

  @Override
  public Integer getColumnWidth() {
    if (this.name.equals("product")) {
      return 125;
    }
    if (this.name.equals("remarks")) {
      return 100;
    }
    if (this.name.equals("reasonForRequestedQuantity")) {
      return 100;
    }
    return 40;
  }

  @Override
  public ColumnType getColumnType() {
    if (this.getName().equals("price") || this.getName().equals("cost")) {
      return ColumnType.CURRENCY;
    }
    if (this.getName().equals("product") || this.getName().equals("dispensingUnit") || this.getName().equals("productCode")) {
      return ColumnType.TEXT;
    }
    return ColumnType.NUMERIC;
  }


  @Override
  public boolean equals(Object o) {
    if (o == null) return false;
    if (!(o instanceof RnrColumn)) return false;
    RnrColumn rnrColumn = (RnrColumn) o;
    return (this.name.equals(rnrColumn.getName()));
  }

}
