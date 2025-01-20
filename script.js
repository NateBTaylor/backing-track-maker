let measureCount = 1
let selectedRhythm = 4

let bassVolume = 1
let drumVolume = 1

let currentDrumMeasure = 0
let drumMeasures = [[]]

const bassVolumeSlider = document.getElementById('bass-volume');
const drumVolumeSlider = document.getElementById('drum-volume');

function updateBassVolume() {
    bassVolume = bassVolumeSlider.value
}

function updateDrumVolume() {
    drumVolume = drumVolumeSlider.value
}

let SHEET_ID = "1qAMku0gPh6Vis747VJCAiIg3eL2fg4iZGZ25hPla_Uo"
const backingTrackDB = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`

async function getTrackData(trackID) {

    const response = await fetch(backingTrackDB);
    const text = await response.text();
    

    const json = JSON.parse(text.substring(47).slice(0,-2));
    const rows = json.table.rows;

    // Convert sheet data to an object
    const tracks = {};
    rows.forEach(row => {
        const id = row.c[0]?.v; // Track ID
        const notes = row.c[1]?.v;
        const tempo = row.c[2]?.v;
        const rhythm = row.c[3]?.v;
        const kick = row.c[4]?.v;
        const snare = row.c[5]?.v;
        const tom = row.c[6]?.v;
        const hihat = row.c[7]?.v;
        const crash = row.c[8]?.v;
        const bassVol = row.c[9]?.v;
        const drumVol = row.c[10]?.v;

        tracks[id] = { notes, tempo, rhythm, kick, snare, tom, hihat, crash, bassVol, drumVol };
    });

    return tracks[trackID] || null;
}

// Example: Retrieve track data from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const trackID = urlParams.get("track");

async function getTracks() {
    const response = await fetch(backingTrackDB);
    const text = await response.text();
    

    const json = JSON.parse(text.substring(47).slice(0,-2));
    const rows = json.table.rows;

    // Convert sheet data to an object
    const trackNames = [];
    rows.forEach(row => {
        const id = row.c[0]?.v; // Track ID

        trackNames.push(id)
    });
    let allTracksDisplay = document.querySelector(".more-backing-tracks")
    for (let i = 0; i < trackNames.length; i++) {
        const link = document.createElement("a");
        link.href = `?track=${trackNames[i]}`; // Adjust URL format as needed
        link.innerText = trackNames[i].replace("-", " ");
        link.classList.add("track-link"); // Optional: Add a class for styling
        allTracksDisplay.appendChild(link);
    }
}

getTracks()

if (trackID) {
    getTrackData(trackID).then(track => {
        if (track) {
            fillTrack(track)         
        }
    });
}

function fillTrack(track) {
    let notes = track.notes.split(",")
    let newMeasureCount = notes.length / track.rhythm

    document.getElementById("rhythm-select").value = track.rhythm
    selectedRhythm = track.rhythm
    updateMeasures()

    for (let i = 0; i < newMeasureCount - 1; i++) {
        addMeasure()
    }

    let noteNum = 0
    document.querySelectorAll(".measure").forEach((measure) => {
        measure.querySelectorAll(".note input").forEach((input) => {
            input.value = notes[noteNum]
            noteNum++
        });
    });

    document.getElementById("tempo").value = track.tempo

    const drumPattern = {
        kick: track.kick.split(","),
        snare: track.snare.split(","),
        tom: track.tom.split(","),
        hihat: track.hihat.split(","),
        crash: track.crash.split(",")
    }

    document.querySelectorAll('.drum-instrument').forEach(instrument => {
        const drumType = instrument.getAttribute('data-drum');
        const beats = instrument.querySelectorAll('.beat');

        if (drumPattern[drumType]) {
            beats.forEach((beat, i) => {
                beat.checked = drumPattern[drumType][i] === "1";
            });
        }
    });
    updateMeasureList()

    let drumMeasureCount = track.kick.split(",").length / 16;
    for (let i = 0; i < drumMeasureCount - 1; i++) {
        addDrumMeasure()
        document.querySelectorAll('.drum-instrument').forEach(instrument => {
            const drumType = instrument.getAttribute('data-drum');
            const beats = instrument.querySelectorAll('.beat');
    
            if (drumPattern[drumType]) {
                beats.forEach((beat, j) => {
                    beat.checked = drumPattern[drumType][16 * ( i+ 1) + j] === "1";
                });
            }
        });
        updateMeasureList()
    }
    changeMeasure(0)

    bassVolume = track.bassVol
    document.getElementById("bass-volume").value = bassVolume
    drumVolume = track.drumVol
    document.getElementById("drum-volume").value = drumVolume
}

document.getElementById("rhythm-select").addEventListener("change", function() {
    selectedRhythm = parseInt(this.value, 10);
    updateMeasures();
    if (isBassPlaying) {
        playBassNotes()
    }
    if (currentAudioSource) {
        currentAudioSource.stop();
    }
});

async function publishTrack() {

    let trackName = prompt("Enter a name for your backing track:");
    if (!trackName) return alert("Track name is required. It can be anything.");
    trackName = trackName.trim().replace(/\s+/g, "-").toLowerCase();

    const noteValues = [];
    document.querySelectorAll(".measure").forEach((measure) => {
        measure.querySelectorAll(".note input").forEach((input) => {
            if (input.value == "") {
                noteValues.push(" ")
            } else {
                noteValues.push(input.value.toUpperCase());
            }
        });
    });

    let drums = [[], [], [], [], []]

    for (let i = 0; i < drumMeasures.length; i++) {
        for (let j = 0; j < drumMeasures[i].length; j++) {
            for (let k = 0; k < drumMeasures[i][j].length; k++) {
                drums[j].push(drumMeasures[i][j][k] ? 1 : 0)
            }
        }
    }    

    const trackData = {
        id: trackName,
        bassNotes: noteValues.join(","),
        tempo: document.querySelector("#tempo").value,
        rhythm: document.getElementById("rhythm-select").value,
        kick: drums[0].join(","),
        snare: drums[1].join(","),
        tom: drums[2].join(","),
        hihat: drums[3].join(","),
        crash: drums[4].join(","),
        bassVolume: document.getElementById("bass-volume").value,
        drumVolume: document.getElementById("drum-volume").value
    };

    const response = await fetch("https://script.google.com/macros/s/AKfycbxLK-2G9SMqIa0kr3OTsCyYl2-Azw7BWqLHcmwSGh5IKrOSSiqWpLrz0pW1JJAgPc5A1g/exec", {  // Replace with your Apps Script URL
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(trackData),
    });
    alert("Published at: " +  "natebtaylor.github.io/backing-track-maker/?track=" + trackData.id)
}

function updateMeasures() {
    document.querySelectorAll(".measure").forEach(measure => {
        measure.innerHTML = ''
        for (let i = 0; i < selectedRhythm; i++) {
            let noteDiv = document.createElement("div");
            noteDiv.classList.add("note");

            let noteInput = document.createElement("input");
            noteInput.type = "text";
            noteInput.maxLength = 2;

            noteDiv.appendChild(noteInput);
            measure.appendChild(noteDiv);
        }
    });
    currentNote = 0
}

function addMeasure() {
    measureCount++;
    let newMeasure = document.querySelector(".measure").cloneNode(true)
    
    newMeasure.querySelectorAll("input").forEach(input => {
        input.value = "";
        input.classList.remove("highlight");
    });

    document.querySelector(".measures").appendChild(newMeasure)
}

function removeMeasure() {
    if (measureCount > 1) {
        const measures = document.querySelectorAll(".measure")
        const lastMeasure = measures[measures.length - 1];
        lastMeasure.remove();  // Remove the last measure from the DOM
        measureCount--;
        const noteInputs = [];

        document.querySelectorAll(".measure").forEach(measure => {
            measure.querySelectorAll(".note input").forEach(input => {
                noteInputs.push(input);
            });
        });

        // If the current note is now out of bounds, adjust it
        if (currentNote >= noteInputs.length) {
            currentNote = 0;
        }
    } else {
        return
    }
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and tab content
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        tab.classList.add('active');
        document.querySelector(tab.dataset.target).classList.add('active');
    });
});

const noteAudioFiles = {
    "C": 'https://cdn.freesound.org/previews/162/162940_1883026-lq.mp3',
    "C#": 'https://cdn.freesound.org/previews/162/162944_1883026-lq.mp3',
    "D": 'https://cdn.freesound.org/previews/162/162946_1883026-lq.mp3',
    "D#": 'https://cdn.freesound.org/previews/162/162949_1883026-lq.mp3',
    "E": 'https://cdn.freesound.org/previews/162/162916_1883026-lq.mp3',
    "F": 'https://cdn.freesound.org/previews/162/162920_1883026-lq.mp3',
    "F#": 'https://cdn.freesound.org/previews/162/162924_1883026-lq.mp3',
    "G": 'https://cdn.freesound.org/previews/162/162926_1883026-lq.mp3',
    "G#": 'https://cdn.freesound.org/previews/162/162929_1883026-lq.mp3',
    "A": 'https://cdn.freesound.org/previews/162/162932_1883026-lq.mp3',
    "A#": 'https://cdn.freesound.org/previews/162/162935_1883026-lq.mp3',
    "B": 'https://cdn.freesound.org/previews/162/162937_1883026-lq.mp3',
};

const drumSounds = {
    kick: 'https://cdn.freesound.org/previews/431/431634_1954411-lq.mp3',
    snare: 'https://cdn.freesound.org/previews/693/693156_14904072-lq.mp3',
    hihat: 'https://cdn.freesound.org/previews/674/674296_3130497-lq.mp3',
    crash: 'https://cdn.freesound.org/previews/743/743638_16076002-lq.mp3',
    tom: 'https://cdn.freesound.org/previews/261/261412_3797507-lq.mp3'
};

let drumPresets = ["fourOnTheFloor", "rock", "hipHop", "bossaNova", "funk"]

function loadPreset(presetName) {
    const patterns = {
        fourOnTheFloor: {
            kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            crash: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        rock: {
            kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            crash: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        hipHop: {
            kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0],
            hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            crash: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        bossaNova: {
            kick: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
            snare: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
            hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            crash: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        funk: {
            kick: [1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            tom: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            crash: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
    };

    const selectedPattern = patterns[presetName];

    document.querySelectorAll('.drum-instrument').forEach(instrument => {
        const drumType = instrument.getAttribute('data-drum');
        const beats = instrument.querySelectorAll('.beat');

        if (selectedPattern[drumType]) {
            beats.forEach((beat, i) => {
                beat.checked = !!selectedPattern[drumType][i];
            });
        }
    });

    updateMeasureList()
}

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

let currentAudioSource = null;
let isBassPlaying = false;
let currentNote = 0;
let bassPlaybackInterval = null;
let isLooping = true;

// Cache for audio buffers
const audioBuffers = {};

// Load audio files into audio buffers
async function loadAudioBuffers() {
    const promises = Object.keys(noteAudioFiles).map(async (note) => {
        const response = await fetch(noteAudioFiles[note]);
        const arrayBuffer = await response.arrayBuffer();
        audioBuffers[note] = await audioCtx.decodeAudioData(arrayBuffer);
    });
    await Promise.all(promises);
}

// Play the note for a specific audio buffer
function playNoteAudio(note) {
    if (currentAudioSource) {
        currentAudioSource.stop();
    }

    const buffer = audioBuffers[note];
    if (buffer) {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        const gainNode = audioCtx.createGain(); // Create a gain node
        gainNode.gain.value = bassVolume; // Set the volume (1.0 is default, lower values reduce volume)
        source.connect(gainNode).connect(audioCtx.destination); // Connect source to gain node
        source.start(0);
        currentAudioSource = source;
    }
}

function playBassNotes() {
    audioCtx.resume();
    const tempo = parseInt(document.getElementById("tempo").value, 10);
    if (isNaN(tempo) || tempo <= 0) {
        return;
    }

    const interval = 60000 / tempo / (selectedRhythm / 4);

    isBassPlaying = !isBassPlaying;

    if (isBassPlaying && !allPlaying) {
        document.querySelector(".play-bass").innerText = "Pause Bass Track";

        // noteInputs.forEach((input) => input.classList.remove("highlight"));

        if (bassPlaybackInterval) {
            clearInterval(bassPlaybackInterval);
        }

        const playCurrentNote = () => {
            const noteInputs = [];
            document.querySelectorAll(".measure").forEach((measure) => {
                measure.querySelectorAll(".note input").forEach((input) => {
                    noteInputs.push(input);
                });
            });

            noteInputs.forEach((input, index) => {
                input.classList = index === currentNote ? 'highlight' : '';
            })

            // if (currentNote > 0) {
            //     noteInputs[currentNote - 1].classList.remove("highlight");
            // }

            if (currentNote < noteInputs.length) {
                const inputElement = noteInputs[currentNote];
                const note = inputElement.value.trim().toUpperCase();
                // inputElement.classList.add("highlight");

                if (note) {
                    playNoteAudio(note);
                }

                currentNote++;
            } else if (isLooping) {
                currentNote = 0;
                playCurrentNote();
            } else {
                clearInterval(bassPlaybackInterval);
                isBassPlaying = false;
                currentNote = 0;
                document.querySelector(".play-bass").innerText = "Play Bass Track";
            }
        };

        playCurrentNote();

        bassPlaybackInterval = setInterval(() => {
            playCurrentNote();
        }, interval);
    } else if (isBassPlaying && allPlaying) {
        if (currentAudioSource) {
            currentAudioSource.stop();
        }
        clearInterval(bassPlaybackInterval);
        document.querySelector(".play-bass").innerText = "Pause Bass Track";
    } else {
        if (currentAudioSource) {
            currentAudioSource.stop();
        }
        clearInterval(bassPlaybackInterval);
        document.querySelector(".play-bass").innerText = "Play Bass Track";
    }
}

// Load the audio buffers on page load
loadAudioBuffers();

let drumBuffers = {}; // Cache for drum sound buffers
let gainValues = {
    kick: 0.7,
    snare: 1.1,
    hihat: 1.8,
    crash: 1,
    tom: 0.8
}
let isDrumPlaying = false; // Playback state
let currentBeat = 0; // Tracks the current beat
let drumPlaybackInterval = null; // Reference to the interval loop

let swing = true

// Load drum audio files into AudioContext buffers
async function loadDrumBuffers() {
    const promises = Object.keys(drumSounds).map(async (drum) => {
        const response = await fetch(drumSounds[drum]);
        const arrayBuffer = await response.arrayBuffer();
        drumBuffers[drum] = await audioCtx.decodeAudioData(arrayBuffer);
    });

    await Promise.all(promises);
}

// Play the drum sound for a specific instrument (kick, snare, etc.)
function playDrumSound(drumType) {
    const buffer = drumBuffers[drumType];
    if (buffer) {
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        const gainNode = audioCtx.createGain(); // Create a gain node
        gainNode.gain.value = gainValues[drumType] * drumVolume; // Set the volume (1.0 is default, lower values reduce volume)

        source.connect(gainNode); // Connect source to gain node
        source.connect(gainNode).connect(audioCtx.destination);
        source.start(0);
    }
}

function playBeat() {
    document.querySelectorAll('.drum-instrument').forEach((instrument) => {
        const drumType = instrument.getAttribute('data-drum');
        const beats = Array.from(instrument.querySelectorAll(".beat")); // Convert NodeList to array

        // Ensure currentBeat is within the range of available beats
        if (beats.length > currentBeat && beats[currentBeat].checked) {
            // Play the audio for the beat
            playDrumSound(drumType);
        }
    });
}

// let swingAmount = 0.4; // Adjust this for more or less swing (0 = straight, 0.5 = triplet feel)

function playDrums() {
    audioCtx.resume();
    const playButton = document.querySelector('.play-drums');
    const bpm = document.getElementById("tempo").value || 60; // Get tempo
    const intervalDuration = (60 / bpm) * 1000 / 4; // Time per 16th note

    isDrumPlaying = !isDrumPlaying;

    if (isDrumPlaying && !allPlaying) {
        playButton.innerText = "Pause Drum Track";
        clearInterval(drumPlaybackInterval);

        const playCurrentBeat = () => {
            document.querySelectorAll('.numbers span').forEach((num, index) => {
                num.style.color = index === currentBeat ? '#0078d4' : '';
                num.style.fontWeight = index === currentBeat ? 'bold' : '';
            });

            if (currentBeat < 16) {
                // Play the audio for the beat
                playBeat();
                currentBeat++;
            } else if (isLooping) {
                if (currentDrumMeasure + 1 < drumMeasures.length) {
                    changeMeasure(currentDrumMeasure + 1)
                } else {
                    changeMeasure(0)
                }
                currentBeat = 0; // Reset to the beginning for looping
                playCurrentBeat(); // Play the first note immediately
            } else {
                // Stop playback if not looping
                clearInterval(drumPlaybackInterval);
                isDrumPlaying = false;
                currentBeat = 0;
                playButton.innerText = "Play Drum Track";
            }
        };

        playCurrentBeat();

        // Schedule the rest of the notes
        drumPlaybackInterval = setInterval(() => {
            playCurrentBeat();
        }, intervalDuration);

    } else if (isDrumPlaying && allPlaying) {
        clearInterval(drumPlaybackInterval);
        playButton.innerText = "Pause Drum Track";
    } else {
        clearInterval(drumPlaybackInterval);
        playButton.innerText = "Play Drum Track";
    }
}
loadDrumBuffers()

let allPlaying = false

let masterClockInterval = null;
let masterStep = 0; // Tracks the sixteenth-note step in the master clock

function playAll() {
    audioCtx.resume();
    allPlaying = !allPlaying;

    currentNote = 0; // Reset bass note position
    currentBeat = 0; // Reset drum beat position

    if (currentDrumMeasure > 0) {
        changeMeasure(0)
    }

    masterStep = 0; // Reset clock step

    // Stop any currently playing instruments
    if (isBassPlaying || isDrumPlaying) {
        stopAll(); // Stop both instruments before starting again
    }


    if (allPlaying) {
        isBassPlaying = true;
        isDrumPlaying = true;

        // Get tempo
        const tempo = parseInt(document.getElementById("tempo").value, 10);
        if (isNaN(tempo) || tempo <= 0) {
            return;
        }

        const intervalDuration = (60 / tempo) * 1000 / 4; // Time per 16th note

        masterClockInterval = setInterval(() => {
            masterClockTick();
        }, intervalDuration);

        document.querySelector(".play-all").innerText = "Pause Whole Track";
        document.querySelector(".play-bass").innerText = "Pause Bass Track";
        document.querySelector(".play-drums").innerText = "Pause Drum Track";
    } else {
        // Stop playback
        clearInterval(masterClockInterval);
        masterClockInterval = null;
        document.querySelector(".play-all").innerText = "Play Whole Track";
        document.querySelector(".play-bass").innerText = "Play Bass Track";
        document.querySelector(".play-drums").innerText = "Play Drum Track";
        if (currentAudioSource) {
            currentAudioSource.stop();
        }
        stopAll()
    }
}

function stopAll() {
    // Stop bass playback
    if (isBassPlaying) {
        isBassPlaying = false;
        clearInterval(bassPlaybackInterval);
        if (currentAudioSource) {
            currentAudioSource.stop();
        }
        document.querySelector(".play-bass").innerText = "Play Bass Track";
    }

    // Stop drum playback
    if (isDrumPlaying) {
        isDrumPlaying = false;
        clearInterval(drumPlaybackInterval);
        document.querySelector(".play-drums").innerText = "Play Drum Track";
    }
}

function masterClockTick() {
    // Sixteenth-note logic for drums
    if (isDrumPlaying) {
        playDrumStep(masterStep % 16);  // Play the current step before changing measure
        
        if (masterStep % 16 === 15) {   // Change measure at the LAST step (15), not the first (0)
            if (currentDrumMeasure + 1 < drumMeasures.length) {
                changeMeasure(currentDrumMeasure + 1);
            } else {
                changeMeasure(0);
            }
        }
    }

    // Bass plays according to selected rhythm
    if (masterStep % (16 / selectedRhythm) === 0) {
        if (isBassPlaying) {
            playBassStep(masterStep / (16 / selectedRhythm));
        }
    }

    masterStep = (masterStep + 1) % (16 * measureCount)
}

// Play a drum step based on the master clock
function playDrumStep(step) {
    document.querySelectorAll('.drum-instrument').forEach((instrument) => {
        const drumType = instrument.getAttribute('data-drum');
        const beats = Array.from(instrument.querySelectorAll(".beat")); // Convert NodeList to array

        if (beats.length > step && beats[step].checked) {
            playDrumSound(drumType);
        }
    });

    // Highlight current beat
    document.querySelectorAll('.numbers span').forEach((num, index) => {
        num.style.color = index === step ? '#0078d4' : '';
        num.style.fontWeight = index === step ? 'bold' : '';
    });
}

// Play a bass step based on the master clock
function playBassStep(step) {
    let noteInputs = [];
    document.querySelectorAll(".measure").forEach((measure) => {
        measure.querySelectorAll(".note input").forEach((input) => {
            noteInputs.push(input);
        });
    });

    noteInputs.forEach((input, index) => {
        input.classList = index === step ? 'highlight' : '';
    })

    if (step < noteInputs.length) {

        const inputElement = noteInputs[step];
        const note = inputElement.value.trim().toUpperCase();

        if (note) {
            playNoteAudio(note);
        }
    } else if (isLooping) {
        // Loop back to the start
        currentNote = 0;
    }
}

let bassLinePatterns = {
    "straight" : [8, ["1", "1", "1", "1", "1", "1", "1", "1"]],
    "alternate" : [8, ["1", "5", "1", "5", "1", "5", "1", "5"]],
    "three-note" : [8, ["1", "1", "5", "5", "7", "7", "1", "1"]],
    "" : []
}

function generateTrack() {
    let rawChordProgression = document.getElementById("progression").value.split(",")
    let chordProgression = []
    for (let chord of rawChordProgression) {
        chordProgression.push(chord.toUpperCase().trim())
    }


    let newBassNotes = []
    for (let c of chordProgression) {
        for (let i = 0; i < 8; i++) {
            newBassNotes.push(c)
        }
    }

    selectedRhythm = 8
    document.querySelector(".rhythm-select").value = 8
    updateMeasures()

    let newMeasureAmount = chordProgression.length;

    while (measureCount > 1) {
        removeMeasure()
    }

    for (let i = 0; i < newMeasureAmount - 1; i++) {
        addMeasure()
    }

    let noteNum = 0
    document.querySelectorAll(".measure").forEach((measure) => {
        measure.querySelectorAll(".note input").forEach((input) => {
            input.value = newBassNotes[noteNum]
            noteNum++
        });
    });

    let randomDrums = drumPresets[Math.floor(Math.random() * drumPresets.length)]

    loadPreset(randomDrums)

    document.getElementById("tempo").value = Math.floor(Math.random() * 61) + 60
}

function addDrumMeasure() {
    if (isDrumPlaying) {
        isDrumPlaying = false;
        clearInterval(drumPlaybackInterval);
        document.querySelector(".play-drums").innerText = "Play Drum Track";
    }

    drumMeasures.push([])
    currentDrumMeasure = drumMeasures.length - 1
    clearDrumMachine()

    let newDrumMeasure = document.querySelector(".drum-measure-chip").cloneNode(true)
    newDrumMeasure.innerText = drumMeasures.length
    

    newDrumMeasure.setAttribute("onclick", `changeMeasure(${drumMeasures.length - 1})`)

    const measures = document.querySelectorAll(".drum-measure-chip")
    for (let m of measures) {
        m.classList.remove("chip-on")
    }
    newDrumMeasure.classList.add("chip-on")

    document.querySelector(".drum-measure-selector").insertBefore(newDrumMeasure, document.querySelector(".drum-measure-btns"))
}

function removeDrumMeasure() {
    const drumMeasureContainer = document.querySelector(".drum-measure-selector");
    if (!drumMeasureContainer) {
        return;
    }

    const chips = drumMeasureContainer.querySelectorAll(".drum-measure-chip");

    if (chips.length === 0) {
        return;
    }

    if (chips.length > 1) {
        // Update the measures array and the current measure index
        drumMeasures.pop();
        currentDrumMeasure = Math.max(0, currentDrumMeasure - 1);

        // Remove the last chip from the DOM
        const lastChip = chips[chips.length - 1];
        drumMeasureContainer.removeChild(lastChip);

        // Update the displayed measure
        changeMeasure(currentDrumMeasure);
    } else {
        return
    }
}

function updateMeasureList() {
    let measure = []
    document.querySelectorAll('.drum-instrument').forEach((instrument) => {
        let inst = []
        const beats = Array.from(instrument.querySelectorAll(".beat")); // Convert NodeList to array
        beats.forEach((beat, i) => {
            inst.push(beat.checked)
        });
        measure.push(inst)
    });
    drumMeasures[currentDrumMeasure] = measure
}

function clearDrumMachine() {
    document.querySelectorAll('.drum-instrument').forEach((instrument) => {
        const beats = Array.from(instrument.querySelectorAll(".beat")); // Convert NodeList to array
        beats.forEach((beat, i) => {
            beat.checked = false
        });
    });
    updateMeasureList()
}

function changeMeasure(m) {
    currentDrumMeasure = m
    let currentM = drumMeasures[currentDrumMeasure]
    document.querySelectorAll('.drum-instrument').forEach((instrument, i) => {
        const beats = Array.from(instrument.querySelectorAll(".beat")); // Convert NodeList to array
        beats.forEach((beat, j) => {
            beat.checked = currentM[i][j]
        });
    });

    const measures = document.querySelectorAll(".drum-measure-chip")
    for (let m of measures) {
        m.classList.remove("chip-on")
    }
    measures[currentDrumMeasure].classList.add("chip-on")
}

updateMeasureList()

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        if (audioContext.state === "suspended") {
            audioContext.resume();
        }
    }
});

document.addEventListener("click", () => {
    if (audioContext.state === "suspended") {
        audioContext.resume();
    }
});
