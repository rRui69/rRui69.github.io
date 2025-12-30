console.log('Accounts page loaded');

// Show success alert when any action button is clicked in the modal
document.addEventListener('DOMContentLoaded', function() {
	var actionBtns = document.querySelectorAll('.action-btn');
	var alertBox = document.getElementById('successAlert');
	actionBtns.forEach(function(btn) {
		btn.addEventListener('click', function() {
			alertBox.classList.remove('d-none');
			setTimeout(function() {
				alertBox.classList.add('d-none');
				// Close the modal after showing success
				var modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
				if (modal) modal.hide();
			}, 1500);
		});
	});
});
