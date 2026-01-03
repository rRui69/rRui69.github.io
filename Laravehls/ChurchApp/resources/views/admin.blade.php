<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<title>Admin Dashboard</title>
        @vite('resources/css/dashboard.css')
        @vite('resources/css/sidebar.css')
        @vite('resources/js/app.js')
		<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap" rel="stylesheet">
	</head>
	<body>
		<nav class="sidebar" id="sidebar">
		   <div class="px-3">
			   <ul class="nav nav-pills flex-column" id="sidebarMenu">
				 <li class="nav-item"><a class="nav-link" href="dashboard.html">        DASHBOARD   </a></li>
				 <li class="nav-item"><a class="nav-link" href="PROFILE/index.html">    PROFILE     </a></li>
				 <li class="nav-item"><a class="nav-link" href="ACCOUNTS/index.html">   ACCOUNTS    </a></li>
				 <li class="nav-item"><a class="nav-link" href="CALENDAR/index.html">   CALENDAR    </a></li>
				 <li class="nav-item"><a class="nav-link" href="SERVICES/index.html">   SERVICES    </a></li>
				 <li class="nav-item"><a class="nav-link" href="REPORTS/index.html">    REPORTS     </a></li>
				 <li class="nav-item mt-3"><a class="nav-link text-danger" href="logout.php">LOGOUT</a></li>
			   </ul>
		   </div>
		</nav>

		<main class="main-content dashboard-main-content">
			<div class="container-fluid">
				   <div id="contentArea">
						   <div class="dashboard-header"><h2 class="text-center mt-4">Dashboard<br><br></h2></div>
					   <div class="container-fluid px-0">
						   <div class="row dashboard-grid">
							   <!-- Left: Schedules (top) and Live Stream (bottom) -->
							   <div class="d-flex flex-column dashboard-col-full dashboard-col-wide">
								   <div class="dashboard-row-20">
									<a href="SCHEDULES/index.html" class="dashboard-box dashboard-schedules h-100 text-decoration-none text-white">SCHEDULES</a>
								   </div>
								   <div class="dashboard-row-80">
									   <div class="dashboard-box dashboard-livestream h-100">LIVE STREAM</div>
								   </div>
							   </div>
							   <!-- Middle: Inbox (top) and Documents (bottom) -->
							   <div class="d-flex flex-column dashboard-col-full dashboard-col-mid">
								   <div class="dashboard-row-20">
									   <div class="dashboard-box dashboard-inbox h-100">INBOX</div>
								   </div>
								   <div class="dashboard-row-80">
									   <div class="dashboard-box dashboard-documents h-100">DOCUMENTS</div>
								   </div>
							   </div>
							   <!-- Right: Collections spans both rows -->
							   <div class="d-flex flex-column dashboard-col-full dashboard-col-narrow">
								   <div class="dashboard-row-100">
									   <div class="dashboard-box dashboard-collections h-100">COLLECTIONS</div>
								   </div>
							   </div>
						   </div>
					   </div>
				   </div>
			</div>
		</main>

		<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
		<script src="dashboard.js"></script>
	</body>
</html>

