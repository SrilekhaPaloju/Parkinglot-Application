sap.ui.define([
  "./BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
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

    onHistorylotPress: async function () {
      if (!this.oHistoryDialog) {
        this.oHistoryDialog = await this.loadFragment("History")
      }
      this.oHistoryDialog.open();

    },
    onCloseHistoryDialog: function () {
      if (this.oHistoryDialog.isOpen()) {
        this.oHistoryDialog.close()
      }
    },
    onRowDoubleClick: function () {
      var oSelected = this.byId("idSlotsTable").getSelectedItem();
      var ID = oSelected.getBindingContext().getObject().ID;
      const oRouter = this.getRouter();
      oRouter.navTo("RouteInformation", {
        ParkingLotId: ID,

      })
    },
    onDatavisualization: function (){
      const oRouter = this.getRouter();
      oRouter.navTo("RouteData")
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
      const oModel = this.getView().getModel("ModelV2");
    const oParkingLotData = await oModel.read("/ParkingLot('" + sParkingLotNumber + "')");

    if (oParkingLotData.status === "Occupied") {
        MessageBox.error("The selected parking lot is already occupied. Please select a different parking lot.");
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

        // oUserView.byId("_IDLoginGenInput").setValue("iddriverInputcol");
        // oUserView.byId("_IDGenLoginInput1").setValue("idphonenumberInputcol");
        // oUserView.byId("_IDGenLoginInput1").setValue("idvehicleInputcolvalue");

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
          oSelected.getBindingContext().delete("$auto").then(function () {
            MessageToast.show("Unassigned sucessfully")
            oThis.getView().byId("idSlotsTable").getBinding("items").refresh();
            this.getView().byId("idHistorySlotsTable").getBinding("items").refresh();
          })
          const updatedParkingLot = {
            status: "Available" // Assuming false represents empty parking
            // Add other properties if needed
          };
          oModel.update("/ParkingLot('" + sSlotNumber + "')", updatedParkingLot, {
            success: function () {
            }.bind(this),
            error: function (oError) {
              sap.m.MessageBox.error("Failed to update: " + oError.message);
            }.bind(this)
          });

        } catch (error) {
          console.error("Error:", error);
          sap.m.MessageToast.show("Failed to unassign vehicle: " + error.message);
        }
      }
    },
    onEdit: function () {
      var oTable = this.byId("idSlotsTable");
      var aSelectedItems = oTable.getSelectedItems();

      if (aSelectedItems.length === 0) {
        sap.m.MessageToast.show("Please select an item to edit.");
        return;
      }

      aSelectedItems.forEach(function (oItem) {
        var aCells = oItem.getCells();
        aCells.forEach(function (oCell) {
          var aVBoxItems = oCell.getItems();
          aVBoxItems[0].setVisible(false); // Hide Text
          aVBoxItems[1].setVisible(true); // Show Input
        });
      });
      this.byId("editButton").setVisible(false);
      this.byId("saveButton").setVisible(true);
      this.byId("cancelButton").setVisible(true);
    },

    onSave: function () {
      debugger;
      const oView = this.getView()
      var oTable = this.byId("idSlotsTable");
      var aSelectedItems = oTable.getSelectedItems();
      var oSelected = this.byId("idSlotsTable").getSelectedItem();

      if (oSelected) {
        var oContext = oSelected.getBindingContext().getObject();
        var sVehicle = oContext.vehicleNumber;
        var sDriverName = oContext.driverName;
        var sTypeofDelivery = oContext.trasnporTtype;
        var sDriverMobile = oContext.phoneNumber;
        var dCheckInTime = oContext.inTime;
        var dID = oContext.ID;
        var sOldSlotNumber = oContext.parkinglot.parkingLotNumber;

        // To get the selected parking lot number from the Select element
        var oSelect = oSelected.getCells()[0].getItems()[1]; // Assuming the Select is the second item in the first cell
        var sSlotNumber = oSelect.getSelectedKey();


        // create a record in history
        const oNewUpdate = new sap.ui.model.json.JSONModel({
          driverName: sDriverName,
          phoneNumber: sDriverMobile,
          vehicleNumber: sVehicle,
          trasnporTtype: sTypeofDelivery,
          inTime: new Date(),
          ID: dID,
          parkinglot: {
            parkingLotNumber: sSlotNumber
          }
        })
        this.getView().setModel(oNewUpdate, "oNewUpdate");

        var oPayload = this.getView().getModel("oNewUpdate").getData();
        var oDataModel = this.getOwnerComponent().getModel("ModelV2");// Assuming this is your OData V2 model

        try {
          // Assuming your update method is provided by your OData V2 model
          oDataModel.update("/AssignedLots(" + oPayload.ID + ")", oPayload, {
            success: function () {
              this.getView().byId("idSlotsTable").getBinding("items").refresh();
              sap.m.MessageBox.success("Slot updated successfully");
            }.bind(this),
            error: function (oError) {
              sap.m.MessageBox.error("Failed to update slot: " + oError.message);
            }.bind(this)
          });
        } catch (error) {
          sap.m.MessageBox.error("Some technical Issue");
        }
      }
      const updatedParkingLot = {
        status: "Occupied" // Assuming false represents empty parking
        // Add other properties if needed
      };
      oDataModel.update("/ParkingLot('" + sSlotNumber + "')", updatedParkingLot, {
        success: function () {
        }.bind(this),
        error: function (oError) {
          sap.m.MessageBox.error("Failed to update: " + oError.message);
        }.bind(this)
      });
      const updatedParkingLotNumber = {
        status: "Available" // Assuming false represents empty parking
        // Add other properties if needed
      };
      oDataModel.update("/ParkingLot('" + sOldSlotNumber + "')", updatedParkingLotNumber, {
        success: function () {
        }.bind(this),
        error: function (oError) {
          sap.m.MessageBox.error("Failed to update: " + oError.message);
        }.bind(this)
      });

      aSelectedItems.forEach(function (oItem) {
        var aCells = oItem.getCells();
        aCells.forEach(function (oCell) {
          var aVBoxItems = oCell.getItems();
          aVBoxItems[0].setVisible(true); // Hide Text
          aVBoxItems[1].setVisible(false); // Show Input
        });
      });
      this.byId("editButton").setVisible(true);
      this.byId("saveButton").setVisible(false);
      this.byId("cancelButton").setVisible(false);
    },
    onCancel: function () {
      var oTable = this.byId("idSlotsTable");
      var aSelectedItems = oTable.getSelectedItems();

      aSelectedItems.forEach(function (oItem) {
        var aCells = oItem.getCells();
        aCells.forEach(function (oCell) {
          var aVBoxItems = oCell.getItems();
          aVBoxItems[0].setVisible(true); // Show Text
          aVBoxItems[1].setVisible(false); // Hide Input
        });
      });

      this.byId("editButton").setVisible(true);
      this.byId("saveButton").setVisible(false);
      this.byId("cancelButton").setVisible(false);
    },
  });
});

