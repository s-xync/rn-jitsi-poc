// The library lib-jitsi-meet (externally) depends on the libraries jQuery
((global) => {
  // jQuery
  if (typeof global.$ === "undefined") {
    const jQuery = require("jquery");

    jQuery(global);
    global.$ = jQuery;
  }
})(global || window || this); // eslint-disable-line no-invalid-this

// Re-export JitsiMeetJS from the library lib-jitsi-meet to (the other features
// of) the project jitsi-meet.
import JitsiMeetJS from "lib-jitsi-meet/lib-jitsi-meet.min";
export { JitsiMeetJS as default };
