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

    const timerCount = setTimeout.call(window, function() {});
    const intervalCount = setInterval.call(window, function() {});
    const rafCount = requestAnimationFrame.call(window, function() {});

    for (i = 0; i <= timerCount; ++i) {
      clearTimeout.call(window, i);
    }

    for (i = 0; i <= intervalCount; ++i) {
      clearInterval.call(window, i);
    }

    for (i = 0; i <= rafCount; ++i) {
      cancelAnimationFrame.call(window, i);
    }
  }
}
