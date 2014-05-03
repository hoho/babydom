test('babydom basic test', function() {
    var container = document.getElementById('container'),
        ret = [],
        clickHandler = function(e) { ret.push('clicked ' + e.type + ' ' + this.nodeType); };

    $B(container).on('click', clickHandler);

    $B(container)
        .trigger('click')
        .trigger('click');

    $B(container).off('click', clickHandler);

    $B(container)
        .trigger('click');

    deepEqual(ret, ['clicked click 1', 'clicked click 1']);
});
