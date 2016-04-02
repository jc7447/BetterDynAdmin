Better Dynamo Administration
===

Better Dynamo Administration (BDA) is a user script that improves ATG Dynamo Administration experience. It takes 3 minutes to install and will help you to save plenty of time.

Installation
---

### Firefox

 * Install Grease Monkey extension : https://addons.mozilla.org/fr/firefox/addon/greasemonkey/
 * Go to this url : https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
 * Accept installation 
 * Copy ${DYNAMO_ROOT}/home/doc/findclass.jhtml to ${DYNAMO_ROOT}/DAS/admin/atg/dynamo/admin/en/
 * Enjoy :)
 
If you're not happy with BDA behaviour, you can simply disable it by clicking on the monkey head of Greasemonkey.

### Google Chrome

* Install Tampermonkey extension : https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
* Go to this url : https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
* Copy ${DYNAMO_ROOT}/home/doc/findclass.jhtml to ${DYNAMO_ROOT}/DAS/admin/atg/dynamo/admin/en/
* Accept installation 
* Enjoy :)

Change logs
------

### 1.15
* [#56](../../issues/56) Repository ids are now clickable and loadable in repository pages
* [#51](../../issues/51) New what's new popup (thanks to ([@onewingedfallen59](https://github.com/onewingedfallen59))
* Preview of saved queries in repository pages (thanks to ([@troussej](https://github.com/troussej))

### 1.14
* [#44](../../issues/44) New improvements of pipeline manager pages, graphical representation is better and nodes are clickable
* [#54](../../issues/54) Item tree result can go directly to clipboard
* [#50](../../issues/50) [#59](../../issues/59) Several bug fixes, especially for Chrome

### 1.13
* [#44](../../issues/44) Improvement of pipeline manager pages, graphical representation of each pipeline and quick link to XML definition
* [#41](../../issues/41) Add "id-only" checkbox for query-item

### 1.12
* New speedbar with quick links for item tree
* Default repository descriptor for some repositories

### 1.11
* [#35](../../issues/35) Persitent storage accross all dyn/admin instance
* Huge optimization of item tree. Asynchronous ajax call and request aggregation 

### 1.10
* [#16](../../issues/16) Toolbar personalization with new shortcut system

### 1.9
* [Pull #29](../../pull/29) Actor chains can be call directly through their component pages

### 1.8
* Rework repository toolbar, new 'clear' button and new select input to filter repository descritpor, using [select2.js](https://github.com/select2/select2)
* Queries are not stored by repository
* New icon management system with [font-awsome](https://github.com/FortAwesome/Font-Awesome)

### 1.7
* Syntax highlight for properties files
* New output format print-item for item tree
* Fix issues with the toolbar

### 1.6

* [#24](/../../issues/24) : JDBC browser : new datasource selector to easily switch datasource
* [#22](/../../issues/22) : Repository page : add ability to output with "repository='...'" in the 'get item tree' tool
* Repository page : new option to show full content of every properties values in HTML result tabs 
* Several bug fix

### 1.5

* [#20](/../../issues/20) : Integration of findclass.jhtml : see "Find Class" link beside the class path in component pages (installation instructions of findclass.jhtml below)
* [#21](/../../issues/21) : Toggle position (show more/less...) are stored
* Add syntax highlighting to xml query result
* Faster highlight and indent of XML

### 1.4

* [#17](/../../issues/17) : Display execution log on repository page
* [#19](/../../issues/19) : New output format for the item tree tool : add-item, remove-item, HTML tabs
* [#18](/../../issues/18) : Scrollbar is always set in the right place when executing XML tags

### 1.3

* New tool for extracting items tree on repository page. 

### 1.2

* [#15](/../../issues/15)  : Quick view of descriptor properties in repository tags editor 
* [#14](/../../issues/14)  : New item descriptor table in repository page
* [#12](/../../issues/12)  : Add syntax highlighting to xml definition files (pipelines, messagingManager ...)

### 1.1

* [#11](/../../issues/11)  : Syntax coloring in repository definition file page with [highlight.js](https://github.com/isagalaev/highlight.js)
* [#10](/../../issues/10) : Syntax coloring in xml tags editor 
* [#09](/../../issues/09) : Handle multi id in the editor id field 

Main features
------

*Click on images for more details*

* Basic xml tags editor in repositories pages, avoiding you to type your "print-item" request every time. :)

<table>
<tr>
<th>Without BDA </th>
<th>With BDA</th>
</tr>
<tr>
<td>
    <img width="320" src="https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/resources/bda_editor_off.png">
</td>
<td>
    <img width="320" src="https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/resources/bda_editor_on.png">
</td>
</tr>
</table>

* Toolbar to easily navigate through components & your component navigation history

<table>
<tr>
<th>Without BDA </th>
<th>With BDA</th>
</tr>
<tr>
<td>
    <img width="320" src="https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/resources/bda_toolbar_off.png">
</td>
<td>
    <img width="320"  src="https://raw.githubusercontent.com/jc7447/BetterDynAdmin/master/resources/bda_toolbar_on.png">
</td>
</tr>
</table>

* XML syntax highlight for repository definition page and XML tags editor

* Tool for extracting items tree on repository page

* Performance monitor table sortable by column and more handsome

* Backup and restore capabilities of toolbar and editor data

* Lot more inconming, check the milestone !

Contributors
---
 * Jean-Charles Manoury ([@jc7447](https://github.com/jc7447))
 * Benjamin Descamps ([@onewingedfallen59](https://github.com/onewingedfallen59))
 * Joël Trousset ([@troussej](https://github.com/troussej))

Disclaimer
---
This project is completely unofficial and in no way endorsed by Oracle Corporation. Oracle ATG web commerce is a copyrighted product of Oracle Corporation and no rights are contested by this project or it contents.

License
---

Better Dynamo Administration comes with ABSOLUTELY NO WARRANTY; for details see the GNU General Public License.  This is free software, and you are welcome to redistribute it under certain conditions; see the GNU General Public License
for details.
