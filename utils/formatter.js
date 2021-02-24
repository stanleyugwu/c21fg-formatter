const fs = require("fs");
const rd = require("readline");
const sep = require('path').sep

function Formatter(filepath = "../inputTxt/inTxt.txt", outpath, groupBy = 100, countPerLine = 5) {
  return new Promise((res, rej) => {
    //init reading
    const readline = rd.createInterface({
      input: fs.createReadStream(filepath),
      terminal: false,
    });

    //output setting
    const output = fs.createWriteStream(outpath+sep+'final.txt' || "../output/output.txt");

    var counter = 1;

    readline.on("line", (l) => {
      var line = String(l);

      if (line.length === 0) {
        line = null; //empty line
      } else {
        if (line.length < 11) {
          line = line + `${Math.floor(Math.random() * 9)}`;
        }
        output.write(line + ", ");

        if (counter % groupBy === 0) {
          output.write("\n\n");
        } else if (counter % countPerLine === 0) {
          output.write("\n");
        }
        ++counter;
      }
    });

    readline.on("close", () => {
      output.close();
      res(true)
    });

    readline.on("error", () => {
      rej(Error("Encountered Error reading file"))
    });
  });
}

module.exports = Formatter