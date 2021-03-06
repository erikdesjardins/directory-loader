import path from 'path';
import test from 'ava';

import loader from '../index';

function runLoader(options) {
	return new Promise((resolve, reject) => {
		loader.pitch.call({
			query: options,
			context: __dirname,
			async: () => (err, result) => err ? reject(err) : resolve(result),
			addContextDependency: () => {},
		});
	});
}

test('invalid path', t => {
	t.throws(runLoader('?path=./notARealPath/'), /ENOENT/);
});

test('adds a context dependency', async t => {
	t.plan(2);

	await new Promise(r => {
		loader.pitch.call({
			query: '?path=./src/',
			context: __dirname,
			async: () => (err, result) => { t.truthy(result); r(); },
			addContextDependency: path => t.is(path, './src/'),
		});
	});
});

const header = '/* generated by contents-loader */';

test('path option - string', async t => {
	t.is(
		await runLoader('?path=./src/'),
		`
${header}
import * as _0 from "./src/a.js";
import * as _1 from "./src/b.js";
import * as _2 from "./src/c.js";
export default { "a.js": _0, "b.js": _1, "c.js": _2 };
		`.trim()
	);
});

test('path option - object', async t => {
	t.is(
		await runLoader({ path: './src/' }),
		`
${header}
import * as _0 from "./src/a.js";
import * as _1 from "./src/b.js";
import * as _2 from "./src/c.js";
export default { "a.js": _0, "b.js": _1, "c.js": _2 };
		`.trim()
	);
});

test('match option - string', async t => {
	t.is(
		await runLoader('?path=./src/&match=\\.txt$'),
		`
${header}
import * as _0 from "./src/test.txt";
export default { "test.txt": _0 };
		`.trim()
	);
});

test('match option - regex', async t => {
	t.is(
		await runLoader({ path: './src/', match: /\.(md|markdown)$/ }),
		`
${header}
import * as _0 from "./src/bar.md";
import * as _1 from "./src/baz.markdown";
import * as _2 from "./src/foo.md";
export default { "bar.md": _0, "baz.markdown": _1, "foo.md": _2 };
		`.trim()
	);
});
