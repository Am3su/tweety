/* ====== Actions et démarrage ====== */
const PRESETS = {
  equilibre: { competences: 40, experience: 25, secteur: 15, cout: 20 },
  expertise: { competences: 55, experience: 30, secteur: 5, cout: 10 },
  prix: { competences: 30, experience: 15, secteur: 5, cout: 50 },
  metier: { competences: 35, experience: 20, secteur: 35, cout: 10 }
};

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act; const d = curDem(); const c = curCand(d);
  switch (act) {
    case 'home': closeModal(); U.view = 'dash'; render(); window.scrollTo(0, 0); break;
    case 'close': closeModal(); break;
    case 'profile': modalProfile(false); break;
    case 'backup': exportBackup(); break;
    case 'replay-intro': closeModal(); playIntro(true); break;
    case 'new-dem': modalNewDemande(); break;
    case 'open-dem': U.view = 'dem'; U.demId = el.dataset.id; U.candId = null; U.tab = 'adequation'; render(); window.scrollTo(0, 0); break;
    case 'reset-example':
      confirmBox("Recharger la demande d'exemple (Crédit Horizon, 3 profils) ? Vos autres demandes sont conservées.", 'Recharger', () => {
        S.demandes = S.demandes.filter(x => x.id !== 'dem-exemple'); S.demandes.push(exampleDemande()); saveDemande(); render(); toast('Exemple rechargé');
      }); break;
    case 'edit-dem': modalDemForm(d, false); break;
    case 'source': modalSource(d); break;
    case 'add-cv': modalAddCV(d); break;
    case 'mode': U.mode = el.dataset.m; renderMain(); break;
    case 'preset': d.poids = { ...PRESETS[el.dataset.p] }; for (const k in d.poids) { const i = $('#w-' + k); if (i) { i.value = d.poids[k]; $('#wv-' + k).textContent = d.poids[k]; } } saveDemande(d); renderMain(); break;
    case 'sel-cand': U.candId = el.dataset.id; $$('.ccard').forEach(b => b.setAttribute('aria-selected', b.dataset.id === U.candId)); renderDetail(); $('#detail').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); break;
    case 'tab': U.tab = el.dataset.t; renderDetail(); break;
    case 'interview': modalInterview(d, c); break;
    case 'export': modalExport(d, c); break;
    case 'mail': modalMail(d, c); break;
    case 'edit-cand': modalCandForm(d, c); break;
    case 'del-cand': confirmBox(`Retirer ${esc(c.prenom)} ${esc(c.nom)} de cette demande ?`, 'Retirer', () => { d.candidats = d.candidats.filter(x => x !== c); U.candId = null; saveDemande(d); renderMain(); }); break;
    case 'reparse': (async () => {
      el.disabled = true; el.innerHTML = '<span class="spin"></span> Analyse…';
      let p, via = 'ia'; try { p = await aiParseCV(c.cvText || ''); if (!p || !p.experiences) throw 0; } catch (err) { p = localParseCV(c.cvText || ''); via = 'local'; }
      const n = cleanCand(p); c.experiences = n.experiences; c.competences = n.competences; if (n.certifications.length) c.certifications = n.certifications; if (n.formation.length) c.formation = n.formation;
      saveDemande(d); renderMain(); toast(via === 'ia' ? 'CV ré-analysé par IA' : 'CV ré-analysé par mots-clés');
    })(); break;
    case 'calc-cjm': { const s = +$('#c-sal').value; if (s) { c.salaire = s; c.cout = cjmFromSalary(s); c.tjmPropose = null; saveDemande(d); renderDetail(); refreshLive(); toast('CJM calculé : ' + eur(c.cout)); } break; }
    case 'tjm-set': {
      const A = analyse(d, c); const v = el.dataset.v;
      c.tjmPropose = v === 'budget' ? d.budgetTJM : v === 'cible' ? Math.round(A.tjmCible / 5) * 5 : simulate(d, c).best.tjm;
      $('#tjm').value = c.tjmPropose; saveDemande(d); refreshLive(); break;
    }
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#ov')) closeModal();
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.dcard')) { e.preventDefault(); e.target.click(); }
});
document.addEventListener('input', e => {
  const t = e.target; const d = curDem(); if (!d || $('#ov')?.contains(t)) return;
  if (t.dataset.w) { d.poids[t.dataset.w] = +t.value; $('#wv-' + t.dataset.w).textContent = t.value; saveDemande(d); renderMain(); }
  else if (t.id === 'w-marge') { d.marge = +t.value; $('#wv-marge').textContent = t.value + ' %'; $('#coutmax').textContent = d.budgetTJM ? eur(d.budgetTJM * (1 - d.marge / 100)) : '—'; saveDemande(d); renderMain(); }
  else if (t.id === 'tjm') { const c = curCand(d); c.tjmPropose = +t.value; saveDemande(d); refreshLive(); }
});
document.addEventListener('change', e => {
  const t = e.target; const d = curDem(); if (!d || $('#ov')?.contains(t)) return; const c = curCand(d);
  if (t.id === 'dem-statut') { d.statut = t.value; saveDemande(d); toast('Statut : ' + DEM_STATUS[t.value]); }
  else if (t.id === 'cand-pipe') { c.pipeline = t.value; saveDemande(d); refreshLive(); }
  else if (t.id === 'c-statut') { c.statut = t.value; saveDemande(d); renderDetail(); refreshLive(); }
  else if (t.id === 'c-cout') { c.cout = +t.value || null; c.tjmPropose = null; saveDemande(d); renderDetail(); refreshLive(); }
  else if (t.id === 'c-sal') { c.salaire = +t.value || null; saveDemande(d); }
});

/* Vidéo d'introduction : lecture au démarrage, son activable, bouton « Passer » */
function playIntro(force) {
  const box = $('#intro'), v = $('#intro-video'), snd = $('#intro-sound'), prog = $('#intro-prog');
  return new Promise(done => {
    if (!box || !v || (!force && S.profile.intro === false)) { if (box) box.hidden = true; return done(); }
    box.classList.remove('out'); box.hidden = false;
    let finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      try { v.pause(); } catch (e) { }
      box.classList.add('out'); document.removeEventListener('keydown', onKey);
      setTimeout(() => { box.hidden = true; done(); }, 600);
    };
    const onKey = e => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); finish(); } };
    document.addEventListener('keydown', onKey);
    const showSound = () => { snd.hidden = !v.muted; };
    snd.onclick = () => { v.muted = false; v.volume = 1; v.play().catch(() => { }); showSound(); };
    $('#intro-skip').onclick = finish;
    v.onended = finish;
    v.onerror = finish;
    v.ontimeupdate = () => { if (v.duration) prog.style.width = (v.currentTime / v.duration * 100) + '%'; };
    v.currentTime = 0;
    // Essai avec le son ; si le navigateur le refuse, lecture muette avec bouton « Activer le son »
    v.muted = false;
    v.play().then(showSound).catch(() => { v.muted = true; showSound(); v.play().catch(finish); });
    setTimeout(() => { if (!finished && v.readyState === 0) finish(); }, 8000); // vidéo introuvable
  });
}

initStore();
render();
playIntro().then(() => { if (!S.profile.onboarded) setTimeout(() => modalProfile(true), 150); });
