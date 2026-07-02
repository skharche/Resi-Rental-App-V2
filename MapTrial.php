
<?php
date_default_timezone_set("US/Eastern");
$ESTTimezoneDate = date("F d, Y h:i:s");
//echo "<br /><br />".time();
$readyForDebug = 0;


session_start();
if(isset($_SESSION))
{
	//echo "<pre>";print_r($_SESSION);exit;
	if(isset($_SESSION["userData"]["sessionId"]))
	{
		//All Goood
		if(!isset($_SESSION["app"]) || $_SESSION["app"] == "")
		{
			$_SESSION["app"] = "demo.ppt";
		}
		else
		{
			if($_SESSION["app"] != "demo.ppt")
			{
				$_SESSION["app"] = "";
				unset($_SESSION["app"]);
				session_destroy();
				header("location:login.php?msg=Please login!");
			}
			else
			{
				//Good
			}
		}
	}
	else
	{
		header("location:login.php?msg=Please login!");
	}
}
else
{
	header("location:login.php?msg=Please login!");
}

include_once(__DIR__."/../admin/classes/tattachments.php");
$objAttachments = new tattachments();
$userProfile = $objAttachments->find( $_SESSION["userData"]["id"], "userProfile", 1);
$userProfileImage = "img/user-male-icon.png";
if(isset($userProfile[0]))
{
	$userProfileImage = "../admin/".str_replace("attachments", "attachments/thumbnail", $userProfile[0]["path"]);
}

?>
<!DOCTYPE html>
<html lang="en">
<head>
	<!-- Use correct character set. -->
	<meta charset="utf-8">
	<!-- Tell IE to use the latest, best version. -->
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<!-- Make the application on mobile take up the full browser screen and disable user scaling. -->
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">
	<title>Trial</title>
	
	<!-- Font Awesome -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css">
	<!-- Ionicons -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">
	<link rel="stylesheet" href="resiApp.css">
	<link rel="stylesheet" href="carousel.css">
	<script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
	<script src="../CesiumCDN/empty-tile-zoom/Build/Cesium/Cesium.js"></script>
	<!-- For JSZip -->
	<script src="jszip/dist/jszip.min.js"></script>
	<script src="jszip-utils-master/dist/jszip-utils.min.js"></script>
	<script src="fogEffect.js"></script>
	<script src="resiRentalCameraSpin.js"></script>
	<link rel="stylesheet" href="../CesiumCDN/empty-tile-zoom/Build/Cesium/Widgets/widgets.css">
	
	<style>
	#cesiumContainer
	{
		width: 100%; height: 500px; margin: 0; padding: 0; overflow: hidden;
	}
	.cesium-viewer-timelineContainer{
		display:none;
	}
	
    canvas {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
        outline: none;
        -webkit-tap-highlight-color: rgba(255, 255, 255, 0); /* mobile webkit */
    }
	</style>
	
	<!-- Range Slider -->
	<link rel="stylesheet" href="https://propsee.city/admin/plugins/bootstrap-slider/slider.css">
	<link rel="stylesheet" href="https://propsee.city/admin/bootstrap/css/bootstrap.min.css">
	<link rel="stylesheet" href="https://propsee.city/admin/dist/css/AdminLTE.min.css">
	<link rel="stylesheet" href="sidebar.css">
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
	
	<!-- Google Icons -->
	<link href="https://fonts.googleapis.com/css2?family=Material+Icons" rel="stylesheet">
	
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
</head>
<body>
	<div id="cesiumContainerDemoResiApp"></div>
	<div class="modal fade hide" id="progressModal" data-backdrop="static" role="dialog">
		<div class="modal-dialog modal-dialogFull modal-lg">	
		  <!-- Modal content-->
		  <div class="modal-content modal-contentFull" style="background-color: transparent;">
			<div class="progress">
			  <div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar"
			  aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width:0%">
				0% Complete
			  </div>
			</div>
		</div>
	  </div>
	</div>
	
<div class="leftContentWindow box-body" id="actionForm">
  <div id="dismiss">
    <button style="width:43px !important;" class="btn btn-default "><i class="fa fa-chevron-left fa-2x" style="margin-left:-3px;"></i></button>
  </div>
  <div class="sidebar-header" align="center">
    <img src="img/PropSee_NEWYORK.jpg">
  </div>
	<table class="table table-striped">
		<tr>
			<td class="font-weight-bold font-13">City </td>
			<td class="font-13"><a href="javascript:void(0);" onClick="flyToMarket(1);">New York</a></td>
		</tr>
		<tr>
			<td class="font-weight-bold font-13">Submarket</td>
			<td>
				<select name="idtsubmarket" id="idtsubmarket" onChange="loadMinMaxPriceForSubmarket(this.value);" class="form-control-2">
					<option value="">-- Select --</option>
					  <option value="3">Financial District</option>
					  <option value="4">World Trade Center</option>
					  <option value="7">Tribeca</option>
					  <option value="6">City Hall</option>
					  <option value="5">Insurance District</option>
					  <option value="all">All</option>
				</select>
			</td>
		</tr>
    <tr>
			<td class="font-weight-bold font-13">Rental or Condo</td>
			<td>
				<select name="tbuildings" id="tbuildings" class="form-control-2" >
					<option value="">-- Select --</option>
					<option value="0">Rental Buildings</option>
					<option value="1">Condo Buildings</option>
					<option value="2">All</option>
				</select>
			</td>
		</tr>
    <tr>
			<td class="font-weight-bold font-13">Bedrooms</td>
			<td>
				<select name="runits" id="runits" class="form-control-2" >
					<option value="">-- Select --</option>
					<option value="0">Studio</option>
					<option value="1">1 Bed</option>
					<option value="2">2 Bed</option>
					<option value="3">3+ Bed</option>
					<option value="4">All</option>
				</select>
			</td>
		</tr>
		<!--tr>
			<td class="font-weight-bold font-13"><label for="amount">Rent</label></td>
			<td></td>
		</tr-->
		<tr>
			<td class="font-13" colspan="2">
				<span style="margin-left:37%"><b>Rent</b></span>
				<!--input type="text" size=8 id="priceFrom" /> - <input type="text" size=8 id="priceTo" /-->  
				<span class="rangeMinValue" style="float: left;">$0</span>
				<span class="rangeMaxValue" style="float: right;">$1200</span>
				
				<br clear="all">

				<input type="text" value="" id="priceSlider" class="slider form-control" data-slider-min="0" data-slider-max="1200" data-slider-step="500" data-slider-value="[0,1200]" data-slider-orientation="horizontal" data-slider-selection="before" data-slider-tooltip="hide" data-slider-id="grey">
				<div class="box-body hide">
				  <div class="row margin">
					<div class="col-sm-6">
					  <input id="range_1" type="text" name="range_1" value="">
					</div>
				  </div>
				  <div class="row">
				  </div>
				</div>
			</td>
		</tr>
		<tr>
			<td class="font-weight-bold font-13">Stylize</td>
			<td>
				<select class="form-control-2" id="visualizationType" onChange="toggleVisualization();">
					<option value="">Red Highlight</option>
					<option value="Bedrooms">Bedrooms</option>
					<option value="Monthly Rent">Rental Rate</option>
				</select>
				<!--input class="form-check-input" type="checkbox" value="" id="fogchecked" checked -->
				<!--i class="fa fa-toggle-off visualizationToggle pull-left fa-2x" aria-hidden="true" onClick="toggleVisualization();"></i-->
			</td>
		</tr>
		<tr>
			<td><button id="SearchButton" class="btn btn-primary btn-sm" disabled style="background-color:#B71C1C !important; border-color:#B71C1C !important; font-size: 14px; padding: 3px;" onClick="filterPresentationData();">&nbsp;Search&nbsp;&nbsp;<i class="fa fa-cog fa-spin hide" aria-hidden="true"></i></button></td>
			<td><span class="filterMessage boldText"></span></td>
		</tr>
		<tr>
			<td colspan="2">
				<table>
					<tr>
						<td>
							Fog
						</td>
						<td style="padding-left:5px;">
							<span class="fogSpanElement" style="color:black;opacity:0.4;"><i id="fogchecked" class="fa fa-toggle-off toggleSwitches toggleContainer2 pull-left fa-2x" aria-hidden="true" onClick="fogToggle();"></i></span>
						</td>
						
						<td style="padding-left:10px;">
							Submarkets
						</td>
						<td style="padding-left:5px;">
							<span class="submarketSpanElement" style="color:black;opacity:1;"><i id="fogchecked2" class="fa fa-toggle-off toggleSwitches toggleContainerSubmarket pull-left fa-2x" aria-hidden="true" onClick="toggleSubmarketWhiteBoundry();"></i></span>
						</td>
						
						<td style="padding-left:10px;">
							&nbsp;
						</td>
						<td style="padding-right:10px;">
							<button class="btn btn-default btn-xs spin1FeatureButton" style="font-size:14px;" onClick="downtownSpinFeature();"><span class="material-icons" style="vertical-align: middle; line-height: 0 !important; position: relative; top: -1px;">360</span></button>
						</td>
					</tr>
				</table>
			</td>
		</tr>
		<!--tr>
			<td class="font-weight-bold font-13">Fog</td>
			<td class="font-13">
				
			</td>
		</tr>
		<tr>
			<td class="font-weight-bold font-13">Submarkets</td>
			<td class="font-13">
				
			</td>
		</tr-->
		<tr>
			<td colspan="2">
				
			</td>
		</tr>
		
	</table>
	<!--div class="form-group">
	  <label for="exampleInputEmail1">View</label>
	  <input type="email" class="form-control" id="exampleInputEmail1" placeholder2="Enter email">
	</div-->
</div>
<button class="btn btn-default pullRightBtn " style="display:none;"><i class="pullRightButton fa fa-chevron-right fa-2x asCursor openSideBarButton" onclick="minimizeContentBox();" id="sidebarCollapse2"></i>&nbsp;</button>

<div class="legendContainer">
	<!--span class="legendElement">Studio</span>
	<span class="legendElement">1 Bed</span>
	<span class="legendElement">2 Bed</span>
	<span class="legendElement">3 Bed</span-->
</div>

<nav class="navbar" role="navigation">
  <div class="navbar-header" style="float:right;margin-top:35px;margin-right:-40px;">
	<div class="dropdown">
		<span class="userNameContainer"></span>
		<a href="javascript:toggleUserSection(false);" type="button" class="navbar-btn pull-right">
		  <img src="<?php echo $userProfileImage;?>" class="userProfileImage"/>
		</a>
		
		<ul class="dropdown-menu">
			<li><a href="#">HTML</a></li>
			<li><a href="#">CSS</a></li>
			<li><a href="#">JavaScript</a></li>
		  </ul>
	</div>
	<div class="userLoggedInInfo hide navbar" >
		<div class="userLoggedInInfoDetails" >
		
		</div>
		<span class="pull-left">
			<span id="pptProfilesContainer">
				
			</span>
			<br />
			<small class="text-red hide profileError"></small>
		</span>
		<div align='right'><button class='btn btn-primary btn-xs ' onClick="logoutApp();"><i class='fa fa-sign-out' ></i>&nbsp;Logout</button></div>
	</div>
  </div>
</nav>

<div class="leftContentWindow box-body" id="buildingQueue">
	<table class="table table-striped">
		<tr>
			<td class="font-weight-bold">Selection</td>
			<td class="buildingRow"></td>
		</tr>
		<tr>
			<td class="font-weight-bold">Property</td>
			<td class="propertyRow"></td>
		</tr>
		<tr>
			<td class="font-weight-bold">Units</td>
			<td>
				<div class="input-group-btn unitsContainer hide">
                  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown"><span class="unitsRow"></span> Units
                    <span class="fa fa-caret-down"></span></button>
                  <ul class="dropdown-menu unitsDropdownItems">
                   
                  </ul>
				  <span class="unitNameToShow"></span>
                </div>
			</td>
		</tr>
		<tr>
			<td colspan="2">
				<button class="btn btn-primary btn-sm" onClick="resetToFilter();"><i class="fa fa-filter" aria-hidden="true"></i>&nbsp;Back to Search</button>
				<button class="btn btn-primary btn-sm" onClick="resetToBuildingView();"><i class="fa fa-refresh" aria-hidden="true"></i>&nbsp;Reset View</button>
			</td>
		</tr>
	</table>
</div>

<!-- Trigger the modal with a button -->
<button type="button" class="hide btn btn-info modalButton btn-lg" data-toggle="modal" data-target="#imageModal">Open Modal</button>

<!-- Modal -->
<div id="imageModal" class="modal fade" role="dialog" style="z-index: 99999;">
  <div class="modal-dialog modal-lg">

  <!-- Modal content-->
  <div class="modal-content">
    <div class="modal-header" style="height:15px !important;">
    <!--button class="btn btn-primary btn-xs" onClick="previousImage();">Previous</button>&nbsp;&nbsp;&nbsp;
    <button class="btn btn-primary btn-xs" onClick="nextImage();">Next</button-->
    <button style="margin-top:-7px !important" type="button" class="close" data-dismiss="modal">&times;</button>
    </div>
    <div class="modal-body imageModalContainer">
    <div class="row" style="z-index: 1000; position: fixed; top: 45%; height: 80%;">
      <a href="javascript:void(0);" style="color: black !important;opacity: 0.5;"><i class="fa fa-4x fa-chevron-left" onClick="previousImage();" aria-hidden="true" style="z-index: 1000000;margin-top: 15%;"></i></a>
    </div>
      
    <div class="row" style="z-index: 1000; position: fixed; right: 1.8%; height: 80%; top: 45%;">
      <a href="javascript:void(0);" style="color: black !important;opacity: 0.5;"><i class="fa fa-4x pull-right fa-chevron-right" onClick="nextImage();" aria-hidden="true" style="margin-right: 0px !important; /* background-color: white; */ /* top: 50% !important; */ margin-top: 15%;"></i></a>
    </div>
    <div align="center" id="imageContainerBig" style="z-index: 10 !important;"></div>
    </div>
    <div class="modal-footer hide">
    <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
    </div>
  </div>

  </div>
</div>
<!-- Modal ends -->

<div class="rightContentWindow box-body" style="display:none;" id="submarketStatistics">
		<b><span class="submarketPlaceHolder">Submarket Statistics</span>
		<span class="pull-right"><a style="color:black;" href="javascript:closeStatistics();">CLOSE</a></span></b>
		<br />
		<span class="defaultStatistics">

		</span>
		<span class="advancedStatistics">
		</span>
</div>

<div id="bgDescription">
	<div class="descHeader"><span class="descHeaderText"></span><span class="descHeaderClose"><a href="javascript:closeDescription();" style="color:black;">CLOSE</a></span></div>
	<div class="bgDescriptionBody"></div>
</div>


<div class="rightContentWindow box-body" style="display:none;" id="submarketStats">
  <b><span class="subname">Available Rental Apartments Downtown</span><!--&nbsp;&nbsp;&nbsp;<span class="viewFromBuilding"></span-->
  <button id="BackToUnitButton" class="hide btn btn-primary btn-xs backButtonCSS" OnClick="goBackToPreviousUnit();">Back to Unit</button>
  <span class="pull-right" style="/*margin-top:-7px;margin-right:-7px;*/"><span class="material-icons" onClick="resetSubStats();" style="cursor: pointer;" >cancel_presentation</span></span>
  </b>
  
	<ul class="nav nav-pills customnavpills">
		<li class="active"><a data-toggle="tab" class="active" href="#summary" onClick="javascript:clearPlutoBuildingHighlight();visualizationAdjustment('summary');clearNYCConstructionData();">Summary</a></li>
		<li><a data-toggle="tab" href="#market" onClick="javascript:plutoBuildingHighlight();visualizationAdjustment('market');clearNYCConstructionData();" >Market</a></li>
		<li><a data-toggle="tab" href="#inventory" onClick="javascript:clearPlutoBuildingHighlight();visualizationAdjustment('inventory');clearNYCConstructionData();">Inventory</a></li>
		<li><a data-toggle="tab" href="#pricing" onClick="javascript:clearPlutoBuildingHighlight();visualizationAdjustment('pricing');clearNYCConstructionData();">Pricing</a></li>
		<li><a data-toggle="tab" href="#development" onClick="javascript:clearPlutoBuildingHighlight();visualizationAdjustment('development');highlightNYCConstructionData();">Development</a></li>	</ul>
	<div class="tab-content">
		<div align="center" id="summary" class="tab-pane fade in active">
			<div align="center" id="substatsinfo"></div>
		</div>
		<div align="center" id="market" class="tab-pane fade"></div>
		<div align="center" id="inventory" class="tab-pane fade"></div>
		<div align="center" id="pricing" class="tab-pane fade"></div>
		<div align="center" id="development" class="tab-pane fade"></div>
	</div>
  
</div>
<div class="rightContentWindow box-body" style="display:none;width:595px;" id="residetails">
  <b>
  <span class="buildingname"></span>&nbsp;&nbsp;&nbsp;<span class="viewFromBuilding"></span></b>&nbsp;<span class="gobackshowStats" style="/*margin-left:200px;*/"><button class="btn btn-primary btn-xs backButtonCSS" onClick="gobackshowStats();resetPartialColor();">Back to Summary</button></span>
  <span class="pull-right"><span class="material-icons" onClick="resetCondoInformation();" style="cursor: pointer;">cancel_presentation</span></span>
  </b>
  <ul class="nav nav-pills customnavpills">
  <li class="active">
    <a data-toggle="tab" class="active" href="#infotab" >Info</a>
  </li>
  <li>
    <a data-toggle="tab" href="#floorplantab">Floor Plan</a>
  </li>
  <li>
    <a data-toggle="tab" href="#unittab" >Unit</a>
  </li>
  <li>
    <a data-toggle="tab" href="#exteriortab" >Exterior</a>
  </li>
  <li>
    <a data-toggle="tab" href="#commonareastab">Common Areas</a>
  </li>
  <li>
    <a data-toggle="tab" href="#views" >Views</a>
  </li>
  <li>
    <a data-toggle="tab" href="#propsee" >PropSee</a>
  </li>
</ul>
<div class="tab-content">
  <div align="center" id="infotab" class="tab-pane fade in active">
    <table class="table" style="margin-bottom:-7px !important;">
      <tr><th>Unit</th><td><span id="unitresirental"></span></td><th>Floor</th><td><span id="tresifloor"></span></td></tr>
      <tr><th>Bedrooms</th><td><span id="tresibeds"></span></td><th>Bathrooms</th><td><span id="tresibaths"></span></td></tr>
      <tr><th>Monthly Rent</th><td><span id="tmrent"></span></td><th>Rent PSF</th><td><span id="tbuildingrentpsf"></span></td></tr>
      <tr><th>Area</th><td><span id="tresiinterior"></span></td><th>Building Type</th><td><span id="tbuildingtype"></span></td></tr>
      <tr><th>Year Built</th><td><span id="tyearbuilt"></span></td><th>Pre-War</th><td><span id="pre-war"></span></td></tr>
      <tr><th>Date Added</th><td><span id="tresidateadded"></span></td><th>Days on Market</th><td><span id="tdays"></span></td></tr>
    </table>
  </div>
  <div align="center" id="floorplantab" style="height:100%" class="tab-pane fade verticalScroll"><span class="imagesDisplayContainerFloorPlan"></span><span class="viewFloatingRings"></span><span class="otherUnitButtonContainer"></span></div>
  <div align="center" id="unittab" class="tab-pane fade verticalScroll"><span class="imagesDisplayContainerUnitPictures"></span></div>
  <div align="center" id="propsee" class="tab-pane fade verticalScroll">
	<ul class="nav nav-pills customnavpills">
		<li class="active"><a data-toggle="tab" href="#PROPSEE_PHYSICAL" class="PROPSEE_PHYSICAL">Physical</a></li>
		<li><a data-toggle="tab" href="#PROPSEE_AMENITIES" class="PROPSEE_AMENITIES">Amenities</a></li>
		
		<!--li><a data-toggle="tab" href="#PROPSEE_STACKPLAN" class="PROPSEE_STACKPLAN">Stack Plan</a></li-->
		<!--li><a data-toggle="tab" href="#PROPSEE_TENANTS" class="PROPSEE_TENANTS">Tenants</a></li-->
		<!--li><a data-toggle="tab" href="#PROPSEE_DEBT" class="PROPSEE_DEBT">Debt</a></li-->
		<!--li><a data-toggle="tab" href="#PROPSEE_FINANCIAL" class="PROPSEE_FINANCIAL">Financial</a></li-->
		<li><a data-toggle="tab" href="#PROPSEE_OWNERSHIP" class="PROPSEE_OWNERSHIP">Ownership</a></li>
		<li><a data-toggle="tab" href="#PROPSEE_CONTACT" class="PROPSEE_CONTACT">Contact</a></li>
		<!--li><a data-toggle="tab" href="#PROPSEE_GENERAL" class="PROPSEE_GENERAL">Misc</a></li-->
	</ul>
	<div class="tab-content">
		<!--div id="PROPSEE_GENERAL" class="tab-pane fade ">
			<table width='100%' class='table table-striped minPaddingtable'>
				<tr><th>Condo Plans</th><td class='plutoCondoPlans'></td></tr>
				<tr><th>Floor Plans</th><td class='plutoInfoFloorPlans'></td></tr>
				<tr><td><span class='isRentalsAvailable'></span></td><td><span class='isOfficeAvailable'></span></td></tr>
			</table>
		</div-->
		
		<!--div id="PROPSEE_FINANCIAL" class="tab-pane fade"> </div-->
		
		<!--div id="PROPSEE_STACKPLAN" class="tab-pane fade " align="center"> </div-->
		<!--div id="PROPSEE_DEBT" class="tab-pane fade "> </div-->
		<div id="PROPSEE_OWNERSHIP" class="tab-pane fade "> </div>
		<div id='PROPSEE_CONTACT' class='tab-pane fade'><br /> </div>

		<!--div id="PROPSEE_TENANTS" class="tab-pane fade ">
			<table width='100%' class='table table-striped minPaddingtable'>
			<tr><th width='30%'>&nbsp;</th><td>&nbsp;</td></tr>
			<tr><th width='30%'>Tenants</th><td class='plutoInfoTenants' width='70%'></td></tr>
			</table>
		</div-->
	
		<div id="PROPSEE_AMENITIES" class="tab-pane fade ">
		</div>
		
		<div id="PROPSEE_PHYSICAL" class="tab-pane fade in active" style="max-height:400px;overflow-y:scroll;">
		</div>
	</div>
  </div>
  <div align="center" id="exteriortab" class="tab-pane fade verticalScroll"><span class="imagesDisplayContainerExteriorView"></span></div>
  <div align="center" id="commonareastab" class="tab-pane fade verticalScroll"><span class="imagesDisplayContainerBuildingAreas"></span></div>
  <div align="left" id="views" class="tab-pane fade verticalScroll"><span class="viewsContainer" style="float:left;"></span></div>
</div>
</div>
	

<div id="buildingSelectionModal" class="modal fade" role="dialog">
  <div class="modal-dialog modal-md">
	<!-- Modal content-->
	<div class="modal-content">
	  <div class="modal-header">
		<button type="button" class="close" data-dismiss="modal">&times;</button>
		<h4 class="modal-title">Available Buildings</h4>
	  </div>
	  <div class="modal-body">
			<div>
				<button class="btn btn-sm btn-primary hide" onClick="showAllSearchFilters();">Show All</button>
				<div class="list-group buildingSelectionContainer">
				</div>
			</div>
	  </div>
	  <div class="modal-footer">
		<button type="button" class="btn btn-default" onClick="$('#buildingSelectionModal').modal('hide');" >Close</button>
	  </div>
	</div>
  </div>
</div>

<div id="imgHolder">
  <span class="propSeeLogo"><a target="_blank" href="https://www.propsee.city"><img src="./img/propsee-logo.png"/></a></span>
</div>

	<script>
		var apiBaseUrl = window.location.protocol+"//"+window.location.hostname+"/admin/";
		var sessionData = $.parseJSON('<?php echo json_encode($_SESSION["userData"]);?>');
		$(".userNameContainer").html(sessionData.first_name+"&nbsp;");
	</script>
	<script src="cameraCommon.js"></script>
	<script src="https://propsee.city/admin/plugins/bootstrap-slider/bootstrap-slider.js"></script>
	<script src="resiApp.js"></script>
	<!--script src="resiAppCesiumInit.js"></script-->
	
	<!--script src="resiApp.js"></script>
	<script src="resiAppCesiumInit.js"></script>
	<script src="resiRentalClipping.js"></script>
	<script src="resiAppDataLoading.js"></script>
	
	<script type="text/javascript" src="./measure-global.js"></script>
    <script type="text/javascript" src="./measure-initializer.js"></script>
    <script type="text/javascript" src="./measure-viewer.js"></script>
	<link href="./measure-viewer.css" rel="stylesheet">
    <script type="text/javascript" src="./cesium-viewshed.js"></script-->
	
	<script>
	//setTimeout(() => {
		
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

		Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OTIwM2E3Yi1lYTkwLTRiZTYtYmMxYS02NGRkMGYzYTIzMmIiLCJpZCI6MjY1LCJpYXQiOjE1MjE1NDUzNDR9.XIij-qDaBt2xTi-NrUs_PJkII6uo2v7MsAi9dC0fb30";

		var tileset = null;
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

		async function LoadTilesetNewVersion()
		{
			var tile2 = viewerDemoResiApp.scene.primitives.add(
			  await Cesium.Cesium3DTileset.fromIonAssetId(437161)
			);
			height = 30;
			var cartographic = Cesium.Cartographic.fromCartesian(tile2.boundingSphere.center);
			var surface = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, 0.0);
			var offset = Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, height);
			var translation = Cesium.Cartesian3.subtract(offset, surface, new Cesium.Cartesian3());
			tile2.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
			tile2.show = true;
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
		  console.log(error);
		  throw(error);
		});

		function toggleMesh()
		{
			tileset.show = showMesh;
			showMesh = !showMesh;
		}
		
		//createImageWithPolygon();
		function createImageWithPolygon()
		{
			viewerDemoResiApp.entities.removeById("clipHandle-TEST");
			viewerDemoResiApp.entities.add({
				id : "clipHandle-TEST",
				polygon : {
					hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray([-74.01350498508,40.709058663187,-74.01354250355,40.709017538008,-74.01354250355,40.709017538008,-74.01354250355,40.709017538008,-74.013768693847,40.709107285451,-74.013949157784,40.709192503185,-74.01394300689,40.709204822879,-74.013865292853,40.709368341575,-74.013858524908,40.709377253438,-74.013850668082,40.709385360059,-74.013837388395,40.709391873981,-74.013827121077,40.709392265526,-74.01381058999,40.709389152815,-74.013799528179,40.709384879391,-74.013754440758,40.709368614695,-74.013741080269,40.709387288472,-74.01342458798,40.709248826586,-74.013435937167,40.709231415451,-74.013412353152,40.709221525244,-74.01341753921066, 40.709207798326815, -74.01342222595291, 40.70919880797891, -74.01343029703555, 40.70918332365099, -74.01345323270706, 40.70913932560608, -74.01347422717707, 40.70909905049622,-74.01348347524038, 40.70908131024647,-74.013493747463,40.709063358918,-74.013497187661,40.709055975336,-74.01350498508,40.709058663187,-74.01350498508,40.709058663187])),
					/*material : Cesium.Color.WHITE,*/
					material: "../admin/uploads/residential/rentalFiles-1585591121-0.jpg",//'./rentalFiles-1591812762-0.jpg',
					rotation: 20,
					stRotation: 30,
					height: 100,
					extrudedHeight: 110,
				}
			});
		}
		
		showFloorPlanImage();
		function showFloorPlanImage()
		{
			viewerDemoResiApp.entities.removeById("clipHandle");
			viewerDemoResiApp.entities.add({
				id : "clipHandle",
				polygon : {
					hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray(eval([-74.0149990082259,40.70791280877567,-74.01501878025014,40.70791936529044,-74.01503893539837,40.70792630709011,-74.01505879792187,40.70793263332606,-74.01507909451674,40.707938603770245,-74.01509932984892,40.70794512853042,-74.0151184386297,40.7079510004067,-74.01513947353929,40.707953825022884,-74.01515783511249,40.707949370931004,-74.01517195694815,40.70793891956417,-74.01518264020626,40.70792555127462,-74.01519197416435,40.70791208121521,-74.01520130371507,40.70789824854709,-74.01520934185446,40.707884020943965,-74.01521596596793,40.70786975939609,-74.01522230046005,40.70785488393258,-74.01522811302826,40.707840093801664,-74.01523228102975,40.70782406939986,-74.0152353106252,40.707809014624864,-74.01523839091206,40.70779382987646,-74.01523470411034,40.70777673311739,-74.01521934493465,40.70776287055575,-74.01520071075637,40.70775360741279,-74.01519297305694,40.707750096136365,-74.01517907418614,40.70774391897804,-74.01516876545999,40.707739331577784,-74.01516021437442,40.70773550334523,-74.0151410176986,40.707726929487016,-74.01513263199482,40.70772373617384,-74.01512032471175,40.70771920718156,-74.01510727956253,40.707713961374296,-74.01509946836434,40.707710486273726,-74.01509182896977,40.707708135454276,-74.01504427710674,40.70776716502929,-74.01507451855306,40.707781299377814,-74.01506803371463,40.70779059115791,-74.01508487280893,40.707798096608556]))),
					material: "../admin/uploads/residential/rentalFiles-1607956972-0.png",//'./rentalFiles-1591812762-0.jpg',
					rotation: Cesium.Math.toRadians(parseFloat(300)),
					stRotation: Cesium.Math.toRadians(parseFloat(300)),
					height: 300,
					extrudedHeight: 299.6,
				}
			});
			
			viewerDemoResiApp.entities.removeById("remainingClip");
			viewerDemoResiApp.entities.add({
				id : "remainingClip",
				polygon : {
					hierarchy : new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray([-74.0149992988564,40.70791328305845,-74.01501928467609,40.707920053912375,-74.01503890401862,40.70792656749082,-74.01505998347523,40.707931498230366,-74.01507954603048,40.707939680621095,-74.01510017951314,40.70794414517729,-74.01511947577916,40.70795000297737,-74.01513776311955,40.70795356644184,-74.01515813987614,40.707949011986535,-74.01517190102987,40.707938927833844,-74.01518241956381,40.70792616556606,-74.01519224631284,40.70791177947414,-74.01519598125351,40.70790598570667,-74.01520143009853,40.70789810565436,-74.01520896482062,40.7078836516115,-74.01521580878993,40.707869508227574,-74.01521852202634,40.70786316853867,-74.0152220592208,40.70785465875225,-74.0152260803097,40.707846628309795,-74.0152283021886,40.70783974982644,-74.01523152038527,40.70782456962759,-74.01523541529873,40.707809355249076,-74.01523794565209,40.707793040668854,-74.01523410504268,40.70777663778136,-74.01521950369357,40.707762966807934,-74.01519971432397,40.707753111220185,-74.01519357808813,40.70774936844406,-74.01518008207836,40.707744280236724,-74.01516737655645,40.707738639701745,-74.01516011252188,40.70773547403613,-74.01514008060751,40.70772650915052,-74.01513284746166,40.70772384361183,-74.0151186712799,40.7077188625376,-74.01510559959426,40.70771415473687,-74.01509954910483,40.70771083890982,-74.01507779544256,40.70770298379121,-74.01507116355624,40.70770054299787,-74.01505751465449,40.707695979676124,-74.01504343198528,40.70769179104296,-74.0150356034377,40.70768950742304,-74.01501462735148,40.70768343792364,-74.01500649731595,40.70768092217621,-74.01499275968658,40.70767762208101,-74.0149792321739,40.707674040891206,-74.01497195255574,40.7076721093482,-74.01494877990389,40.70766691307274,-74.01492668063963,40.707666892431924,-74.014906448925,40.707676569871204,-74.01489320013005,40.70768732849002,-74.0148789991376,40.707698718242966,-74.01486669654982,40.707711141050225,-74.01486252015928,40.707716229815105,-74.01485578644557,40.70772447388345,-74.01484968190957,40.707731930246744,-74.01484527837472,40.70773739628175,-74.01483476620209,40.70775022178672,-74.01482597214641,40.707764471742614,-74.01482116015552,40.70777313181508,-74.01481767570796,40.70777891817884,-74.01481049626356,40.70779362547941,-74.01480757507326,40.70780020104204,-74.01480426015894,40.70780838681127,-74.01480288501148,40.70782299514842,-74.0148101192216,40.707836346100585,-74.01482461221678,40.707845666839525,-74.01484409884607,40.70785385707514,-74.01486285248755,40.70786163797103,-74.01488240542638,40.707869823146254,-74.01490120016948,40.70787694986188,-74.01492029536124,40.707884526415974,-74.0149404427278,40.70789206273402,-74.01495960912293,40.707898870505055,-74.01497940983266,40.707906318139685])),
					material: Cesium.Color.GREY,
					height: 299.9,
					extrudedHeight: 299.6,
				}
			});
		}
		
	//}, 3000);
	
	
	</script>
</body>
</html>
