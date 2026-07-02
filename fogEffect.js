var buildingOverlappingData = null;

/*	Overlapping Data Loading	*/
function getBuildingOverlappingData()
{
	getBuildingOverlappingDataFromZIP("../test.ppt/pptCache/getOverlappingBuildings.zip");
	return "";
	
	$.ajax({
	  method: "POST",
	  url: window.apiBaseUrl+"controllers/buildingOverlapController.php",
	  data: { sourceApp : "test.ppt", param : "getOverlappingBuildings", version: ""}
	})
	.done(function( data ) {
		data = $.parseJSON( data );
		
		if(data.status == "success")
		{
			getBuildingOverlappingDataFromZIP(data.fileName);
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

/**
*	Building Overlapping
*/
//Copied from test app
var submarketOverlappingDataManual = {"4":{"2":[{"id":2,"coords":"-74.014083529594,40.704998584123,-74.014069769106,40.704994552168,-74.013975845385,40.705143639241,-74.013891690983,40.705265003563,-74.013791153695,40.705399003529,-74.013804226024,40.705401461779,-74.013905240491,40.705422203708,-74.013805052208,40.705401704427,-74.013395515888,40.705880155063,-74.014246749356,40.706170944929,-74.014514465489,40.705565593686,-74.014540332153,40.70557060893,-74.014715955189,40.705153862093,-74.01471230347593,40.705153027524396,-74.014805363326,40.704919003674,-74.014779703451,40.70486970813,-74.014234679986,40.704757829144,-74.014173435062,40.704777487131,-74.014083529594,40.704998584123","bldgArray":[824,1821,3467]}],"1":[{"id":"1","coords":"-74.014514465489,40.705565593686,-74.014540332153,40.70557060893,-74.014715955189,40.705153862093,-74.014643522899,40.705137308451,-74.014624167138,40.705132172954,-74.01453252944,40.705111526311,-74.014481390465,40.705102501785,-74.014441410535,40.705094971586,-74.014417402828,40.705152105,-74.014405403234,40.70515006709,-74.01437148218,40.705241937354,-74.014382799149,40.705243602584,-74.014402394082,40.705250844845,-74.014362123328,40.70536405211,-74.014324983367,40.705356611375,-74.014361305179,40.705263512375,-74.014222908998,40.705235342887,-74.014217638853,40.705242683537,-74.014190402027,40.705301435835,-74.014166016847,40.705292043218,-74.014192893605,40.705255077426,-74.014201052935,40.705251087194,-74.014227766809,40.705218116148,-74.014252753547,40.705226021474,-74.014314393841,40.705144524932,-74.014306689439,40.705129873905,-74.014356767143,40.70507062445,-74.01434187851,40.705067828698,-74.014291471564,40.705055277756,-74.014245922447,40.705043283903,-74.014173903205,40.705025506151,-74.014083529594,40.704998584123,-74.014069769106,40.704994552168,-74.013975845385,40.705143639241,-74.013891690983,40.705265003563,-74.013791153695,40.705399003529,-74.013804226024,40.705401461779,-74.013905240491,40.705422203708,-74.013805052208,40.705401704427,-74.013395515888,40.705880155063,-74.014246749356,40.706170944929,-74.014514465489,40.705565593686","bldgArray":[824,1821]}]}};

/**
*	Some changes are made here...
*/
function getBuildingOverlappingDataFromZIP(zipFile)
{
	console.log("centerlineData "+zipFile);
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
			  var jsonFileName = zipFile.replace("../test.ppt/pptCache/", "").replace(".zip", ".json");
			  //console.log(jsonFileName);
			return zip.file(jsonFileName).async("string");
		  })
		  .then(function success(text) {
        console.log("to getBuildingOverlappingDataFromJSON");
			getBuildingOverlappingDataFromJSON(text);
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

window.fogDataReady = false;
function getBuildingOverlappingDataFromJSON(jsonData)
{
	jsonData = $.parseJSON(jsonData);
	//console.log(jsonData);
	console.log("Fog data ready!");
	window.buildingOverlappingData = jsonData.allBuildings;
	window.buildingOverlappingSubmarketLevels = jsonData.submarketLevels;
	
	$.each(submarketOverlappingDataManual, function (idtsub, rows){
		if(typeof idtsub != "undefined")
		{
			$.each(rows, function (i, eachBldg){
				//console.log(eachBldg[0]);
				window.buildingOverlappingData[idtsub][eachBldg[0].bldgArray.length-1].push(eachBldg[0]);
			});
		}
	});
	window.fogDataReady = true;
	$(".fogSpanElement").css("opacity", 1);
}

/**
*	Need Submarket Data if not already loaded.
*	window.submarketDetails
*/


/**
*	Some helpful functions
*/
window.submarketFogHighlightBag = [];
function addToSubmarketBag(idtbldg)
{
	if(idtbldg != "" && typeof idtbldg != "undefined" && typeof window.buildingData[idtbldg] != "undefined")
	{
		//15-03 	Add it in Submarket Fog Bag.
		idsub = window.buildingData[idtbldg].idtsubmarket;
		if(typeof window.submarketFogHighlightBag[idsub] == "undefined")
		{
			window.submarketFogHighlightBag[idsub] = [];
		}
		if(!window.submarketFogHighlightBag[idsub].includes(parseInt(idtbldg)))
			window.submarketFogHighlightBag[idsub].push(parseInt(idtbldg));
	}
}

function removeFromSubmarketBag(idtbldg)
{
	if(idtbldg != "" && typeof idtbldg != "undefined" && typeof window.buildingData[idtbldg] != "undefined")
	{
		//15-03 	Add it in Submarket Fog Bag.
		idsub = window.buildingData[idtbldg].idtsubmarket;
		if(typeof window.submarketFogHighlightBag[idsub] != "undefined")
		{
			$.each(window.submarketFogHighlightBag[idsub], function (index, eachBuilding){
				if(eachBuilding == idtbldg)
				{
					window.submarketFogHighlightBag[idsub].splice(index, 1);
				}
			});
		}
	}
}

/**
*	Core Logic functions
*
*/
window.fogEffectAlpha = 0.5;
window.submarketHolesDebugging = true;
function createFogEffectForMultipleBuildingsForEachSubmarket(bldgArray, idtsub = "", clearFog = true, firstTime = false)
{
	if(clearFog)
		clearAllFog();
	
	console.log("For Sumbarket: submarketFogHighlight"+idtsub);
	viewerDemoResiApp.entities.removeById("submarketFogHighlight"+idtsub);
	if(typeof window.submarketDetails[idtsub].coordsToUse == "undefined")
		window.submarketDetails[idtsub].coordsToUse = processCoordsForCesium(window.submarketDetails[idtsub].coords);
	var submarketCoords = eval("["+window.submarketDetails[idtsub].coordsToUse+"]");
	if(bldgArray.length == 0)
	{
		var entity = viewerDemoResiApp.entities.add({
			id : "submarketFogHighlight"+idtsub,
			polygon : {
				hierarchy : {
					positions : Cesium.Cartesian3.fromDegreesArray(submarketCoords)
				},
				//material : Cesium.Color.fromCssColorString("#b2b2ff").withAlpha(0.2),
				material : Cesium.Color.WHITE.withAlpha(window.fogEffectAlpha),
				classificationType : Cesium.ClassificationType.BOTH
			}
		});
	}
	else
	{
		/**
		*	Multiple Holes sample
		*
		*	{positions : Cesium.Cartesian3.fromDegreesArray([-74.011485070613,40.706061974077,-74.011358228552,40.706290003651,-74.011827202262,40.706491110413,-74.011937346967,40.706258533399,-74.011485070613,40.706061974077])}
		*/
		//With Holes
		str = "";
			takenCareOfBuildings = [];//724,2652,1973,3317
			dataToIterate = logicForSubmarketHoles(buildingOverlappingData[idtsub], bldgArray);
			console.log(dataToIterate);
			if(dataToIterate[0].length == 0)
			{
				if(typeof window.submarketFogHighlightBagSeparatedBuildings[idtsub] != "undefined" && window.submarketFogHighlightBagSeparatedBuildings[idtsub].length > 0)
					dataToIterate[0] = window.submarketFogHighlightBagSeparatedBuildings[idtsub];
				else
					submarketFogHighlightBagSeparatedBuildings[idtsub] = [];
			}
			else if(dataToIterate[0].length > 0)
				window.submarketFogHighlightBagSeparatedBuildings[idtsub] = dataToIterate[0];
			
			$.each(dataToIterate[0], function (i, eachOverlappingData){
				coords = buildingOverlappingData[idtsub][eachOverlappingData.level][eachOverlappingData.index].coords;
				$.each(buildingOverlappingData[idtsub][eachOverlappingData.level][eachOverlappingData.index].bldgArray, function (k, eachIdtbuilding){
					takenCareOfBuildings.push(parseInt(eachIdtbuilding));
				});
				str += "{positions : Cesium.Cartesian3.fromDegreesArray(["+coords+"])},";
				if(window.fogVerificationDebugging)
					highlightTempPartial("["+coords+"]", Cesium.Color.GREEN.withAlpha(0.5));
			});
			
			//Remaining SIngle Buildings
			$.each(dataToIterate[1], function (i, eachIdtbuilding){
				if(typeof i != "undefined" && typeof eachIdtbuilding != "undefined")
				{
					eachIdtbuilding = parseInt(eachIdtbuilding);
					if(!takenCareOfBuildings.includes(eachIdtbuilding))
					{
						coords = window.buildingData[eachIdtbuilding].coords;
						str += "{positions : Cesium.Cartesian3.fromDegreesArray(["+coords+"])},";
						if(window.fogVerificationDebugging)
							highlightTempPartial("["+coords+"]", Cesium.Color.YELLOW.withAlpha(0.5));
					}
					else
					{
						console.log(eachIdtbuilding+" Is repeated!");
					}
				}
			});
		str = "["+str+"]";
		//console.log("submarketFogHighlight"+idtsub);
		//console.log(str);
		if(window.fogVerificationDebugging)
			return "";
		//var holesInSubmarket = eval(str);
		//console.log(holesInSubmarket);
		var entity = viewerDemoResiApp.entities.add({
			id : "submarketFogHighlight"+idtsub,//"boundrySubmarketWall"+index,
			polygon : {
				hierarchy : {
					positions : Cesium.Cartesian3.fromDegreesArray(submarketCoords),
					holes : eval(str)
				},
				//material : Cesium.Color.fromCssColorString("#b2b2ff").withAlpha(0.2),
				material : Cesium.Color.WHITE.withAlpha(window.fogEffectAlpha),
				classificationType : Cesium.ClassificationType.CESIUM_3D_TILE
			}
		});
		console.log(takenCareOfBuildings);
		window.smoothFogAlpha = 0;
		window.createFadeInFogEffect = true;
		if(!firstTime)
		{
			window.smoothFogAlpha = window.fogEffectAlpha - window.smoothFogAlphaStep;
		} 
	}
	return "";
}

function sortBuildingSequenceForFog(bldgArray)
{
	bldgArray.sort(function(a, b){return a-b});
	return bldgArray;
}

/**
*	Main Fog event
*/
window.submarketGroupDetails = [];
window.submarketGroupDetails[1] = [3,4,5,6,7];
window.submarketFogHighlightBagSeparatedBuildings = [];
function createFogEffectForSubmarketWithBuildingHoles(firstTime = false)
{
	console.log("In createFogEffectForSubmarketWithBuildingHoles() with firstTime "+firstTime);
	console.log(window.submarketFogHighlightBag);
	
	//Only for Downtown, For now.
	$.each(submarketGroupDetails[1], function (index, idtsubmarket){
		if(typeof window.submarketFogHighlightBag[idtsubmarket] != "undefined")
			createFogEffectForMultipleBuildingsForEachSubmarket(window.submarketFogHighlightBag[idtsubmarket], idtsubmarket, false, firstTime);
		else
			createFogEffectForMultipleBuildingsForEachSubmarket([], idtsubmarket, false, firstTime);
	});
}


function clearAllFog()
{
	clearMarketFog(1);
	if(isMobile.any() == null)
	{
		clearMarketFog(2);
		clearMarketFog(3);
		clearMarketFog(4);
	}
	else
	{
		$.each(window.submarketFogPrimitives, function(index, row){
			try{
				window.submarketFogPrimitives[index].destroy();
			}
			catch(e){
				//console.log(e);
			}
		});
	}
}

function clearMarketFog(idtmarket)
{
	$.each(window.submarketGroupDetails[idtmarket], function (index, idtsubmarket){
		if(typeof viewerDemoResiApp.entities.getById("submarketFogHighlight"+idtsubmarket) != "undefined")
		{
			if(typeof viewerDemoResiApp.entities.getById("submarketFogHighlight"+idtsubmarket) != "undefined")
				viewerDemoResiApp.entities.getById("submarketFogHighlight"+idtsubmarket).show = false;
			viewerDemoResiApp.entities.removeById("submarketFogHighlight"+idtsubmarket);
		}
	});
}

window.skipBuildingGrouping = [1687, 2755, 1591, 3225];//Which we want to skip grouping from overlapping data.
function logicForSubmarketHoles(overlappingData, submarketBuildingHoles)
{
	buildingTakenCareOf = [];
	console.log("Length: "+submarketBuildingHoles.length);
	
	overlappingDataHighlight = [];
	for(i = 6; i >= 1; i--)
	{
		console.log("Level "+i);
		if(typeof overlappingData[i] != "undefined")
		$.each(overlappingData[i], function (index, eachRow){
			//eachRow.id
			allTrue = true;
			$.each(eachRow.bldgArray, function (j, idtbldg){
				if((!submarketBuildingHoles.includes(parseInt(idtbldg)) && !submarketBuildingHoles.includes(idtbldg.toString())) || skipBuildingGrouping.includes(parseInt(idtbldg)))
				{
					allTrue = false;
				}
			});
			if(allTrue)
			{
				console.log("All True ", eachRow.bldgArray);
			}
			if(eachRow.bldgArray.length > 0 && allTrue == true)
			{
				//Mean all buildings matched from eachRow.id
				//1. Use this ID 
				//2. Remove those buildings from submaretBuildingHoles
				overlappingDataHighlight.push({"level": i, "index": index});
				//console.log("SubmarketBuildingHoles Before");
				//console.log(submarketBuildingHoles);
				$.each(submarketBuildingHoles, function (j, idtbldg){
					if(typeof idtbldg != "undefined")
					if(eachRow.bldgArray.includes(parseInt(idtbldg)) || eachRow.bldgArray.includes(idtbldg.toString()))
					{
						buildingTakenCareOf.push(parseInt(idtbldg));
						submarketBuildingHoles.splice(j, 1);
					}
				});
				//console.log("SubmarketBuildingHoles After");
				//console.log(submarketBuildingHoles);
				
				//console.log(eachRow.id, eachRow.bldgArray);
			}
		});
	}
	console.log("Remaining Submarket Buildings");
	console.log(submarketBuildingHoles);
	console.log("Length: "+submarketBuildingHoles.length);
	return [overlappingDataHighlight, submarketBuildingHoles];
}

function processCoordsForCesium(coords)
{
	var coords = coords.split(",0");
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
	return coordsToUse;
}

//Load it by default
getBuildingOverlappingData();

