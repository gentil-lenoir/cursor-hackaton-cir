import { animate } from '../node_modules/framer-motion/dist/es/dom.mjs';

const EASE = [0.22, 1, 0.36, 1];

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function resetElementStyles(el, props = ['opacity', 'transform', 'width']) {
    if (!el) return;
    props.forEach((prop) => {
        el.style.removeProperty(prop);
    });
}

window.CIRMotion = {
    ready: true,

    pageTransition(section) {
        if (!section || prefersReducedMotion()) return;
        animate(
            section,
            { opacity: [0, 1], y: [12, 0] },
            { duration: 0.32, ease: EASE }
        );
    },

    modalEnter(backdrop) {
        if (!backdrop || prefersReducedMotion()) return;
        const content = backdrop.querySelector('.modal-content');
        backdrop.style.opacity = '0';
        animate(backdrop, { opacity: 1 }, { duration: 0.2, ease: 'easeOut' });
        if (content) {
            animate(
                content,
                { opacity: [0, 1], scale: [0.96, 1], y: [12, 0] },
                { duration: 0.28, ease: EASE }
            );
        }
    },

    modalLeave(backdrop, done) {
        if (!backdrop || prefersReducedMotion()) {
            done?.();
            return;
        }

        const content = backdrop.querySelector('.modal-content');
        const tasks = [animate(backdrop, { opacity: 0 }, { duration: 0.16, ease: 'easeIn' })];

        if (content) {
            tasks.push(
                animate(
                    content,
                    { opacity: 0, scale: 0.98, y: 8 },
                    { duration: 0.18, ease: EASE }
                )
            );
        }

        Promise.all(tasks.map((task) => task.finished)).then(() => {
            resetElementStyles(backdrop, ['opacity']);
            resetElementStyles(content, ['opacity', 'transform']);
            done?.();
        });
    },

    statCards(container = document.getElementById('statsGrid')) {
        if (!container || prefersReducedMotion()) return;
        [...container.querySelectorAll('.stat-card')].forEach((card, index) => {
            animate(
                card,
                { opacity: [0, 1], y: [14, 0] },
                { delay: index * 0.05, duration: 0.38, ease: EASE }
            );
        });
    },

    chartContainer(container) {
        if (!container || prefersReducedMotion()) return;

        [...container.querySelectorAll('.chart-row')].forEach((row, index) => {
            animate(
                row,
                { opacity: [0, 1], x: [-10, 0] },
                { delay: index * 0.04, duration: 0.3, ease: EASE }
            );
        });

        [...container.querySelectorAll('.chart-fill')].forEach((fill) => {
            const target = fill.style.width;
            if (!target) return;
            fill.style.width = '0%';
            animate(fill, { width: target }, { duration: 0.55, ease: EASE });
        });
    },

    listStagger(container, itemSelector) {
        if (!container || prefersReducedMotion()) return;
        [...container.querySelectorAll(itemSelector)].forEach((item, index) => {
            animate(
                item,
                { opacity: [0, 1], y: [8, 0] },
                { delay: index * 0.035, duration: 0.28, ease: EASE }
            );
        });
    },

    animateWelcome() {
        if (prefersReducedMotion()) return;
        const welcome = document.querySelector('.dashboard-welcome');
        if (welcome) {
            animate(
                welcome,
                { opacity: [0, 1], y: [16, 0] },
                { duration: 0.45, ease: EASE }
            );
        }
    },
};

window.dispatchEvent(new Event('cir-motion-ready'));
