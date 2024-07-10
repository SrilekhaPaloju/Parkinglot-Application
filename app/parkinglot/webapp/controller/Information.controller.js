sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    'sap/ui/model/BindingMode',
    'sap/viz/ui5/format/ChartFormatter',
    'sap/viz/ui5/api/env/Format',
    "sap/m/MessageToast"
  ],
  function (Controller, JSONModel, BindingMode , ChartFormatter, Format, MessageToast) {
    "use strict";


    return Controller.extend("com.app.parkinglot.controller.Information", {
      onInit: function () {

        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.attachRoutePatternMatched(this.onCurrentParkingDetails, this);
  },
      onCurrentParkingDetails: function (oEvent) {
        debugger;
        const { ParkingLotId } = oEvent.getParameter("arguments");
        this.ID = ParkingLotId;
        // const sRouterName = oEvent.getParameter("name");
        const oForm = this.getView().byId("ObjectPageLayout");
        oForm.bindElement(`/AssignedLots(${ParkingLotId})`, {
          expand: ''
        });
      },

      onSavePress: function () {
        const oView = this.getView();
        var sParkingLotNumber = oView.byId("parkingLotSelectComboBox").getSelectedKey();

        const oRouter = this.getRouter();
        oRouter.navTo("RouteHome")
        MessageToast.show("Parkinglot number updated sucessfully")
        this.getView().byId("idSlotsTable").getBinding("items").refresh();

        const updatedParkingLot = {
          status: "Occupied" // Assuming false represents empty parking
          // Add other properties if needed
        };

        oModel.update("/ParkingLot('" + sParkingLotNumber + "')", updatedParkingLot, {
          success: function () {
          }.bind(this),
          error: function (oError) {
            sap.m.MessageBox.error("Failed to update: " + oError.message);
          }.bind(this)
        });
       
      },
  });
  });
