# tutosys-sdsf-infoserver
Example browser-UI to z/OS sdsf using local Node.js http, Zowe CLI and remote z/OSMF-TSO-REXX-SDSF.

Prerequisites:
Local:
  zowe-cli (see https://zowe.org) daemon version https://medium.com/zowe/zowe-cli-daemon-mode-29c0dc29c22f
Remote:
  Mainframe z/OS + z/OSMF TSO Rest interface active

This example consists of following parts:

1) Browser page 'sdsfTutosys.html' using bootstrap 4, jQuery and  datatables (https://github.com/DataTables/DataTables)
2) Local node http server 'sdsfTutosysserver.js'
  - Serves the html 'sdsfTutosys.html' file + eventual 'favicon.ico' file + eventual sdsfTutosys.css file
  - Translates requests from the browser page to zowe cli commands and executes them as 'child_process' nd creates response from zowe-cli stdout
3) Access to IBM's zowe tutorial system with rexx member 'panelsrv' in pds 'z40275.clist(panelsrv)'.

.sh files contain start command