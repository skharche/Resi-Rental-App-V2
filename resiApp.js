function showDescription(txt)
{
	//console.log(txt);
	$(".bgDescriptionBody").html(txt);
	$("#bgDescription").fadeIn();
}

function changeSelectionColor(id, color)
{
	console.log('I m in changeSelectionColor');	

	if(isMobile.any() == null)
	{
		console.log(id);

		window.lastId = id;

		window.lastColor = viewerDemoResiApp.entities.getById(window.lastId).polygon.material.color;
		//console.log(window.lastColor);
		if(window.currentStep > 0 && window.pptSteps[window.currentStep-1].action == "floatingLines")
		{
			color = window.lastColor.getValue().withAlpha(1);
		} else {
			color = window.lastColor.getValue().withAlpha(0.7);
		}
		console.log(color);
		viewerDemoResiApp.entities.getById(window.lastId).polygon.material.color = color;
		//viewerDemoPPT.entities.getById(window.lastId).polygon.material.color = Cesium.Color.GREEN;
	}
	else
	{
		var attributes = window.selectedPrimitive.getGeometryInstanceAttributes(window.selectedPrimitiveId);
		window.lastColor = attributes.color;

		if(textualColor == "white")
			color = [255, 255, 255, 128];
		if(textualColor == "red")
			color = [255, 0, 0, 128];

		if(typeof attributes != "undefined")
		{
			if(color != "")
			{
				//attributes.color = color;

				var colors = [];
				colors = attributes.color;
				alpha = 179;
				if(window.currentStep > 0 && window.pptSteps[window.currentStep-1].action == "floatingLines")
				{
					alpha = 255;
				}
				attributes.color = [colors[0], colors[1], colors[2], alpha];
				console.log(attributes.color);
				attributes.show = [1];
			}
		}
	}
}

function clearSelectedEntity()
{
	if(lastId != "")
	{
		var temp = lastId.split("-");
		if(temp[0] == "submarketBoundryHighlight")
		{
			submarketEntity[temp[1]].show = true;
		}
		$("#submarketStatistics").fadeOut("slow");
		//$("#bgDescription").fadeOut("slow");
		if(typeof viewer.entities.getById(lastId) != "undefined")
		{
			viewer.entities.getById(lastId).polygon.material.color = lastColor;
		}
	}
	lastId = "";
	lastColor = "";
}

function closeDescription()
{
	$(".bgDescriptionBody").html("");
	$("#bgDescription").fadeOut();
	clearSelectedEntity();
}

function closeStatistics()
{
	$("#submarketStatistics").fadeOut();
}

function getPlutoClassColor(appName, fieldName, val)
{
	//console.log("val "+val);
	if(val == "" || val == null)
	{
		if(debugSlides == 1)
		{
			hex = "#ff0000";
			alpha = 1;
		}
		else
		{
			hex = "#ffffff";
			alpha = 0.5;
		}
		return Cesium.Color.fromCssColorString(hex).withAlpha(alpha);
	}
	var hex = "";
	var alpha = "";
	$.each(window.appColorSetting[appName][fieldName], function (index, row){
		if(row.min.substr(1,1).toLowerCase() == "*")
		{
			if(val.substr(0, 1).toLowerCase() == row.min.substr(0,1).toLowerCase())
			{
				hex = row.color;
				alpha = row.alpha;
			}
		}
		else if(val.toLowerCase() == row.min.toLowerCase())
		{
			hex = row.color;
			alpha = row.alpha;
		}
	});
	//console.log("hex " + hex);
	//console.log("alpha " + alpha);
	if(hex == "")
	{
		hex = "#ffffff";
		alpha = 0.5;
	}
	return Cesium.Color.fromCssColorString(hex).withAlpha(alpha);
}

function getPlutoClassColorPlain(appName, fieldName, val) {
	var hex = "";
	var alpha = "";
	if(val == "" || val == null)
	{
		hex = "#ffffff";
		alpha = 0.5;
		return "";
	}

	$.each(window.appColorSetting[appName][fieldName], function (index, row){
		if(row.min.substr(1,1).toLowerCase() == "*") {
			if(val.substr(0, 1).toLowerCase() == row.min.substr(0,1).toLowerCase()) {
				hex = row.color;
				alpha = row.alpha;
			}
		} else if(val.toLowerCase() == row.min.toLowerCase()) {
			hex = row.color;
			alpha = row.alpha;
		}
	});
	if(val == "")
	{
		hex = "#ffffff";
		alpha = 0.5;
	}
	return hex;
}

function setInfoboxWidth(width)
{
	if(isMobile.any() == null || isMobile.any()[0] == "iPad")
	{
		$("#submarketStatistics").css("width", width.toString());
	}
	else
	{
		//Set width in percentage of the screen.
		width = width.replace("px", "");
		percentageWidth = parseInt(window.screen.availWidth * parseInt(width)/2048);
		$("#submarketStatistics").css("width", percentageWidth+"px");
	}
}

function enablePreviousStep()
{
	clearHighlights();
	console.log("currentStep : "+currentStep);
	currentStep--;
	console.log("currentStep : "+currentStep);
	currentStep--;
	for(var t = currentStep; t > 0; t--)
	{
		t--;
		console.log(pptSteps[t]);
		console.log("isMainSlide : "+pptSteps[t].isMainSlide);
		if(pptSteps[t].isMainSlide == 1)
		{
			currentStep = t;
			break;
		}
	}
	doImmediateExecution();
}

function doImmediateExecution()
{
	//ToExecute
	eventExecutionTimer = new Date().getTime() - (waitTimer*1000);
}

function pausePPT()
{
	$(".fa-pause").addClass("colorRed");
	isPPTPaused = true;
}

function resumePPT()
{
	$(".fa-pause").removeClass("colorRed");
	isPPTPaused = false;
}

function highlightButtonTemporarily(btnClass)
{
	$("."+btnClass).addClass("colorRed");
	setTimeout(function (){$("."+btnClass).removeClass("colorRed");}, 2000);
}

function initializeEventTimer()
{
	if(eventExecutionTimer == 0)
	{
		eventExecutionTimer = new Date().getTime() - waitTimer*1000;
		initPPT();
	}
}

function initPPT2()
{
	if(new Date().getTime() - eventExecutionTimer >= waitTimer*1000)
	{
		console.log("Executing initPPT2");
		eventExecutionTimer = new Date().getTime();
	}
	else
	{
		console.log("             Skipping");
	}
	setTimeout(function (){initPPT2();}, (2000));
}

function initPPT()
{
	if(currentStep >44 )
		debug = true;
	
	if(isPPTPaused)
	{
		//console.log("Pause Mode!");
		nextStep(isImmediate);
		return "";
	}
	var yesExecuteEvent = false;
	if(new Date().getTime() - eventExecutionTimer >= waitTimer*1000)
	{
		yesExecuteEvent = true;
		console.log("Executing initPPT()");
		eventExecutionTimer = new Date().getTime();
	}
	else
	{
		yesExecuteEvent = false;
		console.log("             Skipping");
		//return "";
	}
	
	/* if(!eventToBeExecuted)
	{
		console.log("Not Executing anything now");
		return "";
	} */
	//console.log("currentStep : "+currentStep+" => "+pptSteps[currentStep].action+" "+pptSteps[currentStep].header);
	
	enableSalesStatistics = false;//This for replay feature. To reset value.
	currentSalesProductType = "";
	if(lastSlideNumber == currentStep)
	{
		$("#replayModal").modal("show");
	}
	if(typeof pptSteps[currentStep] != "undefined")
	if(typeof(pptSteps[currentStep].action) != "undefined" && yesExecuteEvent)
	{
		//SK : to Find some appropriate method
		if(currentStep > 44)
		{
			$(".classDarkBlue").addClass("hide");
			$(".classLightBlue").addClass("hide");
			$(".classLightestBlue").addClass("hide");
			$(".classRed").removeClass("hide");
		}
		else
		{
			$(".classDarkBlue").removeClass("hide");
			$(".classLightBlue").removeClass("hide");
			$(".classLightestBlue").removeClass("hide");
			$(".classRed").addClass("hide");
		}
		closeDescription();
		closeStatistics();
		clearHighlights();//To hide submarkets.
		if(pptChapters[pptSteps[currentStep].chapterId].show == true)
		{
			console.log("currentStep " + currentStep);
			var isImmediate = false;
			var nothingMatched = true;
			switch (pptSteps[currentStep].action) {
				case "loadingMessage"://0
					nothingMatched = false;
					loadingMessage();
					currentStep++;
					lastStep = currentStep;
					break;
				case "initPPT"://0
					nothingMatched = false;
					//timeoutFunction = setTimeout(function (){initPPT();}, 10);
					currentStep++;
					lastStep = currentStep;
					break;
				case "cityOverview":
					nothingMatched = false;
					
					$("#slideHeader").html(pptSteps[currentStep].slideNumber+".&nbsp;<b>"+pptChapters[pptSteps[currentStep].chapterId].title+"</b>  - "+pptSteps[currentStep].header);
					prepareABCCounter = false;
					resetSubmarketABCCounter = false;
					cityOverview(false);
					
					enableSubmarketEntityParent();
					
					//Hack for 
					submarketBoundryEntityCollection.show = true;
					clearAllSubmarketBoundry();
					
					colorCodeAllSubmarkets();
					currentStep++;
					lastStep = currentStep;
					break;
				case "cityOverviewWithStatistics":
					nothingMatched = false;
					$("#slideHeader").html(pptSteps[currentStep].slideNumber+".&nbsp;<b>"+pptChapters[pptSteps[currentStep].chapterId].title+"</b>  - "+pptSteps[currentStep].header);
					prepareABCCounter = true;
					resetSubmarketABCCounter = false;
					enableIndividualFlyToSubmarketGroup = false;
					cityOverview(false);
					colorCodeAllSubmarkets();
					currentStep++;
					lastStep = currentStep;
					break;
				/*
				case "cityOverview2"://1
					nothingMatched = false;
					enableIndividualSubmarketClear = false;
					enableIndividualFlyToSubmarket = false;
					enableIndividualFlyToSubmarketGroup = false;
					mytimer = 0;
					setTimeout(function (){colorCodeAllSubmarkets();}, mytimer);
					mytimer = mytimer + 10000;
					setTimeout(function (){clearHighlights();}, mytimer);
					mytimer = mytimer + 200;
					setTimeout(function (){initPPT();}, mytimer);
					
					break;
				*/
				case "justCityOverview"://1
					nothingMatched = false;
					$("#slideHeader").html(pptSteps[currentStep].slideNumber+".&nbsp;<b>"+pptChapters[pptSteps[currentStep].chapterId].title+"</b>  - "+pptSteps[currentStep].header);
					
					cityOverview(false);
					currentStep++;
					lastStep = currentStep;
					enableIndividualSubmarketClear = false;
					enableIndividualFlyToSubmarket = false;
					enableIndividualFlyToSubmarketGroup = false;
					//isImmediate = true;
					break;
				case "clearCityHighlights"://1
					nothingMatched = false;
					clearHighlights();
					currentStep++;
					lastStep = currentStep;
					isImmediate = true;
					break;
				case "midtownOverview":
					nothingMatched = false;
					$("#slideHeader").html(pptSteps[currentStep].slideNumber+".&nbsp;<b>"+pptChapters[pptSteps[currentStep].chapterId].title+"</b>  - "+pptSteps[currentStep].header);
					enableIndividualSubmarketClear = false;
					enableIndividualFlyToSubmarket = false;
					enableIndividualFlyToSubmarketGroup = true;
					
					colorCodeSubmarketGroups(2);
					currentStep++;
					lastStep = currentStep;
					break;
				case "midtownSouthOverview":
					nothingMatched = false;
					$("#slideHeader").html(pptSteps[currentStep].slideNumber+".&nbsp;<b>"+pptChapters[pptSteps[currentStep].chapterId].title+"</b>  - "+pptSteps[currentStep].header);
					clearHighlights();
					enableIndividualSubmarketClear = false;
					enableIndividualFlyToSubmarket = false;
					enableIndividualFlyToSubmarketGroup = true;
					
					colorCodeSubmarketGroups(3);
					currentStep++;
					lastStep = currentStep;
					break;
				case "downtownOverview":
					nothingMatched = false;
					$("#slideHeader").html(pptSteps[currentStep].slideNumber+".&nbsp;<b>"+pptChapters[pptSteps[currentStep].chapterId].title+"</b>  - "+pptSteps[currentStep].header);
					clearHighlights();
					enableIndividualSubmarketClear = false;
					enableIndividualFlyToSubmarket = false;
					enableIndividualFlyToSubmarketGroup = true;
					
					colorCodeSubmarketGroups(1);
					currentStep++;
					lastStep = currentStep;
					break;
				case "cityOverviewABC":
					//SK : NOT USED ANYMORE
					nothingMatched = false;
					$("#slideHeader").html(pptSteps[currentStep].slideNumber+".&nbsp;<b>"+pptChapters[pptSteps[currentStep].chapterId].title+"</b>  - "+pptSteps[currentStep].header);//'Slide 9 : City - A,B,C  <span id="submarketPlaceHolder"></span>');
					cityOverview(false);
					currentStep++;
					lastStep = currentStep;
					enableIndividualSubmarketClear = false;
					enableIndividualFlyToSubmarket = false;
					enableIndividualFlyToSubmarketGroup = false;
					
					prepareABCCounter = true;
					resetSubmarketABCCounter = false;
		
					classAllowedForHighlight = ["a", "b", "c"];
					colorCodeAllSubmarkets();
					break;
				case "cityOverviewOfficeSales":
				case "cityOverviewResidentialSales":
				case "cityOverviewLandSales":
				case "cityOverviewRetailSales":
				case "cityOverviewHotelSales":
				case "cityOverviewBuyerSales":
					nothingMatched = false;
					$("#slideHeader").html(pptSteps[currentStep].slideNumber+".&nbsp;<b>"+pptChapters[pptSteps[currentStep].chapterId].title+"</b>  - "+pptSteps[currentStep].header);//'Slide 9 : City - A,B,C  <span id="submarketPlaceHolder"></span>');
					cityOverview(false);
					enableIndividualSubmarketClear = false;
					enableIndividualFlyToSubmarket = false;
					enableIndividualFlyToSubmarketGroup = false;
					
					enableSalesStatistics = true;
					if(pptSteps[currentStep].action == "cityOverviewOfficeSales")
						currentSalesProductType = "Office";
					if(pptSteps[currentStep].action == "cityOverviewOfficeResidentialSales")
						currentSalesProductType = "Residential";
					if(pptSteps[currentStep].action == "cityOverviewLandSales")
						currentSalesProductType = "Land";
					if(pptSteps[currentStep].action == "cityOverviewRetailSales")
						currentSalesProductType = "Retail";
					if(pptSteps[currentStep].action == "cityOverviewHotelSales")
						currentSalesProductType = "Hotel";
					if(pptSteps[currentStep].action == "cityOverviewBuyerSales")
						currentSalesProductType = "Buyer";
					console.log("currentSalesProductType : "+currentSalesProductType);
					
					currentStep++;
					lastStep = currentStep;
					prepareABCCounter = true;
					resetSubmarketABCCounter = false;
		
					//classAllowedForHighlight = ["a", "b", "c"];
					$(".defaultStatistics").hide();
					$(".advancedStatistics").show();
					prepareAdvancedSalesStatisticsLayoutForAll();
					colorCodeAllSubmarkets();
					break;
				/*
				case "midtownDetail":
					nothingMatched = false;
					$("#slideHeader").html('Slide 6 : Midtown Detail <span id="submarketPlaceHolder"></span>');
					clearHighlights();
					enableIndividualSubmarketClear = true;
					enableIndividualFlyToSubmarket = true;
					enableIndividualFlyToSubmarketGroup = false;
					
					mytimer = 0;
					//Using Group ID 1
					$.each(submarketGroupDetails[1], function (index, idtsubmarket){
						setTimeout(function () {colorCodeSubmarket(idtsubmarket);}, mytimer);
						mytimer = mytimer + 10000;
					});
					currentStep++;
					lastStep = currentStep;
					
					mytimer = mytimer + 10000;
					setTimeout(function (){clearHighlights(); initPPT();}, mytimer);
					break;
				case "midtownSouthDetail":
					nothingMatched = false;
					$("#slideHeader").html('Slide 7 : Midtown South Detail <span id="submarketPlaceHolder"></span>');
					clearHighlights();
					enableIndividualSubmarketClear = true;
					enableIndividualFlyToSubmarket = true;
					enableIndividualFlyToSubmarketGroup = false;
					
					mytimer = 0;
					//Using GroupId 2
					$.each(submarketGroupDetails[2], function (index, idtsubmarket){
						setTimeout(function () {colorCodeSubmarket(idtsubmarket);}, mytimer);
						mytimer = mytimer + 10000;
					});
					currentStep++;
					lastStep = currentStep;
					
					mytimer = mytimer + 10000;
					setTimeout(function (){clearHighlights(); initPPT();}, mytimer);
					break;
				case "downtownDetail":
					nothingMatched = false;
					$("#slideHeader").html('Slide 8 : Downtown Detail <span id="submarketPlaceHolder"></span>');
					clearHighlights();
					enableIndividualSubmarketClear = true;
					enableIndividualFlyToSubmarket = true;
					enableIndividualFlyToSubmarketGroup = false;
					
					mytimer = 0;
					//Using GroupId 3
					$.each(submarketGroupDetails[3], function (index, idtsubmarket){
						setTimeout(function () {colorCodeSubmarket(idtsubmarket);}, mytimer);
						mytimer = mytimer + 10000;
					});
					currentStep++;
					lastStep = currentStep;
					
					mytimer = mytimer + 10000;
					setTimeout(function (){clearHighlights(); initPPT();}, mytimer);
					break;
				*/
				/*
				case "midtownDetailABC":
					nothingMatched = false;
					$("#slideHeader").html('Slide 10 : Midtown - A,B,C  <span id="submarketPlaceHolder"></span>');
					clearHighlights();
					enableIndividualSubmarketClear = true;
					enableIndividualFlyToSubmarket = true;
					enableIndividualFlyToSubmarketGroup = false;
					classAllowedForHighlight = ["a", "b", "c"];
					mytimer = 0;
					//Using Group ID 1
					$.each(submarketGroupDetails[1], function (index, idtsubmarket){
						setTimeout(function () {colorCodeSubmarket(idtsubmarket);}, mytimer);
						mytimer = mytimer + 10000;
					});
					currentStep++;
					lastStep = currentStep;
					
					mytimer = mytimer + 10000;
					setTimeout(function (){clearHighlights(); initPPT();}, mytimer);
					break;
				case "midtownSouthDetailABC":
					nothingMatched = false;
					$("#slideHeader").html('Slide 11 : Midtown South - A,B,C  <span id="submarketPlaceHolder"></span>');
					clearHighlights();
					enableIndividualSubmarketClear = true;
					enableIndividualFlyToSubmarket = true;
					enableIndividualFlyToSubmarketGroup = false;
					classAllowedForHighlight = ["a", "b", "c"];
					mytimer = 0;
					//Using Group ID 1
					$.each(submarketGroupDetails[2], function (index, idtsubmarket){
						setTimeout(function () {colorCodeSubmarket(idtsubmarket);}, mytimer);
						mytimer = mytimer + 10000;
					});
					currentStep++;
					lastStep = currentStep;
					
					mytimer = mytimer + 10000;
					setTimeout(function (){clearHighlights(); initPPT();}, mytimer);
					break;
				case "downtownDetailABC":
					nothingMatched = false;
					$("#slideHeader").html('Slide 12 : Downtown - A,B,C  <span id="submarketPlaceHolder"></span>');
					clearHighlights();
					enableIndividualSubmarketClear = true;
					enableIndividualFlyToSubmarket = true;
					enableIndividualFlyToSubmarketGroup = false;
					classAllowedForHighlight = ["a", "b", "c"];
					mytimer = 0;
					//Using Group ID 1
					$.each(submarketGroupDetails[3], function (index, idtsubmarket){
						setTimeout(function () {colorCodeSubmarket(idtsubmarket);}, mytimer);
						mytimer = mytimer + 10000;
					});
					currentStep++;
					lastStep = currentStep;
					
					mytimer = mytimer + 10000;
					setTimeout(function (){clearHighlights(); initPPT();}, mytimer);
					break;
				*/
			}
			
			//This is custom message
			if(nothingMatched)
			{
				var temp = pptSteps[currentStep].action.split("-");
				if(temp.length == 2)
				{
					if(temp[0] == "colorCodeSubmarket")
					{
						$("#slideHeader").html(pptSteps[currentStep].slideNumber+".&nbsp;<b>"+pptChapters[pptSteps[currentStep].chapterId].title+"</b>  - "+pptSteps[currentStep].header);
						nothingMatched = false;
						enableIndividualSubmarketClear = true;
						enableIndividualFlyToSubmarket = true;
						enableIndividualFlyToSubmarketGroup = false;
						
						prepareABCCounter = true;
						resetSubmarketABCCounter = true;
						
						colorCodeSubmarket(temp[1]);
						
						currentStep++;
						lastStep = currentStep;
					}
					else if(temp[0] == "colorCodeSubmarketABC")
					{
						//Not used anymore
						$("#slideHeader").html(pptSteps[currentStep].slideNumber+".&nbsp;<b>"+pptChapters[pptSteps[currentStep].chapterId].title+"</b>  - "+pptSteps[currentStep].header);
						nothingMatched = false;
						enableIndividualSubmarketClear = true;
						enableIndividualFlyToSubmarket = true;
						enableIndividualFlyToSubmarketGroup = false;
						
						prepareABCCounter = true;
						resetSubmarketABCCounter = true;
						
						classAllowedForHighlight = ["a", "b", "c"];
						colorCodeSubmarket(temp[1]);
						
						currentStep++;
						lastStep = currentStep;
					}
					else if(temp[0] == "colorCodeSubmarketOfficeSales" || temp[0] == "colorCodeSubmarketResidentialSales" || temp[0] == "colorCodeSubmarketRetailSales" || temp[0] == "colorCodeSubmarketHotelSales" || temp[0] == "colorCodeSubmarketLandSales" || temp[0] == "colorCodeSubmarketBuyerSales")
					{
						$("#slideHeader").html(pptSteps[currentStep].slideNumber+".&nbsp;<b>"+pptChapters[pptSteps[currentStep].chapterId].title+"</b>  - "+pptSteps[currentStep].header);
						nothingMatched = false;
						enableIndividualSubmarketClear = true;
						enableIndividualFlyToSubmarket = true;
						enableIndividualFlyToSubmarketGroup = false;
						
						enableSalesStatistics = true;
						if(temp[0] == "colorCodeSubmarketOfficeSales")
							currentSalesProductType = "Office";
						if(temp[0] == "colorCodeSubmarketResidentialSales")
							currentSalesProductType = "Residential";
						if(temp[0] == "colorCodeSubmarketRetailSales")
							currentSalesProductType = "Retail";
						if(temp[0] == "colorCodeSubmarketHotelSales")
							currentSalesProductType = "Hotel";
						if(temp[0] == "colorCodeSubmarketLandSales")
							currentSalesProductType = "Land";
						if(temp[0] == "colorCodeSubmarketBuyerSales")//Special Case
							currentSalesProductType = "Buyer";
						
						prepareABCCounter = true;
						resetSubmarketABCCounter = true;
						
						currentSubmarket = temp[1];
						
						highlightAllSubmarketBoundry();
						colorCodeSubmarket(temp[1]);
						
						currentStep++;
						lastStep = currentStep;
					}
					else if(temp[0] == "reminderPolygonForSubmarket")
					{
						$("#slideHeader").html(pptSteps[currentStep].slideNumber+".&nbsp;<b>"+pptChapters[pptSteps[currentStep].chapterId].title+"</b>  - "+pptSteps[currentStep].header);
						nothingMatched = false;
						enableIndividualSubmarketClear = true;
						enableIndividualFlyToSubmarket = true;
						enableIndividualFlyToSubmarketGroup = false;
						
						drawReminderPolygon(temp[1]);
						
						currentStep++;
						lastStep = currentStep;
					}
				}
			}
		
			if(!nothingMatched)
			{
				eventToBeExecuted = false;//This means event execution is completed.
			}
		}
		else
		{
			if(typeof pptChapters[pptSteps[currentStep].chapterId].totalSlides != "undefined")
			{
				console.log(currentStep);
				currentStep = currentStep + pptChapters[pptSteps[currentStep].chapterId].totalSlides;
				console.log(currentStep);
			}
			else
			{
				currentStep++;
			}
			isImmediate = true;
		}
	}
	nextStep(isImmediate);
}
//initPPT();

function loadingMessage()
{
	$("#slideHeader").html('Loading Data <i class="fa fa-cog colorRed fa-lg fa-spin" aria-hidden="true"></i>');
	loadSubmarketDetails();
}

function cityOverview(goQuick)
{
	//debugger;
	if(typeof cityDetails[1].duration == "undefined")
		cityDetails[1].duration = 0;
	var duration = parseInt(cityDetails[1].duration);
	if(goQuick == true)
	{
		duration = parseInt(0);
	}
	
	flyToCamera(cityDetails[1].latitude, cityDetails[1].longitude, cityDetails[1].altitude, cityDetails[1].heading, cityDetails[1].tilt, cityDetails[1].pitch, cityDetails[1].roll, duration);
}

/*Presentation related stuff, Initiation, Events, Slides etc*/
var pptSteps = [];
var pptChapters = [];
function definePPTSteps()
{
	if(pptSteps.length > 0)
		return "";
	var i = 0;
	
	pptChapters[0] = [];
	pptChapters[0].title = "Manhattan Office Market";
	pptChapters[0].description = "Manhattan Office Market<br /># 1 - 4";
	pptChapters[0].show = true;
	pptChapters[0].totalSlides = 5;
	
	pptChapters[1] = [];
	pptChapters[1].title = "Office Market Statistics by Submarket";
	pptChapters[1].description = "Office Market Statistics by Submarket<br /># 5 - 8";
	pptChapters[1].show = true;
	pptChapters[1].totalSlides = 10;
	
	pptChapters[2] = [];
	pptChapters[2].title = "Investment Market Office";
	pptChapters[2].description = "Investment Market Office<br /># 9 - 12";
	pptChapters[2].show = true;
	pptChapters[2].totalSlides = 10;
	
	pptChapters[3] = [];
	pptChapters[3].title = "Investment Market Residential";
	pptChapters[3].description = "Investment Market Residential<br /># 13 - 16";
	pptChapters[3].show = true;
	pptChapters[3].totalSlides = 10;
	
	pptChapters[4] = [];
	pptChapters[4].title = "Investment Market Retail";
	pptChapters[4].description = "Investment Market Retail<br /># 17 - 20";
	pptChapters[4].show = true;
	pptChapters[4].totalSlides = 10;
	
	pptChapters[5] = [];
	pptChapters[5].title = "Investment Market Land";
	pptChapters[5].description = "Investment Market Land<br /># 21 - 24";
	pptChapters[5].show = true;
	pptChapters[5].totalSlides = 10;
	
	pptChapters[6] = [];
	pptChapters[6].title = "Investment Market Hotel";
	pptChapters[6].description = "Investment Market Hotel<br /># 25 - 28";
	pptChapters[6].show = true;
	pptChapters[6].totalSlides = 10;
	
	pptChapters[7] = [];
	pptChapters[7].title = "Investment Market – By Investor Profile";
	pptChapters[7].description = "Investment Market – By Investor Profile<br /># 29 - 32";
	pptChapters[7].show = true;
	pptChapters[7].totalSlides = 10;
	
	/*
	pptSteps[i] = [];
	pptSteps[i].action = "loadingMessage";
	pptSteps[i].header = "Loading Data";
	pptSteps[i].isMainSlide = 0;
	i++;
	*/
	
	pptSteps[i] = [];
	pptSteps[i].action = "cityOverview";
	pptSteps[i].header = "City Overview";
	pptSteps[i].isMainSlide = 1;
	pptSteps[i].slideNumber = 1;
	pptSteps[i].show = 1;
	pptSteps[i].chapterId = 0;
	i++;
	
	pptSteps[i] = [];
	pptSteps[i].action = "clearCityHighlights";
	pptSteps[i].header = "";
	pptSteps[i].isMainSlide = 0;
	pptSteps[i].chapterId = 0;
	i++;
	
	pptSteps[i] = [];
	pptSteps[i].action = "midtownOverview";
	pptSteps[i].header = "Midtown Overview";
	pptSteps[i].isMainSlide = 1;
	pptSteps[i].slideNumber = 2;
	pptSteps[i].show = 1;
	pptSteps[i].chapterId = 0;
	i++;
	
	pptSteps[i] = [];
	pptSteps[i].action = "clearCityHighlights";
	pptSteps[i].header = "";
	pptSteps[i].chapterId = 0;
	i++;
	
	pptSteps[i] = [];
	pptSteps[i].action = "midtownSouthOverview";
	pptSteps[i].header = "Midtown South Overview";
	pptSteps[i].isMainSlide = 1;
	pptSteps[i].slideNumber = 3;
	pptSteps[i].show = 1;
	pptSteps[i].chapterId = 0;
	i++;
	
	pptSteps[i] = [];
	pptSteps[i].action = "clearCityHighlights";
	pptSteps[i].header = "";
	pptSteps[i].chapterId = 0;
	i++;
	
	pptSteps[i] = [];
	pptSteps[i].action = "downtownOverview";
	pptSteps[i].header = "Downtown Overview";
	pptSteps[i].isMainSlide = 1;
	pptSteps[i].slideNumber = 4;
	pptSteps[i].show = 1;
	pptSteps[i].chapterId = 0;
	i++;
	
	pptSteps[i] = [];
	pptSteps[i].action = "clearCityHighlights";
	pptSteps[i].header = "";
	pptSteps[i].chapterId = 0;
	i++;
	
	pptSteps[i] = [];
	pptSteps[i].action = "cityOverviewWithStatistics";
	pptSteps[i].header = "Manhattan Statistics";
	pptSteps[i].isMainSlide = 1;
	pptSteps[i].slideNumber = 5;
	pptSteps[i].show = 1;
	pptSteps[i].chapterId = 1;
	i++;
	
	//Midtown Detail
	$.each(marketDetails[2].submarkets, function (index, idtsubmarket){
		
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarket-"+idtsubmarket;
		pptSteps[i].header = "Midtown Detail <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 6;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 1;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 1;
		i++;
		
	});
	
	//Midtown South Detail
	$.each(marketDetails[3].submarkets, function (index, idtsubmarket){
		
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarket-"+idtsubmarket;
		pptSteps[i].header = "Midtown South Detail <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 7;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId= 1;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 1;
		i++;
		
	});
	
	//Downtown Detail
	$.each(marketDetails[1].submarkets, function (index, idtsubmarket){
		
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarket-"+idtsubmarket;
		pptSteps[i].header = "Downtown Detail <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 8;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 1;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 1;
		i++;
		
	});
	
	
	//Office Sales Slide
	pptSteps[i] = [];
	pptSteps[i].action = "cityOverviewOfficeSales";
	pptSteps[i].header = "City Overview (Office Sales)";
	pptSteps[i].isMainSlide = 0;
	pptSteps[i].slideNumber = 9;
	pptSteps[i].chapterId = 2;
	i++;
	
	//Midtown Detail
	$.each(marketDetails[2].submarkets, function (index, idtsubmarket){
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketOfficeSales-"+idtsubmarket;
		pptSteps[i].header = "Midtown Detail [Office Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 10;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 2;
		i++;
		
		/*
		pptSteps[i] = [];
		pptSteps[i].action = "reminderPolygonForSubmarket-"+idtsubmarket;
		pptSteps[i].header = "#10: Midtown Detail [A,B,C] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		i++;
		*/
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 2;
		i++;
	});
	
	//Midtown South Detail
	$.each(marketDetails[3].submarkets, function (index, idtsubmarket){
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketOfficeSales-"+idtsubmarket;
		pptSteps[i].header = "Midtown South Detail [Office Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 11;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 2;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 2;
		i++;
		
	});
	
	//Downtown Detail
	$.each(marketDetails[1].submarkets, function (index, idtsubmarket){
		
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketOfficeSales-"+idtsubmarket;
		pptSteps[i].header = "Downtown Detail [Office Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 12;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 2;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 2;
		i++;
		
	});
	
	
	//Residential Sales Slides
	pptSteps[i] = [];
	pptSteps[i].action = "cityOverviewResidentialSales";
	pptSteps[i].header = "City Overview (Residential Sales)";
	pptSteps[i].isMainSlide = 0;
	pptSteps[i].slideNumber = 13;
	pptSteps[i].chapterId = 3;
	i++;
	
	//Midtown Detail
	$.each(marketDetails[2].submarkets, function (index, idtsubmarket){
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketResidentialSales-"+idtsubmarket;
		pptSteps[i].header = "Midtown Detail [Residential Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 14;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 3;
		i++;
		
		/*
		pptSteps[i] = [];
		pptSteps[i].action = "reminderPolygonForSubmarket-"+idtsubmarket;
		pptSteps[i].header = "#10: Midtown Detail [A,B,C] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		i++;
		*/
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 3;
		i++;
	});
	
	//Midtown South Detail
	$.each(marketDetails[3].submarkets, function (index, idtsubmarket){
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketResidentialSales-"+idtsubmarket;
		pptSteps[i].header = "Midtown South Detail [Residential Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 15;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 3;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 3;
		i++;
		
	});
	
	//Downtown Detail
	$.each(marketDetails[1].submarkets, function (index, idtsubmarket){
		
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketResidentialSales-"+idtsubmarket;
		pptSteps[i].header = "Downtown Detail [Residential Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 16;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 3;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 3;
		i++;
		
	});
	
	
	//Retail Sales Slides
	pptSteps[i] = [];
	pptSteps[i].action = "cityOverviewRetailSales";
	pptSteps[i].header = "City Overview (Retail Sales)";
	pptSteps[i].isMainSlide = 0;
	pptSteps[i].slideNumber = 17;
	pptSteps[i].chapterId = 4;
	i++;
	
	//Midtown Detail
	$.each(marketDetails[2].submarkets, function (index, idtsubmarket){
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketRetailSales-"+idtsubmarket;
		pptSteps[i].header = "Midtown Detail [Retail Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 18;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 4;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 4;
		i++;
	});
	
	//Midtown South Detail
	$.each(marketDetails[3].submarkets, function (index, idtsubmarket){
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketRetailSales-"+idtsubmarket;
		pptSteps[i].header = "Midtown South Detail [Retail Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 19;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 4;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 4;
		i++;
		
	});
	
	//Downtown Detail
	$.each(marketDetails[1].submarkets, function (index, idtsubmarket){
		
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketRetailSales-"+idtsubmarket;
		pptSteps[i].header = "Downtown Detail [Retail Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 20;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 4;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 3;
		i++;
		
	});
	
	
	//Land Sales Slides
	pptSteps[i] = [];
	pptSteps[i].action = "cityOverviewLandSales";
	pptSteps[i].header = "City Overview (Land Sales)";
	pptSteps[i].isMainSlide = 0;
	pptSteps[i].slideNumber = 21;
	pptSteps[i].chapterId = 5;
	i++;
	
	//Midtown Detail
	$.each(marketDetails[2].submarkets, function (index, idtsubmarket){
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketRetailSales-"+idtsubmarket;
		pptSteps[i].header = "Midtown Detail [Retail Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 22;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 5;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 5;
		i++;
	});
	
	//Midtown South Detail
	$.each(marketDetails[3].submarkets, function (index, idtsubmarket){
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketRetailSales-"+idtsubmarket;
		pptSteps[i].header = "Midtown South Detail [Retail Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 23;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 5;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 5;
		i++;
		
	});
	
	//Downtown Detail
	$.each(marketDetails[1].submarkets, function (index, idtsubmarket){
		
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketRetailSales-"+idtsubmarket;
		pptSteps[i].header = "Downtown Detail [Retail Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 24;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 5;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 5;
		i++;
		
	});
	
	
	//Hotel Sales Slides
	pptSteps[i] = [];
	pptSteps[i].action = "cityOverviewHotelSales";
	pptSteps[i].header = "City Overview (Hotel Sales)";
	pptSteps[i].isMainSlide = 0;
	pptSteps[i].slideNumber = 25;
	pptSteps[i].chapterId = 6;
	i++;
	
	//Midtown Detail
	$.each(marketDetails[2].submarkets, function (index, idtsubmarket){
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketHotelSales-"+idtsubmarket;
		pptSteps[i].header = "Midtown Detail [Hotel Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 26;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 6;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 6;
		i++;
	});
	
	//Midtown South Detail
	$.each(marketDetails[3].submarkets, function (index, idtsubmarket){
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketHotelSales-"+idtsubmarket;
		pptSteps[i].header = "Midtown South Detail [Hotel Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 27;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 6;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 6;
		i++;
		
	});
	
	//Downtown Detail
	$.each(marketDetails[1].submarkets, function (index, idtsubmarket){
		
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketHotelSales-"+idtsubmarket;
		pptSteps[i].header = "Downtown Detail [Hotel Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 28;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 6;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 6;
		i++;
		
	});
	
	
	//Buyer Sales Slides
	pptSteps[i] = [];
	pptSteps[i].action = "cityOverviewBuyerSales";
	pptSteps[i].header = "City Overview (Buyer Sales)";
	pptSteps[i].isMainSlide = 0;
	pptSteps[i].slideNumber = 29;
	pptSteps[i].chapterId = 7;
	i++;
	
	//Midtown Detail
	$.each(marketDetails[2].submarkets, function (index, idtsubmarket){
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketBuyerSales-"+idtsubmarket;
		pptSteps[i].header = "Midtown Detail [Buyer Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 30;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 7;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 7;
		i++;
	});
	
	//Midtown South Detail
	$.each(marketDetails[3].submarkets, function (index, idtsubmarket){
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketBuyerSales-"+idtsubmarket;
		pptSteps[i].header = "Midtown South Detail [Buyer Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 31;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 7;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 7;
		i++;
		
	});
	
	//Downtown Detail
	$.each(marketDetails[1].submarkets, function (index, idtsubmarket){
		
		pptSteps[i] = [];
		pptSteps[i].action = "colorCodeSubmarketBuyerSales-"+idtsubmarket;
		pptSteps[i].header = "Downtown Detail [Buyer Sales] <span id='submarketPlaceHolder'></span>";
		pptSteps[i].isMainSlide = 1;
		pptSteps[i].slideNumber = 32;
		pptSteps[i].show = 1;
		pptSteps[i].chapterId = 7;
		i++;
		
		pptSteps[i] = [];
		pptSteps[i].action = "clearCityHighlights";
		pptSteps[i].header = "";
		pptSteps[i].isMainSlide = 0;
		pptSteps[i].chapterId = 7;
		i++;
		
	});
	
	
	lastSlideNumber = i;
	
	//console.log(pptSteps);
	
	createSlides();
}

//Use chapters
function createSlides()
{
	var htmlDiv = "<div class='pull-right'><a href=\"javascript:checkUncheckAllSlides(true);\">Select All</a> / <a href=\"javascript:checkUncheckAllSlides(false);\">None</a></div><br />";
	$.each(pptChapters, function (index, item){
		//console.log(item);
		htmlDiv += '<div class="col-md-12 slideContainer"><input type="checkbox" class="slideSelector flat-red"" onClick="setChapterDisplay('+index+', this.checked);" checked/><div class="slideHeader">'+item.title+'</div><div class="slideContent">'+item.description+'</div></div>';
	});
	$(".chapterSlides").html(htmlDiv);
	
	//Flat red color scheme for iCheck
    /*
	$('input[type="checkbox"].flat-red, input[type="radio"].flat-red').iCheck({
      checkboxClass: 'icheckbox_flat-green',
      radioClass: 'iradio_flat-green'
    });
	*/
}

function checkUncheckAllSlides(checkVal)
{
	$(".slideSelector").attr("checked", checkVal);
	$.each(pptChapters, function (index, item){
		//console.log(item);
		pptChapters[index].show = checkVal;
	});
}

function setChapterDisplay(slideCounter, showValue)
{
	pptChapters[slideCounter].show = showValue;
}

function checkIfResumeOrRestart()
{
	//For now just resume.
	//resumePPT();
}

function nextStep(isImmediate)
{
	if(isImmediate)
	{
		doImmediateExecution();
		setTimeout(function (){initPPT();}, (100));
	}
	else
	{
		timeoutFunction = setTimeout(function (){initPPT();}, (1000));
	}
	/* if(isImmediate)
	{
		initPPT();
	}
	else
	{
	} */
}

function clearPendingFunctions()
{
	//NOTHING
}

function restartSlideShow()
{
	$("#replayModal").modal("hide");
	currentStep = 0;
	//RESET values.
	enableIndividualSubmarketClear = false;
	enableIndividualFlyToSubmarket = false;
	enableIndividualFlyToSubmarketGroup = false;
	enableSalesStatistics = false;
	currentSalesProductType = "";
	resumePPT();
}

function reduceWaitTime()
{
	if(waitTimer > 5)
		waitTimer--;
	$(".waitTimerContainer").html(waitTimer);
}

function increaseWaitTime()
{
	waitTimer++;
	$(".waitTimerContainer").html(waitTimer);
}

function drawSubmarketBoundry(idtsubmarket)
{
	var coords = submarketDetails[idtsubmarket].coords.split(",0");
	//console.log("coords");
	//console.log(coords);
	var coordsToUse = "";
	for(var i = 0; i < coords.length-1;i++)
	{
		if(coords[i].length > 5)
		{
			if(coordsToUse != "")
				coordsToUse = coordsToUse + ",";
			coordsToUse = coordsToUse + coords[i] + ",10";
		}
	}
	
	//console.log("coordsToUse");
	//console.log(coordsToUse);
	//return "";
	/* viewer.entities.add({
		id : "boundryWall"+idtsubmarket,
		name : submarketDetails[idtsubmarket].ssubname,
		description : submarketDetails[idtsubmarket].ssubname,
		wall : {
			positions: Cesium.Cartesian3.fromDegreesArrayHeights(eval("["+coordsToUse+"]")),
			material : Cesium.Color.RED.withAlpha(1),//color,//Cesium.ColorGeometryInstanceAttribute.fromColor(eval(Cesium.Color.GREEN)),
			outline : false,
			outlineColor : Cesium.Color.BLACK,
		}
	}); */
	
	var parent = submarketBoundryEntityCollection;
	
	/* if(debug == true)
		console.log(id+" <> "+coords); */
	var color = getSubmarketColor(idtsubmarket, 0.9);
	var entity = viewer.entities.add({
		id : "submarketBoundryHighlight-"+idtsubmarket,
		parent : parent,
		idtsubmarket : idtsubmarket,
		/* buildingClass : bldgClass,
		buildingName : bldgName,
		description : desc, */
		polyline : {
			positions : Cesium.Cartesian3.fromDegreesArrayHeights(eval("["+coordsToUse+"]")),
			width : 3,
			material : color,
			/* clampToGround : true, */
			classificationType : Cesium.ClassificationType.BOTH
		}
		/* polygon : {
			hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(eval(coords))),
			material : color,
			classificationType : Cesium.ClassificationType.BOTH
		} */
	});
	
	//10/26 Commented this one...
	//highlightStructure("submarketBoundryHighlight-"+idtsubmarket, "["+coordsToUse+"]", getSubmarketColor(idtsubmarket, 0.6), "", idtsubmarket, "", "");
}

function drawReminderPolygon(idtsubmarket)
{
	//console.log(remainingSubmarketPolygonDetails[idtsubmarket]);
	var allPolygons = $.parseJSON(kml3JsonData);
	//console.log(allPolygons);
	var color = getSubmarketColor(idtsubmarket, 0.6);
	var highlighting = Cesium.ClassificationType.BOTH;
	$.each(allPolygons, function (index, polygon){
		//console.log(index+" <> "+polygon);
		//highlightStructure("submarketHighlight-ABC-"+index+"-"+idtsubmarket, "["+polygon+"]", color, "", idtsubmarket, "");
		if(index != 0 || 11)
		{
			
			//REplace this with some function
			entity = viewer.entities.add({
				id : "submarketHighlight-ABC-"+index+"-"+idtsubmarket,
				/*idtsubmarket : idtsubmarket,
				buildingClass : bldgClass,
				description : desc,*/
				polygon : {
					hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(eval("["+polygon+"]"))),
					material : color,
					outline : true,
					outlineColor : Cesium.Color.BLACK,
					classificationType : Cesium.ClassificationType.TERRAIN
				}
			});
			highlighting = Cesium.ClassificationType.CESIUM_3D_TILE;
			color = Cesium.Color.RED;
		}
		//color = getSubmarketColor(idtsubmarket, 0.1);
	});
	
	return "";
	var submarketCoords = remainingSubmarketPolygonDetails[idtsubmarket].replace("POLYGON", "");
	submarketCoords = submarketCoords.replace("MULTIPOLYGON", "");
	//console.log(submarketCoords);
	submarketCoords = submarketCoords.split("(");
	for(var i = 0; i<submarketCoords.length; i++)
	{
		if(submarketCoords[i].length > 0)
		{
			//submarketCoords[i] = submarketCoords[i].replace(/\,)/g, '');
			submarketCoords[i] = submarketCoords[i].replace(/\)/g, '');
			submarketCoords[i] = submarketCoords[i].replace(/(^,)|(,$)/g, "");
			console.log("Each : "+submarketCoords[i]);
			var tempCoordsToUse = "";
			highlightStructure("submarketHighlight-individual-"+idtsubmarket, "["+submarketCoords[i]+"]", getSubmarketColor(idtsubmarket, 0.6), "", idtsubmarket, "", "");
		}
	}
	return "";
	var coords = submarketDetails[idtsubmarket].coords.split(",0");
	//console.log("coords");
	//console.log(coords);
	var coordsToUse = "";
	for(var i = 0; i < coords.length-1;i++)
	{
		if(coords[i].length > 5)
		{
			if(coordsToUse != "")
				coordsToUse = coordsToUse + ",";
			coordsToUse = coordsToUse + coords[i] + ",10";
		}
	}
	
	//console.log("coordsToUse");
	//console.log(coordsToUse);
	//return "";
	/* viewer.entities.add({
		id : "boundryWall"+idtsubmarket,
		name : submarketDetails[idtsubmarket].ssubname,
		description : submarketDetails[idtsubmarket].ssubname,
		wall : {
			positions: Cesium.Cartesian3.fromDegreesArrayHeights(eval("["+coordsToUse+"]")),
			material : Cesium.Color.RED.withAlpha(1),//color,//Cesium.ColorGeometryInstanceAttribute.fromColor(eval(Cesium.Color.GREEN)),
			outline : false,
			outlineColor : Cesium.Color.BLACK,
		}
	}); */
	var submarketColor = submarketDetails[idtsubmarket].color_hex;//'#'+Math.floor(Math.random()*16777215).toString(16);
	//console.log(idtsubmarket+" <> "+submarketColor);
	submarketColor = Cesium.Color.fromCssColorString(submarketColor);
	submarketColor = Cesium.Color.fromAlpha(submarketColor, 0.6);
	highlightStructure("submarketHighlight-"+idtsubmarket, "["+coordsToUse+"]", submarketColor, "", idtsubmarket, "", "");
}

function getSubmarketColor(idtsubmarket, alpha)
{
	var submarketColor = submarketDetails[idtsubmarket].color_hex;//'#'+Math.floor(Math.random()*16777215).toString(16);
	//console.log(idtsubmarket+" <> "+submarketColor);
	submarketColor = Cesium.Color.fromCssColorString(submarketColor);
	submarketColor = Cesium.Color.fromAlpha(submarketColor, alpha);
	return submarketColor;
}

/**		Highlight Related Functions 	*/
var loadedHighlights = [];

function getClassColor(bldgClass)
{
	/*
	var randomValue = 0;
	if(bldgClass == "ALL")
		randomValue = Math.floor((Math.random() * 10) + 1);
	*/
	var colorHexString = "";
	if(bldgClass.substr(0,1).toLowerCase() == "a")
	{
		if(prepareABCCounter)
			AclassBuildings++;
		colorHexString = "#0066cc";
	}
	if(bldgClass.substr(0,1).toLowerCase() == "b")
	{
		if(prepareABCCounter)
			BclassBuildings++;
		colorHexString = "#3399ff";
	}
	if(bldgClass.substr(0,1).toLowerCase() == "c")
	{
		if(prepareABCCounter)
			CclassBuildings++;
		colorHexString = "#CCE5FF";
	}
	//console.log(bldgClass+" <> "+colorHexString);
	return colorHexString;
	
	if(bldgClass.substr(0,1) == "A" || bldgClass.substr(0,1) == "B" || bldgClass == "Z0")
	{
		colorHexString = "#53FF00";
	}
	else if(bldgClass == "C0" || bldgClass == "C1" || bldgClass == "C2" || bldgClass == "C3" || bldgClass == "C4" || bldgClass == "C5" || bldgClass == "C6" || bldgClass == "C8" || bldgClass == "C9" || bldgClass == "CM" || bldgClass == "R1" || bldgClass == "R2" || bldgClass == "R3" || bldgClass == "R6")
	{
		colorHexString = "#46D103";
	}
	else if(bldgClass == "D0" || bldgClass == "D1" || bldgClass == "D2" || bldgClass == "D3" || bldgClass == "D4" || bldgClass == "D5" || bldgClass == "D8" || bldgClass == "D9" || bldgClass == "H6" || bldgClass == "H7" || bldgClass == "R4" || bldgClass == "RD")
	{
		colorHexString = "#35A400";
	}
	else if(bldgClass == "C7" || bldgClass == "D6" || bldgClass == "D7" || bldgClass == "K4" || bldgClass == "O8" || bldgClass == "R8" || bldgClass == "R9" || bldgClass == "RM" || bldgClass == "RR" || bldgClass == "RX" || bldgClass == "RZ" || bldgClass.substr(0,1) == "S")
	{
		colorHexString = "#FF9500";
	}
	else if(bldgClass == "G8" || bldgClass == "GU" || bldgClass == "GW" || bldgClass == "H1" || bldgClass == "H2" || bldgClass == "H3" || bldgClass == "H4" || bldgClass == "H5" || bldgClass == "H9" || bldgClass == "HB" || bldgClass == "HH" || bldgClass == "HR" || bldgClass == "HS" || bldgClass.substr(0,1) == "J" || bldgClass == "K1" || bldgClass == "K2" || bldgClass == "K3" || bldgClass == "K5" || bldgClass == "K6" || bldgClass == " K7" || bldgClass == "K8" || bldgClass == "K9" || bldgClass == "O1" || bldgClass == "O2" || bldgClass == "O3" || bldgClass == "O4" || bldgClass == "O5" || bldgClass == "O6" || bldgClass == "O7" || bldgClass == "O9" || bldgClass == "" || bldgClass == "P1" || bldgClass == "R5" || bldgClass == "R7" || bldgClass == "RB" || bldgClass == "RC" || bldgClass == "RH" || bldgClass == "RI" || bldgClass == "RK" || bldgClass == "RS")
	{
		colorHexString = "#00CDFF";
	}
	else if(bldgClass.substr(0,1) == "E" || bldgClass.substr(0,1) == "F" || bldgClass.substr(0,1) == "L" || bldgClass == "RW")
	{
		colorHexString = "#BFBFBF";
	}
	else if(bldgClass == "G2" || bldgClass == "G3" || bldgClass == "G4" || bldgClass == "G5" || bldgClass == "G9" || bldgClass.substr(0, 1) == "T" || bldgClass.substr(0,1) == "U" || bldgClass == "Y6" || bldgClass == "Y7" || bldgClass == "Y8" || bldgClass == "Y9")
	{
		colorHexString = "#FFF300";
	}
	else if(bldgClass == "H8" || bldgClass.substr(0,1) == "I" || bldgClass.substr(0,1) == "M" || bldgClass.substr(0,1) == "N" || bldgClass == "P2" || bldgClass == "P3" || bldgClass == "P5" || bldgClass == "P7" || bldgClass == "P8" || bldgClass == "P9" || bldgClass == "RA" || bldgClass.substr(0,1) == "W" || bldgClass == "Y1" || bldgClass == "Y2" || bldgClass == " Y3" || bldgClass == "Y4" || bldgClass == "Z1" || bldgClass == "Z3" || bldgClass == "Z4" || bldgClass == "Z5")
	{
		colorHexString = "#AB6400";
	}
	else if(bldgClass == "P4" || bldgClass == "P6" || bldgClass.substr(0,1) == "Q" || bldgClass == "Z8")
	{
		colorHexString = "";
	}
	else if(bldgClass == "G0" || bldgClass == "G1" || bldgClass == "G2" || bldgClass == "G6" || bldgClass == "G7" || bldgClass == "RG" || bldgClass == "RP" || bldgClass == "Z2")
	{
		colorHexString = "";
	}
	else if(bldgClass.substr(0,1) == "V")
	{
		colorHexString = "";
	}
	/*
	if(bldgClass == "A")
		colorHexString = "#FF0000";
	if(bldgClass == "AA")
		colorHexString = "#DC143C";
	if(bldgClass == "B")
		colorHexString = "#0000FF";
	if(bldgClass == "C")
		colorHexString = "#00BFFF";
	if(bldgClass == "GOV")
		colorHexString = "#CD853F";
	if(bldgClass == "HOTEL")
		colorHexString = "#8A2BE2";
	if(bldgClass == "APT")
		colorHexString = "#9ACD32";
	if(bldgClass == "CONDO")
		colorHexString = "#228B22";
	*/
	return colorHexString;
}


function removeAllSubmarkets(idtsubmarket)
{
	$.each(marketDetails, function (idtmarket, marketData){
		if(typeof marketData != "undefined")
		{
			removeMarketBuildings(idtmarket);
		}
	});
}

function removeMarketBuildings(idtmarket)
{
	$.each(marketDetails[idtmarket].submarkets, function (index, idtsubmarket){
		removeSubmarketBuildings(idtsubmarket);
	});
}

function removeSubmarketBuildings(idtsubmarket)
{
	$.each(submarketBuildingDetails[idtsubmarket], function (index, buildingRow){
		viewer.entities.removeById("bldg-"+buildingRow.idtbuilding);
	});
}

function colorCodeAllSubmarkets()
{
	//return "";
	//console.log("Color Coding Submarkets");
	//highlightAllSubmarketBoundry();
	
	$.each(marketDetails, function (idtmarket, marketData){
		if(typeof marketData != "undefined")
		{
			colorCodeSubmarketGroups(idtmarket);
		}
	});
}

function colorCodeSubmarketGroups(groupId)
{
	//console.log("groupId "+groupId);
	if(enableIndividualFlyToSubmarketGroup)
	{
		clearAllSubmarketBoundry();
		highlightMarketBoundry(groupId);
		flyToSubmarketGroup(groupId);
		$(".submarketPlaceHolder").html(marketDetails[groupId].smarketname);
	}
	else
	{
		$(".submarketPlaceHolder").html("New York");
	}
	
	$.each(marketDetails[groupId].submarkets, function (index, idtsubmarket){
		//console.log("idtsubmarket : "+idtsubmarket);
		//console.log("idtsubmarket.show : "+submarketEntity[idtsubmarket].show);
		colorCodeSubmarket(idtsubmarket);
	});
}

function colorCodeSubmarket(idtsubmarket)
{
	if(enableIndividualSubmarketClear)
		clearHighlights();
	
	//This to override hidden property
	submarketEntity[idtsubmarket].show = true;
	if(enableIndividualFlyToSubmarket)
	{
		$("#submarketPlaceHolder").html("[ "+submarketDetails[idtsubmarket].ssubname+" ]");
		$(".submarketPlaceHolder").html(submarketDetails[idtsubmarket].ssubname);
		$(".submarketPlaceHolder").html(submarketDetails[idtsubmarket].ssubname);
		flyToSubmarket(idtsubmarket);
		clearAllSubmarketBoundry();
		currentSubmarket = idtsubmarket;
		highlightSubmarketBoundry(idtsubmarket);
	}
	else
	{
		//submarketEntity[idtsubmarket].show = false;
		removeSubmarketBuildings(idtsubmarket);//1.50 Change
		//$(".submarketPlaceHolder").html(submarketDetails[idtsubmarket].ssubname);
	}
	
	if(prepareABCCounter)
	{
		if(resetSubmarketABCCounter)
		{
			AclassBuildings = 0;
			BclassBuildings = 0;
			CclassBuildings = 0;
			refreshABCStatistics();
			$("#submarketStatistics").fadeIn("slow");
		}
	}
	else
	{
		$("#submarketStatistics").hide();
	}
	
	if(prepareABCCounter)
	{
		AclassBuildings += submarketEntity[idtsubmarket].AclassBuildings;
		BclassBuildings += submarketEntity[idtsubmarket].BclassBuildings;
		CclassBuildings += submarketEntity[idtsubmarket].CclassBuildings;
		refreshABCStatistics();
	}
	
	//Always create elements
	if(submarketEntity[idtsubmarket].displayed == false || true)//1.50 Change :  || true
	{
		var showHighlight = true;//Flag used for filtering 
		submarketEntity[idtsubmarket].displayed = true;
		if(enableSalesStatistics)
		{
			//debugger;
			//This is when Sales data is to be highlighted
			//if(typeof submarketSalesStatisticsDetails[idtsubmarket] != "undefined")
			//if(typeof submarketSalesStatisticsDetails[idtsubmarket][buildingRow.idtbuilding] != "undefined")
				//Common things here
			var iterateTypes = [currentSalesProductType];
			if(currentSalesProductType == "Buyer")
			{
				iterateTypes = ["Hotel", "Land", "Office", "Other", "Retail", "Residential"];
			}
			console.log(idtsubmarket+" <> "+currentSalesProductType);
			$.each(iterateTypes, function (index, eachType){
				
				if(typeof submarketSalesStatisticsDetails[idtsubmarket] != "undefined")
				if(typeof submarketSalesStatisticsDetails[idtsubmarket][eachType] != "undefined")
				{
					$.each(submarketSalesStatisticsDetails[idtsubmarket][eachType], function(index, eachSalesRow){
						var finalString = prepareCoordsForHighlight(eachSalesRow.coords, eachSalesRow.altitude);
						var description = prepareBuildingDescription(eachSalesRow);
						var cesiumColor = Cesium.Color.RED;
						//cesiumColor = Cesium.Color.fromAlpha(cesiumColor, 0.5);
						viewer.entities.removeById("bldg-"+eachSalesRow.idtbuilding);//1.50 Change
						highlightStructureV2("bldg-"+eachSalesRow.idtbuilding, finalString, cesiumColor, description, idtsubmarket, eachSalesRow.colliersclass, eachSalesRow.name);
					});
				}
				else
				{
					console.log("submarketSalesStatisticsDetails '"+eachType+"' for "+idtsubmarket + " Not available");
				}
			});
		}
		else
		{
			$.each(submarketBuildingDetails[idtsubmarket], function (index, buildingRow){
				
				//Common things here
				var finalString = prepareCoordsForHighlight(buildingRow.coords, buildingRow.altitude);
				var description = prepareBuildingDescription(buildingRow);
					
				//console.log("-------");console.log(buildingRow);
				
					showHighlight = classIsValidForLoading(buildingRow.colliersclass);
					
					if(showHighlight == true)
					{
						//console.log("-------");console.log(finalString);
						loadedHighlights[loadedHighlights.length] = "bldg-"+buildingRow.idtbuilding;
						
						var colorHexString = "";
						var randomValue = 0;
						//console.log("buildingRow.buildingclass : ");console.log(buildingRow.buildingclass);
						//colorHexString = getClassColor(buildingRow.buildingclass);
						if(buildingRow.colliersclass != null)
						{
							if(buildingRow.colliersclass.substr(0,1).toLowerCase() == "a")
							{
								submarketEntity[idtsubmarket].AclassBuildings = submarketEntity[idtsubmarket].AclassBuildings + 1;
							}
							if(buildingRow.colliersclass.substr(0,1).toLowerCase() == "b")
							{
								submarketEntity[idtsubmarket].BclassBuildings = submarketEntity[idtsubmarket].BclassBuildings + 1;
							}
							if(buildingRow.colliersclass.substr(0,1).toLowerCase() == "c")
							{
								submarketEntity[idtsubmarket].CclassBuildings = submarketEntity[idtsubmarket].CclassBuildings + 1;
							}
							colorHexString = getClassColor(buildingRow.colliersclass);
							if(colorHexString != "" && typeof colorHexString != "undefined")
							{
								var cesiumColor = Cesium.Color.fromCssColorString(colorHexString);
								//cesiumColor = Cesium.Color.fromAlpha(cesiumColor, 0.5);
								viewer.entities.removeById("bldg-"+buildingRow.idtbuilding);//1.50 Change
								highlightStructureV2("bldg-"+buildingRow.idtbuilding, finalString, cesiumColor, description, idtsubmarket, buildingRow.colliersclass, buildingRow.name);
							}
						}
					}
					//console.log("finalString : "+finalString);
				});
		}
	
	}
	else
	{
		//submarketEntity[idtsubmarket].show = true;//1.50 Change
	}
	//console.log("finished Submarket");
}

//Some Common Functions
function prepareCoordsForHighlight(buildingCoords, height)
{
	//console.log("buildingCoords");
	//console.log(buildingCoords);
	var temp = buildingCoords.split(",");
	var finalString = "";
	for(var i = 0; i < temp.length; i++)
	{
		if(finalString != "")
			finalString += " ,";
		finalString += temp[i]+", "+temp[i+1]+", "+height;
		i++;
	}
	if(finalString.length > 0)
		finalString = "["+finalString+"]";
	return finalString;
}

function prepareBuildingDescription(buildingRow)
{
	//console.log(buildingRow);
	//description = buildingRow.number+" "+buildingRow.name+" "+buildingRow.BIN+" (class: "+buildingRow.buildingclass+")";
	var description = "";
	//description += "<br />Name: "+buildingRow.name;
	
	description = "<table class='table table-bordered'>";
	description += "<tbody>";
	//description += "<tr><th>Name</th><td>"+buildingRow.name+"</td></tr>";
	//description += "<tr><th>Address</th><td>"+buildingRow.address+"</td></tr>";
	description += "<tr><th>Submarket</th><td>"+submarketDetails[buildingRow.idtsubmarket].ssubname+"</td></tr>";
	description += "<tr><th>Class</th><td>"+buildingRow.colliersclass+"</td></tr>";
	description += "<tr><th>Office Area</th><td>"+buildingRow.officearea+"</td></tr>";
	description += "<tr><th>Retail Area</th><td>"+buildingRow.retailarea+"</td></tr>";
	description += "<tr><th>RED EYE ID</th><td>"+buildingRow.idtbuilding+"</td></tr>";
	description += "<tr><th>NYC BIN</th><td>"+buildingRow.BIN+"</td></tr>";
	//description += "<tr><td colspan='2'><input type='button' onClick='tryFogHighlightV2("+buildingRow.idtbuilding+", "+buildingRow.idtsubmarket+");' value='Fog Mesh'/></td></tr>";
	description += "</tbody>";
	description += "</table>";
	if(enableSalesStatistics)
	{
		description = "";//Hide Other Details...
		console.log("--------\nadvanced statistics : ");
		console.log(currentSalesProductType);
		console.log(buildingRow.idtsubmarket+" <> "+buildingRow.idtbuilding);
		if(typeof submarketSalesStatisticsDetailsV2[buildingRow.idtsubmarket] != "undefined")
		if(typeof submarketSalesStatisticsDetailsV2[buildingRow.idtsubmarket][currentSalesProductType] != "undefined")
		if(typeof submarketSalesStatisticsDetailsV2[buildingRow.idtsubmarket][currentSalesProductType][buildingRow.idtbuilding] != "undefined")
		$.each(submarketSalesStatisticsDetailsV2[buildingRow.idtsubmarket][currentSalesProductType][buildingRow.idtbuilding], function (k, v){
			//description += "<hr />";
			description += "<table class='table table-bordered'><tr><td valign='top'><b>Address</b><br />" + v.address + "</td><td valign='top'><b>Sales Title</b><br /> " + v.sales_subtitle + "</td><td valign='top'><b>Size</b><br />" + v.size + " " + v.size_unit+"</td><td valign='top'></td></tr>";
			description += "<tr><td valign='top'><b>Buyer Company</b><br />" + v.buyer_company_name + "</td><td valign='top'><b>Seller Company</b><br />" + v.seller_company_name + "</td><td valign='top'><b>Sale price</b><br />" + v.sales_price + "</td><td valign='top'><b>Date Closed</b><br />" + v.date_closed+"</td></tr>";
			description += "<tr><td colspan='4' valign='top'><b>Comments : </b><br /></td></tr></table>";
		});
		$("#bgDescription").css("width", "500px");
	}
	else
	{
		$("#bgDescription").css("width", "250px");
	}
	//Common things ends here
	return description;
}

function refreshABCStatistics()
{
	if(enableSalesStatistics == true)//submarketSalesStatisticsDetails[currentSubmarket].length > 0 && 
	{
		prepareAdvancedSalesStatisticsLayout(currentSubmarket);
		$(".defaultStatistics").hide();
		$(".advancedStatistics").show();
	}
	else
	{
		$(".aClassContainer").html(AclassBuildings);
		$(".bClassContainer").html(BclassBuildings);
		$(".cClassContainer").html(CclassBuildings);
		$(".totalClassContainer").html(parseInt(AclassBuildings) + parseInt(BclassBuildings) + parseInt(CclassBuildings));
		if(parseInt(AclassBuildings) > 0 || parseInt(BclassBuildings) > 0 || parseInt(CclassBuildings) > 0)
		{
			$("#submarketStatistics").fadeIn();
			if(currentSubmarket != "")
			{
				if(enableSalesStatistics == true)//submarketSalesStatisticsDetails[currentSubmarket].length > 0 && 
				{
					prepareAdvancedSalesStatisticsLayout(currentSubmarket);
					$(".defaultStatistics").hide();
					$(".advancedStatistics").show();
				}
				else if(submarketOfficeStatisticsDetails[currentSubmarket].length > 0 && enableSalesStatistics == false)
				{
					prepareAdvancedStatisticsLayout(currentSubmarket);
					$(".defaultStatistics").hide();
					$(".advancedStatistics").show();
				}
				else
				{
					$(".advancedStatistics").hide();
					$(".defaultStatistics").show();
				}
			}
			else
			{
				$(".advancedStatistics").hide();
				$(".defaultStatistics").show();
			}
		}
	}
}

function prepareAdvancedStatisticsLayout(idtsubmarket)
{
	//console.log("Preparing Advanced Statistics");
	//console.log(submarketOfficeStatisticsDetails[idtsubmarket]);
	$(".advancedStatistics").html("Preparing Office Statistics");
	var string = "<table class='table table-bordered'>";
	string += "<tbody>";
	string += "<tr>";
		string += "<th>&nbsp;</th><th># Buildings</th><th>Square Ft</th><th>Availability Rate</th><th>Asking Rent</th>";
	string += "</tr>";
	var bldgcnt = 0;
	var totalBldgCnt = 0;
	var totalSqFt = 0;
	var totalAvailRate = 0;
	var totalAskRate = 0;
	$.each(submarketOfficeStatisticsDetails[idtsubmarket], function (index, row){
		if(row.building_class == "A")
			bldgcnt = AclassBuildings;
		if(row.building_class == "B")
			bldgcnt = BclassBuildings;
		if(row.building_class == "C")
			bldgcnt = CclassBuildings;
		
		totalBldgCnt += bldgcnt;
		totalSqFt += parseFloat(sanitizeNumber(row.square_feet));
		totalAvailRate += parseFloat(sanitizeNumber(row.availability_rate));
		totalAskRate += parseFloat(sanitizeNumber(row.asking_rent));
		
		string += "<tr>";
			string += "<td>Class "+row.building_class+"</td><td>"+bldgcnt+"</td><td>"+row.square_feet+"</td><td>"+row.availability_rate+"%</td><td>$"+row.asking_rent+"</td>";
		string += "</tr>";
	});
		string += "<tr>";
			string += "<th>Total</th><th>"+totalBldgCnt+"</th><th>"+printNumberInCommaFormat(totalSqFt)+"</th><th>"+totalAvailRate+"%</th><th>$"+totalAskRate+"</th>";
		string += "</tr>";
		
	string += "</tbody>";
	string += "</table>";
	$(".advancedStatistics").html(string);
}

function prepareAdvancedSalesStatisticsLayout(idtsubmarket)
{
	if(idtsubmarket == "")
	{
		console.log("ERROR : Parameter missing ");
		return "";
	}
	console.log("Preparing Advanced Statistics " + idtsubmarket);
	//console.log(submarketOfficeStatisticsDetails[idtsubmarket]);
	$(".advancedStatistics").html("Preparing Sales Statistics");
	if(currentSalesProductType != "Buyer" && (typeof submarketSalesStatisticsDetails[idtsubmarket] == "undefined" || typeof submarketSalesStatisticsDetails[idtsubmarket][currentSalesProductType] == "undefined" || typeof submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType] == "undefined"))
	{
		$(".advancedStatistics").html("Sales Data Not Available");
		console.log("Sales Data Missing");
		return "";
	}
	else if(currentSalesProductType == "Buyer" && (typeof submarketBuyerSalesStatisticsPopupDetails[idtsubmarket] == "undefined" ))
	{
		$(".advancedStatistics").html("Buyer Sales Data Not Available");
		console.log("Buyer Sales Data Missing");
		return "";
	}
	var string = "<table class='table table-bordered'>";
	string += "<tbody>";
	string += "<tr>";
		string += "<th>Investor Type</th>";
		if(currentSalesProductType == "Buyer")
		{
			string += "<th>Year</th>";
		}
		string += "<th># Deals</th><th>Square Ft</th><th>$ / SF</th>";
	string += "</tr>";
	var bldgcnt = 0;
	var totalDeals = 0;
	var totalSqFt = 0;
	var totalAmountPerSF = 0;
	/* 
	$.each(submarketSalesStatisticsDetails[idtsubmarket], function (index, row){
		if(row.building_class == "A")
			bldgcnt = AclassBuildings;
		if(row.building_class == "B")
			bldgcnt = BclassBuildings;
		if(row.building_class == "C")
			bldgcnt = CclassBuildings;
		
		totalBldgCnt += bldgcnt;
		totalSqFt += parseFloat(sanitizeNumber(row.square_feet));
		totalAvailRate += parseFloat(sanitizeNumber(row.availability_rate));
		totalAskRate += parseFloat(sanitizeNumber(row.asking_rent));
		 
	});
	 */
	 var tableRows = "";
	 if(currentSalesProductType == "Buyer")
	 {
		 var nothingToShow = true;
		 //New Method
		 if(typeof submarketBuyerSalesStatisticsPopupDetails[idtsubmarket] != "undefined")
		 {
			 var divider = 0;
			 $.each(submarketBuyerSalesStatisticsPopupDetails[idtsubmarket], function (index, row){
				 console.log(row);
				 if(index != "TOTAL")
				 {
					divider++;
					nothingToShow = false;
					var firstTime = true;
					var lastYear = "";
					var t = "";
					//submarketBuyerSalesStatisticsPopupDetails[idtsubmarket][index].reverse();
					$.each(submarketBuyerSalesStatisticsPopupDetails[idtsubmarket][index], function (k, v){
						if(lastYear == "")
						{
							lastYear = k;
						}
						console.log("---------");
						console.log(k);
						console.log(v);
						tableRows += "<tr>";
						if(firstTime == true)
						{
							firstTime = false;
							tableRows += "<td valign='middle' rowspan='"+Object.keys(submarketBuyerSalesStatisticsPopupDetails[idtsubmarket][index]).length+"'>"+index+"</td>";
						}
						tableRows += "<td>"+k.replace("a", "")+"</td><td>"+v.deals+"</td><td>"+numberWithComma(v.sf)+"</td><td>$"+numberWithComma(v.amtsf)+"</td></tr>";
						//tableRows = t + tableRows;
					});
					//string += "<tr><td>"+index+"</td><td>"+row.deals+"</td><td>"+numberWithComma(row.sf)+"</td><td>$"+numberWithComma(row.amtsf)+"</td></tr>";
				 }
			 });
			 if(typeof submarketBuyerSalesStatisticsPopupDetails[idtsubmarket].TOTAL != "undefined")
			 {
				nothingToShow = false;
				tableRows += "<tr><td><b>Total</b></td><td></td><td><b>"+submarketBuyerSalesStatisticsPopupDetails[idtsubmarket].TOTAL.deals+"</b></td><td><b>"+numberWithComma(Math.ceil(submarketBuyerSalesStatisticsPopupDetails[idtsubmarket].TOTAL.sf/divider))+"</b></td><td><b>$"+numberWithComma(Math.ceil(submarketBuyerSalesStatisticsPopupDetails[idtsubmarket].TOTAL.amtsf/divider))+"</b></td></tr>";
			 }
		 }
		 
		 //OLD method
		 /* if(typeof submarketBuyerSalesStatisticsPopupDetails[idtsubmarket] != "undefined")
		 {
			 var divider = 0;
			 $.each(submarketBuyerSalesStatisticsPopupDetails[idtsubmarket], function (index, row){
				 console.log(row);
				 if(index != "TOTAL")
				 {
					divider++;
					nothingToShow = false;
					string += "<tr><td>"+index+"</td><td>"+row.deals+"</td><td>"+numberWithComma(row.sf)+"</td><td>$"+numberWithComma(row.amtsf)+"</td></tr>";
				 }
			 });
			 if(typeof submarketBuyerSalesStatisticsPopupDetails[idtsubmarket].TOTAL != "undefined")
			 {
				nothingToShow = false;
				string += "<tr><td><b>Total</b></td><td><b>"+submarketBuyerSalesStatisticsPopupDetails[idtsubmarket].TOTAL.deals+"</b></td><td><b>"+numberWithComma(submarketBuyerSalesStatisticsPopupDetails[idtsubmarket].TOTAL.sf)+"</b></td><td><b>$"+numberWithComma(Math.ceil(submarketBuyerSalesStatisticsPopupDetails[idtsubmarket].TOTAL.amtsf/divider))+"</b></td></tr>";
			 }
		 } */
		 if(nothingToShow == true)
			 tableRows = "<table><tbody><tr><td>Investor Profile data missing.</td></tr>";
	 }
	 else
	 {
		tableRows += "<tr><td>Class A</td><td>"+submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType]["A"].deals+"</td><td>"+submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType]["A"].sf+"</td><td>$"+submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType]["A"].amtsf+"</td></tr>";
		tableRows += "<tr><td>Class B</td><td>"+submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType]["B"].deals+"</td><td>"+submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType]["B"].sf+"</td><td>$"+submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType]["B"].amtsf+"</td></tr>";
		tableRows += "<tr><td>Class C</td><td>"+submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType]["C"].deals+"</td><td>"+submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType]["C"].sf+"</td><td>$"+submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType]["C"].amtsf+"</td></tr>";
		
		tableRows += "<tr>";
			tableRows += "<th>Total</th><th>"+submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType]["TOTAL"].deals+"</th><th>"+submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType]["TOTAL"].sf+"</th><th>$"+submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType]["TOTAL"].amtsf+"</th>";
		tableRows += "</tr>";
	}
	string += tableRows;
	string += "</tbody>";
	string += "</table>";
	$(".advancedStatistics").html(string);
}

function prepareAdvancedSalesStatisticsLayoutForAll()
{
	console.log("Preparing Advanced Statistics For Entire City ");
	//console.log(submarketOfficeStatisticsDetails[idtsubmarket]);
	$(".advancedStatistics").html("Preparing Sales Statistics");
	
	var string = "<table class='table table-bordered'>";
	string += "<tbody>";
	string += "<tr>";
		string += "<th>&nbsp;</th><th># Deals</th><th>Square Ft</th><th>$ / SF</th>";
	string += "</tr>";
	var bldgcnt = 0;
	
	var total_A_deals = total_B_deals = total_C_deals = 0;
	var total_A_sf = total_B_sf = total_C_sf = 0;
	var total_A_amtsf = total_B_amtsf = total_C_amtsf = 0;
	
	$.each(submarketDetails, function (idtsubmarket, eachSubmarket){
		if(typeof submarketSalesStatisticsPopupDetails[idtsubmarket] != "undefined")
		if(typeof submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType] != "undefined")
		$.each(submarketSalesStatisticsPopupDetails[idtsubmarket][currentSalesProductType], function (cls, row){
			console.log(row);
			if(cls == "A")
			{
				total_A_deals += parseInt(row.deals);
				total_A_sf += parseInt(row.sf.replace(/,/g, ''));
				total_A_amtsf += parseInt(row.amtsf.replace(/,/g, ''));
			}
			if(cls == "B")
			{
				total_B_deals += parseInt(row.deals);
				total_B_sf += parseInt(row.sf.replace(/,/g, ''));
				total_B_amtsf += parseInt(row.amtsf.replace(/,/g, ''));
			}
			if(cls == "C")
			{
				total_C_deals += parseInt(row.deals);
				total_C_sf += parseInt(row.sf.replace(/,/g, ''));
				total_C_amtsf += parseInt(row.amtsf.replace(/,/g, ''));
			}
		});
	});
	
		string += "<tr><td>Class A</td><td>"+total_A_deals+"</td><td>"+numberWithComma(total_A_sf)+"</td><td>$"+numberWithComma(total_A_amtsf)+"</td></tr>";
		string += "<tr><td>Class B</td><td>"+total_B_deals+"</td><td>"+numberWithComma(total_B_sf)+"</td><td>$"+numberWithComma(total_B_amtsf)+"</td></tr>";
		string += "<tr><td>Class C</td><td>"+total_C_deals+"</td><td>"+numberWithComma(total_C_sf)+"</td><td>$"+numberWithComma(total_C_amtsf)+"</td></tr>";
		
		string += "<tr>";
			string += "<th>Total</th><th>" + (parseInt(total_A_deals) + parseInt(total_B_deals) + parseInt(total_C_deals)) + "</th><th>" + numberWithComma(parseInt(total_A_sf) + parseInt(total_B_sf) + parseInt(total_C_sf)) + "</th><th>$" + numberWithComma(parseInt(total_A_amtsf) + parseInt(total_B_amtsf) + parseInt(total_C_amtsf)) + "</th>";
		string += "</tr>";
	string += "</tbody>";
	string += "</table>";
	$(".advancedStatistics").html(string);
}

function numberWithComma(x)
{
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function printNumberInCommaFormat(x)
{
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function sanitizeNumber(x)
{
	return parseFloat(x.replace(/,/g,''));
}

function showSubmarketStatistics(idtsubmarket)
{
	//submarketEntity()
	$(".submarketPlaceHolder").html(submarketDetails[idtsubmarket].ssubname);
	AclassBuildings = submarketEntity[idtsubmarket].AclassBuildings;
	BclassBuildings = submarketEntity[idtsubmarket].BclassBuildings;
	CclassBuildings = submarketEntity[idtsubmarket].CclassBuildings;
	refreshABCStatistics();
}

function showSubmarketSalesStatistics(idtsubmarket)
{
	//submarketEntity()
	$(".submarketPlaceHolder").html(submarketDetails[idtsubmarket].ssubname);
	AclassBuildings = submarketEntity[idtsubmarket].AclassBuildings;
	BclassBuildings = submarketEntity[idtsubmarket].BclassBuildings;
	CclassBuildings = submarketEntity[idtsubmarket].CclassBuildings;
	refreshABCStatistics();
}

function classIsValidForLoading(bldgClass)
{
	var myCheck = false;
	if(classAllowedForHighlight.length > 0)
	{
		$.each(classAllowedForHighlight, function (index, clss) {
			//console.log(index+" <==> "+clss);//buildingRow.buildingclass;
			//console.log(buildingRow.buildingclass.toLowerCase()+" != "+clss.toLowerCase());
			if(clss.includes("*"))
			{
				clss = clss.replace("*", "");
				//console.log(clss);
				//console.log(bldgClass.substr(0, clss.length).toLowerCase()+" == "+clss.toLowerCase());
				if(bldgClass.substr(0, clss.length).toLowerCase() == clss.toLowerCase())
				{
					myCheck = true;
				}
			}
			else if(bldgClass.toLowerCase() == clss.toLowerCase())
			{
				myCheck = true;
			}
		});
	}
	else
	{
		myCheck = true;
	}
	return myCheck;
}

function highlightStructure(id, coords, color, desc, idtsubmarket, bldgClass, bldgName)
{
	var parent = submarketEntity[idtsubmarket];
	if(bldgClass == "")
		parent = submarketBoundryEntityCollection;
	
	/* if(debug == true)
		console.log(id+" <> "+coords); */
	if(color == "")
		color = Cesium.Color.RED.withAlpha(0.5);
	var entity = viewer.entities.add({
		id : id,//"boundrySubmarketWall"+index,
		parent : parent,
		idtsubmarket : idtsubmarket,
		buildingClass : bldgClass,
		buildingName : bldgName,
		description : desc,
		polygon : {
			hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(eval(coords))),
			material : color,
			classificationType : Cesium.ClassificationType.BOTH
		}
	});
}

function highlightStructureV2_DELETED(id, coords, color, desc, idtsubmarket, bldgClass, bldgName)
{
	var alt = 2000;
	/*
	if(typeof buildingDetails.altitude != "undefined")
	{
		alt = buildingDetails.altitude;
	}
	//Some Adjustment
	alt = parseFloat(alt) + 50;
	*/
	viewerDemoResiApp.entities.removeById(id);//1.50 Change :  || true
	//coords = "["+coords+"]";
	console.log("Partial Coords!!!");
	console.log(coords);
	temp = eval(coords);
	var refinedCoords = [];
	for(var i = 0; i<=temp.length;i++)
	{
		if(typeof temp[i] != "undefined")
		{
			refinedCoords.push(temp[i]);
			i++;
		}
		if(typeof temp[i] != "undefined")
		{
			refinedCoords.push(temp[i]);
			i++;
		}
	}
	
	coords = refinedCoords;
	console.log("Partial Coords!!!");
	console.log(coords);
	defaultShow = true;
	var ent = viewerDemoResiApp.scene.primitives.add(new Cesium.ClassificationPrimitive({
		geometryInstances : new Cesium.GeometryInstance({
			geometry : new Cesium.PolygonGeometry({
			  polygonHierarchy : new Cesium.PolygonHierarchy(
				Cesium.Cartesian3.fromDegreesArray(coords)
			  ),
			  description : "",
			  height : parseFloat(alt),
			  extrudedHeight : 0
			}),
			/*modelMatrix : modelMatrix,*/
			attributes : {
				//color : defaultPrimitiveHighlightColor,
				color : Cesium.ColorGeometryInstanceAttribute.fromColor(eval(color)),
				show : new Cesium.ShowGeometryInstanceAttribute(defaultShow)
			},
			id : id
		}),
		classificationType : Cesium.ClassificationType.BOTH
	}));
	//window.primitiveCollection[window.primitiveCollection.length] = ent;
	
	return "";
	viewer.entities.removeById(id);//1.50 Change :  || true
	var parent = submarketEntity[idtsubmarket];
	if(bldgClass == "")
		parent = submarketBoundryEntityCollection;
	
	/* if(debug == true)
		console.log(id+" <> "+coords); */
	if(color == "")
		color = Cesium.Color.RED.withAlpha(0.5);
	var entity = viewer.entities.add({
		id : id,//"boundrySubmarketWall"+index,
		//parent : parent,//1.50 Change
		idtsubmarket : idtsubmarket,
		buildingClass : bldgClass,
		buildingName : bldgName,
		description : desc,
		polygon : {
			hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(eval(coords))),
			material : color,
			classificationType : Cesium.ClassificationType.BOTH
		}
	});
}

function highlightAllSubmarketBoundry()
{
	submarketBoundryEntityCollection.show = true;
	//BUG HERE in iterating market details
	highlightMarketBoundry(1);
	highlightMarketBoundry(2);
	highlightMarketBoundry(3);
	//highlightMarketBoundry(4);
}

function highlightMarketBoundry(idtmarket)
{
	$.each(submarketGroupDetails[idtmarket], function (index, idtsubmarket){
		//console.log("highlighting SubMarket : "+idtsubmarket);
		highlightSubmarketBoundry(idtsubmarket);
	});
}

function highlightSubmarketBoundry(idtsubmarket)
{
	//console.log("highlighting : "+idtsubmarket);
	viewer.entities.getById("submarketBoundryHighlight-"+idtsubmarket).show = true;
}

function clearHighlights()
{
	//console.log(submarketDetails);
	$.each(submarketDetails, function (index, subId){
		if(typeof subId != "undefined")
		{
			//console.log("idtsubmarket : " + subId.idtsubmarket);
			submarketEntity[subId.idtsubmarket].show = false;
			//console.log(submarketEntity[subId.idtsubmarket].show);
		}
	});
	removeAllSubmarkets();//1.50 Change
	return "";
}

function clearAllSubmarketBoundry()
{
	//console.log(submarketDetails);
	$.each(submarketDetails, function (index, subId){
		if(typeof subId != "undefined")
		{
			//console.log(subId);
			viewer.entities.getById("submarketBoundryHighlight-"+subId.idtsubmarket).show = false;
			//console.log(submarketEntity[subId.idtsubmarket].show);
		}
	});
	return "";
}

function flyToSubmarket(idtsubmarket)
{
	flyToCamera(submarketDetails[idtsubmarket].latitude, submarketDetails[idtsubmarket].longitude, submarketDetails[idtsubmarket].altitude, submarketDetails[idtsubmarket].heading, submarketDetails[idtsubmarket].tilt, submarketDetails[idtsubmarket].pitch, submarketDetails[idtsubmarket].roll, 2);
}

function flyToSubmarketGroup(groupId)
{
	flyToCamera(marketDetails[groupId].latitude, marketDetails[groupId].longitude, marketDetails[groupId].altitude, marketDetails[groupId].heading, marketDetails[groupId].tilt, marketDetails[groupId].pitch, marketDetails[groupId].roll, 2);
}

//Sidebar JS Starts
function openSidebar()
{
	$('#sidebar').addClass('active');
	$('.overlay').addClass('active');
	$('.collapse.in').toggleClass('in');
	$('a[aria-expanded=true]').attr('aria-expanded', 'false');
}

function closeSidebar()
{
	$('#sidebar').removeClass('active');
	$('.overlay').removeClass('active');	
}

	$('#dismiss, .overlay').on('click', function () {
		$('#sidebar').removeClass('active');
		$('.overlay').removeClass('active');
	});

	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').addClass('active');
		$('.overlay').addClass('active');
		$('.collapse.in').toggleClass('in');
		$('a[aria-expanded=true]').attr('aria-expanded', 'false');
	});
//Sidebar JS ends

function updateProgressBar()
{
	console.log("progressBarValueDemoResiApp : " + progressBarValueDemoResiApp);
	$(".progress-bar-demo-resiapp").css("width", progressBarValueDemoResiApp+"%");
	$(".progress-bar-demo-resiapp").html(progressBarValueDemoResiApp+"% Complete");
	if(progressBarValueDemoResiApp == 100)
	{
		setTimeout(function (){$("#progressModalDemoResiApp").modal("hide");}, 2000);
	}
}

function enableSubmarketEntityParent()
{
	$.each(submarketDetails, function (index, subId){
		if(typeof subId != "undefined")
		{
			//console.log(subId);
			submarketEntity[subId.idtsubmarket].show = true;
			//console.log(submarketEntity[subId.idtsubmarket].show);
		}
	});
	return "";
}
//To Set default camera as NYC Camera.
//cityOverview(true);
//loadCityDetails();

var mySubmarket = "";
var fogColor = "";
fogColor = Cesium.Color.WHITE;
fogColor = Cesium.Color.fromAlpha(fogColor, 0.3);

function tryFogHighlightV2(idtbuilding, idtsubmarket)
{
	clearHighlights();
	var coords = submarketDetails[idtsubmarket].coords.split(",0");
	//console.log("coords");
	//console.log(coords);
	var coordsToUse = "";
	for(var i = 0; i < coords.length-1;i++)
	{
		if(coords[i].length > 5)
		{
			if(coordsToUse != "")
				coordsToUse = coordsToUse + ",";
			coordsToUse = coordsToUse + coords[i];
		}
	}
	//console.log("coordsToUse");
	//console.log(coordsToUse);
	//var submarketCoords = "-74.00996670466664,40.70982037227822,-74.01054692699336,40.70917317395757,-74.01086412854285,40.70881043307966,-74.01106370765784,40.70860465003316,-74.01127339808507,40.70835714599328,-74.01197820519617,40.70743255874946,-74.01253202224137,40.70675508955115,-74.01331196479374,40.70581779684508,-74.01392418881272,40.70510640770932,-74.01427950494157,40.70451286834759,-74.01452481258754,40.70405372212023,-74.01560201652872,40.70187687322135,-74.01577950721361,40.70134292327319,-74.0151440153038,40.70085520726914,-74.01502977727814,40.7010038120606,-74.0141634661093,40.70055698263897,-74.01323101441733,40.70055239196145,-74.01232639201531,40.70064014481208,-74.01142044051417,40.70070820797726,-74.01028780935675,40.70093559946972,-74.00957320059898,40.70178164881446,-74.00861727088839,40.7005175466166,-74.00833553866319,40.70066453072111,-74.00843956361794,40.70082821909481,-74.00759390646344,40.70131183600167,-74.00775514688972,40.70146288911331,-74.00849839164161,40.70114348478216,-74.00903919489396,40.70187649610623,-74.00691952845757,40.70348479363524,-74.00675750093781,40.70352478843537,-74.00554366352577,40.70238005253376,-74.00529069989803,40.70256100007706,-74.00614505185506,40.7038151735822,-74.00415881233197,40.70506636810243,-74.00994370697302,40.70983685392749,-74.00996670466664,40.70982037227822";
	
	var buildingCoords = "";
	$.each(submarketBuildingDetails[idtsubmarket], function (index, buildingRow){
		if(buildingRow.idtbuilding == idtbuilding)
		{
			buildingCoords = buildingRow.coords;
			//break;
		}
	});
	//var buildingCoords = "-74.01153424206372, 40.70195429090461, -74.01152041809252, 40.701906105898885, -74.01150593112246, 40.701855609343546, -74.01206092364532, 40.70176338243317, -74.0123518126863, 40.70171504272347, -74.01240660535919, 40.701906013788935, -74.0124141475606, 40.70193229981783, -74.01249208470077, 40.70191934832842, -74.01249228480128, 40.701920048004425, -74.01253344038598, 40.70206348696567, -74.01257410358977, 40.702205210488316, -74.012574668374, 40.70220717804497, -74.01260159453724, 40.70230102104043, -74.01240443322831, 40.70233378596783, -74.0121095114668, 40.702382795311, -74.01176397207773, 40.702440215360504, -74.0116104863835, 40.702465719931936, -74.01159856892758, 40.7024677004584, -74.0114980934807, 40.7021174933848, -74.0114890657432, 40.70208602770072, -74.01155257151413, 40.702075474549396, -74.01156826218825, 40.70207286689219, -74.01156786555825, 40.702071483745826, -74.01153424206372, 40.70195429090461";
	console.log("Building Coords ");
	console.log("["+buildingCoords+"]");
	var bluePolygon = viewer.entities.add({
		name : 'sampleTest with fog effect',
		polygon : {
			hierarchy : {
				positions : Cesium.Cartesian3.fromDegreesArray(eval("["+coordsToUse+"]")),
				holes : [{
					positions : Cesium.Cartesian3.fromDegreesArray(eval("["+buildingCoords+"]"))
				}]
			},
			material : fogColor,
			classificationType : Cesium.ClassificationType.CESIUM_3D_TILE
		}
	});
}

//$(".waitTimerContainer").html("&nbsp;"+waitTimer+"&nbsp;");
window.lastSelectedUnitPrimitive = null;
function goBackToPreviousUnit()
{
	selectedPrimitiveId = window.lastSelectedUnitPrimitive.id;
	selectedPrimitive = window.lastSelectedUnitPrimitive.primitive;
	if(typeof selectedPrimitiveId != 'object')
	{
		
		console.log("selectedPrimitiveId : "+ selectedPrimitiveId);
		if(selectedPrimitiveId.split("-")[0] == "resirental")
			createResiRentalBorderBottomAndUp(selectedPrimitiveId.split("-")[1]);
		
		attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
		currentColor = attributes.color;
		currentShow = attributes.show;
		if (!viewerDemoResiApp.scene.invertClassification) {
			if(window.visualizationType != null)
			{
				attributes.color = [currentColor[0], currentColor[1], currentColor[2], 128];
			}
			else
			{
				attributes.color = [255, 0, 0, 128];
			}
		}
		attributes.show = [1];
		if(typeof selectedPrimitiveId.replace != "undefined")
		{
			resetUnitsPictureCounters();
			var t = selectedPrimitiveId.replace("resirental-", "");
			console.log(t);
			prepareCondoInformation(t);
			preparePropSeeTabInformation(selectedRetalG.idtbuilding, selectedRetalG.number, selectedRetalG.unit);
		}
	}
}

//ViewShed Task
window.IsEnableViewshedPanel = false;
window.arrViewField = [];
window.viewModel = { verticalAngle: 90, horizontalAngle: 120, distance: 10 };

function ToggleViewShedPanel() {
  window.IsEnableViewshedPanel = true;
  $("#ViewshedPanel").css("display", "block");
  window.IsEnableMenuPanel = false;
  $("#menuPanel").css("display", "none");
  $("#slider").css("display", "none");
  $("#TilesetCompareExit").css("display", "none");
}
function CloseViewshedPanel() {
  window.IsEnableViewshedPanel = false;
  $("#ViewshedPanel").css("display", "none");
}
function addViewField() {
  var e = new Cesium.ViewShed3D(viewer, {
    horizontalAngle: Number(viewModel.horizontalAngle),
    verticalAngle: Number(viewModel.verticalAngle),
    distance: Number(viewModel.distance),
    calback: function () {
      viewModel.distance = e.distance;
    },
  });
  arrViewField.push(e);
}
function clearAllViewField() {
	if(typeof window.viewModel != "undefined")
	{
		  for (var e = 0, i = arrViewField.length; e < i; e++) {
			arrViewField[e].destroy();
		  }
		  arrViewField = [];
	}
}
