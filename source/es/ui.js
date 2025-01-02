((window) => {
    window.SINGLE_REM = parseInt(window.getComputedStyle(document.documentElement).fontSize);
    globalThis.scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
})(window);

(function (window, undefined) {
    window.passedLocation = [window.location.href];
    window.onpopstate = function () {
        passedLocation.pop();
        if (!passedLocation.length) return;
        window.Reload.goTo(passedLocation[passedLocation.length - 1], true);
    };
    const DOMParserI = new DOMParser();
    window.Reload = {
        goTo: async function (url, isBack = false) {
            document.body.classList.add('being-replaced');
            scrollToTop();
            let NEO_REPLACE_NODE = document.querySelector('#NEO_REPLACE');
            document.querySelector('header.global').classList.remove('collapsed');
            let least_timer = new Promise(resolve => setTimeout(resolve, 200));
            let content = await (await fetch(url)).text();
            await least_timer;
            let newDocument = DOMParserI.parseFromString(content, 'text/html');
            // set url
            if (!isBack) passedLocation.push(url);
            window.history[isBack ? 'replaceState' : 'pushState']('', '', url);
            // process head.
            let newTitle = newDocument.head.querySelector('title').innerHTML;
            let links = [];
            let unusedNodes = [];
            for (let childNode of newDocument.head.childNodes) {
                if (childNode.nodeType !== 1 || childNode.dataset.across) continue;
                switch (childNode.nodeName) {
                    case 'LINK':
                        links.push({
                            rel: childNode.rel,
                            href: childNode.getAttribute('href')
                        })
                        break;
                }
            }
            for (let childNode of document.head.childNodes) {
                if (childNode.nodeType !== 1 || childNode.dataset.across) continue;
                outer: switch (childNode.nodeName) {
                    case 'TITLE':
                        childNode.textContent = newTitle;
                        break;
                    case 'LINK':
                        for (let i = 0; i < links.length; i++) {
                            if (childNode.rel == links[i].rel && childNode.href == links[i].href) {
                                links.splice(i, 1);
                                break outer;
                            }
                        }
                        unusedNodes.push(childNode);
                        break;
                }
            }
            links.forEach(v => {
                let el = document.createElement('link');
                el.rel = v.rel;
                el.href = v.href;
                document.head.appendChild(el);
            });
            unusedNodes.forEach(el => el.remove());
            // process body
            document.body.classList.add('not-ready');
            document.body.classList.remove('being-replaced');
            NEO_REPLACE_NODE.innerHTML = newDocument.querySelector('#NEO_REPLACE').innerHTML;
            document.body.classList.remove('not-ready');
            // scroll pos
            DoOthers();
        }
    };
})(window, void 0);

function DoOthers() {
    document.body.classList.remove('main-anim-finished');
    // TOC
    (async () => {
        await import('./KContentTable.js');
        setTimeout(() => {
            ___KContentTable();
        }, 1);
    })();
    // NavigationBar
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
    } catch(e) {
        console.error(e)
    }
    // Smooth Navigate
    document.querySelectorAll('a.--smooth').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            Reload.goTo(el.href);
        })
        el.classList.remove('--smooth');
    })
    // highlight
    setTimeout(() => {
        if (window.hljs) {
            hljs.highlightAll();
        }
        document.querySelectorAll('#markdown_fillContent pre').forEach(element => {
            let code = element.querySelector('code');
            let con = document.createElement('div'), len = code.textContent.split("\n").length;
            con.classList.add('line-index');
            for (let i = 1; i < len; i++) {
                let index_el = document.createElement('i');
                index_el.textContent = i;
                con.appendChild(index_el);
            }
            element.appendChild(con);
        });
    }, 500);
    // animation
    document.body.classList.add('main-anim');
    setTimeout(() => {
        document.body.classList.remove('main-anim');
        document.body.classList.add('main-anim-finished');
    }, 350);
    // search
    try {
        const Q = (v, s) => v.querySelector(s);
        function Search() {
            let q = document.querySelector('.Neo.SearchComp'),
                p = document.querySelector('.Neo.SearchComp_Panel'),
                dataTable,
                c = p.querySelector('.--P'),
                inputNode = p.querySelector('.--I');
            p.querySelector('.--C').onclick = () => p.open = false;
            let queryResult = async () => {
                let r = new Map;
                c.innerHTML = '';
                let iv = inputNode.value;
                if (!iv) return;
                iv = iv.toLowerCase();
                if (!dataTable) {
                    let fetched = await ((await fetch(q.querySelector('.URL').innerHTML)).text());
                    dataTable = JSON.parse(fetched);
                    dataTable.forEach(v => v.content = v.content.toString().toLowerCase())
                }
                dataTable.forEach(v => {
                    if (v.content.includes(iv)) {
                        r.set(v.atitle, v.href);
                    }
                });
                for (let [k, v] of r)
                    c.innerHTML += `<a href="${v}">${k}</a><hr>`;
            };
            p.querySelector('.--S').onclick = queryResult;
            let ticking = false;
            inputNode.addEventListener('keyup', async () => {
                if (ticking) return;
                ticking = true;
                await queryResult();
                ticking = false;
            });
            p.open = false;
            Q(q, '.openPanel').onclick = () => p.open = true
        }
        Search();

    } catch(e) {}
}
document.addEventListener('DOMContentLoaded', () => {
    new Promise((resolve, reject) => {
        try {
            if (document.getElementById('NEO_SIDE')) {
                fetch('/neo/side-widgets/index.html')
                    .then((resp) => resp.text())
                    .then((value) => {
                        document.getElementById('NEO_SIDE').innerHTML = value;
                        resolve();
                    });
            } else {
                resolve();
            }
        } catch(e) {}
    }).then(() => {
        document.body.classList.add('dom-loaded');
        setTimeout(scrollToTop, 0);
        DoOthers();
        try {
            const NAV_ROOT = document.querySelector('header.global');
            NAV_ROOT.classList.add('anim');
            setTimeout(() => {
                NAV_ROOT.classList.remove('anim')
            }, 500);
        } catch(e) {}
    });
})
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});