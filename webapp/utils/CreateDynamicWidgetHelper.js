sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (JSONModel, MessageBox, MessageToast, Filter, FilterOperator) {
	"use strict";

	return {
		onLoadCreateDynamicWidgetData: async function (oController, widgetId) {
			debugger;
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			
			sap.ui.core.BusyIndicator.show(0);

			// Create a model for selected values
			var oCreateWidgetValuesModel = new JSONModel({
				widgetId: "",
				widgetName: "",
				selectedWidgetType: "",
				selectedChartType: "",
				selectedDataSource: "",
				inputParameter: "",
				mapping: ""
			});
			that.getView().setModel(oCreateWidgetValuesModel, "createWidgetValues");

			// Initialize input parameter model for select options
			var oInputParamModel = new JSONModel({
				selectOptionRange: [
					{ Value: "EQ" },
					{ Value: "NE" },
					{ Value: "BT" },
					{ Value: "NB" },
					{ Value: "GT" },
					{ Value: "GE" },
					{ Value: "LT" },
					{ Value: "LE" }
				]
			});
			that.getView().setModel(oInputParamModel, "inputParamModel");

			// Hide widget ID fields initially
			that.getView().byId("createWidgetId").setVisible(false);
			that.getView().byId("createWidgetIdLabel").setVisible(false);

			// Fetch dropdown data
			var aCreateWidgetTypes = await that.getSearchHelpData('Widget_type');
			var oCreateWidgetTypeModel = new JSONModel(aCreateWidgetTypes);
			that.getView().setModel(oCreateWidgetTypeModel, "createWidgetTypeDropdownData");

			var aCreateChartTypes = await that.getSearchHelpData('Chart_type');
			var oCreateChartTypeModel = new JSONModel(aCreateChartTypes);
			that.getView().setModel(oCreateChartTypeModel, "createChartTypeDropdownData");

			// Initialize metadata and JSON data models
			var oCreateMetaDataModel = new JSONModel([]);
			that.getView().setModel(oCreateMetaDataModel, "createMetaDataModel");

			var oCreateJsonDataModel = new JSONModel([]);
			that.getView().setModel(oCreateJsonDataModel, "createJsonDataModel");

			// Load existing widget data if widgetId is provided
			if (widgetId && widgetId !== "") {
				var aFilters = [new Filter("WidgetId", FilterOperator.EQ, widgetId)];
				finmobview.read("/WidgetConfigurationSet", {
					filters: aFilters,
					success: function (oData) {
						var oModel = that.getView().getModel("createWidgetValues");
						var oCurrentData = oModel.getData();
						var oWidgetData = oData.results[0];
						
						oCurrentData.widgetId = oWidgetData.WidgetId;
						oCurrentData.widgetName = oWidgetData.WidgetName;
						oCurrentData.selectedWidgetType = oWidgetData.WidgetType;
						oCurrentData.selectedChartType = oWidgetData.ChartType;
						oCurrentData.selectedDataSource = oWidgetData.DataSource;
						oCurrentData.inputParameter = oWidgetData.InputParameter;
						oCurrentData.mapping = oWidgetData.Mapping;
						
						oModel.setData(oCurrentData);
						
						// Show widget ID fields
						that.getView().byId("createWidgetId").setVisible(true);
						that.getView().byId("createWidgetIdLabel").setVisible(true);
						
						// Load form data
						if (oWidgetData.DataSource) {
							that.onCreateAddInput(oWidgetData.DataSource);
						}
						
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (oError) {
						console.error("Error loading widget data:", oError);
						MessageBox.error("Error loading widget configuration");
						sap.ui.core.BusyIndicator.hide();
					}
				});
			} else {
				sap.ui.core.BusyIndicator.hide();
			}
		},

		onCreateDataSourceChange: function (oController, oEvent) {
			console.log("Create Data Source Changed");
			oController.getView().byId("createCheckBtn").setVisible(true);
			oController.getView().byId("createBusyIndicator").setVisible(false);
			oController.getView().byId("createSuccessIcon").setVisible(false);
		},

		onCreateCheckQueryValidity: function (oController, oEvent) {
			debugger;
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			var dataSource = that.byId("createDataSourceId").getValue();
			
			if (!dataSource) {
				MessageToast.show("Please enter a data source");
				return;
			}
			
			// Hide button and show busy indicator
			var oButton = that.byId("createCheckBtn");
			var oBusyIndicator = that.byId("createBusyIndicator");
			oButton.setVisible(false);
			oBusyIndicator.setVisible(true);
			
			var aFilters = [new Filter("Query_Name", FilterOperator.EQ, dataSource)];
			finmobview.read("/QueryValidation", {
				filters: aFilters,
				success: function (data) {
					console.log(data);
					var response = data.results[0] || [];
					if (response.IsExist) {
						that.byId("createSuccessIcon").setVisible(true);
						var dataSource = response.Query_Name;
						that.onCreateAddInput(dataSource);
					}
				},
				error: function (oError) {
					oBusyIndicator.setVisible(false);
					oButton.setVisible(true);
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
				}
			});
		},

		onCreateSavePress: function (oController, oEvent) {
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			var oWidgetData = that.getView().getModel("createWidgetValues").getData();
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
				// Update existing widget
				finmobview.update("/WidgetConfigurationSet('" + oWidgetData.widgetId + "')", oPayload, {
					success: function (oData) {
						console.log("Successfully updated:", oPayload);
						MessageToast.show("Widget configuration updated successfully");
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (oError) {
						console.error("Error updating:", oPayload, oError);
						MessageBox.error("Error updating widget configuration");
						sap.ui.core.BusyIndicator.hide();
					}
				});
			} else {
				// Create new widget
				finmobview.create("/WidgetConfigurationSet", oPayload, {
					success: function (oData) {
						console.log("Successfully created:", oPayload);
						MessageToast.show("Widget configuration created successfully");
						// Update the widget ID in the model
						that.getView().getModel("createWidgetValues").setProperty("/widgetId", oData.WidgetId);
						// Show widget ID fields
						that.getView().byId("createWidgetId").setVisible(true);
						that.getView().byId("createWidgetIdLabel").setVisible(true);
						sap.ui.core.BusyIndicator.hide();
					},
					error: function (oError) {
						console.error("Error creating:", oPayload, oError);
						MessageBox.error("Error creating widget configuration");
						sap.ui.core.BusyIndicator.hide();
					}
				});
			}
		},

		onCreateDeleteWidget: function (oController, widgetId) {
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			var oWidgetData = that.getView().getModel("createWidgetValues").getData();
			
			if (!oWidgetData.widgetId) {
				MessageToast.show("No widget to delete");
				return;
			}
			
			finmobview.remove("/WidgetConfigurationSet(WidgetId='" + oWidgetData.widgetId + "')", {
				success: function (oData) {
					console.log("Successfully deleted:", oData);
					MessageToast.show("Widget configuration deleted successfully");
					// Clear the form
					this._clearCreateForm(oController);
				}.bind(this),
				error: function (oError) {
					console.error("Error deleting:", oError);
					MessageBox.error("Error deleting widget configuration");
				}
			});
		},

		onCreateGetGroupedFormValues: function (oController) {
			var that = oController;
			var oForm = that.byId("createBexQueryParameterForm");
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
					var aItems = oControl.getItems();
					aItems.forEach(function (oItem) {
						if (oItem instanceof sap.m.HBox) {
							var aHBoxItems = oItem.getItems();
							aHBoxItems.forEach(function (oHBoxItem) {
								if (oHBoxItem instanceof sap.m.Input) {
									var sValue = oHBoxItem.getValue();
									if (sValue) {
										oFormData[sCurrentLabel].values.push(sValue);
										oFormData[sCurrentLabel].type = "M"; // MultiInput
									}
								} else if (oHBoxItem instanceof sap.m.Select) {
									var sSelectedKey = oHBoxItem.getSelectedKey();
									if (sSelectedKey) {
										oFormData[sCurrentLabel].selects.push(sSelectedKey);
										oFormData[sCurrentLabel].type = "S"; // Select
									}
								}
							});
						}
					});
				}
			});
			
			// Update the input parameter in the model
			var oCreateWidgetValues = that.getView().getModel("createWidgetValues");
			oCreateWidgetValues.setProperty("/inputParameter", JSON.stringify(oFormData));
			
			console.log("Create Widget Form Values:", oFormData);
			MessageToast.show("Form values saved for Create Widget Config");
			
			return JSON.stringify(oFormData);
		},

		getQueryParameter: function(oController, datasource) {
			return new Promise((resolve, reject) => {
				var finmobview = oController.getView().getModel("finmobview");
				var dataSourceValue = datasource || '';
				var aFilters = [new Filter("DataSource", FilterOperator.EQ, dataSourceValue)];
				
				finmobview.read("/QueryParameterSet", {
					filters: aFilters,
					success: function (data) {
						console.log("Query parameters fetched:", data);
						resolve(data.results);
					},
					error: function (oError) {
						console.error("Error fetching query parameters:", oError);
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
			});
		},

		onCreateAddInput: async function (oController, dataSource) {
			var that = oController;
			var oForm = that.byId("createBexQueryParameterForm");
			oForm.removeAllContent();
			var aQueryParam = await this.getQueryParameter(oController, dataSource);
		
			// Get existing inputParameter data if available
			var oSelectedData = that.getView().getModel("createWidgetValues").getData();
			var aExistingInputParam = [];
			if (oSelectedData.inputParameter) {
				try {
					aExistingInputParam = JSON.parse(oSelectedData.inputParameter);
				} catch (e) {
					console.error("Error parsing inputParameter:", e);
				}
			}
		
			aQueryParam.forEach(function(param) {
				switch (param.Vparsel) {
					case 'M':
						var oLabel = new sap.m.Label({
							text: param.Vtxt
						});
						// Create initial multi-input items
						var aMultiInputItems = [];
						
						// Check if there are existing values for this parameter
						var existingParam = aExistingInputParam.find(p => p.VNAM === param.Vnam);
						if (existingParam && existingParam.LS_VALUE && existingParam.LS_VALUE.length > 0) {
							existingParam.LS_VALUE.forEach(function(value) {
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
											press: function(oEvent) {
												this.handleCreateAddPress(oController, 'M', oEvent);
											}.bind(this)
										})
									]
								}));
							}.bind(this));
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
										press: function(oEvent) {
											this.handleCreateAddPress(oController, 'M', oEvent);
										}.bind(this)
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
						
						// Check if there are existing values for this parameter
						var existingParam = aExistingInputParam.find(p => p.VNAM === param.Vnam);
						if (existingParam && existingParam.LS_VALUE && existingParam.LS_VALUE.length > 0) {
							existingParam.LS_VALUE.forEach(function(value) {
								aSelectOptionItems.push(new sap.m.HBox({
									class: "sapUiSmallMarginBottom",
									items: [
										new sap.m.Select({
											forceSelection: false,
											selectedKey: value.OPTION,
											items: {
												path: "inputParamModel>/selectOptionRange",
												template: new sap.ui.core.Item({
													key: "{inputParamModel>Value}",
													text: "{inputParamModel>Value}"
												})
											},
											icon: "sap-icon://filter",
											autoAdjustWidth: true,
											class: "sapUiSmallMarginEnd"
										}),
										new sap.m.Input({
											class: "sapUiSmallMarginBottom",
											type: "Text",
											value: value.LOW,
											showValueHelp: true,
											valueHelpIconSrc: "sap-icon://value-help"
										}),
										new sap.m.Button({
											enabled: true,
											icon: "sap-icon://add",
											press: function(oEvent) {
												this.handleCreateAddPress(oController, 'S', oEvent);
											}.bind(this)
										})
									]
								}));
							}.bind(this));
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
										class: "sapUiSmallMarginEnd"
									}),
									new sap.m.Input({
										class: "sapUiSmallMarginBottom",
										type: "Text",
										showValueHelp: true,
										valueHelpIconSrc: "sap-icon://value-help"
									}),
									new sap.m.Button({
										enabled: true,
										icon: "sap-icon://add",
										press: function(oEvent) {
											this.handleCreateAddPress(oController, 'S', oEvent);
										}.bind(this)
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
						var existingParam = aExistingInputParam.find(p => p.VNAM === param.Vnam);
						if (existingParam && existingParam.LS_VALUE && existingParam.LS_VALUE.length > 0) {
							sLowValue = existingParam.LS_VALUE[0].LOW || "";
							sHighValue = existingParam.LS_VALUE[0].HIGH || "";
						}
						
						var oIntervalBox = new sap.m.HBox({
							class: "sapUiMediumMargin",
							items: [
								new sap.m.Input({
									class: "sapUiSmallMarginEnd",
									type: "Text",
									value: sLowValue,
									placeholder: "Low",
									showValueHelp: true,
									valueHelpIconSrc: "sap-icon://value-help"
								}),
								new sap.m.Text({
									text: "to",
									class: "sapUiSmallMarginEnd"
								}),
								new sap.m.Input({
									type: "Text",
									value: sHighValue,
									placeholder: "High",
									showValueHelp: true,
									valueHelpIconSrc: "sap-icon://value-help"
								})
							]
						});
						oForm.addContent(oLabel);
						oForm.addContent(oIntervalBox);
						break;
				}
			}.bind(this));
		},

		handleCreateAddPress: function (oController, paramQueryType, oEvent) {
			var that = oController;
			var oClickedButton = oEvent.getSource().getParent().getParent();
			var oForm = that.byId("createBexQueryParameterForm");
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
									class: "sapUiSmallMarginEnd"
								}),
								new sap.m.Input({
									class: "sapUiSmallMarginBottom",
									type: "Text",
									showValueHelp: true,
									valueHelpIconSrc: "sap-icon://value-help"
								}),
								new sap.m.Button({
									enabled: true,
									icon: "sap-icon://add",
									press: function(oEvent) {
										this.handleCreateAddPress(oController, 'S', oEvent);
									}.bind(this)
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
									press: function(oEvent) {
										this.handleCreateAddPress(oController, 'M', oEvent);
									}.bind(this)
								})
							]
						})
					]
				});
				oForm.insertContent(oMultiInputBox, iButtonIndex + 1);
			}
		},

		getMappingFormValues: function (oController) {
			var that = oController;
			var oForm = that.byId("createDataMappingForm");
			var aFormContent = oForm.getContent();

			var oformValues = {};
			var aFields = [];

			// Loop through form content to get Label-Control pairs
			for (var i = 0; i < aFormContent.length; i++) {
				var oControl = aFormContent[i];

				// Check if it's a Label
				if (oControl instanceof sap.m.Label) {
					var oNextControl = aFormContent[i + 1]; // Get the next control after label

					if (oNextControl) {
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

		_clearCreateForm: function (oController) {
			var that = oController;
			// Clear the widget values model
			var oCreateWidgetValues = that.getView().getModel("createWidgetValues");
			oCreateWidgetValues.setData({
				widgetId: "",
				widgetName: "",
				selectedWidgetType: "",
				selectedChartType: "",
				selectedDataSource: "",
				inputParameter: "",
				mapping: ""
			});
			
			// Clear the forms
			var oBexForm = that.byId("createBexQueryParameterForm");
			if (oBexForm) {
				oBexForm.removeAllContent();
			}
			
			var oMappingForm = that.byId("createDataMappingForm");
			if (oMappingForm) {
				oMappingForm.removeAllContent();
			}
			
			// Hide success indicators
			that.byId("createSuccessIcon").setVisible(false);
			that.byId("createBusyIndicator").setVisible(false);
			that.byId("createCheckBtn").setVisible(true);
			
			// Hide widget ID fields
			that.byId("createWidgetId").setVisible(false);
			that.byId("createWidgetIdLabel").setVisible(false);
			
			// Hide tab bar
			var oTabBar = that.byId("createIconTabBarInlineMode");
			var oBusyIndicator = that.byId("createTabBarBusyIndicator");
			if (oTabBar && oBusyIndicator) {
				oBusyIndicator.setVisible(true);
				oTabBar.setVisible(false);
			}
		},

		onCreateEditPress: function (oController, oEvent) {
			var that = oController;
			// Enable form editing
			var oForm = that.byId("createWidgetSimpleForm");
			if (oForm) {
				oForm.setEditable(true);
			}
			
			// Update button visibility
			that.byId("editBtn").setEnabled(false);
			that.byId("saveBtn").setVisible(true);
			that.byId("submitBtn").setVisible(false);
			
			MessageToast.show("Edit mode enabled for Create Widget Config");
		},

		onCreateCancelPress: function (oController, oEvent) {
			var that = oController;
			// Clear form and reset state
			this._clearCreateForm(oController);
			
			// Update button visibility
			that.byId("editBtn").setEnabled(false);
			that.byId("saveBtn").setVisible(true);
			that.byId("submitBtn").setVisible(false);
			
			MessageToast.show("Create Widget Config cancelled and form cleared");
		}
	};
});