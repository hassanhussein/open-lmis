/*
 * Copyright © 2013 VillageReach.  All Rights Reserved.  This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0.
 *
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

package org.openlmis.pageobjects;


import com.thoughtworks.selenium.SeleneseTestNgHelper;
import org.openlmis.UiUtils.TestWebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.How;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.pagefactory.AjaxElementLocatorFactory;

import java.io.IOException;


public class ViewOrdersPage extends RequisitionPage {

  @FindBy(how = How.ID, using = "NoRequisitionsPendingMessage")
  private static WebElement NoRequisitionsPendingMessage;

  @FindBy(how = How.XPATH, using = "//div[@class='ngCellText ng-scope col0 colt0']/span")
  private static WebElement orderNumberOnViewOrdersScreen;

  @FindBy(how = How.XPATH, using = "//div[@class='ngCellText ng-scope col2 colt2']/span")
  private static WebElement programOnViewOrderScreen;

  @FindBy(how = How.XPATH, using = "//html/body/div/div/div/div/div[3]/div/div[2]/div/div/div[2]/div[2]/div/span")
  private static WebElement facilityCodeNameOnOrderScreen;

  @FindBy(how = How.XPATH, using = "//html/body/div/div/div/div/div[3]/div/div[2]/div/div/div[4]/div[2]/div/span")
  private static WebElement periodDetailsOnViewOrderScreen;

  @FindBy(how = How.XPATH, using = "//html/body/div/div/div/div/div[3]/div/div[2]/div/div/div[5]/div[2]/div/span")
  private static WebElement supplyDepotOnViewOrderScreen;

  @FindBy(how = How.XPATH, using = "(//div[@id='orderStatus'])[1]")
  private static WebElement orderStatusOnViewOrderScreen;

  @FindBy(how = How.XPATH, using = "//div[@id='saveSuccessMsgDiv']")
  private static WebElement successMessageDiv;

  @FindBy(how = How.XPATH, using = "//div[@id='NoRequisitionsPendingMessage']")
  private static WebElement noRequisitionPendingMessage;

  @FindBy(how = How.XPATH, using = "//a[contains(text(),'Download CSV')]")
  private static WebElement downloadCSVLink;

  @FindBy(how = How.XPATH, using = "//span[contains(text(),'No products in this order')]")
  private static WebElement noOrderMessage;

  public ViewOrdersPage(TestWebDriver driver) throws IOException {
    super(driver);
    PageFactory.initElements(new AjaxElementLocatorFactory(TestWebDriver.getDriver(), 10), this);
    testWebDriver.setImplicitWait(10);
  }

  public void verifyOrderListElements(String program, String orderNumber, String facilityCodeName, String periodDetails, String supplyFacilityName, String orderStatus, boolean downloadLinkPresent) throws IOException {
    testWebDriver.waitForElementToAppear(programOnViewOrderScreen);
    SeleneseTestNgHelper.assertEquals(programOnViewOrderScreen.getText().trim(), program);
    SeleneseTestNgHelper.assertEquals(orderNumberOnViewOrdersScreen.getText().trim(), orderNumber);
    SeleneseTestNgHelper.assertEquals(facilityCodeNameOnOrderScreen.getText().trim(), facilityCodeName);
    SeleneseTestNgHelper.assertEquals(periodDetailsOnViewOrderScreen.getText().trim(), periodDetails);
    SeleneseTestNgHelper.assertEquals(supplyDepotOnViewOrderScreen.getText().trim(), supplyFacilityName);
    SeleneseTestNgHelper.assertEquals(orderStatusOnViewOrderScreen.getText().trim(), orderStatus);
    if (downloadLinkPresent)
      SeleneseTestNgHelper.assertTrue("'Download CSV' link should show up", downloadCSVLink.isDisplayed());
    else
      SeleneseTestNgHelper.assertTrue("'No products in this order' message should show up", noOrderMessage.isDisplayed());
  }

}