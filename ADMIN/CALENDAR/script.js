// Simple live calendar rendering using JavaScript
let currentYear, currentMonth;

document.addEventListener('DOMContentLoaded', function() {
  const today = new Date();
  currentYear = today.getFullYear();
  currentMonth = today.getMonth();
  renderCalendar(currentYear, currentMonth);
});

function renderCalendar(year, month) {
  const calendar = document.getElementById('liveCalendar');
  if (!calendar) return;
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDay = firstDay.getDay();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  let html = `<div class='calendar-header d-flex justify-content-between align-items-center mb-2'>`;
  html += `<button class='btn btn-outline-secondary btn-sm' id='prevMonth'>&lt;</button>`;
  html += `<div style='cursor:pointer;' id='calendarPicker'><strong>${firstDay.toLocaleString('default', { month: 'long' })} ${year}</strong></div>`;
  html += `<button class='btn btn-outline-secondary btn-sm' id='nextMonth'>&gt;</button>`;
  html += `</div>`;
  html += "<div class='calendar-grid d-grid' style='grid-template-columns: repeat(7, 1fr);'>";
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let d of days) html += `<div class='calendar-day text-center fw-bold'>${d}</div>`;
  for (let i = 0; i < startDay; i++) html += `<div></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = isCurrentMonth && d === today.getDate();
    html += `<div class='calendar-date calendar-box text-center${isToday ? ' bg-primary text-white' : ''}'>${d}</div>`;
  }
  html += "</div>";
  // Picker modal
  html += `<div class='modal fade' id='calendarPickerModal' tabindex='-1'><div class='modal-dialog modal-dialog-centered'><div class='modal-content'><div class='modal-header'><h5 class='modal-title'>Pick Year and Month</h5><button type='button' class='btn-close' data-bs-dismiss='modal'></button></div><div class='modal-body'><div class='mb-3'><label for='yearSelect' class='form-label'>Year</label><select id='yearSelect' class='form-select'></select></div><div class='mb-3'><label for='monthSelect' class='form-label'>Month</label><select id='monthSelect' class='form-select'></select></div></div><div class='modal-footer'><button type='button' class='btn btn-primary' id='pickerGoBtn'>Go</button></div></div></div></div>`;
  calendar.innerHTML = html;

  document.getElementById('prevMonth').onclick = function() {
    if (currentMonth === 0) {
      currentMonth = 11;
      currentYear--;
    } else {
      currentMonth--;
    }
    renderCalendar(currentYear, currentMonth);
  };
  document.getElementById('nextMonth').onclick = function() {
    if (currentMonth === 11) {
      currentMonth = 0;
      currentYear++;
    } else {
      currentMonth++;
    }
    renderCalendar(currentYear, currentMonth);
  };

  // Picker logic
  document.getElementById('calendarPicker').onclick = function() {
    // Fill year and month selects
    const yearSelect = document.createElement('select');
    const monthSelect = document.createElement('select');
    let ySelect = document.getElementById('yearSelect');
    let mSelect = document.getElementById('monthSelect');
    if (ySelect && mSelect) {
      ySelect.innerHTML = '';
      mSelect.innerHTML = '';
      for (let y = 1990; y <= 2100; y++) {
        ySelect.innerHTML += `<option value='${y}' ${y === year ? 'selected' : ''}>${y}</option>`;
      }
      for (let m = 0; m < 12; m++) {
        mSelect.innerHTML += `<option value='${m}' ${m === month ? 'selected' : ''}>${new Date(0, m).toLocaleString('default', { month: 'long' })}</option>`;
      }
    }
    var pickerModal = new bootstrap.Modal(document.getElementById('calendarPickerModal'));
    pickerModal.show();
    document.getElementById('pickerGoBtn').onclick = function() {
      currentYear = parseInt(ySelect.value);
      currentMonth = parseInt(mSelect.value);
      pickerModal.hide();
      renderCalendar(currentYear, currentMonth);
    };
  };
}
