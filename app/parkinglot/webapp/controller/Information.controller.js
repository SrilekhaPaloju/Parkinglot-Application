sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, Filter, FilterOperator, MessageToast) {
    "use strict";

    return Controller.extend("com.app.parkinglot.controller.Information", {
      onInit: function () {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.attachRoutePatternMatched(this.onCurrentParkingDetails, this);
      },
      onCurrentParkingDetails: function (oEvent) {
        const { ParkingLotId } = oEvent.getParameter("arguments");
        this.ID = ParkingLotId;
        // const sRouterName = oEvent.getParameter("name");
        const oForm = this.getView().byId("ObjectPageLayout");
        oForm.bindElement(`/ParkingLot(${ParkingLotId})`, {
          expand: ''
        });
      },
    });
  }
);
