let measureCount = 1
let selectedRhythm = 4

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
            kick: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
            snare: [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
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
            kick: [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1],
            hihat: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
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
        source.connect(audioCtx.destination);
        source.start();
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
        gainNode.gain.value = gainValues[drumType]; // Set the volume (1.0 is default, lower values reduce volume)

        source.connect(gainNode); // Connect source to gain node
        gainNode.connect(audioCtx.destination); // Connect gain node to destination
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

// let allPlaying = false;

// function playAll() {
//     audioCtx.resume();
//     currentNote = 0;
//     currentBeat = 0;
//     allPlaying = !allPlaying;

//     if (allPlaying) {
//         isBassPlaying = false;
//         isDrumPlaying = false;
//         playBassNotes();
//         playDrums();
//         document.querySelector(".play-all").innerText = "Pause Whole Track";
//     } else {
//         isBassPlaying = true;
//         isDrumPlaying = true;
//         playBassNotes();
//         playDrums();
//         document.querySelector(".play-all").innerText = "Play Whole Track";
//     }
// }

let allPlaying = false

let masterClockInterval = null;
let masterStep = 0; // Tracks the sixteenth-note step in the master clock

function playAll() {
    audioCtx.resume();
    masterStep = 0; // Reset clock step
    allPlaying = !allPlaying;

    currentNote = 0; // Reset bass note position
    currentBeat = 0; // Reset drum beat position

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
        playDrumStep(masterStep % 16);
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
