let isInited = false;

export function navBarInit() {
    if(isInited) return;
    try {
        const NAV_ROOT = document.querySelector('header.global');
        const NAV_BAR_TOGGLE = NAV_ROOT.querySelector('.toggle');
        NAV_BAR_TOGGLE.addEventListener('click', () => {
            NAV_ROOT.classList.toggle('collapsed');
        });
        // Global Focus
        let lastKnownScrollPosition = 0;
        let ticking = false;
        function NavFloatToggle(scrollPos) {
            if (scrollPos >= visualViewport.height / 100 * 37.75 - 5.5 * SINGLE_REM) {
                document.body.classList.add('focus');
            } else {
                document.body.classList.remove('focus');
            }
        }
        document.addEventListener("scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY != lastKnownScrollPosition) {
                        NavFloatToggle(window.scrollY);
                        lastKnownScrollPosition = window.scrollY;
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    } catch (e) {
        console.error(e);
    }
    palette();
    isInited = true;
}

function palette() {
    let paletteButton = document.querySelector('header.global .operations .palette');
    let palettePanel = document.querySelector('header.global .operation-container .palette');
    let panelIsOn = false;
    paletteButton.addEventListener('click', () => {
        panelIsOn = !panelIsOn;
        palettePanel.classList[panelIsOn ? 'add' : 'remove']('on');
    });
    let numberShower = palettePanel.querySelector('.number-show');
    let resetter = palettePanel.querySelector('.reset-button');
    let inputer = palettePanel.querySelector('input.scroller');
    let docRoot = document.querySelector(':root');
    if(localStorage.getItem('0xarch.github.io/color-hue')){
        let hue = localStorage.getItem('0xarch.github.io/color-hue');
        numberShower.innerHTML = hue;
        docRoot.style.setProperty('--config-hue',hue);
    };
    resetter.addEventListener('click',()=>{
        numberShower.innerHTML = '250';
        localStorage.removeItem('0xarch.github.io/color-hue');
        docRoot.style.setProperty('--config-hue',250);
    })
    inputer.addEventListener('input',()=>{
        numberShower.innerHTML = inputer.value;
        docRoot.style.setProperty('--config-hue',inputer.value);
    });
    inputer.addEventListener('change',()=>{
        numberShower.innerHTML = inputer.value;
        localStorage.setItem('0xarch.github.io/color-hue',inputer.value);
        docRoot.style.setProperty('--config-hue',inputer.value);
    });
}