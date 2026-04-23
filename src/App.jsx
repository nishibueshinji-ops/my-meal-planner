import { useState, useMemo, useCallback, useReducer, useEffect, useRef } from "react";

// ============================================================
// SECTION 1: デフォルトマスタデータ（localStorageのフォールバック兼リセット用）
// ============================================================
const IM_DEFAULT = {
  鶏むね肉:    { unit:"g",   price100:80,   shelfDays:3,   frozen:true,  buyUnit:300,  buyUnitLabel:"1枚(300g)",      surplusOk:false },
  豚こま肉:    { unit:"g",   price100:75,   shelfDays:3,   frozen:true,  buyUnit:250,  buyUnitLabel:"1パック(250g)",   surplusOk:false },
  豚バラ肉:    { unit:"g",   price100:110,  shelfDays:3,   frozen:true,  buyUnit:200,  buyUnitLabel:"1パック(200g)",   surplusOk:false },
  合いびき肉:  { unit:"g",   price100:100,  shelfDays:2,   frozen:true,  buyUnit:200,  buyUnitLabel:"1パック(200g)",   surplusOk:false },
  鮭:          { unit:"g",   price100:200,  shelfDays:2,   frozen:true,  buyUnit:100,  buyUnitLabel:"1切(100g)",       surplusOk:false },
  サバ缶:      { unit:"個",  priceEach:130, shelfDays:730, frozen:false, buyUnit:1,    buyUnitLabel:"1缶",             surplusOk:true  },
  卵:          { unit:"個",  priceEach:25,  shelfDays:21,  frozen:false, buyUnit:10,   buyUnitLabel:"1パック(10個)",   surplusOk:false },
  豆腐:        { unit:"丁",  priceEach:88,  shelfDays:5,   frozen:false, buyUnit:1,    buyUnitLabel:"1丁",             surplusOk:false },
  納豆:        { unit:"P",   priceEach:40,  shelfDays:7,   frozen:false, buyUnit:3,    buyUnitLabel:"3パックセット",   surplusOk:false },
  もやし:      { unit:"g",   price100:20,   shelfDays:3,   frozen:false, buyUnit:200,  buyUnitLabel:"1袋(200g)",       surplusOk:false },
  キャベツ:    { unit:"g",   price100:15,   shelfDays:14,  frozen:false, buyUnit:500,  buyUnitLabel:"1/2玉(500g)",     surplusOk:true  },
  玉ねぎ:      { unit:"個",  priceEach:50,  shelfDays:30,  frozen:false, buyUnit:4,    buyUnitLabel:"4個袋",           surplusOk:true  },
  じゃがいも:  { unit:"個",  priceEach:60,  shelfDays:30,  frozen:false, buyUnit:4,    buyUnitLabel:"4個袋",           surplusOk:true  },
  人参:        { unit:"本",  priceEach:60,  shelfDays:14,  frozen:false, buyUnit:3,    buyUnitLabel:"3本袋",           surplusOk:true  },
  大根:        { unit:"本",  priceEach:100, shelfDays:14,  frozen:false, buyUnit:1,    buyUnitLabel:"1本",             surplusOk:true  },
  長ねぎ:      { unit:"本",  priceEach:80,  shelfDays:7,   frozen:false, buyUnit:2,    buyUnitLabel:"2本束",           surplusOk:false },
  ほうれん草:  { unit:"g",   price100:60,   shelfDays:4,   frozen:false, buyUnit:200,  buyUnitLabel:"1束(200g)",       surplusOk:false },
  ご飯米:      { unit:"g",   price100:6,    shelfDays:365, frozen:false, buyUnit:5000, buyUnitLabel:"5kg袋",           surplusOk:true  },
  うどん乾:    { unit:"g",   price100:20,   shelfDays:365, frozen:false, buyUnit:500,  buyUnitLabel:"5食入",           surplusOk:true  },
  スパゲッティ:{ unit:"g",   price100:25,   shelfDays:365, frozen:false, buyUnit:500,  buyUnitLabel:"500g袋",          surplusOk:true  },
  味噌:        { unit:"g",   price100:40,   shelfDays:90,  frozen:false, buyUnit:400,  buyUnitLabel:"1パック(400g)",   surplusOk:true  },
  醤油:        { unit:"ml",  price100:25,   shelfDays:365, frozen:false, buyUnit:500,  buyUnitLabel:"500mlボトル",     surplusOk:true  },
  みりん:      { unit:"ml",  price100:30,   shelfDays:365, frozen:false, buyUnit:400,  buyUnitLabel:"400mlボトル",     surplusOk:true  },
  ごま油:      { unit:"ml",  price100:100,  shelfDays:365, frozen:false, buyUnit:200,  buyUnitLabel:"200mlボトル",     surplusOk:true  },
  カレールー:  { unit:"g",   price100:200,  shelfDays:365, frozen:false, buyUnit:90,   buyUnitLabel:"1箱(90g/4皿分)", surplusOk:true  },
  豆板醤:      { unit:"g",   price100:80,   shelfDays:365, frozen:false, buyUnit:100,  buyUnitLabel:"1瓶(100g)",       surplusOk:true  },
  ケチャップ:  { unit:"g",   price100:40,   shelfDays:365, frozen:false, buyUnit:300,  buyUnitLabel:"1本(300g)",       surplusOk:true  },
  パン粉:      { unit:"g",   price100:30,   shelfDays:180, frozen:false, buyUnit:200,  buyUnitLabel:"1袋(200g)",       surplusOk:true  },
};

const RM_DEFAULT = {
  // ─── バランス系 ───
  鶏むね照り焼き:    { cat:"balance", tags:["肉","主菜"],          ing:[{n:"鶏むね肉",g:150},{n:"ご飯米",g:150},{n:"醤油",ml:15},{n:"みりん",ml:10}] },
  豚汁定食:          { cat:"balance", tags:["肉","汁物"],          ing:[{n:"豚こま肉",g:80},{n:"大根",g:100},{n:"人参",g:50},{n:"玉ねぎ",count:0.25},{n:"ご飯米",g:150},{n:"味噌",g:20}] },
  卵炒飯:            { cat:"balance", tags:["卵","主食"],          ing:[{n:"卵",count:2},{n:"ご飯米",g:200},{n:"長ねぎ",count:0.25},{n:"醤油",ml:10},{n:"ごま油",ml:5}] },
  豆腐味噌汁定食:    { cat:"balance", tags:["豆腐","汁物"],        ing:[{n:"豆腐",count:0.5},{n:"長ねぎ",count:0.25},{n:"ご飯米",g:150},{n:"味噌",g:15},{n:"納豆",count:1}] },
  鮭塩焼き定食:      { cat:"balance", tags:["魚","主菜"],          ing:[{n:"鮭",g:100},{n:"ご飯米",g:150},{n:"キャベツ",g:80},{n:"大根",g:50}] },
  野菜炒め定食:      { cat:"balance", tags:["肉","野菜"],          ing:[{n:"豚こま肉",g:100},{n:"もやし",g:100},{n:"キャベツ",g:100},{n:"ご飯米",g:150},{n:"醤油",ml:10},{n:"ごま油",ml:5}] },
  麻婆豆腐:          { cat:"balance", tags:["肉","豆腐","中華"],   ing:[{n:"豚こま肉",g:80},{n:"豆腐",count:0.5},{n:"長ねぎ",count:0.25},{n:"ご飯米",g:150},{n:"豆板醤",g:10},{n:"醤油",ml:10},{n:"ごま油",ml:5}] },
  肉じゃが:          { cat:"balance", tags:["肉","煮物"],          ing:[{n:"豚こま肉",g:100},{n:"じゃがいも",count:1.5},{n:"玉ねぎ",count:0.5},{n:"人参",count:0.5},{n:"ご飯米",g:150},{n:"醤油",ml:15},{n:"みりん",ml:15}] },
  オムライス:        { cat:"balance", tags:["卵","洋食"],          ing:[{n:"卵",count:2},{n:"鶏むね肉",g:80},{n:"玉ねぎ",count:0.25},{n:"ご飯米",g:200},{n:"ケチャップ",g:30}] },
  納豆ご飯と卵焼き:  { cat:"balance", tags:["卵","発酵"],          ing:[{n:"納豆",count:1},{n:"卵",count:2},{n:"ご飯米",g:150},{n:"醤油",ml:5},{n:"みりん",ml:5}] },
  かけうどん:        { cat:"balance", tags:["麺類"],               ing:[{n:"うどん乾",g:100},{n:"長ねぎ",count:0.25},{n:"醤油",ml:15},{n:"みりん",ml:10},{n:"卵",count:1}] },
  ハンバーグ定食:    { cat:"balance", tags:["肉","洋食"],          ing:[{n:"合いびき肉",g:150},{n:"玉ねぎ",count:0.3},{n:"卵",count:0.5},{n:"パン粉",g:20},{n:"ご飯米",g:150},{n:"キャベツ",g:80},{n:"ケチャップ",g:20}] },
  サバ味噌煮:        { cat:"balance", tags:["魚","煮物"],          ing:[{n:"サバ缶",count:1},{n:"大根",g:100},{n:"ご飯米",g:150},{n:"味噌",g:20},{n:"みりん",ml:10}] },
  チキンカレー:      { cat:"balance", tags:["肉","カレー"],        ing:[{n:"鶏むね肉",g:120},{n:"玉ねぎ",count:0.5},{n:"人参",count:0.5},{n:"じゃがいも",count:1},{n:"ご飯米",g:200},{n:"カレールー",g:25}] },
  豚の生姜焼き:      { cat:"balance", tags:["肉","主菜"],          ing:[{n:"豚こま肉",g:130},{n:"玉ねぎ",count:0.25},{n:"ご飯米",g:150},{n:"醤油",ml:15},{n:"みりん",ml:10}] },
  焼き魚定食:        { cat:"balance", tags:["魚","主菜"],          ing:[{n:"鮭",g:100},{n:"大根",g:80},{n:"ご飯米",g:150},{n:"味噌",g:15}] },
  親子丼:            { cat:"balance", tags:["肉","卵","丼"],       ing:[{n:"鶏むね肉",g:100},{n:"卵",count:2},{n:"玉ねぎ",count:0.25},{n:"ご飯米",g:200},{n:"醤油",ml:15},{n:"みりん",ml:15}] },
  豆腐ステーキ:      { cat:"balance", tags:["豆腐","主菜"],        ing:[{n:"豆腐",count:1},{n:"ご飯米",g:150},{n:"醤油",ml:10},{n:"みりん",ml:10},{n:"ごま油",ml:5}] },
  キムチ炒め定食:    { cat:"balance", tags:["肉","主菜"],          ing:[{n:"豚こま肉",g:100},{n:"もやし",g:100},{n:"ご飯米",g:150},{n:"醤油",ml:8},{n:"ごま油",ml:5}] },
  カレーうどん:      { cat:"balance", tags:["麺類","カレー"],      ing:[{n:"うどん乾",g:100},{n:"玉ねぎ",count:0.25},{n:"カレールー",g:20},{n:"豚こま肉",g:60}] },
  ナポリタン:        { cat:"balance", tags:["麺類","洋食"],        ing:[{n:"スパゲッティ",g:100},{n:"玉ねぎ",count:0.25},{n:"ケチャップ",g:40},{n:"卵",count:1}] },
  豚バラ大根:        { cat:"balance", tags:["肉","煮物"],          ing:[{n:"豚バラ肉",g:100},{n:"大根",g:150},{n:"ご飯米",g:150},{n:"醤油",ml:15},{n:"みりん",ml:15}] },
  焼き鳥丼:          { cat:"balance", tags:["肉","丼"],            ing:[{n:"鶏むね肉",g:150},{n:"長ねぎ",count:0.5},{n:"ご飯米",g:200},{n:"醤油",ml:15},{n:"みりん",ml:15}] },
  鶏そぼろ丼:        { cat:"balance", tags:["肉","卵","丼"],       ing:[{n:"鶏むね肉",g:100},{n:"卵",count:2},{n:"ご飯米",g:200},{n:"醤油",ml:15},{n:"みりん",ml:15}] },
  // ─── 節約系 ───
  卵かけご飯と味噌汁: { cat:"save", tags:["卵","節約"],            ing:[{n:"卵",count:1},{n:"ご飯米",g:200},{n:"豆腐",count:0.25},{n:"味噌",g:15}] },
  もやし炒め定食:     { cat:"save", tags:["野菜","節約"],          ing:[{n:"もやし",g:200},{n:"豚こま肉",g:60},{n:"ご飯米",g:150},{n:"醤油",ml:10},{n:"ごま油",ml:5}] },
  豆腐と卵の煮物:     { cat:"save", tags:["豆腐","卵","節約"],     ing:[{n:"豆腐",count:0.75},{n:"卵",count:1},{n:"ご飯米",g:150},{n:"醤油",ml:15},{n:"みりん",ml:10}] },
  納豆ご飯とみそ汁:   { cat:"save", tags:["発酵","節約"],          ing:[{n:"納豆",count:2},{n:"ご飯米",g:200},{n:"豆腐",count:0.25},{n:"長ねぎ",count:0.15},{n:"味噌",g:15}] },
  かき玉うどん:       { cat:"save", tags:["麺類","卵","節約"],     ing:[{n:"うどん乾",g:100},{n:"卵",count:1},{n:"長ねぎ",count:0.2},{n:"醤油",ml:15},{n:"みりん",ml:10}] },
  豚こまキャベツ炒め: { cat:"save", tags:["肉","野菜","節約"],     ing:[{n:"豚こま肉",g:80},{n:"キャベツ",g:150},{n:"ご飯米",g:150},{n:"醤油",ml:10},{n:"ごま油",ml:5}] },
  おじや:             { cat:"save", tags:["卵","節約"],            ing:[{n:"ご飯米",g:200},{n:"卵",count:1},{n:"長ねぎ",count:0.15},{n:"醤油",ml:8},{n:"味噌",g:10}] },
  キャベツ炒飯:       { cat:"save", tags:["卵","野菜","節約"],     ing:[{n:"ご飯米",g:200},{n:"卵",count:2},{n:"キャベツ",g:100},{n:"醤油",ml:10},{n:"ごま油",ml:5}] },
  サバ缶大根煮:       { cat:"save", tags:["魚","煮物","節約"],     ing:[{n:"サバ缶",count:1},{n:"大根",g:200},{n:"ご飯米",g:150},{n:"醤油",ml:15},{n:"みりん",ml:15}] },
  麻婆豆腐節約版:     { cat:"save", tags:["豆腐","節約"],          ing:[{n:"豆腐",count:1},{n:"豚こま肉",g:50},{n:"長ねぎ",count:0.2},{n:"ご飯米",g:150},{n:"豆板醤",g:8},{n:"醤油",ml:10}] },
  野菜カレー:         { cat:"save", tags:["野菜","カレー","節約"], ing:[{n:"玉ねぎ",count:0.5},{n:"じゃがいも",count:1},{n:"人参",count:0.5},{n:"ご飯米",g:200},{n:"カレールー",g:25}] },
  もやし卵とじ丼:     { cat:"save", tags:["卵","野菜","節約"],     ing:[{n:"もやし",g:150},{n:"卵",count:2},{n:"ご飯米",g:200},{n:"醤油",ml:12},{n:"みりん",ml:8}] },
  // ─── 栄養重視系 ───
  鮭ほうれん草定食:    { cat:"nutr", tags:["魚","栄養"],           ing:[{n:"鮭",g:120},{n:"ほうれん草",g:100},{n:"ご飯米",g:150},{n:"ごま油",ml:5},{n:"醤油",ml:8}] },
  鶏むねほうれん草炒め:{ cat:"nutr", tags:["肉","栄養"],           ing:[{n:"鶏むね肉",g:150},{n:"ほうれん草",g:100},{n:"ご飯米",g:150},{n:"醤油",ml:10},{n:"ごま油",ml:5}] },
  豆腐納豆野菜定食:    { cat:"nutr", tags:["豆腐","発酵","栄養"],  ing:[{n:"豆腐",count:0.5},{n:"納豆",count:1},{n:"ほうれん草",g:80},{n:"ご飯米",g:150},{n:"味噌",g:15}] },
  豆乳スープ定食:      { cat:"nutr", tags:["豆腐","栄養"],         ing:[{n:"豆腐",count:0.5},{n:"長ねぎ",count:0.25},{n:"ほうれん草",g:60},{n:"ご飯米",g:150},{n:"味噌",g:15}] },
  鶏むね肉スープ煮:    { cat:"nutr", tags:["肉","栄養"],           ing:[{n:"鶏むね肉",g:150},{n:"人参",count:0.5},{n:"玉ねぎ",count:0.5},{n:"ご飯米",g:150},{n:"醤油",ml:10},{n:"みりん",ml:10}] },
  豆腐チャンプルー:    { cat:"nutr", tags:["豆腐","卵","栄養"],    ing:[{n:"豆腐",count:0.75},{n:"豚こま肉",g:60},{n:"卵",count:1},{n:"もやし",g:80},{n:"ご飯米",g:150},{n:"醤油",ml:10},{n:"ごま油",ml:5}] },
  サバ塩焼きひじき定食:{ cat:"nutr", tags:["魚","栄養"],           ing:[{n:"鮭",g:100},{n:"ほうれん草",g:80},{n:"大根",g:60},{n:"ご飯米",g:150},{n:"醤油",ml:8}] },
  鶏むね野菜スープ:    { cat:"nutr", tags:["肉","野菜","栄養"],    ing:[{n:"鶏むね肉",g:120},{n:"人参",count:0.4},{n:"玉ねぎ",count:0.4},{n:"ほうれん草",g:60},{n:"ご飯米",g:150},{n:"醤油",ml:8}] },
  卵野菜炒め定食:      { cat:"nutr", tags:["卵","野菜","栄養"],    ing:[{n:"卵",count:2},{n:"ほうれん草",g:80},{n:"もやし",g:80},{n:"ご飯米",g:150},{n:"醤油",ml:10},{n:"ごま油",ml:5}] },
  鮭じゃが煮定食:      { cat:"nutr", tags:["魚","野菜","栄養"],    ing:[{n:"鮭",g:100},{n:"じゃがいも",count:1},{n:"玉ねぎ",count:0.25},{n:"ご飯米",g:150},{n:"醤油",ml:12},{n:"みりん",ml:12}] },
};

// ============================================================
// SECTION 2: localStorage ユーティリティ
// ============================================================
const LS_KEYS = {
  im:        "mealplan_im",
  rm:        "mealplan_rm",
  inventory: "mealplan_inventory",
  bought:    "mealplan_bought",
};

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function lsSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ============================================================
// SECTION 3: コア計算エンジン（純粋関数 — im/rm を引数で受け取る）
// ============================================================

/** [A] 1食の実コストを計算（食材マスタ im を引数で受け取る純粋関数） */
function calcMealCost(recipeName, people, rm, im) {
  const r = rm[recipeName]; if (!r) return 0;
  let total = 0;
  for (const i of r.ing) {
    const m = im[i.n]; if (!m) continue;
    if      (i.g     != null) total += (parseFloat(i.g)     / 100) * (m.price100  ?? 0);
    else if (i.ml    != null) total += (parseFloat(i.ml)    / 100) * (m.price100  ?? 0);
    else if (i.count != null) total += parseFloat(i.count)         * (m.priceEach ?? 0);
  }
  return Math.round(total * people);
}

/** [B] 献立スライスから食材必要量を集計（純粋関数） */
function aggregateNeeds(schedSlice, people, rm) {
  const totals = {};
  for (const day of schedSlice) {
    for (const mealName of [day.l, day.di]) {
      const r = rm[mealName]; if (!r) continue;
      for (const i of r.ing) {
        if (!totals[i.n]) totals[i.n] = { g:0, count:0, ml:0 };
        if      (i.g     != null) totals[i.n].g     += parseFloat(i.g)     * people;
        else if (i.ml    != null) totals[i.n].ml    += parseFloat(i.ml)    * people;
        else if (i.count != null) totals[i.n].count += parseFloat(i.count) * people;
      }
    }
  }
  return totals;
}

/** [C] 必要量 − 在庫 → buyUnit 切り上げ → 購入リスト（純粋関数） */
function calcShoppingList(needed, inventory, im) {
  const items = [];
  for (const [name, req] of Object.entries(needed)) {
    const m = im[name];
    if (!m) continue;
    let needAmt=0, invAmt=0, unit="";
    if      (req.g     > 0) { needAmt=req.g;     invAmt=(inventory[name]?.g     ??0); unit="g";     }
    else if (req.count > 0) { needAmt=req.count;  invAmt=(inventory[name]?.count ??0); unit="count"; }
    else if (req.ml    > 0) { needAmt=req.ml;     invAmt=(inventory[name]?.ml    ??0); unit="ml";    }

    const deficit  = Math.max(0, needAmt - invAmt);
    if (deficit <= 0) continue;
    const packs    = Math.ceil(deficit / m.buyUnit);
    const buyTotal = packs * m.buyUnit;
    const surplus  = buyTotal - deficit;
    const cost     = unit === "count"
      ? Math.round(packs * m.buyUnit * (m.priceEach ?? 0))
      : Math.round(packs * m.buyUnit / 100 * (m.price100 ?? 0));
    const displayQty = unit==="g" ? `${buyTotal}g` : unit==="ml" ? `${buyTotal}ml` : `${buyTotal}${m.unit}`;

    items.push({ name, needAmt, invAmt, buyTotal, packs, cost, unit, displayQty,
      label:`${displayQty} (${packs}×${m.buyUnitLabel})`,
      surplus, shelfDays:m.shelfDays, frozen:m.frozen, surplusOk:m.surplusOk });
  }
  return items.sort((a,b) => b.cost - a.cost);
}

/** [D] 廃棄リスク判定（純粋関数） */
function detectWasteRisk(inventory, sched, im, rm, fromDay=0) {
  const risks = [];
  for (const [name, inv] of Object.entries(inventory)) {
    const m = im[name];
    if (!m || m.surplusOk) continue;
    const totalInv = (inv.g??0)+(inv.count??0)+(inv.ml??0);
    if (totalInv <= 0) continue;
    const window = sched.slice(fromDay, fromDay + m.shelfDays);
    let willConsume = 0;
    for (const day of window) {
      for (const mealName of [day.l, day.di]) {
        const r = rm[mealName];
        if (!r) continue;
        for (const i of r.ing) {
          if (i.n !== name) continue;
          if      (i.g     != null) willConsume += parseFloat(i.g);
          else if (i.ml    != null) willConsume += parseFloat(i.ml);
          else if (i.count != null) willConsume += parseFloat(i.count);
        }
      }
    }
    const surplus = totalInv - willConsume;
    if (surplus > 0) {
      risks.push({ name, invAmt:totalInv, willConsume, surplus:Math.round(surplus*10)/10, unit:m.unit, shelfDays:m.shelfDays, level: surplus/totalInv>0.5?"high":"mid" });
    }
  }
  return risks;
}

/** [E] 献立生成（最適化スコアリング、純粋関数） */
function buildSchedule(pol, people, inventory, rm, im) {
  const cats = pol==="save" ? ["save","balance"] : pol==="nutr" ? ["nutr","balance"] : ["balance"];
  const pool = Object.entries(rm).filter(([,r])=>cats.includes(r.cat)).map(([name])=>name);
  if (pool.length < 2) return Array.from({length:30},(_,d)=>({d:d+1,l:pool[0]||"",di:pool[0]||""}));

  const urgentIngredients = Object.keys(inventory).filter(n => {
    const m = im[n];
    const tot = (inventory[n]?.g??0)+(inventory[n]?.count??0)+(inventory[n]?.ml??0);
    return m && !m.surplusOk && tot>0 && m.shelfDays<=5;
  });

  function scoreMeal(name, preferIngr, prevName, dayIdx) {
    if (name === prevName) return -9999;
    const r = rm[name];
    if (!r) return -9999;
    let score = 0;
    for (const pref of preferIngr) if (r.ing.some(i=>i.n===pref)) score += 2;
    for (const urg of urgentIngredients) if (r.ing.some(i=>i.n===urg)) score += 5;
    if (pol==="save") { const c=calcMealCost(name,1,rm,im); score+=Math.max(0,(300-c)/30); }
    score += ((dayIdx*17+name.charCodeAt(0))%7)*0.3;
    return score;
  }

  const sched=[];
  let prevDinner="";
  for (let d=0;d<30;d++){
    const prevDinnerIng = prevDinner ? (rm[prevDinner]?.ing.map(i=>i.n)||[]) : [];
    const lunchCands = pool.map(name=>({name,score:scoreMeal(name,prevDinnerIng,prevDinner,d*2)})).sort((a,b)=>b.score-a.score);
    const lunch = lunchCands[0]?.name || pool[0];
    const lunchIng = rm[lunch]?.ing.map(i=>i.n)||[];
    const dinnerCands = pool.filter(n=>n!==lunch).map(name=>({name,score:scoreMeal(name,lunchIng,lunch,d*2+1)})).sort((a,b)=>b.score-a.score);
    const dinner = dinnerCands[0]?.name || (pool.find(n=>n!==lunch)||pool[0]);
    sched.push({d:d+1,l:lunch,di:dinner});
    prevDinner=dinner;
  }
  return sched;
}

// ============================================================
// SECTION 4: 在庫 Reducer（rm を action 経由で受け取る）
// ============================================================
function invReducer(state, action) {
  switch (action.type) {
    case "BUY": {
      const next = structuredClone(state);
      for (const item of action.items) {
        if (!next[item.name]) next[item.name]={g:0,count:0,ml:0};
        if      (item.unit==="g")     next[item.name].g     += item.buyTotal;
        else if (item.unit==="count") next[item.name].count += item.buyTotal;
        else if (item.unit==="ml")    next[item.name].ml    += item.buyTotal;
      }
      return next;
    }
    case "COOK": {
      const r = action.rm[action.meal];
      if (!r) return state;
      const next = structuredClone(state);
      for (const i of r.ing) {
        if (!next[i.n]) next[i.n]={g:0,count:0,ml:0};
        if      (i.g     != null) next[i.n].g     = Math.max(0,(next[i.n].g    ||0)-parseFloat(i.g)     *action.people);
        else if (i.ml    != null) next[i.n].ml    = Math.max(0,(next[i.n].ml   ||0)-parseFloat(i.ml)    *action.people);
        else if (i.count != null) next[i.n].count = Math.max(0,(next[i.n].count||0)-parseFloat(i.count) *action.people);
      }
      return next;
    }
    case "RESET":   return {};
    // インポート時に在庫データを丸ごと上書き
    case "RESTORE": return action.payload ?? {};
    default:        return state;
  }
}

// ============================================================
// SECTION 5: スタイル定数
// ============================================================
const C={bg:"#fff",bgSub:"#f5f4f0",bgInfo:"#E6F1FB",bgWarn:"#FCEBEB",bgOk:"#EAF3DE",textPri:"#1a1a1a",textSec:"#666",textMut:"#999",border:"#e0e0e0",blue:"#185FA5",red:"#A32D2D",green:"#3B6D11"};
const cardStyle  = {background:C.bg,border:`0.5px solid ${C.border}`,borderRadius:10,padding:12};
const metStyle   = {background:C.bgSub,borderRadius:8,padding:"10px 13px"};
const btnStyle   = (on)=>({padding:"8px 14px",minHeight:44,fontSize:13,borderRadius:7,border:`0.5px solid ${C.border}`,cursor:"pointer",background:on?C.textPri:"none",color:on?C.bg:C.textSec,display:"inline-flex",alignItems:"center",justifyContent:"center"});
const navBtnStyle= (dis)=>({padding:"8px 14px",minHeight:44,fontSize:13,borderRadius:6,border:`0.5px solid ${C.border}`,background:"none",cursor:dis?"default":"pointer",opacity:dis?.35:1,display:"inline-flex",alignItems:"center"});
const labelStyle = {fontSize:11,color:C.textMut,fontWeight:500,textTransform:"uppercase",letterSpacing:".04em"};
const inputStyle = {fontSize:13,padding:"5px 9px",borderRadius:7,border:`0.5px solid ${C.border}`,height:36,background:C.bg,color:C.textPri,boxSizing:"border-box"};
const DOW        = ["月","火","水","木","金","土","日"];

// ============================================================
// SECTION 6: 小コンポーネント
// ============================================================
function MetCard({label,value,sub,color}){
  const bg =color==="blue"?C.bgInfo:color==="green"?C.bgOk:color?C.bgWarn:C.bgSub;
  const col=color==="blue"?C.blue:color==="green"?C.green:color?C.red:C.textMut;
  return(
    <div style={{...metStyle,background:bg,minWidth:90,flex:"1 1 90px"}}>
      <div style={{fontSize:11,color:col,marginBottom:3}}>{label}</div>
      <div style={{fontSize:18,fontWeight:500,color:color?col:C.textPri}}>{value}</div>
      {sub&&<div style={{fontSize:10,color:C.textMut,marginTop:2}}>{sub}</div>}
    </div>
  );
}
function AlertBanner({level,text}){
  const high=level==="high";
  return(
    <div style={{background:high?C.bgWarn:"#FAEEDA",border:`0.5px solid ${high?"#F7C1C1":"#FAC775"}`,borderRadius:7,padding:"8px 12px",marginBottom:6,fontSize:12,color:high?C.red:"#633806",display:"flex",gap:8,alignItems:"flex-start"}}>
      <span style={{flexShrink:0}}>{high?"⚠":"!"}</span>
      <span>{text}</span>
    </div>
  );
}
function IngrBreakdown({mealName,rm,im}){
  const r=rm[mealName];
  if(!r) return null;
  return(
    <div style={{background:C.bgSub,borderRadius:6,padding:"6px 8px",marginTop:4}}>
      <div style={{fontSize:9,color:C.textMut,marginBottom:3}}>使用食材</div>
      {r.ing.map(i=>{
        const m=im[i.n];
        const qty=i.g!=null?`${i.g}g`:i.ml!=null?`${i.ml}ml`:`${i.count}${m?.unit||""}`;
        return(<div key={i.n} style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.textSec,paddingBottom:2}}><span>{i.n}</span><span>{qty}</span></div>);
      })}
    </div>
  );
}

// ============================================================
// SECTION 7: マスタ管理フォーム用の初期値ヘルパー
// ============================================================
const EMPTY_IM_FORM = {editingKey:"",name:"",unit:"g",priceType:"100g",price:"",shelfDays:"",frozen:false,buyUnit:"",buyUnitLabel:"",surplusOk:false};
const EMPTY_INGR_ROW = {n:"",qtyType:"g",qty:""};

// ============================================================
// SECTION 8: メインApp
// ============================================================
export default function App() {
  // ── マスタデータ（State + localStorage 同期） ──────────────
  const [im, setIm] = useState(() => lsGet(LS_KEYS.im, IM_DEFAULT));
  const [rm, setRm] = useState(() => lsGet(LS_KEYS.rm, RM_DEFAULT));

  // ── アプリ State ──────────────────────────────────────────
  const [pol,      setPol]      = useState("balance");
  const [people,   setPeople]   = useState(1);
  const [tab,      setTab]      = useState("plan");
  const [week,     setWeek]     = useState(0);
  const [expanded, setExpanded] = useState({});

  // ── 在庫（localStorage 初期値） ───────────────────────────
  const [inventory, dispatchInv] = useReducer(invReducer, undefined, () => lsGet(LS_KEYS.inventory, {}));
  const [bought,    setBought]   = useState(() => lsGet(LS_KEYS.bought, {}));

  // ── localStorage 同期（im/rm/inventory/bought が変わるたびに保存） ─
  useEffect(() => { lsSet(LS_KEYS.im, im); },        [im]);
  useEffect(() => { lsSet(LS_KEYS.rm, rm); },        [rm]);
  useEffect(() => { lsSet(LS_KEYS.inventory, inventory); }, [inventory]);
  useEffect(() => { lsSet(LS_KEYS.bought,    bought);    }, [bought]);

  // ── マスタ管理 UI State ────────────────────────────────────
  const [masterTab,  setMasterTab]  = useState("ingr");   // "ingr" | "recipe"
  const [imForm,     setImForm]     = useState(EMPTY_IM_FORM);
  const [rmEditKey,  setRmEditKey]  = useState(""); // tracks which recipe is being edited
  const [rmForm,     setRmForm]     = useState({editingKey:"",name:"",cat:"balance",tags:"",ing:[{...EMPTY_INGR_ROW}]});
  const [imError,    setImError]    = useState("");
  const [rmError,    setRmError]    = useState("");
  const [imConfirm,  setImConfirm]  = useState("");  // 削除確認対象の食材名
  const [rmConfirm,  setRmConfirm]  = useState("");

  // ── 計算（im/rm/inventory/pol/people が変わるたびに再計算） ─
  const sched = useMemo(
    () => buildSchedule(pol, people, inventory, rm, im),
    [pol, people, inventory, rm, im]
  );

  const shopSessions = useMemo(() => {
    return Array.from({length:8},(_,i)=>{
      const wIdx=Math.floor(i/2), half=i%2;
      const start=wIdx*7+(half===0?0:3);
      const end  =wIdx*7+(half===0?3:7);
      const slice=sched.slice(start,Math.min(end,30));
      const key  =`w${wIdx}_${half}`;
      const isDone=!!bought[key];
      const needed=aggregateNeeds(slice,people,rm);
      const items =calcShoppingList(needed,isDone?{}:inventory,im);
      const sorted=[...items.filter(it=>it.frozen),...items.filter(it=>!it.frozen)];
      return {wIdx,half,start,end,key,isDone,items:sorted,totalCost:items.reduce((s,it)=>s+it.cost,0),slice};
    });
  }, [sched,people,inventory,bought,rm,im]);

  const wasteRisks = useMemo(
    () => detectWasteRisk(inventory,sched,im,rm,week*7),
    [inventory,sched,im,rm,week]
  );

  const weekDays   = sched.slice(week*7, Math.min(week*7+7,30));
  const weekTotal  = useMemo(()=>weekDays.reduce((s,d)=>s+calcMealCost(d.l,people,rm,im)+calcMealCost(d.di,people,rm,im),0),[weekDays,people,rm,im]);
  const grandTotal = useMemo(()=>sched.reduce((s,d)=>s+calcMealCost(d.l,people,rm,im)+calcMealCost(d.di,people,rm,im),0),[sched,people,rm,im]);

  const fullMonthNeeds = useMemo(()=>aggregateNeeds(sched,people,rm),[sched,people,rm]);
  const shortageItems  = useMemo(()=>Object.entries(fullMonthNeeds).filter(([name,req])=>{
    const inv=inventory[name];
    if(!inv) return false;
    const need=req.g>0?req.g:req.count>0?req.count:req.ml;
    const has =req.g>0?(inv.g??0):req.count>0?(inv.count??0):(inv.ml??0);
    return has>0&&has<need;
  }),[fullMonthNeeds,inventory]);

  const stockCount = Object.values(inventory).filter(v=>(v.g||0)+(v.count||0)+(v.ml||0)>0).length;

  // ── ハンドラ ──────────────────────────────────────────────
  const handleBuy  = useCallback((s)=>{ dispatchInv({type:"BUY",items:s.items}); setBought(p=>({...p,[s.key]:true})); },[]);
  const handleCook = useCallback((mn)=>{ dispatchInv({type:"COOK",meal:mn,people,rm}); },[people,rm]);
  const toggleExp  = useCallback((k) =>{ setExpanded(p=>({...p,[k]:!p[k]})); },[]);

  // ── マスタ操作ハンドラ ─────────────────────────────────────
  // 食材保存（新規追加 or 編集上書き）
  const handleSaveIngr = () => {
    const {editingKey,name,unit,priceType,price,shelfDays,frozen,buyUnit,buyUnitLabel,surplusOk}=imForm;
    const trimmed=name.trim();
    if (!trimmed)         { setImError("食材名を入力してください"); return; }
    if (!editingKey && im[trimmed]) { setImError(`「${trimmed}」はすでに登録されています`); return; }
    if (editingKey && trimmed!==editingKey && im[trimmed]) { setImError(`「${trimmed}」はすでに登録されています`); return; }
    const p=parseFloat(price); if (!(p>0)) { setImError("価格を正しく入力してください"); return; }
    const bu=parseFloat(buyUnit); if (!(bu>0)) { setImError("購入単位を正しく入力してください"); return; }
    const sd=parseFloat(shelfDays); if (!(sd>0)) { setImError("賞味期限を正しく入力してください"); return; }
    const entry=priceType==="100g"
      ?{unit,price100:p,shelfDays:sd,frozen,buyUnit:bu,buyUnitLabel,surplusOk}
      :{unit,priceEach:p,shelfDays:sd,frozen,buyUnit:bu,buyUnitLabel,surplusOk};
    setIm(prev=>{ const next={...prev}; if(editingKey&&editingKey!==trimmed)delete next[editingKey]; next[trimmed]=entry; return next; });
    setImForm(EMPTY_IM_FORM); setImError("");
  };
  // 食材編集開始
  const handleEditIngr=(name)=>{
    const m=im[name];
    setImForm({editingKey:name,name,unit:m.unit,priceType:m.price100!=null?"100g":"each",
      price:String(m.price100??m.priceEach??""),shelfDays:String(m.shelfDays),frozen:!!m.frozen,
      buyUnit:String(m.buyUnit),buyUnitLabel:m.buyUnitLabel||"",surplusOk:!!m.surplusOk});
    setImError(""); setImConfirm("");
    setTimeout(()=>document.getElementById("im-form-top")?.scrollIntoView({behavior:"smooth",block:"start"}),50);
  };
  // 食材削除
  const handleDelIngr=(name)=>{
    if (imConfirm!==name) { setImConfirm(name); return; }
    setIm(prev=>{ const n={...prev}; delete n[name]; return n; });
    setImConfirm("");
    if (imForm.editingKey===name) setImForm(EMPTY_IM_FORM);
  };

  // レシピ保存（新規追加 or 編集上書き）
  const handleSaveRecipe=()=>{
    const {editingKey,name,cat,tags,ing}=rmForm;
    const trimmed=name.trim();
    if (!trimmed) { setRmError("レシピ名を入力してください"); return; }
    if (!editingKey && rm[trimmed]) { setRmError(`「${trimmed}」はすでに登録されています`); return; }
    if (editingKey && trimmed!==editingKey && rm[trimmed]) { setRmError(`「${trimmed}」はすでに登録されています`); return; }
    const validIng=ing.filter(i=>i.n.trim()&&parseFloat(i.qty)>0);
    if (validIng.length===0) { setRmError("食材を1つ以上設定してください"); return; }
    const ingData=validIng.map(i=>{
      const qty=parseFloat(i.qty);
      return i.qtyType==="g"?{n:i.n.trim(),g:qty}:i.qtyType==="ml"?{n:i.n.trim(),ml:qty}:{n:i.n.trim(),count:qty};
    });
    setRm(prev=>{ const next={...prev}; if(editingKey&&editingKey!==trimmed)delete next[editingKey]; next[trimmed]={cat,tags:tags.split(/[,、]/).map(t=>t.trim()).filter(Boolean),ing:ingData}; return next; });
    setRmForm({editingKey:"",name:"",cat:"balance",tags:"",ing:[{...EMPTY_INGR_ROW}]}); setRmError("");
  };
  // レシピ編集開始
  const handleEditRecipe=(name)=>{
    const r=rm[name];
    const ing=r.ing.map(i=>({n:i.n,qtyType:i.g!=null?"g":i.ml!=null?"ml":"count",qty:String(i.g??i.ml??i.count??"")}));
    setRmForm({editingKey:name,name,cat:r.cat,tags:(r.tags||[]).join(", "),ing:ing.length?ing:[{...EMPTY_INGR_ROW}]});
    setRmError(""); setRmConfirm("");
    setTimeout(()=>document.getElementById("rm-form-top")?.scrollIntoView({behavior:"smooth",block:"start"}),50);
  };
  // レシピ削除
  const handleDelRecipe=(name)=>{
    if (rmConfirm!==name) { setRmConfirm(name); return; }
    setRm(prev=>{ const n={...prev}; delete n[name]; return n; });
    setRmConfirm("");
    if (rmForm.editingKey===name) setRmForm({editingKey:"",name:"",cat:"balance",tags:"",ing:[{...EMPTY_INGR_ROW}]});
  };

  // レシピフォームの食材行操作
  const updateIngRow = (idx,field,val) => setRmForm(f=>({...f,ing:f.ing.map((r,i)=>i===idx?{...r,[field]:val}:r)}));
  const addIngRow    = () => setRmForm(f=>({...f,ing:[...f.ing,{...EMPTY_INGR_ROW}]}));
  const delIngRow    = (idx)=>setRmForm(f=>({...f,ing:f.ing.filter((_,i)=>i!==idx)}));

  // リセット
  const handleFullReset = () => {
    setIm(IM_DEFAULT); setRm(RM_DEFAULT);
    dispatchInv({type:"RESET"}); setBought({});
    [LS_KEYS.im,LS_KEYS.rm,LS_KEYS.inventory,LS_KEYS.bought].forEach(k=>{ try{localStorage.removeItem(k);}catch{} });
    setImForm(EMPTY_IM_FORM); setRmForm({editingKey:"",name:"",cat:"balance",tags:"",ing:[{...EMPTY_INGR_ROW}]});
  };

  // ── エクスポート（JSONダウンロード） ────────────────────────
  // im / rm / inventory / bought を1つのJSONにまとめてファイル保存
  const handleExport = useCallback(() => {
    const payload = { im, rm, inventory, bought };
    const json    = JSON.stringify(payload, null, 2);
    const blob    = new Blob([json], { type: "application/json" });
    const url     = URL.createObjectURL(blob);
    // 日付付きファイル名: mealplan_backup_YYYYMMDD.json
    const now     = new Date();
    const pad     = (n) => String(n).padStart(2, "0");
    const dateStr = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
    const a       = document.createElement("a");
    a.href        = url;
    a.download    = `mealplan_backup_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [im, rm, inventory, bought]);

  // ── インポート（JSONファイル読み込み） ───────────────────────
  // hidden <input type="file"> の ref
  const fileInputRef = useRef(null);

  // ファイル選択ダイアログを開く
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ファイル選択後の処理
  const handleImport = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        // 簡易バリデーション: im と rm が含まれているか
        if (!parsed.im || !parsed.rm || typeof parsed.im !== "object" || typeof parsed.rm !== "object") {
          alert("インポート失敗：有効な mealplan バックアップファイルではありません。\n（im・rm キーが見つかりません）");
          return;
        }
        // 各 State を上書き
        setIm(parsed.im);
        setRm(parsed.rm);
        setBought(parsed.bought || {});
        dispatchInv({ type: "RESTORE", payload: parsed.inventory || {} });
        // フォームもリセット
        setImForm(EMPTY_IM_FORM);
        setRmForm({editingKey:"",name:"",cat:"balance",tags:"",ing:[{...EMPTY_INGR_ROW}]});
        alert(`インポート完了！\n食材: ${Object.keys(parsed.im).length}種 / レシピ: ${Object.keys(parsed.rm).length}品`);
      } catch {
        alert("インポート失敗：JSONの解析に失敗しました。ファイルが壊れている可能性があります。");
      }
    };
    reader.readAsText(file, "utf-8");
    // 同じファイルを再選択できるよう value をリセット
    e.target.value = "";
  }, []);

  // ============================================================
  // RENDER: 献立表
  // ============================================================
  const renderPlan = () => (
    <div>
      {wasteRisks.map(r=>(
        <AlertBanner key={r.name} level={r.level} text={`「${r.name}」: 在庫${r.invAmt}${r.unit}のうち期限${r.shelfDays}日以内に消費見込み${r.willConsume}${r.unit}。${r.surplus}${r.unit}が廃棄リスクです。`}/>
      ))}
      {shortageItems.length>0&&<AlertBanner level="mid" text={`在庫不足: ${shortageItems.map(([n])=>n).join("・")} — 買い物リストで補充を確認してください`}/>}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
        <MetCard label="今週の食費" value={`¥${weekTotal.toLocaleString()}`} sub={`${weekDays.length}日×2食`} color="blue"/>
        <MetCard label="1食単価" value={`¥${weekDays.length?Math.round(weekTotal/(weekDays.length*2)):0}`} sub="食材費ベース"/>
        <MetCard label="在庫食材数" value={`${stockCount}種`} sub="現在の在庫"/>
        <MetCard label="廃棄リスク" value={wasteRisks.length===0?"なし":`${wasteRisks.length}品目`} color={wasteRisks.length>0?wasteRisks.some(r=>r.level==="high")?"red":"warn":"green"}/>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
        <button onClick={()=>setWeek(w=>Math.max(0,w-1))} style={navBtnStyle(week===0)}>← 前週</button>
        <span style={{flex:1,textAlign:"center",fontWeight:500,fontSize:13}}>第{week+1}週（{weekDays[0]?.d}日〜{weekDays[weekDays.length-1]?.d}日）</span>
        <button onClick={()=>setWeek(w=>Math.min(3,w+1))} style={navBtnStyle((week+1)*7>=30)}>次週 →</button>
      </div>
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,minmax(110px,1fr))",gap:5,minWidth:560}}>
        {weekDays.map((d,i)=>(
          <div key={d.d} style={{border:`0.5px solid ${C.border}`,borderRadius:7,padding:6,minHeight:120,background:C.bg}}>
            <div style={{fontSize:10,color:C.textMut,marginBottom:4,fontWeight:500}}>{d.d}日({DOW[i%7]})</div>
            {[{label:"昼",mn:d.l,ek:`${d.d}_l`},{label:"夜",mn:d.di,ek:`${d.d}_d`}].map(({label,mn,ek})=>{
              const cost=calcMealCost(mn,people,rm,im);
              const hasUrgent=rm[mn]?.ing.some(i=>{ const inv=inventory[i.n]; const tot=(inv?.g??0)+(inv?.count??0)+(inv?.ml??0); return tot>0&&(im[i.n]?.shelfDays??99)<=3; });
              return(
                <div key={label}>
                  <div style={{background:hasUrgent?"#FAEEDA":C.bgSub,borderRadius:4,padding:"4px 5px",marginBottom:2,cursor:"pointer",border:hasUrgent?"0.5px solid #FAC775":"none"}}
                    onClick={()=>toggleExp(ek)} onContextMenu={e=>{e.preventDefault();handleCook(mn);}}>
                    <div style={{fontSize:9,color:C.textMut}}>{label}{hasUrgent&&" ⚡"}</div>
                    <div style={{fontSize:10,lineHeight:1.3,marginTop:1}}>{mn||"—"}</div>
                    <div style={{fontSize:9,color:C.textSec}}>¥{cost}</div>
                  </div>
                  {expanded[ek]&&<IngrBreakdown mealName={mn} rm={rm} im={im}/>}
                </div>
              );
            })}
            <div style={{marginTop:4,textAlign:"right"}}>
              <button onClick={()=>{handleCook(d.l);handleCook(d.di);}} style={{fontSize:8,color:C.textMut,border:`0.5px solid ${C.border}`,background:"none",borderRadius:3,padding:"1px 5px",cursor:"pointer"}}>調理済</button>
            </div>
          </div>
        ))}
      </div>
      <p style={{fontSize:10,color:C.textMut,marginTop:8}}>※ カードクリック→食材表示 / 右クリック or「調理済」→在庫消費 / ⚡=期限注意食材使用</p>
    </div>
  );

  // ============================================================
  // RENDER: 買い物リスト
  // ============================================================
  function renderShop() {
    const allItems   = shopSessions.flatMap(s=>s.items);
    const surpItems  = allItems.filter(it=>it.surplus>0&&!it.surplusOk);
    const frozenItems= allItems.filter(it=>it.frozen&&!it.surplusOk);
    return(
      <div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          <MetCard label="月合計（実コスト）" value={`¥${grandTotal.toLocaleString()}`} sub={`${people}人分`} color="blue"/>
          <MetCard label="1回あたり" value={`¥${Math.round(grandTotal/8).toLocaleString()}`} sub="目安"/>
          <MetCard label="購入済み" value={`${Object.values(bought).filter(Boolean).length}/8回`}/>
          <MetCard label="在庫食材" value={`${stockCount}種`}/>
        </div>
        {surpItems.length>0&&<AlertBanner level="mid" text={`余剰が出る食材: ${[...new Set(surpItems.map(it=>`${it.name}(+${it.surplus}${it.unit==="count"?im[it.name]?.unit||"":it.unit})`))].join(" / ")} — まとめ買い単位の都合です`}/>}
        {frozenItems.length>0&&(
          <div style={{background:C.bgInfo,border:`0.5px solid #B5D4F4`,borderRadius:7,padding:"8px 12px",marginBottom:8,fontSize:12,color:C.blue}}>
            ❄ 冷凍可能食材 {[...new Set(frozenItems.map(it=>it.name))].join("・")} は今週分まとめ買い推奨
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:10}}>
          {shopSessions.map(s=>(
            <div key={s.key} style={{...cardStyle,opacity:s.isDone?.65:1}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6,flexWrap:"wrap",gap:6}}>
                <span style={{fontSize:12,fontWeight:500}}>第{s.wIdx+1}週 {s.half===0?"前半(月〜水)":"後半(木〜土)"}</span>
                <div style={{display:"flex",gap:5,alignItems:"center"}}>
                  <span style={{fontSize:10,background:C.bgInfo,color:C.blue,padding:"2px 7px",borderRadius:4}}>¥{s.totalCost.toLocaleString()}</span>
                  {s.isDone
                    ?<span style={{fontSize:10,background:C.bgOk,color:C.green,padding:"2px 7px",borderRadius:4}}>購入済み</span>
                    :<button onClick={()=>handleBuy(s)} style={{...btnStyle(true),fontSize:11,padding:"3px 9px"}}>購入する</button>
                  }
                </div>
              </div>
              <div style={{fontSize:10,color:C.textMut,marginBottom:7}}>{s.start+1}〜{Math.min(s.end,30)}日分</div>
              {s.items.length===0
                ?<div style={{fontSize:12,color:C.textMut,padding:"8px 0",textAlign:"center"}}>在庫あり — 買い物不要</div>
                :s.items.map(it=>(
                  <div key={it.name} style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",padding:"5px 0",borderBottom:`0.5px solid #f0f0f0`,fontSize:11}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        {it.frozen&&<span style={{fontSize:9,color:C.blue}}>❄</span>}
                        <span style={{color:it.shelfDays<=2?C.red:it.shelfDays<=5?"#854F0B":C.textPri,fontWeight:it.shelfDays<=2?500:400}}>{it.name}</span>
                        {it.surplus>0&&!it.surplusOk&&<span style={{fontSize:9,background:"#FAEEDA",color:"#633806",padding:"0px 4px",borderRadius:3}}>+{it.surplus}{it.unit==="count"?im[it.name]?.unit||"":it.unit}</span>}
                      </div>
                      <div style={{fontSize:9,color:C.textMut}}>必要{it.needAmt}{it.unit==="count"?im[it.name]?.unit||"":it.unit} 在庫{it.invAmt}{it.unit==="count"?im[it.name]?.unit||"":it.unit}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0,marginLeft:8}}>
                      <div style={{fontSize:10,color:C.textSec}}>{it.displayQty}</div>
                      <div style={{fontSize:11,fontWeight:500}}>¥{it.cost.toLocaleString()}</div>
                    </div>
                  </div>
                ))
              }
              {s.items.length>0&&<div style={{textAlign:"right",fontSize:11,marginTop:6,fontWeight:500,borderTop:`0.5px solid ${C.border}`,paddingTop:5}}>合計 ¥{s.totalCost.toLocaleString()} / {s.items.length}品目</div>}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER: 食費まとめ
  // ============================================================
  function renderCost() {
    const rows=Array.from({length:4},(_,w)=>{
      const s=w*7,e=Math.min(s+7,30);
      const days=sched.slice(s,e);
      const tot=days.reduce((acc,d)=>acc+calcMealCost(d.l,people,rm,im)+calcMealCost(d.di,people,rm,im),0);
      const h=Math.ceil(days.length/2);
      const s1=days.slice(0,h).reduce((acc,d)=>acc+calcMealCost(d.l,people,rm,im)+calcMealCost(d.di,people,rm,im),0);
      const s2=days.slice(h).reduce((acc,d)=>acc+calcMealCost(d.l,people,rm,im)+calcMealCost(d.di,people,rm,im),0);
      return{w:w+1,s1,s2,tot,meals:days.length*2};
    });
    const totalMeals=rows.reduce((s,r)=>s+r.meals,0);
    const perMeal=Math.round(grandTotal/totalMeals);
    const perDay=Math.round(grandTotal/30);
    const byMeal=Object.values(sched.flatMap(d=>[{name:d.l,cost:calcMealCost(d.l,people,rm,im)},{name:d.di,cost:calcMealCost(d.di,people,rm,im)}]).reduce((acc,m)=>{
      if(!acc[m.name])acc[m.name]={name:m.name,cost:m.cost,count:0};acc[m.name].count++;return acc;},{})).sort((a,b)=>b.cost-a.cost);
    return(
      <div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:14}}>
          <MetCard label="月合計（実コスト）" value={`¥${grandTotal.toLocaleString()}`} sub={`${people}人分`} color="blue"/>
          <MetCard label="1食あたり" value={`¥${perMeal}`} sub="食材費ベース"/>
          <MetCard label="1日あたり" value={`¥${perDay}`} sub="2食分"/>
          <MetCard label="1人1食" value={`¥${Math.round(perMeal/people)}`} sub="実コスト"/>
        </div>
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:20}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:460}}>
          <thead><tr>{["週","前半","後半","週合計","1食単価","1日"].map(h=><th key={h} style={{textAlign:"left",padding:"5px 7px",borderBottom:`0.5px solid ${C.border}`,fontSize:11,fontWeight:500,color:C.textMut}}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.w} style={{borderBottom:`0.5px solid #f0f0f0`}}>
                <td style={{padding:"7px 7px"}}>第{r.w}週</td>
                <td style={{padding:"7px 7px"}}>¥{r.s1.toLocaleString()}</td>
                <td style={{padding:"7px 7px"}}>¥{r.s2.toLocaleString()}</td>
                <td style={{padding:"7px 7px",fontWeight:500}}>¥{r.tot.toLocaleString()}</td>
                <td style={{padding:"7px 7px"}}>¥{Math.round(r.tot/r.meals)}</td>
                <td style={{padding:"7px 7px"}}>¥{Math.round(r.tot/(r.meals/2))}</td>
              </tr>
            ))}
            <tr style={{background:C.bgSub,fontWeight:500}}>
              <td style={{padding:"7px 7px"}}>合計</td><td colSpan={2} style={{padding:"7px 7px"}}></td>
              <td style={{padding:"7px 7px"}}>¥{grandTotal.toLocaleString()}</td>
              <td style={{padding:"7px 7px"}}>¥{perMeal}</td>
              <td style={{padding:"7px 7px"}}>¥{perDay}</td>
            </tr>
          </tbody>
        </table>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10}}>
          <div style={{...cardStyle}}>
            <div style={{fontSize:11,color:C.red,marginBottom:8,fontWeight:500}}>コスト上位5品</div>
            {byMeal.slice(0,5).map((m,i)=>(
              <div key={m.name} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:`0.5px solid #f0f0f0`}}>
                <span>{i+1}. {m.name}</span><span style={{color:C.red,fontWeight:500}}>¥{m.cost}</span>
              </div>
            ))}
          </div>
          <div style={{...cardStyle}}>
            <div style={{fontSize:11,color:C.green,marginBottom:8,fontWeight:500}}>コスト下位5品</div>
            {[...byMeal].reverse().slice(0,5).map((m,i)=>(
              <div key={m.name} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"3px 0",borderBottom:`0.5px solid #f0f0f0`}}>
                <span>{i+1}. {m.name}</span><span style={{color:C.green,fontWeight:500}}>¥{m.cost}</span>
              </div>
            ))}
          </div>
        </div>
        <p style={{fontSize:10,color:C.textMut,marginTop:12}}>※ コストは食材単価×使用量の合計です。調味料・光熱費は含みません。</p>
      </div>
    );
  };

  // ============================================================
  // RENDER: 食材・在庫
  // ============================================================
  function renderIngr() {
    const allIngr=Object.entries(im);
    const inStock=allIngr.filter(([n])=>(inventory[n]?.g??0)+(inventory[n]?.count??0)+(inventory[n]?.ml??0)>0);
    return(
      <div>
        {wasteRisks.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:500,color:C.red,marginBottom:6}}>廃棄リスク食材</div>
            {wasteRisks.map(r=><AlertBanner key={r.name} level={r.level} text={`「${r.name}」: 在庫 ${r.invAmt}${r.unit} / 消費見込み ${r.willConsume}${r.unit} / 余剰 ${r.surplus}${r.unit}`}/>)}
          </div>
        )}
        {shortageItems.length>0&&(
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:500,color:"#854F0B",marginBottom:6}}>在庫不足食材（月間献立に対して）</div>
            {shortageItems.map(([name,req])=>{
              const inv=inventory[name],unit=req.g>0?"g":req.count>0?im[name]?.unit||"個":"ml";
              const need=req.g>0?req.g:req.count>0?req.count:req.ml;
              const has=req.g>0?(inv?.g??0):req.count>0?(inv?.count??0):(inv?.ml??0);
              return <AlertBanner key={name} level="mid" text={`「${name}」: 必要 ${Math.round(need)}${unit} / 在庫 ${Math.round(has)}${unit} / 不足 ${Math.round(need-has)}${unit}`}/>;
            })}
          </div>
        )}
        {inStock.length>0&&(
          <>
            <div style={{fontSize:12,fontWeight:500,marginBottom:8,color:C.green}}>在庫あり ({inStock.length}種)</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:6,marginBottom:16}}>
              {inStock.map(([name,m])=>{
                const inv=inventory[name],amt=(inv?.g??0)+(inv?.count??0)+(inv?.ml??0);
                const unit=(inv?.g??0)>0?"g":(inv?.count??0)>0?m.unit:"ml";
                const pct=Math.min(100,Math.round(amt/m.buyUnit*100));
                const col=m.shelfDays<=3?"#E24B4A":m.shelfDays<=7?"#EF9F27":"#639922";
                const risk=wasteRisks.find(r=>r.name===name);
                return(
                  <div key={name} style={{...cardStyle,padding:"9px 11px",border:risk?`0.5px solid #F7C1C1`:cardStyle.border,background:risk?"#FFFAFA":C.bg}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:500}}>{name}{risk&&" ⚠"}</div>
                        <div style={{fontSize:10,color:C.textMut,marginTop:1}}>在庫: {Math.round(amt)}{unit} · 期限{m.shelfDays}日</div>
                        <div style={{width:70,height:3,background:"#eee",borderRadius:2,marginTop:4}}><div style={{width:`${pct}%`,height:3,background:col,borderRadius:2}}/></div>
                      </div>
                      <span style={{fontSize:9,background:m.frozen?C.bgInfo:C.bgSub,color:m.frozen?C.blue:C.textMut,padding:"2px 5px",borderRadius:3}}>{m.frozen?"❄冷凍":"冷蔵"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <div style={{fontSize:12,fontWeight:500,marginBottom:8,color:C.textMut}}>全食材マスタ（{allIngr.length}種）</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:5}}>
          {allIngr.map(([name,m])=>{
            const freq=Math.ceil(30/m.shelfDays);
            const unitCost=m.price100!=null?`¥${m.price100}/100${m.unit}`:`¥${m.priceEach}/${m.unit}`;
            const col=m.shelfDays<=3?"#E24B4A":m.shelfDays<=7?"#EF9F27":"#639922";
            return(
              <div key={name} style={{border:`0.5px solid ${C.border}`,borderRadius:7,padding:"8px 10px",background:C.bg}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <div style={{fontSize:11,fontWeight:500}}>{name}</div>
                  <span style={{fontSize:9,color:m.frozen?C.blue:C.textMut}}>{m.frozen?"❄":""}</span>
                </div>
                <div style={{fontSize:10,color:C.textMut,marginTop:2}}>{unitCost} · {m.buyUnitLabel}</div>
                <div style={{display:"flex",alignItems:"center",gap:5,marginTop:4}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:col,flexShrink:0}}/>
                  <span style={{fontSize:9,color:C.textMut}}>期限{m.shelfDays}日 · 月{freq}回</span>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={()=>{dispatchInv({type:"RESET"});setBought({});}} style={{marginTop:16,...btnStyle(false),fontSize:11,color:C.red,border:`0.5px solid #F7C1C1`}}>在庫・購入履歴をリセット</button>
      </div>
    );
  };

  // ============================================================
  // RENDER: 改善提案
  // ============================================================
  function renderTips() {
    const polName={balance:"バランス重視",save:"節約重視",nutr:"栄養重視"}[pol];
    const allMealList=sched.flatMap(d=>[{name:d.l,cost:calcMealCost(d.l,people,rm,im)},{name:d.di,cost:calcMealCost(d.di,people,rm,im)}]);
    const sorted=[...allMealList].sort((a,b)=>b.cost-a.cost);
    const ingrFreq={};
    for(const day of sched)for(const mn of[day.l,day.di])for(const i of(rm[mn]?.ing||[]))ingrFreq[i.n]=(ingrFreq[i.n]||0)+1;
    const topIngr=Object.entries(ingrFreq).sort((a,b)=>b[1]-a[1]).slice(0,5);
    const TIPS={
      balance:[
        {t:"食材使い回し最適化",b:`献立生成時、前日夕食の食材を翌日昼食で再利用するスコアリングを実装しています。最多使用「${topIngr[0]?.[0]||"鶏むね肉"}」(月${topIngr[0]?.[1]||0}回)はまとめ買い＋冷凍保存を推奨します。`},
        {t:"賞味期限ロス防止",b:"在庫登録後、期限3日以内の食材は⚡マーク付きで強調。廃棄リスクタブで余剰量を確認し、献立調整に活用してください。"},
        {t:"冷凍食材のまとめ買い戦略",b:`冷凍可能食材(${Object.entries(im).filter(([,m])=>m.frozen).map(([n])=>n).join("・")})は週1回まとめ買いして小分け冷凍すると賞味期限ロスがゼロになります。`},
      ],
      save:[
        {t:"コスト構造の分析",b:`節約方針での月間実コスト¥${grandTotal.toLocaleString()}（1食¥${Math.round(grandTotal/60)}）。最高コスト食「${sorted[0]?.name}(¥${sorted[0]?.cost})」を週2回以下に抑えることでさらに節約できます。`},
        {t:"最強節約トリオ",b:"もやし(¥40/袋)・豆腐(¥88/丁)・卵(¥25/個)の3食材で1食100〜150円を実現。炒め・汁物・煮物・丼と調理法を変えれば週5回使っても飽きません。"},
        {t:"サバ缶の戦略的活用",b:"¥130/缶・常温長期保存のサバ缶は最強コスパ食材。大根煮・味噌煮・カレー・みそ汁の具と幅広く使えます。"},
      ],
      nutr:[
        {t:"PFCバランス分析",b:"栄養方針では鶏むね肉(P27g/100g)・鮭(P22g/100g)・豆腐(P7g/100g)・卵(P12g/個)を組み合わせ、1食あたりタンパク質20g以上を確保しています。"},
        {t:"鮭×ほうれん草の相乗効果",b:"鮭のビタミンDがほうれん草の鉄分・カルシウム吸収を促進。週2〜3回の組み合わせで骨密度維持・貧血予防に効果的です。"},
        {t:"発酵食品デイリー摂取",b:"納豆・味噌汁を毎食組み込んでいます。腸内環境改善により免疫力・栄養吸収効率が向上します。"},
      ],
    };
    return(
      <div>
        <div style={{...cardStyle,background:C.bgSub,marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>方針: {polName}</div>
          <div style={{fontSize:12,color:C.textSec,lineHeight:1.7}}>月間実コスト <strong>¥{grandTotal.toLocaleString()}</strong>（{people}人分）· 1食 <strong>¥{Math.round(grandTotal/60)}</strong> · 1日 <strong>¥{Math.round(grandTotal/30)}</strong></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:16}}>
          {[{label:"最高コスト食",name:sorted[0]?.name,val:`¥${sorted[0]?.cost||0}`,color:"red"},
            {label:"最低コスト食",name:sorted[sorted.length-1]?.name,val:`¥${sorted[sorted.length-1]?.cost||0}`,color:"green"},
            {label:"最多使用食材",name:topIngr[0]?.[0],val:`${topIngr[0]?.[1]||0}回/月`,color:"blue"}
          ].map(item=>(
            <div key={item.label} style={{...cardStyle,background:item.color==="red"?C.bgWarn:item.color==="green"?C.bgOk:C.bgInfo}}>
              <div style={{fontSize:10,color:item.color==="red"?C.red:item.color==="green"?C.green:C.blue,marginBottom:3}}>{item.label}</div>
              <div style={{fontSize:12,fontWeight:500}}>{item.name}</div>
              <div style={{fontSize:11,color:item.color==="red"?C.red:item.color==="green"?C.green:C.blue}}>{item.val}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:12,fontWeight:500,marginBottom:8,color:C.textSec}}>食材使用頻度ランキング（月間）</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {topIngr.map(([name,cnt],i)=>(
            <div key={name} style={{background:i===0?C.bgInfo:C.bgSub,borderRadius:20,padding:"4px 12px",fontSize:12}}>
              <span style={{color:i===0?C.blue:C.textSec}}>{i+1}位 {name}</span>
              <span style={{color:C.textMut,marginLeft:5,fontSize:10}}>{cnt}回</span>
            </div>
          ))}
        </div>
        {(TIPS[pol]||TIPS.balance).map(t=>(
          <div key={t.t} style={{...cardStyle,background:C.bgSub,marginBottom:8}}>
            <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>💡 {t.t}</div>
            <p style={{fontSize:12,color:C.textSec,lineHeight:1.7,margin:0}}>{t.b}</p>
          </div>
        ))}
      </div>
    );
  };

  // ============================================================
  // RENDER: マスタ管理
  // ============================================================
  function renderMaster() {
    const imEntries = Object.entries(im);
    const rmEntries = Object.entries(rm);

    return (
      <div>
        {/* サブタブ */}
        <div style={{display:"flex",gap:4,marginBottom:16,borderBottom:`0.5px solid ${C.border}`,paddingBottom:0,flexWrap:"wrap"}}>
          {[["ingr","食材マスタ管理"],["recipe","レシピマスタ管理"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setMasterTab(id)} style={{padding:"6px 16px",fontSize:13,cursor:"pointer",border:"none",background:"none",color:masterTab===id?C.textPri:C.textMut,borderBottom:masterTab===id?`2px solid ${C.textPri}`:"2px solid transparent",fontWeight:masterTab===id?500:400,minHeight:40}}>
              {lbl}
            </button>
          ))}
          <div style={{marginLeft:"auto",display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",paddingBottom:4}}>
            <span style={{fontSize:11,color:C.textMut,whiteSpace:"nowrap"}}>食材{imEntries.length}種 / レシピ{rmEntries.length}品</span>
            {/* エクスポートボタン */}
            <button
              onClick={handleExport}
              style={{...btnStyle(false),fontSize:11,padding:"4px 10px",minHeight:36,color:C.blue,border:`0.5px solid #B5D4F4`,whiteSpace:"nowrap"}}
              title="現在のデータをJSONファイルとしてダウンロード">
              ⬇ エクスポート
            </button>
            {/* インポートボタン（hidden input をトリガー） */}
            <button
              onClick={handleImportClick}
              style={{...btnStyle(false),fontSize:11,padding:"4px 10px",minHeight:36,color:C.green,border:`0.5px solid #C0DD97`,whiteSpace:"nowrap"}}
              title="JSONバックアップファイルを読み込んでデータを復元">
              ⬆ インポート
            </button>
            {/* 隠しファイル入力（.json のみ受け付ける） */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{display:"none"}}
              onChange={handleImport}
            />
            <button
              onClick={handleFullReset}
              style={{...btnStyle(false),fontSize:11,color:C.red,border:`0.5px solid #F7C1C1`,padding:"4px 10px",minHeight:36,whiteSpace:"nowrap"}}>
              全データリセット
            </button>
          </div>
        </div>

        {/* ─── 食材マスタ管理 ─── */}
        {masterTab==="ingr"&&(
          <div>
            {/* 追加フォーム */}
            <div style={{...cardStyle,marginBottom:16}}>
              <div id="im-form-top" style={{fontSize:13,fontWeight:500,marginBottom:10,paddingBottom:8,borderBottom:`0.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                <span>{imForm.editingKey?`「${imForm.editingKey}」を編集中`:"新規食材を追加"}</span>
                {imForm.editingKey&&<button onClick={()=>{setImForm(EMPTY_IM_FORM);setImError("");}} style={{...btnStyle(false),fontSize:11,padding:"3px 10px",minHeight:32}}>キャンセル</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8,marginBottom:10}}>
                <div>
                  <div style={labelStyle}>食材名 *</div>
                  <input value={imForm.name} onChange={e=>setImForm(f=>({...f,name:e.target.value}))} placeholder="例: 豚ロース肉" style={{...inputStyle,width:"100%"}}/>
                </div>
                <div>
                  <div style={labelStyle}>単位</div>
                  <select value={imForm.unit} onChange={e=>setImForm(f=>({...f,unit:e.target.value}))} style={{...inputStyle,width:"100%"}}>
                    {["g","ml","個","本","丁","枚","袋","P","缶"].map(u=><option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <div style={labelStyle}>価格方式</div>
                  <select value={imForm.priceType} onChange={e=>setImForm(f=>({...f,priceType:e.target.value}))} style={{...inputStyle,width:"100%"}}>
                    <option value="100g">100g/ml あたり</option>
                    <option value="each">1個（単位）あたり</option>
                  </select>
                </div>
                <div>
                  <div style={labelStyle}>価格（円） *</div>
                  <input type="number" step="0.1" min="0" value={imForm.price} onChange={e=>setImForm(f=>({...f,price:e.target.value}))} placeholder="例: 80" style={{...inputStyle,width:"100%"}}/>
                </div>
                <div>
                  <div style={labelStyle}>賞味期限（日） *</div>
                  <input type="number" step="1" min="1" value={imForm.shelfDays} onChange={e=>setImForm(f=>({...f,shelfDays:e.target.value}))} placeholder="例: 3" style={{...inputStyle,width:"100%"}}/>
                </div>
                <div>
                  <div style={labelStyle}>購入最小単位量 *</div>
                  <input type="number" step="0.1" min="0" value={imForm.buyUnit} onChange={e=>setImForm(f=>({...f,buyUnit:e.target.value}))} placeholder="例: 300" style={{...inputStyle,width:"100%"}}/>
                </div>
                <div>
                  <div style={labelStyle}>購入単位ラベル</div>
                  <input value={imForm.buyUnitLabel} onChange={e=>setImForm(f=>({...f,buyUnitLabel:e.target.value}))} placeholder="例: 1枚(300g)" style={{...inputStyle,width:"100%"}}/>
                </div>
                <div>
                  <div style={labelStyle}>オプション</div>
                  <div style={{display:"flex",gap:12,height:32,alignItems:"center"}}>
                    <label style={{fontSize:12,display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                      <input type="checkbox" checked={imForm.frozen} onChange={e=>setImForm(f=>({...f,frozen:e.target.checked}))}/> 冷凍可
                    </label>
                    <label style={{fontSize:12,display:"flex",alignItems:"center",gap:4,cursor:"pointer"}}>
                      <input type="checkbox" checked={imForm.surplusOk} onChange={e=>setImForm(f=>({...f,surplusOk:e.target.checked}))}/> 余剰OK
                    </label>
                  </div>
                </div>
              </div>
              {imError&&<div style={{fontSize:12,color:C.red,marginBottom:8}}>⚠ {imError}</div>}
              <button onClick={handleSaveIngr} style={{...btnStyle(true),fontSize:12}}>
                {imForm.editingKey?"更新する":"食材を追加する"}
              </button>
            </div>

            {/* 一覧 */}
            <div style={{fontSize:12,fontWeight:500,color:C.textSec,marginBottom:8}}>登録済み食材一覧（{imEntries.length}種）</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:6}}>
              {imEntries.map(([name,m])=>{
                const isDefault=!!IM_DEFAULT[name];
                const unitCost=m.price100!=null?`¥${m.price100}/100${m.unit}`:`¥${m.priceEach}/${m.unit}`;
                const col=m.shelfDays<=3?"#E24B4A":m.shelfDays<=7?"#EF9F27":"#639922";
                return(
                  <div key={name} style={{border:`0.5px solid ${imForm.editingKey===name?C.blue:C.border}`,borderRadius:8,padding:"9px 11px",background:imForm.editingKey===name?C.bgInfo:C.bg,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                        <span style={{fontSize:12,fontWeight:500}}>{name}</span>
                        {m.frozen&&<span style={{fontSize:9,color:C.blue,background:C.bgInfo,padding:"1px 4px",borderRadius:3}}>❄冷凍</span>}
                        {!isDefault&&<span style={{fontSize:9,color:C.green,background:C.bgOk,padding:"1px 4px",borderRadius:3}}>追加</span>}
                      </div>
                      <div style={{fontSize:10,color:C.textMut,marginTop:2}}>{unitCost} · {m.buyUnitLabel||"—"}</div>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:3}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:col}}/>
                        <span style={{fontSize:9,color:C.textMut}}>期限{m.shelfDays}日{m.surplusOk?" · 余剰OK":""}</span>
                      </div>
                    </div>
                    <button
                      onClick={()=>handleDelIngr(name)}
                      style={{flexShrink:0,fontSize:10,padding:"2px 8px",borderRadius:5,border:`0.5px solid ${imConfirm===name?"#F7C1C1":C.border}`,background:imConfirm===name?C.bgWarn:"none",color:imConfirm===name?C.red:C.textMut,cursor:"pointer",whiteSpace:"nowrap"}}>
                      {imConfirm===name?"確認削除":"削除"}
                    </button>
                  </div>
                );
              })}
            </div>
            {imConfirm&&<p style={{fontSize:11,color:C.red,marginTop:8}}>「{imConfirm}」の削除ボタンをもう一度押すと確定されます。</p>}
          </div>
        )}

        {/* ─── レシピマスタ管理 ─── */}
        {masterTab==="recipe"&&(
          <div>
            {/* 追加フォーム */}
            <div style={{...cardStyle,marginBottom:16}}>
              <div id="rm-form-top" style={{fontSize:13,fontWeight:500,marginBottom:10,paddingBottom:8,borderBottom:`0.5px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                <span>{rmForm.editingKey?`「${rmForm.editingKey}」を編集中`:"新規レシピを追加"}</span>
                {rmForm.editingKey&&<button onClick={()=>{setRmForm({editingKey:"",name:"",cat:"balance",tags:"",ing:[{...EMPTY_INGR_ROW}]});setRmError("");}} style={{...btnStyle(false),fontSize:11,padding:"3px 10px",minHeight:32}}>キャンセル</button>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:8,marginBottom:12}}>
                <div>
                  <div style={labelStyle}>レシピ名 *</div>
                  <input value={rmForm.name} onChange={e=>setRmForm(f=>({...f,name:e.target.value}))} placeholder="例: 豚キムチ定食" style={{...inputStyle,width:"100%"}}/>
                </div>
                <div>
                  <div style={labelStyle}>カテゴリ</div>
                  <select value={rmForm.cat} onChange={e=>setRmForm(f=>({...f,cat:e.target.value}))} style={{...inputStyle,width:"100%"}}>
                    <option value="balance">バランス (balance)</option>
                    <option value="save">節約 (save)</option>
                    <option value="nutr">栄養重視 (nutr)</option>
                  </select>
                </div>
                <div>
                  <div style={labelStyle}>タグ（カンマ区切り）</div>
                  <input value={rmForm.tags} onChange={e=>setRmForm(f=>({...f,tags:e.target.value}))} placeholder="例: 肉, 主菜" style={{...inputStyle,width:"100%"}}/>
                </div>
              </div>

              {/* 食材行 */}
              <div style={{fontSize:12,fontWeight:500,marginBottom:6,color:C.textSec}}>使用食材（1人分）</div>
              {rmForm.ing.map((row,idx)=>(
                <div key={idx} style={{display:"grid",gridTemplateColumns:"1fr 90px 80px 32px",gap:6,marginBottom:6,alignItems:"center"}}>
                  <input value={row.n} onChange={e=>updateIngRow(idx,"n",e.target.value)} placeholder="食材名"
                    list="im-datalist" style={{...inputStyle,width:"100%"}}/>
                  <datalist id="im-datalist">{Object.keys(im).map(n=><option key={n} value={n}/>)}</datalist>
                  <select value={row.qtyType} onChange={e=>updateIngRow(idx,"qtyType",e.target.value)} style={{...inputStyle,width:"100%"}}>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="count">個/本/丁</option>
                  </select>
                  <input type="number" step="0.1" min="0" value={row.qty} onChange={e=>updateIngRow(idx,"qty",e.target.value)} placeholder="量" style={{...inputStyle,width:"100%"}}/>
                  <button onClick={()=>delIngRow(idx)} style={{height:32,width:32,border:`0.5px solid #F7C1C1`,borderRadius:6,background:C.bgWarn,color:C.red,cursor:"pointer",fontSize:14,flexShrink:0}}>×</button>
                </div>
              ))}
              <button onClick={addIngRow} style={{...btnStyle(false),fontSize:11,marginBottom:12}}>+ 食材を追加</button>

              {rmError&&<div style={{fontSize:12,color:C.red,marginBottom:8}}>⚠ {rmError}</div>}
              <button onClick={handleSaveRecipe} style={{...btnStyle(true),fontSize:12}}>
                {rmForm.editingKey?"更新する":"レシピを追加する"}
              </button>
            </div>

            {/* 一覧 */}
            <div style={{fontSize:12,fontWeight:500,color:C.textSec,marginBottom:8}}>登録済みレシピ一覧（{rmEntries.length}品）</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:7}}>
              {rmEntries.map(([name,r])=>{
                const cost=calcMealCost(name,1,rm,im);
                const catColor=r.cat==="save"?C.green:r.cat==="nutr"?C.blue:C.textMut;
                const catBg  =r.cat==="save"?C.bgOk :r.cat==="nutr"?C.bgInfo:C.bgSub;
                const isDefault=!!RM_DEFAULT[name];
                return(
                  <div key={name} style={{border:`0.5px solid ${rmForm.editingKey===name?C.blue:C.border}`,borderRadius:8,padding:"9px 11px",background:rmForm.editingKey===name?C.bgInfo:C.bg}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6,marginBottom:5}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                          <span style={{fontSize:12,fontWeight:500}}>{name}</span>
                          {!isDefault&&<span style={{fontSize:9,color:C.green,background:C.bgOk,padding:"1px 4px",borderRadius:3}}>追加</span>}
                        </div>
                        <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                          <span style={{fontSize:9,background:catBg,color:catColor,padding:"1px 5px",borderRadius:3}}>{r.cat}</span>
                          {(r.tags||[]).map(t=><span key={t} style={{fontSize:9,background:C.bgSub,color:C.textMut,padding:"1px 5px",borderRadius:3}}>{t}</span>)}
                        </div>
                      </div>
                      <div style={{flexShrink:0,textAlign:"right",display:"flex",flexDirection:"column",gap:4}}>
                        <div style={{fontSize:11,fontWeight:500,color:C.textPri}}>¥{cost}</div>
                        <button onClick={()=>handleEditRecipe(name)} style={{fontSize:10,padding:"2px 8px",borderRadius:5,border:`0.5px solid ${C.border}`,background:C.bgSub,color:C.textSec,cursor:"pointer",whiteSpace:"nowrap"}}>編集</button>
                        <button onClick={()=>handleDelRecipe(name)} style={{fontSize:10,padding:"2px 8px",borderRadius:5,border:`0.5px solid ${rmConfirm===name?"#F7C1C1":C.border}`,background:rmConfirm===name?C.bgWarn:"none",color:rmConfirm===name?C.red:C.textMut,cursor:"pointer",whiteSpace:"nowrap"}}>{rmConfirm===name?"確認削除":"削除"}</button>
                      </div>
                    </div>
                    <div style={{borderTop:`0.5px solid ${C.border}`,paddingTop:5}}>
                      {r.ing.map(i=>{
                        const qty=i.g!=null?`${i.g}g`:i.ml!=null?`${i.ml}ml`:`${i.count}${im[i.n]?.unit||""}`;
                        const inMaster=!!im[i.n];
                        return(
                          <div key={i.n} style={{display:"flex",justifyContent:"space-between",fontSize:10,color:inMaster?C.textSec:"#E24B4A",paddingBottom:1}}>
                            <span>{i.n}{!inMaster&&" ⚠未登録"}</span><span>{qty}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            {rmConfirm&&<p style={{fontSize:11,color:C.red,marginTop:8}}>「{rmConfirm}」の削除ボタンをもう一度押すと確定されます。</p>}
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // MAIN RENDER
  // ============================================================
  const TABS=[
    {id:"plan",  label:"献立表"},
    {id:"shop",  label:"買い物リスト"},
    {id:"cost",  label:"食費まとめ"},
    {id:"ingr",  label:"食材・在庫"},
    {id:"tips",  label:"改善提案"},
    {id:"master",label:"マスタ管理"},
  ];

  return(
    <div style={{fontFamily:"system-ui,-apple-system,sans-serif",padding:"16px 8px",maxWidth:960,margin:"0 auto"}}>
      {/* ヘッダー */}
      <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end",marginBottom:14}}>
        <div style={{display:"flex",flexDirection:"column",gap:3}}>
          <label style={labelStyle}>人数</label>
          <input type="number" step="1" min="1" max="6" value={people} onChange={e=>setPeople(Math.max(1,Math.min(6,parseFloat(e.target.value)||1)))} style={{...inputStyle,width:65}}/>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:3}}>
          <label style={labelStyle}>方針</label>
          <div style={{display:"flex",gap:5}}>
            {[["balance","バランス"],["save","節約"],["nutr","栄養重視"]].map(([p,l])=>(
              <button key={p} onClick={()=>setPol(p)} style={btnStyle(pol===p)}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{marginLeft:"auto",fontSize:11,color:C.textMut,alignSelf:"center",textAlign:"right"}}>
          在庫 {stockCount}種 · 購入済み {Object.values(bought).filter(Boolean).length}/8回
          {wasteRisks.length>0&&<span style={{color:C.red,marginLeft:6}}>· ⚠廃棄リスク{wasteRisks.length}品</span>}
        </div>
      </div>

      {/* タブ */}
      <div style={{display:"flex",gap:0,borderBottom:`0.5px solid ${C.border}`,marginBottom:14,overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{padding:"7px 14px",fontSize:13,cursor:"pointer",border:"none",background:"none",whiteSpace:"nowrap",
              color:tab===t.id?C.textPri:C.textMut,
              borderBottom:tab===t.id?`2px solid ${C.textPri}`:"2px solid transparent",
              fontWeight:tab===t.id?500:400}}>
            {t.label}
            {t.id==="ingr"&&wasteRisks.length>0&&<span style={{marginLeft:4,fontSize:9,background:C.bgWarn,color:C.red,padding:"1px 4px",borderRadius:3}}>!</span>}
            {t.id==="master"&&<span style={{marginLeft:4,fontSize:9,background:C.bgInfo,color:C.blue,padding:"1px 4px",borderRadius:3}}>{Object.keys(im).length}/{Object.keys(rm).length}</span>}
          </button>
        ))}
      </div>

      {/* コンテンツ */}
      {tab==="plan"   && renderPlan()}
      {tab==="shop"   && renderShop()}
      {tab==="cost"   && renderCost()}
      {tab==="ingr"   && renderIngr()}
      {tab==="tips"   && renderTips()}
      {tab==="master" && renderMaster()}
    </div>
  );
}
