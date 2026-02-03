const fs = require("fs");

// Remove the uncompressed database file after tests
if (fs.existsSync("scowl.db")) {
  console.log("Cleaning up scowl.db...");
  fs.unlinkSync("scowl.db");
  console.log("Database cleaned up successfully");
} else {
  console.log("No database file to clean up");
}
