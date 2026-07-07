
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
	<title>PropSee Resi Rental</title>
	
	<!-- Font Awesome -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css">
	<!-- Ionicons -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">
	<link rel="stylesheet" href="resiApp.css">
	<link rel="stylesheet" href="carousel.css">
	<script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
	<script src="../CesiumCDN/1.142/Build/Cesium/Cesium.js"></script>
	<!-- For JSZip -->
	<script src="jszip/dist/jszip.min.js"></script>
	<script src="jszip-utils-master/dist/jszip-utils.min.js"></script>
	<script src="fogEffect.js"></script>
	<script src="resiRentalCameraSpin.js"></script>
	<link rel="stylesheet" href="../CesiumCDN/1.142/Build/Cesium/Widgets/widgets.css">
	
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
    <img src="img/PropSee_NEWYORK.jpg" style="width: 85%;">
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
  <span class="submarkCollapseTab" onclick="toggleSubmarketStatsCollapse();"><i id="submarkCollapseIcon" class="fa fa-chevron-right"></i></span>
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
	<span class="resiCollapseTab" onclick="toggleResiDetailsCollapse();"><i id="resiCollapseIcon" class="fa fa-chevron-right"></i></span>
  <b>
  <span class="buildingname bigFontSize"></span>&nbsp;&nbsp;&nbsp;<span class="viewFromBuilding"></span></b>&nbsp;<span class="gobackshowStats" style="/*margin-left:200px;*/"><button class="btn btn-primary btn-xs backButtonCSS" onClick="gobackshowStats();resetPartialColor();">Back to Summary</button></span>
  <span class="pull-right"><span class="material-icons" onClick="resetCondoInformation();" style="cursor: pointer;">cancel_presentation</span></span>
  </b>
  <ul class="nav nav-pills customnavpills">
  <li class="active">
    <a data-toggle="tab" class="active" href="#infotab" >Details</a>
  </li>
  <li>
    <a data-toggle="tab" href="#picturestab">Pictures</a>
  </li>
  <li>
    <a data-toggle="tab" href="#floorplantab">Floor Plan</a>
  </li>
  <li>
    <a data-toggle="tab" href="#views" >Views</a>
  </li>
  <!--li>
    <a data-toggle="tab" href="#unittab" >Unit</a>
  </li>
  <li>
    <a data-toggle="tab" href="#exteriortab" >Exterior</a>
  </li>
  <li>
    <a data-toggle="tab" href="#commonareastab">Common Areas</a>
  </li-->
  <li>
    <a data-toggle="tab" href="#propsee" >PropSee Data</a>
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
  
  <div align="center" id="picturestab" class="tab-pane fade verticalScroll">
	<ul class="nav nav-pills customnavpills">
		<li class="active"><a data-toggle="tab" href="#unittab" class="unittab">Unit</a></li>
		<li><a data-toggle="tab" href="#exteriortab" class="exteriortab">Exterior</a></li>
		<li><a data-toggle="tab" href="#commonareastab" class="commonareastab">Common Areas</a></li>
	</ul>
	<div class="tab-content">
		<div align="center" id="unittab" class="tab-pane fade verticalScroll in active"><span class="imagesDisplayContainerUnitPictures"></span></div>
		<div align="center" id="exteriortab" class="tab-pane fade verticalScroll"><span class="imagesDisplayContainerExteriorView"></span></div>
		<div align="center" id="commonareastab" class="tab-pane fade verticalScroll"><span class="imagesDisplayContainerBuildingAreas"></span></div>
	</div>
  </div>
  
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
	<script src="resiAppCesiumInit.js"></script>
	<script src="resiRentalClipping.js"></script>
	<!-- Bootstrap slider -->
	<script src="resiAppDataLoading.js"></script>
	
	<script type="text/javascript" src="./measure-global.js"></script>
    <script type="text/javascript" src="./measure-initializer.js"></script>
    <script type="text/javascript" src="./measure-viewer.js"></script>
	<link href="./measure-viewer.css" rel="stylesheet">
    <script type="text/javascript" src="./cesium-viewshed.js"></script>
	
	<script>
		loadLoggedInUserDetail();
		$(function () {
			/* BOOTSTRAP SLIDER */
			var sliderRangeSymbol = "$";
			//$('.slider').slider().on('change', updatePriceRange).data('slider');
			//$('.slider').slider().on('slideStop', updatePriceRangeDataFilter).data('slider');
			$('.slider').slider().on('change', updatePriceRange).on('slideStop', onPriceSliderChange).on('slide', onPriceSliderChange).data('slider');
		});
		
		function toggleSubmarketStatsCollapse() {
			var $panel = $('#submarketStats');
			var $icon = $('#submarkCollapseIcon');
			if ($panel.hasClass('sm-collapsed')) {
				$panel.animate({right: '15px'}, 280, function() {
					$panel.removeClass('sm-collapsed');
					$icon.removeClass('fa-chevron-left').addClass('fa-chevron-right');
				});
			} else {
				$panel.animate({right: '-535px'}, 280, function() {
					$panel.addClass('sm-collapsed');
					$icon.removeClass('fa-chevron-right').addClass('fa-chevron-left');
				});
			}
		}

		function toggleResiDetailsCollapse() {
			var $panel = $('#residetails');
			var $icon = $('#resiCollapseIcon');
			if ($panel.hasClass('sm-collapsed')) {
				$panel.animate({right: '15px'}, 280, function() {
					$panel.removeClass('sm-collapsed');
					$icon.removeClass('fa-chevron-left').addClass('fa-chevron-right');
				});
			} else {
				$panel.animate({right: '-595px'}, 280, function() {
					$panel.addClass('sm-collapsed');
					$icon.removeClass('fa-chevron-right').addClass('fa-chevron-left');
				});
			}
		}

    
    $('.pullRightBtn').click(function() {
      $('#actionForm').show();
      $('.pullRightBtn').hide();
	  $(".legendContainer").css("left", "360px");
    });
	$('.pullRightBtn').hide();
    
    $('#dismiss').click(function() {
      $('#actionForm').hide();
      $('.pullRightBtn').show();
	  $(".legendContainer").css("left", "80px ");
    });
		
		function logoutApp()
		{
			sessionId = sessionData.sessionId; 
			$.ajax({
			  method: "POST",
			  url: window.apiBaseUrl+"controllers/userLoginHistoryController.php",
			  data: { sourceApp : "PPT", param : "logout" , isAjax:"yes", "sessionId" : sessionId}
			})
			.done(function( data ) {
				////console.log(data);
				data = $.parseJSON( data );
				if(data.status == "success")
				{
					location.href="login.php?loggedOut";
				}
				else
				{
					alert("Something went wrong");
				}
			});
		}
		
		function toggleUserSection(forceClose)
		{
			if(forceClose)
			{
				$(".userLoggedInInfo").fadeOut("slow");
			}
			else
			{
				$(".userLoggedInInfo").fadeToggle("slow");
				$(".userLoggedInInfo").removeClass( "hide" );
			}
		}
		
		function toggleSubmarketStatsCollapse() {
			var $panel = $('#submarketStats');
			var $icon = $('#submarkCollapseIcon');
			if ($panel.hasClass('sm-collapsed')) {
				$panel.animate({right: '15px'}, 280, function() {
					$panel.removeClass('sm-collapsed');
					$icon.removeClass('fa-chevron-left').addClass('fa-chevron-right');
				});
				$(".submarkCollapseTab").removeClass('submarkCollapseTabCollapsed');
			} else {
				$panel.animate({right: '-595px'}, 280, function() {
					$panel.addClass('sm-collapsed');
					$icon.removeClass('fa-chevron-right').addClass('fa-chevron-left');
				});
				$(".submarkCollapseTab").addClass('submarkCollapseTabCollapsed');
			}
		}
		
		$(document).on('click', function(e) {
			if ($(".userLoggedInInfo").is(":visible")) {
				if (!$(e.target).closest('.userLoggedInInfo, .navbar-btn, .userProfileImage').length) {
					toggleUserSection(true);
				}
			}
		});
	</script>
</body>
</html>
