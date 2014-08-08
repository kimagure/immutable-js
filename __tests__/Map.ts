///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import Immutable = require('../dist/Immutable');
import Map = Immutable.Map;

describe('Map', () => {

  it('converts from object', () => {
    var m = Map.from({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('constructor provides initial values', () => {
    var m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('constructor provides initial values as array', () => {
    var m = Map(['A','B','C']);
    expect(m.get(0)).toBe('A');
    expect(m.get(1)).toBe('B');
    expect(m.get(2)).toBe('C');
  });

  it('constructor provides initial values as sequence', () => {
    var s = Immutable.Sequence({'a': 'A', 'b': 'B', 'c': 'C'});
    var m = Map(s);
    expect(m.get('a')).toBe('A');
    expect(m.get('b')).toBe('B');
    expect(m.get('c')).toBe('C');
  });

  it('constructor is identity when provided map', () => {
    var m1 = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    var m2 = Map(m1);
    expect(m2).toBe(m1);
  });

  it('converts back to JS object', () => {
    var m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    expect(m.toObject()).toEqual({'a': 'A', 'b': 'B', 'c': 'C'});
  });

  it('iterates values', () => {
    var m = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    var iterator = jest.genMockFunction();
    m.forEach(iterator);
    expect(iterator.mock.calls).toEqual([
      ['A', 'a', m],
      ['B', 'b', m],
      ['C', 'c', m]
    ]);
  });

  it('merges two maps', () => {
    var m1 = Map({'a': 'A', 'b': 'B', 'c': 'C'});
    var m2 = Map({'wow': 'OO', 'd': 'DD', 'b': 'BB'});
    expect(m2.toObject()).toEqual({'wow': 'OO', 'd': 'DD', 'b': 'BB'});
    var m3 = m1.merge(m2);
    expect(m3.toObject()).toEqual({'a': 'A', 'b': 'BB', 'c': 'C', 'wow': 'OO', 'd': 'DD'});
  });

  it('is persistent to sets', () => {
    var m1 = Map();
    var m2 = m1.set('a', 'Aardvark');
    var m3 = m2.set('b', 'Baboon');
    var m4 = m3.set('c', 'Canary');
    var m5 = m4.set('b', 'Bonobo');
    expect(m1.length).toBe(0);
    expect(m2.length).toBe(1);
    expect(m3.length).toBe(2);
    expect(m4.length).toBe(3);
    expect(m5.length).toBe(3);
    expect(m3.get('b')).toBe('Baboon');
    expect(m5.get('b')).toBe('Bonobo');
  });

  it('is persistent to removes', () => {
    var m1 = Map();
    var m2 = m1.set('a', 'Aardvark');
    var m3 = m2.set('b', 'Baboon');
    var m4 = m3.set('c', 'Canary');
    var m5 = m4.remove('b');
    expect(m1.length).toBe(0);
    expect(m2.length).toBe(1);
    expect(m3.length).toBe(2);
    expect(m4.length).toBe(3);
    expect(m5.length).toBe(2);
    expect(m3.has('b')).toBe(true);
    expect(m3.get('b')).toBe('Baboon');
    expect(m5.has('b')).toBe(false);
    expect(m5.get('b')).toBe(undefined);
    expect(m5.get('c')).toBe('Canary');
  });

  it('removes down to empty map', () => {
    var m1 = Map({a:'A', b:'B', c:'C'});
    var m2 = m1.remove('a');
    var m3 = m2.remove('b');
    var m4 = m3.remove('c');
    expect(m1.length).toBe(3);
    expect(m2.length).toBe(2);
    expect(m3.length).toBe(1);
    expect(m4.length).toBe(0);
    expect(m4).toBe(Map.empty());
  });

  it('can map many items', () => {
    var m = Map();
    for (var ii = 0; ii < 2000; ii++) {
       m = m.set('thing:' + ii, ii);
    }
    expect(m.length).toBe(2000);
    expect(m.get('thing:1234')).toBe(1234);
  });

  it('can map items known to hash collide', () => {
    var m = Map().set('AAA', 'letters').set(64545, 'numbers');
    expect(m.length).toBe(2);
    expect(m.get('AAA')).toEqual('letters');
    expect(m.get(64545)).toEqual('numbers');
  });

  it('maps values', () => {
    var m = Map({a:'a', b:'b', c:'c'});
    var r = m.map(value => value.toUpperCase());
    expect(r.toObject()).toEqual({a:'A', b:'B', c:'C'});
  });

  it('filters values', () => {
    var m = Map({a:1, b:2, c:3, d:4, e:5, f:6});
    var r = m.filter(value => value % 2 === 1);
    expect(r.toObject()).toEqual({a:1, c:3, e:5});
  });

  it('derives keys', () => {
    var v = Map({a:1, b:2, c:3, d:4, e:5, f:6});
    expect(v.keys().toArray()).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  it('flips keys and values', () => {
    var v = Map({a:1, b:2, c:3, d:4, e:5, f:6});
    expect(v.flip().toObject()).toEqual({1:'a', 2:'b', 3:'c', 4:'d', 5:'e', 6:'f'});
  });

  it('can convert to a vector', () => {
    var m = Map({a:1, b:2, c:3});
    var v = m.toVector();
    var k = m.keys().toVector();
    expect(v.length).toBe(3);
    expect(k.length).toBe(3);
    // Note: Map has undefined ordering, this Vector may not be the same
    // order as the order you set into the Map.
    expect(v.get(1)).toBe(2);
    expect(k.get(1)).toBe('b');
  });

});
