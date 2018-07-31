var keypair = require("keypair"),
    fs = require("fs");

var KNAME = process.env['MANAGERIST_JWT_KEY'] || "jwtRS256.gen",
    ODIR = "dist/secured/";

var pair = keypair();
console.log("RSA generated.");
if (!fs.existsSync(ODIR))
    fs.mkdirSync(ODIR);

fs.writeFile(ODIR + KNAME, pair.private, function(err) {
    if(err)  return console.log(err);
    console.log("RSA private saved.");
});

fs.writeFile(ODIR + KNAME + '.pub', pair.public, function(err) {
    if(err)  return console.log(err);
    console.log("RSA public saved.");
});