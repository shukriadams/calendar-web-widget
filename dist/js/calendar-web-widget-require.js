/* calendar-web-widget | https://github.com/shukriadams/calendar-web-widget | License : GPLv2 */
define('calendar-web-widget', [], function(){

    'use strict';

var Calendar = function(options){

	var
        // element that triggers calendar display. If options host is not defined, calendar is place in div after el.
        el = options.el,
        // optional host element to put calendar in. if not specified, calendar is place after el.
		host = options.host,
        // if true calendar is always displayed and does not float above other dom elements
        inline = options.inline === undefined ? false : options.inline,
        // date value to preselect calendar to.
		value = options.value,
        // callback invoked when calender menu changes.
        onValueChanged = options.onValueChanged,
        // enables footer field with link to today
        showToday = options.showToday === undefined ? true : options.showToday,
        // array of 12 month names starting with January
        months = options.months || ["January","February","March","April","May","June","July","August","September","October","November","December"],
        // array of 7 days, starting with Sunday
        days = options.days || ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
        //
        gotoString = options.goToCurrentDate || "Go To Current date",
        //
        todayString = options.todayString || "Today is",
        // if false, starts on sunday
        startAtMonday = options.startAtMonday === undefined ? true : options.startAtMonday,
        // if true, enables month and year dropdowns in calendar header
        showMonthAndYearPickers  = options.showMonthAndYearPickers === undefined ? false : options.showMonthAndYearPickers,
        // data format of calendar
        format = options.format || 'dd/mm/yyyy';


    // force to false, doesn't work yet
    inline = false;

    var self = this,
	    root = document.createElement("div");

	root.className ='calendar-web-widget';

    if (host){
    	host.appendChild(root);
    } else{
    	el.parentNode.insertBefore(root, el.nextSibling);
	}

	var startAt = startAtMonday ? 1 : 0,			// 0 - sunday ; 1 - monday
	    showWeekNumber = 0,	    // 0 - don't show; 1 - show
	    weekString = "Wk",
    	monthMenu,
        yearMenu,
        monthSelected,
        yearSelected,
        dateSelected,
        omonthSelected,
        oyearSelected,
        odateSelected,
        monthConstructed = false,
        monthMenuShowing = false,
        yearConstructed = false,
        yearMenuShowing = false,
        intervalID1, intervalID2, timeoutID1, timeoutID2, ctlToPlaceValue, ctlNow, dateFormat, nStartingYear,
        bShow = false,
    	selectedDate = null;

    if (value){
        selectedDate = new Date(Date.parse(value.replace(/-/g, '/')));
    } else {
        selectedDate = new Date();
    }

	var	selectedDay	= selectedDate.getDate();
	var	selectedMonth = selectedDate.getMonth();
	var	selectedYear = selectedDate.getYear();

    if (selectedYear.toString().length === 3){
        selectedYear += 1900
    }

    if (startAtMonday)
    {
        // move first (sunday) to end of array
        days.push(days[0]);
        days.splice(0, 1)
    }


    // create markup
    // create outer container
    var markup =
        // start outer container
        "<div class='js-calendar-container calendar-container " + (inline ? "calendar--inline" : "calendar--float") + "'>"+
        // inner row 1 - header
        "<div class='js-calendar-header calendar-header'></div>" +
        // inner row 2 - calendar
        "<div class='js-calendar-content calendar-content'></div>";

    // inner row 3 - today footer
    if (showToday)
        markup += "<div class='js-calendar-footer calendar-footer'></div>";

    // end outer container
    markup += "</div>";
    root.innerHTML = markup;
	var	calendarContainer = find('.js-calendar-container');


    // create contents of header
    // link to previous month
    markup="<div class='js-calendar-prev calendar-header-item calendar-prev'><div class='calendar-left-arrow'></div></div>";

    if (showMonthAndYearPickers){
        // link to month drop-down list
        markup+="<div class='calendar-header-item'><div class='js-calendar-month-container calendar-month-container calender-pointer '><div class='js-spanMonth'></div><div class='js-selectMonth calendar-dropdown-container'></div></div></div>";

        // link to year drop-down list
        markup+="<div class='calendar-header-item'><div class='js-calendar-year-container calendar-year-container calender-pointer'><div class='js-spanYear'></div><div class='js-selectYear calendar-dropdown-container'></div></div></div>";
    } else {
        markup += "<div class='calendar-header-item'><span class='js-spanMonth calender-selected-month'></span><span class='js-spanYear'></span></div>";
    }

    // link to next month
    markup+="<div class='js-calendar-next calendar-header-item calendar-next'><div class='calendar-right-arrow'></div></div>";

    find(".js-calendar-header").innerHTML  =	markup;

    if (showMonthAndYearPickers){
        monthMenu = find(".js-selectMonth");
        yearMenu = find(".js-selectYear");
    }

    if (showToday)
    {
        find(".js-calendar-footer").innerHTML = todayString + " <a title='"+gotoString+"' class='js-focus-today' href='javascript:void(0)'>" + days[(selectedDate.getDay()-startAt==-1)?6:(selectedDate.getDay()-startAt)]+", " + selectedDay + " " + months[selectedMonth].substring(0,3)	+ "	" +	selectedYear	+ "</a>";
    }

    hideCalendar();


    // bind events
    on(document, "keypress", function () {
        if (event.keyCode==27)
        {
            hideCalendar();
        }
    });

    on(document, "click",function(e) {
        // ignore events from launching element
        if (!e.target)e.target = e.srcElement;

        if (e.target == el)
            return;

        if (bShow && !clickedMenu(e.target)){
            hideCalendar();
        }
    });

    var btnFocusToday = find('.js-focus-today');
    if (btnFocusToday){
        on(btnFocusToday, "click", function(){
            monthSelected=selectedMonth;
            yearSelected=selectedYear;
            constructCalendar();
        });
    }

    if (showMonthAndYearPickers){
        on(find('.js-calendar-year-container'), "click", function(){
            if (yearMenuShowing){
                hideYearMenu();
            } else {
                showYearMenu();
            }
        });
        on(find('.js-calendar-month-container'), "click", function(){
            if (monthMenuShowing){
                hideMonthMenu();
            } else {
                showMonthMenu();
            }
        });
    }

    var btnDecMonth = find('.js-calendar-prev');
    on(btnDecMonth, "click", decMonth);
    on(btnDecMonth, "mouseout", function(){
        clearInterval(intervalID1);
    });
    on(btnDecMonth, "mousedown" ,function(){
        clearTimeout(timeoutID1);
        timeoutID1=setTimeout(startDecMonth,500);
    });
    on(btnDecMonth, "mouseup", function(){
        clearTimeout(timeoutID1);
        clearInterval(intervalID1);
    });


    var btnIncMonth = find('.js-calendar-next');
    on(btnIncMonth, "click", incMonth);
    on(btnIncMonth, "mouseout", function(){
        clearInterval(intervalID1);
    });
    on(btnIncMonth, "mousedown", function(){
        clearTimeout(timeoutID1);
        timeoutID1=setTimeout(StartIncMonth,500);
    });
    on(btnIncMonth, "mouseup", function(){
        clearTimeout(timeoutID1);
        clearInterval(intervalID1);
    });

    on(el, "click", function(){
        openCalendar(el,el,format);
    });

	function hideCalendar()	{
        if (!inline){
            calendarContainer.classList.add('calendar--hidden');
        }
        hideMonthMenu();
        hideYearMenu();
        bShow = false;

	}

	function padZero(num) {
		return (num	< 10)? '0' + num : num ;
	}

	function constructDate(d,m,y)
	{
		var sTmp = dateFormat;
		sTmp = sTmp.replace	("dd","<e>");
		sTmp = sTmp.replace	("d","<d>");
		sTmp = sTmp.replace	("<e>",padZero(d));
		sTmp = sTmp.replace	("<d>",d);
		sTmp = sTmp.replace	("mmm","<o>");
		sTmp = sTmp.replace	("mm","<n>");
		sTmp = sTmp.replace	("m","<m>");
		sTmp = sTmp.replace	("<m>",m+1);
		sTmp = sTmp.replace	("<n>",padZero(m+1));
		sTmp = sTmp.replace	("<o>",months[m]);
		return sTmp.replace ("yyyy",y)
	}

	function closeCalendar() {
		hideCalendar();
        var selectedDate = constructDate(dateSelected,monthSelected,yearSelected),
            existingValue = ctlToPlaceValue.getAttribute('data-value');

        if (existingValue == selectedDate)
            return;

        ctlToPlaceValue.setAttribute('data-value', selectedDate);

        if (ctlToPlaceValue.hasAttribute('value'))
            ctlToPlaceValue.value =selectedDate	;
        else
            ctlToPlaceValue.innerHTML = selectedDate;

        if (onValueChanged)
            onValueChanged(self, { date : selectedDate});

	}

	/*** Month Pulldown	***/
	function startDecMonth()
	{
		intervalID1=setInterval("decMonth()",80);
	}

	function StartIncMonth()
	{
		intervalID1=setInterval("incMonth()",80);
	}

	function incMonth () {
		monthSelected++;
		if (monthSelected>11) {
			monthSelected=0;
			yearSelected++
		}
		constructCalendar();
	}

	function decMonth () {
		monthSelected--;
		if (monthSelected<0) {
			monthSelected=11;
			yearSelected--
		}
		constructCalendar();
	}

	function constructMonth() {
        hideYearMenu();
		if (!monthConstructed) {
			var markup = '';
			for	(var i=0; i<12;	i++) {
				var sName =	months[i];
				if (i==monthSelected){
					sName =	"<B>" +	sName +	"</B>";
				}
                markup += "<tr><td class='js-month month calendar-dropdown-item' data-month='" + i + "' id='m" + i + "' style='cursor:pointer'>&nbsp;" + sName + "&nbsp;</td></tr>";
			}

            find(".js-selectMonth").innerHTML = "<table class='js-month-table calendar-dropdown calendar-dropdown-month' cellspacing=0>" + markup +	"</table>";

            var mnths = find('.js-month');
            for (var j = 0 ; j < mnths.length ; j ++){
                var month = mnths[j];
                on(month, "click", handleMonthSelect);
            }
            var monthTable = find('.js-month-table');
            on(monthTable, "mouseover", function(){
                clearTimeout(timeoutID1);
            });
            on(monthTable, "mouseout", function(){
                clearTimeout(timeoutID1);
                timeoutID1=setTimeout(hideMonthMenu,100);
                event.cancelBubble=true;
            });

			monthConstructed=true;
		}
	}

    function handleMonthSelect(e){
        if (!e.target)
            e.target = e.srcElement;

        monthSelected = parseInt(e.target.getAttribute('data-month'));
        constructCalendar();
        hideMonthMenu();
        e.cancelBubble=true;
    }

	function showMonthMenu() {
		constructMonth();
        if(monthMenu){
            monthMenu.classList.remove('calendar--hidden');
        }
	}

	function hideMonthMenu()	{
        if(monthMenu){
            monthMenu.classList.add('calendar--hidden');
        }

        monthMenuShowing = false;
	}

	function incYear() {
		for	(var i=0; i<7; i++){
			var txtYear,
				newYear	= (i+nStartingYear) + 1;

			if (newYear==yearSelected)
			{ 
				txtYear = "&nbsp;<B>" + newYear + "</B>&nbsp;" 
			} else { 
				txtYear = "&nbsp;" + newYear + "&nbsp;";
			}
            find(".js-y"+i).innerHTML = txtYear
		}
		nStartingYear ++;
	}

	function decYear() {
		for	(var i=0; i<7; i++){
			var txtYear,
				newYear	= (i+nStartingYear) - 1;

			if (newYear == yearSelected)
			{ 
				txtYear = "&nbsp;<B>" + newYear + "</B>&nbsp;";
			} else { 
				txtYear = "&nbsp;" + newYear + "&nbsp;"
			}
            find(".js-y"+i).innerHTML = txtYear
		}
		nStartingYear --;
	}

	function selectYear(nYear) {
		yearSelected=parseInt(nYear+nStartingYear);
		constructCalendar();
        hideYearMenu();
	}

	function buildYearMenu() {
        hideMonthMenu();

		if (yearConstructed)
            return;

        var html = "<tr><td align='center' class='js-year-dec calendar-dropdown-item' style='cursor:pointer'>-</td></tr>";

        var j =	0;
        nStartingYear =	yearSelected-3;
        for	(var i=(yearSelected-3) ; i<=(yearSelected+3); i++) {
            var sName =	i;
            if (i == yearSelected){
                sName =	"<b>" +	sName +	"</b>";
            }

            html += "<tr><td data-year='" + j + "' class='js-y" + j + " js-year calendar-dropdown-item' style='cursor:pointer'>&nbsp;" + sName + "&nbsp;</td></tr>";
            j ++;
        }

        html += "<tr><td align='center' class='js-year-inc calendar-dropdown-item' style='cursor:pointer'>+</td></tr>";

        find('.js-selectYear').innerHTML = "<table class='calendar-dropdown calendar-dropdown-year js-year-dropdown' cellspacing=0>"	+ html	+ "</table>";

        var years = find('.js-year');
        for (var i = 0 ; i < years.length ; i ++){
            on(years[i], 'click', handleYearClick);
        }
        yearConstructed	= true;

        var  btnYearInc = find('.js-year-inc'),
            btnYearDropdown = find('.js-year-dropdown'),
            btnYearDec = find('.js-year-dec');

        on(btnYearDropdown, 'mouseover', function(){
            clearTimeout(timeoutID2);
        });
        on(btnYearDropdown, 'mouseout', function(){
            clearTimeout(timeoutID2);
            timeoutID2=setTimeout(hideYearMenu,100);
        });

        on(btnYearInc, 'mouseout', function(){
            clearInterval(intervalID2);
        });
        on(btnYearInc, 'mouseup', function(){
            clearInterval(intervalID2);
        });
        on(btnYearInc, 'mousedown', function(){
            clearInterval(intervalID2);
            intervalID2=setInterval(incYear,30);
        });

        on(btnYearDec, 'mouseout', function(){
            clearInterval(intervalID1);
        });
        on(btnYearDec, 'mouseup', function(){
            clearInterval(intervalID1);
        });
        on(btnYearDec, 'mousedown', function(){
            clearInterval(intervalID1);
            intervalID1=setInterval(decYear,30);
        });

	}

    function handleYearClick(e){
        if (!e.target)e.target = e.srcElement;

        var year = e.target.getAttribute('data-year');
        year = parseInt(year);
        selectYear(year);
        event.cancelBubble=true;
    }

	function hideYearMenu() {
		clearInterval(intervalID1);
		clearTimeout(timeoutID1);
		clearInterval(intervalID2);
		clearTimeout(timeoutID2);
        if(yearMenu){
            yearMenu.classList.add('calendar--hidden');
        }
        yearMenuShowing = false;
	}

	function showYearMenu() {
        buildYearMenu();
        if(yearMenu){
            yearMenu.classList.remove('calendar--hidden');
        }
	}

   function WeekNbr(n) {
      // Algorithm used:
      // From Klaus Tondering's Calendar document (The Authority/Guru)
      // hhtp://www.tondering.dk/claus/calendar.html
      // a = (14-month) / 12
      // y = year + 4800 - a
      // m = month + 12a - 3
      // J = day + (153m + 2) / 5 + 365y + y / 4 - y / 100 + y / 400 - 32045
      // d4 = (J + 31741 - (J mod 7)) mod 146097 mod 36524 mod 1461
      // L = d4 / 1460
      // d1 = ((d4 - L) mod 365) + L
      // WeekNumber = d1 / 7 + 1
 
      var year = n.getFullYear();
      var month = n.getMonth() + 1;
      var day;

      if (!startAtMonday) {
         day = n.getDate() + 1;
      }
      else {
         day = n.getDate();
      }

        var a = Math.floor((14-month) / 12);
        var y = year + 4800 - a;
        var  m = month + 12 * a - 3;
        var b = Math.floor(y/4) - Math.floor(y/100) + Math.floor(y/400);
        var J = day + Math.floor((153 * m + 2) / 5) + 365 * y + b - 32045;
        var d4 = (((J + 31741 - (J % 7)) % 146097) % 36524) % 1461;
        var L = Math.floor(d4 / 1460);
        var d1 = ((d4 - L) % 365) + L;
        var week = Math.floor(d1/7) + 1;

      return week;
   }

    // builds actual calendar (days)
	function constructCalendar () {
		var aNumDays = Array (31,0,31,30,31,30,31,31,30,31,30,31),
			numDaysInMonth,
			dayPointer,
			startDate =	new	Date (yearSelected,monthSelected,1),
			endDate;

		if (monthSelected==1)
		{
			endDate	= new Date (yearSelected,monthSelected+1,1);
			endDate	= new Date (endDate	- (24*60*60*1000));
			numDaysInMonth = endDate.getDate()
		}
		else
		{
			numDaysInMonth = aNumDays[monthSelected];
		}

		dayPointer = startDate.getDay() - startAt;
		
		if (dayPointer<0)
		{
			dayPointer = 6;
		}

		var markup = "<table class='calendar-calendar' border=0><tr>";

		if (showWeekNumber==1)
		{
            markup += "<td width=27><b>" + weekString + "</b></td><td width=1 rowspan=7 bgcolor='#d0d0d0' style='padding:0px'></td>"
		}

		for	(var i=0; i<7; i++)	{
            markup += "<td width='27' align='right'><B>"+ days[i]+"</B></td>";
		}
        markup +="</tr><tr>";
		
		if (showWeekNumber==1)
		{
            markup += "<td align=right>" + WeekNbr(startDate) + "&nbsp;</td>";
		}

		for	( var i=1; i<=dayPointer;i++ )
		{
            markup += "<td>&nbsp;</td>";
		}
	
		for	( var datePointer=1; datePointer<=numDaysInMonth; datePointer++ )
		{
			dayPointer++;
            markup += "<td align=right>";
			var sStyle='';
			if ((datePointer == odateSelected) && (monthSelected == omonthSelected)	&& (yearSelected == oyearSelected))
			{ 
				sStyle+= " calendar-bordered ";
			}

			var sHint = '';

			var regexp= /\"/g;
			sHint = sHint.replace(regexp,"&quot;");

			if ((datePointer==selectedDay)&&(monthSelected==selectedMonth)&&(yearSelected==selectedYear))
			{
                markup += "<b><a title=\"" + sHint + "\" class='"+sStyle+" calendar-day calendar-today' href='javascript:void(0)'><font class='js-day' data-day='" + datePointer +"'>&nbsp;" + datePointer + "</font>&nbsp;</a></b>";
			}
			else if	(dayPointer % 7 == (startAt * -1)+1)
			{
                markup += "<a title=\"" + sHint + "\" class='"+sStyle+" calendar-day calendar-sunday' href='javascript:void(0)'>&nbsp;<font class='js-day' data-day='" + datePointer +"'>" + datePointer + "</font>&nbsp;</a>";
			}
			else
			{
                markup += "<a title=\"" + sHint + "\" class='"+sStyle+" calendar-day' href='javascript:void(0)'>&nbsp;<font class='js-day' data-day='" + datePointer +"' >" + datePointer + "&nbsp;</a>" ;
			}

			if ((dayPointer+startAt) % 7 == startAt)
			{
                markup += "</tr><tr>";
				if ((showWeekNumber == 1)&&(datePointer<numDaysInMonth))
				{
                    markup += "<td align=right>" + (WeekNbr(new Date(yearSelected,monthSelected,datePointer+1))) + "&nbsp;</td>";
				}
			}
		}

        find(".js-calendar-content").innerHTML = markup;

        if (showMonthAndYearPickers){
            find(".js-spanMonth").innerHTML = "<div class='calendar-down-arrow'></div>" + months[monthSelected] ;
            find(".js-spanYear").innerHTML = "<div class='calendar-down-arrow'></div>" + yearSelected;
        } else {
            find(".js-spanMonth").innerHTML = months[monthSelected] ;
            find(".js-spanYear").innerHTML = yearSelected;
        }

		var	dys = find('.js-day');
		for (var i = 0; i < dys.length ; i ++){
            on(dys[i], "click", handleDaySelect);
		}
	}

    // called when a day in calendar is clicked
	function handleDaySelect(e){
        if (!e.target)
            e.target = e.srcElement;

		dateSelected = e.target.getAttribute('data-day');
		closeCalendar();
	}

    // returns true if calendar is visible
    function isVisible(){
        return !calendarContainer.classList.contains('calendar--hidden');

    }

	function openCalendar(ctl,	ctl2, format) {

        if (! isVisible() ) {
            ctlToPlaceValue	= ctl2;
            dateFormat=format;

            var formatChar = ' ',
                aFormat	= dateFormat.split(formatChar);

            if (aFormat.length<3)
            {
                formatChar = "/";
                aFormat	= dateFormat.split(formatChar);
                if (aFormat.length<3)
                {
                    formatChar = ".";
                    aFormat	= dateFormat.split(formatChar);
                    if (aFormat.length<3)
                    {
                        formatChar = "-";
                        aFormat	= dateFormat.split(formatChar);
                        if (aFormat.length<3)
                        {
                            // invalid date	format
                            formatChar="";
                        }
                    }
                }
            }

            var tokensChanged =	0;

            if ( formatChar	!= "" )
            {
                var aData  = '';

                // use user's date
                if (ctl2.value)
                    aData =	ctl2.value.split(formatChar);
                else
                    aData =	ctl2.innerHTML.split(formatChar);

                for	(var i=0;i<3;i++)
                {
                    if ((aFormat[i]=="d") || (aFormat[i]=="dd"))
                    {
                        dateSelected = parseInt(aData[i], 10);
                        tokensChanged ++
                    }
                    else if	((aFormat[i]=="m") || (aFormat[i]=="mm"))
                    {
                        monthSelected =	parseInt(aData[i], 10) - 1;
                        tokensChanged ++
                    }
                    else if	(aFormat[i]=="yyyy")
                    {
                        yearSelected = parseInt(aData[i], 10);
                        tokensChanged ++
                    }
                    else if	(aFormat[i]=="mmm")
                    {
                        for	(var j=0; j<12;	j++)
                        {
                            if (aData[i] == months[j])
                            {
                                monthSelected=j;
                                tokensChanged ++
                            }
                        }
                    }
                }
            }

            if ((tokensChanged!=3)||isNaN(dateSelected)||isNaN(monthSelected)||isNaN(yearSelected))
            {
                dateSelected = selectedDay;
                monthSelected =	selectedMonth;
                yearSelected = selectedYear
            }

            odateSelected=dateSelected;
            omonthSelected=monthSelected;
            oyearSelected=yearSelected;

            var aTag = ctl;

            do {
                aTag = aTag.offsetParent;
            } while(aTag.tagName!="BODY");

            constructCalendar (1, monthSelected, yearSelected);
            calendarContainer.classList.remove('calendar--hidden');

            bShow = true;
        }
        else
        {
            hideCalendar();
        }
        ctlNow = ctl

	}

    function clickedMenu(element){
        while (true){
            if (!element.parentElement)
                return false;
            if (element.parentElement == root)
                return true;
            element = element.parentElement;
        }
    }

    function on(el, eventName, func){
        if (el.addEventListener){
            el.addEventListener(eventName, func, true);
        } else if (el.attachEvent){
            el.attachEvent("on" + eventName, func);
        }
    }

    // handy selector - returns null, single element or array of elements
    function find(selector, context){
        if (context=== undefined)
            context = root;
        var results = context.querySelectorAll(selector);
        if (results.length === 0)
            return null;
        if (results.length === 1)
            return results[0];

        return results;
    }

};

    return Calendar;
});