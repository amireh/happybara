const {
  setTimeout,
  setInterval,
  clearTimeout,
  clearInterval,
  requestAnimationFrame,
  cancelAnimationFrame,
} = window;

export default class HappybaraTimersCapability {
  clearTimers() {
    let i;

    const timerCount = setTimeout(function() {});
    const intervalCount = setInterval(function() {});
    const rafCount = requestAnimationFrame(function() {});

    for (i = 0; i <= timerCount; ++i) {
      clearTimeout(i);
    }

    for (i = 0; i <= intervalCount; ++i) {
      clearInterval(i);
    }

    for (i = 0; i <= rafCount; ++i) {
      cancelAnimationFrame(i);
    }
  }
}
