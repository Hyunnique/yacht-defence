const fs = require('fs');

var dictObject = {};
for (var i = 0; i < 50; i++) {
    var dataArray = [];
    var datadict = {};

    datadict["mobName"] = "BatSmallA";
    datadict["mobCount"] = 10;
    datadict["hpFactor"] = 1.0;
    datadict["mobRoute"] = "A";
    dataArray.push(datadict);
    dictObject["round"+i] = dataArray;
}

fs.writeFile("../roundSheet.json",JSON.stringify(dictObject),()=>{});