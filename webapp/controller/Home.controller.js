 sap.ui.define([
 	"sap/ui/core/mvc/Controller",
 	"sap/ui/model/json/JSONModel",
 	"sap/m/MessageBox",
 	"sap/m/SelectDialog",
 	"sap/m/StandardListItem",
 	'sap/m/MessageToast',
 	"sap/m/MultiInput",
 	"sap/m/Token", 
	"sap/ui/layout/form/FormElement",
	"sap/m/Input",
	"sap/m/Label",

	"sap/m/Select",
    "sap/ui/core/Item", 
    "sap/m/Text",
	 "sap/m/Button",
	 "mobilefinance/MobileFinance/utils/DynamicWidgetHelper"
 ], function (Controller, JSONModel, MessageBox, SelectDialog, StandardListItem, MessageToast, MultiInput, Token, FormElement, Input, Label,Select,Item,Text,Button,DynamicWidgetHelper) {
 	"use strict";

 	var sSelectedFolderId = "";
 	var sSelectedFolderTitle = "";

 	return Controller.extend("mobilefinance.MobileFinance.controller.Home", {
 		formatter: {
 			formatColor: function (Zcolor) {
 				switch (Zcolor) {
 				case "84BD00":
 					return "Green";
 				case "00A3E0":
 					return "Blue";
 				case "643278":
 					return "Purple";
 				case "FFC846":
 					return "Yellow";
 				default:
 					return Zcolor; // Fallback to the original value if no match is found
 				}
 			}
 		},
 		onInit: function () {
 			// 	var oRouter = this.getOwnerComponent().getRouter();
 			// 	// oRouter.getRoute("Home").attachPatternMatched(this.onLoadLandingPageData, this);
 			this.selectedAdminTabKey = "updLandingPage"
 			var oModel = new sap.ui.model.json.JSONModel({
 				selectedFile: null
 			});
 			this.getView().setModel(oModel);
 			this.onLoadAuthData();
 			this.onLoadLandingPageData();
 			this.onLoadSubCatData();
 			this.onLoadGISReportsData();
 			this.onLoadCalendarData();
 			this.onLoadVisiblityData();
 			this.onLoadMarketWatchData();
 			this.onLoadMarketWatchTab();
 			this.onLoadFinCalTab();
 			this.onLoadReportsTab();
 			this.onLoadReportSubTab();
 			this.onLoadReportData();
 			this.onLoadSharePriceTab();
			this.onLoadAffiliateTab();
 			this.onLoadShareKGISReportsData();
			this.onLoadDyanmicWidgetData('');
		
		
 			var oColorModel = new sap.ui.model.json.JSONModel({
 				colors: [{
 						Value: "Purple",
 						Description: "643278"
 					}, {
 						Value: "Blue",
 						Description: "00A3E0"
 					}, {
 						Value: "Green",
 						Description: "84BD00"
 					}, {
 						Value: "Yellow",
 						Description: "FFC846"
 					},
 					// Add more colors as needed
 				]
 			});
			var oInputParamModel = new sap.ui.model.json.JSONModel({
				selectOptionRange: [{
					Value: "BT",
					Description: "Less then or equal to"
				}, {
					Value: "EQ",
					Description: "EQ"
				},],
				selectOptionInclude:[
					{
						Value: "I",
						Description: "Include"
					}, {
						Value: "E",
						Description: "Exclude"
					},
				]
			})
 			this.getView().setModel(oColorModel, "colorModel");
			this.getView().setModel(oInputParamModel, "inputParamModel");
			 debugger;
 			this.oModel = this.getView().getModel();
 			var oViewModel = new JSONModel({
 				showNewTable: false, // Initially, table 2 is hidden
 				showThirdTable: false // Initially, table 3 is hidden
 			});
 			this.getView().setModel(oViewModel, "oViewModel");
 			// var oShareKGISReportModel = new JSONModel();
 		},

 		onPressTest: function () {
 			window.location.href = "sPath"
 		},

 		onLoadAuthData: function () {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");
 			sap.ui.core.BusyIndicator.show(0);

 			var oAuthDataModel = new JSONModel();

 			finmobview.read("/AuthSet('')", {
 				success: function (data) {
 					console.log(data);
 					oAuthDataModel.setData(data);
 					that.getView().setModel(oAuthDataModel, "oAuthDataModel");
 					// 	var oLocalData = {
 					//     UserID: "ANANTHVX",
 					//     LandingPageRole: "X",
 					//     MarketWatchRole: "X",
 					//     GisRole: "X",
 					//     ReportsRole: "X",
 					//     CalendarRole: "X",
 					// FinancialDashboardRole: "X",
 					// SharePriceRole: "X"
 					// };
 					// // Create a JSON model with local data
 					// var oAuthModel = new sap.ui.model.json.JSONModel(oLocalData);
 					// that.getView().setModel(oAuthModel, "authModel");
 					// that.updateTabVisibility();

 					sap.ui.core.BusyIndicator.hide(0);

 				},
 				error: function (oError) {

 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg;
 					if (responseText.indexOf("{") > -1) {
 						if (responseText != "") {
 							//	msg += JSON.parse(oError.responseText).error.message.value;
 							for (var i = 0; i < JSON.parse(oError.responseText).error.innererror.errordetails.length - 1; i++) {
 								msg += JSON.parse(oError.responseText).error.innererror.errordetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}

 					MessageBox.error(msg);
 				}
 			});
 		},

 		updateTabVisibility: function () {
 			var that = this;
 			var oAuthModel = this.getView().getModel("oAuthDataModel");

 			if (!oAuthModel) {
 				console.warn("Authorization model not found.");
 				return;
 			}

 			var oData = oAuthModel.getData();

 			// Mapping roles to both side navigation and content fragments
 			var roleMapping = {
 				"LandingPageRole": {
 					navId: "contentNav",
 					tabId: "content"
 				},
 				"MarketWatchRole": {
 					navId: "marketwatchNav",
 					tabId: "marketwatch"
 				},
 				"GisRole": {
 					navId: "gisreportNav",
 					tabId: "gisreport"
 				},
 				"ReportsRole": {
 					navId: "reportsNav",
 					tabId: "reports"
 				},
 				"CalenderRole": {
 					navId: "calendarNav",
 					tabId: "calendar"
 				},
 				"SharePriceRole": {
 					navId: "sharePriceNav",
 					tabId: "shareprice"
 				},
 				"FinancialDashboardRole": {
 					navId: "visiblityNav",
 					tabId: "visiblity"
 				}
 			};

 			var bHasAccess = false;
 			var oSideNav = this.getView().byId("sideNavigation"); // Reference to Side Navigation

 			// Hide all side navigation items and content fragments initially
 			Object.values(roleMapping).forEach(function (mapping) {
 				var oNavItem = that.getView().byId(mapping.navId);
 				var oTabItem = that.getView().byId(mapping.tabId);

 				if (oNavItem) oNavItem.setVisible(false);
 				if (oTabItem) oTabItem.setVisible(false);
 			});

 			// Show only allowed side navigation items and corresponding content fragments
 			Object.keys(roleMapping).forEach(function (role) {
 				if (oData[role] === "X") {
 					var oNavItem = that.getView().byId(roleMapping[role].navId);
 					var oTabItem = that.getView().byId(roleMapping[role].tabId);

 					if (oNavItem) oNavItem.setVisible(true);
 					if (oTabItem) oTabItem.setVisible(true);

 					bHasAccess = true;
 				}
 			});

 			// Hide entire Side Navigation if no accessible items exist
 			if (oSideNav) {
 				oSideNav.setVisible(bHasAccess);
 			}

 			// Show authorization message if no access is granted
 			if (!bHasAccess) {
 				sap.m.MessageBox.error("You're not authorized to access the application.");
 			}
 		},

 		onLoadLandingPageData: function () {

 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");
 			sap.ui.core.BusyIndicator.show(0);

 			var oLandingPageDataModel = new JSONModel();
 			var testModel = new JSONModel();

 			var oLevelIdDataModel = new JSONModel();

 			finmobview.read("/ZFI_FMA_LNDPGSet", {
 				success: function (data) {
 					console.log(data);
 					// data.results.forEach(row => {
 					// 	try {
 					// 		// Parse Zroles if it's a string and in a valid JSON format
 					// 		if (typeof row.Zroles === "string" && row.Zroles.startsWith("['") && row.Zroles.endsWith("']")) {
 					// 			row.Zroles = JSON.parse(row.Zroles.replace(/'/g, '"')); // Replace single quotes with double quotes and parse
 					// 		}
 					// 	} catch (error) {
 					// 		console.error("Error parsing Zroles:", error);
 					// 		row.Zroles = []; // Default to an empty array in case of an error
 					// 	}
 					// });
 					oLandingPageDataModel.setData(data.results);
 					that.getView().setModel(oLandingPageDataModel, "oLandingPageDataModel");
 					// var items = [];

 					// data.results.forEach(row => {
 					// 	row.arr = row.Zroles.map(role => ({
 					// 		Value1: role
 					// 	}));
 					// });
 					// oLandingPageDataModel.setProperty("/arr", items);

 					that.getView().setModel(oLandingPageDataModel, "oLandingPageDataModel");
 					// that.getView().getModel("testModel").setData(items);
 					// testModel.setData(items);
 					var levelIdData = [];
 					for (var i = 0; i < data.results.length; i++) {
 						if (data.results[i].ZlevelId === 'L01' || data.results[i].ZlevelId === 'L04') {
 							levelIdData.push(data.results[i])
 						}
 					}

 					console.log(levelIdData)

 					oLevelIdDataModel.setData(levelIdData)
 					that.getView().setModel(oLevelIdDataModel, "oLevelIdDataModel");

 					that.onLoadKPIData();

 					var oTable = that.byId("tabLandingConfig");
 					var oBinding = oTable.getBinding("items");

 					var oFilter = new sap.ui.model.Filter("ZdelInd", sap.ui.model.FilterOperator.NE, 'X');
 					oBinding.filter([oFilter])
 					that.getView().getModel().setProperty("/selectedFile", null)

 					sap.ui.core.BusyIndicator.hide(0);

 				},
 				error: function (oError) {

 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg;
 					if (responseText.indexOf("{") > -1) {
 						if (responseText != "") {
 							//	msg += JSON.parse(oError.responseText).error.message.value;
 							for (var i = 0; i < JSON.parse(oError.responseText).error.innererror.errordetails.length - 1; i++) {
 								msg += JSON.parse(oError.responseText).error.innererror.errordetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}

 					MessageBox.error(msg);
 				}
 			});
 		},

 		onLoadSubCatData: function () {

 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");
 			sap.ui.core.BusyIndicator.show(0);

 			var oSubCatDataModel = new JSONModel();

 			finmobview.read("/ZFI_FMA_SUBCATSet", {
 				success: function (data) {

 					console.log(data)
 					oSubCatDataModel.setData(data.results);
 					that.getView().setModel(oSubCatDataModel, "oSubCatDataModel");
 					sap.ui.core.BusyIndicator.hide(0);
 					// that.Display();
 				},
 				error: function (oError) {

 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg;
 					if (responseText.indexOf("{") > -1) {
 						if (responseText != "") {
 							//	msg += JSON.parse(oError.responseText).error.message.value;
 							for (var i = 0; i < JSON.parse(oError.responseText).error.innererror.errordetails.length - 1; i++) {
 								msg += JSON.parse(oError.responseText).error.innererror.errordetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}
 					MessageBox.error(msg);
 				}
 			});
 		},

 		onLoadGISReportsData: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");
 			var oGISReportModel = new JSONModel();

 			sap.ui.core.BusyIndicator.show(0);

 			finmobview.read("/GisFolderSet", {
 				success: function (data) {
 					console.log(data);

 					var aFolderData = data.results || [];

 					// Sort data by ZgisTitle to keep similar titles together
 					aFolderData.sort((a, b) => a.ZgisFolderTitle.localeCompare(b.ZgisFolderTitle));

 					// Remove duplicate entries (if OData returns duplicates)
 					var uniqueData = [];
 					var seenIds = new Set();
 					aFolderData.forEach(item => {
 						if (!seenIds.has(item.ZgisFolderId)) {
 							seenIds.add(item.ZgisFolderId);
 							uniqueData.push(item);
 						}
 					});

 					oGISReportModel.setData(uniqueData);
 					that.getView().setModel(oGISReportModel, "oGISReportModel");

 					sap.ui.core.BusyIndicator.hide(0);
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
 				}
 			});
 		},

 		onLoadShareKGISReportsData: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");
 			var oShareKGISReportModel = new JSONModel();

 			sap.ui.core.BusyIndicator.show(0);
 			var aFilters = [new sap.ui.model.Filter("Parent", sap.ui.model.FilterOperator.EQ, 'cop/GI/Finance/')];

 			finmobview.read("/ShareKGISet", {
 				filters: aFilters,
 				success: function (data) {
 					console.log(data);

 					var aFolderData = data.results || [];

 					// // Sort data by ZgisTitle to keep similar titles together
 					// aFolderData.sort((a, b) => a.ZgisFolderTitle.localeCompare(b.ZgisFolderTitle));

 					// // Remove duplicate entries (if OData returns duplicates)
 					// var uniqueData = [];
 					// var seenIds = new Set();
 					// aFolderData.forEach(item => {
 					// 	if (!seenIds.has(item.ZgisFolderId)) {
 					// 		seenIds.add(item.ZgisFolderId);
 					// 		uniqueData.push(item);
 					// 	}
 					// });

 					oShareKGISReportModel.setData(aFolderData);
 					that.getView().setModel(oShareKGISReportModel, "oShareKGISReportModel");

 					sap.ui.core.BusyIndicator.hide(0);
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
 				}
 			});
 		},

 		onShareKRowSelect: function (oEvent) {
 			debugger;
 			console.log("Row clicked");

 			var that = this;
 			var oSelectedItem = oEvent.getParameter("listItem");
 			var oContext = oSelectedItem.getBindingContext("oShareKGISReportModel");
 			var oShareKGISReportModel = new JSONModel();

 			var sChild = oContext.getProperty("Child"); // Get Folder ID
 			var sParent = oContext.getProperty("Parent"); // Get Folder Title
 			var sPath = oContext.getProperty("Path"); // Get Folder ID
 			var sName = oContext.getProperty("Name"); // Get Folder Title

 			var oTitleText = this.getView().byId("tableTitle");
 			oTitleText.setText("GIS Report Details - " + sChild);

 			var finmobview = this.getView().getModel("finmobview");
 			// var oSelectedGISReportModel = new sap.ui.model.json.JSONModel();

 			// Show Busy Indicator
 			sap.ui.core.BusyIndicator.show(0);

 			var aFilters = [new sap.ui.model.Filter("Parent", sap.ui.model.FilterOperator.EQ, sParent + sChild + '/')];
 			debugger;
 			// Fetch all data from OData
 			finmobview.read("/ShareKGISet", {
 				filters: aFilters,
 				success: function (oData) {

 					console.log(oData);

 					var aFolderData = oData.results || [];

 					// // Sort data by ZgisTitle to keep similar titles together
 					// aFolderData.sort((a, b) => a.ZgisFolderTitle.localeCompare(b.ZgisFolderTitle));

 					// // Remove duplicate entries (if OData returns duplicates)
 					// var uniqueData = [];
 					// var seenIds = new Set();
 					// aFolderData.forEach(item => {
 					// 	if (!seenIds.has(item.ZgisFolderId)) {
 					// 		seenIds.add(item.ZgisFolderId);
 					// 		uniqueData.push(item);
 					// 	}
 					// });

 					oShareKGISReportModel.setData(aFolderData);
 					that.getView().setModel(oShareKGISReportModel, "oShareKGISReportModel");

 					sap.ui.core.BusyIndicator.hide(0);

 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					console.error("Error fetching GIS data: ", oError);
 					sap.m.MessageBox.error("Failed to load GIS Report details.");
 				}
 			});
 		},

 		onRowSelect: function (oEvent) {
 			debugger;
 			console.log("Row clicked");

 			var that = this;
 			var oSelectedItem = oEvent.getParameter("listItem");
 			var oContext = oSelectedItem.getBindingContext("oGISReportModel");

 			var sSelectedFolderId = oContext.getProperty("ZgisFolderId"); // Get Folder ID
 			var sSelectedFolderTitle = oContext.getProperty("ZgisFolderTitle"); // Get Folder Title

 			var finmobview = this.getView().getModel("finmobview");
 			// var oSelectedGISReportModel = new sap.ui.model.json.JSONModel();

 			// Show Busy Indicator
 			sap.ui.core.BusyIndicator.show(0);

 			// Fetch all data from OData
 			finmobview.read("/ZFI_FMA_GISSet", {
 				success: function (oData) {
 					console.log("All Data Fetched: ", oData.results);

 					// Apply filtering manually on the frontend
 					var aFilteredData = oData.results.filter(function (item) {
 						return item.ZgisFolderId === sSelectedFolderId && item.ZgisFolderTitle === sSelectedFolderTitle;
 						// return item.ZgisFolderId === sSelectedFolderId;
 					});

 					console.log("Filtered Data: ", aFilteredData);
 					var oFilteredModel = new sap.ui.model.json.JSONModel(aFilteredData);
 					that.getView().setModel(oFilteredModel, "oSelectedGISReportModel");

 					var oFolderTitleModel = new sap.ui.model.json.JSONModel({
 						folderTitle: sSelectedFolderTitle,
 						folderId: sSelectedFolderId
 					});
 					that.getView().setModel(oFolderTitleModel, "oFolderTitleModel");

 					sap.ui.core.BusyIndicator.hide(0);

 					// Open the dialog
 					if (!that._oDetailDialog) {
 						that._oDetailDialog = sap.ui.xmlfragment("GISReportDetail", "mobilefinance.MobileFinance.fragments.GISReportItemDetails",
 							that);
 						that.getView().addDependent(that._oDetailDialog);
 					}
 					that._oDetailDialog.open();
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					console.error("Error fetching GIS data: ", oError);
 					sap.m.MessageBox.error("Failed to load GIS Report details.");
 				}
 			});
 		},
 		onRowSelectItem: function (oEvent) {

 			var finmobview = this.getView().getModel("finmobview");
 			var oSelectedGISReportModel = new sap.ui.model.json.JSONModel();

 			// Show Busy Indicator
 			sap.ui.core.BusyIndicator.show(0);

 			// Fetch all data from OData
 			finmobview.read("/ZFI_FMA_GISSet", {
 				success: function (oData) {
 					console.log("All Data Fetched: ", oData.results);

 					// Apply filtering manually on the frontend
 					var aFilteredData = oData.results.filter(function (item) {
 						return item.ZgisFolderId === sSelectedFolderId && item.ZgisFolderTitle === sSelectedFolderTitle;
 					});

 					console.log("Filtered Data: ", aFilteredData);
 					var oFilteredModel = new sap.ui.model.json.JSONModel(aFilteredData);
 					that.getView().setModel(oFilteredModel, "oSelectedGISReportModel");

 					// Set filtered data to the model
 					// oSelectedGISReportModel.setData({ results: aFilteredData });
 					// that.getView().setModel(oSelectedGISReportModel, "oSelectedGISReportModel");

 					sap.ui.core.BusyIndicator.hide(0);

 					// Open the dialog
 					if (!that._oDetailDialog) {
 						that._oDetailDialog = sap.ui.xmlfragment("GISReportDetail", "mobilefinance.MobileFinance.fragments.GISReportItemDetails",
 							that);
 						that.getView().addDependent(that._oDetailDialog);
 					}
 					that._oDetailDialog.open();
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					console.error("Error fetching GIS data: ", oError);
 					sap.m.MessageBox.error("Failed to load GIS Report details.");
 				}
 			});
 		},

 		onCloseDetailDialog: function () {
 			if (this._oDetailDialog) {
 				this._oDetailDialog.close();
 			}
 		},

 		// onLoadCalendarData: function () {
 		// 	var that = this;
 		// 	var finmobview = this.getView().getModel("finmobview");

 		// 	var oCalendarModel = new JSONModel();
 		// 	sap.ui.core.BusyIndicator.show(0);
 		// 	finmobview.read("/ZFI_FMA_EVENT_CALSet", {
 		// 		success: function (data) {
 		// 			console.log(data)
 		// 			oCalendarModel.setData(data.results);
 		// 			that.getView().setModel(oCalendarModel, "oCalendarModel")
 		// 			sap.ui.core.BusyIndicator.hide(0);
 		// 			// that.Display();
 		// 		},
 		// 		error: function (oError) {

 		// 			sap.ui.core.BusyIndicator.hide(0);
 		// 			var responseText = oError.responseText;
 		// 			var msg;
 		// 			if (responseText.indexOf("{") > -1) {
 		// 				if (responseText != "") {
 		// 					//	msg += JSON.parse(oError.responseText).error.message.value;
 		// 					for (var i = 0; i < JSON.parse(oError.responseText).error.innererror.errordetails.length - 1; i++) {
 		// 						msg += JSON.parse(oError.responseText).error.innererror.errordetails[i].message + "\n";
 		// 					}
 		// 				}
 		// 			} else {
 		// 				msg = responseText;
 		// 			}

 		// 			MessageBox.error(msg);
 		// 		}
 		// 	});
 		// }
 		//},
 		onLoadCalendarData: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			var oCalendarModel = new JSONModel();
 			sap.ui.core.BusyIndicator.show(0);

 			finmobview.read("/ZFI_FMA_EVENT_CALSet", {
 				success: function (data) {
 					oCalendarModel.setData(data.results);
 					that.getView().setModel(oCalendarModel, "oCalendarModel");
 					sap.ui.core.BusyIndicator.hide();
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					MessageBox.error("Failed to load calendar data.");
 				}
 			});
 		},

 		onColorValueHelp: function (oEvent) {
 			this._oInputField = oEvent.getSource();
 			this._oRowContext = this._oInputField.getBindingContext("oCalendarModel");

 			if (!this.ColorValueHelpDialog) {
 				this.ColorValueHelpDialog = sap.ui.xmlfragment(
 					"mobilefinance.MobileFinance.fragments.ColorValueHelp",
 					this
 				);
 				this.getView().addDependent(this.ColorValueHelpDialog);
 			}

 			this.ColorValueHelpDialog.open();
 		},

 		onColorValueHelpSearch: function (oEvent) {
 			var sValue = oEvent.getParameter("value");
 			var oFilter = new sap.ui.model.Filter("Value", sap.ui.model.FilterOperator.Contains, sValue);
 			var oBinding = oEvent.getSource().getBinding("items");
 			oBinding.filter([oFilter]);
 		},
 		onColorValueHelpClose: function (oEvent) {
 			var oSelectedItem = oEvent.getParameter("selectedItem");

 			if (oSelectedItem) {
 				var sSelectedColorName = oSelectedItem.getTitle(); // Example: "Red"
 				var sSelectedColorCode = oSelectedItem.getDescription(); // Example: "F0000F"
 				var sPath = this._oRowContext.getPath();
 				var oModel = this._oRowContext.getModel();

 				// Update the model with the color code (hex)
 				oModel.setProperty(sPath + "/Zcolor", sSelectedColorCode);

 				// Display the color name in the input field
 				if (this._oInputField) {
 					this._oInputField.setValue(sSelectedColorName);
 				}
 			}

 			// Clear filters in the dialog
 			oEvent.getSource().getBinding("items").filter([]);
 		},

 		onRoleValueHelp: function (oEvent) {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");
 			this._oInputControl = oEvent.getSource();
 			this._oRowContext = this._oInputControl.getBindingContext("oLandingPageDataModel"); // Get row context

 			if (!this._oRoleValueHelpDialog) {
 				this._oRoleValueHelpDialog = sap.ui.xmlfragment(
 					"mobilefinance.MobileFinance.fragments.RoleValueHelp",
 					this
 				);
 				this.getView().addDependent(this._oRoleValueHelpDialog);
 			}

 			// Fetch existing selected roles from MultiInput
 			var aSelectedRoles = this._oInputControl.getTokens().map(token => token.getKey());

 			finmobview.read("/UserRoleSet", {
 				success: function (oData) {
 					var oJsonModel = new sap.ui.model.json.JSONModel(oData);
 					that._oRoleValueHelpDialog.setModel(oJsonModel, "roleModel");

 					// that._oRoleValueHelpDialog.attachEventOnce("afterOpen", function () {
 					that._preselectRoles(aSelectedRoles);
 					// });

 					// Open the dialog
 					that._oRoleValueHelpDialog.open();
 				},
 				error: function (oError) {
 					MessageToast.show("Error fetching roles.");
 					console.error("OData Error:", oError);
 				}
 			});
 		},
 		_preselectRoles: function (aSelectedRoles) {
 			debugger;
 			var oList = this._oRoleValueHelpDialog.getItems();

 			// Loop through the items in the dialog
 			oList.forEach(function (oItem) {
 				var sListRole = oItem.getBindingContext("roleModel").getProperty("AgrName");

 				// Check if the role is in the selected roles array
 				if (aSelectedRoles.includes(sListRole)) {
 					oItem.setSelected(true); // Preselect the matching roles
 				}
 			});
 		},

 		onRoleValueHelpSearch: function (oEvent) {
 			var sValue = oEvent.getParameter("value");
 			var oFilter = new sap.ui.model.Filter("AgrName", sap.ui.model.FilterOperator.Contains, sValue);

 			var oList = sap.ui.core.Fragment.byId("mobilefinance.MobileFinance.fragments.RoleValueHelp", "roleList");
 			var oBinding = oList.getBinding("items");

 			oBinding.filter([oFilter]);
 		},

 		onRoleValueHelpConfirm: function (oEvent) {
 			var aSelectedItems = oEvent.getParameter("selectedItems");
 			var oInputControl = this._oInputControl; // The MultiInput field
 			var oRowContext = oInputControl.getBindingContext("oLandingPageDataModel"); // Get the row context

 			if (oInputControl && oRowContext) {
 				oInputControl.removeAllTokens(); // Clear previous tokens
 				var aSelectedRoles = [];

 				aSelectedItems.forEach(function (oItem) {
 					var sRoleTitle = oItem.getTitle();
 					aSelectedRoles.push(sRoleTitle);

 					var oToken = new sap.m.Token({
 						key: sRoleTitle,
 						text: sRoleTitle
 					});
 					oInputControl.addToken(oToken);
 				});

 				// Update model with selected roles
 				oRowContext.getModel().setProperty(oRowContext.getPath() + "/Zroles", aSelectedRoles);
 			}
 		},

 		onRoleValueHelpCancel: function () {
 			if (this._oRoleValueHelpDialog) {
 				this._oRoleValueHelpDialog.close();
 			}
 		},

 		onKPIRoleValueHelp: function (oEvent) {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");
 			this._oInputControl = oEvent.getSource();
 			this._oRowContext = this._oInputControl.getBindingContext("oVisiblityModel"); // Get row context

 			if (!this._oKPIRoleValueHelpDialog) {
 				this._oKPIRoleValueHelpDialog = sap.ui.xmlfragment(
 					"mobilefinance.MobileFinance.fragments.KPIRoleValueHelp",
 					this
 				);
 				this.getView().addDependent(this._oKPIRoleValueHelpDialog);
 			}
 			var aSelectedRoles = this._oInputControl.getTokens().map(token => token.getKey());
 			finmobview.read("/UserRoleSet", {
 				success: function (oData) {
 					var oJsonModel = new sap.ui.model.json.JSONModel(oData);
 					that._oKPIRoleValueHelpDialog.setModel(oJsonModel, "roleModel");
 					that._preselectKPIRoles(aSelectedRoles);
 					// Open the dialog
 					that._oKPIRoleValueHelpDialog.open();
 				},
 				error: function (oError) {
 					MessageToast.show("Error fetching roles.");
 					console.error("OData Error:", oError);
 				}
 			});
 		},
 		_preselectKPIRoles: function (aSelectedRoles) {
 			debugger;
 			var oList = this._oKPIRoleValueHelpDialog.getItems();

 			// Loop through the items in the dialog
 			oList.forEach(function (oItem) {
 				var sListRole = oItem.getBindingContext("roleModel").getProperty("AgrName");

 				// Check if the role is in the selected roles array
 				if (aSelectedRoles.includes(sListRole)) {
 					oItem.setSelected(true); // Preselect the matching roles
 				}
 			});
 		},

 		onKPIRoleValueHelpSearch: function (oEvent) {
 			var sValue = oEvent.getParameter("value");
 			var oFilter = new sap.ui.model.Filter("AgrName", sap.ui.model.FilterOperator.Contains, sValue);

 			var oList = sap.ui.core.Fragment.byId("mobilefinance.MobileFinance.fragments.KPIRoleValueHelp", "KPIroleList");
 			var oBinding = oList.getBinding("items");

 			oBinding.filter([oFilter]);
 		},

 		onKPIRoleValueHelpConfirm: function (oEvent) {
 			var aSelectedItems = oEvent.getParameter("selectedItems");
 			var oInputControl = this._oInputControl; // The MultiInput field
 			var oRowContext = oInputControl.getBindingContext("oVisiblityModel"); // Get the row context

 			if (oInputControl && oRowContext) {
 				oInputControl.removeAllTokens(); // Clear previous tokens
 				var aSelectedRoles = [];

 				aSelectedItems.forEach(function (oItem) {
 					var sRoleTitle = oItem.getTitle();
 					aSelectedRoles.push(sRoleTitle);

 					var oToken = new sap.m.Token({
 						key: sRoleTitle,
 						text: sRoleTitle
 					});
 					oInputControl.addToken(oToken);
 				});

 				// Update model with selected roles
 				oRowContext.getModel().setProperty(oRowContext.getPath() + "/Zrole", aSelectedRoles);
 			}
 		},

 		onKPIRoleValueHelpCancel: function () {
 			if (this._oKPIRoleValueHelpDialog) {
 				this._oKPIRoleValueHelpDialog.close();
 			}
 		},

 		onAddColorValueHelp: function (oEvent) {
 			this._oInputField = oEvent.getSource(); // Input field triggering the F4 help

 			// Load the fragment if not already loaded
 			if (!this.AddColorValueHelpDialog) {
 				this.AddColorValueHelpDialog = sap.ui.xmlfragment(
 					"mobilefinance.MobileFinance.fragments.AddColorValueHelp",
 					this
 				);
 				this.getView().addDependent(this.AddColorValueHelpDialog);
 			}

 			var oColorModel = this.getView().getModel("colorModel");
 			this.AddColorValueHelpDialog.setModel(oColorModel, "colorModel");

 			// Open the dialog
 			this.AddColorValueHelpDialog.open();
 		},

 		onAddColorValueHelpSearch: function (oEvent) {
 			var sValue = oEvent.getParameter("value");
 			var oFilter = new sap.ui.model.Filter("Value", sap.ui.model.FilterOperator.Contains, sValue);
 			var oBinding = oEvent.getSource().getBinding("items");
 			oBinding.filter([oFilter]);
 		},

 		onAddColorValueHelpClose: function (oEvent) {
 			debugger;
 			var oSelectedItem = oEvent.getParameter("selectedItem");

 			if (oSelectedItem && this._oInputField) {
 				// Get selected color details from binding context
 				var oContext = oSelectedItem.getBindingContext("colorModel");
 				var sSelectedColorName = oContext.getProperty("Value");
 				var sSelectedColorCode = oContext.getProperty("Description");

 				// Set the color name in the input field
 				this._oInputField.setValue(sSelectedColorName);

 				// Optionally, store the color code as custom data (if needed)
 				this._oInputField.data("Zcolor", sSelectedColorCode);
 				this.selectedItemDescription = sSelectedColorCode;
 			}

 			// Close the dialog
 			this.AddColorValueHelpDialog.close();
 		},

 		// onAddCompanyIdValueHelp: function (oEvent) {
 		// 	this._oInputField = oEvent.getSource(); // Input field triggering the F4 help

 		// 	// Load the fragment if not already loaded
 		// 	if (!this.AddColorValueHelpDialog) {
 		// 		this.AddColorValueHelpDialog = sap.ui.xmlfragment(
 		// 			"mobilefinance.MobileFinance.fragments.AddCompanyIdValueHelp",
 		// 			this
 		// 		);
 		// 		this.getView().addDependent(this.AddColorValueHelpDialog);
 		// 	}

 		// 	var oColorModel = this.getView().getModel("colorModel");
 		// 	this.AddColorValueHelpDialog.setModel(oColorModel, "colorModel");

 		// 	// Open the dialog
 		// 	this.AddColorValueHelpDialog.open();
 		// },
 		onAddCompanyIdValueHelp: function (oEvent) {
 			debugger;
 			this._oInputField = oEvent.getSource(); // Input field triggering the F4 help

 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");
 			var oCompanyIdModel = new JSONModel();

 			// Read data from OData entity set
 			finmobview.read("/CompanyNameSet", {
 				success: function (data) {
 					// Create a JSONModel with the OData response

 					oCompanyIdModel.setData(data.results);

 					// Load the fragment if not already loaded
 					if (!that.AddCompanyValueHelpDialog) {
 						that.AddCompanyValueHelpDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddCompanyIdValueHelp",
 							that
 						);
 						that.getView().addDependent(that.AddCompanyValueHelpDialog);
 					}

 					// Set the model to the fragment
 					that.AddCompanyValueHelpDialog.setModel(oCompanyIdModel, "oCompanyIdModel");

 					// Open the dialog
 					that.AddCompanyValueHelpDialog.open();
 				},
 				error: function (oError) {
 					sap.m.MessageToast.show("Failed to load Company ID data");
 				}
 			});
 		},

 		onAddCompanyIdValueHelpSearch: function (oEvent) {
 			var sValue = oEvent.getParameter("value");
 			var oFilter = new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.Contains, sValue);
 			var oBinding = oEvent.getSource().getBinding("items");
 			oBinding.filter([oFilter]);
 		},

 		onAddCompanyIdValueHelpClose: function (oEvent) {
 			debugger;
 			var oSelectedItem = oEvent.getParameter("selectedItem");

 			if (oSelectedItem && this._oInputField) {
 				// Get selected color details from binding context
 				var oContext = oSelectedItem.getBindingContext("oCompanyIdModel");
 				var sSelectedComID = oContext.getProperty("Name");
 				var sSelectedComName = oContext.getProperty("DsplyName");

 				// Set the color name in the input field
 				this._oInputField.setValue(sSelectedComID);
 				// this._oInputField.setValue(sSelectedComName);
 				var oCompanyNameInput = sap.ui.core.Fragment.byId("AddSharePriceDialog", "incompanydisname");
 				if (oCompanyNameInput) {
 					oCompanyNameInput.setValue(sSelectedComName);
 				}
 				// this._fetchCompanyDetailsById(sSelectedComID);

 				// Optionally, store the color code as custom data (if needed)
 				this._oInputField.data("Name", sSelectedComID);
 				this.selectedItemDescription = sSelectedComID;
 				this._oInputField.data("DsplyName", sSelectedComName);
 				this.selectedItemValue = sSelectedComName;
 			}
 			// Close the dialog
 			this.AddCompanyValueHelpDialog.close();
 		},

 		_fetchCompanyDetailsById: function (sCompanyId) {
 			debugger;
 			var oModel = this.getView().getModel("finmobview");

 			var that = this;

 			oModel.read("/CompanyNameSet", {
 				filters: [new sap.ui.model.Filter("Name", sap.ui.model.FilterOperator.EQ, sCompanyId)],
 				success: function (oData) {
 					if (oData.results && oData.results.length > 0) {
 						var oCompany = oData.results[0];
 						var sDisplayName = oCompany.DsplyName;

 						// Now bind Display Name to the input in your main dialog
 						var oCompanyNameInput = sap.ui.core.Fragment.byId("AddSharePriceDialog", "incompanydisname"); // update with correct fragment ID
 						if (oCompanyNameInput) {
 							oCompanyNameInput.setValue(sDisplayName);
 						} else {
 							console.warn("Display Name input (inpsptcat) not found.");
 						}
 					} else {
 						sap.m.MessageToast.show("Company details not found.");
 					}
 				},
 				error: function () {
 					sap.m.MessageToast.show("Error while fetching company details.");
 				}
 			});
 		},

 		onLoadKPIData: function () {

 			var that = this;
 			var data = this.getView().getModel("oLevelIdDataModel");
 			var oHBox = this.byId("idkpiwrapper");

 			var oKPIConfigModel = new JSONModel();

 			// var newEntry = [{
 			// 	"ICON_NAME": "",
 			// 	"LEVEL_ID": "",
 			// 	"SUB_ID": "Affiliates Financials",
 			// 	"WIDGET_TYPE": "",
 			// 	"CHART": "",
 			// 	"CHARTID": "01",
 			// 	"ID": "01",
 			// 	"METRIC": '',
 			// 	"KPI": "",
 			// 	"METRIC_1": "",
 			// 	"METRIC_2": "",
 			// 	"TITLE": "Tile 1",
 			// 	"DESCRIPTION": "Description 1",
 			// 	"SIZE": "",
 			// }, {
 			// 	"ICON_NAME": "",
 			// 	"LEVEL_ID": "",
 			// 	"SUB_ID": "Affiliates Financials",
 			// 	"WIDGET_TYPE": "",
 			// 	"CHART": "",
 			// 	"CHARTID": "02",
 			// 	"ID": "02",
 			// 	"METRIC": '',
 			// 	"KPI": "",
 			// 	"METRIC_1": "",
 			// 	"METRIC_2": "",
 			// 	"TITLE": "Tile 2",
 			// 	"DESCRIPTION": "Description 2",
 			// 	"SIZE": "",
 			// }, {
 			// 	"ICON_NAME": "",
 			// 	"LEVEL_ID": "",
 			// 	"SUB_ID": "Market Watch",
 			// 	"WIDGET_TYPE": "",
 			// 	"CHART": "",
 			// 	"CHARTID": "02_check",
 			// 	"ID": "02",
 			// 	"METRIC": '',
 			// 	"KPI": "",
 			// 	"METRIC_1": "",
 			// 	"METRIC_2": "",
 			// 	"TITLE": "Tile 3",
 			// 	"DESCRIPTION": "Description 3",
 			// 	"SIZE": "",
 			// }, {
 			// 	"ICON_NAME": "",
 			// 	"LEVEL_ID": "",
 			// 	"SUB_ID": "Testing",
 			// 	"WIDGET_TYPE": "",
 			// 	"CHART": "",
 			// 	"CHARTID": "01_check",
 			// 	"ID": "01",
 			// 	"METRIC": '',
 			// 	"KPI": "",
 			// 	"METRIC_1": "",
 			// 	"METRIC_2": "",
 			// 	"TITLE": "Tile 3",
 			// 	"DESCRIPTION": "Description 3",
 			// 	"SIZE": "",
 			// }];

 			// var oHBox1 = this.getView().byId("kpiHBox");
 			// oHBox1.removeAllItems();

 			// var groupedData = newEntry.reduce(function (acc, curr) {
 			// 	if (!acc[curr.SUB_ID]) {
 			// 		acc[curr.SUB_ID] = [];
 			// 	}
 			// 	acc[curr.SUB_ID].push(curr);
 			// 	return acc;
 			// }, {});

 			// console.log("groupedData", groupedData)
 			// Object.keys(groupedData).forEach(function (subId) {
 			// 	// Create a VBox for the section
 			// 	var oSectionVBox = new sap.m.VBox({
 			// 		width: "100%",
 			// 		items: [
 			// 			// Section title
 			// 			new sap.m.Title({
 			// 				text: subId,
 			// 				level: "H3"
 			// 			}).addStyleClass("sectionTitle"),
 			// 			// Tile container
 			// 			new sap.m.HBox({
 			// 				wrap: "Wrap",
 			// 				alignItems: "Start",
 			// 				justifyContent: "Start",
 			// 				items: groupedData[subId].map(function (oData) {

 			// 					var oTileVBox = new sap.m.VBox({
 			// 						width: "300px", // Adjust width of tiles
 			// 						items: [
 			// 							new sap.m.Text({
 			// 								text: oData.TITLE
 			// 							}).addStyleClass("tileTitle"),
 			// 							new sap.m.Text({
 			// 								text: oData.DESCRIPTION
 			// 							}).addStyleClass("tileDescription"),
 			// 							// Chart placeholder
 			// 							// new sap.ui.core.HTML({
 			// 							// 	content: `<div id="${chartId}" style="height: 150px;"></div>`,
 			// 							// 	afterRendering: function () {
 			// 							// 		// Initialize chart after the HTML element is rendered
 			// 							// 		var chart = new ApexCharts(document.getElementById(chartId), {
 			// 							// 			chart: {
 			// 							// 				type: "line",
 			// 							// 				height: 150
 			// 							// 			},
 			// 							// 			series: [{
 			// 							// 				name: oData.TITLE,
 			// 							// 				data: [10, 20, 30, 40] // Sample data
 			// 							// 			}],
 			// 							// 			xaxis: {
 			// 							// 				categories: ["Data1", "Data2", "Data3", "Data4"]
 			// 							// 			}
 			// 							// 		});
 			// 							// 		chart.render();
 			// 							// 	}

 			// 							// }),
 			// 							new sap.ui.core.HTML({
 			// 								content: "<div id='" + oData.CHARTID + "' class='chartContainer'></div>",
 			// 								afterRendering: that.onAfterRenderingChart.bind(that, oData.CHARTID, oData.ID, oData.TITLE)
 			// 							}),
 			// 							new sap.m.Button({
 			// 								icon: "sap-icon://edit",
 			// 								press: function () {
 			// 									sap.m.MessageToast.show("Edit clicked for " + oData.TITLE);
 			// 								}
 			// 							}).addStyleClass("tileActionButton")
 			// 						]
 			// 					}).addStyleClass("tileContainer");

 			// 					return oTileVBox;
 			// 				})
 			// 			}).addStyleClass("tileFlexBox")
 			// 		]
 			// 	}).addStyleClass("sectionContainer");

 			// 	// Add each section VBox to the main container
 			// 	oHBox1.addItem(oSectionVBox);
 			// });
 			var newEntry = []
 			oKPIConfigModel.setData(newEntry);
 			this.getView().setModel(oKPIConfigModel, "oKPIConfigModel")

 			var oKPIAddNewVisibility = new JSONModel();
 			var visData = {
 				"subIdEnable": false,
 				"widgetEnable": false,
 				"chartTypeEnable": false,
 				"metricsEnable": false,
 				"genDetsEnable": false
 			}
 			oKPIAddNewVisibility.setData(visData)
 			this.getView().setModel(oKPIAddNewVisibility, "oKPIAddNewVisibility")

 			var oWidgetTypeDataModel = new JSONModel();
 			var widgetData = [{
 				"id": "01",
 				"desc": "Chart"
 			}, {
 				"id": "02",
 				"desc": "Metric"
 			}]
 			oWidgetTypeDataModel.setData(widgetData)
 			this.getView().setModel(oWidgetTypeDataModel, "oWidgetTypeDataModel")

 			var oChartTypeDataModel = new JSONModel();
 			var chartData = [{
 				"id": "01",
 				"desc": "Single Line Chart"
 			}, {
 				"id": "02",
 				"desc": "Multi Line Chart"
 			}, {
 				"id": "03",
 				"desc": "Single Bar Graph Chart"
 			}, {
 				"id": "04",
 				"desc": "Multi Bar Graph Chart"
 			}, {
 				"id": "05",
 				"desc": "Pie Chart"
 			}]
 			oChartTypeDataModel.setData(chartData)
 			this.getView().setModel(oChartTypeDataModel, "oChartTypeDataModel");

 			var oMetricsDataModel = new JSONModel();
 			var metricsData = [{
 				"id": "01",
 				"desc": "Actual"
 			}, {
 				"id": "02",
 				"desc": "Plan"
 			}, {
 				"id": "03",
 				"desc": "Variance"
 			}, {
 				"id": "04",
 				"desc": "This Month"
 			}, {
 				"id": "05",
 				"desc": "This Qtr"
 			}]
 			oMetricsDataModel.setData(metricsData)
 			this.getView().setModel(oMetricsDataModel, "oMetricsDataModel")

 			var oKPIListDataModel = new JSONModel();
 			var kpidata = [{
 				"id": "01",
 				"desc": "KPI1"
 			}, {
 				"id": "02",
 				"desc": "KPI2"
 			}, ]
 			oKPIListDataModel.setData(kpidata)
 			this.getView().setModel(oKPIListDataModel, "oKPIListDataModel")

 			var oSizeDataModel = new JSONModel();
 			var sizeData = [{
 				"id": "01",
 				"desc": "Half"
 			}, {
 				"id": "02",
 				"desc": "Full"
 			}, ]
 			oSizeDataModel.setData(sizeData)
 			this.getView().setModel(oSizeDataModel, "oSizeDataModel")

 			var oSubLevelIdDataModel = new JSONModel()
 			oSubLevelIdDataModel.setData([]);
 			this.getView().getModel(oSubLevelIdDataModel, "oSubLevelIdDataModel")

 			// oHBox.removeAllItems();
 			// data.forEach
 		},

 		onAfterRenderingChart1: function () {
 			var options = {
 				series: [{
 					name: "Desktops",
 					data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
 				}],
 				chart: {
 					height: 350,
 					type: 'line',
 					zoom: {
 						enabled: false
 					}
 				},
 				dataLabels: {
 					enabled: false
 				},
 				stroke: {
 					curve: 'straight'
 				},
 				title: {
 					text: 'Product Trends by Month',
 					align: 'left'
 				},
 				grid: {
 					row: {
 						colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
 						opacity: 0.5
 					},
 				},
 				xaxis: {
 					categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
 				}
 			};

 			var chart = new ApexCharts(document.querySelector("#chart1"), options);
 			chart.render();
 		},

 		onChangeKPILevelId: function (oEvent) {
 			debugger;
 			console.log(oEvent);
 			var selectedKey = oEvent.getSource().getSelectedKey();
 			var oSubCatDataModel = this.getView().getModel("oSubCatDataModel").getData()

 			var oSubLevelIdDataModel = new JSONModel()

 			if (selectedKey) {
 				var aFilteredData = oSubCatDataModel.filter(function (item) {
 					return item.ZlevelId == selectedKey;
 				});
 				console.log(aFilteredData)
 				if (aFilteredData.length) {

 					oSubLevelIdDataModel.setData(aFilteredData);
 					this.getView().setModel(oSubLevelIdDataModel, "oSubLevelIdDataModel")

 					var oKPIAddNewVisibility = new JSONModel()

 					var visData = {
 						"subIdEnable": true,
 						"widgetEnable": false,
 						"chartTypeEnable": false,
 						"metricsEnable": false,
 						"genDetsEnable": false
 					}

 					oKPIAddNewVisibility.setData(visData)

 					this.getView().setModel(oKPIAddNewVisibility, "oKPIAddNewVisibility")
 				} else {
 					// sap.ui.getCore().byId("inpsubcatsubid").setValue('S01');
 					var oKPIAddNewVisibility = new JSONModel()

 					var visData = {
 						"subIdEnable": false,
 						"widgetEnable": false,
 						"chartTypeEnable": false,
 						"metricsEnable": false,
 						"genDetsEnable": false
 					}

 					oKPIAddNewVisibility.setData(visData)

 					this.getView().setModel(oKPIAddNewVisibility, "oKPIAddNewVisibility")
 					MessageBox.error("No Sub Cat found!!!");
 				}
 			}

 		},

 		onChangeKPISubId: function (oEvent) {
 			debugger;
 			console.log(oEvent);
 			var selectedKey = oEvent.getSource().getSelectedKey();

 			if (selectedKey) {
 				var oKPIAddNewVisibility = new JSONModel()

 				var visData = {
 					"subIdEnable": true,
 					"widgetEnable": true,
 					"chartTypeEnable": false,
 					"metricsEnable": false,
 					"genDetsEnable": false
 				}

 				oKPIAddNewVisibility.setData(visData)

 				this.getView().setModel(oKPIAddNewVisibility, "oKPIAddNewVisibility")
 			}
 		},

 		onChangeKPIWidget: function (oEvent) {

 			debugger;
 			console.log(oEvent);
 			var selectedKey = oEvent.getSource().getSelectedKey();

 			if (selectedKey) {
 				var oKPIAddNewVisibility = new JSONModel()
 				var visData = {};
 				if (selectedKey === "01") {
 					visData = {
 						"subIdEnable": true,
 						"widgetEnable": true,
 						"chartTypeEnable": true,
 						"metricsEnable": true,
 						"genDetsEnable": true
 					}
 				} else {
 					visData = {
 						"subIdEnable": true,
 						"widgetEnable": true,
 						"chartTypeEnable": false,
 						"metricsEnable": true,
 						"genDetsEnable": true
 					}
 				}

 				oKPIAddNewVisibility.setData(visData)

 				this.getView().setModel(oKPIAddNewVisibility, "oKPIAddNewVisibility")
 			}

 		},

 		onAddNewKPIItem: function () {
 			debugger;
 			var that = this;
 			var inpkpiprntlvl = sap.ui.getCore().byId("inpkpiprntlvl");
 			var inpkpisublvl = sap.ui.getCore().byId("inpkpisublvl");
 			var inpkpiwdgttyp = sap.ui.getCore().byId("inpkpiwdgttyp");
 			var inpkpichrttyp = sap.ui.getCore().byId("inpkpichrttyp");
 			var inpkpimetric1 = sap.ui.getCore().byId("inpkpimetric1");
 			var inpkpimetric2 = sap.ui.getCore().byId("inpkpimetric2");
 			var inpkpititle = sap.ui.getCore().byId("inpkpititle");
 			var inpkpidesc = sap.ui.getCore().byId("inpkpidesc");
 			var inpkpisize = sap.ui.getCore().byId("inpkpisize");
 			var inpkpidets = sap.ui.getCore().byId("inpkpidets");

 			var oKPITokens = inpkpidets.getTokens();
 			var aKPITokenValues = oKPITokens.map(function (oToken) {
 				return oToken.getKey();
 			});

 			var oKPIConfigModel = this.getView().getModel("oKPIConfigModel");
 			var oKPIData = oKPIConfigModel.getData();

 			var newEntry = {
 				"ICON_NAME": this.selectedIcon,
 				"LEVEL_ID": inpkpiprntlvl.getSelectedKey(),
 				"LEVEL_IDTXT": inpkpiprntlvl._getSelectedItemText(),
 				"SUB_ID": inpkpisublvl.getSelectedKey(),
 				"SUB_IDTXT": inpkpiprntlvl.getSelectedKey() + " - " + inpkpisublvl._getSelectedItemText(),
 				"WIDGET_TYPE_ID": inpkpiwdgttyp.getSelectedKey(),
 				"WIDGET_TYPE": inpkpiwdgttyp._getSelectedItemText(),
 				"CHART": inpkpichrttyp._getSelectedItemText(),
 				"ID": inpkpichrttyp.getSelectedKey(),
 				"CHARTID": inpkpichrttyp.getSelectedKey() + '_' + +new Date().getTime(),
 				"METRIC": '',
 				"KPI": aKPITokenValues,
 				"METRIC_1": inpkpimetric1._getSelectedItemText(),
 				"METRIC_2": inpkpimetric2._getSelectedItemText(),
 				"TITLE": inpkpititle.getValue(),
 				"DESCRIPTION": inpkpidesc.getValue(),
 				"SIZE": inpkpisize._getSelectedItemText(),
 			};

 			oKPIData.push(newEntry);

 			var oHBox1 = this.getView().byId("kpiHBox");
 			oHBox1.removeAllItems();

 			var groupedData = oKPIData.reduce(function (acc, curr) {
 				if (!acc[curr.SUB_IDTXT]) {
 					acc[curr.SUB_IDTXT] = [];
 				}
 				acc[curr.SUB_IDTXT].push(curr);
 				return acc;
 			}, {});

 			Object.keys(groupedData).forEach(function (subId) {

 				var oSectionVBox = new sap.m.VBox({
 					width: "100%",
 					items: [
 						new sap.m.Title({
 							text: subId,
 							level: "H3"
 						}).addStyleClass("sectionTitle"),

 						new sap.m.HBox({
 							wrap: "Wrap",
 							alignItems: "Start",
 							justifyContent: "Start",
 							items: groupedData[subId].map(function (oData) {

 								var oTileVBox = new sap.m.VBox({
 									width: "300px", // Adjust width of tiles
 									items: [
 										new sap.m.HBox({
 											items: [
 												new sap.m.Text({
 													text: oData.TITLE
 												}).addStyleClass("tileTitle"),
 												new sap.m.Button({
 													icon: "sap-icon://edit",
 													press: function () {
 														that.onPressEditKPIItem(oData)
 															// sap.m.MessageToast.show("Edit clicked for " + oData.TITLE);
 													}
 												}).addStyleClass("tileActionButton"),
 											]
 										}).addStyleClass("kpiHBoxHeader"),

 										new sap.ui.core.HTML({
 											content: "<div id='" + oData.CHARTID + "' class='chartContainer'></div>",
 											afterRendering: that.onAfterRenderingChart.bind(that, oData.CHARTID, oData.ID, oData.DESCRIPTION)
 										}),

 									]
 								}).addStyleClass("tileContainer");

 								return oTileVBox;
 							})
 						}).addStyleClass("tileFlexBox")
 					]
 				}).addStyleClass("sectionContainer");

 				oHBox1.addItem(oSectionVBox);
 			});

 			oKPIConfigModel.setData(oKPIData);
 			this.getView().setModel(oKPIConfigModel, "oKPIConfigModel");

 			this.AddNewKPIItemDialog.close();
 			console.log(newEntry);
 		},

 		onAfterRenderingChart: function (chartid, id, title, oEvent) {
 			var sChartId = chartid;
 			var chartWidth = 340; // Fixed width
 			var chartHeight = 340; // Fixed height

 			// Define chart options based on the ID
 			var options;
 			if (id === "01") {
 				options = {
 					series: [{
 						name: "Label",
 						data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
 					}],
 					chart: {
 						height: chartHeight,
 						width: chartWidth,
 						type: 'line',
 						zoom: {
 							enabled: false
 						},
 						toolbar: {
 							show: false
 						}
 					},
 					dataLabels: {
 						enabled: false
 					},
 					stroke: {
 						curve: 'straight'
 					},
 					grid: {
 						row: {
 							colors: ['#f3f3f3', 'transparent'],
 							opacity: 0.5
 						}
 					},
 					xaxis: {
 						categories: ['Data1', 'Data2', 'Data3', 'Data4', 'Data5', 'Data6', 'Data7', 'Data8', 'Data9']
 					}
 				};
 			} else if (id === "02") {
 				options = {
 					series: [{
 						name: "High",
 						data: [28, 29, 33, 36, 32, 32, 33]
 					}, {
 						name: "Low",
 						data: [12, 11, 14, 18, 17, 13, 13]
 					}],
 					chart: {
 						height: chartHeight,
 						width: chartWidth,
 						type: 'line',
 						dropShadow: {
 							enabled: false
 						},
 						zoom: {
 							enabled: false
 						},
 						toolbar: {
 							show: false
 						}
 					},
 					colors: ['#77B6EA', '#545454'],
 					dataLabels: {
 						enabled: true
 					},
 					stroke: {
 						curve: 'smooth'
 					},
 					grid: {
 						borderColor: '#e7e7e7',
 						row: {
 							colors: ['#f3f3f3', 'transparent'],
 							opacity: 0.5
 						}
 					},
 					markers: {
 						size: 1
 					},
 					xaxis: {
 						categories: ['Data1', 'Data2', 'Data3', 'Data4', 'Data5', 'Data6', 'Data7'],
 						title: {
 							text: 'xaxis'
 						}
 					},
 					yaxis: {
 						title: {
 							text: 'yaxis'
 						},
 						min: 5,
 						max: 40
 					},
 					legend: {
 						position: 'top',
 						horizontalAlign: 'right',
 						floating: true,
 						offsetY: -25,
 						offsetX: -5
 					}
 				};
 			} else if (id === "03") {
 				options = {
 					series: [{
 						data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
 					}],
 					chart: {
 						type: 'bar',
 						width: chartWidth,
 						height: chartHeight,
 					},
 					plotOptions: {
 						bar: {
 							borderRadius: 4,
 							borderRadiusApplication: 'end',
 							horizontal: true,
 						}
 					},
 					dataLabels: {
 						enabled: false
 					},
 					xaxis: {
 						categories: ['Data1', 'Data2', 'Data3', 'Data4', 'Data5', 'Data6', 'Data7', 'Data8', 'Data9', 'Data10'],
 					}
 				};
 			} else if (id === "04") {
 				options = {
 					series: [{
 						data: [44, 55, 41, 64, 22, 43, 21]
 					}, {
 						data: [53, 32, 33, 52, 13, 44, 32]
 					}],
 					chart: {
 						type: 'bar',
 						width: chartWidth,
 						height: chartHeight,
 					},
 					plotOptions: {
 						bar: {
 							horizontal: true,
 							dataLabels: {
 								position: 'top',
 							},
 						}
 					},
 					dataLabels: {
 						enabled: true,
 						offsetX: -6,
 						style: {
 							fontSize: '12px',
 							colors: ['#fff']
 						}
 					},
 					stroke: {
 						show: true,
 						width: 1,
 						colors: ['#fff']
 					},
 					tooltip: {
 						shared: true,
 						intersect: false
 					},
 					xaxis: {
 						categories: [2001, 2002, 2003, 2004, 2005, 2006, 2007],
 					},
 				};
 			} else if (id === "05") {
 				options = {
 					series: [44, 55, 13, 43, 22],
 					chart: {
 						width: chartWidth,
 						height: chartHeight,
 						type: 'pie'
 					},
 					labels: ['Data1', 'Data2', 'Data3', 'Data4', 'Data5'],
 					responsive: [{
 						breakpoint: 480,
 						options: {
 							chart: {
 								width: 200
 							},
 							legend: {
 								position: 'bottom'
 							}
 						}
 					}]
 				};
 			}

 			// Initialize and render the chart
 			var chart = new ApexCharts(document.getElementById(sChartId), options);
 			chart.render();
 		},

 		onPressEditKPIItem: function (oData) {

 			debugger;
 			if (!this.EditKPIItemDialog) {
 				this.EditKPIItemDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.EditKPIItem", this);
 				this.getView().addDependent(this.EditKPIItemDialog);

 			}
 			sap.ui.getCore().byId("inpkpiprntlvledt").setSelectedKey(oData.LEVEL_ID);
 			sap.ui.getCore().byId("inpkpisublvledt").setSelectedKey(oData.SUB_ID);
 			sap.ui.getCore().byId("inpkpiwdgttypedt").setSelectedKey(oData.WIDGET_TYPE_ID);
 			sap.ui.getCore().byId("inpkpichrttypedt").setSelectedKey(oData.ID);
 			sap.ui.getCore().byId("inpkpimetric1edt").setSelectedKey(oData.METRIC_1);
 			sap.ui.getCore().byId("inpkpimetric2edt").setSelectedKey(oData.METRIC_2);
 			// sap.ui.getCore().byId("inpkpidetsedt").setSelectedKey(oData.LEVEL_ID);
 			sap.ui.getCore().byId("inpkpititleedt").setValue(oData.TITLE);
 			sap.ui.getCore().byId("inpkpidescedt").setValue(oData.DESCRIPTION);
 			sap.ui.getCore().byId("inpkpisizeedt").setSelectedKey(oData.SIZE);

 			var oKPIAddNewVisibility = new JSONModel();
 			var visData = {
 				"subIdEnable": true,
 				"widgetEnable": true,
 				"chartTypeEnable": false,
 				"metricsEnable": true,
 				"genDetsEnable": true
 			}

 			oKPIAddNewVisibility.setData(visData)

 			this.getView().setModel(oKPIAddNewVisibility, "oKPIAddNewVisibility")

 			this.EditKPIItemDialog.open();

 		},

 		onUpdateKPIItem: function () {

 		},

 		onItemSelect: function (oEvent) {
 			var oItem = oEvent.getParameter("item");

 			this.byId("pageContainer").to(this.getView().createId(oItem.getKey()));

 		},

 		onAdminControlTabSelect: function (oEvent) {
 			// debugger;
 			this.selectedAdminTabKey = oEvent.getSource().getSelectedKey()
 		},

 		onSelectionChange: function (oEvent) {
 			// debugger;
 			// const table = this.byId("tabLandingConfig");
 			// const selectedItem = oEvent.getParameter("listItem");

 			// if (selectedItem) {
 			// 	const isSelected = table.getSelectedItem() === selectedItem;
 			// 	if (isSelected) {
 			// 		// Unselect the item programmatically
 			// 		table.removeSelections(true);
 			// 	}
 			// }

 		},

 		onAttachButtonClick: function (oEvent) {
 			debugger;
 			var that = this;
 			const oButton = oEvent.getSource();

 			const oBindingContext = oButton.getBindingContext("oLandingPageDataModel");
 			if (oBindingContext) {
 				const oLineItemData = oBindingContext.getObject();
 				console.log(oLineItemData)
 				this._currentParam = oLineItemData

 				if (this._currentParam.ZiName) {
 					var finmobview = this.getView().getModel("finmobview");
 					var sUrl = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/IconSet('" + this._currentParam.ZlevelId +
 						"')/$value"
 					sap.ui.core.BusyIndicator.show(0);
 					var attachmentname = '';
 					var objUrl = '';
 					fetch(sUrl, {
 							method: 'GET',
 							headers: {
 								'Content-Type': 'application/octet-stream'
 							}
 						})
 						.then(response => {
 							return response.blob().then(blob => ({
 								blob: blob,
 								filename: response.headers.get('Filename')

 							}));
 						})
 						.then(data => {
 							var objectURL = URL.createObjectURL(data.blob);
 							that._addFileUploader(objectURL, that._currentParam.ZiName);
 						})
 						.catch(error => console.error('Error fetching the file:', error));
 				} else {

 					var oVBox = this.byId("fileUploaderContainer");
 					oVBox.removeAllItems();

 					var oFileUploader = new sap.ui.unified.FileUploader({
 						name: "file",
 						placeholder: "Supported formats: jpg, jpeg, png.",
 						width: "25rem",
 						fileType: "jpg,jpeg,png",
 						change: this.onFileChange.bind(this),
 						uploadUrl: "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/IconSet",
 						enabled: "{buttonModel>/editable}",
 						useMultipart: false,
 						sendXHR: true,
 						// press: this.onFileUploaderClick.bind(this)
 					});

 					var oText = new sap.m.Text({
 						text: "Maximum file size: 5 MB.",
 						wrapping: true,
 					}).addStyleClass("file-size-msg")

 					var oHBox = new sap.ui.layout.HorizontalLayout({
 						content: [
 							oFileUploader,
 							oText
 						]
 					}).addStyleClass("custom-file-layout");

 					var fileUrl = this.getView().getModel().getProperty("/selectedFile")
 					var fileUrl = ''
 					var viewBtn = new sap.m.Button({
 						icon: "sap-icon://show",
 						type: "Ghost",
 						press: function () {
 							that.viewFile(fileUrl);
 						}
 					}).addStyleClass("custom-button1");

 					var downloadBtn = new sap.m.Button({
 						icon: "sap-icon://download",
 						type: "Ghost",
 						press: function () {
 							that.downloadFile();
 						}
 					}).addStyleClass("custom-button1");

 					var removeBtn = new sap.m.Button({
 						icon: "sap-icon://decline",
 						type: "Ghost",
 						visible: "{buttonModel>/editable}",
 						press: function () {
 							that.removeAttachment();
 						}
 					}).addStyleClass("custom-button1");

 					oVBox.addItem(oHBox);

 					oVBox.addItem(viewBtn);

 					oVBox.addItem(downloadBtn);

 					oVBox.addItem(removeBtn);
 					oVBox.addStyleClass("crtnwstrgdialogcls");

 					this.byId("fileUploadDialog").open();
 				}

 			}

 		},

 		_addFileUploader: function (fileUrl, filename) {
 			var that = this;

 			var oVBox = this.byId("fileUploaderContainer");
 			oVBox.removeAllItems();

 			var oFileUploader = new sap.ui.unified.FileUploader({
 				name: "file",
 				placeholder: "Supported formats: jpg, jpeg, png.",
 				width: "25rem",
 				fileType: "jpg,jpeg,png",
 				change: that.onFileChange.bind(this),
 				uploadUrl: "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/IconSet",
 				enabled: "{buttonModel>/editable}",
 				useMultipart: false,
 				sendXHR: true
 			});

 			var oText = new sap.m.Text({
 				text: "Maximum file size: 5 MB.",
 				wrapping: true,
 			}).addStyleClass("file-size-msg")

 			var oHBox = new sap.ui.layout.HorizontalLayout({
 				content: [
 					oFileUploader,
 					oText
 				]
 			}).addStyleClass("custom-file-layout");

 			var viewBtn = new sap.m.Button({
 				icon: "sap-icon://show",
 				type: "Ghost",
 				press: function () {
 					that.viewFile(fileUrl);
 				}
 			}).addStyleClass("custom-button1");

 			var downloadBtn = new sap.m.Button({
 				icon: "sap-icon://download",
 				type: "Ghost",
 				press: function () {
 					that.downloadFile();
 				}
 			}).addStyleClass("custom-button1");

 			var removeBtn = new sap.m.Button({
 				icon: "sap-icon://decline",
 				type: "Ghost",
 				visible: "{buttonModel>/editable}",
 				press: function () {
 					that.removeAttachment();
 				}
 			}).addStyleClass("custom-button1");

 			// Set the file URL and filename if provided
 			if (filename) {
 				oFileUploader.setValue(filename);
 				// oFileUploader._setFileName(filename); // SAP UI5 internal method
 				// Add a custom download link
 				// var oLink = new sap.m.Link({
 				// 	text: filename,
 				// 	href: fileUrl,
 				// 	target: "_blank"
 				// });
 				// oVBox.addItem(oLink);
 			}

 			oVBox.addItem(oHBox);

 			oVBox.addItem(viewBtn);

 			oVBox.addItem(downloadBtn);

 			oVBox.addItem(removeBtn);

 			oVBox.addStyleClass("crtnwstrgdialogcls");
 			sap.ui.core.BusyIndicator.hide(0);
 			this.byId("fileUploadDialog").open();

 		},

 		viewFile: function (fileUrl) {
 			var fileUrlView = this.getView().getModel().getProperty("/selectedFile")
 			if (this._currentParam.ZiName) {
 				window.open(fileUrl, "_blank")
 			} else if (fileUrlView) {
 				window.open(fileUrlView, "_blank")
 			} else {
 				MessageBox.error("No file selected.");
 			}
 		},

 		downloadFile: function () {
 			var fileUrl = this.getView().getModel().getProperty("/selectedFile")
 			console.log(fileUrl)
 			if (this._currentParam.ZiName) {
 				var sUrl = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/IconSet('" + this._currentParam.ZlevelId +
 					"')/$value"
 				var attachmentname = '';
 				var objUrl = '';
 				sap.m.URLHelper.redirect(sUrl, true)
 			} else if (fileUrl) {
 				// sap.m.URLHelper.redirect(fileUrl, true)
 				var a = document.createElement("a");
 				a.href = this._fileUrl;
 				a.download = this._fileName;
 				document.body.appendChild(a);
 				a.click();
 				document.body.removeChild(a);
 			} else {
 				MessageBox.error("No file selected.");
 			}
 		},

 		removeAttachment: function () {
 			debugger;
 			if (this._currentParam.ZiName) {

 				var that = this
 				var finmobview = this.getView().getModel("finmobview");
 				MessageBox.confirm("Are you sure you want to delete?", {
 					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
 					onClose: function (oAction) {
 						if (oAction === MessageBox.Action.YES) {
 							// User confirmed deletion, proceed with API call
 							sap.ui.core.BusyIndicator.show(0);

 							finmobview.remove("/IconSet('" + that._currentParam.ZlevelId +
 								"')/$value", {
 									success: function (data) {
 										console.log(data);
 										sap.ui.core.BusyIndicator.hide();
 										// var oData = that.getView().getModel("oStorageYardModel").getData()
 										// for (var i = 0; i < oData.length; i++) {
 										// 	var paramToItem = oData[i].NavDynParamHeadToItem.results
 										// 	for (var j = 0; j < paramToItem.length; j++) {
 										// 		if ((that._currentParam.BlockSeq === paramToItem[j].BlockSeq) && (that._currentParam.FieldSeq === paramToItem[j].FieldSeq)) {
 										// 			paramToItem[j].Attachmentid = '';
 										// 			paramToItem[j].fileName = '';
 										// 			paramToItem[j].appType = '';
 										// 			that._currentParam.Attachmentid = '';
 										// 		}

 										// 	}
 										// }
 										// debugger;
 										// var id = '';
 										// for (var i = 0; i < that._dynamicIds.length; i++) {
 										// 	if ((that._currentParam.BlockSeq === that._dynamicIds[i].BlockSeq) && (that._currentParam.FieldSeq === that._dynamicIds[
 										// 			i].FieldSeq)) {
 										// 		id = that._dynamicIds[i].uniqueId
 										// 	}
 										// }

 										// var oButton = sap.ui.getCore().byId(id);
 										// oButton.addStyleClass("custom-button2");
 										// oButton.removeStyleClass("attachment-filled-button1");

 										sap.ui.core.BusyIndicator.hide(0);
 										that._fileName = ''
 										that._fileUrl = ''
 										that.getView().getModel().setProperty("/selectedFile", null)
 										MessageBox.success("Deleted successfully!", {
 											onClose: function (oAction) {
 												that.byId("fileUploadDialog").close();
 												that.onLoadLandingPageData();
 											}
 										});
 									},
 									error: function (oError) {
 										console.log(oError);
 										sap.ui.core.BusyIndicator.hide();
 										var responseText = oError.responseText;
 										var msg = "";

 										if (responseText.indexOf("{") > -1) {
 											if (responseText !== "") {
 												var errorDetails = JSON.parse(oError.responseText).error.innererror.errordetails;
 												for (var i = 0; i < errorDetails.length - 1; i++) {
 													msg += errorDetails[i].message + "\n";
 												}
 											}
 										} else {
 											msg = responseText;
 										}

 										MessageBox.error(msg);
 									}
 								});
 						}
 					}
 				});

 			}

 		},

 		onFileChange: function (oEvent) {
 			debugger;
 			var oFileUploader = oEvent.getSource();

 			var oFile = oEvent.getParameter("files")[0];
 			var iMaxFileSize = 5 * 1024 * 1024;

 			if (oFile && oFile.size > iMaxFileSize) {
 				sap.m.MessageToast.show("File size must not exceed 5 MB.");
 				oFileUploader.setValue("");
 			} else {
 				var aFiles = oEvent.getParameter("files");

 				var oFile = oFileUploader.getDomRef().querySelector('input[type="file"]');
 				var file = oFile.files[0];
 				if (file) {
 					var sFileUrl = URL.createObjectURL(file);

 					var sFileUrlData = URL.createObjectURL(aFiles[0]);

 					this._fileUrl = sFileUrlData;
 					this._fileName = aFiles[0].name;

 					this.getView().getModel().setProperty("/selectedFile", sFileUrlData);

 				} else {
 					MessageBox.error("No file selected.");
 				}

 				if (aFiles.length > 1) { // Assuming only one file per uploader
 					MessageToast.show("You can only upload one file at a time.");
 					oFileUploader.clear();
 				}
 			}

 		},

 		onUploadFiles: function () {
 			var that = this;
 			debugger;
 			// var oStorageYardHeaderModel = this.getView().getModel("oStorageYardHeaderModel");
 			var oFileUploader = this.byId("fileUploaderContainer").getItems()[0];
 			var fileInput = oFileUploader.getDomRef().querySelector('input[type="file"]');

 			if (fileInput && fileInput.files && fileInput.files.length > 0) {
 				var file = fileInput.files[0];
 				console.log("File name: " + file.name);
 			} else {
 				MessageBox.error("No file selected.");
 				return;
 			}

 			if (file || this._currentParam.Zicon) {
 				debugger;
 				var reader = new FileReader();
 				sap.ui.core.BusyIndicator.show(0);
 				reader.onload = function (e) {
 					var fileContent = e.target.result.split(",")[1]; // Get base64 content
 					var finmobview = that.getView().getModel("finmobview");
 					console.log(fileContent)
 					var slugValue = file.name + '~' + that._currentParam.ZlevelId
 					oFileUploader.getContent()[0].destroyHeaderParameters();
 					oFileUploader.getContent()[0].addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
 						name: "slug",
 						value: slugValue
 					}));

 					oFileUploader.getContent()[0].addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
 						name: "content-type",
 						value: file.type
 					}));

 					oFileUploader.getContent()[0].addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
 						name: "X-Requested-With",
 						value: "X"
 					}));

 					var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZFI_MOBILE_SRV/");
 					var key = oModel.getSecurityToken()
 					oFileUploader.getContent()[0].addHeaderParameter(new sap.ui.unified.FileUploaderParameter({
 						name: "x-csrf-token",
 						value: key
 					}));

 					oFileUploader.getContent()[0].setSendXHR(true);

 					// Attach event handlers
 					oFileUploader.getContent()[0].upload();
 					oFileUploader.getContent()[0].attachUploadComplete(function (oEvent) {
 						debugger;
 						console.log("Upload complete, server response:");
 						console.log('upload done');
 						if (oEvent.getParameters().status === "201" || oEvent.getParameters().status === 201) {
 							console.log("Uploaded successfully");
 							MessageBox.success("Uploaded successfully!", {
 								onClose: function (oAction) {
 									that.byId("fileUploadDialog").close();
 									that.onLoadLandingPageData();
 								}
 							});

 						} else {
 							var responseRaw = oEvent.getParameter("responseRaw");
 							if (responseRaw) {
 								try {
 									// Check if the response is XML
 									var parser = new DOMParser();
 									var xmlDoc = parser.parseFromString(responseRaw, "text/xml");

 									// Check for parsing errors
 									if (xmlDoc.documentElement.nodeName === "parsererror" || xmlDoc.documentElement.nodeName.toLowerCase() === "html") {
 										throw new Error("Not XML");
 									}

 									// Extract error details from the XML
 									var errorCode = xmlDoc.getElementsByTagName("code")[0].textContent || null;
 									var errorMessage = xmlDoc.getElementsByTagName("message")[0].textContent || "Unknown error";

 									// Handle upload result based on XML content
 									if (errorCode) {
 										console.error("Upload failed:", errorCode, errorMessage);
 										MessageBox.error(`Upload failed: ${errorMessage}`);
 									} else {
 										console.log("Uploaded successfully");
 										MessageBox.success("Uploaded successfully!", {
 											onClose: function (oAction) {
 												that.byId("fileUploadDialog").close();
 											}
 										});
 										that.onLoadLandingPageData();
 									}
 								} catch (e) {
 									// If the response is not XML, treat it as plain text
 									if (responseRaw.includes("CSRF token validation failed")) {
 										// console.error("Upload failed: CSRF token validation failed");
 										MessageBox.error(responseRaw);
 										sap.ui.core.BusyIndicator.hide(0);
 									} else {
 										console.error("Upload failed:", responseRaw);
 										MessageBox.error(`Upload failed: ${responseRaw}`);
 										sap.ui.core.BusyIndicator.hide(0);
 									}
 								}
 							} else {
 								console.error("No response received from the server.");
 								MessageBox.error("Upload failed: No response received from the server.");
 								sap.ui.core.BusyIndicator.hide(0);
 							}

 						}

 						// MessageBox.success("Uploaded successfully!", {
 						// 	onClose: function (oAction) {
 						// 		that.byId("fileUploadDialog").close();
 						// 	}
 						// });
 						// // that.assignAttachId()
 						// that.onLoadLandingPageData()
 					});

 					this._uploadedFile = {
 						fileName: file.name,
 						fileType: file.type,
 						fileContent: fileContent,
 					};
 				};

 				reader.readAsDataURL(file);
 			}

 		},

 		onDialogClose: function () {
 			this._fileName = ''
 			this._fileUrl = ''
 			this._currentParam = {};
 			// this.getView().getModel().setProperty("/selectedFile", null)
 			this.byId("fileUploadDialog").close();
 		},

 		onDeleteLandingPageItems: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabLandingConfig");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteLandingItems();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteLandingItems: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabLandingConfig");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/ZFI_FMA_LNDPGSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/ZFI_FMA_LNDPGSet(ZlevelId='${addRow.ZlevelId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadLandingPageData();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

 		onAddNewLandingItem: function (oEvent) {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			if (!this.AddNewLandingItemDialog) {
 				this.AddNewLandingItemDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewLandingItem", this);
 				this.getView().addDependent(this.AddNewLandingItemDialog);

 			}
 			sap.ui.getCore().byId("inplndnglevelid").setValue("");
 			sap.ui.getCore().byId("inplndngTitle").setValue("");
 			sap.ui.getCore().byId("inplndngroles").setValue("");
 			sap.ui.getCore().byId("inplndngvis").setSelected(false);
 			// sap.ui.getCore().byId("inpgisfolderid").setValue("");
 			// sap.ui.getCore().byId("inpgisfolder").setValue("");

 			// OData Service Call to fetch the latest GIS Folder IDs
 			finmobview.read("/ZFI_FMA_LNDPGSet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Get the latest GIS Folder ID
 						var latestGisId = oResults[oResults.length - 1].ZlevelId;

 						if (latestGisId && latestGisId.startsWith("L")) {
 							var gisIdNum = parseInt(latestGisId.replace("L", ""), 10);
 							var newGisIdNum = gisIdNum + 1;

 							// Generate new GIS Folder ID with leading zeros
 							var numericLength = latestGisId.length - 1;
 							var newGisId = "L" + newGisIdNum.toString().padStart(numericLength, "0");

 							sap.ui.getCore().byId("inplndnglevelid").setValue(newGisId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inplndnglevelid").setValue("L01");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching GIS Folder data:", oError);
 					sap.ui.getCore().byId("inplndnglevelid").setValue("L01"); // Fallback default ID
 				}
 			});
 			this.AddNewLandingItemDialog.open();
 		},

 		closeAddNewDialog: function (oEvent) {
 			if (this.AddNewLandingItemDialog) {
 				this.AddNewLandingItemDialog.close();
 			}
 		},

 		onAddItem: function () {
 			debugger;
 			var that = this;
 			var inplndnglevelid = sap.ui.getCore().byId("inplndnglevelid").getValue();
 			var inplndngTitle = sap.ui.getCore().byId("inplndngTitle").getValue();
 			var inplndngroles = sap.ui.getCore().byId("inplndngroles").getValue();
 			var inplndngvis = sap.ui.getCore().byId("inplndngvis").getSelected();

 			if (inplndnglevelid === '' || inplndngTitle === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"ZdelInd": "",
 				"ZiMimeType": "",
 				"ZiName": "",
 				// "Zicon": "",
 				"ZlevelId": inplndnglevelid,
 				"Zroles": inplndngroles,
 				"Ztitle": inplndngTitle,
 				"Zvisibility": inplndngvis
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/ZFI_FMA_LNDPGSet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					// that.refreshGISDataAfterAddition(selectedFolderId, selectedFolderTitle);
 					that.onLoadLandingPageData();
 					sap.m.MessageBox.success("Item added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});

 			this.AddNewLandingItemDialog.close();
 		},

 		onAddNewFinDashTab: function (oEvent) {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			if (!this.AddNewFDTDialog) {
 				this.AddNewFDTDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewFinDashTab", this);
 				this.getView().addDependent(this.AddNewFDTDialog);

 			}
 			sap.ui.getCore().byId("inpnfdtid").setValue("");
 			sap.ui.getCore().byId("inpnfdtcat").setValue("");
 			sap.ui.getCore().byId("inpnfdtrole").setValue("");
 			sap.ui.getCore().byId("inpnfdtvis").setSelected(false);

 			// OData Service Call to fetch the latest GIS Folder IDs
 			finmobview.read("/DashboardTabControlSet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Get the latest GIS Folder ID
 						var latestGisId = oResults[oResults.length - 1].ZkpiId;

 						if (latestGisId && latestGisId.startsWith("T")) {
 							var gisIdNum = parseInt(latestGisId.replace("T", ""), 10);
 							var newGisIdNum = gisIdNum + 1;

 							// Generate new GIS Folder ID with leading zeros
 							var numericLength = latestGisId.length - 1;
 							var newGisId = "T" + newGisIdNum.toString().padStart(numericLength, "0");

 							sap.ui.getCore().byId("inpnfdtid").setValue(newGisId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inpnfdtid").setValue("T01");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching GIS Folder data:", oError);
 					sap.ui.getCore().byId("inpnfdtid").setValue("T01"); // Fallback default ID
 				}
 			});
 			this.AddNewFDTDialog.open();
 		},

 		closeAddNewFDTDialog: function (oEvent) {
 			if (this.AddNewFDTDialog) {
 				this.AddNewFDTDialog.close();
 			}
 		},

 		onAddfdtItem: function () {
 			debugger;
 			var that = this;
 			var inpnfdtid = sap.ui.getCore().byId("inpnfdtid").getValue();
 			var inpnfdtcat = sap.ui.getCore().byId("inpnfdtcat").getValue();
 			var inpnfdtrole = sap.ui.getCore().byId("inpnfdtrole").getValue();
 			var inpnfdtvis = sap.ui.getCore().byId("inpnfdtvis").getSelected();

 			if (inpnfdtid === '' || inpnfdtcat === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"Zvisibility": inpnfdtvis,
 				"ZkpiId": inpnfdtid,
 				"Zcategory": inpnfdtcat,
 				"Zrole": inpnfdtrole
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/DashboardTabControlSet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					that.onLoadFinCalTab();
 					sap.m.MessageBox.success("Financial Dashboard Tab added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});

 			this.AddNewFDTDialog.close();
 		},

 		onDeleteFinDashTabCon: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabfincalTab");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteFinDashTab();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteFinDashTab: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabfincalTab");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/DashboardTabControlSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/DashboardTabControlSet(ZkpiId='${addRow.ZkpiId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadFinCalTab();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

 		onAddNewFinDashItem: function (oEvent) {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			if (!this.AddNewFDADialog) {
 				this.AddNewFDADialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewFinDashItem", this);
 				this.getView().addDependent(this.AddNewFDADialog);

 			}
 			sap.ui.getCore().byId("inpnfdaid").setValue("");
 			sap.ui.getCore().byId("inpnfdacat").setValue("");
 			sap.ui.getCore().byId("inpnfdatitle").setValue("");
 			sap.ui.getCore().byId("inpnfdatool").setValue("");
 			sap.ui.getCore().byId("inpnfdarole").setValue("");
 			sap.ui.getCore().byId("inpnfdavis").setSelected(false);

 			// OData Service Call to fetch the latest GIS Folder IDs
 			finmobview.read("/KpiVisibilitySet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Get the latest GIS Folder ID
 						var latestGisId = oResults[oResults.length - 1].ZkpiId;

 						if (latestGisId && latestGisId.startsWith("K")) {
 							var gisIdNum = parseInt(latestGisId.replace("K", ""), 10);
 							var newGisIdNum = gisIdNum + 1;

 							// Generate new GIS Folder ID with leading zeros
 							var numericLength = latestGisId.length - 1;
 							var newGisId = "K" + newGisIdNum.toString().padStart(numericLength, "0");

 							sap.ui.getCore().byId("inpnfdaid").setValue(newGisId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inpnfdaid").setValue("K01");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching GIS Folder data:", oError);
 					sap.ui.getCore().byId("inpnfdaid").setValue("K01"); // Fallback default ID
 				}
 			});
 			this.AddNewFDADialog.open();
 		},

 		closeAddNewFinDashDialog: function (oEvent) {
 			if (this.AddNewFDADialog) {
 				this.AddNewFDADialog.close();
 			}
 		},

 		onAddfdashItem: function () {
 			debugger;
 			var that = this;
 			var inpnfdaid = sap.ui.getCore().byId("inpnfdaid").getValue();
 			// var inpnfdacat = sap.ui.getCore().byId("inpnfdacat").getValue();
 			var inpnfdatitle = sap.ui.getCore().byId("inpnfdatitle").getValue();
 			var inpnfdatool = sap.ui.getCore().byId("inpnfdatool").getValue();
 			var inpnfdarole = sap.ui.getCore().byId("inpnfdarole").getValue();
 			var inpnfdavis = sap.ui.getCore().byId("inpnfdavis").getSelected();
 			var inpfdtcatComboBox = sap.ui.getCore().byId("inpnfdacat");
 			var inpfdtcat = inpfdtcatComboBox.getSelectedItem() ? inpfdtcatComboBox.getSelectedItem().getText() : "";
 			var inpfdtcatId = inpfdtcatComboBox.getSelectedItem() ? inpfdtcatComboBox.getSelectedItem().getKey() : "";

 			if (inpnfdaid === '' || inpfdtcat === '' || inpnfdatitle === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"Zvisibility": inpnfdavis,
 				"ZkpiId": inpnfdaid,
 				"Zcategory": inpfdtcat,
 				"Zrole": inpnfdarole,
 				"ZcategoryId": inpfdtcatId,
 				"ZkpiTitle": inpnfdatitle,
 				"Ztooltip": inpnfdatool
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/KpiVisibilitySet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					// that.refreshGISDataAfterAddition(selectedFolderId, selectedFolderTitle);
 					that.onLoadVisiblityData();
 					sap.m.MessageBox.success("Financial Dashboard Item added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to add data");
 			});

 			this.AddNewFDADialog.close();
 		},

 		onDeleteFinDashItemCon: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabvisiblity");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteFinDashItem();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteFinDashItem: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabvisiblity");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/KpiVisibilitySet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/KpiVisibilitySet(ZkpiId='${addRow.ZkpiId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadVisiblityData();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

 		onDeleteReportItemCon: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabreport");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteReportItem();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteReportItem: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabreport");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/ZFI_FMA_REPORTSSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/ZFI_FMA_REPORTSSet(ZreportId='${addRow.ZreportId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadReportData();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

 		onDeleteReportItemPDFCon: function () {

 			var that = this;
 			var oTable = this.getView().byId("thirdTable");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteReportpdfItem();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteReportpdfItem: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("thirdTable");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/ReportFileAttachmentSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/ReportFileAttachmentSet(ZreportId='${addRow.ZreportId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						that.reloadTable3Data();
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

 		reloadTable3Data: function () {
 			debugger;
 			var that = this;
 			var oViewModel = this.getView().getModel("oViewModel");
 			var finmobview = this.getView().getModel("finmobview");

 			var selectedRowData = oViewModel.getProperty("/selectedRowData");

 			if (!selectedRowData) {
 				sap.m.MessageToast.show("No row data found.");
 				return;
 			}

 			var subTabId = selectedRowData.ZsubTabId;
 			var oSelectedReportpdfModel = new sap.ui.model.json.JSONModel();

 			var aFilters = [new sap.ui.model.Filter("ZsubTabId", sap.ui.model.FilterOperator.EQ, subTabId)];

 			finmobview.read("/ReportFileAttachmentSet", {
 				filters: aFilters,
 				success: function (oData) {
 					oSelectedReportpdfModel.setData(oData.results);
 					that.getView().setModel(oSelectedReportpdfModel, "oSelectedReportpdfModel");
 				},
 				error: function (oError) {
 					sap.m.MessageToast.show("Error loading data.");
 					console.error(oError);
 				}
 			});
 		},

 		onAttachReport: function (oEvent) {
 			debugger;
 			// Get the selected row's data
 			var oButton = oEvent.getSource(); // Get the button that was clicked
 			var oItem = oButton.getParent(); // Get the row (ListItem or TableRow)
 			var oContext = oItem.getBindingContext("oReportModel"); // Get binding context

 			if (!oContext) {
 				sap.m.MessageToast.show("No data context found for this row!");
 				return;
 			}

 			var attachmentId = oContext.getProperty("ZattachmentId"); // Fetch Attachment ID
 			var finmobview = this.getView().getModel("finmobview");
 			var sPath = "/Report_AttachmentSet(ZattachmentId='" + attachmentId + "')";

 			// Read from OData Service
 			finmobview.read(sPath, {
 				success: function (oData) {
 					if (oData && oData.ZreportFile) {
 						console.log("Fetched Data:", oData);
 						var fileData = oData.ZreportFile; // Get PDF binary data

 						if (!fileData) {
 							sap.m.MessageToast.show("No file data found!");
 							return;
 						}

 						// Convert Base64 to Blob
 						var byteCharacters = atob(fileData);
 						var byteNumbers = new Array(byteCharacters.length);
 						for (var i = 0; i < byteCharacters.length; i++) {
 							byteNumbers[i] = byteCharacters.charCodeAt(i);
 						}
 						var byteArray = new Uint8Array(byteNumbers);
 						var blob = new Blob([byteArray], {
 							type: "application/pdf"
 						});

 						// Create Object URL and Open PDF
 						var fileURL = URL.createObjectURL(blob);
 						window.open(fileURL, "_blank");
 					} else {
 						sap.m.MessageToast.show("No matching attachment found.");
 					}
 				},
 				error: function () {
 					sap.m.MessageToast.show("Error fetching file data.");
 				}
 			});
 		},
 		onAttachReportpdf: function (oEvent) {
 			debugger;
 			// Get the selected row's data
 			var oButton = oEvent.getSource(); // Get the button that was clicked
 			var oItem = oButton.getParent(); // Get the row (ListItem or TableRow)
 			var oContext = oItem.getBindingContext("oSelectedReportpdfModel"); // Get binding context

 			if (!oContext) {
 				sap.m.MessageToast.show("No data context found for this row!");
 				return;
 			}

 			var attachmentId = oContext.getProperty("ZattachmentId"); // Fetch Attachment ID

 			var finmobview = this.getView().getModel("finmobview");

 			var sPath = "/Report_AttachmentSet(ZattachmentId='" + attachmentId + "')";

 			// Read from OData Service
 			finmobview.read(sPath, {
 				success: function (oData) {
 					if (oData && oData.ZreportFile) {
 						console.log("Fetched Data:", oData);
 						var fileData = oData.ZreportFile; // Get PDF binary data

 						if (!fileData) {
 							sap.m.MessageToast.show("No file data found!");
 							return;
 						}

 						// Convert Base64 to Blob
 						var byteCharacters = atob(fileData);
 						var byteNumbers = new Array(byteCharacters.length);
 						for (var i = 0; i < byteCharacters.length; i++) {
 							byteNumbers[i] = byteCharacters.charCodeAt(i);
 						}
 						var byteArray = new Uint8Array(byteNumbers);
 						var blob = new Blob([byteArray], {
 							type: "application/pdf"
 						});

 						// Create Object URL and Open PDF
 						var fileURL = URL.createObjectURL(blob);
 						window.open(fileURL, "_blank");
 					} else {
 						sap.m.MessageToast.show("No matching attachment found.");
 					}
 				},
 				error: function () {
 					sap.m.MessageToast.show("Error fetching file data.");
 				}
 			});
 		},

 		onAddNewMarketItem: function (oEvent) {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			if (!this.AddNewMarketDialog) {
 				this.AddNewMarketDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewMarketItem", this);
 				this.getView().addDependent(this.AddNewMarketDialog);

 			}
 			sap.ui.getCore().byId("inpnmwid").setValue("");
 			sap.ui.getCore().byId("inpnmwcat").setValue("");
 			sap.ui.getCore().byId("inpnmwtitle").setValue("");
 			sap.ui.getCore().byId("inpnmwrole").setValue("");
 			sap.ui.getCore().byId("inpnmwvis").setSelected(false);

 			// OData Service Call to fetch the latest GIS Folder IDs
 			finmobview.read("/MarketWatchVisibilitySet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Get the latest GIS Folder ID
 						var latestGisId = oResults[oResults.length - 1].ZkpiId;

 						if (latestGisId && latestGisId.startsWith("K")) {
 							var gisIdNum = parseInt(latestGisId.replace("K", ""), 10);
 							var newGisIdNum = gisIdNum + 1;

 							// Generate new GIS Folder ID with leading zeros
 							var numericLength = latestGisId.length - 1;
 							var newGisId = "K" + newGisIdNum.toString().padStart(numericLength, "0");

 							sap.ui.getCore().byId("inpnmwid").setValue(newGisId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inpnmwid").setValue("K01");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching GIS Folder data:", oError);
 					sap.ui.getCore().byId("inpnmwid").setValue("K01"); // Fallback default ID
 				}
 			});
 			this.AddNewMarketDialog.open();
 		},

 		closeAddNewMarketDialog: function (oEvent) {
 			if (this.AddNewMarketDialog) {
 				this.AddNewMarketDialog.close();
 			}
 		},

 		onAddMarketItem: function () {
 			debugger;
 			var that = this;
 			var inpnmwid = sap.ui.getCore().byId("inpnmwid").getValue();
 			var inpnmwcat = sap.ui.getCore().byId("inpnmwcat").getValue();
 			var inpnmwtitle = sap.ui.getCore().byId("inpnmwtitle").getValue();
 			var inpnmwrole = sap.ui.getCore().byId("inpnmwrole").getValue();
 			var inpnmwvis = sap.ui.getCore().byId("inpnmwvis").getSelected();

 			if (inpnmwid === '' || inpnmwcat === '' || inpnmwtitle === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"Zvisibility": inpnmwvis,
 				"ZkpiId": inpnmwid,
 				"Zcategory": inpnmwcat,
 				"Zrole": inpnmwrole,
 				"ZkpiTitle": inpnmwtitle
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/MarketWatchVisibilitySet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					that.onLoadMarketWatchData();
 					sap.m.MessageToast.show("Item added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});

 			this.AddNewMarketDialog.close();
 		},

 		onDeleteMarketItemCon: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabmarketwatchdata");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteMarketItem();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteMarketItem: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabmarketwatchdata");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/MarketWatchVisibilitySet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/MarketWatchVisibilitySet(ZkpiId='${addRow.ZkpiId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadMarketWatchData();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

 		onAddNewMarketTab: function (oEvent) {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			if (!this.AddNewMarketTabDialog) {
 				this.AddNewMarketTabDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewMarketTab", this);
 				this.getView().addDependent(this.AddNewMarketTabDialog);

 			}
 			sap.ui.getCore().byId("inpnmwtid").setValue("");
 			sap.ui.getCore().byId("inpnmwtcat").setValue("");
 			sap.ui.getCore().byId("inpnmwtrole").setValue("");
 			sap.ui.getCore().byId("inpnmwtvis").setSelected(false);

 			// OData Service Call to fetch the latest GIS Folder IDs
 			finmobview.read("/MarketWatchTabControlSet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Get the latest GIS Folder ID
 						var latestGisId = oResults[oResults.length - 1].ZkpiId;

 						if (latestGisId && latestGisId.startsWith("T")) {
 							var gisIdNum = parseInt(latestGisId.replace("T", ""), 10);
 							var newGisIdNum = gisIdNum + 1;

 							// Generate new GIS Folder ID with leading zeros
 							var numericLength = latestGisId.length - 1;
 							var newGisId = "T" + newGisIdNum.toString().padStart(numericLength, "0");

 							sap.ui.getCore().byId("inpnmwtid").setValue(newGisId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inpnmwtid").setValue("T01");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching GIS Folder data:", oError);
 					sap.ui.getCore().byId("inpnmwtid").setValue("T01"); // Fallback default ID
 				}
 			});
 			this.AddNewMarketTabDialog.open();
 		},

 		closeAddNewMarketTabDialog: function (oEvent) {
 			if (this.AddNewMarketTabDialog) {
 				this.AddNewMarketTabDialog.close();
 			}
 		},

 		onAddMarketTab: function () {
 			debugger;
 			var that = this;
 			var inpnmwtid = sap.ui.getCore().byId("inpnmwtid").getValue();
 			var inpnmwtcat = sap.ui.getCore().byId("inpnmwtcat").getValue();
 			var inpnmwtrole = sap.ui.getCore().byId("inpnmwtrole").getValue();
 			var inpnmwtvis = sap.ui.getCore().byId("inpnmwtvis").getSelected();

 			if (inpnmwtid === '' || inpnmwtcat === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"Zvisibility": inpnmwtvis,
 				"ZkpiId": inpnmwtid,
 				"Zcategory": inpnmwtcat,
 				"Zrole": inpnmwtrole
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/MarketWatchTabControlSet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					that.onLoadMarketWatchTab();
 					sap.m.MessageBox.success("Market Watch Tab added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});

 			this.AddNewMarketTabDialog.close();
 		},

 		onDeleteMarketTabCon: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabmarketwatchTab");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteMarketTab();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteMarketTab: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabmarketwatchTab");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/MarketWatchTabControlSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/MarketWatchTabControlSet(ZkpiId='${addRow.ZkpiId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadMarketWatchTab();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

 		onAddNewReportTab: function (oEvent) {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			if (!this.AddNewReportTabDialog) {
 				this.AddNewReportTabDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewReportTab", this);
 				this.getView().addDependent(this.AddNewReportTabDialog);

 			}
 			sap.ui.getCore().byId("inpnreptid").setValue("");
 			sap.ui.getCore().byId("inpnreptcat").setValue("");
 			sap.ui.getCore().byId("inpnreptrole").setValue("");
 			sap.ui.getCore().byId("inpnreptvis").setSelected(false);

 			// OData Service Call to fetch the latest GIS Folder IDs
 			finmobview.read("/ReportTabControlSet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Get the latest GIS Folder ID
 						var latestGisId = oResults[oResults.length - 1].ZtabId;

 						if (latestGisId && latestGisId.startsWith("T")) {
 							var gisIdNum = parseInt(latestGisId.replace("T", ""), 10);
 							var newGisIdNum = gisIdNum + 1;

 							// Generate new GIS Folder ID with leading zeros
 							var numericLength = latestGisId.length - 1;
 							var newGisId = "T" + newGisIdNum.toString().padStart(numericLength, "0");

 							sap.ui.getCore().byId("inpnreptid").setValue(newGisId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inpnreptid").setValue("T001");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching GIS Folder data:", oError);
 					sap.ui.getCore().byId("inpnreptid").setValue("T001"); // Fallback default ID
 				}
 			});
 			this.AddNewReportTabDialog.open();
 		},
 		onAddNewSegmentTab: function (oEvent) {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			if (!this.AddNewSegmentTabDialog) {
 				this.AddNewSegmentTabDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewSegmentTab", this);
 				this.getView().addDependent(this.AddNewSegmentTabDialog);

 			}
 			sap.ui.getCore().byId("inpnsegtid").setValue("");
 			sap.ui.getCore().byId("inpnsegtcat").setValue("");
 			sap.ui.getCore().byId("inprepCatsub").setValue("");
 			sap.ui.getCore().byId("inpnsegtrole").setValue("");
 			sap.ui.getCore().byId("inpnsegtvis").setSelected(false);

 			// OData Service Call to fetch the latest GIS Folder IDs
 			finmobview.read("/ReportSubTabControlSet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Get the latest GIS Folder ID
 						var latestGisId = oResults[oResults.length - 1].ZsubTabId;

 						if (latestGisId && latestGisId.startsWith("S")) {
 							var gisIdNum = parseInt(latestGisId.replace("S", ""), 10);
 							var newGisIdNum = gisIdNum + 1;

 							// Generate new GIS Folder ID with leading zeros
 							var numericLength = latestGisId.length - 1;
 							var newGisId = "S" + newGisIdNum.toString().padStart(numericLength, "0");

 							sap.ui.getCore().byId("inpnsegtid").setValue(newGisId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inpnsegtid").setValue("S001");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching GIS Folder data:", oError);
 					sap.ui.getCore().byId("inpnsegtid").setValue("S001"); // Fallback default ID
 				}
 			});
 			this.AddNewSegmentTabDialog.open();
 		},

 		onNavigateToTable2: function (oEvent) {
 			debugger;

 			var oViewModel = this.getView().getModel("oViewModel");
 			var finmobview = this.getView().getModel("finmobview");

 			// Get the clicked button instance
 			var oButton = oEvent.getSource(); // Get the button that was clicked
 			var oItem = oButton.getParent();
 			var oContext = oItem.getBindingContext("oGISReportModel"); // Get row binding context

 			if (!oContext) {
 				sap.m.MessageToast.show("No row data found.");
 				return;
 			}

 			console.log(oContext);
 			var tabId = oContext.getProperty("ZgisFolderId");
 			var oSelectedSubGisfolderModel = new sap.ui.model.json.JSONModel();

 			var aFilters = [new sap.ui.model.Filter("ZgisFolderId", sap.ui.model.FilterOperator.EQ, tabId)];
 			finmobview.read("/ZFI_FMA_GISSet", {
 				filters: aFilters,
 				success: function (oData) {
 					oSelectedSubGisfolderModel.setData(oData.results); // Store response in JSON model
 					console.log(oData);
 					sap.m.MessageToast.show("Data loaded successfully.");
 				},
 				error: function (oError) {
 					sap.m.MessageToast.show("Error loading data.");
 					console.error(oError);
 				}
 			});

 			// Set JSON Model to View
 			this.getView().setModel(oSelectedSubGisfolderModel, "oSelectedSubGisfolderModel");

 			var oRowData = oContext.getObject(); // Get the full row data as JSON

 			// Store the selected row data in the ViewModel
 			oViewModel.setProperty("/selectedRowData", oRowData);

 			// Navigate to Table 2
 			oViewModel.setProperty("/showNewTable", true);
 			oViewModel.setProperty("/showThirdTable", false);

 		},
 		computeVisibility: function (showNewTable, showThirdTable) {
 			return !(showNewTable || showThirdTable); // Hide when either is true
 		},

 		onNavigateToTable3: function (oEvent) {
 			debugger;

 			var oViewModel = this.getView().getModel("oViewModel");
 			var finmobview = this.getView().getModel("finmobview");

 			// Get the clicked button instance
 			var oButton = oEvent.getSource(); // Get the button that was clicked
 			var oItem = oButton.getParent();
 			var oContext = oItem.getBindingContext("oSelectedSubReportModel"); // Get row binding context

 			if (!oContext) {
 				sap.m.MessageToast.show("No row data found.");
 				return;
 			}

 			console.log(oContext);
 			var subtabId = oContext.getProperty("ZsubTabId");
 			var oSelectedReportpdfModel = new sap.ui.model.json.JSONModel();

 			var aFilters = [new sap.ui.model.Filter("ZsubTabId", sap.ui.model.FilterOperator.EQ, subtabId)];
 			finmobview.read("/ReportFileAttachmentSet", {
 				filters: aFilters,
 				success: function (oData) {
 					oSelectedReportpdfModel.setData(oData.results); // Store response in JSON model
 					console.log(oData);
 					sap.m.MessageToast.show("Data loaded successfully.");
 				},
 				error: function (oError) {
 					sap.m.MessageToast.show("Error loading data.");
 					console.error(oError);
 				}
 			});

 			// Set JSON Model to View
 			this.getView().setModel(oSelectedReportpdfModel, "oSelectedReportpdfModel");

 			var oRowData = oContext.getObject(); // Get the full row data as JSON

 			// Store the selected row data in the ViewModel
 			oViewModel.setProperty("/selectedRowData", oRowData);

 			// Navigate to Table 2
 			oViewModel.setProperty("/showNewTable", false);
 			oViewModel.setProperty("/showThirdTable", true);

 		},

 		// Back button function
 		onBack: function () {
 			console.log("Going back...");
 			var oViewModel = this.getView().getModel("oViewModel");

 			if (oViewModel.getProperty("/showThirdTable")) {
 				// Go back to Table 2
 				oViewModel.setProperty("/showThirdTable", false);
 				oViewModel.setProperty("/showNewTable", true);
 				oViewModel.setProperty("/tabreportandpubtab", false);

 			} else {
 				// Go back to Table 1
 				oViewModel.setProperty("/showNewTable", false);
 				oViewModel.setProperty("/showThirdTable", false);
 				oViewModel.setProperty("/tabreportandpubtab", true);

 			}
 		},

 		closeAddNewReportTabDialog: function (oEvent) {
 			if (this.AddNewReportTabDialog) {
 				this.AddNewReportTabDialog.close();
 			}
 		},

 		closeAddNewSegmentTabDialog: function (oEvent) {
 			if (this.AddNewSegmentTabDialog) {
 				this.AddNewSegmentTabDialog.close();
 			}
 		},

 		onAddReportTab: function () {
 			debugger;
 			var that = this;
 			var inpnreptid = sap.ui.getCore().byId("inpnreptid").getValue();
 			var inpnreptcat = sap.ui.getCore().byId("inpnreptcat").getValue();
 			var inpnreptrole = sap.ui.getCore().byId("inpnreptrole").getValue();
 			var inpnreptvis = sap.ui.getCore().byId("inpnreptvis").getSelected();

 			if (inpnreptid === '' || inpnreptcat === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"Zvisibility": inpnreptvis,
 				"ZtabId": inpnreptid,
 				"ZtabName": inpnreptcat,
 				"Zroles": inpnreptrole
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/ReportTabControlSet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					that.onLoadReportsTab();
 					sap.m.MessageBox.success("Reports Tab added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});

 			this.AddNewReportTabDialog.close();
 		},
 		onAddSegmentTab: function () {
 			debugger;
 			var that = this;
 			// var oViewModel = this.getView().getModel("oViewModel"); // Retrieve ViewModel
 			// var oTable = this.getView().byId("newTable"); // Get the table reference
 			// var oDataModel = this.getView().getModel(); // Get the OData model
 			// var selectedRowData = oViewModel.getProperty("/selectedRowData"); // Get stored row data

 			// if (!selectedRowData) {
 			// 	sap.m.MessageToast.show("No row selected from Table 1.");
 			// 	return;
 			// }

 			// var selectedTabId = selectedRowData.ZtabId; // Get Tab ID from stored data
 			// var selectedTabName = selectedRowData.ZtabName; // Get Tab Name from stored data
 			var inpnsegtid = sap.ui.getCore().byId("inpnsegtid").getValue();
 			var inpnsegtcat = sap.ui.getCore().byId("inpnsegtcat").getValue();
 			var inpnsegtrole = sap.ui.getCore().byId("inpnsegtrole").getValue();
 			var inpnsegtvis = sap.ui.getCore().byId("inpnsegtvis").getSelected();
 			var inprepcatComboBox = sap.ui.getCore().byId("inprepCatsub");
 			var inprepcat = inprepcatComboBox.getSelectedItem() ? inprepcatComboBox.getSelectedItem().getText() : "";
 			var inprepcatId = inprepcatComboBox.getSelectedItem() ? inprepcatComboBox.getSelectedItem().getKey() : "";

 			if (inpnsegtid === '' || inpnsegtcat === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"Zvisibility": inpnsegtvis,
 				"ZsubTabId": inpnsegtid,
 				"ZsubTabName": inpnsegtcat,
 				"Zroles": inpnsegtrole,
 				"ZtabId": inprepcatId,
 				"ZtabName": inprepcat
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/ReportSubTabControlSet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					that.onLoadReportSubTab();
 					sap.m.MessageBox.success("Report Sub Tab added successfully!");
 					// var oSelectedSubReportModel = that.getView().getModel("oReportSubTabModel");

 					// if (oSelectedSubReportModel) {
 					// 	var aExistingData = oSelectedSubReportModel.getData();
 					// 	if (!Array.isArray(aExistingData)) {
 					// 		aExistingData = [];
 					// 	}

 					// 	// **Push new item and refresh model**
 					// 	aExistingData.push(addItem);
 					// 	oSelectedSubReportModel.setData(aExistingData);
 					// 	oSelectedSubReportModel.refresh(true); // Force UI to update
 					// }
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});

 			this.AddNewSegmentTabDialog.close();
 		},

 		onDeleteReportTabCon: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabreportTab");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteReportTab();
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteReportTab: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabreportTab");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/ReportTabControlSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/ReportTabControlSet(ZtabId='${addRow.ZtabId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadReportsTab();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

 		onDeleteReportSubTabCon: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabreportsubTab");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteReportSubTab();
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteReportSubTab: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabreportsubTab");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/ReportSubTabControlSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/ReportSubTabControlSet(ZsubTabId='${addRow.ZsubTabId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadReportSubTab();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

 		onDeleteReportTabpdfCon: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabreportandpubtab");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteReportpdfTab();
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteReportpdfTab: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabreportandpubtab");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/ReportTabControlSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/ReportTabControlSet(ZtabId='${addRow.ZtabId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);

 						sap.m.MessageBox.success("Selected items deleted successfully.");

 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},
 		reloadTable2Data: function () {
 			debugger;
 			var that = this;
 			var oViewModel = this.getView().getModel("oViewModel");
 			var finmobview = this.getView().getModel("finmobview");

 			var selectedRowData = oViewModel.getProperty("/selectedRowData");

 			if (!selectedRowData) {
 				sap.m.MessageToast.show("No row data found.");
 				return;
 			}

 			var tabId = selectedRowData.ZtabId;
 			var oSelectedSubReportModel = new sap.ui.model.json.JSONModel();

 			var aFilters = [new sap.ui.model.Filter("ZtabId", sap.ui.model.FilterOperator.EQ, tabId)];

 			finmobview.read("/ReportSubTabControlSet", {
 				filters: aFilters,
 				success: function (oData) {
 					oSelectedSubReportModel.setData(oData.results);
 					that.getView().setModel(oSelectedSubReportModel, "oSelectedSubReportModel");
 				},
 				error: function (oError) {
 					sap.m.MessageToast.show("Error loading data.");
 					console.error(oError);
 				}
 			});
 		},

 		onDeleteSegmentTabCon: function () {

 			var that = this;
 			var oTable = this.getView().byId("newTable");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteSegmentTab();
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteSegmentTab: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("newTable");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/ReportSubTabControlSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/ReportSubTabControlSet(ZsubTabId='${addRow.ZsubTabId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						that.reloadTable2Data();
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},
 		onChangeLevelId: function (oEvent) {
 			debugger;
 			console.log(oEvent);
 			var selectedKey = oEvent.getSource().getSelectedKey();
 			var oSubCatDataModel = this.getView().getModel("oSubCatDataModel").getData()
 			if (selectedKey) {
 				var aFilteredData = oSubCatDataModel.filter(function (item) {
 					return item.ZlevelId == selectedKey;
 				});
 				console.log(aFilteredData)
 				if (aFilteredData.length) {

 					var sublevelId = aFilteredData[aFilteredData.length - 1].ZsubId;
 					// sublevelId = 'S09'
 					var sublevelIdNum = parseInt(sublevelId.replace("S", ""), 10);

 					var newsubLevelIdNum = sublevelIdNum + 1;

 					var numericLength = sublevelId.length - 1;
 					var newSubLevelId = "S" + newsubLevelIdNum.toString().padStart(numericLength, "0");

 					console.log("New Level ID:", newSubLevelId);
 					sap.ui.getCore().byId("inpsubcatsubid").setValue(newSubLevelId);
 				} else {
 					sap.ui.getCore().byId("inpsubcatsubid").setValue('S01');
 				}
 			}

 		},

 		onAddNewSubItem: function (oEvent) {
 			debugger;
 			this.selectedIcon = ''
 			if (!this.AddNewSubItemDialog) {
 				this.AddNewSubItemDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewSubCatItem", this);
 				this.getView().addDependent(this.AddNewSubItemDialog);

 			}
 			sap.ui.getCore().byId("inpsubcatsubid").setValue("");
 			sap.ui.getCore().byId("inpsubcatlevelid").setSelectedKey("");
 			sap.ui.getCore().byId("inpsubcatTitle").setValue("");
 			sap.ui.getCore().byId("inpsubcatroles").setValue("");
 			this.AddNewSubItemDialog.open();
 		},

 		onAddSubItem: function () {
 			debugger;

 			var that = this;
 			var inpsubcatsubid = sap.ui.getCore().byId("inpsubcatsubid").getValue();
 			var inpsubcatlevelid = sap.ui.getCore().byId("inpsubcatlevelid").getSelectedKey();
 			var inpsubcatTitle = sap.ui.getCore().byId("inpsubcatTitle").getValue();
 			var inpsubcatroles = sap.ui.getCore().byId("inpsubcatroles").getValue();

 			if (inpsubcatsubid === '' || inpsubcatlevelid === '' || inpsubcatTitle === '' || inpsubcatroles === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"ZsubId": inpsubcatsubid,
 				"ZlevelId": inpsubcatlevelid,
 				"Zroles": inpsubcatroles,
 				"ZsubTitle": inpsubcatTitle
 			}
 			var oUpdatedSubCatModel = new JSONModel();
 			var oSubCatDataModel = this.getView().getModel("oSubCatDataModel");
 			var oSubCatModelData = oSubCatDataModel.getData()
 			oSubCatModelData.push(addItem)
 			oUpdatedSubCatModel.setData(oSubCatModelData);
 			this.getView().setModel(oUpdatedSubCatModel, "oSubCatDataModel");
 			oSubCatDataModel.refresh(true);
 			var oTable = this.getView().byId("tabSubCat");
 			var oTableData = oTable.getBinding("items").oList;
 			console.log(oTableData)

 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/ZFI_FMA_SUBCATSet";

 			for (var i = 0; i < oTableData.length; i++) {
 				var addRow = oTableData[i];
 				delete addRow.__metadata;
 				delete addRow.Ztitle;
 				batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addRow));
 			}

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);
 			oDataModel.submitBatch(function (oData, oResponse) {
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					sap.ui.core.BusyIndicator.hide(0);
 					// sap.m.MessageBox.success("Updated Successfully");
 					that.onLoadSubCatData()

 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.success("failed");
 			});

 			this.AddNewSubItemDialog.close();
 		},

 		closeAddNewSubDialog: function (oEvent) {
 			if (this.AddNewSubItemDialog) {
 				this.AddNewSubItemDialog.close();
 			}
 		},

 		onAddNewGISItem: function (oEvent) {
 			var that = this;
 			debugger;
 			var finmobview = this.getView().getModel("finmobview");
 			var oGISReportModel = new JSONModel();

 			// Create the dialog if it doesn't exist
 			if (!this.AddNewGISDialog) {
 				this.AddNewGISDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewGISReportItem", this);
 				this.getView().addDependent(this.AddNewGISDialog);
 			}

 			// Reset input fields
 			sap.ui.getCore().byId("inpgisid").setValue("");
 			sap.ui.getCore().byId("inpgisTitle").setValue("");
 			sap.ui.getCore().byId("inpgisurl").setValue("");
 			sap.ui.getCore().byId("inpgisvis").setSelected(false);

 			// OData Service Call to fetch the latest GIS IDs
 			finmobview.read("/ZFI_FMA_GISSet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Get the latest GIS ID
 						var latestGisId = oResults[oResults.length - 1].ZgisId;

 						if (latestGisId && latestGisId.startsWith("G")) {
 							var gisIdNum = parseInt(latestGisId.replace("G", ""), 10);
 							var newGisIdNum = gisIdNum + 1;

 							// Generate new GIS ID with leading zeros
 							var numericLength = latestGisId.length - 1;
 							var newGisId = "G" + newGisIdNum.toString().padStart(numericLength, "0");

 							sap.ui.getCore().byId("inpgisid").setValue(newGisId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inpgisid").setValue("G01");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching GIS Folder data:", oError);
 					sap.ui.getCore().byId("inpgisid").setValue("G01"); // Fallback default ID
 				}
 			});
 			// console.log("Selected Folder ID:", selectedFolderId, "Selected Folder Title:", selectedFolderTitle);
 			var filterModel = this.getView().getModel("oFolderTitleModel");
 			var selectedFolderId = filterModel.getProperty("/folderId"); // Retrieve the folder ID
 			var selectedFolderTitle = filterModel.getProperty("/folderTitle");
 			that.selectedFolderId = selectedFolderId;
 			that.selectedFolderTitle = selectedFolderTitle;
 			// Open the dialog after setting the ID
 			this.AddNewGISDialog.open();
 		},
 		onAddNewReports: function (oEvent) {
 			var that = this;
 			debugger;
 			var finmobview = this.getView().getModel("finmobview");
 			var oGISReportModel = new JSONModel();

 			// Create the dialog if it doesn't exist
 			if (!this.AddNewReportDialog) {
 				this.AddNewReportDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewReport", this);
 				this.getView().addDependent(this.AddNewReportDialog);
 			}

 			// Reset input fields
 			sap.ui.getCore().byId("inprepid").setValue("");
 			sap.ui.getCore().byId("inprepattach").setValue("");
 			sap.ui.getCore().byId("inprepCat").setValue("");
 			sap.ui.getCore().byId("inprepseg").setValue("");
 			sap.ui.getCore().byId("inprepDate").setValue("");
 			sap.ui.getCore().byId("inprepname").setValue("");
 			sap.ui.getCore().byId("inprepvis").setSelected(false);
 			sap.ui.getCore().byId("uploadedFileIcon").setVisible(false);

 			sap.ui.getCore().byId("uploadReportButton").setVisible(true);
 			sap.ui.getCore().byId("uploadReportButton").setEnabled(true);
 			finmobview.read("/ReportTabControlSet", {
 				success: function (oData) {
 					var oCategoryModel = new sap.ui.model.json.JSONModel();
 					oCategoryModel.setData(oData.results);

 					// Set the model on the core and bind it to the ComboBox
 					sap.ui.getCore().byId("inprepCat").setModel(oCategoryModel, "categoryModel");
 				},
 				error: function (oError) {
 					console.error("Error fetching Categories:", oError);
 				}
 			});
 			// OData Service Call to fetch the latest GIS IDs
 			finmobview.read("/ZFI_FMA_REPORTSSet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Extract the latest report ID
 						var latestReportId = oResults[oResults.length - 1].ZreportId;

 						if (latestReportId && latestReportId.startsWith("REP")) {
 							var reportNum = parseInt(latestReportId.replace("REP", ""), 10);
 							var newReportNum = reportNum + 1;

 							// Generate new Report ID with leading zeros (always 4 digits)
 							var newReportId = "REP" + newReportNum.toString().padStart(4, "0");

 							sap.ui.getCore().byId("inprepid").setValue(newReportId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inprepid").setValue("REP0001");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching Report data:", oError);
 					sap.ui.getCore().byId("inprepid").setValue("REP0001"); // Fallback default ID
 				}
 			});

 			// Open the dialog after setting the ID
 			this.AddNewReportDialog.open();
 		},
 		closeAddNewReportDialog: function (oEvent) {
 			if (this.AddNewReportDialog) {
 				this.AddNewReportDialog.close();
 			}
 		},
 		onAddNewReportspdf: function (oEvent) {
 			var that = this;
 			debugger;
 			var finmobview = this.getView().getModel("finmobview");
 			var oGISReportModel = new JSONModel();

 			// Create the dialog if it doesn't exist
 			if (!this.AddNewReportpdfDialog) {
 				this.AddNewReportpdfDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewReportpdf", this);
 				this.getView().addDependent(this.AddNewReportpdfDialog);
 			}

 			// Reset input fields
 			sap.ui.getCore().byId("inprepidpdf").setValue("");
 			sap.ui.getCore().byId("inprepattachpdf").setValue("");
 			sap.ui.getCore().byId("inprepsegpdf").setValue("");
 			sap.ui.getCore().byId("inprepDatepdf").setValue("");
 			sap.ui.getCore().byId("inprepnamepdf").setValue("");
 			sap.ui.getCore().byId("uploadedFileIconpdf").setVisible(false);
 			sap.ui.getCore().byId("uploadReportButtonpdf").setVisible(true);
 			sap.ui.getCore().byId("uploadReportButtonpdf").setEnabled(true);
 			// OData Service Call to fetch the latest GIS IDs
 			finmobview.read("/ReportFileAttachmentSet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Extract the latest report ID
 						var latestReportId = oResults[oResults.length - 1].ZreportId;

 						if (latestReportId && latestReportId.startsWith("REP")) {
 							var reportNum = parseInt(latestReportId.replace("REP", ""), 10);
 							var newReportNum = reportNum + 1;

 							// Generate new Report ID with leading zeros (always 4 digits)
 							var newReportId = "REP" + newReportNum.toString().padStart(4, "0");

 							sap.ui.getCore().byId("inprepidpdf").setValue(newReportId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inprepidpdf").setValue("REP0001");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching Report data:", oError);
 					sap.ui.getCore().byId("inprepidpdf").setValue("REP0001"); // Fallback default ID
 				}
 			});

 			// Open the dialog after setting the ID
 			this.AddNewReportpdfDialog.open();
 		},
 		closeAddNewReportpdfDialog: function (oEvent) {
 			if (this.AddNewReportpdfDialog) {
 				this.AddNewReportpdfDialog.close();
 			}
 		},
 		onAddReportItem1: function () {
 			debugger;
 			var that = this;
 			var inprepid = sap.ui.getCore().byId("inprepid").getValue();
 			var inprepcat = sap.ui.getCore().byId("inprepCat").getValue();
 			var inprepseg = sap.ui.getCore().byId("inprepseg").getValue();
 			var inprepname = sap.ui.getCore().byId("inprepname").getValue();
 			var inprepdate = sap.ui.getCore().byId("inprepDate").getDateValue();
 			var inprepviz = sap.ui.getCore().byId("inprepvis").getSelected();

 			var addItem = {
 				"ZgisId": inpgisid,
 				"ZgisTitle": inpgisTitle,
 				"ZreportUrl": inpgisurl,
 				"Zvisibility": inpgisvis,
 				"ZgisFolderId": selectedFolderId, // Add folder ID
 				"ZgisFolderTitle": selectedFolderTitle // Add folder title
 			};

 			// Perform OData Batch Processing
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/ZFI_FMA_GISSet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					that.refreshGISDataAfterAddition(selectedFolderId, selectedFolderTitle);
 					sap.m.MessageToast.show("Item added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});

 			this.AddNewGISDialog.close();
 		},
 		onAddReportItem: function () {
 			debugger;
 			var that = this;

 			// Retrieve values from input fields
 			var inprepid = sap.ui.getCore().byId("inprepid").getValue();
 			var inprepattach = sap.ui.getCore().byId("inprepattach").getValue();
 			var inprepcat = sap.ui.getCore().byId("inprepCat").getSelectedItem().getText();
 			var inprepseg = sap.ui.getCore().byId("inprepseg").getValue();
 			var inprepname = sap.ui.getCore().byId("inprepname").getValue();
 			var inprepdate = sap.ui.getCore().byId("inprepDate").getDateValue();
 			var inprepviz = sap.ui.getCore().byId("inprepvis").getSelected();

 			// Validate mandatory fields
 			if (!inprepid || !inprepcat || !inprepseg || !inprepname || !inprepdate) {
 				sap.m.MessageToast.show("Please fill all the mandatory fields and upload a file!");
 				return;
 			}

 			// Construct payload
 			var addItem = {
 				"ZattachmentId": inprepattach,
 				"ZdateReport": inprepdate,
 				"Zvisibility": inprepviz,
 				"ZreportId": inprepid,
 				"Zcategory": inprepcat,
 				"Zsegment": inprepseg,
 				"Zreportfile": "",
 				"ZrMimeType": "",
 				"ZrName": inprepname,
 				"ZdelReInd": ""
 			};

 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/ZFI_FMA_REPORTSSet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);
 			oDataModel.submitBatch(function (oData, oResponse) {
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					sap.ui.core.BusyIndicator.hide(0);
 					that.onLoadReportData();
 					sap.m.MessageBox.success("Added Successfully");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("failed");
 			});

 			this.AddNewReportDialog.close();

 		},
 		onAddReportItempdf: function () {
 			debugger;
 			var that = this;
 			var oViewModel = this.getView().getModel("oViewModel"); // Retrieve ViewModel
 			// var finmobview = this.getView().getModel("finmobview");
 			var selectedRowData = oViewModel.getProperty("/selectedRowData"); // Get stored row data

 			if (!selectedRowData) {
 				sap.m.MessageToast.show("No row selected from Table 1.");
 				return;
 			}

 			var selectedsubTabId = selectedRowData.ZsubTabId; // Get Tab ID from stored data

 			// Retrieve values from input fields
 			var inprepidpdf = sap.ui.getCore().byId("inprepidpdf").getValue();
 			var inprepattachpdf = sap.ui.getCore().byId("inprepattachpdf").getValue();
 			var inprepnamepdf = sap.ui.getCore().byId("inprepnamepdf").getValue();
 			var inprepdatepdf = sap.ui.getCore().byId("inprepDatepdf").getDateValue();

 			// Validate mandatory fields
 			if (!inprepidpdf || !inprepnamepdf || !inprepdatepdf) {
 				sap.m.MessageToast.show("Please fill all the mandatory fields and upload a file!");
 				return;
 			}

 			// Construct payload
 			var addItem = {
 				"ZattachmentId": inprepattachpdf,
 				"ZdateReport": inprepdatepdf,
 				"ZreportId": inprepidpdf,
 				"ZsubTabId": selectedsubTabId,
 				"ZrMimeType": "",
 				"ZrFileName": inprepnamepdf,
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/ReportFileAttachmentSet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));
 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);
 			oDataModel.submitBatch(function (oData, oResponse) {
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					sap.ui.core.BusyIndicator.hide(0);
 					// that.onLoadReportData();
 					sap.m.MessageBox.success("Added Successfully");
 					var oSelectedReportpdfModel = that.getView().getModel("oSelectedReportpdfModel");

 					if (oSelectedReportpdfModel) {
 						var aExistingData = oSelectedReportpdfModel.getData();
 						if (!Array.isArray(aExistingData)) {
 							aExistingData = [];
 						}

 						// **Push new item and refresh model**
 						aExistingData.push(addItem);
 						oSelectedReportpdfModel.setData(aExistingData);
 						oSelectedReportpdfModel.refresh(true); // Force UI to update
 					}
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("failed");
 			});

 			this.AddNewReportpdfDialog.close();
 		},

 		onAddReportItemTest: function () {
 			debugger;
 			var that = this;

 			var inprepid = sap.ui.getCore().byId("inprepid").getValue();
 			var inprepcat = sap.ui.getCore().byId("inprepCat").getValue();
 			var inprepseg = sap.ui.getCore().byId("inprepseg").getValue();
 			var inprepname = sap.ui.getCore().byId("inprepname").getValue();
 			var inprepdate = sap.ui.getCore().byId("inprepDate").getDateValue();
 			var inprepviz = sap.ui.getCore().byId("inprepvis").getSelected();

 			if (inpcalID === '' || inpcalstartDate === '' || inpcalendDate === '' || inpcalsrtdep === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"ZcalId": inpcalID,
 				"Zstartdate": inpcalstartDate,
 				"Zenddate": inpcalendDate,
 				"Zshortdesp": inpcalsrtdep,
 				"Zevent": inpcalevent,
 				"Zcolor": selectedItemDescription,
 				"ZiconId": this.selectedIcon
 			}
 			var oUpdatedCalendarModel = new JSONModel();
 			var oCalendarModel = this.getView().getModel("oCalendarModel");
 			var oCalendarModelData = oCalendarModel.getData()
 			oCalendarModelData.push(addItem)
 			oUpdatedCalendarModel.setData(oCalendarModelData);
 			this.getView().setModel(oUpdatedCalendarModel, "oCalendarModel");
 			oCalendarModel.refresh(true);

 			var oTable = this.getView().byId("tabCalendar");
 			var oTableData = oTable.getBinding("items").oList;
 			console.log(oTableData)

 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/ZFI_FMA_EVENT_CALSet";

 			for (var i = 0; i < oTableData.length; i++) {
 				var addRow = oTableData[i];
 				delete addRow.__metadata;
 				batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addRow));
 			}

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);
 			oDataModel.submitBatch(function (oData, oResponse) {
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					sap.ui.core.BusyIndicator.hide(0);
 					sap.m.MessageBox.success("Added Successfully");
 					that.onLoadCalendarData()
 					if (that._oInputField) {
 						that._oInputField.setValue(""); // Clear the value
 						that._oInputField.data("Zcolor", null);
 						that.getView().byId("inpcalevent").setValue(""); // Clear custom data if stored
 					}
 					that.selectedItemDescription = "";
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("failed");
 			});

 			this.AddNewCalendarDialog.close();
 			AddNewCalendarDialog.getContent().forEach(function (control) {
 				if (control.setValue) {
 					control.setValue(""); // Clear all inputs in the dialog
 				}
 			});
 		},
 		onuploadreport: function () {
 			// Create or load the file upload fragment
 			if (!this._oFileUploadDialog) {
 				this._oFileUploadDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.FileUploadFragment", this);
 				this.getView().addDependent(this._oFileUploadDialog);
 			}

 			var oFileUploader = sap.ui.getCore().byId("fileUploader");
 			if (oFileUploader) {
 				oFileUploader.clear();
 			}

 			// Open the dialog
 			this._oFileUploadDialog.open();

 		},
 		onuploadreportpdf: function () {
 			// Create or load the file upload fragment
 			if (!this._oFileUploadpdfDialog) {
 				this._oFileUploadpdfDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.FileUploadFragmentpdf", this);
 				this.getView().addDependent(this._oFileUploadpdfDialog);
 			}

 			var oFileUploader = sap.ui.getCore().byId("fileUploaderpdf");
 			if (oFileUploader) {
 				oFileUploader.clear();
 			}

 			// Open the dialog
 			this._oFileUploadpdfDialog.open();

 		},

 		onUploadFileattach: function () {
 			var that = this;

 			sap.ui.core.BusyIndicator.show(0);
 			// Get the FileUploader instance from the fragment
 			var fileUploader = sap.ui.getCore().byId("fileUploader");

 			// Ensure FileUploader is valid
 			if (!fileUploader) {
 				sap.m.MessageToast.show("File uploader not found!");
 				sap.ui.core.BusyIndicator.hide();
 				return;
 			}

 			// Retrieve the selected file
 			var fileInput = fileUploader.getDomRef().querySelector("input[type='file']");
 			var file = fileInput ? fileInput.files[0] : null;

 			// Validate mandatory fields
 			if (!file) {
 				sap.m.MessageToast.show("Please select a file to upload!");
 				sap.ui.core.BusyIndicator.hide();
 				return;
 			}

 			// Construct the form data object
 			var formData = new FormData();
 			formData.append("file", file);

 			// Define OData URL for `CREATE_STREAM`
 			var sUrl = "/sap/opu/odata/sap/ZFI_MOBILE_SRV/Report_AttachmentSet"; // Adjust service URL

 			// Fetch CSRF Token
 			var token;
 			$.ajax({
 				url: sUrl,
 				type: "GET",
 				async: false,
 				headers: {
 					"X-CSRF-Token": "Fetch"
 				},
 				success: function (result, textStatus, xhr) {
 					token = xhr.getResponseHeader("X-CSRF-Token");
 				},
 				error: function () {
 					sap.m.MessageToast.show("Failed to fetch CSRF token.");
 					sap.ui.core.BusyIndicator.hide();
 					return;
 				}
 			});

 			// Perform file upload using AJAX
 			$.ajax({
 				url: sUrl,
 				type: "POST",
 				data: formData,
 				processData: false,
 				contentType: false,
 				headers: {
 					"X-CSRF-Token": token,
 					"Accept": "application/json"
 				},
 				success: function (response) {
 					sap.m.MessageToast.show("File uploaded successfully!");
 					// that._updateFileInfo(file.name);
 					var fileUrl = response.d ? response.d.ZreportFile : null;
 					var attachmentId = response.d ? response.d.ZattachmentId : null; // Get Attachment ID

 					var oView = that.getView();
 					// Store Attachment ID in a hidden field inside "Upload Report" fragment
 					var oAttachmentIdInput = sap.ui.getCore().byId("inprepattach");
 					if (oAttachmentIdInput) {
 						oAttachmentIdInput.setValue(attachmentId);
 					}
 					// Get the Add New Report fragment's buttons
 					var oUploadButton = sap.ui.getCore().byId("uploadReportButton"); // Upload button
 					var oViewReportButton = sap.ui.getCore().byId("uploadedFileIcon"); // View Report button

 					if (oUploadButton) {
 						oUploadButton.setEnabled(false); // Disable Upload Button
 					}

 					if (oViewReportButton) {
 						oViewReportButton.setVisible(true); // Enable View Report Button
 						oViewReportButton.data("fileUrl", fileUrl);
 					}

 					that.onCancelUpload(); // Close dialog after success
 				},
 				error: function () {
 					sap.m.MessageBox.error("Failed to upload file.");
 				},
 				complete: function () {
 					sap.ui.core.BusyIndicator.hide();
 				}

 			});

 			// Show busy indicator while the request is being processed
 			sap.ui.core.BusyIndicator.hide(0);
 		},
 		onUploadFileattachGI: function () {
 			debugger;
 			var that = this;

 			sap.ui.core.BusyIndicator.show(0);
 			// Get the FileUploader instance from the fragment
 			var fileUploader = sap.ui.getCore().byId("fileUploader");

 			// Ensure FileUploader is valid
 			if (!fileUploader) {
 				sap.m.MessageToast.show("File uploader not found!");
 				sap.ui.core.BusyIndicator.hide();
 				return;
 			}

 			// Retrieve the selected file
 			var fileInput = fileUploader.getDomRef().querySelector("input[type='file']");
 			var file = fileInput ? fileInput.files[0] : null;

 			// Validate mandatory fields
 			if (!file) {
 				sap.m.MessageToast.show("Please select a file to upload!");
 				sap.ui.core.BusyIndicator.hide();
 				return;
 			}

 			// Validate file type
 			var fileName = file.name.toLowerCase();
 			if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
 				sap.m.MessageToast.show("Please select only Excel files (.xlsx or .xls)!");
 				sap.ui.core.BusyIndicator.hide();
 				return;
 			}

 			// Get CSV output
 			// const csvOutput = exportToCSV(hierarchy);
 			// console.log("\n\nCSV Output (first 5 rows):");
 			// console.log(csvOutput.split('\n').join('\n'));
 			// console.log("...");

 			var reader = new FileReader();
 			// Read the file as binary string
 			reader.readAsBinaryString(file);
 			reader.onload = function (e) {
 				try {
 					var data = e.target.result;
 					var workbook = XLSX.read(data, {
 						type: 'binary'
 					});

 					// Get first sheet name
 					var firstSheetName = workbook.SheetNames[0];

 					// Get worksheet
 					var worksheet = workbook.Sheets[firstSheetName];

 					// Convert to JSON
 					var jsonData = XLSX.utils.sheet_to_json(worksheet, {
 						header: 1, // Use first row as header
 						defval: "" // Default value for empty cells
 					});

 					// Process the data to create proper JSON object
 					if (jsonData.length > 0) {
 						var headers = jsonData[0]; // First row contains headers
 						var processedData = [];

 						// Convert array data to object format
 						for (var i = 1; i < jsonData.length; i++) {
 							var row = jsonData[i];
 							var rowObject = {};

 							for (var j = 0; j < headers.length; j++) {
 								rowObject[headers[j]] = row[j] || "";
 							}

 							processedData.push(rowObject);
 						}

 						// Store the JSON data in a model or variable
 						that.excelJsonData = processedData;

 						// You can also store it in a model
 						var oModel = new sap.ui.model.json.JSONModel({
 							excelData: processedData
 						});
 						that.getView().setModel(oModel, "excelModel");
 						debugger;
 						console.log("Excel data converted to JSON:", processedData);

 						const parentChildSet = new Set();

 						// Process each path
 						processedData.forEach(path => {

 							if (path["Item Type"] === 'Item') {

 								const filePath = path.Path + (path.Title != "" ? "/" + path.Title : '');
 								const parts = filePath.split('/');

 								// Starting from cop/GI/Finance/ as root
 								const rootIndex = 3; // cop/GI/Finance is at index 0,1,2

 								// Add root to its immediate children
 								if (parts.length > rootIndex) {
 									const rootPath = parts.slice(0, rootIndex).join('/') + '/';
 									const child = parts[rootIndex];
 									parentChildSet.add(`${rootPath}|${child}`);
 								}

 								// Add relationships between subsequent levels
 								for (let i = rootIndex; i < parts.length - 1; i++) {
 									const parentPath = parts.slice(0, i + 1).join('/') + '/';
 									const child = parts[i + 1];
 									if (i === parts.length - 2) {
 										const giUrl = encodeURI(`https://sharek.aramco.com.sa/${path.Path}/${path.Name}`);
 										parentChildSet.add(
 											`${parentPath}|${child}|${path.Name}|${path.Title}|${path["Issuing Org"]}|${path["Contact Person"]}|${path["Issue date"]}|${path["Item Type"]}|${giUrl}`
 										);
 									} else {
 										parentChildSet.add(`${parentPath}|${child}`);
 									}
 								}
 							}
 						});

 						// Convert to array and sort
 						var GiId = 1;
 						var batchChanges = [];
 						var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 						var oDataModel = new sap.ui.model.odata.ODataModel(url);
 						oDataModel.setUseBatch(true);
 						var uPath = "/ShareKGISet";
 						const parentChildArray = Array.from(parentChildSet).map(item => {
 							const [parent, child, id, title, issuingOrg, contactPerson, issueDate, itemType, fullPath] = item.split('|');

 							const giData = {
 								ParentId: `GI00${GiId}`,
 								Parent: parent,
 								Child: child,
 								Name: id,
 								Title: title,
 								IssuingOrg: issuingOrg,
 								ContactPerson: contactPerson,
 								IssueDate: issueDate,
 								ItemType: itemType,
 								Path: fullPath
 							};
 							GiId = GiId + 1;

 							batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", giData));

 							return {
 								parent,
 								child,
 								id,
 								title,
 								issuingOrg,
 								contactPerson,
 								issueDate,
 								itemType,
 								fullPath
 							};
 						});

 						oDataModel.addBatchChangeOperations(batchChanges);
 						sap.ui.core.BusyIndicator.show(0);

 						oDataModel.submitBatch(function (oData, oResponse) {
 							sap.ui.core.BusyIndicator.hide(0);
 							if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 								that.onLoadFinCalTab();
 								sap.m.MessageBox.success("Financial Dashboard Tab added successfully!");
 							}
 						}, function (oError) {
 							sap.ui.core.BusyIndicator.hide(0);
 							sap.m.MessageBox.error("Failed to update data");
 						});

 						// Continue with file upload if needed
 						// that._uploadFileToServer(file);

 					} else {
 						sap.m.MessageToast.show("Excel file is empty!");
 						sap.ui.core.BusyIndicator.hide();
 					}

 				} catch (error) {
 					sap.m.MessageBox.error("Error reading Excel file: " + error.message);
 					sap.ui.core.BusyIndicator.hide();
 				}
 			};

 			reader.onerror = function (error) {
 				sap.m.MessageBox.error("Failed to read file!");
 				sap.ui.core.BusyIndicator.hide();
 			};

 			// Show busy indicator while the request is being processed
 			sap.ui.core.BusyIndicator.hide(0);
 		},
 		onUploadFileattachpdf: function () {
 			var that = this;

 			sap.ui.core.BusyIndicator.show(0);
 			// Get the FileUploader instance from the fragment
 			var fileUploader = sap.ui.getCore().byId("fileUploaderpdf");

 			// Ensure FileUploader is valid
 			if (!fileUploader) {
 				sap.m.MessageToast.show("File uploader not found!");
 				sap.ui.core.BusyIndicator.hide();
 				return;
 			}

 			// Retrieve the selected file
 			var fileInput = fileUploader.getDomRef().querySelector("input[type='file']");
 			var file = fileInput ? fileInput.files[0] : null;

 			// Validate mandatory fields
 			if (!file) {
 				sap.m.MessageToast.show("Please select a file to upload!");
 				sap.ui.core.BusyIndicator.hide();
 				return;
 			}

 			// Construct the form data object
 			var formData = new FormData();
 			formData.append("file", file);

 			// Define OData URL for `CREATE_STREAM`
 			var sUrl = "/sap/opu/odata/sap/ZFI_MOBILE_SRV/Report_AttachmentSet"; // Adjust service URL

 			// Fetch CSRF Token
 			var token;
 			$.ajax({
 				url: sUrl,
 				type: "GET",
 				async: false,
 				headers: {
 					"X-CSRF-Token": "Fetch"
 				},
 				success: function (result, textStatus, xhr) {
 					token = xhr.getResponseHeader("X-CSRF-Token");
 				},
 				error: function () {
 					sap.m.MessageToast.show("Failed to fetch CSRF token.");
 					sap.ui.core.BusyIndicator.hide();
 					return;
 				}
 			});

 			// Perform file upload using AJAX
 			$.ajax({
 				url: sUrl,
 				type: "POST",
 				data: formData,
 				processData: false,
 				contentType: false,
 				headers: {
 					"X-CSRF-Token": token,
 					"Accept": "application/json"
 				},
 				success: function (response) {
 					sap.m.MessageToast.show("File uploaded successfully!");
 					// that._updateFileInfo(file.name);
 					var fileUrl = response.d ? response.d.ZreportFile : null;
 					var attachmentId = response.d ? response.d.ZattachmentId : null; // Get Attachment ID

 					var oView = that.getView();
 					// Store Attachment ID in a hidden field inside "Upload Report" fragment
 					var oAttachmentIdInput = sap.ui.getCore().byId("inprepattachpdf");
 					if (oAttachmentIdInput) {
 						oAttachmentIdInput.setValue(attachmentId);
 					}
 					// Get the Add New Report fragment's buttons
 					var oUploadButton = sap.ui.getCore().byId("uploadReportButtonpdf"); // Upload button
 					var oViewReportButton = sap.ui.getCore().byId("uploadedFileIconpdf"); // View Report button

 					if (oUploadButton) {
 						oUploadButton.setEnabled(false); // Disable Upload Button
 					}

 					if (oViewReportButton) {
 						oViewReportButton.setVisible(true); // Enable View Report Button
 						oViewReportButton.data("fileUrl", fileUrl);
 					}

 					that.onCancelUploadpdf(); // Close dialog after success
 				},
 				error: function () {
 					sap.m.MessageBox.error("Failed to upload file.");
 				},
 				complete: function () {
 					sap.ui.core.BusyIndicator.hide();
 				}

 			});

 			// Show busy indicator while the request is being processed
 			sap.ui.core.BusyIndicator.hide(0);
 		},
 		_updateFileInfo: function (fileName) {
 			debugger;
 			var oView = this.getView(); // Get the current view

 			// Find the "Upload Report" button and disable it
 			var uploadButton = oView.byId("uploadReportButton");
 			if (uploadButton) {
 				uploadButton.setEnabled(false);
 			}

 			// Find the "Uploaded File" icon button and enable/show it
 			var uploadedFileIcon = oView.byId("uploadedFileIcon");
 			if (uploadedFileIcon) {
 				uploadedFileIcon.setVisible(true);
 				uploadedFileIcon.setEnabled(true);
 				uploadedFileIcon.data("fileUrl", fileUrl); // Store file URL for later use
 			}
 		},
 		onCancelUpload: function () {
 			this._oFileUploadDialog.close();
 		},
 		onCancelUploadpdf: function () {
 			this._oFileUploadpdfDialog.close();
 		},
 		onOpenUploadedFile: function () {
 			var oViewReportButton = sap.ui.getCore().byId("uploadedFileIcon");

 			if (oViewReportButton) {
 				var fileUrl = oViewReportButton.data("fileUrl"); // Retrieve stored file URL

 				if (fileUrl) {
 					window.open(fileUrl, "_blank"); // Open file in a new tab
 				} else {
 					sap.m.MessageToast.show("No file available to view.");
 				}
 			}
 		},
 		onOpenUploadedFilepdf: function () {
 			var oViewReportButton = sap.ui.getCore().byId("uploadedFileIconpdf");

 			if (oViewReportButton) {
 				var fileUrl = oViewReportButton.data("fileUrl"); // Retrieve stored file URL

 				if (fileUrl) {
 					window.open(fileUrl, "_blank"); // Open file in a new tab
 				} else {
 					sap.m.MessageToast.show("No file available to view.");
 				}
 			}
 		},

 		onUpdateGISItemFolder: function (oEvent) {
 			debugger;
 			var finmobview = this.getView().getModel("finmobview");
 			if (!this.UpdateGISItemFolderDialog) {
 				this.UpdateGISItemFolderDialog = sap.ui.xmlfragment("UpdateGISItemFolderDialog",
 					"mobilefinance.MobileFinance.fragments.UpdateGISReportFolder", this);
 				this.getView().addDependent(this.UpdateGISItemFolderDialog);

 			}
 			var oGISFolderInput = sap.ui.core.Fragment.byId("UpdateGISItemFolderDialog", "gisFolderInput");
 			var oGISFolderTitle = sap.ui.core.Fragment.byId("UpdateGISItemFolderDialog", "inpgisfolderupTitle");

 			if (oGISFolderInput) {
 				oGISFolderInput.setValue(""); // Clear the value for F4 Input
 			}
 			if (oGISFolderTitle) {
 				oGISFolderTitle.setValue(""); // Clear the value for title input
 			}

 			this.UpdateGISItemFolderDialog.open();
 		},
 		onUpdateGISFolder: function () {
 			var that = this;
 			debugger;
 			var finmobview = this.getView().getModel("finmobview");
 			var oDialog = this.UpdateGISItemFolderDialog;
 			// var selectedFolderId = sap.ui.getCore().byId("gisFolderInput").data("ZgisFolderId");
 			var sFoldertitle = sap.ui.core.Fragment.byId("UpdateGISItemFolderDialog", "gisFolderInput").getValue();
 			var sFolderId = sap.ui.core.Fragment.byId("UpdateGISItemFolderDialog", "gisFolderInput").data("ZgisFolderId");
 			var sNewFolderTitle = sap.ui.core.Fragment.byId("UpdateGISItemFolderDialog", "inpgisfolderupTitle").getValue();

 			// Validate inputs
 			if (!sFolderId || !sNewFolderTitle) {
 				sap.m.MessageToast.show("Please select a folder and enter a new title.");
 				return;
 			}

 			// Define the OData Model
 			var oModel = this.getView().getModel(); // Assuming the model is set at the view level

 			// Define the update payload
 			var oPayload = {
 				ZgisFolderTitle: sNewFolderTitle
 			};

 			// Define the OData Entity Key
 			var sPath = "/GisFolderSet('" + sFolderId + "')";

 			// Perform the OData Update (MERGE/PATCH)
 			finmobview.update(sPath, oPayload, {
 				method: "MERGE", // OR "PATCH"
 				success: function () {
 					that.onLoadGISReportsData();
 					sap.m.MessageToast.show("GIS Folder updated successfully!");
 				},
 				error: function (oError) {
 					sap.m.MessageToast.show("Error updating GIS Folder. Check console for details.");
 					console.error(oError);
 				}
 			});
 			this.UpdateGISItemFolderDialog.close();
 		},
 		closeUpdatefolderGISDialog: function (oEvent) {
 			if (this.UpdateGISItemFolderDialog) {
 				this.UpdateGISItemFolderDialog.close();
 			}
 		},

 		//ShareK Code
 		onUpdateShareKItem: function (oEvent) {
 			debugger;
 			var finmobview = this.getView().getModel("finmobview");
 			if (!this.updateShareKFolderDialog) {
 				this.updateShareKFolderDialog = sap.ui.xmlfragment("updateShareKFolderDialog",
 					"mobilefinance.MobileFinance.fragments.UpdateShareKFolder", this);
 				this.getView().addDependent(this.updateShareKFolderDialog);

 			}
 			var oGISFolderInput = sap.ui.core.Fragment.byId("updateShareKFolderDialog", "gisFolderInput");
 			var oGISFolderTitle = sap.ui.core.Fragment.byId("updateShareKFolderDialog", "inpgisfolderupTitle");

 			if (oGISFolderInput) {
 				oGISFolderInput.setValue(""); // Clear the value for F4 Input
 			}
 			if (oGISFolderTitle) {
 				oGISFolderTitle.setValue(""); // Clear the value for title input
 			}

 			this.updateShareKFolderDialog.open();
 		},
 		onUpdateShareKFolder: function () {
 			var that = this;
 			debugger;
 			var finmobview = this.getView().getModel("finmobview");
 		
 			var oDialog = this.updateShareKFolderDialog;
 			// var selectedFolderId = sap.ui.getCore().byId("gisFolderInput").data("ZgisFolderId");
 			var sFoldertitle = sap.ui.core.Fragment.byId("updateShareKFolderDialog", "gisFolderInput").getValue();
 			var sFolderId = sap.ui.core.Fragment.byId("updateShareKFolderDialog", "gisFolderInput").data("ParentId");
 			var sNewFolderTitle = sap.ui.core.Fragment.byId("updateShareKFolderDialog", "inpgisfolderupTitle").getValue();

 			// Validate inputs
 			if (!sFolderId || !sNewFolderTitle) {
 				sap.m.MessageToast.show("Please select a folder and enter a new title.");
 				return;
 			}

 			// Define the OData Model
 			var oModel = this.getView().getModel(); // Assuming the model is set at the view level

 			// Define the update payload
 			var oPayload = {
 				Child: sNewFolderTitle
 			};

 			// Define the OData Entity Key
 			var sPath = "/ShareKGISet('" + sFolderId + "')";

 			// Perform the OData Update (MERGE/PATCH)
 			finmobview.update(sPath, oPayload, {
 				method: "MERGE", // OR "PATCH"
 				success: function () {
 					// that.onLoadGISReportsData();
 					// sap.m.MessageToast.show("GIS Folder updated successfully!");
 				},
 				error: function (oError) {
 					sap.m.MessageToast.show("Error updating GIS Folder. Check console for details.");
 					console.error(oError);
 				}
 			});
 			this.updateShareKFolderDialog.close();
 		},
 		closeUpdatefolderShareKDialog: function (oEvent) {
 			if (this.updateShareKFolderDialog) {
 				this.updateShareKFolderDialog.close();
 			}
 		},
 		onValueHelpShareKRequest: function (oEvent) {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");
 			var sharekview = this.getView().getModel("oShareKGISReportModel").getData();
 			var oShareKGISReportModel = new JSONModel();
 			debugger;
 			console.log('printed from shareK + ' + sharekview["ParentId"]);
 			this._oInputControl = oEvent.getSource();
 			if (!this.oModel) {
 				MessageToast.show("OData Model is not initialized.");
 				console.error("OData Model is undefined.");
 				return;
 			}

 			// Load Fragment if not already loaded
 			if (!this._oValueHelpDialog) {
 				this._oValueHelpDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.ShareKFolderValueHelp", this);
 				this.getView().addDependent(this._oValueHelpDialog);
 			}
 				var oJsonModel = new JSONModel(sharekview);
 			this._oValueHelpDialog.setModel(oJsonModel); 
 			this._oValueHelpDialog.open();
 			// Read data from OData Service
 			// finmobview.read("/GisFolderSet", {
 			// 	success: function (oData) {
 			// 		var oJsonModel = new JSONModel(oData);
 			// 		that._oValueHelpDialog.setModel(oJsonModel);
 			// 		that._oValueHelpDialog.open();
 			// 	},
 			// 	error: function (oError) {
 			// 		MessageToast.show("Error fetching GIS Folder data.");
 			// 		console.error("OData Error:", oError);
 			// 	}
 			// });
 		},
 		onAddShareKFolder: function (oEvent) {
 			var that = this;
 			debugger;
 			var finmobview = this.getView().getModel("finmobview");

 			// Create the dialog if it doesn't exist
 			if (!this.AddNewSharekFolderDialog) {
 				this.AddNewSharekFolderDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewSharekReportItemFolder", this);
 				this.getView().addDependent(this.AddNewSharekFolderDialog);
 			}

 			// Reset input fields
 			sap.ui.getCore().byId("inpgisfolderid").setValue("");
 			sap.ui.getCore().byId("inpgisfolder").setValue("");

 		

 			// OData Service Call to fetch the latest GIS Folder IDs
 			finmobview.read("/GisFolderSet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Get the latest GIS Folder ID
 						var latestGisId = oResults[oResults.length - 1].ZgisFolderId;

 						if (latestGisId && latestGisId.startsWith("F")) {
 							var gisIdNum = parseInt(latestGisId.replace("F", ""), 10);
 							var newGisIdNum = gisIdNum + 1;

 							// Generate new GIS Folder ID with leading zeros
 							var numericLength = latestGisId.length - 1;
 							var newGisId = "F" + newGisIdNum.toString().padStart(numericLength, "0");

 							sap.ui.getCore().byId("inpgisfolderid").setValue(newGisId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inpgisfolderid").setValue("F001");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching GIS Folder data:", oError);
 					sap.ui.getCore().byId("inpgisfolderid").setValue("F001"); // Fallback default ID
 				}
 			});

 			// Open the dialog after setting the ID
 			this.AddNewSharekFolderDialog.open();
 		},

 		onAddNewGISItemFolder: function (oEvent) {
 			var that = this;
 			debugger;
 			var finmobview = this.getView().getModel("finmobview");

 			// Create the dialog if it doesn't exist
 			if (!this.AddNewGISFolderDialog) {
 				this.AddNewGISFolderDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewGISReportItemFolder", this);
 				this.getView().addDependent(this.AddNewGISFolderDialog);
 			}

 			// Reset input fields
 			sap.ui.getCore().byId("inpgisfolderid").setValue("");
 			sap.ui.getCore().byId("inpgisfolder").setValue("");

 			// var sUrl =
 			// 	"https://sharek.aramco.com.sa/cop/GI/_api/web/GetList(@listUrl)/RenderListDataAsStream?@listUrl=%27%2Fcop%2FGI%2FFinance%27&View=b254b0eb-95b6-4a60-89aa-6137dfc68a33";

 			// var oPayload = {
 			// 	"parameters": {
 			// 		"__metadata": {
 			// 			"type": "SP.RenderListDataParameters"
 			// 		},
 			// 		"RenderOptions": 1943,
 			// 		"AddRequiredFields": true
 			// 	}
 			// };

 			// // Get request digest (needed for SharePoint POST)
 			// var sRequestDigest = $("#__REQUESTDIGEST").val();

 			// $.ajax({
 			// 	url: sUrl,
 			// 	method: "POST",
 			// 	contentType: "application/json;odata=verbose",
 			// 	headers: {
 			// 		"Accept": "application/json;odata=verbose",
 			// 		"X-RequestDigest": sRequestDigest
 			// 	},
 			// 	data: JSON.stringify(oPayload),
 			// 	xhrFields: {
 			//         		withCredentials: true // Ensures cookies like FedAuth are sent if cross-domain and allowed
 			//     		},
 			//     		crossDomain: true,
 			// 	success: function (data) {
 			// 		console.log("SharePoint Data:", data);

 			// 		// Example: You can parse data.Row and determine new ID logic here
 			// 		// sap.ui.getCore().byId("inpgisfolderid").setValue("YourGeneratedID");

 			// 		// that.AddNewGISFolderDialog.open();
 			// 	},
 			// 	error: function (err) {
 			// 		console.error("Error calling SharePoint API:", err);
 			// 		sap.ui.getCore().byId("inpgisfolderid").setValue("F001"); // fallback
 			// 		// that.AddNewGISFolderDialog.open();
 			// 	}
 			// });

 			// OData Service Call to fetch the latest GIS Folder IDs
 			finmobview.read("/GisFolderSet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Get the latest GIS Folder ID
 						var latestGisId = oResults[oResults.length - 1].ZgisFolderId;

 						if (latestGisId && latestGisId.startsWith("F")) {
 							var gisIdNum = parseInt(latestGisId.replace("F", ""), 10);
 							var newGisIdNum = gisIdNum + 1;

 							// Generate new GIS Folder ID with leading zeros
 							var numericLength = latestGisId.length - 1;
 							var newGisId = "F" + newGisIdNum.toString().padStart(numericLength, "0");

 							sap.ui.getCore().byId("inpgisfolderid").setValue(newGisId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inpgisfolderid").setValue("F001");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching GIS Folder data:", oError);
 					sap.ui.getCore().byId("inpgisfolderid").setValue("F001"); // Fallback default ID
 				}
 			});

 			// Open the dialog after setting the ID
 			this.AddNewGISFolderDialog.open();
 		},

 		onValueHelpRequest: function (oEvent) {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");
 			// var oGISReportModel = new JSONModel();
 			this._oInputControl = oEvent.getSource();
 			// Check if the model is initialized
 			if (!this.oModel) {
 				MessageToast.show("OData Model is not initialized.");
 				console.error("OData Model is undefined.");
 				return;
 			}

 			// Load Fragment if not already loaded
 			if (!this._oValueHelpDialog) {
 				this._oValueHelpDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.FolderValueHelp", this);
 				this.getView().addDependent(this._oValueHelpDialog);
 			}

 			// Read data from OData Service
 			finmobview.read("/GisFolderSet", {
 				success: function (oData) {
 					var oJsonModel = new JSONModel(oData);
 					that._oValueHelpDialog.setModel(oJsonModel);
 					that._oValueHelpDialog.open();
 				},
 				error: function (oError) {
 					MessageToast.show("Error fetching GIS Folder data.");
 					console.error("OData Error:", oError);
 				}
 			});
 		},

 		onValueHelpSearch: function (oEvent) {
 			var sValue = oEvent.getParameter("value");
 			var oFilter = new sap.ui.model.Filter("ZgisFolderTitle", sap.ui.model.FilterOperator.Contains, sValue);
 			oEvent.getSource().getBinding("items").filter([oFilter]);
 		},

 		onValueHelpConfirm: function (oEvent) {
 			var oSelectedItem = oEvent.getParameter("selectedItem");

 			if (oSelectedItem && this._oInputControl) {
 				// Get properties directly from the selected item if binding context is undefined
 				var oContext = oSelectedItem.getBindingContext();
 				var folderId = oContext ? oContext.getProperty("ZgisFolderId") : oSelectedItem.getKey();
 				var folderTitle = oContext ? oContext.getProperty("ZgisFolderTitle") : oSelectedItem.getText();

 				// Set the folder title in the input control
 				this._oInputControl.setValue(folderTitle);

 				// Store both folder ID and folder title as custom data
 				this._oInputControl.data("ZgisFolderId", folderId);
 				this._oInputControl.data("ZgisFolderTitle", folderTitle);
 			} else {
 				console.error("Input control not found or no item selected.");
 			}
 		},
 			onShareKValueHelpConfirm: function (oEvent) {
 			var oSelectedItem = oEvent.getParameter("selectedItem");

 			if (oSelectedItem && this._oInputControl) {
 				// Get properties directly from the selected item if binding context is undefined
 				var oContext = oSelectedItem.getBindingContext();
 				var folderId = oContext ? oContext.getProperty("ParentId") : oSelectedItem.getKey();
 				var folderTitle = oContext ? oContext.getProperty("Child") : oSelectedItem.getText();

 				// Set the folder title in the input control
 				this._oInputControl.setValue(folderTitle);

 				// Store both folder ID and folder title as custom data
 				this._oInputControl.data("ParentId", folderId);
 				this._oInputControl.data("Child", folderTitle);
 			} else {
 				console.error("Input control not found or no item selected.");
 			}
 		},

 		onValueHelpCancel: function () {
 			if (this._oValueHelpDialog) {
 				this._oValueHelpDialog.close();
 			}
 		},

 		// onAddGISItem: function () {
 		// 	debugger;
 		// 	var that = this;
 		// 	var inpgisid = sap.ui.getCore().byId("inpgisid").getValue();
 		// 	var inpgisTitle = sap.ui.getCore().byId("inpgisTitle").getValue();
 		// 	var inpgisurl = sap.ui.getCore().byId("inpgisurl").getValue();
 		// 	var inpgisvis = sap.ui.getCore().byId("inpgisvis").getSelected();

 		// 	if (inpgisid === '' || inpgisTitle === '' || inpgisurl === '') {
 		// 		sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 		// 		return;
 		// 	}

 		// 	var addItem = {
 		// 		"ZgisId": inpgisid,
 		// 		"ZgisTitle": inpgisTitle,
 		// 		"ZreportUrl": inpgisurl,
 		// 		"Zvisibility": inpgisvis
 		// 	}
 		// 	var oUpdatedGISModel = new JSONModel();
 		// 	var oGISReportModel = this.getView().getModel("oGISReportModel");
 		// 	var oGISReportModelData = oGISReportModel.getData()
 		// 	oGISReportModelData.push(addItem)
 		// 	oUpdatedGISModel.setData(oGISReportModelData);
 		// 	this.getView().setModel(oUpdatedGISModel, "oGISReportModel");
 		// 	oGISReportModel.refresh(true);

 		// 	var oTable = this.getView().byId("tabGISReports");
 		// 	var oTableData = oTable.getBinding("items").oList;
 		// 	console.log(oTableData)

 		// 	var batchChanges = [];
 		// 	var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 		// 	var oDataModel = new sap.ui.model.odata.ODataModel(url);
 		// 	oDataModel.setUseBatch(true);
 		// 	var uPath = "/ZFI_FMA_GISSet";

 		// 	for (var i = 0; i < oTableData.length; i++) {
 		// 		var addRow = oTableData[i];
 		// 		delete addRow.__metadata;
 		// 		batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addRow));
 		// 	}

 		// 	oDataModel.addBatchChangeOperations(batchChanges);
 		// 	sap.ui.core.BusyIndicator.show(0);
 		// 	oDataModel.submitBatch(function (oData, oResponse) {
 		// 		if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 		// 			sap.ui.core.BusyIndicator.hide(0);
 		// 			// sap.m.MessageBox.success("Updated Successfully");
 		// 			that.onLoadGISReportsData()

 		// 		}
 		// 	}, function (oError) {
 		// 		sap.ui.core.BusyIndicator.hide(0);
 		// 		sap.m.MessageBox.success("failed");
 		// 	});

 		// 	this.AddNewGISDialog.close();
 		// },
 		onAddGISItem: function () {
 			debugger;
 			var that = this;
 			var inpgisid = sap.ui.getCore().byId("inpgisid").getValue();
 			var inpgisTitle = sap.ui.getCore().byId("inpgisTitle").getValue();
 			var inpgisurl = sap.ui.getCore().byId("inpgisurl").getValue();
 			var inpgisvis = sap.ui.getCore().byId("inpgisvis").getSelected();
 			// var selectedFolderId = sap.ui.getCore().byId("gisFolderInput").data("ZgisFolderId");
 			// var selectedFolderTitle = sap.ui.getCore().byId("gisFolderInput").getValue();
 			var selectedFolderId = that.selectedFolderId;
 			var selectedFolderTitle = that.selectedFolderTitle;

 			if (inpgisid === '' || inpgisTitle === '' || inpgisurl === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"ZgisId": inpgisid,
 				"ZgisTitle": inpgisTitle,
 				"ZreportUrl": inpgisurl,
 				"Zvisibility": inpgisvis,
 				"ZgisFolderId": selectedFolderId, // Add folder ID
 				"ZgisFolderTitle": selectedFolderTitle // Add folder title
 			};

 			// Perform OData Batch Processing
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/ZFI_FMA_GISSet";

 			// for (var i = 0; i < aTableData.length; i++) {
 			// 	var addRow = aTableData[i];
 			// 	delete addRow.__metadata;
 			// 	batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addRow));
 			// }
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					that.refreshGISDataAfterAddition(selectedFolderId, selectedFolderTitle);
 					sap.m.MessageBox.success("GIs Publication added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});

 			this.AddNewGISDialog.close();
 		},

 		closeAddNewGISDialog: function (oEvent) {
 			if (this.AddNewGISDialog) {
 				this.AddNewGISDialog.close();
 			}
 		},
 		// 		
 		refreshGISDataAfterAddition: function (sSelectedFolderId, sSelectedFolderTitle) {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			sap.ui.core.BusyIndicator.show(0);
 			finmobview.read("/ZFI_FMA_GISSet", {
 				success: function (oData) {
 					var aFilteredData = oData.results.filter(function (item) {
 						return item.ZgisFolderId === sSelectedFolderId && item.ZgisFolderTitle === sSelectedFolderTitle;
 					});

 					var oFilteredModel = new sap.ui.model.json.JSONModel(aFilteredData);
 					that.getView().setModel(oFilteredModel, "oSelectedGISReportModel");

 					sap.ui.core.BusyIndicator.hide(0);
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					console.error("Error refreshing GIS data: ", oError);
 				}
 			});
 		},

 		onAddGISItemFolder: function () {
 			debugger;
 			var that = this;
 			var inpgisid = sap.ui.getCore().byId("inpgisfolderid").getValue();
 			var inpgisfolder = sap.ui.getCore().byId("inpgisfolder").getValue();

 			if (inpgisfolder === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"ZgisFolderId": inpgisid,
 				"ZgisFolderTitle": inpgisfolder
 			};

 			// Get the existing table model
 			var oGISReportModel = this.getView().getModel("oGISReportModel");
 			var aTableData = oGISReportModel.getProperty("/");

 			if (!Array.isArray(aTableData)) {
 				aTableData = []; // Ensure the data is an array
 			}

 			// Find the first index of the same title
 			var iInsertIndex = aTableData.findIndex(row => row.ZgisFolderTitle === addItem.ZgisFolderTitle);

 			if (iInsertIndex === -1) {
 				// If title not found, push to the end
 				aTableData.push(addItem);
 			} else {
 				// Insert the new row before the first occurrence of the same title
 				aTableData.splice(iInsertIndex, 0, addItem);
 			}

 			// Update the model with the modified data
 			oGISReportModel.setProperty("/", aTableData);

 			// Force table UI update
 			var oTable = this.getView().byId("tabGISReports");
 			oTable.getBinding("items").refresh(true);

 			// Perform OData Batch Processing
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/GisFolderSet";

 			for (var i = 0; i < aTableData.length; i++) {
 				var addRow = aTableData[i];
 				delete addRow.__metadata;
 				batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addRow));
 			}

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					sap.m.MessageBox.success("GIs Folder added successfully!");
 					that.onLoadGISReportsData();
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});

 			this.AddNewGISFolderDialog.close();
 		},
 		closeAddNewGISFolderDialog: function (oEvent) {
 			if (this.AddNewGISFolderDialog) {
 				this.AddNewGISFolderDialog.close();
 			}
 		},

 		onAddNewCalendarItem: function (oEvent) {
 			debugger;
 			if (!this.AddNewCalendarDialog) {
 				this.AddNewCalendarDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewCalendarItem", this);
 				this.getView().addDependent(this.AddNewCalendarDialog);
 			}
 			sap.ui.getCore().byId("inpcalID").setValue("");
 			sap.ui.getCore().byId("inpcalstartDate").setValue("");
 			sap.ui.getCore().byId("inpcalendDate").setValue("");
 			sap.ui.getCore().byId("inpcalshrdep").setValue("");
 			sap.ui.getCore().byId("inpcaleventcat").setValue("");
 			sap.ui.getCore().byId("inpcalevent").setValue("");

 			var oTable = this.getView().byId("tabCalendar");
 			var oTableData = oTable.getBinding("items").oList;
 			debugger;
 			var newLevelId = "C01";
 			sap.ui.getCore().byId("inpcalID").setValue(newLevelId);
 			if (oTableData.length) {
 				console.log(oTableData);
 				console.log(oTableData);
 				var calId = oTableData[oTableData.length - 1].ZcalId;

 				var calidnum = parseInt(calId.replace("C", ""), 10);

 				var newcalIdNum = calidnum + 1;

 				var numericLength = calId.length - 1;

 				var newcalId = "C" + newcalIdNum.toString().padStart(numericLength, "0");

 				console.log(newcalId);
 				sap.ui.getCore().byId("inpcalID").setValue(newcalId);
 			}
 			this.onLoadCalendarCategory();
 			this.AddNewCalendarDialog.open();
 		},

 		onAddCalendarItem: function () {
 			debugger;
 			var that = this;
 			var inpcalID = sap.ui.getCore().byId("inpcalID").getValue();
 			var inpcalstartDate = sap.ui.getCore().byId("inpcalstartDate").getDateValue();
 			var updatedStartDate = new Date(inpcalstartDate);
 			updatedStartDate.setDate(updatedStartDate.getDate() + 1);
 			var inpcalendDate = sap.ui.getCore().byId("inpcalendDate").getDateValue();
 			var updatedEndDate = new Date(inpcalendDate);
 			updatedEndDate.setDate(updatedEndDate.getDate() + 1);
 			var inpcalsrtdep = sap.ui.getCore().byId("inpcalshrdep").getValue();
 			var inpcalevent = sap.ui.getCore().byId("inpcalevent").getValue();
 			var inpCalcatComboBox = sap.ui.getCore().byId("inpcaleventcat");
 			var inpcaleventcatId = inpCalcatComboBox.getSelectedItem() ? inpCalcatComboBox.getSelectedItem().getText() : "";
 			var inpcaleventcat = inpCalcatComboBox.getSelectedItem() ? inpCalcatComboBox.getSelectedItem().getKey() : "";
 			var selectedItemDescription = this.selectedItemDescription;

 			if (inpcalID === '' || inpcalstartDate === '' || inpcalendDate === '' || inpcalsrtdep === '' || inpcaleventcat === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}
 			// var inpcalstartdatefor = inpcalstartDate.toISOString().split("T")[0];
 			// var inpcalenddatefor = inpcalendDate.toISOString().split("T")[0];
 			var addItem = {
 				"ZcalId": inpcalID,
 				"Zstartdate": updatedStartDate,
 				"Zenddate": updatedEndDate,
 				"Zshortdesp": inpcalsrtdep,
 				"Zcategory": inpcaleventcat,
 				"Zevent": inpcalevent,
 				"Zcolor": selectedItemDescription,
 				"ZiconId": this.selectedIcon
 			}
 			var oUpdatedCalendarModel = new JSONModel();
 			var oCalendarModel = this.getView().getModel("oCalendarModel");
 			var oCalendarModelData = oCalendarModel.getData()
 			oCalendarModelData.push(addItem)
 			oUpdatedCalendarModel.setData(oCalendarModelData);
 			this.getView().setModel(oUpdatedCalendarModel, "oCalendarModel");
 			oCalendarModel.refresh(true);

 			var oTable = this.getView().byId("tabCalendar");
 			var oTableData = oTable.getBinding("items").oList;
 			console.log(oTableData)

 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/ZFI_FMA_EVENT_CALSet";

 			for (var i = 0; i < oTableData.length; i++) {
 				var addRow = oTableData[i];
 				delete addRow.__metadata;
 				batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addRow));
 			}

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);
 			oDataModel.submitBatch(function (oData, oResponse) {
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					sap.ui.core.BusyIndicator.hide(0);
 					sap.m.MessageBox.success("Event added Successfully");
 					that.onLoadCalendarData()
 					if (that._oInputField) {
 						that._oInputField.setValue(""); // Clear the value
 						that._oInputField.data("Zcolor", null);
 						that.getView().byId("inpcalevent").setValue(""); // Clear custom data if stored
 					}
 					that.selectedItemDescription = "";
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("failed");
 			});

 			this.AddNewCalendarDialog.close();
 			AddNewCalendarDialog.getContent().forEach(function (control) {
 				if (control.setValue) {
 					control.setValue(""); // Clear all inputs in the dialog
 				}
 			});
 		},

 		formatDateLocal: function (dateObj) {
 			debugger;
 			if (!dateObj) return "";

 			const year = dateObj.getFullYear();
 			const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Months are zero-based
 			const day = String(dateObj.getDate()).padStart(2, '0');

 			return `${year}-${month}-${day}`;
 		},

 		closeAddNewCalendarDialog: function (oEvent) {
 			if (this.AddNewCalendarDialog) {
 				this.AddNewCalendarDialog.close();
 			}
 		},
 		onAddNewKPItem: function (oEvent) {
 			debugger;
 			if (!this.AddNewKPIDialog) {
 				this.AddNewKPIDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewKPItem", this);
 				this.getView().addDependent(this.AddNewKPIDialog);

 			}
 			sap.ui.getCore().byId("inpkpiID").setValue("");
 			sap.ui.getCore().byId("inpcatID").setValue("");
 			sap.ui.getCore().byId("inpkpititle").setValue("");
 			sap.ui.getCore().byId("inpkpivis").setSelected(false);

 			var oTable = this.getView().byId("tabvisiblity");
 			var oTableData = oTable.getBinding("items").oList;
 			debugger;
 			var newLevelId = "K01";
 			sap.ui.getCore().byId("inpkpiID").setValue(newLevelId);
 			if (oTableData.length) {
 				console.log(oTableData);

 				var gisId = oTableData[oTableData.length - 1].ZkpiId;

 				var gisidnum = parseInt(gisId.replace("K", ""), 10);

 				var newgisIdNum = gisidnum + 1;

 				var numericLength = gisId.length - 1;

 				var newgisId = "K" + newgisIdNum.toString().padStart(numericLength, "0");

 				console.log(newgisId);
 				sap.ui.getCore().byId("inpkpiID").setValue(newgisId);
 			}
 			this.AddNewKPIDialog.open();
 		},
 		onAddKPItem: function () {
 			debugger;
 			var that = this;

 			// Retrieve input field values
 			var inpgisid = sap.ui.getCore().byId("inpkpiID").getValue();
 			var inpgisTitle = sap.ui.getCore().byId("inpcatID").getValue();
 			var inpgisurl = sap.ui.getCore().byId("inpkpititle").getValue();
 			var inpgisvis = sap.ui.getCore().byId("inpkpivis").getSelected();

 			// Validate mandatory fields
 			if (inpgisid === '' || inpgisTitle === '' || inpgisurl === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			// Create the new item
 			var addItem = {
 				"ZkpiId": inpgisid,
 				"Zcategory": inpgisTitle,
 				"ZkpiTitle": inpgisurl,
 				"Zvisibility": inpgisvis
 			};

 			// Get or initialize the oKPIModel
 			var oKPIModel = this.getView().getModel("oKPIModel");
 			if (!oKPIModel) {
 				console.log("oKPIModel not found, initializing with empty data.");
 				oKPIModel = new JSONModel([]);
 				this.getView().setModel(oKPIModel, "oKPIModel");
 			}

 			// Get the existing data from the model
 			var oKPIModelData = oKPIModel.getData();
 			if (!Array.isArray(oKPIModelData)) {
 				console.log("Data in oKPIModel is not an array, reinitializing.");
 				oKPIModelData = [];
 			}

 			// Add the new item to the model data
 			oKPIModelData.push(addItem);
 			oKPIModel.setData(oKPIModelData);
 			oKPIModel.refresh(true);

 			// Table binding
 			var oTable = this.getView().byId("tabvisiblity");
 			var oTableData = oTable.getBinding("items").oList;
 			console.log(oTableData);

 			// Prepare OData batch operations
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/KpiVisibilitySet";

 			for (var i = 0; i < oTableData.length; i++) {
 				var addRow = oTableData[i];
 				delete addRow.__metadata; // Remove metadata
 				batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addRow));
 			}

 			// Submit batch changes
 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);
 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					sap.ui.core.BusyIndicator.hide();
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.m.MessageToast.show("KPI Visibility updated successfully!");
 						that.onLoadVisiblityData();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to update KPI Visibility.");
 				}
 			);

 			// Close the dialog
 			this.AddNewKPIDialog.close();
 		},
 		// onAddKPItem: function () {
 		// 	debugger;
 		// 	var that = this;
 		// 	var inpgisid = sap.ui.getCore().byId("inpkpiID").getValue();
 		// 	var inpgisTitle = sap.ui.getCore().byId("inpcatID").getValue();
 		// 	var inpgisurl = sap.ui.getCore().byId("inpkpititle").getValue();
 		// 	var inpgisvis = sap.ui.getCore().byId("inpkpivis").getSelected();

 		// 	if (inpgisid === '' || inpgisTitle === '' || inpgisurl === '') {
 		// 		sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 		// 		return;
 		// 	}

 		// 	var addItem = {
 		// 		"ZkpiId": inpgisid,
 		// 		"Zcategory": inpgisTitle,
 		// 		"ZkpiTitle": inpgisurl,
 		// 		"Zvisibility": inpgisvis
 		// 	}
 		// 	var oUpdatedKPIModel = new JSONModel();
 		// 	var oKPIModel = this.getView().getModel("oKPIModel");
 		// 	var oKPIModelData = oKPIModel.getData()
 		// 	oKPIModelData.push(addItem)
 		// 	oUpdatedKPIModel.setData(oKPIModelData);
 		// 	this.getView().setModel(oUpdatedKPIModel, "oKPIModel");
 		// 	oKPIModel.refresh(true);

 		// 	var oTable = this.getView().byId("tabvisiblity");
 		// 	var oTableData = oTable.getBinding("items").oList;
 		// 	console.log(oTableData)

 		// 	var batchChanges = [];
 		// 	var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 		// 	var oDataModel = new sap.ui.model.odata.ODataModel(url);
 		// 	oDataModel.setUseBatch(true);
 		// 	var uPath = "/KpiVisibilitySet";

 		// 	for (var i = 0; i < oTableData.length; i++) {
 		// 		var addRow = oTableData[i];
 		// 		delete addRow.__metadata;
 		// 		batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addRow));
 		// 	}

 		// 	oDataModel.addBatchChangeOperations(batchChanges);
 		// 	sap.ui.core.BusyIndicator.show(0);
 		// 	oDataModel.submitBatch(function (oData, oResponse) {
 		// 		if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 		// 			sap.ui.core.BusyIndicator.hide(0);
 		// 			// sap.m.MessageBox.success("Updated Successfully");
 		// 			that.onLoadVisiblityData()

 		// 		}
 		// 	}, function (oError) {
 		// 		sap.ui.core.BusyIndicator.hide(0);
 		// 		sap.m.MessageBox.success("failed");
 		// 	});

 		// 	this.AddNewKPIDialog.close();
 		// },

 		closeAddNewKPIDialog: function (oEvent) {
 			if (this.AddNewKPIDialog) {
 				this.AddNewKPIDialog.close();
 			}
 		},

 		// onAddNewKPItem: function (oEvent) {
 		// 	debugger;
 		// 	if (!this.AddNewKPIDialog) {
 		// 		this.AddNewKPIDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewKPItem", this);
 		// 		this.getView().addDependent(this.AddNewKPIDialog);

 		// 	}
 		// 	sap.ui.getCore().byId("inpkpiID").setValue("");
 		// 	sap.ui.getCore().byId("inpcatID").setValue("");
 		// 	sap.ui.getCore().byId("inpkpititle").setValue("");

 		// 	var oTable = this.getView().byId("tabvisiblity");
 		// 	var oTableData = oTable.getBinding("items").oList;
 		// 	debugger;
 		// 	var newLevelId = "K01";
 		// 	sap.ui.getCore().byId("inpkpiID").setValue(newLevelId);
 		// 	if (oTableData.length) {
 		// 		console.log(oTableData);

 		// 		var calId = oTableData[oTableData.length - 1].ZkpiId;

 		// 		var calidnum = parseInt(calId.replace("K", ""), 10);

 		// 		var newcalIdNum = calidnum + 1;

 		// 		var numericLength = calId.length - 1;

 		// 		var newcalId = "K" + newcalIdNum.toString().padStart(numericLength, "0");

 		// 		console.log(newcalId);
 		// 		sap.ui.getCore().byId("inpkpiID").setValue(newcalId);
 		// 	}
 		// 	this.AddNewKPIDialog.open();
 		// },
 		// 	onAddKPIvisItem: function () {
 		// 	debugger;
 		// 	var that = this;
 		// 	var inpcalID = sap.ui.getCore().byId("inpkpiID").getValue();
 		// 	var inpcalDate = sap.ui.getCore().byId("inpcatID").getValue();
 		// 	var inpcalEvent = sap.ui.getCore().byId("inpkpititle").getValue();

 		// 	if (inpcalID === '' || inpcalDate === '' || inpcalEvent === '') {
 		// 		sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 		// 		return;
 		// 	}

 		// 	var addItem = {
 		// 		"ZkpiId": inpcalID,
 		// 		"Zcategory": inpcalDate,
 		// 		"ZkpiTitle": inpcalEvent
 		// 	}
 		// 	var oUpdatedvisiModel = new JSONModel();
 		// 	var oVisiblityModel = this.getView().getModel("oVisiblityModel");
 		// 	var oVisiblityModelData = oVisiblityModel.getData()
 		// 	oVisiblityModelData.push(addItem)
 		// 	oUpdatedvisiModel.setData(oVisiblityModelData);
 		// 	this.getView().setModel(oUpdatedvisiModel, "oVisiblityModel");
 		// 	oVisiblityModel.refresh(true);

 		// 	var oTable = this.getView().byId("tabvisiblity");
 		// 	var oTableData = oTable.getBinding("items").oList;
 		// 	console.log(oTableData)

 		// 	var batchChanges = [];
 		// 	var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 		// 	var oDataModel = new sap.ui.model.odata.ODataModel(url);
 		// 	oDataModel.setUseBatch(true);
 		// 	var uPath = "/KpiVisibilitySet";

 		// 	for (var i = 0; i < oTableData.length; i++) {
 		// 		var addRow = oTableData[i];
 		// 		delete addRow.__metadata;
 		// 		batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addRow));
 		// 	}

 		// 	oDataModel.addBatchChangeOperations(batchChanges);
 		// 	sap.ui.core.BusyIndicator.show(0);
 		// 	oDataModel.submitBatch(function (oData, oResponse) {
 		// 		if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 		// 			sap.ui.core.BusyIndicator.hide(0);
 		// 			// sap.m.MessageBox.success("Updated Successfully");
 		// 			that.onLoadVisiblityData()
 		// 		}
 		// 	}, function (oError) {
 		// 		sap.ui.core.BusyIndicator.hide(0);
 		// 		sap.m.MessageBox.success("failed");
 		// 	});

 		// 	this.AddNewKPIDialog.close();
 		// },
 		// 		onAddKPIvisItem: function () {
 		//     var that = this;

 		//     // Retrieve input field values
 		//     var inpcalID = sap.ui.getCore().byId("inpkpiID").getValue();
 		//     var inpcalDate = sap.ui.getCore().byId("inpcatID").getValue();
 		//     var inpcalEvent = sap.ui.getCore().byId("inpkpititle").getValue();

 		//     // Validation for mandatory fields
 		//     if (inpcalID === '' || inpcalDate === '' || inpcalEvent === '') {
 		//         sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 		//         return;
 		//     }

 		//     // Prepare the new item data
 		//     var addItem = {
 		//         "ZkpiId": inpcalID,
 		//         "Zcategory": inpcalDate,
 		//         "ZkpiTitle": inpcalEvent
 		//     };

 		//     // Get the table model and update it
 		//     var oVisiblityModel = this.getView().getModel("oVisiblityModel");
 		//     var oVisiblityModelData = oVisiblityModel.getData();
 		//     oVisiblityModelData.push(addItem);

 		//     // Update the model with new data and refresh the binding
 		//     oVisiblityModel.setData(oVisiblityModelData);
 		//     oVisiblityModel.refresh(true);

 		//     // Get ODataModel instance
 		//     var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 		//     var oDataModel = new sap.ui.model.odata.v2.ODataModel(url);

 		//     // Enable batch processing
 		//     oDataModel.setDeferredGroups(["batchGroupId"]);

 		//     // Loop through the table data and create batch operations
 		//     var oTableData = oVisiblityModelData; // Use the updated model data
 		//     oTableData.forEach(function (row) {
 		//         // Remove __metadata if it exists
 		// delete row.ZroleList;

 		//         // Add create operation to the batch
 		//         oDataModel.create("/KpiVisibilitySet", row, {
 		//             groupId: "batchGroupId",
 		//             success: function (data) {
 		//                 console.log("Row added successfully:", data);
 		//             },
 		//             error: function (oError) {
 		//                 console.error("Failed to add row:", oError);
 		//             }
 		//         });
 		//     });

 		//     // Submit the batch operations
 		//     sap.ui.core.BusyIndicator.show(0);
 		//     oDataModel.submitChanges({
 		//         groupId: "batchGroupId",
 		//         success: function (oData, oResponse) {
 		//             sap.ui.core.BusyIndicator.hide();
 		//             sap.m.MessageToast.show("KPI Visibility successfully updated!");
 		//             that.onLoadVisiblityData();
 		//         },
 		//         error: function (oError) {
 		//             sap.ui.core.BusyIndicator.hide();
 		//             sap.m.MessageBox.error("Failed to update KPI Visibility.");
 		//             console.error("Batch operation failed:", oError);
 		//         }
 		//     });

 		//     // Close the dialog after processing
 		//     this.AddNewKPIDialog.close();
 		// },

 		// closeAddNewKPIfragDialog: function (oEvent) {
 		// 	if (this.AddNewKPIDialog) {
 		// 		this.AddNewKPIDialog.close();
 		// 	}
 		// },

 		closeAddNewKPIDialog: function (oEvent) {
 			if (this.AddNewKPIItemDialog) {
 				this.AddNewKPIItemDialog.close();
 			}
 		},
 		onDeleteSubCatItems: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabSubCat");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								// that.onDeleteSubItems();
 								that.onDeleteSubItems2();
 								// that.onCallDeleteSubItem();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onCallDeleteSubItem: function () {
 			debugger;
 			var oTable = this.getView().byId("tabSubCat");

 			var aContexts = oTable.getSelectedContexts();
 			var deletedjson = [];
 			for (var i = 0; i < aContexts.length; i++) {
 				deletedjson.push(aContexts[i].getObject())
 			};

 			console.log(deletedjson)

 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");
 			sap.ui.core.BusyIndicator.show(0);

 			finmobview.remove("/ZFI_FMA_SUBCATSet", {
 				success: function (data) {

 					console.log(data)
 					oSubCatDataModel.setData(data.results);
 					that.getView().setModel(oSubCatDataModel, "oSubCatDataModel")
 					sap.ui.core.BusyIndicator.hide(0);
 					// that.Display();
 				},
 				error: function (oError) {

 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg;
 					if (responseText.indexOf("{") > -1) {
 						if (responseText != "") {
 							//	msg += JSON.parse(oError.responseText).error.message.value;
 							for (var i = 0; i < JSON.parse(oError.responseText).error.innererror.errordetails.length - 1; i++) {
 								msg += JSON.parse(oError.responseText).error.innererror.errordetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}

 					MessageBox.error(msg);
 				}
 			});

 		},

 		onDeleteSubItems2: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabSubCat");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = []

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/ZFI_FMA_SUBCATSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;
 				delete addRow.Ztitle;

 				var deletePath = `/ZFI_FMA_SUBCATSet(ZlevelId='${addRow.ZlevelId}',ZsubId='${addRow.ZsubId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadSubCatData();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

 		onDeleteSubItems: function () {
 			debugger;
 			var oTable = this.getView().byId("tabSubCat");

 			// var aContexts = oTable.getSelectedItems();

 			var oSubCatDataModel = this.getView().getModel("oSubCatDataModel");
 			// var aData = oSubCatDataModel.getData();

 			// aContexts.forEach(function (oItem) {
 			// 	var oContext = oItem.getBindingContext("oSubCatDataModel");
 			// 	if (oContext) {
 			// 		var iIndex = oContext.getPath().split("/")[1];
 			// 		aData[iIndex].ZdelInd = 'X';

 			// 	}

 			// });

 			var aContexts = oTable.getSelectedContexts();

 			var oSubCatData = oSubCatDataModel.getData()

 			for (var i = aContexts.length - 1; i >= 0; i--) {

 				var json = {};
 				var deleteSurveyItemsDeleteJson = {};
 				json = aContexts[i].getObject();
 				deleteSurveyItemsDeleteJson = oSubCatDataModel.getData()[oSubCatDataModel.getData().indexOf(json)];

 				oSubCatData.splice(oSubCatData.indexOf(
 						json),
 					1);

 			};

 			oSubCatDataModel.setData(oSubCatData)
 			this.getView().setModel(oSubCatDataModel, "oSubCatDataModel")

 			// oSubCatDataModel.setProperty("/", aData);

 			oSubCatDataModel.refresh();

 			// var oTable = this.byId("tabSubCat");
 			// var oBinding = oTable.getBinding("items");

 			// var oFilter = new sap.ui.model.Filter("ZdelInd", sap.ui.model.FilterOperator.NE, 'X');
 			// oBinding.filter([oFilter])

 			oTable.removeSelections(true);
 		},

 		onDeleteCalendarItems: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabCalendar");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								// that.onDeleteSubItems();
 								that.onDeleteCalItems();
 								// that.onCallDeleteSubItem();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteCalItems: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabCalendar");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = []

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/ZFI_FMA_EVENT_CALSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/ZFI_FMA_EVENT_CALSet(ZcalId='${addRow.ZcalId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadCalendarData();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

 		// onDeleteGISReportItems: function () {

 		// 	var that = this;
 		// 	var oTable = this.getView().byId("tabGISReports");

 		// 	var aContexts = oTable.getSelectedContexts();
 		// 	if (aContexts.length) {
 		// 		sap.m.MessageBox.show(
 		// 			"Are you sure you want to delete the selected item?", {
 		// 				icon: sap.m.MessageBox.Icon.QUESTION,
 		// 				title: "Confirmation",
 		// 				actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 		// 				onClose: function (oAction) {
 		// 					if (oAction === "YES") {

 		// 						// that.onDeleteSubItems();
 		// 						that.onDeleteGISItems();
 		// 						// that.onCallDeleteSubItem();
 		// 						//  mainController.getView().getModel("oVisitModel").refresh(true);
 		// 					}
 		// 				}
 		// 			}
 		// 		);
 		// 	}
 		// },

 		// onDeleteGISItems: function () {
 		// 	debugger;
 		// 	var that = this;
 		// 	var oTable = this.getView().byId("tabGISReports");
 		// 	var aContexts = oTable.getSelectedContexts();

 		// 	var deletionItems = []

 		// 	for (var i = 0; i < aContexts.length; i++) {
 		// 		deletionItems.push(aContexts[i].getObject())
 		// 	};

 		// 	var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 		// 	var uPath = "/ZFI_FMA_GISSet";
 		// 	var oDataModel = new sap.ui.model.odata.ODataModel(url);
 		// 	oDataModel.setUseBatch(true);

 		// 	var batchChanges = [];

 		// 	for (var i = 0; i < deletionItems.length; i++) {
 		// 		var addRow = deletionItems[i];
 		// 		delete addRow.__metadata;

 		// 		var deletePath = `/ZFI_FMA_GISSet(ZgisId='${addRow.ZgisId}')`;

 		// 		batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 		// 	}

 		// 	oDataModel.addBatchChangeOperations(batchChanges);

 		// 	sap.ui.core.BusyIndicator.show(0);

 		// 	oDataModel.submitBatch(
 		// 		function (oData, oResponse) {
 		// 			if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 		// 				sap.ui.core.BusyIndicator.hide(0);
 		// 				sap.m.MessageBox.success("Selected items deleted successfully.");
 		// 				that.onLoadGISReportsData();
 		// 			}
 		// 		},
 		// 		function (oError) {
 		// 			sap.ui.core.BusyIndicator.hide();
 		// 			sap.m.MessageBox.error("Failed to delete selected items.");
 		// 		}
 		// 	);

 		// },

 		onDeleteGISReportItems: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabGISReports");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								// that.onDeleteSubItems();
 								that.onDeleteGISItems();
 								// that.onCallDeleteSubItem();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteGISItems: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabGISReports");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = []

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/GisFolderSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/GisFolderSet(ZgisFolderId='${addRow.ZgisFolderId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadGISReportsData();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

 		onDeleteGISReportItemFolder: function () {
 			debugger;
 			var that = this;

 			var oTable = sap.ui.core.Fragment.byId("GISReportDetail", "tabGISReportsDetail");
 			console.log(oTable);
 			var aContexts = oTable.getSelectedContexts();

 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {
 								that.onDeleteGISItemfolder(oTable);
 							}
 						}
 					}
 				);
 			} else {
 				sap.m.MessageBox.warning("No item selected for deletion.");
 			}
 		},

 		// onDeleteGISItemfolder: function (oTable) {
 		// 	debugger;
 		// 	var that = this;
 		// 	var aContexts = oTable.getSelectedContexts();

 		// 	if (!aContexts.length) {
 		// 		sap.m.MessageBox.warning("No item selected for deletion.");
 		// 		return;
 		// 	}

 		// 	var deletionItems = aContexts.map(function (oContext) {
 		// 		return oContext.getObject();
 		// 	});

 		// 	var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 		// 	var uPath = "/ZFI_FMA_GISSet";
 		// 	var oDataModel = new sap.ui.model.odata.ODataModel(url);
 		// 	oDataModel.setUseBatch(true);

 		// 	var batchChanges = [];

 		// 	for (var i = 0; i < deletionItems.length; i++) {
 		// 		var addRow = deletionItems[i];
 		// 		delete addRow.__metadata;

 		// 		var deletePath = `/ZFI_FMA_GISSet(ZgisId='${addRow.ZgisId}')`;

 		// 		batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 		// 	}

 		// 	oDataModel.addBatchChangeOperations(batchChanges);

 		// 	sap.ui.core.BusyIndicator.show(0);

 		// 	oDataModel.submitBatch(
 		// 		function (oData, oResponse) {
 		// 			if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 		// 				sap.ui.core.BusyIndicator.hide(0);
 		// 				sap.m.MessageBox.success("Selected items deleted successfully.", {
 		// 				});
 		// 			}
 		// 		},
 		// 		function (oError) {
 		// 			sap.ui.core.BusyIndicator.hide();
 		// 			sap.m.MessageBox.error("Failed to delete selected items.");
 		// 		}
 		// 	);

 		// },
 		onDeleteGISItemfolder: function (oTable) {
 			debugger;
 			var that = this;
 			var aContexts = oTable.getSelectedContexts();

 			if (!aContexts.length) {
 				sap.m.MessageBox.warning("No item selected for deletion.");
 				return;
 			}

 			var deletionItems = aContexts.map(function (oContext) {
 				return oContext.getObject();
 			});

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/ZFI_FMA_GISSet(ZgisId='${addRow.ZgisId}')`;
 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));
 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");

 						// // Refresh the fragment data after delete
 						// that.refreshGISDataAfterDeletion();
 						// Update model instead of refreshing entire data
 						// that.updateTableAfterDeletion(oTable, deletionItems);
 						that.updateFragmentModel(deletionItems);
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);
 		},
 		// refreshGISDataAfterDeletion: function () {
 		// 	var that = this;
 		// 	var finmobview = this.getView().getModel("finmobview");

 		// 	sap.ui.core.BusyIndicator.show(0);
 		// 	finmobview.read("/ZFI_FMA_GISSet", {
 		// 		success: function (oData) {
 		// 			var aFilteredData = oData.results.filter(function (item) {
 		// 				return item.ZgisFolderId === sSelectedFolderId && item.ZgisFolderTitle === sSelectedFolderTitle;
 		// 			});

 		// 			var oFilteredModel = new sap.ui.model.json.JSONModel(aFilteredData);
 		// 			that.getView().setModel(oFilteredModel, "oSelectedGISReportModel");

 		// 			sap.ui.core.BusyIndicator.hide(0);
 		// 		},
 		// 		error: function (oError) {
 		// 			sap.ui.core.BusyIndicator.hide(0);
 		// 			console.error("Error refreshing GIS data: ", oError);
 		// 		}
 		// 	});
 		// },
 		// 		updateTableAfterDeletion: function (oTable, deletedItems) {
 		//     var oModel = oTable.getModel();
 		//     var aTableData = oModel.getProperty("/");

 		//     // Filter out deleted items
 		//     var aUpdatedData = aTableData.filter(function (item) {
 		//         return !deletedItems.some(deletedItem => deletedItem.ZgisId === item.ZgisId);
 		//     });

 		//     // Update model with new data
 		//     oModel.setProperty("/", aUpdatedData);
 		// },
 		updateFragmentModel: function (deletedItems) {
 			var oFragmentTable = sap.ui.core.Fragment.byId("GISReportDetail", "tabGISReportsDetail");
 			var oFragmentModel = oFragmentTable.getModel("oSelectedGISReportModel");

 			if (!oFragmentModel) {
 				console.error("Model not found in fragment.");
 				return;
 			}

 			var aTableData = oFragmentModel.getProperty("/");

 			// Filter out deleted items
 			var aUpdatedData = aTableData.filter(function (item) {
 				return !deletedItems.some(deletedItem => deletedItem.ZgisId === item.ZgisId);
 			});

 			// Update model inside the fragment
 			oFragmentModel.setProperty("/", aUpdatedData);
 		},

 		_refreshFragment: function () {
 			var that = this;

 			// Destroy existing fragment if already created
 			if (that._oDetailDialog) {
 				that._oDetailDialog.destroy();
 				that._oDetailDialog = null;
 			}

 			// Recreate and open the fragment
 			that._oDetailDialog = sap.ui.xmlfragment("GISReportDetail", "mobilefinance.MobileFinance.fragments.GISReportItemDetails", that);
 			that.getView().addDependent(that._oDetailDialog);
 			var oTable = that._oDetailDialog.byId("tabGISReportsDetail"); // Assuming this is the ID of the table inside your fragment
 			var oSelectedItem = oTable.getSelectedItem(); // Assuming you're selecting rows in the table

 			// If there was a previously selected row, trigger the same behavior as row click to reload data
 			if (oSelectedItem) {
 				var oSelectedContext = oSelectedItem.getBindingContext();
 				if (oSelectedContext) {
 					var sZgisFolderId = oSelectedContext.getProperty("ZgisFolderId"); // Get the ZgisId for the selected item
 					that._loadFragmentData(sZgisFolderId); // Load data for this ZgisId again
 				}
 			}
 			that._oDetailDialog.open();
 		},
 		_loadFragmentData: function (sZgisFolderId) {
 			var that = this;

 			// Fetch updated data for the selected ZgisId (or re-bind all data if needed)
 			var oModel = this.getView().getModel();
 			var sPath = `/ZFI_FMA_GISSet(ZgisFolderId='${sZgisFolderId}')`;

 			oModel.read(sPath, {
 				success: function (oData) {
 					// Here, bind the table to the newly fetched data (or refresh the fragment controls as needed)
 					var oTable = that._oDetailDialog.byId("tabGISReportsDetail"); // Assuming this is the table ID
 					var oBinding = oTable.getBinding("items"); // Adjust if using "rows" or another aggregation
 					oBinding.refresh();
 				},
 				error: function (oError) {
 					sap.m.MessageBox.error("Failed to load data for the selected item.");
 				}
 			});
 		},

 		onIconSelect: function (oEvent) {
 			debugger;
 			var oSelectedImage = oEvent.getSource();
 			var sIconKey = oSelectedImage.getCustomData().find(data => data.getKey() === "iconKey").getValue();
 			console.log("Selected Icon Key:", sIconKey);

 			var oHBox = oSelectedImage.getParent();
 			var aImages = oHBox.getItems();

 			aImages.forEach(function (oImage) {
 				oImage.removeStyleClass("selected");
 			});

 			oSelectedImage.addStyleClass("selected");

 			var oTableRowContext = oHBox.getBindingContext("oCalendarModel"); // Get the binding context of the row
 			if (oTableRowContext) {
 				oTableRowContext.getModel().setProperty(oTableRowContext.getPath() + "/ZiconId", sIconKey);
 			}
 		},

 		onAddIconSelect: function (oEvent) {
 			debugger;
 			var oSelectedImage = oEvent.getSource();
 			var sIconKey = oSelectedImage.getCustomData().find(data => data.getKey() === "iconKey").getValue();
 			console.log("Selected Icon Key:", sIconKey);

 			var oHBox = oSelectedImage.getParent();
 			var aImages = oHBox.getItems();

 			aImages.forEach(function (oImage) {
 				oImage.removeStyleClass("selected");
 			});

 			oSelectedImage.addStyleClass("selected");

 			this.selectedIcon = sIconKey;

 			// var oTableRowContext = oHBox.getBindingContext("oCalendarModel"); // Get the binding context of the row
 			// if (oTableRowContext) {
 			// 	oTableRowContext.getModel().setProperty(oTableRowContext.getPath() + "/ZiconId", sIconKey);
 			// }
 		},

 		onAddKPITilePress: function () {
 			console.log("add tile clicked")

 			debugger;
 			if (!this.AddNewKPIItemDialog) {
 				this.AddNewKPIItemDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewKPIItem", this);
 				this.getView().addDependent(this.AddNewKPIItemDialog);

 			}
 			// sap.ui.getCore().byId("inpsubcatsubid").setValue("");
 			// sap.ui.getCore().byId("inpsubcatlevelid").setSelectedKey("");
 			// sap.ui.getCore().byId("inpsubcatTitle").setValue("");
 			// sap.ui.getCore().byId("inpsubcatroles").setValue("");

 			this.AddNewKPIItemDialog.open();

 		},

 		onUpdateLandingDetables: function () {
 			debugger;
 			var that = this;
 			if (this.selectedAdminTabKey === "updLandingPage") {
 				var oTable = this.getView().byId("tabLandingConfig");
 				var oTableItems = oTable.getItems();
 				var oModel = this.getView().getModel("finmobview"); // Assuming your model name is "finmobview"

 				// Check if the model is properly set
 				if (!oModel) {
 					console.error("Model 'finmobview' not found on the view.");
 					return;
 				}

 				sap.ui.core.BusyIndicator.show(0);

 				// Log the table items for debugging
 				console.log("Table items:", oTableItems);

 				// Iterate over each item in the table
 				oTableItems.forEach(function (oItem, index) {
 					var oContext = oItem.getBindingContext();

 					// Log the binding context for debugging
 					if (!oContext) {
 						console.warn("No binding context found for item at index " + index + ":", oItem);
 						return;
 					}

 					var addRow = Object.assign({}, oContext.getObject());
 					delete addRow.__metadata;

 					// Get selected roles from MultiInput control
 					var oMultiInput = oItem.getCells().find(function (oCell) {
 						return oCell.isA("sap.m.MultiInput");
 					});

 					if (oMultiInput) {
 						var aSelectedRoles = oMultiInput.getTokens().map(function (oToken) {
 							return oToken.getText();
 						});

 						// Format the roles into an array format
 						addRow.Zrole = "[" + aSelectedRoles.map(function (role) {
 							return "'" + role + "'";
 						}).join(",") + "]";
 					} else {
 						console.warn("MultiInput control not found in item at index " + index + ":", oItem);
 						addRow.Zrole = "[]";
 					}

 					// Define the OData path for updating the row
 					var sPath = "/ZFI_FMA_LNDPGSet('" + addRow.ZcalId + "')"; // Assuming ZcalId is the key

 					// Use OData update to send the changes to the backend
 					oModel.update(sPath, addRow, {
 						success: function () {
 							MessageToast.show("Data updated successfully!");
 							sap.ui.core.BusyIndicator.hide();
 							that.onLoadLandingPageData(); // Reload the landing page data
 						},
 						error: function () {
 							MessageBox.error("Failed to update data.");
 							sap.ui.core.BusyIndicator.hide();
 						}
 					});
 				});
 			}
 		},

 		onUpdateSubCatDets: function () {
 			var that = this;
 			if (this.selectedAdminTabKey == "updSubCatPage") {
 				var oTable = this.getView().byId("tabSubCat");
 				var oTableData = oTable.getBinding("items").oList;
 				console.log(oTableData)

 				var batchChanges = [];
 				var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 				var oDataModel = new sap.ui.model.odata.ODataModel(url);
 				oDataModel.setUseBatch(true);
 				var uPath = "/ZFI_FMA_SUBCATSet";

 				MessageBox.confirm("Are you sure you want to update?", {
 					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
 					onClose: function (oAction) {
 						if (oAction === MessageBox.Action.YES) {
 							for (var i = 0; i < oTableData.length; i++) {
 								var addRow = oTableData[i];
 								delete addRow.__metadata;
 								delete addRow.Ztitle;
 								console.log(addRow)
 								batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addRow));
 							}

 							oDataModel.addBatchChangeOperations(batchChanges);
 							sap.ui.core.BusyIndicator.show(0);
 							oDataModel.submitBatch(function (oData, oResponse) {
 								if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 									sap.ui.core.BusyIndicator.hide(0);
 									sap.m.MessageBox.success("Updated Successfully");
 									that.onLoadSubCatData()

 								}
 							}, function (oError) {
 								sap.ui.core.BusyIndicator.hide(0);
 								sap.m.MessageBox.success("failed");
 							});
 						}
 					}
 				});
 			}
 		},

 		onUpdateGISReportDets: function () {
 			var that = this;

 			var filterModel = this.getView().getModel("oFolderTitleModel");
 			var selectedFolderId = filterModel.getProperty("/folderId"); // Retrieve the folder ID
 			var selectedFolderTitle = filterModel.getProperty("/folderTitle");
 			//  that.selectedFolderId = selectedFolderId;
 			// that.selectedFolderTitle = selectedFolderTitle;
 			// Access the dialog fragment
 			var oTable = sap.ui.core.Fragment.byId("GISReportDetail", "tabGISReportsDetail");
 			console.log(oTable);
 			var aContexts = oTable.getSelectedContexts();

 			var oTableData = oTable.getBinding("items").getContexts().map(function (oContext) {
 				return oContext.getObject();
 			});

 			if (oTableData.length === 0) {
 				sap.m.MessageBox.warning("No data to update.");
 				return;
 			}

 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/ZFI_FMA_GISSet";

 			MessageBox.confirm("Are you sure you want to update?", {
 				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
 				onClose: function (oAction) {
 					if (oAction === MessageBox.Action.YES) {
 						for (var i = 0; i < oTableData.length; i++) {
 							var addRow = oTableData[i];
 							delete addRow.__metadata;
 							batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addRow));
 						}

 						if (batchChanges.length === 0) {
 							sap.m.MessageBox.warning("No changes to update.");
 							return;
 						}

 						oDataModel.addBatchChangeOperations(batchChanges);
 						sap.ui.core.BusyIndicator.show(0);
 						oDataModel.submitBatch(function (oData, oResponse) {
 							sap.ui.core.BusyIndicator.hide(0);
 							if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 								sap.m.MessageBox.success("Updated Successfully");
 								that.refreshGISDataAfterUpdate(selectedFolderId, selectedFolderTitle);
 							} else {
 								sap.m.MessageBox.error("Update failed. Please try again.");
 							}
 						}, function (oError) {
 							sap.ui.core.BusyIndicator.hide(0);
 							sap.m.MessageBox.error("Update failed: " + oError.message);
 						});
 					}
 				}
 			});
 		},

 		refreshGISDataAfterUpdate: function (sSelectedFolderId, sSelectedFolderTitle) {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			sap.ui.core.BusyIndicator.show(0);
 			finmobview.read("/ZFI_FMA_GISSet", {
 				success: function (oData) {
 					var aFilteredData = oData.results.filter(function (item) {
 						return item.ZgisFolderId === sSelectedFolderId && item.ZgisFolderTitle === sSelectedFolderTitle;
 					});

 					var oFilteredModel = new sap.ui.model.json.JSONModel(aFilteredData);
 					that.getView().setModel(oFilteredModel, "oSelectedGISReportModel");

 					sap.ui.core.BusyIndicator.hide(0);
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					console.error("Error refreshing GIS data: ", oError);
 				}
 			});
 		},

 		// onUpdateCalendarDets: function () {
 		// 	var oModel = this.getView().getModel("finmobview");
 		// 	var aData = this.getView().getModel("oCalendarModel").getData();

 		// 	sap.ui.core.BusyIndicator.show(0);

 		// 	aData.forEach(function (oItem) {

 		// 		var sPath = "/ZFI_FMA_EVENT_CALSet('" + oItem.ZcalId + "')";

 		// 		oModel.update(sPath, oItem, {
 		// 			success: function () {
 		// 				MessageToast.show("Data updated successfully!");
 		// 				sap.ui.core.BusyIndicator.hide();
 		// 			},
 		// 			error: function () {
 		// 				MessageBox.error("Failed to update data.");
 		// 				sap.ui.core.BusyIndicator.hide();
 		// 			}
 		// 		});
 		// 	});
 		// },
 		onUpdateCalendarDets: function () {
 			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oCalendarModel").getData();
 			sap.ui.core.BusyIndicator.show(0);

 			var aUpdatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 					var sPath = "/ZFI_FMA_EVENT_CALSet('" + oItem.ZcalId + "')";

 					oModel.update(sPath, oItem, {
 						success: function () {
 							resolve(); // Resolve on successful update
 						},
 						error: function () {
 							reject(); // Reject on failure
 						}
 					});
 				});
 			});

 			// Wait for all update calls to finish
 			Promise.allSettled(aUpdatePromises).then(function (results) {
 				sap.ui.core.BusyIndicator.hide();

 				var bHasError = results.some(result => result.status === "rejected");

 				if (bHasError) {
 					MessageBox.error("Some records failed to update.");
 				} else {
 					MessageBox.success("Data updated successfully!");
 				}
 			});
 		},
 		// onUpdateLandingDets: function () {
 		// 	var oModel = this.getView().getModel("finmobview");
 		// 	var aData = this.getView().getModel("oLandingPageDataModel").getData();

 		// 	sap.ui.core.BusyIndicator.show(0);

 		// 	aData.forEach(function (oItem) {
 		// 		if (oItem.hasOwnProperty("arr")) {
 		// 			delete oItem.arr;
 		// 		}
 		// 		if (oItem.Zroles && Array.isArray(oItem.Zroles)) {
 		// 			oItem.Zroles = "[" + oItem.Zroles.map(function (role) {
 		// 				return "'" + role + "'"; // Add single quotes around each role
 		// 			}).join(", ") + "]";
 		// 			console.log(oItem.Zroles);
 		// 		}

 		// 		var sPath = "/ZFI_FMA_LNDPGSet('" + oItem.ZlevelId + "')";

 		// 		oModel.update(sPath, oItem, {
 		// 			success: function () {
 		// 				MessageBox.success("Data updated successfully!");
 		// 				sap.ui.core.BusyIndicator.hide();
 		// 			},
 		// 			error: function () {
 		// 				MessageBox.error("Failed to update data.");
 		// 				sap.ui.core.BusyIndicator.hide();
 		// 			}
 		// 		});
 		// 	});
 		// },

 		onUpdateLandingDets: function () {
 			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oLandingPageDataModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			var aUpdatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 					// Clean up object before updating
 					// if (oItem.hasOwnProperty("arr")) {
 					//     delete oItem.arr;
 					// }

 					// if (oItem.Zroles && Array.isArray(oItem.Zroles)) {
 					//     oItem.Zroles = "[" + oItem.Zroles.map(role => "'" + role + "'").join(", ") + "]";
 					//     console.log("Formatted Zroles:", oItem.Zroles);
 					// }

 					var sPath = "/ZFI_FMA_LNDPGSet('" + oItem.ZlevelId + "')";

 					oModel.update(sPath, oItem, {
 						success: function () {
 							resolve(); // Update succeeded
 						},
 						error: function () {
 							reject(); // Update failed
 						}
 					});
 				});
 			});

 			// Wait for all updates to complete
 			Promise.allSettled(aUpdatePromises).then(function (results) {
 				sap.ui.core.BusyIndicator.hide();

 				var bHasError = results.some(result => result.status === "rejected");

 				if (bHasError) {
 					MessageBox.error("Some records failed to update.");
 				} else {
 					MessageBox.success("Data updated successfully!");
 				}
 			});
 		},

 		// onUpdateVisiblityDetsup: function () {
 		// 	var oModel = this.getView().getModel("finmobview");
 		// 	var aData = this.getView().getModel("oVisiblityModel").getData();

 		// 	sap.ui.core.BusyIndicator.show(0);

 		// 	aData.forEach(function (oItem) {
 		// 		if (oItem.hasOwnProperty("arr")) {
 		//          delete oItem.arr;
 		//      }

 		// 		if (oItem.Zrole && Array.isArray(oItem.Zrole)) {
 		// 			oItem.Zrole = "[" + oItem.Zrole.map(function (role) {
 		// 				return "'" + role + "'"; // Add single quotes around each role
 		// 			}).join(", ") + "]";
 		// 			console.log(oItem.Zrole);
 		// 		}
 		// 		if (oItem.hasOwnProperty("ZroleList")) {
 		// 			delete oItem.ZroleList;
 		// 		}
 		// 		var sPath = "/KpiVisibilitySet('" + oItem.ZkpiId + "')";

 		// 		oModel.update(sPath, oItem, {
 		// 			success: function () {
 		// 				// MessageBox.success("Data updated successfully!");
 		// 				sap.ui.core.BusyIndicator.hide();
 		// 			},
 		// 			error: function () {
 		// 				// MessageBox.error("Failed to update data.");
 		// 				sap.ui.core.BusyIndicator.hide();
 		// 			}
 		// 		});
 		// 	});
 		// },
 		onUpdateVisiblityDets: function () {
 			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oVisiblityModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			var updatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 					// // Remove unwanted properties
 					// if (oItem.hasOwnProperty("arr")) {
 					// 	delete oItem.arr;
 					// }
 					// if (oItem.hasOwnProperty("ZroleList")) {
 					// 	delete oItem.ZroleList;
 					// }

 					// // Format Zrole properly
 					// if (oItem.Zrole && Array.isArray(oItem.Zrole)) {
 					// 	oItem.Zrole = "[" + oItem.Zrole.map(role => "'" + role + "'").join(", ") + "]";
 					// }

 					var sPath = "/KpiVisibilitySet('" + oItem.ZkpiId + "')";

 					oModel.update(sPath, oItem, {
 						success: function () {
 							resolve(); // Resolve promise on success
 						},
 						error: function () {
 							reject(); // Reject promise on error
 						}
 					});
 				});
 			});

 			// Wait for all updates to complete
 			Promise.all(updatePromises)
 				.then(function () {
 					MessageBox.success("Data updated successfully!");
 				})
 				.catch(function () {
 					MessageBox.error("Failed to update some data.");
 				})
 				.finally(function () {
 					sap.ui.core.BusyIndicator.hide();
 				});
 		},

 		onLoadVisiblityData: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			var oVisiblityModel = new JSONModel();
 			sap.ui.core.BusyIndicator.show(0);
 			finmobview.read("/KpiVisibilitySet", {
 				success: function (data) {
 					// data.results.forEach(row => {
 					// 	try {
 					// 		// Parse Zroles if it's a string and in a valid JSON format
 					// 		if (typeof row.Zrole === "string" && row.Zrole.startsWith("['") && row.Zrole.endsWith("']")) {
 					// 			row.Zrole = JSON.parse(row.Zrole.replace(/'/g, '"')); // Replace single quotes with double quotes and parse
 					// 		}
 					// 	} catch (error) {
 					// 		console.error("Error parsing Zroles:", error);
 					// 		row.Zrole = []; // Default to an empty array in case of an error
 					// 	}
 					// });
 					console.log(data);
 					oVisiblityModel.setData(data.results);
 					that.getView().setModel(oVisiblityModel, "oVisiblityModel");
 					// var items = [];
 					// data.results.forEach(row => {
 					// 	row.arr = row.Zrole.map(role => ({
 					// 		Value1: role
 					// 	}));
 					// });
 					// oVisiblityModel.setProperty("/arr", items);

 					that.getView().setModel(oVisiblityModel, "oVisiblityModel");
 					sap.ui.core.BusyIndicator.hide(0);
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg = "";
 					if (responseText.indexOf("{") > -1) {
 						if (responseText !== "") {
 							var errorDetails = JSON.parse(oError.responseText).error.innererror.errordetails;
 							for (var i = 0; i < errorDetails.length - 1; i++) {
 								msg += errorDetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}
 					MessageBox.error(msg);
 				}
 			});
 		},
 		onLoadMarketWatchData: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			var oMarketWatchModel = new JSONModel();
 			sap.ui.core.BusyIndicator.show(0);
 			finmobview.read("/MarketWatchVisibilitySet", {
 				success: function (data) {
 					console.log(data);
 					oMarketWatchModel.setData(data.results);
 					that.getView().setModel(oMarketWatchModel, "oMarketWatchModel");

 					// that.getView().setModel(oMarketWatchModel, "oMarketWatchModel");
 					sap.ui.core.BusyIndicator.hide(0);
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg = "";
 					if (responseText.indexOf("{") > -1) {
 						if (responseText !== "") {
 							var errorDetails = JSON.parse(oError.responseText).error.innererror.errordetails;
 							for (var i = 0; i < errorDetails.length - 1; i++) {
 								msg += errorDetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}
 					MessageBox.error(msg);
 				}
 			});
 		},
 		onUpdateMarketWatchDataDets: function () {
 			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oMarketWatchModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			var updatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 					// // Remove unwanted properties
 					// if (oItem.hasOwnProperty("arr")) {
 					// 	delete oItem.arr;
 					// }
 					// if (oItem.hasOwnProperty("ZroleList")) {
 					// 	delete oItem.ZroleList;
 					// }

 					// // Format Zrole properly
 					// if (oItem.Zrole && Array.isArray(oItem.Zrole)) {
 					// 	oItem.Zrole = "[" + oItem.Zrole.map(role => "'" + role + "'").join(", ") + "]";
 					// }

 					var sPath = "/MarketWatchVisibilitySet('" + oItem.ZkpiId + "')";

 					oModel.update(sPath, oItem, {
 						success: function () {
 							resolve(); // Resolve promise on success
 						},
 						error: function () {
 							reject(); // Reject promise on error
 						}
 					});
 				});
 			});

 			// Wait for all updates to complete
 			Promise.all(updatePromises)
 				.then(function () {
 					MessageBox.success("Data updated successfully!");
 				})
 				.catch(function () {
 					MessageBox.error("Failed to update some data.");
 				})
 				.finally(function () {
 					sap.ui.core.BusyIndicator.hide();
 				});
 		},
 		onLoadMarketWatchTab: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			var oMarketWatchTabModel = new JSONModel();
 			sap.ui.core.BusyIndicator.show(0);
 			finmobview.read("/MarketWatchTabControlSet", {
 				success: function (data) {
 					console.log(data);
 					oMarketWatchTabModel.setData(data.results);
 					that.getView().setModel(oMarketWatchTabModel, "oMarketWatchTabModel");

 					// that.getView().setModel(oMarketWatchTabModel, "oMarketWatchTabModel");
 					sap.ui.core.BusyIndicator.hide(0);
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg = "";
 					if (responseText.indexOf("{") > -1) {
 						if (responseText !== "") {
 							var errorDetails = JSON.parse(oError.responseText).error.innererror.errordetails;
 							for (var i = 0; i < errorDetails.length - 1; i++) {
 								msg += errorDetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}
 					MessageBox.error(msg);
 				}
 			});
 		},
 		onUpdateMarketWatchTabDets: function () {
 			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oMarketWatchTabModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			var updatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 					// // Remove unwanted properties
 					// if (oItem.hasOwnProperty("arr")) {
 					// 	delete oItem.arr;
 					// }
 					// if (oItem.hasOwnProperty("ZroleList")) {
 					// 	delete oItem.ZroleList;
 					// }

 					// // Format Zrole properly
 					// if (oItem.Zrole && Array.isArray(oItem.Zrole)) {
 					// 	oItem.Zrole = "[" + oItem.Zrole.map(role => "'" + role + "'").join(", ") + "]";
 					// }

 					var sPath = "/MarketWatchTabControlSet('" + oItem.ZkpiId + "')";

 					oModel.update(sPath, oItem, {
 						success: function () {
 							resolve(); // Resolve promise on success
 						},
 						error: function () {
 							reject(); // Reject promise on error
 						}
 					});
 				});
 			});

 			// Wait for all updates to complete
 			Promise.all(updatePromises)
 				.then(function () {
 					MessageBox.success("Data updated successfully!");
 				})
 				.catch(function () {
 					MessageBox.error("Failed to update some data.");
 				})
 				.finally(function () {
 					sap.ui.core.BusyIndicator.hide();
 				});
 		},
 		onLoadReportData: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			var oReportModel = new JSONModel();
 			sap.ui.core.BusyIndicator.show(0);
 			finmobview.read("/ZFI_FMA_REPORTSSet", {
 				success: function (data) {
 					console.log(data);
 					oReportModel.setData(data.results);
 					that.getView().setModel(oReportModel, "oReportModel");

 					// that.getView().setModel(oMarketWatchModel, "oMarketWatchModel");
 					sap.ui.core.BusyIndicator.hide(0);
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg = "";
 					if (responseText.indexOf("{") > -1) {
 						if (responseText !== "") {
 							var errorDetails = JSON.parse(oError.responseText).error.innererror.errordetails;
 							for (var i = 0; i < errorDetails.length - 1; i++) {
 								msg += errorDetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}
 					MessageBox.error(msg);
 				}
 			});
 		},
 		onUpdateReportDataDets: function () {
 			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oReportModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			var updatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 					// // Remove unwanted properties
 					// if (oItem.hasOwnProperty("arr")) {
 					// 	delete oItem.arr;
 					// }
 					// if (oItem.hasOwnProperty("ZroleList")) {
 					// 	delete oItem.ZroleList;
 					// }

 					// // Format Zrole properly
 					// if (oItem.Zrole && Array.isArray(oItem.Zrole)) {
 					// 	oItem.Zrole = "[" + oItem.Zrole.map(role => "'" + role + "'").join(", ") + "]";
 					// }

 					var sPath = "/ZFI_FMA_REPORTSSet('" + oItem.ZreportId + "')";

 					oModel.update(sPath, oItem, {
 						success: function () {
 							resolve(); // Resolve promise on success
 						},
 						error: function () {
 							reject(); // Reject promise on error
 						}
 					});
 				});
 			});

 			// Wait for all updates to complete
 			Promise.all(updatePromises)
 				.then(function () {
 					MessageBox.success("Data updated successfully!");
 				})
 				.catch(function () {
 					MessageBox.error("Failed to update some data.");
 				})
 				.finally(function () {
 					sap.ui.core.BusyIndicator.hide();
 				});
 		},
 		onUpdateReportDatapdfDets: function () {
 			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oSelectedReportpdfModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			var updatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 					// // Remove unwanted properties
 					// if (oItem.hasOwnProperty("arr")) {
 					// 	delete oItem.arr;
 					// }
 					// if (oItem.hasOwnProperty("ZroleList")) {
 					// 	delete oItem.ZroleList;
 					// }

 					// // Format Zrole properly
 					// if (oItem.Zrole && Array.isArray(oItem.Zrole)) {
 					// 	oItem.Zrole = "[" + oItem.Zrole.map(role => "'" + role + "'").join(", ") + "]";
 					// }

 					var sPath = "/ReportFileAttachmentSet('" + oItem.ZreportId + "')";

 					oModel.update(sPath, oItem, {
 						success: function () {
 							resolve(); // Resolve promise on success
 						},
 						error: function () {
 							reject(); // Reject promise on error
 						}
 					});
 				});
 			});

 			// Wait for all updates to complete
 			Promise.all(updatePromises)
 				.then(function () {
 					MessageBox.success("Data updated successfully!");
 				})
 				.catch(function () {
 					MessageBox.error("Failed to update some data.");
 				})
 				.finally(function () {
 					sap.ui.core.BusyIndicator.hide();
 				});
 		},
 		onLoadReportsTab: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			var oReportTabModel = new JSONModel();
 			sap.ui.core.BusyIndicator.show(0);
 			finmobview.read("/ReportTabControlSet", {
 				success: function (data) {
 					console.log(data);
 					oReportTabModel.setData(data.results);
 					that.getView().setModel(oReportTabModel, "oReportTabModel");

 					// that.getView().setModel(oMarketWatchTabModel, "oMarketWatchTabModel");
 					sap.ui.core.BusyIndicator.hide(0);
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg = "";
 					if (responseText.indexOf("{") > -1) {
 						if (responseText !== "") {
 							var errorDetails = JSON.parse(oError.responseText).error.innererror.errordetails;
 							for (var i = 0; i < errorDetails.length - 1; i++) {
 								msg += errorDetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}
 					MessageBox.error(msg);
 				}
 			});
 		},
 		onLoadReportSubTab: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			var oReportSubTabModel = new JSONModel();
 			sap.ui.core.BusyIndicator.show(0);
 			finmobview.read("/ReportSubTabControlSet", {
 				success: function (data) {
 					console.log(data);
 					oReportSubTabModel.setData(data.results);
 					that.getView().setModel(oReportSubTabModel, "oReportSubTabModel");

 					// that.getView().setModel(oMarketWatchTabModel, "oMarketWatchTabModel");
 					sap.ui.core.BusyIndicator.hide(0);
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg = "";
 					if (responseText.indexOf("{") > -1) {
 						if (responseText !== "") {
 							var errorDetails = JSON.parse(oError.responseText).error.innererror.errordetails;
 							for (var i = 0; i < errorDetails.length - 1; i++) {
 								msg += errorDetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}
 					MessageBox.error(msg);
 				}
 			});
 		},
 		onUpdateReportTabDets: function () {
 			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oReportTabModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			var updatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 					// // Remove unwanted properties
 					// if (oItem.hasOwnProperty("arr")) {
 					// 	delete oItem.arr;
 					// }
 					// if (oItem.hasOwnProperty("ZroleList")) {
 					// 	delete oItem.ZroleList;
 					// }

 					// // Format Zrole properly
 					// if (oItem.Zrole && Array.isArray(oItem.Zrole)) {
 					// 	oItem.Zrole = "[" + oItem.Zrole.map(role => "'" + role + "'").join(", ") + "]";
 					// }

 					var sPath = "/ReportTabControlSet('" + oItem.ZtabId + "')";

 					oModel.update(sPath, oItem, {
 						success: function () {
 							resolve(); // Resolve promise on success
 						},
 						error: function () {
 							reject(); // Reject promise on error
 						}
 					});
 				});
 			});

 			// Wait for all updates to complete
 			Promise.all(updatePromises)
 				.then(function () {
 					MessageBox.success("Data updated successfully!");
 				})
 				.catch(function () {
 					MessageBox.error("Failed to update some data.");
 				})
 				.finally(function () {
 					sap.ui.core.BusyIndicator.hide();
 				});
 		},
 		onUpdateSegmentTabDets: function () {
 			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oReportSubTabModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			var updatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 					// // Remove unwanted properties
 					// if (oItem.hasOwnProperty("arr")) {
 					// 	delete oItem.arr;
 					// }
 					// if (oItem.hasOwnProperty("ZroleList")) {
 					// 	delete oItem.ZroleList;
 					// }

 					// // Format Zrole properly
 					// if (oItem.Zrole && Array.isArray(oItem.Zrole)) {
 					// 	oItem.Zrole = "[" + oItem.Zrole.map(role => "'" + role + "'").join(", ") + "]";
 					// }

 					var sPath = "/ReportSubTabControlSet('" + oItem.ZsubTabId + "')";

 					oModel.update(sPath, oItem, {
 						success: function () {
 							resolve(); // Resolve promise on success
 						},
 						error: function () {
 							reject(); // Reject promise on error
 						}
 					});
 				});
 			});

 			// Wait for all updates to complete
 			Promise.all(updatePromises)
 				.then(function () {
 					MessageBox.success("Data updated successfully!");
 				})
 				.catch(function () {
 					MessageBox.error("Failed to update some data.");
 				})
 				.finally(function () {
 					sap.ui.core.BusyIndicator.hide();
 				});
 		},
 		onLoadFinCalTab: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			var oFincalTabModel = new JSONModel();
 			sap.ui.core.BusyIndicator.show(0);
 			finmobview.read("/DashboardTabControlSet", {
 				success: function (data) {
 					console.log(data);
 					oFincalTabModel.setData(data.results);
 					that.getView().setModel(oFincalTabModel, "oFincalTabModel");

 					// that.getView().setModel(oFincalTabModel, "oFincalTabModel");
 					sap.ui.core.BusyIndicator.hide(0);
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg = "";
 					if (responseText.indexOf("{") > -1) {
 						if (responseText !== "") {
 							var errorDetails = JSON.parse(oError.responseText).error.innererror.errordetails;
 							for (var i = 0; i < errorDetails.length - 1; i++) {
 								msg += errorDetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}
 					MessageBox.error(msg);
 				}
 			});
 		},
 		onUpdateFinCalTabDets: function () {
 			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oFincalTabModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			var updatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 					// // Remove unwanted properties
 					// if (oItem.hasOwnProperty("arr")) {
 					// 	delete oItem.arr;
 					// }
 					// if (oItem.hasOwnProperty("ZroleList")) {
 					// 	delete oItem.ZroleList;
 					// }

 					// // Format Zrole properly
 					// if (oItem.Zrole && Array.isArray(oItem.Zrole)) {
 					// 	oItem.Zrole = "[" + oItem.Zrole.map(role => "'" + role + "'").join(", ") + "]";
 					// }

 					var sPath = "/DashboardTabControlSet('" + oItem.ZkpiId + "')";

 					oModel.update(sPath, oItem, {
 						success: function () {
 							resolve(); // Resolve promise on success
 						},
 						error: function () {
 							reject(); // Reject promise on error
 						}
 					});
 				});
 			});

 			// Wait for all updates to complete
 			Promise.all(updatePromises)
 				.then(function () {
 					MessageBox.success("Data updated successfully!");
 				})
 				.catch(function () {
 					MessageBox.error("Failed to update some data.");
 				})
 				.finally(function () {
 					sap.ui.core.BusyIndicator.hide();
 				});
 		},
 		onLoadSharePriceTab: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			var oSharePriceTabModel = new JSONModel();
 			sap.ui.core.BusyIndicator.show(0);
 			finmobview.read("/CompanyDetailsSet", {
 				success: function (data) {
 					console.log(data);
 					var aData = data.results;
 					aData.forEach(function (oItem) {
 						if (oItem.ZcurrencyUnit === "") {
 							oItem.ZcurrencyUnit = "Blank";
 						}
 					});
 					oSharePriceTabModel.setData(aData);
 					that.getView().setModel(oSharePriceTabModel, "oSharePriceTabModel");

 					// that.getView().setModel(oFincalTabModel, "oFincalTabModel");
 					sap.ui.core.BusyIndicator.hide(0);
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg = "";
 					if (responseText.indexOf("{") > -1) {
 						if (responseText !== "") {
 							var errorDetails = JSON.parse(oError.responseText).error.innererror.errordetails;
 							for (var i = 0; i < errorDetails.length - 1; i++) {
 								msg += errorDetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}
 					MessageBox.error(msg);
 				}
 			});
 		},
 		onAddNewSharePriceTab: function (oEvent) {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			if (!this.AddNewSPTDialog) {
 				this.AddNewSPTDialog = sap.ui.xmlfragment("AddSharePriceDialog", "mobilefinance.MobileFinance.fragments.AddNewSharePriceTab",
 					this);
 				this.getView().addDependent(this.AddNewSPTDialog);

 			}
 			// sap.ui.getCore().byId("inpsptid").setValue("");
 			// // sap.ui.getCore().byId("inpsptcat").setValue("");
 			// sap.ui.getCore().byId("inpsptrole").setValue("");
 			// sap.ui.getCore().byId("inpsptvis").setSelected(false);
 			sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpordnumber").setValue("");
 			sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpsptid").setValue("");
 			sap.ui.core.Fragment.byId("AddSharePriceDialog", "incompanydisname").setValue("");
 			sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpsptrole").setValue("");
 			sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpcurrency").setValue("");
 			sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpsptvis").setSelected(false);
 			// finmobview.read("/CompanyDetailsSet", {
 			// 	success: function (oData) {
 			// 		var oResults = oData.results;

 			// 		if (oResults.length > 0) {
 			// 			// Get the latest GIS Folder ID
 			// 			var latestGisId = oResults[oResults.length - 1].Zorderid;

 			// 			if (latestGisId && latestGisId.startsWith("S")) {
 			// 				var gisIdNum = parseInt(latestGisId.replace("S", ""), 10);
 			// 				var newGisIdNum = gisIdNum + 1;

 			// 				// Generate new GIS Folder ID with leading zeros
 			// 				var numericLength = latestGisId.length - 1;
 			// 				var newGisId = "S" + newGisIdNum.toString().padStart(numericLength, "0");

 			// 				// sap.ui.getCore().byId("inpordid").setValue(newGisId);
 			// 				sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpordid").setValue(newGisId);
 			// 			}
 			// 		} else {
 			// 			// No data in OData, start with default ID
 			// 			// sap.ui.getCore().byId("inpordid").setValue("S001");
 			// 			sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpordid").setValue("S001");
 			// 		}
 			// 	},
 			// 	error: function (oError) {
 			// 		console.error("Error fetching GIS Folder data:", oError);
 			// 		// sap.ui.getCore().byId("inpordid").setValue("S001"); // Fallback default ID
 			// 		sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpordid").setValue("S001");
 			// 	}
 			// });

 			this.AddNewSPTDialog.open();
 		},

 		closeAddNewSPTDialog: function (oEvent) {
 			if (this.AddNewSPTDialog) {
 				this.AddNewSPTDialog.close();
 			}
 		},
 		// onAddSharePriceItem: function () {
 		// 	debugger;
 		// 	var that = this;
 		// 	// var inpsptid = sap.ui.getCore().byId("inpsptid").getValue();
 		// 	var selectedItemDescription = this.selectedItemDescription;
 		// 	// var selectedItemValue = this.selectedItemValue;
 		// 	var inpordid = sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpordnumber").getValue();
 		// 	var inpsptcat = sap.ui.core.Fragment.byId("AddSharePriceDialog", "incompanydisname").getValue();
 		// 	var inpcurrency = sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpcurrency").getSelectedKey();
 		// 	var inpsptrole = sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpsptrole").getValue();
 		// 	var inpsptvis = sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpsptvis").getSelected();
 		// 	if (inpcurrency === "Blank") {
 		// 		inpcurrency = "";
 		// 	}

 		// 	    if (!selectedItemDescription || !inpordid || !inpsptcat || !inpsptrole) {
 		//     sap.m.MessageToast.show("Fill all the mandatory fields!");
 		//     return;
 		// }

 		// 	    // === Duplicate Order ID Check ===
 		// var existingItems = this.getView().getModel("oSharePriceTabModel").getProperty("/results"); // Adjust path if different
 		// var isDuplicate = existingItems.some(function(item) {
 		//     return item.Zorderid === inpordid;
 		// });

 		// if (isDuplicate) {
 		//     sap.m.MessageBox.warning("Order number already exists. Please use a different one.");
 		//     return;
 		// }

 		// 	var addItem = {
 		// 		"Zvisibility": inpsptvis,
 		// 		"ZcompanyId": selectedItemDescription,
 		// 		"ZcurrencyUnit": inpcurrency,
 		// 		"ZcompanyName": inpsptcat,
 		// 		"Zorderid": inpordid,
 		// 		"Zroles": inpsptrole
 		// 	};
 		// 	var batchChanges = [];
 		// 	var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 		// 	var oDataModel = new sap.ui.model.odata.ODataModel(url);
 		// 	oDataModel.setUseBatch(true);
 		// 	var uPath = "/CompanyDetailsSet";
 		// 	batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 		// 	oDataModel.addBatchChangeOperations(batchChanges);
 		// 	sap.ui.core.BusyIndicator.show(0);

 		// 	oDataModel.submitBatch(function (oData, oResponse) {
 		// 		sap.ui.core.BusyIndicator.hide(0);
 		// 		if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 		// 			that.onLoadSharePriceTab();
 		// 			sap.m.MessageBox.success("Item added successfully!");
 		// 		}
 		// 	}, function (oError) {
 		// 		sap.ui.core.BusyIndicator.hide(0);
 		// 		sap.m.MessageBox.error("Failed to update data");
 		// 	});

 		// 	this.AddNewSPTDialog.close();
 		// },
 		onAddSharePriceItem: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");
 			var selectedItemDescription = this.selectedItemDescription;
 			var inpordid = sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpordnumber").getValue();
 			var inpsptcat = sap.ui.core.Fragment.byId("AddSharePriceDialog", "incompanydisname").getValue();
 			var inpcurrency = sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpcurrency").getSelectedKey();
 			var inpsptrole = sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpsptrole").getValue();
 			var inpsptvis = sap.ui.core.Fragment.byId("AddSharePriceDialog", "inpsptvis").getSelected();

 			if (inpcurrency === "Blank") {
 				inpcurrency = "";
 			}

 			if (!selectedItemDescription || !inpordid || !inpsptcat || !inpsptrole) {
 				sap.m.MessageToast.show("Fill all the mandatory fields!");
 				return;
 			}

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url, true); // true for asynchronous

 			sap.ui.core.BusyIndicator.show(0);

 			// Step 1: GET call to check for existing entries
 			finmobview.read("/CompanyDetailsSet", {
 				success: function (oData) {
 					sap.ui.core.BusyIndicator.hide();

 					var existingItems = oData.results;
 					var isDuplicate = existingItems.some(function (item) {
 						return item.Zorderid === inpordid;
 					});

 					if (isDuplicate) {
 						sap.m.MessageBox.warning("Order number already exists. Please use a different one.");
 						return;
 					}

 					// Step 2: Proceed with POST since order ID is unique
 					var addItem = {
 						"Zvisibility": inpsptvis,
 						"ZcompanyId": selectedItemDescription,
 						"ZcurrencyUnit": inpcurrency,
 						"ZcompanyName": inpsptcat,
 						"Zorderid": inpordid,
 						"Zroles": inpsptrole
 					};

 					var batchChanges = [];
 					oDataModel.setUseBatch(true);
 					var uPath = "/CompanyDetailsSet";
 					batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));
 					oDataModel.addBatchChangeOperations(batchChanges);

 					sap.ui.core.BusyIndicator.show(0);

 					oDataModel.submitBatch(function (oData, oResponse) {
 						sap.ui.core.BusyIndicator.hide(0);
 						if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 							that.onLoadSharePriceTab();
 							sap.m.MessageBox.success("Item added successfully!");
 						}
 					}, function (oError) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.error("Failed to update data");
 					});

 					that.AddNewSPTDialog.close();
 				},
 				error: function () {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to read existing order data.");
 				}
 			});
 		},

 		onDeleteSharePriceTabCon: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabsharepriceTab");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteSharePriceTab();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteSharePriceTab: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabsharepriceTab");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/CompanyDetailsSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/CompanyDetailsSet(ZcompanyId='${addRow.ZcompanyId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadSharePriceTab();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},
 		// onUpdateSharePriceTabDets: function () {
 		// 	var oModel = this.getView().getModel("finmobview");
 		// 	var aData = this.getView().getModel("oSharePriceTabModel").getData();

 		// 	sap.ui.core.BusyIndicator.show(0);

 		// 	var updatePromises = aData.map(function (oItem) {
 		// 		return new Promise(function (resolve, reject) {
 		// 			// // Remove unwanted properties
 		// 			// if (oItem.hasOwnProperty("arr")) {
 		// 			// 	delete oItem.arr;
 		// 			// }
 		// 			// if (oItem.hasOwnProperty("ZroleList")) {
 		// 			// 	delete oItem.ZroleList;
 		// 			// }

 		// 			// // Format Zrole properly
 		// 			// if (oItem.Zrole && Array.isArray(oItem.Zrole)) {
 		// 			// 	oItem.Zrole = "[" + oItem.Zrole.map(role => "'" + role + "'").join(", ") + "]";
 		// 			// }
 		// 			if (oItem.ZcurrencyUnit === "Blank") {
 		// 				oItem.ZcurrencyUnit = "";
 		// 			}

 		// 			var sPath = "/CompanyDetailsSet('" + oItem.ZcompanyId + "')";

 		// 			oModel.update(sPath, oItem, {
 		// 				success: function () {
 		// 					resolve(); // Resolve promise on success
 		// 				},
 		// 				error: function () {
 		// 					reject(); // Reject promise on error
 		// 				}
 		// 			});
 		// 		});
 		// 	});

 		// 	// Wait for all updates to complete
 		// 	Promise.all(updatePromises)
 		// 		.then(function () {
 		// 			MessageBox.success("Data updated successfully!");
 		// 		})
 		// 		.catch(function () {
 		// 			MessageBox.error("Failed to update some data.");
 		// 		})
 		// 		.finally(function () {
 		// 			sap.ui.core.BusyIndicator.hide();
 		// 		});
 		// }
 		onUpdateSharePriceTabDets: function () {
 			var that = this;
 			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oSharePriceTabModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			// Step 1: Get all existing entries from backend
 			oModel.read("/CompanyDetailsSet", {
 				success: function (oResponse) {
 					var existingItems = oResponse.results;

 					// Step 2: Check for duplicate Zorderid (excluding self)
 					var isDuplicateFound = false;
 					var duplicateOrderId = "";

 					for (var i = 0; i < aData.length; i++) {
 						var current = aData[i];
 						var duplicate = existingItems.find(function (item) {
 							return (
 								item.Zorderid === current.Zorderid &&
 								item.ZcompanyId !== current.ZcompanyId // exclude self
 							);
 						});
 						if (duplicate) {
 							isDuplicateFound = true;
 							duplicateOrderId = current.Zorderid;
 							break;
 						}
 					}

 					if (isDuplicateFound) {
 						sap.ui.core.BusyIndicator.hide();
 						sap.m.MessageBox.warning("Order number '" + duplicateOrderId + "' already exists. Please use a different one.");
 						return;
 					}

 					// Step 3: If no duplicates, proceed with update
 					var updatePromises = aData.map(function (oItem) {
 						return new Promise(function (resolve, reject) {
 							if (oItem.ZcurrencyUnit === "Blank") {
 								oItem.ZcurrencyUnit = "";
 							}

 							var sPath = "/CompanyDetailsSet('" + oItem.ZcompanyId + "')";

 							oModel.update(sPath, oItem, {
 								success: function () {
 									resolve();
 								},
 								error: function () {
 									reject();
 								}
 							});
 						});
 					});

 					Promise.all(updatePromises)
 						.then(function () {
 							sap.m.MessageBox.success("Data updated successfully!");
 						})
 						.catch(function () {
 							sap.m.MessageBox.error("Failed to update some data.");
 						})
 						.finally(function () {
 							sap.ui.core.BusyIndicator.hide();
 						});
 				},
 				error: function () {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to read existing company details.");
 				}
 			});
 		},
 		onLoadCalendarCategory: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			var oCalCatModel = new JSONModel();
 			sap.ui.core.BusyIndicator.show(0);
 			finmobview.read("/CalenderCategorySet", {
 				success: function (data) {
 					console.log(data);
 					oCalCatModel.setData(data.results);
 					that.getView().setModel(oCalCatModel, "oCalCatModel");

 					// that.getView().setModel(oFincalTabModel, "oFincalTabModel");
 					sap.ui.core.BusyIndicator.hide(0);
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg = "";
 					if (responseText.indexOf("{") > -1) {
 						if (responseText !== "") {
 							var errorDetails = JSON.parse(oError.responseText).error.innererror.errordetails;
 							for (var i = 0; i < errorDetails.length - 1; i++) {
 								msg += errorDetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}
 					MessageBox.error(msg);
 				}
 			});
 		},
 		onAddCalCat: function () {
 			debugger;
 			var that = this;
 			var inpcalcatid = sap.ui.getCore().byId("inpcalcatid").getValue();
 			var inpcalcat = sap.ui.getCore().byId("inpcalcat").getValue();

 			if (inpcalcatid === '' || inpcalcat === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"Category": inpcalcat,
 				"CatId": inpcalcatid
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/CalenderCategorySet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					that.onLoadCalendarCategory();
 					sap.m.MessageBox.success("Calendar Event Category added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});
 			// this.onLoadCalendarCategory();
 			this.AddNewCategoryDialog.close();
 		},
 		onAddCalCategory: function (oEvent) {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			if (!this.AddNewCategoryDialog) {
 				this.AddNewCategoryDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddCalendarCategory", this);
 				this.getView().addDependent(this.AddNewCategoryDialog);

 			}
 			sap.ui.getCore().byId("inpcalcatid").setValue("");
 			sap.ui.getCore().byId("inpcalcat").setValue("");

 			// OData Service Call to fetch the latest GIS Folder IDs
 			finmobview.read("/CalenderCategorySet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Get the latest GIS Folder ID
 						var latestGisId = oResults[oResults.length - 1].CatId;

 						if (latestGisId && latestGisId.startsWith("C")) {
 							var gisIdNum = parseInt(latestGisId.replace("C", ""), 10);
 							var newGisIdNum = gisIdNum + 1;

 							// Generate new GIS Folder ID with leading zeros
 							var numericLength = latestGisId.length - 1;
 							var newGisId = "C" + newGisIdNum.toString().padStart(numericLength, "0");

 							sap.ui.getCore().byId("inpcalcatid").setValue(newGisId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inpcalcatid").setValue("C01");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching Category data:", oError);
 					sap.ui.getCore().byId("inpcalcatid").setValue("C01"); // Fallback default ID
 				}
 			});
 			this.AddNewCategoryDialog.open();
 		},
 		CloseCalCatDialog: function (oEvent) {
 			if (this.AddNewCategoryDialog) {
 				this.AddNewCategoryDialog.close();
 			}
 		},
 		onAddCompName: function (oEvent) {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			if (!this.AddNewCompanyDialog) {
 				this.AddNewCompanyDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddCompanyName", this);
 				this.getView().addDependent(this.AddNewCompanyDialog);

 			}
 			sap.ui.getCore().byId("inpcompid").setValue("");
 			sap.ui.getCore().byId("inpcompname").setValue("");

 			this.AddNewCompanyDialog.open();
 		},
 		CloseCompanyDialog: function (oEvent) {
 			if (this.AddNewCompanyDialog) {
 				this.AddNewCompanyDialog.close();
 			}
 		},
 		onAddCompanyName: function () {
 			debugger;
 			var that = this;
 			var inpcompid = sap.ui.getCore().byId("inpcompid").getValue();
 			var inpcompname = sap.ui.getCore().byId("inpcompname").getValue();
 			// var inpnmwtrole = sap.ui.getCore().byId("inpnmwtrole").getValue();
 			// var inpnmwtvis = sap.ui.getCore().byId("inpnmwtvis").getSelected();

 			if (inpcompid === '' || inpcompname === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"Name": inpcompid,
 				"DsplyName": inpcompname
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/CompanyNameSet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					// that.onLoadCalendarCategory();
 					sap.m.MessageBox.success("Company added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});
 			// this.onLoadCalendarCategory();
 			this.AddNewCompanyDialog.close();
 		},
 		onLoadAffiliateTab: function () {
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			var oAffiliateTabModel = new JSONModel();
 			sap.ui.core.BusyIndicator.show(0);
 			finmobview.read("/AffiliateTabControlSet", {
 				success: function (data) {
 					console.log(data);
 					oAffiliateTabModel.setData(data.results);
 					that.getView().setModel(oAffiliateTabModel, "oAffiliateTabModel");

 					// that.getView().setModel(oMarketWatchTabModel, "oMarketWatchTabModel");
 					sap.ui.core.BusyIndicator.hide(0);
 				},
 				error: function (oError) {
 					sap.ui.core.BusyIndicator.hide(0);
 					var responseText = oError.responseText;
 					var msg = "";
 					if (responseText.indexOf("{") > -1) {
 						if (responseText !== "") {
 							var errorDetails = JSON.parse(oError.responseText).error.innererror.errordetails;
 							for (var i = 0; i < errorDetails.length - 1; i++) {
 								msg += errorDetails[i].message + "\n";
 							}
 						}
 					} else {
 						msg = responseText;
 					}
 					MessageBox.error(msg);
 				}
 			});
 		},
 		onAddNewAffiliateTab: function (oEvent) {
 			debugger;
 			var that = this;
 			var finmobview = this.getView().getModel("finmobview");

 			if (!this.AddNewAffiliateTabDialog) {
 				this.AddNewAffiliateTabDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewAffiliateTab", this);
 				this.getView().addDependent(this.AddNewAffiliateTabDialog);

 			}
 			sap.ui.getCore().byId("inpnaffid").setValue("");
 			sap.ui.getCore().byId("inpnaffcat").setValue("");
 			sap.ui.getCore().byId("inpnaffrole").setValue("");
 			sap.ui.getCore().byId("inpnaffvis").setSelected(false);

 			// OData Service Call to fetch the latest GIS Folder IDs
 			finmobview.read("/AffiliateTabControlSet", {
 				success: function (oData) {
 					var oResults = oData.results;

 					if (oResults.length > 0) {
 						// Get the latest GIS Folder ID
 						var latestGisId = oResults[oResults.length - 1].ZkpiId;

 						if (latestGisId && latestGisId.startsWith("T")) {
 							var gisIdNum = parseInt(latestGisId.replace("T", ""), 10);
 							var newGisIdNum = gisIdNum + 1;

 							// Generate new GIS Folder ID with leading zeros
 							var numericLength = latestGisId.length - 1;
 							var newGisId = "T" + newGisIdNum.toString().padStart(numericLength, "0");

 							sap.ui.getCore().byId("inpnaffid").setValue(newGisId);
 						}
 					} else {
 						// No data in OData, start with default ID
 						sap.ui.getCore().byId("inpnaffid").setValue("T01");
 					}
 				},
 				error: function (oError) {
 					console.error("Error fetching GIS Folder data:", oError);
 					sap.ui.getCore().byId("inpnaffid").setValue("T01"); // Fallback default ID
 				}
 			});
 			this.AddNewAffiliateTabDialog.open();
 		},
 		onAddAffiliateTab: function () {
 			debugger;
 			var that = this;
 			var inpnaffid = sap.ui.getCore().byId("inpnaffid").getValue();
 			var inpnaffcat = sap.ui.getCore().byId("inpnaffcat").getValue();
 			var inpnaffrole = sap.ui.getCore().byId("inpnaffrole").getValue();
 			var inpnaffvis = sap.ui.getCore().byId("inpnaffvis").getSelected();

 			if (inpnaffid === '' || inpnaffcat === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addItem = {
 				"Zvisibility": inpnaffvis,
 				"ZkpiId": inpnaffid,
 				"Zcategory": inpnaffcat,
 				"Zrole": inpnaffrole
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/AffiliateTabControlSet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					that.onLoadAffiliateTab();
 					sap.m.MessageBox.success("Affiliate KPI added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});

 			this.AddNewAffiliateTabDialog.close();
 		},
 		CloseAffiliateTabDialog: function (oEvent) {
 			if (this.AddNewAffiliateTabDialog) {
 				this.AddNewAffiliateTabDialog.close();
 			}
 		},
 		onUpdateAffiliateTab: function () {
 			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oAffiliateTabModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			var updatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 				
 					var sPath = "/AffiliateTabControlSet('" + oItem.ZkpiId + "')";

 					oModel.update(sPath, oItem, {
 						success: function () {
 							resolve(); // Resolve promise on success
 						},
 						error: function () {
 							reject(); // Reject promise on error
 						}
 					});
 				});
 			});

 			// Wait for all updates to complete
 			Promise.all(updatePromises)
 				.then(function () {
 					MessageBox.success("Data updated successfully!");
 				})
 				.catch(function () {
 					MessageBox.error("Failed to update some data.");
 				})
 				.finally(function () {
 					sap.ui.core.BusyIndicator.hide();
 				});
 		},
 		onDeleteAffiliateTabCon: function () {

 			var that = this;
 			var oTable = this.getView().byId("tabaffiliateTab");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteAffiliateTab();
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteAffiliateTab: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("tabaffiliateTab");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/AffiliateTabControlSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;

 				var deletePath = `/AffiliateTabControlSet(ZkpiId='${addRow.ZkpiId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.onLoadAffiliateTab();
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

		//Common Utility Function

		getSearchHelpData: function (filterBy) {
			return new Promise((resolve, reject) => {
				var finmobview = this.getView().getModel("finmobview");

				var aFilters = [new sap.ui.model.Filter("Filter", sap.ui.model.FilterOperator.EQ, filterBy)];

				finmobview.read("/WidgetSearchHelpSet", {
					filters: aFilters,
					success: function (data) {
						console.log(data);

						var response = data.results || [];
						resolve(response);
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
			});
		},

		getQueryParameter: function(datasource){
			return new Promise((resolve, reject) => {
				debugger;

				var finmobview = this.getView().getModel("finmobview");

				// var dataSourceValue = datasource || 'YES_ARAMCO_PLANS_TEST';
				
				var dataSourceValue = datasource || '';
				var aFilters = [new sap.ui.model.Filter("DataSource", sap.ui.model.FilterOperator.EQ, dataSourceValue)];
				

				finmobview.read("/VariableMetaDataSet", {
					filters: aFilters,
					success: function (data) {
						console.log(data);

						var response = data.results || [];
						resolve(response);
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
			});

		},


		//Dynamic Widget Config Controller

		onLoadDyanmicWidgetData: async function (widgetId) {
			return await DynamicWidgetHelper.onLoadDyanmicWidgetData(this,widgetId);
		},

		onDataSourceChange: function(oEvent) {
			return DynamicWidgetHelper.onDataSourceChange(this, oEvent);
		},

		checkQueryValidity: function(oEvent) {
			return DynamicWidgetHelper.checkQueryValidity(this, oEvent);
		},

		handleSavePress: function(oEvent){
			return DynamicWidgetHelper.handleSavePress(this, oEvent);
		},

		deleteWidget: function(widgetId) {
			return DynamicWidgetHelper.deleteWidget(this, widgetId);
		},
		
		handleAddPress: function(paramQueryType, oEvent) {
			return DynamicWidgetHelper.handleAddPress(this, paramQueryType, oEvent);
		},
		
		onAddInput: async function (dataSource)  {
			return await DynamicWidgetHelper.onAddInput(this,dataSource);
		},

		getGroupedFormValues: async function() {
			return await DynamicWidgetHelper.getGroupedFormValues(this);
		},

		onTilePress: function(oEvent) {
			// var that = oController;
			var oBindingContext = oEvent.getSource().getBindingContext("oLandingPageDataModel");
			var oRowData = oBindingContext.getObject();
			var oTileDataModel = new JSONModel();
			oTileDataModel.setData(oRowData);
 			this.getView().setModel(oTileDataModel, "oTileDataModel");
	  
			console.log("Row pressed - Row contents:", oRowData);

			this.getView().byId("pageConfig").setVisible(true);
			this.getView().byId("tileText").setText(oRowData.Ztitle);
	  
			// Navigate to another fragment
			this.navigateToDetailFragment (oRowData.ZlevelId);

		},

		navigateToDetailFragment: function (levelId) {
			var that = this;
			var oPageDataModel = new JSONModel();
			// oPageDataModel.setData('');
 			// hat.getView().setModel(oPageDataModel, "oPageDataModel");
			 var finmobview = this.getView().getModel("finmobview");
			var aFilters = [new sap.ui.model.Filter("ZtitleId", sap.ui.model.FilterOperator.EQ,  levelId )];

			finmobview.read("/DynamicPageSet", {
				filters: aFilters,
				success: function (data) {
					console.log(data);
					// oAuthDataModel.setData(data);
					// that.getView().setModel(oAuthDataModel, "oAuthDataModel");
					oPageDataModel.setData(data.results);
 					that.getView().setModel(oPageDataModel, "oPageDataModel");
				

					sap.ui.core.BusyIndicator.hide(0);

				},
				error: function (oError) {

					sap.ui.core.BusyIndicator.hide(0);
					var responseText = oError.responseText;
					var msg;
					if (responseText.indexOf("{") > -1) {
						if (responseText != "") {
							//	msg += JSON.parse(oError.responseText).error.message.value;
							for (var i = 0; i < JSON.parse(oError.responseText).error.innererror.errordetails.length - 1; i++) {
								msg += JSON.parse(oError.responseText).error.innererror.errordetails[i].message + "\n";
							}
						}
					} else {
						msg = responseText;
					}

					MessageBox.error(msg);
				}
			});
		


		},

		onAddPage: function() {
			debugger;
			var that = this;
			var finmobview = this.getView().getModel("finmobview");

			if (!this.AddNewPageDialog) {
				this.AddNewPageDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewPage", this);
				this.getView().addDependent(this.AddNewPageDialog);

			}
			this.AddNewPageDialog.open();

		},
		
		onUpdatePage: function(){
			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oPageDataModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			var aUpdatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 					// Clean up object before updating
 					// if (oItem.hasOwnProperty("arr")) {
 					//     delete oItem.arr;
 					// }

 					// if (oItem.Zroles && Array.isArray(oItem.Zroles)) {
 					//     oItem.Zroles = "[" + oItem.Zroles.map(role => "'" + role + "'").join(", ") + "]";
 					//     console.log("Formatted Zroles:", oItem.Zroles);
 					// }
 						//TODO: Update by
 					 var sPath = "/DynamicPageSet(ZtitleId='"+oItem.ZtitleId+"',ZpageId='" +oItem.ZpageId +"')";

 					oModel.update(sPath, oItem, {
 							// method: "MERGE",
 						success: function () {
 							resolve(); // Update succeeded
 						},
 						error: function () {
 							reject(); // Update failed
 						}
 					});
 				});
 			});

 			// Wait for all updates to complete
 			Promise.allSettled(aUpdatePromises).then(function (results) {
 				sap.ui.core.BusyIndicator.hide();

 				var bHasError = results.some(result => result.status === "rejected");

 				if (bHasError) {
 					MessageBox.error("Some records failed to update.");
 				} else {
 					MessageBox.success("Data updated successfully!");
 				}
 			});
		},
		
		onDeletePage: function () {

 			var that = this;
 			var oTable = this.getView().byId("pageTable");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeletePageItems();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeletePageItems: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("pageTable");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/DynamicPageSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;
 				//TODO: Delete by
 				var deletePath = `/DynamicPageSet(ZtitleId='${addRow.ZtitleId}',ZpageId='${addRow.ZpageId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.navigateToDetailFragment(addRow.ZtitleId);
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},

		closeAddNewPageDialog: function() {
			if (this.AddNewPageDialog) {
				this.AddNewPageDialog.close();
			}
		},
		
		onAddPageItem: function() {
			debugger;
 			var that = this;
 			var inpTileTitle =this.getView().getModel("oTileDataModel").getData().ZlevelId;
 			
 			var inpPageTitle = sap.ui.getCore().byId("pageTitleInput").getValue();
 			var inpRoles= sap.ui.getCore().byId("rolesInput").getValue();
 			var inpVisibility = sap.ui.getCore().byId("visibilityCheckBox").getSelected();
 			
 			if (inpPageTitle === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addPageItem = {
 				"ZtitleId":inpTileTitle,
 				"ZpageName": inpPageTitle,
 				"Zvisibility": inpVisibility,
 				"Zrole": inpRoles,	
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/DynamicPageSet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addPageItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					// that.refreshGISDataAfterAddition(selectedFolderId, selectedFolderTitle);
 					that.navigateToDetailFragment(inpTileTitle);
 					sap.m.MessageBox.success("Item added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});

 			this.AddNewPageDialog.close();

		},
		
		onPagePress: function(oEvent) {
			
			// var that = oController;
			// debugger;
			var oBindingContext = oEvent.getSource().getBindingContext("oPageDataModel");
			var oRowData = oBindingContext.getObject();
			var oPageDetailsModel = new JSONModel();
			oPageDetailsModel.setData(oRowData);
 			this.getView().setModel(oPageDetailsModel, "oPageDetailsModel");
	  
			console.log("Row pressed - Row contents:", oRowData);

			this.getView().byId("widgetConfig").setVisible(true);
			this.getView().byId("pageText").setText(oRowData.ZpageName);

			// Navigate to another fragment
			this.navigateToWidgetFragment (oRowData.ZpageId);

			// this.showDynamicWidgetConfig();
			// var oFragment = sap.ui.xmlfragment(
			// 	"mobilefinance.MobileFinance.fragments.DynamicWidgetConfig",
			// 	this
			// );

			// var params = {};	
	  
			// // Pass parameters to fragment
			// oFragment.data("params", params);
	  
			// this.byId("dynamicWidgetConfig").removeAllContent();
			// this.byId("dynamicWidgetConfig").addContent(oFragment);

			// if (!this.oFragment) {
			// 	// this.openWidgetConfig = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewPage", this);
			// 	this.getView().addDependent(this.oFragment);

			// }
			// this.oFragment.open();



		},
		
		navigateToWidgetFragment: function (pageId) {
			var that = this;
			var oWidgetDataModel = new JSONModel();
			// oPageDataModel.setData('');
 			// hat.getView().setModel(oPageDataModel, "oPageDataModel");
			 var finmobview = this.getView().getModel("finmobview");
			var aFilters = [new sap.ui.model.Filter("ZpageId", sap.ui.model.FilterOperator.EQ,  pageId )];

			finmobview.read("/DynamicWidgetSet", {
				filters: aFilters,
				success: function (data) {
					console.log(data);
					// oAuthDataModel.setData(data);
					// that.getView().setModel(oAuthDataModel, "oAuthDataModel");
					oWidgetDataModel.setData(data.results);
 					that.getView().setModel(oWidgetDataModel, "oWidgetDataModel");
				

					sap.ui.core.BusyIndicator.hide(0);

				},
				error: function (oError) {

					sap.ui.core.BusyIndicator.hide(0);
					var responseText = oError.responseText;
					var msg;
					if (responseText.indexOf("{") > -1) {
						if (responseText != "") {
							//	msg += JSON.parse(oError.responseText).error.message.value;
							for (var i = 0; i < JSON.parse(oError.responseText).error.innererror.errordetails.length - 1; i++) {
								msg += JSON.parse(oError.responseText).error.innererror.errordetails[i].message + "\n";
							}
						}
					} else {
						msg = responseText;
					}

					MessageBox.error(msg);
				}
			});
		


		},
		
		onAddWidget: async function() {
			debugger;
			var that = this;
			var finmobview = this.getView().getModel("finmobview");
			var aDataSourceDropdownData = await this.getSearchHelpData('Widget_ID');
			var oDataSourceModel = new sap.ui.model.json.JSONModel();
			oDataSourceModel.setData(aDataSourceDropdownData);
			that.getView().setModel(oDataSourceModel, "aDataSourceDropdownData");

			if (!this.AddNewWidgetDialog) {
				this.AddNewWidgetDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewWidget", this);
				this.getView().addDependent(this.AddNewWidgetDialog);

			}
			this.AddNewWidgetDialog.open();

		},
		
		onAddWidgetItem: function() {
			debugger;
 			var that = this;
 			var tileId =this.getView().getModel("oTileDataModel").getData().ZlevelId;
 			var pageId =this.getView().getModel("oPageDetailsModel").getData().ZpageId;
 			
 			
 			var inpWidgetId = sap.ui.getCore().byId("widgetIDInput").getValue();
 			// var inpRoles= sap.ui.getCore().byId("rolesInput").getValue();
 			// var inpVisibility = sap.ui.getCore().byId("visibilityCheckBox").getSelected();
 			
 			if (inpWidgetId === '') {
 				sap.m.MessageToast.show("Fill all the mandatory Fields!!!");
 				return;
 			}

 			var addPageItem = {
 				"ZtitleId":tileId,
 				"ZpageId": pageId,
 				"WidgetId": inpWidgetId,
 			};
 			var batchChanges = [];
 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);
 			var uPath = "/DynamicWidgetSet";
 			batchChanges.push(oDataModel.createBatchOperation(uPath, "POST", addPageItem));

 			oDataModel.addBatchChangeOperations(batchChanges);
 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(function (oData, oResponse) {
 				sap.ui.core.BusyIndicator.hide(0);
 				if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 					// that.refreshGISDataAfterAddition(selectedFolderId, selectedFolderTitle);
 					that.navigateToWidgetFragment(pageId);
 					sap.m.MessageBox.success("Item added successfully!");
 				}
 			}, function (oError) {
 				sap.ui.core.BusyIndicator.hide(0);
 				sap.m.MessageBox.error("Failed to update data");
 			});

 			this.AddNewWidgetDialog.close();

		},
		
		onUpdateWidget: function(){
			var oModel = this.getView().getModel("finmobview");
 			var aData = this.getView().getModel("oWidgetDataModel").getData();

 			sap.ui.core.BusyIndicator.show(0);

 			var aUpdatePromises = aData.map(function (oItem) {
 				return new Promise(function (resolve, reject) {
 					// Clean up object before updating
 					// if (oItem.hasOwnProperty("arr")) {
 					//     delete oItem.arr;
 					// }

 					// if (oItem.Zroles && Array.isArray(oItem.Zroles)) {
 					//     oItem.Zroles = "[" + oItem.Zroles.map(role => "'" + role + "'").join(", ") + "]";
 					//     console.log("Formatted Zroles:", oItem.Zroles);
 					// }
 						//TODO: Update by
 					 var sPath = "/DynamicWidgetSet(ZtitleId='"+oItem.ZtitleId+"',ZpageId='" +oItem.ZpageId +"',WidgetId='" +oItem.WidgetId +"')";

 					oModel.update(sPath, oItem, {
 							// method: "MERGE",
 						success: function () {
 							resolve(); // Update succeeded
 						},
 						error: function () {
 							reject(); // Update failed
 						}
 					});
 				});
 			});

 			// Wait for all updates to complete
 			Promise.allSettled(aUpdatePromises).then(function (results) {
 				sap.ui.core.BusyIndicator.hide();

 				var bHasError = results.some(result => result.status === "rejected");

 				if (bHasError) {
 					MessageBox.error("Some records failed to update.");
 				} else {
 					MessageBox.success("Data updated successfully!");
 				}
 			});
		},
		
		onDeleteWidget: function () {

 			var that = this;
 			var oTable = this.getView().byId("widgetTable");

 			var aContexts = oTable.getSelectedContexts();
 			if (aContexts.length) {
 				sap.m.MessageBox.show(
 					"Are you sure you want to delete the selected item?", {
 						icon: sap.m.MessageBox.Icon.QUESTION,
 						title: "Confirmation",
 						actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
 						onClose: function (oAction) {
 							if (oAction === "YES") {

 								that.onDeleteWidgetItems();
 								//  mainController.getView().getModel("oVisitModel").refresh(true);
 							}
 						}
 					}
 				);
 			}
 		},

 		onDeleteWidgetItems: function () {
 			debugger;
 			var that = this;
 			var oTable = this.getView().byId("widgetTable");
 			var aContexts = oTable.getSelectedContexts();

 			var deletionItems = [];

 			for (var i = 0; i < aContexts.length; i++) {
 				deletionItems.push(aContexts[i].getObject())
 			};

 			var url = "/sap/opu/odata/SAP/ZFI_MOBILE_SRV/";
 			var uPath = "/DynamicWidgetSet";
 			var oDataModel = new sap.ui.model.odata.ODataModel(url);
 			oDataModel.setUseBatch(true);

 			var batchChanges = [];

 			for (var i = 0; i < deletionItems.length; i++) {
 				var addRow = deletionItems[i];
 				delete addRow.__metadata;
 				//TODO: Delete by
 				var deletePath = `/DynamicWidgetSet(ZtitleId='${addRow.ZtitleId}',ZpageId='${addRow.ZpageId}',WidgetId='${addRow.WidgetId}')`;

 				batchChanges.push(oDataModel.createBatchOperation(deletePath, "DELETE"));

 			}

 			oDataModel.addBatchChangeOperations(batchChanges);

 			sap.ui.core.BusyIndicator.show(0);

 			oDataModel.submitBatch(
 				function (oData, oResponse) {
 					if (oResponse.statusCode === "202" || oResponse.statusCode === 202) {
 						sap.ui.core.BusyIndicator.hide(0);
 						sap.m.MessageBox.success("Selected items deleted successfully.");
 						that.navigateToWidgetFragment(addRow.ZpageId);
 					}
 				},
 				function (oError) {
 					sap.ui.core.BusyIndicator.hide();
 					sap.m.MessageBox.error("Failed to delete selected items.");
 				}
 			);

 		},
 		
 		onWidgetPress: function(oEvent) {
 				// var that = oController;
			debugger;
			var oBindingContext = oEvent.getSource().getBindingContext("oWidgetDataModel");
			var oRowData = oBindingContext.getObject();
		
	  
			// console.log("Row pressed - Row contents:", oRowData);

			// this.getView().byId("widgetConfig").setVisible(true);
			// this.getView().byId("pageText").setText(oRowData.ZpageName);

			// // Navigate to another fragment
			// this.navigateToWidgetFragment (oRowData.ZpageId);
			// this.getView().byId("dynamicWidgetConfigContainer").setVisible(true);
			this.showDynamicWidgetConfig(oRowData.WidgetId);
			// var oFragment = sap.ui.xmlfragment(
			// 	"mobilefinance.MobileFinance.fragments.DynamicWidgetConfig",
			// 	this
			// );

			// var params = {};	
	  
			// // Pass parameters to fragment
			// oFragment.data("params", params);
	  
			// this.byId("dynamicWidgetConfig").removeAllContent();
			// this.byId("dynamicWidgetConfig").addContent(oFragment);

			// if (!this.oFragment) {
			// 	// this.openWidgetConfig = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.AddNewPage", this);
			// 	this.getView().addDependent(this.oFragment);

			// }
			// this.oFragment.open();
 		},

		
		closeAddWidgetDialog: function() {
			if (this.AddNewWidgetDialog) {
				this.AddNewWidgetDialog.close();
			}
		},
		
		widgetSearchHelp: async function(oEvent) {
			debugger;
			var oWidgetListDropdownData = await this.getSearchHelpData('Widget_ID');
			var oWidgetListModel = new sap.ui.model.json.JSONModel();
			oWidgetListModel.setData(oWidgetListDropdownData);
			this.getView().setModel(oWidgetListModel, "oWidgetListDropdownData");
			
			    this._oCurrentInput = oEvent.getSource();

			
			var oView = this.getView();
			// this._sInputId = oEvent.getSource().getId();
			
			if (!this._pValueHelpDialog) {
				this._pValueHelpDialog = sap.ui.xmlfragment("mobilefinance.MobileFinance.fragments.SearchDialog", this);
				this.getView().addDependent(this._pValueHelpDialog);

			}
			this._pValueHelpDialog.open();
	

		},
		_handleValueHelpSearch: function(oEvent) {
    var sValue = oEvent.getParameter("value");
    var oFilter = new sap.ui.model.Filter("Text", sap.ui.model.FilterOperator.Contains, sValue);
    var oBinding = oEvent.getSource().getBinding("items");
    oBinding.filter([oFilter]);
},

_handleValueHelpClose: function(oEvent) {
     var oSelectedItem = oEvent.getParameter("selectedItem");
    if (oSelectedItem && this._oCurrentInput) {
        var sSelectedId = oSelectedItem.getDescription();
        var sSelectedText = oSelectedItem.getTitle();
        
        // Use the stored input reference
        this._oCurrentInput.setValue(sSelectedText || sSelectedId);
        this._oCurrentInput.data("selectedId", sSelectedId);
        this._oCurrentInput.data("selectedText", sSelectedText);
        
        // Clear the reference
        this._oCurrentInput = null;
    }
    oEvent.getSource().getBinding("items").filter([]);
},


		// Legacy function - keeping structure but delegating to helper
		_onAddInputLegacy: async function ()  {
			debugger;
			var that = this;
			var oForm = this.byId("bexQueryParameterForm");
			var aQueryParam = await this.getQueryParameter();
			aQueryParam.forEach(function(param) {
				var oFormComponent = [];
				switch (param.Vparsel) {
					case 'M':
						// var oLabel = new sap.m.Label({
						// 	text: param.Vtxt
						// });
						// var oInput = new sap.m.Input({
						// 	// placeholder: "Enter product",
						// 	class: "sapUiSmallMarginBottom",
						// 	type: "Text",
						// 	showValueHelp: true,
						// 	valueHelpIconSrc: "sap-icon://arrow-left",
						// 	// valueHelpRequest: this.handleValueHelp.bind(this)
						// });
						// var oAddButton = new  sap.m.Button({
						// 	enabled: true,
						// 	icon: "sap-icon://add",
						// 	press: that.handleAddPress.bind(that,'M')
						// });

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
											// placeholder: "Enter product",
											class: "sapUiSmallMarginBottom",
											type: "Text",
											showValueHelp: true,
											valueHelpIconSrc: "sap-icon://arrow-left",
											// valueHelpRequest: this.handleValueHelp.bind(this)
										}),
									 new  sap.m.Button({
											enabled: true,
											icon: "sap-icon://add",
											press: that.handleAddPress.bind(that,'M')
										})
								]})
							]});
						
						
						oForm.addContent(oLabel);
						oForm.addContent(oMultiInputBox);
						// oForm.addContent(oAddButton);
						
					  break;
					case "S":
					
						// Label
						var oLabel = new sap.m.Label({
							text: param.Vtxt
						});
						var oSelectOptionBox = 	new sap.m.VBox({
							class: "sapUiMediumMargin",
							items: [
								new sap.m.HBox({
									class: "sapUiSmallMarginBottom",
									items: [
										// Range Select
										new sap.m.Select({
											forceSelection: false,
											items: {
												path: "inputParamModel>/selectOptionRange",
												template: new sap.ui.core.Item({
													key: "{inputParamModel>Value}",
													text: "{inputParamModel>Value}"
												})
											},
											// selectedKey: "{inputParamModel>/selectOptionRange}",
											icon: "sap-icon://filter",
											autoAdjustWidth: true,
											// change: function(oEvent) {
											// 	// Handle change event directly
											// 	var sSelectedKey = oEvent.getSource().getSelectedKey();
											// 	// Your logic here
											// }
										}),
										
										new sap.m.Input({
											class: "sapUiSmallMarginEnd",
											type: "Text",
											placeholder: "Enter product",
											showValueHelp: true,
											valueHelpIconSrc: "sap-icon://arrow-left",
											valueHelpRequest: "handleValueHelp"
										}),
										
										// "to" Text
										new sap.m.Text({
											text: "to",
											class: "sapUiSmallMarginEnd"
										}),
										
										// Second Input Field
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
											press: that.handleAddPress.bind(that,'S')
										})
									]
								})
			
							]});
								
						oForm.addContent(oLabel);
						oForm.addContent(oSelectOptionBox);
					  break;
					case "I":
						var oLabel = new sap.m.Label({
							text: param.Vtxt
						});
						var oIntervalBox =  new sap.m.VBox({
							class: "sapUiMediumMargin",
							items: [
								new sap.m.HBox({
									class: "sapUiSmallMarginBottom",
									items: [
										new sap.m.Input({
											// placeholder: "Enter product",
											class: "sapUiSmallMarginBottom",
											type: "Text",
											showValueHelp: true,
											valueHelpIconSrc: "sap-icon://arrow-left",
											// valueHelpRequest: this.handleValueHelp.bind(this)
										}),
										// "to" Text
										new sap.m.Text({
											text: "to",
											class: "sapUiSmallMarginEnd"
										}),
										
										// Second Input Field
										new sap.m.Input({
											type: "Text",
											placeholder: "Enter product",
											showValueHelp: true,
											valueHelpIconSrc: "sap-icon://arrow-left",
											valueHelpRequest: "handleValueHelp"
										}),
		
									]})

							]})
						
						oForm.addContent(oLabel);
						oForm.addContent(oIntervalBox);
					
						break;
					case "P":
						var oLabel = new sap.m.Label({
							text: param.Vtxt
						});
						var oInput = new sap.m.Input({
							// placeholder: "Enter product",
							class: "sapUiSmallMarginBottom",
							type: "Text",
							showValueHelp: true,
							valueHelpIconSrc: "sap-icon://arrow-left",
							// valueHelpRequest: this.handleValueHelp.bind(this)
						});
						oForm.addContent(oLabel);
						oForm.addContent(oInput);
						break;
					
					default:
				  }
			});

		
			

    
    // 		// Create label
	// 		for(let i=0 ; i<5; i++){
	// 			var oLabel = new sap.m.Label({
	// 				text: 'test'+i
	// 			});
				
	// 			// Create input
	// 			var oInput = new sap.m.Input({
	// 				placeholder: "Enter product",
	// 				class: "sapUiSmallMarginBottom",
	// 				type: "Text",
	// 				showValueHelp: true,
	// 				valueHelpIconSrc: "sap-icon://arrow-left",
	// 				// valueHelpRequest: this.handleValueHelp.bind(this)
	// 			});
	// 			oForm.insertContent(oLabel, i+1);
	// 			oForm.insertContent(oInput, i+2);

	// 		}
    // var oLabel = new sap.m.Label({
    //     text: 'test'
    // });
    
    // // Create input
    // var oInput = new sap.m.Input({
    //     placeholder: "Enter product",
    //     class: "sapUiSmallMarginBottom",
    //     type: "Text",
    //     showValueHelp: true,
    //     valueHelpIconSrc: "sap-icon://arrow-left",
    //     // valueHelpRequest: this.handleValueHelp.bind(this)
    // });
	// debugger;
    // oForm.insertContent(oLabel, 2);
    // // oForm.insertContent(oInput, 3);
	// // oForm.insertContent(oInput, 4);
	// // oForm.insertContent(oInput, 5);          
	// // oForm.insertContent(oInput, 6);
    // // Add both controls
    // // oForm.addContent(oLabel);
    // // oForm.addContent(oInput);
		},
		// {
		// 	"VNAM": "ZES_PERIOD",
		// 	"VARTYP": "1",
		// 	"VPARSEL": "P",
		// 	"IOBJNM": "/CPMB/ZED08MN__/CPMB/YEAR",
		// 	"LS_VALUE": [
			//   {
			// 	"SIGN": ">=",
			// 	"OPTION": "I",
			// 	"LOW": "1",
			// 	"HIGH": ""
			//   }
		// 	]
		//   }
		// {
		// 	"Fiscal year": {
		// 		"type": "",
		// 		"values": [
		// 			"2024"
		// 		]
		// 	},
		// 	"Categort 1": {
		// 		"type": "",
		// 		"values": [
		// 			"1",
		// 			"2",
		// 			"3",
		// 			"4"
		// 		],
		// 		"selects": [
		// 			{
		// 				"selectedKey": "",
		// 				"selectedItem": ""
		// 			},
		// 			{
		// 				"selectedKey": "I",
		// 				"selectedItem": "Include"
		// 			},
		// 			{
		// 				"selectedKey": "",
		// 				"selectedItem": ""
		// 			},
		// 			{
		// 				"selectedKey": "I",
		// 				"selectedItem": "Include"
		// 			}
		// 		]
		// 	},
		// 	"Org Entity Test": {
		// 		"type": "",
		// 		"values": [
		// 			"123",
		// 			"456"
		// 		]
		// 	},
		// 	"Corp Acc": {
		// 		"type": "",
		// 		"values": [
		// 			"CORP"
		// 		]
		// 	}
		// }
	

		// callBSPService: function(queryData) {
		// 	var sBSPUrl = this.getOwnerComponent().getManifestEntry("/sap.app/dataSources/ZFI_QUERY_BSP/uri");
			
		// 	return new Promise((resolve, reject) => {
		// 		$.ajax({
		// 			url: sBSPUrl,
		// 			type: "GET",
		// 			data: {
		// 				query: queryData
		// 			},
		// 			dataType: "json",
		// 			success: function(data) {
		// 				console.log("BSP Response:", data);
		// 				resolve(data);
		// 			},
		// 			error: function(xhr, status, error) {
		// 				console.error("BSP Error:", error);
		// 				reject(error);
		// 			}
		// 		});
		// 	});
		// }

		loadDynamicWidgetConfigFragment: function() {
			var oContainer = this.byId("dynamicWidgetConfigContainer");
			if (oContainer && oContainer.getItems().length === 0) {
				if (!this._oDynamicWidgetConfigFragment) {
					this._oDynamicWidgetConfigFragment = sap.ui.xmlfragment(
						"dynamicWidgetConfig", 
						"mobilefinance.MobileFinance.fragments.DynamicWidgetConfig", 
						this
					);
					var params = {"widgetId":"test"};
					this._oDynamicWidgetConfigFragment.data("params", params);
					this.getView().addDependent(this._oDynamicWidgetConfigFragment);
				}
				oContainer.addItem(this._oDynamicWidgetConfigFragment);
				
			}
		},

		showDynamicWidgetConfig: function(widgetId) {
			this.loadDynamicWidgetConfigFragment();
			var oContainer = this.byId("dynamicWidgetConfigContainer");
			if (oContainer) {
				oContainer.setVisible(true);
			}
			this.getDynamicWidgetParams();
			// this.onLoadDyanmicWidgetData('00505684457C1FE0A6D3C64CCF25CE18');
			this.onLoadDyanmicWidgetData(widgetId);
		},

		getDynamicWidgetParams: function() {
			if (this._oDynamicWidgetConfigFragment) {
				console.log(this._oDynamicWidgetConfigFragment.data("params"));
				return this._oDynamicWidgetConfigFragment.data("params");
			}
			return null;
		}

 	});
 });
