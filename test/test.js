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
            null
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
    var container = document.getElementById('container');

    $B(container).text('Hello <world> &nbsp;!');
    deepEqual($B(container).text(), 'Hello <world> &nbsp;!');

    container.innerHTML = 'Hello <world>beautiful</world> &nbsp;!';
    deepEqual($B(container).text(), 'Hello beautiful  !');

    container.innerHTML = '';
});


test('babydom events test', function() {
    var container = document.getElementById('container'),
        ret = [],
        clickHandler = function(e) { ret.push('clicked ' + e.type + ' ' + this.nodeType); };

    $B(container)
        .on('click', clickHandler)
        .emit('click')
        .emit('click')
        .off('click', clickHandler)
        .emit('click');

    deepEqual(ret, ['clicked click 1', 'clicked click 1']);
});
