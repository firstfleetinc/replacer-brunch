## @firstfleet/replacer-brunch
Ruthlessly simple string replacement plugin to [Brunch](http://brunch.io).

This is a fork of [replacer-brunch](https://github.com/firstfleetinc/replacer-brunch). There have been some
modifications, they are as follows.

### Public url rewriting for .html files
This fork also supports key rewriting in .html files from the assets directory. This is so when you build your front-end application for production, you can overwrite the base url in the index.html file if your app does not live at the root of the domain. See the public url rewrite section below.

### Global replace
By default, the replace method will now replace the defined key in the entire file, rather than just replacing the first instance. This was achieved by replacing the default replace definition of

```js
    if (!this.config.replace) {
      this.config.replace = (str, key, value) => str.replace(key, value);
    }
```

With

```js
    // Set default replace method
    if (!this.config.replace) {
      this.config.replace = (str, key, value) => {
        const reg = new RegExp(key, "g");

        return str.replace(reg, value);
      };
    }
```

### Pattern Overrirde
You can now change the file patterns this plugin will process, and the default file pattern has been updated.
The previous file pattern was

```js
BrunchReplacer.prototype.pattern = /\.jsx?$/;
```

and has been updated to

```js
BrunchReplacer.prototype.pattern = /\.(js|svelte|jsx)?$/;
```

You can also overwrite the pattern in the configuration.

```js
replacer: {
        pattern: /\.jsx?$/, // Here you can specify the the pattern
        dict: [
            // Replace pubnub pub key in js files
            {
                key: "__PUBLICURL__",
            },
            {
                key: "__SUBROUTE__",
            },
        ],
    },
```

## Configuration

```js
replacer: {
  // dict is an array containing objects with key and value property.
  // String replacements are processed in order from first to last.
  dict: [
    {
      // key will be replaced by value.
      key: '__KEY__',
      value: '__VALUE__'
    },
    {
      // You can use anything as value.
      // Non-string values will be passed through JSON.stringify().
      key: '__PACKAGE__',
      value: require('./package.json')
    },
    {
      // By default replacer uses String.replace(), so only the first
      // occurrence will be replaced if you use a string as key.
      // You can use a global regex to replace all occurrences.
      key: /__ENV__/g,
      value: process.env.NODE_ENV
    },
    {
      // Use cases: getting NODE_ENV, package.json values,
      // custom configuration JSON, generate random string, etc.
      key: /{#VERSION}/g,
      value: 'v1.0.0'
    },
    {
      key: 'remove_me'
      // If value is omitted, the replacement is the empty string
    }
  ],
  // By default replacer uses String.replace() function.
  // If you want to use a different function, you can supply
  // your own replacement function here with this signature:
  //  - str (string) - string to be processed
  //  - key (any) - key from the dict
  //  - value (string) - replacement value
  //  - path (string) - the path of the file being processed
  replace: (str, key, value, path) => str.split(key).join(value)
}
```

For example, to replace `__filename` with the name of the file being
processed, you can use:

```js
replacer: {
  dict: [
    {
      key: /\b__filename\b/,
      // No value needed - the custom replacer below supplies it
    }
  ],
  replace: (str, key, value, path) => {
    return str.split(key).join(`'${path}'`);
  }
}
```

## Public URL Rewrite for index.html

This is needed if you want to be able to run your dev server locally with `brunch watch --server`, and
you also need to be able to ship your app to a domain that is not the root directory of the website. So,
say your app will be deployed to `https://mywebsite.com/apps/appname`. Currently, if you `brunch build --production` and copy and paste your files over to the server, without making changes to the server your app won't be able to fetch your files. This is cause your files don't live at `/` which you need them to be when running your dev server, they live at `https://mywebsite.com/apps/appname`. To rewrite your public url for production, add this to your brunch config under `module.exports.plugins`.

```js
// replace keys in js files with values in the .env file
    replacer: {
        dict: [
            // Replace pubnub pub key in js files
            {
                key: "__PUBLICURL__",
            },
        ],
    },
```

This will remove the `__PUBLICURL__` when running `brunch watch --server`

Then, add an override for production build.

```js
module.exports.overrides = {
    production: {
        plugins: {
            // replace keys in js files with values in the .env file
            replacer: {
                dict: [
                    // Replace pubnub pub key in js files
                    {
                        key: "__PUBLICURL__",
                        value: "https://mywebite.com/apps/appname",
                    },
                ],
            },
        },
    },
};
```

This will overwrite your key `__PUBLICURL__` when you bulid for production `brunch build --production`.

Lastly, add your key `__PUBLICURL__` to your index.html file under the assets folder.

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
	<meta charset='utf-8'>
	<meta name='viewport' content='width=device-width,initial-scale=1'>

	<title>Admin Dashboard</title>

    <link rel='icon' type='image/png' href='__PUBLICURL__/icons/favicon.png'>
    <link rel="stylesheet" href="__PUBLICURL__/app.css" />
    <script defer src="__PUBLICURL__/app.js"></script>
</head>

<body>
</body>
</html>
```

Now, when you run your development server, everything will work just as before, and when you build for production, your public url will be correctly prefexed to your index.html file.

## Installation

Install the plugin via npm with `npm install --save-dev @firstfleet/replacer-brunch`.

## License

Licensed under [MIT License](https://github.com/tkesgar/replacer-brunch/blob/master/LICENSE).

## Contributors

* [Ted Kesgar](https://github.com/tkesgar)
* [Chris White](https://github.com/cxw42)
* [Jess Patton](https://github.com/Jesspu)
