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

        new Calendar({
             el : // element to trigger calendar opening - required
             host : // element calendar rendered in - optional
             format :  // data format - optional. Egs, 'dd/mm/yyyy',
             value : // preselected date - optional. Must be ISO format (yyyy-mm-dd).
             onValueChanged : // callback when calender value changes. Optional. Returns two objects :
                calender, { date : selected value }
        });


Dev
---
- Clone
- run "npm install" to set up requirements
- run "grunt" to build /src to /dist

About
-----
Based on original code from https://jscalendar.codeplex.com

Released under GPLv2 to match source project's license.

