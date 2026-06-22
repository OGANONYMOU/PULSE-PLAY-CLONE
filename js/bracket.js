// ============================================================
// PulsePay Football Bracket – Copa-style interactive knockout
// ============================================================

const TEAMS = {
  NGA: { name: 'Nigeria',      flag: '🇳🇬' },
  GHA: { name: 'Ghana',        flag: '🇬🇭' },
  SEN: { name: 'Senegal',      flag: '🇸🇳' },
  EGY: { name: 'Egypt',        flag: '🇪🇬' },
  CMR: { name: 'Cameroon',     flag: '🇨🇲' },
  MAR: { name: 'Morocco',      flag: '🇲🇦' },
  CIV: { name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  ALG: { name: 'Algeria',      flag: '🇩🇿' },
  RSA: { name: 'South Africa', flag: '🇿🇦' },
  TUN: { name: 'Tunisia',      flag: '🇹🇳' },
  MLI: { name: 'Mali',         flag: '🇲🇱' },
  COD: { name: 'DR Congo',     flag: '🇨🇩' },
  BFA: { name: 'Burkina Faso', flag: '🇧🇫' },
  GAB: { name: 'Gabon',        flag: '🇬🇦' },
  ZAM: { name: 'Zambia',       flag: '🇿🇲' },
  ANG: { name: 'Angola',       flag: '🇦🇴' },
};

// Group stage data
const GROUPS = [
  {
    name: 'Group A',
    teams: [
      { code: 'NGA', mp: 3, w: 2, d: 1, l: 0, gf: 6, ga: 2, pts: 7 },
      { code: 'SEN', mp: 3, w: 2, d: 0, l: 1, gf: 5, ga: 3, pts: 6 },
      { code: 'TUN', mp: 3, w: 1, d: 1, l: 1, gf: 3, ga: 4, pts: 4 },
      { code: 'GAB', mp: 3, w: 0, d: 0, l: 3, gf: 1, ga: 6, pts: 0 },
    ],
  },
  {
    name: 'Group B',
    teams: [
      { code: 'MAR', mp: 3, w: 3, d: 0, l: 0, gf: 8, ga: 1, pts: 9 },
      { code: 'EGY', mp: 3, w: 2, d: 0, l: 1, gf: 5, ga: 3, pts: 6 },
      { code: 'MLI', mp: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, pts: 3 },
      { code: 'ANG', mp: 3, w: 0, d: 0, l: 3, gf: 0, ga: 7, pts: 0 },
    ],
  },
  {
    name: 'Group C',
    teams: [
      { code: 'CMR', mp: 3, w: 2, d: 1, l: 0, gf: 7, ga: 3, pts: 7 },
      { code: 'ALG', mp: 3, w: 1, d: 1, l: 1, gf: 4, ga: 4, pts: 4 },
      { code: 'ZAM', mp: 3, w: 1, d: 0, l: 2, gf: 3, ga: 5, pts: 3 },
      { code: 'BFA', mp: 3, w: 0, d: 2, l: 1, gf: 2, ga: 4, pts: 2 },
    ],
  },
  {
    name: 'Group D',
    teams: [
      { code: 'CIV', mp: 3, w: 3, d: 0, l: 0, gf: 9, ga: 2, pts: 9 },
      { code: 'GHA', mp: 3, w: 1, d: 1, l: 1, gf: 4, ga: 5, pts: 4 },
      { code: 'RSA', mp: 3, w: 1, d: 0, l: 2, gf: 4, ga: 6, pts: 3 },
      { code: 'COD', mp: 3, w: 0, d: 1, l: 2, gf: 2, ga: 6, pts: 1 },
    ],
  },
];

// Round of 16 pre-set matchups (group 1st vs group 2nd cross)
// Each match: { id, home, away, homeScore, awayScore }
// Scores set = completed, null = to be played
const R16_MATCHES = [
  { id: 'R16-1', home: 'NGA', away: 'EGY',  homeScore: 2, awayScore: 1 },
  { id: 'R16-2', home: 'SEN', away: 'GHA',  homeScore: 3, awayScore: 1 },
  { id: 'R16-3', home: 'MAR', away: 'ALG',  homeScore: 2, awayScore: 0 },
  { id: 'R16-4', home: 'CMR', away: 'CIV',  homeScore: 1, awayScore: 2 },
  { id: 'R16-5', home: 'NGA', away: 'MAR',  homeScore: null, awayScore: null },
  { id: 'R16-6', home: 'SEN', away: 'CIV',  homeScore: null, awayScore: null },
  { id: 'R16-7', home: 'EGY', away: 'CMR',  homeScore: null, awayScore: null },
  { id: 'R16-8', home: 'GHA', away: 'ALG',  homeScore: null, awayScore: null },
];

// Bracket state – stores winners per round
const state = {
  qf: { winners: [null, null, null, null] },
  sf: { winners: [null, null] },
  final: { winner: null },
  third: { winner: null },
};

// ── Helpers ──────────────────────────────────────────────────

function getWinner(match) {
  if (match.homeScore === null) return null;
  if (match.homeScore > match.awayScore) return match.home;
  if (match.awayScore > match.homeScore) return match.away;
  return null; // draw – shouldn't happen in knockout
}

function team(code) {
  return TEAMS[code] || { name: code, flag: '🏳️' };
}

function flagName(code) {
  if (!code) return '<span class="tbd-team">TBD</span>';
  const t = team(code);
  return `${t.flag} ${t.name}`;
}

// ── Group Stage Render ────────────────────────────────────────

function renderGroups() {
  const container = document.getElementById('groups-container');
  container.innerHTML = '';

  GROUPS.forEach((group) => {
    const card = document.createElement('div');
    card.className = 'group-card';

    const qualified = group.teams.slice(0, 2).map(t => t.code);

    card.innerHTML = `
      <div class="group-card-header">
        <h3>${group.name}</h3>
        <span class="group-status completed">Completed</span>
      </div>
      <table class="group-table">
        <thead>
          <tr>
            <th colspan="2">Team</th>
            <th title="Matches Played">MP</th>
            <th title="Wins">W</th>
            <th title="Draws">D</th>
            <th title="Losses">L</th>
            <th title="Goal Difference">GD</th>
            <th title="Points">Pts</th>
          </tr>
        </thead>
        <tbody>
          ${group.teams.map((t, i) => {
            const gd = t.gf - t.ga;
            const gdClass = gd > 0 ? 'gd-positive' : gd < 0 ? 'gd-negative' : '';
            const isQualified = i < 2;
            return `
              <tr>
                <td><span class="team-pos ${isQualified ? 'qualified' : ''}">${i + 1}</span></td>
                <td>
                  <div class="team-cell">
                    <span class="team-flag">${team(t.code).flag}</span>
                    ${team(t.code).name}
                  </div>
                </td>
                <td>${t.mp}</td>
                <td>${t.w}</td>
                <td>${t.d}</td>
                <td>${t.l}</td>
                <td class="${gdClass}">${gd > 0 ? '+' : ''}${gd}</td>
                <td class="pts-cell">${t.pts}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    container.appendChild(card);
  });
}

// ── Match Card Builder ────────────────────────────────────────

function matchCard({ id, home, away, homeScore, awayScore, interactive = false, onSelectWinner }) {
  const winner = homeScore !== null
    ? (homeScore > awayScore ? home : away)
    : null;

  const scoreHome = homeScore !== null ? homeScore : '-';
  const scoreAway = awayScore !== null ? awayScore : '-';
  const isPending = homeScore === null;

  const homeWinner = winner === home;
  const awayWinner = winner === away;

  const div = document.createElement('div');
  div.className = `match-card ${interactive && !winner ? 'interactive' : ''}`;
  div.innerHTML = `
    <div class="match-id">${id}</div>
    <div class="team-row ${homeWinner ? 'winner' : winner ? 'loser' : ''}" data-team="${home}">
      <div class="team-info">
        <span class="match-flag">${team(home).flag}</span>
        <span class="team-name">${team(home).name}</span>
      </div>
      <span class="team-score">${scoreHome}</span>
    </div>
    <div class="team-row ${awayWinner ? 'winner' : winner ? 'loser' : ''}" data-team="${away}">
      <div class="team-info">
        <span class="match-flag">${team(away).flag}</span>
        <span class="team-name">${team(away).name}</span>
      </div>
      <span class="team-score">${scoreAway}</span>
    </div>
    ${isPending && !interactive ? '<div class="pending-label">Click a team to advance</div>' : ''}
  `;

  if (interactive || (home && away && !winner)) {
    div.querySelectorAll('.team-row').forEach(row => {
      row.style.cursor = 'pointer';
      row.addEventListener('click', () => {
        const selected = row.dataset.team;
        if (selected && onSelectWinner) onSelectWinner(selected);
      });
    });
  }

  return div;
}

function tbdMatchCard(id) {
  const div = document.createElement('div');
  div.className = 'match-card';
  div.innerHTML = `
    <div class="match-id">${id}</div>
    <div class="team-row"><div class="team-info"><span class="team-name tbd-team">TBD</span></div><span class="team-score">-</span></div>
    <div class="team-row"><div class="team-info"><span class="team-name tbd-team">TBD</span></div><span class="team-score">-</span></div>
  `;
  return div;
}

// ── Knockout Bracket Render ───────────────────────────────────

function renderKnockout() {
  const tree = document.getElementById('bracket-tree');
  tree.innerHTML = '';

  // Compute R16 winners (first 4 are completed)
  const r16Winners = R16_MATCHES.slice(0, 4).map(m => getWinner(m));

  // QF matchups: r16Winners paired
  const qfPairs = [
    { id: 'QF-1', home: r16Winners[0], away: r16Winners[2] },
    { id: 'QF-2', home: r16Winners[1], away: r16Winners[3] },
    { id: 'QF-3', home: null, away: null },
    { id: 'QF-4', home: null, away: null },
  ];

  // SF matchups
  const sfPairs = [
    { id: 'SF-1', home: state.qf.winners[0], away: state.qf.winners[1] },
    { id: 'SF-2', home: state.qf.winners[2], away: state.qf.winners[3] },
  ];

  // Final
  const finalPair = { id: 'FINAL', home: state.sf.winners[0], away: state.sf.winners[1] };

  // ── Round of 16 (show 4 completed matches) ──
  const r16Col = makeRoundColumn('Round of 16', 4);
  R16_MATCHES.slice(0, 4).forEach(m => {
    r16Col.matches.appendChild(matchCard({ ...m, interactive: false }));
  });
  tree.appendChild(r16Col.col);
  tree.appendChild(makeConnector(4));

  // ── Quarter-finals ──
  const qfCol = makeRoundColumn('Quarter-finals', 4);
  qfPairs.forEach((pair, i) => {
    if (pair.home && pair.away) {
      qfCol.matches.appendChild(matchCard({
        ...pair,
        homeScore: null, awayScore: null,
        interactive: true,
        onSelectWinner: (w) => {
          state.qf.winners[i] = w;
          // Reset downstream
          if (i < 2) { state.sf.winners[0] = null; state.final.winner = null; }
          else        { state.sf.winners[1] = null; state.final.winner = null; }
          state.third.winner = null;
          renderKnockout();
        },
      }));
    } else {
      qfCol.matches.appendChild(tbdMatchCard(pair.id));
    }
  });
  tree.appendChild(qfCol.col);
  tree.appendChild(makeConnector(4));

  // ── Semi-finals ──
  const sfCol = makeRoundColumn('Semi-finals', 2);
  sfPairs.forEach((pair, i) => {
    if (pair.home && pair.away) {
      sfCol.matches.appendChild(matchCard({
        ...pair,
        homeScore: null, awayScore: null,
        interactive: true,
        onSelectWinner: (w) => {
          state.sf.winners[i] = w;
          state.final.winner = null;
          state.third.winner = null;
          renderKnockout();
        },
      }));
    } else {
      sfCol.matches.appendChild(tbdMatchCard(pair.id));
    }
  });
  tree.appendChild(sfCol.col);
  tree.appendChild(makeConnector(2));

  // ── Final ──
  const finCol = document.createElement('div');
  finCol.className = 'round final-round';

  const finLabel = document.createElement('div');
  finLabel.className = 'round-label highlight';
  finLabel.textContent = 'FINAL';
  finCol.appendChild(finLabel);

  const finMatches = document.createElement('div');
  finMatches.className = 'matches-column';

  if (finalPair.home && finalPair.away) {
    finMatches.appendChild(matchCard({
      ...finalPair,
      homeScore: null, awayScore: null,
      interactive: true,
      onSelectWinner: (w) => {
        state.final.winner = w;
        state.third.winner = null;
        renderKnockout();
      },
    }));
  } else {
    const fc = tbdMatchCard('FINAL');
    fc.classList.add('final-match');
    finMatches.appendChild(fc);
  }

  // Champion display
  const champDiv = document.createElement('div');
  champDiv.className = `champion-display ${state.final.winner ? '' : 'pending'}`;
  if (state.final.winner) {
    const t = team(state.final.winner);
    champDiv.innerHTML = `
      <div class="trophy">🏆</div>
      <div class="champion-label">Champion</div>
      <div class="champion-name">${t.flag} ${t.name}</div>
    `;
  } else {
    champDiv.innerHTML = `
      <div class="trophy" style="opacity:0.3">🏆</div>
      <div class="champion-label">Champion</div>
      <div class="champion-name">To Be Determined</div>
    `;
  }

  finMatches.appendChild(champDiv);
  finCol.appendChild(finMatches);
  tree.appendChild(finCol);

  // ── 3rd Place match ──
  renderThirdPlace();
}

function renderThirdPlace() {
  const section = document.getElementById('third-place-section');
  // Losers of SF
  const sf1Loser = state.sf.winners[0]
    ? (state.sf.winners[0] === sfTeam(0, 'home') ? sfTeam(0, 'away') : sfTeam(0, 'home'))
    : null;
  const sf2Loser = state.sf.winners[1]
    ? (state.sf.winners[1] === sfTeam(1, 'home') ? sfTeam(1, 'away') : sfTeam(1, 'home'))
    : null;

  if (!section) return;

  if (sf1Loser && sf2Loser) {
    const card = matchCard({
      id: '3RD PLACE',
      home: sf1Loser,
      away: sf2Loser,
      homeScore: null, awayScore: null,
      interactive: true,
      onSelectWinner: (w) => { state.third.winner = w; renderThirdPlace(); },
    });
    card.classList.add('final-match');
    section.innerHTML = '';
    section.appendChild(card);

    if (state.third.winner) {
      const medal = document.createElement('div');
      medal.style.cssText = 'text-align:center;padding:12px 0 4px;color:#ffa500;font-size:0.9rem;font-weight:600;';
      medal.innerHTML = `🥉 ${team(state.third.winner).flag} ${team(state.third.winner).name} — 3rd Place`;
      section.appendChild(medal);
    }
  } else {
    section.innerHTML = `
      <div class="match-card" style="opacity:0.4">
        <div class="match-id">3RD PLACE</div>
        <div class="team-row"><div class="team-info"><span class="team-name tbd-team">TBD – SF Loser</span></div><span class="team-score">-</span></div>
        <div class="team-row"><div class="team-info"><span class="team-name tbd-team">TBD – SF Loser</span></div><span class="team-score">-</span></div>
      </div>
    `;
  }
}

// Helper: get SF team by index and side
function sfTeam(sfIndex, side) {
  const r16Winners = R16_MATCHES.slice(0, 4).map(m => getWinner(m));
  const pairs = [
    { home: state.qf.winners[0], away: state.qf.winners[1] },
    { home: state.qf.winners[2], away: state.qf.winners[3] },
  ];
  return pairs[sfIndex]?.[side] || null;
}

// ── Column + Connector Builders ────────────────────────────────

function makeRoundColumn(label, matchCount) {
  const col = document.createElement('div');
  col.className = 'round';

  const lbl = document.createElement('div');
  lbl.className = 'round-label';
  lbl.textContent = label.toUpperCase();
  col.appendChild(lbl);

  const matches = document.createElement('div');
  matches.className = 'matches-column';
  col.appendChild(matches);

  return { col, matches };
}

function makeConnector(pairCount) {
  const conn = document.createElement('div');
  conn.className = 'connector';

  // Padding for label height (~38px)
  for (let i = 0; i < pairCount / 2; i++) {
    const pair = document.createElement('div');
    pair.className = 'connector-pair';
    conn.appendChild(pair);
  }
  return conn;
}

// ── Stage Tabs ────────────────────────────────────────────────

function initTabs() {
  const tabs = document.querySelectorAll('.stage-tab');
  const stages = document.querySelectorAll('.bracket-stage');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      stages.forEach(s => s.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.stage).classList.add('active');
    });
  });
}

// ── Reset ─────────────────────────────────────────────────────

function resetBracket() {
  state.qf.winners = [null, null, null, null];
  state.sf.winners = [null, null];
  state.final.winner = null;
  state.third.winner = null;
  renderKnockout();
}

// ── Boot ──────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderGroups();
  renderKnockout();
  initTabs();

  document.getElementById('btn-reset').addEventListener('click', resetBracket);

  document.getElementById('btn-share').addEventListener('click', () => {
    if (navigator.share) {
      navigator.share({ title: 'PulsePay Football Cup Bracket', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const btn = document.getElementById('btn-share');
        btn.textContent = 'Link Copied!';
        setTimeout(() => { btn.textContent = 'Share Bracket'; }, 2000);
      });
    }
  });
});
