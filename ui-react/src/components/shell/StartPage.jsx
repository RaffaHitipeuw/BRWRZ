import { useCallback, useRef, useState } from "react";

import { formatCount } from "../../services/shell/adblock.js";

const QUICK_LINKS = [
  { title: "GitHub", url: "https://github.com", icon: "https://cdn.simpleicons.org/github/181717" },
  { title: "YouTube", url: "https://youtube.com", icon: "https://cdn.simpleicons.org/youtube/FF0000" },
  { title: "Figma Community", url: "https://figma.com/community", icon: "https://cdn.simpleicons.org/figma/F24E1E" },
  { title: "Spotify", url: "https://open.spotify.com", icon: "https://cdn.simpleicons.org/spotify/1DB954" },
  { title: "Google", url: "https://google.com", icon: "https://cdn.simpleicons.org/google/4285F4" },
];

export default function StartPage({ blockedTotal = 0, hidden = false, onNavigate }) {
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");

  const submit = useCallback(
    (event) => {
      event.preventDefault();
      const value = query.trim();
      if (value && typeof onNavigate === "function") {
        onNavigate(value);
        setQuery("");
      }
    },
    [onNavigate, query]
  );

  const openLink = useCallback(
    (url) => {
      if (typeof onNavigate === "function") onNavigate(url);
    },
    [onNavigate]
  );

  return (
    <div className="browser-start" id="browser-start" hidden={hidden}>
      <div className="browser-start-stats" aria-hidden="true">
        <div className="browser-start-stats-card" id="browser-start-stats-card" role="status" hidden>
          <div className="browser-start-stats-card-label">Blocked so far</div>
          <div className="browser-start-stats-card-value" id="browser-start-stats-value">
            {formatCount(blockedTotal)}
          </div>
          <div className="browser-start-stats-card-sub">trackers, ads, and more</div>
        </div>
      </div>

      <div className="mesh-start-content">
        <div className="mesh-start-brand" aria-label="Mesh">
          <img src="assets/mesh-brand/mesh_kecil.svg" alt="" />
          <h1>Good morning!</h1>
        </div>

        <form className="mesh-start-search" onSubmit={submit} role="search">
          <span className="mesh-start-search-icon" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search the Web"
            aria-label="Search the Web"
            autoComplete="off"
          />
          <button type="submit" aria-label="Search">Enter</button>
        </form>

        <div className="mesh-quick-links" aria-label="Quick links">
          {QUICK_LINKS.map((link) => (
            <button type="button" className="mesh-quick-link" key={link.url} onClick={() => openLink(link.url)}>
              <img src={link.icon} alt="" />
              <span>{link.title}</span>
            </button>
          ))}
          <button type="button" className="mesh-quick-link mesh-quick-link-add" onClick={() => inputRef.current?.focus()}>
            <span className="mesh-quick-link-plus">+</span>
            <span>Add shortcut</span>
          </button>
        </div>
      </div>
    </div>
  );
}
