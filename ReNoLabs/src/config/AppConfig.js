// Application Configuration
module.exports = {
  WebServer: { // Web Server configuration
    ip: "0.0.0.0",
    port: 8080,
  },
  Lab: require('./LabConfig'),
  RIP: require('./RIPConfig'),
}
