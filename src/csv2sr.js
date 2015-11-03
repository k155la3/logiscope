var fs = require('fs');
var csv = require('csv');
var buff = new Buffer(2000);
var file = 1;

var parser = csv.parse({delimiter: ','}, function(err, data){
  for (var i = 0; i < data.length; ++i) {
    if (data[i][0] === 'time:') {
    }
    else {
      for (var y = 1; y < data[i].length; ++y) {
        var v = parseInt(data[i][y]);
	buff.writeUInt16LE(v, (y - 1) * 2);
      }
      fs.writeFileSync('logic-1-' + file.toString(), buff);
      ++file;
    }
  }
});

fs.createReadStream('1.csv').pipe(parser);
