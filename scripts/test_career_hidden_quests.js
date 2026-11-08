const fs = require('fs');
const assert = require('assert');

console.log('========================================================');
console.log('🧪 TESTING 5F CAREER 1:1 COUNSELING ROOMS HIDDEN QUESTS');
console.log('========================================================\n');

// 1. Check main.js syntax & logic
const mainJs = fs.readFileSync('public/js/main.js', 'utf8');

assert(mainJs.includes('handleCareerCounsel1Interaction'), 'Must have handleCareerCounsel1Interaction');
assert(mainJs.includes('handleCareerCounsel2Interaction'), 'Must have handleCareerCounsel2Interaction');
assert(mainJs.includes('hiddenQuestCareer1'), 'Must track hiddenQuestCareer1');
assert(mainJs.includes('hiddenQuestCareer2'), 'Must track hiddenQuestCareer2');
assert(mainJs.includes('hasHangangwooBookmark'), 'Must track hasHangangwooBookmark');

console.log('✅ 1. Handlers and quest state variables are defined in main.js');

// 2. Mock environment to simulate full quest flow
global.window = {
  AudioManager: {
    playSelect: () => {},
    playFanfare: () => {},
    playCollect: () => {}
  },
  RPGDialog: {
    show: (title, text, icon) => {
      lastDialog = { title, text, icon };
    }
  }
};
global.localStorage = {
  _store: {},
  getItem: function(k) { return this._store[k] || null; },
  setItem: function(k, v) { this._store[k] = String(v); },
  removeItem: function(k) { delete this._store[k]; }
};

let lastDialog = null;

// Mock player and MainApp
class MockApp {
  constructor() {
    this.playerData = {
      studentId: 'test_student',
      name: '테스트학생',
      inventory: [],
      hiddenQuestCareer1: null,
      hasHangangwooBookmark: false,
      hiddenQuestCareer2: null
    };
    this.toasts = [];
  }

  showToast(msg) {
    this.toasts.push(msg);
  }

  getItemCount(id) {
    const item = this.playerData.inventory.find(i => i.item === id);
    return item ? item.count : 0;
  }

  addItem(id, name, count, icon, meta) {
    const item = this.playerData.inventory.find(i => i.item === id);
    if (item) {
      item.count += count;
    } else {
      this.playerData.inventory.push({ item: id, name, count, icon, ...meta });
    }
  }

  removeItem(id, count) {
    const item = this.playerData.inventory.find(i => i.item === id);
    if (!item) return;
    item.count -= count;
    if (item.count <= 0) {
      this.playerData.inventory = this.playerData.inventory.filter(i => i.item !== id);
    }
  }

  saveProgress() {}
}

// Extract handler implementations from mainJs
const methodSlice = mainJs.slice(
  mainJs.indexOf('handleCareerCounsel1Interaction() {'),
  mainJs.indexOf('handleSangdaeDeskInteraction() {')
);
const classObj = eval('(class {\n' + methodSlice + '\n})');
MockApp.prototype.handleCareerCounsel1Interaction = classObj.prototype.handleCareerCounsel1Interaction;
MockApp.prototype.handleCareerCounsel2Interaction = classObj.prototype.handleCareerCounsel2Interaction;
MockApp.prototype.handleHangangwooDeskInteraction = classObj.prototype.handleHangangwooDeskInteraction;

const app = new MockApp();

// Test Quest 1 Step 1: Start
app.handleCareerCounsel1Interaction();
assert.strictEqual(app.playerData.hiddenQuestCareer1, 'in_progress', 'Quest 1 must be in_progress');
assert(lastDialog.title.includes('10년 전 선배의 진로 고민'), 'Title must mention 10년 전 선배의 진로 고민');
console.log('✅ 2. Quest 1 Step 1: Secret note discovered, quest in_progress');

// Test Quest 1 Step 2: Try counsel 1 again without bookmark -> gives hint
app.handleCareerCounsel1Interaction();
assert(lastDialog.text.includes('한강우 국어선생님'), 'Dialog must guide player to Han Kang-woo desk');
assert(!lastDialog.text.includes('29번'), 'Dialog must not mention 29번');
console.log('✅ 3. Quest 1 Step 2: In-progress hint points to Teacher Han Kang-woo (no 29번)');

// Test Quest 1 Step 3: Visit Han Kang-woo desk -> obtains bookmark
app.handleHangangwooDeskInteraction();
assert.strictEqual(app.playerData.hasHangangwooBookmark, true, 'Bookmark must be obtained');
assert(lastDialog.title.includes('숨겨진 책갈피'), 'Bookmark dialog displayed');
console.log('✅ 4. Quest 1 Step 3: Bookmark retrieved from Han Kang-woo desk');

// Test Quest 1 Step 4: Turn in at counsel 1 -> receives exactly 1 ginkgo leaf
const ginkgoBeforeQ1 = app.getItemCount('item_ginkgo');
app.handleCareerCounsel1Interaction();
assert.strictEqual(app.playerData.hiddenQuestCareer1, 'completed', 'Quest 1 must be completed');
assert.strictEqual(app.getItemCount('item_ginkgo'), ginkgoBeforeQ1 + 1, 'Must receive exactly 1 ginkgo leaf');
console.log('✅ 5. Quest 1 Step 4: Turn-in complete! Rewarded exactly 1 황금 은행잎');

// Test Quest 1 Step 5: Post-completion visit
app.handleCareerCounsel1Interaction();
assert(lastDialog.text.includes('완료됨'), 'Dialog must indicate completed state');
console.log('✅ 6. Quest 1 Step 5: Completed text verified');

// Test Quest 2 Step 1: Start
app.handleCareerCounsel2Interaction();
assert.strictEqual(app.playerData.hiddenQuestCareer2, 'in_progress', 'Quest 2 must be in_progress');
assert(lastDialog.title.includes('마음 치유의 특제 허브티'), 'Title must mention 마음 치유의 특제 허브티');
console.log('✅ 7. Quest 2 Step 1: Recipe discovered, quest in_progress');

// Test Quest 2 Step 2: Try without ingredients -> shows requirement
app.handleCareerCounsel2Interaction();
assert(lastDialog.title.includes('재료 준비 중'), 'Dialog must show missing ingredients');
console.log('✅ 8. Quest 2 Step 2: Missing ingredients properly checked (2 Forsythia, 1 Herb)');

// Test Quest 2 Step 3: Add partial ingredients -> still missing
app.addItem('item_forsythia', '개나리 꽃잎', 1, '🌼');
app.handleCareerCounsel2Interaction();
assert.strictEqual(app.playerData.hiddenQuestCareer2, 'in_progress');

// Add full ingredients
app.addItem('item_forsythia', '개나리 꽃잎', 1, '🌼'); // total 2
app.addItem('item_herb', '향긋한 허브', 1, '🌿'); // total 1

// Test Quest 2 Step 4: Turn in at counsel 2 -> consumes ingredients, receives exactly 1 ginkgo leaf
const ginkgoBeforeQ2 = app.getItemCount('item_ginkgo');
app.handleCareerCounsel2Interaction();
assert.strictEqual(app.playerData.hiddenQuestCareer2, 'completed', 'Quest 2 must be completed');
assert.strictEqual(app.getItemCount('item_forsythia'), 0, '2 Forsythia must be consumed');
assert.strictEqual(app.getItemCount('item_herb'), 0, '1 Herb must be consumed');
assert.strictEqual(app.getItemCount('item_ginkgo'), ginkgoBeforeQ2 + 1, 'Must receive exactly 1 ginkgo leaf');
console.log('✅ 9. Quest 2 Step 3 & 4: Ingredients consumed & rewarded exactly 1 황금 은행잎');

// Test Quest 2 Step 5: Post-completion visit
app.handleCareerCounsel2Interaction();
assert(lastDialog.text.includes('완료됨'), 'Dialog must indicate completed state');
console.log('✅ 10. Quest 2 Step 5: Completed text verified');

console.log('\n========================================================');
console.log('🎉 ALL 10 HIDDEN QUEST CHECKS PASSED PERFECTLY!');
console.log('========================================================\n');
