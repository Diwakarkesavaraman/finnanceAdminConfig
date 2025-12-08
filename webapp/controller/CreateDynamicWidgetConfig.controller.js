sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, MessageToast, MessageBox, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("mobilefinance.MobileFinance.controller.CreateDynamicWidgetConfig", {

		onInit: function () {
			this._initializeModels();
		},

		_initializeModels: async function () {
			debugger;
			// Initialize widget values model
			var oCreateWidgetValues = new JSONModel({
				widgetId: "",
				widgetName: "",
				selectedWidgetType: "",
				selectedChartType: "",
				selectedDataSource: "",
				inputParameter: ""
			});
			this.getView().setModel(oCreateWidgetValues, "createWidgetValues");

			// Initialize widget type dropdown data from backend
			var aCreateWidgetTypes = await this.getSearchHelpData('Widget_type');
			var oCreateWidgetTypeModel = new JSONModel(aCreateWidgetTypes);
			this.getView().setModel(oCreateWidgetTypeModel, "createWidgetTypeDropdownData");

			// Initialize chart type dropdown data from backend
			var aCreateChartTypes = await this.getSearchHelpData('Chart_type');
			var oCreateChartTypeModel = new JSONModel(aCreateChartTypes);
			this.getView().setModel(oCreateChartTypeModel, "createChartTypeDropdownData");

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
			this.getView().setModel(oInputParamModel, "inputParamModel");

			// Initialize metadata model
			var oCreateMetaDataModel = new JSONModel([]);
			this.getView().setModel(oCreateMetaDataModel, "createMetaDataModel");

			// Initialize JSON data model
			var oCreateJsonDataModel = new JSONModel([]);
			this.getView().setModel(oCreateJsonDataModel, "createJsonDataModel");
		},

		onCreateEditPress: function () {
			MessageToast.show("Edit functionality for Create Widget Config");
		},

		onCreateSavePress: function () {
			var that = this;
			var finmobview = that.getView().getModel("finmobview");
			var oWidgetData = that.getView().getModel("createWidgetValues").getData();
			var mappingFormData = this.getMappingFormValues();
			
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

		onCreateCancelPress: function () {
			MessageToast.show("Cancel functionality for Create Widget Config");
		},

		onCreateDeleteWidget: function () {
			var that = this;
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
					that._clearForm();
				},
				error: function (oError) {
					console.error("Error deleting:", oError);
					MessageBox.error("Error deleting widget configuration");
				}
			});
		},

		onCreateDataSourceChange: function () {
			console.log("Data Source Changed");
			this.byId("createCheckBtn").setVisible(true);
			this.byId("createBusyIndicator").setVisible(false);
			this.byId("createSuccessIcon").setVisible(false);
		},

		onCreateCheckQueryValidity: function () {
			var that = this;
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

		onCreateGetGroupedFormValues: function () {
			var that = this;
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

		getQueryParameter: function(datasource) {
			return new Promise((resolve, reject) => {
				var finmobview = this.getView().getModel("finmobview");
				var dataSourceValue = datasource || '';
				var aFilters = [new Filter("DataSource", FilterOperator.EQ, dataSourceValue)];
				
				finmobview.read("/VariableMetaDataSet", {
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

		onCreateAddInput: async function (dataSource) {
			var that = this;
			var oForm = that.byId("createBexQueryParameterForm");
			oForm.removeAllContent();
			var aQueryParam = await that.getQueryParameter(dataSource);
		
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
											press: that.handleCreateAddPress.bind(that, 'M')
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
										press: that.handleCreateAddPress.bind(that, 'M')
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
											press: that.handleCreateAddPress.bind(that, 'S')
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
										press: that.handleCreateAddPress.bind(that, 'S')
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
			});
		},

		handleCreateAddPress: function (paramQueryType, oEvent) {
			var that = this;
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
									press: that.handleCreateAddPress.bind(that, 'S')
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
									press: that.handleCreateAddPress.bind(that, 'M')
								})
							]
						})
					]
				});
				oForm.insertContent(oMultiInputBox, iButtonIndex + 1);
			}
		},

		getMappingFormValues: function () {
			var that = this;
			var oForm = that.byId("createDataMappingForm");
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

		_clearForm: function () {
			// Clear the widget values model
			var oCreateWidgetValues = this.getView().getModel("createWidgetValues");
			oCreateWidgetValues.setData({
				widgetId: "",
				widgetName: "",
				selectedWidgetType: "",
				selectedChartType: "",
				selectedDataSource: "",
				inputParameter: ""
			});
			
			// Clear the forms
			var oBexForm = this.byId("createBexQueryParameterForm");
			if (oBexForm) {
				oBexForm.removeAllContent();
			}
			
			var oMappingForm = this.byId("createDataMappingForm");
			if (oMappingForm) {
				oMappingForm.removeAllContent();
			}
			
			// Hide success indicators
			this.byId("createSuccessIcon").setVisible(false);
			this.byId("createBusyIndicator").setVisible(false);
			this.byId("createCheckBtn").setVisible(true);
			
			// Hide tab bar
			var oTabBar = this.byId("createIconTabBarInlineMode");
			var oBusyIndicator = this.byId("createTabBarBusyIndicator");
			if (oTabBar && oBusyIndicator) {
				oBusyIndicator.setVisible(true);
				oTabBar.setVisible(false);
			}
		},


		
		getSearchHelpData: function (filterBy) {
			return new Promise((resolve, reject) => {
				var finmobview = this.getView().getModel("finmobview");
				var aFilters = [new Filter("Filter", FilterOperator.EQ, filterBy)];

				finmobview.read("/WidgetSearchHelpSet", {
					filters: aFilters,
					success: function (data) {
						console.log("Search help data fetched:", data);
						resolve(data.results);
					},
					error: function (oError) {
						console.error("Error fetching search help data:", oError);
						var responseText = oError.responseText;
						var msg = "Error fetching search help data";
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

		_createDynamicTableColumns: function (jsonData, metaData) {
			var oTable = this.byId("createJsonDataTable");
			if (!oTable || !jsonData || jsonData.length === 0) {
				return;
			}

			// Clear existing columns
			oTable.removeAllColumns();

			// Get column names from first data row
			var aColumnNames = Object.keys(jsonData[0]);

			// Create columns dynamically with proper display names
			aColumnNames.forEach(function (sColumnName) {
				// Find the corresponding SCRTEXT_L from metadata
				var sDisplayName = sColumnName; // Default to field name
				var oMetaField = metaData.find(function (oItem) {
					return oItem.FIELDNAME === sColumnName;
				});
				if (oMetaField && oMetaField.SCRTEXT_L) {
					sDisplayName = oMetaField.SCRTEXT_L;
				}

				var oColumn = new sap.m.Column({
					header: new sap.m.Text({ text: sDisplayName })
				});
				oTable.addColumn(oColumn);
			});

			// Clear and recreate template
			oTable.removeAllItems();
			var oCells = aColumnNames.map(function (sColumnName) {
				return new sap.m.Text({ text: "{createJsonDataModel>" + sColumnName + "}" });
			});

			var oColumnListItem = new sap.m.ColumnListItem({
				cells: oCells
			});

			oTable.bindItems({
				path: "createJsonDataModel>/",
				template: oColumnListItem
			});
		}
	});
});