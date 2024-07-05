sap.ui.define([
  "./BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
  "use strict";

  return Controller.extend("com.app.parkinglot.controller.Home", {
    onInit: function () {

    },
    onCreatelotPress: async function () {
      if (!this.oAssignedslotDialog) {
        this.oAssignedslotDialog = await this.loadFragment("Allocation")
      }
      this.oAssignedslotDialog.open();

    },
    onCloseCreateDialog: function () {
      if (this.oAssignedslotDialog.isOpen()) {
        this.oAssignedslotDialog.close()
      }
    },
    onSelectSlot: function (oEvent) {
      debugger;
      const { ID } = oEvent.getSource().getSelectedItem().getBindingContext().getObject();
      const oRouter = this.getRouter();
      oRouter.navTo("RouteInformation", {
        ParkingLotId: ID,

      })
    },
    onAssignPress: async function () {
     
      var sParkingLotNumber = this.byId("parkingLotSelect").getSelectedKey();
      var sVehicleNumber = this.byId("_IDGenInput2").getValue();
      var sDriverName = this.byId("_IDDriverInput2").getValue();
      var sPhoneNumber = this.byId("_IDPhnnoInput2").getValue();
      var sTransportType = this.byId("country").getSelectedKey();

      const parkingModel = new sap.ui.model.json.JSONModel({
        driverName: sDriverName,
        phoneNumber: sPhoneNumber,
        vehicleNumber: sVehicleNumber,
        trasnporTtype: sTransportType,
        inTime: new Date(),
        outTime: null,
        parkinglot:{
        parkingLotNumber:sParkingLotNumber
        }
      })
      this.getView().setModel(parkingModel, "parkingModel");
      // this.getView().byId("idSlotsTable").getBinding("items");
      const oPayload = this.getView().getModel("parkingModel").getProperty("/");
      const oModel = this.getView().getModel("ModelV2");
      try {
        await this.createData(oModel, oPayload, "/AssignedLots")
        this.getView().byId("idSlotsTable").getBinding("items").refresh();
        this.oAssignedslotDialog.close();
        sap.m.MessageBox.success("ParkingLot Assigned Successfully");
        // After successful creation, perform necessary UI updates
      } catch (error) {
        sap.m.MessageBox.error("Some technical Issue");
      }
    },
  });
});


