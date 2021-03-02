const http = require('http');
const url = require('url');
const fs = require('fs');
const { exec } = require('child_process');
const acceptedPanels = [
                        'VMAP', 'AS', 'ST',
                        'RM', 'PROC', 'PARM', 'LNK', 'SYM',
                        'LPA', 'FS', 'ENQ', 'SYS', 'ENC'
                       ];
const interval = 180000;
//const interval = 10000;
var tsosessionid = '';
var tsopinginterval = null;

http.createServer(function (req, res) {
  handleRequest (req, res)
  }).listen(8080);

//  if (tsosessionid == '') {
    createTsosession();
//  };
console.log('Listening on port 8080');

function createTsosession () {
  exec('zowe zos-tso start address-space --zosmf-profile "tutosys" --sko', (err, stdout, stderr) => {
    if (err) {
      console.log('Error start Tso session');
    };
    if (stdout) {
      tsosessionid = stdout.substr(0,stdout.length-1);
      console.log('Tso sessionid : ' + tsosessionid);
      tsopinginterval = setInterval(function(){
                          pingTsosession ();
                          }, interval);
    };
    if (stderr) {
      console.log(stderr);
    }
  });
};

function pingTsosession () {
    zowecmd = 'zowe zos-tso ping address-space "';
    zowecmd = zowecmd + tsosessionid;
    zowecmd = zowecmd + '"';
    exec(zowecmd, (err, stdout, stderr) => {
      if (err) {
        console.log('Error pinging ' + tsosessionid);
      };
      if (stdout) {
        console.log(stdout.substr(0,stdout.length-1));
      };
      if (stderr) {
        console.log(stderr);
      }
    });
  };

function processZowe (func, res) {
  console.log (`zowecmd: ${func}`);
  exec(func, {maxBuffer : 1024 * 1024} , (err, stdout, stderr) => {
    if (err) {
      console.log('zowe error');
    };
    if (stdout) {
      var result = stdout.substring(0,stdout.length-8);
//      console.log(result);
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(result);
      return res.end();
    };
    if (stderr) {
      console.log(stderr);
    }
  });
  clearInterval(tsopinginterval);
  tsopinginterval = setInterval(function(){
    pingTsosession ();
    }, interval);
}

function handleRequest(req, res) {
  var q = url.parse(req.url, true);
  var filename = "." + q.pathname;

//  console.log(q.host);
//  console.log(q.pathname);
//  console.log(q.search);
  var qdata = q.query; //returns an object: { year: 2017, month: 'february' }
//  console.log(JSON.stringify(qdata));

//  console.log(`${filename}`);

//  if (filename == './exampleTutosys.html'||filename == './favicon.ico') {
  if (( q.search.length == 0 )
  &&  (q.pathname == '/sdsfTutosys.html' || q.pathname == '/favicon.ico' || q.pathname == '/sdsfTutosys.css')) {
    fs.readFile('.' + q.pathname, function(err, data) {
      if (err) {
        res.writeHead(404, {'Content-Type': 'text/html'});
        return res.end("404 Not Found");
      };
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      return res.end();
     });
  } else if ((q.pathname == '/sdsfTutosys.html')
         &&  (q.search.length > 0 )
         &&  (acceptedPanels.indexOf(qdata.panel)) > -1) {
    zowecmd = 'zowe zos-tso send address-space "';
    zowecmd = zowecmd + tsosessionid;
    zowecmd = zowecmd + '" --data "ex (panel) \'';
    zowecmd = zowecmd + qdata.panel;
    zowecmd = zowecmd + '\'"';
    processZowe (zowecmd, res);
    } else {
      res.writeHead(400, {'Content-Type': 'text/html'});
      return res.end("400 Invalid Request");
      };
}