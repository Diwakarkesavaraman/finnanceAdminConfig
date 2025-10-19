sap.ui.define([
	"sap/ui/model/json/JSONModel"
], function (JSONModel) {
	"use strict";

	return {
		onLoadDyanmicWidgetData: async function (oController, widgetId) {
			debugger
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			var oDynamicWidgetModel = new JSONModel();

			sap.ui.core.BusyIndicator.show(0);

			// Create a model for selected values
			var oSelectedValuesModel = new sap.ui.model.json.JSONModel({
				selectedWidgetType: "",
				selectedChartType: "",
				selectedDataSource: "",
				widgetId: "",
				inputParameter: "",
				mapping: ""
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

			var aDataSourceDropdownData = await that.getSearchHelpData('Widget_ID');
			// var oDataSourceModel = new sap.ui.model.json.JSONModel();
			// oDataSourceModel.setData(aDataSourceDropdownData);
			// that.getView().setModel(oDataSourceModel, "aDataSourceDropdownData");

			// that.onAddInput();

			var aFilters = [new sap.ui.model.Filter("WidgetId", sap.ui.model.FilterOperator.EQ, widgetId)];
			if (widgetId !== "") {
				// if(widgetId !== ""){
				finmobview.read("/WidgetConfigurationSet", {
					filters: aFilters,
					success: function (oData) {
						debugger;
						var test = {

							"Mandt": "032",
							"WidgetId": "00505684457C1FE0A6D5E6B3B4720E18",
							"WidgetType": "3value",
							"ChartType": "lchart",
							"DataSource": "",
							"InputParameter": "[{\"VNAM\":\"ZES_PERIOD\",\"VARTYP\":\"1\",\"VPARSEL\":\"P\",\"IOBJNM\":\"/CPMB/ZED08MN__/CPMB/YEAR\",\"LS_VALUE\":[{\"SIGN\":\"EQ\",\"OPTION\":\"EQ\",\"LOW\":\"2020\",\"HIGH\":\"\"}]},{\"VNAM\":\"ZV_S_CAT\",\"VARTYP\":\"1\",\"VPARSEL\":\"S\",\"IOBJNM\":\"/CPMB/ZED8YY1\",\"LS_VALUE\":[{\"SIGN\":\"EQ\",\"OPTION\":\"EQ\",\"LOW\":\"PLAN_18_20_BOARD\",\"HIGH\":\"\"},{\"SIGN\":\"EQ\",\"OPTION\":\"EQ\",\"LOW\":\"PLAN_18_20_BOARD\",\"HIGH\":\"\"}]},{\"VNAM\":\"YORG_ENTITY_TEST\",\"VARTYP\":\"1\",\"VPARSEL\":\"M\",\"IOBJNM\":\"/CPMB/ZEDBS0W\",\"LS_VALUE\":[{\"SIGN\":\"EQ\",\"OPTION\":\"EQ\",\"LOW\":\"100191\",\"HIGH\":\"\"}]},{\"VNAM\":\"YCOR_ACC_TEST\",\"VARTYP\":\"1\",\"VPARSEL\":\"I\",\"IOBJNM\":\"/CPMB/ZEDWQND\",\"LS_VALUE\":[{\"SIGN\":\"BT\",\"OPTION\":\"EQ\",\"LOW\":\"CRP_LAB_SAO_S1114\",\"HIGH\":\"CRP_LAB_SAO_S1114\"}]}]",
							// "InputParameter":"",
							"Mapping": "",
							"Status": "Draft"
						}

						var oModel = that.getView().getModel("selectedValues");
						var oCurrentData = oModel.getData();
						var oWidgetData = oData.results[0];
						oCurrentData.widgetId = oWidgetData.WidgetId;
						oCurrentData.widgetName = oWidgetData.WidgetName;
						oCurrentData.selectedWidgetType = oWidgetData.WidgetType;
						oCurrentData.selectedChartType = oWidgetData.ChartType;
						oCurrentData.selectedDataSource = oWidgetData.DataSource;
						oCurrentData.inputParameter = test.InputParameter;
						oCurrentData.mapping = oWidgetData.Mapping;
						that.onAddInput(oWidgetData.DataSource);

						oModel.setData(oCurrentData);

						that.getView().byId("widgetId").setVisible(true);
						that.getView().byId("widgetIdLabel").setVisible(true);
						sap.ui.core.BusyIndicator.hide();
						debugger;
						that.getGroupedFormValues(that);
					},
					error: function (oError) {
						console.error("Error creating:", oPayload, oError);
						sap.ui.core.BusyIndicator.hide();
					}
				});
			}

		},

		onDataSourceChange: function (oController, oEvent) {
			console.log("Data Source Changed");
			oController.getView().byId("check").setVisible(true);
			oController.getView().byId("busyIndicator").setVisible(false);
			oController.getView().byId("successIcon").setVisible(false);
		},

		checkQueryValidity: function (oController, oEvent) {
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			var dataSource = that.getView().byId("dataSourceId").getValue();

			// Hide button and show busy indicator
			var oButton = that.getView().byId("check");
			var oBusyIndicator = that.getView().byId("busyIndicator");
			oButton.setVisible(false);
			oBusyIndicator.setVisible(true);

			var aFilters = [new sap.ui.model.Filter("Query_Name", sap.ui.model.FilterOperator.EQ, dataSource)];

			finmobview.read("/QueryValidation", {
				filters: aFilters,
				success: function (data) {

					console.log(data);
					var response = data.results[0] || [];
					if (response.IsExist) {
						that.getView().byId("successIcon").setVisible(true);
						var dataSource = response.Query_Name
						that.onAddInput(dataSource);
					}

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
					MessageBox.error(msg);
					reject(oError);
				}
			});
		},

		handleSavePress: function (oController, oEvent) {
			debugger;
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			var oWidgetData = that.getView().getModel("selectedValues").getData();
			var mappingFormData = this.getMappingFormValues(oController);

			var oPayload = {
				"WidgetType": oWidgetData.selectedWidgetType,
				"WidgetName": oWidgetData.widgetName,
				"ChartType": oWidgetData.selectedChartType,
				"DataSource": oWidgetData.selectedDataSource,
				"WidgetId": oWidgetData.widgetId,
				"InputParameter": oWidgetData.inputParameter,
				"Mapping": mappingFormData,
				"Status": "Draft"
			};
			sap.ui.core.BusyIndicator.show(0);
			if (oWidgetData.widgetId) {
				finmobview.update("/WidgetConfigurationSet('" + oWidgetData.widgetId + "')", oPayload, {
					success: function (oData) {
						// var oModel = that.getView().getModel("selectedValues");
						// var oCurrentData = oModel.getData();
						// oCurrentData.widgetId = oData.WidgetId;

						// oModel.setData(oCurrentData);

						// that.getView().byId("widgetId").setVisible(true);
						// that.getView().byId("widgetIdLabel").setVisible(true);
						console.log("Successfully created:", oPayload);
						sap.ui.core.BusyIndicator.hide();
						sap.m.MessageBox.success("Widget updated successfully.");
					},
					error: function (oError) {
						console.error("Error creating:", oPayload, oError);
						sap.ui.core.BusyIndicator.hide();
					}
				});

			} else {

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
			}
		},

		getMappingFormValues: function (oController) {
			debugger;
			var that = oController;
			var oModel = that.getView().getModel("selectedValues");
			var oCurrentData = oModel.getData();
		
			var oForm = that.getView().byId("dataMappingForm");
			var aFormContent = oForm.getContent();

			var oformValues = {};
			var aFields = [];

			// Loop through form content to get Label-Control pairs
			for (var i = 0; i < aFormContent.length; i++) {
				var oControl = aFormContent[i];

				// Check if it's a Label
				if (oControl instanceof sap.m.Label) {
					var sLabelText = oControl.getText();
					var oNextControl = aFormContent[i + 1]; // Get the next control after label

					if (oNextControl) {
						// Handle Input controls
						// if (oNextControl instanceof sap.m.Input) {
						// 	// formValues[sLabelText] = oNextControl.getValue();
						// }
						// Handle Select controls
						
						if (oNextControl instanceof sap.m.Select) {
							aFields.push(oNextControl.getSelectedKey());
						}
						// Handle MultiInput controls
						else if (oNextControl instanceof sap.m.MultiInput) {
							var aTokens = oNextControl.getTokens();
							var aTokenValues = aTokens.map(function(oToken) {
								return oToken.getKey();
							});
							aFields.push(...aTokenValues);
						}
					}
				}
			}
			oformValues['x'] = aFields[0];
			oformValues['y'] = aFields.slice(1);

			return JSON.stringify(oformValues);
		},

		deleteWidget: function (oController, widgetId) {
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

		handleAddPress: function (oController, paramQueryType, oEvent) {
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
									change: function (oEvent) {
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

		onAddInput: async function (oController, dataSource) {
			debugger;
			var that = oController;
			var self = this;
			var oForm = that.byId("bexQueryParameterForm");
			oForm.removeAllContent();

			var aQueryParam = await that.getQueryParameter(dataSource);
		

			// Get existing inputParameter data if available
			var oSelectedData = that.getView().getModel("selectedValues").getData();
			var aExistingInputParam = [];
			if (oSelectedData.inputParameter) {
				try {
					aExistingInputParam = JSON.parse(oSelectedData.inputParameter);
				} catch (e) {
					console.error("Error parsing inputParameter:", e);
				}
			}

			aQueryParam.forEach(function (param) {
				// Find existing data for this parameter
				var oExistingParam = aExistingInputParam.find(function (existingParam) {
					return existingParam.VNAM === param.Vnam;
				});

				switch (param.Vparsel) {
				case 'M':
					var oLabel = new sap.m.Label({
						text: param.Vtxt
					});

					// Create initial input box
					var aMultiInputItems = [];

					if (oExistingParam && oExistingParam.LS_VALUE && oExistingParam.LS_VALUE.length > 0) {
						// Create input boxes for existing values
						oExistingParam.LS_VALUE.forEach(function (value) {
							aMultiInputItems.push(new sap.m.HBox({
								class: "sapUiSmallMarginBottom",
								items: [
									new sap.m.Input({
										class: "sapUiSmallMarginBottom",
										type: "Text",
										value: value.LOW,
										showValueHelp: true,
										valueHelpIconSrc: "sap-icon://arrow-left"
									}),
									new sap.m.Button({
										enabled: true,
										icon: "sap-icon://add",
										press: that.handleAddPress.bind(that, 'M')
									})
								]
							}));
						});
					} else {
						// Create empty input box
						aMultiInputItems.push(new sap.m.HBox({
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
						}));
					}

					var oMultiInputBox = new sap.m.VBox({
						class: "sapUiMediumMargin",
						items: aMultiInputItems
					});

					oForm.addContent(oLabel);
					oForm.addContent(oMultiInputBox);
					break;
				case "S":
					var oLabel = new sap.m.Label({
						text: param.Vtxt
					});

					// Create initial select option items
					var aSelectOptionItems = [];

					if (oExistingParam && oExistingParam.LS_VALUE && oExistingParam.LS_VALUE.length > 0) {
						// Create select option boxes for existing values
						oExistingParam.LS_VALUE.forEach(function (value) {
							aSelectOptionItems.push(new sap.m.HBox({
								class: "sapUiSmallMarginBottom",
								items: [
									new sap.m.Select({
										forceSelection: false,
										selectedKey: value.OPTION || "EQ",
										items: {
											path: "inputParamModel>/selectOptionRange",
											template: new sap.ui.core.Item({
												key: "{inputParamModel>Value}",
												text: "{inputParamModel>Value}"
											})
										},
										icon: "sap-icon://filter",
										autoAdjustWidth: true,
										change: function (oEvent) {
											var sSelectedKey = oEvent.getSource().getSelectedKey();
											console.log("Selected key:", sSelectedKey);
										}
									}),
									new sap.m.Input({
										class: "sapUiSmallMarginEnd",
										type: "Text",
										value: value.LOW,
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
										value: value.HIGH,
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
							}));
						});
					} else {
						// Create empty select option box
						aSelectOptionItems.push(new sap.m.HBox({
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
									change: function (oEvent) {
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
						}));
					}

					var oSelectOptionBox = new sap.m.VBox({
						class: "sapUiMediumMargin",
						items: aSelectOptionItems
					});

					oForm.addContent(oLabel);
					oForm.addContent(oSelectOptionBox);
					break;
				case "I":
					var oLabel = new sap.m.Label({
						text: param.Vtxt
					});

					// Get existing values for interval
					var sLowValue = "";
					var sHighValue = "";
					if (oExistingParam && oExistingParam.LS_VALUE && oExistingParam.LS_VALUE.length > 0) {
						sLowValue = oExistingParam.LS_VALUE[0].LOW || "";
						sHighValue = oExistingParam.LS_VALUE[0].HIGH || "";
					}

					var oIntervalBox = new sap.m.VBox({
						class: "sapUiMediumMargin",
						items: [
							new sap.m.HBox({
								class: "sapUiSmallMarginBottom",
								items: [
									new sap.m.Input({
										class: "sapUiSmallMarginBottom",
										type: "Text",
										value: sLowValue,
										showValueHelp: true,
										valueHelpIconSrc: "sap-icon://arrow-left"
									}),
									new sap.m.Text({
										text: "to",
										class: "sapUiSmallMarginEnd"
									}),
									new sap.m.Input({
										type: "Text",
										value: sHighValue,
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

					// Get existing value for parameter
					var sParameterValue = "";
					if (oExistingParam && oExistingParam.LS_VALUE && oExistingParam.LS_VALUE.length > 0) {
						sParameterValue = oExistingParam.LS_VALUE[0].LOW || "";
					}

					var oInput = new sap.m.Input({
						class: "sapUiSmallMarginBottom",
						type: "Text",
						value: sParameterValue,
						showValueHelp: true,
						valueHelpIconSrc: "sap-icon://arrow-left"
					});
					oForm.addContent(oLabel);
					oForm.addContent(oInput);
					break;
				default:
				}
			});
			self.fetchQueryOutput(oController, '');

		},

		getGroupedFormValues: async function (oController) {
			debugger;
			var that = oController;
			var self = this;
			var oForm = that.byId("bexQueryParameterForm");
			var aContent = oForm.getContent();
			var oFormData = {};
			var sCurrentLabel = "";

			aContent.forEach(function (oControl) {
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
			var sDataSource = that.getView().byId("dataSourceId").getValue();
			// Get query parameters to enrich the form data
			var aQueryParam = await that.getQueryParameter(sDataSource);
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
					if (oParam["VPARSEL"] == 'I') {
						oValue["SIGN"] = 'BT'
					} else if (oParam["VPARSEL"] == 'M' || oParam["VPARSEL"] == 'P') {
						oValue["SIGN"] = 'EQ'
					} else {
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
			var oModel = that.getView().getModel("selectedValues");
			var oCurrentData = oModel.getData();

			aProcessedData = [{
				"VNAM": "YDD_CC_HIER_NODE",
				"VARTYP": "2",
				"VPARSEL": "P",
				"IOBJNM": "0COSTCENTER",
				"LS_VALUE": [{
					"SIGN": "I",
					"OPTION": "EQ",
					"LOW": "9999/C30002946",
					"HIGH": ""
				}]
			}, {
				"VNAM": "0H_CCTR",
				"VARTYP": "5",
				"VPARSEL": "P",
				"IOBJNM": "0COSTCENTER",
				"LS_VALUE": [{
					"SIGN": "I",
					"OPTION": "EQ",
					"LOW": "PPMR_PLN",
					"HIGH": ""
				}]
			}];
			oCurrentData.inputParameter = JSON.stringify(aProcessedData);

			self.fetchQueryOutput(oController, aProcessedData)
				// /sap/opu/odata/SAP/ZFI_MOBILE_SRV/Query_Output?$filter=DatasourceName%20eq%20%27YES_ARAMCO_PLANS_TEST%27%20and%20InputParameter%20eq%20%2
			return aProcessedData;
		},

		fetchQueryOutput: function (oController, aFilterParams) {
			debugger;
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			var oBusyIndicator = that.byId("tabBarBusyIndicator");
			var oIconTabBar = that.byId("idIconTabBarInlineMode");
			if (oBusyIndicator) {
				oBusyIndicator.setVisible(true);
			}
			if (oIconTabBar) {
				oIconTabBar.setVisible(false);
			}

			var sDataSource = that.getView().byId("dataSourceId").getValue();
			var aFilters = [
				new sap.ui.model.Filter("DatasourceName", sap.ui.model.FilterOperator.EQ, sDataSource),
				new sap.ui.model.Filter("InputParameter", sap.ui.model.FilterOperator.EQ, JSON.stringify(aFilterParams))
			];

			finmobview.read("/Query_Output", {
				filters: aFilters,
				success: function (data) {

					if (oBusyIndicator) {
						oBusyIndicator.setVisible(false);
					}
					if (oIconTabBar) {
						oIconTabBar.setVisible(true);
					}
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
						metaData.forEach(function (item) {
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

					var oForm = that.byId("dataMappingForm");
					// Clear existing form content first
					oForm.removeAllContent();

					var oXLabel = new sap.m.Label({
						text: "Select Dimensions"
					});
					var oXSelect = new sap.m.Select({
						width: "100%",
						showSecondaryValues: true,
						items: {
							path: "metaDataModel>/",
							template: new sap.ui.core.ListItem({
								key: "{metaDataModel>FIELDNAME}",
								text: "{metaDataModel>SCRTEXT_L}",
								additionalText: "{metaDataModel>FIELDNAME}"
							})
						}
					});
					var oXInput = new sap.m.Input({
						class: "sapUiSmallMarginEnd",
						type: "Text",
						placeholder: "Select field",
						showValueHelp: true,
						valueHelpIconSrc: "sap-icon://value-help",
						valueHelpRequest: function (oEvent) {
							var self = this;
							var oSource = oEvent.getSource();
							var oMetaDataModel = that.getView().getModel("metaDataModel");

							if (!oMetaDataModel || !oMetaDataModel.getData() || oMetaDataModel.getData().length === 0) {
								sap.m.MessageToast.show("No metadata available. Please fetch query data first.");
								return;
							}

							// Create value help dialog if it doesn't exist
							if (!that._oMetaDataValueHelpDialog) {
								that._oMetaDataValueHelpDialog = new sap.m.SelectDialog({
									title: "Select Field",
									items: {
										path: "metaDataModel>/",
										template: new sap.m.StandardListItem({
											title: "{metaDataModel>SCRTEXT_L}",
											description: "{metaDataModel>FIELDNAME}",
											type: "Active"
										})
									},
									confirm: function (oEvent) {
										var oSelectedItem = oEvent.getParameter("selectedItem");
										if (oSelectedItem) {
											var sFieldName = oSelectedItem.getTitle();
											oSource.setValue(sFieldName);
										}
									},
									cancel: function () {
										// Dialog closed without selection
									}
								});
								that.getView().addDependent(that._oMetaDataValueHelpDialog);
							}

							// Set the model and open the dialog
							that._oMetaDataValueHelpDialog.setModel(oMetaDataModel, "metaDataModel");
							that._oMetaDataValueHelpDialog.open();
						}
					});
					var oYLabel = new sap.m.Label({
						text: "Select Measures"
					});
					var oYSelect = new sap.m.MultiInput({
						width: "100%",
						showValueHelp: true,
						valueHelpRequest: function(oEvent) {
							var oSource = oEvent.getSource();
							var oMetaDataModel = that.getView().getModel("metaDataModel");

							if (!oMetaDataModel || !oMetaDataModel.getData() || oMetaDataModel.getData().length === 0) {
								sap.m.MessageToast.show("No metadata available. Please fetch query data first.");
								return;
							}

							// Create value help dialog if it doesn't exist
							if (!that._oYMetaDataValueHelpDialog) {
								that._oYMetaDataValueHelpDialog = new sap.m.SelectDialog({
									title: "Select Y Axis Fields",
									multiSelect: true,
									items: {
										path: "metaDataModel>/",
										template: new sap.m.StandardListItem({
											title: "{metaDataModel>SCRTEXT_L}",
											description: "{metaDataModel>FIELDNAME}",
											type: "Active"
										})
									},
									confirm: function(oEvent) {
										debugger;
										var aSelectedItems = oEvent.getParameter("selectedItems");
										if (aSelectedItems && aSelectedItems.length > 0) {
											// Clear existing tokens
											oSource.removeAllTokens();
											
											// Add selected items as tokens
											aSelectedItems.forEach(function(oItem) {
												var sFieldName = oItem.getDescription(); // FIELDNAME is in description
												var sDisplayText = oItem.getTitle(); // SCRTEXT_L is in title
												var oToken = new sap.m.Token({
													key: sFieldName,
													text: sDisplayText
												});
												oSource.addToken(oToken);
											});
										}
									},
									cancel: function() {
										// Dialog closed without selection
									}
								});
								that.getView().addDependent(that._oYMetaDataValueHelpDialog);
							}

							// Filter out the field already selected in X Axis
							var sSelectedXField = oXSelect.getSelectedKey();
							var aFilteredData = oMetaDataModel.getData().filter(function(oItem) {
								return oItem.FIELDNAME !== sSelectedXField;
							});
							
							// Create a filtered model
							var oFilteredModel = new sap.ui.model.json.JSONModel(aFilteredData);
							that._oYMetaDataValueHelpDialog.setModel(oFilteredModel, "metaDataModel");
							that._oYMetaDataValueHelpDialog.open();
						}
					});
					// 	var oYInput = new sap.m.Input({
					// 		class: "sapUiSmallMarginEnd",
					// 		type: "Text",
					// 		placeholder: "Select field",
					// 		showValueHelp: true,
					// 		valueHelpIconSrc: "sap-icon://value-help",
					// // 		valueHelpRequest: function (oEvent) {
					// // 			// that._openFieldValueHelp(oEvent.getSource());
					// // }
					// 		valueHelpRequest: function (oEvent) {
					// 			var self = this;
					// 			var oSource1 = oEvent.getSource();
					// 			var oMetaDataModel = that.getView().getModel("metaDataModel");

					// 			if (!oMetaDataModel || !oMetaDataModel.getData() || oMetaDataModel.getData().length === 0) {
					// 				sap.m.MessageToast.show("No metadata available. Please fetch query data first.");
					// 				return;
					// 			}

					// 			// Create value help dialog if it doesn't exist
					// 			if (!that._oMetaDataValueHelpDialog) {
					// 				that._oMetaDataValueHelpDialog = new sap.m.SelectDialog({
					// 					title: "Select Field",
					// 					items: {
					// 						path: "metaDataModel>/",
					// 						template: new sap.m.StandardListItem({
					// 							title: "{metaDataModel>FIELDNAME}",
					// 							description: "{metaDataModel>SCRTEXT_L}",
					// 							type: "Active"
					// 						})
					// 					},
					// 					confirm: function (oEvent) {
					// 						var oSelectedItem = oEvent.getParameter("selectedItem");
					// 						if (oSelectedItem) {
					// 							var sFieldName = oSelectedItem.getTitle();
					// 							oSource1.setValue(sFieldName);
					// 						}
					// 					},
					// 					cancel: function () {
					// 						// Dialog closed without selection
					// 					}
					// 				});
					// 				that.getView().addDependent(that._oMetaDataValueHelpDialog);
					// 			}

					// 			// Set the model and open the dialog
					// 			that._oMetaDataValueHelpDialog.setModel(oMetaDataModel, "metaDataModel");
					// 			that._oMetaDataValueHelpDialog.open();
					// 		}
					// 	});

					oForm.addContent(oXLabel);
					oForm.addContent(oXSelect);
					oForm.addContent(oYLabel);
					oForm.addContent(oYSelect);

					debugger;
					var oModel = that.getView().getModel("selectedValues");
					var oCurrentData = oModel.getData();

					if (oCurrentData.mapping) {
						try {
							var mappingData = JSON.parse(oCurrentData.mapping);

							// Set X-axis selection
							if (mappingData.x && oXSelect) {
								oXSelect.setSelectedKey(mappingData.x);
							}

							// Set Y-axis selections
							if (mappingData.y && Array.isArray(mappingData.y) && oYSelect) {
								// Clear existing tokens
								oYSelect.removeAllTokens();
								
								// Add each field as a token
								for (var i = 0; i < mappingData.y.length; i++) {
									var sField = mappingData.y[i];
									// Find the corresponding description from metaDataModel
									var oMetaDataModel = that.getView().getModel("metaDataModel");
									var sDisplayText = sField; // Default to field name
									
									if (oMetaDataModel && oMetaDataModel.getData()) {
										var aMetaData = oMetaDataModel.getData();
										var oField = aMetaData.find(function(oItem) {
											return oItem.FIELDNAME === sField;
										});
										if (oField && oField.SCRTEXT_L) {
											sDisplayText = oField.SCRTEXT_L;
										}
									}
									
									var oToken = new sap.m.Token({
										key: sField,
										text: sDisplayText
									});
									oYSelect.addToken(oToken);
								}
							}
						} catch (e) {
							console.error("Error parsing mapping data:", e);
						}
					}

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

		handleMetaDataValueHelp: function (oController, oEvent) {
			var that = oController;
			var oSource = oEvent.getSource();
			var oMetaDataModel = that.getView().getModel("metaDataModel");

			if (!oMetaDataModel || !oMetaDataModel.getData() || oMetaDataModel.getData().length === 0) {
				sap.m.MessageToast.show("No metadata available. Please fetch query data first.");
				return;
			}

			// Create value help dialog if it doesn't exist
			if (!that._oMetaDataValueHelpDialog) {
				that._oMetaDataValueHelpDialog = new sap.m.SelectDialog({
					title: "Select Field",
					items: {
						path: "metaDataModel>/",
						template: new sap.m.StandardListItem({
							title: "{metaDataModel>FIELDNAME}",
							description: "{metaDataModel>SCRTEXT_L}",
							type: "Active"
						})
					},
					confirm: function (oEvent) {
						var oSelectedItem = oEvent.getParameter("selectedItem");
						if (oSelectedItem) {
							var sFieldName = oSelectedItem.getTitle();
							oSource.setValue(sFieldName);
						}
					},
					cancel: function () {
						// Dialog closed without selection
					}
				});
				that.getView().addDependent(that._oMetaDataValueHelpDialog);
			}

			// Set the model and open the dialog
			that._oMetaDataValueHelpDialog.setModel(oMetaDataModel, "metaDataModel");
			that._oMetaDataValueHelpDialog.open();
		},

		_processVBoxContent: function (oVBox, sCurrentLabel, oFormData) {
			var aVBoxItems = oVBox.getItems();

			aVBoxItems.forEach(function (oItem) {
				if (oItem instanceof sap.m.HBox) {
					var aHBoxItems = oItem.getItems();
					var oValuePair = {
						LOW: "",
						HIGH: ""
					};
					var oSelectInfo = {};
					var aInputs = [];

					// First, collect all inputs in order
					aHBoxItems.forEach(function (oHBoxItem) {
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