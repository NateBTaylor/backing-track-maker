let measureCount = 1
let selectedRhythm = 4

document.getElementById("rhythm-select").addEventListener("change", function() {
    selectedRhythm = parseInt(this.value, 10);
    updateMeasures();
    if (isPlaying) {
        playNotes()
    }
    currentNote = 0
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

    currentNote = 0

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


const noteAudioFiles = {
    "C": new Audio('sounds/bass_notes/c.wav'),
    "C#": new Audio('sounds/bass_notes/csharp.wav'),
    "D": new Audio('sounds/bass_notes/d.wav'),
    "D#": new Audio('sounds/bass_notes/dsharp.wav'),
    "E": new Audio('sounds/bass_notes/e.wav'),
    "F": new Audio('sounds/bass_notes/f.wav'),
    "F#": new Audio('sounds/bass_notes/fsharp.wav'),
    "G": new Audio('sounds/bass_notes/g.wav'),
    "G#": new Audio('sounds/bass_notes/gsharp.wav'),
    "A": new Audio('sounds/bass_notes/a.wav'),
    "A#": new Audio('sounds/bass_notes/asharp.wav'),
    "B": new Audio('sounds/bass_notes/b.wav'),
};

const audioCtx = new (window.AudioContext || window.webkitAudioContext)

let currentAudio = null;  // Track the currently playing audio
let isBassPlaying = false;
let currentNote = 0;  // Current note index
let bassPlaybackInterval = null; // Interval reference
let isLooping = true; // Enable looping by default

// Play the note for a specific audio file
function playNoteAudio(note) {
    // Stop the current note if it's playing
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;  // Reset the audio to the start
    }

    // Get the new audio for the note
    const audio = noteAudioFiles[note.toString()];
    if (audio) {
        audio.currentTime = 0;  // Ensure the audio starts from the beginning
        audio.play();
        currentAudio = audio;  // Set the new audio as the currently playing one
    }
}

function playBassNotes() {
    audioCtx.resume()
    const tempo = parseInt(document.getElementById("tempo").value, 10);
    if (isNaN(tempo) || tempo <= 0) {
        console.log("Invalid tempo. Please enter a positive number.");
        return;
    }

    const interval = 60000 / tempo / (selectedRhythm / 4);

    const noteInputs = [];
    document.querySelectorAll(".measure").forEach(measure => {
        measure.querySelectorAll(".note input").forEach(input => {
            noteInputs.push(input);
        });
    });

    isBassPlaying = !isBassPlaying;

    if (isBassPlaying) {
        document.querySelector(".play-bass").innerText = "Pause Track";
        for (let i = 0; i < noteInputs.length; i++) {
            noteInputs[i].classList.remove("highlight")
        }

        // Stop any existing interval
        if (bassPlaybackInterval) {
            clearInterval(bassPlaybackInterval);
        }

        const playCurrentNote = () => {
            if (currentNote > 0) {
                noteInputs[currentNote - 1].classList.remove("highlight");
            }

            if (currentNote < noteInputs.length) {
                const inputElement = noteInputs[currentNote];
                const note = inputElement.value.trim().toUpperCase();
                inputElement.classList.add("highlight");
                // Play the audio for the note
                if (note) {
                    playNoteAudio(note);
                }

                currentNote++;
            } else if (isLooping) {
                currentNote = 0; // Reset to the beginning for looping
                playCurrentNote(); // Play the first note immediately
            } else {
                // Stop playback if not looping
                clearInterval(bassPlaybackInterval);
                isBassPlaying = false;
                currentNote = 0;
                document.querySelector(".play-bass").innerText = "Play Track";
            }
        };

        // Play the first note immediately
        playCurrentNote();

        // Schedule the rest of the notes
        bassPlaybackInterval = setInterval(() => {
            playCurrentNote();
        }, interval);

    } else {
        // When paused, stop the audio and reset
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
        }
        clearInterval(bassPlaybackInterval);
        document.querySelector(".play-bass").innerText = "Play Track";
    }
}

const drumSounds = {
    kick: document.getElementById('kick'),
    snare: document.getElementById('snare'),
    closedHiHat: document.getElementById('closedHiHat'),
    openHiHat: document.getElementById('openHiHat'),
    crash: document.getElementById('crash'),
    tom: document.getElementById('tom')
};


let isDrumPlaying = false; // Playback state
let currentBeat = 0; // Tracks the current beat
let drumPlaybackInterval = null; // Reference to the interval loop

function playBeat() {
    document.querySelectorAll('.drum-instrument').forEach((instrument) => {
        const drumType = instrument.getAttribute('data-drum');
        const beats = Array.from(instrument.querySelectorAll(".beat")); // Convert NodeList to array

        // Ensure currentBeat is within the range of available beats
        if (beats.length > currentBeat && beats[currentBeat].checked) {
            const sound = drumSounds[drumType];
            if (sound) {
                sound.currentTime = 0; // Reset sound to start
                sound.play();
            } else {
                console.warn(`Sound not found for drum type: ${drumType}`);
            }
        }
    });
}

function playDrums() {
    audioCtx.resume()
    const playButton = document.querySelector('.play-drums');
    const bpm = document.getElementById("tempo").value || 60; // Get tempo
    const intervalDuration = (60 / bpm) * 1000 / 4; // Time per 16th note

    isDrumPlaying = !isDrumPlaying;

    if (isDrumPlaying) {
        // Pause the playback
        playButton.innerText = "Pause Drum Track"
        clearInterval(drumPlaybackInterval);
        document.querySelector(".play-drums").innerText = "Pause Track";

        // Stop any existing interval
        if (drumPlaybackInterval) {
            clearInterval(drumPlaybackInterval);
        }

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
                document.querySelector(".play-drums").innerText = "Play Drum Track";
            }
        };

        playCurrentBeat();

        // Schedule the rest of the notes
        drumPlaybackInterval = setInterval(() => {
            playCurrentBeat();
        }, intervalDuration);
    } else {
        clearInterval(drumPlaybackInterval);
        document.querySelector(".play-drums").innerText = "Play Drum Track";
    }
}


let allPlaying = false

function playAll() {
    audioCtx.resume()
    currentNote = 0
    currentBeat = 0

    allPlaying = !allPlaying

    if (allPlaying) {
        isBassPlaying = false
        isDrumPlaying = false
        playBassNotes()
        playDrums()
        document.querySelector(".play-all").innerText = "Pause Whole Track"
    } else {
        isBassPlaying = true
        isDrumPlaying = true
        playBassNotes()
        playDrums()
        document.querySelector(".play-all").innerText = "Play Whole Track"
    }
}


function preloadAudio(audioFiles) {
    const promises = Object.values(audioFiles).map(audio => {
        return new Promise((resolve, reject) => {
            audio.preload = "auto";
            audio.load();
            audio.addEventListener("canplaythrough", resolve, { once: true });
            audio.addEventListener("error", reject, { once: true });
        });
    });

    return Promise.all(promises).then(() => {
        console.log("All audio files preloaded successfully");
    }).catch(error => {
        console.error("Error preloading audio files:", error);
    });
}

preloadAudio(noteAudioFiles);
preloadAudio(drumSounds);