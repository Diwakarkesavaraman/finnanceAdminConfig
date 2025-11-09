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
	"sap/m/StandardListItem",
	"sap/m/ComboBox",
	"sap/viz/ui5/controls/VizFrame",
	"sap/viz/ui5/data/FlattenedDataset",
	"sap/viz/ui5/controls/common/feeds/FeedItem"
], function (JSONModel, MessageBox, MessageToast, Filter, FilterOperator, Column, Text, ColumnListItem, Label, MultiInput, Token, SelectDialog, StandardListItem, ComboBox, VizFrame, FlattenedDataset, FeedItem) {
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

			var aCreateDataBindingTypes = await that.getSearchHelpData('Selection_type');
			var oCreateDataBindingTypeModel = new JSONModel(aCreateDataBindingTypes);
			that.getView().setModel(oCreateDataBindingTypeModel, "createDataBindingTypeDropdownData");

			var aCreateTimeFrameTypes = await that.getSearchHelpData('Time_frame');
			var oCreateTimeFrameTypeModel = new JSONModel(aCreateTimeFrameTypes);
			that.getView().setModel(oCreateTimeFrameTypeModel, "createTimeFrameTypeDropdownData");

			var aCreatePageTypes = await that.getSearchHelpData('Page_ID');
			var oCreatePageTypeModel = new JSONModel(aCreatePageTypes);
			that.getView().setModel(oCreatePageTypeModel, "createPageTypeDropdownData");

			var aCreateSystemTypes = await that.getSearchHelpData('System_Name');
			var oCreateSystemTypeModel = new JSONModel(aCreateSystemTypes);
			that.getView().setModel(oCreateSystemTypeModel, "createSystemTypeDropdownData");

			var aCreateDefaultPeriod = await that.getSearchHelpData('OPE_PERIOD');

			var aCreateDefaultHeirarchy = await that.getSearchHelpData('DEFAULT_HIER');

			


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
						oCurrentData.tooltip = oWidgetData.ToolTip;
						oCurrentData.selectionType = oWidgetData.SelectionType;
						oCurrentData.timeframe = oWidgetData.TimeFrame;
						oCurrentData.pageId = oWidgetData.ZpageId;
						oCurrentData.enableTimeRange = oWidgetData.TimeRange ==='X' ? true : false;	
						oCurrentData.dataSourceType = oWidgetData.SourceType;
						oCurrentData.isTimeDimension = oWidgetData.Istimedim === 'X' ? true : false;
						oCurrentData.systemName = oWidgetData.SystemName;					
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

		onCreateWidgetTypeChange: function (oController, oEvent) {
			console.log("Create Widget Type Changed");
			var that = oController;
			
			// Check if metadata is available (form has been created)
			var oMetaDataModel = that.getView().getModel("createMetaDataModel");
			if (oMetaDataModel && oMetaDataModel.getData() && oMetaDataModel.getData().length > 0) {
				// Recreate the tile mapping form with the new widget type
				this.createTileMappingForm(that);
			}

			// Update chart preview when widget type changes
			var oWidgetValues = that.getView().getModel("createWidgetValues");
			var sSelectedChartType = oWidgetValues.getData().selectedChartType;
			
			if (sSelectedChartType) {
				// Refresh the chart preview with the new widget type
				this._showChartPreview(oController, sSelectedChartType);
			}
		},

		onCreateChartTypeChange: function (oController, oEvent) {
			var sSelectedChartType = oEvent.getParameter("selectedItem").getKey();
			this._showChartPreview(oController, sSelectedChartType);
		},

		onCreateWidgetNameChange: function (oController, oEvent) {
			// Update chart preview when widget name changes
			var that = oController;
			
			// Get the current widget name from the input field
			var sNewWidgetName = oEvent.getSource().getValue();
			
			// Update the model with the new widget name
			var oWidgetValues = that.getView().getModel("createWidgetValues");
			oWidgetValues.setProperty("/widgetName", sNewWidgetName);
			
			var sSelectedChartType = oWidgetValues.getData().selectedChartType;
			
			if (sSelectedChartType) {
				// Refresh the chart preview with the new widget name
				this._showChartPreview(oController, sSelectedChartType);
			}
		},

		onCreateCheckQueryValidity: function (oController, oEvent) {
			debugger;
			var that = oController;
			var self = this;
			var finmobview = that.getView().getModel("finmobview");
			var dataSource = that.byId("createDataSourceId").getValue();
			var dataSourceType = that.byId("createDataSourceType").getSelectedKey();
			
			if (!dataSource) {
				MessageToast.show("Please enter a data source");
				return;
			}
			
			// Hide button and show busy indicator
			var oButton = that.byId("createCheckBtn");
			var oBusyIndicator = that.byId("createBusyIndicator");
			oButton.setVisible(false);
			oBusyIndicator.setVisible(true);
			
			var aFilters = [
				new Filter("Query_Name", FilterOperator.EQ, dataSource),
				new Filter("Source_Type" , FilterOperator.EQ, dataSourceType)
			];
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
			//Fetch mapping from createHierarchyMappingForm
			var hierarchyFormData = this.getCreateHierarchyFormValues(oController); 
			
			var oPayload = {
				"WidgetType": oWidgetData.selectedWidgetType,
				"WidgetName": oWidgetData.widgetName,
				"ChartType": oWidgetData.selectedChartType,
				"DataSource": oWidgetData.selectedDataSource,
				"WidgetId": oWidgetData.widgetId,
				"InputParameter": oWidgetData.inputParameter,
				"Mapping": mappingFormData.dataMapping ? JSON.stringify(mappingFormData.dataMapping) : "",
				"TimeFrame": hierarchyFormData.timeframe,
				"ToolTip": oWidgetData.tooltip,
				"ZpageId": JSON.stringify(hierarchyFormData.pageId),
				// "EnableTimeRange": hierarchyFormData.enableTimeRange || false,
				"WlabelMapping": JSON.stringify(tileMappingData.tileMapping),
				"SelectionType": tileMappingData.selectionType,
				"Filter": filterMappingData,
				"Status": "Draft",
				"SourceType": oWidgetData.dataSourceType || "",
				"Istimedim":mappingFormData.isTimeDimension ? 'X': '' || '',
				"TimeRange":hierarchyFormData.enableTimeRange ? 'X': '' || '',
				"SystemName":oWidgetData.systemName || "",
				"ChartLabel": JSON.stringify(mappingFormData.yLabels) || ""
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
			var oDataMapping = {};
			var aFields = [];
			var aYMeasures = [];
			var aYLabels = [];
			var sTimeframe = "";
			var bIsTimeDimension = false;
			// Loop through form content to get Label-Control pairs
			for (var i = 0; i < aFormContent.length; i++) {
				var oControl = aFormContent[i];

				// Check if it's a Label
				if (oControl instanceof sap.m.Label) {
					var sLabelText = oControl.getText();
					var oNextControl = aFormContent[i + 1]; // Get the next control after label

					if (oNextControl) {
						// Handle VBox container for Measures
						if (oNextControl instanceof sap.m.VBox && sLabelText === "Select Measures") {
							var aMeasureRows = oNextControl.getItems();
							aMeasureRows.forEach(function(oRow) {
								if (oRow instanceof sap.m.HBox) {
									var aRowItems = oRow.getItems();
									// First item is Measure Select, second is Label Input
									if (aRowItems.length >= 2) {
										var sMeasure = aRowItems[0] instanceof sap.m.Select ? aRowItems[0].getSelectedKey() : aRowItems[0].getValue();
										var sLabel = aRowItems[1].getValue();
										if (sMeasure) {
											aYMeasures.push(sMeasure);
											aYLabels.push(sLabel || "");
										}
									}
								}
							});
						}
						// Handle MultiInput controls first (before Input check since MultiInput extends Input)
						else if (oNextControl instanceof sap.m.MultiInput) {
							var aTokens = oNextControl.getTokens();
							var aTokenValues = aTokens.map(function(oToken) {
								return oToken.getKey();
							});
							// Check if it's the Timeframe field
							if (sLabelText === "Timeframe") {
								// Store timeframe as JSON array
								sTimeframe = aTokenValues.length > 0 ? JSON.stringify(aTokenValues) : "";
							} else {
								// Other MultiInput fields
								aFields.push(...aTokenValues);
							}
						}
						// Handle Select controls
						else if (oNextControl instanceof sap.m.Select) {
							// Check if it's the Timeframe field
							if (sLabelText === "Timeframe") {
								sTimeframe = oNextControl.getSelectedKey();
							} else {
								// Other select controls (X field)
								aFields.push(oNextControl.getSelectedKey());
							}
						}
					// Handle Input controls (but not MultiInput which was already handled)
					else if (oNextControl instanceof sap.m.Input) {
						// No specific input fields to handle in data mapping form now
					}


					}
				}// Handle CheckBox controls
				else if (oControl instanceof sap.m.CheckBox) {
					// This is the Time/Period Dimension checkbox
					bIsTimeDimension = oControl.getSelected();
				}
			}


			oDataMapping['x'] = aFields[0];
			oDataMapping['y'] = aYMeasures.length > 0 ? aYMeasures : aFields.slice(1);
			if (aYLabels.length > 0) {
				oDataMapping['yLabel'] = aYLabels;
			}
			oformValues['dataMapping'] = oDataMapping;
			oformValues['timeframe'] = sTimeframe;
			oformValues['isTimeDimension'] = bIsTimeDimension;
			oformValues['yLabels'] = aYLabels;
			return (oformValues);
		},

		getCreateHierarchyFormValues: function (oController) {
			var that = oController;
			var oHierarchyForm = that.getView().byId("createHierarchyMappingForm");
			var aHierarchyFormContent = oHierarchyForm.getContent();
			var oHierarchyValues = {};
			var aPageIds = [];
		var bEnableTimeRange = false;
		var sTimeframe = "";
			
		// Loop through hierarchy form content to get Page ID from table
		for (var j = 0; j < aHierarchyFormContent.length; j++) {
			var oHierarchyControl = aHierarchyFormContent[j];
			
			// Handle CheckBox controls for Enable Time Range
			if (oHierarchyControl instanceof sap.m.CheckBox) {
				bEnableTimeRange = oHierarchyControl.getSelected();
			}
			
			// Handle Table controls for Page ID
			if (oHierarchyControl instanceof sap.m.Table) {
				var oPageIdTableModel = that.getView().getModel("createPageIdTableModel");
				if (oPageIdTableModel) {
					var aTableData = oPageIdTableModel.getData();
					aPageIds = aTableData.map(function(oItem) {
						return oItem.Id;
					});
			
			// // Handle Select controls for Timeframe
			// if (oHierarchyControl instanceof sap.m.Select) {
			// 	if (oHierarchyControl.getParent() instanceof sap.m.VBox) {
			// 		// Check if it's the Timeframe select by looking at the previous control
			// 		var iPrevIndex = j - 1;
			// 		if (iPrevIndex >= 0 && aHierarchyFormContent[iPrevIndex] instanceof sap.m.Label) {
			// 			var sLabelText = aHierarchyFormContent[iPrevIndex].getText();
			// 			if (sLabelText === "Timeframe") {
			// 				sTimeframe = oHierarchyControl.getSelectedKey();
			// 			}
			// 		}
			// 	}
			// }

			
				}
			}
		// Handle MultiInput controls for Timeframe
		if (oHierarchyControl instanceof sap.m.MultiInput) {
			// Check if it's the Timeframe MultiInput by looking at the previous control
			var iPrevIndex = j - 1;
			if (iPrevIndex >= 0 && aHierarchyFormContent[iPrevIndex] instanceof sap.m.Label) {
				var sLabelText = aHierarchyFormContent[iPrevIndex].getText();
				if (sLabelText === "Timeframe") {
					var aTokens = oHierarchyControl.getTokens();
					var aTimeframeValues = aTokens.map(function(oToken) {
						return oToken.getKey();
					});
					// Store timeframe as JSON array
					sTimeframe = aTimeframeValues.length > 0 ? JSON.stringify(aTimeframeValues) : "";
				}
			}
		}
		}
			
			oHierarchyValues['pageId'] = aPageIds;
			oHierarchyValues['enableTimeRange'] = bEnableTimeRange;			
			oHierarchyValues['timeframe'] = sTimeframe;			return oHierarchyValues;
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
				// Loop through form content to find filter containers
				for (var i = 0; i < aFormContent.length; i++) {
					var oControl = aFormContent[i];

					// Check if it's a VBox container (filter field container)
					if (oControl instanceof sap.m.VBox && oControl.getItems && oControl.getItems().length > 0) {
						var oHBox = oControl.getItems()[0];
						if (oHBox instanceof sap.m.HBox) {
							var oVBoxWithFields = oHBox.getItems()[0];
							if (oVBoxWithFields instanceof sap.m.VBox) {
								var aFieldItems = oVBoxWithFields.getItems();
								
								// Find the Select and ComboBox controls
								var oFilterFieldSelect = null;
								var oFilterValueSelect = null;
								
								for (var k = 0; k < aFieldItems.length; k++) {
									if (aFieldItems[k] instanceof sap.m.Select) {
										oFilterFieldSelect = aFieldItems[k];
									} else if (aFieldItems[k] instanceof sap.m.ComboBox) {
										oFilterValueSelect = aFieldItems[k];
									}
								}
								
								if (oFilterFieldSelect && oFilterValueSelect) {
									var sSelectedField = oFilterFieldSelect.getSelectedKey();
									var sSelectedValue = oFilterValueSelect.getValue();

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
			
			if (sSelectedWidgetType.includes("1")) { // 1 Value Widget
				iNumberOfFields = 1;
			}else if (sSelectedWidgetType.includes("2")) { // 2 Value Widget
				iNumberOfFields = 2;
			} 
			else if (sSelectedWidgetType.includes("3")) { // 3 Value Widget
				iNumberOfFields = 3;
			}

			// Get form content and iterate through it to find field pairs
			var aFormContent = oForm.getContent();
			
			// Get selection type from the second control in the form (first is label, second is select)
			var sSelectionType = "";
			if (aFormContent.length > 1 && aFormContent[1] instanceof sap.m.Select) {
				sSelectionType = aFormContent[1].getSelectedKey();
			}
			

		// New form structure: Selection Type Label, Selection Type Select, then VBox containers (one per field)
		// Each VBox contains: Field Label, Field Select, HBox1 (with 3 VBoxes for Display Text, Unit, Color), HBox2 (with 3 VBoxes for Scale, Decimals, Suffix)
		// Skip the first two controls (Selection Type Label and Select) and start from index 2
			for (var i = 2; i < aFormContent.length && i < (2 + iNumberOfFields); i++) {
				var oFieldBox = aFormContent[i]; // Get the VBox for this field

				if (oFieldBox instanceof sap.m.VBox) {
				var aFieldBoxItems = oFieldBox.getItems();
				// aFieldBoxItems[0] = Field Label
				// aFieldBoxItems[1] = Field Select
				// aFieldBoxItems[2] = HBox1 containing the first 3 fields
				// aFieldBoxItems[3] = HBox2 containing the second 3 fields

				var oFieldSelect = aFieldBoxItems[1];
				var oHBox1 = aFieldBoxItems[2];
				var oHBox2 = aFieldBoxItems[3];

				if (oFieldSelect instanceof sap.m.Select && oHBox1 instanceof sap.m.HBox && oHBox2 instanceof sap.m.HBox) {
					var sSelectedField = oFieldSelect.getSelectedKey();

					// Get the three VBoxes from HBox1
					var aHBox1Items = oHBox1.getItems();
					var oTextVBox = aHBox1Items[0]; // Display Text VBox
					var oUnitVBox = aHBox1Items[1]; // Unit VBox
					var oColorVBox = aHBox1Items[2]; // Color VBox

					// Get the three VBoxes from HBox2
					var aHBox2Items = oHBox2.getItems();
					var oScaleVBox = aHBox2Items[0]; // Scale VBox
					var oDecimalsVBox = aHBox2Items[1]; // Decimals VBox
					var oSuffixVBox = aHBox2Items[2]; // Suffix VBox

					// Extract input values from each VBox (items[1] is the Input control)
					var sDisplayText = "";
					var sUnit = "";
					var sColor = "";
					var sScale = "";
					var sDecimals = "";
					var sSuffix = "";

					if (oTextVBox && oTextVBox instanceof sap.m.VBox) {
						var oTextInput = oTextVBox.getItems()[1];
						if (oTextInput instanceof sap.m.Input) {
							sDisplayText = oTextInput.getValue();
						}
					}

					if (oUnitVBox && oUnitVBox instanceof sap.m.VBox) {
						var oUnitInput = oUnitVBox.getItems()[1];
						if (oUnitInput instanceof sap.m.Input) {
							sUnit = oUnitInput.getValue();
						}
					}

					if (oColorVBox && oColorVBox instanceof sap.m.VBox) {
						var oColorInput = oColorVBox.getItems()[1];
						if (oColorInput instanceof sap.m.Input) {
							sColor = oColorInput.getValue();
						}
					}

					if (oScaleVBox && oScaleVBox instanceof sap.m.VBox) {
						var oScaleSelect = oScaleVBox.getItems()[1];
						if (oScaleSelect instanceof sap.m.Select) {
							sScale = oScaleSelect.getSelectedKey();
						}
					}

					if (oDecimalsVBox && oDecimalsVBox instanceof sap.m.VBox) {
						var oDecimalsSelect = oDecimalsVBox.getItems()[1];
						if (oDecimalsSelect instanceof sap.m.Select) {
							sDecimals = oDecimalsSelect.getSelectedKey();
						}
					}

					if (oSuffixVBox && oSuffixVBox instanceof sap.m.VBox) {
						var oSuffixInput = oSuffixVBox.getItems()[1];
						if (oSuffixInput instanceof sap.m.Input) {
							sSuffix = oSuffixInput.getValue();
						}
					}

					if (sSelectedField) {
						aTileValues.push({
							field: sSelectedField,
							label: sDisplayText,
							// label: sDisplayText || sSelectedField, // Use field name as default if no display text
							unit: sUnit || "",
							color: sColor || "",
							scale: sScale || "",
							decimals: sDecimals || "",
							suffix: sSuffix || ""
						});
					}
				}
				}
			}

			// Return new structure with selectionType at top level and tileMapping array
			var oTileMappingResult = {
				selectionType: sSelectionType,
				tileMapping: aTileValues
			};

			return oTileMappingResult;
		},

		createTileMappingForm: function (oController) {
			var that = oController;
			
			// Tile Mapping Form - Dynamic based on Widget Type
			var oTileMappingForm = that.byId("createTileMappingForm");
			oTileMappingForm.removeAllContent();
			
			// Get selected widget type to determine number of fields
			var oWidgetValues = that.getView().getModel("createWidgetValues");
			var sSelectedWidgetType = oWidgetValues.getData().selectedWidgetType;
			var iNumberOfFields = 0; // Default to 1 field
			
			if (sSelectedWidgetType.includes("1")) { // 1 Value Widget
				iNumberOfFields = 1;
			} else if (sSelectedWidgetType.includes("2")) { // 2 Value Widget
				iNumberOfFields = 2;
			} else if (sSelectedWidgetType.includes("3")) { // 3 Value Widget
				iNumberOfFields = 3;
			}

			// Add Selection Type Label and Select
			var oSelectionTypeLabel = new Label({
				text: "Selection Type"
			});
			
			var oFieldTileMappingTypeSelect = new sap.m.Select({
				width: "100%",
				showSecondaryValues: true
			});

			var oTitleBindingModel = that.getView().getModel("createDataBindingTypeDropdownData");
			var aTileBindingData = oTitleBindingModel.getData();
			aTileBindingData.forEach(function(item) {
				oFieldTileMappingTypeSelect.addItem(new sap.ui.core.ListItem({
					key: item.Id,
					text: item.Text,
					additionalText: item.Id
				}));
			});
			
			oTileMappingForm.addContent(oSelectionTypeLabel);
			oTileMappingForm.addContent(oFieldTileMappingTypeSelect);
			
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
				

				// Create VBox for Display Text (Label + Input stacked vertically)
				var oTextVBox = new sap.m.VBox({
					width: "33.33%",
					items: [
						new Label({
							text: "Display Text " + k
						}),
						new sap.m.Input({
							width: "95%",
							placeholder: "Enter display text for field " + k
						})
					]
				});

				// Create VBox for Unit (Label + Input stacked vertically)
				var oUnitVBox = new sap.m.VBox({
					width: "33.33%",
					items: [
						new Label({
							text: "Unit " + k
						}),
						new sap.m.Input({
							width: "95%",
							placeholder: "Enter unit for field " + k
						})
					]
				});

				// add two more fields called scale, decimals and suffix

				// Create VBox for Color (Label + Input stacked vertically)
				var oColorVBox = new sap.m.VBox({
					width: "33.33%",
					items: [
						new Label({
							text: "Color " + k
						}),
						new sap.m.Input({
							width: "95%",
							placeholder: "Enter color for field " + k,
							type: "Text"
						})
					]
				});

				// Create VBox for Scale (Label + Select stacked vertically)
				var oScaleSelect = new sap.m.Select({
					width: "95%",
					items: [
						new sap.ui.core.Item({
							key: "noScaling",
							text: "No Scaling"
						}),
						new sap.ui.core.Item({
							key: "billion",
							text: "in Billion (B)"
						}),
						new sap.ui.core.Item({
							key: "million",
							text: "in Million (M)"
						}),
						new sap.ui.core.Item({
							key: "thousand",
							text: "in Thousand (K)"
						})
					]
				});

				var oScaleVBox = new sap.m.VBox({
					width: "33.33%",
					items: [
						new Label({
							text: "Scale " + k
						}),
						oScaleSelect
					]
				});

				// Create VBox for Decimals (Label + Select stacked vertically)
				var oDecimalsSelect = new sap.m.Select({
					width: "95%",
					items: [
						new sap.ui.core.Item({
							key: "d0",
							text: "0 decimals"
						}),
						new sap.ui.core.Item({
							key: "d1",
							text: "1 decimals"
						}),
						new sap.ui.core.Item({
							key: "d2",
							text: "2 decimals"
						}),
						new sap.ui.core.Item({
							key: "d3",
							text: "3 decimals"
						})
					]
				});

				var oDecimalsVBox = new sap.m.VBox({
					width: "33.33%",
					items: [
						new Label({
							text: "Decimals " + k
						}),
						oDecimalsSelect
					]
				});

				// Create VBox for Suffix (Label + Input stacked vertically)
				var oSuffixVBox = new sap.m.VBox({
					width: "33.33%",
					items: [
						new Label({
							text: "Suffix " + k
						}),
						new sap.m.Input({
							width: "95%",
							placeholder: "Enter suffix for field " + k,
							type: "Text"
						})
					]
				});

				// Create HBox to arrange the first three fields horizontally
				var oHBoxFields1 = new sap.m.HBox({
					width: "100%",
					items: [oTextVBox, oUnitVBox, oColorVBox]
				});

				// Create HBox to arrange the second three fields horizontally
				var oHBoxFields2 = new sap.m.HBox({
					width: "100%",
					items: [oScaleVBox, oDecimalsVBox, oSuffixVBox]
				});

				// Wrap everything in a VBox for this field
				var oFieldBox = new sap.m.VBox({
					width: "100%",
					items: [oFieldLabel, oFieldSelect, oHBoxFields1, oHBoxFields2],
					class: "sapUiSmallMarginBottom"
				});

				// Add the field box to form
				oTileMappingForm.addContent(oFieldBox);
			}
			
			return iNumberOfFields;
		},

		fetchQueryOutput: function (oController, aFilterParams) {
			debugger;
			var that = oController;
			var self = this;
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
			var sSourceType = that.getView().byId("createDataSourceType").getSelectedKey();
			var aFilters = [
				new Filter("DatasourceName", FilterOperator.EQ, sDataSource),
				new Filter("InputParameter", FilterOperator.EQ, JSON.stringify(aFilterParams)),
				new Filter("SourceType",FilterOperator.EQ, sSourceType)
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

					// Checkbox for Time/Period Dimension
					var oTimeDimensionCheckBox = new sap.m.CheckBox({
						text: "Is Time/Period Dimension",
						select: function(oEvent) {
							var bSelected = oEvent.getParameter("selected");
							// Toggle Timeframe field visibility
							oTimeframeLabel.setVisible(bSelected);
							oTimeframeSelect.setVisible(bSelected);
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

						// Create a VBox container for measures
						var oMeasuresContainer = new sap.m.VBox({
							width: "100%"
						});

						// Function to add a new measure row
						var fnAddMeasureRow = function(sMeasureValue, sLabelValue) {
							var oMetaDataModel = that.getView().getModel("createMetaDataModel");

							var oMeasureHBox = new sap.m.HBox({
								alignItems: "Center",
								width: "100%"
							}).addStyleClass("sapUiSmallMarginBottom");

							// Measure Select Control
							var oMeasureSelect = new sap.m.Select({
								width: "100%",
								forceSelection: false,
								selectedKey: sMeasureValue || "",
								layoutData: new sap.m.FlexItemData({
									growFactor: 1,
									baseSize: "0%"
								})
							}).addStyleClass("sapUiTinyMarginEnd");

							// Populate the Select control with metadata
							if (oMetaDataModel && oMetaDataModel.getData() && oMetaDataModel.getData().length > 0) {
								// Filter out the field already selected in X Axis
								var sSelectedXField = oXSelect.getSelectedKey();
								var aFilteredData = oMetaDataModel.getData().filter(function(oItem) {
									return oItem.FIELDNAME !== sSelectedXField;
								});

								// Add items to select
								aFilteredData.forEach(function(oItem) {
									oMeasureSelect.addItem(new sap.ui.core.Item({
										key: oItem.FIELDNAME,
										text: oItem.SCRTEXT_L || oItem.FIELDNAME
									}));
								});

								// Set selected key if provided
								if (sMeasureValue) {
									oMeasureSelect.setSelectedKey(sMeasureValue);
								}
							}

							// Label Input
							var oLabelInput = new sap.m.Input({
								width: "100%",
								placeholder: "Enter Label",
								value: sLabelValue || "",
								layoutData: new sap.m.FlexItemData({
									growFactor: 1,
									baseSize: "0%"
								})
							}).addStyleClass("sapUiTinyMarginEnd");

							// Delete Button
							var oDeleteButton = new sap.m.Button({
								icon: "sap-icon://delete",
								type: "Reject",
								press: function() {
									oMeasuresContainer.removeItem(oMeasureHBox);
									oMeasureHBox.destroy();
								}
							});

							oMeasureHBox.addItem(oMeasureSelect);
							oMeasureHBox.addItem(oLabelInput);
							oMeasureHBox.addItem(oDeleteButton);

							oMeasuresContainer.addItem(oMeasureHBox);
						};

						// Add Button
						var oAddMeasureButton = new sap.m.Button({
							text: "Add Measure",
							icon: "sap-icon://add",
							type: "Emphasized",
							press: function() {
								fnAddMeasureRow("", "");
							}
						}).addStyleClass("sapUiSmallMarginTop");

						// Add initial row
						fnAddMeasureRow("", "");

						//Add two more fields called timeframe and Page id. the timeframe field is Select control with options fetched from await that.getSearchHelpData('time_frame'); and Page id is Input field



						oForm.addContent(oXLabel);
						oForm.addContent(oXSelect);
						oForm.addContent(oTimeDimensionCheckBox);
						oForm.addContent(oYLabel);
						oForm.addContent(oMeasuresContainer);
						oForm.addContent(oAddMeasureButton);

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
							// Add initial filter field
							addFilterField();
							
							// Add button to add more filter fields
							var oAddFilterButton = new sap.m.Button({
								text: "Add Filter",
								icon: "sap-icon://add",
								press: function() {
									addFilterField();
								}
							});
							
							oFilterForm.addContent(oAddFilterButton);
						};
						
						// Function to add a single filter field
						var addFilterField = function() {
							var oMetaDataModel = that.getView().getModel("createMetaDataModel");
							var aMetaData = oMetaDataModel.getData();
							
							// Create a container for this filter field set
							var oFilterContainer = new sap.m.VBox();
							oFilterContainer.addStyleClass("sapUiMediumMarginBottom");
							
							var oFilterLabel = new Label({
								text: "Select Filter Field"
							});

							var oFilterSelect = new sap.m.Select({
								width: "100%",
								showSecondaryValues: true
							});
							
							// Manually populate filter select items from metadata
							aMetaData.forEach(function(item) {
								if (!item.FIELDNAME.startsWith("VALUE")) {
									oFilterSelect.addItem(new sap.ui.core.ListItem({
										key: item.FIELDNAME,
										text: item.SCRTEXT_L,
										additionalText: item.FIELDNAME
									}));
								}
							});

							var oFilterValueLabel = new Label({
								text: "Filter Value"
							});
							
							var oFilterValueSelect = new sap.m.ComboBox({
								width: "100%",
								showSecondaryValues: true,
								placeholder: "Select or enter value"
							});
							
							// Create remove button for this filter field
							var oRemoveButton = new sap.m.Button({
								text: "Remove",
								icon: "sap-icon://delete",
								type: "Transparent",
								press: function() {
									oFilterForm.removeContent(oFilterContainer);
								}
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

							// Create horizontal box for field and remove button
							var oFieldHBox = new sap.m.HBox({
								alignItems: "End",
								items: [
									new sap.m.VBox({
										width: "100%",
										items: [oFilterLabel, oFilterSelect, oFilterValueLabel, oFilterValueSelect]
									}),
									oRemoveButton
								]
							});
							
							oFilterContainer.addItem(oFieldHBox);
							
							// Add the container to the form (before the Add Filter button if it exists)
							var aFormContent = oFilterForm.getContent();
							var iInsertIndex = aFormContent.length;
							
							// Find the Add Filter button and insert before it
							for (var i = 0; i < aFormContent.length; i++) {
								if (aFormContent[i] instanceof sap.m.Button && aFormContent[i].getText() === "Add Filter") {
									iInsertIndex = i;
									break;
								}
							}
							
							oFilterForm.insertContent(oFilterContainer, iInsertIndex);
						};

						// Add switch components to form
						oFilterForm.addContent(oFilterSwitchLabel);
						oFilterForm.addContent(oFilterSwitch);

						// Create Tile Mapping Form
						var iNumberOfFields = self.createTileMappingForm(that);

						// Create Hierarchy Mapping Form
						var oHierarchyForm = that.byId("createHierarchyMappingForm");
						oHierarchyForm.removeAllContent();
						
// Enable Time Range field
					var oEnableTimeRangeCheckBox = new sap.m.CheckBox({
						text: "Enable Time Range",
						selected: false,
						select: function(oEvent) {
							var bSelected = oEvent.getParameter("selected");
							// Toggle Timeframe field visibility
							if (oTimeframeLabel) {
								oTimeframeLabel.setVisible(bSelected);
							}
							if (oTimeframeSelect) {
								oTimeframeSelect.setVisible(bSelected);
							}
						}
					});

					// Timeframe field (moved from createDataMappingForm)
					var oTimeframeLabel = new sap.m.Label({
						text: "Timeframe",
						required: false,
						visible: false
					});

					var oTimeframeSelect = new sap.m.MultiInput({
						visible: false,
						width: "100%",
						valueHelpRequest: function(oEvent) {
							var oMultiInput = oEvent.getSource();
							var oModel = that.getView().getModel("createTimeFrameTypeDropdownData");
							var aData = oModel.getData();

							// Get existing tokens to pre-select in dialog
							var aExistingTokenKeys = oMultiInput.getTokens().map(function(oToken) {
								return oToken.getKey();
							});

							// Create SelectDialog
							var oSelectDialog = new sap.m.SelectDialog({
								title: "Select Timeframes",
								multiSelect: true,
								items: aData.map(function(oItem) {
									return new sap.m.StandardListItem({
										title: oItem.Text,
										description: oItem.Text,
										selected: aExistingTokenKeys.indexOf(oItem.Id) !== -1,
										customData: [new sap.ui.core.CustomData({
											key: "itemKey",
											value: oItem.Id
										})]
									});
								}),
								confirm: function(oConfirmEvent) {
									// Clear existing tokens
									oMultiInput.removeAllTokens();

									// Add selected items as tokens
									var aSelectedItems = oConfirmEvent.getParameter("selectedItems");
									aSelectedItems.forEach(function(oItem) {
										var sKey = oItem.getCustomData()[0].getValue();
										var sText = oItem.getTitle();
										oMultiInput.addToken(new sap.m.Token({
											key: sKey,
											text: sText
										}));
									});
								},
								cancel: function() {
									oSelectDialog.destroy();
								}
							});

							oSelectDialog.open();
						}
					});

					
						// Page ID field
						var oPageIdLabel = new sap.m.Label({
							text: "Page ID",
							required: false,
							visible: true
						});

					// Create a JSON model for Page ID table data
					var oPageIdTableModel = new sap.ui.model.json.JSONModel([]);
					that.getView().setModel(oPageIdTableModel, "createPageIdTableModel");

					// Add Page ID button
					var oAddPageIdButton = new sap.m.Button({
						text: "Add Page ID",
						icon: "sap-icon://add",
						press: function() {
							// Create value help dialog for Page ID
							if (!that._oCreatePageIdValueHelpDialog) {
								that._oCreatePageIdValueHelpDialog = new sap.m.SelectDialog({
									title: "Select Page ID",
									multiSelect: true,
									items: {
										path: "createPageTypeDropdownData>/",
										template: new sap.m.StandardListItem({
											title: "{createPageTypeDropdownData>Text}",
											description: "{createPageTypeDropdownData>Id}"
										})
									},
									confirm: function(oEvent) {
										var aSelectedContexts = oEvent.getParameter("selectedContexts");
										if (aSelectedContexts && aSelectedContexts.length) {
											var aCurrentData = oPageIdTableModel.getData();
											aSelectedContexts.forEach(function(oContext) {
												var oData = oContext.getObject();
												// Check if already exists
												var bExists = aCurrentData.some(function(item) {
													return item.Id === oData.Id;
												});
												if (!bExists) {
													aCurrentData.push({
														Id: oData.Id,
														Text: oData.Text
													});
												}
											});
											oPageIdTableModel.setData(aCurrentData);
										}
									},
									search: function(oEvent) {
										var sValue = oEvent.getParameter("value");
										var oFilter = new sap.ui.model.Filter("Text", sap.ui.model.FilterOperator.Contains, sValue);
										var oBinding = oEvent.getSource().getBinding("items");
										oBinding.filter([oFilter]);
									}
								});
								that.getView().addDependent(that._oCreatePageIdValueHelpDialog);
							}
							
							// Set the model and open dialog
							var oPageTypeModel = that.getView().getModel("createPageTypeDropdownData");
							if (oPageTypeModel && oPageTypeModel.getData()) {
								that._oCreatePageIdValueHelpDialog.setModel(oPageTypeModel, "createPageTypeDropdownData");
								that._oCreatePageIdValueHelpDialog.open();
							}
						}
					});

					// Page ID Table with drag and drop
					var oPageIdTable = new sap.m.Table({
						mode: sap.m.ListMode.Delete,
						delete: function(oEvent) {
							var oItem = oEvent.getParameter("listItem");
							var oContext = oItem.getBindingContext("createPageIdTableModel");
							var iIndex = oContext.getPath().split("/")[1];
							var aData = oPageIdTableModel.getData();
							aData.splice(iIndex, 1);
							oPageIdTableModel.setData(aData);
						},
						columns: [
							new sap.m.Column({
								width: "3em",
								header: new sap.m.Text({ text: "" })
							}),
							new sap.m.Column({
								header: new sap.m.Text({ text: "Page ID" })
							}),
							new sap.m.Column({
								header: new sap.m.Text({ text: "Description" })
							})
						],
						items: {
							path: "createPageIdTableModel>/",
							template: new sap.m.ColumnListItem({
								cells: [
									new sap.ui.core.Icon({
										src: "sap-icon://resize-vertical",
										color: "#0854a0"
									}),
									new sap.m.Text({ text: "{createPageIdTableModel>Id}" }),
									new sap.m.Text({ text: "{createPageIdTableModel>Text}" })
								]
							})
						},
						dragDropConfig: [
							new sap.ui.core.dnd.DragInfo({
								sourceAggregation: "items"
							}),
							new sap.ui.core.dnd.DropInfo({
								targetAggregation: "items",
								dropPosition: "Between",
								drop: function(oEvent) {
									var oDraggedItem = oEvent.getParameter("draggedControl");
									var oDroppedItem = oEvent.getParameter("droppedControl");
									var sDropPosition = oEvent.getParameter("dropPosition");
									
									var oDraggedContext = oDraggedItem.getBindingContext("createPageIdTableModel");
									var oDroppedContext = oDroppedItem ? oDroppedItem.getBindingContext("createPageIdTableModel") : null;
									
									if (!oDraggedContext) {
										return;
									}
									
									var iDraggedIndex = parseInt(oDraggedContext.getPath().split("/")[1]);
									var aData = oPageIdTableModel.getData();
									var oDraggedData = aData[iDraggedIndex];
									
									// Remove from old position
									aData.splice(iDraggedIndex, 1);
									
									// Calculate new position
									var iNewIndex;
									if (oDroppedContext) {
										iNewIndex = parseInt(oDroppedContext.getPath().split("/")[1]);
										if (iDraggedIndex < iNewIndex) {
											iNewIndex--;
										}
										if (sDropPosition === "After") {
											iNewIndex++;
										}
									} else {
										iNewIndex = aData.length;
									}
									
									// Insert at new position
									aData.splice(iNewIndex, 0, oDraggedData);
									oPageIdTableModel.setData(aData);
								}
							})
						]
					});

						oHierarchyForm.addContent(oEnableTimeRangeCheckBox);
						oHierarchyForm.addContent(oTimeframeLabel);
						oHierarchyForm.addContent(oTimeframeSelect);						oHierarchyForm.addContent(oPageIdLabel);
						oHierarchyForm.addContent(oAddPageIdButton);
						oHierarchyForm.addContent(oPageIdTable);

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

								// Set Y-axis selections (Measures)
								if (mappingData.y && Array.isArray(mappingData.y) && oMeasuresContainer) {
									// Clear existing measure rows
									oMeasuresContainer.removeAllItems();

									// Get yLabel array if exists
									var aYLabels = mappingData.yLabel || [];

									// Add each measure with its label
									for (var i = 0; i < mappingData.y.length; i++) {
										var sMeasure = mappingData.y[i];
										var sLabel = aYLabels[i] || "";
										fnAddMeasureRow(sMeasure, sLabel);
									}

									// If no measures were loaded, add an empty row
									if (mappingData.y.length === 0) {
										fnAddMeasureRow("", "");
									}
								}
							} catch (e) {
								console.error("Error parsing mapping data:", e);
							}
						}
						
						// Handle isTimeDimension checkbox
						if (oTimeDimensionCheckBox) {
							var bIsTimeDimension = oCurrentData.isTimeDimension || false;
							oTimeDimensionCheckBox.setSelected(bIsTimeDimension);
							// Set visibility of Timeframe fields based on checkbox state
							if (oTimeframeLabel) {
								oTimeframeLabel.setVisible(bIsTimeDimension);
							}
							if (oTimeframeSelect) {
								oTimeframeSelect.setVisible(bIsTimeDimension);
							}
						}
						
						// Handle Page ID mapping  
						debugger;
						if (oCurrentData.pageId) {
							// Parse pageId if it's a string (JSON array)
							var aPageIds = oCurrentData.pageId;
							if (typeof oCurrentData.pageId === 'string') {
								try {
									aPageIds = JSON.parse(oCurrentData.pageId);
								} catch (e) {
									console.error("Error parsing pageId:", e);
									aPageIds = [];
								}
							}
							
						if (Array.isArray(aPageIds)) {
							try {
								// Get the Page ID table model
								var oPageIdTableModel = that.getView().getModel("createPageIdTableModel");
								if (oPageIdTableModel) {
									var aTableData = [];
									
									// Populate table data for each page ID
									aPageIds.forEach(function(sPageId) {
										if (sPageId) {
											// Find the corresponding text from createPageTypeDropdownData
											var oPageTypeModel = that.getView().getModel("createPageTypeDropdownData");
											var sDisplayText = sPageId; // Default to page ID
											
											if (oPageTypeModel && oPageTypeModel.getData()) {
												var aPageTypeData = oPageTypeModel.getData();
												var oPageType = aPageTypeData.find(function(oItem) {
													return oItem.Id === sPageId;
												});
												if (oPageType && oPageType.Text) {
													sDisplayText = oPageType.Text;
												}
											}
											
											aTableData.push({
												Id: sPageId,
												Text: sDisplayText
											});
										}
									});
									
									oPageIdTableModel.setData(aTableData);
								}
							} catch (e) {
								console.log("Could not populate Page ID table:", e);
							}
						}
						}
						
						// Handle Enable Time Range checkbox
			
						
						// Handle Timeframe restoration and visibility
						if (oEnableTimeRangeCheckBox) {
							var bEnableTimeRange = oCurrentData.enableTimeRange || false;
							oEnableTimeRangeCheckBox.setSelected(bEnableTimeRange);
							
							// Restore Timeframe value and set visibility based on checkbox
							if (oTimeframeSelect && oCurrentData.timeframe) {
								// Clear any existing tokens first
								oTimeframeSelect.removeAllTokens();

								// Parse timeframe data (could be JSON array or single value)
								var aTimeframeValues = [];
								try {
									// Try to parse as JSON array
									aTimeframeValues = JSON.parse(oCurrentData.timeframe);
									if (!Array.isArray(aTimeframeValues)) {
										aTimeframeValues = [oCurrentData.timeframe];
									}
								} catch (e) {
									// If not JSON, treat as single value
									aTimeframeValues = [oCurrentData.timeframe];
								}

								// Add tokens for each timeframe value
								var oTimeframeModel = that.getView().getModel("createTimeFrameTypeDropdownData");
								if (oTimeframeModel && oTimeframeModel.getData()) {
									var aTimeframeData = oTimeframeModel.getData();
									aTimeframeValues.forEach(function(sTimeframeId) {
										// Find the text for this timeframe ID
										var oTimeframeItem = aTimeframeData.find(function(oItem) {
											return oItem.Id === sTimeframeId;
										});
										if (oTimeframeItem) {
											oTimeframeSelect.addToken(new sap.m.Token({
												key: sTimeframeId,
												text: oTimeframeItem.Text
											}));
										}
									});
								}
							}
							if (oTimeframeLabel) {
								oTimeframeLabel.setVisible(bEnableTimeRange);
							}
							if (oTimeframeSelect) {
								oTimeframeSelect.setVisible(bEnableTimeRange);
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
										// Trigger the change event to create initial filter field
										oFilterSwitch.fireChange({ state: true });
										
										// Wait for the form to be created, then set values for each filter
										setTimeout(function() {
											// Add additional filter fields if needed (first one is already created)
											for (var filterIndex = 1; filterIndex < filterData.length; filterIndex++) {
												addFilterField();
											}
											debugger;
											
											// Set the field and value selections for all filters
											filterData.forEach(function(filterItem, index) {
												if (filterItem.field && filterItem.value) {
													// Find the filter containers
													var aFormContent = oFilterForm.getContent();
													var oFilterContainer = null;
													var containerIndex = 0;
													
													// Find the Nth filter container (VBox with class sapUiMediumMarginBottom)
													for (var i = 0; i < aFormContent.length; i++) {
														if (aFormContent[i] instanceof sap.m.VBox && 
															aFormContent[i].hasStyleClass("sapUiMediumMarginBottom")) {
															if (containerIndex === index) {
																oFilterContainer = aFormContent[i];
																break;
															}
															containerIndex++;
														}
													}
													
													if (oFilterContainer) {
														// Navigate to the field controls within the container
														var oHBox = oFilterContainer.getItems()[0];
														if (oHBox instanceof sap.m.HBox) {
															var oVBoxWithFields = oHBox.getItems()[0];
															if (oVBoxWithFields instanceof sap.m.VBox) {
																var aFieldItems = oVBoxWithFields.getItems();
																
																// Find the Select and ComboBox controls
																var oFilterFieldSelect = null;
																var oFilterValueSelect = null;
																
																for (var k = 0; k < aFieldItems.length; k++) {
																	if (aFieldItems[k] instanceof sap.m.Select) {
																		oFilterFieldSelect = aFieldItems[k];
																	} else if (aFieldItems[k] instanceof sap.m.ComboBox) {
																		oFilterValueSelect = aFieldItems[k];
																	}
																}
																
																if (oFilterFieldSelect && oFilterValueSelect) {
																	// Set the selected field
																	oFilterFieldSelect.setSelectedKey(filterItem.field);
																	
																	// Populate and set the filter value
																	var populateAndSetFilterValue = function(fieldName, fieldValue, valueSelect) {
																		valueSelect.destroyItems();
																		
																		// Get unique values from createJsonDataModel for the selected field
																		var oJsonDataModel = that.getView().getModel("createJsonDataModel");
																		if (oJsonDataModel) {
																			var aJsonData = oJsonDataModel.getData();
																			var aUniqueValues = [];
																			
																			aJsonData.forEach(function(item) {
																				if (item[fieldName] && aUniqueValues.indexOf(item[fieldName]) === -1) {
																					aUniqueValues.push(item[fieldName]);
																				}
																			});
																			
																			// Add unique values to filter value select
																			aUniqueValues.forEach(function(value) {
																				valueSelect.addItem(new sap.ui.core.ListItem({
																					key: value,
																					text: value
																				}));
																			});
																			
																			// Set the selected value
																			// For ComboBox, use setValue to handle both dropdown and free text values
																			if (valueSelect instanceof sap.m.ComboBox) {
																				valueSelect.setValue(fieldValue);
																			} else if (valueSelect.setSelectedKey) {
																				valueSelect.setSelectedKey(fieldValue);
																			} else {
																				valueSelect.setValue(fieldValue);
																			}
																		}
																	};
																	
																	populateAndSetFilterValue(filterItem.field, filterItem.value, oFilterValueSelect);
																}
															}
														}
													}
												}
											});
										}, 100); // Small delay to ensure form creation is complete
									}
								}
							} catch (e) {
								console.error("Error parsing filter data:", e);
							}
						}

						//Handle existing mapping for createTileMappingForm form 
						// in oCurrentData there will be a filter field and contains data like this "WlabelMapping": "[{\"field\":\"0O2TFR0L0AE1J9CWDYXZ7RIW\",\"label\":\"test1\"},{\"field\":\"0O2TFR0L0AE1J9CWDYXZ7RIW\",\"label\":\"test2\"}]",
						// map the data with the field in createTileMappingForm
						if (oCurrentData.wlabelMapping || oCurrentData.selectionType) {
							try {
								var oTileMappingForm = that.byId("createTileMappingForm");
								var aTileMappingContent = oTileMappingForm.getContent();
								
								// Set selection type from oCurrentData.selectionType
								if (oCurrentData.selectionType && aTileMappingContent.length > 1 && aTileMappingContent[1] instanceof sap.m.Select) {
									aTileMappingContent[1].setSelectedKey(oCurrentData.selectionType);
								}
								
								// Handle tile mapping data from oCurrentData.wlabelMapping
								if (oCurrentData.wlabelMapping) {
									var tileMappingData = JSON.parse(oCurrentData.wlabelMapping);
									
									// Check if tile mapping data exists and has entries
									if (tileMappingData && Array.isArray(tileMappingData) && tileMappingData.length > 0) {
										// Map each tile mapping entry to the corresponding form fields
										for (var tileIndex = 0; tileIndex < tileMappingData.length && tileIndex < iNumberOfFields; tileIndex++) {
											var tileData = tileMappingData[tileIndex];

											if (tileData.field && tileData.label) {
												// New form structure: Selection Type Label, Selection Type Select, then VBox containers (one per field)
												// Each VBox contains: Field Label, Field Select, HBox1 (with 3 VBoxes for Display Text, Unit, Color), HBox2 (with 3 VBoxes for Scale, Decimals, Suffix)
												// Skip the first two controls (Selection Type Label and Select) and start from index 2
												var controlIndex = 2 + tileIndex; // Start from index 2 to skip selection type label and select
												var oFieldBox = aTileMappingContent[controlIndex]; // Get the VBox for this field

												if (oFieldBox instanceof sap.m.VBox) {
													var aFieldBoxItems = oFieldBox.getItems();
													// aFieldBoxItems[0] = Field Label
													// aFieldBoxItems[1] = Field Select
													// aFieldBoxItems[2] = HBox1 containing the first 3 fields
													// aFieldBoxItems[3] = HBox2 containing the second 3 fields

													var oTileFieldSelect = aFieldBoxItems[1];
													var oHBox1 = aFieldBoxItems[2];
													var oHBox2 = aFieldBoxItems[3];

													if (oTileFieldSelect instanceof sap.m.Select) {
														// Set the selected field
														oTileFieldSelect.setSelectedKey(tileData.field);
													}

													// Handle first HBox (Display Text, Unit, Color)
													if (oHBox1 instanceof sap.m.HBox) {
														var aHBox1Items = oHBox1.getItems();
														var oTextVBox = aHBox1Items[0]; // Display Text VBox
														var oUnitVBox = aHBox1Items[1]; // Unit VBox
														var oColorVBox = aHBox1Items[2]; // Color VBox

														// Set Display Text
														if (oTextVBox && oTextVBox instanceof sap.m.VBox) {
															var oTextInput = oTextVBox.getItems()[1];
															if (oTextInput instanceof sap.m.Input && tileData.label) {
																oTextInput.setValue(tileData.label);
															}
														}

														// Set Unit
														if (oUnitVBox && oUnitVBox instanceof sap.m.VBox && tileData.unit) {
															var oUnitInput = oUnitVBox.getItems()[1];
															if (oUnitInput instanceof sap.m.Input) {
																oUnitInput.setValue(tileData.unit);
															}
														}

														// Set Color
														if (oColorVBox && oColorVBox instanceof sap.m.VBox && tileData.color) {
															var oColorInput = oColorVBox.getItems()[1];
															if (oColorInput instanceof sap.m.Input) {
																oColorInput.setValue(tileData.color);
															}
														}
													}

													// Handle second HBox (Scale, Decimals, Suffix)
													if (oHBox2 instanceof sap.m.HBox) {
														var aHBox2Items = oHBox2.getItems();
														var oScaleVBox = aHBox2Items[0]; // Scale VBox
														var oDecimalsVBox = aHBox2Items[1]; // Decimals VBox
														var oSuffixVBox = aHBox2Items[2]; // Suffix VBox

														// Set Scale
														if (oScaleVBox && oScaleVBox instanceof sap.m.VBox && tileData.scale) {
															var oScaleSelect = oScaleVBox.getItems()[1];
															if (oScaleSelect instanceof sap.m.Select) {
																oScaleSelect.setSelectedKey(tileData.scale);
															}
														}

														// Set Decimals
														if (oDecimalsVBox && oDecimalsVBox instanceof sap.m.VBox && tileData.decimals) {
															var oDecimalsSelect = oDecimalsVBox.getItems()[1];
															if (oDecimalsSelect instanceof sap.m.Select) {
																oDecimalsSelect.setSelectedKey(tileData.decimals);
															}
														}

														// Set Suffix
														if (oSuffixVBox && oSuffixVBox instanceof sap.m.VBox && tileData.suffix) {
															var oSuffixInput = oSuffixVBox.getItems()[1];
															if (oSuffixInput instanceof sap.m.Input) {
																oSuffixInput.setValue(tileData.suffix);
															}
														}
													}
												}
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
		},

		_showChartPreview: function (oController, sChartType) {
			var that = oController;
			var oDefaultContent = that.byId("defaultPreviewContent");
			var oChartContainer = that.byId("chartPreviewContainer");
			
			if (!sChartType) {
				// Show default content if no chart type selected
				oDefaultContent.setVisible(true);
				oChartContainer.setVisible(false);
				return;
			}

			// Hide default content and show chart
			oDefaultContent.setVisible(false);
			oChartContainer.setVisible(true);

			// Clear any existing chart
			oChartContainer.removeAllItems();

			// Get widget data from the model
			var oWidgetValues = that.getView().getModel("createWidgetValues");
			var oWidgetData = oWidgetValues.getData();
			var sWidgetName = oWidgetData.widgetName || "Sample Widget";
			var sWidgetType = oWidgetData.selectedWidgetType;

			// Add widget name as title
			var oWidgetTitle = new Text({
				text: sWidgetName,
				class: "sapUiLargeText"
			}).addStyleClass("sapUiMediumMarginBottom")
			 .addStyleClass("widgetTitleText");
			
			oChartContainer.addItem(oWidgetTitle);

			// Add field and value texts based on widget type
			this._addFieldValueTexts(oChartContainer, sWidgetType);

			// Create sample chart based on type
			if (sChartType.toLowerCase().includes("bchart") || sChartType.toLowerCase().includes("column")) {
				this._createSampleBarChart(oChartContainer);
			} else if (sChartType.toLowerCase().includes("lchart")) {
				this._createSampleLineChart(oChartContainer);
			} else {
				// Default to bar chart for unknown types
				this._createSampleBarChart(oChartContainer);
			}
		},

		_addFieldValueTexts: function (oContainer, sWidgetType) {
			if (!sWidgetType) {
				return;
			}

			var iNumberOfFields = 0;
			
			// Determine number of fields based on widget type
			if (sWidgetType.includes("2")) { // 2 Value Widget
				iNumberOfFields = 2;
			} else if (sWidgetType.includes("3")) { // 3 Value Widget
				iNumberOfFields = 3;
			} else {
				return; // No field/value display for other types
			}

			// Sample field data
			var aSampleFieldData = [
				{ field: "Revenue", value: "€ 125,430" },
				{ field: "Profit", value: "€ 42,150" },
				{ field: "Growth", value: "15.2%" }
			];

			// Create field and value texts
			for (var i = 0; i < iNumberOfFields && i < aSampleFieldData.length; i++) {
				var oFieldValueContainer = new sap.m.HBox({
					justifyContent: "SpaceBetween",
					alignItems: "Center",
					width: "100%"
				}).addStyleClass("sapUiSmallMarginBottom")
				 .addStyleClass("fieldValueContainer");

				var oFieldText = new Text({
					text: aSampleFieldData[i].field + ":",
					class: "sapUiMediumText"
				}).addStyleClass("fieldText");

				var oValueText = new Text({
					text: aSampleFieldData[i].value,
					class: "sapUiMediumText"
				}).addStyleClass("valueText");

				oFieldValueContainer.addItem(oFieldText);
				oFieldValueContainer.addItem(oValueText);
				
				oContainer.addItem(oFieldValueContainer);
			}

			// Add margin after field/value section
			var oSpacer = new sap.m.Text().addStyleClass("sapUiMediumMarginBottom");
			oContainer.addItem(oSpacer);
		},

		_createSampleBarChart: function (oContainer) {
			// Sample data for bar chart
			var aSampleData = [
				{ Category: "Q1", Value: 120 },
				{ Category: "Q2", Value: 142 },
				{ Category: "Q3", Value: 108 },
				{ Category: "Q4", Value: 175 }
			];

			var oModel = new JSONModel(aSampleData);

			var oDataset = new FlattenedDataset({
				dimensions: [{
					name: "Category",
					value: "{Category}"
				}],
				measures: [{
					name: "Value",
					value: "{Value}"
				}],
				data: {
					path: "/"
				}
			});

			var oVizFrame = new VizFrame({
				width: "350px",
				height: "400px",
				vizType: "column",
				dataset: oDataset
			});

			oVizFrame.setModel(oModel);

			// Add feeds
			var oFeedValueAxis = new FeedItem({
				uid: "valueAxis",
				type: "Measure",
				values: ["Value"]
			});

			var oFeedCategoryAxis = new FeedItem({
				uid: "categoryAxis",
				type: "Dimension",
				values: ["Category"]
			});

			oVizFrame.addFeed(oFeedValueAxis);
			oVizFrame.addFeed(oFeedCategoryAxis);

			// Set chart properties
			oVizFrame.setVizProperties({
				title: {
					text: "Sample Bar Chart"
				},
				plotArea: {
					colorPalette: ["#5899DA", "#E8743B", "#19A979", "#ED4A7B", "#945ECF"]
				}
			});

			oContainer.addItem(oVizFrame);
		},

		_createSampleLineChart: function (oContainer) {
			// Sample data for line chart
			var aSampleData = [
				{ Month: "Jan", Sales: 120, Target: 100 },
				{ Month: "Feb", Sales: 142, Target: 110 },
				{ Month: "Mar", Sales: 108, Target: 120 },
				{ Month: "Apr", Sales: 175, Target: 130 },
				{ Month: "May", Sales: 190, Target: 140 },
				{ Month: "Jun", Sales: 165, Target: 150 }
			];

			var oModel = new JSONModel(aSampleData);

			var oDataset = new FlattenedDataset({
				dimensions: [{
					name: "Month",
					value: "{Month}"
				}],
				measures: [{
					name: "Sales",
					value: "{Sales}"
				}, {
					name: "Target",
					value: "{Target}"
				}],
				data: {
					path: "/"
				}
			});

			var oVizFrame = new VizFrame({
				width: "350px",
				height: "400px",
				vizType: "line",
				dataset: oDataset
			});

			oVizFrame.setModel(oModel);

			// Add feeds
			var oFeedValueAxis = new FeedItem({
				uid: "valueAxis",
				type: "Measure",
				values: ["Sales", "Target"]
			});

			var oFeedCategoryAxis = new FeedItem({
				uid: "categoryAxis",
				type: "Dimension",
				values: ["Month"]
			});

			oVizFrame.addFeed(oFeedValueAxis);
			oVizFrame.addFeed(oFeedCategoryAxis);

			// Set chart properties
			oVizFrame.setVizProperties({
				title: {
					text: "Sample Line Chart"
				},
				plotArea: {
					colorPalette: ["#5899DA", "#E8743B", "#19A979", "#ED4A7B", "#945ECF"]
				}
			});

			oContainer.addItem(oVizFrame);
		}
	};
});