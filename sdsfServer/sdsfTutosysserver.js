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
  exec('zowex zos-tso start address-space --zosmf-profile "tutosys" --sko', (err, stdout, stderr) => {
    if (err) {
      console.log('Error start Tso session');
    };
    if (stdout) {
      tsosessionid = stdout.substr(0,stdout.length-1);
      console.log('Tso sessionid : ' + tsosessionid);
      var secondfunc = 'zowex zos-tso send address-space "';
      secondfunc = secondfunc + tsosessionid+'"';
      secondfunc = secondfunc + ' --data "\\"ex (PANELSRV)\\""';
      console.log (`zowecmd: ${secondfunc}`);
      exec(secondfunc, {maxBuffer : 1024 * 1024} , (seconderr, secondstdout, secondstderr) => {
        if (seconderr) {
          console.log('zowex error func 2'+secondstderr);
        };
        if (secondstdout) {
          if (secondstdout.indexOf("PANELSRV started")>-1) {
            console.log('PANELSRV started');
            tsopinginterval = setInterval(function(){
                                pingTsosession ();
                              }, interval);
          };
        };
      });
    };
    if (stderr) {
      console.log(stderr);
    }
  });
};

function pingTsosession () {
    zowecmd = 'zowex zos-tso ping address-space "';
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

function processZowe (zowecmd, func, res) {
  console.log (`zowecmd: ${zowecmd}`);
  exec(zowecmd, {maxBuffer : 1024 * 1024} , (err, stdout, stderr) => {
    if (err) {
      console.log('zowex error');
    };
    if (stdout) {
      console.log(stdout);
      if (stdout.indexOf("SDSF output created!")>-1) {
        var secondfunc = "zowex zos-files download data-set ";
        secondfunc = secondfunc+'"Z40275.SDSFSERV.OUTPUT.PDSE('+func+')"';
        console.log (`zowecmd: ${secondfunc}`);
        exec(secondfunc, {maxBuffer : 1024 * 1024} , (seconderr, secondstdout, secondstderr) => {
          if (seconderr) {
            console.log('zowex error func 2'+secondstderr);
          };
          if (secondstdout) {
            if (secondstdout.indexOf("Data set downloaded successfully")>-1) {
              console.log('zowex download done '+func);
              var filename = "z40275/sdsfserv/output/pdse/"+func.toLowerCase()+".txt"
              fs.readFile('./' + filename, function(err, data) {
                if (err) {
                  res.writeHead(404, {'Content-Type': 'text/html'});
                  return res.end("404 Not Found");
                };
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(data);
                return res.end();
               })
            }
          }
        })
      }
      else {
        console.log(stderr);
      };
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
  var qdata = q.query;
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
    zowecmd = 'zowex zos-tso send address-space "';
    zowecmd = zowecmd + tsosessionid+'"';
    zowecmd = zowecmd + ' --data "' + qdata.panel + '"';
    processZowe (zowecmd, qdata.panel, res);
    } else {
      res.writeHead(400, {'Content-Type': 'text/html'});
      return res.end("400 Invalid Request");
      };
}