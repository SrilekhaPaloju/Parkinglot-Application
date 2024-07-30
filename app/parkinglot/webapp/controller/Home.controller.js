sap.ui.define([
  "./BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
], function (Controller, MessageToast, JSONModel,Filter, FilterOperator) {
  "use strict";

  return Controller.extend("com.app.parkinglot.controller.Home", {
    isEditMode: false,
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
      if (!sVehicleNumber || !/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(sVehicleNumber)) {
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
        const oModel = this.getView().getModel("ModelV2");

        var bVehicleExists = await this.checkVehicleExists(oModel, sVehicleNumber);

        if (bVehicleExists) {
          sap.m.MessageBox.error("The vehicle is already assigned to a parking lot.");
          return; // Prevent further execution
        }

        this.getView().setModel(parkingModel, "parkingModel");
        const oPayload = this.getView().getModel("parkingModel").getProperty("/");

        var create = this.createData(oModel, oPayload, "/AssignedLots");
        if (create) {

          // Replace with your actual Twilio Account SID and Auth Token
          const accountSid = 'ACb224f5ef242a9b70012285792ef40e8a';
          const authToken = '7de68c20065bdd889187858ae659eab5';
          var to = "+91" + sPhoneNumber;
          // Function to send SMS using Twili
          debugger
          const toNumber = to; // Replace with recipient's phone number
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
            this.triggerPrintForm(oPayload);

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
    checkVehicleExists: function (oModel, sVehicleNumber) {
      return new Promise(function (resolve, reject) {
        oModel.read("/AssignedLots", {
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
  triggerPrintForm:async function (assignedLot) {
    // Create a temporary print area
    var printWindow = window.open('', '', 'height=500,width=800');
    printWindow.document.write('<html><head><title>Parking Lot Allocation</title>');
    printWindow.document.write('<style>body{font-family: Arial, sans-serif;} table{width: 100%; border-collapse: collapse;} td, th{border: 1px solid #ddd; padding: 8px;} th{padding-top: 12px; padding-bottom: 12px; text-align: left; background-color: #4CAF50; color: white;}</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h2>Parking Lot Allocation</h2>');
    printWindow.document.write('<table><tr><th>Field</th><th>Value</th></tr>');
    printWindow.document.write('<tr><td>Vehicle Number</td><td>' + assignedLot.vehicleNumber + '</td></tr>');
    printWindow.document.write('<tr><td>Driver Name</td><td>' + assignedLot.driverName + '</td></tr>');
    printWindow.document.write('<tr><td>Phone</td><td>' + assignedLot.phoneNumber + '</td></tr>');
    printWindow.document.write('<tr><td>Vehicle Type</td><td>' + assignedLot.trasnporTtype + '</td></tr>');
    printWindow.document.write('<tr><td>Plot Number</td><td>' + assignedLot.parkinglot.parkingLotNumber + '</td></tr>');
    printWindow.document.write('<tr><td>Assigned Date</td><td>' + assignedLot.inTime + '</td></tr>');
  
    // Generate barcode
    const barcodeValue = `${assignedLot.vehicleNumber}`;
    const canvas = document.createElement('canvas');
    await JsBarcode(canvas, barcodeValue, {
      format: "CODE128",
      lineColor: "#000000", // Set barcode color to black
      width: 2,
      height: 60,
      displayValue: true
    });
    const barcodeImage = canvas.toDataURL("image/png");
  
    // Add barcode to print
    printWindow.document.write('<tr><td>Barcode</td><td><img src="' + barcodeImage + '" alt="Barcode"></td></tr>');
    printWindow.document.write('</table>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
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
            const oHistorySlotsTable = this.getView().byId("idHistorySlotsTable");
            if (oHistorySlotsTable) {
              oHistorySlotsTable.getBinding("items").refresh();
            }
            const oParkingLotSelect = this.getView().byId("parkingLotSelect");
            if (oParkingLotSelect) {
              oParkingLotSelect.getBinding("items").refresh();
            }
            this._setParkingLotModel();

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
          if (aVBoxItems.length > 1) {
            // Store the original values in a custom data attribute
            aVBoxItems[1].data("originalValue", aVBoxItems[1].getValue());

            aVBoxItems[0].setVisible(false); // Hide Text
            aVBoxItems[1].setVisible(true); // Show Input
          }
        });
      });
      this.isEditMode = true;
      this.byId("editButton").setVisible(false);
      this.byId("saveButton").setVisible(true);
      this.byId("cancelButton").setVisible(true);

      this.refreshComboBox();
    },

    onSelectSlot: function (oEvent) {
      var oSelectedItem = oEvent.getParameter("listItem");
      var oTable = this.byId("idSlotsTable");

      // Reset all items to show text and hide input
      if (this.isEditMode) {
        // Reset all items to show text and hide input
        oTable.getItems().forEach(function (oItem) {
          var aCells = oItem.getCells();
          aCells.forEach(function (oCell) {
            var aVBoxItems = oCell.getItems();
            aVBoxItems[0].setVisible(true);  // Show Text
            aVBoxItems[1].setVisible(false); // Hide Input
          });
        });

        // If an item is selected, switch to edit mode for that item
        if (oSelectedItem) {
          var aCells = oSelectedItem.getCells();
          aCells.forEach(function (oCell) {
            var aVBoxItems = oCell.getItems();
            aVBoxItems[0].setVisible(false); // Hide Text
            aVBoxItems[1].setVisible(true);  // Show Input
          });
        }
      }
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


        if (!sDriverName || !sDriverName.trim()) {
          sap.m.MessageBox.error("Driver name cannot be empty.");
          return; // Stop execution if validation fails
        }

        // Transport type validation: Should be either "inward" or "outward"
        if (sTypeofDelivery !== "Inward" && sTypeofDelivery !== "Outward") {
          sap.m.MessageBox.error("Invalid transport type. It should be either 'inward' or 'outward'.");
          return; // Stop execution if validation fails
        }

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
            MessageToast.show("Details updated successfully");
            const updatedParkingLot = {
              status: "Occupied" // Assuming false represents empty parking
              // Add other properties if needed
            };
            if (sSlotNumber !== sOldSlotNumber) {
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
                      MessageToast.show("Slot updated successfully");

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
            }
          },
          error: function (oError) {
            sap.m.MessageBox.error("Failed to update the slot: " + oError.message);
          }
        });
      }
      this.refreshComboBox();
      aSelectedItems.forEach(function (oItem) {
        var aCells = oItem.getCells();
        aCells.forEach(function (oCell) {
          var aVBoxItems = oCell.getItems();
          aVBoxItems[0].setVisible(true); // Hide Text
          aVBoxItems[1].setVisible(false); // Show Input
        });
      });
      this.isEditMode = false;
      this.byId("editButton").setVisible(true);
      this.byId("saveButton").setVisible(false);
      this.byId("cancelButton").setVisible(false);
    },
    refreshComboBox: function () {
      var oTable = this.byId("idSlotsTable");
      var aItems = oTable.getItems();

      aItems.forEach(function (oItem) {
        var oComboBox = oItem.getCells()[0].getItems()[1]; // Assuming the ComboBox is the second item in the first cell
        if (oComboBox && oComboBox.getBinding("items")) {
          oComboBox.getBinding("items").refresh(); // Refresh the ComboBox items binding
        }
      });
    },
    onCancel: function () {
      var oTable = this.byId("idSlotsTable");
      var aSelectedItems = oTable.getSelectedItems();

      aSelectedItems.forEach(function (oItem) {
        var aCells = oItem.getCells();
        aCells.forEach(function (oCell) {
          var aVBoxItems = oCell.getItems();
          if (aVBoxItems.length > 1) {
            // Retrieve the original values from the custom data attribute
            var originalValue = aVBoxItems[1].data("originalValue");
            if (originalValue !== undefined) {
              aVBoxItems[1].setValue(originalValue);
            }
            aVBoxItems[0].setVisible(true);  // Show Text
            aVBoxItems[1].setVisible(false); // Hide Input
          }
        });
      });
      this.isEditMode = false;
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
    onAssignDialog: async function () {
      const oView = this.getView();
      var oSelected = this.byId("idReserveSlotsTable").getSelectedItem();
      if (!oSelected) {
        sap.m.MessageToast.show("Please select a vehicle to assign");
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
        this.getView().byId("idReserveSlotsTable").getBinding("items").refresh();
      });
    },
    onItemClose1: function (oEvent) {
      var oItem = oEvent.getSource(),
        oList = oItem.getParent();

      oList.removeItem(oItem);
      MessageToast.show("Item Closed: " + oItem.getTitle());
    },
    onToggleSearch: function () {
      var oSearchField = this.byId("searchField");
      var bVisible = oSearchField.getVisible();
      oSearchField.setVisible(!bVisible);
  },
            onSearch: function (oEvent) {
                var sQuery = oEvent.getParameter("query");
                var sSearchFieldId = oEvent.getSource().getId();
                var oTable, aFilters = [];
 
                if (sSearchFieldId.includes("searchField")) {
                    oTable = this.byId("idSlotsTable");
                    if (sQuery) {
                        var aStringFilters = [
                            new Filter("parkinglot/parkingLotNumber", FilterOperator.Contains, sQuery),
                            new Filter("driverName", FilterOperator.Contains, sQuery),
                            new Filter("phoneNumber", FilterOperator.Contains, sQuery),
                            new Filter("vehicleNumber", FilterOperator.Contains, sQuery),
                            new Filter("trasnporTtype", FilterOperator.Contains, sQuery)
                        ];
                        aFilters.push(new Filter({ filters: aStringFilters, and: false }));
                    }
                } 
                if (oTable) {
                    var oBinding = oTable.getBinding("items");
                    if (oBinding) {
                        oBinding.filter(aFilters);
                    } else {
                        console.error("Binding not found for the table with ID: " + sSearchFieldId);
                }
            }
      },
  });
});

