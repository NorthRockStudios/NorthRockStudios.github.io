/* ============================================================
   EDIT THIS ARRAY — everything on the page is driven from here.
   - stat: the one mono badge shown on the card (a number sells best)
   - video: a YouTube video ID (the part after "watch?v="), or null
   - problem / approach / result: your case-study writeup
   - source: link to the repo/file, or null to hide the button
   ============================================================ */
const PROJECTS = [
  {
    title: "Modular UObject Components",
    tag: "Data-driven actor composition controlled through FGameplayTag()'s",
    stat: "0 subclasses per mode",
    video: null,
    problem:
      "Game modes usually mean subclassing the core actors — a new AGameMode, PlayerController, and so on per mode. That doesn't scale and it hard-codes behavior into inheritance.",
    approach:
      "Bare-bones core actors carry no logic. A single GameMode FGameplayTag() resolves to a DataTable row listing the net-replicated UObject components each actor type needs. Adding or removing a mode's behavior is editing a tag list — no C++ subclasses. A distributed handshake around seamless travel tears down departing components pre-travel and builds new ones post-world-load, each phase gated on all-client RPC acknowledgment with a configurable timeout that drops stragglers. Stably-named components let replicated references resolve by name across server and client.",
    result:
      "Whole game modes are defined in data. The architecture parallels Epic's Game Features / Modular Gameplay system used in Lyra — reached from first principles.",
    tags: ["C++", "Modular Gameplay", "Replication", "Seamless travel", "Gameplay Tags"],
    source: null,
  },
  {
    title: "ID Driven UDataTable",
    tag: "A tag-addressable DataTable registry where any row is accessible using a 4-byte Id.",
    stat: "≈ [95]% less bandwidth",
    video: null,
    problem:
      "Replicating a reference to data-driven content (an item, an ability) normally means sending a soft object path or NetGUID, and it grows with the payload.",
    approach:
      "A globally accessible DataTable registry addressable via FGameplayTag() or FGlobalDataID() lets any system fetch any table or row from anywhere, no hard references. Each row is identified by a 4-byte handle struct that encodes table Id + row Id. Clients resolve the handle locally to the exact row; heavy data never travels.",
    result:
      "A constant [4] bytes per reference regardless of payload size — roughly [95]% smaller than [soft object path] replication. [Measured: X bytes vs Y bytes for Z.]",
    tags: ["C++", "NetSerialize", "DataTables", "Gameplay Tags", "Bandwidth"],
    source: null,
  },
  {
    title: "Light-weight GAS",
    tag: "A customized light-weight GAS framework that has been heavily modified to reduce bandwidth usage.",
    stat: "[N] ability types",
    video: null,
    problem:
      "Stock GAS is powerful but heavy and opinionated. I wanted a system tailored to the data-driven framework above [and lighter for X].",
    approach:
      "Implemented attributes, gameplay effects, and tag-gated ability activation from the ground up, [with client-predicted activation and server reconciliation].",
    result:
      "A working ability layer integrated with the modular framework, supporting [N] ability types and [prediction / cooldowns / cost].",
    tags: ["C++", "Gameplay Tags", "Prediction", "Replication"],
    source: null,
  },
  {
    title: "UI framework",
    tag: "A CommonUI-style framework written directly on the Slate layer, not the UMG designer.",
    stat: "hand-written Slate",
    video: null,
    problem:
      "The UMG designer hits limits for input routing and layered, stack-based UI. I wanted full control at the widget level.",
    approach:
      "Built activatable widget stacks, layer management, and input routing as hand-written Slate widgets — a CommonUI equivalent tailored to the project.",
    result:
      "[N] reusable widget types with [gamepad / KBM] input routing and a clean layering model.",
    tags: ["C++", "Slate", "UMG", "Input routing"],
    source: null,
  },
  {
    title: "FAS Inventory System",
    tag: "Multiple inventory types over Fast Array Serialization, each item a 4-byte handle.",
    stat: "delta-only sync",
    video: null,
    problem:
      "Naive inventory replication resends the whole container on every change and ships full item structs across the wire.",
    approach:
      "A modular base supports equipment, crafting, storage, and more. State replicates via Fast Array Serialization, so only changed slots go out — and each slot is the 4-byte handle, so item detail (name, icon, stats) stays off the network and resolves locally.",
    result:
      "An inventory update costs roughly [4 bytes × changed items], independent of item complexity. [X bytes vs Y bytes for a Z-item loot.]",
    tags: ["C++", "Fast Array Serialization", "Replication", "DataTables"],
    source: null,
  },
  {
    title: "Custom replication layer",
    tag: "A bespoke replication path built against both legacy property replication and Iris.",
    stat: "Legacy + Iris",
    video: null,
    problem:
      "[The default NetDriver path didn't handle X well / I needed a replication pattern stock replication couldn't express efficiently.]",
    approach:
      "Designed and implemented a custom replication layer targeting both the legacy property-replication path and the newer Iris replication system, [with custom NetSerialize and subobject handling].",
    result:
      "Reduced [replication CPU / bytes-per-actor] by [N]% versus stock replication under [conditions].",
    tags: ["C++", "Legacy replication", "Iris", "NetSerialize"],
    source: null,
  },
];

/* ---------- Render cards ---------- */
const grid = document.getElementById("grid");

PROJECTS.forEach((p, i) => {
  const card = document.createElement("button");
  card.className = "card";
  card.type = "button";
  card.setAttribute("aria-haspopup", "dialog");
  card.innerHTML = `
    <span class="card-arrow" aria-hidden="true">↗</span>
    <span class="card-index">${String(i + 1).padStart(2, "0")}</span>
    <h3 class="card-title">${p.title}</h3>
    <p class="card-tag">${p.tag}</p>
    <span class="card-stat">${p.stat}</span>
  `;
  card.addEventListener("click", () => openModal(i));
  grid.appendChild(card);
});

/* ---------- Modal ---------- */
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modal-body");
let lastFocused = null;

function videoBlock(p) {
  if (p.video) {
    return `<div class="modal-video"><iframe src="https://www.youtube.com/embed/${p.video}" title="${p.title} demo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>`;
  }
  return `<div class="modal-video"><div class="modal-video-placeholder"><span>▶ demo video</span><span>add a YouTube ID to this project in app.js</span></div></div>`;
}

function openModal(i) {
  const p = PROJECTS[i];
  lastFocused = document.activeElement;
  modalBody.innerHTML = `
    <span class="modal-index">System ${String(i + 1).padStart(2, "0")}</span>
    <h3 class="modal-title" id="modal-title">${p.title}</h3>
    ${videoBlock(p)}
    <h4>Problem</h4><p>${p.problem}</p>
    <h4>Approach</h4><p>${p.approach}</p>
    <h4>Result</h4><p>${p.result}</p>
    <div class="modal-tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>
    ${p.source ? `<a class="modal-source" href="${p.source}">View source ↗</a>` : ""}
  `;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  document.querySelector(".modal-close").focus();
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

modal.addEventListener("click", (e) => {
  if (e.target.hasAttribute("data-close")) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) closeModal();
});
