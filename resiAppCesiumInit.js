var terrainModels = Cesium.createDefaultTerrainProviderViewModels();

var viewerDemoResiApp = new Cesium.Viewer('cesiumContainerDemoResiApp', {
	timeline:true,
	animation:false,
	vrButton:false,
	homeButton:false,
  /* baseLayerPicker: false, */
	geocoder:false,
	infoBox:false,
	fullscreenButton:false,
	navigationHelpButton:false,
	imageryProvider: new Cesium.BingMapsImageryProvider({
		url : 'https://dev.virtualearth.net',
		key: 'Ahw5_R2_2vhwbYF88KKqxXBtaTN-EJXBMFYEH6yVFFD5nDs5dfF655RvI6hA4z6_',
		mapStyle: Cesium.BingMapsStyle.AERIAL
	}),
	requestRenderMode : false,
	//sceneModePicker:false,
	logarithmicDepthBuffer : false,
	scene3DOnly:true,
  //terrainProviderViewModels: terrainModels,
	//selectedTerrainProviderViewModel: terrainModels[1],  // Select STK high-res terrain
	shouldAnimate : true,
	contextOptions : {
	webgl : {
		powerPreference: 'default',
		preserveDrawingBuffer : true
		}
	},
});
var viewer = viewerDemoResiApp;

if(typeof isThisMyApp == "undefined")
{
	var variableForCesiumViewer = viewerDemoResiApp;
}

//$('.cesium-viewer-toolbar').hide();

var camera = viewerDemoResiApp.scene.camera;
viewerDemoResiApp.scene.globe.depthTestAgainstTerrain = false;

//First Thing fly to NYC
flyToCamera(40.70120848305151, -74.02614796900917, 762.1046669609244, 58.133974866515395, 63.51158760495456, -26.488412395045437, 0.18060563573243948, 0, viewerDemoResiApp.scene.camera);

setTimeout(function(){
	if(Cesium.Ion.defaultAccessToken == null)
			Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OTIwM2E3Yi1lYTkwLTRiZTYtYmMxYS02NGRkMGYzYTIzMmIiLCJpZCI6MjY1LCJpYXQiOjE1MjE1NDUzNDR9.XIij-qDaBt2xTi-NrUs_PJkII6uo2v7MsAi9dC0fb30';
	viewerDemoResiApp.scene.primitives.add(
		new Cesium.Cesium3DTileset({
			url: Cesium.IonResource.fromAssetId(673128),
		})
	);
}, 500);

//viewerDemoResiApp.scene.debugShowFramesPerSecond = true;//FPS Widget

/*---------------------------------------------------------------------------------**//**
* @bsimethod
+---------------+---------------+---------------+---------------+---------------+------*/
// Functions to adapt screen space error and memory use to the device
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

Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OTIwM2E3Yi1lYTkwLTRiZTYtYmMxYS02NGRkMGYzYTIzMmIiLCJpZCI6MjY1LCJpYXQiOjE1MjE1NDUzNDR9.XIij-qDaBt2xTi-NrUs_PJkII6uo2v7MsAi9dC0fb30';
var tileset = null;
/*
if(Cesium.VERSION != "1.114")
{
	tileset = viewerDemoResiApp.scene.primitives.add(
  new Cesium.Cesium3DTileset({
    url: Cesium.IonResource.fromAssetId(437161),
    maximumScreenSpaceError : isMobile.any() ? 2 : 1,
    maximumNumberOfLoadedTiles : isMobile.any() ? 10 : 1000,
  })
);

}
else
{
	console.log("Using New version Tileset Loading");
	tileset = LoadTilesetNewVersion();
}
*/

tileset = LoadTilesetNewVersion();
	
async function LoadTilesetNewVersion()
{
	viewerDemoResiApp.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider();

	const tile2 = viewerDemoResiApp.scene.primitives.add(
		await Cesium.Cesium3DTileset.fromIonAssetId(2705943)
	);

	tile2.maximumScreenSpaceError = 1;
	
	/*
	tile2.skipLevelOfDetail = false;
	//Older Cesium version
	//tile2.maximumMemoryUsage = 4096;     // MB - increase for high-res
	
	// Newer CesiumJS (replaces maximumMemoryUsage)
	tile2.cacheBytes = 1024 * 1024 * 1024;           // e.g. 1GB base cache
	tile2.maximumCacheOverflowBytes = 1024 * 1024 * 1024 * 4; // allow overflow up to 4GB more
	
	tile2.skipLevelOfDetailFrames = 5;
	tile2.dynamicScreenSpaceError = true;
	tile2.dynamicScreenSpaceErrorFactor = 4.0;
	
	tile2.preloadWhenHidden = true;        // keep loading/caching tiles even if tile2.show = false
	tile2.preloadFlightDestinations = true; // preload tiles at the camera's flight destination
	tile2.cullRequestsWhileMoving = false;  // don't cancel in-flight requests while camera moves (helps during fast zoom)
	tile2.foveatedTiles = false;           // disable foveated culling if you don't want peripheral tiles deprioritized
	
	viewer.scene.globe.tileCacheSize = 1000;
	*/
	
	viewer.scene.globe.depthTestAgainstTerrain = true;
	height = 30;
	var cartographic = Cesium.Cartographic.fromCartesian(tile2.boundingSphere.center);
	var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
	var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
	var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
	tile2.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
	tile2.show = true;
	return tile2;
}

async function LoadTilesetNewVersion_BAK()
{
	return;
	var tile2 = viewerDemoResiApp.scene.primitives.add(
	  await Cesium.Cesium3DTileset.fromIonAssetId(2705943)
	);
	tile2.maximumScreenSpaceError = 1;  // Balance quality vs performance
	tile2.maximumMemoryUsage = 1024;     // MB - increase for high-res
	tile2.skipLevelOfDetail = false;    // Load proper LOD
	tile2.baseScreenSpaceError = 1024;  // Base quality
	tile2.skipScreenSpaceErrorFactor = 16;
	tile2.skipLevels = 1;
	
	// Wait for tiles to load
	await Cesium.Cesium3DTileset.maximumScreenSpaceError;

	// Check loading status
	tile2.tileset.loadProgress.addEventListener((percentage) => {
		console.log(`Loaded: ${percentage}%`);
	});

	// Force camera update to refresh tiles
	viewerDemoResiApp.scene.requestRender();


	// Get center of tileset
const boundingSphere = tile2.boundingSphere;
const center = boundingSphere.center;

// Get terrain elevation at that location
const cartographic = Cesium.Cartographic.fromCartesian(center);
const terrainHeight = await Cesium.sampleTerrainMostDetailed(
    viewerDemoResiApp.scene.terrainProvider,
    [cartographic]
);

// Adjust tileset to match terrain height
const offset = terrainHeight[0].height - cartographic.height;
tile2.heightOffset = offset;

/*
	height = 20;
	var cartographic = Cesium.Cartographic.fromCartesian(tile2.boundingSphere.center);
	var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
	var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
	var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
	tile2.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
	tile2.show = true;
*/
	return tile2;
}

function setMeshHeight()
{
	height = 30;
	var cartographic = Cesium.Cartographic.fromCartesian(tileset.boundingSphere.center);
	var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
	var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
	var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
	tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
	tileset.show = true;
}

if(typeof tileset != "undefined" && typeof tileset.readyPromise != "undefined")
tileset.readyPromise.then(function() {
  setMeshHeight();
}).otherwise(function(error) {
  throw(error);
});

function toggleMesh()
{
	tileset.show = showMesh;
	showMesh = !showMesh;
}

var pageX = 0;
var pageY = 0;
var pickedObject = null;
var selectedPrimitive = null;
var selectedPrimitiveId = null;
var setInfobox = false;
newDebugging = false;
var handler = new Cesium.ScreenSpaceEventHandler(viewerDemoResiApp.scene.canvas);
window.lastClippingPlaneBuilding = null;
handler.setInputAction(function(click) {
	pickedObject = viewerDemoResiApp.scene.pick(click.position);
	lastPickX = click.position.x;
	lastPickY = click.position.y;
	if(newDebugging == true)
		$(".filterMessage").append("<br />"+pickedObject.id);
	//console.log(pickedObject.id);
	console.log(pickedObject);
	skipColoring = false;
	if(typeof pickedObject != "undefined" && typeof pickedObject.id != "undefined" && typeof pickedObject.id._id != "undefined")
	{
		if(pickedObject.id._id.indexOf("submarketFogHighlight") >= 0)//Skip Submarket fog click event
		{
			skipColoring = true;
			window.pickedPrimitiveId = null;
		}
		if(pickedObject.id._id.indexOf("bldg") >= 0)//Skip Submarket fog click event
		{
			skipColoring = true;
			window.pickedPrimitiveId = null;
		}

	}
	if(!skipColoring && typeof pickedObject != "undefined")
	{
		var tempId = null;
		console.log(window.pickedObject);
		var temp = null;
		if(typeof window.pickedObject!= "undefined" && typeof window.pickedObject.id != "undefined" && typeof window.pickedObject.id.id  == "undefined")
		{
			temp= window.pickedObject.id.split("-");
			tempId = window.pickedObject.id;
		}
		else if(typeof window.pickedObject.id != "undefined" && typeof window.pickedObject.id.id != "undefined")
		{
			temp = window.pickedObject.id.id.split("-");
			tempId = window.pickedObject.id.id;
			//alert("id "+window.pickedObject.id.id);
		}
		//console.log(temp);
		//console.log("temp[0] "+temp[0]);
		//console.log("temp[1] "+temp[1]);
		//console.log(tempId);

		if(temp != null && typeof temp[0] != "undefined")
		{
			setInfobox = false;
			//resetLastSelectedPrimitive();
			//var temp = window.pickedObject.id.id.split("-");
			switch(temp[0])
			{
				case "buildingHighlight":
					console.log("Maybe Building");
					var bldgId = pickedObject.id._id.replace("buildingHighlight-", "");
					setInfobox = true;
					selectBuildingForPresentation(bldgId);
				break;
				case "condo":
					var condoId = pickedObject.id.replace("condo-", "").split("-");
					setInfobox = true;
					console.log(condoId);
				break;
				case "nycConstruction":
					console.log("In nycConstruction");
					setInfobox = true;
					resetPartialColor();
					resetLastSelectedPrimitive();
					window.lastBuildingId = tempId;
					window.lastBuildingColor = window.pickedObject.id.polygon.material.color;
					if(typeof window.pickedObject.primitive != "undefined")
					{
						window.selectedPrimitive = window.pickedObject.primitive;
					}
					window.selectedPrimitiveId = tempId;
					if(isMobile.any() == null)
					{
						//alert("mobile " + isMobile.any());
						$(".descHeaderText").html(window.pickedObject.id.buildingName);
					}
					changeSelectionColor(tempId, window.buildingHighlightSelectionColor);
					prepareInfoboxForNYCConstruction(temp[1], temp[2]);
				break;
				case "newDevelopment":
				setInfobox = true;
						console.log(tempId);
						console.log(temp);
						resetLastSelectedPrimitive();
						window.selectedPrimitiveId = tempId;
						window.lastBuildingId = tempId;
						//window.lastColor = window.pickedObject.id.polygon.material.color;
						changeSelectionColor(tempId, window.buildingHighlightSelectionColor);
						prepareNewDevelopmentInfobox(temp[1]);
				break;		

			}
		}
		/*
		if(typeof pickedObject != "undefined" && typeof pickedObject.id != "undefined")
		{
			if(typeof pickedObject.id._id != "undefined")
			{
				console.log("Maybe Building");
				if(pickedObject.id._id.indexOf("buildingHighlight-") >= 0)
				{
					var bldgId = pickedObject.id._id.replace("buildingHighlight-", "");
					selectBuildingForPresentation(bldgId);
				}
			}
			else if(pickedObject.id.indexOf("condo-") >= 0)
			{
				var condoId = pickedObject.id.replace("condo-", "").split("-");
				console.log(condoId);
			}
		}
		*/
		if( !setInfobox ) {
			if (Cesium.defined(pickedObject) && Cesium.defined(pickedObject.primitive) && Cesium.defined(pickedObject.id) && Cesium.defined(pickedObject.primitive.getGeometryInstanceAttributes))
			{
				console.log("Coloring Partial");
				if(selectedPrimitive != null)
				{
					resetPartialColor();
					resetLastSelectedPrimitive();
				}
				if(window.clippingFeatureActive && typeof pickedObject.id.split != "undefined")
				{
					temp = pickedObject.id.split("-");
					console.log( window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].unit, window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].number, window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding );
					
					console.log(" Data Log "+parseInt(window.lastClippingPlaneBuilding)+" == "+parseInt(window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding));
					if(window.lastClippingPlaneBuilding == null || window.lastClippingPlaneBuilding == window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding)
					{
						window.lastClippingPlaneBuilding = window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding;
						setClickedClippingPlaneResiRental( window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].unit, window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].number, window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding );
					}
					else
					{
						window.lastClippingPlaneBuilding = window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding;
						clearClippingPlane();
						if(typeof window.buildingClippingPlanes[window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding] != "undefined")
						{
							initiateClippingPlane(window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding, window.buildingClippingPlanes[window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding]);
							setClickedClippingPlaneResiRental( window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].unit, window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].number, window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding );
						}
						else
						{
							window.clippingFeatureActive = false;//Clicked NonClipping building
						}
					}
				}
				else
				{
					window.pickedPrimitiveId = pickedObject.id;
				}
				
				selectedPrimitiveId = pickedObject.id;
				selectedPrimitive = pickedObject.primitive;
				window.lastSelectedUnitPrimitive = pickedObject;
				if(typeof selectedPrimitiveId != 'object')
				{
					
					console.log("selectedPrimitiveId : "+ selectedPrimitiveId);
					if(selectedPrimitiveId.split("-")[0] == "resirental")
					{
						//createResiRentalBorderBottomAndUp(selectedPrimitiveId.split("-")[1]);
					
						attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
						currentColor = attributes.color;
						window.lastColor = attributes.color;
						currentShow = attributes.show;
						if (!viewerDemoResiApp.scene.invertClassification) {
							if(window.visualizationType != null)
							{
								attributes.color = [currentColor[0], currentColor[1], currentColor[2], 127];
							}
							else
							{
								attributes.color = [255, 0, 0, 127];
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
				else
				{
					console.log("Maybe Selecting Floating Line: "+selectedPrimitive);
					if(typeof pickedObject.id != "undefined" && typeof pickedObject.id._id != "undefined")
					{
						temp = pickedObject.id._id.split("-");
						if(temp[0] == "clipHandle")
						{
							//viewImageInModal(0, window.apiBaseUrl+row.file_path, 100, 100, 'Floor Plan');
						}
						else
						{
							selectedRetal = window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]];
							if(typeof selectedRetal != "undefined")
							{
								console.log("selectedRetal for left click");
								console.log(selectedRetal);
								console.log(selectedRetal.idtresirentals);
								window.lastClippingPlaneBuilding = window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding;
								setClickedClippingPlaneResiRental( window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].unit, window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].number, window.resiRentalAllData[window.resiRentalAllDataMap[temp[1]]].idtbuilding );
								
								prepareCondoInformation(selectedRetal.idtresirentals);
								
								preparePropSeeTabInformation(selectedRetalG.idtbuilding, selectedRetalG.number, selectedRetalG.unit);	
							}
						}
					}
				}
			}
			else
			{
				console.log("Reset Partial Color");
				resetCondoInformation();
				resetPartialColor();
			}
		}
	}
	
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

//Double Click
handler.setInputAction(function(click) {
	console.log("Dobule Click!!!");
	pickedObject = viewerDemoResiApp.scene.pick(click.position);
	
	if(typeof pickedObject != "undefined")
	{
		var tempId = null;
		console.log(window.pickedObject);
		var temp = null;
		if(typeof window.pickedObject!= "undefined" && typeof window.pickedObject.id != "undefined" && typeof window.pickedObject.id.id  == "undefined")
		{
			temp= window.pickedObject.id.split("-");
			tempId = window.pickedObject.id;
		}
		else if(typeof window.pickedObject.id != "undefined" && typeof window.pickedObject.id.id != "undefined")
		{
			temp = window.pickedObject.id.id.split("-");
			tempId = window.pickedObject.id.id;
			//alert("id "+window.pickedObject.id.id);
		}
		
		selectedPrimitiveId = pickedObject.id;
		selectedPrimitive = pickedObject.primitive;
		window.lastSelectedUnitPrimitive = pickedObject;
		if(typeof selectedPrimitiveId != 'object')
		{
			if(selectedPrimitiveId.split("-")[0] == "resirental")
			{
				flyToIdtcamera(selectedRetalG.idtcamera);
			}
		}
	}
	
}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

viewerDemoResiApp.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

var handler2 = new Cesium.ScreenSpaceEventHandler(viewerDemoResiApp.scene.canvas);
handler2.setInputAction(function(click) {
	
	pickedObject = viewerDemoResiApp.scene.pick(click.position);
	console.log("Double Click Event");
	console.log(pickedObject);
	if(typeof pickedObject.id != "undefined" && typeof pickedObject.id._id != "undefined" && typeof pickedObject.id._id.split != "undefined")
	{
		temp = pickedObject.id._id.split("-");
		setCameraFacingDown(temp[1], 3);
		
		selectedPrimitiveId = null;
		selectedPrimitive = null;
		pickedPrimitiveId = null;
	}
	
}, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

function resetPartialColor()
{
	if(selectedPrimitive != null)
	{
		var attributes = selectedPrimitive.getGeometryInstanceAttributes(selectedPrimitiveId);
		if(typeof attributes != "undefined")
		{
			currentColor = attributes.color;
			currentShow = attributes.show;
			console.log("currentColor");
			console.log(currentColor);
			if(typeof currentColor != "undefined" && typeof currentColor[0] != "undefined")
			{
				if (!viewerDemoResiApp.scene.invertClassification) {
					attributes.color = [currentColor[0], currentColor[1], currentColor[2], 255];
				}
			}
			attributes.show = [1];
		}
	}
	selectedPrimitive = null;
	selectedPrimitiveId = null;
	console.log("Resetting Partial Color");
}

function resetLastSelectedPrimitive()
{
	if(window.lastColor == null || typeof window.lastColor == 'undefined')
		return "";
	$(".vio-stat-legend-elements").removeClass("violationLegendSelected");
	console.log("Reset window.selectedPrimitive");
	console.log(window.selectedPrimitive);

	if(window.selectedPrimitive != null)
	{
		if(isMobile.any() == null)
		{
			var t = window.selectedPrimitiveId.split("-");
			console.log(t);
			console.log(window.lastColor);
			console.log("window.lastColor");
			
			if(typeof viewerDemoResiApp.entities.getById(window.lastBuildingId) != "undefined"){
				viewerDemoResiApp.entities.getById(window.lastBuildingId).polygon.material.color = window.lastColor;
				window.lastBuildingId = null;
			}

			if(typeof viewerDemoResiApp.entities.getById(window.selectedPrimitiveId) != "undefined")
				viewerDemoResiApp.entities.getById(window.selectedPrimitiveId).polygon.material.color = window.lastColor;
		}
		else
		{
			var attributes = window.selectedPrimitive.getGeometryInstanceAttributes(window.selectedPrimitiveId);
			if(typeof attributes != "undefined")
			{
				if(window.lastColor != "")
				{
					attributes.color = window.lastColor;
					attributes.show = [1];
				}
			}
		}
	} 
	else if(window.selectedPrimitiveId != null || window.lastBuildingId != null ) {   // This case is required to reset the building color in case the building was highlighted through code.
		console.log('building condition reset');
		console.log( window.lastBuildingId);
		if(typeof viewerDemoResiApp.entities.getById(window.lastBuildingId) != "undefined" && typeof viewerDemoResiApp.entities.getById(window.lastBuildingId).polygon != "undefined" && window.lastBuildingColor != "")
			viewerDemoResiApp.entities.getById(window.lastBuildingId).polygon.material.color = window.lastBuildingColor;
		window.lastBuildingId = null;
	}
	window.selectedPrimitive = null;
	window.selectedPrimitiveId = null;
}

var handler2 = new Cesium.ScreenSpaceEventHandler(viewerDemoResiApp.scene.canvas);
handler2.setInputAction(function(click) {
	console.log("LEFT_DOWN");
	window.getSelection().removeAllRanges();
	//alert(window.getSelection());
}, Cesium.ScreenSpaceEventType.LEFT_DOWN);

var handler2 = new Cesium.ScreenSpaceEventHandler(viewerDemoResiApp.scene.canvas);
handler2.setInputAction(function(click) {
	console.log("LEFT UP");
	window.getSelection().removeAllRanges();
	//alert(window.getSelection());
}, Cesium.ScreenSpaceEventType.LEFT_UP);
