/*
 * Copyright © 2013 VillageReach. All Rights Reserved. This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.openlmis.shipment.file;

import lombok.NoArgsConstructor;
import org.openlmis.shipment.domain.Shipment;
import org.openlmis.upload.Importable;
import org.openlmis.upload.RecordHandler;
import org.openlmis.upload.model.AuditFields;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("shipmentRecordHandler")
@NoArgsConstructor
public class ShipmentRecordHandler implements RecordHandler{
  private static Logger logger = LoggerFactory.getLogger(ShipmentRecordHandler.class);

  @Override
  public void execute(Importable importable, int rowNumber, AuditFields auditFields) {
    Shipment shipment = (Shipment) importable;
    logger.info(shipment.getOrderNumber());
    logger.info(""+rowNumber);
  }
}