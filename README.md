Calendar-web-widget
===================
A Javascript/CSS calendar.

Features
--------
- No JS dependencies
- No image file dependencies
- Works on modern browsers, and IE8+.
- Css can be built from Sass.
- Pre-wrapped for Requirejs and Browserify, or take the raw version and hook it up whichever way you want.

Use
---
- include dist/css/calendar-web-widget*.css of your choice
- include a dist/js/calendar-web-widget*.js of your choice

    <div id="myCalendar"></div>

    <script>
        new Calendar({
             el : document.getElementById('myCalendar')
        });
    </script>

Options
-------

The Calendar constructor takes an options object which supports the following properties :

- *el :* DOM element to trigger calendar opening - required
- *host :* DOM element calendar should be appended to - optional. If not set, calendar appended after trigger element.
- *format :* data format - optional. Egs, 'dd/mm/yyyy',
- *value :* preselected date - optional. Must be ISO format (yyyy-mm-dd).
- *onValueChanged :* callback when calender value changes. Optional. Returns two objects : calender, { date : selected value }
- *showToday :* Boolean, true if calendar should display footer with info and link about selected date.
- *months :* String array of months, starting with January. Use this to localize calendar.
- *days :* String array of days, starting with Sunday.  Use this to localize calendar.
- *startAtMonday :*  Boolean, true if week starts with Monday. If false, starts at Sunday.
- *showMonthAndYearPickers :* Boolean, true if month and year select menus are enabled.

Dev
---
- Clone
- run "npm install" to set up requirements
- run "grunt" to build /src to /dist

About
-----
Based on original code from https://jscalendar.codeplex.com

Released under GPLv2 to match source project's license.

