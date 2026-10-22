/**
 * Crafting & Sentence Unscramble Manager for Soongsil Open World RPG
 * Students assemble English sentences to craft gear and equipment.
 */

class CraftingManager {
  constructor() {
    this.recipes = [];
    this.selectedRecipe = null;
    this.placedWords = [];
    this.availableWords = [];

    // DOM Elements
    this.modal = document.getElementById('modal-crafting');
    this.recipeListEl = document.getElementById('recipe-list');
    this.craftIcon = document.getElementById('craft-icon');
    this.craftName = document.getElementById('craft-name');
    this.craftDesc = document.getElementById('craft-desc');
    this.materialsEl = document.getElementById('craft-materials');
    this.koreanTargetEl = document.getElementById('target-korean-sentence');
    this.slotsContainer = document.getElementById('unscramble-slots');
    this.wordBank = document.getElementById('unscramble-word-bank');
    this.btnCheckCraft = document.getElementById('btn-check-craft');
    this.btnClose = document.getElementById('btn-close-craft-x');

    this.btnClose.addEventListener('click', () => this.close());
    this.btnCheckCraft.addEventListener('click', () => this.attemptCraft());
  }

  async loadRecipes(grade) {
    try {
      const res = await fetch(`/api/craft-recipes?grade=${grade || 1}`);
      this.recipes = await res.json();
      console.log(`[Crafting] Loaded ${this.recipes.length} recipes`);
    } catch (e) {
      console.error('[Crafting] Failed to load recipes', e);
    }
  }

  getFilteredRecipes() {
    if (!this.recipes) return [];
    if (!this.currentCategory) return this.recipes;
    return this.recipes.filter(r => r.category === this.currentCategory);
  }

  open(category = null) {
    this.currentCategory = category;
    const headerTitle = this.modal.querySelector('.modal-header h3');
    if (headerTitle) {
      if (category === 'equipment') {
        headerTitle.innerHTML = '🔨 숭실 장비 제작대 (Equipment Crafting)';
      } else if (category === 'potion') {
        headerTitle.innerHTML = '🧪 숭실 포션·주문서 제작대 (Potion & Scroll Crafting)';
      } else {
        headerTitle.innerHTML = '🔨 숭실 제작대 (Sentence Crafting)';
      }
    }

    const available = this.getFilteredRecipes();
    if (!available || available.length === 0) {
      alert('해당 제작대에서 제작 가능한 레시피가 없습니다.');
      return;
    }
    this.renderRecipeList();
    this.selectRecipe(available[0]);
    this.modal.classList.remove('hidden');
  }

  close() {
    this.modal.classList.add('hidden');
  }

  renderRecipeList() {
    this.recipeListEl.innerHTML = '';
    const available = this.getFilteredRecipes();
    available.forEach(r => {
      const item = document.createElement('div');
      item.className = 'recipe-item' + (this.selectedRecipe && this.selectedRecipe.id === r.id ? ' active' : '');

      // 한글과 (English)를 깔끔하게 분리하여 두 줄로 표시
      let nameKo = r.name;
      let nameEn = '';
      const match = r.name.match(/^(.*?)\s*(\([^\)]+\))$/);
      if (match) {
        nameKo = match[1].trim();
        nameEn = match[2].trim();
      }

      item.innerHTML = `
        <span class="recipe-item-icon">${r.icon}</span>
        <div class="recipe-item-info">
          <div class="recipe-name-ko">${nameKo}</div>
          ${nameEn ? `<div class="recipe-name-en">${nameEn}</div>` : ''}
        </div>
      `;
      item.addEventListener('click', () => {
        this.selectRecipe(r);
      });
      this.recipeListEl.appendChild(item);
    });
  }

  selectRecipe(recipe) {
    this.selectedRecipe = recipe;
    this.renderRecipeList();

    this.craftIcon.innerText = recipe.icon;
    this.craftName.innerText = recipe.name;
    this.craftDesc.innerText = `${recipe.description} (효과: ${recipe.result.effect})`;

    // Check player inventory for materials
    const inv = window.MainApp ? window.MainApp.getInventory() : [];
    this.materialsEl.innerHTML = '';
    recipe.requiredItems.forEach(req => {
      const current = inv.find(i => i.item === req.item);
      const count = current ? current.count : 0;
      const isEnough = count >= req.count;

      const badge = document.createElement('span');
      badge.className = 'mat-badge';
      badge.style.color = isEnough ? '#4ade80' : '#f87171';
      badge.innerText = `${req.name}: ${count}/${req.count}개`;
      this.materialsEl.appendChild(badge);
    });

    // Check gold requirement
    const requiredGold = recipe.requiredGold || 0;
    const playerGold = (window.MainApp && window.MainApp.playerData) ? window.MainApp.playerData.gold : 0;
    if (requiredGold > 0) {
      const isGoldEnough = playerGold >= requiredGold;
      const goldBadge = document.createElement('span');
      goldBadge.className = 'mat-badge';
      goldBadge.style.color = isGoldEnough ? '#fcd34d' : '#f87171';
      goldBadge.style.borderColor = isGoldEnough ? '#d97706' : '#ef4444';
      goldBadge.innerText = `🪙 제작 비용: ${playerGold}/${requiredGold} G`;
      this.materialsEl.appendChild(goldBadge);
    }

    // Setup Unscramble Puzzle
    this.koreanTargetEl.innerText = `"${recipe.unscramble.korean}"`;
    this.placedWords = [];

    // Shuffle words
    const shuffled = [...recipe.unscramble.words].sort(() => Math.random() - 0.5);
    this.availableWords = shuffled.map((w, idx) => ({ id: `w_${idx}_${w}`, text: w }));

    this.renderUnscramble();
  }

  renderUnscramble() {
    // 1. Render Placed Slots
    this.slotsContainer.innerHTML = '';
    if (this.placedWords.length === 0) {
      this.slotsContainer.innerHTML = '<span style="color:#71717a; font-size:13px; padding:6px;">아래 단어 블록을 터치하여 여기에 문장을 조립하세요.</span>';
    } else {
      this.placedWords.forEach((wObj, idx) => {
        const block = document.createElement('div');
        block.className = 'word-block';
        block.style.background = '#2563eb';
        block.innerText = wObj.text;
        block.title = '터치하면 원래 자리로 되돌아갑니다';
        block.addEventListener('click', () => {
          if (window.AudioManager) window.AudioManager.playSelect();
          // Return to available bank
          this.placedWords.splice(idx, 1);
          this.availableWords.push(wObj);
          this.renderUnscramble();
        });
        this.slotsContainer.appendChild(block);
      });
    }

    // 2. Render Available Word Bank
    this.wordBank.innerHTML = '';
    this.availableWords.forEach((wObj, idx) => {
      const block = document.createElement('div');
      block.className = 'word-block';
      block.innerText = wObj.text;
      block.addEventListener('click', () => {
        if (window.AudioManager) window.AudioManager.playSelect();
        // Place in slot
        this.availableWords.splice(idx, 1);
        this.placedWords.push(wObj);
        this.renderUnscramble();
      });
      this.wordBank.appendChild(block);
    });
  }

  attemptCraft() {
    if (!this.selectedRecipe) return;

    // Check sentence order
    const assembled = this.placedWords.map(w => w.text).join(' ');
    const correct = this.selectedRecipe.unscramble.correct;

    if (assembled !== correct) {
      if (window.AudioManager) window.AudioManager.playWrong();
      alert(`문장의 어순이 올바르지 않습니다!\n\n현재 완성한 문장: "${assembled}"\n우리말 뜻을 생각하며 다시 순서를 맞춰보세요!`);
      return;
    }

    // Check materials
    const inv = window.MainApp ? window.MainApp.getInventory() : [];
    for (const req of this.selectedRecipe.requiredItems) {
      const current = inv.find(i => i.item === req.item);
      const count = current ? current.count : 0;
      if (count < req.count) {
        alert(`재료가 부족합니다!\n필요한 '${req.name}'이(가) 부족합니다. (필요: ${req.count}개, 보유: ${count}개)\n교실과 복도에서 퀴즈를 풀어 재료를 모아보세요.`);
        return;
      }
    }

    // Check gold
    const requiredGold = this.selectedRecipe.requiredGold || 0;
    const currentGold = (window.MainApp && window.MainApp.playerData) ? window.MainApp.playerData.gold : 0;
    if (currentGold < requiredGold) {
      alert(`골드가 부족합니다!\n제작 비용으로 ${requiredGold} G가 필요합니다. (현재 보유: ${currentGold} G)\n교실에서 영어 퀴즈를 풀거나 몬스터를 잡아 골드를 모아보세요!`);
      return;
    }

    // Deduct materials & gold & Grant item
    this.selectedRecipe.requiredItems.forEach(req => {
      window.MainApp.removeItem(req.item, req.count);
    });

    if (requiredGold > 0 && window.MainApp && window.MainApp.playerData) {
      window.MainApp.playerData.gold -= requiredGold;
      if (window.MainApp.hudGold) {
        window.MainApp.hudGold.innerText = window.MainApp.playerData.gold;
      }
      window.MainApp.saveProgress();
    }

    const res = this.selectedRecipe.result;
    window.MainApp.addItem(res.item, res.name, 1, res.icon || this.selectedRecipe.icon, {
      type: res.type || 'equipment',
      slot: res.slot || 'accessory',
      stats: res.stats || { atk: 0, def: 0, hp: 0 },
      heal: res.heal || 0,
      effect: res.effect || ''
    });
    window.MainApp.addExp(50);

    alert(`🎉 [${res.name}] 제작 완료!`);
    this.close();
  }
}

window.CraftingManager = CraftingManager;
