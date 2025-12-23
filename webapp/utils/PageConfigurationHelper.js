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
			debugger;
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

			// Hide page configuration and show widget config (stay in same page)
			that.byId("pageConfigurationContainer").setVisible(false);
			that.byId("pageWidgetDetailConfig").setVisible(true);
			that.byId("pageText").setText(oSelectedPage.ZpageName);

			// Load widget data for the selected page from DynamicWidgetSet
			var oWidgetDataModel = new JSONModel();
			var finmobview = that.getView().getModel("finmobview");
			var aFilters = [new Filter("ZpageId", FilterOperator.EQ, oSelectedPage.ZpageId)];

			sap.ui.core.BusyIndicator.show(0);

			finmobview.read("/DynamicWidgetSet", {
				filters: aFilters,
				success: function (data) {
					console.log("Widget data loaded for page:", data);
					oWidgetDataModel.setData(data.results);
					that.getView().setModel(oWidgetDataModel, "oWidgetDataModel");
					sap.ui.core.BusyIndicator.hide();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();
					var responseText = oError.responseText;
					var msg = "Error loading widget data";
					if (responseText && responseText.indexOf("{") > -1) {
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

			console.log("Selected widget for page:", oSelectedWidget);

			// Extract page ID from the selected widget/page data
			var sPageId = oSelectedWidget.ZpageId || oSelectedWidget.PageId;
			var sPageName = oSelectedWidget.ZpageName || oSelectedWidget.PageName || sPageId;

			if (!sPageId) {
				MessageBox.error("Page ID not found");
				return;
			}

			// Load widgets for this page from DynamicWidgetSet
			var finmobview = that.getView().getModel("finmobview");
			var sFilter = "$filter=ZpageId eq '" + sPageId + "'";

			sap.ui.core.BusyIndicator.show(0);
			finmobview.read("/DynamicWidgetSet?" + sFilter, {
				success: function (data) {
					console.log("Widget data loaded for page:", data);

					// Create and set widget data model
					var oWidgetDataModel = new JSONModel(data.results);
					that.getView().setModel(oWidgetDataModel, "oWidgetDataModel");

					// Hide page widget list, show widget detail panel
					that.byId("pageWidgetConfigContainer").setVisible(false);
					that.byId("pageWidgetDetailConfig").setVisible(true);

					// Update title with page name
					that.byId("pageWidgetDetailTitle").setText("Widgets for " + sPageName);

					sap.ui.core.BusyIndicator.hide();
				},
				error: function (oError) {
					sap.ui.core.BusyIndicator.hide();

					var msg = "Failed to load widget data";
					try {
						var responseText = oError.responseText;
						if (responseText && responseText.indexOf("{") > -1) {
							var errorDetails = JSON.parse(responseText).error.innererror.errordetails;
							if (errorDetails && errorDetails.length > 0) {
								msg = errorDetails.map(err => err.message).join("\n");
							}
						}
					} catch (e) {
						console.error("Error parsing error response:", e);
					}

					MessageBox.error(msg);
					console.error("Load widget data error:", oError);
				}
			});
		},

		onBackToPageWidgetConfig: function (oController) {
			var that = oController;

			// Hide widget detail panel and show page widget list
			that.byId("pageWidgetDetailConfig").setVisible(false);
			that.byId("pageConfigurationContainer").setVisible(true);
		},

		onDeleteWidget: function (oController) {
			var that = oController;
			var oTable = that.byId("pageWidgetDetailTable");
			var aContexts = oTable.getSelectedContexts();
			var self = this;

			if (aContexts.length === 0) {
				MessageToast.show("Please select at least one widget to delete");
				return;
			}

			MessageBox.confirm("Are you sure you want to delete the selected widget(s)?", {
				title: "Delete Widgets",
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
							var widget = deletionItems[j];
							var deletePath = "/DynamicWidgetSet(ZtitleName='" + widget.ZtitleName + "',ZpageName='" + widget.ZpageName + "',WidgetId='" + widget.WidgetId + "')";

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
							MessageBox.success("Selected widgets deleted successfully.");

							// Refresh the widget list
							var oModel = that.getView().getModel("oWidgetDataModel");
							var aWidgets = oModel.getData();
							deletionItems.forEach(function(delItem) {
								var index = aWidgets.findIndex(function(w) {
									return w.WidgetId === delItem.WidgetId;
								});
								if (index > -1) {
									aWidgets.splice(index, 1);
								}
							});
							oModel.setData(aWidgets);
							oTable.removeSelections();
						}).catch(function(oError) {
							sap.ui.core.BusyIndicator.hide(0);
							MessageBox.error("Failed to delete some widgets.");
							console.error("Delete widget error:", oError);
							oTable.removeSelections();
						});
					}
				}
			});
		},

		onUpdateWidget: function (oController) {
			var that = oController;
			var self = this;
			var oModel = that.getView().getModel("finmobview");
			var aData = that.getView().getModel("oWidgetDataModel").getData();

			sap.ui.core.BusyIndicator.show(0);

			var aUpdatePromises = aData.map(function (oItem) {
				return new Promise(function (resolve, reject) {
					var sPath = "/DynamicWidgetSet(ZtitleName='" + oItem.ZtitleName + "',ZpageName='" + oItem.ZpageName + "',WidgetId='" + oItem.WidgetId + "')";

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
				MessageToast.show("All widgets updated successfully!");
			}).catch(function (oError) {
				sap.ui.core.BusyIndicator.hide();
				MessageBox.error("Failed to update some widgets.");
				console.error("Update widget error:", oError);
			});
		},

		onAddWidget: function (oController) {
			var that = oController;

			MessageToast.show("Add Widget functionality - to be implemented");
			// This would open a dialog to create a new widget
		},

		onWidgetDrop: function (oController, oEvent) {
			var that = oController;
			var oDraggedItem = oEvent.getParameter("draggedControl");
			var oDroppedItem = oEvent.getParameter("droppedControl");
			var sDropPosition = oEvent.getParameter("dropPosition");

			var oModel = that.getView().getModel("oWidgetDataModel");
			var aWidgets = oModel.getData();

			// Get indices
			var iDraggedIndex = oDraggedItem.getBindingContext("oWidgetDataModel").getPath().split("/")[1];
			var iDroppedIndex = oDroppedItem.getBindingContext("oWidgetDataModel").getPath().split("/")[1];

			iDraggedIndex = parseInt(iDraggedIndex);
			iDroppedIndex = parseInt(iDroppedIndex);

			// Reorder array
			var oDraggedWidget = aWidgets[iDraggedIndex];
			aWidgets.splice(iDraggedIndex, 1);

			if (sDropPosition === "Before") {
				aWidgets.splice(iDroppedIndex > iDraggedIndex ? iDroppedIndex - 1 : iDroppedIndex, 0, oDraggedWidget);
			} else {
				aWidgets.splice(iDroppedIndex > iDraggedIndex ? iDroppedIndex : iDroppedIndex + 1, 0, oDraggedWidget);
			}

			oModel.setData(aWidgets);
			MessageToast.show("Widget order changed. Click Update to save.");
		},

		onWidgetPress: function (oController, oEvent) {
			var that = oController;
			var oBindingContext = oEvent.getSource().getBindingContext("oWidgetDataModel");
			var oSelectedWidget = oBindingContext.getObject();

			console.log("Widget pressed:", oSelectedWidget);
			MessageToast.show("Widget: " + oSelectedWidget.WidgetName);
		},

		onWidgetSelectionChange: function (oController, oEvent) {
			// Handle widget selection changes
			console.log("Widget selection changed");
		}
	};
});
