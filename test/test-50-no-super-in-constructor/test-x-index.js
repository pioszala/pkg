#!/usr/bin/env node

"use strict";

var events = require("events");
var util = require("util");

class UpnpService {
  constructor() {
    console.log("ok");
    events.EventEmitter.call(this);
  }
}

util.inherits(UpnpService, events.EventEmitter);

new UpnpService();