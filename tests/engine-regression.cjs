const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function engine(seed = {}) {
  const data = new Map(Object.entries(seed));
  const context = vm.createContext({
    LESSON: { id: 'test' },
    document: { querySelector: () => ({}), querySelectorAll: () => [],addEventListener:()=>{} },
    Atlas:{storage:{getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)},error:()=>{}},addEventListener:()=>{},
  });
  context.window=context;
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../app/v2/engine.js'), 'utf8'), context);
  return { run: code => vm.runInContext(code, context), read: () => JSON.parse(data.get('atlas:test:progress')) };
}

test('reopening a question does not replace an incorrect first attempt', () => {
  const e = engine();
  e.run("mark('q', false); mark('q', true)");
  assert.equal(e.read().q.ok, false);
  assert.equal(e.read().q.firstAttempt, false);
  assert.equal(e.read().q.hints, 1);
});

test('a correct first attempt survives later incorrect attempts', () => {
  const e = engine();
  e.run("mark('q', true); mark('q', false)");
  assert.equal(e.read().q.ok, true);
  assert.equal(e.read().q.hints, 0);
});

test('editing an open answer still persists its latest text', () => {
  const e = engine();
  e.run("mark('q', false, {text:'first', answered:true}); mark('q', false, {text:'edited', answered:true})");
  assert.equal(e.read().q.text, 'edited');
  assert.equal(e.read().q.answered, true);
});

test('legacy incorrect progress is preserved', () => {
  const e = engine({ 'atlas:test:progress': JSON.stringify({q:{ok:false,hints:1}}) });
  e.run("mark('q', true)");
  assert.equal(e.read().q.ok, false);
  assert.equal(e.read().q.firstAttempt, false);
});

test('typing an explanation before choosing does not count as a graded attempt', () => {
  const e = engine({ 'atlas:test:progress': JSON.stringify({q:{ok:false,hints:0,text:'because',answered:true}}) });
  e.run("mark('q', true)");
  assert.equal(e.read().q.ok, true);
});

test('profile names render as literal text, including replacement tokens', () => {
  const e = engine({ 'atlas:profile': JSON.stringify({name:'<b>$&</b>',gender:'f'}) });
  // الاسم يُهرَّب ويُعزل في <bdi data-raw> فلا تعدّه شبكة التذكير والتأنيث علامة
  assert.equal(e.run("tx('{اسم} {ولد|بنت}')"), '<bdi data-raw>&lt;b&gt;$&amp;&lt;/b&gt;</bdi> بنت');
});

test('a name containing gender markers stays literal', () => {
  const e = engine({ 'atlas:profile': JSON.stringify({name:'{أ|ب}',gender:'m'}) });
  assert.equal(e.run("tx('{اسم} {ولد|بنت}')"), '<bdi data-raw>&#123;أ&#124;ب&#125;</bdi> ولد');
});
