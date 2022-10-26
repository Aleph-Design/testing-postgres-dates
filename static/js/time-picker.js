var tp = {
  init: () => {
    // GENERATE HTML 'MAIN' TIME-PICKER WRAPPER
    tp.tPick = document.createElement("div")
    tp.tPick.classList.add("time-picker")
    document.body.appendChild(tp.tPick)
    // TIME-PICKER INNERHTML
    tp.tPick.innerHTML =
    `
    <div class="cells-wrapper">
      <div class="hm-wrappers" id="tp-hr">
        <div class="tp-up">&#9650;</div>
        <div class="tp-val">0</div>
        <div class="tp-down">&#9660;</div>
      </div>
      <div class="hm-wrappers" id="tp-mn">
        <div class="tp-up">&#9650;</div>
        <div class="tp-val">0</div>
        <div class="tp-down">&#9660;</div>
      </div>
    </div>
    <div class="btn-wrapper">
      <button id="tp-close" onclick="tp.tPick.classList.remove('show')">Sluit</button>
      <button id="tp-set" onclick="tp.set()">Kies</button>
    </div>
    `
    // GET VALUE ELEMENTS AND SET CLICK ACTIONS
    for (let segment of ['hr', 'mn']) {
      let up = tp.tPick.querySelector(`#tp-${segment} .tp-up`)
      let dn = tp.tPick.querySelector(`#tp-${segment} .tp-down`)

      tp['h' + segment] = tp.tPick.querySelector(`#tp-${segment} .tp-val`)

      up.onmousedown = () => { tp.spin( true, segment) }
      dn.onmousedown = () => { tp.spin( false, segment) }
      up.onmouseup = () => { tp.spin( null ) }
      dn.onmouseup = () => { tp.spin( null ) }
      up.onmouseleave = () => { tp.spin( null ) }
      dn.onmouseleave = () => { tp.spin( null ) }
    } // for-end   
  },  // init -----------------------------------

  spin: (direction, segment) => {
    // CLEAR THE TIME
    if (direction == null) {
      if (tp.timer != null) {
        clearTimeout(tp.timer)
      }
    } else {
      // SPIN FOR HOUR AND MINUTE
      let next = + tp['h' + segment].innerHTML
      // INCREMENT DECREMENT HOURS MINUTES
      if (segment == 'hr') {
        next = direction ? (next + 1) : (next - 1)
      } else {
        next = direction ? (next + 15) : (next - 15)
      }
      // CHECK MIN / MAX VALUEs
      if (segment == 'hr') {
        if (next > 23) { next = 0 }
        if (next < 0) { next = 23}
      } else {
        if (next > 59) { next = 0}
        if (next < 0) { next = 45}
      }
      // SET VALUE
      if (next < 10) { next = '0' + next}
      tp['h' + segment].innerHTML = next
      // SET TIME: LOWER TIMEOUT SPIN'S FASTER
      tp.timer = setTimeout( () => {
        tp.spin( direction, segment)
      }, 200 )
    }
  },  // spin: ------------------------------------

  instances: [],

  attach: (opt) => {
    opt.target.readOnly = true;
    opt.target.setAttribute("autocomplete", "off")
    const targetElem = opt.target.getBoundingClientRect()
    opt.target.left = Math.floor(targetElem.x)
    opt.target.bottom = Math.floor(targetElem.bottom)   

    let id = tp.instances.length
    tp.instances.push(opt)
    let inst = tp.instances[id]
    // SET LEFT & BOTTOM POSITION OF TIME PICKER WRAPPER
    inst.left = opt.target.left + 10
    inst.bottom = opt.target.bottom + 10
    tPos = 'top: ' + inst.bottom + 'px;'
    lPos = 'left: ' + inst.left + 'px;'
    inst.sPos = tPos + ' ' + lPos

    inst.target.addEventListener('click', () => { tp.show(inst) })
  },  // attach: -----------------------------------

  // SHOW TIME PICKER
  destField: null,
  show: (inst) => {
    tp.tPick.setAttribute('style', inst.sPos)
    tp.destField = inst.target
    tp.hhr.innerHTML = "00"
    tp.hmn.innerHTML = "00"
    tp.tPick.classList.add('show')
  },  // show: -------------------------------------

  // CLOSE POPUP WITHOUT SETTING TARGET FIELD
  close: () => {
    tp.tPick.classList.remove("show")
  },

  // SET SELECTED TIME TO TARGET FIELD
  set: () => {
    tp.destField.value = tp.hhr.innerHTML + ':' + tp.hmn.innerHTML
    tp.tPick.classList.remove("show")
  },

}
document.addEventListener("DOMContentLoaded", tp.init)