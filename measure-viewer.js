
function SetInitialHeight(tileset, height) {
  var cartographic = Cesium.Cartographic.fromCartesian(
    tileset.boundingSphere.center
  );
  var surface = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    0.0
  );
  var offset = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    height
  );
  var translation = Cesium.Cartesian3.subtract(
    offset,
    surface,
    new Cesium.Cartesian3()
  );
  tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
}

function GetlonlatheightfromCartesian(cartesian) {
  var ellipsoid = viewer.scene.globe.ellipsoid;
  var cartographic = ellipsoid.cartesianToCartographic(cartesian);
  var lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
  var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
  var height = cartographic.height.toFixed(3);
  return { lon: lon, lat: lat, height: height };
}
function ToggleMeasurementPanel(forceOff = false) {
  if (IsEnableMeasurementPanel || forceOff) {
    IsEnableMeasurementPanel = false;
    $("#measurementToolbar").css("display", "none");
    ClearMeasurement();
    MeasurementMode = "";
    $(".measurementButton").removeClass("active").addClass("inactive");
  } else {
    IsEnableMeasurementPanel = true;
    $("#measurementToolbar").css("display", "flex");
  }
}
function ClearMeasurement() {
  RemoveSlopeEntities();
  RemoveLabelEntity();
  RemoveEntitiesByType(vrdistancelines);
  RemoveEntitiesByType(hrdistancelines);
  RemoveEntitiesByType(altentities);
  altentities = [];
  vrdistancelines = [];
  hrdistancelines = [];
  RemoveEntitiesByType(areaPolygon);
  areaPolygon = [];
  RemoveEntitiesByType(polylinedistancelines);
  polylinedistancelines = [];
  RemoveEntitiesByType(polylineEntity);
  var entities = viewer.entities._entities._array;
  entities.forEach((entity) => {
    if (entity.name == "markerPin") {
      viewer.entities.remove(entity);
    }
  });
  RefreshMeasurementLabel();
}
function RemoveEntitiesByType(entities) {
  for (var i = 0; i < entities.length; i++) {
    var entity = entities[i];
    viewer.entities.remove(entity);
  }
}
function RemoveLabelEntity() {
  labelEntities.forEach((entity) => {
    viewer.entities.remove(entity);
  });
}
function RefreshMeasurementLabel() {
  viewer.entities.remove(AreaMeasureEntity);
  viewer.entities.remove(HrMeasureEntity);
  viewer.entities.remove(VrMeasureEntity);
  viewer.entities.remove(PolylineMeasureEntity);
  HrMeasureEntity = viewer.entities.add({
    name: "hrmeasurementlbl",
    label: {
      show: false,
      showBackground: true,
      font: "14px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-10, -7),
    },
  });
  VrMeasureEntity = viewer.entities.add({
    name: "vrmeasurementlbl",
    label: {
      show: false,
      showBackground: true,
      font: "14px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-10, -7),
    },
  });
  PolylineMeasureEntity = viewer.entities.add({
    name: "polylinemeasurementlbl",
    label: {
      show: false,
      showBackground: true,
      font: "14px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-50, -7),
    },
  });
  AreaMeasureEntity = viewer.entities.add({
    name: "areameasurementlbl",
    label: {
      show: false,
      showBackground: true,
      font: "14px monospace",
      horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      pixelOffset: new Cesium.Cartesian2(-10, -7),
    },
  });
}
function GetPositionWithExtraHeight(positiondata) {
  var updatePos = [];
  positiondata.forEach((position) => {
    updatePos.push(
      new Cesium.Cartesian3(
        position.x + 0.1,
        position.y + 0.1,
        position.z + 0.1
      )
    );
  });
  return updatePos;
}
function GetlonlatheightfromCartesian(cartesian) {
  var ellipsoid = viewer.scene.globe.ellipsoid;
  var cartographic = ellipsoid.cartesianToCartographic(cartesian);
  var lon = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);
  var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
  var height = cartographic.height.toFixed(3);
  return { lon: lon, lat: lat, height: height };
}
function GetCenterOfPoints(point1, point2) {
  var x = (point1.x + point2.x) / 2;
  var y = (point1.y + point2.y) / 2;
  var z = (point1.z + point2.z) / 2;
  return new Cesium.Cartesian3(x, y, z);
}
function GetHorizontalDistance(point1, point2) {
  geodesic.setEndPoints(point1, point2);
  var meters = geodesic.surfaceDistance.toFixed(3);
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + " km";
  }
  return Number(meters).toFixed(3) + " m";
}

function GetVerticalDistance(point1, point2) {
  var heights = [point1.height, point2.height];
  var meters = Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
  if (meters >= 1000) {
    return (meters / 1000).toFixed(2) + " km";
  }
  return Number(meters).toFixed(3) + " m";
}
function GetPolygonAreaUsingTurf(points) {
  var AreaPoints = [];
  $.each(points, function (index, point) {
    AreaPoints.push(CartesianToLatlon(point));
  });
  var geojson = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [],
    },
    properties: null,
  };

  for (var i = 0; i < AreaPoints.length; i++) {
    var point = AreaPoints[i];
    geojson.geometry.coordinates.push([point.lon, point.lat]);
  }

  geojson.geometry.coordinates.push([AreaPoints[0].lon, AreaPoints[0].lat]);
  var polygon = turf.polygon([geojson.geometry.coordinates]);
  var area = turf.area(polygon);

  return area;
}
function GetCenterUsingTurf(points) {
  var AreaPoints = [];
  $.each(points, function (index, point) {
    AreaPoints.push(CartesianToLatlon(point));
  });
  var tempArr = [];
  for (var i = 0; i < AreaPoints.length; i++) {
    var point = AreaPoints[i];
    tempArr.push([parseFloat(point.lon), parseFloat(point.lat)]);
  }
  var features = turf.points(tempArr);
  var center = turf.center(features);

  return center;
}
function CartesianToLatlon(cartesian) {
  var ellipsoid = viewer.scene.globe.ellipsoid;
  var cartographic = ellipsoid.cartesianToCartographic(cartesian);
  var longitudeString = Cesium.Math.toDegrees(cartographic.longitude).toFixed(
    8
  );
  var latitudeString = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);
  var heightString = cartographic.height.toFixed(3);

  return { lon: longitudeString, lat: latitudeString, height: heightString };
}
function getMidpoint(point1, point2, height) {
  var scratch = new Cesium.Cartographic();
  geodesic.setEndPoints(point1.cartographic, point2.cartographic);
  var midpointCartographic = geodesic.interpolateUsingFraction(0.5, scratch);
  return Cesium.Cartesian3.fromRadians(
    midpointCartographic.longitude,
    midpointCartographic.latitude,
    height
  );
}

function createPoint(worldPosition) {
  var latlongObj = GetlonlatheightfromCartesian(worldPosition);
  point = viewer.entities.add({
    name: MeasurementMode,
    position: Cesium.Cartesian3.fromDegrees(
      parseFloat(latlongObj.lon),
      parseFloat(latlongObj.lat),
      parseFloat(latlongObj.height)
    ),
    point: {
      color: Cesium.Color.YELLOW,
      pixelSize: 10,
      heightReference: Cesium.HeightReference.NONE,
    },
  });
  PushIntoEntityContainer(point);
  return point;
}
function drawShape(positionData) {
  var shape;
  if (MeasurementMode === "hrLine") {
    shape = viewer.entities.add({
      polyline: {
        positions: positionData,
        width: 3,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.YELLOW),
        depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      },
    });
    hrdistancelines.push(shape);
  } else if (MeasurementMode === "vrLine") {
    shape = viewer.entities.add({
      polyline: {
        positions: positionData,
        width: 3,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.YELLOW),
        depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      },
    });
    vrdistancelines.push(shape);
  } else if (MeasurementMode === "polyline") {
    shape = viewer.entities.add({
      polyline: {
        positions: positionData,
        width: 3,
        material: new Cesium.ColorMaterialProperty(Cesium.Color.YELLOW),
        depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
          color: Cesium.Color.YELLOW,
        }),
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
      },
    });
    polylinedistancelines.push(shape);
  } else if (MeasurementMode == "area") {
    shape = viewer.entities.add({
      name: MeasurementMode,
      polygon: {
        hierarchy: positionData,
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.YELLOW.withAlpha(0.7)
        ),
        //perPositionHeight: true,
      },
    });
    areaPolygon.push(shape);
  } else if (MeasurementMode == "volume") {
    shape = viewer.entities.add({
      name: MeasurementMode,
      polygon: {
        hierarchy: positionData,
        material: new Cesium.ColorMaterialProperty(
          Cesium.Color.YELLOW.withAlpha(0.7)
        ),
        //perPositionHeight: true,
      },
    });
    volumePolygon.push(shape);
  }
  return shape;
}
function PushIntoEntityContainer(point) {
  var mode = MeasurementMode;
  switch (mode) {
    case "vrLine":
      vrdistancelines.push(point);
      break;
    case "hrLine":
      hrdistancelines.push(point);
      break;
    case "polyline":
      polylinedistancelines.push(point);
      break;
    case "area":
      areaPolygon.push(point);
      break;
    case "slope":
      slopePoint.push(point);
      break;
  }
}
async function terminateShape() {
  if (MeasurementMode == "area") {
    areaClickCount = 0;
    var area = GetPolygonAreaUsingTurf(activeShapePoints);
    var center = GetCenterUsingTurf(activeShapePoints);
    AreaMeasureEntity.position = Cesium.Cartesian3.fromDegrees(
      parseFloat(center.geometry.coordinates[0]),
      parseFloat(center.geometry.coordinates[1]),
      parseFloat(areastartingPoint.height)
    );
    AreaMeasureEntity.label.show = true;
    AreaMeasureEntity.label.text = area.toFixed(3) + " ㎡";
  } else if (MeasurementMode == "polyline") {
    polylineClickCount = 0;
    PolylineMeasureEntity.label.show = true;
    PolylineMeasureEntity.label.text = polylineDistance.toFixed(3) + " m";
  }
  if (MeasurementMode == "area") {
    drawShape(GetPositionWithExtraHeight(activeShapePoints));
  } else {
    drawShape(activeShapePoints);
  }
  activeShapePoints.pop();
  viewer.entities.remove(floatingPoint);
  viewer.entities.remove(activeShape);
  floatingPoint = undefined;
  activeShape = undefined;
  activeShapePoints = [];
}
function updateSlopeMeasurement(floatingPoint, newPosition) {
  var point1 = tempPoints.add({
    position: new Cesium.Cartesian3(
      floatingPoint.x,
      floatingPoint.y,
      floatingPoint.z
    ),
    color: LINEPOINTCOLOR,
  });
  var point2 = tempPoints.add({
    position: new Cesium.Cartesian3(
      newPosition.x,
      newPosition.y,
      newPosition.z
    ),
    color: LINEPOINTCOLOR,
  });
  point1GeoPosition = Cesium.Cartographic.fromCartesian(floatingPoint);
  point2GeoPosition = Cesium.Cartographic.fromCartesian(newPosition);
  point3GeoPosition = Cesium.Cartographic.fromCartesian(
    new Cesium.Cartesian3(newPosition.x, newPosition.y, newPosition.z)
  );

  var pl1Positions = [
    new Cesium.Cartesian3.fromRadians(
      point1GeoPosition.longitude,
      point1GeoPosition.latitude,
      point1GeoPosition.height
    ),
    new Cesium.Cartesian3.fromRadians(
      point2GeoPosition.longitude,
      point2GeoPosition.latitude,
      point2GeoPosition.height
    ),
  ];
  var pl2Positions = [
    new Cesium.Cartesian3.fromRadians(
      point2GeoPosition.longitude,
      point2GeoPosition.latitude,
      point2GeoPosition.height
    ),
    new Cesium.Cartesian3.fromRadians(
      point2GeoPosition.longitude,
      point2GeoPosition.latitude,
      point1GeoPosition.height
    ),
  ];
  var pl3Positions = [
    new Cesium.Cartesian3.fromRadians(
      point1GeoPosition.longitude,
      point1GeoPosition.latitude,
      point1GeoPosition.height
    ),
    new Cesium.Cartesian3.fromRadians(
      point2GeoPosition.longitude,
      point2GeoPosition.latitude,
      point1GeoPosition.height
    ),
  ];

  polyline1 = temppolylines.add({
    show: true,
    positions: pl1Positions,
    width: 2,
    material: new Cesium.Material({
      fabric: {
        type: "Color",
        uniforms: {
          color: LINEPOINTCOLOR,
        },
      },
    }),
  });
  polyline2 = temppolylines.add({
    show: true,
    positions: pl2Positions,
    width: 2,
    material: new Cesium.Material({
      fabric: {
        type: "PolylineDash",
        uniforms: {
          color: LINEPOINTCOLOR,
        },
      },
    }),
  });
  polyline3 = temppolylines.add({
    show: true,
    positions: pl3Positions,
    width: 2,
    material: new Cesium.Material({
      fabric: {
        type: "PolylineDash",
        uniforms: {
          color: LINEPOINTCOLOR,
        },
      },
    }),
  });
  var labelZ;
  if (point2GeoPosition.height >= point1GeoPosition.height) {
    labelZ =
      point1GeoPosition.height +
      (point2GeoPosition.height - point1GeoPosition.height) / 2.0;
  } else {
    labelZ =
      point2GeoPosition.height +
      (point1GeoPosition.height - point2GeoPosition.height) / 2.0;
  }

  addDistanceLabel(point1, point2, labelZ);
}
function addDistanceLabel(point1, point2, height) {
  point1.cartographic = ellipsoid.cartesianToCartographic(point1.position);
  point2.cartographic = ellipsoid.cartesianToCartographic(point2.position);
  point1.longitude = parseFloat(Cesium.Math.toDegrees(point1.position.x));
  point1.latitude = parseFloat(Cesium.Math.toDegrees(point1.position.y));
  point2.longitude = parseFloat(Cesium.Math.toDegrees(point2.position.x));
  point2.latitude = parseFloat(Cesium.Math.toDegrees(point2.position.y));
  label.text = getHorizontalDistanceString(point1, point2);
  horizontalLabel = viewer.entities.add({
    position: getMidpoint(point1, point2, point1GeoPosition.height),
    label: label,
  });
  label.text = getDistanceString(point1, point2);
  distanceLabel = viewer.entities.add({
    position: getMidpoint(point1, point2, height),
    label: label,
  });
  label.text = getVerticalDistanceString();
  verticalLabel = viewer.entities.add({
    position: getMidpoint(point2, point2, height),
    label: label,
  });

  var startPoint1stlonObj = GetlonlatheightfromCartesian(point1.position);
  var endPoint2stlonObj = GetlonlatheightfromCartesian(point2.position);
  var startPoint = Cesium.Cartesian3.fromDegrees(
    parseFloat(startPoint1stlonObj.lon),
    parseFloat(startPoint1stlonObj.lat),
    parseFloat(startPoint1stlonObj.height)
  );
  var endPoint = Cesium.Cartesian3.fromDegrees(
    parseFloat(endPoint2stlonObj.lon),
    parseFloat(endPoint2stlonObj.lat),
    parseFloat(endPoint2stlonObj.height)
  );
  label.text = GetAngle(startPoint, endPoint, false);
  (label.horizontalOrigin = Cesium.HorizontalOrigin.LEFT),
    (label.verticalOrigin = Cesium.VerticalOrigin.BOTTOM),
    (label.pixelOffset = new Cesium.Cartesian2(2, 0)),
    (firstPointAngleLabel = viewer.entities.add({
      position: startPoint,
      label: label,
    }));

  label.text = GetAngle(startPoint, endPoint, true);
  (label.horizontalOrigin = Cesium.HorizontalOrigin.LEFT),
    (label.verticalOrigin = Cesium.VerticalOrigin.BOTTOM),
    (label.pixelOffset = new Cesium.Cartesian2(2, 0)),
    (secondPointAngleLabel = viewer.entities.add({
      position: endPoint,
      label: label,
    }));
}
function getDistanceString(point1, point2) {
  geodesic.setEndPoints(point1.cartographic, point2.cartographic);
  var horizontalMeters = geodesic.surfaceDistance.toFixed(3);
  var heights = [point1GeoPosition.height, point2GeoPosition.height];
  var verticalMeters =
    Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
  var meters = Math.pow(
    Math.pow(horizontalMeters, 2) + Math.pow(verticalMeters, 2),
    0.5
  );

  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + "km";
  }
  return meters.toFixed(3) + "m";
}
function getHorizontalDistanceString(point1, point2) {
  geodesic.setEndPoints(point1.cartographic, point2.cartographic);
  var meters = geodesic.surfaceDistance.toFixed(3);
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + "km";
  }
  return Number(meters).toFixed(3) + "m";
}

function getVerticalDistanceString() {
  var heights = [point1GeoPosition.height, point2GeoPosition.height];
  var meters = Math.max.apply(Math, heights) - Math.min.apply(Math, heights);
  if (meters >= 1000) {
    return (meters / 1000).toFixed(1) + "km";
  }
  return Number(meters).toFixed(3) + "m";
}
function RemoveSlopeEntities() {
  points.removeAll();
  polylines.removeAll();
  viewer.entities.remove(distanceLabel);
  viewer.entities.remove(horizontalLabel);
  viewer.entities.remove(verticalLabel);
  viewer.entities.remove(firstPointAngleLabel);
  viewer.entities.remove(secondPointAngleLabel);
  tempPoints.removeAll();
  temppolylines.removeAll();
}
function GetAngle(startPoint, endPoint, oppositeAngle) {
  // Obtain vector by taking difference of the end points.
  var difference = Cesium.Cartesian3.subtract(
    endPoint,
    startPoint,
    new Cesium.Cartesian3()
  );
  difference = Cesium.Cartesian3.normalize(difference, new Cesium.Cartesian3());

  // Obtain surface normal by normalizing the starting point position.
  var surfaceNormal = Cesium.Cartesian3.normalize(
    startPoint,
    new Cesium.Cartesian3()
  );

  // Take the dot product of your given vector and the surface normal.
  var dotProduct = Cesium.Cartesian3.dot(difference, surfaceNormal);

  // Arcos the result.
  var angle;
  var acos = Math.acos(dotProduct) * Cesium.Math.DEGREES_PER_RADIAN;
  if (acos < 0) {
    angle = 90 + acos;
  } else if (acos < 90) {
    angle = 90 - acos;
  } else {
    angle = acos - 90;
  }

  if (oppositeAngle) {
    angle = (90 - angle).toFixed(3) + "°";
  } else {
    angle = angle.toFixed(3) + "°";
  }
  return angle;
}

///Rotation
var autoRotate = false;
function ToggleCameraRotation() {
  if (autoRotate) {
    autoRotate = false;
    StopCameraRotation();
    camera.defaultZoomAmount = 200.0;
    $("#rotate").html(
      '<i class="fa fa-play-circle fa-2x controllerIconLast"></i>'
    );
  } else {
    autoRotate = true;
    camera.defaultZoomAmount = 10;
    CameraRotation();
    $("#rotate").html(
      '<i class="fa fa-pause-circle fa-2x controllerIconLast"></i>'
    );
  }
}

function SpinCameraForSubmarket(idtsub)
{
	if(idtsub == "" || idtsub == 0)
		idtsub = $("#SpinSubmarketId").val();
	if(idtsub == "")
	{
		autoRotate = false;
		StopCameraRotation();
		camera.defaultZoomAmount = 200.0;
		$("#submarketSpinIcon").html('<i class="fa fa-play-circle controllerIconLast"></i>');
	}
	else
	{
		if(autoRotate)
		{
			autoRotate = false;
			StopCameraRotation();
			//camera.defaultZoomAmount = 200.0;
		}
		autoRotate = true;
		camera.defaultZoomAmount = 10;
		var centroidCoords = getCentroid(eval("["+submarketDetails[idtsub].coordsToUse+"]"));
		if(typeof centroidCoords[1] == "undefined")
		{
			alert("Centroid calc");
		}
		else
		{
			currentPosition = Cesium.Cartesian3.fromDegrees(centroidCoords[0], centroidCoords[1], 100);//tileset.boundingSphere.center;
		}
		
		CameraRotation();
		$("#submarketSpinIcon").html('<i class="fa fa-pause-circle controllerIconLast" onClick=\"stopCameraForSubmarket();\"></i>');
	}
}

function stopCameraForSubmarket()
{
	autoRotate = false;
    StopCameraRotation();
    camera.defaultZoomAmount = 200.0;
    $("#submarketSpinIcon").html('<i class="fa fa-play-circle controllerIconLast" onClick="SpinCameraForSubmarket(0);"></i>');
}

//-74.00023177766907, 40.71406967840776
currentPosition = Cesium.Cartesian3.fromDegrees(-74.00023177766907, 40.71406967840776, 100);//tileset.boundingSphere.center;
window.currentCameraElevation = null;
function CameraRotation() {
  var cameraAggregator = new Cesium.CameraEventAggregator(viewerDemoResiApp.canvas);
  unsubscribe = viewerDemoResiApp.clock.onTick.addEventListener(() => {
    viewerDemoResiApp.screenSpaceEventHandler.setInputAction(function (amount) {
      amount =
        (Cesium.Math.sign(amount) *
          viewerDemoResiApp.scene.camera.positionCartographic.height) /
        Math.log(viewerDemoResiApp.scene.camera.positionCartographic.height);
		amount = 100;//SK 
      viewerDemoResiApp.scene.camera.zoomIn(amount);
      viewerDemoResiApp.scene.camera.zoomOut(amount);
    }, Cesium.ScreenSpaceEventType.WHEEL);
    let heading = camera.heading; //or any starting angle in radians
    let rotation = -1; //counter-clockwise; +1 would be clockwise
    camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
	if(window.currentCameraElevation == null)
	{
		elevation = Cesium.Cartesian3.distance(currentPosition, camera.position);
	}
	else
	{
		elevation = window.currentCameraElevation;
	}
    let pitch = viewerDemoResiApp.camera.pitch; //looking down at 15 degrees

    const SMOOTHNESS = 2120; //it would make one full circle in roughly 800 frames
    var rightDrag = cameraAggregator.isButtonDown(
      Cesium.CameraEventType.RIGHT_DRAG
    );
    var leftDrag = cameraAggregator.isButtonDown(
      Cesium.CameraEventType.LEFT_DRAG
    );
    /* if (leftDrag) {
      RotateLeft();
    } else if (rightDrag) {
      RotateRight();
    } */
    heading += (rotation * Math.PI) / SMOOTHNESS;
    viewerDemoResiApp.camera.lookAt(
      currentPosition,
      new Cesium.HeadingPitchRange(heading, pitch, elevation)
    );
  });
}

function StopCameraRotation() {
	window.currentCameraElevation = null;
	if(typeof unsubscribe != "undefined")
	{
		unsubscribe();
	}
}




