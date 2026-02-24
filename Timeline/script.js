let startDateGlobal = null;
let endDateGlobal = null;

const machineSelect = document.getElementById('machineType');
machineSelect.addEventListener('change', toggleFields);

function toggleFields() {
  const val = machineSelect.value;
  document.getElementById('manualAdd').style.display = (val && val !== 'TMCL' && val !== 'TS') ? 'grid' : 'none';
  document.getElementById('cycleParams').style.display = (val === 'TMCL' || val === 'TS') ? 'grid' : 'none';
}

function calculate() {
  const machine = document.getElementById('machineType').value;
  if (!machine) {
    alert("กรุณาเลือกเครื่อง");
    return;
  }

  const startDateInput = document.getElementById('startDate').value;
  const timeStr = document.getElementById('startTime').value || "00:00";

  if (!startDateInput) {
    alert("กรุณาเลือกวันที่เริ่มต้น");
    return;
  }

  const [yyyy, mm, dd] = startDateInput.split('-');
  const [hh, min] = timeStr.split(':').map(Number);
  startDateGlobal = new Date(yyyy, mm - 1, dd, hh || 0, min || 0, 0);
  endDateGlobal = new Date(startDateGlobal);

  let addedHours = 0;
  let addedMinutes = 0;
  let addedDesc = '';

  if (machine === 'TMCL' || machine === 'TS') {
    const dwell = parseFloat(document.getElementById('dwell').value) || 0;
    const transfer = parseFloat(document.getElementById('transfer').value) || 0;
    const cycles = parseInt(document.getElementById('cycle').value) || 1;

    if (cycles < 1) {
      alert("Cycle ต้องมากกว่าหรือเท่ากับ 1");
      return;
    }

    const totalAddedMin = (dwell * 2 + transfer * 2) * cycles;
    addedHours = Math.floor(totalAddedMin / 60);
    addedMinutes = totalAddedMin % 60;

   
  } else {
    addedHours = parseInt(document.getElementById('addHours').value) || 0;
    addedMinutes = parseInt(document.getElementById('addMinutes').value) || 0;
    addedDesc = '';
  }

  endDateGlobal.setHours(endDateGlobal.getHours() + addedHours);
  endDateGlobal.setMinutes(endDateGlobal.getMinutes() + addedMinutes);

  const days = ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'];
  const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  const formatThaiDate = (d) => {
    const dayNum = d.getDate();
    const month = thaiMonths[d.getMonth()];
    const year = d.getFullYear();
    const weekday = days[d.getDay()];
    const hour = String(d.getHours()).padStart(2, '0');
    const minute = String(d.getMinutes()).padStart(2, '0');
    return `${dayNum} ${month} ${year} ${hour}:${minute} (${weekday})`;
  };

  const formatStartDate = (d) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd} / ${mm} / ${yyyy}`;
  };

  document.getElementById('origDate').textContent = formatThaiDate(startDateGlobal);
  document.getElementById('addedTime').textContent = `${addedDesc} ${addedHours} ชั่วโมง ${addedMinutes} นาที`;
  document.getElementById('endDate').textContent = formatThaiDate(endDateGlobal);

  const endEl = document.getElementById('endDate');
  if (endDateGlobal.getDay() === 0) {
    endEl.classList.add('end-date-red');
  } else {
    endEl.classList.remove('end-date-red');
  }

  document.getElementById('resultBox').style.display = 'block';
  document.getElementById('calendarBox').style.display = 'block';

  generateCalendar(
    endDateGlobal.getFullYear(),
    endDateGlobal.getMonth(),
    startDateGlobal,
    endDateGlobal,
    String(startDateGlobal.getHours()).padStart(2, '0') + ':' + String(startDateGlobal.getMinutes()).padStart(2, '0'),
    String(endDateGlobal.getHours()).padStart(2, '0') + ':' + String(endDateGlobal.getMinutes()).padStart(2, '0')
  );
}

function generateCalendar(year, month, startDate, endDate, startTimeStr, endTimeStr) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const thaiMonths = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
                      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  document.getElementById('calendarMonth').textContent = `${thaiMonths[month]} ${year}`;

  let table = '<tr><th>วันอาทิตย์</th><th>วันจันทร์</th><th>วันอังคาร</th><th>วันพุธ</th><th>วันพฤหัสบดี</th><th>วันศุกร์</th><th>วันเสาร์</th></tr><tr>';
  for (let i = 0; i < firstDay; i++) table += '<td class="outside"></td>';

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month, day);
    const isStart = startDate && currentDate.toDateString() === startDate.toDateString();
    const isEnd = endDate && currentDate.toDateString() === endDate.toDateString();
    const isSunday = currentDate.getDay() === 0;

    let cellContent = `<div class="day-number ${isSunday ? 'sunday' : ''}">${day}</div>`;

    if (isStart && !isEnd) {
      cellContent += `<div class="time-label start-time">${startTimeStr}</div>`;
    }
    if (isEnd) {
      cellContent = `<div class="day-number end-circle">${day}</div>`;
      cellContent += `<div class="time-label end-time">${endTimeStr}</div>`;
    }

    let cellClass = isStart && !isEnd ? 'highlight-start' : isEnd ? 'highlight-end' : '';

    table += `<td class="${cellClass}">${cellContent}</td>`;

    if ((firstDay + day) % 7 === 0) table += '</tr><tr>';
  }
  table += '</tr>';
  document.getElementById('calendarTable').innerHTML = table;
}

function setCurrentTime() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  document.getElementById('startDate').value = `${yyyy}-${mm}-${dd}`;
  document.getElementById('startTime').value = `${hh}:${min}`;
}

function resetForm() {
  document.getElementById('machineType').value = '';
  document.getElementById('startDate').value = '';
  document.getElementById('startTime').value = '';
  document.getElementById('addHours').value = '0';
  document.getElementById('addMinutes').value = '0';
  document.getElementById('dwell').value = '0';
  document.getElementById('transfer').value = '0';
  document.getElementById('cycle').value = '1';
  toggleFields();
  document.getElementById('resultBox').style.display = 'none';
}

window.onload = () => {
  toggleFields();
  document.getElementById('resultBox').style.display = 'none';
};






