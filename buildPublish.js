// process.cwd()

// "test": "webpack --config test-webpack.config.js --watch",
// "build": "webpack",
// "watch": "webpack --watch",
// "start": "webpack-dev-server --open --config webpack.config.js",
// "prod": "webpack --config publish-webpack.config",
// "npmPublish": "npm publish -registry=https://registry.npmjs.org",
// "lint": "eslint ./src/*.* ./src/**/*.*  --fix",
// "docs": "typedoc",
// "dts": "dts-generator --project  ./  --out ./dist/vf-gui.d.ts"

const {execSync } = require('child_process');
const fs = require("fs");
const packageData = require('./package.json');
const version = `
/*
 * vfgui - v${packageData.version}
 * Compiled ${new Date()}
 */
`;


let content = fs.readFileSync("./src/vf-gui.ts","utf8");
const versionRegExp = /\d+(\.\d+){0,3}/g;
content = content.replace(versionRegExp,packageData.version);
fs.writeFileSync("./src/vf-gui.ts",content);

let buildOut =  execSync("npm run build",{encoding:"utf8"});
console.log(buildOut);
let publishOut =  execSync("npm run prod",{encoding:"utf8"});
console.log(publishOut);
let dtsOut =  execSync("npm run dts",{encoding:"utf8"});
console.log(dtsOut);
let dtsFile = fs.readFileSync("./dist/vf-gui.d.ts","utf8");

dtsFile += `
declare namespace gui{
    export * from "UI";
}
`;
fs.writeFileSync("./dist/vf-gui.d.ts",dtsFile);


const pixiLegacy = fs.readFileSync('./node_modules/pixi.js-legacy/dist/pixi-legacy.min.js',"utf8");
const pixiSound = fs.readFileSync('./node_modules/pixi-sound/dist/pixi-sound.js',"utf8");
const vfgui = fs.readFileSync('./dist/vf-gui.min.js',"utf8");
const es6 = `
    export {PIXI,vfgui}
`;

fs.writeFileSync(`./dist/vf-gui-all.min.js`,version+ '\n'+ pixiLegacy+ '\n'+ pixiSound+ '\n'+ vfgui + '\n'+ es6);