sap.ui.define([
  "./BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, JSONModel) {
  "use strict";

  return Controller.extend("com.app.parkinglot.controller.Home", {
    onInit: function () {
      const oTable = this.getView().byId("idSlotsTable");
      oTable.attachBrowserEvent("dblclick", this.onRowDoubleClick.bind(this));
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
    // onEditlotPress: async function () {
    //   if (!this.oEditlotDialog) {
    //     this.oEditlotDialog = await this.loadFragment("Edit")
    //   }
    //   this.oEditlotDialog.open();

    // },
    // onCloseeditDialog: function () {
    //   if (this.oEditlotDialog.isOpen()) {
    //     this.oEditlotDialog.close()
    //   }
    // },
    onRowDoubleClick: function () {
      var oSelected = this.byId("idSlotsTable").getSelectedItem();
      var ID = oSelected.getBindingContext().getObject().ID;
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
        oModel.update("/ParkingLot('" + sParkingLotNumber + "')", updatedParkingLot, {
          success: function () {
          }.bind(this),
          error: function (oError) {

            sap.m.MessageBox.error("Failed to update: " + oError.message);
          }.bind(this)
        });

      }
    },
    onUnassignlotPress: async function () {
      debugger;
      const oView = this.getView()
      var oSelected = this.byId("idSlotsTable").getSelectedItem();
      if (!oSelected) {
        sap.m.MessageToast.show("Please select a vehicle to unassign");
        return;
      }
      if (oSelected) {
        var sVehicle = oSelected.getBindingContext().getObject().vehicleNumber;
        var sSlotNumber = oSelected.getBindingContext().getObject().parkinglot.parkingLotNumber;
        var sDriverName = oSelected.getBindingContext().getObject().driverName
        var sTypeofDelivery = oSelected.getBindingContext().getObject().trasnporTtype
        var sDriverMobile = oSelected.getBindingContext().getObject().phoneNumber
        var dCheckInTime = oSelected.getBindingContext().getObject().inTime
        var oStatus = oSelected.getBindingContext().getObject().parkinglot.status;
        var currentDate = new Date();

        // create a record in history
        const oNewHistory = new sap.ui.model.json.JSONModel({
          driverName: sDriverName,
          driverMobile: sDriverMobile,
          vehicleNumber: sVehicle,
          deliveryType: sTypeofDelivery,
          checkInTime: dCheckInTime,
          historySlotNumber_parkingLotNumber: sSlotNumber,
          checkOutTime: currentDate
        })
        oView.setModel(oNewHistory, "oNewHistory");

        var oParkingslot = new sap.ui.model.json.JSONModel({
          parkingLotNumber: sSlotNumber,
          status: oStatus // Corrected spelling to 'available'
        });
        oView.setModel(oParkingslot, "oParkingslot");
        try {
          const oPayload = this.getView().getModel("oNewHistory").getProperty("/");
         // const oData = this.getView().getModel("oParkingslot").getProperty("/");
          const oModel = this.getView().getModel("ModelV2");
          this.createData(oModel, oPayload, "/History")
          this.deleteData(oModel, "/ParkingLot", sSlotNumber)

          // oSelected.getBindingContext().delete("$auto").then(function () {
          //   oThis.getView().byId("idSlotsTable").getBinding("items").refresh();
          // })
          // Update ParkingLot to mark slot as available
          //   oModel.remove("/AssignedLots('" + sSlotNumber + "')", {
          //     success: function () {
          //       // Update ParkignVeh to mark vehicle as unassigned
          //       oModel.create("/History", oNewHistory.getData(), {
          //         success: function () {
          //           oTable.getBinding("items").refresh(); // Refresh table binding
          //           sap.m.MessageToast.show("Unassigned the parkingslot");

          //           oModel.refresh(true); // Refresh the model after updates
          //         }.bind(this),
          //         error: function (oError) {
          //           sap.m.MessageBox.error("Error updating ParkignVeh: " + oError.message);
          //           console.error("Error updating ParkignVeh:", oError);
          //         }
          //       });
          //     }.bind(this),
          //     error: function (oError) {
          //       sap.m.MessageBox.error("Error updating ParkingLot: " + oError.message);
          //       console.error("Error updating ParkingLot:", oError);
          //     }
          //   });
          // Update parking lot entity to mark it as empty
          const updatedParkingLot = {
            status: "available" // Assuming false represents empty parking
            // Add other properties if needed
          };

          oModel.update("/ParkingLot('" + sSlotNumber + "')", updatedParkingLot, {

            success: function () {
              MessageToast.success(`Parking lot ${parkingLotNumber} is empty.`);
            },
            error: function (oError) {
              MessageToast.show("Failed to update parking lot: " + oError.message);
            }
          });

        } catch (error) {
          console.error("Error:", error);
          sap.m.MessageToast.show("Failed to unassign vehicle: " + error.message);
        }
      }
    }
  });
});

