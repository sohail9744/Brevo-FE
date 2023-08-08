/*!
 * ${copyright}
 */
sap.ui.define([ "jquery.sap.global"], function(q) {
  "use strict";
  q.sap.require('sap.ovp.ui.UIActions');
  var R = function(s) {
    this.init(s);
  };
  R.prototype.init = function(s) {
    s.beforeDragCallback = this._beforeDragHandler.bind(this);
    s.dragStartCallback = this._dragStartHandler.bind(this);
    s.dragMoveCallback = this._dragMoveHandler.bind(this);
    s.dragEndCallback = this._dragEndHandler.bind(this);
    s.endCallback = this._endHandler.bind(this);
    this.layout = s.layout;
    this.afterReplaceElements = s.afterReplaceElements || function() {
    };
    this.settings = s;
    delete s.afterReplaceElements;
    this.destroy();
    this.uiActions = new sap.ovp.ui.UIActions(this.settings).enable();
    this.aCardsOrder = null;
    this.verticalMargin = null;
    this.horizontalMargin = null;
    this.columnCount = null;
    this.top = null;
    this.left = null;
    this.width = null;
    this.layoutOffset = null;
    this.jqLayout = null;
    this.jqLayoutInner = null;
    this.isRTLEnabled = null;
    this.lastCollidedEl = null;
    this.lastCollisionTop = null;
  };
  R.prototype.findCollision = function(c, d, e) {
    var f;
    for (var i = 0; i < e.length; i++) {
      var h = e[i];
      var j = !(h.posDnD.right < c || h.posDnD.left > c);
      var k = !(h.posDnD.bottom < d || h.posDnD.top > d);
      if (j && k) {
        f = h;
        break;
      }
    }
    return f;
  };
  R.prototype.isCollisionTop = function(c, d, i) {
    var h = ((i.posDnD.bottom - i.posDnD.top) / 2) + i.posDnD.top;
    var e = !(h < d || i.posDnD.top > d);
    return e;
  };
  R.prototype._dragMoveHandler = function(c) {
    var s = c.element;
    var d = c.moveX - this.layoutOffset.left;
    var e = c.moveY - this.jqLayout.get(0).getBoundingClientRect().top + this.jqLayout.scrollTop();
    var f = this.findCollision(d, e, this.aCardsOrder);
    if (!f) {
      return;
    }
    var h = this.isCollisionTop(d, e, f);
    if (f === s) {
      this.lastCollidedEl = f;
      return;
    }
    if (f === this.lastCollidedEl) {
      if (this.lastCollisionTop === h) {
        return;
      }
      if (this.lastCollisionTop) {
        this.lastCollisionTop = h;
        if (s.posDnD.top > f.posDnD.top) {
          return;
        }
      } else {
        this.lastCollisionTop = h;
        if (s.posDnD.top < f.posDnD.top) {
          return;
        }
      }
    }
    if (this.lastCollidedEl && (this.lastCollidedEl !== f && this.lastCollidedEl !== s)
        && (this.lastCollidedEl.posDnD.left === f.posDnD.left && this.lastCollidedEl.posDnD.left === s.posDnD.left)) {
      f = this.lastCollidedEl;
    }
    this.dragAndDropElement(s, f);
    this.lastCollidedEl = this.findCollision(d, e, this.aCardsOrder);
    if (this.lastCollidedEl) {
      this.lastCollisionTop = this.isCollisionTop(d, e, this.lastCollidedEl);
    }
  };
  R.prototype.dragAndDropElement = function(s, t) {
    if (s && t) {
      this.aCardsOrder = this.dragAndDropSwapElement(s, t, this.aCardsOrder);
      this.drawLayout(this.aCardsOrder);
    }
  };
  R.prototype.dragAndDropSwapElement = function(s, t, i) {
    var n = i.slice();
    var c = i.indexOf(s);
    var d = i.indexOf(t);
    n[d] = s;
    n[c] = t;
    return n;
  };
  R.prototype.dragAndDropSwapElementForKeyboardNavigation = function(s, t) {
    if (s && t) {
      var l = this.layout.getVisibleLayoutItems().map(function(d) {
        return d.$().parent()[0];
      });
      var c = 0;
      for (var i = 0; i < l.length; i++) {
        if (l[i] === s) {
          l[i] = t;
          c++;
          continue;
        }
        if (l[i] === t) {
          l[i] = s;
          c++;
          continue;
        }
      }
      if (c === 2) {
        this.afterReplaceElements(l);
      }
    }
  };
  R.prototype.initCardsSettingsForDragAndDrop = function() {
    this.jqLayout = this.layout.$();
    this.jqLayoutInner = this.jqLayout.children().first();
    var l = this.jqLayout.scrollTop();
    var c = this.jqLayoutInner.height();
    this.isRTLEnabled = sap.ui.getCore().getConfiguration().getRTL() ? 1 : -1;
    this.aCardsOrder = [];
    this.layoutOffset = this.jqLayout.offset();
    if (sap.ui.Device.system.tablet === true && sap.ui.Device.system.desktop === false) {
      this.jqLayout.css('height', this.jqLayoutInner.height());
    }
    var v = this.layout.getVisibleLayoutItems();
    if (!v) {
      return;
    }
    this.aCardsOrder = v.map(function(i) {
      var e = i.$().parent()[0];
      e.posDnD = {
        width : e.offsetWidth,
        height : e.offsetHeight
      };
      e.style.width = e.offsetWidth + "px";
      return e;
    });
    var j = this.jqLayoutInner.children().first();
    var d = (this.isRTLEnabled === 1) ? "margin-left" : "margin-right";
    this.verticalMargin = parseInt(j.css(d), 10);
    var f = this.aCardsOrder[0];
    this.horizontalMargin = parseInt(q(f).css("margin-bottom"), 10);
    this.columnCount = this.layout.getColumnCount();
    this.top = f.getBoundingClientRect().top - this.jqLayoutInner[0].getBoundingClientRect().top;
    this.left = f.getBoundingClientRect().left - this.jqLayoutInner[0].getBoundingClientRect().left;
    this.width = f.offsetWidth;
    q(this.aCardsOrder).css("position", "absolute");
    this.drawLayout(this.aCardsOrder);
    this.jqLayoutInner.height(c);
    this.jqLayout.scrollTop(l);
  };
  R.prototype.drawLayout = function(c) {
    var C = [];
    for (var i = 0; i < this.columnCount; i++) {
      C[i] = 0;
    }
    for (var n = 0; n < c.length; n++) {
      var d = n % this.columnCount;
      var e = C[d]++;
      var f = this.left - this.isRTLEnabled * (d * this.verticalMargin + d * this.width);
      var h = this.top;
      var k = c[n];
      for (var j = 0; j < e; j++) {
        h += this.horizontalMargin;
        var p = n - (j + 1) * this.columnCount;
        h += c[p].posDnD.height;
      }
      k.posDnD.top = h;
      k.posDnD.bottom = h + k.posDnD.height;
      k.posDnD.left = f;
      k.posDnD.right = f + k.posDnD.width;
      this.updateElementCSS(c[n]);
    }
  };
  R.prototype.updateElementCSS = function(e) {
    q(e).css({
      top : e.posDnD.top,
      left : e.posDnD.left
    });
  };
  R.prototype._dragStartHandler = function(e, c) {
    if (window.getSelection) {
      var s = window.getSelection();
      s.removeAllRanges();
    }
    this.initCardsSettingsForDragAndDrop();
  };
  R.prototype._beforeDragHandler = function(e, u) {
    if (sap.ui.Device.system.desktop) {
      q('body').addClass("sapOVPDisableUserSelect sapOVPDisableImageDrag");
    }
    if (sap.ui.Device.browser.mobile) {
      this.selectableElemets = q(u).find('.sapUiSelectable');
      this.selectableElemets.removeClass('sapUiSelectable');
    }
    q(this.settings.wrapper).addClass("dragAndDropMode");
  };
  R.prototype._dragEndHandler = function(e, u) {
    this.lastCollidedEl = null;
    if (this.aCardsOrder) {
      this.afterReplaceElements(this.aCardsOrder);
    }
    if (sap.ui.Device.system.desktop) {
      q('body').removeClass("sapOVPDisableUserSelect sapOVPDisableImageDrag");
    }
    q(this.settings.wrapper).removeClass("dragAndDropMode");
    if (this.jqLayoutInner) {
      this.jqLayoutInner.removeAttr("style");
    }
    if (this.aCardsOrder) {
      q(this.aCardsOrder).removeAttr("style");
    }
  };
  R.prototype._endHandler = function(e, u) {
    if (sap.ui.Device.browser.mobile && this.selectableElemets) {
      this.selectableElemets.addClass('sapUiSelectable');
    }
  };
  R.prototype.getSwapItemsFunction = function() {
    return this.dragAndDropSwapElementForKeyboardNavigation.bind(this);
  };
  R.prototype.destroy = function() {
    if (this.uiActions) {
      this.uiActions.disable();
      this.uiActions = null;
    }
  };
  var D = {
    buildReplaceItemsInstance : function(s) {
      var d = {
        containerSelector : ".sapUshellEasyScanLayoutInner",
        wrapper : ".sapUshellEasyScanLayout",
        draggableSelector : ".easyScanLayoutItemWrapper",
        placeHolderClass : "easyScanLayoutItemWrapper-placeHolder",
        cloneClass : "easyScanLayoutItemWrapperClone",
        moveTolerance : 10,
        switchModeDelay : 800,
        isTouch : !sap.ui.Device.system.desktop,
        debug : false
      };
      s = q.extend(d, s);
      return new R(s);
    }
  };
  var K = function(e, s) {
    this.init(e, s);
  };
  K.prototype.init = function(e, s) {
    this.easyScanLayout = e;
    this.swapItemsFunction = (typeof s === "function") ? s : function() {
    };
    this.keyCodes = q.sap.KeyCodes;
    this.jqElement = e.$();
    this.jqElement.on('keydown.keyboardNavigation', this.keydownHandler.bind(this));
    this.jqElement.find(".after").on("focus.keyboardNavigation", this.afterFocusHandler.bind(this));
    this.jqElement.find(".sapUshellEasyScanLayoutInner").on("focus.keyboardNavigation", this.layoutFocusHandler.bind(this));
    this.jqElement.on("focus.keyboardNavigation", ".easyScanLayoutItemWrapper", this.layoutItemFocusHandler.bind(this));
    this._ignoreSelfFocus = false;
    this.swapSourceElement = null;
  };
  K.prototype.destroy = function() {
    if (this.jqElement) {
      this.jqElement.off(".keyboardNavigation");
      this.jqElement.find(".after").off(".keyboardNavigation");
      this.jqElement.find(".sapUshellEasyScanLayoutInner").off(".keyboardNavigation");
    }
    delete this.jqElement;
    delete this.easyScanLayout;
  };
  K.prototype.getVisibleLayoutItems = function() {
    var c = this.easyScanLayout.getContent();
    var f = c.filter(function(i) {
      return i.getVisible();
    });
    return f;
  };
  K.prototype.afterFocusHandler = function() {
    if (this._ignoreSelfFocus) {
      this._ignoreSelfFocus = false;
      return;
    }
    var j = this.jqElement.find(".easyScanLayoutItemWrapper:sapTabbable").first();
    var l = j.find(":sapTabbable").last();
    if (!l.length) {
      l = j;
    }
    l.focus();
  };
  K.prototype.layoutFocusHandler = function() {
    if (this._ignoreSelfFocus) {
      this._ignoreSelfFocus = false;
      return;
    }
    this.jqElement.find(".easyScanLayoutItemWrapper:sapTabbable").first().focus();
  };
  K.prototype.layoutItemFocusHandler = function() {
    var j = q(document.activeElement);
    if (j) {
      var l = j.find("[aria-label]");
      var i, s = "";
      if (j.find('.valueStateText').length == 1) {
        var t = j.find('.valueStateText').find('.sapMObjectNumberText').text();
        var v = j.find('.valueStateText').find('.sapUiInvisibleText').text();
        j.find('.valueStateText').attr('aria-label', t + " " + v);
        j.find('.valueStateText').attr('aria-labelledby', "");
      }
      if (q(l).hasClass('kpiHeaderClass')) {
        var k = q(l).closest('div.kpiHeaderClass').text();
        q(l).closest('div.kpiHeaderClass').attr('aria-labels', k);
      }
      for (i = 0; i < l.length; i++) {
        if (l[i].getAttribute("role") == "heading") {
          s += l[i].id + " ";
        }
      }
      if (s.length) {
        j.attr("aria-labelledby", s);
      }
    }
  };
  K.prototype._getLayoutItemIndex = function(j) {
    if (!j.hasClass("easyScanLayoutItemWrapper")) {
      return false;
    }
    var c = j.children().attr("id");
    var i = false;
    this.getVisibleLayoutItems().forEach(function(d, e) {
      if (c == d.getId()) {
        i = e;
      }
    });
    return i;
  };
  K.prototype._changeItemsFocus = function(j) {
    var c = q('.easyScanLayoutItemWrapper');
    c.attr("tabindex", "-1");
    j.attr("tabindex", 0);
    setTimeout(function() {
      j.focus();
    }, 500);
  };
  K.prototype._swapItemsFocus = function(e, j, c) {
    e.preventDefault();
    j.attr("tabindex", "-1");
    setTimeout(function() {
      c.attr("tabindex", "0").focus();
    }, 0);
  };
  K.prototype.tabButtonHandler = function(e) {
    var j = q(document.activeElement);
    if (j.hasClass("easyScanLayoutItemWrapper")) {
      return;
    }
    var c = j.closest(".easyScanLayoutItemWrapper");
    if (!c.length) {
      return;
    }
    var d = c.find(":sapTabbable");
    d = d.filter(":not([id$=after])");
    if (d.eq(d.length - 1).is(j)) {
      e.stopPropagation();
      e.stopImmediatePropagation();
      var f = this.jqElement.scrollTop();
      this._ignoreSelfFocus = true;
      this.jqElement.find(".after").focus();
      this.jqElement.scrollTop(f);
    }
  };
  K.prototype.f7Handler = function(e) {
    var j = q(document.activeElement);
    if (j.hasClass("easyScanLayoutItemWrapper")) {
      j.find(":sapTabbable").first().focus();
    } else {
      j.closest(".easyScanLayoutItemWrapper").focus();
    }
    e.preventDefault();
  };
  K.prototype.shiftTabButtonHandler = function(e) {
    var j = q(document.activeElement);
    if (!j.hasClass("easyScanLayoutItemWrapper")) {
      return;
    }
    this._ignoreSelfFocus = true;
    this.jqElement.find(".sapUshellEasyScanLayoutInner").focus();
  };
  K.prototype.arrowUpDownHandler = function(e, i) {
    var n = i ? "prev" : "next";
    var j = q(document.activeElement);
    var c = q(j)[n](".easyScanLayoutItemWrapper");
    if (!c.is(j)) {
      this._swapItemsFocus(e, j, c);
    }
  };
  K.prototype.arrowRightLeftHandler = function(e, i) {
    var c = i ? 1 : -1;
    var j = q(document.activeElement);
    var d = this._getLayoutItemIndex(j);
    if (d === false) {
      return;
    }
    var I = this.getVisibleLayoutItems()[d + c];
    if (I) {
      this._swapItemsFocus(e, j, I.$().parent());
    }
  };
  K.prototype.homeHandler = function(e) {
    var j = q(document.activeElement);
    var f = this._getLayoutItemIndex(j);
    if (f === false) {
      return;
    }
    var c = this.easyScanLayout.getColumnCount();
    var i = f % c;
    var d;
    var l = this.getVisibleLayoutItems();
    if (i == 0) {
      d = l[0];
    } else {
      d = l[f - i];
    }
    this._swapItemsFocus(e, j, d.$().parent());
  };
  K.prototype.endHandler = function(e) {
    var j = q(document.activeElement);
    var f = this._getLayoutItemIndex(j);
    if (f === false) {
      return;
    }
    var c = this.easyScanLayout.getColumnCount();
    var i = f % c;
    var d;
    var l = this.getVisibleLayoutItems();
    if ((i == (c - 1)) || ((f + (c - i)) > l.length)) {
      d = l[(l.length - 1)];
    } else {
      d = l[f + (c - i - 1)];
    }
    this._swapItemsFocus(e, j, d.$().parent());
  };
  K.prototype.ctrlHomeHandler = function(e) {
    var j = q(document.activeElement);
    var f = this._getLayoutItemIndex(j);
    if (f === false) {
      return;
    }
    var c = this.easyScanLayout.getColumnCount();
    var i = f % c;
    var v = this.getVisibleLayoutItems();
    var d = v[i];
    var n = d.$().parent();
    if (n.is(j)) {
      n = v[0].$().parent();
    }
    this._swapItemsFocus(e, j, n);
  };
  K.prototype.ctrlEndHandler = function(e) {
    var j = q(document.activeElement);
    var f = this._getLayoutItemIndex(j);
    if (f < 0) {
      return;
    }
    var c = this.easyScanLayout.getColumnCount();
    var d = f % c;
    var h;
    var v = this.getVisibleLayoutItems();
    for (var i = v.length - 1; i >= 0; i--) {
      if ((i % c) == d) {
        h = v[i];
        break;
      }
    }
    var n = h.$().parent();
    if (n.is(j)) {
      n = v[v.length - 1].$().parent();
    }
    this._swapItemsFocus(e, j, n);
  };
  K.prototype.altPageUpHandler = function(e) {
    var j = q(document.activeElement);
    var f = this._getLayoutItemIndex(j);
    if (!f) {
      return;
    }
    var c = this.easyScanLayout.getColumnCount();
    var i = f % c;
    var d = this.getVisibleLayoutItems()[f - i];
    this._swapItemsFocus(e, j, d.$().parent());
  };
  K.prototype.altPageDownHandler = function(e) {
    var j = q(document.activeElement);
    var f = this._getLayoutItemIndex(j);
    if (f < 0) {
      return;
    }
    var c = this.easyScanLayout.getColumnCount();
    var i = f % c;
    var d;
    var l = this.getVisibleLayoutItems();
    if (i != (c - 1)) {
      d = l[f + (c - i - 1)];
      if (!d) {
        d = l[l.length - 1];
      }
      this._swapItemsFocus(e, j, d.$().parent());
    }
  };
  K.prototype.pageUpDownHandler = function(e, i) {
    var n = i ? "prev" : "next";
    var j = q(document.activeElement);
    if (!j.hasClass("easyScanLayoutItemWrapper")) {
      return;
    }
    if (!j[n]().length) {
      return;
    }
    var c = false;
    var d = j;
    var w = q(window).height();
    var l = this.jqElement.offset().top;
    while (!c) {
      var f = d[n]();
      if (!f.length) {
        c = d;
        break;
      }
      if (!i && f.offset().top > w) {
        c = f;
        break;
      }
      if (i && (f.offset().top + f.outerHeight()) <= l) {
        c = f;
        break;
      }
      d = f;
    }
    this._swapItemsFocus(e, j, c);
  };
  K.prototype.ctrlArrowHandler = function(e) {
    if (this.swapSourceElement == null) {
      this.swapSourceElement = q(document.activeElement);
      if (!this.swapSourceElement.hasClass("easyScanLayoutItemWrapper")) {
        this.endSwap();
      } else {
        this.jqElement.on('keyup.keyboardNavigation', this.keyupHandler.bind(this));
        this.jqElement.addClass('dragAndDropMode');
        this.swapSourceElement.addClass('dragHovered');
      }
    }
  };
  K.prototype.keyupHandler = function(e) {
    if (this.swapSourceElement != null && e.keyCode === this.keyCodes.CONTROL) {
      var j = q(document.activeElement);
      if (j.hasClass("easyScanLayoutItemWrapper")) {
        this.swapItemsFunction(this.swapSourceElement[0], j[0]);
        this._changeItemsFocus(this.swapSourceElement);
      }
      this.endSwap();
    }
  };
  K.prototype.endSwap = function(e) {
    this.swapSourceElement.removeClass('dragHovered');
    this.jqElement.removeClass('dragAndDropMode');
    this.swapSourceElement = null;
    this.jqElement.off('keyup.keyboardNavigation');
  };
  K.prototype.checkIfSwapInterrupted = function(e) {
    if (this.swapSourceElement != null && e.keyCode != this.keyCodes.ARROW_LEFT && e.keyCode != this.keyCodes.ARROW_RIGHT && e.keyCode != this.keyCodes.ARROW_UP
        && e.keyCode != this.keyCodes.ARROW_DOWN) {
      this.endSwap();
    }
  };
  K.prototype.keydownHandler = function(e) {
    this.checkIfSwapInterrupted(e);
    switch (e.keyCode) {
    case this.keyCodes.TAB:
      (e.shiftKey) ? this.shiftTabButtonHandler(e) : this.tabButtonHandler(e);
      break;
    case this.keyCodes.F6:
      if (e.shiftKey) {
        this._ignoreSelfFocus = true;
        this.jqElement.find(".sapUshellEasyScanLayoutInner").focus();
        q.sap.handleF6GroupNavigation(e);
      } else {
        this._ignoreSelfFocus = true;
        var c = this.jqElement.scrollTop();
        this.jqElement.find(".after").focus();
        q.sap.handleF6GroupNavigation(e);
        this.jqElement.scrollTop(c);
      }
      break;
    case this.keyCodes.F7:
      this.f7Handler(e);
      break;
    case this.keyCodes.ARROW_UP:
      if (e.ctrlKey == true) {
        this.ctrlArrowHandler(e);
      }
      this.arrowUpDownHandler(e, true);
      break;
    case this.keyCodes.ARROW_DOWN:
      if (e.ctrlKey == true) {
        this.ctrlArrowHandler(e);
      }
      this.arrowUpDownHandler(e, false);
      break;
    case this.keyCodes.ARROW_RIGHT:
      if (e.ctrlKey == true) {
        this.ctrlArrowHandler(e);
      }
      this.arrowRightLeftHandler(e, true);
      break;
    case this.keyCodes.ARROW_LEFT:
      if (e.ctrlKey == true) {
        this.ctrlArrowHandler(e);
      }
      this.arrowRightLeftHandler(e, false);
      break;
    case this.keyCodes.HOME:
      (e.ctrlKey == true) ? this.ctrlHomeHandler(e) : this.homeHandler(e);
      break;
    case this.keyCodes.END:
      (e.ctrlKey == true) ? this.ctrlEndHandler(e) : this.endHandler(e);
      break;
    case this.keyCodes.PAGE_UP:
      (e.altKey == true) ? this.altPageUpHandler(e) : this.pageUpDownHandler(e, true);
      break;
    case this.keyCodes.PAGE_DOWN:
      (e.altKey == true) ? this.altPageDownHandler(e) : this.pageUpDownHandler(e, false);
      break;
    }
  };
  var E = sap.ui.core.Control.extend("sap.ovp.ui.EasyScanLayout", {
    metadata : {
      library : "sap.ovp",
      aggregations : {
        content : {
          type : "sap.ui.core.Control",
          multiple : true,
          singularName : "content"
        }
      },
      defaultAggregation : "content",
      events : {
        afterRendering : {},
        afterDragEnds : {}
      },
      properties : {
        useMediaQueries : {
          group : "Misc",
          type : "boolean",
          defaultValue : false
        },
        dragAndDropRootSelector : {
          group : "Misc",
          type : "string"
        },
        dragAndDropEnabled : {
          group : "Misc",
          type : "boolean",
          defaultValue : true
        },
        debounceTime : {
          group : "Misc",
          type : "int",
          defaultValue : 150
        }
      }
    },
    renderer : {
      render : function(r, c) {
        r.write("<div");
        r.writeControlData(c);
        r.addClass("sapUshellEasyScanLayout");
        r.writeClasses();
        r.write(">");
        r.write("<div class='sapUshellEasyScanLayoutInner' tabindex='0'>");
        var d = c.columnCount;
        var e = Array.apply(null, new Array(d)).map(function() {
          return [];
        });
        var f = c.getContent().filter(function(j) {
          return j.getVisible();
        });
        for (var i = 0; i < f.length; i++) {
          e[i % d].push(f[i]);
        }
        var h = 1;
        e.forEach(function(j) {
          r.write("<div");
          r.addClass("easyScanLayoutColumn");
          r.writeAccessibilityState(undefined, {
            role : "list"
          });
          r.writeClasses();
          r.write(">");
          j.forEach(function(k, l) {
            r.write("<div ");
            (h === 1) ? r.write("tabindex='0' ") : r.write("tabindex='-1' ");
            r.addClass("easyScanLayoutItemWrapper");
            r.write("aria-setsize=" + f.length + " aria-posinset=" + h);
            h++;
            r.writeClasses();
            r.write(">");
            r.renderControl(k);
            r.write("</div>");
          });
          r.write("</div>");
        });
        r.write("</div>");
        r.write("<div class='after' tabindex='0'></div>");
        r.write("</div>");
      }
    }
  });
  var g = function() {
    return [ {
      minWidth : 0,
      styleClass : "columns-blank",
      columnCount : 1
    }, {
      minWidth : 240,
      styleClass : "columns-block",
      columnCount : 1
    }, {
      minWidth : 352,
      styleClass : "columns-narrow",
      columnCount : 1
    }, {
      minWidth : 433,
      styleClass : "columns-wide",
      columnCount : 1
    }, {
      minWidth : 704,
      styleClass : "columns-narrow",
      columnCount : 2
    }, {
      minWidth : 864,
      styleClass : "columns-wide",
      columnCount : 2
    }, {
      minWidth : 1024,
      styleClass : "columns-narrow",
      columnCount : 3
    }, {
      minWidth : 1280,
      styleClass : "columns-wide",
      columnCount : 3
    }, {
      minWidth : 1440,
      styleClass : "columns-narrow",
      columnCount : 4
    }, {
      minWidth : 1800,
      styleClass : "columns-wide",
      columnCount : 4
    }, {
      minWidth : 2560,
      styleClass : "columns-narrow",
      columnCount : 5
    }, {
      minWidth : 3008,
      styleClass : "columns-wide",
      columnCount : 5
    }, {
      minWidth : 3600,
      styleClass : "columns-narrow",
      columnCount : 4
    }, {
      minWidth : 3840,
      styleClass : "columns-wide",
      columnCount : 4
    }, {
      minWidth : 5120,
      styleClass : "columns-wide",
      columnCount : 5
    }, {
      minWidth : 6016,
      styleClass : "columns-wide",
      columnCount : 5
    } ];
  };
  E.prototype.init = function() {
    this.data("sap-ui-fastnavgroup", "true", true);
    this.columnResolutionList = g();
    this.columnCount = this.columnResolutionList[0].columnCount;
    this.columnStyle = "";
    this.updateColumnClass(this.columnResolutionList[0].styleClass);
    var c = sap.ui.Device.browser.msie && sap.ui.Device.browser.version > 9;
    if (c && this.getUseMediaQueries()) {
      this.mediaQueryList = this.initMediaListeners(this.columnResolutionList);
    } else {
      this.resizeHandlerId = this.initResizeHandler(this.columnResolutionList);
    }
  };
  var m;
  var a = function(c, d, e) {
    var f = function(h, i) {
      this.updateColumnClass(i);
      this.refreshColumnCount(h, this.getContent());
    };
    if (e.matches) {
      window.clearTimeout(m);
      m = window.setTimeout(f.bind(this, c, d), this.getDebounceTime());
    }
  };
  var b = function(c, t) {
    var d = c.minWidth;
    var e = t && t.minWidth;
    return "(min-width: " + d + "px)" + (e ? " and (max-width: " + (e - 1) + "px)" : "");
  };
  E.prototype.initMediaListeners = function(c) {
    var d = [];
    for (var i = 0; i < c.length; i++) {
      var e = b(c[i], c[i + 1]);
      var f = window.matchMedia(e);
      var h = a.bind(this, c[i].columnCount, c[i].styleClass);
      f.addListener(h);
      f.bindedListener = h;
      h(f);
      d.push(f);
    }
    return d;
  };
  E.prototype.initResizeHandler = function(c) {
    var r;
    var d = this.getDebounceTime();
    var e = function() {
      window.clearTimeout(r);
      r = window.setTimeout(this.oControl.resizeHandler.bind(this, c), d);
    };
    return sap.ui.core.ResizeHandler.register(this, e);
  };
  E.prototype.resizeHandler = function(c) {
    var w = this.iWidth;
    var C = this.oControl;
    var r;
    if (q(".sapFDynamicPageContent").length > 0) {
      w = q(".sapFDynamicPageContent")[0].clientWidth;
    }
    for (var i = 0; i < c.length; i++) {
      if (!c[i + 1]) {
        r = c[i];
        break;
      }
      if (c[i].minWidth <= w && c[i + 1].minWidth > w) {
        r = c[i];
        break;
      }
    }
    C.refreshColumnCount(r.columnCount, C.getContent());
    C.updateColumnClass(r.styleClass);
  };
  E.prototype.refreshColumnCount = function(c, d) {
    this.columnCount = c;
    var e = q();
    for (var i = 0; i < c; i++) {
      e = e.add("<div class='easyScanLayoutColumn' role = 'list'/>");
    }
    var f = d.filter(function(h) {
      return h.getVisible();
    });
    for (var j = 0; j < f.length; j++) {
      try {
        e.get(j % c).appendChild(f[j].getDomRef().parentNode);
      } catch (f) {
      }
    }
    this.$().children(".sapUshellEasyScanLayoutInner").empty().append(e);
  };
  E.prototype.getColumnCount = function() {
    return this.columnCount;
  };
  E.prototype.getVisibleLayoutItems = function() {
    var c = this.getContent();
    var f = c.filter(function(i) {
      return i.getVisible();
    });
    return f;
  };
  E.prototype.updateColumnClass = function(c) {
    if (this.columnStyle === c) {
      return;
    }
    this.removeStyleClass(this.columnStyle);
    this.addStyleClass(c);
    this.columnStyle = c;
  };
  E.prototype.afterDragAndDropHandler = function(e) {
    var A = this.removeAllAggregation("content", true);
    var v = [];
    var V = 0;
    e.forEach(function(c) {
      var d = c.children[0].getAttribute("id");
      var C = sap.ui.getCore().byId(d);
      v.push(C);
    });
    for (var i = 0; i < A.length; i++) {
      if (A[i].getVisible()) {
        this.addAggregation("content", v[V], true);
        V++;
      } else {
        this.addAggregation("content", A[i], true);
      }
    }
    this.fireAfterDragEnds();
    this.refreshColumnCount(this.getColumnCount(), this.getContent());
  };
  E.prototype.onAfterRendering = function() {
    if (!this.getDragAndDropRootSelector()) {
      this.setDragAndDropRootSelector("#" + this.getId());
    }
    if (this.layoutDragAndDrop) {
      this.layoutDragAndDrop.destroy();
    }
    if (this.getDragAndDropEnabled()) {
      this.layoutDragAndDrop = D.buildReplaceItemsInstance({
        afterReplaceElements : this.afterDragAndDropHandler.bind(this),
        rootSelector : this.getDragAndDropRootSelector(),
        layout : this
      });
    }
    if (this.keyboardNavigation) {
      this.keyboardNavigation.destroy();
    }
    var s = this.layoutDragAndDrop ? this.layoutDragAndDrop.getSwapItemsFunction() : null;
    this.keyboardNavigation = new K(this, s);
    this.fireAfterRendering();
  };
  E.prototype.exit = function() {
    if (this.mediaQueryList) {
      this.mediaQueryList.forEach(function(c) {
        c.removeListener(c.bindedListener);
      });
      delete this.mediaQueryList;
    }
    if (this.resizeHandlerId) {
      sap.ui.core.ResizeHandler.deregister(this.resizeHandlerId);
    }
    if (this.layoutDragAndDrop) {
      this.layoutDragAndDrop.destroy();
      delete this.layoutDragAndDrop;
    }
  };
  return E;
}, true);