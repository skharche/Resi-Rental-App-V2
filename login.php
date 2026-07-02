<?php
session_start();
if(isset($_REQUEST["loggedOut"]))
{
	session_destroy();
}
?>
<link href="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css" rel="stylesheet" id="bootstrap-css">
<script src="//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/js/bootstrap.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
<!------ Include the above in your HEAD tag ---------->

<!DOCTYPE html>
<html>
<head>
	<title>PropSee :: Login</title>
   <!--Made with love by Mutiullah Samim -->
   
	<!--Bootsrap 4 CDN-->
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
    
    <!--Fontawesome CDN-->
	<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">

	<link rel="stylesheet" href="../admin/dist/css/AdminLTE.min.css">
	<!--Custom styles-->
	<!--link rel="stylesheet" type="text/css" href="login.css"-->
</head>
<body class="hold-transition login-page">
<?php
	$errorMessage = "";
	if(isset($_POST["username"]))
	{
		//echo "<pre>";print_r($_POST);
		include_once("../admin/controllers/userController.php");
		$userControllerObj = new userController();
		$data = $userControllerObj->makeUserLogin();
		//echo "<br />Response";
		//print_r($data);
		if(strtolower($data["success"]) == "1")
		{
			if(!empty($_POST["remember"])) {
				setcookie ("demo_ppt_username",$_POST["username"],time()+ (365*24*60*60));//Cookies for 1 year
				setcookie ("demo_ppt_password",$_POST["password"],time()+ (365*24*60*60));
				setcookie ("demo_ppt_remember",1,time()+ (365*24*60*60));
				//echo "Cookies Set Successfuly";
			}
			else
			{
				setcookie("demo_ppt_username","");
				setcookie("demo_ppt_password","");
				setcookie("demo_ppt_remember","");
				//echo "Cookies Not Set";
			}
			//header("location:".$data["app_url"]);
			header("location:https://propsee.city/Demo.ResiRentalApp-V2/");
		}
		else
		{
			$errorMessage = $data["message"];
		}
	}
?>
<div class="container">
	<div class="d-flex justify-content-center h-100">
		<div class="card login-box">
			<div class="card-header">
				<h3>Sign In</h3>
				<!--div class="d-flex justify-content-end social_icon">
					<span><i class="fab fa-facebook-square"></i></span>
					<span><i class="fab fa-google-plus-square"></i></span>
					<span><i class="fab fa-twitter-square"></i></span>
				</div-->
			</div>
			<div class="card-body login-box-body">
				<?php
					if($errorMessage != "")
					{
						echo "<font color='red'>".$errorMessage."</font>";
					}
				?>
				<form action="" method="POST">
					<input type="hidden" name="app_name" value="Resi Rental">
					<div class="input-group form-group">
						<div class="input-group-prepend">
							<span class="input-group-text"><i class="fas fa-user"></i></span>
						</div>
						<input type="text" name="username" class="form-control" placeholder="username" value="<?php if(isset($_COOKIE["demo_ppt_username"])) { echo $_COOKIE["demo_ppt_username"]; } ?>" />
						
					</div>
					<div class="input-group form-group">
						<div class="input-group-prepend">
							<span class="input-group-text"><i class="fas fa-key"></i></span>
						</div>
						<input type="password" name="password" class="form-control" placeholder="password" value="<?php if(isset($_COOKIE["demo_ppt_password"])) { echo $_COOKIE["demo_ppt_password"]; } ?>" />
					</div>
					<div class="row align-items-center remember">
						<input type="checkbox" name="remember" <?php if(isset($_COOKIE["demo_ppt_remember"]) && $_COOKIE["demo_ppt_remember"] == 1) { ?> checked <?php } ?>>&nbsp;Remember Me
					</div>
					<div class="form-group">
						<input type="submit" value="Login" class="btn float-right login_btn btn-primary">
					</div>
				</form>
			</div>
			<!--div class="card-footer">
				<div class="d-flex justify-content-center links">
					Don't have an account?<a href="#">Sign Up</a>
				</div>
				<div class="d-flex justify-content-center">
					<a href="#">Forgot your password?</a>
				</div>
			</div-->
		</div>
	</div>
</div>
<style>
.login-box{
	height: 275px !important;
}
</style>
</body>
</html>