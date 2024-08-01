function formatDateToEdmDateTimeOffset(date) {
  const pad = (n) => (n < 10 ? '0' + n : n);

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());

  // Format with timezone offset as 'Z' for UTC
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
}
sap.ui.define([
  "./BaseController",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/Element",
], function (Controller, MessageToast, JSONModel, Filter, FilterOperator, Element) {
  "use strict";
  var prefixId;
  var oScanResultText;

  return Controller.extend("com.app.parkinglot.controller.Home", {
    isEditMode: false,
    onInit: function () {
      const oTable = this.getView().byId("idSlotsTable");
      oTable.attachBrowserEvent("dblclick", this.onRowDoubleClick.bind(this));
      this._setParkingLotModel();
      if (prefixId) {
        prefixId = prefixId.split("--")[0] + "--";
      } else {
        prefixId = "";
      }
      oScanResultText = Element.getElementById(prefixId + 'sampleBarcodeScannerResult');
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
            this.printAssignmentDetails(oPayload)

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
      this.byId("searchButton").setVisible(false);

    },
    onSearch: function () {
      // Get the search field and toggle button by their IDs
      var oSearchField = this.byId("searchField");
      var oToggleSearchButton = this.byId("toggleSearchButton");

      // Hide the search field
      oSearchField.setVisible(false);
      this.byId("searchButton").setVisible(true);

      // Toggle the visibility of the button
      var bVisible = oToggleSearchButton.getVisible();
      oToggleSearchButton.setVisible(!bVisible);

    },

    handlerSearchFieldLiveEvent: function (oEvent) {
      var sQuery = oEvent.getParameter("newValue");
      var aFilters = [];

      if (sQuery && sQuery.length > 0) {
        aFilters.push(new Filter("parkinglot/parkingLotNumber", FilterOperator.Contains, sQuery));
        aFilters.push(new Filter("driverName", FilterOperator.Contains, sQuery));
        aFilters.push(new Filter("phoneNumber", FilterOperator.Contains, sQuery));
        aFilters.push(new Filter("vehicleNumber", FilterOperator.Contains, sQuery));
        aFilters.push(new Filter("trasnporTtype", FilterOperator.Contains, sQuery));

        var oFinalFilter = new Filter({
          filters: aFilters,
          and: false
        });

        this.getView().byId("idSlotsTable").getBinding("items").filter(oFinalFilter);
      } else {
        this.getView().byId("idSlotsTable").getBinding("items").filter([]);
      }
    },
    printAssignmentDetails: function (oPayload) {
      // Generate barcode data
      var barcodeData = `${oPayload.vehicleNumber}`;

      // Create a new window for printing
      var printWindow = window.open('', '', 'height=600,width=800');

      printWindow.document.write('<html><head><title>Print Assigned Details</title>');
      printWindow.document.write('<style>');
      printWindow.document.write('body { font-family: Arial, sans-serif; }');
      printWindow.document.write('.details-table { width: 100%; border-collapse: collapse; }');
      printWindow.document.write('.details-table th, .details-table td { border: 1px solid #000; padding: 8px; text-align: left; }');
      printWindow.document.write('.details-table th { background-color: #f2f2f2; color: #333; }'); // Header background and text color
      printWindow.document.write('.details-table td { color: #555; }'); // Details cell text color
      printWindow.document.write('.field-cell { background-color: #e0f7fa; color: #00796b; }'); // Field cell background and text color
      printWindow.document.write('.details-cell { background-color: #fffde7; color: #f57f17; }'); // Details cell background and text color
      printWindow.document.write('</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write('<div class="print-container">');
      printWindow.document.write('<h1>Parking-slot Details</h1>');
      printWindow.document.write('</div>');

      printWindow.document.write('<table class="details-table">');
      printWindow.document.write('<tr><th>Field</th><th>Details</th></tr>');
      printWindow.document.write('<tr><td class="field-cell">Vehicle Number</td><td class="details-cell">' + oPayload.vehicleNumber + '</td></tr>');
      printWindow.document.write('<tr><td class="field-cell">Driver Name</td><td class="details-cell">' + oPayload.driverName + '</td></tr>');
      printWindow.document.write('<tr><td class="field-cell">Phone Number</td><td class="details-cell">' + oPayload.phoneNumber + '</td></tr>');
      printWindow.document.write('<tr><td class="field-cell">Transport Type</td><td class="details-cell">' + oPayload.trasnporTtype + '</td></tr>');
      printWindow.document.write('<tr><td class="field-cell">Parkingslot Number</td><td class="details-cell"><div class="barcode-container"><svg id="barcode"></svg></div></td></tr>');
      printWindow.document.write('</table>');

      // Include JsBarcode library
      printWindow.document.write('<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>');
      printWindow.document.write('<script>JsBarcode("#barcode", "' + barcodeData + '");</script>');

      printWindow.document.write('</div>');
      printWindow.document.write('</body></html>');

      printWindow.document.close();
      printWindow.focus();

      // Print the contents of the new window
      printWindow.print();
    },
    onScanSuccessOne: function (oEvent) {
      // Get the scanned barcode data from the event
      var sBarcode = oEvent.getParameter("text");

      // Update the input field with the scanned barcode
      var oInput = this.byId("_IDGenInput2");
      oInput.setValue(sBarcode);

      var sVehicleNumber = oEvent.getParameter("text");

      // Assuming your model is named 'parkingModel'
      var oModel = this.getView().getModel("ModelV2");

      // Construct the filter to fetch data based on the vehicle number
      var aFilters = [
        new sap.ui.model.Filter("vehicleNumber", sap.ui.model.FilterOperator.EQ, sVehicleNumber)
      ];
      var that = this;
      // Perform a read operation on the AssignedLots entity
      oModel.read("/AssignedLots", {
        filters: aFilters,
        success: function (oData) {
          if (oData.results && oData.results.length > 0) {
            var oAssignedLot = oData.results[0]; // Assume first match is correct
            console.log(oAssignedLot)

            // Populate form fields   
            this.byId("parkingLotSelect").setVisible(false);
            this.byId("idparkingLotNumberCol").setVisible(true);
            that.byId("idparkingLotNumberCol").setValue(oAssignedLot.parkinglot_parkingLotNumber);
            that.byId("_IDDriverInput2").setValue(oAssignedLot.driverName);
            that.byId("_IDPhnnoInput2").setValue(oAssignedLot.phoneNumber);
            that.byId("country").setSelectedKey(oAssignedLot.trasnporTtype);
            that.byId("idIntime").setValue(oAssignedLot.inTime);
            that.byId("idID").setValue(oAssignedLot.ID);


          } else {
            // Handle case where no matching data is found
            sap.m.MessageToast.show("No data found for the scanned vehicle number.");
          }
        }.bind(this),
        error: function (oError) {
          sap.m.MessageToast.show("Error fetching data.");
          console.error(oError);
        }
      });
    },
    onScanErrorOne: function (oEvent) {
      // Handle the scan error
      var sErrorMessage = oEvent.getParameter("message");

      // Optionally, display a message toast to show the error
      sap.m.MessageToast.show("Scan failed: " + sErrorMessage);
    },

    onScanLiveUpdate: function (oEvent) {
      // This function can be used if you want to handle live updates during scanning
      var sLiveValue = oEvent.getParameter("value");

      // For now, you might not need this, but you can log the live value
      console.log("Live scan value: " + sLiveValue);
    },

    onUnassignPress: function () {
      const oView = this.getView();
      var sSlotNumber = this.byId("idparkingLotNumberCol").getValue();
      var sVehicle = this.byId("_IDGenInput2").getValue();
      var sDriverName = this.byId("_IDDriverInput2").getValue();
      var sDriverMobile = this.byId("_IDPhnnoInput2").getValue();
      var sTypeofDelivery = this.byId("country").getSelectedKey();
      // var sID = this.byId("idID").getValue();
      var currentDate = new Date();

      const dCheckInTimeString = this.byId("idIntime").getValue();
      const dCheckInTime = new Date(dCheckInTimeString);
      if (isNaN(dCheckInTime.getTime())) {
        console.error("Invalid check-in time");
        sap.m.MessageToast.show("Invalid check-in time");
        return;
      }
      const formattedCheckInTime = formatDateToEdmDateTimeOffset(dCheckInTime);
      const formattedCheckOutTime = formatDateToEdmDateTimeOffset(currentDate);

      const oNewHistory = new sap.ui.model.json.JSONModel({
        driverName: sDriverName,
        driverMobile: sDriverMobile,
        vehicleNumber: sVehicle,
        deliveryType: sTypeofDelivery,
        checkInTime: formattedCheckInTime,
        historySlotNumber_parkingLotNumber: sSlotNumber,
        checkOutTime: formattedCheckOutTime
      });
      oView.setModel(oNewHistory, "oNewHistory");

      // var oParkingslot = new sap.ui.model.json.JSONModel({
      //   parkingLotNumber: sSlotNumber,
      //   status: oStatus
      // });
      // oView.setModel(oParkingslot, "oParkingslot");

      try {
        const oModel = this.getView().getModel("ModelV2");
        // Create history record
        const oPayload = oView.getModel("oNewHistory").getProperty("/");
        this.createData(oModel, oPayload, "/History");
        // Fetch the entry to find the cuid
        oModel.read("/AssignedLots", {
          filters: [new sap.ui.model.Filter("vehicleNumber", sap.ui.model.FilterOperator.EQ, sVehicle)],
          success: function (oData) {
            if (oData.results.length > 0) {
              const sCuid = oData.results[0].ID; // Assuming 'ID' is the cuid field

              // Remove the vehicle entry from AssignedLots
              const sPath = "/AssignedLots(" + sCuid + ")";
              oModel.remove(sPath, {
                success: function () {
                  console.log("Vehicle removed from AssignedLots successfully");

                  MessageToast.show("Unassigned successfully");
                  oView.byId("idSlotsTable").getBinding("items").refresh();
                  const oHistorySlotsTable = oView.byId("idHistorySlotsTable");
                  if (oHistorySlotsTable) {
                    oHistorySlotsTable.getBinding("items").refresh();
                  }
                  this._setParkingLotModel();

                  const updatedParkingLot = {
                    status: "Available"
                  };
                  oModel.update("/ParkingLot('" + sSlotNumber + "')", updatedParkingLot, {
                    success: function () {
                        this.getView().byId("parkingLotSelect").getBinding("items").refresh();
                    }.bind(this),
                    error: function (oError) {
                      sap.m.MessageBox.error("Failed to update: " + oError.message);
                    }.bind(this)
                  });
                }.bind(this),
                error: function (oError) {
                  sap.m.MessageBox.error("Failed to remove vehicle: " + oError.message);
                }.bind(this)
              });
            } else {
              sap.m.MessageToast.show("No entry found for the given vehicle number");
            }
          }.bind(this),
          error: function (oError) {
            sap.m.MessageBox.error("Error fetching entry: " + oError.message);
          }
        });
      } catch (error) {
        console.error("Error:", error);
        sap.m.MessageToast.show("Failed to unassign vehicle: " + error.message);
      }

      this.byId("parkingLotSelect").setVisible(true);
      this.byId("idparkingLotNumberCol").setVisible(false);
      oView.byId("_IDGenInput2").setValue("");
      oView.byId("_IDDriverInput2").setValue("");
      oView.byId("_IDPhnnoInput2").setValue("");
      oView.byId("country").setSelectedKey("");
    },
  });
});

