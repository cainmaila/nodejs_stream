var fs = require("fs"),
    http = require("http"),
    url = require("url"),
    path = require("path");

http.createServer(function (req, res) {
  var _filePath = req.url.slice(1);
  var _type = req.url.slice(-3);
  if(_type=="mp3"){
    _type = "audio/mpeg";
  }else if(_type=="mp4"){
    _type = "video/mp4";
  }else{
    _type = "text/html";
  }
  fs.exists(_filePath, function  (_if) {
    _if?function  () {
      //檔案存在
      var file = path.resolve(__dirname,_filePath);
      var range = req.headers.range;
      range=range?range:"bytes=0-";
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
          "Content-Type": _type
        });
        var stream = fs.createReadStream(file, { start: start, end: end })
        .on("open", function() {
          stream.pipe(res);
        }).on("error", function(err) {
          res.end(err);
        });
      });
    }():function  () {
      //檔案不存在
      res.writeHead(404,{
         "Content-Type": _type
      });
    }();
  });
  //var file = path.resolve(__dirname,req.url.slice(1));
  //console.log(file);
}).listen(6955);
console.log("m3 start!!");
