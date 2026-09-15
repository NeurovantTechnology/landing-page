(() => {
  "use strict";

  const root = document.documentElement;
  const nav = document.querySelector(".site-nav");
  const story = document.querySelector(".product-story");
  const deviceWrap = document.querySelector(".device-wrap");
  const repCount = document.getElementById("rep-count");
  const progressRing = document.querySelector(".progress-ring");
  const remaining = document.querySelector(".goal-copy span");
  const verifiedBadge = document.querySelector(".verified-badge");
  const verifiedToast = document.querySelector(".rep-verified");
  const focusState = document.querySelector(".focus-state");
  const appStatusLabels = document.querySelectorAll(".app-status b");
  const chapterNumber = document.querySelector(".chapter-number");
  const chapterName = document.querySelector(".chapter-name");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const pointsUp = {
    head:[358,82],leftShoulder:[314,151],rightShoulder:[365,145],
    leftElbow:[303,229],rightElbow:[396,221],leftWrist:[276,321],rightWrist:[431,315],
    leftHip:[224,237],rightHip:[262,246],leftKnee:[150,293],rightKnee:[178,315],
    leftAnkle:[71,339],rightAnkle:[99,364]
  };
  const pointsDown = {
    head:[355,145],leftShoulder:[316,205],rightShoulder:[365,200],
    leftElbow:[324,264],rightElbow:[388,260],leftWrist:[276,321],rightWrist:[431,315],
    leftHip:[225,285],rightHip:[263,292],leftKnee:[150,318],rightKnee:[178,338],
    leftAnkle:[71,339],rightAnkle:[99,364]
  };
  const bones = [
    ["head","leftShoulder"],["head","rightShoulder"],["leftShoulder","rightShoulder"],
    ["leftShoulder","leftElbow"],["leftElbow","leftWrist"],["rightShoulder","rightElbow"],["rightElbow","rightWrist"],
    ["leftShoulder","leftHip"],["rightShoulder","rightHip"],["leftHip","rightHip"],
    ["leftHip","leftKnee"],["leftKnee","leftAnkle"],["rightHip","rightKnee"],["rightKnee","rightAnkle"]
  ];
  const svgNS = "http://www.w3.org/2000/svg";
  const lineGroup = document.querySelector(".pose-lines");
  const ghostGroup = document.querySelector(".pose-ghost");
  const jointGroup = document.querySelector(".pose-joints");
  const lines = [], ghostLines = [], joints = {};

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const easeInOut = t => t < .5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;

  function createPose() {
    if (!lineGroup || lineGroup.childNodes.length) return;
    bones.forEach(([from,to]) => {
      const ghost = document.createElementNS(svgNS,"line");
      const line = document.createElementNS(svgNS,"line");
      ghostGroup.appendChild(ghost); lineGroup.appendChild(line);
      ghostLines.push({el:ghost,from,to}); lines.push({el:line,from,to});
    });
    Object.keys(pointsUp).forEach(name => {
      const circle = document.createElementNS(svgNS,"circle");
      circle.setAttribute("r",name === "head" ? "8" : "4");
      circle.classList.toggle("core",name === "head" || name.includes("Shoulder") || name.includes("Hip"));
      circle.dataset.joint = name; jointGroup.appendChild(circle); joints[name] = circle;
    });
    updatePose(0);
  }

  function updatePose(depth) {
    if (!Object.keys(joints).length) return;
    const eased = easeInOut(clamp(depth));
    const current = {};
    Object.keys(pointsUp).forEach(name => {
      current[name] = [mix(pointsUp[name][0],pointsDown[name][0],eased),mix(pointsUp[name][1],pointsDown[name][1],eased)];
      joints[name].setAttribute("cx",current[name][0]); joints[name].setAttribute("cy",current[name][1]);
    });
    lines.forEach(({el,from,to}) => {
      el.setAttribute("x1",current[from][0]); el.setAttribute("y1",current[from][1]);
      el.setAttribute("x2",current[to][0]); el.setAttribute("y2",current[to][1]);
    });
    ghostLines.forEach(({el,from,to}) => {
      el.setAttribute("x1",pointsUp[from][0]); el.setAttribute("y1",pointsUp[from][1]);
      el.setAttribute("x2",pointsUp[to][0]); el.setAttribute("y2",pointsUp[to][1]);
    });
  }

  function chapterFor(progress) {
    if (progress < .18) return ["01","Focus lock"];
    if (progress < .36) return ["02","Vision online"];
    if (progress < .52) return ["03","Form analysis"];
    if (progress < .86) return ["04","Reps verified"];
    return ["05","Access restored"];
  }

  let currentRep = -1;
  let lastProgress = -1;
  let frameRequested = false;

  function updateRep(nextRep) {
    nextRep = Math.max(12,Math.min(20,nextRep));
    if (nextRep === currentRep) return;
    currentRep = nextRep;
    repCount.textContent = nextRep;
    remaining.textContent = nextRep === 20 ? "Goal complete" : `${20-nextRep} remaining`;
    progressRing.style.setProperty("--ring-progress",String(nextRep/20));
    progressRing.setAttribute("aria-label",`${nextRep} of 20 push-ups complete`);
  }

  function setCompleted(complete) {
    deviceWrap.classList.toggle("is-complete",complete);
    focusState.textContent = complete ? "released" : "active";
    appStatusLabels.forEach(label => { label.textContent = complete ? "Available" : "Locked"; });
    verifiedBadge.lastChild.textContent = complete ? " Complete" : " Verifying";
  }

  function renderStory() {
    frameRequested = false;
    nav.classList.toggle("is-scrolled",window.scrollY > 40);
    if (!story) return;
    const mobile = window.innerWidth <= 900;
    if (mobile || reducedMotion.matches) {
      const finish = reducedMotion.matches;
      root.style.setProperty("--story-progress",finish ? ".92" : ".55");
      updateRep(finish ? 20 : 13); updatePose(mobile ? .25 : 0); setCompleted(finish);
      verifiedToast.classList.toggle("show",mobile && !finish);
      return;
    }

    const rect = story.getBoundingClientRect();
    const travel = story.offsetHeight-window.innerHeight;
    const progress = clamp(-rect.top/Math.max(1,travel));
    if (Math.abs(progress-lastProgress) < .0005) return;
    lastProgress = progress;
    root.style.setProperty("--story-progress",progress.toFixed(4));

    let poseDepth = 0;
    if (progress >= .42 && progress < .5) poseDepth = (progress-.42)/.08;
    else if (progress >= .5 && progress < .58) poseDepth = 1-(progress-.5)/.08;
    updatePose(poseDepth);

    const repProgress = clamp((progress-.54)/.34);
    updateRep(12+Math.floor(repProgress*8+.0001));
    verifiedToast.classList.toggle("show",progress > .53 && progress < .66);
    setCompleted(progress >= .9);
    const chapter = chapterFor(progress);
    chapterNumber.textContent = chapter[0]; chapterName.textContent = chapter[1];
  }

  function requestRender() {
    if (frameRequested) return;
    frameRequested = true; window.requestAnimationFrame(renderStory);
  }

  document.querySelectorAll("[data-story-progress]").forEach(link => {
    link.addEventListener("click",event => {
      if (window.innerWidth <= 900 || reducedMotion.matches) return;
      event.preventDefault();
      const target = story.offsetTop+(story.offsetHeight-window.innerHeight)*Number(link.dataset.storyProgress);
      window.scrollTo({top:target,behavior:"smooth"});
    });
  });

  async function loadStatus() {
    const statusBox = document.getElementById("status-box");
    try {
      const response = await fetch("status.json");
      if (!response.ok) throw new Error("Status unavailable");
      const data = await response.json(); statusBox.textContent = data.status;
    } catch { statusBox.textContent = "Development in progress."; }
  }

  createPose(); updateRep(12); loadStatus();
  window.addEventListener("scroll",requestRender,{passive:true});
  window.addEventListener("resize",requestRender,{passive:true});
  reducedMotion.addEventListener?.("change",requestRender);
  requestRender();
})();
