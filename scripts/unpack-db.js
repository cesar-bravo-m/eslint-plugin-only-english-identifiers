const fs = require("fs");
const zlib = require("zlib");

// Decompress scowl.db.gz to scowl.db if not already present
if (!fs.existsSync("scowl.db")) {
  console.log("Decompressing scowl.db.gz...");
  fs.createReadStream("scowl.db.gz")
    .pipe(zlib.createGunzip())
    .pipe(fs.createWriteStream("scowl.db"))
    .on("finish", () => {
      console.log("Database decompressed successfully");
    })
    .on("error", (err) => {
      console.error("Error decompressing database:", err);
      process.exit(1);
    });
} else {
  console.log("Database already decompressed");
}
