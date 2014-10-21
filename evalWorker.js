self.onmessage = function(e) {
	self.onmessage = null; // let the new code override us
	eval(e.data);
}
