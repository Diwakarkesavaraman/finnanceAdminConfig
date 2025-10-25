sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (JSONModel, MessageBox, MessageToast, Filter, FilterOperator) {
	"use strict";

	return {
		onLoadPageConfigurationData: async function (oController) {
			var that = oController;
			var finmobview = that.getView().getModel("finmobview");
			
			// Use the correct endpoint and filter pattern from navigateToDetailFragment
			var aFilters = [new Filter("ZtitleId", FilterOperator.EQ, "L08")];
			
			try {
				return new Promise((resolve, reject) => {
					finmobview.read("/DynamicPageSet", {
						filters: aFilters,
						success: function (data) {
							console.log("Page configuration data fetched:", data);
							
							// Create and set page configuration model
							var oPageConfigDataModel = new JSONModel(data.results);
							that.getView().setModel(oPageConfigDataModel, "oPageConfigDataModel");
							
							resolve(data.results);
						},
						error: function (oError) {
							console.error("Error fetching page configuration:", oError);
							var responseText = oError.responseText;
							var msg = "Error fetching page configuration";
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
			} catch (error) {
				console.error("Error in onLoadPageConfigurationData:", error);
				throw error;
			}
		},

		onPageConfigPress: function (oController, oEvent) {
			var that = oController;
			var oBindingContext = oEvent.getSource().getBindingContext("oPageConfigDataModel");
			var oSelectedPage = oBindingContext.getObject();
			
			console.log("Selected page:", oSelectedPage);
			
			// Navigate to WidgetListTable fragment (same as Dynamic Widget Config)
			that.byId("pageContainer").to(that.getView().createId("dynamicWidgetConfig"));
			
			// Show widget list and hide create config initially
			that.byId("widgetListContainer").setVisible(true);
			that.byId("createDynamicWidgetConfigContainer").setVisible(false);
			
			// Load widget list data with filters for the selected page
			var CreateDynamicWidgetHelper = sap.ui.require("mobilefinance/MobileFinance/utils/CreateDynamicWidgetHelper");
			if (CreateDynamicWidgetHelper) {
				CreateDynamicWidgetHelper.onLoadWidgetListData(that);
			}
		},

		onBackToPageConfig: function (oController) {
			var that = oController;
			
			// Hide page widget list and show page list
			that.byId("pageWidgetConfigContainer").setVisible(false);
			that.byId("pageConfigurationContainer").setVisible(true);
			
			// Refresh the page list
			this.onLoadPageConfigurationData(that);
		},

		onAddPageConfig: function (oController) {
			var that = oController;
			
			// Create oTileDataModel with L08 as default
			var oTileDataModel = new JSONModel({
				ZlevelId: "L08"
			});
			that.getView().setModel(oTileDataModel, "oTileDataModel");
			
			// Use separate AddNewPageConfig fragment
			if (!that.AddNewPageConfigDialog) {
				that.AddNewPageConfigDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewPageConfig", that);
				that.getView().addDependent(that.AddNewPageConfigDialog);
			}
			that.AddNewPageConfigDialog.open();
		},

		onAddPageConfigItem: function (oController) {
			var that = oController;
			var inpTileTitle = that.getView().getModel("oTileDataModel").getData().ZlevelId;
			
			var inpPageTitle = sap.ui.getCore().byId("pageConfigTitleInput").getValue();
			var inpRoles = sap.ui.getCore().byId("pageConfigRolesInput").getValue();
			var inpVisibility = sap.ui.getCore().byId("pageConfigVisibilityCheckBox").getSelected();
			
			if (inpPageTitle === '') {
				MessageToast.show("Fill all the mandatory Fields!!!");
				return;
			}

			var addPageItem = {
				"ZtitleId": inpTileTitle,
				"ZpageName": inpPageTitle,
				"Zvisibility": inpVisibility,
				"Zrole": inpRoles
			};

			var finmobview = that.getView().getModel("finmobview");
			sap.ui.core.BusyIndicator.show(0);

			var self = this;
			finmobview.create("/DynamicPageSet", addPageItem, {
				success: function (oData, oResponse) {
					sap.ui.core.BusyIndicator.hide(0);
					MessageToast.show("Page added successfully!");
					
					// Navigate to detail and refresh the page list
					that.navigateToDetailFragment(oData.ZtitleId);
					self.onLoadPageConfigurationData(that);
					
					that.AddNewPageConfigDialog.close();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide(0);
					MessageBox.error("Failed to add page");
					console.error("Add page error:", oError);
				}
			});
		},

		onCloseAddNewPageConfigDialog: function (oController) {
			var that = oController;
			if (that.AddNewPageConfigDialog) {
				that.AddNewPageConfigDialog.close();
			}
		},

		onUpdatePageConfig: function (oController) {
			var that = oController;
			var self = this;
			var oModel = that.getView().getModel("finmobview");
			var aData = that.getView().getModel("oPageConfigDataModel").getData();

			sap.ui.core.BusyIndicator.show(0);

			var aUpdatePromises = aData.map(function (oItem) {
				return new Promise(function (resolve, reject) {
					// Clean up object before updating if needed
					var sPath = "/DynamicPageSet(ZtitleId='" + oItem.ZtitleId + "',ZpageId='" + oItem.ZpageId + "')";
					
					oModel.update(sPath, oItem, {
						success: function (oData) {
							resolve(oData);
						},
						error: function (oError) {
							reject(oError);
						}
					});
				});
			});

			Promise.all(aUpdatePromises).then(function () {
				sap.ui.core.BusyIndicator.hide();
				MessageToast.show("All pages updated successfully!");
				// Refresh the page list
				self.onLoadPageConfigurationData(that);
			}).catch(function (oError) {
				sap.ui.core.BusyIndicator.hide();
				MessageBox.error("Failed to update some pages.");
				console.error("Update error:", oError);
			});
		},

		onDeletePageConfig: function (oController) {
			var that = oController;
			var oTable = that.byId("pageConfigTable");
			var aContexts = oTable.getSelectedContexts();
			var self = this;
			
			if (aContexts.length === 0) {
				MessageToast.show("Please select at least one page to delete");
				return;
			}
			
			MessageBox.confirm("Are you sure you want to delete the selected page(s)?", {
				title: "Delete Pages",
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.OK) {
						var deletionItems = [];
						
						for (var i = 0; i < aContexts.length; i++) {
							deletionItems.push(aContexts[i].getObject());
						}
						
						var finmobview = that.getView().getModel("finmobview");
						sap.ui.core.BusyIndicator.show(0);
						
						var deletePromises = [];
						
						// Create delete promises for each item
						for (var j = 0; j < deletionItems.length; j++) {
							var addRow = deletionItems[j];
							var deletePath = "/DynamicPageSet(ZtitleId='" + addRow.ZtitleId + "',ZpageId='" + addRow.ZpageId + "')";
							
							deletePromises.push(new Promise(function(resolve, reject) {
								finmobview.remove(deletePath, {
									success: function(oData) {
										resolve(oData);
									},
									error: function(oError) {
										reject(oError);
									}
								});
							}));
						}
						
						// Execute all delete operations
						Promise.all(deletePromises).then(function() {
							sap.ui.core.BusyIndicator.hide(0);
							MessageBox.success("Selected pages deleted successfully.");
							
							// Refresh the page list
							self.onLoadPageConfigurationData(that);
							oTable.removeSelections();
						}).catch(function(oError) {
							sap.ui.core.BusyIndicator.hide(0);
							MessageBox.error("Failed to delete some pages.");
							console.error("Delete error:", oError);
							
							// Still refresh to show current state
							self.onLoadPageConfigurationData(that);
							oTable.removeSelections();
						});
					}
				}
			});
		},

		onLoadPageWidgets: function (oController, sPageId) {
			var that = oController;
			
			// For now, load sample widget data
			// In real implementation, this would fetch widgets for the specific page
			var aSampleWidgets = [
				{
					WidgetId: "W001",
					WidgetName: "Sales Chart",
					WidgetType: "2 Value Widget",
					ChartType: "Bar Chart",
					PageId: sPageId
				},
				{
					WidgetId: "W002", 
					WidgetName: "Revenue Trend",
					WidgetType: "3 Value Widget",
					ChartType: "Line Chart",
					PageId: sPageId
				}
			];
			
			var oPageWidgetModel = new JSONModel(aSampleWidgets);
			that.getView().setModel(oPageWidgetModel, "oPageWidgetConfigDataModel");
		},

		onAddWidgetToPageConfig: function (oController) {
			var that = oController;
			
			MessageToast.show("Add Widget to Page functionality - to be implemented");
			// Here you would implement logic to show available widgets and add them to the page
		},

		onRemoveWidgetFromPageConfig: function (oController, oEvent) {
			var that = oController;
			var oBindingContext = oEvent.getSource().getBindingContext("oPageWidgetConfigDataModel");
			var oSelectedWidget = oBindingContext.getObject();
			
			MessageBox.confirm("Are you sure you want to remove '" + oSelectedWidget.WidgetName + "' from this page?", {
				title: "Remove Widget",
				onClose: function (oAction) {
					if (oAction === MessageBox.Action.OK) {
						var oModel = that.getView().getModel("oPageWidgetConfigDataModel");
						var aWidgets = oModel.getData();
						var iIndex = parseInt(oBindingContext.getPath().split("/")[1]);
						
						aWidgets.splice(iIndex, 1);
						oModel.setData(aWidgets);
						
						MessageToast.show("Widget removed from page");
					}
				}
			});
		},

		onPageConfigSelectionChange: function (oController, oEvent) {
			// Handle page selection changes
			console.log("Page selection changed");
		},

		onPageWidgetConfigSelectionChange: function (oController, oEvent) {
			// Handle page widget selection changes
			console.log("Page widget selection changed");
		},

		onPageWidgetConfigPress: function (oController, oEvent) {
			var that = oController;
			var oBindingContext = oEvent.getSource().getBindingContext("oPageWidgetConfigDataModel");
			var oSelectedWidget = oBindingContext.getObject();
			
			console.log("Selected widget:", oSelectedWidget);
			MessageToast.show("Widget details: " + oSelectedWidget.WidgetName);
		}
	};
});