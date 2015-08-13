'use strict';

self.onmessage = function (e) {
	eval(e.data); //eslint-disable-line no-eval
};