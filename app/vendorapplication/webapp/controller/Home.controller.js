sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
],
function (Controller,MessageToast) {
    "use strict";

    return Controller.extend("com.app.vendorapplication.controller.Home", {
        onInit: function () {

  
        },
        onReservePress: async function(){
        if (!this.oReserveDialog) {
          this.oReserveDialog = await this.loadFragment("Reserve")
          this.oReserveDialog.attachAfterOpen(this.onReserveDialogOpened.bind(this));
        }
        this.oReserveDialog.open();
      },
      onReserveDialogOpened: function () {
        var today = new Date();
        var oDateTimePicker = this.byId("idDtaetimepicker");
        if (oDateTimePicker) {
            oDateTimePicker.setMinDate(today);
            oDateTimePicker.setDisplayFormat("yyyy-MM-dd HH:mm:ss");
        }
    },
      onCloseReserveDialog: function () {
        if (this.oReserveDialog.isOpen()) {
          this.oReserveDialog.close()
        }
      },
    onReserveslotPress: async function () {
      const oUserView = this.getView();
      var sParkingLotNumber = this.byId("parkingLotSelect").getSelectedKey();
      var sVendorName = this.byId("_IDGenVendorInput").getValue();
      var sVehicleNumber = this.byId("_IDGenInput2").getValue();
      var sDriverName = this.byId("_IDDriverInput2").getValue();
      var sPhoneNumber = this.byId("_IDPhnnoInput2").getValue();
      var sTransportType = this.byId("idTrasporttype").getSelectedKey();
      var oDatePicker = oUserView.byId("idDtaetimepicker");
      var oSelectedDate = oDatePicker.getDateValue();
  
      const reserveModel = new sap.ui.model.json.JSONModel({
          vendorName: sVendorName,
          driverName: sDriverName,
          mobileNumber: sPhoneNumber,
          vehicleNumber: sVehicleNumber,
          processType: sTransportType,
          reserveTime: oSelectedDate,
          parkingslot: {
              parkingLotNumber: sParkingLotNumber
          }
      });
  
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
        oUserView.byId("idTrasporttype").setValueState("Error");
        bValid = false;
      } else {
        oUserView.byId("idTrasporttype").setValueState("None");
      }
      if (!sParkingLotNumber) {
        oUserView.byId("parkingLotSelect").setValueState("Error");
        bValid = false;
      } else {
        oUserView.byId("parkingLotSelect").setValueState("None");
      }
      if (!bValid) {
        sap.m.MessageToast.show("Please enter correct data");
        return; // Prevent further execution
      }
      this.getView().setModel(reserveModel, "reserveModel");
      const oModel = this.getView().getModel("ModelV2");
      const oPayload = this.getView().getModel("reserveModel").getProperty("/");
      
      // Create the reservation entry
      await this.createData(oModel, oPayload, "/Reservations");
  
      // Update the parking lot status to Reserved
      const updatedParkingLot = {
          status: "Reserved"
      };
      await new Promise((resolve, reject) => {
          oModel.update("/ParkingLot('" + sParkingLotNumber + "')", updatedParkingLot, {
              success: resolve,
              error: function (oError) {
                  sap.m.MessageBox.error("Failed to update: " + oError.message);
                  reject(oError);
              }
          });
      });
  
      // Close the dialog and show a success message
      this.oReserveDialog.close();
      sap.m.MessageToast.show("Reserved Successfully");
  
      // Refresh the dropdown for available parking lots
      if (this.byId("parkingLotSelect")) {
          this.byId("parkingLotSelect").getBinding("items").refresh();
      }
      oUserView.byId("parkingLotSelect").setSelectedKey("");
      oUserView.byId("_IDGenVendorInput").setValue("");
      oUserView.byId("_IDGenInput2").setValue("");
      oUserView.byId("_IDPhnnoInput2").setValue("");
      oUserView.byId("idTrasporttype").setSelectedKey("");
      oUserView.byId("_IDDriverInput2").setValue("");
      oUserView.byId("idDtaetimepicker").setValue("");
      oModel.refresh(true);
  },
  
    });
});
