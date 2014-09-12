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
        .attr('disabled', true)
        .attr('value', 'ololo')
        .attr('class', 'a b c')
        .attr('style', 'color: red; display: block;');

    deepEqual(
        [
            $B(input).attr('name'),
            $B(input).attr('test1'),
            $B(input).attr('test2'),
            $B(input).attr('checked'),
            $B(input).attr('disabled'),
            $B(input).attr('value'),
            $B(input).attr('class')
        ],
        [
            'test-i',
            'val1',
            'val2',
            true,
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
        .attr('disabled', false)
        .attr('value', null)
        .attr('style', 'color: green;');

    deepEqual(
        [
            $B(input).attr('name'),
            $B(input).attr('test1'),
            $B(input).attr('checked'),
            $B(input).attr('disabled'),
            $B(input).attr('value')
        ],
        [
            null,
            null,
            false,
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

    ok($B('.piu-piu-piu').attr('name') === undefined, 'Value for empty set should be undefined');
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
        id = 1,
        off,
        clickHandler = function() { var hid = id++; return function(e) { ret.push(hid + ' ' + e.type + ' ' + tag(this) + ' ' + tag(e.target)); }; },
        customHandler = function() { var hid = id++; return function(e) { ret.push(hid + ' ' + e.type + ' ' + tag(this) + ' ' + tag(e.target) + ' ' + JSON.stringify(e.detail)); }; };

    $B(container)
        .on('click', (off = clickHandler()))
        .on('my-event', customHandler())
        .emit('click')
        .emit('my-event', {ololo: 'piu', yep: 123})
        .emit('click')
        .off('click', off)
        .emit('click');

    deepEqual(
        ret,
        [
            '1 click div div',
            '2 my-event div div {"ololo":"piu","yep":123}',
            '1 click div div'
        ]
    );

    container.innerHTML = '<p><strong><em>ololo</em></strong><a>piu</a></p>';

    var p = container.firstChild,
        em = p.firstChild.firstChild,
        a = p.lastChild;

    ret = [];
    $B(p)
        .on('click', clickHandler())
        .on('my-event', customHandler());
    $B(em).on('click', clickHandler());
    $B(a).on('click', clickHandler());

    $B(em).emit('click');
    $B(a).emit('click');
    $B(p).emit('click');
    $B(em).emit('my-event', 100500);

    deepEqual(
        ret,
        [
            '5 click em em',
            '3 click p em',
            '6 click a a',
            '3 click p a',
            '3 click p p',
            '4 my-event p em 100500',
            '2 my-event div em 100500'
        ]
    );

    ret = [];
    var stop = true,
        stop2 = true;
    $B(em).on('click', function(e) {
        ret.push((stop ? '' : 'no ') + 'stopPropagation ' + e.type + ' ' + tag(this) + ' ' + tag(e.target));
        if (stop) {
            e.stopPropagation();
            stop = false;
        }
    });
    $B(a).on('click', function(e) {
        ret.push((stop2 ? '' : 'no ') + 'stopImmediatePropagation ' + e.type + ' ' + tag(this) + ' ' + tag(e.target));
        if (stop2) {
            e.stopImmediatePropagation();
            stop2 = false;
        }
    });
    $B(a).on('event1 event2 event3', customHandler());

    $B(em).on('click', clickHandler());
    $B(a).on('click', clickHandler());

    $B(em).emit('click');
    $B(a)
        .emit('click')
        .emit('event1', 111)
        .emit('event3', 333)
        .emit('event2', 222);

    $B(em).emit('click');
    $B(a).emit('click');

    deepEqual(
        ret,
        [
            '5 click em em',
            'stopPropagation click em em',
            '8 click em em',
            '6 click a a',
            'stopImmediatePropagation click a a',
            '7 event1 a a 111',
            '7 event3 a a 333',
            '7 event2 a a 222',

            '5 click em em',
            'no stopPropagation click em em',
            '8 click em em',
            '3 click p em',
            '6 click a a',
            'no stopImmediatePropagation click a a',
            '9 click a a',
            '3 click p a'
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


test('babydom form serialization test', function() {
    var container = document.getElementById('container');

    container.innerHTML =
        '<form>' +
            '<input type="text" value="ololo">' + // No name.

            '<input type="file" name="f0">' +

            '<input type="text" name="f1" value="v1">' +
            '<input type="hidden" name="f2" value="v2">' +
            '<input type="password" name="f3" value="v3">' +
            '<input type="email" name="f4" value="v4">' +

            '<input type="radio" name="f5" value="v5-1">' +
            '<input type="radio" name="f5" value="v5-2" checked="checked">' +
            '<input type="radio" name="f5" value="v5-3">' +

            '<input type="checkbox" name="f6" value="v6">' +
            '<input type="checkbox" name="f7" value="v7" checked="checked">' +

            '<input type="checkbox" name="f8" value="v8-1" checked="checked">' +
            '<input type="checkbox" name="f8" value="v8-2">' +
            '<input type="checkbox" name="f8" value="v8-3" checked="checked">' +

            '<select name="f9">' +
                '<option value="v9-1">9-1</option>' +
                '<option value="v9-2" selected="selected">9-2</option>' +
                '<option value="v9-3">9-3</option>' +
            '</select>' +

            '<select name="f10" multiple="multiple">' +
                '<option value="v10-1" selected="selected">10-1</option>' +
                '<option value="v10-2">10-2</option>' +
                '<option value="v10-3" selected="selected">10-3</option>' +
            '</select>' +

            '<textarea name="f11">Hello world</textarea>' +

            '<input type="submit" name="f12">' +
            '<input type="reset" name="f13">' +
            '<input type="button" name="f14">' +
            '<button type="submit" name="f15">' +
        '</form>';

    deepEqual($B('form', container).serialize(), [
        {name: 'f1', value: 'v1'},
        {name: 'f2', value: 'v2'},
        {name: 'f3', value: 'v3'},
        {name: 'f4', value: 'v4'},
        {name: 'f5', value: 'v5-2'},
        {name: 'f7', value: 'v7'},
        {name: 'f8', value: 'v8-1'},
        {name: 'f8', value: 'v8-3'},
        {name: 'f9', value: 'v9-2'},
        {name: 'f10', value: 'v10-1'},
        {name: 'f10', value: 'v10-3'},
        {name: 'f11', value: 'Hello world'}
    ]);

    deepEqual($B('form', container).serialize('map'), {
        f1: 'v1',
        f2: 'v2',
        f3: 'v3',
        f4: 'v4',
        f5: 'v5-2',
        f7: 'v7',
        f8: 'v8-1',
        f9: 'v9-2',
        f10: 'v10-1',
        f11: 'Hello world'
    });

    deepEqual(
        $B('form', container).serialize('qs'),
        'f1=v1&f2=v2&f3=v3&f4=v4&f5=v5-2&f7=v7&f8=v8-1&f8=v8-3&f9=v9-2&f10=v10-1&f10=v10-3&f11=Hello%20world'
    );

    container.innerHTML = container.innerHTML + '<div>' + container.innerHTML + '</div>';

    deepEqual($B('form', container).serialize(), [
        {name: 'f1', value: 'v1'},
        {name: 'f2', value: 'v2'},
        {name: 'f3', value: 'v3'},
        {name: 'f4', value: 'v4'},
        {name: 'f5', value: 'v5-2'},
        {name: 'f7', value: 'v7'},
        {name: 'f8', value: 'v8-1'},
        {name: 'f8', value: 'v8-3'},
        {name: 'f9', value: 'v9-2'},
        {name: 'f10', value: 'v10-1'},
        {name: 'f10', value: 'v10-3'},
        {name: 'f11', value: 'Hello world'},

        {name: 'f1', value: 'v1'},
        {name: 'f2', value: 'v2'},
        {name: 'f3', value: 'v3'},
        {name: 'f4', value: 'v4'},
        {name: 'f5', value: 'v5-2'},
        {name: 'f7', value: 'v7'},
        {name: 'f8', value: 'v8-1'},
        {name: 'f8', value: 'v8-3'},
        {name: 'f9', value: 'v9-2'},
        {name: 'f10', value: 'v10-1'},
        {name: 'f10', value: 'v10-3'},
        {name: 'f11', value: 'Hello world'}
    ]);

    deepEqual($B('form', container).serialize('map'), {
        f1: 'v1',
        f2: 'v2',
        f3: 'v3',
        f4: 'v4',
        f5: 'v5-2',
        f7: 'v7',
        f8: 'v8-1',
        f9: 'v9-2',
        f10: 'v10-1',
        f11: 'Hello world'
    });

    deepEqual(
        $B('form', container).serialize('qs'),
        'f1=v1&f2=v2&f3=v3&f4=v4&f5=v5-2&f7=v7&f8=v8-1&f8=v8-3&f9=v9-2&f10=v10-1&f10=v10-3&f11=Hello%20world&' +
        'f1=v1&f2=v2&f3=v3&f4=v4&f5=v5-2&f7=v7&f8=v8-1&f8=v8-3&f9=v9-2&f10=v10-1&f10=v10-3&f11=Hello%20world'
    );

    container.innerHTML = '';
});
