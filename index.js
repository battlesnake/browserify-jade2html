'use strict';

const _ = require('lodash');
const through = require('through');
const jade = require('jade');
const fs = require('fs');

const defOpts = {
	extensions: ['jade'],
	vars: {},
	debug: false
};

module.exports = (filename, options) => {
	options = _.defaults({}, options, defOpts);

	let vars = options.vars || {};
	if (typeof vars === 'string') {
		if (!/^(\/|\.\.?\/)/.test(vars)) {
			vars = './' + vars;
		}
		try {
			vars = require(vars);
		} catch (e) {
			console.error('Variables object was specified as a string, so we tried to load the variables via require() but it failed');
			throw e;
		}
	}

	const ext = (/\.([^\.]*)$/.match(filename) || [null, ''])[1];

	if (options.extensions.indexOf(ext) === -1) {
		return through();
	}

	const data = [];
	return through(
		(chunk) => { data.push(chunk); },
		function () {
			try {
				const gen = jade.compile(data.join(''), { filename, compileDebug: options.debug, pretty: options.debug });
				const html = gen(vars);
				this.queue(html);
				this.queue(null);
			} catch (e) {
				this.emit('error', e);
				return;
			}
		});
};
