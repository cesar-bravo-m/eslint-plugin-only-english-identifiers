const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

module.exports = async () => {
  const dbPath = path.join(process.cwd(), "scowl.db");
  const gzPath = path.join(process.cwd(), "scowl.db.gz");

  // Only decompress if the database doesn't exist
  if (!fs.existsSync(dbPath)) {
    console.log("Setting up: Decompressing scowl.db.gz...");
    
    await new Promise((resolve, reject) => {
      fs.createReadStream(gzPath)
        .pipe(zlib.createGunzip())
        .pipe(fs.createWriteStream(dbPath))
        .on("finish", () => {
          console.log("Database decompressed successfully");
          resolve();
        })
        .on("error", (err) => {
          console.error("Error decompressing database:", err);
          reject(err);
        });
    });
  } else {
    console.log("Database already exists, skipping decompression");
  }
};
