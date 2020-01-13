Contribution Guide
===

# Project Overview

TODO

# Development setup

In both Chrome & Firefox, you can edit the .js directly in the plugin's editor, but it's not really handy, esp. regarding source control.

## With Firefox + GreaseMonkey

We recommand using Firefox, because with GreaseMonkey the scripts are stored directly on the file system, whereas with Tampermonkey (Chrome), the files are stored in a binary that is not easily accessible.

### Files location

The GM files are located under the user's directory (%appdata% in Windows, /home/\<user> on Linux), somewhere like :

> /home/\<user>/.mozilla/firefox/mg2d2veg.default-1456933402886/gm_scripts/Better_Dynamo_Administration

### Gulp watch

Once you know where the files are, it's a simple matter of updating the files from your workspace. A gulp script is provided, with a watch task.

It requires gulp
> npm install -g gulp

And in your BDA workspace
> npm install\
> cp .env.json.sample .env.json

Edit .env.json to set the greasemonkey folder

Run with:
> gulp watch

It will watch your workspace and update the GM folder. Simply refresh your browser to see the changes.

## Troubleshooting

If you reinstall the script from the browser, the folder might change, so check that if your changes are not reflected

### New files
If new files are added to the project, the userscript must be reinstalled from the browser for the new files to be taken into account.

