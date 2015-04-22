
function arrayEquals (a, b) {
  return !(a < b || a > b);
}

function addListener (callbacksArray, callback) {
  if (typeof callback != "function") {
    throw new Error("Expected callback function as parameter.");
  }

  // Check that this callbacks has not yet been registered:
  for (var i = 0; i < callbacksArray.length; i++) {
    var cb = callbacksArray[i];
    if (cb == callback) {
      return;
    }
  }

  callbacksArray.push(callback);
}

function callListeners (callbacksArray, params) {
  for (var i = 0; i < callbacksArray.length; i++) {
    var cb = callbacksArray[i];
    cb.apply(null, params);
  }
}


module.exports = {
  arrayEquals: arrayEquals,
  addListener: addListener,
  callListeners: callListeners
};
