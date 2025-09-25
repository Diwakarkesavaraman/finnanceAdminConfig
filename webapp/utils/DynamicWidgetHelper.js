sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return {
		onLoadDyanmicWidgetData: async function (oController) {
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			var oDynamicWidgetModel = new JSONModel();

			sap.ui.core.BusyIndicator.show(0);

			// Create a model for selected values
			var oSelectedValuesModel = new sap.ui.model.json.JSONModel({
				selectedWidgetType: "",
				selectedChartType: "",
				selectedDataSource: "",
				widgetId: ""
			});
			that.getView().setModel(oSelectedValuesModel, "selectedValues");

			that.getView().byId("widgetIdLabel").setVisible(false);
			that.getView().byId("widgetId").setVisible(false);

			var aWidgetTypeDropdownData = await that.getSearchHelpData('Widget_type');
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(aWidgetTypeDropdownData);
			that.getView().setModel(oModel, "aWidgetTypeDropdownData");

			var aChartTypeDropdownData = await that.getSearchHelpData('Chart_type');
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(aChartTypeDropdownData);
			that.getView().setModel(oModel, "aChartTypeDropdownData");

			var aDataSourceDropdownData = await that.getSearchHelpData('Data_source');
			var oDataSourceModel = new sap.ui.model.json.JSONModel();
			oDataSourceModel.setData(aDataSourceDropdownData);
			that.getView().setModel(oDataSourceModel, "aDataSourceDropdownData");

			that.onAddInput();
		},

		onDataSourceChange: function(oController, oEvent) {
			console.log("Data Source Changed");
			oController.getView().byId("check").setVisible(true);
			oController.getView().byId("busyIndicator").setVisible(false);
			oController.getView().byId("successIcon").setVisible(false);
		},

		checkQueryValidity: function(oController, oEvent) {
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");

			// Hide button and show busy indicator
			var oButton = that.getView().byId("check");
			var oBusyIndicator = that.getView().byId("busyIndicator");
			oButton.setVisible(false);
			oBusyIndicator.setVisible(true);

			// Add your validation logic here
		},

		handleSavePress: function(oController, oEvent) {
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			var oWidgetData = that.getView().getModel("selectedValues").getData();

			var oPayload = {
				"WidgetType": oWidgetData.selectedWidgetType,
				"ChartType": oWidgetData.selectedChartType,
				"DataSource": oWidgetData.selectedDataSource,
				"Status": "Draft"
			};

			finmobview.create("/WidgetConfigurationSet", oPayload, {
				success: function (oData) {
					var oModel = that.getView().getModel("selectedValues");
					var oCurrentData = oModel.getData();
					oCurrentData.widgetId = oData.WidgetId;
					
					oModel.setData(oCurrentData);

					that.getView().byId("widgetId").setVisible(true);
					that.getView().byId("widgetIdLabel").setVisible(true);
					console.log("Successfully created:", oPayload);
				},
				error: function (oError) {
					console.error("Error creating:", oPayload, oError);
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		deleteWidget: function(oController, widgetId) {
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			var oWidgetData = that.getView().getModel("selectedValues").getData();
			
			finmobview.remove("/WidgetConfigurationSet(WidgetId='" + oWidgetData.widgetId + "')", {
				success: function (oData) {
					console.log("Successfully deleted:", oData);
				},
				error: function (oError) {
					console.error("Error deleting:", oError);
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},

		handleAddPress: function(oController, paramQueryType, oEvent) {
			var that = oController;
			var oClickedButton = oEvent.getSource().getParent().getParent();
			var oForm = that.byId("bexQueryParameterForm");
			var iButtonIndex = oForm.getContent().findIndex(obj => obj.sId === oClickedButton.sId);
			
			if (paramQueryType === 'S') {
				var oSelectOptionBox = new sap.m.VBox({
					class: "sapUiMediumMargin",
					items: [
						new sap.m.HBox({
							class: "sapUiSmallMarginBottom",
							items: [
								new sap.m.Select({
									forceSelection: false,
									items: {
										path: "inputParamModel>/selectOptionRange",
										template: new sap.ui.core.Item({
											key: "{inputParamModel>Value}",
											text: "{inputParamModel>Value}"
										})
									},
									icon: "sap-icon://filter",
									autoAdjustWidth: true,
									change: function(oEvent) {
										var sSelectedKey = oEvent.getSource().getSelectedKey();
										console.log("Selected key:", sSelectedKey);
									}
								}),
								new sap.m.Input({
									class: "sapUiSmallMarginEnd",
									type: "Text",
									placeholder: "Enter product",
									showValueHelp: true,
									valueHelpIconSrc: "sap-icon://arrow-left",
									valueHelpRequest: "handleValueHelp"
								}),
								new sap.m.Text({
									text: "to",
									class: "sapUiSmallMarginEnd"
								}),
								new sap.m.Input({
									type: "Text",
									placeholder: "Enter product",
									showValueHelp: true,
									valueHelpIconSrc: "sap-icon://arrow-left",
									valueHelpRequest: "handleValueHelp"
								}),
								new sap.m.Button({
									enabled: true,
									icon: "sap-icon://add",
									press: that.handleAddPress.bind(that, 'S')
								})
							]
						})
					]
				});
				oForm.insertContent(oSelectOptionBox, iButtonIndex + 1);
			} else if (paramQueryType === 'M') {
				var oMultiInputBox = new sap.m.VBox({
					class: "sapUiMediumMargin",
					items: [
						new sap.m.HBox({
							class: "sapUiSmallMarginBottom",
							items: [
								new sap.m.Input({
									class: "sapUiSmallMarginBottom",
									type: "Text",
									showValueHelp: true,
									valueHelpIconSrc: "sap-icon://arrow-left"
								}),
								new sap.m.Button({
									enabled: true,
									icon: "sap-icon://add",
									press: that.handleAddPress.bind(that, 'M')
								})
							]
						})
					]
				});
				oForm.insertContent(oMultiInputBox, iButtonIndex + 1);
			}
		},

		onAddInput: async function(oController) {
			var that = oController;
			var oForm = that.byId("bexQueryParameterForm");
			var aQueryParam = await that.getQueryParameter();
			
			aQueryParam.forEach(function(param) {
				switch (param.Vparsel) {
					case 'M':
						var oLabel = new sap.m.Label({
							text: param.Vtxt
						});
						var oMultiInputBox = new sap.m.VBox({
							class: "sapUiMediumMargin",
							items: [
								new sap.m.HBox({
									class: "sapUiSmallMarginBottom",
									items: [
										new sap.m.Input({
											class: "sapUiSmallMarginBottom",
											type: "Text",
											showValueHelp: true,
											valueHelpIconSrc: "sap-icon://arrow-left"
										}),
										new sap.m.Button({
											enabled: true,
											icon: "sap-icon://add",
											press: that.handleAddPress.bind(that, 'M')
										})
									]
								})
							]
						});
						oForm.addContent(oLabel);
						oForm.addContent(oMultiInputBox);
						break;
					case "S":
						var oLabel = new sap.m.Label({
							text: param.Vtxt
						});
						var oSelectOptionBox = new sap.m.VBox({
							class: "sapUiMediumMargin",
							items: [
								new sap.m.HBox({
									class: "sapUiSmallMarginBottom",
									items: [
										new sap.m.Select({
											forceSelection: false,
											items: {
												path: "inputParamModel>/selectOptionRange",
												template: new sap.ui.core.Item({
													key: "{inputParamModel>Value}",
													text: "{inputParamModel>Value}"
												})
											},
											icon: "sap-icon://filter",
											autoAdjustWidth: true,
											change: function(oEvent) {
												var sSelectedKey = oEvent.getSource().getSelectedKey();
												console.log("Selected key:", sSelectedKey);
											}
										}),
										new sap.m.Input({
											class: "sapUiSmallMarginEnd",
											type: "Text",
											placeholder: "Enter product",
											showValueHelp: true,
											valueHelpIconSrc: "sap-icon://arrow-left",
											valueHelpRequest: "handleValueHelp"
										}),
										new sap.m.Text({
											text: "to",
											class: "sapUiSmallMarginEnd"
										}),
										new sap.m.Input({
											type: "Text",
											placeholder: "Enter product",
											showValueHelp: true,
											valueHelpIconSrc: "sap-icon://arrow-left",
											valueHelpRequest: "handleValueHelp"
										}),
										new sap.m.Button({
											enabled: true,
											icon: "sap-icon://add",
											press: that.handleAddPress.bind(that, 'S')
										})
									]
								})
							]
						});
						oForm.addContent(oLabel);
						oForm.addContent(oSelectOptionBox);
						break;
					case "I":
						var oLabel = new sap.m.Label({
							text: param.Vtxt
						});
						var oIntervalBox = new sap.m.VBox({
							class: "sapUiMediumMargin",
							items: [
								new sap.m.HBox({
									class: "sapUiSmallMarginBottom",
									items: [
										new sap.m.Input({
											class: "sapUiSmallMarginBottom",
											type: "Text",
											showValueHelp: true,
											valueHelpIconSrc: "sap-icon://arrow-left"
										}),
										new sap.m.Text({
											text: "to",
											class: "sapUiSmallMarginEnd"
										}),
										new sap.m.Input({
											type: "Text",
											placeholder: "Enter product",
											showValueHelp: true,
											valueHelpIconSrc: "sap-icon://arrow-left",
											valueHelpRequest: "handleValueHelp"
										})
									]
								})
							]
						});
						oForm.addContent(oLabel);
						oForm.addContent(oIntervalBox);
						break;
					case "P":
						var oLabel = new sap.m.Label({
							text: param.Vtxt
						});
						var oInput = new sap.m.Input({
							class: "sapUiSmallMarginBottom",
							type: "Text",
							showValueHelp: true,
							valueHelpIconSrc: "sap-icon://arrow-left"
						});
						oForm.addContent(oLabel);
						oForm.addContent(oInput);
						break;
					default:
				}
			});
		},

		getGroupedFormValues: async function(oController) {
			debugger;
			var that = oController;
			var self = this;
			var oForm = that.byId("bexQueryParameterForm");
			var aContent = oForm.getContent();
			var oFormData = {};
			var sCurrentLabel = "";
			
			aContent.forEach(function(oControl) {
				if (oControl instanceof sap.m.Label) {
					sCurrentLabel = oControl.getText();
					if (!oFormData[sCurrentLabel]) {
						oFormData[sCurrentLabel] = {
							type: "",
							values: [],
							selects: []
						};
					}
				} else if (oControl instanceof sap.m.VBox) {
					// Process VBox containers that hold the form elements
					self._processVBoxContent(oControl, sCurrentLabel, oFormData);
				} else if (oControl instanceof sap.m.Input && sCurrentLabel) {
					// Process direct Input controls (Parameter type)
					var sValue = oControl.getValue();
					oFormData[sCurrentLabel].values.push({
						LOW: sValue,
						HIGH: ""
					});
				}
			});
			
			// Get query parameters to enrich the form data
			var aQueryParam = await that.getQueryParameter();
			var aProcessedData = [];
			
			Object.keys(oFormData).forEach(key => {
				var oParam = {};
				var oQueryParam = aQueryParam.find(param => param.Vtxt === key);
				
				oParam["VNAM"] = oQueryParam ? oQueryParam.Vnam : "";
				oParam["VARTYP"] = oQueryParam ? oQueryParam.Vartyp : "";
				oParam["VPARSEL"] = oQueryParam ? oQueryParam.Vparsel : "";
				oParam["IOBJNM"] = oQueryParam ? oQueryParam.Iobjnm : "";
				oParam["LS_VALUE"] = [];
				
				// Process values based on type
				for (let i = 0; i < oFormData[key].values.length; i++) {
					var oValue = {};
					if(oParam["VPARSEL"]=='I'){
						oValue["SIGN"] = 'BT'
					}
					else if(oParam["VPARSEL"]=='M' || oParam["VPARSEL"]=='P'){
						oValue["SIGN"] = 'EQ'
					}
					else{
						oValue["SIGN"] = oFormData[key].selects && oFormData[key].selects[i] ? 
						oFormData[key].selects[i].selectedKey : "I";
					}
					oValue["OPTION"] = oFormData[key].selects && oFormData[key].selects[i] ? 
						oFormData[key].selects[i].selectedKey : "EQ";
					oValue["LOW"] = oFormData[key].values[i].LOW || "";
					oValue["HIGH"] = oFormData[key].values[i].HIGH || "";
					
					oParam["LS_VALUE"].push(oValue);
				}
				
				if (oParam["LS_VALUE"].length > 0) {
					aProcessedData.push(oParam);
				}
			});
			console.log(aProcessedData);
			self.fetchQueryOutput(oController,aProcessedData)
			// /sap/opu/odata/SAP/ZFI_MOBILE_SRV/Query_Output?$filter=DatasourceName%20eq%20%27YES_ARAMCO_PLANS_TEST%27%20and%20InputParameter%20eq%20%2
			return aProcessedData;
		},

		fetchQueryOutput: function(oController, aFilterParams) {
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");

				var aFilters = [
				new sap.ui.model.Filter("DatasourceName", sap.ui.model.FilterOperator.EQ, 'YES_ARAMCO_PLANS_TEST'),
				new sap.ui.model.Filter("InputParameter", sap.ui.model.FilterOperator.EQ, JSON.stringify(aFilterParams))
			];

				finmobview.read("/Query_Output", {
					filters: aFilters,
					success: function (data) {
						console.log(data);
						// var oCodeEditor = that.getView().byId("codeEditor");
						// if (oCodeEditor) {
						// 	oCodeEditor.setValue(JSON.stringify(JSON.parse(data.results[0].QueryOutput).data, null, 2));
						// }

						
						if (data.results && data.results.length > 0) {
							var queryOutput = JSON.parse(data.results[0].QueryOutput);
							var metaData = queryOutput.metadata || [];
							var jsonData = queryOutput.data || [];
							
							// Add selectedAxis property to each metadata item
							metaData.forEach(function(item) {
								item.selectedAxis = "";
							});
							
							// Bind CodeEditor with formatted JSON
							var oCodeEditor = that.getView().byId("codeEditor");
							if (oCodeEditor) {
								oCodeEditor.setValue(JSON.stringify(jsonData, null, 2));
							}
							
							// Create and set metaDataModel for the table
							var oMetaDataModel = new sap.ui.model.json.JSONModel(metaData);
							that.getView().setModel(oMetaDataModel, "metaDataModel");
						}
						
						var response = data.results || [];
						// resolve(response); // Note: resolve is not defined in this context
					},
					error: function (oError) {
						sap.ui.core.BusyIndicator.hide(0);
						var responseText = oError.responseText;
						var msg = "Error fetching data";

						if (responseText.indexOf("{") > -1) {
							try {
								var errorDetails = JSON.parse(oError.responseText).error.innererror.errordetails;
								if (errorDetails.length > 0) {
									msg = errorDetails.map(err => err.message).join("\n");
								}
							} catch (e) {
								msg = responseText;
							}
						}
						sap.m.MessageBox.error(msg);
						console.error("Query output error:", oError);
					}
				});
		},

		


		_processVBoxContent: function(oVBox, sCurrentLabel, oFormData) {
			var aVBoxItems = oVBox.getItems();
			
			aVBoxItems.forEach(function(oItem) {
				if (oItem instanceof sap.m.HBox) {
					var aHBoxItems = oItem.getItems();
					var oValuePair = { LOW: "", HIGH: "" };
					var oSelectInfo = {};
					var aInputs = [];
					
					// First, collect all inputs in order
					aHBoxItems.forEach(function(oHBoxItem) {
						if (oHBoxItem instanceof sap.m.Select) {
							oSelectInfo = {
								selectedKey: oHBoxItem.getSelectedKey(),
								selectedItem: oHBoxItem.getSelectedItem() ? 
									oHBoxItem.getSelectedItem().getText() : ""
							};
						} else if (oHBoxItem instanceof sap.m.Input) {
							aInputs.push(oHBoxItem.getValue());
						}
					});
					
					// Map inputs based on count
					if (aInputs.length === 1) {
						// Single input - goes to LOW
						oValuePair.LOW = aInputs[0];
					} else if (aInputs.length === 2) {
						// Two inputs - first is LOW, second is HIGH
						oValuePair.LOW = aInputs[0];
						oValuePair.HIGH = aInputs[1];
					}
					
					if (sCurrentLabel && oFormData[sCurrentLabel]) {
						oFormData[sCurrentLabel].values.push(oValuePair);
						if (Object.keys(oSelectInfo).length > 0) {
							oFormData[sCurrentLabel].selects.push(oSelectInfo);
						}
					}
				}
			});
		}
	};
});