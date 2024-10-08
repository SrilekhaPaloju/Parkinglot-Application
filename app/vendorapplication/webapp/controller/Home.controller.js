sap.ui.define([
  "./BaseController",
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
],
  function (Controller, MessageToast,Filter,FilterOperator) {
    "use strict";

    return Controller.extend("com.app.vendorapplication.controller.Home", {
      onInit: function () {
      },
      onReservePress: async function () {
        if (!this.oReserveDialog) {
          this.oReserveDialog = await this.loadFragment("Reserve")
          this.oReserveDialog.attachAfterOpen(this.onReserveDialogOpened.bind(this));
        }
        this.oReserveDialog.open();
        this.getView().byId("parkingLotSelect").getBinding("items").refresh();
      },
      onReserveDialogOpened: function () {
        var today = new Date();
        var maxDate = new Date();
        maxDate.setDate(today.getDate() + 7); // Set max date to 7 days from today
      
        var oDateTimePicker = this.byId("idDatetimepicker");
        if (oDateTimePicker) {
          oDateTimePicker.setMinDate(today);
          oDateTimePicker.setMaxDate(maxDate); // Set the max date
          oDateTimePicker.setDisplayFormat("yyyy-MM-dd");
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
        var oDatePicker = oUserView.byId("idDatetimepicker");
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
        if (!sVendorName || sVendorName.length < 4) {
          oUserView.byId("_IDGenVendorInput").setValueState("Error");
          oUserView.byId("_IDGenVendorInput").setValueStateText("Vendor Name cannot be Empty");
          bValid = false;
        } else {
          oUserView.byId("_IDDriverInput2").setValueState("None");
        }
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

        var bVehicleExists = await this.checkVehicleExists(oModel, sVehicleNumber);

        if (bVehicleExists) {
          sap.m.MessageBox.error("The vehicle is already assigned a parking lot.");
          return; // Prevent further execution
        }
        const oPayload = this.getView().getModel("reserveModel").getProperty("/");

        // Create the reservation entry
        await this.createData(oModel, oPayload, "/Reservations");

      //  Update the parking lot status to Reserved
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
        this.updateParkingLotSelect();

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
        oDatePicker.setDateValue(null);
        oModel.refresh(true);
      },
      checkVehicleExists: function (oModel, sVehicleNumber) {
        return new Promise(function (resolve, reject) {
          oModel.read("/Reservations", {
            filters: [new sap.ui.model.Filter("vehicleNumber", sap.ui.model.FilterOperator.EQ, sVehicleNumber)],
            success: function (oData) {
              if (oData.results && oData.results.length > 0) {
                resolve(true);
              } else {
                resolve(false);
              }
            },
            error: function (oError) {
              reject(oError);
            }
          });
        });
      },
      onTruckTypeSelect: function (oEvent) {
        // Get the selected transport type
        var sSelectedTransportType = oEvent.getSource().getSelectedKey();
        console.log("Selected Transport Type:", sSelectedTransportType);
     
        // Get the reference to the parking lot Select control
        var oParkingLotSelect = this.getView().byId("parkingLotSelect");
     
        // Check if the Select control is found
        if (!oParkingLotSelect) {
            console.error("Parking Lot Select control not found!");
            return;
        }
     
        // Build the filter based on the selected transport type
        var aFilters = [];
        if (sSelectedTransportType === "Inward" || sSelectedTransportType === "Outward") {
            aFilters.push(new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "Available"));
            aFilters.push(new sap.ui.model.Filter("trasnporTtype", sap.ui.model.FilterOperator.EQ, sSelectedTransportType));
        }
     
        // Apply the filter to the parking lot Select control's binding
        var oBinding = oParkingLotSelect.getBinding("items");
        if (oBinding) {
            oBinding.filter(aFilters);
        } else {
            console.error("Binding for parking lot Select control not found!");
        }
    },
    updateParkingLotSelect: async function () {
      var oModel = this.getView().getModel("ModelV2");
     
      try {
          var aInboundSlots = await new Promise((resolve, reject) => {
              oModel.read("/ParkingLot", {
                  filters: [
                      new sap.ui.model.Filter("trasnporTtype", sap.ui.model.FilterOperator.EQ, "Inward"),
                      new sap.ui.model.Filter("status", sap.ui.model.FilterOperator.EQ, "Available")
                  ],
                  success: function (oData) {
                      resolve(oData.results);
                  },
                  error: function (oError) {
                      reject(oError);
                  }
              });
          });
         
          var oParkingLotSelect = this.byId("parkingLotSelect");
          oParkingLotSelect.destroyItems();
         
          aInboundSlots.forEach(slot => {
              oParkingLotSelect.addItem(new sap.ui.core.Item({
                  key: slot.parkingLotNumber,
                  text: slot.parkingLotNumber,
              }));
          });
      } catch (error) {
          sap.m.MessageBox.error("Failed to update parking lot select: " + error.message);
      }
  },
    });
  });
