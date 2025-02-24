window.___KContentTable = function () {
    let toc, opened = true;

    const TOC = (markdown_content) => {
        if (!markdown_content) return;
        if (!toc) return;
        let tocList = markdown_content.querySelectorAll("h1, h2, h3, h4, h5, h6");
        let liList = [];
        tocList.forEach((v) => {
            const H = v.nodeName[1];
            let li = document.createElement('li');
            li.classList.add(`li-${H}`);
            // li.setAttribute('pid', pid);
            li.textContent = v.textContent;
            li.addEventListener("click", () => {
                window.scrollBy({ top: v.getBoundingClientRect().y, behavior: "smooth" });
            });
            toc.appendChild(li);
            liList.push(li);
        })
        let tocArr = Array.from(tocList);
        const removeClass = () => {
            liList.forEach(v => v.classList.remove("active"));
        }
        const update = () => {
            for (let i = 0; i < tocArr.length; i++) {
                let v = tocArr[i];
                let rect = v.getBoundingClientRect();
                let top = rect.top + rect.height;
                if (top > 0) {
                    removeClass();
                    let li = liList[i];
                    li.classList.add('active');
                    break;
                }
            }
        }
        let ticking = false;
        window.addEventListener("scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    update();
                    ticking = false;
                })
            }
            ticking = true;
        });
        update();
    }

    // document.addEventListener('DOMContentLoaded', () => {
    toc = document.querySelector('.KContentTable>.kTOC')
    let md_content = document.getElementById('markdown_fillContent')
    TOC(md_content);
    let openButton = document.querySelector('.KContentTable>.kButton');
    if (openButton) openButton.onclick = () => {
        toc.style.display = opened ? 'block' : 'none';
        opened = !opened;
    }
    // })
};

// ___KContentTable();