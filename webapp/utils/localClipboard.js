// aContent.forEach(function(oControl) {
//     if (oControl instanceof sap.m.Label) {
//         sCurrentLabel = oControl.getText();
//         if (!oFormData[sCurrentLabel]) {
//             oFormData[sCurrentLabel] = {
//                 type: "",
//                 values: []
//             };
//         }
//     } else if (oControl instanceof sap.m.Input) {
//         if (sCurrentLabel && oFormData[sCurrentLabel]) {
//             oFormData[sCurrentLabel].values.push({
//                 "SIGN": "",
//                 "OPTION": "",
//                 "LOW": oControl.getValue(),
//                 "HIGH": ""
//             });
//         }
//     } else if (oControl instanceof sap.m.Select) {
//         if (sCurrentLabel && oFormData[sCurrentLabel]) {
//             if (!oFormData[sCurrentLabel].selects) {
//                 oFormData[sCurrentLabel].selects = [];
//             }
//             oFormData[sCurrentLabel].selects.push({
//                 selectedKey: oControl.getSelectedKey(),
//                 selectedItem: oControl.getSelectedItem() ? 
//                     oControl.getSelectedItem().getText() : ""
//             });
//         }
//     }
// });

// var aQueryParam = await that.getQueryParameter();
// Object.keys(oFormData).forEach(key => {
//     var oParam = {};
//     var oQueryParam = aQueryParam.find(param => param.Vtxt === key);
//     oParam["VNAM"] = oQueryParam ? oQueryParam.Vnam : "";
//     oParam["VARTYP"] = oQueryParam ? oQueryParam.Vartyp : "";
//     oParam["VPARSEL"] = oQueryParam ? oQueryParam.Vparsel : "";
//     oParam["IOBJNM"] = oQueryParam ? oQueryParam.Iobjnm : "";
//     oParam["LS_VALUE"] = [];
    
//     for (let i = 0; i < oFormData[key].values.length; i++) {
//         var oValue = {};
//         oValue["SIGN"] = oFormData[key].selects && oFormData[key].selects[i] ? oFormData[key].selects[i].selectedKey : "";
//         oValue["OPTION"] = oFormData[key].selects && oFormData[key].selects[i] ? oFormData[key].selects[i].selectedKey : "";
//     }
// });

// return oFormData;