# tutosys-sdsf-infoserver
Example browser-UI to z/OS sdsf using local Node.js http, Zowe CLI and remote z/OSMF-TSO-REXX-SDSF.

Prerequisites:
Local:
  zowe-cli (see https://zowe.org)
Remote:
  Mainframe z/OS + z/OSMF TSO Rest interface active

This example consists of three parts:

1) Browser page 'sdsfTutosys.html' using bootstrap 4, jQuery and  datatables (https://github.com/DataTables/DataTables)
2) Local node http server 'sdsfTutosysserver.js'
  - Serves the startup html 'sdsfTutosys.html' file + eventual 'favicon.ico' file + eventual sdsfTutosys.css file
  - Translates requests from the browser page to zowe cli commands and executes them as 'child_process'
  - Response with zowe-cli stdout
3) Access to IBM's zowe tutorial system
