var fs = require('fs');
var path = require('path');
var Zip = require('adm-zip');
var csv = require('csv');
var buff = new Buffer(2000);
var file = 1;
var mode = null;
var freq = null;
var filename = process.argv[2];
if (!filename) {
  throw new Error('Use: csv2sr <filename>');
}
filename = path.normalize(filename);
var parser = csv.parse({delimiter: ','}, function(err, data){
  for (var i = 0; i < data.length; ++i) {
    if (data[i][0] === 'time:') {
      var time  = data[i][1];
      var sampleSeconds = null;
      if (time.length >= 3) {
        var multiple = time.substr(time.length - 2, 2);
        if (multiple === ' m') {
          sampleSeconds = parseInt(time.substr(0, time.length - 2)) / 1000;
        }
	else if (multiple === ' u') {
          sampleSeconds = parseInt(time.substr(0, time.length - 2)) / 1000000;
        }
	else {
          sampleSeconds = parseInt(time);
        }
      }
      else {
        sampleSeconds = parseInt(time);
      }
      mode = data[i][4];
      freq = 1 / (sampleSeconds / 100);
    }
    else {
      if (mode === 'RAW') {
        for (var y = 1; y < data[i].length; ++y) {
          var v = parseInt(data[i][y]);
	  buff.writeUInt16LE(v, (y - 1) * 2);
        }
        fs.writeFileSync('logic-1-' + file.toString(), buff);
        ++file;
      }
    }
  }
  var metaFreq = null;
  if (freq > 1000000) {
    metaFreq = (freq / 1000000) + ' MHz';
  }
  else if (freq > 1000) {
    metaFreq = (freq / 1000) + ' KHz';
  }
  else {
    metaFreq = freq + ' Hz';
  }
  var version = '2';
  var metadata = '[global]\n' +
    'sigrok version=0.3.0\n\n' +
    '[device 1]\n' +
    'capturefile=logic-1\n' +
    'total probes=16\n' +
    'samplerate=' + metaFreq + '\n' +
    'probe1=D0\n' + 
    'probe2=D1\n' + 
    'probe3=D2\n' +
    'probe4=D3\n' +
    'probe5=D4\n' +
    'probe6=D5\n' +
    'probe7=D6\n' +
    'probe8=D7\n' +
    'probe9=D8\n' +
    'probe10=D9\n' +
    'probe11=D10\n' +
    'probe12=D11\n' +
    'probe13=D12\n' +
    'probe14=D13\n' +
    'probe15=D14\n' +
    'probe16=D15\n' +
    'unitsize=2\n';
  var zip = new Zip();
  zip.addFile('version', new Buffer(version));
  zip.addFile('metadata', new Buffer(metadata));
  for (var i = 1; i < file; ++i) {
    zip.addLocalFile('logic-1-' + i);
  }
  zip.writeZip(path.dirname(filename) + '/' + path.basename(filename, path.extname(filename)) + '.sr');
});
fs.createReadStream(filename).pipe(parser);
