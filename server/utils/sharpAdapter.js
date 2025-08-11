// Fallback adapter when sharp is unavailable in runtime image.
// Exposes minimal API used in the project to avoid crashes.
const passthrough = () => ({
  resize() { return this; },
  toFormat() { return this; },
  jpeg() { return this; },
  png() { return this; },
  webp() { return this; },
  avif() { return this; },
  toBuffer: async function() { throw new Error('Image processing disabled (sharp not available)'); }
});

module.exports = function(input) {
  // if called like sharp(buffer) just return chainable no-op
  return passthrough();
};