-- Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
-- If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.

DROP TABLE IF EXISTS dosage_units;
CREATE TABLE dosage_units (
    id SERIAL PRIMARY KEY,
    code varchar(20),
    displayOrder INTEGER,
    createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX uc_dosage_units_lower_code ON dosage_units(LOWER(code));

