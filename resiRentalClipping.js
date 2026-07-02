/**
*	Responsible for Resi Rental Clipping
*/

window.clippingFeatureActive = false;

window.buildingHighlightSelectionColor = Cesium.Color.WHITE.withAlpha(0.5);

window.apiBaseUrlFolder = "admin";

window.clippingPlaneBuildings = [1665, 1852, 3297, 3562, 3587, 1193, 558, 3361, 3363, 3434, 3166, 3298, 3338, 635, 2402, 723, 3394, 336, 371, 586, 1530, 2088, 2899, 1841, 392];

window.unitToClip = null;

function showClippingPlane(idtbuilding)
{
	if($(".showButtonText").text() == "Show Floor")
	{
		window.firstClipDone = true;
		window.clippingFeatureActive = true;
		window.lastClippingPlaneBuilding = idtbuilding;
		initiateClippingPlane(idtbuilding, window.buildingClippingPlanes[idtbuilding]);
		
		if(pickedPrimitiveId != null)
		{
			if(typeof window.pickedPrimitiveId.id != "undefined")
				temp = window.pickedPrimitiveId.id.split("-");
			else
				temp = window.pickedPrimitiveId.split("-");
			console.log( window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].unit, window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].number, window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding );
			setClickedClippingPlaneResiRental( window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].unit, window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].number, window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding );
		}
		$(".showButtonText").text("Hide Floor");
		$(".showButtonText").removeClass("btn-primary");
		$(".showButtonText").addClass("btn-default");
	}
	else
	{
		$(".showButtonText").text("Show Floor");
		window.clippingFeatureActive = false;
		$(".showButtonText").removeClass("btn-default");
		$(".showButtonText").addClass("btn-primary");
		clearClippingPlane();
		clearFloatingRings(window.lastClippingPlaneBuilding);
	}
}

//Load Clipping Plane Data
getBuildingClippingPlanes();
function getBuildingClippingPlanes()
{
	$.ajax({
	  method: "POST",
	  url: window.apiBaseUrl+"controllers/buildingClippingPlanes.php",
	  data: { sourceApp : window.app_name, param : "getBuildingClippingPlanes", bldgs: window.clippingPlaneBuildings.toString() }
	  })
	.done(function( data ) {
		data = $.parseJSON( data );
		
		if(data.status == "success")
		{
			window.buildingClippingPlanes = data.clipPlanes;
			window.buildingFloorPlans = data.floorPlans;
			window.officeBuildingClippingData = data.officeBuildingsData;
		}
		else
		{
			alert("Something went wrong");
		}
	});
}

window.clippingPartials = [];
window.lastBuildingClipping = null;
function initiateClippingPlane(idtbldg, clippingPlanesData, clipType = "building")
{
	floorAlignmentAdjustment = 12;
	if(idtbldg == 3297)
	{
		floorAlignmentAdjustment = 13;
		rotation = Cesium.Math.toRadians(28);
	}
	else if(idtbldg == 558)
	{
		floorAlignmentAdjustment = 13;
		rotation = Cesium.Math.toRadians(120);
	}
	else if(idtbldg == 3361)
	{
		floorAlignmentAdjustment = 12;
		rotation = Cesium.Math.toRadians(29);
	}
	else if(idtbldg == 3363)
	{
		floorAlignmentAdjustment = 12;
		rotation = Cesium.Math.toRadians(17);
	}
	else if(idtbldg == 3434)
	{
		floorAlignmentAdjustment = 12;
		rotation = Cesium.Math.toRadians(16.5);
	}
	else if(idtbldg == 1193)
	{
		floorAlignmentAdjustment = 12.5;
		rotation = Cesium.Math.toRadians(32);//Better store that data somewhere.
	}
	else if(idtbldg == 3587)
	{
		floorAlignmentAdjustment = 12.6;
	}
	
	window.clippingBuildingInUse = idtbldg;
	$("#submarketStatistics").css("right", "90px");
	$("#actionPanel2").removeClass("hide");
	$("#sliderVerticalPanel").removeClass("hide");
	//$("#amount").html("");
	
	//Somehow collect Partials Data
	window.clippingPartials = [];
	var resiRentalPartials = false;
	$.each(window.resiRentalAllData, function (index, eachResiRental){
		if(eachResiRental.idtbuilding == idtbldg)
		{
			//console.log("checkIfFloorToSkip("+eachResiRental.idtbuilding+", "+parseInt(eachResiRental.number)+"))");
			if(checkIfFloorToSkip(eachResiRental.idtbuilding, parseInt(eachResiRental.number)))
			{
				clippingPartials.push(eachResiRental);
				clippingPartials[clippingPartials.length - 1].key = index;
				resiRentalPartials = true;
				window.isResiRentalBuilding = true;
			}
			else
			{
				//console.log("Skipping "+eachResiRental.idtbuilding+" , "+parseInt(eachResiRental.number));
			}
		}
	});
	
	initialClipPlanePosition = window.buildingData[idtbldg].altitude;//TODO, check if any adjustments required here.
	if(idtbldg == 3587)
		initialClipPlanePosition = parseFloat(initialClipPlanePosition) + 2;
	createBuildingClippingPlanesV2(idtbldg, clippingPlanesData, clipType);
	if(window.lastBuildingClipping != null)
		clearFloatingRings(window.lastBuildingClipping);
	window.lastBuildingClipping = idtbldg;
}

window.center = null;
window.boundingSphere = null;
boundingSphereLat = 40.707828156521266;
boundingSphereLon = -74.01503626221971;
function createBuildingClippingPlanesV2(idtbldg, data, clipType)
{
	
	if(window.modelEntityClippingPlanes != null)
		window.modelEntityClippingPlanes.removeAll();
	
	// Normal (0,0,1) in ENU local space = local "up" (altitude increases).
	// Clip condition: dot(normal, P) + distance >= 0  →  P.z >= -distance
	// To clip everything ABOVE altitude H: set distance = -H.
	cesClipPlane = new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, 1.0), 0.0);
	
	window.modelEntityClippingPlanes = new Cesium.ClippingPlaneCollection({
		
		edgeWidth: 0,
		edgeColor: Cesium.Color.WHITE,
		unionClippingRegions : false,
		enabled : true
	});
	
	window.modelEntityClippingPlanes.add(cesClipPlane);
	console.log("clippingPlanesData");
	console.log(window.buildingClippingPlanes[idtbldg]);
	$.each(window.buildingClippingPlanes[idtbldg], function (index, row){
		if(clipType == row.clip_type)
		{
			window.modelEntityClippingPlanes.add(new Cesium.ClippingPlane(
				new Cesium.Cartesian3(parseFloat(row.clip_x), parseFloat(row.clip_y), parseFloat(row.clip_z)),
				parseFloat(row.clip_d)
			));
		}
	});
	
	if(clipType == "single building")
	{
		window.modelEntityClippingPlanes.unionClippingRegions = true;
	}
	// Anchor the clipping coordinate system at the building's geographic position at ground level.
	// eastNorthUpToFixedFrame gives an ENU frame where:
	//   X = East, Y = North, Z = Up (altitude).
	// This makes plane distances directly comparable to altitude values in metres stored
	// in buildingData.altitude and bottomfloorheight — no arbitrary ECEF offset needed.
	var anchorCartesian = Cesium.Cartesian3.fromDegrees(boundingSphereLon, boundingSphereLat, 0.0);
	window.modelEntityClippingPlanes.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(anchorCartesian);

	tileset.clippingPlanes = window.modelEntityClippingPlanes;

	// Clip above the building's base altitude (hide top, reveal interior from above).
	// distance = -altitude  so the clip threshold is exactly initialClipPlanePosition metres.

	cesClipPlane.distance = initialClipPlanePosition;	
}

/*
id = parseInt(window.resiRentalData[parseInt(temp[2])].idtresirentals);
floorN = parseInt(window.resiRentalData[parseInt(temp[2])].number);
idtbldg = parseInt(window.resiRentalData[parseInt(temp[2])].idtbuilding);

setClickedClippingPlaneResiRental(id, floorN, idtbldg);
*/

function setClickedClippingPlaneResiRental(unit, floorNumber, idtbuilding)
{
	console.log("Unit: "+unit+", FloorNumber: "+floorNumber+", idtbuilding: "+idtbuilding);
	var proceed = true;
	var floorToUse = [];
	$.each(clippingPartials, function (index, eachRow){
		if(proceed && eachRow.unit == unit)
		{
			proceed = false;
			
			tempMax = parseFloat(eachRow.bottomfloorheight) + parseFloat(eachRow.floorheight);
			floorToUse = eachRow.number;
			window.lastFloorSelected = parseInt(eachRow.number);
			floorData = eachRow;
			window.clippingBuildingPartialInUse = floorData;
			window.clippingBuildingPartialSameFloor = [];
		}
	});
	
	showFloorPlanImage(floorData, "");//Showing all partials from the floor.
	tempMax = tempMax - 1.5;//Reducing to 1 meter so that it appears intersecting
	//console.log("We are at Floor "+floorToUse);
	//console.log("tempMax "+tempMax);
	
	var lastSliderValue = tempMax;
	
	getImageFromHeight(tempMax, floorData, unit);
	
	cesClipPlane.distance = (tempMax - floorAlignmentAdjustment);
	if(unit == "60B" && idtbuilding == 3562)
	{
		cesClipPlane.distance = 68.8;
	}
	
	createFloatingRingForBuilding(idtbuilding, floorNumber, floorData.unit);
}

function setClickedClippingPlaneOfficeBuilding(idtbuilding, floorNumber)
{
	var proceed = true;
	var floorToUse = [];
	$.each(clippingPartials, function (index, eachRow){
		if(proceed && parseInt(eachRow.number) == parseInt(floorNumber))
		{
			proceed = false;
			
			tempMax = parseFloat(eachRow.bottomfloorheight) + parseFloat(eachRow.floorheight);
			floorToUse = eachRow.number;
			window.lastFloorSelected = parseInt(eachRow.number);
			floorData = eachRow;
			window.clippingBuildingPartialInUse = floorData;
			window.clippingBuildingPartialSameFloor = [];
		}
	});
	
	showFloorPlanImage(floorData);
	tempMax = tempMax - 1.5;//Reducing to 1 meter so that it appears intersecting
	//console.log("We are at Floor "+floorToUse);
	//console.log("tempMax "+tempMax);
	
	var lastSliderValue = tempMax;
	//$("#slider-vertical").slider('value', tempMax);
	//$("#slider-vertical").slider('value', tempMax);
	setSliderValue(tempMax);
	
	getImageFromHeight(tempMax, floorData);
	
	cesClipPlane.distance = (tempMax - floorAlignmentAdjustment);
}

function sortClipPlaneASC()
{
	clippingPartials.sort(function(a, b) { return a.number - b.number; });
}

function sortClipPlaneDESC()
{
	clippingPartials.sort(function(a, b) { return b.number - a.number; });
}

var buildingCoordsForImage = [];
buildingCoordsForImage[1852] = [-74.01380403806877, 40.709317839086445, -74.01387054519842, 40.709173512665934, -74.01355176911626, 40.7090310351968, -74.01351629449479, 40.70907172286334, -74.01349673070511, 40.70906484679593, -74.01344268949057, 40.7091685275796, -74.01380403806877, 40.709317839086445];
buildingCoordsForImage[3587] = [-74.00620910808098, 40.71745717833366, -74.00605338060015, 40.71765305586755, -74.00640603547728, 40.71779305520921, -74.00654938167031, 40.71761261192246, -74.00620910808098, 40.71745717833366];
buildingCoordsForImage[1665] = [-74.01058814756833, 40.70521894543251, -74.01039107448322, 40.70522391227131, -74.01020938092326, 40.70525695086153, -74.01018755250841, 40.70525818547375, -74.01010983406454, 40.70549159901422, -74.01011115402189, 40.70553129313921, -74.01016344678494, 40.70557137145629, -74.01030174835608, 40.70556741133717, -74.01028594738891, 40.7054829402819, -74.01025512531265, 40.705478306830074, -74.01027343494596, 40.70542373389406, -74.0104115416325, 40.70540205853075, -74.01044346527226, 40.705374360695764, -74.01056064680596, 40.70536205489152, -74.01055777636769, 40.705345281202405, -74.01060975369181, 40.70533846949001, -74.01058814756833, 40.70521894543251];
//buildingCoordsForImage[1665] = [-74.01020074114182, 40.70526043990748,-74.01012031547835, 40.705568311700205,-74.01060374430014, 40.705523388810214,-74.01060833068348, 40.70533577558486,-74.01058866826536, 40.70522189093992,-74.01020074114182, 40.70526043990748];
buildingCoordsForImage[3562] = [-74.01512364401209, 40.70795102987595, -74.01514089715188, 40.70795452037878, -74.01515961591487, 40.70794794836541, -74.015170442248, 40.70794046213849, -74.015190911393, 40.70791376344477, -74.01522478013202, 40.7078491287667, -74.01523162174453, 40.70782545391898, -74.015233322922, 40.707817158762005, -74.01523801562828, 40.70779296792321, -74.01522885785585, 40.707770924778345, -74.01521056593262, 40.70775834409683, -74.01519479469935, 40.70775063503529, -74.01516143481241, 40.707735518950756, -74.0149769585783, 40.7076733179392, -74.01495242361854, 40.70766793969766, -74.0149245513857, 40.707667037767116, -74.01490142367186, 40.70767980903747, -74.01489305189239, 40.70768678659023, -74.01486775403747, 40.70770923886185, -74.01483854376593, 40.7077450494266, -74.01481321340076, 40.707787699533185, -74.0148019172384, 40.70782041453814, -74.01481364712055, 40.70784056648937, -74.01484849150255, 40.70785687251526, -74.0148914236264, 40.70787363395395, -74.0149623281305, 40.70789970679856, -74.01504946717768, 40.70792835360375, -74.01509705783582, 40.70794287566504, -74.01512364401209, 40.70795102987595];

//Defining empty function
function clearPreviousFloorHighlights()
{
	
}

window.multipleFloorPlans = [];
	window.clearEntitiesForNextBuilding = [];
	pptClippingCoords = [];
	function showFloorPlanImage(floorData, unit = "", additionalHeight = 0)
	{
		//console.log("In showFloorPlanImage()", floorData);
		clearPreviousFloorHighlights();
		
		var coords = [];
		
		//These are custom defined coords
		if(window.clippingBuildingInUse == null && typeof window.selectedRetalG != "undefined")
		{
			window.clippingBuildingInUse = parseInt(selectedRetalG.idtbuilding);
		}
		pptClippingCoords[window.clippingBuildingInUse] = window.buildingData[window.clippingBuildingInUse];
		if(typeof pptClippingCoords[window.clippingBuildingInUse] != "undefined")
			coords = pptClippingCoords[window.clippingBuildingInUse];
		else
			coords = eval("["+window.allBuildingsData[window.clippingBuildingInUse].coords+"]");
		/**
		*	Overriding base coords, to manual pick up coords. For better floor plan display
		*
		*/
		if(typeof buildingCoordsForImage[window.clippingBuildingInUse] != "undefined")
		{
			coords = buildingCoordsForImage[window.clippingBuildingInUse];
		}
		
		/**
		*	Below is important, this uses partial, but without appropriate images and rotation, not possible.
		*
		**/
		var usePartialCoords = true;
		if(typeof floorData.idtresirentals != "undefined")
		{
			//$("#clipImageContainerBig").html("<img class='bigImage' src='"+"../"+apiBaseUrlFolder+"/"+window.buildingFloorPlans[window.clippingBuildingInUse][floorData.idtresirentals][0].file_path+"' />");
			if(usePartialCoords == true)
			{
				//From Partial Setting page
				floorData.number = parseInt(floorData.number);
				if(typeof window.officeBuildingClippingData[window.clippingBuildingInUse] != "undefined" && window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0] != "undefined")
				{
					/* viewerDemoResiApp.entities.removeById("clipHandle-"+window.clippingBuildingInUse);
					viewerDemoResiApp.entities.add({
						id : "clipHandle-"+window.clippingBuildingInUse,
						polygon : {
							hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(eval("["+window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0].partial_coords+"]"))),
							material: "../"+apiBaseUrlFolder+"/"+window.buildingFloorPlans[window.clippingBuildingInUse][floorData.idtresirentals][0].file_path,//'./rentalFiles-1591812762-0.jpg',
							rotation: Cesium.Math.toRadians(parseFloat(window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0].image_rotation)),
							stRotation: Cesium.Math.toRadians(parseFloat(window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0].image_rotation)),
							height: (parseFloat(floorData.bottomfloorheight) + 0.75 ),
							extrudedHeight: parseFloat(floorData.bottomfloorheight) + 0.5,
						}
					}); */
					
					//buildingPartialsMap[1852]
					for(var jk = 0; jk<6; jk++)
						viewerDemoResiApp.entities.removeById("clipHandle-"+window.clippingBuildingInUse+"-"+jk);
					$.each(window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number], function (jk, imagePartialRow){
						if(unit == "" || unit == imagePartialRow.unit_number)
						{
							viewerDemoResiApp.entities.removeById("clipHandle-"+window.clippingBuildingInUse+"-"+jk);
							viewerDemoResiApp.entities.add({
								id : "clipHandle-"+window.clippingBuildingInUse+"-"+jk,
								polygon : {
									hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(eval("["+imagePartialRow.partial_coords+"]"))),
									material: "../"+apiBaseUrlFolder+"/"+imagePartialRow.floor_plan,//'./rentalFiles-1591812762-0.jpg',
									rotation: Cesium.Math.toRadians(parseFloat(imagePartialRow.image_rotation)),
									stRotation: Cesium.Math.toRadians(parseFloat(imagePartialRow.image_rotation)),
									height: additionalHeight + (parseFloat(floorData.bottomfloorheight) + 0.75 ),
									extrudedHeight: additionalHeight + parseFloat(floorData.bottomfloorheight) + 0.5,
								}
							});
						}
					});
				}
				else
				{
					//console.log("clipHandle-"+window.clippingBuildingInUse);
					//console.log("clippingBuildingPartialInUse");
					//console.log(window.clippingBuildingPartialInUse);
					//console.log(window.buildingFloorPlans[window.clippingBuildingInUse][floorData.idtresirentals][0].file_path);
					coords = eval("["+floorData.coords+"]");
					viewerDemoResiApp.entities.removeById("clipHandle-"+window.clippingBuildingInUse);
					viewerDemoResiApp.entities.add({
						id : "clipHandle-"+window.clippingBuildingInUse,
						polygon : {
							hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(coords)),
							/*material : Cesium.Color.WHITE,*/
							material: "../"+apiBaseUrlFolder+"/"+window.buildingFloorPlans[window.clippingBuildingInUse][floorData.idtresirentals][0].file_path,//'./rentalFiles-1591812762-0.jpg',
							rotation: rotation,
							stRotation: rotation,
							height: additionalHeight + (parseFloat(floorData.bottomfloorheight) + 0.75 ),
							extrudedHeight: additionalHeight + parseFloat(floorData.bottomfloorheight) + 0.5,
						}
					});
				}
				
				if(window.clippingBuildingPartialSameFloor.length > 0)
				{
					console.log("Inside Show "+window.clippingBuildingPartialSameFloor);
					$.each(window.clippingBuildingPartialSameFloor, function (index, eachFloorData){
						
						var partialCoords = eachFloorData.coords;
						var imageRotation = rotation;
						if(typeof window.officeBuildingClippingData[window.clippingBuildingInUse] != "undefined")
						if(typeof window.officeBuildingClippingData[window.clippingBuildingInUse][eachFloorData.number] != "undefined")
						{
							$.each(window.officeBuildingClippingData[window.clippingBuildingInUse][eachFloorData.number], function (i1, r1){
								if(r1.unit_number == eachFloorData.unit)
								{
									partialCoords = r1.partial_coords;
									imageRotation = Cesium.Math.toRadians(parseFloat(r1.image_rotation));
								}
							});
						}
						
						console.log("eachFloorData");
						console.log(eachFloorData);
						var id = "clipMultiple-"+eachFloorData.idtresirentals;
						//console.log(id);
						//console.log(window.buildingFloorPlans[window.clippingBuildingInUse][eachFloorData.idtresirentals][0].file_path);
						window.multipleFloorPlans.push(id);
						viewerDemoResiApp.entities.add({
							id : id,
							polygon : {
								hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(eval("["+partialCoords+"]"))),
								/*material : Cesium.Color.WHITE,*/
								material: "../"+apiBaseUrlFolder+"/"+window.buildingFloorPlans[window.clippingBuildingInUse][eachFloorData.idtresirentals][0].file_path,//'./rentalFiles-1591812762-0.jpg',
								rotation: imageRotation,
								stRotation: imageRotation,
								height: additionalHeight + (parseFloat(eachFloorData.bottomfloorheight) + 0.75 ),
								extrudedHeight: additionalHeight + parseFloat(eachFloorData.bottomfloorheight) + 0.5,
							}
						});
					});
				}
				
				//From Partial Setting page
				if(typeof window.officeBuildingClippingData[window.clippingBuildingInUse] != "undefined" && window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0] != "undefined")
				{
					viewerDemoResiApp.entities.removeById("remainingClip-"+window.clippingBuildingInUse);
					viewerDemoResiApp.entities.add({
						id : "remainingClip-"+window.clippingBuildingInUse,
						polygon : {
							hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(eval("["+window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0].floor_coords+"]"))),
							material: Cesium.Color.GREY,
							height: additionalHeight + (parseFloat(floorData.bottomfloorheight) + 0.5 ),
							extrudedHeight: additionalHeight + parseFloat(floorData.bottomfloorheight) + 0.4,
						}
					});
				}
				else
				{
					viewerDemoResiApp.entities.removeById("remainingClip-"+window.clippingBuildingInUse);
					window.clearEntitiesForNextBuilding.push("remainingClip-"+window.clippingBuildingInUse);
					viewerDemoResiApp.entities.add({
						id : "remainingClip-"+window.clippingBuildingInUse,
						polygon : {
							hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(buildingCoordsForImage[window.clippingBuildingInUse])),
							material: Cesium.Color.GREY,
							height: additionalHeight + (parseFloat(floorData.bottomfloorheight) + 0.5 ),
							extrudedHeight: additionalHeight + parseFloat(floorData.bottomfloorheight) + 0.4,
						}
					});
				}
			}
			else
			{
				viewerDemoResiApp.entities.add({
					id : "clipHandle-"+window.clippingBuildingInUse,
					polygon : {
						hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(coords)),
						/*material : Cesium.Color.WHITE,*/
						material: "../"+apiBaseUrlFolder+"/"+window.buildingFloorPlans[window.clippingBuildingInUse][floorData.idtresirentals][0].file_path,//'./rentalFiles-1591812762-0.jpg',
						rotation: rotation,
						stRotation: rotation,
						height: additionalHeight + (parseFloat(floorData.bottomfloorheight) + 0.75 ),
						extrudedHeight: additionalHeight + parseFloat(floorData.bottomfloorheight) + 0.5,
					}
				});
			}
		}
		else
		{
			if(parseInt(window.clippingBuildingInUse) == 3297 && parseInt(floorData.number) == 73)
				addModel(-74.01296612992971, 40.71310879729823, (parseFloat(floorData.bottomfloorheight) + 0.75 ));
			else
				removeModel();
			console.log(floorData);
			//console.log("../samplePages/floorPlan/"+window.pptClippingFloorPlan[window.clippingBuildingInUse][floorData.number]);
			//$("#clipImageContainerBig").html("<img class='bigImage' src='"+"../samplePages/floorPlan/"+window.pptClippingFloorPlan[window.clippingBuildingInUse][floorData.number]+"' />");
			$("#clipImageContainerBig").html("<img class='bigImage' src='"+window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0].floor_plan+"' />");
			//console.log(window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0].floor_coords);
			viewerDemoResiApp.entities.add({
				id : "clipHandle-"+window.clippingBuildingInUse,
				polygon : {
					//hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(window.buildingCoordsForImageV2[window.clippingBuildingInUse][floorData.number])),
					hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(eval("["+window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0].partial_coords+"]"))),
					/*material : Cesium.Color.WHITE,*/
					//material: "../samplePages/floorPlan/"+window.pptClippingFloorPlan[window.clippingBuildingInUse][floorData.number],
					material: window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0].floor_plan,
					rotation: Cesium.Math.toRadians(parseFloat(window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0].image_rotation)),
					stRotation: Cesium.Math.toRadians(parseFloat(window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0].image_rotation)),
					height: additionalHeight + (parseFloat(floorData.bottomfloorheight) + 0.75 ),
					extrudedHeight: additionalHeight + parseFloat(floorData.bottomfloorheight) + 0.5,
				}
			});
			
			viewerDemoResiApp.entities.removeById("remainingClip-"+window.clippingBuildingInUse);
			viewerDemoResiApp.entities.add({
				id : "remainingClip-"+window.clippingBuildingInUse,
				polygon : {
					hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(eval("["+window.officeBuildingClippingData[window.clippingBuildingInUse][floorData.number][0].floor_coords+"]"))),
					material: Cesium.Color.GREY,
					height: additionalHeight + (parseFloat(floorData.bottomfloorheight) + 1.65 ),
					extrudedHeight: additionalHeight + parseFloat(floorData.bottomfloorheight) + 0.4,
				}
			});
		}
	}
	
	function getImageFromHeight(height, floorData, unit = "")
	{
		//prepareHorizonCameraView();
		height = parseFloat(height);
		var floorNumber = floorData.number;
		var floorData = floorData;
		/* $.each(floorDetails, function (index, row) {
			//console.log(height+" >= "+row.bottomfloorheight+" && "+height+" < "+(parseFloat(row.bottomfloorheight) + parseFloat(row.floorheight) + parseFloat(row.adjustment)))
			if(height >= parseFloat(row.bottomfloorheight) && height < (parseFloat(row.bottomfloorheight) + parseFloat(row.floorheight) + parseFloat(row.adjustment)))
			{
				floorNumber = row.number;
				floorData = row;
			}
		}); */
		if(typeof doubleClickFloorValue != "undefined" && doubleClickFloorValue != "")
		{
			floorNumber = doubleClickFloorValue;
			doubleClickFloorValue = "";
		}
		if(floorNumber != "")
		{
			$(".floor-altitude-display").removeClass("hide");
			$(".colorLegend2").removeClass("hide");
			if(typeof floorData.unit != "undefined")
				$(".unitDisplayContainer").html("- Unit "+floorData.unit);
			else if(typeof floorData.number != "undefined")
				$(".unitDisplayContainer").html("- Floor "+floorData.number);
			$(".floor-number").html(floorNumber+"F");
			$(".floor-height").html(parseInt(height)+"M");
		}
		//console.log("floorNumber: " + floorNumber);
		//Not displaying floor number using Label collection, 
		/* if(floorNumber != "")
		{
			annotationsBD.destroy();
			annotationsBD = viewerDemoResiApp.scene.primitives.add(new Cesium.LabelCollection());
			var position = Cesium.Cartesian3.fromDegrees(-74.01293798431841, 40.71258779208568, height);
			annotationsBD.add({
				id: "annotation-3297",
				position : position,
				text : floorNumber,
				showBackground : true,
				font : '14px monospace',
				horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
				verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
				disableDepthTestDistance : Number.POSITIVE_INFINITY
			});
		} */
		if(typeof floorImages != "undefined" && floorNumber != "" && typeof floorImages[floorNumber] != "undefined")
		{
			if(lastFloorSelected != floorNumber && floorNumber != "")
			{
				if(typeof primitiveCollection[0] != "undefined")
					primitiveCollection[0].destroy();
				
				primitiveCollection = [];
				lastFloorSelected = floorNumber;
				lastFloorSelectedV2 = floorNumber;
				var ht = parseFloat(floorData.floorheight) + parseFloat(floorData.adjustment);
				//highlightBuildingPartials(floorData.idtfloor, ht, parseFloat(floorData.bottomfloorheight), "", mycoords);
				highlightBuildingPartials(window.clippingBuildingInUse, floorData.idtfloor, ((floorNumber*4.11)-26), parseFloat(floorData.bottomfloorheight), "", buildingCoordsForHighlight, 'Cesium.Color.RED.withAlpha(0.5)');
				//highlightBuildingPartials(floorData.idtfloor, (ht - 26), parseFloat(floorData.bottomfloorheight), "", buildingCoordsForHighlight, 'Cesium.Color.RED.withAlpha(0.5)');
				
				$("#imageContainer").html("Height: <span id='myHeight'>"+height.toFixed(2)+"</span>m<br />Floor: "+floorNumber+"<br /><img src='"+imageBasePath+floorImages[floorNumber]+"' height='300px' width='400px'/>");
				$("#imageContainerBig").html("<img class='bigImage' src='"+imageBasePath+floorImages[floorNumber]+"' />");
			}
			else
			{
				//lastFloorSelected = "";
			}
		}
		else if(floorNumber != "")
		{
			//lastFloorSelected = "";
		}
		/* if(floorNumber == "" && height > 136)
			$("#imageContainer").html(""); */
		
		$("#myHeight").html(height.toFixed(2));
		
		return floorNumber;
	}
	
	function clearClippingPlane()
	{
		$(".chapter13ClippingButton").addClass("btn-grey");
		$(".chapter13ClippingButton").removeClass("btn-primary");
		
		$(".headerRightLabelResiRental").addClass("hide");
		$(".headerRightLabelOffice").addClass("hide");
			
		if(typeof window.floorNumberLabelsCustom != "undefined" && window.floorNumberLabelsCustom != null)
			window.floorNumberLabelsCustom.destroy();
		
		$("#actionPanel2").addClass("hide");
		$("#sliderVerticalPanel").addClass("hide");
		$("#submarketStatistics").css("right", "10px");
		for(var jk = 0; jk<6; jk++)
			viewerDemoResiApp.entities.removeById("clipHandle-"+window.clippingBuildingInUse+"-"+jk);
		
		viewerDemoResiApp.entities.removeById("remainingClip-"+window.clippingBuildingInUse);
		//$("#amount").html("");
		window.clippingPartials = [];
		
		window.lastFloorSelected = null;
		window.clippingBuildingInUse = null;
		if(modelEntityClippingPlanes != null && typeof modelEntityClippingPlanes != "undefined")
			modelEntityClippingPlanes.removeAll();
		$.each(window.multipleFloorPlans, function (index, eachFloorPlanId){
			viewerDemoResiApp.entities.removeById(eachFloorPlanId);
		});
		$.each(window.clearEntitiesForNextBuilding, function (index, eachFloorPlanId){
			viewerDemoResiApp.entities.removeById(eachFloorPlanId);
		});
		//clearPrimitives();
	}
	
	
	/**
 * Clip the tileset to show only geometry inside a polygon footprint and below a given altitude.
 *
 * @param {Array}  coordsFlat  Flat [lon1,lat1, lon2,lat2, ...] array defining the polygon (any winding)
 * @param {number} height      Clip altitude in metres above sea level — geometry below remains visible
 *
 * After calling, cesClipPlane.distance can still be updated to slide the ceiling interactively.
 */
function clipAreaByCoordsAndHeight(coordsFlat, height)
{
    if (window.modelEntityClippingPlanes != null)
        window.modelEntityClippingPlanes.removeAll();

    window.modelEntityClippingPlanes = new Cesium.ClippingPlaneCollection({
        edgeWidth: 0,
        edgeColor: Cesium.Color.WHITE,
        unionClippingRegions: false,  // AND: inside polygon AND below height
        enabled: true
    });

    // Horizontal ceiling: normal (0,0,-1) → visible where altitude <= distance
    cesClipPlane = new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), height);
    window.modelEntityClippingPlanes.add(cesClipPlane);

    // Convert flat [lon,lat,...] pairs to ENU XY offsets from anchor (metres)
    var metersPerDeg = 111320.0;
    var anchorLon    = boundingSphereLon;
    var anchorLat    = boundingSphereLat;
    var cosLat       = Math.cos(Cesium.Math.toRadians(anchorLat));

    var pts = [];
    for (var i = 0; i < coordsFlat.length - 1; i += 2) {
        pts.push({
            x: (coordsFlat[i]     - anchorLon) * cosLat * metersPerDeg,
            y: (coordsFlat[i + 1] - anchorLat) * metersPerDeg
        });
    }

    // Detect winding via signed area (shoelace): > 0 = CCW, < 0 = CW
    var signedArea = 0;
    for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length];
        signedArea += (a.x * b.y - b.x * a.y);
    }
    var ccw = signedArea > 0;

    // One vertical clipping plane per polygon edge, normal pointing inward
    for (var i = 0; i < pts.length; i++) {
        var a = pts[i], b = pts[(i + 1) % pts.length];
        var ex = b.x - a.x, ey = b.y - a.y;
        var len = Math.sqrt(ex * ex + ey * ey);
        if (len < 0.001) continue;

        // Left of edge = inward for CCW; right of edge = inward for CW
        var nx = ccw ? -ey / len :  ey / len;
        var ny = ccw ?  ex / len : -ex / len;

        // Plane passes through vertex a: distance = -dot(n, a)
        window.modelEntityClippingPlanes.add(new Cesium.ClippingPlane(
            new Cesium.Cartesian3(nx, ny, 0.0),
            -(nx * a.x + ny * a.y)
        ));
    }

    // ENU frame: Z = altitude in metres, so plane distances map directly to metres above sea level
    var anchorCartesian = Cesium.Cartesian3.fromDegrees(anchorLon, anchorLat, 0.0);
    window.modelEntityClippingPlanes.modelMatrix =
        Cesium.Transforms.eastNorthUpToFixedFrame(anchorCartesian);

    tileset.clippingPlanes = window.modelEntityClippingPlanes;
}


