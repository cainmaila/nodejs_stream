var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path");

http.createServer(function (req, res) {
  if (req.url != "/bgm.mp3") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end('<!DOCTYPE html><audio src="http://54.65.143.113:6954/bgm.mp3" controls></audio>');
  } else {
    var file = path.resolve(__dirname,"bgm.mp3");
    var range = req.headers.range;
    if(range==undefined){
      console.log("=================================================");
      range="bytes=0-";
    }else{
      console.log(range);
    }
    var positions = range.replace(/bytes=/, "").split("-");
    var start = parseInt(positions[0], 10);
    fs.stat(file, function(err, stats) {
      var total = stats.size;
      var end = positions[1] ? parseInt(positions[1], 10) : total - 1;
      var chunksize = (end - start) + 1;

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + total,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "audio/mpeg"
      });

      var stream = fs.createReadStream(file, { start: start, end: end })
        .on("open", function() {
          stream.pipe(res);
        }).on("error", function(err) {
          res.end(err);
        });
    });
  }
}).listen(6954);

