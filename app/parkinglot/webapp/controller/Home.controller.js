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
      this._setParkingLotModel();
    },

    onRowDoubleClick: function () {
      var oSelected = this.byId("idSlotsTable").getSelectedItem();
      var ID = oSelected.getBindingContext().getObject().ID;
      const oRouter = this.getRouter();
      oRouter.navTo("RouteInformation", {
        ParkingLotId: ID,

      })
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
    onDatavisualization: async function () {
      if (!this.oDataVisualizationDialog) {
        this.oDataVisualizationDialog = await this.loadFragment("DataVisualization")
      }
      this.oDataVisualizationDialog.open();
      this._setParkingLotModel();

    },
    onCloseDataVisualizationDialog: function () {
      if (this.oDataVisualizationDialog.isOpen()) {
        this.oDataVisualizationDialog.close()
      }
    },
    onReservation: async function () {
      debugger
      if (!this.oReservedslotDialog) {
        this.oReservedslotDialog = await this.loadFragment("ReservedSlots")
      }
      this.oReservedslotDialog.open();
      this.getView().byId("idReserveSlotsTable").getBinding("items").refresh();
    },
    onCloseReserveDialog: function () {
      if (this.oReservedslotDialog.isOpen()) {
        this.oReservedslotDialog.close()
      }
    },
 
    // onDatavisualization: function () {
    //   const oRouter = this.getRouter();
    //   oRouter.navTo("RouteData")
    // },

    onAssignPress: async function () {
      const oUserView = this.getView();
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
      });

      var bValid = true;
      if (!sDriverName || sDriverName.length < 4) {
        oUserView.byId("_IDDriverInput2").setValueState("Error");
        oUserView.byId("_IDDriverInput2").setValueStateText("Name Must Contain 4 Characters");
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
        const oPayload = this.getView().getModel("parkingModel").getProperty("/");
       var create = this.createData(oModel, oPayload, "/AssignedLots");
        if (create) {
          
            // Replace with your actual Twilio Account SID and Auth Token
            const accountSid = 'ACb224f5ef242a9b70012285792ef40e8a';
            const authToken = '7dfb18571a99989245c76f9c1d316162';
               var to = "+91"+ sPhoneNumber;
            // Function to send SMS using Twili
                debugger
                const toNumber = to ; // Replace with recipient's phone number
                const fromNumber = '+18149043908'; // Replace with your Twilio phone number
                const messageBody = 'Hello ' + sDriverName + ',\n' +
                'Your vehicle (' + sVehicleNumber + ') has been assigned to parking lot ' + sParkingLotNumber + '.\n' +
                'Please park your vehicle in the assigned slot.\n' +
                'Thank you,\n'

                // Twilio API endpoint for sending messages
                const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

                // Payload for the POST request
                const payload = {
                    To: toNumber,
                    From: fromNumber,
                    Body: messageBody
                };

                // Send POST request to Twilio API using jQuery.ajax
                $.ajax({
                    url: url,
                    type: 'POST',
                    headers: {
                        'Authorization': 'Basic ' + btoa(accountSid + ':' + authToken)
                    },
                    data: payload,
                    success: function (data) {
                        console.log('SMS sent successfully:', data);
                        // Handle success, e.g., show a success message
                        sap.m.MessageToast.show('SMS sent successfully!');
                    },
                    error: function (xhr, status, error) {
                        console.error('Error sending SMS:', error);
                        // Handle error, e.g., show an error message
                        sap.m.MessageToast.show('Failed to send SMS: ' + error);
                    }
                });
        }

        this.oAssignedslotDialog.close();
        MessageToast.show("ParkingLot Assigned Successfully");
        oModel.refresh(true);

        const updatedParkingLot = {
          status: "Occupied"
        };

        oModel.update("/ParkingLot('" + sParkingLotNumber + "')", updatedParkingLot, {
          success: function () {
            // Refresh the idSlotsTable binding
            this.getView().byId("idSlotsTable").getBinding("items").refresh();
            this.getView().byId("parkingLotSelect").getBinding("items").refresh();
            this._setParkingLotModel();

            // Reset the input fields
            oUserView.byId("parkingLotSelect").setSelectedKey("");
            oUserView.byId("_IDGenInput2").setValue("");
            oUserView.byId("_IDDriverInput2").setValue("");
            oUserView.byId("_IDPhnnoInput2").setValue("");
            oUserView.byId("country").setSelectedKey("");
          }.bind(this),
          error: function (oError) {
            sap.m.MessageBox.error("Failed to update: " + oError.message);
          }.bind(this)
        });
      }
    },
    onUnassignlotPress: async function () {
      const oView = this.getView();
      var oSelected = this.byId("idSlotsTable").getSelectedItem();
      if (!oSelected) {
        sap.m.MessageToast.show("Please select a vehicle to unassign");
        return;
      }

      if (oSelected) {
        var sVehicle = oSelected.getBindingContext().getObject().vehicleNumber;
        var sSlotNumber = oSelected.getBindingContext().getObject().parkinglot.parkingLotNumber;
        var sDriverName = oSelected.getBindingContext().getObject().driverName;
        var sTypeofDelivery = oSelected.getBindingContext().getObject().trasnporTtype;
        var sDriverMobile = oSelected.getBindingContext().getObject().phoneNumber;
        var dCheckInTime = oSelected.getBindingContext().getObject().inTime;
        var oStatus = oSelected.getBindingContext().getObject().parkinglot.status;
        var currentDate = new Date();

        // Create a record in history
        const oNewHistory = new sap.ui.model.json.JSONModel({
          driverName: sDriverName,
          driverMobile: sDriverMobile,
          vehicleNumber: sVehicle,
          deliveryType: sTypeofDelivery,
          checkInTime: dCheckInTime,
          historySlotNumber_parkingLotNumber: sSlotNumber,
          checkOutTime: currentDate
        });
        oView.setModel(oNewHistory, "oNewHistory");

        var oParkingslot = new sap.ui.model.json.JSONModel({
          parkingLotNumber: sSlotNumber,
          status: oStatus
        });
        oView.setModel(oParkingslot, "oParkingslot");

        try {
          const oPayload = this.getView().getModel("oNewHistory").getProperty("/");
          const oModel = this.getView().getModel("ModelV2");
          this.createData(oModel, oPayload, "/History");

          oSelected.getBindingContext().delete("$auto").then(function () {
            MessageToast.show("Unassigned successfully");
            this.getView().byId("idSlotsTable").getBinding("items").refresh();
            this._setParkingLotModel();
            this.getView().byId("idHistorySlotsTable").getBinding("items").refresh();
            this.getView().byId("parkingLotSelect").getBinding("items").refresh(); // Refresh parking lot select

          }.bind(this));

          const updatedParkingLot = {
            status: "Available"
          };
          oModel.update("/ParkingLot('" + sSlotNumber + "')", updatedParkingLot, {
            success: function () {
              // Additional logic can be added here if needed
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
      const oView = this.getView()
      var oModel = oView.getModel("ModelV2");
      var oTable = this.byId("idSlotsTable");
      var aSelectedItems = oTable.getSelectedItems();
      var oSelected = this.byId("idSlotsTable").getSelectedItem();

      if (oSelected) {
        var oContext = oSelected.getBindingContext().getObject();
        var sVehicle = oContext.vehicleNumber;
        var sDriverName = oContext.driverName;
        var sTypeofDelivery = oContext.trasnporTtype;
        var sDriverMobile = oContext.phoneNumber;
        var dID = oContext.ID;
        var sOldSlotNumber = oContext.parkinglot.parkingLotNumber;

        var phoneNumberPattern = /^\d{10}$/; // Example pattern: exactly 10 digits
        if (!phoneNumberPattern.test(sDriverMobile)) {
          sap.m.MessageBox.error("Invalid phone number. It should be exactly 10 digits.");
          return; // Stop execution if validation fails
        }
    
        var vehicleNumberPattern = /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/; // Pattern: 2 letters, 2 digits, 2 letters, 4 digits
        if (!vehicleNumberPattern.test(sVehicle)) {
          sap.m.MessageBox.error("Invalid vehicle number. It should be in the format AP12BG1234.");
          return; // Stop execution if validation fails
        }

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
        

          // Assuming your update method is provided by your OData V2 model
          oDataModel.update("/AssignedLots(" + oPayload.ID + ")", oPayload, {
            success: function () {
              const updatedParkingLot = {
                status: "Occupied" // Assuming false represents empty parking
                // Add other properties if needed
              };
              oDataModel.update("/ParkingLot('" + sSlotNumber + "')", updatedParkingLot, {
                success: function () {
                  const updatedParkingLotNumber = {
                    status: "Available" // Assuming false represents empty parking
                    // Add other properties if needed
                    
                  };
                  oDataModel.update("/ParkingLot('" + sOldSlotNumber + "')", updatedParkingLotNumber, {
                    success: function () {
                      oModel.refresh();
                      oTable.getBinding("items").refresh();
                        sap.m.MessageBox.success("Slot updated successfully");
                        var oAssignedSlotsDropdown = oView.byId("parkingLotSelectComboBox"); // Replace with the actual ID of the dropdown in the fragment
                        if (oAssignedSlotsDropdown) {
                            var oAssignedSlotsDropdownBinding = oAssignedSlotsDropdown.getBinding("items");
                            if (oAssignedSlotsDropdownBinding) {
                                oAssignedSlotsDropdownBinding.refresh();
                            }
                        }

                        // Refresh the combobox in the table (if applicable)
                        var oParkingLotSelect = oView.byId("parkingLotSelect"); // Replace with the actual ID of the combobox
                        if (oParkingLotSelect) {
                            var oParkingLotSelectBinding = oParkingLotSelect.getBinding("items");
                            if (oParkingLotSelectBinding) {
                                oParkingLotSelectBinding.refresh();
                            }
                        }
                      },
                      error: function (oError) {
                        sap.m.MessageBox.error("Failed to update new slot: " + oError.message);
                      }
                    });
                  },
                  error: function (oError) {
                    sap.m.MessageBox.error("Failed to update old slot: " + oError.message);
                  }
                });
              },
              error: function (oError) {
                sap.m.MessageBox.error("Failed to update the slot: " + oError.message);
              }
            });
     
          }
            
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
    _setParkingLotModel: function () {
      // Fetch data from OData service
      var oModel = this.getOwnerComponent().getModel("ModelV2");
      var that = this;

      oModel.read("/ParkingLot", {
        success: function (oData) {
          var aItems = oData.results;
          var availableCount = aItems.filter(item => item.status === "Available").length;
          var occupiedCount = aItems.filter(item => item.status === "Occupied").length;
          var reserveCount = aItems.filter(item => item.status === "Reserved").length;

          var aChartData = {
            Items: [
              {
                Status: "Available",
                Count: availableCount
              },
              {
                Status: "Occupied",
                Count: occupiedCount
              },
              {
                Status: "Reserved",
                Count: reserveCount
              }
            ]
          };
          var oParkingLotModel = new JSONModel();
          oParkingLotModel.setData(aChartData);
          that.getView().setModel(oParkingLotModel, "ParkingLotModel");
        },
        error: function (oError) {
          // Handle error
          console.error(oError);
        }
      });
    },
    onAssignDialog: async function(){
      const oView = this.getView();
      var oSelected = this.byId("idReserveSlotsTable").getSelectedItem();
      if (!oSelected) {
        sap.m.MessageToast.show("Please select a vehicle to unassign");
        return;
      }

      if (oSelected) {
        var oSelectedContext = oSelected.getBindingContext();
        var sVehicle = oSelectedContext.getProperty("vehicleNumber");
        var sSlotNumber = oSelectedContext.getProperty("parkingslot_parkingLotNumber");
        var sDriverName = oSelectedContext.getProperty("driverName");
        var sTypeofDelivery = oSelectedContext.getProperty("processType");
        var sDriverMobile = oSelectedContext.getProperty("mobileNumber");
        var dCheckInTime = oSelectedContext.getProperty("reserveTime");

        // Create a record in history
        const oNewAssign = new sap.ui.model.json.JSONModel({
          driverName: sDriverName,
          phoneNumber: sDriverMobile,
          vehicleNumber: sVehicle,
          trasnporTtype: sTypeofDelivery,
          inTime: dCheckInTime,
          parkinglot_parkingLotNumber: sSlotNumber,
        });
        oView.setModel(oNewAssign, "oNewAssign")
        try {
          const oPayload = this.getView().getModel("oNewAssign").getProperty("/");
          const oModel = this.getView().getModel("ModelV2");
          this.createData(oModel, oPayload, "/AssignedLots");

          oSelected.getBindingContext().delete("$auto").then(function () {
            MessageToast.show("Assigned successfully");
            this.getView().byId("idSlotsTable").getBinding("items").refresh();
            this._setParkingLotModel();
            this.getView().byId("idReserveSlotsTable").getBinding("items").refresh(); // Refresh parking lot select
          }.bind(this));

          const updatedParkingLot = {
            status: "Occupied"
          };
          oModel.update("/ParkingLot('" + sSlotNumber + "')", updatedParkingLot, {
            success: function () {
              // Additional logic can be added here if needed
            }.bind(this),
            error: function (oError) {
              sap.m.MessageBox.error("Failed to update: " + oError.message);
            }.bind(this)
          });

          var oParkingLotSelect = this.byId("parkingLotSelect");
          if (oParkingLotSelect) {
              oParkingLotSelect.getBinding("items").refresh();
          }

        } catch (error) {
          console.error("Error:", error);
          sap.m.MessageToast.show("Failed to assign vehicle: " + error.message);
        }
      }
    },
    onNotificationPress: function (oEvent) {
      var oButton = oEvent.getSource(),
          oView = this.getView();

      // create popover
      if (!this._pPopover) {
          this._pPopover = this.loadFragment("Notification").then(function (oPopover) {
              oView.addDependent(oPopover);
              oPopover.bindElement("");
              return oPopover;
          });
      }
      this._pPopover.then(function (oPopover) {
          oPopover.openBy(oButton);
      });
  },
  onItemClose1:function(oEvent){
    var oItem = oEvent.getSource(),
    oList = oItem.getParent();

  oList.removeItem(oItem);
  MessageToast.show("Item Closed: " + oItem.getTitle());

  }
  });
});

