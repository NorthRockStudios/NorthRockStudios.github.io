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
    stat: "0 subclasses per game mode",
    video: "ZQQfKKbMuiA",
    problem:
      "Core AActors require new types for each Game Mode. Ex: A new AGameMode, APlayerController, and so on per mode. This doesn't scale and it forces hard-coded behavior into inheritance.",
    approach:
      "Core AActors are stripped and carry no logic. A single replicated FGameplayTag() represents our GameMode and resolves to a DataTable row listing that contains the UObject components each actor type needs. Adding or removing a mode's behavior is editing a tag list — no C++ subclasses. An RPC handshake around seamless travel reconciles components pre-travel and builds new ones post-world-load, each phase gated on all-client RPC acknowledgment with a configurable timeout that kicks stragglers. Components are stably-named which let replicated references resolve by FName across server and client.",
    result:
      "Entire game modes are defined in DataTables. The architecture is a lighter version Epic's Modular Gameplay system that's used in Lyra.",
    tags: ["C++", "Modular Gameplay", "Replication", "Seamless travel", "Gameplay Tags"],
    source: null,
  },
  {
    title: "Load Balanced & <br>ID Driven Data",
    tag: "An ID addressable DataTable registry where any row is accessible using its unique 4-byte ID.",
    stat: "≈90% less net bandwidth",
    video: null,
    problem:
      "Replicating a reference to data-driven content (Ex. an item or an ability) normally requires replication of a soft object path or NetGUID, and it grows with the payload.",
    approach:
      "A globally accessible DataTable registry addressable via FGameplayTag() or FGlobalDataID() lets any system fetch any table or row from anywhere, no hard references. Each row is identified by a 4-byte handle struct that encodes table Id + row Id. Clients resolve the handle locally to the exact row; heavy data never travels.  The DataTable is also managed by a load balancer that keeps active DT's alive in memory longer and automatically unloads DT's that aren't within a certain period of time.",
    result:
      "A constant 4 bytes per reference regardless of payload size — roughly 95% smaller than soft object path replication and requires little to no CPU cycles to Net Serialize.",
    tags: ["C++", "NetSerialize", "DataTables", "GameplayTags", "Bandwidth"],
    source: null,
  },
  {
    title: "Simplified Input Management",
    tag: "Centralized input handling via priority layering that allows any system to Add/Remove event/s to an input/s.",
    stat: "Tick-less Input Handling",
    video: null,
    problem:
      "EnhancedInput can be a complicated mess to Add/Remove input events to - requiring Input Actions, Mappings, and access to the local players InputComponent.",
    approach:
      "Move input control over to a globally accessible subsystem that can be accessed where ever we have a world context object. This system will receive input directly from our GameInstance object and will be a level below EnhancedInput and actually control which inputs are fed into EnhancedInput after our priority check.",
    result:
      "Easy to manage input events from anywhere that gives us complete control over raw inputs from the player. This also reduces the cost of reading each input by allowing us to add/remove blacklisted keybinds that are completely disregarded.",
    tags: ["C++", "Input", "EnhancedInput"],
    source: null,
  },
  {
    title: "Automated UI <br>Layout & Layering",
    tag: "A custom CommonUI-style framework that allows all UI elements to be uniformly layered and placed.",
    stat: "Zero manual layout/layering",
    video: null,
    problem:
      "The UMG designer hits limits for input routing and automating UI layering. I wanted full control at the lowest level possible to have my UI manage itself.",
    approach:
      "Build an automated priority grid-based layer management that displays and routes inputs based on highest priority layer. Create a Base UI object type that automatically converts the UI's size to the Rows/Cols the UI occupies along with a layer enum that determines if its activateable along with which layer it's placed on.",
    result:
      "Completely automated UI input routing, layering, and placement that uses a grid based system similar to our Inventory's Grid system. UI will be placed within an active layer so long as the layer has space for it's required Row/Col amount.",
    tags: ["C++", "Slate", "UMG", "Input"],
    source: null,
  },
  {
    title: "FAS Grid-based <br>Inventory System",
    tag: "Multiple inventory types using Fast Array Serialization, and each item using our Data ID system.",
    stat: "Efficient delta net serialization",
    video: null,
    problem:
      "UPROPERTY(Replicated) TArray<> replication resends the entire container for every change which also causes each item to re-serialie and ship across the network. This annihilates player bandwidth and overworks our server's CPU.",
    approach:
      "A modular base inventory FAS that supports equipment, crafting, storage, and other inventory types. State replicates via Fast Array Serialization, so only items marked dirty serialize and ship. On top of this each item uses our 4-byte ID handle so item details like name, icon, stats, etc. stay off the network and resolve locally.",
    result:
      "An inventory that only replicates when marked dirty and whose item data costs, like details and placement info, are reduced from 100+ bytes to roughly 6 bytes per item (outside of RPC costs). This is accomplished by avoiding replication on strings/object paths/etc. and pushing the work onto clients to resolve item details locally from our DataTables.",
    tags: ["C++", "Fast Array Serialization", "Replication", "DataTables", "InstancedStruct"],
    source: null,
  },
  {
    title: "Editor Tooling",
    tag: "Slate based Editor UI that makes modifying custom struct property data more streamline.",
    stat: "Designer friendly editor UI",
    video: null,
    problem:
      "Structs/Classes containing multiple variables using UPROPERTY(EditDefaultsOnly) are extremely limited on how you can control their editor layout especially if you need custom restrictions or you want to use outside data to affect available options",
    approach:
      "Use IPropertyTypeCustomization along with Slate to create customized property editor UI.",
    result:
      "Tailored UI that gives full control on how you modify a property inside the Editor",
    tags: ["C++", "Property Customization", "Editor", "Slate", "UMG", "UI"],
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
    return `<div class="modal-video"><iframe src="https://www.youtube.com/embed/${p.video}" title="${p.title} demo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe></div>`;
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
