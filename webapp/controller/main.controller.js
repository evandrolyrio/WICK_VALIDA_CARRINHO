sap.ui.define([
	"validar/carrinhoZPP_VALIDAR/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ndc/BarcodeScanner",
	"sap/m/MessageBox"
], function(BaseController, JSONModel, BarcodeScanner, MessageBox) {
	"use strict";

	return BaseController.extend("validar.carrinhoZPP_VALIDAR.controller.main", {

    	onInit: function() {

			this.setModel(this.getOwnerComponent().getModel());

			this.setModel(new JSONModel({
				busy: false,
				//FilterData
				ValidaSet: [],
				Id_carrinho: "",
				Aufnr: ""
			}), "viewModel");
			this.setModel(new JSONModel({
				VerificaSet: []
			}), "verifica");			
			var that = this;
			// this._currentContext = this.getSource().getBindingContext();
			this.oDialog = new sap.ui.xmlfragment("validar.carrinhoZPP_VALIDAR.view.fragment.CarrinhoDialog", this);
			if (this.oDialog) {
				this.getView().addDependent(this.oDialog);

				this.oDialog.setModel(this.getModel());
				this.oDialog.setModel(new JSONModel({
					Id_carrinho: "",
					Aufnr: ""
				}, "dialog"));

				this.oDialog.setBindingContext(this._currentContext);
				// this.oDialog.setBindingContext(that);
				this.oDialog.open();
			}			
		},
		goToValida: function(oEvent) {
			var oDialogData = this.oDialog.getModel().getData();
			var that = this;
			this.oDialog.close();
			this.oDialog.destroy(true);
			
			if ( !oDialogData.Id_carrinho ) {
				oDialogData.Id_carrinho = "0";
			}
			var oModel = this.getModel();

			
			that.getModel("viewModel").setProperty("/Id_carrinho", oDialogData.Id_carrinho);
			that.getModel("viewModel").setProperty("/Aufnr", oDialogData.Aufnr);
			that.getModel("viewModel").setProperty("/busy", true);
			oModel.invalidate();	
			oModel.callFunction("/LerBarcode", {
				method: "GET",
				urlParameters: {
					Barcode: '0',
					Id_carrinho: oDialogData.Id_carrinho
				},
				success: function(oData) {	
					that.getModel("viewModel").setProperty("/busy", false);
				},
				error: function(error) {
					that.getModel("viewModel").setProperty("/busy", false);
				}
			});				
			// this.getModel("viewModel").setProperty("/busy", true);
			// oModel.invalidate();
			// oModel.callFunction("/ValidaCarrinho", {
			// 	method: "GET",
			// 	urlParameters: {
			// 		Id_carrinho: oDialogData.Id_carrinho
			// 	},
			// 	success: function(oData) {
			// 		that.getModel("viewModel").setProperty("/ValidaSet", oData.results);
			// 		that.getModel("viewModel").setProperty("/busy", false);
			// 		that.getView().byId("tbReimpressao").getBinding("items").refresh();
			// 	},
			// 	error: function(error) {
			// 		// alert(this.oResourceBundle.getText("ErrorReadingProfile"));
			// 		// oGeneralModel.setProperty("/sideListBusy", false);
			// 		that.getModel("viewModel").setProperty("/busy", false);
			// 	}
			// });
		},
		onVerificar: function() {
			// const oItem = oEvent.getSource().getParent().getBindingContext().getObject();
			// this.getEstoquePosicaoItem(oItem).then((oData) => {
			// 	if (this.oDialog) this.oDialog.destroy();
			// 	this.oDialog = new sap.ui.xmlfragment("zwmfc.mov_deposito.view.fragment.EstoquePosicaoDialog", this);
			// 	this.oDialog.setModel(new JSONModel({
			// 		EstoquePosicaoSet: oData.results,
			// 		Total: oData.results.length
			// 	}));
			// 	this.getModel("estoque").setProperty("/EstoquePosicaoSet", oData.results);
			// 	this.oDialog.open();
			// });
		},
		lerCod: function() {
			var that = this;
			that.getModel("viewModel").setProperty("/busy", true);
			this.scanHU().then(function (scanned) {
				var barcode = scanned;
				var oModel = that.getModel();
				oModel.invalidate();
				oModel.callFunction("/LerBarcode", {
					method: "GET",
					urlParameters: {
						Barcode: barcode,
						Id_carrinho: that.getModel("viewModel").getProperty("/Id_carrinho")
					},
					success: function(oData) {	
						that.getModel("viewModel").setProperty("/ValidaSet", oData.results);
						that.getModel("viewModel").setProperty("/busy", false);
						that.getView().byId("tbValida").getBinding("items").refresh();
					},
					error: function(error) {
						that.getModel("viewModel").setProperty("/busy", false);
						MessageBox.information("Erro");
					}
				});	
			});					
		},
		verifica: function() {
			var that = this;
			that.getModel("viewModel").setProperty("/busy", true);
			var oModel = that.getModel();
			oModel.invalidate();
			oModel.callFunction("/Verifica", {
				method: "GET",
				urlParameters: {
					Id_carrinho: that.getModel("viewModel").getProperty("/Id_carrinho"),
					Aufnr: that.getModel("viewModel").getProperty("/Aufnr")
				},
				success: function(oData) {	
					that.getModel("viewModel").setProperty("/VerificaSet", oData.results);
					that.getModel("viewModel").setProperty("/busy", false);
					that.oDialog = new sap.ui.xmlfragment("validar.carrinhoZPP_VALIDAR.view.fragment.VerificaDialog", that);
					if (that.oDialog) {
						that.getView().addDependent(that.oDialog);
		
						that.oDialog.setModel(that.getModel());
						that.oDialog.setModel(new JSONModel({
							VerificaSet: oData.results
						}, "verifica"));
						that.getModel("verifica").setProperty("/VerificaSet", oData.results);
						that.oDialog.setBindingContext(that._currentContext);
						// this.oDialog.setBindingContext(that);
						that.oDialog.open();
					}					
				},
				error: function(error) {
					that.getModel("viewModel").setProperty("/busy", false);
					MessageBox.information("Erro");
				}
			});	
					
		},		
		onCloseDialog: function() {
			this.oDialog.close();
			this.oDialog.destroy(true);
		}			

	});
});