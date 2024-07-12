sap.ui.define(
	[
		"sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel",
	],
	function (Controller, JSONModel) {
		"use strict";

		return Controller.extend("com.app.parkinglot.controller.DataVisualization", {
			onInit: function () {
				this._setParkingLotModel();
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

						var aChartData = {
							Items: [
								{
									Status: "Available",
									Count: availableCount
								},
								{
									Status: "Occupied",
									Count: occupiedCount
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
			}
		});
	});


