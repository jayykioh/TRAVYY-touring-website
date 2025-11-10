const pc = require('../poi-categories');

describe('poi-categories', () => {
  test('getPriorityCategories returns non-lazy sorted by priority', () => {
    const pri = pc.getPriorityCategories();
    expect(Array.isArray(pri)).toBe(true);
    // none of priority categories should have lazy true
    expect(pri.every(p => p.lazy !== true)).toBe(true);
    // keys should include 'views' as top
    expect(pri[0].key).toBe('views');
  });

  test('getLazyCategories returns lazy ones and sorted', () => {
    const lazy = pc.getLazyCategories();
    expect(Array.isArray(lazy)).toBe(true);
    expect(lazy.length).toBeGreaterThan(0);
    expect(lazy.some(l => l.key === 'food')).toBe(true);
  });

  test('getAllCategoryKeys contains known keys', () => {
    const keys = pc.getAllCategoryKeys();
    expect(keys).toEqual(expect.arrayContaining(['views', 'food', 'culture']));
  });

  test('getCategoryByVibes picks best matching category', () => {
    const cat = pc.getCategoryByVibes(['food', 'local']);
    expect(cat).toBeTruthy();
    expect(cat.key).toBe('food');

    const fallback = pc.getCategoryByVibes([]);
    expect(fallback.key).toBe('views');
  });
});
