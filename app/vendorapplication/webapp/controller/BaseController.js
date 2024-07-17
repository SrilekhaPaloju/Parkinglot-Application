sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment"
  
  ], function (Controller, Fragment) {
    'use strict';
  
    return Controller.extend("com.app.vendorapplication.controller.BaseController", {
      getRouter: function () {
        return this.getOwnerComponent().getRouter();
      },
      loadFragment: async function (sFragmentName) {
        const oFragment = await Fragment.load({
          id: this.getView().getId(),
          name: `com.app.vendorapplication.fragments.${sFragmentName}`,
          controller: this
        });
        this.getView().addDependent(oFragment);
        return oFragment
      },
      createData: async function (oModel, oPayload, sPath) {
        debugger;
        return new Promise((resolve, reject) => {
          oModel.create(sPath, oPayload, {
            refreshAfterChange: true,
            success: function (oSuccessData) {
              resolve(oSuccessData);
            },
            error: function (oErrorData) {
              reject(oErrorData)
            }
          })
        })
      },
    })
  });