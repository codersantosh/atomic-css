const path = require('path');
const rtlcss = require('rtlcss');
const { RawSource } = require('webpack').sources;

class RtlCssPlugin {
	apply(compiler) {
		compiler.hooks.compilation.tap('RtlCssPlugin', (compilation) => {
			compilation.hooks.processAssets.tapAsync(
				{
					name: 'RtlCssPlugin',
					stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
				},
				(assets, callback) => {
					const chunks = Array.from(compilation.chunks);
					chunks.forEach((chunk) => {
						// Process each emitted CSS file, skipping already-generated RTL variants.
						const files = Array.from(chunk.files).filter(
							(f) => path.extname(f) === '.css' && !f.endsWith('-rtl.css')
						);
						files.forEach((filename) => {
							const src = compilation.assets[filename].source();
							const dst = rtlcss.process(src);
							// Derive the RTL name from the source filename:
							//   atomic.css      -> atomic-rtl.css
							//   atomic.min.css  -> atomic.min-rtl.css
							const dstFileName = filename.replace(/\.css$/, '-rtl.css');
							compilation.emitAsset(dstFileName, new RawSource(dst));
							chunk.files.add(dstFileName);
						});
					});
					callback();
				}
			);
		});
	}
}

module.exports = RtlCssPlugin;