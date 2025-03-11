class Step {
  constructor(name, duration, param) {
    this.name = name;
    this.duration = duration;
    this.param = param;
  }
}

function addListeners() {
  document.getElementById("fadeInPlay").addEventListener("click", function () {
    const block = document.getElementById("fadeInBlock");
    animaster().fadeIn(block, 5000);
    document.getElementById("fadeInStop").addEventListener("click", function () {
      animaster().resetFadeIn(block);
    });
  });
  document.getElementById("movePlay").addEventListener("click", function () {
    const block = document.getElementById("moveBlock");
    animaster().move(block, 1000, { x: 100, y: 10 });
    document.getElementById("moveStop").addEventListener("click", function () {
      animaster().resetMoveAndScale(block);
    });
  });
  document.getElementById("scalePlay").addEventListener("click", function () {
    const block = document.getElementById("scaleBlock");
    animaster().scale(block, 1000, 1.25);
    document.getElementById("scaleStop").addEventListener("click", function () {
      animaster().resetMoveAndScale(block);
    });
  });
  document.getElementById("fadeOutPlay").addEventListener("click", function () {
    const block = document.getElementById("fadeOutBlock");
    animaster().fadeOut(block, 5000);
    document.getElementById("fadeOutStop").addEventListener("click", function () {
      animaster().resetFadeOut(block);
    });
  });
  document.getElementById("moveAndHidePlay").addEventListener("click", function () {
    const block = document.getElementById("moveAndHideBlock");
    const anim = animaster().addMove(1000 * 0.4, { x: 100, y: 20 }).addFadeOut(1000 * 0.6);
    const controller = anim.play(block);
    document.getElementById("moveAndHideStop").addEventListener("click", function () {
      controller.stop();
      controller.reset();
    });
  });
  document.getElementById("showAndHidePlay").addEventListener("click", function () {
    const block = document.getElementById("showAndHideBlock");
    const anim = animaster().addFadeIn(1000 / 3).addDelay(1000 / 3).addFadeOut(1000 / 3);
    anim.play(block);
  });
  document.getElementById("heartBeatingPlay").addEventListener("click", function () {
    const block = document.getElementById("heartBeatingBlock");
    const controller = animaster().addScale(500, 1.4).addScale(500, 1).play(block, true);
    document.getElementById("heartBeatingStop").addEventListener("click", function () {
      controller.stop();
      controller.reset();
    });
  });
  document.getElementById("customPlay").addEventListener("click", function () {
    const block = document.getElementById("customBlock");
    const customAnimation = animaster()
      .addMove(200, { x: 40, y: 40 })
      .addScale(800, 1.3)
      .addMove(200, { x: 80, y: 0 })
      .addScale(800, 1)
      .addMove(200, { x: 40, y: -40 })
      .addScale(800, 0.7)
      .addMove(200, { x: 0, y: 0 })
      .addScale(800, 1);
    customAnimation.play(block);
  });
  document.getElementById("worryAnimationBlock") && document.getElementById("worryAnimationBlock").addEventListener("click", animaster()
    .addMove(200, { x: 80, y: 0 })
    .addMove(200, { x: 0, y: 0 })
    .addMove(200, { x: 80, y: 0 })
    .addMove(200, { x: 0, y: 0 })
    .buildHandler());
}

function animaster() {
  return {
    fadeIn(element, duration) {
      element.style.transitionDuration = `${duration}ms`;
      element.classList.remove("hide");
      element.classList.add("show");
    },
    fadeOut(element, duration) {
      element.style.transitionDuration = `${duration}ms`;
      element.classList.remove("show");
      element.classList.add("hide");
    },
    move(element, duration, translation) {
      element.style.transitionDuration = `${duration}ms`;
      element.style.transform = getTransform(translation, null);
    },
    scale(element, duration, ratio) {
      element.style.transitionDuration = `${duration}ms`;
      element.style.transform = getTransform(null, ratio);
    },
    resetFadeIn(element) {
      element.style.transitionDuration = "";
      element.classList.remove("show");
      element.classList.add("hide");
    },
    resetFadeOut(element) {
      element.style.transitionDuration = "";
      element.classList.remove("hide");
      element.classList.add("show");
    },
    resetMoveAndScale(element) {
      element.style.transitionDuration = "";
      element.style.transform = "";
    },
    addMove(duration, translation) {
      this._steps.push(new Step("move", duration, translation));
      return this;
    },
    addScale(duration, ratio) {
      this._steps.push(new Step("scale", duration, ratio));
      return this;
    },
    addFadeIn(duration) {
      this._steps.push(new Step("fadeIn", duration));
      return this;
    },
    addFadeOut(duration) {
      this._steps.push(new Step("fadeOut", duration));
      return this;
    },
    addDelay(duration) {
      this._steps.push(new Step("delay", duration));
      return this;
    },
    play(element, cycled = false) {
      let initial = {
        className: element.className,
        transform: element.style.transform,
        transitionDuration: element.style.transitionDuration
      };
      let timeouts = [];
      let totalDuration = this._steps.reduce((sum, step) => sum + step.duration, 0);
      let cycleId;
      let stopped = false;
      let playSteps = () => {
        let delay = 0;
        for (let step of this._steps) {
          let id = setTimeout(() => {
            if (step.name !== "delay") {
              if (step.param !== undefined) {
                this[step.name](element, step.duration, step.param);
              } else {
                this[step.name](element, step.duration);
              }
            }
          }, delay);
          timeouts.push(id);
          delay += step.duration;
        }
        if (cycled && !stopped) {
          cycleId = setTimeout(() => {
            playSteps();
          }, totalDuration);
        }
      };
      playSteps();
      this._steps = [];
      return {
        stop: function () {
          stopped = true;
          for (let id of timeouts) {
            clearTimeout(id);
          }
          clearTimeout(cycleId);
        },
        reset: function () {
          element.className = initial.className;
          element.style.transform = initial.transform;
          element.style.transitionDuration = initial.transitionDuration;
        }
      };
    },
    buildHandler() {
      let animation = this;
      return function () {
        return animation.play(this);
      };
    },
    _steps: []
  };
}

function getTransform(translation, ratio) {
  let result = [];
  if (translation) {
    result.push(`translate(${translation.x}px,${translation.y}px)`);
  }
  if (ratio) {
    result.push(`scale(${ratio})`);
  }
  return result.join(" ");
}

addListeners();
