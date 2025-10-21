sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/Column",
	"sap/m/Text",
	"sap/m/ColumnListItem",
	"sap/m/Label",
	"sap/m/MultiInput",
	"sap/m/Token",
	"sap/m/SelectDialog",
	"sap/m/StandardListItem"
], function (JSONModel, MessageBox, MessageToast, Filter, FilterOperator, Column, Text, ColumnListItem, Label, MultiInput, Token, SelectDialog, StandardListItem) {
	"use strict";

	return {
		onLoadWidgetListData: async function (oController) {
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			
			// Show busy indicator
			var oBusyIndicator = that.byId("widgetListBusyIndicator");
			if (oBusyIndicator) {
				oBusyIndicator.setVisible(true);
			}
			
			var aFilters = [new Filter("Filter", FilterOperator.EQ, "Widget_ID")];
			
			try {
				return new Promise((resolve, reject) => {
					finmobview.read("/WidgetSearchHelpSet", {
						filters: aFilters,
						success: function (data) {
							console.log("Widget list data fetched:", data);
							
							// Create and set widget list model
							var oWidgetListModel = new JSONModel(data.results);
							that.getView().setModel(oWidgetListModel, "widgetListModel");
							
							// Hide busy indicator
							if (oBusyIndicator) {
								oBusyIndicator.setVisible(false);
							}
							
							resolve(data.results);
						},
						error: function (oError) {
							console.error("Error fetching widget list:", oError);
							var responseText = oError.responseText;
							var msg = "Error fetching widget list";
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
							
							// Hide busy indicator
							if (oBusyIndicator) {
								oBusyIndicator.setVisible(false);
							}
							
							reject(oError);
						}
					});
				});
			} catch (error) {
				console.error("Error in onLoadWidgetListData:", error);
				if (oBusyIndicator) {
					oBusyIndicator.setVisible(false);
				}
				throw error;
			}
		},

		onWidgetListItemPress: function (oController, oEvent) {
			var that = oController;
			var oBindingContext = oEvent.getSource().getBindingContext("widgetListModel");
			var oSelectedWidget = oBindingContext.getObject();
			
			console.log("Selected widget:", oSelectedWidget);
			
			// Hide widget list and show create dynamic widget config
			that.byId("widgetListContainer").setVisible(false);
			that.byId("createDynamicWidgetConfigContainer").setVisible(true);
			
			// Load the selected widget data
			this.onLoadCreateDynamicWidgetData(that, oSelectedWidget.Id);
		},

		onAddNewWidget: function (oController, oEvent) {
			var that = oController;
			
			// Hide widget list and show create dynamic widget config
			that.byId("widgetListContainer").setVisible(false);
			that.byId("createDynamicWidgetConfigContainer").setVisible(true);
			
			// Clear form and load with empty data
			this._clearCreateForm(that);
			this.onLoadCreateDynamicWidgetData(that, null);
		},

		// onEditWidget: function (oController, oEvent) {
		// 	var that = oController;
		// 	var oBindingContext = oEvent.getSource().getBindingContext("widgetListModel");
		// 	var oSelectedWidget = oBindingContext.getObject();
			
		// 	console.log("Edit widget:", oSelectedWidget);
			
		// 	// Prevent event bubbling to avoid triggering row press
		// 	oEvent.stopPropagation();
			
		// 	// Hide widget list and show create dynamic widget config
		// 	that.byId("widgetListContainer").setVisible(false);
		// 	that.byId("createDynamicWidgetConfigContainer").setVisible(true);
			
		// 	// Load the selected widget data for editing
		// 	this.onLoadCreateDynamicWidgetData(that, oSelectedWidget.Id);
		// },

		onDeleteWidgetFromList: function (oController, oEvent) {
			var that = oController;
			var oBindingContext = oEvent.getSource().getBindingContext("widgetListModel");
			var oSelectedWidget = oBindingContext.getObject();
			
			// Prevent event bubbling to avoid triggering row press
			if (oEvent.preventDefault) {
				oEvent.preventDefault();
			}
			if (oEvent.cancelBubble !== undefined) {
				oEvent.cancelBubble = true;
			}
			// Get browser event and stop propagation
			var oBrowserEvent = oEvent.getParameter("domEvent") || oEvent.originalEvent;
			if (oBrowserEvent && oBrowserEvent.stopPropagation) {
				oBrowserEvent.stopPropagation();
			}
			
			MessageBox.confirm("Are you sure you want to delete the widget '" + (oSelectedWidget.Text || oSelectedWidget.Id) + "'?", {
				title: "Confirm Delete",
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.OK) {
						this.onCreateDeleteWidget(that, oSelectedWidget.Id);
						// Refresh the widget list after deletion
						this.onLoadWidgetListData(that);
					}
				}.bind(this)
			});
		},

		onBackToWidgetList: function (oController, oEvent) {
			var that = oController;
			
			// Hide create dynamic widget config and show widget list
			that.byId("createDynamicWidgetConfigContainer").setVisible(false);
			that.byId("widgetListContainer").setVisible(true);
			
			// Refresh the widget list
			this.onLoadWidgetListData(that);
		},

		onLoadCreateDynamicWidgetData: async function (oController, widgetId) {
			debugger;
			var that = oController;
			var self = this;
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
						debugger;
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
						oCurrentData.filter = oWidgetData.Filter;
						oCurrentData.wlabelMapping = oWidgetData.WlabelMapping;
						
						oModel.setData(oCurrentData);
						
						// Show widget ID fields
						that.getView().byId("createWidgetId").setVisible(true);
						that.getView().byId("createWidgetIdLabel").setVisible(true);
						
						// Load form data
						if (oWidgetData.DataSource) {
							self.onCreateAddInput(that, oWidgetData.DataSource);
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
			var self = this;
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
						
						// Show the tab bar and hide busy indicator
						oBusyIndicator.setVisible(false);
						that.byId("createTabBarBusyIndicator").setVisible(false);
						that.byId("createIconTabBarInlineMode").setVisible(true);
						
						// Load query parameters and fetch output data
						self.onCreateAddInput(that, dataSource);
						self.fetchQueryOutput(that, []);
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
			debugger;
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			var oWidgetData = that.getView().getModel("createWidgetValues").getData();
			var mappingFormData = this.getCreateMappingFormValues(oController);
			//Fetch mapping from createFilterMappingForm
			var filterMappingData = this.getCreateFilterMappingFormValues(oController);
			//Fetch mapping from createTileMappingForm
			var tileMappingData = this.getCreateTileMappingFormValues(oController); 
			
			var oPayload = {
				"WidgetType": oWidgetData.selectedWidgetType,
				"WidgetName": oWidgetData.widgetName,
				"ChartType": oWidgetData.selectedChartType,
				"DataSource": oWidgetData.selectedDataSource,
				"WidgetId": oWidgetData.widgetId,
				"InputParameter": oWidgetData.inputParameter,
				"Mapping": mappingFormData,
				"WlabelMapping": tileMappingData,
				"Filter": filterMappingData,
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
		
			
			if (!widgetId) {
				MessageToast.show("No widget to delete");
				return;
			}
			
			finmobview.remove("/WidgetConfigurationSet(WidgetId='" + widgetId + "')", {
				success: function (oData) {
					console.log("Successfully deleted:", oData);
					MessageToast.show("Widget deleted successfully");
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

			self.fetchQueryOutput(oController, oFormData);
			return JSON.stringify(oFormData);
		},

		getQueryParameter: function(oController, datasource) {
			return new Promise((resolve, reject) => {
				var finmobview = oController.getView().getModel("finmobview");
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

		onCreateAddInput: async function (oController, dataSource) {
			var that = oController;
			var self = this;
			var oForm = that.byId("createBexQueryParameterForm");
			oForm.removeAllContent();
			var aQueryParam = await this.getQueryParameter(oController, dataSource);
			debugger;
		
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
			debugger;
			self.fetchQueryOutput(oController, '');
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

		getCreateMappingFormValues: function (oController) {
			debugger;
			var that = oController;
			var oModel = that.getView().getModel("selectedValues");
			var oCurrentData = oModel.getData();
		
			var oForm = that.getView().byId("createDataMappingForm");
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

		getCreateFilterMappingFormValues: function (oController) {
			debugger;
			var that = oController;
			var oForm = that.getView().byId("createFilterMappingForm");
			var aFormContent = oForm.getContent();

			var aFilterValues = [];

			// First check if the filter switch is enabled
			var bFilterEnabled = false;
			for (var j = 0; j < aFormContent.length; j++) {
				if (aFormContent[j] instanceof sap.m.Switch) {
					bFilterEnabled = aFormContent[j].getState();
					break;
				}
			}

			// Only collect filter values if the switch is enabled
			if (bFilterEnabled) {
				// Loop through form content to get Label-Control pairs
				for (var i = 0; i < aFormContent.length; i++) {
					var oControl = aFormContent[i];

					// Check if it's a Label with "Select Filter Field" text
					if (oControl instanceof sap.m.Label && oControl.getText() === "Select Filter Field") {
						var oFilterFieldSelect = aFormContent[i + 1]; // Get the field select control
						var oFilterValueSelect = aFormContent[i + 2]; // Get the value select control (skip value label)

						if (oFilterFieldSelect instanceof sap.m.Select && oFilterValueSelect instanceof sap.m.Select) {
							var sSelectedField = oFilterFieldSelect.getSelectedKey();
							var sSelectedValue = oFilterValueSelect.getSelectedKey();
							
							if (sSelectedField && sSelectedValue) {
								aFilterValues.push({
									field: sSelectedField,
									value: sSelectedValue
								});
							}
						}
					}
				}
			}

			return JSON.stringify(aFilterValues);
		},

		getCreateTileMappingFormValues: function (oController) {
			var that = oController;
			var oForm = that.getView().byId("createTileMappingForm");
			var aTileValues = [];

			// Get selected widget type to determine expected number of fields
			var oWidgetValues = that.getView().getModel("createWidgetValues");
			var sSelectedWidgetType = oWidgetValues.getData().selectedWidgetType;
			var iNumberOfFields = 0; // Default to 1 field
			
			if (sSelectedWidgetType.includes("1")) { // 2 Value Widget
				iNumberOfFields = 1;
			}else if (sSelectedWidgetType.includes("2")) { // 3 Value Widget
				iNumberOfFields = 2;
			} 
			else if (sSelectedWidgetType.includes("3")) { // 3 Value Widget
				iNumberOfFields = 3;
			}

			// Get form content and iterate through it to find field pairs
			var aFormContent = oForm.getContent();
			var fieldIndex = 0;
			
			// Form structure: Label, Select, Label, Input, Label, Select, Label, Input, ...
			// Each field has 4 controls: Field Label, Field Select, Text Label, Text Input
			for (var i = 0; i < aFormContent.length && fieldIndex < iNumberOfFields; i += 4) {
				var oFieldSelect = aFormContent[i + 1]; // Field select is after field label
				var oTextInput = aFormContent[i + 3]; // Text input is after text label
				
				if (oFieldSelect instanceof sap.m.Select && oTextInput instanceof sap.m.Input) {
					var sSelectedField = oFieldSelect.getSelectedKey();
					var sDisplayText = oTextInput.getValue();
					
					if (sSelectedField) {
						aTileValues.push({
							field: sSelectedField,
							label: sDisplayText || sSelectedField // Use field name as default if no display text
						});
					}
				}
				fieldIndex++;
			}

			return JSON.stringify(aTileValues);
		},

		fetchQueryOutput: function (oController, aFilterParams) {
			debugger;
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			var oBusyIndicator = that.byId("createTabBarBusyIndicator");
			var oIconTabBar = that.byId("createIconTabBarInlineMode");
			
			if (oBusyIndicator) {
				oBusyIndicator.setVisible(true);
			}
			if (oIconTabBar) {
				oIconTabBar.setVisible(false);
			}

			var sDataSource = that.getView().byId("createDataSourceId").getValue();
			var aFilters = [
				new Filter("DatasourceName", FilterOperator.EQ, sDataSource),
				new Filter("InputParameter", FilterOperator.EQ, JSON.stringify(aFilterParams))
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
					
					console.log("Create Query Output:", data);

					if (data.results && data.results.length > 0) {
						var queryOutput = JSON.parse(data.results[0].QueryOutput);
						var metaData = queryOutput.metadata || [];
						var jsonData = queryOutput.data || [];

						// Add selectedAxis property to each metadata item
						metaData.forEach(function (item) {
							item.selectedAxis = "";
						});

						// Create and set jsonDataModel for the table
						var oJsonDataModel = new JSONModel(jsonData);
						that.getView().setModel(oJsonDataModel, "createJsonDataModel");
						
						// Create dynamic columns for the table
						var oTable = that.getView().byId("createJsonDataTable");
						if (oTable && jsonData.length > 0) {
							// Clear existing columns
							oTable.removeAllColumns();
							
							// Get column names from first data row
							var aColumnNames = Object.keys(jsonData[0]);
							
							// Create columns dynamically with proper display names
							aColumnNames.forEach(function(sColumnName) {
								// Find the corresponding SCRTEXT_L from metadata
								var sDisplayName = sColumnName; // Default to field name
								var oMetaField = metaData.find(function(oItem) {
									return oItem.FIELDNAME === sColumnName;
								});
								if (oMetaField && oMetaField.SCRTEXT_L) {
									sDisplayName = oMetaField.SCRTEXT_L;
								}
								
								var oColumn = new Column({
									header: new Text({text: sDisplayName})
								});
								oTable.addColumn(oColumn);
							});
							
							// Clear and recreate template
							oTable.removeAllItems();
							var oCells = aColumnNames.map(function(sColumnName) {
								return new Text({text: "{createJsonDataModel>" + sColumnName + "}"});
							});
							
							var oColumnListItem = new ColumnListItem({
								cells: oCells
							});
							
							oTable.bindItems({
								path: "createJsonDataModel>/",
								template: oColumnListItem
							});
						}

						// Create and set metaDataModel
						var oMetaDataModel = new JSONModel(metaData);
						that.getView().setModel(oMetaDataModel, "createMetaDataModel");

						// Create data mapping form
						var oForm = that.byId("createDataMappingForm");
						oForm.removeAllContent();

						var oXLabel = new Label({
							text: "Select Dimensions"
						});

						var oXSelect = new sap.m.Select({
							width: "100%",
							showSecondaryValues: true,
							items: {
								path: "createMetaDataModel>/",
								template: new sap.ui.core.ListItem({
									key: "{createMetaDataModel>FIELDNAME}",
									text: "{createMetaDataModel>SCRTEXT_L}",
									additionalText: "{createMetaDataModel>FIELDNAME}"
								})
							}
						});
						
						// var oXInput = new Input({
						// 	class: "sapUiSmallMarginEnd",
						// 	type: "Text",
						// 	placeholder: "Select field",
						// 	showValueHelp: true,
						// 	valueHelpIconSrc: "sap-icon://value-help",
						// 	valueHelpRequest: function (oEvent) {
						// 		var oSource = oEvent.getSource();
						// 		var oMetaDataModel = that.getView().getModel("createMetaDataModel");

						// 		if (!oMetaDataModel || !oMetaDataModel.getData() || oMetaDataModel.getData().length === 0) {
						// 			MessageToast.show("No metadata available. Please fetch query data first.");
						// 			return;
						// 		}

						// 		// Create value help dialog if it doesn't exist
						// 		if (!that._oCreateMetaDataValueHelpDialog) {
						// 			that._oCreateMetaDataValueHelpDialog = new SelectDialog({
						// 				title: "Select Field",
						// 				items: {
						// 					path: "createMetaDataModel>/",
						// 					template: new StandardListItem({
						// 						title: "{createMetaDataModel>SCRTEXT_L}",
						// 						description: "{createMetaDataModel>FIELDNAME}",
						// 						type: "Active"
						// 					})
						// 				},
						// 				confirm: function (oEvent) {
						// 					var oSelectedItem = oEvent.getParameter("selectedItem");
						// 					if (oSelectedItem) {
						// 						var sFieldName = oSelectedItem.getTitle();
						// 						oSource.setValue(sFieldName);
						// 					}
						// 				},
						// 				cancel: function () {
						// 					// Dialog closed without selection
						// 				}
						// 			});
						// 			that.getView().addDependent(that._oCreateMetaDataValueHelpDialog);
						// 		}

						// 		that._oCreateMetaDataValueHelpDialog.setModel(oMetaDataModel, "createMetaDataModel");
						// 		that._oCreateMetaDataValueHelpDialog.open();
						// 	}
						// });

						var oYLabel = new Label({
							text: "Select Measures"
						});

						var oYMultiInput = new MultiInput({
							width: "100%",
							showValueHelp: true,
							valueHelpRequest: function(oEvent) {
								var oSource = oEvent.getSource();
								var oMetaDataModel = that.getView().getModel("createMetaDataModel");

								if (!oMetaDataModel || !oMetaDataModel.getData() || oMetaDataModel.getData().length === 0) {
									MessageToast.show("No metadata available. Please fetch query data first.");
									return;
								}

								// Create value help dialog if it doesn't exist
								if (!that._oCreateYMetaDataValueHelpDialog) {
									that._oCreateYMetaDataValueHelpDialog = new SelectDialog({
										title: "Select Y Axis Fields",
										multiSelect: true,
										items: {
											path: "createMetaDataModel>/",
											template: new StandardListItem({
												title: "{createMetaDataModel>SCRTEXT_L}",
												description: "{createMetaDataModel>FIELDNAME}",
												type: "Active"
											})
										},
										confirm: function(oEvent) {
											var aSelectedItems = oEvent.getParameter("selectedItems");
											if (aSelectedItems && aSelectedItems.length > 0) {
												// Clear existing tokens
												oSource.removeAllTokens();
												
												// Add selected items as tokens
												aSelectedItems.forEach(function(oItem) {
													var sFieldName = oItem.getDescription(); // FIELDNAME is in description
													var sDisplayText = oItem.getTitle(); // SCRTEXT_L is in title
													var oToken = new Token({
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
									that.getView().addDependent(that._oCreateYMetaDataValueHelpDialog);
								}

								// Filter out the field already selected in X Axis
								var sSelectedXField = oXSelect.getSelectedKey();
								var aFilteredData = oMetaDataModel.getData().filter(function(oItem) {
									return oItem.FIELDNAME !== sSelectedXField;
								});
								
								// Create a filtered model
								var oFilteredModel = new JSONModel(aFilteredData);
								that._oCreateYMetaDataValueHelpDialog.setModel(oFilteredModel, "createMetaDataModel");
								that._oCreateYMetaDataValueHelpDialog.open();
							}
						});

						oForm.addContent(oXLabel);
						oForm.addContent(oXSelect);
						oForm.addContent(oYLabel);
						oForm.addContent(oYMultiInput);

						//Filter Form
						debugger;
						var oFilterForm = that.byId("createFilterMappingForm");
						oFilterForm.removeAllContent();

						// Add switch button to enable/disable filter
						var oFilterSwitchLabel = new Label({
							text: "Enable Filter"
						});

						var oFilterSwitch = new sap.m.Switch({
							state: false,
							change: function(oEvent) {
								var bState = oEvent.getParameter("state");
								
								// Remove existing filter fields
								var aContent = oFilterForm.getContent();
								for (var i = aContent.length - 1; i >= 0; i--) {
									if (aContent[i] !== oFilterSwitchLabel && aContent[i] !== oFilterSwitch) {
										oFilterForm.removeContent(aContent[i]);
									}
								}
								
								if (bState) {
									// Create filter fields when switch is enabled
									createFilterFields();
								}
							}
						});

						// Function to create filter fields
						var createFilterFields = function() {
							var oFilterLabel = new Label({
								text: "Select Filter Field"
							});

							var oFilterSelect = new sap.m.Select({
								width: "100%",
								showSecondaryValues: true
							});
							
							// Manually populate filter select items from metadata
							var oMetaDataModel = that.getView().getModel("createMetaDataModel");
							var aMetaData = oMetaDataModel.getData();
							aMetaData.forEach(function(item) {
								oFilterSelect.addItem(new sap.ui.core.ListItem({
									key: item.FIELDNAME,
									text: item.SCRTEXT_L,
									additionalText: item.FIELDNAME
								}));
							});

					
							
							var oFilterValueSelect = new sap.m.Select({
								width: "100%",
								showSecondaryValues: true
							});
							
							// Function to populate filter value select based on selected field
							var populateFilterValues = function(sFieldName) {
								oFilterValueSelect.destroyItems();
								
								// Get unique values from createJsonDataModel for the selected field
								var oJsonDataModel = that.getView().getModel("createJsonDataModel");
								if (oJsonDataModel) {
									var aJsonData = oJsonDataModel.getData();
									var aUniqueValues = [];
									
									aJsonData.forEach(function(item) {
										if (item[sFieldName] && aUniqueValues.indexOf(item[sFieldName]) === -1) {
											aUniqueValues.push(item[sFieldName]);
										}
									});
									
									// Add unique values to filter value select
									aUniqueValues.forEach(function(value) {
										oFilterValueSelect.addItem(new sap.ui.core.ListItem({
											key: value,
											text: value
										}));
									});
								}
							};
							
							// Add change event to filter select to populate filter value select
							oFilterSelect.attachChange(function(oEvent) {
								var sSelectedField = oEvent.getParameter("selectedItem").getKey();
								populateFilterValues(sSelectedField);
							});
							
							// Initially populate filter value select with first field's values
							if (aMetaData.length > 0) {
								populateFilterValues(aMetaData[0].FIELDNAME);
								oFilterSelect.setSelectedKey(aMetaData[0].FIELDNAME);
							}

							oFilterForm.addContent(oFilterLabel);
							oFilterForm.addContent(oFilterSelect);
							oFilterForm.addContent(oFilterValueSelect);
						};

						// Add switch components to form
						oFilterForm.addContent(oFilterSwitchLabel);
						oFilterForm.addContent(oFilterSwitch);

						// Tile Mapping Form - Dynamic based on Widget Type
						var oTileMappingForm = that.byId("createTileMappingForm");
						oTileMappingForm.removeAllContent();
						
						// Get selected widget type to determine number of fields
						var oWidgetValues = that.getView().getModel("createWidgetValues");
						var sSelectedWidgetType = oWidgetValues.getData().selectedWidgetType;
						var iNumberOfFields = 0; // Default to 1 field
						debugger;
						
						if (sSelectedWidgetType.includes("1")) { // 2 Value Widget
							iNumberOfFields = 1;
						} else if (sSelectedWidgetType.includes("2")) { // 3 Value Widget
							iNumberOfFields = 2;
						}
						else if (sSelectedWidgetType.includes("3")) { // 3 Value Widget
							iNumberOfFields = 3;
						}
						
						// Create dynamic fields based on widget type
						for (var k = 1; k <= iNumberOfFields; k++) {
							// Field Select Label
							var oFieldLabel = new Label({
								text: "Select Field " + k
							});
							
							// Field Select Control
							var oFieldSelect = new sap.m.Select({
								width: "100%",
								showSecondaryValues: true
							});
							
							// Manually populate field select items from metadata
							var oMetaDataModel = that.getView().getModel("createMetaDataModel");
							var aMetaData = oMetaDataModel.getData();
							aMetaData.forEach(function(item) {
								oFieldSelect.addItem(new sap.ui.core.ListItem({
									key: item.FIELDNAME,
									text: item.SCRTEXT_L,
									additionalText: item.FIELDNAME
								}));
							});
							
							// Display Text Label
							var oTextLabel = new Label({
								text: "Display Text " + k
							});
							
							// Display Text Input
							var oTextInput = new sap.m.Input({
								width: "100%",
								placeholder: "Enter display text for field " + k
							});
							
							// Add components to form
							oTileMappingForm.addContent(oFieldLabel);
							oTileMappingForm.addContent(oFieldSelect);
							oTileMappingForm.addContent(oTextLabel);
							oTileMappingForm.addContent(oTextInput);
						}

						// Data Binding Form




						// Handle existing mapping data if available
						var oModel = that.getView().getModel("createWidgetValues");
						var oCurrentData = oModel.getData();

						if (oCurrentData.mapping) {
							try {
								var mappingData = JSON.parse(oCurrentData.mapping);

								// Set X-axis selection
								if (mappingData.x && oXSelect) {
									oXSelect.setSelectedKey(mappingData.x);
								}

								// Set Y-axis selections
								if (mappingData.y && Array.isArray(mappingData.y) && oYMultiInput) {
									// Clear existing tokens
									oYMultiInput.removeAllTokens();
									
									// Add each field as a token
									for (var i = 0; i < mappingData.y.length; i++) {
										var sField = mappingData.y[i];
										// Find the corresponding description from metaDataModel
										var oMetaDataModel = that.getView().getModel("createMetaDataModel");
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
										
										var oToken = new Token({
											key: sField,
											text: sDisplayText
										});
										oYMultiInput.addToken(oToken);
									}
								}
							} catch (e) {
								console.error("Error parsing mapping data:", e);
							}
						}

						//Handle existing mapping for createFilterMappingForm form 
						// in oCurrentData there will be a filter field and contains data like this "Filter": "[{\"field\":\"0O2TFR0L0AE1J9CWDYXZ7RIW\",\"value\":\"Support Service\"}]",
						// map the data with the field in createFilterMappingForm
						if (oCurrentData.filter) {
							try {
								var filterData = JSON.parse(oCurrentData.filter);
								
								// Check if filter data exists and has entries
								if (filterData && Array.isArray(filterData) && filterData.length > 0) {
									// Enable the filter switch
									var oFilterSwitch = oFilterForm.getContent().find(function(control) {
										return control instanceof sap.m.Switch;
									});
									if (oFilterSwitch) {
										oFilterSwitch.setState(true);
										// Trigger the change event to create filter fields
										oFilterSwitch.fireChange({ state: true });
										
										// Set the field and value selections
										var firstFilter = filterData[0];
										if (firstFilter.field && firstFilter.value) {
											// Find the filter field select control
											var aFormContent = oFilterForm.getContent();
											var oFilterFieldSelect = null;
											var oFilterValueSelect = null;
											
											for (var i = 0; i < aFormContent.length; i++) {
												if (aFormContent[i] instanceof sap.m.Label && 
													aFormContent[i].getText() === "Select Filter Field") {
													oFilterFieldSelect = aFormContent[i + 1];
													oFilterValueSelect = aFormContent[i + 2];
													break;
												}
											}
											
											if (oFilterFieldSelect && oFilterValueSelect) {
												// Set the selected field
												oFilterFieldSelect.setSelectedKey(firstFilter.field);
												
												// Populate and set the filter value
												var populateAndSetFilterValue = function() {
													oFilterValueSelect.destroyItems();
													
													// Get unique values from createJsonDataModel for the selected field
													var oJsonDataModel = that.getView().getModel("createJsonDataModel");
													if (oJsonDataModel) {
														var aJsonData = oJsonDataModel.getData();
														var aUniqueValues = [];
														
														aJsonData.forEach(function(item) {
															if (item[firstFilter.field] && aUniqueValues.indexOf(item[firstFilter.field]) === -1) {
																aUniqueValues.push(item[firstFilter.field]);
															}
														});
														
														// Add unique values to filter value select
														aUniqueValues.forEach(function(value) {
															oFilterValueSelect.addItem(new sap.ui.core.ListItem({
																key: value,
																text: value
															}));
														});
														
														// Set the selected value
														oFilterValueSelect.setSelectedKey(firstFilter.value);
													}
												};
												
												populateAndSetFilterValue();
											}
										}
									}
								}
							} catch (e) {
								console.error("Error parsing filter data:", e);
							}
						}

						//Handle existing mapping for createTileMappingForm form 
						// in oCurrentData there will be a filter field and contains data like this "WlabelMapping": "[{\"field\":\"0O2TFR0L0AE1J9CWDYXZ7RIW\",\"label\":\"test1\"},{\"field\":\"0O2TFR0L0AE1J9CWDYXZ7RIW\",\"label\":\"test2\"}]",
						// map the data with the field in createTileMappingForm
						if (oCurrentData.wlabelMapping) {
							try {
								var tileMappingData = JSON.parse(oCurrentData.wlabelMapping);
								
								// Check if tile mapping data exists and has entries
								if (tileMappingData && Array.isArray(tileMappingData) && tileMappingData.length > 0) {
									// Get form content to access controls by position
									var aTileMappingContent = oTileMappingForm.getContent();
									
									// Map each tile mapping entry to the corresponding form fields
									for (var tileIndex = 0; tileIndex < tileMappingData.length && tileIndex < iNumberOfFields; tileIndex++) {
										var tileData = tileMappingData[tileIndex];
										
										if (tileData.field && tileData.label) {
											// Calculate the position of controls for this field
											// Form structure: Label, Select, Label, Input, Label, Select, Label, Input, ...
											// Each field has 4 controls: Field Label, Field Select, Text Label, Text Input
											var controlIndex = tileIndex * 4;
											var oTileFieldSelect = aTileMappingContent[controlIndex + 1]; // Field select is after field label
											var oTileTextInput = aTileMappingContent[controlIndex + 3]; // Text input is after text label
											
											if (oTileFieldSelect instanceof sap.m.Select && oTileTextInput instanceof sap.m.Input) {
												// Set the selected field
												oTileFieldSelect.setSelectedKey(tileData.field);
												
												// Set the display text
												oTileTextInput.setValue(tileData.label);
											}
										}
									}
								}
							} catch (e) {
								console.error("Error parsing tile mapping data:", e);
							}
						}


					}
				},
				error: function (oError) {
					if (oBusyIndicator) {
						oBusyIndicator.setVisible(false);
					}
					if (oIconTabBar) {
						oIconTabBar.setVisible(true);
					}
					
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
					console.error("Create Query output error:", oError);
				}
			});
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