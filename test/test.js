function styleEqual(style1, style2) {
    var obj1 = {},
        obj2 = {},
        tmp,
        tmp2,
        i;

    tmp = (style1 || '').split(';');
    for (i = 0; i < tmp.length; i++) {
        if ((tmp2 = tmp[i].trim())) {
            tmp2 = tmp2.split(':').map(function (val) { return val.trim().toLowerCase(); });
            obj1[tmp2[0]] = tmp2[1];
        }
    }

    tmp = (style2 || '').split(';');
    for (i = 0; i < tmp.length; i++) {
        if ((tmp2 = tmp[i].trim())) {
            tmp2 = tmp2.split(':').map(function (val) { return val.trim().toLowerCase(); });
            obj2[tmp2[0]] = tmp2[1];
        }
    }

    deepEqual(obj1, obj2);
}


function tag(node) {
    return node.tagName.toLowerCase();
}


test('babydom attr test', function() {
    var container = document.getElementById('container'),
        input;

    container.innerHTML = '<input type="checkbox" />';
    input = container.firstChild;

    $B(input)
        .attr('name', 'test-i')
        .attr('test1', 'val1')
        .attr('test2', 'val2')
        .attr('checked', true)
        .attr('value', 'ololo')
        .attr('class', 'a b c')
        .attr('style', 'color: red; display: block;');

    deepEqual(
        [
            $B(input).attr('name'),
            $B(input).attr('test1'),
            $B(input).attr('test2'),
            $B(input).attr('checked'),
            $B(input).attr('value'),
            $B(input).attr('class')
        ],
        [
            'test-i',
            'val1',
            'val2',
            true,
            'ololo',
            'a b c'
        ]
    );
    styleEqual($B(input).attr('style'), 'color: red; display: block;');

    $B(input)
        .attr('name', null)
        .attr('test1', null)
        .attr('checked', null)
        .attr('value', null)
        .attr('style', 'color: green;');

    deepEqual(
        [
            $B(input).attr('name'),
            $B(input).attr('test1'),
            $B(input).attr('checked'),
            $B(input).attr('value')
        ],
        [
            null,
            null,
            false,
            ''
        ]
    );
    styleEqual($B(input).attr('style'), 'color: green;');

    $B(input).attr('style', {color: 'yellow', display: 'inline-block'});
    styleEqual($B(input).attr('style'), 'display: inline-block; color: yellow');

    $B(input).attr('style', null);
    styleEqual($B(input).attr('style'), null);

    container.innerHTML = '';
});


test('babydom text test', function() {
    var container = document.getElementById('container'),
        tmp;

    tmp = $B(container);
    deepEqual(tmp.text('Piu').text('Hello <world> &nbsp;!'), tmp);
    deepEqual($B(container).text(), 'Hello <world> &nbsp;!');

    container.innerHTML = 'Hello <world>beautiful</world> &nbsp;!';
    deepEqual($B(container).text(), 'Hello beautiful  !');

    container.innerHTML = '';

    ok($B('.ololo-piu-piu').text() === undefined, 'Text for empty set should be undefined');
});


test('babydom events test', function() {
    var container = document.getElementById('container'),
        ret = [],
        clickHandler = function(e) { ret.push(e.type + ' ' + tag(this) + ' ' + tag(e.target)); },
        customHandler = function(e) { ret.push(e.type + ' ' + tag(this) + ' ' + tag(e.target) + ' ' + JSON.stringify(e.detail)); };

    $B(container)
        .on('click', clickHandler)
        .on('my-event', customHandler)
        .emit('click')
        .emit('my-event', {ololo: 'piu', yep: 123})
        .emit('click')
        .off('click', clickHandler)
        .emit('click');

    deepEqual(
        ret,
        [
            'click div div',
            'my-event div div {"ololo":"piu","yep":123}',
            'click div div'
        ]
    );

    container.innerHTML = '<p><strong><em>ololo</em></strong><a>piu</a></p>';

    var p = container.firstChild,
        em = p.firstChild.firstChild,
        a = p.lastChild;

    ret = [];
    $B(p)
        .on('click', clickHandler)
        .on('my-event', customHandler);
    $B(em).on('click', clickHandler);
    $B(a).on('click', clickHandler);

    $B(em).emit('click');
    $B(a).emit('click');
    $B(p).emit('click');
    $B(em).emit('my-event', 100500);

    deepEqual(
        ret,
        [
            'click em em',
            'click p em',
            'click a a',
            'click p a',
            'click p p',
            'my-event p em 100500',
            'my-event div em 100500'
        ]
    );

    ret = [];
    $B(em).on('click', function(e) {
        ret.push('stopPropagation ' + e.type + ' ' + tag(this) + ' ' + tag(e.target));
        e.stopPropagation();
    });
    $B(a).on('click', function(e) {
        ret.push('stopImmediatePropagation ' + e.type + ' ' + tag(this) + ' ' + tag(e.target));
        e.stopImmediatePropagation();
    });
    $B(a).on('event1 event2 event3', customHandler);
    $B(em).emit('click');
    $B(a)
        .emit('click')
        .emit('event1', 111)
        .emit('event3', 333)
        .emit('event2', 222);

    deepEqual(
        ret,
        [
            'stopPropagation click em em',
            'click em em',
            'stopImmediatePropagation click a a',
            'event1 a a 111',
            'event3 a a 333',
            'event2 a a 222'
        ]
    );

    container.innerHTML = '';

    ret = [];
    $B(container)
        .off('my-event')
        .emit('my-event', 100500);
    deepEqual(ret, []);
});


test('babydom class test', function() {
    var container = document.getElementById('container');

    $B(container)
        .addClass('a b c')
        .addClass('b d c')
        .addClass(' e a f ');
    deepEqual($B(container).attr('class'), 'a b c d e f');

    $B(container)
        .removeClass('a b')
        .removeClass(' d f ');
    deepEqual($B(container).attr('class'), 'c e');

    $B(container)
        .attr('class', 'a b c d e f')
        .toggleClass('a c d f g h');
    deepEqual($B(container).attr('class'), 'b e g h');

    $B(container)
        .attr('class', 'a b c d e f')
        .toggleClass('a c d f g h', true);
    deepEqual($B(container).attr('class'), 'a b c d e f g h');

    $B(container)
        .attr('class', 'a b c d e f')
        .toggleClass('a c d f g h', {some: 123});
    deepEqual($B(container).attr('class'), 'a b c d e f g h');

    $B(container)
        .attr('class', 'a b c d e f')
        .toggleClass('a c d f g h', false);
    deepEqual($B(container).attr('class'), 'b e');

    $B(container)
        .attr('class', 'a b c d e f')
        .toggleClass('a c d f g h', 0);
    deepEqual($B(container).attr('class'), 'b e');
    deepEqual($B(container).hasClass('b'), true);
    deepEqual($B(container).hasClass('e'), true);
    deepEqual($B(container).hasClass('f'), false);

    $B(container).toggleClass('e b');
    deepEqual($B(container).attr('class'), null);
});


test('babydom selector test', function() {
    var ret = $B('#container');

    deepEqual(ret.length, 1);
    deepEqual(tag(ret[0]), 'div');

    ret = $B('body > div, head > script');
    deepEqual(ret.length, 4);
    deepEqual(tag(ret[0]), 'script');
    deepEqual(tag(ret[1]), 'script');
    deepEqual(tag(ret[2]), 'div');
    deepEqual(tag(ret[3]), 'div');

    ret.attr('test', 'ololo');
});
