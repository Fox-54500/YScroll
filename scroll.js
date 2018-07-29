var YScroll = (function () {
    function YScroll(option) {
        this.startY = 0;
        this.endY = 0;
        this.offsetY = 0;
        this.scrollTop = 0;
        this.contentHeight = 0;
        this.maxScroll = 0;
        this.uploadOp = false;
        this.downloadOp = false;
        this.option = $.extend(true, {}, {
            scrollView: $('.container'),                                    // 滑动可视窗口
            scrollArea: $('.content'),                                       // 滑动区域
            upload: {                                                            // 上方DOM
                class: 'up-load',
                refresh: '↓下拉刷新',
                update: '↑释放更新',
                load: '<span class="loading"></span>加载中...'
            },
            download: {                                                          // 下方DOM
                class: 'down-load',
                refresh: '↑上拉加载更多',
                update: '↓释放更新',
                load: '<span class="loading"></span>加载中...',
                noData: '暂无数据'
            },
            autoLoad: true,                                                     // 自动加载
            distance: 50,                                                       // 拉动距离
            loadUpFn: () => {
            },                                              // 上方function
            loadDownFn: () => {
            }                                             // 下方function
        }, option);

        this.init();
    }

    YScroll.prototype.init = function () {
        let me = this;
        const option = me.option;
        this.clientHeight = this.option.scrollView.height();
        me.option.scrollArea.prepend($(`<div class="${option.upload.class}">${option.upload.refresh}</div>`));
        me.option.scrollArea.append($(`<div class="${option.download.class}">${option.download.refresh}</div>`));

        me.option.scrollArea.on('touchstart', function (e) {
            moving(me);
            touchstart(me, e)
        });
        me.option.scrollArea.on('touchmove', function (e) {
            touchmove(me, e)
        });
        me.option.scrollArea.on('touchend', function (e) {
            moveEnd(me);
            touchend(me, e)
        })
        me.resetHeight(me);
    };

    YScroll.prototype.scrollBack = function (me) {
        $(`.${me.option.upload.class}`).css('height', 0);
        $(`.${me.option.download.class}`).css('height', 0);
        me.offsetY = 0;
        me.startY = 0;
        me.endY = 0;
        if (me.downloadOp) {
            me.option.scrollArea.css('transform', `translateY(${-me.maxScroll}px)`);
        }
    };

    YScroll.prototype.resetHeight = function (me) {
        me.contentHeight = me.option.scrollArea.height() - $(`.${me.option.upload.class}`).height()
            - $(`.${me.option.download.class}`).height();
        me.uploadOp = false;
        me.downloadOp = false;
    };

    function touchstart(me, e) {
        var touch = e.targetTouches[0];
        me.startY = touch.pageY;
        me.endY = touch.pageY;
        me.maxScroll = me.contentHeight - me.clientHeight;
        me.uploadOp = $('.up-load').height() >= me.option.distance;
        me.downloadOp = $('.down-load').height() >= me.option.distance;
    }

    function touchmove(me, e) {
        const option = me.option;
        let touch = e.targetTouches[0];
        const upload = $(`.${option.upload.class}`);
        const download = $(`.${option.download.class}`);
        me.endY = touch.pageY;

        // 计算上滑/ 下滑的距离
        me.offsetY = me.endY - me.startY;

        // 上方边缘
        if (me.scrollTop + me.offsetY >= 0 && !me.uploadOp) {
            me.offsetY = -me.scrollTop;
            upload.css('height', (me.scrollTop + me.endY - me.startY) / 2);
            if (me.endY - me.startY >= 3 * option.distance) {
                upload.html(option.upload.update)
            } else {
                upload.html(option.upload.refresh)
            }
        }
        // 下方边缘
        if (me.scrollTop + me.offsetY <= -me.maxScroll && !me.downloadOp) {
            //  高度为滚动超出的高度
            download.css('height', -(me.scrollTop + me.offsetY + me.maxScroll) / 2);
            if (me.startY - me.endY >= 3 * option.distance) {
                download.html(option.download.update)
            } else {
                download.html(option.download.refresh)
            }
            // 跟随加载的高度 滚动至底部
            option.scrollArea.css('transform', `translateY(${-me.maxScroll + ((me.scrollTop + me.offsetY + me.maxScroll) / 2)}px)`);
            return;
        }

        // 当没有加载的时候, content 随着触摸滚动
        if (!me.uploadOp && !me.downloadOp) {
            option.scrollArea.css('transform', `translateY(${me.scrollTop + me.offsetY}px)`);
        }

    }

    function touchend(me, e) {
        const option = me.option;
        me.scrollTop = me.offsetY + me.scrollTop;

        if (me.scrollTop >= 0) {
            if (me.endY - me.startY >= 3 * option.distance) {
                me.uploadOp = true;
                $(`.${option.upload.class}`).html(option.upload.load)
                me.option.loadUpFn(me);
                $(`.${option.upload.class}`).css('height', option.distance);
            } else {
                me.scrollBack(me)
            }
            me.scrollTop = 0;
            option.scrollArea.css('transform', `translateY(${me.scrollTop}px)`);
            return;
        }

        if (me.scrollTop <= -me.maxScroll) {
            if (me.startY - me.endY >= 3 * option.distance) {
                me.downloadOp = true;
                $(`.${option.download.class}`).html(option.download.load);
                option.loadDownFn(me);
                $(`.${option.download.class}`).css('height', option.distance);
                option.scrollArea.css('transform', `translateY(${-me.maxScroll - option.distance}px)`);
            } else {
                option.scrollArea.css('transform', `translateY(${-me.maxScroll}px)`);
            }
            me.scrollTop = -me.maxScroll;
            return;
        }
        me.scrollBack(me);
    }

    function moving(me) {
        $(`.${me.option.upload.class}`).css('transition', 'all 0s');
        $(`.${me.option.download.class}`).css('transition', 'all 0s');
        me.option.scrollArea.css('transition', 'all 0s');
    }

    function moveEnd(me) {
        $('.up-load').css('transition', 'all 0.5s');
        $('.down-load').css('transition', 'all 0.5s');
        me.option.scrollArea.css('transition', 'all 0.5s');
    }

    return YScroll;
})();
