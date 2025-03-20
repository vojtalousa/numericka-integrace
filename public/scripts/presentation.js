import { changes, sync } from "./options.js";
import { setDomain, setInteraction, draw, options } from "./chart.js";
import { integrate } from "./integration.js";

options.visualizationLimit = 1000;

const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
const setTransition = (value, long) => {
    document.querySelectorAll(".hideable").forEach((el) => {
        el.classList.toggle("transition", value);
        if (long) el.classList.add("long");
        else el.classList.remove("long");
    });
};
let interval;

const resetIntegration = (segments, lower, upper, hide = true) => {
    changes.function("sin(x)");
    changes.segments(segments);
    changes.method("midpoint");
    changes.lower(lower);
    changes.upper(upper);
    setDomain([-10, 10], [-2, 6]);
    setInteraction(false);
    integrate();
    draw();
    document.querySelectorAll(".hideable").forEach((el) => {
        if (hide) el.classList.add("hide")
        else el.classList.remove("hide")
    });
};

const states = [
    {
        title: "Numerická integrace",
        text: "Vojtěch Louša<br>8.G",
        class: "intro",
        action: () => {
            if (interval) clearInterval(interval);
            resetIntegration(26, "-12", "12");
        },
    },
    {
        title: "Výběr tématu",
        text: "<ul><li>programování + matematika</li><li>vytvoření něčeho nového</li></ul>",
        class: "selection",
        action: () => {
            if (interval) clearInterval(interval);
            resetIntegration(26, "-12", "12");
        },
    },
    {
        title: "Určitý integrál",
        text: "<ul><li>matematický nástroj</li>\n<li>funkce + interval → číslo</li>\n<li>obsah plochy pod křivkou</li>\n<li>různé způsoby jak ho vypočítat</li></ul>",
        class: "integral",
        action: () => {
            if (interval) clearInterval(interval);
            resetIntegration(26, "-12", "12");
            let i = 0;
            interval = setInterval(() => {
                const progress = easeInOutQuad(i / 100);
                changes.segments(26 + 100 * progress);
                const bound = 12 - 8 * progress;
                changes.lower(`-${bound}`);
                changes.upper(`${bound}`);
                integrate();
                draw();
                if (++i > 100) clearInterval(interval);
            }, 10);
        },
    },
    {
        title: "Praktický výstup",
        text: "",
        class: "output",
        action: () => {
            if (interval) clearInterval(interval);
            resetIntegration(126, "-4", "4");
            setTransition(true);
            sync();
            document.querySelectorAll(".hideable").forEach((el) => el.classList.remove("hide"));
            setTimeout(() => setTransition(false), 500);
            let i = 0;
            interval = setInterval(() => {
                const progress = easeInOutQuad(i / 100);
                changes.segments(126 - 120 * progress);
                const bound = 4 - progress;
                changes.lower(`-${bound}`);
                changes.upper(`${bound}`);
                setDomain([-10 + 4 * progress, 10 - 4 * progress], [-2, 6 - 2 * progress]);
                integrate();
                draw();
                sync();
                if (++i > 100) {
                    clearInterval(interval);
                    setInteraction(true);
                }
            }, 10);
        },
    },
    {
        title: 'Porovnání výsledků',
        text: '<img src="images/graph.png">',
        class: 'comparison',
        action: () => {
            if (interval) clearInterval(interval);
            resetIntegration(6, "-3", "3", false);
            setDomain([-6, 6], [-2, 4]);
            setInteraction(false);
        }
    },
    {
        title: 'Děkuji za pozornost',
        text: '',
        class: 'end',
        action: () => {
            if (interval) clearInterval(interval);
            resetIntegration(6, "-3", "3", false);
            setTransition(true, true);
            sync();
            document.querySelectorAll(".hideable").forEach((el) => el.classList.add("hide"));
            setTimeout(() => setTransition(false), 1500);
            let i = 0;
            interval = setInterval(() => {
                const progress = easeInOutQuad(i / 100);
                changes.segments(6 + 120 * progress);
                const bound = 3 + 9 * progress;
                changes.lower(`-${bound}`);
                changes.upper(`${bound}`);
                setDomain([-6 - 4 * progress, 6 + 4 * progress], [-2, 4 + 2 * progress]);
                integrate();
                draw();
                sync();
                if (++i > 100) {
                    clearInterval(interval);
                    setInteraction(true);
                }
            }, 10);
        }
    }
];

let stateIndex = 0;

const changeState = (index) => {
    const state = states[index];
    if (!state) return;
    stateIndex = index;
    document.getElementById("title").innerText = state.title;
    document.getElementById("text").innerHTML = state.text;
    document.getElementById("presentation").className = state.class;
    state.action();
};

changeState(0);

window.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") changeState(stateIndex + 1);
    else if (event.key === "ArrowLeft") changeState(stateIndex - 1);
});
// window.addEventListener("click", () => changeState(stateIndex + 1));