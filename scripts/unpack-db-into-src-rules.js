const fs = require("fs");
const zlib = require("zlib");

if (!fs.existsSync("scowl.db")) {
  console.log("Decompressing scowl.db.gz...");
  fs.createReadStream("scowl.db.gz")
    .pipe(zlib.createGunzip())
    .pipe(fs.createWriteStream("scowl.db"))
    .on("finish", () => {
      fs.rename('scowl.db', 'src/rules/scowl.db', () => {})
      console.log("Database decompressed successfully");
    })
    .on("error", (err) => {
      console.error("Error decompressing database:", err);
      process.exit(1);
    });
} else {
  fs.rename('scowl.db', 'src/rules/scowl.db', () => {})
  console.log("Database already decompressed");
}
