sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
  ],
  function (Controller, JSONModel, Filter, FilterOperator, MessageBox) {
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
      //   var sParkingLotNumber = this.byId("parkingLotSelect").getSelectedKey();
      //   const oRouter = this.getRouter();
      //   oRouter.navTo("RouteHome")
      //   MessageBox.show("Parkinglot number updated sucessfully")
      //   this.getView().byId("idSlotsTable").getBinding("items").refresh();
      //   oModel.update("/ParkingLot('" + sParkingLotNumber + "')",updatedParkingLot, {
      //     success: function () {

      //     }.bind(this),
      //     error: function (oError) {

      //         sap.m.MessageBox.error("Failed to update: " + oError.message);
      //     }.bind(this)
      // });
      const oView = this.getView();
      const oModel = oView.getModel();
      const sSelectedParkingLot = oView.byId("parkingLotSelectComboBox").getSelectedKey();
      var newupdateModel = new sap.ui.model.json.JSONModel({
       parkingLotNumber : sSelectedParkingLot
    });
    this.getView().setModel(newupdateModel, "newupdateModel");
  
    var oPayload = this.getView().getModel("newupdateModel").getData();
    var oDataModel = this.getOwnerComponent().getModel("ModelV2");// Assuming this is your OData V2 model
    console.log(oDataModel.getMetadata().getName());
    try {
        // Assuming your update method is provided by your OData V2 model
        oDataModel.update("/ParkingLot(" + oPayload.parkingLotNumber + ")", oPayload, {
            success: function () {
                this.getView().byId("idSlotsTable").getBinding("items").refresh();
                sap.m.MessageBox.success("Lot updated successfully");
            }.bind(this),
            error: function () {
            }.bind(this)
        });
    } catch (error) {
        sap.m.MessageBox.error("Some technical Issue");
    }
      const oRouter = this.getRouter();
        oRouter.navTo("RouteHome")
      },
    //   onUnassignlotPress: async function () {
    //   const oView = this.getView();
    //   const oLocalModel = oView.getModel("localModel");
    //   const oPayload = oLocalModel.getProperty("/");
    //   const oModel = oView.getModel("ModelV2");
    //   const sParkingLotNumber = oPayload.parkinglot.parkingLotNumber;
    //   try {
    //     // Update outTime and status
    //     oPayload.outTime = new Date();
    //     const oParkingLots = oModel.getProperty("/ParkingLot");
    //     const oAssignedLot = oParkingLots.find(lot => lot.parkingLotNumber === sParkingLotNumber);
    //     if (oAssignedLot) {
    //       oAssignedLot.status = "Available";
    //     }
    //     await this.updateData(oModel, oPayload, `/AssignedLots(${sParkingLotNumber})`);
    //     oModel.refresh();
    //     oView.byId("parkingLotSelect").getBinding("items").refresh();

    //     MessageBox.success("ParkingLot UnAssigned Successfully");
    //   } catch (error) {
    //     MessageBox.error("Some technical Issue");
    //     console.error("Error in onUnassignlotPress:", error);
    //   }
    // },
    updateData: function (oModel, oPayload, sPath) {
      return new Promise((resolve, reject) => {
        oModel.update(sPath, oPayload, {
          success: resolve,
          error: reject
        });
      });
    }
  });
  });
