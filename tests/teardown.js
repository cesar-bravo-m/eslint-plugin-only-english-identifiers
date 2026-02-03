const fs = require("fs");
const path = require("path");

module.exports = async () => {
  const dbPath = path.join(process.cwd(), "scowl.db");

  // Remove the uncompressed database file after tests
  if (fs.existsSync(dbPath)) {
    console.log("Tearing down: Cleaning up scowl.db...");
    fs.unlinkSync(dbPath);
    console.log("Database cleaned up successfully");
  }
};
