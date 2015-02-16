'use strict';

var Calender = function(options){

	var el = options.el, // element calender is associated with
		host = options.host,	// optional host element to put calender in. if not specified, calender is place after el.
		format = options.format;


	
	var root = document.createElement("div");
	root.className ='calender';
    if (host){
    	host.appendChild(root);
    }
	else{
    	el.parentNode.insertBefore(root, el.nextSibling);
	}

	var	fixedX = -1;			// x position (-1 if to appear below control)
	var	fixedY = -1;			// y position (-1 if to appear below control)
	var startAt = 1;			// 0 - sunday ; 1 - monday
	var showWeekNumber = 0;	// 0 - don't show; 1 - show
	var showToday = 1;		// 0 - don't show; 1 - show

	var gotoString = "Go To Current Month";
	var todayString = "Today is";
	var weekString = "Wk";

	var	crossobj, crossMonthObj, crossYearObj, monthSelected, yearSelected, dateSelected, omonthSelected, oyearSelected, odateSelected, monthConstructed, yearConstructed, intervalID1, intervalID2, timeoutID1, timeoutID2, ctlToPlaceValue, ctlNow, dateFormat, nStartingYear;

	var	bPageLoaded=false;
	var	ie = document.all;
	var	dom = document.getElementById;

	var	ns4 = document.layers;
	var	selectedDate = null;
    if (options.value){
        //selectedDate = new Date(Date.parse(options.value));
        selectedDate = new Date(Date.parse(options.value.replace(/-/g, '/')));
    } else {
        selectedDate = new	Date();
    }


	var	selectedDay	= selectedDate.getDate();
	var	selectedMonth = selectedDate.getMonth();
	var	selectedYear = selectedDate.getYear();


	var bShow = false;

    /* hides <select> and <applet> objects (for IE only) */
    function hide_Element( elmID, overDiv )
    {
        return;
      if( ie )
      {
        for( var i = 0; i < document.all.tags( elmID ).length; i++ )
        {
          var obj = document.all.tags( elmID )[i];
          if( !obj || !obj.offsetParent )
          {
            continue;
          }
      
          // Find the element's offsetTop and offsetLeft relative to the BODY tag.
            var objLeft   = obj.offsetLeft;
            var objTop    = obj.offsetTop;
            var objParent = obj.offsetParent;
          
          while( objParent.tagName.toUpperCase() != "BODY" )
          {
            objLeft  += objParent.offsetLeft;
            objTop   += objParent.offsetTop;
            objParent = objParent.offsetParent;
          }

            var objHeight = obj.offsetHeight;
            var objWidth = obj.offsetWidth;
      
          if(( overDiv.offsetLeft + overDiv.offsetWidth ) <= objLeft ){}
          else if(( overDiv.offsetTop + overDiv.offsetHeight + 500) <= objTop ){}
          else if( overDiv.offsetTop >= ( objTop + objHeight )){}
          else if( overDiv.offsetLeft >= ( objLeft + objWidth )){}
          else
          {
            obj.style.visibility = "hidden";
          }
        }
      }
    }
     
    /*
    * unhides <select> and <applet> objects (for IE only)
    */
    function show_Element( elmID )
    {
      if( ie )
      {
        for(var i = 0; i < document.all.tags( elmID ).length; i++ )
        {
            var obj = document.all.tags( elmID )[i];
              
          if( !obj || !obj.offsetParent ) continue;
                  
          obj.style.visibility = "";
        }
      }
    }

	var HolidaysCounter = 0;
	var Holidays = [];

	if (dom)
	{
		var markup = "";

		markup += "<div class='js-calender calender-outer'>"+
			"<table cellspacing='0' width="+((showWeekNumber==1)?250:150)+" class='table'>" + 
			"<tr class='firstRow'>" + 
			"<td><table width='"+((showWeekNumber==1)?248:240)+"'><tr>" + 
			"<td class='header'>" + 
			"<font color='#000000'><B><span class='js-caption'></span></B></font>" +
			"</td><td align=right>" + 
			"<a href='javascript:void(0)'><span class='js-close close'></span></a>" +
			"</td></tr></table></td></tr><tr><td style='padding:5px' bgcolor=#ffffff><span class='js-content'></span></td></tr>";
			
		if (showToday === 1)
		{
			markup += "<tr class='today'><td style='padding:5px' align=center><span class='js-lblToday'></span></td></tr>";
		}
	
		markup += "</table></div><div class='js-selectMonth selectMenu'></div><div class='js-selectYear selectMenu'></div>";
		root.innerHTML = markup;
	}

	var	dayName = '',
		monthName =	["January","February","March","April","May","June","July","August","September","October","November","December"];

	if (startAt === 0)
	{
		dayName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
	}
	else
	{
		dayName = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
	}

	var	styleAnchor=" anchor",
		styleLightBorder=" bordered";


	function init()	{
		if (!ns4)
		{
			//if (!ie) {
            if (selectedYear.toString().length === 3){
                selectedYear += 1900
            }
            //}

			crossobj= root.querySelectorAll(".js-calender")[0].style;
			hideCalendar();

			crossMonthObj=root.querySelectorAll(".js-selectMonth")[0].style;

			crossYearObj=root.querySelectorAll(".js-selectYear")[0].style;

			monthConstructed=false;
			yearConstructed=false;

			if (showToday==1)
			{
                root.querySelectorAll(".js-lblToday")[0].innerHTML = todayString + " <a title='"+gotoString+"' style='"+styleAnchor+"' class='js-focus-today' href='javascript:void(0)'>"+dayName[(selectedDate.getDay()-startAt==-1)?6:(selectedDate.getDay()-startAt)]+", " + selectedDay + " " + monthName[selectedMonth].substring(0,3)	+ "	" +	selectedYear	+ "</a>";
			}



			// link to previous month 
			var sHTML1="<span style='border-width:0;cursor:pointer' class='js-decMonth'>&nbsp<div class='left-arrow'></div>&nbsp</span>&nbsp;";
			// link to next month 
			sHTML1+="<span style='border-width:0;cursor:pointer' class='js-incMonth'>&nbsp<div class='right-arrow'></div>&nbsp</span>&nbsp";
			// link to month drop-down list 
			sHTML1+="<span class='js-spanMonth' style='border-width:0;cursor:pointer'></span>&nbsp;";
			// link to year drop-down list
			sHTML1+="<span class='js-spanYear' style='border-width:0;cursor:pointer'></span>&nbsp;";

            root.querySelectorAll(".js-caption")[0].innerHTML  =	sHTML1;
	
			bPageLoaded=true;
		}
	}

	function hideCalendar()	{
		if (crossobj != null){
			crossobj.visibility="hidden";
		}
		if (crossMonthObj != null){
            crossMonthObj.visibility="hidden";
        }
		if (crossYearObj !=	null){
            crossYearObj.visibility="hidden";
        }

	    show_Element( 'SELECT' );
		show_Element( 'APPLET' );

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
		sTmp = sTmp.replace	("<o>",monthName[m]);
		return sTmp.replace ("yyyy",y)
	}

	function closeCalendar() {
		hideCalendar();
		if (ctlToPlaceValue.hasAttribute('value'))
			ctlToPlaceValue.value =	constructDate(dateSelected,monthSelected,yearSelected);
		else
			ctlToPlaceValue.innerHTML = constructDate(dateSelected,monthSelected,yearSelected);
	}

	/*** Month Pulldown	***/
	function StartDecMonth()
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
		popDownYear();
		if (!monthConstructed) {
			var sHTML =	'';
			for	(var i=0; i<12;	i++) {
				var sName =	monthName[i];
				if (i==monthSelected){
					sName =	"<B>" +	sName +	"</B>";
				}
				sHTML += "<tr><td class='js-month month' data-month='" + i + "' id='m" + i + "' style='cursor:pointer'>&nbsp;" + sName + "&nbsp;</td></tr>";
			}

            root.querySelectorAll(".js-selectMonth")[0].innerHTML = "<table class='js-month-table dropdown month-dropdown'  cellspacing=0>" + sHTML +	"</table>";

            var months = root.querySelectorAll('.js-month');
            for (var j = 0 ; j < months.length ; j ++){
                var month = months[j];
                on(month, "click", handleMonthSelect);
            }
            var monthTable = root.querySelectorAll('.js-month-table')[0];
            on(monthTable, "mouseover", function(){
                clearTimeout(timeoutID1);
            });
            on(monthTable, "mouseout", function(){
                clearTimeout(timeoutID1);
                timeoutID1=setTimeout(popDownMonth,100);
                event.cancelBubble=true;
            });

			monthConstructed=true;
		}
	}

    function handleMonthSelect(e){
        if (!e.target)e.target = e.srcElement;

        monthConstructed=false;
        monthSelected = parseInt(e.target.getAttribute('data-month'));
        constructCalendar();
        popDownMonth();
        e.cancelBubble=true;
    }

	function popUpMonth() {
		constructMonth();
		crossMonthObj.visibility = (dom||ie)? "visible"	: "show";
		crossMonthObj.left = parseInt(crossobj.left) + 50;
		crossMonthObj.top =	parseInt(crossobj.top) + 26;
	}

	function popDownMonth()	{
		crossMonthObj.visibility= "hidden";
	}

	/*** Year Pulldown ***/

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
            root.querySelectorAll(".js-y"+i)[0].innerHTML = txtYear
		}
		nStartingYear ++;
	}

	function decYear() {
		for	(var i=0; i<7; i++){
			var txtYear,
				newYear	= (i+nStartingYear) - 1;

			if (newYear == yearSelected)
			{ 
				txtYear =	"&nbsp;<B>"	+ newYear +	"</B>&nbsp;";
			} else { 
				txtYear =	"&nbsp;" + newYear + "&nbsp;" 
			}
            root.querySelectorAll(".js-y"+i)[0].innerHTML = txtYear
		}
		nStartingYear --;
	}

	function selectYear(nYear) {
		yearSelected=parseInt(nYear+nStartingYear);
		yearConstructed=false;
		constructCalendar();
		popDownYear();
	}

	function constructYear() {
		popDownMonth();

		if (yearConstructed)
            return;

        var sHTML =	"<tr><td align='center' class='js-year-dec dropdown-item' style='cursor:pointer'>-</td></tr>";

        var j =	0;
        nStartingYear =	yearSelected-3;
        for	(var i=(yearSelected-3) ; i<=(yearSelected+3); i++) {
            var sName =	i;
            if (i==yearSelected){
                sName =	"<b>" +	sName +	"</b>";
            }

            sHTML += "<tr><td data-year='" + j + "' class='js-y" + j + " js-year dropdown-item' style='cursor:pointer'>&nbsp;" + sName + "&nbsp;</td></tr>";
            j ++;
        }

        sHTML += "<tr><td align='center' class='js-year-inc dropdown-item' style='cursor:pointer'>+</td></tr>";

        root.querySelectorAll(".js-selectYear")[0].innerHTML = "<table class='dropdown year-dropdown js-year-dropdown' cellspacing=0>"	+ sHTML	+ "</table>";

        var years = root.querySelectorAll('.js-year');
        for (var i = 0 ; i < years.length ; i ++){
            on(years[i], "click", handleYearClick);
        }
        yearConstructed	= true;

        var  btnYearInc = root.querySelectorAll('.js-year-inc')[0],
            btnYearDropdown = root.querySelectorAll('.js-year-dropdown')[0],
            btnYearDec = root.querySelectorAll('.js-year-dec')[0];

        on(btnYearDropdown, "mouseover", function(){
            clearTimeout(timeoutID2);
        });
        on(btnYearDropdown, "mouseout", function(){
            clearTimeout(timeoutID2);
            timeoutID2=setTimeout(popDownYear,100);
        });

        on(btnYearInc, "mouseout", function(){
            clearInterval(intervalID2);
        });
        on(btnYearInc, "mouseup", function(){
            clearInterval(intervalID2);
        });
        on(btnYearInc, "mousedown", function(){
            clearInterval(intervalID2);
            intervalID2=setInterval(incYear,30);
        });

        on(btnYearDec, "mouseout", function(){
            clearInterval(intervalID1);
        });
        on(btnYearDec, "mouseup", function(){
            clearInterval(intervalID1);
        });
        on(btnYearDec, "mousedown", function(){
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

	function popDownYear() {
		clearInterval(intervalID1);
		clearTimeout(timeoutID1);
		clearInterval(intervalID2);
		clearTimeout(timeoutID2);
		crossYearObj.visibility= "hidden";
	}

	function popUpYear() {
		var	leftOffset;

		constructYear();
		crossYearObj.visibility	= (dom||ie)? "visible" : "show";
        leftOffset = parseInt(crossobj.left) + root.querySelectorAll(".js-spanYear")[0].offsetLeft;

		if (ie)
		{
			leftOffset += 6;
		}
		crossYearObj.left =	leftOffset;
		crossYearObj.top = parseInt(crossobj.top) +	26;
	}

	/*** calendar ***/
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

      if (startAt == 0) {
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

		var sHTML =	"<table	border=0 style='font-family:verdana;font-size:10px;'><tr>";

		if (showWeekNumber==1)
		{
			sHTML += "<td width=27><b>" + weekString + "</b></td><td width=1 rowspan=7 bgcolor='#d0d0d0' style='padding:0px'></td>"
		}

		for	(var i=0; i<7; i++)	{
			sHTML += "<td width='27' align='right'><B>"+ dayName[i]+"</B></td>";
		}
		sHTML +="</tr><tr>";
		
		if (showWeekNumber==1)
		{
			sHTML += "<td align=right>" + WeekNbr(startDate) + "&nbsp;</td>";
		}

		for	( var i=1; i<=dayPointer;i++ )
		{
			sHTML += "<td>&nbsp;</td>";
		}
	
		for	( var datePointer=1; datePointer<=numDaysInMonth; datePointer++ )
		{
			dayPointer++;
			sHTML += "<td align=right>";
			var sStyle=styleAnchor;
			if ((datePointer == odateSelected) && (monthSelected == omonthSelected)	&& (yearSelected == oyearSelected))
			{ 
				sStyle+=" " + styleLightBorder; 
			}

			var sHint = '';
			for (var k = 0; k < HolidaysCounter; k ++)
			{
				if ((parseInt(Holidays[k].d)==datePointer)&&(parseInt(Holidays[k].m)==(monthSelected+1)))
				{
					if ((parseInt(Holidays[k].y)==0)||((parseInt(Holidays[k].y)==yearSelected)&&(parseInt(Holidays[k].y)!=0)))
					{
						sStyle+=" holiday";
						sHint+=sHint==""?Holidays[k].desc:"\n"+Holidays[k].desc;
					}
				}
			}

			var regexp= /\"/g;
			sHint = sHint.replace(regexp,"&quot;");

			if ((datePointer==selectedDay)&&(monthSelected==selectedMonth)&&(yearSelected==selectedYear))
			{ 
				sHTML += "<b><a title=\"" + sHint + "\" class='"+sStyle+"' href='javascript:void(0)'><font class='js-day' data-day='" + datePointer +"' color=#ff0000>&nbsp;" + datePointer + "</font>&nbsp;</a></b>";
			}
			else if	(dayPointer % 7 == (startAt * -1)+1)
			{ 
				sHTML += "<a title=\"" + sHint + "\" class='"+sStyle+"' href='javascript:void(0)'>&nbsp;<font class='js-day' data-day='" + datePointer +"' color=#909090>" + datePointer + "</font>&nbsp;</a>";
			}
			else
			{ 
				sHTML += "<a title=\"" + sHint + "\" class='"+sStyle+"' href='javascript:void(0)'>&nbsp;<font class='js-day' data-day='" + datePointer +"' color=#548cab>" + datePointer + "&nbsp;</a>" ;
			}

			sHTML += "";
			if ((dayPointer+startAt) % 7 == startAt) 
			{ 
				sHTML += "</tr><tr>";
				if ((showWeekNumber == 1)&&(datePointer<numDaysInMonth))
				{
					sHTML += "<td align=right>" + (WeekNbr(new Date(yearSelected,monthSelected,datePointer+1))) + "&nbsp;</td>";
				}
			}
		}

        root.querySelectorAll(".js-content")[0].innerHTML   = sHTML;
        root.querySelectorAll(".js-spanMonth")[0].innerHTML = "&nbsp;" +	monthName[monthSelected] + "&nbsp;<div class='down-arrow'></div>";
        root.querySelectorAll(".js-spanYear")[0].innerHTML = "&nbsp;" + yearSelected	+ "&nbsp;<div class='down-arrow'></div>";

		var	days = root.querySelectorAll('.js-day');
		for (var i = 0; i < days.length ; i ++){
            on(days[i], "click", handleDaySelect);
		}
	}

	function handleDaySelect(e){
        if (!e.target)e.target = e.srcElement;

		dateSelected = e.target.getAttribute('data-day');
		closeCalendar();
	}

	function openCalender(ctl,	ctl2, format) {
		var	leftpos=0,
			toppos=0;
		
		if (bPageLoaded)
		{
			if ( crossobj.visibility ==	"hidden" ) {
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
								if (aData[i]==monthName[j])
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
					leftpos	+= aTag.offsetLeft;
					toppos += aTag.offsetTop;
				} while(aTag.tagName!="BODY");
 //             controlling the position of calendar
 
				crossobj.left =	fixedX==-1 ? ctl.offsetLeft	+ leftpos + 3 :	fixedX;
				crossobj.top = fixedY==-1 ?	ctl.offsetTop +	toppos + ctl.offsetHeight + 5 :	fixedY;
				constructCalendar (1, monthSelected, yearSelected);
				crossobj.visibility=(dom||ie)? "visible" : "show";

                var cal = root.querySelectorAll(".js-calender")[0];
				hide_Element( 'SELECT',cal );
				hide_Element( 'APPLET', cal );

				bShow = true;
			}
			else
			{
				hideCalendar();
				if (ctlNow!=ctl) {openCalender(ctl, ctl2, format)}
			}
			ctlNow = ctl
		}
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

	// create calender
	init();

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

    var btnFocusToday = root.querySelectorAll('.js-focus-today');
    if (btnFocusToday.length > 0){
        btnFocusToday =btnFocusToday[0];
        on(btnFocusToday, "click", function(){
            monthSelected=selectedMonth;
            yearSelected=selectedYear;
            constructCalendar();
        });
    }


    on(root.querySelectorAll('.js-close')[0], "click", function(){
        closeCalendar();
    });

    on(root.querySelectorAll('.js-spanYear')[0], "click", function(){
		popUpYear();
	});
    on(root.querySelectorAll('.js-spanMonth')[0], "click", function(){
		popUpMonth();
	});
    var btnDecMonth = root.querySelectorAll('.js-decMonth')[0];
    on(btnDecMonth, "click", decMonth);
    on(btnDecMonth, "mouseout", function(){
        clearInterval(intervalID1);
    });
    on(btnDecMonth, "mousedown" ,function(){
        clearTimeout(timeoutID1);
        timeoutID1=setTimeout(StartDecMonth,500);
    });
    on(btnDecMonth, "mouseup", function(){
        clearTimeout(timeoutID1);
        clearInterval(intervalID1);
    });


    var btnIncMonth =root.querySelectorAll('.js-incMonth')[0];
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
		openCalender(el,el,format);
	});
};
