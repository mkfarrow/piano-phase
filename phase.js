var RADIUS = 250;
var MIN_RADIUS = 50;
var DUCANVAS = 550;
var XMID = DUCANVAS / 2;
var YMID = DUCANVAS / 2;
var PI = Math.PI;
var PI2 = Math.PI * 2;
var dc = document.getElementById('mycanvas').getContext('2d');

var Voice = function(frTempo, radius) {
   this.frTempo = frTempo;
   this.tines = [];
   this.timePlayed = [];
};

var Phase = function(rgnote, frTempo, dtsTotal) {
   this.animRequestID = null;
   this.rgnote = rgnote;
   this.r = RADIUS;

   var voiceMain = new Voice(1);
   var voicePhase = new Voice(frTempo);
   this.voiceMain = voiceMain;
   this.voicePhase = voicePhase;
   this.rgvoice = [voiceMain, voicePhase];

   this.dtsTotal = dtsTotal;
   this.timeStart = null;
};

Phase.prototype.fPlayNote = function(voice, inote, rdCur) {
   var rdPrev = voice.tines[inote];
   return rdCur === 0 || (Math.floor(rdCur / PI2) !== Math.floor(rdPrev / PI2));
};

Phase.prototype.colorHsla = function(voice, inote, time) {
   var huev = (inote / this.rgnote.length) * 360;
   var satv = Math.round(100 * Math.min(1, (time - voice.timePlayed[inote]) / 1000.0));
   var lumv = Math.round(100 * Math.max(0.5, 1 - (time - voice.timePlayed[inote]) / 1000.0));
   return 'hsla(' + huev + ',' + satv + '%,' + lumv + '%,1)';
};

Phase.prototype.sizeForNote = function(voice, inote, time) {
   var noteRadius = 10;
   var sizeTimeScale = 2 - Math.min(1, (time - voice.timePlayed[inote]) / 1000.0);
   return noteRadius * sizeTimeScale;
};

Phase.prototype.radius = function(voice, rdThis) {
   if (voice === this.voiceMain) return this.r;

   // normalize the angles so they are in the range [0, 2 * PI]
   var rdMain = this.voiceMain.tines[0];
   rdThis = rdThis - (Math.floor(rdThis / PI2) * PI2);
   rdMain = rdMain - (Math.floor(rdMain / PI2) * PI2);

   // find the smallest angle between the two angles (note: angle always <= PI)
   var absDiff = Math.abs(rdThis - rdMain);
   var angleBetween = Math.min(PI2 - absDiff, absDiff);
   return this.r - (this.r - MIN_RADIUS) * angleBetween / PI;
};

Phase.prototype.drawVoices = function() {
   var time = (new Date()).getTime();
   if (!this.timeStart) this.timeStart = time;

   this.rgvoice.forEach(function(voice) {
      var percentDone = ((time - this.timeStart) / 1000) / (this.dtsTotal * voice.frTempo);
      var rdExtra = percentDone * PI2;
      var radiusThis = this.radius(voice, rdExtra);
      for (var i = 0; i < this.rgnote.length; i++) {
         var rdCur = rdExtra - (PI2 / this.rgnote.length) * i;

         if (this.fPlayNote(voice, i, rdCur)) {
            MIDI.noteOn(0, this.rgnote[i].midi(), 100, 0);
            MIDI.noteOff(0, this.rgnote[i].midi(), 0.1);
            voice.timePlayed[i] = time;
         }

         dc.fillStyle = this.colorHsla(voice, i, time);
         dc.beginPath();
         dc.arc(
            XMID + (Math.cos(rdCur) * radiusThis),
            YMID + (Math.sin(rdCur) * radiusThis),
            this.sizeForNote(voice, i, time), 0, PI2, false);
         dc.fill();

         voice.tines[i] = rdCur;
      }
   }, this);
};

Phase.prototype.draw = function() {
   drawGrid();
   this.drawVoices();
   this.doAnim();
};

Phase.prototype.init = function() {
   this.rgvoice.forEach(function(voice) {
      for (var inote = 0; inote < this.rgnote.length; inote++) {
         voice.tines[inote] = -(PI2 / this.rgnote.length) * inote;
         voice.timePlayed[inote] = 0;
      }
   }, this);
   this.doAnim();
};

Phase.prototype.dispose = function() {
   if (this.animRequestID) window.cancelAnimationFrame(this.animRequestID);
   dc.clearRect(0, 0, DUCANVAS, DUCANVAS);
};

Phase.prototype.doAnim = function() {
   var phaseThis = this;
   this.animRequestID = window.requestAnimationFrame(function() {
      phaseThis.draw();
   });
};

var BPM_DEFAULT = 400;
var STPIANO = "acoustic_grand_piano";
var RGSTNOTE_PIANO_PHASE = ["E4", "F#4", "B4", "C#5", "D5", "F#4", "E4", "C#5", "B4", "F#4", "D5", "C#5"];
var RGSTNOTE_THE_LICK = ['G4', 'A4', 'A#4', 'C5', 'G4', 'A4', 'F4', 'G4'];
var SFSPEED_DEFAULT = 1.01;

var RGINSTR = [
   {
      name: 'Piano',
      value: 'acoustic_grand_piano'
},
   {
      name: 'Banjo',
      value: 'banjo'
},
   {
      name: 'Cello',
      value: 'cello'
},
   {
      name: 'Gtr clean',
      value: 'electric_guitar_jazz'
}, {
      name: 'Gtr dist.',
      value: 'distortion_guitar'
}, {
      name: 'Goblins',
      value: 'fx_6_goblins'
}, {
      name: 'Harmonics',
      value: 'guitar_harmonics'
}, {
      name: 'Harpsichord',
      value: 'harpsichord'
}, {
      name: 'Koto',
      value: 'koto'
}, {
      name: 'Pizzicato',
      value: 'pizzicato_strings'
}, {
      name: 'Shamisen',
      value: 'shamisen'
}, {
      name: 'Slap bass',
      value: 'slap_bass_1'
}, {
      name: 'Sitar',
      value: 'sitar'
}, {
      name: 'Whistle',
      value: 'whistle'
}];

var RGPRESET_LICKS = [
   {
      name: "Piano Phase",
      value: RGSTNOTE_PIANO_PHASE
   },
   {
      name: "'The Lick'",
      value: RGSTNOTE_THE_LICK
   },
   {
      name: "A harmonic minor",
      value: ["A2", "B2", "C3", "D3", "E3", "F3", "G#3",
               "A3", "B3", "C4", "D4", "E4", "F4", "G#4", "A4"]
   }
];

var phase = null;

window.onload = function() {
   populateSeqNote();
   populateWith('#selInstr', RGINSTR);
   setupRateInput();
   setupBpm();
   setupButtons();
   drawGrid();
};

function populateSeqNote() {
   var textArea = document.querySelector("#seqNote");
   textArea.innerHTML = RGSTNOTE_PIANO_PHASE.concat(RGSTNOTE_PIANO_PHASE).join(' ');

   var table = document.querySelector("#presetLicks");
   RGPRESET_LICKS.forEach(function(lick) {
      var row = document.createElement("tr");
      var tdName = document.createElement("td");
      tdName.innerHTML = lick.name;
      var tdNotes = document.createElement("td");
      tdNotes.innerHTML = lick.value.join(' ');
      row.appendChild(tdName);
      row.appendChild(tdNotes);
      table.appendChild(row);
   });
}

function populateWith(stElementID, rgobj) {
   var selectNode = document.querySelector(stElementID);
   rgobj.map(function(thing) {
      var opt = document.createElement('option');
      opt.innerHTML = thing.name;
      return opt;
   }).forEach(function(option) {
      selectNode.appendChild(option);
   });
}

function setupRateInput() {
   var rateInput = document.querySelector("#inputRate");
   var rateOutput = document.querySelector("#outputRate");

   var min = 0.8,
      max = 1.2,
      step = 0.01,
      value = 1.01;

   rateInput.setAttribute("min", min);
   rateInput.setAttribute("max", max);
   rateInput.setAttribute("step", step);
   rateInput.setAttribute("value", value);

   rateOutput.innerHTML = value;
   rateInput.oninput = updateRateDisplay;
}

function setupButtons() {
   var btnStart = document.querySelector("#btnStart");
   btnStart.onclick = doUserStart;

   var btnStop = document.querySelector("#btnStop");
   btnStop.onclick = stopAll;
}

function setupBpm() {
   var bpmInput = document.querySelector("#inputBpm");
   var min = 100,
      max = 500,
      value = 400;
   bpmInput.setAttribute("min", min);
   bpmInput.setAttribute("max", max);
   bpmInput.setAttribute("value", value);
}

function updateRateDisplay() {
   var rateInput = document.querySelector("#inputRate");
   var rateOutput = document.querySelector("#outputRate");
   rateOutput.innerHTML = rateInput.value;
}

function doUserStart() {
   var stInstr = RGINSTR[document.querySelector('#selInstr').selectedIndex].value;
   var stSeqNote = document.querySelector('#seqNote').value;
   var rgstNote = stSeqNote.trim().split(/\s+/);
   var rgnote = rgstNote.map(teoria.note);

   var bpm = document.querySelector("#inputBpm").value;
   var sf = document.querySelector("#inputRate").value;

   beginPhase(stInstr, rgnote, bpm, sf);
}

function beginPhase(stInstr, rgnote, bpm, sfSpeed) {
   stopAll();

   MIDI.loadPlugin({
      soundfontUrl: '../static/midi-js-soundfonts/FluidR3_GM/',
      instrument: stInstr,
      onsuccess: function() {
         MIDI.programChange(0, MIDI.GM.byName[stInstr].number);
         var dtsTotal = (1 / (bpm / 60)) * rgnote.length;
         phase = new Phase(rgnote, sfSpeed, dtsTotal);
         phase.init();
      }
   });
}

function stopAll() {
   if (phase) phase.dispose();
   phase = null;
   drawGrid();
}

function drawGrid() {
   dc.clearRect(0, 0, DUCANVAS, DUCANVAS);
   dc.strokeStyle = '#C4C4B7';

   dc.lineWidth = 1;
   dc.beginPath();
   dc.moveTo(XMID, YMID);

   var a = 4;
   var b = 4;
   for (i = 0; i < 4 * 360; i++) {
      var angle = 0.1 * i;
      var x = XMID + (a + b * angle) * Math.cos(angle);
      var y = YMID + (a + b * angle) * Math.sin(angle);
      dc.lineTo(x, y);
   }
   dc.stroke();

   dc.lineWidth = 3;
   dc.beginPath();
   dc.moveTo(XMID, YMID);
   dc.lineTo(DUCANVAS, YMID);
   dc.stroke();
}
