function initializeTimeline() {
  const timelineSteps = document.querySelectorAll('.timeline-step');
  const eraPanels = document.querySelectorAll('.era-panel');
  const status = document.querySelector('#timeline-status');

  timelineSteps.forEach((step) => {
    step.addEventListener('click', () => {
      selectEra(step);
    });

    step.addEventListener('keydown', (event) => {
      const currentIndex = Array.from(timelineSteps).indexOf(step);
      let nextIndex;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % timelineSteps.length;
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        nextIndex = (currentIndex - 1 + timelineSteps.length) % timelineSteps.length;
      } else if (event.key === 'Home') {
        nextIndex = 0;
      } else if (event.key === 'End') {
        nextIndex = timelineSteps.length - 1;
      } else {
        return;
      }

      event.preventDefault();
      timelineSteps[nextIndex].focus();
      selectEra(timelineSteps[nextIndex]);
    });
  });

  function selectEra(step) {
    const selectedEra = step.dataset.era;
    const selectedName = step.querySelector('strong').textContent;

    timelineSteps.forEach((item) => {
      const isSelected = item === step;
      item.classList.toggle('is-active', isSelected);
      item.setAttribute('aria-selected', String(isSelected));
    });

    eraPanels.forEach((panel) => {
      const isSelected = panel.dataset.panel === selectedEra;
      panel.hidden = !isSelected;
      panel.classList.toggle('is-visible', isSelected);
    });

    if (status) {
      status.textContent = `Etapa seleccionada: ${selectedName}`;
    }
  }
}

initializeTimeline();
