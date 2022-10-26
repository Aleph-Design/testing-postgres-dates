
var dp = {
  
  instances : [],

  attach : (opt) => {
    // (A1) SET DEFAULT OPTIONS & REGISTER INSTANCE
    opt.target.readOnly = true; // PREVENT ONSCREEN KEYBOARD
    opt.target.setAttribute("autocomplete", "off")
    // GET LEFT & BOTTOM POSITION OF TARGETTED INPUT ELEMENT
    const targetElem = opt.target.getBoundingClientRect()
    opt.target.left = Math.floor(targetElem.x)
    opt.target.bottom = Math.floor(targetElem.bottom)
    // if (opt.container) { opt.container = document.getElementById(opt.container); }
    // opt.startmon = true;

    const id = dp.instances.length;
    dp.instances.push(opt);
    let inst = dp.instances[id];

    // SET LEFT & BOTTOM POSITION OF DATE PICKER WRAPPER
    inst.left = opt.target.left + 10
    inst.bottom = opt.target.bottom + 10
    tPos = 'top: ' + inst.bottom + 'px;'
    lPos = 'left: ' + inst.left + 'px;'
    sPos = tPos + ' ' + lPos

    // (A2) TEMP VARS + CURRENT MONTH YEAR (UTC+0)
    let months = ["Januari", "Februari", "Maart", "April", "Mei", "Juni",
                  "Juli", "Augustus", "September", "Oktober", "November", "December"],
        years = ["2021", "2022", "2023", "2024", "2025", "2026", "2027", "2028", "2029", "2030"]
        today = new Date(),
        thisMonth = today.getUTCMonth(), // JAN IS 0
        thisYear = today.getUTCFullYear();

    // (A3) GENERATE HTML
    // (A3-1) HTML 'MAIN' DATEPICKER WRAPPER
    inst.hPick = document.createElement("div");
    inst.hPick.classList.add("date-wrapper");
    inst.hPick.setAttribute('style', sPos)

    // (A3-1-1) HTML DATEPICKER WRAPPER MONTH & YEAR
    // =============================================
    inst.myPick = document.createElement("div");
    inst.myPick.classList.add("picker-my");
    inst.hPick.appendChild(inst.myPick)

    // (A3-2) HTML MONTH SELECT
    inst.hMonth = document.createElement("select");
    inst.hMonth.classList.add("picker-m");
    months.forEach((month, index) => {
      optionMonth = document.createElement('option')
      optionMonth.value = index + 1
      optionMonth.textContent = month
      inst.hMonth.appendChild(optionMonth)
    })
    inst.hMonth.selectedIndex = thisMonth;
    inst.hMonth.onchange = () => { dp.draw(id); };
    inst.myPick.appendChild(inst.hMonth);

    // (A3-3) HTML YEAR SELECT
    inst.hYear = document.createElement("select");
    inst.hYear.classList.add("picker-y");

    years.forEach((year, index) => {
      optionYear = document.createElement('option')
      optionYear.value = year
      optionYear.textContent = year
      inst.hYear.appendChild(optionYear)
    })
    inst.hYear.selectedIndex = 1
    inst.hYear.onchange = () => { dp.draw(id); };
    inst.myPick.appendChild(inst.hYear);

    // END (A3-1-1) HTML DATEPICKER WRAPPER MONTH & YEAR

    // (A3-4) HTML DAYS
    // ================
    // Create a container 'inst.hDays' for the whole table
    inst.hDays = document.createElement("div");
    inst.hDays.classList.add("picker-d");
    inst.hPick.appendChild(inst.hDays);  // child of 'inst.hPick'
    
    dp.draw(id);

    // (A5-2) CLICK TO TOGGLE DATEPICKER
    inst.target.onclick = () => {
      inst.hPick.classList.add("show");
    };
    inst.hPick.onclick = () => { 
      inst.hPick.classList.remove("show");
    };
    document.body.appendChild(inst.hPick);
  },  // attach: ------------------------------------------------------

  // (B) DRAW DAYS IN MONTH
  draw : (id) => {
    // (B1) CRAZY VARS & CALCULATIONS
    // (B1-1) GET INSTANCE + SELECTED MONTH YEAR
    let inst = dp.instances[id],
        month = inst.hMonth.value,
        year = inst.hYear.value;

    // (B1-2) DATE RANGE CALCULATION (UTC+0)
    let daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate(),
        startDay = new Date(Date.UTC(year, month-1, 1)).getUTCDay(), // SUN IS 0
        endDay = new Date(Date.UTC(year, month-1, daysInMonth)).getUTCDay();
    startDay = (startDay == 0) ? 7 : startDay,
    endDay = (endDay == 0) ? 7 : endDay;

    // (B1-3) TODAY (FOR HIGHLIGHTING "TODAY'S DATE CELL")
    let today = new Date(), todayDate = null;
    if (today.getUTCMonth()+1 == month && today.getUTCFullYear() == year) {
      todayDate = today.getUTCDate();
    }

    // (B1-4) DAY NAMES
    let daynames = ["M", "D", "W", "D", "V", "Z", "Z"];  

    // (B1-5) FOR GENERATING DATE SQUARES
    let table, row, cell, squares = [];

    // (B2) CALCULATE DATE SQUARES ARRAY
    // (B2-1) EMPTY SQUARES BEFORE FIRST DAY OF MONTH
    // if (inst.startmon && startDay != 1) {
    if (startDay != 1) {
      for (let i=1; i<startDay; i++) { squares.push("B"); }
    }
    // if (!inst.startmon && startDay!=7) {
    //   if (startDay != 7) {
    //   for (let i=0; (i < startDay); i++) { squares.push("B"); }
    // }

    // (B2-3) DAYS OF MONTH (ALL DAYS ENABLED)
    for (let i=1; (i <= daysInMonth); i++) { squares.push([i, false]);  }

    // (B2-4) EMPTY SQUARES AFTER LAST DAY OF MONTH
    // if (inst.startmon && endDay!=7) {
    if (endDay != 7) {
      for (let i=endDay; i<7; i++) { squares.push("B"); }
    }
    // if (!inst.startmon && endDay!=6) {
    //   for (let i=endDay; i<(endDay==7?13:6); i++) { squares.push("B"); }
    // }

    // (B3) DRAW HTML
    // (B3-1) HTML DAY NAMES HEADER
    table = document.createElement("table");
    row = table.insertRow();
    row.classList.add("picker-d-h");
    for (let d of daynames) {
      cell = row.insertCell();
      cell.innerHTML = d;
    }

    // (B3-2) HTML DATE CELLS
    // row = table.insertRow();
    for (let i=0; i<squares.length; i++) {
      if (i!=squares.length && i%7==0) { row = table.insertRow(); }
      cell = row.insertCell();
      if (squares[i] == "B") { cell.classList.add("picker-d-b"); }
      else {
        // CELL DATE
        cell.innerHTML = squares[i][0];

        if (squares[i][0] == todayDate) { cell.classList.add("picker-d-td"); }
        cell.classList.add("picker-d-d");
        cell.onclick = () => { dp.pick(id, squares[i][0]); }
      }
    }

    // (B4) ATTACH TABLE TO CONTAINER INST.HDAYS
    inst.hDays.innerHTML = "";
    inst.hDays.appendChild(table);
  },  // draw: ---------------------------------------

  // (C) CHOOSE A DATE
  pick : (id, day) => {
    // (C1) GET MONTH YEAR
    let inst = dp.instances[id],
        month = inst.hMonth.value,
        year = inst.hYear.value;

    // (C2) FORMAT & SET SELECTED DAY (YYYY-MM-DD)
    if (+month<10) { month = "0" + month; }
    if (+day<10) { day = "0" + day; }
    inst.target.value = `${day}-${month}-${year}`;
  } // pick: -----------------------------------------
};
