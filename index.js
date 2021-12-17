"use strict";
const fs = require("fs");

class BrunchReplacer {
  constructor(config) {
      // Grab the config options from brunch.config.plugins.replacer
    this.config = config.plugins.replacer || {};
      
    // Set default dictionary
    if (!this.config.dict) this.config.dict = [];

    // Set default replace method
    if (!this.config.replace) {
      this.config.replace = (str, key, value) => {
        const reg = new RegExp(key, "g");

        return str.replace(reg, value);
      };
    }

    // Allow override of file pattern (defaults to js, svelte, jsx)
    if (this.config.pattern) {
      this.pattern = this.config.pattern;
      delete this.config.pattern;
    }

    // Stringify non-string values.
    for (const entry of this.config.dict) {
      const value = entry.value;
      if (typeof value === "undefined") {
        entry.value = "";
      } else {
        entry.value = typeof value === "string" ? value : JSON.stringify(value);
      }
    }
  }

  // Handle rewritting keys in html assets (index.html)
  onCompile(error, assets) {
      // Grab the dict and replace method
    const dict = this.config.dict;
    const replace = this.config.replace;

    for (let asset of assets) {
      // Make sure its an html file
      if (asset.destinationPath.includes(".html")) {
        let promise = new Promise((resolve, reject) => {
          // Get the html text
          let htmlString = asset.compiled.toString();

          // Replace all the keys
          for (const entry of dict) {
            const key = entry.key;
            const value = entry.value;

            htmlString = replace(htmlString, key, value, asset.destinationPath);
          }

            // Create a buffer from the final html string
          const buffer = Buffer.from(htmlString);

          // Write to file
          try {
            fs.writeFile(asset.destinationPath, buffer, (err) => {
              if (err) reject(err);
              else resolve();
            });
          } catch (error) {
            console.error(error);
          }
        });

          // Resolve promise
        promise.catch((error) => {
          console.error(
            `Key value rewritting for ${asset.destinationPath} failed`
          );
          console.error(error.message);
        });
      }
    }
  }

  compile(file) {
      // Grab the ditc and replace method
    const dict = this.config.dict;
    const replace = this.config.replace;

    // Ignore falsy and files without data.
    if (!file || !file.data) return Promise.resolve(file);

    // Perform replacement.
    for (const entry of dict) {
      const key = entry.key;
      const value = entry.value;

      file.data = replace(file.data, key, value, file.path);
    }

      // Resolve promise
    return Promise.resolve(file);
  }
}

// It is a brunch plugin
BrunchReplacer.prototype.brunchPlugin = true;
// Set the type
BrunchReplacer.prototype.type = "javascript";
// Set the default file pattern, can be overriden in the options by using pattern
BrunchReplacer.prototype.pattern = /\.(js|svelte|jsx)?$/;
// Set default env
BrunchReplacer.prototype.defaultEnv = "*";

module.exports = BrunchReplacer;
