/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 *  If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.openlmis.core.service;

import org.apache.commons.collections.Closure;
import org.openlmis.core.domain.FacilityProgramProduct;
import org.openlmis.core.domain.Program;
import org.openlmis.core.domain.ProgramProduct;
import org.openlmis.core.domain.ProgramProductISA;
import org.openlmis.core.repository.FacilityProgramProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static org.apache.commons.collections.CollectionUtils.forAllDo;

@Service
public class FacilityProgramProductService {

  @Autowired
  private FacilityProgramProductRepository repository;

  @Autowired
  ProgramProductService programProductService;

  public List<FacilityProgramProduct> getForProgramAndFacility(Long programId, final Long facilityId) {
    List<ProgramProduct> programProducts = programProductService.getByProgram(new Program(programId));
    final List<FacilityProgramProduct> facilityProgramProducts = new ArrayList<>();
    forAllDo(programProducts, new Closure() {
      @Override
      public void execute(Object o) {
        facilityProgramProducts.add(getAllocationProduct((ProgramProduct) o, facilityId));
      }
    });
    return facilityProgramProducts;
  }

  private FacilityProgramProduct getAllocationProduct(ProgramProduct programProduct, Long facilityId) {
    return new FacilityProgramProduct(programProduct, facilityId, repository.getOverriddenIsa(programProduct.getId(), facilityId));
  }

  public void insertISA(ProgramProductISA isa) {
    repository.insertISA(isa);
  }


  public void updateISA(ProgramProductISA isa) {
    repository.updateISA(isa);
  }

  public void saveOverriddenIsa(final Long facilityId, List<FacilityProgramProduct> products) {
    forAllDo(products, new Closure() {
      @Override
      public void execute(Object o) {
        FacilityProgramProduct product = (FacilityProgramProduct) o;
        product.setFacilityId(facilityId);
        repository.save(product);
      }
    });
  }

  public List<FacilityProgramProduct> getByFacilityAndProgram(Long facilityId, Long programId) {
    return repository.getByFacilityAndProgram(facilityId, programId);
  }
}