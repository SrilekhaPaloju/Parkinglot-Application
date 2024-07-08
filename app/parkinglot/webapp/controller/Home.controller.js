sap.ui.define([
  "./BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
  "use strict";

  return Controller.extend("com.app.parkinglot.controller.Home", {
    onInit: function () {
      const oLocalModel = new JSONModel({
        outTime :new Date(),
        parkinglot:{
        status: "Available"
        }
    });
    this.getView().setModel(oLocalModel, "localModel");
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
      const oUserView = this.getView()
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
        parkinglot: {
          parkingLotNumber: sParkingLotNumber,
        }
      })
   
        var bValid = true;
        if (!sDriverName || sDriverName.length < 4) {
            oUserView.byId("_IDDriverInput2").setValueState("Error");
            oUserView.byId("_IDDriverInput2").setValueStateText("Name Must Contain 3 Characters");
            bValid = false;
        } else {
            oUserView.byId("_IDDriverInput2").setValueState("None");
        }
        if (!sPhoneNumber || sPhoneNumber.length !== 10 || !/^\d+$/.test(sPhoneNumber)) {
            oUserView.byId("_IDPhnnoInput2").setValueState("Error");
            oUserView.byId("_IDPhnnoInput2").setValueStateText("Mobile number must be a 10-digit numeric value");

            bValid = false;
        } else {
            oUserView.byId("_IDPhnnoInput2").setValueState("None");
        }
        if (!sVehicleNumber || !/^[A-Za-z]{2}\d{2}[A-Za-z]{2}\d{4}$/.test(sVehicleNumber)) {
            oUserView.byId("_IDGenInput2").setValueState("Error");
            oUserView.byId("_IDGenInput2").setValueStateText("Vehicle number should follow this pattern AP12BG1234");

            bValid = false;
        } else {
            oUserView.byId("_IDGenInput2").setValueState("None");
        }
        if (!sTransportType) {
            oUserView.byId("country").setValueState("Error");
            bValid = false;
        } else {
            oUserView.byId("country").setValueState("None");
        }
        if (!sParkingLotNumber) {
            oUserView.byId("parkingLotSelect").setValueState("Error");
            bValid = false;
        } else {
            oUserView.byId("parkingLotSelect").setValueState("None");
        }

        if (!bValid) {
            MessageToast.show("Please enter correct data");
            return; // Prevent further execution

        }
        else {
          this.getView().setModel(parkingModel, "parkingModel");
          // this.getView().byId("idSlotsTable").getBinding("items");
          const oPayload = this.getView().getModel("parkingModel").getProperty("/");
          const oModel = this.getView().getModel("ModelV2");
             this.createData(oModel, oPayload, "/AssignedLots")
             this.oAssignedslotDialog.close();
            MessageToast.show("ParkingLot Assigned Successfully")
          this.getView().byId("idSlotsTable").getBinding("items").refresh();

          const updatedParkingLot = {
            status: "Occupied" // Assuming false represents empty parking
            // Add other properties if needed
        };
          oModel.update("/ParkingLot('" + sParkingLotNumber + "')",updatedParkingLot, {
            success: function () {
            }.bind(this),
            error: function (oError) {

                sap.m.MessageBox.error("Failed to update: " + oError.message);
            }.bind(this)
        });
  
        }
    },
    onUnassignlotPress: async function () {
      try {
        const oLocalModel = this.getView().getModel("localModel");
        const sParkingLotNumber = this.byId("parkingLotSelect").getSelectedKey();
        const oModel = this.getView().getModel("ModelV2");

        // Fetch the AssignedLots entity based on the selected parking lot
        const oAssignedLot = await oModel.read("/AssignedLots", {
          filters: [new sap.ui.model.Filter("parkinglot_parkingLotNumber", sap.ui.model.FilterOperator.EQ, sParkingLotNumber)],
          urlParameters: {
            $top: 1
          }
        });
        if (oAssignedLot.results.length > 0) {
          const oAssignedLotData = oAssignedLot.results[0];
          oAssignedLotData.outTime = new Date();

          // Update the AssignedLots entity
          await oModel.update("/AssignedLots('" + oAssignedLotData.ID + "')", oAssignedLotData);

          // Update the ParkingLot entity to mark it as Available
          const updatedParkingLot = {
            status: "Available"
          };
          await oModel.update("/ParkingLot('" + sParkingLotNumber + "')", updatedParkingLot);

          MessageToast.show(`Vehicle unassigned successfully. Parking lot ${sParkingLotNumber} is now available.`);
          
          // Refresh the parking lot dropdown
          this.getView().byId("parkingLotSelect").getBinding("items").refresh();
        } else {
          MessageToast.show("Assigned lot not found.");
        }
      } catch (error) {
        console.error("Error:", error);
        sap.m.MessageBox.error("Failed to unassign vehicle: " + error.message);
      }
     }
  });
});

