import fs from "fs";
import zlib from "zlib";

if (!fs.existsSync("scowl.db")) {
  fs.createReadStream("scowl.db.gz")
    .pipe(zlib.createGunzip())
    .pipe(fs.createWriteStream("scowl.sqlite"));
}
