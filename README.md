Better Dynamo Administration
===

Better Dynamo Administration (BDA) is a user script that improves ATG Dynamo Administration experience. It takes 3 minutes to install and will help you to save plenty of time.

Installation
---

### Firefox

 * Install Grease Monkey extension : https://addons.mozilla.org/fr/firefox/addon/greasemonkey/
 * Go to this url : https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
 * Accept installation 
 * Enjoy :)
 
If you're not happy with BDA behaviour, you can simply disable it by clicking on the monkey head of Greasemonkey.

### Google Chrome

* Install Tampermonkey extension : https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
* Go to this url : https://raw.githubusercontent.com/jc7447/bda/master/bda.user.js
* Accept installation 
* Enjoy :)

Change logs
------

### 2.1 - 26/02/17

* [#46](../../issues/46) [Repository] New option to render items as tree
* [#84](../../issues/84) [Repository] Result tables show default repository values (thanks to @onewingedfallen59)
* [#106](../../issues/106) [Repository] Option to not reload immediately when loading a sub-item (thanks to @troussej)
* [#104](../../issues/104) [Repository] Auto-complete GSA tags in the query editor (thanks to @troussej)
* [#103](../../issues/103) [Dash] Auto-complete GSA tags (thanks to @troussej)
* [#103](../../issues/103) [Dash] Auto-save editor state (thanks to @troussej)

### 2.0 - 18/09/16

BDA 2.0 is finally out ! It comes with a lot of new features and also a huge technical refactor.

* [#72](../../issues/72) Introducing DASH : the dyn admin shell (thanks to [@troussej](https://github.com/troussej))
* [#48](../../issues/48) Result table are editable in repositories pages (thanks to  [@onewingedfallen59](https://github.com/onewingedfallen59))
* [#92](../../issues/92) Repository definition can be displayed as tab (thanks to [@troussej](https://github.com/troussej))
* [#96](../../issues/89) New tabs for saved queries and properties in repository pages
* [#42](../../issues/42) Cache stat table has been improved to be more readable (thanks to  [@troussej](https://github.com/troussej))
* [#93](../../issues/93) New timeline mode for the sheduler page (thanks to [@troussej](https://github.com/troussej))
* [#86](../../issues/86) Autocomplete search of nucleus components (thanks to [@troussej](https://github.com/troussej))

Check the [2.0 milestone](https://github.com/jc7447/BetterDynAdmin/milestone/10) of more details

### 1.17 - 16/05/16
* [#77](../../issues/77) New hashtags system for component in the toolbar. Component can now be filter by tags. (thanks to [@troussej](https://github.com/troussej))
* [#76](../../issues/76) Component search available everywhere (thanks to [@troussej](https://github.com/troussej))

### 1.16 - 25/04/16
* [#67](../../issues/67) New default properties and methods system for the toolbar (thanks to [@troussej](https://github.com/troussej))
* Several bug fix

### 1.15 - 02/04/16
* [#56](../../issues/56) Repository ids are now clickable and loadable in repository pages
* [#51](../../issues/51) New what's new popup (thanks to [@onewingedfallen59](https://github.com/onewingedfallen59))
* Preview of saved queries in repository pages (thanks to [@troussej](https://github.com/troussej))

### 1.14 - 28/02/16
* [#44](../../issues/44) New improvements of pipeline manager pages, graphical representation is better and nodes are clickable
* [#54](../../issues/54) Item tree result can go directly to clipboard
* [#50](../../issues/50) [#59](../../issues/59) Several bug fixes, especially for Chrome

### 1.13 - 14/02/16
* [#44](../../issues/44) Improvement of pipeline manager pages, graphical representation of each pipeline and quick link to XML definition
* [#41](../../issues/41) Add "id-only" checkbox for query-item

### 1.12 - 31/01/16
* New speedbar with quick links for item tree
* Default repository descriptor for some repositories

### 1.11 - 24/01/16
* [#35](../../issues/35) Persitent storage accross all dyn/admin instance
* Huge optimization of item tree. Asynchronous ajax call and request aggregation 

### 1.10 - 11/12/15
* [#16](../../issues/16) Toolbar personalization with new shortcut system

### 1.9 - 04/12/15
* [Pull #29](../../pull/29) Actor chains can be call directly through their component pages

### 1.8 - 15/11/15
* Rework repository toolbar, new 'clear' button and new select input to filter repository descritpor, using [select2.js](https://github.com/select2/select2)
* Queries are not stored by repository
* New icon management system with [font-awsome](https://github.com/FortAwesome/Font-Awesome)

### 1.7 - 04/10/15
* Syntax highlight for properties files
* New output format print-item for item tree
* Fix issues with the toolbar

### 1.6 - 22/03/15

* [#24](/../../issues/24) : JDBC browser : new datasource selector to easily switch datasource
* [#22](/../../issues/22) : Repository page : add ability to output with "repository='...'" in the 'get item tree' tool
* Repository page : new option to show full content of every properties values in HTML result tabs 
* Several bug fix

### 1.5 - 21/12/14

* [#20](/../../issues/20) : Integration of findclass.jhtml : see "Find Class" link beside the class path in component pages (installation instructions of findclass.jhtml below)
* [#21](/../../issues/21) : Toggle position (show more/less...) are stored
* Add syntax highlighting to xml query result
* Faster highlight and indent of XML

### 1.4 - 29/11/14

* [#17](/../../issues/17) : Display execution log on repository page
* [#19](/../../issues/19) : New output format for the item tree tool : add-item, remove-item, HTML tabs
* [#18](/../../issues/18) : Scrollbar is always set in the right place when executing XML tags

### 1.3 - 17/11/14

* New tool for extracting items tree on repository page. 

### 1.2 - 25/09/14

* [#15](/../../issues/15)  : Quick view of descriptor properties in repository tags editor 
* [#14](/../../issues/14)  : New item descriptor table in repository page
* [#12](/../../issues/12)  : Add syntax highlighting to xml definition files (pipelines, messagingManager ...)

### 1.1 - 08/08/14

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
