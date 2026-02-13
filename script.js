function openEnvelope() {
    const envelopeSection = document.getElementById('envelope-section');

    // Safety check
    if (!envelopeSection) return;

    // Play Music
    const music = document.getElementById('bg-music');
    if (music) {
        // Set flag optimistically so next page tries to play even if this page is too fast
        sessionStorage.setItem('music_playing', 'true');
        sessionStorage.setItem('music_currentTime', 0); // Default to 0

        music.play().then(() => {
            // If successful quickly, update time
            sessionStorage.setItem('music_currentTime', music.currentTime);
        }).catch(e => {
            console.log("Audio play failed (will try again on next page): ", e);
            // Don't clear flag, let next page try
        });
    }

    // Animate out
    envelopeSection.style.opacity = '0';

    setTimeout(() => {
        // Redirect to new page
        window.location.href = 'nextpage.html';
    }, 800);
}

// Auto-resume music on page load if set
window.addEventListener('load', () => {
    const music = document.getElementById('bg-music');
    if (music && sessionStorage.getItem('music_playing') === 'true') {
        const savedTime = parseFloat(sessionStorage.getItem('music_currentTime')) || 0;
        music.currentTime = savedTime;
        music.volume = 0.5;
        music.play().catch(e => {
            console.log("Autoplay blocked, waiting for interaction");
            // Add a one-time click listener to resume
            document.body.addEventListener('click', () => {
                music.play();
            }, { once: true });
        });
    }
});

function moveButton() {
    const noBtn = document.getElementById('no-btn');

    // Use viewport dimensions to ensure it stays on screen regardless of scroll
    const xMax = window.innerWidth - noBtn.offsetWidth - 20;
    const yMax = window.innerHeight - noBtn.offsetHeight - 20;

    const randomX = Math.random() * xMax;
    const randomY = Math.random() * yMax;

    // Use absolute position relative to body or closest positioned index
    // Since we are in .screen (fixed/absolute), moving it relative to that is fine.
    // However, to make it jump around effectively on mobile:
    noBtn.style.position = 'fixed';
    noBtn.style.left = `${Math.max(10, randomX)}px`; // Ensure it doesn't go off left edge
    noBtn.style.top = `${Math.max(10, randomY)}px`; // Ensure it doesn't go off top edge
}

function acceptValentine() {
    const questionSection = document.getElementById('question-section');
    const successSection = document.getElementById('success-section');

    // Start Audio Mix IMMEDIATELY on user click (Crucial for mobile/GitHub Pages)
    playAudioMix();

    // Launch Confetti!
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff4d6d', '#ff8fa3', '#fff0f3']
    });

    // Continuous confetti for a few seconds
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ff4d6d', '#ff8fa3']
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ff4d6d', '#ff8fa3']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());

    // Transition to success screen
    questionSection.style.opacity = '0';

    setTimeout(() => {
        questionSection.classList.add('hidden');
        questionSection.classList.remove('active');

        successSection.classList.remove('hidden');
        successSection.classList.add('active');

        successSection.classList.add('active');
        document.body.classList.add('success-active'); // Trigger video fade-in

        // Start Slideshow
        showSlides();
    }, 500);
}

// --- Audio & Subtitles ---

function playAudioMix() {
    const voice = document.getElementById('voice-audio');
    const video = document.getElementById('bg-video');

    // Set volumes (Voice louder, video background muted)
    if (voice) voice.volume = 1.0;
    if (video) {
        video.muted = true; // Explicitly mute background video
    }

    // Play everything
    if (voice) {
        const playPromise = voice.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                if (video) video.play();
                const btn = document.getElementById('media-control');
                if (btn) btn.innerText = "⏸️ Pause";
            })
                .catch(error => {
                    console.log("Autoplay prevented:", error);
                    const btn = document.getElementById('media-control');
                    if (btn) btn.innerText = "▶️ Play Audio";
                });
        }

        // Sync subtitles
        voice.ontimeupdate = function () {
            syncSubtitles(voice.currentTime);
        };
    }
}

function toggleMedia() {
    const voice = document.getElementById('voice-audio');
    const video = document.getElementById('bg-video');
    const btn = document.getElementById('media-control');

    if (voice.paused) {
        voice.play();
        if (video) video.play();
        btn.innerText = "⏸️ Pause";
    } else {
        voice.pause();
        if (video) video.pause();
        btn.innerText = "▶️ Play";
    }
}

// FORMAT: [StartTime (seconds), "Lyric Text"]
const lyrics = [
    [0, "🎶 (Music Intro)"],
    [3.5, "I found a love..."],
    [6.0, "For me..."],
    [9.5, "Darling just dive right in..."],
    [13.0, "And follow my lead..."],
    // ADD YOUR LYRICS HERE
];

function syncSubtitles(currentTime) {
    const subtitleEl = document.getElementById('subtitle-container');

    // Find the current lyric
    // We look for the last lyric that has a startTime <= currentTime
    let currentLine = "";

    for (let i = 0; i < lyrics.length; i++) {
        if (currentTime >= lyrics[i][0]) {
            currentLine = lyrics[i][1];
        } else {
            break; // Future lyric, stop checking
        }
    }

    subtitleEl.innerText = currentLine;
}

let slideIndex = 0;

function showSlides() {
    let i;
    let slides = document.getElementsByClassName("slide");

    // Safety check if slides exist
    if (slides.length === 0) return;

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slideIndex++;
    if (slideIndex > slides.length) { slideIndex = 1 }

    slides[slideIndex - 1].style.display = "block";
    setTimeout(showSlides, 3000); // Change image every 3 seconds
}
