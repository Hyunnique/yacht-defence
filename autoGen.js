// const fs = require('fs').promises;


// let tier = {
//     "tier1": [2, 22, 24, 26, 27, 35],
//     "tier2": [33, 34, 38, 41, 43, 45, 50, 51, 52, 53, 55, 56],
//     "tier3": [3, 9, 10, 11, 13, 19, 23, 25, 31, 32, 40, 42, 46, 47, 57, 59, 60, 62, 63],
//     "tier4": [0, 1, 4, 5, 6, 7, 8, 14, 15, 16, 17, 18, 20, 21, 28, 29, 30, 36, 37, 39, 44, 48, 49, 54, 58, 61]
// }
// fs.readFile('../unitSpecsheet.json').then((data) => {
//     data = JSON.parse(data.toString());
//     for (var i = 1; i <= 4; i++) {
//         for (var j = 0; j < tier["tier" + i].length; j++) {
            
//             var num = tier["tier" + i][j];
//             data["unit" + num]["tier"] = i;
//         }
//     }
//     fs.writeFile("../unitSpecsheet.json",JSON.stringify(data),()=>{});
// }).catch((e) => {console.log(e)});


let array = [4, 1, 2, 3, 5]

array.sort((a, b) => { if (a > b) return 1; else if (a < b) return -1; else return 0; })

console.log(array);