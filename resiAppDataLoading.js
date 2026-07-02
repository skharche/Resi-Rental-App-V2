//Initialize Variables
window.app_name = "Demo.resirentalApp";
window.ResiRentalDataLoaded = false;
var progressBarValueDemoResiApp = 0;
var marketDetails = [];
var submarketDetails = [];
var selectedRetalG = null;
var resiRentalImageContainer = [];
var currentImageCounter = 0;

var buildingData = [];
var buildingFloorsData = [];
var buildingCondoData = [];
var condoNames = [];
var buildingAmenitiesData = [];
var currentCondoImages = [];

var allSubmarketsWithHoles = [];
var primitiveCollection = [];
var lastPickX = "";
var lastPickY = "";
var fogChecked = true;

var currentBuilding = "";
var currentCondo = "";
var defaultEntityHighlightColor = Cesium.Color.RED.withAlpha(1);
var defaultEntityHighlightColorSelected = Cesium.Color.GREEN.withAlpha(1);
var defaultPrimitiveHighlightColor = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.RED.withAlpha(1));
var defaultPrimitiveRingColor = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.YELLOW.withAlpha(0.5));
var defaultPrimitiveHighlightColorSelected = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.GREEN.withAlpha(0.5));

var resirentalData = [];

//PPT Labels
window.pptLabels = [];
window.pptLabels["square_feet"] = "Sq Ft";
window.pptLabels["feet"] = "Ft";
window.pptLabels["amt_per_sqft"] = "$ / Sq Ft";
window.pptLabels["amt_per_unit"] = "$ / Unit";
window.pptLabels["total"] = "Total";
window.pptLabels["number_of_buildings"] = "#&nbsp;Buildings";
window.pptLabels["number_of_properties"] = "# Properties";
window.pptLabels["number_of_units"] = "#&nbsp;Units";

//Initial Loading
getAllBuildingsData();

function setFlyToBuildingLink(idtbldg, name)
{
	return "<a href='javascript:flyToBuilding("+idtbldg+");'>"+name+"</a>";
}

function flyToSubmarket(idtsubmarket)
{
	if(idtsubmarket != "")
	{
		$.ajax({
		  method: "POST",
		  url: apiBaseUrl+"controllers/submarketController.php",
		  data: { param : "getSubmarket" , idtsubmarket : idtsubmarket}//, "getReminderToo": "yes"
		})
		.done(function( data ) {
			data = $.parseJSON( data );
			console.log(data);
			if(data.status == "success")
			{
				console.log(data.data[0]);
				if(typeof data.data[0] != "undefined")
				{
					flyToCamera(data.data[0].latitude, data.data[0].longitude, data.data[0].altitude, data.data[0].heading, data.data[0].tilt, data.data[0].pitch, data.data[0].roll, 2, viewerDemoResiApp.camera);
				}
			}
			else
			{
				alert("Something went wrong");
			}
		});
	}
}

function flyToIdtcamera(idtcamera, duration = "")
{
	if(duration == "")
		duration = 4;
	
	$.ajax({
	  method: "POST",
	  url: apiBaseUrl+"controllers/cameraController.php",
	  data: { param : "getCamera" , idtcamera : idtcamera}
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		//console.log(data);
		if(data.status == "success")
		{
			console.log(data.data[0]);
			if(typeof data.data[0] != "undefined")
			{
				flyToCamera(data.data[0].latitude, data.data[0].longitude, data.data[0].altitude, data.data[0].heading, data.data[0].tilt, data.data[0].pitch, data.data[0].roll, duration, viewerDemoResiApp.camera);
			}
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

//Load all Market Details
function loadMarketDetails()
{
	window.marketDetails = [];
	$.ajax({
	  method: "POST",
	  url: window.apiBaseUrl+"controllers/marketController.php",
	  data: { sourceApp : window.app_name, param : "getMarket" , "idtmarket" : 0}
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		if(typeof updateProgressBar != "undefined"){ window.loadingAjaxCall++; updateProgressBar(); }
		if(data.status == "success")
		{
			$.each(data.data, function (index, row){
				window.marketDetails[row.idtmarket] = row;
				window.marketDetails[row.idtmarket].submarkets = [];
			});
		}
		else
		{
			alert("Something went wrong");
		}
	});
}


//Load all Submarket Details
function loadSubmarketDetails()
{
	$.ajax({
	  method: "POST",
	  url: apiBaseUrl+"controllers/submarketController.php",
	  data: { param : "getSubmarket" , "idtsubmarket" : 0, "idtmarket" : 1, "sortBy" : "name"}
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		console.log(data);
		if(data.status == "success")
		{
			$.each(data.data, function(index, row){
				//SK: 27/04 change for Fog
				row.coordsToUse = processCoordsForCesium(row.coords);
				submarketDetails[row.idtsubmarket] = row;
			});
			
			drawSubmarketWhiteBoundary();
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

function loadMinMaxPriceForSubmarket(idtsubmarket)
{
  if(idtsubmarket == "") {
    idtsubmarket = "all";
  }
	$.ajax({
	  method: "POST",
	  url: apiBaseUrl+"controllers/submarketController.php",
	  data: { param : "getRentalSaleRange", idtsubmarket : idtsubmarket }
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		console.log(data);
		if(data.status == "success")
		{
			$(".rangeMinValue").html(numberWithCommas("$", data.min));
			$(".rangeMaxValue").html(numberWithCommas("$", data.max));
			$(".slider").slider('setAttribute', 'min', data.min);
			$(".slider").slider('setAttribute', 'max', data.max);
			$(".slider").slider('setAttribute', 'value', [data.min, data.max]);
			$(".slider").slider('refresh');
			window.priceFrom = parseInt(data.min);
			window.priceTo = parseInt(data.max);
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

function loadLoggedInUserDetail()
{
	console.log('loadLoggedInUserDetail');
	if(typeof sessionData.idtusers != "undefined")
	{
		$.ajax({
		  method: "POST",
		  url: window.apiBaseUrl+"controllers/userLoginHistoryController.php",
		  data: { sourceApp : window.app_name, param : "getAppwiseUserLoginHistory", idtuser: sessionData.idtusers, sessionId : ""}
		  })
		.done(function( data ) {
			data = $.parseJSON( data );
			console.log(data);
			window.pptProfiles = data.profiles;
			var profile;
			var options = { year: 'numeric', month: 'long', day: 'numeric' };
			var created_date;

			if(window.pptProfiles.length > 0)
			{
				profile = window.pptProfiles[0].profile_name;
			}
			else
			{
				profile = "Default";
			}
			
			if(data.status == "success")
			{
				created_date = new Date(data.data[0].date_created);
				created_date = created_date.toLocaleDateString("en-US", options);

				$(".userLoggedInInfoDetails").html("");
				var str = "<b>User Settings</b><button type='button' style='margin-right: -65px;' class='close ' data-dismiss='modal' onClick='toggleUserSection(true);'>&times;</button>";
					str += "<table class='table table-striped'>";
					str += "<tr><td colspan='2'><b>"+sessionData.first_name+" "+sessionData.last_name+"</b></td></tr>";
					str += "<tr><th>Profile</th><td>"+profile+"</td></tr>";
					str += "<tr><th>User Since</th><td>"+created_date+"</td></tr>";
					str += "<tr><th>App</th><th>Login Count</th></tr>";
				$.each(data.data, function (index, row){
					str += "<tr><td><a href='"+row.app_url+"' target='_blank'>"+row.app_name+"</a></td><td>"+row.loginCount+"</td></tr>";
				});
					str += "</table>";
					
				$(".userLoggedInInfoDetails").html(str);
				$(".userNameContainer").html(sessionData.first_name+"&nbsp;");
			}
			else
			{
				alert("Something went wrong");
			}
		});
	}
}


window.buildingData = [];
window.resiRentalEntities = [];
window.resiRentalAllData = [];
window.resiRentalAllDataMap = [];
window.firstClipDone = false;
window.firstFiltered = false;
window.bedsSelected = [];
function filterPresentationData()
{
	$("#BackToUnitButton").addClass("hide");
	if(typeof Slider != "undefined" && window.ResiRentalDataLoaded == true)
	{
		//$(".filterMessage").html("");
		$('#submarketStatistics').fadeOut();
		updatePriceRange();
		window.firstFiltered = true;
		filterResiRentalLoadedData();
		//createFogEffectForSubmarketWithBuildingHoles();
	}
	else
	{
		$(".filterMessage").html("<font class='text-red text-sm'>Loading...</font>");
		setTimeout(function(){ filterPresentationData(); }, 2000);
	}
}

function getResiRentalData()
{
	$.ajax({
	  method: "POST",
	  url: apiBaseUrl+"controllers/residentialRentalController.php",
	  data: { param : "getResirentalCondoDefaultDataOnly" }//27-10-2021 Changed this condition to get data
	})
	.done(function( data ) {
		$(".fa-cog").addClass("hide");
		data = $.parseJSON( data );
		console.log(data);
		if(data.status == "success")
		{
			//getResiRentalDataFromZip(data.filename);
			//jsonData = $.parseJSON(jsonData);
			console.log("Response Received");
			console.log(data.data);
			window.buildingData = data.data.bldgData;
			window.resirentalData.condo = data.data.condo;
			window.resirentalData.rental = data.data.rental;
			window.resirentalStats = data.data.stats;
			window.resirentalStatsOriginal = data.data.stats;
			window.residentialPartialCamera = data.data.partialCamera;
			window.ResiRentalDataLoaded = true;
		}
	});
}

function getResiRentalDataFromZip(zipFile)
{
	console.log("getResiRentalDataFromZip "+zipFile);
	JSZipUtils.getBinaryContent(zipFile, function(err, data) {
		var elt = document.getElementById('jszip_utils');
		if(err) {
		  showError(elt, err);
		  return;
		}

		try {
		  JSZip.loadAsync(data)
		  .then(function(zip) {
			  //console.log("Loading Zip...");
			  //console.log(zip);
			  var jsonFileName = zipFile.replace(".zip", ".json");
			  console.log("jsonFileName: "+jsonFileName);
			return zip.file(jsonFileName).async("string");
		  })
		  .then(function success(text) {
				console.log("to getResiRentalDataFromZip");
			getResiRentalDataFromJSON(text);
		  }, function error(e) {
			showError(elt, e);
		  });
		} catch(e) {
		  showError(elt, e);
		}
	});

	function showError(ele, e)
	{
		//console.log("ERRROR");
		//console.log(ele);
		//console.log(e);
	}
}

function getResiRentalDataFromJSON(jsonData)
{
	jsonData = $.parseJSON(jsonData);
	console.log("Response Received");
	console.log(jsonData);
	window.buildingData = jsonData.data.bldgData;
	window.resirentalData.condo = jsonData.data.condo;
	window.resirentalData.rental = jsonData.data.rental;
	window.resirentalStats = jsonData.data.stats;
	window.residentialPartialCamera = jsonData.data.partialCamera;
}

window.buildingPartialsMap = [];
function filterResiRentalLoadedData()
{
	resetResiStat();
	clearLegendElement();
	if(window.firstClipDone)
		clearClippingPlane();
	window.resiRentalAllData = [];
	
	window.resiRentalEntities = [];
	window.submarketFogHighlightBag = [];//Clear Fog
	window.submarketFogHighlightBagSeparatedBuildings = [];//Separated buildings
	clearCondoHighlight();
	allSubmarketsWithHoles = [];
	var idtsubmarket = $("#idtsubmarket").val();
	var rentalUnits = $("#runits").val();
	bedsForFiltering = [];
	if(rentalUnits == "" || rentalUnits == 4)
	{
		window.bedsSelected = [0,1,2,3];
		
		bedsForFiltering = [0,1,2,3,4,5,6,7,8];
	}
	else
	{
		window.bedsSelected = [parseInt(rentalUnits)];
		bedsForFiltering = [parseInt(rentalUnits)];
	}
	//var unitType = $("#unitType").val();
	var productType = $("#tbuildings").val();
	var temp = $("#priceSlider").val().split(",");
	var pfrom = temp[0];
	var pto = temp[1];
	if( $('#idtsubmarket').val() == '')
		idtsubmarket = "all";
	if( $('#runits').val() == '' )
		rentalUnits = 4;
	if( $('#tbuildings').val() == '' ) {
		productType = 2;
		//pfrom = 0;
		//pto = 1000000;
	}
	if(idtsubmarket == "all")
	{
		$.each(submarketDetails, function(index, r) {
			allSubmarketsWithHoles[index] = []
		});
	}
	else
	{
		allSubmarketsWithHoles[idtsubmarket] = [];
	}
	
	/*
		0 -> Rental
		1 -> Condo
	*/
	bldgTypeArr = ["rental", "condo"];
	
	window.count = 0;
	$.each(bldgTypeArr, function (i, eachType){
		if(productType == 2 || productType == i)
		{
			console.log("highlighting '"+i+"'");
			
			if(eachType == "rental")
				dataToIterate = window.resirentalData.rental;
			if(eachType == "condo")
				dataToIterate = window.resirentalData.condo;
			$.each(dataToIterate, function (index, row){
				if(checkIfFloorToSkip(parseInt(row.idtbuilding), parseInt(row.number)))
				{
					if(idtsubmarket == "all" || parseInt(idtsubmarket) == parseInt(row.idtsubmarket))
					{
						if(filterWithPrice(parseInt(row.monthly_rent)) && bedsForFiltering.includes(parseInt(row.beds)))
						{
							//Update Stat box here
							updateResiRentalStat(parseInt(row.idtsubmarket), parseInt(row.idtbuilding), parseInt(row.beds), parseInt(row.monthly_rent));
							
							if(typeof window.buildingPartialsMap[row.idtbuilding] == "undefined")
								window.buildingPartialsMap[row.idtbuilding] = [];
							if(!window.buildingPartialsMap[row.idtbuilding].includes(row.idtresirentals))
							{
								window.buildingPartialsMap[row.idtbuilding].push(row.idtresirentals);
							}
							//Price Filter remaining
							window.resiRentalAllData.push(row);
							
							/* if(window.clippingPlaneBuildings.includes(parseInt(row.idtbuilding)))
								createFloatingRingAroundPartial(row.idtresirentals); */
							
							var ht = parseFloat(row.bottomfloorheight) + parseFloat(row.adjustment) + parseFloat(row.floorheight);
							
							cesColor = defaultPrimitiveHighlightColor;
							if(window.visualizationType == "Bedrooms")
							{
								cesColor = getBedsColor(parseInt(row.beds));
								cesColor = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(cesColor).withAlpha(1));
							}
							else if(window.visualizationType == "Monthly Rent")
							{
								cesColor = getPSFColor(parseInt(row.monthly_rent));
								cesColor = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(cesColor).withAlpha(1));
							}
							
							window.resiRentalAllDataMap[index] = window.resiRentalAllData.length - 1;
							window.count++;
							//Upper Border
							//ent = highlightBuildingCondo("", "upper-border-"+index, ht, ht-0.25, "resirental-"+index, row.coords, cesColor);
							//resiRentalEntities.push({"entity": ent, "id": "upper-border-"+index, "beds": row.beds, "monthlyRent": row.monthly_rent});
							//Bottom Border
							//ent = highlightBuildingCondo("", "bottom-border-"+index, parseFloat(row.bottomfloorheight), (parseFloat(row.bottomfloorheight)+0.25), "resirental-"+index, row.coords, cesColor);
							//resiRentalEntities.push({"entity": ent, "id": "bottom-border-"+index, "beds": row.beds, "monthlyRent": row.monthly_rent});
							
							ent = highlightBuildingCondo(row.idtbuilding, "resirental-"+index, ht, parseFloat(row.bottomfloorheight), "resirental-"+index, row.coords, cesColor);
							resiRentalEntities.push({"entity": ent, "id": "resirental-"+index, "beds": row.beds, "monthlyRent": row.monthly_rent, "idtsub": row.idtsubmarket, "idtbldg": row.idtbuilding});
							createResiRentalBorderBottomAndUpForAll(index);
						}
						else
						{
							console.log("Skipping Price or Beds");
						}
					}
					else
					{
						console.log("Skipping Submarket");
					}
				}
				else
				{
					console.log("Skipping CheckIfFloor()");
					if(idtsubmarket == "all")
						window.count++;
				}
			});
		}
	});
	
	console.log("Stats Ready "+window.resirentalStats);
	console.log(window.resirentalStats);
	
	if(productType == 2)
	{
		if(idtsubmarket != "all")
		{
			if(bedsForFiltering.length == 1)
			{
				if(bedsForFiltering.includes(0))
					window.count = parseInt(window.resirentalStats[idtsubmarket].studio);
				if(bedsForFiltering.includes(1))
					window.count = parseInt(window.resirentalStats[idtsubmarket].onebhk);
				if(bedsForFiltering.includes(2))
					window.count = parseInt(window.resirentalStats[idtsubmarket].twobhk);
				if(bedsForFiltering.includes(3))
					window.count = parseInt(window.resirentalStats[idtsubmarket].more);
				if(bedsForFiltering.includes(4))
					window.count = parseInt(window.resirentalStats[idtsubmarket].studio) + parseInt(window.resirentalStats[idtsubmarket].onebhk) + parseInt(window.resirentalStats[idtsubmarket].twobhk) + parseInt(window.resirentalStats[idtsubmarket].more);
			}
			else
			{
				window.count = parseInt(window.resirentalStats[idtsubmarket].studio) + parseInt(window.resirentalStats[idtsubmarket].onebhk) + parseInt(window.resirentalStats[idtsubmarket].twobhk) + parseInt(window.resirentalStats[idtsubmarket].more);
			}
		}
		else
		{
			window.count = 0;
			for(i=3;i<=7;i++)
			{
				if(bedsForFiltering.length == 1)
				{
					if(bedsForFiltering.includes(0))
						window.count += parseInt(window.resirentalStats[i].studio);
					if(bedsForFiltering.includes(1))
						window.count += parseInt(window.resirentalStats[i].onebhk);
					if(bedsForFiltering.includes(2))
						window.count += parseInt(window.resirentalStats[i].twobhk);
					if(bedsForFiltering.includes(3))
						window.count += parseInt(window.resirentalStats[i].more);
					if(bedsForFiltering.includes(4))
						window.count += parseInt(window.resirentalStats[i].studio) + parseInt(window.resirentalStats[i].onebhk) + parseInt(window.resirentalStats[i].twobhk) + parseInt(window.resirentalStats[i].more);
				}
				else
				{
					window.count += parseInt(window.resirentalStats[i].studio) + parseInt(window.resirentalStats[i].onebhk) + parseInt(window.resirentalStats[i].twobhk) + parseInt(window.resirentalStats[i].more);
				}
			}
		}
	}
	//Stats related changes here.
	var IsWithoutFilter = CheckIfNoFilterApplied();
	if(!isNaN(window.count))
	{
		if(IsWithoutFilter && window.count == 1606)
		{
			window.count = 1600;
		}
		$('.filterMessage').each(function() {
			var $this = $(this),
			countTo = window.count;
			$({ countNum: $this.text()}).animate({
			  countNum: countTo
			},
			{
			  duration: 1500,
			  easing:'linear',
			  step: function() {
				  if(!isNaN(Math.floor(this.countNum)))
					$this.text(Math.floor(this.countNum) + " results");
			  },
			  complete: function() {
				  if(!isNaN(this.countNum))
					$this.text(this.countNum + " results");
			  }
			});
		});
	}
	
	if(window.visualizationType == "Bedrooms")
		createLegendForBedsVisualization();
	if(window.visualizationType == "Monthly Rent")
		createLegendForPricePSFVisualization();
	
	var testhtml = "";
	var submarketOrder = [3,4,7,6,5];
	var totalrentals = 0;
	testhtml += "<table class='table' style='margin-bottom:-7px !important;'>";
	testhtml += "<tr><th>Submarket</th><th class='bed0head'>Studio</th><th class='bed1head'>1 Bed</th><th class='bed2head'>2 Bed</th><th class='bed3head'>3+ Bed</th><th>Total</th></tr>";
	submarketHtml = [];
	console.log("window.resirentalStats");
	console.log(window.resirentalStats);
	if(IsWithoutFilter)
	{
		$.each(window.resirentalStatsOriginal, function(index, row) {
			if(typeof index != "undefined" && typeof row != "undefined")
			{
				if(idtsubmarket == "all" || idtsubmarket == index)
				{
				  var tot = 0;
				  tot = parseInt(row.studio) + parseInt(row.onebhk) + parseInt(row.twobhk) + parseInt(row.more);
				  totalrentals += tot;
				  var flyfunc = "flyToIdtcamera("+submarketDetails[index].idtcamera+")";
				  submarketHtml[index] = "<tr><td><a href='javascript:void(0);' onclick='"+flyfunc+"'>"+submarketDetails[index].ssubname+"</a></td><td>"+row.studio+"</td><td>"+row.onebhk+"</td><td>"+row.twobhk+"</td><td>"+row.more+"</td><td>"+tot+"</td></tr>";
				}
			}
		});
	}
	else
	{
		$.each(window.resirentalStats, function(index, row) {
			if(typeof index != "undefined" && typeof row != "undefined")
			{
				if(idtsubmarket == "all" || idtsubmarket == index)
				{
				  var tot = 0;
				  tot = parseInt(row.studio) + parseInt(row.onebhk) + parseInt(row.twobhk) + parseInt(row.more);
				  totalrentals += tot;
				  var flyfunc = "flyToIdtcamera("+submarketDetails[index].idtcamera+")";
				  submarketHtml[index] = "<tr><td><a href='javascript:void(0);' onclick='"+flyfunc+"'>"+submarketDetails[index].ssubname+"</a></td><td>"+row.studio+"</td><td>"+row.onebhk+"</td><td>"+row.twobhk+"</td><td>"+row.more+"</td><td>"+tot+"</td></tr>";
				}
			}
		});
	}
	$.each(submarketOrder, function (i, r){
		if(typeof submarketHtml[r] != "undefined")
		{
			testhtml += submarketHtml[r];
		}
	});
	testhtml += "<tr><th>Total</th><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td><span class='totalCountBigText boldText'>"+totalrentals+"</span></td></tr>";
	testhtml += "</table>";
	$('#substatsinfo').html(testhtml);
	$('#submarketStats').css('right', '15px').removeClass('sm-collapsed');
	$('#submarkCollapseIcon').removeClass('fa-chevron-left').addClass('fa-chevron-right');
	$('#submarketStats').show();
	$("#residetails").hide();
	if(!window.fogChecked)
	{
		window.fogChecked = true;
		$(".toggleContainer2").addClass("fa-toggle-on text-grey-color");
	}
	if(window.fogChecked)
	{
		fogToggle(true);
	}
}

function CheckIfNoFilterApplied()
{
	if($("#idtsubmarket").val() == "" && $("#tbuildings").val() == "" && $("#runits").val() == "" && window.priceFrom == 0 && window.priceTo == 49000)
	{
		return true;
	}
	else
	{
		false;
	}
}

function resetResiStat()
{
	window.resirentalStats = [];
	window.resirentalStats[3] = {"idtsubmarket": 3, "onebhk": 0, "twobhk": 0, "more": 0, "studio": 0};
	window.resirentalStats[4] = {"idtsubmarket": 4, "onebhk": 0, "twobhk": 0, "more": 0, "studio": 0};
	window.resirentalStats[5] = {"idtsubmarket": 5, "onebhk": 0, "twobhk": 0, "more": 0, "studio": 0};
	window.resirentalStats[6] = {"idtsubmarket": 6, "onebhk": 0, "twobhk": 0, "more": 0, "studio": 0};
	window.resirentalStats[7] = {"idtsubmarket": 7, "onebhk": 0, "twobhk": 0, "more": 0, "studio": 0};
	window.submarketFogHighlightBag = [];
}

function updateResiRentalStat(idtsub, idtbldg, beds, price)
{
	addToSubmarketBag(idtbldg);
	//console.log("idtsub: "+idtsub+", idtbldg: "+idtbldg+", beds: "+beds+", price: "+price);
	if(beds == 0)
		window.resirentalStats[idtsub].studio = window.resirentalStats[idtsub].studio + 1;
	else if(beds == 1)
		window.resirentalStats[idtsub].onebhk = window.resirentalStats[idtsub].onebhk + 1;
	else if(beds == 2)
		window.resirentalStats[idtsub].twobhk = window.resirentalStats[idtsub].twobhk + 1;
	else
		window.resirentalStats[idtsub].more = window.resirentalStats[idtsub].more + 1;
}

function filterWithPrice(price)
{
	//console.log( window.priceFrom +" <= "+ parseInt(price)+" && "+window.priceTo+" >= "+parseInt(price) );
	if( window.priceFrom <= parseInt(price) && window.priceTo >= parseInt(price) )
	{
		return true;
	}
	else
		return false;
}

function filterLoadedData()
{
	console.log("IN filterLoadedData()");
	resetResiStat();
	window.count = 0;
	$.each(window.resiRentalEntities, function (index, entities){
		if(filterWithPrice(parseInt(entities.monthlyRent)) && bedsForFiltering.includes(parseInt(entities.beds)))
		{
			//console.log("entities.entity.show = true");
			entities.entity.show = true;
			updateResiRentalStat(entities.idtsub, entities.idtbldg, entities.beds, entities.monthlyRent);
			window.count++;
		}
		else
		{
			//console.log("entities.entity.show = false");
			entities.entity.show = false;
		}
	});
	if(!isNaN(window.count))
	{
		$('.filterMessage').each(function() {
			var $this = $(this),
			countTo = window.count;
			
			$({ countNum: $this.text()}).animate({
			  countNum: countTo
			},
			{
			  duration: 1500,
			  easing:'linear',
			  step: function() {
				  if(!isNaN(Math.floor(this.countNum)))
					$this.text(Math.floor(this.countNum) + " results");
			  },
			  complete: function() {
				  if(!isNaN(this.countNum))
					$this.text(this.countNum + " results");
			  }
			});
			
		});
	}
	//createFogEffectForSubmarketWithBuildingHoles();
}

window.lastTwoFloorBorder = [];
window.lastSelectedEntityId = null;

function createResiRentalBorderBottomAndUp(index)
{
	window.lastSelectedEntityId = index;
	if(typeof window.lastTwoFloorBorder[0] != "undefined")
		window.lastTwoFloorBorder[0].destroy();
	if(typeof window.lastTwoFloorBorder[1] != "undefined")
		window.lastTwoFloorBorder[1].destroy();
	dataToIterate = [];
	if(typeof window.resirentalData.rental[index] != "undefined")
		dataToIterate = window.resirentalData.rental;
	if(typeof window.resirentalData.condo[index] != "undefined")
		dataToIterate = window.resirentalData.condo;
	if(dataToIterate[index] != "undefined")
	{
		row = dataToIterate[index];
		var ht = parseFloat(row.bottomfloorheight) + parseFloat(row.adjustment) + parseFloat(row.floorheight);
		
		cesColor = defaultPrimitiveHighlightColor;
		if(window.visualizationType == "Bedrooms")
		{
			cesColor = getBedsColor(parseInt(row.beds));
			cesColor = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(cesColor).withAlpha(1));
		}
		else if(window.visualizationType == "Monthly Rent")
		{
			cesColor = getPSFColor(parseInt(row.monthly_rent));
			cesColor = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(cesColor).withAlpha(1));
		}
		
		//Upper Border
		ent = highlightBuildingCondo("", "upper-border-"+index, ht, ht-0.25, "resirental-"+index, row.coords, cesColor);
		window.lastTwoFloorBorder[0] = ent;
		//resiRentalEntities.push({"entity": ent, "id": "upper-border-"+index, "beds": row.beds, "monthlyRent": row.monthly_rent});
		//Bottom Border
		ent = highlightBuildingCondo("", "bottom-border-"+index, parseFloat(row.bottomfloorheight), (parseFloat(row.bottomfloorheight)+0.25), "resirental-"+index, row.coords, cesColor);
		window.lastTwoFloorBorder[1] = ent;
		//resiRentalEntities.push({"entity": ent, "id": "bottom-border-"+index, "beds": row.beds, "monthlyRent": row.monthly_rent});
		
	}
	else
	{
		console.log("ID Not found");
		return "";
	}
}
function createResiRentalBorderBottomAndUpForAll(index)
{
	dataToIterate = [];
	if(typeof window.resirentalData.rental[index] != "undefined")
		dataToIterate = window.resirentalData.rental;
	if(typeof window.resirentalData.condo[index] != "undefined")
		dataToIterate = window.resirentalData.condo;
	if(dataToIterate[index] != "undefined")
	{
		row = dataToIterate[index];
		var ht = parseFloat(row.bottomfloorheight) + parseFloat(row.adjustment) + parseFloat(row.floorheight);
		
		cesColor = defaultPrimitiveHighlightColor;
		if(window.visualizationType == "Bedrooms")
		{
			cesColor = getBedsColor(parseInt(row.beds));
			cesColor = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(cesColor).withAlpha(1));
		}
		else if(window.visualizationType == "Monthly Rent")
		{
			cesColor = getPSFColor(parseInt(row.monthly_rent));
			cesColor = Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString(cesColor).withAlpha(1));
		}
		
		//Upper Border
		entUp = highlightBuildingCondo("", "upper-border-"+index, ht, ht-0.25, "resirental-"+index, row.coords, cesColor);
		resiRentalEntities.push({"entity": entUp, "id": "upper-border-"+index, "idtbldg": row.idtbuilding});
		//Bottom Border
		entDown = highlightBuildingCondo("", "bottom-border-"+index, parseFloat(row.bottomfloorheight), (parseFloat(row.bottomfloorheight)+0.25), "resirental-"+index, row.coords, cesColor);
		resiRentalEntities.push({"entity": entDown, "id": "bottom-border-"+index, "idtbldg": row.idtbuilding});
		
		return true;
	}
}

function hexToRgb(hex)
{
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

window.visualizationType = null;
function toggleVisualization()
{
	if($("#visualizationType").val() == "Bedrooms")
	{
		window.visualizationType = "Bedrooms";
		if(Object.keys(window.buildingData).length > 0)
			createBedsVisualization();
	}
	else if($("#visualizationType").val() == "Monthly Rent")
	{
		window.visualizationType = "Monthly Rent";
		if(Object.keys(window.buildingData).length > 0)
			createPricePSFVisualization();
	}
	else
	{
		window.visualizationType = null;
		resetVisualization();
		clearLegendElement();
	}
	if(window.lastSelectedEntityId != null)
		createResiRentalBorderBottomAndUp(window.lastSelectedEntityId);
	
	/* if(fogChecked)
		createFogEffectForSubmarketWithBuildingHoles(); */
}

function toggleOffVisualization()
{
	$("#visualizationType").val("");
	$(".bed0head").css("background-color", "");
	$(".bed1head").css("background-color", "");
	$(".bed2head").css("background-color", "");
	$(".bed3head").css("background-color", "");
	$(".visualizationToggle").removeClass("fa-toggle-on");
	$(".visualizationToggle").addClass("fa-toggle-off");
	$(".visualizationToggle").removeClass("text-grey-color");
	window.visualizationType = null;
}

function createBedsVisualization()
{
	/*$(".bed0head").css("background-color", bedColors[0]);
	$(".bed1head").css("background-color", bedColors[1]);
	$(".bed2head").css("background-color", bedColors[2]);
	$(".bed3head").css("background-color", bedColors[3]);*/
	createLegendForBedsVisualization();
	
	//console.log("resiRentalEntities "+window.resiRentalEntities.length);
	$.each(window.resiRentalEntities, function (index, entities){
		if(typeof entities.beds != "undefined")
		{
			color = getBedsColor(parseInt(entities.beds));
			//console.log(entities);
			//console.log(entities.id+" , "+entities.beds+", "+color);
			color = hexToRgb(color);
			entities.entity.getGeometryInstanceAttributes(entities.id).color = [color.r, color.g, color.b, 255];
		}
	});
}

function createLegendForBedsVisualization()
{
	str = "";
	$.each(window.bedsSelected, function (index, row){
		txt = "";
		if(row == 0)
		{
			txt = "Studio";
			color = getBedsColor(row);
		}
		else
		{
			color = getBedsColor(row);
			if(row == 3)
				txt = row+ "+ Bed";
			else
				txt = row+ " Bed";
		}
		str += "<span class='legendElement' style='background-color:"+color+"'>"+txt+"</span>";
	});
	$(".legendContainer").html(str);
}

function createPricePSFVisualization()
{
	if(window.firstFiltered)
		createLegendForPricePSFVisualization();
	
	$.each(window.resiRentalEntities, function (index, entities){
		if(typeof entities.monthlyRent != "undefined")
		{
			color = getPSFColor(parseInt(entities.monthlyRent));
			//console.log(entities.id+" , "+entities.beds+", "+color);
			color = hexToRgb(color);
			entities.entity.getGeometryInstanceAttributes(entities.id).color = [color.r, color.g, color.b, 255];
		}
	});
}

function createLegendForPricePSFVisualization()
{
	//var str = "<div class='colorLegend2 colorLegendHeaderRed'>Residential Rental</div>";
	
	//$(".directSpaceContainer").html(str);
	  var str = "";
	  var color = "";
	  var mn = "";
	  var mx = "";
	  
	  str += "";
		$.each(pricePSFColors, function (index, row){
			temp = hexToRgb(row.color);
			
			if(row.min != 0)
			{
				if(index == pricePSFColors.length - 1)
				{
					str += "<span class='legendElement legendPSFElement' style='width:98px !important;background-color:rgba("+temp.r+", "+temp.g+", "+temp.b+", "+parseInt(parseFloat(row.alpha) * 128)+");'>"+"$"+formatBigNumbers(row.min)+" +";
				}
				else
				{
					row.min = parseInt(row.min) - 1;
					mn = formatBigNumbers(row.min);
					str += "<span class='legendElement legendPSFElement' style='background-color:rgba("+temp.r+", "+temp.g+", "+temp.b+", "+parseInt(parseFloat(row.alpha) * 128)+");'>"+"$"+mn+" - $"+formatBigNumbers(row.max)+"";
				}
			}
			else
			{
				str += "<span class='legendElement legendPSFElement' style='background-color:rgba("+temp.r+", "+temp.g+", "+temp.b+", "+parseInt(parseFloat(row.alpha) * 128)+");'>"+"$"+formatBigNumbers(row.max)+" or less";
			}
			
			str += "</span>";
		});
	
	$(".legendContainer").html(str);
}

function clearLegendElement()
{
	$(".legendContainer").html("");
}

function resetVisualization()
{
	/*$(".bed0head").css("background-color", "");
	$(".bed1head").css("background-color", "");
	$(".bed2head").css("background-color", "");
	$(".bed3head").css("background-color", "");*/
	
	$.each(window.resiRentalEntities, function (index, entities){
		entities.entity.getGeometryInstanceAttributes(entities.id).color = [255, 0, 0, 255];
	});
	clearLegendElement();
}

window.presentationColors = [];
window.presentationColorAlpha = [];
window.appColorSetting = [];
window.appName = "PPT";
window.appColorSetting["PPT"] = [];

function getAppColorSetting(app)
{
	$.ajax({
	  method: "POST",
	  url: window.apiBaseUrl+"controllers/appcolorsettingController.php",
	  data: { sourceApp : window.app_name, param : "getappcolorsetting" , "app_name" : app }
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		//console.log("App Color Settings");
		
		//if(typeof updateProgressBar != "undefined"){ window.loadingAjaxCall++; updateProgressBar(); }
		if(data.status == "success")
		{
			var len = 0;
			window.appColorSetting[app] = [];
			//presentationColors = data.data;
			$.each(data.data, function (index, row){
				if(typeof window.appColorSetting[app][row.field_name] == "undefined")
				{
					window.appColorSetting[app][row.field_name] = [];
				}
				
				len = window.appColorSetting[app][row.field_name].length;
				window.appColorSetting[app][row.field_name][len] = [];
				window.appColorSetting[app][row.field_name][len]["min"] = row.value_from;
				window.appColorSetting[app][row.field_name][len]["max"] = row.value_to;
				window.appColorSetting[app][row.field_name][len]["color"] = row.color_hex;
				window.appColorSetting[app][row.field_name][len]["alpha"] = row.color_alpha;
			});

			$.each(appColorSetting["PPT"]["portfolio"], function (p, eachPortfolio){
				var temp = hexToRgb(eachPortfolio.color);
				var rgbaCol = 'rgba('+temp.r+', '+temp.g+', '+temp.b+', '+parseInt(parseFloat(eachPortfolio.alpha) * 128)+')';
				$("."+eachPortfolio.min+"Legend").css("background-color", rgbaCol);
			});
			
			getPresentationColorSettings();
			//cssPushForRentalSaleData();
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

window.classAHexColor = "";
window.classBHexColor = "";
window.classCHexColor = "";
function getPresentationColorSettings()
{
	//SK: 03/12 2020 No need to load data from Ajax and class code table, use appcolorsetting
	//If backup needed, find GIT
	$.each(window.appColorSetting["PPT"]["presentationColors"], function (index, eachRow){
		window.presentationColors[eachRow.min] = eachRow.color;
		window.presentationColorAlpha[eachRow.min] = eachRow.alpha;
				
		if(eachRow.min == "office-a")
		{
			window.classAHexColor = eachRow.color;
			$(".classDarkBlue").css("background-color", eachRow.color);
		}
		if(eachRow.min == "office-b")
		{
			window.classBHexColor = eachRow.color;
			$(".classLightBlue").css("background-color", eachRow.color);
		}
		if(eachRow.min == "office-c")
		{
			window.classCHexColor = eachRow.color;
			$(".classLightestBlue").css("background-color", eachRow.color);
		}
		if(eachRow.min == "hotel")
		{
			window.hotelPropertyColor = eachRow.color;
		}
		if(eachRow.min == "residential")
		{
			window.residentialPropertyColor = eachRow.color;
		}
				
	});
}
getAppColorSetting("PPT");

function getBgColorWithAlpha(productType)
{
	var tempColor = hexToRgb(window.presentationColors[productType.toLowerCase()]);
	if(tempColor == null)
		return "";
	var alpha = 1;
	if(typeof window.presentationColorAlpha[productType.toLowerCase()] != "undefined")
	{
		alpha = parseFloat(1 * parseFloat(window.presentationColorAlpha[productType.toLowerCase()]));
	}
	return "rgba("+tempColor.r+", "+tempColor.g+", "+tempColor.b+", 1);";
}

bedColors = [];
bedColors[0] = "#FF0000";
bedColors[1] = "#FF6600";
bedColors[2] = "#FFFF00";
bedColors[3] = "#33FF00";
function getBedsColor(bedCount)
{
	if(bedCount > 3)
		bedCount = 3;
	return bedColors[bedCount];
}

//monthly_rent
pricePSFColors = [];
pricePSFColors.push({"min": 0, "max": 3000, "color": "#FFFF00", "alpha": 0.5});
pricePSFColors.push({"min": 3001, "max": 5000, "color": "#FFCC00", "alpha": 0.5});
pricePSFColors.push({"min": 5001, "max": 10000, "color": "#FF9900", "alpha": 0.5});
pricePSFColors.push({"min": 10001, "max": 30000, "color": "#FF6600", "alpha": 0.5});
pricePSFColors.push({"min": 30001, "max": 60000, "color": "#FF3300", "alpha": 0.5});
pricePSFColors.push({"min": 60001, "max": 140000, "color": "#FF0000", "alpha": 0.5});
function getPSFColor(psfValue)
{
	color = null;
	$.each(pricePSFColors, function (index, row){
		if(row.min <= psfValue && row.max >= psfValue)
			color = row.color;
	});
	return color;
}

function fogToggle(forceDraw = false)
{
	if(!window.fogDataReady)
	{
		//alert("Fog data not ready!");
		return "";
	}
	
	if(forceDraw)
	{
		createFogEffectForSubmarketWithBuildingHoles();
		return;
	}
  $(".toggleContainer2").toggleClass("fa-toggle-off");
  $(".toggleContainer2").toggleClass("fa-toggle-on");
  $(".toggleContainer2").toggleClass("text-grey-color");
  window.fogChecked = !window.fogChecked;
  
  if($('#fogchecked').hasClass('fa-toggle-off')) {
    clearAllFog();
  } else {
    createFogEffectForSubmarketWithBuildingHoles();
  }
  
  /*if(fogChecked)
	{
		$(".toggleContainer2").removeClass("fa-toggle-off");
		$(".toggleContainer2").addClass("fa-toggle-on");
		$(".toggleContainer2").addClass("text-blue");
    createFogEffectForSubmarketWithBuildingHoles();
		window.fogChecked = !window.fogChecked;
	}
	else
	{
		$(".toggleContainer2").removeClass("fa-toggle-on");
		$(".toggleContainer2").addClass("fa-toggle-off");
		$(".toggleContainer2").removeClass("text-blue");
		window.fogChecked = !window.fogChecked;
		clearAllFog();
	}*/
}

function drawFog(idtsubmarket) {
  var str = "";
  $.each(allSubmarketsWithHoles[idtsubmarket], function (j, idt){
    if(idt !== undefined && idt.length > 0)
      str += "{positions : Cesium.Cartesian3.fromDegreesArray(["+idt+"])},";
  });
  str = str.substring(0,(str.length-1));
  console.log(str); return;
  str = "["+str+"]";
  console.log(str);
  var entity = viewerDemoResiApp.entities.add({
    id : "submarketFogHighlight"+idtsubmarket,
    polygon : {
      hierarchy : {
        positions : Cesium.Cartesian3.fromDegreesArray(eval("["+submarketDetails[idtsubmarket].coords+"]")),
        holes : eval(str)
      },
      material : Cesium.Color.WHITE.withAlpha(0.5),
      classificationType : Cesium.ClassificationType.BOTH
    }
  });
}

function clearFog(idtsubmarket) {
  if(typeof viewerDemoResiApp.entities.getById("submarketFogHighlight"+idtsubmarket) != "undefined") {
    viewerDemoResiApp.entities.getById("submarketFogHighlight"+idtsubmarket).show = false;
    viewerDemoResiApp.entities.removeById("submarketFogHighlight"+idtsubmarket);
  }
}

function clearCondoHighlight()
{
	$.each(window.primitiveCollection, function (index, row){
		row.destroy();
	});
	window.primitiveCollection = [];
	
	clearFloatingRings("");
}

function clearFloatingRings(idtbldg = "")
{
	$.each(window.floatingRingCollection, function (index, row){
		row.show = false;
	});
	window.floatingRingCollection = [];
	if(idtbldg == "")
	{
		$.each(window.resirentalData.condo, function (index, row){
			if(typeof index != "undefined" && typeof row != "undefined")
			{
				viewerDemoResiApp.entities.removeById("middleRing-"+index);
				viewerDemoResiApp.entities.removeById("middleRingFill-"+index);
			}
		});
		$.each(window.resirentalData.rental, function (index, row){
			if(typeof index != "undefined" && typeof row != "undefined")
			{
				viewerDemoResiApp.entities.removeById("middleRing-"+index);
				viewerDemoResiApp.entities.removeById("middleRingFill-"+index);
			}
		});
	}
	else
	{
		$.each(window.buildingPartialsMap[idtbldg], function (index, idtres){
			viewerDemoResiApp.entities.removeById("middleRing-"+idtres);
			viewerDemoResiApp.entities.removeById("middleRingFill-"+idtres);
		});
	}
}

//Condo Management
function highlightBuildingCondo(idtbldg, id, height, extrudedHeight, description, coords, cesiumColor)
{
	addToSubmarketBag(idtbldg);
	//console.log(id+"\n"+height+"\n"+extrudedHeight+"\n"+description+"\n"+coords);
	ent = viewerDemoResiApp.scene.primitives.add(new Cesium.ClassificationPrimitive({
		geometryInstances : new Cesium.GeometryInstance({
			geometry : new Cesium.PolygonGeometry({
			  polygonHierarchy : new Cesium.PolygonHierarchy(
				Cesium.Cartesian3.fromDegreesArray(eval("["+coords+"]"))
			  ),
			  height : height,
			  extrudedHeight : extrudedHeight
			}),
			attributes : {
				color : cesiumColor,
				show : new Cesium.ShowGeometryInstanceAttribute(true)
			},
			id : id,
			description : description
		}),
		classificationType : Cesium.ClassificationType.BOTH
	}));
	primitiveCollection.push(ent);
	return ent;
}

window.primitiveCollection = [];
window.myMobileDescription = [];

function getPolygonCentroid(points){ 
  var centroid = {x: 0, y: 0};
  for(var i = 0; i < points.length-2; i+=3) {
     var point = points[i];
     centroid.x += points[i];
     centroid.y += points[i+1];
  }
  centroid.x /= (points.length/3);
  centroid.y /= (points.length/3);
  return [centroid.x,centroid.y];
} 

function highlightStructureV2(idtbldg, id, coords, color, desc, idtsubmarket, bldgClass, buildingDetails, fillProperty = true, defaultZindex = 10)
{
	addToSubmarketBag(idtbldg);
	
	var bldgName = buildingDetails.name;
	var alt = 2000;
	if(typeof buildingDetails.altitude != "undefined")
	{
		alt = buildingDetails.altitude;
	}
	//Some Adjustment
	alt = parseFloat(alt) + 50;
	viewerDemoResiApp.entities.removeById(id);//1.50 Change :  || true
	
	if(isMobile.any() == null && false)
	{
		if(color == "")
			color = Cesium.Color.RED.withAlpha(0.5);
		
		var pos = getPolygonCentroid(eval(coords));
		
		var lat = "";
		var lon = "";
		if(typeof buildingDetails.latitude != "undefined")
			lat = buildingDetails.latitude;
		if(typeof buildingDetails.longitude != "undefined")
			lon = buildingDetails.longitude;
		
		var entity = viewerDemoResiApp.entities.add({
			id : id,//"boundrySubmarketWall"+index,
			//parent : parent,//1.50 Change
			idtsubmarket : idtsubmarket,
			buildingClass : bldgClass,
			buildingName : bldgName,
			description : desc,
			latitude : lat,
			longitude : lon,
			position : Cesium.Cartesian3.fromDegrees(pos[0], pos[1]),
			zIndex: defaultZindex,
			polygon : {
				hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(eval(coords))),
				material : color,
				fill : fillProperty,
				classificationType : Cesium.ClassificationType.BOTH,
				zIndex: defaultZindex
			}
		});
		return entity;
	}
	else
	{
		if(typeof window.myMobileDescription[id] == "undefined")
		{
			window.myMobileDescription[id] = [];
		}
		window.myMobileDescription[id]["description"] = desc;
		window.myMobileDescription[id]["bldgName"] = bldgName;
		window.myMobileDescription[id]["bldgClass"] = bldgClass;
		
		var entity = viewerDemoResiApp.scene.primitives.add(new Cesium.ClassificationPrimitive({
			geometryInstances : new Cesium.GeometryInstance({
				geometry : new Cesium.PolygonGeometry({
				  polygonHierarchy : new Cesium.PolygonHierarchy(
					Cesium.Cartesian3.fromDegreesArrayHeights(eval(coords))
				  ),
				  height : alt,
				  extrudedHeight : 0,
				  /* zIndex:10 */
				}),
				/*
				modelMatrix : modelMatrix,
				*/
				attributes : {
					color : Cesium.ColorGeometryInstanceAttribute.fromColor(color),
					show : new Cesium.ShowGeometryInstanceAttribute(true)
				},
				id : id,
				description : desc,
				/* zIndex:10 */
				/* name : 'Highlight Object' */
			}),
			classificationType : Cesium.ClassificationType.BOTH,
			/* zIndex:10 */
		}));
		var temp = id.split("-");
		if(temp[0] == "nycConstruction")
		{
			window.developmentBuildingPrimitives[window.developmentBuildingPrimitives.length] = entity;
		}
		else
		{
			window.plutoBuildingPrimitives[window.plutoBuildingPrimitives.length] = entity;
		}
		return "";//window.plutoBuildingPrimitives[window.plutoBuildingPrimitives.length-1];
	}
	//alert(window.primitiveCollection.length);
}

//highlightBuildingCondoPolygon("middleRing-"+idtpartial, parseFloat(ht) + 0.1, parseFloat(ht) - 0.1, coords, defaultPrimitiveRingColor);
function highlightBuildingCondoPolygon(id, ht, exHt, coords, color, defaultShow = true)
{
	//console.log("polygon defaultShow "+defaultShow);
	if(typeof viewerDemoResiApp.entities.getById(id) != "undefined")
		viewerDemoResiApp.entities.removeById(id);
	var entity = viewerDemoResiApp.entities.add({
		id : id,//"boundrySubmarketWall"+index,
		show: defaultShow,
		polygon : {
			hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(coords)),
			height: ht,
			extrudedHeight: exHt,
			material : color
		}
	});
	return entity;
}

function highlightBuildingCondoPolyline(id, ht, exHt, coords, color, defaultShow = true)
{
	//console.log("polyline defaultShow "+defaultShow);
	if(typeof viewerDemoResiApp.entities.getById(id) != "undefined")
		viewerDemoResiApp.entities.removeById(id);
	var orangeOutlined = viewerDemoResiApp.entities.add({
	  id : id,
	  show: defaultShow,
	  polyline: {
		positions: Cesium.Cartesian3.fromDegreesArrayHeights(coords),
		width: 7,
		material: new Cesium.PolylineOutlineMaterialProperty({
		  color: Cesium.Color.WHITE.withAlpha(0.8),
		  outlineWidth: 2,
		  outlineColor: Cesium.Color.WHITE.withAlpha(0.8),
		}),
	  },
	});
	return orangeOutlined;
}

//Some Common Functions
function prepareCoordsForHighlight(buildingCoords, height)
{
	////console.log("buildingCoords");
	////console.log(buildingCoords);
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
//Pluto Building Highlight
function plutoBuildingHighlight()
{
	
	var cesColor = "";
	let buildingHighlighted = [];
	
	//var propertyType = $("#tbuildings").val();
	
	bldgTypeArr = ["rental", "residential"];
	buildingsHighlighted = [];
	$.each(bldgTypeArr, function (i, propertyType){

		if(propertyType == "rental")
			dataToIterate = window.resirentalData.rental;
		if(propertyType == "residential")
			dataToIterate = window.resirentalData.condo;
	
		cesColor = "#FFFFFF";
		if(typeof window.presentationColors[propertyType] != "undefined")
		{
			cesColor = window.presentationColors[propertyType];
		}
		
		if(typeof window.presentationColorAlpha[propertyType] != "undefined")
		{
			cesColor = Cesium.Color.fromCssColorString(cesColor).withAlpha(window.presentationColorAlpha[propertyType]);
		}
		else
		{
			window.presentationColorAlpha[propertyType] = 0.5;//Default
			cesColor = Cesium.Color.fromCssColorString(cesColor).withAlpha(0.5);
		}

		var proceed = true;
		$.each(dataToIterate, function (index, buildingRow){
			buildingsHighlighted.push(buildingRow.idtbuilding);
			//For Rental and Condo just show Downtown
			proceed = false;
			if( (buildingRow.idtsubmarket == 3 || buildingRow.idtsubmarket == 4 || buildingRow.idtsubmarket == 5 || buildingRow.idtsubmarket == 6 || buildingRow.idtsubmarket == 7))
			{
				proceed = true;
			}
			
			buildingRow.coordsToUse = prepareCoordsForHighlight(buildingRow.bcoords, 100);
			if(buildingRow.bcoords != "" && proceed && typeof buildingHighlighted[buildingRow.idtbuilding] == 'undefined' )
			{
				buildingHighlighted[buildingRow.idtbuilding] = 1;
				let desc = '';
				highlightStructureV2(buildingRow.idtbuilding, "bldg-"+buildingRow.idtbuilding, buildingRow.coordsToUse, cesColor, desc, buildingRow.idtsubmarket, "", buildingRow);
			}
		});
	});
	//30-10-2021
	//Now highlight remaining rental buildings
	cesColor = Cesium.Color.fromCssColorString(window.presentationColors["rental"]).withAlpha(window.presentationColorAlpha["rental"])
	$.each(plutoBuildingDetails["rental"], function (inex, buildingRow){
		if(!buildingsHighlighted.includes(buildingRow.idtbuilding))
		{
			buildingsHighlighted.push(buildingRow.idtbuilding);
			//buildingRow.coordsToUse = prepareCoordsForHighlight(buildingRow.bcoords, 100);
			if(buildingRow.coordsToUse != "" )
			{
				let desc = '';
				highlightStructureV2(buildingRow.idtbuilding, "bldg-"+buildingRow.idtbuilding, buildingRow.coordsToUse, cesColor, desc, buildingRow.idtsubmarket, "", buildingRow);
			}
		}
	});
	//Now highlight remaining residential buildings
	cesColor = Cesium.Color.fromCssColorString(window.presentationColors["residential"]).withAlpha(window.presentationColorAlpha["residential"])
	$.each(plutoBuildingDetails["residential"], function (inex, buildingRow){
		if(!buildingsHighlighted.includes(buildingRow.idtbuilding))
		{
			//buildingRow.coordsToUse = prepareCoordsForHighlight(buildingRow.bcoords, 100);
			if(buildingRow.coordsToUse != "")
			{
				let desc = '';
				highlightStructureV2(buildingRow.idtbuilding, "bldg-"+buildingRow.idtbuilding, buildingRow.coordsToUse, cesColor, desc, buildingRow.idtsubmarket, "", buildingRow);
			}
		}
	});
}

function highlightNewDevelopmentData() {
  clearNewDevelopment();
	var highlightedBuildings = [];
	$.each(window.newDevelopmentData, function (index, buildingDetails){
		if(typeof buildingDetails != "undefined") {
			if(typeof highlightedBuildings[buildingDetails[0].idtbuilding] == "undefined") {
				highlightedBuildings[buildingDetails[0].idtbuilding] = 1;
				var finalColor = Cesium.Color.fromCssColorString(appColorSetting["PPT"]["new_developments"][0].color);
				finalColor = finalColor.withAlpha(appColorSetting["PPT"]["new_developments"][0].alpha);
				var finalString = prepareCoordsForHighlight(window.newDevelopmentData[buildingDetails[0].idtbuilding][0].coords, window.newDevelopmentData[buildingDetails[0].idtbuilding][0].altitude);
				var description = "";


				highlightStructureV2(buildingDetails[0].idtbuilding, "newDevelopment-"+buildingDetails[0].idtbuilding, finalString, finalColor, description, "", "", "");
			}
		}
	});

}

function clearNewDevelopment() {
	
	if(isMobile.any() == null) {
		$.each(window.newDevelopmentData, function (index, buildingDetails){
			if(typeof buildingDetails != "undefined") {
				viewerDemoResiApp.entities.removeById("newDevelopment-"+buildingDetails[0].idtbuilding);
			}
		});
	} else {
		clearPrimitives();
	}

}
window.plutoBuildingPrimitives = [];
window.developmentBuildingPrimitives = [];
function clearPlutoBuildingHighlight()
{
	for(var i = 0; i < window.plutoBuildingPrimitives.length; i++)
	{
		window.plutoBuildingPrimitives[i].destroy();
	}
	window.plutoBuildingPrimitives = [];
	return;
	const bldgTypeArr = ["rental", "residential"];
	
	$.each(bldgTypeArr, function (i, propertyType){

		if(propertyType == "rental")
			dataToIterate = window.resirentalData.rental;
		if(propertyType == "residential")
			dataToIterate = window.resirentalData.condo;

		$.each(dataToIterate, function (index, buildingRow){
			viewerDemoResiApp.entities.removeById("bldg-"+buildingRow.idtbuilding);
		});
	});
	$.each(plutoBuildingDetails["rental"], function (inex, buildingRow){
		viewerDemoResiApp.entities.removeById("bldg-"+buildingRow.idtbuilding);
		//removeFromSubmarketBag(buildingRow.idtbuilding);
	});
	$.each(plutoBuildingDetails["residential"], function (inex, buildingRow){
		viewerDemoResiApp.entities.removeById("bldg-"+buildingRow.idtbuilding);
		//removeFromSubmarketBag(buildingRow.idtbuilding);
	});
	
}

function highlightNYCConstructionData(onlyDowntown)
{
	var cesiumColor = Cesium.Color.RED.withAlpha(0.5);
	//console.log(window.nycCellularData);
	var cesiumColor = Cesium.Color.fromCssColorString(appColorSetting["PPT"]["new_developments"][0].color);
	cesiumColor = cesiumColor.withAlpha(appColorSetting["PPT"]["new_developments"][0].alpha);
	var buildingHighlighted = [];
	$.each(window.nycConstructionData, function (index, buildingDetails){

		if(typeof buildingHighlighted[buildingDetails.idtbuilding] == "undefined")
		{
			buildingHighlighted[buildingDetails.idtbuilding] = 1;//So that we highlight that building just once.

			if(typeof window.allBuildingsData[buildingDetails.idtbuilding] != "undefined" && typeof window.allBuildingsData[buildingDetails.idtbuilding].coords != "undefined" && window.allBuildingsData[buildingDetails.idtbuilding].coords != null && window.allBuildingsData[buildingDetails.idtbuilding].coords != "" && buildingDetails.building_type == "Resi Ownership")
			{
				var finalString = prepareCoordsForHighlight(window.allBuildingsData[buildingDetails.idtbuilding].coords, window.allBuildingsData[buildingDetails.idtbuilding].altitude);
				var description = "";
				//console.log("buildingDetails.building_type "+buildingDetails.building_type);
				//cesiumColor = getPlutoClassColor("PPT", "proposed_occupancy_type", buildingDetails.building_type);
				highlightStructureV2(buildingDetails.idtbuilding, "nycConstruction-"+buildingDetails.idtbuilding+"-"+index, finalString, cesiumColor, description, "", "", "");
			}
		}
	});
}

function clearNYCConstructionData()
{
	for(var i = 0; i < window.developmentBuildingPrimitives.length; i++)
	{
		window.developmentBuildingPrimitives[i].destroy();
	}
	window.developmentBuildingPrimitives = [];
	return;
	$.each(window.nycConstructionData, function (index, buildingDetails){
		if(isMobile.any() == null)
		{
			viewerDemoResiApp.entities.removeById("nycConstruction-"+buildingDetails.idtbuilding+"-"+index);
		}
		else
		{
			for(var i = 0; i < window.primitiveCollection.length; i++)
			{
				window.primitiveCollection[i].destroy();
			}
			window.primitiveCollection = [];
		}
	});

}

var isMobile = {
	Android: function() {
		return navigator.userAgent.match(/Android/i);
	},
	BlackBerry: function() {
		return navigator.userAgent.match(/BlackBerry/i);
	},
	iOS: function() {
		return navigator.userAgent.match(/iPhone|iPad|iPod/i);
	},
	Opera: function() {
		return navigator.userAgent.match(/Opera Mini/i);
	},
	Windows: function() {
		return navigator.userAgent.match(/IEMobile/i);
	},
	any: function() {
		return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
	}
};

function prepareCondoInformation(idtresirentals)
{
  var selectedRetal = null;
  $.each(resirentalData.rental, function (index, row) {
    if(index == idtresirentals) {
      selectedRetal = resirentalData.rental[index]
    }
  });
  if(selectedRetal == null) {
    $.each(resirentalData.condo, function (index, row) {
      if(index == idtresirentals) {
        selectedRetal = resirentalData.condo[index]
      }
    });
  }
  //console.log("selectedRetal : " );
  //console.log(selectedRetal);
  window.selectedRetalG = selectedRetal;
  
  $("#submarketStatistics").hide();
  $("#submarketStats").hide();
  $('#residetails').css('right', '15px').removeClass('sm-collapsed');
  $('#resiCollapseIcon').removeClass('fa-chevron-left').addClass('fa-chevron-right');
  $("#residetails").show();
  //resirentalData
  $.ajax({
    method: "POST",
    url: apiBaseUrl+"controllers/residentialRentalController.php",
    data: { param : "getResiRentalImages" , "idtresirentals" : idtresirentals}
  })
  .done(function( data ) {
    $(".fa-cog").addClass("hide");
    data = $.parseJSON( data );
    //console.log(data);
    if(data.status == "success")
    {
      $('.buildingname').html("<a href='javascript:flyToIdtcamera("+selectedRetal.idtcamera+");'>"+selectedRetal.name+"</a>");//, "+selectedRetal.unit
      //infotab
      $('#unitresirental').html(selectedRetal.unit);
	  var floorNumberFormat = selectedRetal.number;
	  if(typeof allBuildingsData[parseInt(window.selectedRetalG.idtbuilding)].floors != "undefined")
	  {
		  floorNumberFormat = selectedRetal.number + "/" + allBuildingsData[parseInt(window.selectedRetalG.idtbuilding)].floors;
	  }
      $('#tresifloor').html(floorNumberFormat);
      $('#tresibeds').html(selectedRetal.beds);
      $('#tresiinterior').html(numberWithCommas("", selectedRetal.square_feet)+" Sq Ft");
      $('#tresibaths').html(selectedRetal.baths);
      $('#tmrent').html(numberWithCommas("$", selectedRetal.monthly_rent));
      $('#tyearbuilt').html(selectedRetal.yearbuilt);
      rentPSF = selectedRetal.monthly_rent / selectedRetal.square_feet;
	  rentPSF = rentPSF.toFixed(0);
      $('#tbuildingrentpsf').html("$"+rentPSF);
	  if(parseInt(selectedRetal.yearbuilt) >= 1946)
	  {
		 $('#pre-war').html("No");
	  }
	  else
	  {
		 $('#pre-war').html("Yes");
	  }
      //var t = selectedRetal.date_created.split(" ");
	  if(isMobile.any())
	  {
		  selectedRetal.date_created = selectedRetal.date_created.replace(" ", "T");
	  }
      var t = new Date(selectedRetal.date_created);
      var options = { year: 'numeric', month: 'long', day: 'numeric' };
      t = t.toLocaleDateString("en-US", options);
      $('#tresidateadded').html(t);
      if( selectedRetal.buildingclass.startsWith('R')){
				building_type = 'Condo';
			} else {
				building_type = 'Rental';
			}
      $('#tbuildingtype').html(building_type);
      var dt1 = new Date(selectedRetal.date_created);
			var dt2 = new Date();
			var days = Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 60 * 60 * 24));
      $('#tdays').html(days);
			var imageStringFloorPlan = "";
			var imageStringUnitPictures = "";
			var imageStringUnitPicturesArray = [];
			var imageStringExteriorPicturesArray = [];
			var imageStringCommonPicturesArray = [];
			var imageStringExteriorView = "";
			var imageStringBuildingArea = "";
      var imgIndex=0;
      var tempImages = [];
			tempImages["exteriorview"] = [];
			tempImages["floorplan"] = [];
			tempImages["unitpictures"] = [];
			tempImages["buildingareas"] = [];
			$.each(data.data, function (index, row){
				if(row.image_category == "Floor Plan")
				{
					//This is to show Pop
					imageStringFloorPlan += "<a onClick=\"viewImageInModal("+imgIndex+", '"+window.apiBaseUrl+row.file_path+"', '"+row.Owidth+"', '"+row.Oheight+"', '"+row.image_category+"');\" target='_blank'><img height='"+row.height+"px' width='"+row.width+"px' src='"+window.apiBaseUrl+row.file_path+"' /></a><br /><br />";
					
					//imageStringFloorPlan += "<a onClick=\"unitViewForPartial('floorplan');\" target='_blank'><img height='"+row.height+"px' width='"+row.width+"px' src='"+window.apiBaseUrl+row.file_path+"' /></a><br /><br />";
					tempImages["floorplan"][tempImages["floorplan"].length] = {"path" : window.apiBaseUrl+row.file_path, "type" : "Floor Plan", "height": row.Oheight, "width" : row.Owidth};
					imgIndex++;
				}
			});
			$.each(data.data, function (index, row){
				if(row.image_category == "Unit Pictures")
				{
					imageStringUnitPictures += "<a onClick=\"viewImageInModal("+imgIndex+", '"+window.apiBaseUrl+row.file_path+"', '"+row.Owidth+"', '"+row.Oheight+"');\" target='_blank'><img height='"+row.height+"px' width='"+row.width+"px' src='"+window.apiBaseUrl+row.file_path+"' /></a><br /><br />";
					row.imgIndex = imgIndex;
					imageStringUnitPicturesArray.push(row);
					tempImages["unitpictures"][tempImages["unitpictures"].length] = {"path" : window.apiBaseUrl+row.file_path, "type" : "Unit Pictures", "height": row.Oheight, "width" : row.Owidth};
					imgIndex++;
				}
			});
			$.each(data.data, function (index, row){
				if(row.image_category == "Exterior View")
				{
					imageStringExteriorView += "<a onClick=\"viewImageInModal("+imgIndex+", '"+window.apiBaseUrl+row.file_path+"', '"+row.Owidth+"', '"+row.Oheight+"');\" target='_blank'><img height='"+row.height+"px' width='"+row.width+"px' src='"+window.apiBaseUrl+row.file_path+"' /></a><br /><br />";
					row.imgIndex = imgIndex;
					imageStringExteriorPicturesArray.push(row);
					tempImages["exteriorview"][tempImages["exteriorview"].length] = {"path" : window.apiBaseUrl+row.file_path, "type" : "Exterior View", "height": row.Oheight, "width" : row.Owidth};
					imgIndex++;
				}
			});
			$.each(data.data, function (index, row){
				if(row.image_category == "Building Areas")
				{
					imageStringBuildingArea += "<a onClick=\"viewImageInModal("+imgIndex+", '"+window.apiBaseUrl+row.file_path+"', '"+row.Owidth+"', '"+row.Oheight+"');\" target='_blank'><img height='"+row.height+"px' width='"+row.width+"px' src='"+window.apiBaseUrl+row.file_path+"' /></a><br /><br />";
					row.imgIndex = imgIndex;
					imageStringCommonPicturesArray.push(row);
					tempImages["buildingareas"][tempImages["buildingareas"].length] = {"path" : window.apiBaseUrl+row.file_path, "type" : "Exterior View", "height": row.Oheight, "width" : row.Owidth};
					imgIndex++;
				}
			});
      var ht = parseFloat(selectedRetal.bottomfloorheight) + parseFloat(selectedRetal.floorheight);
      var pt2 = [selectedRetal.longitude, selectedRetal.latitude];
      //$('.infoToggleSpin').onClick("unitViewForPartial("+pt2[0]+", "+pt2[1]+", "+ht+");");
	  temp = "";
      //temp += "<a class='btn btn-xs btn-primary' style='font-size: 13.5px;' onclick='javascript:unitViewForPartial();'>View</a>&nbsp;";
	  if(window.clippingPlaneBuildings.includes(parseInt(selectedRetal.idtbuilding)))
	  {
		  lbl = "Show Floor";
		  cls = " btn-primary ";
		  if(window.clippingFeatureActive)
		  {
			  lbl = "Hide Floor";
			  cls = " btn-default ";
		  }
		  temp += "<a class='btn btn-xs "+cls+" showButtonText' style='font-size: 13.5px;' onclick='javascript:showClippingPlane("+selectedRetal.idtbuilding+");'>"+lbl+"</a>&nbsp;";
		  
		  lbl2 = "Show Other Units";
		  cls2 = " btn-primary ";
		  if(window.floatingRingDisplayFlag)
		  {
			lbl2 = "Hide Other Units";
			cls2 = " btn-default ";
		  }
		  $(".otherUnitButtonContainer").html("<a class='btn btn-xs "+cls2+" showOtherUnitButtonText' style='font-size: 13.5px;' onclick='javascript:toggleFloatingRingDisplay("+selectedRetal.idtbuilding+");'>"+lbl2+"</a>&nbsp;");
	  }
	  spinCls = "btn-primary";
	  spinTxt = "Spin";
	  if(window.toggleFloorSpinEnabled)
	  {
		  spinCls = "btn-default";
		  spinTxt = "Stop";
	  }
	  
	  temp += "<a class='btn btn-xs "+spinCls+" spinButtonText' style='font-size: 13.5px;' onclick='chapter13BuildingCameraSpin("+selectedRetalG.idtbuilding+", "+selectedRetalG.longitude+", "+selectedRetalG.latitude+", "+ht+");'>"+spinTxt+"</a>";
	  if(window.toggleFloorSpinEnabled)
	  {
		  //Change Spin to new partial
		  window.startCameraRotation = false;
		  enableSpinForBuilding(selectedRetalG.idtbuilding, parseFloat(selectedRetalG.longitude), parseFloat(selectedRetalG.latitude), parseFloat(ht));
	  }
	  $('.viewFromBuilding').html(temp);
      var cn = 0;
			$.each(tempImages["floorplan"], function (index, row){
				window.resiRentalImageContainer[cn] = row;
				cn++;
			});
			$.each(tempImages["unitpictures"], function (index, row){
				window.resiRentalImageContainer[cn] = row;
				cn++;
			});
			$.each(tempImages["exteriorview"], function (index, row){
				window.resiRentalImageContainer[cn] = row;
				cn++;
			});
			$.each(tempImages["buildingareas"], function (index, row){
				window.resiRentalImageContainer[cn] = row;
				cn++;
			});
			if(imageStringFloorPlan == "")
				imageStringFloorPlan = "Floor Plan Not Available.";
			if(imageStringUnitPictures == "")
				imageStringUnitPictures = "Unit Pictures Not Available.";
			if(imageStringExteriorView == "")
				imageStringExteriorView = "Exterior Images Not Available.";
			if(imageStringBuildingArea == "")
				imageStringBuildingArea = "Building Areas Images Not Available.";
			$(".imagesDisplayContainerFloorPlan").html(imageStringFloorPlan);
			
			imgStr = '<!--    Start: Buttons-->';
			if(imageStringUnitPicturesArray.length > 0)
			{
				imgStr += '<button class="control_next" style="margin-right:10px !important;" onClick=\'pictureNext("unit");\'><i style="color:#3c8dbc;margin-right:10px !important;" class="fa fa-lg fa-chevron-right unit-picture-chevron-right"></i></button>';
				imgStr += '<button class="control_prev" style="z-index:99999" onClick=\'picturePrev("unit");\'><i style="color:grey;margin-left:-20px;" class="fa fa-lg fa-chevron-left unit-picture-chevron-left"></i></button>';
				imgStr += '<!--    End: Buttons-->';
				imgStr += '<ul style="list-style:none; margin-left:-36px;">';
				act = "active";
				window.totalPictures["unit"] = 0;
				hd = " ";
				$.each(imageStringUnitPicturesArray, function (index, eachImageDetails){
					imgStr += "<li class=' "+hd+" unitPictures unitPicture-"+window.totalPictures["unit"]+"'>";
						imgStr += "<a onClick=\"viewImageInModal("+eachImageDetails.imgIndex+", '"+window.apiBaseUrl+eachImageDetails.file_path+"', '"+eachImageDetails.Owidth+"', '"+eachImageDetails.Oheight+"', '"+eachImageDetails.image_category+"');\" target='_blank'><img height='"+eachImageDetails.height+"px' width='"+eachImageDetails.width+"px' src='"+window.apiBaseUrl+eachImageDetails.file_path+"' /></a>";
					imgStr += "</li>";
					window.totalPictures["unit"]++;
					hd = " hide ";
				});
				imgStr += '</ul>';
			}
			$(".imagesDisplayContainerUnitPictures").html(imgStr);
			
			imgStr = '<!--    Start: Buttons-->';
			if(imageStringExteriorPicturesArray.length > 0)
			{
				imgStr += '<button class="control_next" style="margin-right:10px !important;" onClick=\'pictureNext("exterior");\'><i style="color:#3c8dbc;margin-right:10px !important;" class="fa fa-lg fa-chevron-right exterior-picture-chevron-right"></i></button>';
				imgStr += '<button class="control_prev" style="z-index:99999" onClick=\'picturePrev("exterior");\'><i style="color:grey;margin-left:-20px;" class="fa fa-lg fa-chevron-left exterior-picture-chevron-left"></i></button>';
				imgStr += '<!--    End: Buttons-->';
				imgStr += '<ul style="list-style:none; margin-left:-36px;">';
				act = "active";
				window.totalPictures["exterior"] = 0;
				hd = " ";
				$.each(imageStringExteriorPicturesArray, function (index, eachImageDetails){
					imgStr += "<li class=' "+hd+" exteriorPictures exteriorPicture-"+window.totalPictures["exterior"]+"'>";
						imgStr += "<a onClick=\"viewImageInModal("+eachImageDetails.imgIndex+", '"+window.apiBaseUrl+eachImageDetails.file_path+"', '"+eachImageDetails.Owidth+"', '"+eachImageDetails.Oheight+"', '"+eachImageDetails.image_category+"');\" target='_blank'><img height='"+eachImageDetails.height+"px' width='"+eachImageDetails.width+"px' src='"+window.apiBaseUrl+eachImageDetails.file_path+"' /></a>";
					imgStr += "</li>";
					window.totalPictures["exterior"]++;
					hd = " hide ";
				});
				imgStr += '</ul>';
			}
			$(".imagesDisplayContainerExteriorView").html(imgStr);
			
			imgStr = '<!--    Start: Buttons-->';
			if(imageStringCommonPicturesArray.length > 0)
			{
				imgStr += '<button class="control_next" style="margin-right:10px !important;" onClick=\'pictureNext("common");\'><i style="color:#3c8dbc;margin-right:10px !important;" class="fa fa-lg fa-chevron-right common-picture-chevron-right"></i></button>';
				imgStr += '<button class="control_prev" style="z-index:99999" onClick=\'picturePrev("common");\'><i style="color:grey;margin-left:-20px;" class="fa fa-lg fa-chevron-left common-picture-chevron-left"></i></button>';
				imgStr += '<!--    End: Buttons-->';
				imgStr += '<ul style="list-style:none; margin-left:-36px;">';
				act = "active";
				window.totalPictures["common"] = 0;
				hd = " ";
				$.each(imageStringCommonPicturesArray, function (index, eachImageDetails){
					imgStr += "<li class=' "+hd+" commonPictures commonPicture-"+window.totalPictures["common"]+"'>";
						imgStr += "<a onClick=\"viewImageInModal("+eachImageDetails.imgIndex+", '"+window.apiBaseUrl+eachImageDetails.file_path+"', '"+eachImageDetails.Owidth+"', '"+eachImageDetails.Oheight+"', '"+eachImageDetails.image_category+"');\" target='_blank'><img height='"+eachImageDetails.height+"px' width='"+eachImageDetails.width+"px' src='"+window.apiBaseUrl+eachImageDetails.file_path+"' /></a>";
					imgStr += "</li>";
					window.totalPictures["common"]++;
					hd = " hide ";
				});
				imgStr += '</ul>';
			}
			$(".imagesDisplayContainerBuildingAreas").html(imgStr);
			
			addViews();
    }
  });
  
  initiateUnitImagesCarousel();
}

function onPriceSliderChange() {
	if($("#idtsubmarket").val() != "")
		filterPresentationData();
}

function addViews()
{
	$(".viewsContainer").html("");
	str = "";
	str += "<button class='btn btn-primary btn-xs' style='margin-bottom: 8px;' onClick=\"unitViewForPartial('');\">Unit View</button><br />";
	str += "<button class='btn btn-primary btn-xs' style='margin-bottom: 8px;' onClick=\"unitViewForPartial('topdown');\">Top Down View</button><br />";
	
	if(typeof window.residentialPartialCamera[selectedRetalG.idtbuilding] != "undefined")
		str += "<button class='btn btn-primary btn-xs' style='margin-bottom: 8px;' onClick=\"unitViewForPartial('floorplan');\">Floorplan Aligned</button><br />";
	
	if(typeof window.buildingClippingPlanes[selectedRetalG.idtbuilding] != "undefined")
	str += "<button class='btn btn-primary btn-xs panoViewButton' style='margin-bottom: 8px;' onClick=\"unitViewForPartial('panoview');\">Panorama View</button><br />";
	
	if(typeof window.residentialPartialCamera[selectedRetalG.idtbuilding] != "undefined")
		str += "<button class='btn btn-primary btn-xs' style='margin-bottom: 8px;' onClick=\"unitViewForPartial('view');\">Suite View</button><br />";
	
	$(".viewsContainer").html(str);
}

window.pictureCntr = [];
window.pictureCntr["unit"] = 0;
window.pictureCntr["exterior"] = 0;
window.pictureCntr["common"] = 0;

window.totalPictures = [];
window.totalPictures["unit"] = 0;
window.totalPictures["exterior"] = 0;
window.totalPictures["common"] = 0;

function resetUnitsPictureCounters()
{
	window.pictureCntr["unit"] = 0;
	window.pictureCntr["exterior"] = 0;
	window.pictureCntr["common"] = 0;

	window.totalPictures["unit"] = 0;
	window.totalPictures["exterior"] = 0;
	window.totalPictures["common"] = 0;
}

function pictureNext(type)
{
	if(window.pictureCntr[type] < (window.totalPictures[type] - 1 ))
	{
		window.pictureCntr[type]++;
		$("."+type+"Pictures").addClass("hide");
		$("."+type+"Picture-"+window.pictureCntr[type]).removeClass("hide");
	}
	updatePrevNextColor(type);
}

function picturePrev(type)
{
	if(window.pictureCntr[type] >= 1)
	{
		window.pictureCntr[type]--;
		$("."+type+"Pictures").addClass("hide");
		$("."+type+"Picture-"+window.pictureCntr[type]).removeClass("hide");
	}
	updatePrevNextColor(type);
}

function updatePrevNextColor(type)
{
	if(window.totalPictures[type] <= 1)
	{
		$("."+type+"-picture-chevron-left").css("color", "grey");
		$("."+type+"-picture-chevron-right").css("color", "grey");
	}
	else if(window.pictureCntr[type] == 0)
	{
		$("."+type+"-picture-chevron-left").css("color", "grey");
		$("."+type+"-picture-chevron-right").css("color", "#3c8dbc");
	}
	else if(window.pictureCntr[type] == (window.totalPictures[type] - 1 ))
	{
		$("."+type+"-picture-chevron-left").css("color", "#3c8dbc");
		$("."+type+"-picture-chevron-right").css("color", "grey");
	}
	else
	{
		$("."+type+"-picture-chevron-left").css("color", "#3c8dbc");
		$("."+type+"-picture-chevron-right").css("color", "#3c8dbc");
	}
}

function initiateUnitImagesCarousel()
{
	return "";
	
	var slideCount = $('#slider ul.image_slider_ul li').length;
	var slideWidth = $('#slider ul.image_slider_ul li').width();
	var slideHeight = $('#slider ul.image_slider_ul li').height();
	var sliderUlWidth = slideCount * slideWidth;

	$('#slider ul.image_slider_ul').css({ marginLeft: - slideWidth });

	  $('#slider ul.image_slider_ul li:last-child').prependTo('#slider ul.image_slider_ul');

	  function moveLeft() {
		  $('#slider ul.image_slider_ul').animate({
			  left: + slideWidth
		  }, 600, function () {
			  $('#slider ul.image_slider_ul li:last-child').prependTo('#slider ul.image_slider_ul');
			  $('#slider ul.image_slider_ul').css('left', '');
		  });
	  };

	  function moveRight() {
		  $('#slider ul.image_slider_ul').animate({
			  left: - slideWidth
		  }, 600, function () {
			  $('#slider ul.image_slider_ul li:first-child').appendTo('#slider ul.image_slider_ul');
			  $('#slider ul.image_slider_ul').css('left', '');
		  });
	  };

	  var navDots= [];

	  for(var i=0; i<slideCount; i++)
	  {
	  navDots[i]='<li currentSlide="'+i+'"></li>';
	  $('.indicator').append(navDots[i]);
	  }


	  var count = 0;
		$("ul.indicator li").eq(count).addClass("active");


		slideCountforindicators = slideCount-1;
		$('button.control_prev').click(function () {
			moveLeft();

			$("ul.indicator li").eq(count).removeClass("active");
			count--;
			if(count<0)
			{
				count=slideCountforindicators;
			}

			$("ul.indicator li").eq(count).addClass('active');
		});

		$('button.control_next').click(function () {
			moveRight();

			$("ul.indicator li").eq(count).removeClass("active");
			  count++;
			  if(count>slideCountforindicators)
			  {
				count=0;
			  }
		  
			  $("ul.indicator li").eq(count).addClass('active');
		});
		
		//   Automatic Slider
	  
	  /* setInterval(function () {

		  if($('#slider').is(':hover')) {

		  }else{
			  moveRight();
				  $("ul.indicator li").eq(count).removeClass("active");
					count++;
					if(count>slideCountforindicators)
					{
					count=0;

					}

					$("ul.indicator li").eq(count).addClass('active');
		  }
	  }, 3000); */
	  
}

//Map Geo functions Starts Here
function getCentroid(coords)
{
	var allLat = 0;
	var allLon = 0;
	var cntr = 0;
	var alternate = true;
	$.each(coords, function (index, row){
		if(alternate)
		{
			cntr++;
			allLon = allLon + parseFloat(row);
		}
		else
			allLat = allLat + parseFloat(row);
		alternate = !alternate;
	});
	return [parseFloat(allLon/cntr), parseFloat(allLat/cntr)]
}

function toRad(Value){
    return Value * Math.PI / 180;
}

function toDegree(Value){
	var pi = Math.PI;
	return Value * (180/pi);
}

Number.prototype.toDeg = function(){
   return this * 180 / Math.PI;
}

function getBearing(lat1,lon1,lat2,lon2){
	var dLat = (lat2-lat1);
	var dLon = (lon2-lon1);
	var y = Math.sin(dLon) * Math.cos(lat2);
	var x = (Math.cos(lat1)*Math.sin(lat2))-(Math.sin(lat1)*Math.cos(lat2)*Math.cos(dLon));
	var brng = Math.atan2(y, x);
	brng = brng * (180/3.14);
	return brng;
}

function getDistance(lat1, lon1, lat2, lon2){
	var d = 0;
	var c = 0;
	var a = 0;
	var R = 6371; // km
	var dLat = toRad(lat2-lat1);
	var dLon = toRad(lon2-lon1);
	var lat1 = toRad(lat1);
	var lon1 = toRad(lon1);
	var lat2 = toRad(lat2);//To resolve issue # 202
	a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	d = R * c * 1000;
	return d;
}

function getDestination(lat1,lon1,brng,d){
	var R = 6371;
	var d = d/1000; //in km
	var lat1 = toRad(lat1);
	var lon1 = toRad(lon1);
	var brng = toRad(brng);
	var lat2 = Math.asin(parseFloat(Math.sin(lat1)*Math.cos(d/R)) + parseFloat(Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng)));
	var lon2 = parseFloat(lon1) + parseFloat(Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1),Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2)));
	lat2 = lat2*(180/Math.PI);
	lon2 = lon2*(180/Math.PI);
	return new Array(lat2,lon2);
}
//Map Geo functions Ends Here
function unitViewForPartial(type = "")
{
	if(type == "")
	{
		console.log(selectedRetalG);
		//var pt1 = getCentroid(eval("["+window.selectedRetalG.coords+"]"));
		//var pt2 = getCentroid(eval("["+window.selectedRetalG.bcoords+"]"));
		/*	Pt1 is Building Centroid */
		/*	Pt2 is from 'Improved Position' */

		var pt1 = getCentroid(eval("["+window.selectedRetalG.coords+"]"));
		temp = window.selectedRetalG.coords.split(",");
		labelHeight = parseFloat(window.selectedRetalG.bottomfloorheight) + parseFloat(window.selectedRetalG.floorheight);
		var newPosition = improvedLabelPosition(parseInt(window.selectedRetalG.idtbuilding), temp[1], temp[0], parseFloat(labelHeight), 4);
		pt2 = [newPosition[1], newPosition[0]];
		var ht = parseFloat(window.selectedRetalG.bottomfloorheight) + parseFloat(window.selectedRetalG.floorheight) + 4;
		console.log(pt1);
		console.log(pt2);
		console.log(ht);
		//var pt1 = [window.pointForUnitView[0], window.pointForUnitView[1]];
		////var pt1 = [window.clickedLongitude, window.clickedLatitude];
		//var pt2 = [window.pointForUnitView[3], window.pointForUnitView[4]];
		prepareHorizonCameraView(pt2, pt1, ht);
		return "";
	}
	else if(type == "floorplan")
	{
		if(!window.clippingFeatureActive)
			showClippingPlane(selectedRetalG.idtbuilding);
		
		console.log(selectedRetalG);
		if(typeof window.residentialPartialCamera[selectedRetalG.idtbuilding] != "undefined" && typeof window.residentialPartialCamera[selectedRetalG.idtbuilding][selectedRetalG.unit] != "undefined" && typeof window.residentialPartialCamera[selectedRetalG.idtbuilding][selectedRetalG.unit].floorplan != "undefined")
			flyToIdtcamera(window.residentialPartialCamera[selectedRetalG.idtbuilding][selectedRetalG.unit].floorplan);
	}
	else if(type == "view")
	{
		if(!window.clippingFeatureActive)
			showClippingPlane(selectedRetalG.idtbuilding);
		
		console.log(selectedRetalG);
		if(typeof window.residentialPartialCamera[selectedRetalG.idtbuilding] != "undefined" && typeof window.residentialPartialCamera[selectedRetalG.idtbuilding][selectedRetalG.unit] != "undefined" && typeof window.residentialPartialCamera[selectedRetalG.idtbuilding][selectedRetalG.unit].view != "undefined")
			flyToIdtcamera(window.residentialPartialCamera[selectedRetalG.idtbuilding][selectedRetalG.unit].view);
	}
	else if(type == "topdown")
	{
		console.log(selectedRetalG);
		flyToIdtcameraV2(selectedRetalG.idtbuilding, 3);
	}
	else if(type == "panoview")
	{
		if(!window.clippingFeatureActive)
			showClippingPlane(selectedRetalG.idtbuilding);
		
		console.log(selectedRetalG);
		preparePanoCameraView();
		
	}
}

function improvedLabelPosition(idtbldg, labelLat, labelLon, height, additionalDistance)
{
	//Change of variables, but this is from building table, latitude and longitude
	var baseLat = window.buildingData[idtbldg].lat;
	var baseLon = window.buildingData[idtbldg].lon;
	var enableDebugging = false;
	if(enableDebugging)
	{
		viewerDemoResiApp.entities.removeById("pt1");
		viewerDemoResiApp.entities.add({
			/* id : "pt1", */
			position : Cesium.Cartesian3.fromDegrees(parseFloat(baseLon), parseFloat(baseLat), parseFloat(height)),
			point : {
				color : Cesium.Color.RED,
				pixelSize : 8
			}
		});
		viewerDemoResiApp.entities.add({
			/* id : "pt1", */
			position : Cesium.Cartesian3.fromDegrees(parseFloat(labelLon), parseFloat(labelLat), parseFloat(height)),
			point : {
				color : Cesium.Color.YELLOW,
				pixelSize : 8
			}
		});
	}
		
	//console.log("Base Coordinates " + baseLon + ", " + baseLat);
	//console.log("Label Coordinates " + labelLon + ", " + labelLat);
	var brng = getBearing(baseLat, baseLon, labelLat, labelLon);
	//This is important for display
	brng = 360 - brng;
	//console.log("Bearing " + brng);
	var distance = getDistance(baseLat, baseLon, labelLat, labelLon);
	//console.log("Distance "+distance);
	
	
	if(enableDebugging && false)
	{
		var newDestination = getDestination(baseLat, baseLon, brng, parseFloat(distance));
		//console.log("First Trial",newDestination);
		viewerDemoResiApp.entities.removeById("pt2");
		viewerDemoResiApp.entities.add({
			/* id : "pt2", */
			position : Cesium.Cartesian3.fromDegrees(parseFloat(newDestination[1]), parseFloat(newDestination[0]), parseFloat(height)),
			point : {
				color : Cesium.Color.BLUE,
				pixelSize : 8
			}
		});
		
		viewerDemoResiApp.entities.removeById("firstApproximation");
		viewerDemoResiApp.entities.add({
		  /* id: "firstApproximation", */
		  polyline: {
			positions: Cesium.Cartesian3.fromDegreesArrayHeights([baseLon, baseLat, parseFloat(height), newDestination[1], newDestination[0], parseFloat(height)]),
			width: 2,
			material: Cesium.Color.RED.withAlpha(0.3),
			/* clampToGround: true, */
		  },
		});
	}
	newDestination = getDestination(baseLat, baseLon, brng, (parseFloat(distance) + parseFloat(additionalDistance)));
	//console.log("recheck Bearing "+getBearing(baseLat, baseLon, newDestination[0], newDestination[1]));
	if(enableDebugging)
	{
		console.log("Second Trial", newDestination);
		
		viewerDemoResiApp.entities.removeById("pt3");
		viewerDemoResiApp.entities.add({
			/* id : "pt3", */
			position : Cesium.Cartesian3.fromDegrees(parseFloat(newDestination[1]), parseFloat(newDestination[0]), parseFloat(height)),
			point : {
				color : Cesium.Color.BLUE,
				pixelSize : 8
			}
		});
		
		viewerDemoResiApp.entities.removeById("secondApproximation");
		viewerDemoResiApp.entities.add({
		 /*  id: "secondApproximation", */
		  polyline: {
			positions: Cesium.Cartesian3.fromDegreesArrayHeights([baseLon, baseLat, parseFloat(height), newDestination[1], newDestination[0], parseFloat(height)]),
			width: 2,
			material: Cesium.Color.AQUA.withAlpha(0.3),
			/* clampToGround: true, */
		  },
		});
	}
	return newDestination;
}


function prepareHorizonCameraView(pt1 = null, pt2 = null, ht = null)
{ 
  viewerDemoResiApp.entities.removeById('cyl-clip');
  var cyl = viewerDemoResiApp.entities.add({
    id : 'cyl-clip',
    position: Cesium.Cartesian3.fromDegrees(pt1[0], pt1[1], ht),
    cylinder : {
      length : ht,
      topRadius : 2.0,
      bottomRadius : 20.0,
      material : Cesium.Color.YELLOW
    },
    show:false
  });
  viewerDemoResiApp.entities.removeById('spn-clip');
  var spn = viewerDemoResiApp.entities.add({
    id : 'spn-clip',
    position: Cesium.Cartesian3.fromDegrees(pt2[0], pt2[1], ht),
    extrudedHeight:0,
    cylinder : {
      length : ht,
      topRadius : 2.0,
      bottomRadius : 20.0,
      material : Cesium.Color.GREEN
    },
    show:false
  });
  
  entityPosition = spn.position.getValue(viewerDemoResiApp.clock.currentTime);
  
  var targetPosition = cyl.position.getValue(viewerDemoResiApp.clock.currentTime);
  // Look towards a target.
  var direction = Cesium.Cartesian3.subtract(targetPosition, entityPosition, new Cesium.Cartesian3());
  direction = Cesium.Cartesian3.normalize(direction, direction);
  var approxUp = Cesium.Cartesian3.normalize(entityPosition, new Cesium.Cartesian3());
  
  // cross viewdir with approxUp to get a right normal
  var right = Cesium.Cartesian3.cross(direction, approxUp, new Cesium.Cartesian3());
  right = Cesium.Cartesian3.normalize(right, right);

  // cross right with view dir to get an orthonormal up
  var up = Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3());
  up = Cesium.Cartesian3.normalize(up, up); // might not even be necessary, I dunno, I'm a cat!
  
  viewerDemoResiApp.camera.flyTo({
    destination : entityPosition,
    orientation : {
      direction : direction,
      up : up
    },
    duration: 4
  });
}

function nextImage()
{
	if(typeof window.resiRentalImageContainer[window.currentImageCounter + 1] != "undefined")
	{
		viewImageInModal((window.currentImageCounter + 1), window.resiRentalImageContainer[window.currentImageCounter + 1].path, window.resiRentalImageContainer[window.currentImageCounter + 1].width, window.resiRentalImageContainer[window.currentImageCounter + 1].height);
	}
}

function previousImage()
{
	if(typeof window.resiRentalImageContainer[window.currentImageCounter - 1] != "undefined")
	{
		viewImageInModal((window.currentImageCounter - 1), window.resiRentalImageContainer[window.currentImageCounter - 1].path, window.resiRentalImageContainer[window.currentImageCounter - 1].width, window.resiRentalImageContainer[window.currentImageCounter - 1].height);
	}
}

function viewImageInModal(cntr, path, width, height, imgType = "")
{
	window.currentImageCounter = cntr;
	console.log("Image Dimensions " + width + " x " + height);
	var aspectRatio = width/height;
	aspectRatio = aspectRatio.toFixed(2);
	
	if(width > 800)
	{
		height = height * 800 / width;
		width = 800;
	}
	if(height > 1000)
	{
		width = width * 1000 / height;
		height = 1000;
	}
	if(imgType == "Floor Plan")
	{
		$("#imageContainerBig").html("<img onClick=\"createClippingFloorFromImageModal();\" class='bigImage' src='"+path+"' width='"+width+"px' height='"+height+"px' />");
	}
	else
	{
		$("#imageContainerBig").html("<img class='bigImage' src='"+path+"' width='"+width+"px' height='"+height+"px' />");
	}
	if(!$('#imageModal').hasClass('in'))
		$(".modalButton").click();
}

function createClippingFloorFromImageModal()
{
	$('#imageModal').modal("hide");
	unitViewForPartial('floorplan');
	
}

function resetCondoInformation() {
  $("#residetails").hide();
}

function resetSubStats() {
  $("#submarketStats").hide();
}

function numberWithCommas(symbol, x) {
	if(x!= "" && x > 0)
	{
		return symbol+""+x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}
	else
	{
		return "0";
	}
}
function numberWithComma(x) {
	return numberWithCommas("", x);
}

window.priceFrom = 0;
window.priceTo = 1200;
function updatePriceRange() {
	console.log(" IN updatePriceRange() ");
	var temp = $("#priceSlider").val().split(",");
	$(".rangeMinValue").html(numberWithCommas("$", temp[0]));
	$(".rangeMaxValue").html(numberWithCommas("$", temp[1]));
	window.priceFrom = parseInt(temp[0]);
	window.priceTo = parseInt(temp[1]);
	if(!window.firstFiltered || true)
	{
		filterLoadedData();
		updateSummaryInfoboxes();
	}
}

function updateSummaryInfoboxes()
{
	var idtsubmarket = $("#idtsubmarket").val();
	if(idtsubmarket == "")
		idtsubmarket = "all";
	var testhtml = "";
	var submarketOrder = [3,4,7,6,5];
	var totalrentals = 0;
	testhtml += "<table class='table' style='margin-bottom:-7px !important;'>";
	testhtml += "<tr><th>Submarket</th><th class='bed0head'>Studio</th><th class='bed1head'>1 Bed</th><th class='bed2head'>2 Bed</th><th class='bed3head'>3+ Bed</th><th>Total</th></tr>";
	submarketHtml = [];
	$.each(window.resirentalStats, function(index, row) {
		if(typeof index != "undefined" && typeof row != "undefined")
		{
			if(idtsubmarket == "all" || idtsubmarket == index)
			{
			  var tot = 0;
			  tot = parseInt(row.studio) + parseInt(row.onebhk) + parseInt(row.twobhk) + parseInt(row.more);
			  totalrentals += tot;
			  var flyfunc = "flyToIdtcamera("+submarketDetails[index].idtcamera+")";
			  submarketHtml[index] = "<tr><td><a href='javascript:void(0);' onclick='"+flyfunc+"'>"+submarketDetails[index].ssubname+"</a></td><td>"+row.studio+"</td><td>"+row.onebhk+"</td><td>"+row.twobhk+"</td><td>"+row.more+"</td><td>"+tot+"</td></tr>";
			}
		}
	});
	$.each(submarketOrder, function (i, r){
		if(typeof submarketHtml[r] != "undefined")
		{
			testhtml += submarketHtml[r];
		}
	});
	testhtml += "<tr><th>Total</th><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td><span class='totalCountBigText boldText'>"+totalrentals+"</span></td></tr>";
	testhtml += "</table>";
	$('#substatsinfo').html(testhtml);
}

function gobackshowStats() {
	$("#residetails").hide();
	$("#submarketStatistics").hide();
	$('#submarketStats').css('right', '15px').removeClass('sm-collapsed');
	$('#submarkCollapseIcon').removeClass('fa-chevron-left').addClass('fa-chevron-right');
	$('#submarketStats').css('right', '15px').removeClass('sm-collapsed');
	$('#submarkCollapseIcon').removeClass('fa-chevron-left').addClass('fa-chevron-right');
	$("#submarketStats").show();
	$("#BackToUnitButton").addClass("hide");
	if(window.lastSelectedUnitPrimitive != null)
	{
		$("#BackToUnitButton").removeClass("hide");
	}
}

//SK: To load skip floor logic
function checkIfFloorToSkip(idtbuilding, number)
{
	//console.log(" IN checkIfFloorToSkip( "+idtbuilding+", "+number+" )");
	var check = true;
	if(typeof window.submarketBuildingFloorsAdjustments[window.buildingData[idtbuilding].idtsubmarket] != "undefined")
	{
		if(typeof window.submarketBuildingFloorsAdjustments[window.buildingData[idtbuilding].idtsubmarket][idtbuilding] != "undefined")
		{
			if(window.submarketBuildingFloorsAdjustments[window.buildingData[idtbuilding].idtsubmarket][idtbuilding].total_floors < number)
			{
				check = false;
			}
		}
	}
	return check;
}

window.submarketBuildingFloorsAdjustments = [];
function getSubmarketBuildingFloorsAdjustments()
{
	$.ajax({
	  method: "POST",
	  url: window.apiBaseUrl+"controllers/floorController.php",
	  //02/25 Skip Coords column
	  data: { sourceApp : window.app_name, param : "getSubmarketBuildingFloorsAdjustments"}
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		if(data.status == "success")
		{
			window.submarketBuildingFloorsAdjustments = data.data;
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

getSubmarketBuildingFloorsAdjustments();

//New Development
/*
function getNewDevelopmentData() {

	$.ajax({
	  method: "POST",
	  url: window.apiBaseUrl+"controllers/newdevelopmentController.php",
	  data: { sourceApp : window.app_name, param : "getTnewdevelopmentPPT" }
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		if(data.status == "success")
		{
			window.newDevelopmentDowntownStatistics = data.downtownStatistics;
			window.newDevelopmentBuildingStatistics = data.buildingStatistics;
			loadNewDevelopmentDataFromJSON(data.data);
		}
		else
		{
			alert("Something went wrong");
		}
	});

}

function loadNewDevelopmentDataFromJSON(jsonData) {
	window.newDevelopmentData  = [];

	$.each(jsonData, function(index, eachRow){
		if(typeof eachRow.idtbuilding != "undefined") {
			if(typeof window.newDevelopmentData[eachRow.idtbuilding] == "undefined") {
				window.newDevelopmentData[eachRow.idtbuilding] = [];
			}
			window.newDevelopmentData[eachRow.idtbuilding][window.newDevelopmentData[eachRow.idtbuilding].length] = eachRow;
		}
	});
	if(typeof updateProgressBar != "undefined"){ window.loadingAjaxCall++; updateProgressBar(); }

	if(window.stepToExecute != null)
		initPPT();
	//console.log(window.newDevelopmentData)
}

getNewDevelopmentData();
*/

function getAllBuildingsData()
{
	$.ajax({
	  method: "POST",
	  url: window.apiBaseUrl+"controllers/nycConstructionController.php",
	  data: { sourceApp : window.app_name, param : "getAllBuildingsData" }
	  })
	.done(function( data ) {
		data = $.parseJSON( data );

		if(data.status == "success")
		{
			loadAllBuildingsDataFromZip(data.fileName);
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

function loadAllBuildingsDataFromZip(zipFile)
{
	JSZipUtils.getBinaryContent(zipFile, function(err, data) {
		var elt = document.getElementById('jszip_utils');
		if(err) {
		  showError(elt, err);
		  return;
		}

		try {
		  JSZip.loadAsync(data)
		  .then(function(zip) {
			  //console.log("Loading Zip...");
			  //console.log(zip);
			  var jsonFileName = zipFile.replace("pptCache/", "").replace(".zip", ".json");
			  //console.log(jsonFileName);
			return zip.file(jsonFileName).async("string");
		  })
		  .then(function success(text) {
			loadAllBuildingsDataFromJSON(text);
		  }, function error(e) {
			showError(elt, e);
		  });
		} catch(e) {
		  showError(elt, e);
		}
	});

	function showError(ele, e)
	{
		//console.log("ERRROR");
		//console.log(ele);
		//console.log(e);
	}
}

function loadAllBuildingsDataFromJSON(jsonData)
{
	console.log("window.allBuildingsData Ready!!!!!!!!!!!");
	jsonData = $.parseJSON(jsonData);
	window.allBuildingsData = jsonData.allBuildingsData;
	window.loadingAjaxCall++;updateProgressBar();
}



// NYC Construction
function getNYCConstructionData()
{
	$.ajax({
	  method: "POST",
	  url: window.apiBaseUrl+"controllers/nycConstructionController.php",
	  data: { sourceApp : window.app_name, param : "getNYCConstructionData" }
	  })
	.done(function( data ) {
		data = $.parseJSON( data );

		if(data.status == "success")
		{
			loadNYCConstructionDataFromZip(data.fileName);
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

function loadNYCConstructionDataFromZip(zipFile)
{
	JSZipUtils.getBinaryContent(zipFile, function(err, data) {
		var elt = document.getElementById('jszip_utils');
		if(err) {
		  showError(elt, err);
		  return;
		}

		try {
		  JSZip.loadAsync(data)
		  .then(function(zip) {
			  //console.log("Loading Zip...");
			  //console.log(zip);
			  var jsonFileName = zipFile.replace("pptCache/", "").replace(".zip", ".json");
			  //console.log(jsonFileName);
			return zip.file(jsonFileName).async("string");
		  })
		  .then(function success(text) {
			loadNYCConstructionDataFromJSON(text);
		  }, function error(e) {
			showError(elt, e);
		  });
		} catch(e) {
		  showError(elt, e);
		}
	});

	function showError(ele, e)
	{
		//console.log("ERRROR");
		//console.log(ele);
		//console.log(e);
	}
}

function loadNYCConstructionDataFromJSON(jsonData)
{
	jsonData = $.parseJSON(jsonData);
	window.nycConstructionData = jsonData.constructionData;
	window.nycConstructionSummary = jsonData.buildingStatistics;
	window.nycConstructionStats = jsonData.downtownStatistics;
	//if(window.stepToExecute != null)
		//initPPT();
	window.loadingAjaxCall++;updateProgressBar();
}

getNYCConstructionData();

window.fogChecked = false;//Default value to false
//Default Load 
loadMarketDetails();
loadSubmarketDetails();
loadMinMaxPriceForSubmarket('all');


/*	New Spin functionality	*/
window.toggleFloorSpinEnabled = false;
function chapter13BuildingCameraSpin(idtbuilding, centroidLon, centroidLat, height, isNewBuilding = true)
{
	if(isNewBuilding)
		window.toggleFloorSpinEnabled = !window.toggleFloorSpinEnabled;
	if(window.toggleFloorSpinEnabled)
	{
		$(".spinButtonText").text("Stop");
		$(".spinButtonText").toggleClass("btn-default");
		$(".spinButtonText").toggleClass("btn-primary");
		//Toggle requires first STOP
		//window.startCameraRotation = false;
		//enableSpinForBuilding(idtbuilding, parseFloat(centroidLon), parseFloat(centroidLat), parseFloat(height));
		//Start again
		//enableSpinForBuilding(idtbuilding, centroidLon, centroidLat, height);
		var bldgCentroid = getCentroid(eval("["+window.allBuildingsData[idtbuilding].coords+"]"));
		window.currentCameraElevation = height + 100;
		currentPosition = Cesium.Cartesian3.fromDegrees(bldgCentroid[0], bldgCentroid[1], (height / 2));
		CameraRotation();
	}
	else
	{
		$(".spinButtonText").text("Spin");
		$(".spinButtonText").toggleClass("btn-default");
		$(".spinButtonText").toggleClass("btn-primary");
		//enableSpinForBuilding(idtbuilding, centroidLon, centroidLat, height);
		StopCameraRotation();
		viewerDemoResiApp.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	}
}

/*	New Spin functionality	*/
window.toggleFloorSpinEnabled = false;
function chapter13BuildingCameraSpin_ORIGINAL(idtbuilding, centroidLon, centroidLat, height, isNewBuilding = true)
{
	if(isNewBuilding)
		window.toggleFloorSpinEnabled = !window.toggleFloorSpinEnabled;
	if(window.toggleFloorSpinEnabled)
	{
		$(".spinButtonText").text("Stop");
		$(".spinButtonText").toggleClass("btn-default");
		$(".spinButtonText").toggleClass("btn-primary");
		//Toggle requires first STOP
		window.startCameraRotation = false;
		enableSpinForBuilding(idtbuilding, parseFloat(centroidLon), parseFloat(centroidLat), parseFloat(height));
		//Start again
		//enableSpinForBuilding(idtbuilding, centroidLon, centroidLat, height);
	}
	else
	{
		$(".spinButtonText").text("Spin");
		$(".spinButtonText").toggleClass("btn-default");
		$(".spinButtonText").toggleClass("btn-primary");
		enableSpinForBuilding(idtbuilding, centroidLon, centroidLat, height);
	}
}

var cylinderEntity = null;
var spinEntity = null;
function enableSpinForBuilding_FROMPPT(idtbuilding, centroidLon, centroidLat, height, customRadius = false, radiansOffset = 0, typeOfSpin = "")
{
	if(window.start == null || window.stop == null)
	{
		setClockTime();
	}
	window.start = Cesium.JulianDate.fromDate(new Date(2020, 2, 25, 10));
	
	if(window.startCameraRotation)
	{
		if(idtbuilding > 0)//Means Info SLide
		{
			$(".infoToggleSpin").removeClass("btn-primary");
			$(".infoToggleSpin").addClass("btn-grey");
		}
		window.startCameraRotation = false;
		return "";
	}
	
	$(".infoToggleSpin").addClass("btn-primary");
	$(".infoToggleSpin").removeClass("btn-grey");
	
	var radius = 0.004;
	if(height < 100)
	{
		radius = 0.002;
		height = 100 + parseInt(height);
	}
	
	if(customRadius != false)
		radius = customRadius;
	
	tempHt = height/1.5;
	if(typeOfSpin == "spin1")
		tempHt = 20;
	//Create Centroid
	cylinderEntity = viewerDemoResiApp.entities.add({
		name : 'Green cylinder with black outline',
		position: Cesium.Cartesian3.fromDegrees(centroidLon, centroidLat, tempHt),
		cylinder : {
			length : 10.0,
			topRadius : 10.0,
			bottomRadius : 10.0,
			material : Cesium.Color.GREEN.withAlpha(0.01)
		},
		show:false
	});
	
	//New way to work for entire timeline
	var property = new Cesium.SampledPositionProperty();
	var degStep = 0;
	window.start = Cesium.JulianDate.fromDate(new Date(2020, 2, 25, 4, 02));
	viewerDemoResiApp.clock.startTime = start.clone();
	viewerDemoResiApp.clock.currentTime = start.clone();
	positionsArray = [];
	for(var i = 0; i < 360; i += 5)//15 days seconds
	{
		var radians = Cesium.Math.toRadians(i);
		radians = radians + radiansOffset;
		var time = Cesium.JulianDate.addSeconds(start, i*2, new Cesium.JulianDate());
		positionsArray.push( Cesium.Cartesian3.fromDegrees(centroidLon + (radius * 1 * Math.cos(radians)), centroidLat + (radius * Math.sin(radians)), (parseInt(height) + (parseInt(height)*0.5))));
	}
	
	/* $.each(customSpin1Positions, function (JK, EX){
		positionsArray.push( Cesium.Cartesian3.fromDegrees(EX[0], EX[1], (parseInt(height) + (parseInt(height)*0.5))));
	}); */
	
	positionSequence = 0;
	pos = null;
	$.each(window.pts, function (KJ, EX){
		EX.show = false;
	});
	window.pts = [];
	for(var i = 0; i <= 1296000; i+=100)//15 days seconds
	{
		if(typeof positionsArray[positionSequence] != "undefined")
		{
			pos = positionsArray[positionSequence];
		}
		//Also create a point for each sample we generate.
		en = viewerDemoResiApp.entities.add({
			position : pos,
			point : {
				pixelSize : 8,
				color : Cesium.Color.TRANSPARENT,
				outlineColor : Cesium.Color.YELLOW,
				outlineWidth : 3
			},
			show:false
		});
		window.pts.push(en);
		var time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
		property.addSample(time, pos);
		positionSequence++;
		if(typeof positionsArray[positionSequence] == "undefined")
			positionSequence = 0;
	}
	
	//Actually create the spinEntity
	spinEntity = viewerDemoResiApp.entities.add({

		//Set the spinEntity availability to the same interval as the simulation time.
		availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
			start : start,
			stop : stop
		})]),
		show : false,
		//Use our computed positions
		position : property,

		//Automatically compute orientation based on position movement.
		orientation : new Cesium.VelocityOrientationProperty(property),

		//Load the Cesium plane model to represent the spinEntity
		/* model : {
			uri : '../SampleData/models/CesiumAir/Cesium_Air.glb',
			minimumPixelSize : 64
		}, */

		//Show the path as a pink line sampled in 1 second increments.
		path : {
			resolution : 1,
			material : new Cesium.PolylineGlowMaterialProperty({
				glowPower : 0.1,
				color : Cesium.Color.YELLOW
			}),
			width : 10
		}
	});
	
	startCameraRotation = true;
	viewerDemoResiApp.clock.multiplier = 100;//To Speed Up
	
	/* setTimeout(function(){
	spinEntity.position.setInterpolationOptions({
	  interpolationDegree: 10,
	  interpolationAlgorithm:
		Cesium.LagrangePolynomialApproximation,
	});
	},5000); */
}

function enableSpinForBuilding(idtbuilding, centroidLon, centroidLat, height, customRadius = false, radiansOffset = 0, typeOfSpin = "")
{
	if(window.start == null || window.stop == null)
	{
		setClockTime();
	}
	
	if(window.startCameraRotation)
	{
		if(idtbuilding > 0)//Means Info Slide
		{
			$(".infoToggleSpin").removeClass("btn-primary");
			$(".infoToggleSpin").addClass("btn-grey");
		}
		window.startCameraRotation = false;
		return "";
	}
	
	$(".infoToggleSpin").addClass("btn-primary");
	$(".infoToggleSpin").removeClass("btn-grey");
	
	var radius = 0.004;
	if(height < 100)
	{
		radius = 0.002;
		height = 100 + parseInt(height);
	}
	
	if(customRadius != false)
		radius = customRadius;
	tempHt = height/1.5;
	if(typeOfSpin == "spin1")
		tempHt = 20;
	//Create Centroid
	cylinderEntity = viewerDemoResiApp.entities.add({
		name : 'Green cylinder with black outline',
		position: Cesium.Cartesian3.fromDegrees(centroidLon, centroidLat, tempHt),
		cylinder : {
			length : 10.0,
			topRadius : 10.0,
			bottomRadius : 10.0,
			material : Cesium.Color.GREEN.withAlpha(0.01)
		},
		show:false
	});
	
	//Compute the spinEntity position property.
	//var position = computeCirclularFlight(-74.0132081358815, 40.71302488783638, 0.004);
	
	var property = new Cesium.SampledPositionProperty();
	var degStep = 0;
	window.start = Cesium.JulianDate.fromDate(new Date(2020, 2, 25, 4, 02));
	viewerDemoResiApp.clock.startTime = start.clone();
	viewerDemoResiApp.clock.currentTime = start.clone();
	positionsArray = [];
	for(var i = 0; i < 360; i += 5)//15 days seconds
	{
		var radians = Cesium.Math.toRadians(i);
		radians = radians + radiansOffset;
		var time = Cesium.JulianDate.addSeconds(start, i*2, new Cesium.JulianDate());
		positionsArray.push( Cesium.Cartesian3.fromDegrees(centroidLon + (radius * 1 * Math.cos(radians)), centroidLat + (radius * Math.sin(radians)), (parseInt(height) + (parseInt(height)*0.5))));
	}
	
	positionSequence = 0;
	pos = null;
	$.each(window.pts, function (KJ, EX){
		EX.show = false;
	});
	window.pts = [];
	for(var i = 0; i <= 1296000; i+=100)//15 days seconds
	{
		if(typeof positionsArray[positionSequence] != "undefined")
		{
			pos = positionsArray[positionSequence];
		}
		//Also create a point for each sample we generate.
		en = viewerDemoResiApp.entities.add({
			position : pos,
			point : {
				pixelSize : 8,
				color : Cesium.Color.TRANSPARENT,
				outlineColor : Cesium.Color.YELLOW,
				outlineWidth : 3
			},
			show:false
		});
		window.pts.push(en);
		var time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
		property.addSample(time, pos);
		positionSequence++;
		if(typeof positionsArray[positionSequence] == "undefined")
			positionSequence = 0;
	}
		
	
	//Actually create the spinEntity
	spinEntity = viewerDemoResiApp.entities.add({

		//Set the spinEntity availability to the same interval as the simulation time.
		availability : new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
			start : start,
			stop : stop
		})]),
		show : false,
		//Use our computed positions
		position : property,

		//Automatically compute orientation based on position movement.
		orientation : new Cesium.VelocityOrientationProperty(property),

		//Load the Cesium plane model to represent the spinEntity
		/* model : {
			uri : '../SampleData/models/CesiumAir/Cesium_Air.glb',
			minimumPixelSize : 64
		}, */

		//Show the path as a pink line sampled in 1 second increments.
		path : {
			resolution : 1,
			material : new Cesium.PolylineGlowMaterialProperty({
				glowPower : 0.1,
				color : Cesium.Color.YELLOW
			}),
			width : 10
		}
	});
	
	window.startCameraRotation = true;
}

function spin2ResetView()
{
	if(window.startCameraRotation2 == true)
		window.startCameraRotation2 = false;
	$(".downtownSpin2ViewButton").removeClass("enabledHeaderRow enabledOtherHeaderRow");
	viewerDemoResiApp.scene.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	$('.headerRightLabelCAM').addClass('hide');
	window.cameraSpinS2Initialized = false;
}

var isLockedToCenter = true;
	var startCameraRotation = false;
	var startCameraRotation2 = false;
	window.currentDate = null;
	window.dateProgressing = true;
	window.resiRentalDatesDone = [];//This is for Progressive
	window.lastTimelineDate = null;
	window.panoViewEnabled = false;
	window.cameraS2Speed = 0.001;
	viewerDemoResiApp.clock.onTick.addEventListener(function(clock) {
		var temp = viewerDemoResiApp.clock.currentTime.toString();
		//Another check for Drag operation
		
		window.currentDate = temp.substr(0, 10);
	
		window.lastTimelineDate = temp;
		

		if(window.startCameraRotation2)
		{
			console.log("tick in SPin 2 ");
			//window.toggleSpin2Coordinates
			viewerDemoResiApp.scene.camera.rotateRight(viewerDemoResiApp.timeline._clock._multiplier / 5 * window.cameraS2Speed);
			return "";
		}
		
		if(window.panoViewEnabled == true)
		{
			// Put the camera at the entity.
			console.log(viewerDemoResiApp.clock.currentTime);
			var ent = window.eyeEntity.position.getValue(viewerDemoResiApp.clock.currentTime);
			console.log("ent "+ent);
			/* if(typeof ent != "undefined")
			{
				console.log("eye entitiey undefined ");
				window.panoViewEnabled = false;
				return "";
			} */
			
			viewerDemoResiApp.camera.position.x = ent.x;
			viewerDemoResiApp.camera.position.y = ent.y;
			viewerDemoResiApp.camera.position.z = ent.z;
			// Look towards a target.
			var targetP = window.spEntity.position.getValue(viewerDemoResiApp.clock.currentTime);
			console.log("targetP "+targetP);
			/* if(typeof targetP != "undefined")
			{
				console.log("target undefined ");
				window.panoViewEnabled = false;
				return "";
			} */
			if(typeof targetP == "undefined" )
			{
				window.panoViewEnabled = false;
				console.log("targetP.x is undefined");
				return "";
			}
			
			var direction = Cesium.Cartesian3.subtract(targetP, ent, new Cesium.Cartesian3());
			console.log("direction "+direction);
			direction = Cesium.Cartesian3.normalize(direction, direction);
			viewerDemoResiApp.camera.direction = direction;
			
			// get an "approximate" up vector, which in this case we want to be something like the geodetic surface normal.
			// geocentric might be close enough, I dunno I'm a cat!
			var approxUp = Cesium.Cartesian3.normalize(ent, new Cesium.Cartesian3());
			
			// cross viewdir with approxUp to get a right normal
			var right = Cesium.Cartesian3.cross(direction, approxUp, new Cesium.Cartesian3());
			right = Cesium.Cartesian3.normalize(right, right);
			viewerDemoResiApp.camera.right = right;

			// cross right with view dir to get an orthonormal up
			var up = Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3());
			up = Cesium.Cartesian3.normalize(up, up); // might not even be necessary, I dunno, I'm a cat!
			viewerDemoResiApp.camera.up = up;
			return "";
		}
		
		//console.log("onTick event Listener");
		if (!isLockedToCenter) return;
		
		if(!startCameraRotation)
			return "";
		// Put the camera at the spinEntity.
		if(spinEntity != null && typeof spinEntity != "undefined")
		{
			var entityPosition = spinEntity.position.getValue(viewerDemoResiApp.clock.currentTime);
			if(typeof entityPosition == "undefined")
			{
				console.log("Undefined entityPosition");
				console.log(entityPosition);
				return "";
			}
			var targetPosition = cylinderEntity.position.getValue(viewerDemoResiApp.clock.currentTime);
			
			if(typeof targetPosition == "undefined")
			{
				console.log("targetPosition");
				console.log(targetPosition);
				return "";
			}
			viewerDemoResiApp.camera.position.x = entityPosition.x;
			viewerDemoResiApp.camera.position.y = entityPosition.y;
			viewerDemoResiApp.camera.position.z = entityPosition.z;
			// Look towards a target.
			var direction = Cesium.Cartesian3.subtract(targetPosition, entityPosition, new Cesium.Cartesian3());
			direction = Cesium.Cartesian3.normalize(direction, direction);
			viewerDemoResiApp.camera.direction = direction;
			
			//findOutDistance(toDegree(viewerDemoResiApp.camera.positionCartographic.longitude), toDegree(viewerDemoResiApp.camera.positionCartographic.latitude));
			
			// get an "approximate" up vector, which in this case we want to be something like the geodetic surface normal.
			// geocentric might be close enough, I dunno I'm a cat!
			var approxUp = Cesium.Cartesian3.normalize(entityPosition, new Cesium.Cartesian3());
			
			// cross viewdir with approxUp to get a right normal
			var right = Cesium.Cartesian3.cross(direction, approxUp, new Cesium.Cartesian3());
			right = Cesium.Cartesian3.normalize(right, right);
			viewerDemoResiApp.camera.right = right;

			// cross right with view dir to get an orthonormal up
			var up = Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3());
			up = Cesium.Cartesian3.normalize(up, up); // might not even be necessary, I dunno, I'm a cat!
			camera.up = up;
		}
		else
		{
			//var entityPosition = [];
			//entityPosition.x = 1334616.852821571;//entityPosition.x;
			//entityPosition.y = -4656042.195430394;// entityPosition.y;
			//entityPosition.z = 4137359.837418383;//entityPosition.z;
			
			//targetPosition = entityPosition;
			findOutDistance(toDegree(viewerDemoResiApp.camera.positionCartographic.longitude), toDegree(viewerDemoResiApp.camera.positionCartographic.latitude));
		}
		
	});

window.start = null;
window.stop = null;
function setClockTime() {
	//return "";
	//window.start = Cesium.JulianDate.fromDate(new Date(new Date().setDate(new Date().getDate() - 0.5)));
	//window.start = Cesium.JulianDate.fromDate(new Date(new Date().setDate(new Date().getDate() - 180)));
	//window.currentTime = start.clone();//Cesium.JulianDate.fromDate(new Date(estTimezone.toString()));
	//window.stop = Cesium.JulianDate.addDays(start, 180, new Cesium.JulianDate());
	var d = new Date();
	window.start = Cesium.JulianDate.fromDate(new Date(2020, 2, 25, 16));
	window.stop = Cesium.JulianDate.fromDate(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 16));
        /* window.stop = Cesium.JulianDate.addSeconds(
          window.start,
          3600,
          new Cesium.JulianDate()
        ); */
	//Make sure viewer is at the desired time.
	viewerDemoResiApp.clock.startTime = start.clone();
	viewerDemoResiApp.clock.stopTime = stop.clone();
	viewerDemoResiApp.clock.currentTime = start.clone();
	viewerDemoResiApp.clock.clockRange = Cesium.ClockRange.LOOP_STOP; //Loop at the end
	viewerDemoResiApp.clock.multiplier = 100;

	//Set timeline to simulation bounds
	viewerDemoResiApp.timeline.zoomTo(start, stop);
	
	//Changing To EST
	/* $('.cesium-timeline-ticLabel').each(function(i) {
		var str = $(this).html();
		$(this).html(str.replace("UTC", "EST"));
		console.log($(this).html());
	 }); */
	 
	 /* $('.cesium-animation-svgText').each(function(i) {
		var str = $(this).html();
		$(this).html(str.replace("UTC", "EST"));
		console.log($(this).html());
	 }); */
}

function findOutDistance(sourceLon, sourceLat)
{}

function setCameraFacingDown(idtbldg, cameraType)
{
	if(idtbldg > 0 && idtbldg != null)
	{
		$.ajax({
		  method: "POST",
		  url: window.apiBaseUrl+"controllers/cameraController.php",
		  data: { param : "getBuildingCamera" , "idtbuilding" : idtbldg, "cameraType": cameraType}
		})
		.done(function( data ) {
			//console.log(data);
			data = $.parseJSON( data );
			if(data.status == "success")
			{
				data = data.data[0];
				//console.log(data);
				if(typeof data.latitude == "undefined")
				{
					alert("Camera Not Available!");
				}
				else
				{
					flyToCamera(data.latitude, data.longitude, data.altitude, data.heading, data.tilt, data.pitch, data.roll, 4, viewerDemoResiApp.scene.camera);
				}
			}
			else
			{
				alert("Something went wrong");
			}
		});
	}
}

function formatBigNumbers(num) {
    return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'K' : Math.sign(num)*Math.abs(num)
}

//Loading data by default.
getResiRentalData();

window.createExternalPartials = true;
function createFloatingRingAroundPartial2(idtpartial)
{
	partialRow = null;
	if(typeof window.resirentalData.condo[idtpartial] != "undefined")
		partialRow = window.resirentalData.condo[idtpartial];
	else if(typeof window.resirentalData.rental[idtpartial] != "undefined")
		partialRow = window.resirentalData.rental[idtpartial];
	if(partialRow != null)
	{
		temp = partialRow.coords.split(",");
		coordPoints = [];
		coords = "";
		baseCoords = "";
		firstPoint = [];
		partialLineHeight = parseFloat(partialRow.bottomfloorheight) + 1.65;
		ht = parseFloat(partialRow.bottomfloorheight) + parseFloat(parseFloat(partialRow.floorheight)/2);
		ht = parseFloat(ht.toFixed(2));
		for(i=0; i<temp.length;i++)
		{
			//console.log(temp[i+1], temp[i]);
			newPoints = improvedLabelPosition(partialRow.idtbuilding, temp[i+1], temp[i], 100, -0.5);
			if(firstPoint.length == 0)
				firstPoint = newPoints;
			if(coords != "")
				coords += ",";
			if(baseCoords != "")
				baseCoords += ",";
			coords += newPoints[1] + "," + newPoints[0]+","+partialLineHeight;
			baseCoords += temp[i] + "," + temp[i+1] +","+partialLineHeight;
			coordPoints.push({"lat": temp[i+1], "lon": temp[i], "newlat": newPoints[0], "newlon": newPoints[1]});
			i++;
		}
		
		coords = coords;//+","+firstPoint[1]+","+firstPoint[0];
		//console.log(coordPoints);
		
		//console.log(coords);
		ent = highlightBuildingCondoPolyline("middleRing-"+idtpartial, parseFloat(ht) + 0.1, parseFloat(ht) - 0.1, eval("["+baseCoords+"]"), defaultPrimitiveRingColor);
	}
}

window.floatingRingCollection = [];
window.floatingRingDisplayFlag = false;

function toggleFloatingRingDisplay(idtbldg)
{
	window.floatingRingDisplayFlag = !window.floatingRingDisplayFlag;
	$.each(window.floatingRingCollection, function (index, ent){
		ent.show = window.floatingRingDisplayFlag;
	});
	if(window.floatingRingDisplayFlag)
	{
		$(".showOtherUnitButtonText").removeClass("btn-primary");
		$(".showOtherUnitButtonText").addClass("btn-default");
		$(".showOtherUnitButtonText").text("Hide Other Units");
	}
	else
	{
		$(".showOtherUnitButtonText").addClass("btn-primary");
		$(".showOtherUnitButtonText").removeClass("btn-default");
		$(".showOtherUnitButtonText").text("Show Other Units");
	}
}

function createFloatingRingForBuilding(idtbldg, floorNumber, unitNumber)
{
	clearFloatingRings(idtbldg);
	
	$.each(window.buildingPartialsMap[idtbldg], function (index, idtres){
		//console.log(window.resiRentalAllData[window.resiRentalAllDataMap[idtres]]);
		if(typeof window.resiRentalAllData[window.resiRentalAllDataMap[idtres]] != "undefined")
		if(parseInt(window.resiRentalAllData[window.resiRentalAllDataMap[idtres]].number) >= parseInt(floorNumber))
		{
			//console.log(window.resiRentalAllData[window.resiRentalAllDataMap[idtres]].unit+" != "+unitNumber);
			//if(window.resiRentalAllData[window.resiRentalAllDataMap[idtres]].unit != unitNumber)
			if(parseInt(window.resiRentalAllData[window.resiRentalAllDataMap[idtres]].number) != parseInt(floorNumber))
			{
				//console.log("highlighting Unit "+window.resiRentalAllData[window.resiRentalAllDataMap[idtres]].unit);
				ent = createFloatingRingAroundPartial(idtres);
			}
		}
	});
}

function createFloatingRingAroundPartial(idtpartial)
{
	partialRow = null;
	if(typeof window.resirentalData.condo[idtpartial] != "undefined")
		partialRow = window.resirentalData.condo[idtpartial];
	else if(typeof window.resirentalData.rental[idtpartial] != "undefined")
		partialRow = window.resirentalData.rental[idtpartial];
	
	partialCoordsFromClipping = null;
	$.each(window.officeBuildingClippingData[partialRow.idtbuilding], function (index, eachFloor){
		if(typeof index != "undefined" && typeof eachFloor != "undefined")
		{
			$.each(eachFloor, function (j, eachPartial){
				//console.log(eachPartial.unit_number+" == "+partialRow.unit);
				if(eachPartial.unit_number == partialRow.unit)
					partialCoordsFromClipping = eachPartial.partial_coords.split(",");
			});
		}
	});
	
	if(partialRow != null)
	{
		temp = partialRow.coords.split(",");
		coordPoints = [];
		
		coords = "";
		baseCoords = "";
		
		firstPoint = [];
		partialLineHeight = parseFloat(partialRow.bottomfloorheight) + 1.65;
		ht = parseFloat(partialRow.bottomfloorheight) + parseFloat(parseFloat(partialRow.floorheight)/2);
		ht = parseFloat(ht.toFixed(2));
		for(i=0; i<temp.length;i++)
		{
			//console.log(temp[i+1], temp[i]);
			newPoints = improvedLabelPosition(partialRow.idtbuilding, temp[i+1], temp[i], 100, -0.5);
			if(firstPoint.length == 0)
				firstPoint = newPoints;
			if(coords != "")
				coords += ",";
			if(baseCoords != "")
				baseCoords += ",";
			coords += newPoints[1] + "," + newPoints[0]+","+partialLineHeight;
			baseCoords += temp[i] + "," + temp[i+1] +","+partialLineHeight;
			coordPoints.push({"lat": temp[i+1], "lon": temp[i], "newlat": newPoints[0], "newlon": newPoints[1]});
			i++;
		}
		
		clipPartialCoords = "";
		baseCoordsWithoutHeight = "";
		if(partialCoordsFromClipping != null)
		{
			for(var i = 0; i<partialCoordsFromClipping.length; i++)
			{
				if(clipPartialCoords != "")
					clipPartialCoords += ",";
				if(baseCoordsWithoutHeight != "")
					baseCoordsWithoutHeight += ",";
				clipPartialCoords += partialCoordsFromClipping[i]+","+partialCoordsFromClipping[i+1]+","+partialLineHeight;
				baseCoordsWithoutHeight += partialCoordsFromClipping[i]+","+partialCoordsFromClipping[i+1];
				i++;
			}
			//console.log("Last Point Check: "+partialCoordsFromClipping[0]+" <> "+partialCoordsFromClipping[partialCoordsFromClipping.length-2]);
			if(partialCoordsFromClipping[0] != partialCoordsFromClipping[partialCoordsFromClipping.length-2])
			{
				clipPartialCoords += ","+partialCoordsFromClipping[0]+","+partialCoordsFromClipping[1]+","+partialLineHeight;
				baseCoordsWithoutHeight += ","+partialCoordsFromClipping[0]+","+partialCoordsFromClipping[1];
			}
		}
		
		coords = coords;//+","+firstPoint[1]+","+firstPoint[0];
		//console.log(coordPoints);
		
		//console.log(coords);
		if(clipPartialCoords == "")
			clipPartialCoords = baseCoords;
		ent = highlightBuildingCondoPolyline("middleRing-"+idtpartial, parseFloat(ht) + 0.1, parseFloat(ht) - 0.1, eval("["+clipPartialCoords+"]"), defaultPrimitiveRingColor, window.floatingRingDisplayFlag);
		window.floatingRingCollection.push(ent);
		//Create Fill
		ent = highlightBuildingCondoPolygon("middleRingFill-"+idtpartial, parseFloat(ht) + 0.1, parseFloat(ht) - 0.1, eval("["+baseCoordsWithoutHeight+"]"), Cesium.Color.WHITE.withAlpha(0.3), window.floatingRingDisplayFlag);
		window.floatingRingCollection.push(ent);
	}
}

window.spin1Types = [];
window.spin1Types["highAltitude"] = [];
window.spin1Types["highAltitude"]["height"] = 900;
window.spin1Types["highAltitude"]["radius"] = 0.029;
window.spin1Types["highAltitude"]["radiansOffset"] = 450;

window.spin1Types["lowAltitude"] = [];
window.spin1Types["lowAltitude"]["height"] = 400;
window.spin1Types["lowAltitude"]["radius"] = 0.023;
window.spin1Types["lowAltitude"]["radiansOffset"] = 450;

function downtownSpinFeature()
{
	spin2ResetView();
	$(".spin1FeatureButton").toggleClass("btn-primary");
	$(".spin1FeatureButton").toggleClass("btn-default");
	//01-09 Old Logic
	//enableSpinForBuilding(0, -74.00656985809749, 40.71156080294625, 400, 0.025);
	enableSpinForBuilding(0, -74.00656985809749, 40.71156080294625, window.spin1Types.lowAltitude.height, window.spin1Types.lowAltitude.radius, window.spin1Types.lowAltitude.radiansOffset, "spin1");
}

//New Camera Values
function flyToIdtcameraV2(idtbldg, cameraType)
{
	if(idtbldg > 0 && idtbldg != null)
	{
		$(".chapter13Camera"+cameraType).removeClass("btn-grey");
		$(".chapter13Camera"+cameraType).addClass("btn-primary");
		$.ajax({
		  method: "POST",
		  url: window.apiBaseUrl+"controllers/cameraController.php",
		  data: { param : "getBuildingCamera" , "idtbuilding" : idtbldg, "cameraType": cameraType}
		})
		.done(function( data ) {
			//console.log(data);
			data = $.parseJSON( data );
			if(data.status == "success")
			{
				data = data.data[0];
				//console.log(data);
				if(typeof data.latitude == "undefined")
				{
					alert("Camera Not Available!");
				}
				else
				{
					flyToCamera(data.latitude, data.longitude, data.altitude, data.heading, data.tilt, data.pitch, data.roll, 4, viewerDemoResiApp.scene.camera);
				}
			}
			else
			{
				alert("Something went wrong");
			}
		});
	}
}

window.panoViewEnabled = false;
function preparePanoCameraView()
	{
		if(window.panoViewEnabled == false)
		{
			$(".panoViewButton").removeClass("btn-primary");
			$(".panoViewButton").addClass("btn-default");
			prepareSubPoint();
			console.log("Pano View");
		}
		else
		{
			window.panoViewEnabled = false;
			$(".panoViewButton").addClass("btn-primary");
			$(".panoViewButton").removeClass("btn-default");
		}
	}
	
	function prepareSubPoint()
	{
		var ht = parseFloat(window.clippingBuildingPartialInUse.bottomfloorheight) + parseFloat(window.clippingBuildingPartialInUse.floorheight);
		
		setClockTime();
		var ht = parseFloat(window.clippingBuildingPartialInUse.bottomfloorheight) + parseFloat(window.clippingBuildingPartialInUse.floorheight);
		var coords = eval("["+clippingBuildingPartialInUse.coords+"]");
		var partialCentroid = getCentroid(eval("["+window.clippingBuildingPartialInUse.coords+"]"));
		var buildingCentroid = getCentroid(eval("["+window.buildingData[window.clippingBuildingInUse].coords+"]"));//TODO try with Latitude longitude data for building
		
		if(typeof window.panoViewPoints != "undefined" && typeof window.panoViewPoints[window.clippingBuildingPartialInUse.idtresirentals] != "undefined")
		{
			//Use Custom points
			var newSamplesProperty = new Cesium.SampledPositionProperty();
			var time = Cesium.JulianDate.addSeconds( start, 0, new Cesium.JulianDate() );
			var position = Cesium.Cartesian3.fromDegrees( window.panoViewPoints[window.clippingBuildingPartialInUse.idtresirentals][0][0], window.panoViewPoints[window.clippingBuildingPartialInUse.idtresirentals][0][1], ht );
			newSamplesProperty.addSample(time, position);
			
			time = Cesium.JulianDate.addSeconds( start, 40, new Cesium.JulianDate() );
			position = Cesium.Cartesian3.fromDegrees( window.panoViewPoints[window.clippingBuildingPartialInUse.idtresirentals][1][0], window.panoViewPoints[window.clippingBuildingPartialInUse.idtresirentals][1][1], ht );
			newSamplesProperty.addSample(time, position);
		}
		else
		{
			// Try to calculate points
			
			/* viewerDemoResiApp.entities.add({position : Cesium.Cartesian3.fromDegrees(pt2[0], pt2[1], (parseFloat(window.clippingBuildingPartialInUse.bottomfloorheight)+parseFloat(window.clippingBuildingPartialInUse.floorheight))),point : {pixelSize : 8,color : Cesium.Color.RED},show:true});
			viewerDemoResiApp.entities.add({position : Cesium.Cartesian3.fromDegrees(pt1[0], pt1[1], (parseFloat(window.clippingBuildingPartialInUse.bottomfloorheight)+parseFloat(window.clippingBuildingPartialInUse.floorheight))),point : {pixelSize : 8,color : Cesium.Color.GREEN},show:true});
			viewerDemoResiApp.entities.add({position : Cesium.Cartesian3.fromDegrees(window.buildingData[window.clippingBuildingInUse].longitude, window.buildingData[window.clippingBuildingInUse].latitude, (parseFloat(window.clippingBuildingPartialInUse.bottomfloorheight)+parseFloat(window.clippingBuildingPartialInUse.floorheight))),point : {pixelSize : 8,color : Cesium.Color.BLUE,},show:true}); */
			
			var thresholdDistance = getDistance(buildingCentroid[0],buildingCentroid[1],partialCentroid[0], partialCentroid[1]);
			console.log("thresholdDistance: "+thresholdDistance);
			var allPoints = [];
			for(var i = 0; i<coords.length;i++)
			{
				d = getDistance(window.buildingData[window.clippingBuildingInUse].lon, window.buildingData[window.clippingBuildingInUse].lat, coords[i], coords[i+1]);
				brng = getBearing(window.buildingData[window.clippingBuildingInUse].lon, window.buildingData[window.clippingBuildingInUse].lat, coords[i], coords[i+1]);
				console.log("distance: "+d);
				if(d >= thresholdDistance)
				{
					allPoints.push({"lon":coords[i], "lat": coords[i+1], "distance": d, "bearing": brng});
					//viewerDemoResiApp.entities.add({id:"pt-"+(allPoints.length-1), position : Cesium.Cartesian3.fromDegrees(coords[i], coords[i+1], (parseFloat(window.clippingBuildingPartialInUse.bottomfloorheight)+parseFloat(window.clippingBuildingPartialInUse.floorheight))),point : {pixelSize : 8,color : Cesium.Color.RED.withAlpha(0.5),},show:true});
				}
				
				i++;
			}
			console.log(allPoints);
			allPoints = allPoints.sort(function(a, b) {
				return b.distance - a.distance;
			});
			console.log(allPoints);
			
			//viewerDemoResiApp.entities.add({position : Cesium.Cartesian3.fromDegrees(allPoints[0]["lon"], allPoints[0]["lat"], (parseFloat(window.clippingBuildingPartialInUse.bottomfloorheight)+parseFloat(window.clippingBuildingPartialInUse.floorheight))),point : {pixelSize : 8,color : Cesium.Color.GREEN,},show:true});
			//viewerDemoResiApp.entities.add({position : Cesium.Cartesian3.fromDegrees(allPoints[1]["lon"], allPoints[1]["lat"], (parseFloat(window.clippingBuildingPartialInUse.bottomfloorheight)+parseFloat(window.clippingBuildingPartialInUse.floorheight))),point : {pixelSize : 8,color : Cesium.Color.GREEN,},show:true});
			//viewerDemoResiApp.entities.add({position : Cesium.Cartesian3.fromDegrees(partialCentroid[0], partialCentroid[1], (parseFloat(window.clippingBuildingPartialInUse.bottomfloorheight)+parseFloat(window.clippingBuildingPartialInUse.floorheight))),point : {pixelSize : 8,color : Cesium.Color.YELLOW.withAlpha(0.5),},show:true});
			
			var newSamplesProperty = new Cesium.SampledPositionProperty();
			var sampledAt = 0;
			$.each(allPoints, function (index, row){
				var time = Cesium.JulianDate.addSeconds( start, sampledAt, new Cesium.JulianDate() );
				var position = Cesium.Cartesian3.fromDegrees( row.lon, row.lat, ht );
				newSamplesProperty.addSample(time, position);
				sampledAt = sampledAt + 10;
			});
		}
		executePanoView(buildingCentroid, null, null, ht, newSamplesProperty);
		
	}
	/**
	*	23/09
	*	Function to have Pano View, Pass on patameters
	**/
	window.spEntity = null;
	window.eyeEntity = null;
	function executePanoView(eyePt, pt1, pt2, ht, sampledProperty = null)
	{
		console.log("In Execute Pano View");
		console.log(eyePt, pt1, pt2, ht, sampledProperty);
		if(sampledProperty == null)
		{
			var property = new Cesium.SampledPositionProperty();
			var time = Cesium.JulianDate.addSeconds( start, 0, new Cesium.JulianDate() );
			var position = Cesium.Cartesian3.fromDegrees( pt1[0], pt1[1], ht );
			property.addSample(time, position);

			//Also create a point for each sample we generate.
			//viewerDemoResiApp.entities.add({ position: position, point: { pixelSize: 8, color: Cesium.Color.TRANSPARENT, outlineColor: Cesium.Color.YELLOW, outlineWidth: 3, }, });

			time = Cesium.JulianDate.addSeconds( start, 180, new Cesium.JulianDate() );
			position = Cesium.Cartesian3.fromDegrees( pt2[0], pt2[1], ht );
			property.addSample(time, position);
		}
		else
		{
			var property = sampledProperty;//Sampled property is point collection
		}

		//Also create a point for each sample we generate.
		//viewerDemoResiApp.entities.add({ position: position, point: { pixelSize: 8, color: Cesium.Color.TRANSPARENT, outlineColor: Cesium.Color.YELLOW, outlineWidth: 3, }, });
		//Actually create the entity
		viewerDemoResiApp.entities.removeById("spinPanoEntity");
		window.spEntity = viewerDemoResiApp.entities.add({
		  id : 'spinPanoEntity',
		  //Set the entity availability to the same interval as the simulation time.
		  availability: new Cesium.TimeIntervalCollection([
			new Cesium.TimeInterval({
			  start: start,
			  stop: stop,
			}),
		  ]),
		  
		  show : false,//SK: NOT SHOWING THE PATH

		  //Use our computed positions
		  position: property,

		  //Automatically compute orientation based on position movement.
		  orientation: new Cesium.VelocityOrientationProperty(position),

		  //Load the Cesium plane model to represent the entity
		  /* model: {
			uri: "./Cesium_Air.glb",
			minimumPixelSize: 64,
		  }, */

		  //Show the path as a pink line sampled in 1 second increments.
		  path: {
			resolution: 1,
			material: new Cesium.PolylineGlowMaterialProperty({
			  glowPower: 0.1,
			  color: Cesium.Color.YELLOW,
			}),
			width: 10,
		  },
		});
		
		viewerDemoResiApp.entities.removeById("cylPanoPoint");
		window.eyeEntity = viewerDemoResiApp.entities.add({
			id : 'cylPanoPoint',
			position: Cesium.Cartesian3.fromDegrees(eyePt[0], eyePt[1], ht),
			cylinder : {
				length : 10.0,
				topRadius : 10.0,
				bottomRadius : 10.0,
				material : Cesium.Color.GREEN.withAlpha(0.5),
				outline : false,
				outlineColor : Cesium.Color.DARK_GREEN
			},
			show: false
		});
		
		console.log("eyeEntity");
		console.log(eyeEntity);
		
		window.panoViewEnabled = true;
	}
	
//Tab structure from 4.2 to Resi Rental App
getResiRentalStatisticsForScott();
function getResiRentalStatisticsForScott()
{
	$.ajax({
	  method: "POST",
	  url: window.apiBaseUrl+"controllers/residentialRentalController.php",
	  data: { sourceApp : window.app_name, param : "getResiRentalStatisticsForScott" }
	  })
	.done(function( data ) {
		data = $.parseJSON( data );

		if(data.status == "success")
		{
			loadPlutoResiRentalStatisticsForScottDataFromZip(data.fileName);
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

function loadPlutoResiRentalStatisticsForScottDataFromZip(zipFile) {
	JSZipUtils.getBinaryContent(zipFile, function(err, data) {
		var elt = document.getElementById('jszip_utils');
		if(err) { showError(elt, err); return; }
		try {
		  JSZip.loadAsync(data)
		  .then(function(zip) {
			  var jsonFileName = zipFile.replace("pptCache/", "").replace(".zip", ".json");
			return zip.file(jsonFileName).async("string");
		  })
		  .then(function success(text) {
        loadPlutoResiRentalStatisticsForScottDataFromJSON(text);
		  }, function error(e) {
			showError(elt, e);
		  });
		} catch(e) {
		  showError(elt, e);
		}
	});
	function showError(ele, e) {
	}
}

function loadPlutoResiRentalStatisticsForScottDataFromJSON(jsonData)
{
	console.log("IN loadPlutoResiRentalStatsFromJSON()");
	jsonData = $.parseJSON(jsonData);//stopSpinningImage();
	console.log(jsonData);
	window.resiRentalMarketData = jsonData.marketData;
	window.resiRentalInventoryData = jsonData.inventoryData;
	window.resiRentalPricingData = jsonData.pricingData;
	window.resiRentalDevelopmentData = jsonData.developmentData;
	prepareInfoboxSummaryForRentalHighlightBedsFilteringTabs();
}

function prepareInfoboxSummaryForRentalHighlightBedsFilteringTabs()
{
	console.log("In prepareInfoboxSummaryForRentalHighlightBedsFilteringTabs();");
	submarketOrder = [3,4,7,6,5];
	marketData = "<table class='table table-bordered ' style='margin-bottom:-7px !important;'><thead>";
	const bgColorCondo = getBgColorWithAlpha("residential");
	const bgColorRental = getBgColorWithAlpha("rental");
	marketData += "<tr><th width='20%'>Submarket</th><th colspan='2'>"+window.pptLabels.number_of_buildings+"</th><th width='13%'>"+window.pptLabels.number_of_units+"</th><th width='13%'>Average "+window.pptLabels.square_feet+"</th><th width='13%'>Average Rent PSF</th><th width='13%'>Available Units</th><th width='13%'>Availability</th></tr>";
	marketData += "<tr><th width='20%'></th><th style='background-color:"+bgColorCondo+";'>Condo</th><th style='background-color:"+bgColorRental+";'>Rental</th><th width='13%'></th><th width='13%'></th><th width='13%'></th><th width='13%'></th><th width='13%'></th></tr>";
	marketData += "</thead><tbody>";
	
	totalForMarket = [];
	totalForMarket["condoBuildings"] = 0;
	totalForMarket["rentalBuildings"] = 0;
	totalForMarket["buildings"] = 0;
	totalForMarket["plutoUnits"] = 0;
	totalForMarket["availableUnits"] = 0;
	totalForMarket["availability"] = 0;
	totalForMarket["sqft"] = 0;
	totalForMarket["rentPerSqFt"] = 0;
	
	$.each(submarketOrder, function (index, idtsub){
		flyfunc = "flyToIdtcamera("+submarketDetails[idtsub].idtcamera+")";

		marketData += "<tr><td><a href='javascript:void(0);' onclick='"+flyfunc+"'>"+submarketDetails[idtsub].ssubname+"</a></td><td style='background-color:"+bgColorCondo+";'>"+numberWithComma(window.resiRentalMarketData[idtsub].condoBuildings)+"</td><td style='background-color:"+bgColorRental+";'>"+numberWithComma(window.resiRentalMarketData[idtsub].rentalBuildings)+"</td><td>"+numberWithComma(window.resiRentalMarketData[idtsub].resUnits)+"</td><td>"+numberWithComma(window.resiRentalMarketData[idtsub].averageSQFT)+" </td><td>$"+(window.resiRentalMarketData[idtsub].totalRent / window.resiRentalMarketData[idtsub].availableSQFT).toFixed(2)+"</td><td>"+numberWithComma(window.resiRentalMarketData[idtsub].availableUnits)+"</td><td>"+(window.resiRentalMarketData[idtsub].availableUnits/window.resiRentalMarketData[idtsub].resUnits*100).toFixed(2)+"%</td></tr>";
		
		totalForMarket["condoBuildings"] += parseInt(window.resiRentalMarketData[idtsub].condoBuildings);
		totalForMarket["rentalBuildings"] += parseInt(window.resiRentalMarketData[idtsub].rentalBuildings);
		totalForMarket["buildings"] += parseInt(window.resiRentalMarketData[idtsub].totalBuildings);
		totalForMarket["plutoUnits"] += parseInt(window.resiRentalMarketData[idtsub].resUnits);
		totalForMarket["availableUnits"] += parseInt(window.resiRentalMarketData[idtsub].availableUnits);
		totalForMarket["availability"] += parseFloat(window.resiRentalMarketData[idtsub].availableUnits/window.resiRentalMarketData[idtsub].resUnits*100);
		totalForMarket["sqft"] += parseInt(window.resiRentalMarketData[idtsub].averageSQFT);
		totalForMarket["rentPerSqFt"] += + parseFloat(window.resiRentalMarketData[idtsub].totalRent / window.resiRentalMarketData[idtsub].availableSQFT).toFixed(2);
		console.log(totalForMarket["rentPerSqFt"]);
		
	});
	console.log(totalForMarket);
	marketData += "<tr><td><b>Total</b></td>";
		marketData += "<td style='background-color:"+bgColorCondo+";'>"+numberWithComma(totalForMarket["condoBuildings"])+"</td>";
		marketData += "<td style='background-color:"+bgColorRental+";'>"+numberWithComma(totalForMarket["rentalBuildings"])+"</td>";
		marketData += "<td>"+numberWithComma(totalForMarket["plutoUnits"])+"</td>";
		marketData += "<td>"+numberWithComma(Math.round(totalForMarket["sqft"] / submarketOrder.length))+"</td>";
		marketData += "<td>$"+numberWithComma((totalForMarket["rentPerSqFt"] / submarketOrder.length).toFixed(2))+"</td>";
		marketData += "<td>"+numberWithComma(totalForMarket["availableUnits"])+"</td>";
		marketData += "<td>"+numberWithComma((totalForMarket["availableUnits"]/totalForMarket["plutoUnits"]*100).toFixed(2))+"%</td>";
	marketData += "</tr>";
	marketData += "</tbody></table>";
	
	
	
	inventoryData = "<table class='table table-striped' style='margin-bottom:-7px !important;'><thead>";
	
	inventoryData += "<tr><th width='35%'>Submarket</th><th width='13%'>Studio</th><th width='13%'>1BR</th><th width='13%'>2BR</th><th width='13%'>3BR</th><th width='13%'>3BR+</th></tr>";
	inventoryData += "</thead><tbody>";
	inventoryTotal = [];
	inventoryTotal[0] = 0;
	inventoryTotal[1] = 0;
	inventoryTotal[2] = 0;
	inventoryTotal[3] = 0;
	inventoryTotal[4] = 0;
	
	$.each(submarketOrder, function (index, idtsub){
		studio = br1 = br2= br3=br4 = "";
		br4 = 0;
		if(typeof window.resiRentalInventoryData[idtsub][0] != "undefined")
			studio = window.resiRentalInventoryData[idtsub][0];
		if(typeof window.resiRentalInventoryData[idtsub][1] != "undefined")
			br1 = window.resiRentalInventoryData[idtsub][1];
		if(typeof window.resiRentalInventoryData[idtsub][2] != "undefined")
			br2 = window.resiRentalInventoryData[idtsub][2];
		if(typeof window.resiRentalInventoryData[idtsub][3] != "undefined")
			br3 = window.resiRentalInventoryData[idtsub][3];
		
		if(typeof window.resiRentalInventoryData[idtsub][4] != "undefined")
			br4 = br4 + parseInt(window.resiRentalInventoryData[idtsub][4]);
		if(typeof window.resiRentalInventoryData[idtsub][5] != "undefined")
			br4 = br4 + parseInt(window.resiRentalInventoryData[idtsub][5]);
		if(typeof window.resiRentalInventoryData[idtsub][6] != "undefined")
			br4 = br4 + parseInt(window.resiRentalInventoryData[idtsub][6]);
		if(typeof window.resiRentalInventoryData[idtsub][7] != "undefined")
			br4 = br4 + parseInt(window.resiRentalInventoryData[idtsub][7]);
		if(br4 > 0)
			br4 = br4;
		else
			br4 = 0;
		
		flyfunc = "flyToIdtcamera("+submarketDetails[idtsub].idtcamera+")";
		
		inventoryTotal[0] += parseInt(studio);
		inventoryTotal[1] += parseInt(br1);
		inventoryTotal[2] += parseInt(br2);
		inventoryTotal[3] += parseInt(br3);
		inventoryTotal[4] += parseInt(br4);
		inventoryData += "<tr><td><a href='javascript:void(0);' onclick='"+flyfunc+"'>"+window.submarketDetails[idtsub].ssubname+"</a></td><td>"+numberWithComma(studio)+"</td><td>"+numberWithComma(br1)+"</td><td>"+numberWithComma(br2)+"</td><td>"+numberWithComma(br3)+"</td><td>"+numberWithComma(br4)+"</td></tr>";
	});
	
	inventoryData += "<tr><td><b>Total</b></td><td>"+numberWithComma(inventoryTotal[0])+"</td><td>"+numberWithComma(inventoryTotal[1])+"</td><td>"+numberWithComma(inventoryTotal[2])+"</td><td>"+numberWithComma(inventoryTotal[3])+"</td><td>"+numberWithComma(inventoryTotal[4])+"</td></tr>";
	inventoryData += "</tbody></table>";
	
	
	pricingData = "<table class='table table-striped' style='margin-bottom:-7px !important;'><thead>";
		pricingData += "<tbody>";
		pricingData += "<tr><th width='20%'>Submarket</th><th>Studio</th><th>1BR</th><th>2BR</th><th>3BR</th><th>3BR+</th></tr>";
	averagePricing = {0:0, 1:0, 2:0, 3:0, 4:0 };
	averagePricingCounter = {0:0, 1:0, 2:0, 3:0, 4:0 };
	$.each(submarketOrder, function (index, idtsub){
		flyfunc = "flyToIdtcamera("+window.submarketDetails[idtsub].idtcamera+")";
		pricingData += "<tr><td><a href='javascript:void(0);' onclick='"+flyfunc+"'>"+window.submarketDetails[idtsub].ssubname+"</a></td>";
		pricingData += "<td>$"+numberWithComma(window.resiRentalPricingData[idtsub][0])+"</td>";
		pricingData += "<td>$"+numberWithComma(window.resiRentalPricingData[idtsub][1])+"</td>";
		pricingData += "<td>$"+numberWithComma(window.resiRentalPricingData[idtsub][2])+"</td>";
		pricingData += "<td>$"+numberWithComma(window.resiRentalPricingData[idtsub][3])+"</td>";
		if(window.resiRentalPricingData[idtsub][4] > 0)
			pricingData += "<td>$"+numberWithComma(window.resiRentalPricingData[idtsub][4])+"</td>";
		else
			pricingData += "<td></td>";
		pricingData += "</tr>";
		if(window.resiRentalPricingData[idtsub][0] > 0)
		{
			averagePricing[0] += window.resiRentalPricingData[idtsub][0];
			averagePricingCounter[0]++;
		}
		if(window.resiRentalPricingData[idtsub][1] > 0)
		{
			averagePricing[1] += window.resiRentalPricingData[idtsub][1];
			averagePricingCounter[1]++;
		}
		if(window.resiRentalPricingData[idtsub][2] > 0)
		{
			averagePricing[2] += window.resiRentalPricingData[idtsub][2];
			averagePricingCounter[2]++;
		}
		if(window.resiRentalPricingData[idtsub][3] > 0)
		{
			averagePricing[3] += window.resiRentalPricingData[idtsub][3];
			averagePricingCounter[3]++;
		}
		if(window.resiRentalPricingData[idtsub][4] > 0)
		{
			averagePricing[4] += window.resiRentalPricingData[idtsub][4];
			averagePricingCounter[4]++;
		}
	});
	
	pricingData += "<tr>";
		pricingData += "<th>Average</th>";
		pricingData += "<td>$"+numberWithComma(parseInt(averagePricing[0]/averagePricingCounter[0]))+"</td>";
		pricingData += "<td>$"+numberWithComma(parseInt(averagePricing[1]/averagePricingCounter[1]))+"</td>";
		pricingData += "<td>$"+numberWithComma(parseInt(averagePricing[2]/averagePricingCounter[2]))+"</td>";
		pricingData += "<td>$"+numberWithComma(parseInt(averagePricing[3]/averagePricingCounter[3]))+"</td>";
		pricingData += "<td>$"+numberWithComma(parseInt(averagePricing[4]/averagePricingCounter[4]))+"</td>";
	pricingData += "</tr>";
	
	/*
	Old Data...
	pricingData += "</tr>";
	pricingData += "</thead><tbody>";
	
	//Studio
	pricingData += "<tr><td>Studio</td>";
	$.each(submarketOrder, function (index, idtsub){
		if(typeof window.resiRentalPricingData[idtsub][0] != "undefined")
			pricingData += "<td>$"+numberWithComma(window.resiRentalPricingData[idtsub][0])+"</td>";
		else
			pricingData += "<td></td>";
	});
	pricingData += "</tr>";
	
	//1BR
	pricingData += "<tr><td>1BR</td>";
	$.each(submarketOrder, function (index, idtsub){
		if(typeof window.resiRentalPricingData[idtsub][1] != "undefined")
			pricingData += "<td>$"+numberWithComma(window.resiRentalPricingData[idtsub][1])+"</td>";
		else
			pricingData += "<td></td>";
	});
	pricingData += "</tr>";
	
	//2BR
	pricingData += "<tr><td>2BR</td>";
	$.each(submarketOrder, function (index, idtsub){
		if(typeof window.resiRentalPricingData[idtsub][2] != "undefined")
			pricingData += "<td>$"+numberWithComma(window.resiRentalPricingData[idtsub][2])+"</td>";
		else
			pricingData += "<td></td>";
	});
	pricingData += "</tr>";
	
	//3BR
	pricingData += "<tr><td>3BR</td>";
	$.each(submarketOrder, function (index, idtsub){
		if(typeof window.resiRentalPricingData[idtsub][3] != "undefined")
			pricingData += "<td>$"+numberWithComma(window.resiRentalPricingData[idtsub][3])+"</td>";
		else
			pricingData += "<td></td>";
	});
	pricingData += "</tr>";
	
	//3BR+
	pricingData += "<tr><td>3BR+</td>";
	$.each(submarketOrder, function (index, idtsub){
		if(typeof window.resiRentalPricingData[idtsub][4] != "undefined")
			pricingData += "<td>$"+numberWithComma(window.resiRentalPricingData[idtsub][4])+"</td>";
		else
			pricingData += "<td></td>";
	});
	pricingData += "</tr>";
	
	
	
	pricingData += "<tr><td><b>Total</b></td>";
	$.each(submarketOrder, function (index, idtsub){
		avg = 0;
		$.each(window.resiRentalPricingData[idtsub], function (i, r){
			avg += parseInt(r);
		});
		
		pricingData += "<td>$"+numberWithComma(Math.round(avg/window.resiRentalPricingData[idtsub].length))+"</td>";
	});
	pricingData += "</tr>";
	*/
	pricingData += "</tbody></table>";
	
	
	developmentData = "<table class='table table-striped' style='margin-bottom:-7px !important;'><thead>";
	
	//# condo buildings, # units, # rental buildings, # units, # new properties, # new units, % addition to supply
	developmentData += "<tr><th width='18%'>Submarket</th><th width='11.71%'># Condo Buildings</th><th width='11.71%'>"+window.pptLabels.number_of_units+"</th><th width='11.71%'>#&nbsp;Rental Buildings</th><th width='11.71%'>"+window.pptLabels.number_of_units+"</th><th width='11.71%'># New Properties</th><th width='11.71%'>#&nbsp;New Units</th><th width='11.71%'>%&nbsp;Addition to Supply</th></tr>";
	developmentData += "</thead><tbody>";
	developmentTotal = [];
	developmentTotal["condoBldg"] = 0;
	developmentTotal["condoUnits"] = 0;
	developmentTotal["rentalBldg"] = 0;
	developmentTotal["rentalUnits"] = 0;
	developmentTotal["newProperties"] = 0;
	developmentTotal["newUnits"] = 0;
	avgAdditionToSupply = 0;
	resiOwnershipColor = window.appColorSetting["PPT"]["new_developments"][0].color;//getPlutoClassColorPlain("PPT", "proposed_occupancy_type", "Resi Ownership");
	$.each(submarketOrder, function (index, idtsub){
		
		flyfunc = "flyToIdtcamera("+submarketDetails[idtsub].idtcamera+")";
		developmentData += "<tr><td><a href='javascript:void(0);' onclick='"+flyfunc+"'>"+window.submarketDetails[idtsub].ssubname+"</a></td>";
			
			//Old Development Data
			/*
			developmentData += "<td>"+numberWithComma(window.resiRentalDevelopmentData[idtsub].availableCondoBuildings)+"</td>";
			developmentData += "<td>"+numberWithComma(window.resiRentalDevelopmentData[idtsub].availableCondoUnits)+"</td>";
			developmentData += "<td>"+numberWithComma(window.resiRentalDevelopmentData[idtsub].availableRentalBuildings)+"</td>";
			developmentData += "<td>"+numberWithComma(window.resiRentalDevelopmentData[idtsub].availableRentalUnits)+"</td>";
			
			additionToSupply = (  (parseInt(window.resiRentalDevelopmentData[idtsub].availableCondoUnits) + parseInt(window.resiRentalDevelopmentData[idtsub].availableRentalUnits))  /  (parseInt(window.resiRentalDevelopmentData[idtsub].totalPlutoCondoUnits) + parseInt(window.resiRentalDevelopmentData[idtsub].totalPlutoRentalUnits))  )*100;
			additionToSupply = additionToSupply.toFixed(2);
			avgAdditionToSupply += parseFloat(additionToSupply);
			
			*/
			//New counts as per Market Data
			developmentData += "<td>"+numberWithComma(window.resiRentalMarketData[idtsub].condoBuildings)+"</td>";
			developmentData += "<td>"+numberWithComma(window.resiRentalMarketData[idtsub].condoUnits)+"</td>";
			developmentData += "<td>"+numberWithComma(window.resiRentalMarketData[idtsub].rentalBuildings)+"</td>";
			developmentData += "<td>"+numberWithComma(window.resiRentalMarketData[idtsub].rentalUnits)+"</td>";
			
			additionToSupply = (  (parseInt(window.nycConstructionSummary[idtsub]["Resi Ownership"].dwelling_units))  /  (parseInt(window.resiRentalMarketData[idtsub].condoUnits) + parseInt(window.resiRentalMarketData[idtsub].rentalUnits))  )*100;
			additionToSupply = additionToSupply.toFixed(2);
			avgAdditionToSupply += parseFloat(additionToSupply);
			
			developmentData += "<td style='background-color:"+resiOwnershipColor+"'>"+numberWithComma(window.nycConstructionSummary[idtsub]["Resi Ownership"].cnt)+"</td>";
			developmentData += "<td style='background-color:"+resiOwnershipColor+"'>"+numberWithComma(window.nycConstructionSummary[idtsub]["Resi Ownership"].dwelling_units)+"</td>";
			developmentData += "<td>"+additionToSupply+"%</td>";
		developmentData += "</tr>";
		
		developmentTotal["newProperties"] += parseInt(window.nycConstructionSummary[idtsub]["Resi Ownership"].cnt);
		developmentTotal["newUnits"] += parseInt(window.nycConstructionSummary[idtsub]["Resi Ownership"].dwelling_units);
		
		//Old Development Data
		/**
		developmentTotal["condoBldg"] += parseInt(window.resiRentalDevelopmentData[idtsub].availableCondoBuildings);
		developmentTotal["condoUnits"] += parseInt(window.resiRentalDevelopmentData[idtsub].availableCondoUnits);
		developmentTotal["rentalBldg"] += parseInt(window.resiRentalDevelopmentData[idtsub].availableRentalBuildings);
		developmentTotal["rentalUnits"] += parseInt(window.resiRentalDevelopmentData[idtsub].availableRentalUnits);
		*/
		
		developmentTotal["condoBldg"] += parseInt(window.resiRentalMarketData[idtsub].condoBuildings);
		developmentTotal["condoUnits"] += parseInt(window.resiRentalMarketData[idtsub].condoUnits);
		developmentTotal["rentalBldg"] += parseInt(window.resiRentalMarketData[idtsub].rentalBuildings);
		developmentTotal["rentalUnits"] += parseInt(window.resiRentalMarketData[idtsub].rentalUnits);
	});
	
	developmentData += "<tr><td><b>Total</b></td><td>"+numberWithComma(developmentTotal["condoBldg"])+"</td><td>"+numberWithComma(developmentTotal["condoUnits"])+"</td><td>"+numberWithComma(developmentTotal["rentalBldg"])+"</td><td>"+numberWithComma(developmentTotal["rentalUnits"])+"</td><td style='background-color:"+resiOwnershipColor+"'>"+numberWithComma(developmentTotal["newProperties"])+"</td><td style='background-color:"+resiOwnershipColor+"'>"+numberWithComma(developmentTotal["newUnits"])+"</td><td>"+(parseInt(developmentTotal["newUnits"]) / (parseInt(developmentTotal["condoUnits"]) + parseInt(developmentTotal["rentalUnits"])) * 100).toFixed(2)+"%</td></tr>";
	developmentData += "</tbody></table>";
	
	
	$("#market").html(marketData);
	$("#inventory").html(inventoryData);
	$("#pricing").html(pricingData);
	$("#development").html(developmentData);
	
}

function preparePropSeeTabInformation(idtbldg, number, unit)
{
	//alert(" IN preparePropSeeTabInformation("+idtbldg+", "+number+", "+unit+") ");
	populateBuildingAmenitiesData(idtbldg);
	populateBuildingPhysicalData(idtbldg);
	populateFinancialData(idtbldg);
	//populateNYCTenantsData(idtbldg);
	populateOwnershipData(idtbldg);
	populateDebtDataV2(idtbldg);
	populatePropseeContactData(idtbldg, number, unit);
	prepareStackPlanForBuilding(idtbldg);
	//getCondoPlanOrFloorPlan(idtbldg);
}
/*
function populateCondoPlanOrFloorPlan(idtbldg)
{
	if( typeof condoBldgFloorPlanData.condoPlans[idtbldg] != 'undefined' && condoBldgFloorPlanData.condoPlans[idtbldg].length > 0){
		$(".plutoCondoPlans").html("Yes");
	} else {
		$(".plutoCondoPlans").html("No");
	}

	if( typeof condoBldgFloorPlanData.floorPlans[idtbldg] != 'undefined' && condoBldgFloorPlanData.floorPlans[idtbldg].length > 0){
		$(".plutoInfoFloorPlans").html("Yes");
	}else {
		$(".plutoInfoFloorPlans").html("No");
	}
}
function getCondoPlanOrFloorPlan(idtbldg = "")
{
	if(typeof condoBldgFloorPlanData == "undefined")
	{
		$.ajax({
		  method: "POST",
		  url: window.apiBaseUrl+"controllers/dobcomplaintsController.php",
		  data: { sourceApp : window.app_name, param : "getAllCountsInfo", "needJSON": "yes" }
		})
		.done(function( data ) {
			data = $.parseJSON( data );

			if(data.status == "success")
			{
				condoBldgFloorPlanData = data.allCounts;
				//console.log(data.floorPlans);
				if( typeof condoBldgFloorPlanData.condoPlans[idtbldg] != 'undefined' && condoBldgFloorPlanData.condoPlans[idtbldg].length > 0){
					$(".plutoCondoPlans").html("Yes");
				} else {
					$(".plutoCondoPlans").html("No");
				}

				if( typeof condoBldgFloorPlanData.floorPlans[idtbldg] != 'undefined' && condoBldgFloorPlanData.floorPlans[idtbldg].length > 0){
					$(".plutoInfoFloorPlans").html("Yes");
				}else {
					$(".plutoInfoFloorPlans").html("No");
				}
			}
			else
			{
				alert("Something went wrong");
			}
		});
	}
	else
	{
		populateCondoPlanOrFloorPlan(idtbldg);
	}
}
*/

function populateBuildingAmenitiesData(idtbldg)
{
	$("#amenities").html("<br />");
	if(idtbldg != "")
	{
		$.ajax({
		  method: "POST",
		  url: window.apiBaseUrl+"controllers/buildingAmenitiesController.php",
		  data: { sourceApp : window.app_name, param : "getBuildingAmenities" , idtbuilding : idtbldg }
		})
		.done(function( data ) {
			data = $.parseJSON( data );
			//console.log(data);
			var str = "";
			if(data.status == "success")
			{
				str = "<table class='table table-striped minPaddingtable'>";
				tmp = [];
				$.each(data.buildingData, function (index, row){
					tmp.push(row.name);
				});
				tmp.sort();
				
				$.each(tmp, function (index, row){
					str += "<tr><td>"+row+"</td></tr>";
				});
				str += "</table>";
			}
			$("#amenities").html(str);
			$("#PROPSEE_AMENITIES").html(str);
		});
	}
}

function populateBuildingPhysicalData(idtbldg)
{
	$("#physical").html("<br />");
	if(idtbldg != "")
	{
		$.ajax({
		  method: "POST",
		  url: window.apiBaseUrl+"controllers/buildingPhysicalController.php",
		  data: { sourceApp : window.app_name, param : "getBuildingPhysical" , idtbuilding : idtbldg }
		})
		.done(function( data ) {
			data = $.parseJSON( data );
			//console.log(data);
			var str = "";
			if(data.status == "success")
			{
				str = "<table class='table table-striped minPaddingtable'>";
				plot = "";
				plotArea = "";
				frontage = "";
				avgFloorSize = "";
				slab = "";
				ceiling = "";
				fourColumnDataPrint = [];
				
				fourColumnDataPrint.push({0:"Year Built", 1: window.buildingData[idtbldg].yearbuilt});
				fourColumnDataPrint.push({0:"Floors", 1: window.buildingData[idtbldg].floors});
				/* 
				officeArea = "";
				if(typeof window.buildingInventoryData[window.buildingData[idtbldg].idtsubmarket] != "undefined" && typeof window.buildingInventoryData[window.buildingData[idtbldg].idtsubmarket][idtbldg] != "undefined")
					officeArea = window.buildingInventoryData[window.buildingData[idtbldg].idtsubmarket][idtbldg].rba_final+" "+window.pptLabels.square_feet;
				
				fourColumnDataPrint.push({0:"Office Area", 1: officeArea});
				retailArea = "";
				console.log(data.buildingData);
				console.log(data.buildingData.retailarea);
				if(typeof data.buildingData != "undefined" && typeof data.buildingData.retailarea != "undefined" && parseInt(data.buildingData.retailarea) > 0)
					retailArea = numberWithComma(parseInt(data.buildingData.retailarea))+" "+window.pptLabels.square_feet;
				fourColumnDataPrint.push({0:"Retail Area", 1: retailArea}); */
				
				
				officeArea = "";
				if(typeof window.buildingData[idtbldg].officearea != "undefined")
					officeArea = numberWithComma(parseInt(window.buildingData[idtbldg].officearea))+" "+window.pptLabels.square_feet;
				
				fourColumnDataPrint.push({0:"Office Area", 1: officeArea});
				retailArea = "";
				if(typeof window.buildingData[idtbldg].retailarea != "undefined")
					retailArea = numberWithComma(parseInt(window.buildingData[idtbldg].retailarea))+" "+window.pptLabels.square_feet;
				fourColumnDataPrint.push({0:"Retail Area", 1: retailArea});
				
				//<th>masonry</th><th>punchoutwindows</th><th>operablewindows</th><th>numberelevators</th><th>leaseholdorfeesimple</th><th>highdensityuse</th><th>lifesafety</th><th>telecom</th><th>data</th><th>backuppower</th><th>hvac</th><th>outhoorterraces</th><th>healthclub</th><th>onsitecafe</th><th>gameroom</th><th>parking</th><th>lightair</th><th>vieworientation</th><th>zoning</th><th>floodplain</th><th>proxsubway</th><th>security</th><th>units</th><th>usage1</th>
				cntr = 0;
				row = data.data[0];
				if(typeof row != "undefined")
				{
					/* 	
						plot += "<td>"+row.plotsizel+" x "+row.plotsizew+"</td>";
						plotArea += "<td>"+numberWithComma(row.plotarea)+"</td>";
						frontage += "<td>"+row.frontage+"</td>";
						avgFloorSize += "<td>"+numberWithComma(row.averagefloorsize)+"</td>";
						slab += "<td>"+row.slabheightmin+" - "+row.slabheightmax+"</td>";
						ceiling += "<td>"+row.ceilingheightmin+" - "+row.ceilingheightmax+"</td>";
						
						//str += "<tr><td>"+cntr+"</td><td>"+row.plotsizel+" x "+row.plotsizew+"</td><td>"+numberWithComma(row.plotarea)+"</td><td>"+row.frontage+"</td><td>"+numberWithComma(row.averagefloorsize)+"</td><td>"+row.slabheightmin+" - "+row.slabheightmax+"</td><td>"+row.ceilingheightmin+" - "+row.ceilingheightmax+"</td></tr>";
						//<td>"+row.masonry+"</td><td>"+row.punchoutwindows+"</td><td>"+row.operablewindows+"</td><td>"+row.numberelevators+"</td><td>"+row.leaseholdorfeesimple+"</td><td>"+row.highdensityuse+"</td><td>"+row.lifesafety+"</td><td>"+row.telecom+"</td><td>"+row.data+"</td><td>"+row.backuppower+"</td><td>"+row.hvac+"</td><td>"+row.outdoorterraces+"</td><td>"+row.healthclub+"</td><td>"+row.onsitecafe+"</td><td>"+row.gameroom+"</td><td>"+row.parking+"</td><td>"+row.lightair+"</td><td>"+row.vieworientation+"</td><td>"+row.zoning+"</td><td>"+row.floodplain+"</td><td>"+row.proxsubway+"</td><td>"+row.security+"</td><td>"+row.units+"</td><td>"+row.usage1+"</td>
					}); */
					//str += "<tr><th>&nbsp;</th><td>&nbsp;</td></tr>";
					
					/* if(row.averagefloorsize != "")
						str += "<tr><th>Avg Floor Size</th><td>"+numberWithComma(row.averagefloorsize)+" "+window.pptLabels.square_feet+"</td></tr>"; */
					if(row.floorsizemin != ""){
						fourColumnDataPrint.push({0:"Floor Size Min", 1: numberWithComma(row.floorsizemin)+" "+window.pptLabels.square_feet});
						//str += "<tr><th>Floor Size Min</th><td>"+numberWithComma(row.floorsizemin)+" "+window.pptLabels.square_feet+"</td></tr>";
					}
					if(row.floorsizemax != ""){
						fourColumnDataPrint.push({0:"Floor Size Max", 1: numberWithComma(row.floorsizemax)+" "+window.pptLabels.square_feet});
						//str += "<tr><th>Floor Size Max</th><td>"+numberWithComma(row.floorsizemax)+" "+window.pptLabels.square_feet+"</td></tr>";
					}
					if(row.backuppower != ""){
						fourColumnDataPrint.push({0:"Backup Power", 1: row.backuppower});
						//str += "<tr><th>Backup Power</th><td>"+row.backuppower+"</td></tr>";
					}
					
					
					
					if(row.ceilingheightmin != "")
						fourColumnDataPrint.push({0:"Ceiling Min Height", 1: row.ceilingheightmin+" "+window.pptLabels.feet});
					if(row.ceilingheightmax != "")
						fourColumnDataPrint.push({0:"Ceiling Max Height", 1: row.ceilingheightmax+" "+window.pptLabels.feet});
					if(row.columnspacinge != "")
						fourColumnDataPrint.push({0:"Column Spacing East", 1: row.columnspacinge+" "+window.pptLabels.feet});
					if(row.columnspacingw != "")
						fourColumnDataPrint.push({0:"Column Spacing West", 1: row.columnspacingw+" "+window.pptLabels.feet});
					if(row.columnspacingn != "")
						fourColumnDataPrint.push({0:"Column Spacing North", 1: row.columnspacingn+" "+window.pptLabels.feet});
					if(row.columnspacings != "")
						fourColumnDataPrint.push({0:"Column Spacing South", 1: row.columnspacings+" "+window.pptLabels.feet});
					
					if(row.curtainwalltype != "")
						fourColumnDataPrint.push({0:"Curtain Wall Type", 1: row.curtainwalltype});
					
					if(row.floortoceilingglass != "")
						fourColumnDataPrint.push({0:"Floor to Ceiling Glass", 1: row.floortoceilingglass});
					if(row.floodplain != "")
						fourColumnDataPrint.push({0:"Floodplain", 1: row.floodplain});
					
					if(row.slabheightmin != "")
						fourColumnDataPrint.push({0:"Slab Min Height", 1: row.slabheightmin+" "+window.pptLabels.feet});
					if(row.slabheightmax != "")
						fourColumnDataPrint.push({0:"Slab Max Height", 1: row.slabheightmax+" "+window.pptLabels.feet});
					
					if(row.proxmetro != "")
						fourColumnDataPrint.push({0:"Metro Proximity", 1: row.proxmetro});
					if(row.proxsubway != "")
						fourColumnDataPrint.push({0:"Subway Proximity", 1: row.proxsubway});
					
					for(jk = 0; jk < fourColumnDataPrint.length; jk++)
					{
						str += "<tr><th>"+fourColumnDataPrint[jk][0]+"</th><td>"+fourColumnDataPrint[jk][1]+"</td>";
						if(typeof fourColumnDataPrint[jk + 1] != "undefined")
							str += "<th>"+fourColumnDataPrint[jk + 1][0]+"</th><td>"+fourColumnDataPrint[jk + 1][1]+"</td></tr>";
						else
							str += "<td></td><td></td></tr>";
						jk++;
					}
					
					if(row.frontage != "")
						str += "<tr><th>Frontage</th><td colspan='3'>"+row.frontage+"</td></tr>";
					
					if(row.gameroom != "")
						str += "<tr><th>Game Room</th><td colspan='3'>"+row.gameroom+"</td></tr>";
					if(row.healthclub != "")
						str += "<tr><th>Health Club</th><td colspan='3'>"+row.healthclub+"</td></tr>";
					if(row.highdensityuse != "")
						str += "<tr><th>High Density Use</th><td colspan='3'>"+row.highdensityuse+"</td></tr>";
					if(row.hvac != "")
						str += "<tr><th>HVAC</th><td colspan='3'>"+row.hvac+"</td></tr>";
					
					if(row.leaseholdorfeesimple != "")
						str += "<tr><th>Leasehold or Fee Simple</th><td colspan='3'>"+row.leaseholdorfeesimple+"</td></tr>";
					if(row.lifesafety != "")
						str += "<tr><th>Life Safety</th><td colspan='3'>"+row.lifesafety+"</td></tr>";
					if(row.lightair != "")
						str += "<tr><th>Light Air</th><td colspan='3'>"+row.lightair+"</td></tr>";
					if(row.lossfactor != "")
						str += "<tr><th>Loss Factor</th><td colspan='3'>"+row.lossfactor+"</td></tr>";
					if(row.masonry != "")
						str += "<tr><th>Masonry</th><td colspan='3'>"+row.masonry+"</td></tr>";
					
					if(row.numberelevators != "")
						str += "<tr><th>Number Elevators</th><td colspan='3'>"+row.numberelevators+"</td></tr>";
					if(row.data != "")
						str += "<tr><th>Number of ISPs</th><td colspan='3'>"+row.data+"</td></tr>";
					if(row.units != "")
						str += "<tr><th>Number of Units</th><td colspan='3'>"+row.units+"</td></tr>";
					if(row.onsitecafe != "")
						str += "<tr><th>On Site Cafe</th><td colspan='3'>"+row.onsitecafe+"</td></tr>";
					if(row.operablewindows != "")
						str += "<tr><th>Operable Windows</th><td colspan='3'>"+row.operablewindows+"</td></tr>";
					if(row.outdoorterraces != "")
						str += "<tr><th>Outdoor Terraces</th><td colspan='3'>"+row.outdoorterraces+"</td></tr>";
					if(row.parking != "")
						str += "<tr><th>Parking</th><td colspan='3'>"+row.parking+"</td></tr>";
					
					if(row.punchoutwindows != "")
						str += "<tr><th>Punch Out Windows</th><td colspan='3'>"+row.punchoutwindows+"</td></tr>";
					if(row.plotsizel != "")
						str += "<tr><th>Plot</th><td colspan='3'>"+row.plotsizel+" x "+row.plotsizew+"</td></tr>";
					if(row.plotarea != "")
						str += "<tr><th>Plot Area</th><td colspan='3'>"+numberWithComma(row.plotarea)+" "+window.pptLabels.square_feet+"</td></tr>";
					
					if(row.security != "")
						str += "<tr><th>Security</th><td colspan='3'>"+row.security+"</td></tr>";
					
					if(row.telecom != "")
						str += "<tr><th>Telecom</th><td colspan='3'>"+row.telecom+"</td></tr>";
					
					if(row.usage1 != "")
						str += "<tr><th>Usage</th><td colspan='3'>"+row.usage1+"</td></tr>";
					if(row.vieworientation != "")
						str += "<tr><th>View Orientation</th><td colspan='3'>"+row.vieworientation+"</td></tr>";
					if(row.zoning != "")
						str += "<tr><th>Zoning</th><td colspan='3'>"+row.zoning+"</td></tr>";
					if(row.electricalcapacity != "")
						str += "<tr><th>Electrical Capacity</th><td colspan='3'>"+row.electricalcapacity+"</td></tr>";
					if(row.yearreno1 != "")
						str += "<tr><th>Year First Reno</th><td colspan='3'>"+row.yearreno1+"</td></tr>";
					if(row.yearreno2 != "")
						str += "<tr><th>Year Second Reno</th><td colspan='3'>"+row.yearreno2+"</td></tr>";
					
					
					str += "</tbody></table>";
					/* $.each(data.buildingData, function (index, row){
						tmp.push(row.name);
					}); */
					
					
				}
			}
			$("#physical").html(str);
			$("#PROPSEE_PHYSICAL").html(str);
		});
	}
}

function populateFinancialData(idtbldg)
{
	$("#financial").html("<br />");
	if(idtbldg != "")
	{
		$.ajax({
		  method: "POST",
		  url: window.apiBaseUrl+"controllers/buildingFinancialController.php",
		  data: { sourceApp : window.app_name, param : "getBuildingFinancial" , idtbuilding : idtbldg }
		})
		.done(function( data ) {
			data = $.parseJSON( data );
			//console.log(data);
			var str = "Coming soon";
			if(data.status == "success")
			{
				var str = "<table class='table table-striped minPaddingtable'>";
				str += "<tbody>";
				cnt = 0;
				row = data.data[0];
				if(typeof row != "undefined")
				{
					cnt++;
					/* if(row.opexppsf != "")
						str += "<tr><th>Opexp PSF</th><td>"+row.opexppsf+"</td></tr>"; */
					if(row.retaxespsf != "")
						str += "<tr><th>Real Estate Tax PSF</th><td>"+row.retaxespsf+"</td></tr>";
					if(row.taxabatement != "")
						str += "<tr><th>Tax Abatement</th><td>"+row.taxabatement+"</td></tr>";
					if(row.termabatement != "")
						str += "<tr><th>Term Abatement</th><td>"+row.termabatement+"</td></tr>";
					if(row.dateofpurchase_current != "")
						str += "<tr><th>Date Of Purchase Current</th><td>"+displayMonthYear(row.dateofpurchase_current)+"</td></tr>";
					if(row.lengthofownership_current != "")
						str += "<tr><th>Length Of Ownership Current</th><td>"+calculateLengthInMonthYear(row.dateofpurchase_current)+"</td></tr>";
					if(row.purchaseprice_current != "")
						str += "<tr><th>Purchase Price Current</th><td>$"+numberWithComma(row.purchaseprice_current)+"</td></tr>";
					if(row.purchasepricepsf_current != "")
						str += "<tr><th>Purchase Price PSF Current</th><td>$"+numberWithComma(row.purchasepricepsf_current)+"</td></tr>";
					if(row.dateofpurchase_prior != "")
						str += "<tr><th>Date Of Purchase Prior </th><td>"+displayMonthYear(row.dateofpurchase_prior)+"</td></tr>";
					if(row.lengthofownership_prior != "")
						str += "<tr><th>Ownership Length Prior</th><td>"+calculateLengthInMonthYear(row.dateofpurchase_prior)+"</td></tr>";
					if(row.purchaseprice_prior != "")
						str += "<tr><th>Purchase Price Prior</th><td>$"+numberWithComma(row.purchaseprice_prior)+"</td></tr>";
					if(row.purchasepricepsf_prior != "")
						str += "<tr><th>Purchase Price PSF Prior</th><td>$"+numberWithComma(row.purchasepricepsf_prior)+"</td></tr>";
					if(row.caprate_current != "")
						str += "<tr><th>CAP Rate Current</th><td>"+row.caprate_current+"%</td></tr>";
					if(row.caprate_prior != "")
						str += "<tr><th>CAP Rate Prior</th><td>"+row.caprate_prior+"%</td></tr>";
				}
				str += "</tbody></table>";
				
				if(cnt == 0)
					str = "Coming soon";
			}
			$("#financial").html(str);
			$("#PROPSEE_FINANCIAL").html(str);
		});
	}
}

function populateNYCTenantsData(idtbldg)
{
	return "";
	$("#tenants").html("<br />");
	if(idtbldg != "")
	{
		$.ajax({
		  method: "POST",
		  url: window.apiBaseUrl+"controllers/NYCTenantsController.php",
		  data: { sourceApp : window.app_name, param : "getNYCTenants" , idtbuilding : idtbldg }
		})
		.done(function( data ) {
			data = $.parseJSON( data );
			//console.log(data);
			var str = "Coming soon";
			if(data.status == "success")
			{
				var str = '<table class="table table-striped minPaddingtable">';
				cnt = 0;
				$.each(data.data, function (index, row){
					str += '<tr><td>'+row.tenantname+' ';
					if(row.tenantarea != "")
						str += '&nbsp;&nbsp;'+numberWithComma(row.tenantarea)+' Sq Ft';
					str += '</td></tr>';
					cnt++;
				});
				str += "</table>";
				if(cnt == 0)
					str = "Coming soon";
			}
			$("#tenants").html(str);
			$("#PROPSEE_TENANTS").html(str);
		});
	}
}

function populateOwnershipData(idtbldg)
{
	$("#ownership").html("<br />");
	$("#PROPSEE_OWNERSHIP").html("<br />");
	if(idtbldg != "")
	{
		$.ajax({
		  method: "POST",
		  url: window.apiBaseUrl+"controllers/buildingController.php",
		  data: { sourceApp : window.app_name, param : "getBuildingOwnershipData" , idtbuilding : idtbldg }
		})
		.done(function( data ) {
			data = $.parseJSON( data );
			//console.log(data);
			var str = "Coming soon";
			if(data.status == "success")
			{
				if(data.data.length > 0)
					str = "<table class='table table-striped minPaddingtable'>";
				$.each(data.data, function (index, row){
					str += "<tr><td>"+ row.ownername +"</td></tr>";
				});
				str += "</table>";
			}
			$("#ownership").html(str);
			$("#PROPSEE_OWNERSHIP").html(str);
		});
	}
}

function populateDebtData(idtbldg, number)
{
	$("#debt").html("<br />");
	if(idtbldg != "")
	{
		str = "Coming soon";
		desc = "";
		//desc = prepareInfoboxForACRISParties(idtbldg, window.buildingData[idtbldg].bbl, true);
		desc2 = prepareInfoboxForACRISLegalsCondoFloorsForSearch(window.buildingData[idtbldg].bbl, window.buildingData[idtbldg].idtsubmarket, idtbldg, number, "MTGE", true);
		
		if(desc2 == "")
			$("#debt").html(str);
		else
		{
			$("#debt").html(desc2);
		}
	}
}

function populateDebtDataV2(idtbldg, number)
{
	$("#debt").html("<br />");
	$("#PROPSEE_DEBT").html("<br />");
	$.ajax({
	  method: "POST",
	  url: window.apiBaseUrl+"controllers/acrisMasterController.php",
	  data: { sourceApp : window.app_name, param : "getACRISLegalsCondoDataForBuildingFloor", idtbuilding: idtbldg, number: "", document_type: "MTGE" }
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		console.log(data);
		description = "<table class='table table-bordered minPaddingtable acrisContainer"+i+"'>";
		description += "<thead>";
		description += "<tr><th>Date</th><th>Type</th><th>Amount</th></tr>";
		description += "</thead>";
		description += "<tbody>";
			cn = 0;
			uniqueDocumentId = [];
			$.each(data.acrisDocumentData, function (i, eachDocument){
				cn++;
				if(!uniqueDocumentId.includes(eachDocument.did))
				{
					uniqueDocumentId.push(eachDocument.did);
					description += "<tr>";
						description += "<td>"+eachDocument.ddt+"</td>";
						description += "<td>Mortgage<br /><a href='https://a836-acris.nyc.gov/DS/DocumentSearch/DocumentDetail?doc_id="+eachDocument.did+"' target='_blank'><i class='fa fa-file-image-o' aria-hidden='true'>PDF</i></a></td>";
						if(eachDocument.trans > 0)
							description += "<td>$"+numberWithComma(eachDocument.trans)+"</td>";
						else
							description += "<td></td>";
					description += "</tr>";
				}
			});
		description += "</tbody>";
		description += "</table>";
		if(cn == 0)
			description = "<br />";
		$("#debt").html(description);
		$("#PROPSEE_DEBT").html(description);
	});
}

function populatePropseeContactData(idtbldg, number, suite="")
{
	$("#PROPSEE_CONTACT").html("<br />");
	$.ajax({
	  method: "POST",
	  url: window.apiBaseUrl+"controllers/residentialRentalController.php",
	  data: { sourceApp : window.app_name, param : "getResiRentalContactDetailsV2", idtbuilding: idtbldg, number: number, unit : suite}
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		console.log(data);
		description = "<table class='table table-striped minPaddingtable'>";
		//description += "<thead>";
		//description += "<tr><th>Suite</th><th>Owner Company</th><th>Owner Contact</th><th>Leasing Company</th><th>Leasing Contact</th><th>Website</th></tr>";
		//description += "</thead>";
		description += "<tbody>";
			cn = 0;
			$.each(data.data, function (i, eachRow){
				cn++;
					description += "<tr><th>Suite</th><td>"+eachRow.unit+"</td></tr>";
					description += "<tr><th>Owner Company</th><td>"+eachRow.owner_company+"</td></tr>";
					description += "<tr><th>Owner Contact</th><td>"+eachRow.owner_contact;
					if(eachRow.owner_email != "")
						description += "<br />"+eachRow.owner_email;
					description += "</td></tr>";
					
					description += "<tr><th>Leasing Company</th><td>"+eachRow.leasing_company+"</td></tr>";
					description += "<tr><th>Leasing Contact</th><td>"+eachRow.leasing_contact;
					if(eachRow.leasing_contact_email != "")
						description += "<br />"+eachRow.leasing_contact_email;
					description += "</td></tr>";
					description += "<tr><th>Website</th><td>";
					if(eachRow.website != "")
						description += "<a href='"+eachRow.website+"' target='__blank'>Website</a>";
					description += "</td></tr>";
			});
		description += "</tbody>";
		description += "</table>";
		
		$("#PROPSEE_CONTACT").html(description);
	});
}

function prepareStackPlanForBuilding(idtbldg)
{
	str = "";
	/* if(idtbldg == 1193)
	{
		str = "<a onClick=\"viewImageInModal(1, '../samplePages/floorPlan/1193-StackPlan.png', '800', '1200');\" target='_blank'><img src='../samplePages/floorPlan/1193-StackPlan.png' height='400px' /></a>";
	}
	else
	{
		str = "";
	} */
	
	$("#PROPSEE_STACKPLAN").html(str);
	$("#stackPlan").html(str);
}

function prepareNewDevelopmentInfobox(idtbuilding)
{
	console.log(idtbuilding);
	$("#submarketStats").hide();
	$("#residetails").hide();
	$("#submarketStatistics").show();
	var description = "";
	var showAddress = '';
	description = "<table class='table table-bordered'>";
	description += "<tbody>";

	description += "<tr><th>Address</th><td>"+setFlyToBuildingLink(idtbuilding, newDevelopmentData[idtbuilding][0].name)+"</td></tr>";
	description += "<tr><th>Type</th><td>"+newDevelopmentData[idtbuilding][0].building_type+"</td></tr>";

	if(newDevelopmentData[idtbuilding][0].building_type.toLowerCase() == "office")
	{
		description += "<tr><th>Office "+window.pptLabels.square_feet+"</th><td>"+numberWithComma(newDevelopmentData[idtbuilding][0].office_square_feet)+" "+window.pptLabels.square_feet+"</td></tr>";
	}
	else if(newDevelopmentData[idtbuilding][0].building_type.toLowerCase() == "retail")
	{
		description += "<tr><th>Retail "+window.pptLabels.square_feet+"</th><td>"+numberWithComma(newDevelopmentData[idtbuilding][0].retail_square_feet)+" "+window.pptLabels.square_feet+"</td></tr>";
	}
	else if(newDevelopmentData[idtbuilding][0].building_type.toLowerCase() == "resi ownership")
	{
		if(newDevelopmentData[idtbuilding][0].resi_ownership_units != null)
			description += "<tr><th>Units</th><td>"+numberWithComma(newDevelopmentData[idtbuilding][0].resi_ownership_units)+"</td></tr>";
		else if(newDevelopmentData[idtbuilding][0].resi_rental_units != null)
			description += "<tr><th>Units</th><td>"+numberWithComma(newDevelopmentData[idtbuilding][0].resi_rental_units)+"</td></tr>";
		else
			description += "<tr><th>Units</th><td></td></tr>";
	}
	else if(newDevelopmentData[idtbuilding][0].building_type.toLowerCase() == "resi rental")
	{
		description += "<tr><th>Units</th><td>"+numberWithComma(newDevelopmentData[idtbuilding][0].resi_rental_units)+"</td></tr>";
	}
	else if(newDevelopmentData[idtbuilding][0].building_type.toLowerCase() == "hotel")
	{
		description += "<tr><th>Units</th><td>"+numberWithComma(newDevelopmentData[idtbuilding][0].hotel_rooms)+"</td></tr>";
	}

	description += "<tbody>";
	description += "<table>";
	$(".descHeaderText").html(setFlyToBuildingLink(idtbuilding, newDevelopmentData[idtbuilding][0].name));

	$(".advancedStatistics").html(description);
	//$(".submarketPlaceHolder").html(setFlyToBuildingLink(idtbuilding, window.allBuildingsData[idtbuilding].name)+"&nbsp;&nbsp;&nbsp;<button class='btn btn-primary btn-xs' onClick=\"resetLastSelectedPrimitive();prepareInfoboxForNYCConstructionSummary('"+window.pptSteps[window.currentStep-1].info_summary_title+"');\">Back</button>");
	$(".submarketPlaceHolder").html("New Development"+"&nbsp;&nbsp;<button class='btn btn-xs btn-primary' onClick=\"gobackshowStats();resetPartialColor();\">Back</button>");
	$("#submarketStatistics").fadeIn();
	$(".defaultStatistics").hide();
	$(".advancedStatistics").show();
}


function prepareInfoboxForNYCConstruction(idtbuilding, index)
{
	console.log("IN prepareInfoboxForNYCCOnstruction() with idtbuilding "+idtbuilding+", index "+index);
	$("#submarketStats").hide();
	$("#residetails").hide();
	$("#submarketStatistics").show();

	var buildingRow = [];

	var description = "";
	//var cesiumColor = getPlutoClassColorPlain("PPT", "proposed_occupancy_type", window.nycConstructionData[index].building_type);
	//var temp = hexToRgb(cesiumColor);

	description = "<table class='table table-bordered'>";
	description += "<tbody>";
		description += "<tr><th>Permit Type</th><td>"+window.nycConstructionData[index].permit_type+"</td></tr>";
		description += "<tr><th>Enlargement</th><td>"+window.nycConstructionData[index].enlargement_flag+"</td></tr>";
		description += "<tr><th>Square footage</th><td>"+numberWithComma(window.nycConstructionData[index].square_footage)+" "+pptLabels.square_feet+"</td></tr>";
		description += "<tr><th>Permit Issued</th><td>"+window.nycConstructionData[index].permit_issuance_date+"</td></tr>";
		description += "<tr><th>Cost Estimate</th><td>$"+numberWithComma(window.nycConstructionData[index].cost_estimate)+"</td></tr>";
		description += "<tr><th>Applicant</th><td>"+window.nycConstructionData[index].applicant_business_name+"</td></tr>";
		description += "<tr><th>Proposed Occupancy</th><td>"+window.nycConstructionData[index].proposed_occupancy_class+"</td></tr>";
		description += "<tr><th>Proposed Storeys</th><td>"+window.nycConstructionData[index].proposed_stories+"</td></tr>";
		description += "<tr><th>Existing Storeys</th><td>"+window.allBuildingsData[idtbuilding].floors+"</td></tr>";
		description += "<tr><th>Proposed Dwelling Units</th><td>"+numberWithComma(window.nycConstructionData[index].proposed_dwelling_units)+"</td></tr>";
		description += "<tr><th>Job Number</th><td><a target='_blank' href='http://a810-bisweb.nyc.gov/bisweb/JobsQueryByNumberServlet?passjobnumber="+window.nycConstructionData[index].job_number+"'>"+window.nycConstructionData[index].job_number+"</a></td></tr>";
		description += "<tr><th>Building Type</th><td style='background-color:"+window.appColorSetting["PPT"]["new_developments"][0].color+";'>"+window.nycConstructionData[index].building_type+"</td></tr>";
	description += "</tbody>";
	description += "</table>";

	$(".advancedStatistics").html(description);

	//$(".submarketPlaceHolder").html(setFlyToBuildingLink(idtbuilding, window.buildingData[idtbuilding].name)+"&nbsp;&nbsp;&nbsp;<button class='btn btn-primary btn-xs' onClick=\"resetLastSelectedPrimitive();prepareInfoboxForNYCConstructionSummary('"+window.pptSteps[window.currentStep-1].info_summary_title+"');\">Back</button>");

	$(".submarketPlaceHolder").html(setFlyToBuildingLink(idtbuilding, window.allBuildingsData[idtbuilding].name)+"&nbsp;&nbsp;<button class='btn btn-xs btn-primary' onClick=\"gobackshowStats();resetPartialColor();\">Back</button>");
	$("#submarketStatistics").fadeIn();
	$(".defaultStatistics").hide();
	$(".advancedStatistics").show();
	setInfoboxWidth( "470px");
	//$("#submarketStatistics").css("height", "425px");
}



getBuildingInventoryData();
window.buildingInventoryData = [];
function getBuildingInventoryData()
{
	$.ajax({
	  method: "POST",
	  url: window.apiBaseUrl+"controllers/buildingController.php",
	  data: { sourceApp : "test.ppt", param : "getBuildingInventoryData", "idtsubmarket" : "", "needJSON" : "yes" }
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		console.log(data);

		if(data.status == "success")
		{
			jsonData = data.data;
			$.each(jsonData, function (index, row){
				var len = 0;
				if(typeof window.buildingInventoryData[row.idtsubmarket] == "undefined")
				{
					window.buildingInventoryData[row.idtsubmarket] = [];
				}
				
				if(typeof window.buildingInventoryData[row.idtsubmarket][row.idtbuilding] == "undefined")
				{
					window.buildingInventoryData[row.idtsubmarket][row.idtbuilding] = [];
				}
				//len = window.buildingInventoryData[row.idtsubmarket][row.idtbuilding].length;
				//window.buildingInventoryData[row.idtsubmarket][row.idtbuilding][len] = row;
				window.buildingInventoryData[row.idtsubmarket][row.idtbuilding] = row;
			});
		}
		else
		{
			alert("Something went wrong!");
		}
	});
}

window.submarketLabelPoints = [];
window.submarketLabelPoints[3] = [-74.00869080636194, 40.70246723574548];
window.submarketLabelPoints[4] = [-74.01750115253864, 40.71315593342285];
window.submarketLabelPoints[5] = [-74.00230362148949, 40.70670422785459];
window.submarketLabelPoints[6] = [-74.0004704903576, 40.7145325791593];
window.submarketLabelPoints[7] = [-74.00793576904309, 40.721151552487406];

window.submarketWhiteBoundryEntityCollectionShowProperty = false;
window.submarketLinesEntities = [];
window.submarketNameLabels = viewerDemoResiApp.scene.primitives.add(new Cesium.LabelCollection());

function drawSubmarketWhiteBoundary()
{
	if(window.submarketLinesEntities.length == 0)
	{
		for(var sub = 3; sub <= 7; sub++)
		{
			var coords = window.submarketDetails[sub].coords.replace(/\,0 /g, ',');
			coords = coords.replace(",0", "");
			coords = coords.split(",");
			//console.log(coords);
			newLinesHighlightFunction(coords, "submarket", "submarketBoundryHighlight-"+sub);
			console.log(window.submarketLabelPoints);
			if(typeof window.submarketLabelPoints[sub] != "undefined")
			{
				var position = Cesium.Cartesian3.fromDegrees(window.submarketLabelPoints[sub][0], window.submarketLabelPoints[sub][1], 40);
			
				window.submarketNameLabels.add({
					id: "submarketBoundryName-"+sub,
					position : position,
					scaleByDistance : new Cesium.NearFarScalar(200, 3.0, 500, 1.0),
					text : window.submarketDetails[sub].ssubname,
					showBackground : true,
					font : '21px Helvetica Neue',
					show : false,
					horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
					verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
					disableDepthTestDistance : Number.POSITIVE_INFINITY
				});
			}
		}
	}
}

function toggleSubmarketWhiteBoundry(forceOn = false, showLabels = true)
{
	$(".toggleContainerSubmarket").toggleClass("fa-toggle-off");
	$(".toggleContainerSubmarket").toggleClass("fa-toggle-on");
	$(".toggleContainerSubmarket").toggleClass("text-grey-color");
  
	//fa-toggle-on
	//fa-toggle-off
	//var subMarketArr = Object.keys(window.submarketFogHighlightBag);
	if(!window.submarketWhiteBoundryEntityCollectionShowProperty || forceOn)
	{
		$(".submarketWhiteToggleContainer").removeClass("fa-toggle-off");
		$(".submarketWhiteToggleContainer").addClass("fa-toggle-on");
		$(".submarketWhiteToggleContainer").addClass("text-blue");

		//SK : recent fix for Submarket Toggle
		$.each(window.submarketLinesEntities, function (index, eachLineSegment){
			//console.log(eachLineSegment.polyline.material.color);
			eachLineSegment.polyline.material.color=Cesium.Color.WHITE; 
			eachLineSegment.show = true;
		});
		if(showLabels)
		$.each(window.submarketNameLabels._labels, function (i, eachLabel){
			eachLabel.show = true;
		});
	}
	else
	{
		//Force Toggle OFF
		$(".submarketWhiteToggleContainer").removeClass("fa-toggle-on");
		$(".submarketWhiteToggleContainer").addClass("fa-toggle-off");
		$(".submarketWhiteToggleContainer").removeClass("text-blue");

		//SK : recent fix for Submarket Toggle
		$.each(window.submarketLinesEntities, function (index, eachLineSegment){
			eachLineSegment.show = false;
		});

		$.each(window.submarketNameLabels._labels, function (i, eachLabel){
			eachLabel.show = false;
		});
	}
	if(forceOn)
		window.submarketWhiteBoundryEntityCollectionShowProperty = true;
	else
		window.submarketWhiteBoundryEntityCollectionShowProperty= !window.submarketWhiteBoundryEntityCollectionShowProperty;
}

function newLinesHighlightFunction(coords, type, id="", width = 3, height = 10, color = Cesium.Color.WHITE, idtsub = null, defaultShow = true, usePolyLine=false)
{
	var originalId = id;
	for(var i = 0; i<= coords.length; i++)
	{
		if(typeof coords[i+1] != "undefined" && typeof coords[i+2] != "undefined" && typeof coords[i+3] != "undefined")
		{
			if(id != "")
				originalId = id+"-"+i;
			//console.log(id);
			//console.log(coords[i]+", "+coords[i+1]+", "+coords[i+2]+", "+coords[i+3]);
			if(usePolyLine || type == "subway")
			{
				var temp = viewerDemoResiApp.entities.add({
				  //name: "Green rhumb line",
				  id:originalId,
				  polylineVolume: {
					positions: Cesium.Cartesian3.fromDegreesArrayHeights([coords[i], coords[i+1], height, coords[i+2], coords[i+3], height]),
					//width: width,
					shape: computeCircle(5),
					/* height:100, */
					//arcType: Cesium.ArcType.RHUMB,
					material: color,
					show: true,
					/* show : defaultShow */
					/* clampToGround: true, */
					// classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
				  },
				});
			}
			else
			{
				var temp = viewerDemoResiApp.entities.add({
				  //name: "Green rhumb line",
				  id:originalId,
				  polyline: {
					positions: Cesium.Cartesian3.fromDegreesArrayHeights([coords[i], coords[i+1], height, coords[i+2], coords[i+3], height]),
					width: width,
					/* height:100, */
					arcType: Cesium.ArcType.RHUMB,
					material: color,
					show: true,
					/* show : defaultShow */
					/* clampToGround: true, */
					// classificationType : Cesium.ClassificationType.CESIUM_3D_TILE,
				  },
				});
			}
			
			if(type == "submarket")
			{
				window.submarketLinesEntities[window.submarketLinesEntities.length] = temp;
			}
		}
		i++;
	}
	
	$.each(window.submarketLinesEntities, function (index, eachLineSegment){
		eachLineSegment.show = false;
	});
}

function visualizationAdjustment(tabName)
{
	if(tabName == "inventory")
	{
		$("#visualizationType").val("Bedrooms");
		toggleVisualization();
	}
	else if(tabName == "pricing")
	{
		$("#visualizationType").val("Monthly Rent");
		toggleVisualization();
	}
	else if(tabName == "summary" || tabName == "market" || tabName == "development")
	{
		$("#visualizationType").val("");
		toggleVisualization();
	}
	
	if(window.fogChecked)
	{
		fogToggle(true);
	}
}

window.plutoBuildingDetails = [];
function getPlutoBuildingDetails()
{
	propertyTypes = ["rental", "residential2"];
	$.each(propertyTypes, function (index, eachPropertyType){
		$.ajax({
		  method: "POST",
		  url: window.apiBaseUrl+"controllers/buildingController.php",
		  data: { sourceApp : window.app_name, param : "getPlutoBuildingDataPPTApp", forPPT : "YES", "idtsubmarket" : "", "propertyType" : eachPropertyType }
		})
		.done(function( data ) {
			data = $.parseJSON( data );
			if(data.status == "success")
			{
				loadPlutoDetailsFromZip(data.fileName, eachPropertyType);
			}
			else
			{
				alert("Something went wrong");
			}
		});
	});
}

function loadPlutoDetailsFromZip(zipFile, propertyType)
{
	//console.log("loadPlutoDetailsFromZip "+zipFile);
	JSZipUtils.getBinaryContent(zipFile, function(err, data) {
		var elt = document.getElementById('jszip_utils');
		if(err) {
		  showError(elt, err);
		  return;
		}

		try {
		  JSZip.loadAsync(data)
		  .then(function(zip) {
			  //console.log("Loading Zip...");
			  //console.log(zip);
			  var jsonFileName = zipFile.replace("pptCache/", "").replace(".zip", ".json");
			  //console.log(jsonFileName);
			return zip.file(jsonFileName).async("string");
		  })
		  .then(function success(text) {
			loadPlutoDetailsFromJSON(text, propertyType);
		  }, function error(e) {
			showError(elt, e);
		  });
		} catch(e) {
		  showError(elt, e);
		}
	});

	function showError(ele, e)
	{
		//console.log("ERRROR");
		//console.log(ele);
		//console.log(e);
	}
}

function loadPlutoDetailsFromJSON(data, eachPropertyType)
{
	console.log("in loadPlutoDetailsFromJSON() ");
	data = $.parseJSON(data);
	var temp = [];
	$.each(data.data, function (i, row){
		row.coordsToUse = prepareCoordsForHighlight(row.coords, 100);
		temp[temp.length] = row;
	});
	
	window.plutoBuildingDetails[eachPropertyType.replace("residential2", "residential")] = temp;
}
getPlutoBuildingDetails();

Cesium.Math.setRandomNumberSeed(315);
setClockTime();




















