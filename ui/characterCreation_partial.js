  randArchBtn.onclick = renderArchetypes;
  randAbilBtn.onclick = renderAbilities;

  createBtn.onclick = () => {
    const stats = {};
    abilGrid.querySelectorAll('.ability-display').forEach(el => {
      const n = el.dataset.ability;
      stats[n] = Number(el.dataset.value);
    });
    const arch = customArchInput.value.trim() || selectedArchetype;
    onComplete({
      name: nameInput.value.trim(),
      archetype: arch,
      stats
    });
  };

  renderArchetypes();
  renderAbilities();
  validate();
}