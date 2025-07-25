# Stdio filter

Makes it possible to take control over the output from scripts, and define what
should be shown in the console.

## Installation

```
npm i stdio-filter
```

## Usage

```
echo "hello there" | cf
```

### Files

- `cf-all.txt` <br/> This file will contain all output from the script
  (filtered, or not). Which is handy if the filtered output was relevant.
- `cf-shown.txt` <br/> This file will contain the unfiltered output from the
  script. Which is handy for reviewing the content that can be filtered.

### Configuration

Stdio filter will look for the following configuration in the output folder.

- `cf-ignore-prefix.txt` <br/> The lines in this file will be treated as
  prefixes, that can be removed from the output.
- `cf-ignore.txt` <br/> Contains content that should be filtered, and hence not
  shown. Each line defines a line, that can be filtered.
- `includeJson.js` <br/> This file must export a function, that returns true or
  false for a given object. The object is created by parsing lines that contain
  json data.
- `includeLine.js` <br/> This function receives each line from the output, and
  must return a boolean indicating whether to show the line.

## Tips

### Filter stderr

Stderr is not given to the `cf` command by default. It's just shown in the
console. But it's possible to redirect `stderr` to `stdout`, and then it will be
filtered.

Here is how it's done in `bash`:

```
echo "hello there" 2>&1 | cf
```

## Known issues

- Output folder is hardcoded.

## Related work

- [filter-console](https://www.npmjs.com/package/filter-console)

## License

MIT
