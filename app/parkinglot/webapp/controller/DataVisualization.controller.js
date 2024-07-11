sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
      "sap/ui/model/json/JSONModel",
    ],
    function (Controller, JSONModel) {
      "use strict";
  
      return Controller.extend("com.app.parkinglot.controller.DataVisualization", {
        onInit: function () {
            this._setIceCreamModel();
        },
        _setIceCreamModel:function(){

			var aData = {
					Items : [  
						{
							Flavor:"Blue Moon",
							Sales : 700
						},
						{
							Flavor:"Matcha Green Tea",
							Sales : 1100
						},
						{
							Flavor:"ButterScotch",
							Sales : 1400
						},
						{
							Flavor:"Black Current",
							Sales : 560
						}
						]
			}
			var oIceCreamModel = new JSONModel();
			oIceCreamModel.setData(aData);
			this.getView().setModel(oIceCreamModel, "IceCreamModel");
}
        });
    });