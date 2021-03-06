-- Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
-- If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.

CREATE TABLE losses_adjustments_types (
  name                VARCHAR(50) NOT NULL,
  description         VARCHAR(100) NOT NULL,
  additive            BOOLEAN,
  displayOrder        INTEGER,
  createdDate         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (name),
  UNIQUE (description)
);