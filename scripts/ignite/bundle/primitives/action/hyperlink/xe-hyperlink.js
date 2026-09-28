// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e5, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e5;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e5 = void 0 !== s4 && 1 === s4.length;
      e5 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e5 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e5) => {
  const o6 = 1 === t4.length ? t4[0] : e5.reduce((e6, s4, o7) => e6 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o7 + 1], t4[0]);
  return new n(o6, t4, s);
};
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e5 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e5.cssText, s4.appendChild(o7);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e5 = "";
  for (const s4 of t5.cssRules) e5 += s4.cssText;
  return r(e5);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i5 = t4;
  switch (s4) {
    case Boolean:
      i5 = null !== t4;
      break;
    case Number:
      i5 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t4);
      } catch (t5) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ??= []).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t4, i5, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i5) {
    const { get: e5, set: r5 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e5, set(s5) {
      const h3 = e5?.call(this);
      r5?.call(this, s5), this.requestUpdate(t4, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i5 of s4) this.createProperty(i5, t5[i5]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i5] of s4) this.elementProperties.set(t5, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i5 = this._$Eu(t5, s4);
      void 0 !== i5 && this._$Eh.set(i5, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e5 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e5) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t4, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t4.set(i5, this[i5]), delete this[i5]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i5) {
    this._$AK(t4, i5);
  }
  _$ET(t4, s4) {
    const i5 = this.constructor.elementProperties.get(t4), e5 = this.constructor._$Eu(t4, i5);
    if (void 0 !== e5 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e5) : this.setAttribute(e5, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i5 = this.constructor, e5 = i5._$Eh.get(t4);
    if (void 0 !== e5 && this._$Em !== e5) {
      const t5 = i5.getPropertyOptions(e5), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e5;
      const r5 = h3.fromAttribute(s4, t5.type);
      this[e5] = r5 ?? this._$Ej?.get(e5) ?? r5, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i5, e5 = false, h3) {
    if (void 0 !== t4) {
      const r5 = this.constructor;
      if (false === e5 && (h3 = this[t4]), i5 ??= r5.getPropertyOptions(t4), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r5._$Eu(t4, i5)))) return;
      this.C(t4, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i5, reflect: e5, wrapped: h3 }, r5) {
    i5 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t4) && (this._$Ej.set(t4, r5 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r5) || (this._$AL.has(t4) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t4, s4)), true === e5 && this._$Em !== t4 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i5] of t5) {
        const { wrapped: t6 } = i5, e5 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e5 || this.C(s5, void 0, i5, e5);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq &&= this._$Eq.forEach((t5) => this._$ET(t5, this[t5])), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i5, ...s4) => ({ _$litType$: t4, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i5) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t4, i5) => {
  const s4 = t4.length - 1, e5 = [];
  let n5, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t4[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t4[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e5.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e5];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i5 }, e5) {
    let r5;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i5);
    if (this.el = _S.createElement(f3, e5), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r5 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r5.nodeType) {
        if (r5.hasAttributes()) for (const t5 of r5.getAttributeNames()) if (t5.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r5.getAttribute(t5).split(o3), e6 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e6[2], strings: s4, ctor: "." === e6[1] ? I : "?" === e6[1] ? L : "@" === e6[1] ? z : H }), r5.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r5.removeAttribute(t5));
        if (y2.test(r5.tagName)) {
          const t5 = r5.textContent.split(o3), i6 = t5.length - 1;
          if (i6 > 0) {
            r5.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r5.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r5.append(t5[i6], c3());
          }
        }
      } else if (8 === r5.nodeType) if (r5.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r5.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i5, s4 = t4, e5) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e5 ? s4._$Co?.[e5] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t4), h3._$AT(t4, s4, e5)), void 0 !== e5 ? (s4._$Co ??= [])[e5] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e5)), i5;
}
var R = class {
  constructor(t4, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e5 = (t4?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e5;
    let h3 = P.nextNode(), o6 = 0, n5 = 0, r5 = s4[0];
    for (; void 0 !== r5; ) {
      if (o6 === r5.index) {
        let i6;
        2 === r5.type ? i6 = new k(h3, h3.nextSibling, this, t4) : 1 === r5.type ? i6 = new r5.ctor(h3, r5.name, r5.strings, this, t4) : 6 === r5.type && (i6 = new Z(h3, this, t4)), this._$AV.push(i6), r5 = s4[++n5];
      }
      o6 !== r5?.index && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e5;
  }
  p(t4) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t4[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i5, s4, e5) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i5, this._$AM = s4, this.options = e5, this._$Cv = e5?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t4?.nodeType && (t4 = i5.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i5 = this) {
    t4 = M(this, t4, i5), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i5, _$litType$: s4 } = t4, e5 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e5) this._$AH.p(i5);
    else {
      const t5 = new R(e5, this), s5 = t5.u(this.options);
      t5.p(i5), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i5 = C.get(t4.strings);
    return void 0 === i5 && C.set(t4.strings, i5 = new S2(t4)), i5;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e5 = 0;
    for (const h3 of t4) e5 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e5], s4._$AI(h3), e5++;
    e5 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e5), i5.length = e5);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i5, s4, e5, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i5, this._$AM = e5, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i5 = this, s4, e5) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t4 = M(this, t4, i5, 0), o6 = !a2(t4) || t4 !== this._$AH && t4 !== E, o6 && (this._$AH = t4);
    else {
      const e6 = t4;
      let n5, r5;
      for (t4 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r5 = M(this, e6[s4 + n5], i5, n5), r5 === E && (r5 = this._$AH[n5]), o6 ||= !a2(r5) || r5 !== this._$AH[n5], r5 === A ? t4 = A : t4 !== A && (t4 += (r5 ?? "") + h3[n5 + 1]), this._$AH[n5] = r5;
    }
    o6 && !e5 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i5, s4, e5, h3) {
    super(t4, i5, s4, e5, h3), this.type = 5;
  }
  _$AI(t4, i5 = this) {
    if ((t4 = M(this, t4, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e5 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e5);
    e5 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i5, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t4, i5, s4) => {
  const e5 = s4?.renderBefore ?? i5;
  let h3 = e5._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e5._$litPart$ = h3 = new k(i5.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t4 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t4.firstChild, t4;
  }
  update(t4) {
    const r5 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r5, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ??= []).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t3 = (t4) => (e5, o6) => {
  void 0 !== o6 ? o6.addInitializer(() => {
    customElements.define(t4, e5);
  }) : customElements.define(t4, e5);
};

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t4 = o5, e5, r5) => {
  const { kind: n5, metadata: i5 } = r5;
  let s4 = globalThis.litPropertyMetadata.get(i5);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i5, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t4 = Object.create(t4)).wrapped = true), s4.set(r5.name, t4), "accessor" === n5) {
    const { name: o6 } = r5;
    return { set(r6) {
      const n6 = e5.get.call(this);
      e5.set.call(this, r6), this.requestUpdate(o6, n6, t4, true, r6);
    }, init(e6) {
      return void 0 !== e6 && this.C(o6, void 0, t4, e6), e6;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r5;
    return function(r6) {
      const n6 = this[o6];
      e5.call(this, r6), this.requestUpdate(o6, n6, t4, true, r6);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t4) {
  return (e5, o6) => "object" == typeof o6 ? r4(t4, e5, o6) : ((t5, e6, o7) => {
    const r5 = e6.hasOwnProperty(o7);
    return e6.constructor.createProperty(o7, t5), r5 ? Object.getOwnPropertyDescriptor(e6, o7) : void 0;
  })(t4, e5, o6);
}

// node_modules/@ignite/web/dist/tokens/component/xe-accordion/index.js
var xe_accordion_default = i`/**
 * Accordion Component CSS
 * Styles for accordion component using XE design tokens
 * For use in shadow DOM of xe-accordion component
 */

:host {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

.accordion {
}

.heading {
  margin: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: var(--xe-spacing-content-inset-cozy) var(--xe-spacing-content-inset-comfortable);
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  color: inherit;
  font: inherit;
  user-select: none;
  position: relative;
  box-sizing: border-box;
}

.heading-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.heading-text,
::slotted([slot="heading"]) {
  font-family: var(--xe-typography-title-md-family);
  font-size: var(--xe-typography-title-md-size);
  font-weight: var(--xe-typography-title-md-weight);
  line-height: var(--xe-typography-title-md-line-height);
  text-transform: var(--xe-typography-title-md-text-transform);
  color: var(--xe-color-content-on-surface-on-surface);
}

.leading-icon {
  color: var(--xe-color-content-on-surface-on-surface);
  flex-shrink: 0;
}

.header::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: transparent;
  pointer-events: none;
  transition: background-color var(--xe-motion-duration-standard) var(--xe-motion-easing-standard);
}

.header:hover::before {
  background-color: var(--xe-color-interactive-overlay-hover);
}

.header:active::before {
  background-color: var(--xe-color-interactive-overlay-pressed);
}

.header:focus {
  outline: none;
}

.header:focus-visible {
  outline: 2px solid var(--xe-color-content-on-surface-on-surface);
  outline-offset: -2px;
}

.header:disabled {
  cursor: not-allowed;
}

.header:disabled .heading-text {
  color: var(--xe-color-content-disabled);
}

.header:disabled .leading-icon {
  color: var(--xe-color-content-disabled);
}

.expand-icon {
  font-size: 20px;
  color: var(--xe-color-content-on-surface-on-surface);
  transition: transform var(--xe-motion-duration-standard) var(--xe-motion-easing-standard);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
}

.header:disabled .expand-icon {
  color: var(--xe-color-content-disabled);
}

.header[aria-expanded="true"] .expand-icon {
  transform: rotate(180deg);
}

.content {
  padding: var(--xe-spacing-content-inset-cozy) var(--xe-spacing-content-inset-comfortable);
  display: flex;
  flex-direction: column;
  gap: var(--xe-spacing-stack-gap-lg);
  border-top: var(--xe-border-width-width-sm) solid var(--xe-color-surface-outline-neutral);
  font-family: var(--xe-typography-body-sm-family);
  font-size: var(--xe-typography-body-sm-size);
  font-weight: var(--xe-typography-body-sm-weight);
  line-height: var(--xe-typography-body-sm-line-height);
  color: var(--xe-color-content-on-surface-variant);
}

.content[hidden] {
  display: none;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-banner/index.js
var xe_banner_default = i`/**
 * Banner Component CSS - Using Component Tokens
 * Maps to role typography families and theme-aware colors
 */

:host {
  display: block;
  --banner-padding-horizontal: clamp(16px, calc(16px + 176 * ((100vw - 320px) / 1120)), 192px);
}

/* ============================================
   CSS CUSTOM PROPERTIES FROM TOKENS
   ============================================ */

.banner {
  /* Base layout */
  --banner-column-gap: var(--xe-spacing-layout-gap-lg);
  --banner-min-height: 64px;

  /* Heading typography */
  --banner-heading-font-family: var(--xe-typography-headline-lg-family);
  --banner-heading-font-size: var(--xe-typography-headline-lg-size);
  --banner-heading-font-weight: var(--xe-typography-headline-lg-weight);
  --banner-heading-line-height: var(--xe-typography-headline-lg-line-height);
  --banner-heading-letter-spacing: var(--xe-typography-headline-lg-letter-spacing);
  --banner-heading-text-transform: var(--xe-typography-headline-lg-text-transform);
  --banner-heading-color: var(--xe-color-content-on-surface-on-surface);

  /* Message typography */
  --banner-message-font-family: var(--xe-typography-body-md-family);
  --banner-message-font-size: var(--xe-typography-body-md-size);
  --banner-message-font-weight: var(--xe-typography-body-md-weight);
  --banner-message-line-height: var(--xe-typography-body-md-line-height);
  --banner-message-letter-spacing: var(--xe-typography-body-md-letter-spacing);
  --banner-message-color: var(--xe-color-content-on-surface-on-surface);

  /* Base styles */
  position: relative;
  padding-left: var(--banner-padding-horizontal);
  padding-right: var(--banner-padding-horizontal);
  display: flex;
  gap: var(--banner-column-gap);
  min-height: var(--banner-min-height);
  background-color: var(--xe-color-surface-base); /* overridden by [background] variants below */
  color: var(--xe-color-content-on-surface-on-surface);
}

/* Background variants */
:host([background="subtle"]) .banner {
  background-color: var(--xe-color-surface-container-base);
}

:host([background="muted"]) .banner {
  background-color: var(--xe-color-surface-container-lowest);
}

/* Size variants - control vertical padding */
.banner.compact {
  padding-top: var(--xe-spacing-content-inset-compact);
  padding-bottom: var(--xe-spacing-content-inset-compact);
}

.banner.comfortable {
  padding-top: var(--xe-spacing-content-inset-comfortable);
  padding-bottom: var(--xe-spacing-content-inset-comfortable);
}

.banner.spacious {
  padding-top: var(--xe-spacing-content-inset-spacious);
  padding-bottom: var(--xe-spacing-content-inset-spacious);
}

.banner.generous {
  padding-top: var(--xe-spacing-content-inset-generous);
  padding-bottom: var(--xe-spacing-content-inset-generous);
}

/* ============================================
   COLUMN LAYOUT
   ============================================ */

.banner {
  flex-direction: row;
  align-items: stretch;
  gap: var(--banner-column-gap);
}

.banner ::slotted(.heading) {
  color: var(--banner-heading-color);
}

.banner ::slotted(.message) {
  color: var(--banner-message-color);
}

/* Expose CSS custom properties for xe-banner-column to consume */
::slotted(xe-banner-column) {
  --xe-banner-column-gap: var(--banner-column-gap);
  --xe-banner-heading-font-family: var(--banner-heading-font-family);
  --xe-banner-heading-font-size: var(--banner-heading-font-size);
  --xe-banner-heading-font-weight: var(--banner-heading-font-weight);
  --xe-banner-heading-line-height: var(--banner-heading-line-height);
  --xe-banner-heading-letter-spacing: var(--banner-heading-letter-spacing);
  --xe-banner-heading-text-transform: var(--banner-heading-text-transform);
  --xe-banner-heading-color: var(--banner-heading-color);
  --xe-banner-message-font-family: var(--banner-message-font-family);
  --xe-banner-message-font-size: var(--banner-message-font-size);
  --xe-banner-message-font-weight: var(--banner-message-font-weight);
  --xe-banner-message-line-height: var(--banner-message-line-height);
  --xe-banner-message-letter-spacing: var(--banner-message-letter-spacing);
  --xe-banner-message-color: var(--banner-message-color);
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (max-width: 768px) {
  .banner {
    flex-direction: column;
  }
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-banner-column/index.js
var xe_banner_column_default = i`/**
 * Banner Column Component CSS
 * For use in the shadow DOM of xe-banner-column.
 */

:host {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  justify-content: center;
}

:host([expand]) {
  flex: 1;
}

.column {
  display: flex;
  flex-direction: column;
}

.column.align-left {
  align-items: flex-start;
  text-align: left;
}

.column.align-center {
  align-items: center;
  text-align: center;
}

.column.align-right {
  align-items: flex-end;
  text-align: right;
}

.heading-wrapper {
  margin: 0;
}

.heading-wrapper.has-above {
  margin-top: var(--xe-spacing-stack-gap-3xl);
}

.message-wrapper.has-above {
  margin-top: var(--xe-spacing-stack-gap-xl);
}

.action-wrapper.has-above {
  margin-top: var(--xe-spacing-stack-gap-xl);
}

@media (max-width: 768px) {
  .column,
  .column.align-left,
  .column.align-center,
  .column.align-right {
    align-items: flex-start;
    text-align: left;
  }
}

::slotted([slot="heading"]) {
  font-family: var(--xe-banner-heading-font-family);
  font-size: var(--xe-banner-heading-font-size);
  font-weight: var(--xe-banner-heading-font-weight);
  line-height: var(--xe-banner-heading-line-height);
  letter-spacing: var(--xe-banner-heading-letter-spacing);
  text-transform: var(--xe-banner-heading-text-transform);
  color: var(--xe-banner-heading-color);
  margin: 0;
  transform: translateY(0.125em);
}

::slotted([slot="message"]) {
  font-family: var(--xe-banner-message-font-family);
  font-size: var(--xe-banner-message-font-size);
  font-weight: var(--xe-banner-message-font-weight);
  line-height: var(--xe-banner-message-line-height);
  letter-spacing: var(--xe-banner-message-letter-spacing);
  color: var(--xe-banner-message-color);
  margin: 0;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-bento/index.js
var xe_bento_default = i`:host {
  display: block;
  width: 100%;
}

.grid {
  display: grid;
  gap: var(--xe-bento-gap, var(--bento-gap-size, var(--xe-spacing-stack-gap-3xl)));
  grid-template-columns: repeat(auto-fit, minmax(min(450px, 100%), 1fr));
  align-items: stretch;
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--xe-spacing-content-inset-expansive) clamp(var(--xe-spacing-content-inset-spacious), 10vw, var(--xe-spacing-content-inset-generous));
}

/* Above this breakpoint: lock to explicit column count and activate item spans */
@media (min-width: 960px) {
  .grid {
    grid-template-columns: repeat(var(--columns, 3), 1fr);
  }
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-bento-item/index.js
var xe_bento_item_default = i`:host {
  display: block;
  min-width: 0;
  box-sizing: border-box;
  min-height: var(--xe-bento-item-min-height, 400px);
}

/* Spans only activate where the grid has fixed columns */
@media (min-width: 960px) {
  :host {
    grid-column: span var(--col-span, 1);
    grid-row: span var(--row-span, 1);
  }
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-bottom-sheet/index.js
var xe_bottom_sheet_default = i`:host {
  display: contents;
}

/* Scrim overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: var(--xe-color-scrim-default);
  z-index: 1100;
  animation: fadeIn 200ms ease forwards;
}

.overlay.closing {
  animation: fadeOut 200ms ease forwards;
}

/* Sheet panel */
.sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--xe-color-surface-base);
  border-radius: var(--xe-radius-medium) var(--xe-radius-medium) 0 0;
  box-shadow: var(--xe-effect-elevation-level-4);
  z-index: 1101;
  display: flex;
  flex-direction: column;
  gap: var(--xe-spacing-stack-gap-2xl);
  padding: var(--xe-spacing-content-inset-comfortable) var(--xe-spacing-content-inset-comfortable);
  max-height: fit-content;
  overflow: clip;

  @media (max-width: 768px) {
    max-height: 75vh;
  }
  animation: slideInUp 300ms ease forwards;
}

/* Content slot — scrolls independently so header and actions stay pinned */
.content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.sheet.closing {
  animation: slideOutDown 300ms ease forwards;
}

/* Header */
.header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: var(--xe-spacing-stack-gap-2xl);
  flex-shrink: 0;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.close-button {
  flex-shrink: 0;
  margin-top: -4px;
  margin-right: -8px;
}

.title {
  font-family: var(--xe-typography-title-lg-family);
  font-size: var(--xe-typography-title-lg-size);
  font-weight: var(--xe-typography-title-lg-weight);
  line-height: var(--xe-typography-title-lg-line-height);
  letter-spacing: 0.1px;
  color: var(--xe-color-content-on-surface-on-surface);
  margin: 0;
}

.subtitle {
  font-family: var(--xe-typography-body-sm-family);
  font-size: var(--xe-typography-body-sm-size);
  font-weight: var(--xe-typography-body-sm-weight);
  line-height: var(--xe-typography-body-sm-line-height);
  color: var(--xe-color-content-on-surface-on-surface-variant);
  margin: 0;
}


/* Actions slot — inside .content so it scrolls with the body */
.actions {
  display: flex;
  align-items: center;
  justify-content: center;
}

.actions:not([hidden]) {
  padding-top: var(--xe-spacing-content-inset-comfortable);
  padding-bottom: var(--xe-spacing-content-inset-comfortable);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}

@keyframes slideInUp {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

@keyframes slideOutDown {
  from { transform: translateY(0); }
  to   { transform: translateY(100%); }
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-button/index.js
var xe_button_default = i`/**
 * Button Component CSS - Simplified with CSS Custom Properties
 * Uses CSS variables for scalable variant system
 * Material Design state layer pattern for interaction feedback
 */

:host {
  display: inline-block;
  vertical-align: middle;
}

/* ============================================
   CSS CUSTOM PROPERTIES FROM TOKENS
   Define once, reference everywhere
   ============================================ */

.button {
  /* Base properties */
  --button-gap: var(--xe-spacing-inline-gap-sm);
  --button-min-width: var(--xe-spacing-content-inset-spacious);
  --button-radius: var(--xe-radius-soft);

  /* Icon sizing */
  --button-icon-size: 24px;

  /* State layers */
  --state-hover: var(--xe-states-hover);
  --state-pressed: var(--xe-states-pressed);

  /* Filled variant colors */
  --filled-bg-primary: var(--xe-color-brand-primary);
  --filled-fg-primary: var(--xe-color-content-on-primary-on-primary);
  --filled-bg-secondary: var(--xe-color-brand-secondary);
  --filled-fg-secondary: var(--xe-color-content-on-secondary-on-secondary);
  --filled-bg-tertiary: var(--xe-color-brand-tertiary);
  --filled-fg-tertiary: var(--xe-color-content-on-tertiary-on-tertiary);
  --filled-bg-neutral: var(--xe-color-brand-neutral);
  --filled-fg-neutral: var(--xe-color-content-on-neutral-on-neutral);
  --filled-bg-accent: var(--xe-color-brand-accent);
  --filled-fg-accent: var(--xe-color-content-on-accent-on-accent);
  --filled-bg-disabled: var(--xe-color-surface-disabled);
  --filled-fg-disabled: var(--xe-color-content-disabled);

  /* Outlined variant colors */
  --outlined-bg-primary: #00000000;
  --outlined-fg-primary: var(--xe-color-content-on-surface-on-surface-primary);
  --outlined-border-primary: var(--xe-color-border-primary);
  --outlined-bg-secondary: #00000000;
  --outlined-fg-secondary: var(--xe-color-content-on-surface-on-surface-secondary);
  --outlined-border-secondary: var(--xe-color-border-secondary);
  --outlined-bg-tertiary: #00000000;
  --outlined-fg-tertiary: var(--xe-color-content-on-surface-on-surface-tertiary);
  --outlined-border-tertiary: var(--xe-color-border-tertiary);
  --outlined-bg-neutral: #00000000;
  --outlined-fg-neutral: var(--xe-color-content-on-surface-on-surface-neutral);
  --outlined-border-neutral: var(--xe-color-border-black);
  --outlined-bg-accent: #00000000;
  --outlined-fg-accent: var(--xe-color-content-on-surface-on-surface-accent);
  --outlined-border-accent: var(--xe-color-brand-accent);
  --outlined-fg-disabled: var(--xe-color-content-disabled);
  --outlined-border-disabled: var(--xe-color-content-disabled);

  /* Text variant colors */
  --text-bg-primary: #00000000;
  --text-fg-primary: var(--xe-color-content-on-surface-on-surface-primary);
  --text-bg-secondary: #00000000;
  --text-fg-secondary: var(--xe-color-content-on-surface-on-surface-secondary);
  --text-bg-tertiary: #00000000;
  --text-fg-tertiary: var(--xe-color-content-on-surface-on-surface-tertiary);
  --text-bg-neutral: #00000000;
  --text-fg-neutral: var(--xe-color-content-on-surface-on-surface-neutral);
  --text-bg-accent: #00000000;
  --text-fg-accent: var(--xe-color-content-on-surface-on-surface-accent);
  --text-fg-disabled: var(--xe-color-content-disabled);
  --text-text-decoration: var(--xe-interactive-text-text-decoration);

  /* Static light colors */
  --static-light-filled-bg: #FFFFFF;
  --static-light-filled-fg: var(--xe-color-content-static-dark);
  --static-light-outlined-bg: #00000000;
  --static-light-outlined-fg: #FFFFFF;
  --static-light-outlined-border: #FFFFFF;
  --static-light-text-bg: #00000000;
  --static-light-text-fg: #FFFFFF;

  /* Static dark colors */
  --static-dark-filled-bg: #190300;
  --static-dark-filled-fg: #FFFFFF;
  --static-dark-outlined-bg: #00000000;
  --static-dark-outlined-fg: #190300;
  --static-dark-outlined-border: #190300;
  --static-dark-text-bg: #00000000;
  --static-dark-text-fg: #190300;
}

/* ============================================
   BASE BUTTON STYLES
   ============================================ */

.button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--button-gap);
  min-width: var(--button-min-width);
  border: none;
  border-radius: var(--button-radius);
  text-decoration: var(--button-text-decoration, none);
  cursor: pointer;
  user-select: none;
  vertical-align: middle;
  transition: background-color {{motion.duration.standard}} {{motion.easing.standard}},
              box-shadow {{motion.duration.standard}} {{motion.easing.standard}};
  box-sizing: border-box;

  /* Default to filled primary */
  background-color: var(--button-bg, var(--filled-bg-primary));
  color: var(--button-fg, var(--filled-fg-primary));
  box-shadow: var(--button-border, none);
}

/* State layer overlay */
.button::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  transition: opacity {{motion.duration.standard}} {{motion.easing.standard}};
  pointer-events: none;
}

.button:hover:not(:disabled)::before {
  background-color: var(--state-hover);
  opacity: 1;
}

.button:focus-visible {
  outline: 2px solid var(--xe-color-content-on-surface-on-surface);
  outline-offset: 3px;
}

.button:active:not(:disabled)::before {
  background-color: var(--state-pressed);
  opacity: 1;
}

.button:disabled {
  cursor: not-allowed;
}

/* ============================================
   SIZE VARIANTS
   Only padding changes - typography stays the same across all sizes
   ============================================ */

.button {
  /* Typography - same for all sizes per Figma specs */
  font-family: var(--xe-typography-label-sm-family);
  font-size: var(--xe-typography-label-sm-size);
  font-weight: var(--xe-typography-label-sm-weight);
  line-height: var(--xe-typography-label-sm-line-height);
  letter-spacing: var(--xe-typography-label-sm-letter-spacing);
  text-transform: var(--xe-typography-label-sm-text-transform);
}

.button.xxs {
  padding: var(--xe-spacing-content-inset-tight) var(--xe-spacing-content-inset-compact);
}

.button.xxs.has-both-icons {
  padding: var(--xe-spacing-content-inset-tight);
}

.button.xs {
  padding: var(--xe-spacing-content-inset-compact) var(--xe-spacing-content-inset-cozy);
}

.button.xs.has-both-icons {
  padding: var(--xe-spacing-content-inset-compact);
}

.button.sm {
  padding: var(--xe-spacing-content-inset-cozy);
}

@media (max-width: 599px) {
  .button.sm {
    padding: var(--xe-spacing-content-inset-compact) var(--xe-spacing-content-inset-cozy);
  }
}

.button.md {
  padding: var(--xe-spacing-content-inset-comfortable);
}

.button.lg {
  padding: var(--xe-spacing-content-inset-spacious);
}

/* ============================================
   FILLED TREATMENT
   ============================================ */

.button.filled.primary {
  --button-bg: var(--filled-bg-primary);
  --button-fg: var(--filled-fg-primary);
}

.button.filled.primary:disabled {
  --button-bg: var(--filled-bg-disabled);
  --button-fg: var(--filled-fg-disabled);
}

.button.filled.secondary {
  --button-bg: var(--filled-bg-secondary);
  --button-fg: var(--filled-fg-secondary);
}

.button.filled.secondary:disabled {
  --button-bg: var(--filled-bg-disabled);
  --button-fg: var(--filled-fg-disabled);
}

.button.filled.tertiary {
  --button-bg: var(--filled-bg-tertiary);
  --button-fg: var(--filled-fg-tertiary);
}

.button.filled.tertiary:disabled {
  --button-bg: var(--filled-bg-disabled);
  --button-fg: var(--filled-fg-disabled);
}

.button.filled.neutral {
  --button-bg: var(--filled-bg-neutral);
  --button-fg: var(--filled-fg-neutral);
}

.button.filled.neutral:disabled {
  --button-bg: var(--filled-bg-disabled);
  --button-fg: var(--filled-fg-disabled);
}

.button.filled.accent {
  --button-bg: var(--filled-bg-accent);
  --button-fg: var(--filled-fg-accent);
}

.button.filled.accent:disabled {
  --button-bg: var(--filled-bg-disabled);
  --button-fg: var(--filled-fg-disabled);
}

.button.filled.static-light {
  --button-bg: var(--static-light-filled-bg);
  --button-fg: var(--static-light-filled-fg);
}

.button.filled.static-light:disabled {
  --button-bg: var(--filled-bg-disabled);
  --button-fg: var(--filled-fg-disabled);
}

.button.filled.static-dark {
  --button-bg: var(--static-dark-filled-bg);
  --button-fg: var(--static-dark-filled-fg);
}

.button.filled.static-dark:disabled {
  --button-bg: var(--filled-bg-disabled);
  --button-fg: var(--filled-fg-disabled);
}

/* ============================================
   OUTLINED TREATMENT
   ============================================ */

.button.outlined.primary {
  --button-bg: var(--outlined-bg-primary);
  --button-fg: var(--outlined-fg-primary);
  --button-border: inset 0 0 0 1px var(--outlined-border-primary);
}

.button.outlined.primary:disabled {
  --button-fg: var(--outlined-fg-disabled);
  --button-border: inset 0 0 0 1px var(--outlined-border-disabled);
}

.button.outlined.secondary {
  --button-bg: var(--outlined-bg-secondary);
  --button-fg: var(--outlined-fg-secondary);
  --button-border: inset 0 0 0 1px var(--outlined-border-secondary);
}

.button.outlined.secondary:disabled {
  --button-fg: var(--outlined-fg-disabled);
  --button-border: inset 0 0 0 1px var(--outlined-border-disabled);
}

.button.outlined.tertiary {
  --button-bg: var(--outlined-bg-tertiary);
  --button-fg: var(--outlined-fg-tertiary);
  --button-border: inset 0 0 0 1px var(--outlined-border-tertiary);
}

.button.outlined.tertiary:disabled {
  --button-fg: var(--outlined-fg-disabled);
  --button-border: inset 0 0 0 1px var(--outlined-border-disabled);
}

.button.outlined.neutral {
  --button-bg: var(--outlined-bg-neutral);
  --button-fg: var(--outlined-fg-neutral);
  --button-border: inset 0 0 0 1px var(--outlined-border-neutral);
}

.button.outlined.neutral:disabled {
  --button-fg: var(--outlined-fg-disabled);
  --button-border: inset 0 0 0 1px var(--outlined-border-disabled);
}

.button.outlined.accent {
  --button-bg: var(--outlined-bg-accent);
  --button-fg: var(--outlined-fg-accent);
  --button-border: inset 0 0 0 1px var(--outlined-border-accent);
}

.button.outlined.accent:disabled {
  --button-fg: var(--outlined-fg-disabled);
  --button-border: inset 0 0 0 1px var(--outlined-border-disabled);
}

.button.outlined.static-light {
  --button-bg: var(--static-light-outlined-bg);
  --button-fg: var(--static-light-outlined-fg);
  --button-border: inset 0 0 0 1px var(--static-light-outlined-border);
}

.button.outlined.static-light:disabled {
  --button-fg: var(--outlined-fg-disabled);
  --button-border: inset 0 0 0 1px var(--outlined-border-disabled);
}

.button.outlined.static-dark {
  --button-bg: var(--static-dark-outlined-bg);
  --button-fg: var(--static-dark-outlined-fg);
  --button-border: inset 0 0 0 1px var(--static-dark-outlined-border);
}

.button.outlined.static-dark:disabled {
  --button-fg: var(--outlined-fg-disabled);
  --button-border: inset 0 0 0 1px var(--outlined-border-disabled);
}

/* ============================================
   TEXT TREATMENT
   ============================================ */

.button.text {
  --button-text-decoration: var(--text-text-decoration, none);
}

.button.text.primary {
  --button-bg: var(--text-bg-primary);
  --button-fg: var(--text-fg-primary);
}

.button.text.primary:disabled {
  --button-fg: var(--text-fg-disabled);
}

.button.text.secondary {
  --button-bg: var(--text-bg-secondary);
  --button-fg: var(--text-fg-secondary);
}

.button.text.secondary:disabled {
  --button-fg: var(--text-fg-disabled);
}

.button.text.tertiary {
  --button-bg: var(--text-bg-tertiary);
  --button-fg: var(--text-fg-tertiary);
}

.button.text.tertiary:disabled {
  --button-fg: var(--text-fg-disabled);
}

.button.text.neutral {
  --button-bg: var(--text-bg-neutral);
  --button-fg: var(--text-fg-neutral);
}

.button.text.neutral:disabled {
  --button-fg: var(--text-fg-disabled);
}

.button.text.accent {
  --button-bg: var(--text-bg-accent);
  --button-fg: var(--text-fg-accent);
}

.button.text.accent:disabled {
  --button-fg: var(--text-fg-disabled);
}

.button.text.static-light {
  --button-bg: var(--static-light-text-bg);
  --button-fg: var(--static-light-text-fg);
}

.button.text.static-light:disabled {
  --button-fg: var(--text-fg-disabled);
}

.button.text.static-dark {
  --button-bg: var(--static-dark-text-bg);
  --button-fg: var(--static-dark-text-fg);
}

.button.text.static-dark:disabled {
  --button-fg: var(--text-fg-disabled);
}

/* ============================================
   EXPAND MODIFIER
   ============================================ */

:host([expand]) {
  display: block;
  width: 100%;
}

.button.expand {
  width: 100%;
}

/* ============================================
   ICON AND CONTENT STYLES
   ============================================ */

::slotted([slot="icon"]),
.icon {
  width: var(--button-icon-size);
  height: var(--button-icon-size);
  font-size: var(--button-icon-size);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

::slotted([slot="trailing-icon"]),
.trailing-icon {
  width: var(--button-icon-size);
  height: var(--button-icon-size);
  font-size: var(--button-icon-size);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon svg,
.trailing-icon svg {
  width: 100%;
  height: 100%;
  display: block;
}

.content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.text {
  display: inline-flex;
  flex-wrap: wrap;
  text-align: center;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-card/index.js
var xe_card_default = i`/**
 * Card Component CSS
 * Styles for card container elements using XE design tokens
 * For use in shadow DOM of xe-card component
 *
 * Internal CSS Custom Properties (set by component, not user-overrideable):
 * --card-title-align: Text alignment for title
 * --card-body-align: Text alignment for body content
 * --card-actions-align: Text alignment for actions
 * --card-actions-display: Display mode for actions
 * --card-content-display: Display mode for content wrapper
 * --card-content-align-items: Horizontal positioning of content flex items
 * --card-header-align-items: Horizontal positioning of header flex items
 * --card-header-justify: Vertical alignment of header
 * --card-header-flex-grow: Allow header to expand vertically
 * --card-header-margin-bottom: Conditional bottom margin on header
 *
 * CSS Custom Properties (consumer-overrideable):
 * --card-title-family: Override title font family
 * --card-title-size: Override title font size
 * --card-title-weight: Override title font weight
 * --card-title-line-height: Override title line height
 * --card-title-letter-spacing: Override title letter spacing
 * --card-title-text-transform: Override title text transform
 *
 * Legacy CSS Custom Properties (deprecated, use component properties instead):
 * --card-title-max-width: Max width constraint for title area
 * --card-body-max-width: Max width constraint for body content
 */

:host {
  display: block;
  height: 100%;
  aspect-ratio: var(--xe-card-aspect-ratio, auto);

  /* Default content colors */
  --card-text-color: var(--xe-color-content-on-surface-on-surface);
  --_card-icon-color: var(--card-icon-color, var(--xe-color-content-on-surface-on-surface));
}

:host(:has([slot="decorative"])) {
  aspect-ratio: var(--xe-card-aspect-ratio, 2/3);
  overflow: hidden;
}

:host(:has([slot="decorative"])) .card {
  overflow: hidden;
}

/* PRIMARY VARIANT - Set colors on :host so they propagate to slotted content */
:host([variant="primary"]) {
  --card-text-color: var(--xe-color-content-on-primary-on-primary);
  --_card-icon-color: var(--card-icon-color, var(--xe-color-content-on-primary-on-primary));
}

/* PRIMARY-VARIANT VARIANT - Set colors on :host so they propagate to slotted content */
:host([variant="primary-variant"]) {
  --card-text-color: var(--xe-color-content-on-primary-variant-on-primary-variant);
  --_card-icon-color: var(--card-icon-color, var(--xe-color-content-on-primary-variant-on-primary-variant));
}

/* SURFACE VARIANT - Set colors on :host so they propagate to slotted content */
:host([variant="surface"]) {
  --card-text-color: var(--xe-color-content-on-surface-on-surface);
  --_card-icon-color: var(--card-icon-color, var(--xe-color-content-on-surface-on-surface));
}

/* NEUTRAL VARIANT - Set colors on :host so they propagate to slotted content */
:host([variant="neutral"]) {
  --card-text-color: var(--xe-color-content-on-neutral-container);
  --_card-icon-color: var(--card-icon-color, var(--xe-color-content-on-surface-on-surface-primary));
}

/* STATIC-LIGHT VARIANT - Set colors on :host so they propagate to slotted content */
:host([variant="static-light"]) {
  --card-text-color: var(--xe-color-content-on-surface-on-surface);
  --_card-icon-color: var(--card-icon-color, #7D7269);
}

/* STATIC-DARK VARIANT - Set colors on :host so they propagate to slotted content */
:host([variant="static-dark"]) {
  --card-text-color: var(--xe-color-content-static-light);
  --_card-icon-color: var(--card-icon-color, var(--xe-color-content-static-light));
}

/* IMAGE/VIDEO VARIANTS - No default colors, rely on content-theme */
:host([variant="image"]),
:host([variant="video"]) {
  --card-text-color: inherit;
  --_card-icon-color: var(--card-icon-color, inherit);
}

/* CONTENT THEME OVERRIDES - Higher specificity, applied on :host */
:host([content-theme="light"]) {
  --card-text-color: var(--xe-color-content-static-light);
  --_card-icon-color: var(--xe-color-content-static-light);
}

:host([content-theme="light"]) ::slotted([slot="title"]),
:host([content-theme="light"]) ::slotted(*:not([slot])) {
  color: var(--xe-color-content-static-light) !important;
}

:host([content-theme="dark"]) {
  --card-text-color: var(--xe-color-content-static-dark);
  --_card-icon-color: var(--xe-color-content-static-dark);
}

:host([content-theme="dark"]) ::slotted([slot="title"]),
:host([content-theme="dark"]) ::slotted(*:not([slot])) {
  color: var(--xe-color-content-static-dark) !important;
}

/* Base card styles */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  transition: background-color {{motion.duration.standard}} {{motion.easing.standard}},
              box-shadow {{motion.duration.standard}} {{motion.easing.standard}},
              transform {{motion.duration.standard}} {{motion.easing.standard}};
  color: var(--card-text-color);
  height: 100%;
}

/* Remove default anchor styling when card is a link */
a.card {
  text-decoration: none;
  color: inherit;
}

/* ==============================================
   PRIMARY VARIANT
   ============================================== */

/* Primary + Filled */
.card.primary.filled {
  background-color: var(--xe-color-brand-primary);
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
}

.card.primary.filled.interactive:hover {
  background-color: var(--xe-color-brand-primary);
  box-shadow: var(--xe-effect-elevation-level-1);
  cursor: pointer;
}

.card.primary.filled.interactive:active {
  background-color: var(--xe-color-brand-primary);
  box-shadow: var(--xe-effect-elevation-level-0);
}

/* Primary + Elevated */
.card.primary.elevated {
  background-color: var(--xe-color-brand-primary);
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  box-shadow: var(--xe-effect-elevation-level-1);
}

.card.primary.elevated.interactive:hover {
  background-color: var(--xe-color-brand-primary);
  box-shadow: var(--xe-effect-elevation-level-2);
  cursor: pointer;
}

.card.primary.elevated.interactive:active {
  background-color: var(--xe-color-brand-primary);
  box-shadow: var(--xe-effect-elevation-level-1);
}

/* Primary + Outlined */
.card.primary.outlined {
  background-color: var(--xe-color-brand-primary);
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  border: var(--xe-border-width-border-sm) solid var(--xe-color-surface-outline-primary);
  box-shadow: var(--xe-effect-elevation-level-0);
}

.card.primary.outlined.interactive:hover {
  background-color: var(--xe-color-brand-primary);
  border-color: var(--xe-color-surface-outline-primary);
  cursor: pointer;
}

.card.primary.outlined.interactive:active {
  background-color: var(--xe-color-brand-primary);
  border-color: var(--xe-color-surface-outline-primary);
}

/* ==============================================
   PRIMARY-VARIANT VARIANT
   ============================================== */

/* Primary-Variant + Filled */
.card.primary-variant.filled {
  background-color: var(--xe-color-brand-primary-variant);
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
}

.card.primary-variant.filled.interactive:hover {
  background-color: var(--xe-color-brand-primary-variant);
  box-shadow: var(--xe-effect-elevation-level-1);
  cursor: pointer;
}

.card.primary-variant.filled.interactive:active {
  background-color: var(--xe-color-brand-primary-variant);
  box-shadow: var(--xe-effect-elevation-level-0);
}

/* Primary-Variant + Elevated */
.card.primary-variant.elevated {
  background-color: var(--xe-color-brand-primary-variant);
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  box-shadow: var(--xe-effect-elevation-level-1);
}

.card.primary-variant.elevated.interactive:hover {
  background-color: var(--xe-color-brand-primary-variant);
  box-shadow: var(--xe-effect-elevation-level-2);
  cursor: pointer;
}

.card.primary-variant.elevated.interactive:active {
  background-color: var(--xe-color-brand-primary-variant);
  box-shadow: var(--xe-effect-elevation-level-1);
}

/* Primary-Variant + Outlined */
.card.primary-variant.outlined {
  background-color: var(--xe-color-brand-primary-variant);
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  border: var(--xe-border-width-border-sm) solid var(--xe-color-brand-primary-variant);
  box-shadow: var(--xe-effect-elevation-level-0);
}

.card.primary-variant.outlined.interactive:hover {
  background-color: var(--xe-color-brand-primary-variant);
  border-color: var(--xe-color-brand-primary-variant);
  cursor: pointer;
}

.card.primary-variant.outlined.interactive:active {
  background-color: var(--xe-color-brand-primary-variant);
  border-color: var(--xe-color-brand-primary-variant);
}

/* ==============================================
   SURFACE VARIANT
   ============================================== */

/* Surface + Filled */
.card.surface.filled {
  background-color: var(--xe-color-surface-container-lowest);
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
}

.card.surface.filled.interactive:hover {
  background-color: var(--xe-color-surface-container-lowest);
  box-shadow: var(--xe-effect-elevation-level-1);
  cursor: pointer;
}

.card.surface.filled.interactive:active {
  background-color: var(--xe-color-surface-container-lowest);
  box-shadow: var(--xe-effect-elevation-level-0);
}

/* Surface + Elevated */
.card.surface.elevated {
  background-color: var(--xe-color-surface-container-lowest);
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  box-shadow: var(--xe-effect-elevation-level-1);
}

.card.surface.elevated.interactive:hover {
  background-color: var(--xe-color-surface-container-lowest);
  box-shadow: var(--xe-effect-elevation-level-2);
  cursor: pointer;
}

.card.surface.elevated.interactive:active {
  background-color: var(--xe-color-surface-container-lowest);
  box-shadow: var(--xe-effect-elevation-level-1);
}

/* Surface + Outlined */
.card.surface.outlined {
  background-color: var(--xe-color-surface-container-lowest);
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  border: var(--xe-border-width-border-sm) solid var(--xe-color-surface-outline-default);
  box-shadow: var(--xe-effect-elevation-level-0);
}

.card.surface.outlined.interactive:hover {
  background-color: var(--xe-color-surface-container-lowest);
  border-color: var(--xe-color-surface-outline-default);
  cursor: pointer;
}

.card.surface.outlined.interactive:active {
  background-color: var(--xe-color-surface-container-lowest);
  border-color: var(--xe-color-surface-outline-default);
}

/* ==============================================
   NEUTRAL VARIANT
   ============================================== */

/* Neutral + Filled */
.card.neutral.filled {
  background-color: var(--xe-color-surface-neutral-container-base);
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
}

.card.neutral.filled.interactive:hover {
  background-color: var(--xe-color-surface-neutral-container-base);
  box-shadow: var(--xe-effect-elevation-level-1);
  cursor: pointer;
}

.card.neutral.filled.interactive:active {
  background-color: var(--xe-color-surface-neutral-container);
  box-shadow: var(--xe-effect-elevation-level-0);
}

/* Neutral + Elevated */
.card.neutral.elevated {
  background-color: var(--xe-color-surface-neutral-container-base);
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  box-shadow: var(--xe-effect-elevation-level-1);
}

.card.neutral.elevated.interactive:hover {
  background-color: var(--xe-color-surface-neutral-container-base);
  box-shadow: var(--xe-effect-elevation-level-2);
  cursor: pointer;
}

.card.neutral.elevated.interactive:active {
  background-color: var(--xe-color-surface-neutral-container);
  box-shadow: var(--xe-effect-elevation-level-1);
}

/* Neutral + Outlined */
.card.neutral.outlined {
  background-color: var(--xe-color-surface-neutral-container-base);
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  border: var(--xe-border-width-border-sm) solid var(--xe-color-surface-outline-neutral);
  box-shadow: var(--xe-effect-elevation-level-0);
}

.card.neutral.outlined.interactive:hover {
  background-color: var(--xe-color-surface-neutral-container-base);
  border-color: var(--xe-color-surface-outline-neutral);
  cursor: pointer;
}

.card.neutral.outlined.interactive:active {
  background-color: var(--xe-color-surface-neutral-container);
  border-color: var(--xe-color-surface-outline-neutral);
}

/* ==============================================
   STATIC-LIGHT VARIANT
   ============================================== */

/* Static-Light + Filled */
.card.static-light.filled {
  background-color: #F8F2EE;
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
}

.card.static-light.filled.interactive:hover {
  background-color: #F8F2EE;
  box-shadow: var(--xe-effect-elevation-level-1);
  cursor: pointer;
}

.card.static-light.filled.interactive:active {
  background-color: #F8F2EE;
  box-shadow: var(--xe-effect-elevation-level-0);
}

/* Static-Light + Elevated */
.card.static-light.elevated {
  background-color: #F8F2EE;
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  box-shadow: var(--xe-effect-elevation-level-1);
}

.card.static-light.elevated.interactive:hover {
  background-color: #F8F2EE;
  box-shadow: var(--xe-effect-elevation-level-2);
  cursor: pointer;
}

.card.static-light.elevated.interactive:active {
  background-color: #F8F2EE;
  box-shadow: var(--xe-effect-elevation-level-1);
}

/* Static-Light + Outlined */
.card.static-light.outlined {
  background-color: #F8F2EE;
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  border: var(--xe-border-width-border-sm) solid var(--xe-color-content-static-light);
  box-shadow: var(--xe-effect-elevation-level-0);
}

.card.static-light.outlined.interactive:hover {
  background-color: #F8F2EE;
  border-color: var(--xe-color-content-static-light);
  cursor: pointer;
}

.card.static-light.outlined.interactive:active {
  background-color: #F8F2EE;
  border-color: var(--xe-color-content-static-light);
}

/* ==============================================
   STATIC-DARK VARIANT
   ============================================== */

/* Static-Dark + Filled */
.card.static-dark.filled {
  background-color: #312E2A;
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
}

.card.static-dark.filled.interactive:hover {
  background-color: #312E2A;
  box-shadow: var(--xe-effect-elevation-level-1);
  cursor: pointer;
}

.card.static-dark.filled.interactive:active {
  background-color: #312E2A;
  box-shadow: var(--xe-effect-elevation-level-0);
}

/* Static-Dark + Elevated */
.card.static-dark.elevated {
  background-color: #312E2A;
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  box-shadow: var(--xe-effect-elevation-level-1);
}

.card.static-dark.elevated.interactive:hover {
  background-color: #312E2A;
  box-shadow: var(--xe-effect-elevation-level-2);
  cursor: pointer;
}

.card.static-dark.elevated.interactive:active {
  background-color: #312E2A;
  box-shadow: var(--xe-effect-elevation-level-1);
}

/* Static-Dark + Outlined */
.card.static-dark.outlined {
  background-color: #312E2A;
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  border: var(--xe-border-width-border-sm) solid var(--xe-color-content-static-dark);
  box-shadow: var(--xe-effect-elevation-level-0);
}

.card.static-dark.outlined.interactive:hover {
  background-color: #312E2A;
  border-color: var(--xe-color-content-static-dark);
  cursor: pointer;
}

.card.static-dark.outlined.interactive:active {
  background-color: #312E2A;
  border-color: var(--xe-color-content-static-dark);
}

/* ==============================================
   IMAGE VARIANT (transparent background)
   ============================================== */

/* Image + Filled */
.card.image.filled {
  background-color: #00000000;
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
}

.card.image.filled.interactive:hover {
  box-shadow: var(--xe-effect-elevation-level-1);
  cursor: pointer;
}

.card.image.filled.interactive:active {
  box-shadow: var(--xe-effect-elevation-level-0);
}

/* Image + Elevated */
.card.image.elevated {
  background-color: #00000000;
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  box-shadow: var(--xe-effect-elevation-level-1);
}

.card.image.elevated.interactive:hover {
  box-shadow: var(--xe-effect-elevation-level-2);
  cursor: pointer;
}

.card.image.elevated.interactive:active {
  box-shadow: var(--xe-effect-elevation-level-1);
}

/* Image + Outlined */
.card.image.outlined {
  background-color: #00000000;
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  border: var(--xe-border-width-border-sm) solid var(--xe-color-surface-outline-default);
  box-shadow: var(--xe-effect-elevation-level-0);
}

.card.image.outlined.interactive:hover {
  border-color: var(--xe-color-surface-outline-default);
  cursor: pointer;
}

.card.image.outlined.interactive:active {
  border-color: var(--xe-color-surface-outline-default);
}

/* ==============================================
   VIDEO VARIANT (transparent background)
   ============================================== */

/* Video + Filled */
.card.video.filled {
  background-color: #00000000;
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
}

.card.video.filled.interactive:hover {
  box-shadow: var(--xe-effect-elevation-level-1);
  cursor: pointer;
}

.card.video.filled.interactive:active {
  box-shadow: var(--xe-effect-elevation-level-0);
}

/* Video + Elevated */
.card.video.elevated {
  background-color: #00000000;
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  box-shadow: var(--xe-effect-elevation-level-1);
}

.card.video.elevated.interactive:hover {
  box-shadow: var(--xe-effect-elevation-level-2);
  cursor: pointer;
}

.card.video.elevated.interactive:active {
  box-shadow: var(--xe-effect-elevation-level-1);
}

/* Video + Outlined */
.card.video.outlined {
  background-color: #00000000;
  border-radius: var(--xe-radius-medium);
  padding: var(--xe-spacing-content-inset-comfortable);
  border: var(--xe-border-width-border-sm) solid var(--xe-color-surface-outline-default);
  box-shadow: var(--xe-effect-elevation-level-0);
}

.card.video.outlined.interactive:hover {
  border-color: var(--xe-color-surface-outline-default);
  cursor: pointer;
}

.card.video.outlined.interactive:active {
  border-color: var(--xe-color-surface-outline-default);
}

/* ==============================================
   DESTRUCTURED VARIANT (no surface treatment)
   ============================================== */

/* Destructured - no background, no padding, no elevation */
.card.destructured {
  background: transparent;
  padding: 0;
  border: none;
  box-shadow: none;
  border-radius: 0;
  --card-media-radius: 0;
}

/* No hover/active states for destructured */
.card.destructured.interactive:hover,
.card.destructured.interactive:active {
  background: transparent;
  box-shadow: none;
  cursor: pointer;
}

/* Destructured card content */
.card.destructured .card-content {
  padding: var(--xe-spacing-content-inset-cozy);
}

/* Destructured actions */
.card.destructured .card-actions {
  margin-top: 0;
  padding-inline: var(--xe-spacing-content-inset-cozy);
  padding-bottom: var(--xe-spacing-content-inset-cozy);
}

/* Destructured with center alignment */
.card.destructured.align-center .card-content,
.card.destructured.align-center .header {
  align-items: center;
}

.card.destructured.align-center .card-actions {
  text-align: center;
}

/* Destructured with left alignment */
.card.destructured.align-left .card-content,
.card.destructured.align-left .header {
  align-items: flex-start;
}

.card.destructured.align-left .card-actions {
  text-align: left;
}

/* ==============================================
   SLOT STYLES
   ============================================== */

/* Card content wrapper */
.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--xe-spacing-stack-gap-xl);
  align-items: var(--card-content-align-items, stretch);
  text-align: var(--card-body-align, inherit);
  flex: 1;
  min-height: 0;
}

/* Header wrapper */
.header {
  display: flex;
  flex-direction: column;
  gap: var(--card-icon-to-title-gap, var(--xe-spacing-layout-gap-lg));
  /* Optional layout constraint for title - defaults to none */
  max-width: var(--card-title-max-width, none);
  /* Responsive alignment controls */
  text-align: var(--card-title-align, inherit);
  align-items: var(--card-header-align-items, flex-start);
  justify-content: var(--card-header-justify, flex-start);
  flex-grow: var(--card-header-flex-grow, 0);
  width: 100%;
}

/* Alignment variants */
.card.align-left .card-content,
.card.align-left .header,
.card.align-left .card-actions {
  text-align: left;
  align-items: flex-start;
}

.card.align-center .card-content,
.card.align-center .header,
.card.align-center .card-actions {
  text-align: center;
  align-items: center;
}

/* Icon slot - transparent */
.header slot[name="icon"] {
  display: contents;
}

/* Style slotted xe-icon or svg element */
.header slot[name="icon"]::slotted(xe-icon),
.header slot[name="icon"]::slotted(svg) {
  display: block;
  color: var(--_card-icon-color);
}

@media (max-width: 599px) {
  .header slot[name="icon"]::slotted(xe-icon) {
    --xe-icon-size: var(--xe-icon-sm);
  }
}

/* Title slot styling - enforce consistent typography regardless of heading level */
::slotted([slot="title"]) {
  display: block;
  margin: 0 !important;
  color: var(--card-title-color, var(--card-text-color)) !important;
  text-align: var(--card-title-align, left);
  width: 100%;
  font-family: var(--card-title-family, var(--xe-typography-headline-sm-family)) !important;
  font-size: var(--card-title-size, var(--xe-typography-headline-sm-size)) !important;
  font-weight: var(--card-title-weight, var(--xe-typography-headline-sm-weight)) !important;
  line-height: var(--card-title-line-height, var(--xe-typography-headline-sm-line-height)) !important;
  letter-spacing: var(--card-title-letter-spacing, var(--xe-typography-headline-sm-letter-spacing)) !important;
  text-transform: var(--card-title-text-transform, var(--xe-typography-headline-sm-text-transform)) !important;
}

/* Destructured variant spacing */
.card.destructured {
  row-gap: 0;
}

.card.destructured .header {
  gap: var(--xe-spacing-stack-gap-xl);
}

/* Body content (default slot) */
::slotted(*:not([slot])) {
  display: block;
  margin: 0;
  color: var(--card-text-color) !important;
  text-align: var(--card-body-align, left);
  max-width: var(--card-body-max-width, none);
  font-family: var(--xe-card-body-family, var(--xe-typography-body-sm-family)) !important;
  font-size: var(--xe-card-body-size, var(--xe-typography-body-sm-size)) !important;
  font-weight: var(--xe-card-body-weight, var(--xe-typography-body-sm-weight)) !important;
  line-height: var(--xe-card-body-line-height, var(--xe-typography-body-sm-line-height)) !important;
  letter-spacing: var(--xe-card-body-letter-spacing, var(--xe-typography-body-sm-letter-spacing)) !important;
}

/* Card actions wrapper */
.card-actions {
  display: var(--card-actions-display, block);
  margin-top: var(--card-row-gap, 24px);
  /* Responsive alignment control */
  text-align: var(--card-actions-align, inherit);
}

/* Slotted actions content */
::slotted([slot="actions"]) {
  display: block;
}

/* Media slot - for standard cards with media at top */
::slotted([slot="media"]) {
  display: block;
  width: 100%;
  object-fit: cover;
  margin: calc(var(--xe-spacing-content-inset-comfortable) * -1) calc(var(--xe-spacing-content-inset-comfortable) * -1) var(--xe-spacing-stack-gap-xl);
  border-radius: var(--card-media-radius, var(--xe-radius-medium) var(--xe-radius-medium) 0 0);
}

slot[name="decorative"] {
  position: absolute;
  width: 100%;
  pointer-events: none;
}

::slotted([slot="decorative"]) {
  display: block;
  color: var(--card-text-color);
  width: 100%;
  height: auto;
}

:host([decorative-position="bottom-left"]) slot[name="decorative"] {
  bottom: 0;
  left: 0;
}

:host([decorative-position="bottom-right"]) slot[name="decorative"] {
  bottom: 0;
  right: 0;
  left: auto;
  width: auto;
}

:host([decorative-position="bottom-center"]) slot[name="decorative"] {
  bottom: 0;
  left: 50%;
  width: auto;
  transform: translateX(-50%);
}

:host([decorative-position="top-left"]) slot[name="decorative"] {
  top: 0;
  left: 0;
}

:host([decorative-position="top-right"]) slot[name="decorative"] {
  top: 0;
  right: 0;
  left: auto;
  width: auto;
}

:host([decorative-position="top-center"]) slot[name="decorative"] {
  top: 0;
  left: 50%;
  width: auto;
  transform: translateX(-50%);
}

:host([decorative-position="center"]) slot[name="decorative"] {
  top: 50%;
  left: 50%;
  width: auto;
  transform: translate(-50%, -50%);
}

/* Media slot for image/video variants - remove from grid flow */
.card.image slot[name="media"],
.card.video slot[name="media"] {
  display: contents;
}

/* Slotted media for image/video variants - absolutely positioned to cover entire card */
.card.image ::slotted([slot="media"]),
.card.video ::slotted([slot="media"]) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  border-radius: inherit;
  z-index: 0;
}

/* Optional gradient overlay for image/video cards - sits between media and content */
.card.image::after,
.card.video::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--card-gradient-overlay, none);
  border-radius: inherit;
  z-index: 0.6;
  pointer-events: none;
}

/* Ensure image/video cards have overflow hidden */
.card.image,
.card.video {
  overflow: hidden;
}

/* Overlay for background media */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: inherit;
  pointer-events: none;
  z-index: 0.5;
}

/* Position content above the background image/video */
.card.image .card-content,
.card.image .card-actions,
.card.video .card-content,
.card.video .card-actions {
  position: relative;
  z-index: 1;
}

/* ==============================================
   ASPECT RATIO VARIANTS
   ============================================== */

.card.aspect-16-9 {
  aspect-ratio: 16 / 9;
}

.card.aspect-9-16 {
  aspect-ratio: 9 / 16;
}

.card.aspect-4-3 {
  aspect-ratio: 4 / 3;
}

.card.aspect-1-1 {
  aspect-ratio: 1 / 1;
}

.card.aspect-4-5 {
  aspect-ratio: 4 / 5;
}

.card.aspect-3-2 {
  aspect-ratio: 3 / 2;
}

/* ==============================================
   ACTIONS ALIGNMENT VARIANTS
   ============================================== */

/* Actions align left by default */
.card.actions-right .card-actions {
  text-align: right;
}

/* ==============================================
   ACTIONS PLACEMENT VARIANTS
   ============================================== */

/* Inline actions - place right after content instead of at bottom */
.card.actions-inline {
  display: block;
}

.card.actions-inline .card-actions {
  grid-row: auto;
}

/* ==============================================
   LAYOUT VARIANTS
   ============================================== */

@media (max-width: 768px) {
  /* Center content vertically in interactive cards on mobile */
  a.card.interactive {
    justify-content: center;
  }
}

`;

// node_modules/@ignite/web/dist/tokens/component/xe-card-grid/index.js
var xe_card_grid_default = i`:host {
  display: block;
  width: 100%;
  box-sizing: border-box;
}

.grid {
  display: grid;
  gap: var(--xe-card-grid-gap, var(--card-grid-gap-size, var(--xe-spacing-stack-gap-3xl)));
  align-items: stretch;
  grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
}

.grid.explicit {
  grid-template-columns: repeat(var(--columns), 1fr);
}

@media (max-width: 599px) {
  .grid.explicit {
    grid-template-columns: 1fr;
  }
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-carousel/index.js
var xe_carousel_default = i`/**
 * Carousel Primitive CSS
 * Horizontally scrollable scroll-snap carousel with dot pagination and arrow navigation.
 *
 * Peek behavior: padding-inline-start + scroll-padding-inline-start on the reel-track
 * cause cards to snap to an inset position. When scrolled to a middle card, the
 * previous card's trailing edge is visible in the left padding zone (bilateral peek).
 *
 * Consumer-overrideable custom properties:
 *   (none — layout and tokens are fully controlled by this stylesheet)
 */

:host {
  display: block;
}

/* ============================================
   REEL
   ============================================ */

.reel {
  overflow: hidden;
  padding-top: var(--xe-spacing-content-inset-cozy);
  padding-bottom: var(--xe-spacing-content-inset-cozy);
}

.reel-track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: var(--xe-carousel-item-width, 100%);
  align-items: stretch;
  gap: var(--xe-spacing-inline-gap-md);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-inline-start: var(--xe-spacing-content-inset-spacious);
  scroll-padding-inline-start: var(--xe-spacing-content-inset-spacious);
  /* Extend padding-inline-end so the last card doesn't visually clip */
  padding-inline-end: var(--xe-spacing-content-inset-spacious);
}

.reel-track::-webkit-scrollbar {
  display: none;
}

::slotted(*) {
  scroll-snap-align: start;
  min-width: 0;
}

/* ============================================
   DESKTOP GRID LAYOUT
   When desktop-layout="grid": renders as a CSS grid on desktop,
   carousel on mobile. Used by xe-feature-cards[mobile-layout="carousel"].
   ============================================ */

@media (min-width: 896px) {
  :host([desktop-layout="grid"]) .reel {
    overflow: visible;
    padding-top: 0;
    padding-bottom: 0;
  }

  :host([desktop-layout="grid"]) .reel-track {
    grid-auto-flow: row;
    grid-template-columns: repeat(var(--xe-carousel-columns, 3), 1fr);
    grid-auto-columns: unset;
    overflow-x: visible;
    scroll-snap-type: none;
    padding-inline: 0;
    scroll-padding-inline-start: unset;
  }

  :host([desktop-layout="grid"]) .paginator {
    display: none;
  }
}

/* ============================================
   PAGINATOR
   ============================================ */

.paginator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: var(--xe-spacing-content-inset-compact);
  padding-bottom: var(--xe-spacing-content-inset-compact);
}

.dots {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 32px;
  padding: 0 16px;
}

.dot {
  box-sizing: border-box;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid var(--xe-color-content-on-surface-on-surface-primary);
  padding: 0;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
}

.dot:hover {
  background: var(--xe-states-hover);
}

.dot:active {
  background: var(--xe-states-pressed);
  transform: scale(0.9);
}

.dot.active {
  background: var(--xe-color-content-on-surface-on-surface-primary);
  border-color: var(--xe-color-content-on-surface-on-surface-primary);
  box-shadow: 0 0 0 3px var(--xe-color-content-on-surface-on-surface-primary);
}

.dot.active:hover {
  background: color-mix(in srgb, var(--xe-color-content-on-surface-on-surface-primary), black 8%);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xe-color-content-on-surface-on-surface-primary), black 8%);
}

.dot.active:active {
  background: color-mix(in srgb, var(--xe-color-content-on-surface-on-surface-primary), black 12%);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--xe-color-content-on-surface-on-surface-primary), black 12%);
  transform: scale(0.9);
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-feature-cards/index.js
var xe_feature_cards_default = i`/**
 * Feature Cards Composition CSS
 * Section wrapper with heading, optional subheading, and a card grid.
 */

:host {
  display: block;
  background-color: var(--xe-color-surface-base);
  --xe-card-body-family: var(--xe-typography-body-md-family);
  --xe-card-body-size: var(--xe-typography-body-md-size);
  --xe-card-body-weight: var(--xe-typography-body-md-weight);
  --xe-card-body-line-height: var(--xe-typography-body-md-line-height);
  --xe-card-body-letter-spacing: var(--xe-typography-body-md-letter-spacing);
}

:host([background="subtle"]) {
  background-color: var(--xe-color-surface-container-base);
}

:host([background="muted"]) {
  background-color: var(--xe-color-surface-container-lowest);
}

.feature-cards {
  max-width: 1440px;
  margin: 0 auto;
  padding-top: var(--xe-feature-cards-padding-top, var(--xe-spacing-content-inset-expansive));
  padding-bottom: var(--xe-feature-cards-padding-bottom, var(--xe-spacing-content-inset-expansive));
  padding-left: clamp(var(--xe-spacing-content-inset-spacious), 10vw, var(--xe-spacing-content-inset-generous));
  padding-right: clamp(var(--xe-spacing-content-inset-spacious), 10vw, var(--xe-spacing-content-inset-generous));
}

/* ============================================
   SECTION HEADER
   ============================================ */

.section-header {
  display: flex;
  flex-direction: column;
  gap: var(--xe-spacing-inline-gap-md);
  margin-bottom: var(--xe-spacing-stack-gap-3xl);
}

:host([header-align="center"]) .section-header {
  text-align: center;
}

.section-heading {
  margin: 0;
  color: var(--xe-color-content-on-surface-on-surface);
  font-family: var(--xe-typography-headline-lg-family);
  font-size: var(--xe-typography-headline-lg-size);
  font-weight: var(--xe-typography-headline-lg-weight);
  line-height: var(--xe-typography-headline-lg-line-height);
  letter-spacing: var(--xe-typography-headline-lg-letter-spacing);
  text-transform: var(--xe-typography-headline-lg-text-transform);
}

.section-subheading {
  margin: 0;
  color: var(--xe-color-content-on-surface-on-surface-variant);
  font-family: var(--xe-typography-body-md-family);
  font-size: var(--xe-typography-body-md-size);
  font-weight: var(--xe-typography-body-md-weight);
  line-height: var(--xe-typography-body-md-line-height);
  letter-spacing: var(--xe-typography-body-md-letter-spacing);
  text-transform: var(--xe-typography-body-md-text-transform);
}

/* ============================================
   MOBILE CAROUSEL
   Break the carousel out of the section's horizontal padding so it
   spans edge-to-edge. The carousel's own padding-inline creates the peek inset.
   ============================================ */

/* ≤ 895px: carousel is full-bleed; breakout cancels section horizontal padding */
@media (max-width: 895px) {
  :host([mobile-layout="carousel"]) .cards-carousel {
    margin-inline: calc(-1 * clamp(var(--xe-spacing-content-inset-spacious), 10vw, var(--xe-spacing-content-inset-generous)));
  }
}

/* Small + large mobile (≤ 414px): 1 card + 32px right peek
   card = 100vw - 32px (left pad) - 16px (gap) - 32px (peek) */
@media (max-width: 414px) {
  :host([mobile-layout="carousel"]) .cards-carousel {
    --xe-carousel-item-width: calc(100vw - 80px);
  }
}

/* Tablet (415px–895px): 2 cards + 48px right peek
   card = (100vw - 32px (left pad) - 16px (gap) - 48px (peek)) / 2 */
@media (min-width: 415px) and (max-width: 895px) {
  :host([mobile-layout="carousel"]) .cards-carousel {
    --xe-carousel-item-width: calc((100vw - 96px) / 2);
  }
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-footer/index.js
var xe_footer_default = i`/**
 * Footer Component CSS
 */

:host {
  display: block;
}

/* ============================================
   MAIN CONTENT AREA
   ============================================ */

.footer {
  background-color: var(--xe-color-surface-primary-variant-container-high);
  color: var(--xe-color-content-on-surface-on-surface-fixed-light);
}

/*
 * DOM order follows focus order: logo → social-legal → columns.
 * On desktop, grid-template-areas places everything visually regardless of DOM order.
 * On mobile, CSS order restores the visual sequence: logo → columns → social-legal.
 */
.main {
  display: grid;
  grid-template-columns: 258px 1fr;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "left    columns"
    "social  columns";
  column-gap: var(--xe-spacing-content-inset-generous);
  row-gap: 0;
  padding: var(--xe-spacing-content-inset-generous);
  max-width: 1440px;
  margin-inline: auto;
}

/* ============================================
   LEFT PANEL
   ============================================ */

.left-panel {
  grid-area: left;
  display: flex;
  flex-direction: column;
  gap: var(--xe-spacing-stack-gap-xl);
}

.columns {
  grid-area: columns;
  grid-row: 1 / -1;
}

.social-legal {
  grid-area: social;
  align-self: end;
  display: flex;
  flex-direction: column;
  gap: var(--xe-spacing-stack-gap-xl);
}

.logo-copyright {
  display: flex;
  flex-direction: column;
  gap: var(--xe-spacing-stack-gap-md);
}

.logo-copyright ::slotted([slot="logo"]) {
  display: block;
  width: 218px;
}

.logo-copyright ::slotted([slot="copyright"]) {
  display: block;
  font-family: var(--xe-typography-body-xs-family);
  font-size: var(--xe-typography-body-xs-size);
  font-weight: var(--xe-typography-body-xs-weight);
  line-height: var(--xe-typography-body-xs-line-height);
  color: var(--xe-color-content-on-surface-on-surface-fixed-light);
}

.social {
  display: flex;
  flex-direction: row;
  align-items: center;
}

/* Force social icon-buttons to use white foreground and inverse state layers */
.social ::slotted(xe-icon-button) {
  color: var(--xe-color-content-on-surface-on-surface-fixed-light);
  --xe-color-content-on-surface-on-surface-variant: var(--xe-color-content-on-surface-on-surface-fixed-light);
  --xe-states-hover: var(--xe-color-interactive-overlay-hover-inverse);
  --xe-states-pressed: var(--xe-color-interactive-overlay-pressed-inverse);
  --xe-icon-button-focus-color: var(--xe-color-content-on-surface-on-surface-fixed-light);
}

.legal {
  display: flex;
  flex-direction: column;
  gap: var(--xe-spacing-stack-gap-sm);
}

.legal ::slotted(xe-hyperlink) {
  display: block;
  --xe-hyperlink-focus-color: var(--xe-color-content-on-surface-on-surface-fixed-light);
}

/* ============================================
   LINK COLUMNS GRID
   ============================================ */

.columns {
  display: grid;
  grid-template-columns: repeat(var(--xe-footer-columns, 5), auto);
  gap: var(--xe-spacing-section-gap-lg);
  justify-content: end;
  align-items: start;
  flex: 1;
  min-width: 0;
}

/* ============================================
   FOOTER BANNER
   ============================================ */

.banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: var(--xe-spacing-content-inset-generous);
}

.banner-image {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.banner-image ::slotted(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

:host([image-position="center"]) .banner-image ::slotted(img) {
  object-position: center;
}

:host([image-position="top"]) .banner-image ::slotted(img) {
  object-position: top;
}

:host([image-position="bottom"]) .banner-image ::slotted(img) {
  object-position: bottom;
}

.tagline {
  position: relative;
  z-index: 1;
  font-family: var(--xe-typography-display-lg-family);
  font-size: clamp(24px, calc(24px + 40 * ((100vw - 320px) / 1120)), 64px);
  font-weight: var(--xe-typography-display-lg-weight);
  line-height: clamp(28px, calc(28px + 36 * ((100vw - 320px) / 1120)), 64px);
  letter-spacing: var(--xe-typography-display-lg-letter-spacing);
  text-transform: var(--xe-typography-display-lg-text-transform);
  color: var(--xe-color-content-on-surface-on-surface-fixed-light);
  text-align: center;
  width: 100%;
  transform: translateY(var(--xe-typography-display-lg-vertical-align-offset));
}

/* ============================================
   MOBILE (< 1024px)
   ============================================ */

@media (max-width: 1024px) {
  .main {
    display: flex;
    flex-direction: column;
    gap: var(--xe-spacing-section-gap-lg);
    padding: var(--xe-spacing-content-inset-spacious) var(--xe-spacing-content-inset-cozy);
  }

  .banner {
    padding: var(--xe-spacing-content-inset-spacious);
  }

  .left-panel,
  .logo-copyright {
    width: 100%;
  }

  .left-panel {
    order: 0;
  }

  .columns {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0;
    order: 1;
  }

  .social-legal {
    width: 100%;
    order: 2;
  }

}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-footer-column/index.js
var xe_footer_column_default = i`/**
 * Footer Column Component CSS
 */

:host {
  display: block;
}

/* ============================================
   DESKTOP COLUMN
   ============================================ */

.column {
  display: flex;
  flex-direction: column;
  gap: var(--xe-spacing-stack-gap-md);
  align-items: flex-start;
  min-width: 0;
}

.heading {
  margin: 0;
}

.heading-text {
  font-family: var(--xe-typography-title-md-family);
  font-size: var(--xe-typography-title-md-size);
  font-weight: var(--xe-typography-title-md-weight);
  line-height: var(--xe-typography-title-md-line-height);
  letter-spacing: var(--xe-typography-title-md-letter-spacing);
  color: var(--xe-color-content-on-surface-light-fixed);
  text-transform: var(--xe-typography-title-md-text-transform);
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--xe-spacing-stack-gap-sm);
}

::slotted(li) {
  display: block;
  list-style: none;
  --xe-hyperlink-focus-color: var(--xe-color-content-on-surface-light-fixed);
}

/* ============================================
   MOBILE (< 1024px)
   ============================================ */

@media (max-width: 1024px) {
  :host {
    border-bottom: 1px solid var(--xe-color-content-on-surface-light-fixed);
    width: 100%;
  }

  xe-accordion {
    --xe-color-content-on-surface-on-surface: var(--xe-color-content-on-surface-light-fixed);
    --xe-color-content-on-surface-on-surface-variant: var(--xe-color-content-on-surface-light-fixed);
    --xe-color-interactive-overlay-hover: var(--xe-color-interactive-overlay-hover-inverse);
    --xe-color-interactive-overlay-pressed: var(--xe-color-interactive-overlay-pressed-inverse);
  }
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-hero/index.js
var xe_hero_default = i`/**
 * Hero Component CSS
 * Styles for hero section component using XE design tokens
 * For use in shadow DOM of xe-hero component
 */

:host {
  display: block;
  width: 100%;
}

/* Hero container */
.hero {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Responsive height (default) */
:host([height="responsive"]) .hero {
  aspect-ratio: 1440 / 660;
  min-height: auto;
}

/* Fixed heights */
:host([height="tall"]) .hero {
  height: 775px;
}

:host([height="standard"]) .hero {
  height: 600px;
}

:host([height="compact"]) .hero {
  height: 430px;
}

/* Background image */
.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  z-index: 0;
}

:host([image-position="center"]) .hero-image {
  background-position: center;
}

:host([image-position="top"]) .hero-image {
  background-position: top;
}

:host([image-position="bottom"]) .hero-image {
  background-position: bottom;
}

/* Dark overlay */
.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #00000052;
  z-index: 1;
}

/* Content container */
.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Center alignment */
:host([alignment="center"]) .hero-content {
  align-items: center;
  gap: var(--xe-spacing-inline-gap-md);
}

/* Left alignment */
:host([alignment="left"]) .hero-content {
  align-items: flex-start;
  gap: var(--xe-spacing-inline-gap-md);
  padding-left: var(--xe-spacing-content-inset-cozy);
  padding-right: var(--xe-spacing-content-inset-cozy);
}

/* Bottom center alignment */
:host([alignment="bottom-center"]) .hero {
  align-items: flex-end;
}

:host([alignment="bottom-center"]) .hero-content {
  align-items: center;
  gap: var(--xe-spacing-inline-gap-md);
  padding-bottom: var(--xe-spacing-content-inset-cozy);
  padding-left: var(--xe-spacing-content-inset-cozy);
  padding-right: var(--xe-spacing-content-inset-cozy);
}

/* Header (title + sublabel) */
.hero-header {
  display: flex;
  flex-direction: column;
  gap: var(--xe-spacing-inline-gap-md);
  width: 100%;
}

:host([alignment="center"]) .hero-header {
  align-items: center;
}

:host([alignment="left"]) .hero-header {
  align-items: flex-start;
}

:host([alignment="bottom-center"]) .hero-header {
  align-items: center;
}

/* Title - Default (Display/Medium for tall/standard/responsive) */
.hero-title {
  margin: 0;
  text-transform: uppercase;
  color: var(--xe-color-content-static-light);
  font-family: var(--xe-typography-display-md-family);
  font-size: var(--xe-typography-display-md-size);
  font-weight: var(--xe-typography-display-md-weight);
  line-height: var(--xe-typography-display-md-line-height);
  letter-spacing: var(--xe-typography-display-md-letter-spacing);
  width: 100%;
}

/* Title - Compact (Display/Small) */
:host([height="compact"]) .hero-title {
  font-family: var(--xe-typography-display-sm-family);
  font-size: var(--xe-typography-display-sm-size);
  font-weight: var(--xe-typography-display-sm-weight);
  line-height: var(--xe-typography-display-sm-line-height);
  letter-spacing: var(--xe-typography-display-sm-letter-spacing);
}

:host([alignment="center"]) .hero-title {
  text-align: center;
}

:host([alignment="left"]) .hero-title {
  text-align: left;
}

:host([alignment="bottom-center"]) .hero-title {
  text-align: center;
}

/* Sublabel - Body/Large */
.hero-sublabel {
  margin: 0;
  color: var(--xe-color-content-static-light);
  font-family: var(--xe-typography-body-lg-family);
  font-size: var(--xe-typography-body-lg-size);
  font-weight: var(--xe-typography-body-lg-weight);
  line-height: var(--xe-typography-body-lg-line-height);
  letter-spacing: var(--xe-typography-body-lg-letter-spacing);
}

/* Actions */
.hero-actions {
  display: flex;
  align-items: center;
  width: 100%;
}

:host([no-actions]) .hero-actions {
  display: none;
}

:host([alignment="center"]) .hero-actions {
  justify-content: center;
}

:host([alignment="left"]) .hero-actions {
  justify-content: flex-start;
}

:host([alignment="bottom-center"]) .hero-actions {
  justify-content: center;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-hyperlink/index.js
var xe_hyperlink_default = i`/**
 * Hyperlink Component CSS
 */

:host {
  display: block;
}

.hyperlink {
  display: inline-flex;
  align-items: center;
  width: 100%;
  gap: var(--xe-spacing-inline-gap-xs);
  font-family: var(--xe-typography-body-sm-family);
  font-size: var(--xe-hyperlink-font-size, var(--xe-typography-body-sm-size));
  font-weight: var(--xe-typography-body-sm-weight);
  line-height: var(--xe-typography-body-sm-line-height);
  letter-spacing: var(--xe-typography-body-sm-letter-spacing);
  color: var(--xe-color-content-on-surface-on-surface-secondary);
  text-decoration: none;
  cursor: pointer;
  outline: none;
  border-radius: 2px;
}

.hyperlink:focus-visible {
  outline: 2px solid var(--xe-hyperlink-focus-color, var(--xe-color-content-on-surface-on-surface));
  outline-offset: 2px;
}

:host([variant="variant"]) .hyperlink {
  color: var(--xe-color-content-on-surface-on-surface-fixed-light);
}

.hyperlink:hover {
  text-decoration: underline;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-icon/index.js
var xe_icon_default = i`/**
 * Icon Component CSS
 * Styles for xe-icon using XE design tokens
 * For use in shadow DOM of xe-icon component
 *
 * Responsive override: set --xe-icon-size on the host element from outside
 * to override the size attribute (CSS custom properties inherit into shadow DOM).
 * Example: xe-icon { --xe-icon-size: 20px; }
 */

:host {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
  --_size: var(--xe-icon-size, 24px);
  width: var(--_size);
  height: var(--_size);
}

:host([size="xxs"]) { --_size: var(--xe-icon-size, 12px); }
:host([size="xs"])  { --_size: var(--xe-icon-size, 16px); }
:host([size="sm"])  { --_size: var(--xe-icon-size, 20px); }
:host([size="lg"])  { --_size: var(--xe-icon-size, 32px); }
:host([size="xl"])  { --_size: var(--xe-icon-size, 40px); }
:host([size="2xl"]) { --_size: var(--xe-icon-size, 48px); }

svg {
  display: block;
  fill: currentColor;
  width: calc(var(--_size) - var(--xe-icon-glyph-offset, 0px));
  height: calc(var(--_size) - var(--xe-icon-glyph-offset, 0px));
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-icon-button/index.js
var xe_icon_button_default = i`/**
 * XE Icon Button Styles
 * Generated from design tokens
 *
 * Structure: button > container > state-layer > slotted icon
 * Container is fixed at 48x48px; icon is centered via flexbox.
 */

:host {
  display: inline-flex;
}

/* Button/link wrapper - no intrinsic size, adapts to content */
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  text-decoration: none;
  color: var(--xe-icon-button-color, var(--xe-color-content-on-surface-on-surface-variant));
  transition: color 200ms ease;
}

.icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.38;
}

.icon-button:focus {
  outline: none;
}

.icon-button:focus-visible .icon-button-container {
  outline: 2px solid var(--xe-icon-button-focus-color, var(--xe-color-content-on-surface-on-surface));
  outline-offset: 0;
}

/* Container - provides background */
.icon-button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--xe-radius-interactive);
  background-color: transparent;
  overflow: hidden;
  box-sizing: border-box;
  width: 48px;
  height: 48px;
}

/* Icon fills its declared size with no glyph shrink inside a button */
.icon-button-state-layer ::slotted(xe-icon) {
  --xe-icon-glyph-offset: 0px;
}

/* State layer - handles hover/pressed overlays */
.icon-button-state-layer {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: background-color 200ms ease;
}

.icon-button:hover:not(:disabled) .icon-button-state-layer {
  background-color: var(--xe-states-hover);
}

.icon-button:active:not(:disabled) .icon-button-state-layer {
  background-color: var(--xe-states-pressed);
}

/* Fill treatment */
.icon-button.filled {
  color: var(--xe-color-content-on-primary-on-primary);
}

.icon-button.filled .icon-button-container {
  background-color: var(--xe-color-brand-primary);
}

.icon-button.filled:disabled {
  opacity: 1;
}

.icon-button.filled:disabled .icon-button-container {
  background-color: var(--xe-states-pressed);
}

.icon-button.filled:disabled .icon-button-state-layer {
  opacity: 0.38;
}

/* Outline treatment */
.icon-button.outlined {
  color: var(--xe-color-content-on-surface-on-surface-variant);
}

.icon-button.outlined .icon-button-container {
  box-shadow: inset 0 0 0 1px var(--xe-color-content-on-surface-on-surface-variant);
}

.icon-button.outlined:disabled .icon-button-container {
  box-shadow: inset 0 0 0 1px var(--xe-states-pressed);
}

.icon-button.outlined:disabled .icon-button-state-layer {
  opacity: 0.38;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-logo/index.js
var xe_logo_default = i`/**
 * Logo Component CSS
 * Styles for logo component using XE design tokens
 * For use in shadow DOM of xe-logo component
 */

:host {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
}

/* Anchor wrapper when href is provided */
a {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

/* Logo container */
.logo {
  display: inline-flex;
  align-items: center;
  color: var(--xe-color-brand-primary-bright);
}

/* Color variants */
.logo.primary {
  color: var(--xe-color-brand-primary-bright);
}

.logo.inverse {
  color: #FFFFFF;
}

/* SVG sizing — height drives the size, width scales proportionally */
.logo svg,
.logo img {
  display: block;
  height: 40px;
  width: auto;
}

.logo.sm svg,
.logo.sm img {
  height: 32px;
}

.logo.md svg,
.logo.md img {
  height: 40px;
}

.logo.lg svg,
.logo.lg img {
  height: 48px;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-menu/index.js
var xe_menu_default = i`/**
 * Menu Component CSS
 * Styles for menu container using XE design tokens
 * For use in shadow DOM of xe-menu component
 */

:host {
  display: inline-block;
  width: 100%;
  --xe-menu-radius: var(--xe-radius-radius-sm);
}

/* Menu container */
.menu {
  display: flex;
  flex-direction: column;
  border-radius: var(--xe-radius-radius-sm);
  overflow: visible;
  position: relative;
}

/* Filled style - default with background and elevation */
.menu.filled {
  background-color: var(--xe-color-surface-base);
  box-shadow: var(--xe-effect-elevation-level-3);
}

/* Clip the background to rounded corners while allowing nested menus to overflow */
.menu::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background-color: inherit;
  z-index: -1;
}

/* Transparent style - no background or elevation */
.menu.transparent {
  background-color: transparent;
  box-shadow: none;
}

/* Default slot for menu items */
::slotted(xe-menu-item) {
  display: block;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-menu-button/index.js
var xe_menu_button_default = i`/**
 * Menu Button Component CSS
 * Layout styles for xe-menu-button.
 * For use in shadow DOM of xe-menu-button component.
 */

:host {
  position: relative;
  display: inline-block;
}

.backdrop {
  position: fixed;
  inset: 0;
  z-index: 999;
}

.menu-button {
  position: relative;
  display: inline-flex;
}

.menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 1000;
  min-width: 100%;
  animation: menu-open 0.15s ease;
}

.menu.align-end {
  left: auto;
  right: 0;
}

@keyframes menu-open {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-menu-item/index.js
var xe_menu_item_default = i`/**
 * Menu Item Component CSS
 * Styles for menu item using XE design tokens
 * For use in shadow DOM of xe-menu-item component
 */

:host {
  display: block;
  position: relative;
}

/* Menu item wrapper for nested submenu positioning */
.menu-item-wrapper {
  position: relative;
  display: block;
}

/* Menu item container */
.menu-item {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  color: var(--xe-color-content-on-surface-on-surface);
  outline: none;
}

.menu-item:focus-visible {
  outline: 2px solid var(--xe-color-content-on-surface-on-surface);
  outline-offset: -2px;
}

.menu-item[aria-disabled="true"] {
  cursor: not-allowed;
  opacity: 0.38;
}

/* State layer for hover/pressed states */
.menu-item-state-layer {
  display: flex;
  flex-direction: column;
  transition: background-color 200ms ease;
}

:host(:first-child) .menu-item-state-layer {
  border-radius: var(--xe-menu-radius, 0) var(--xe-menu-radius, 0) 0 0;
}

:host(:last-child) .menu-item-state-layer {
  border-radius: 0 0 var(--xe-menu-radius, 0) var(--xe-menu-radius, 0);
}

.menu-item:hover:not([aria-disabled="true"]):not(.selected) .menu-item-state-layer {
  background-color: var(--xe-color-surface-container-lowest);
}

.menu-item:active:not([aria-disabled="true"]) .menu-item-state-layer {
  background-color: var(--xe-color-surface-container-base);
}

.menu-item.selected .menu-item-state-layer {
  background-color: var(--xe-color-surface-container-base);
}

/* Content wrapper */
.menu-item-content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: var(--xe-spacing-inline-gap-sm);
  padding: var(--xe-spacing-content-inset-cozy);
}

:host([align="center"]) .menu-item-content {
  justify-content: center;
}

/* Labels container */
.menu-item-labels {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

/* Main label */
.menu-item-label {
  font-family: var(--xe-typography-label-sm-family);
  font-size: var(--xe-typography-label-sm-size);
  font-weight: 400;
  line-height: var(--xe-typography-label-sm-line-height);
  letter-spacing: var(--xe-typography-label-sm-letter-spacing);
  color: var(--xe-color-content-on-surface-on-surface);
}

/* Sublabel */
.menu-item-sublabel {
  font-family: var(--xe-typography-body-xs-family);
  font-size: var(--xe-typography-body-xs-size);
  font-weight: var(--xe-typography-body-xs-weight);
  line-height: var(--xe-typography-body-xs-line-height);
  color: var(--xe-color-content-on-surface-variant);
}

/* Icon slots */
::slotted([slot="leading-icon"]),
::slotted([slot="trailing-icon"]) {
  flex-shrink: 0;
  color: var(--xe-color-content-on-surface-variant);
}

/* Divider */
.menu-item-divider {
  height: 1px;
  width: 100%;
  background-color: var(--xe-color-border-variant);
}

/* Submenu indicator for nested items */
.menu-item.has-submenu xe-icon {
  margin-left: auto;
  color: var(--xe-color-content-on-surface-variant);
  transition: transform 200ms ease;
}

/* Nested submenu container */
.nested-submenu {
  position: absolute;
  top: 0;
  left: 100%;
  margin-left: 4px;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-8px);
  transition: opacity 200ms ease, transform 200ms ease, visibility 0s 200ms;
  z-index: 1001;
  min-width: 200px;
}

.nested-submenu.open {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
  transition: opacity 200ms ease, transform 200ms ease;
}

.nested-submenu:not(.open) {
  pointer-events: none;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-nav-drawer/index.js
var xe_nav_drawer_default = i`/**
 * Nav Drawer Component CSS
 * Styles for the mobile navigation drawer using XE design tokens
 * For use in shadow DOM of xe-nav-drawer component
 */

:host {
  display: contents;
}


/* Drawer panel */
.drawer {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 350px;
  max-width: 90vw;
  background: var(--xe-color-surface-base);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0px 8px 3px rgba(0, 0, 0, 0.15), 2px 0px 3px 0px rgba(0, 0, 0, 0.3);
  animation: slideInLeft 300ms ease forwards;
}

.drawer.closing {
  animation: slideOutLeft 300ms ease forwards;
}

@keyframes slideInLeft {
  from { transform: translateX(-100%); }
  to   { transform: translateX(0); }
}

@keyframes slideOutLeft {
  from { transform: translateX(0); }
  to   { transform: translateX(-100%); }
}

/* Main header — logo + optional back + close button */
.drawer-header {
  display: flex;
  align-items: center;
  gap: var(--xe-spacing-inline-gap-md);
  padding: var(--xe-spacing-content-inset-cozy) var(--xe-spacing-content-inset-comfortable);
  flex-shrink: 0;
}

.drawer-header-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.drawer-header xe-icon-button {
  flex-shrink: 0;
  align-self: center;
}

/* Optional supporting header — secondary actions below main header */
.drawer-supporting-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--xe-spacing-content-inset-cozy) var(--xe-spacing-content-inset-cozy);
  flex-shrink: 0;
}

/* Divider */
.drawer-divider {
  height: 1px;
  background: var(--xe-color-border-subtle);
  flex-shrink: 0;
}

/* Header title shown in place of logo during drill-down */
.drawer-header-title {
  font-family: var(--xe-typography-label-md-family);
  font-size: var(--xe-typography-label-md-size);
  font-weight: var(--xe-typography-label-md-weight);
  line-height: var(--xe-typography-label-md-line-height);
  color: var(--xe-color-content-on-surface-on-surface);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Slide-panel nav */
.nav-viewport {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.nav-track {
  display: flex;
  flex-direction: row;
  height: 100%;
  transform: translateX(0);
}

.nav-panel {
  flex: 0 0 100%;
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: var(--xe-spacing-content-inset-compact, 8px) 0;
}

.nav-panel ::slotted(*) {
  display: flex;
  flex-direction: column;
}

/* Supporting header actions — sits above nav items */
.drawer-actions[hidden],
.drawer-actions[inert] {
  display: none;
}

.drawer-actions {
  padding: var(--xe-spacing-content-inset-compact) var(--xe-spacing-content-inset-cozy) var(--xe-spacing-content-inset-compact) var(--xe-spacing-content-inset-cozy);
  flex-shrink: 0;
}

.drawer-actions ::slotted(*) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

/* Selector row — full-width content below actions (e.g. segmented button) */
.drawer-selector[hidden],
.drawer-selector[inert] {
  display: none;
}

.drawer-selector {
  display: flex;
  width: 100%;
  box-sizing: border-box;
  padding: var(--xe-spacing-content-inset-compact) var(--xe-spacing-content-inset-cozy) var(--xe-spacing-content-inset-cozy);
  flex-shrink: 0;
}


@media (max-width: 480px) {
  .drawer {
    width: 100vw;
    max-width: 100vw;
  }
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-nav-drawer-item/index.js
var xe_nav_drawer_item_default = i`/**
 * Nav Drawer Item Component CSS
 * Styles for individual navigation items within xe-nav-drawer
 * For use in shadow DOM of xe-nav-drawer-item component
 */

:host {
  display: block;
}

.item {
  display: flex;
  align-items: center;
  gap: var(--xe-spacing-inline-gap-md);
  padding: var(--xe-spacing-content-inset-cozy);
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 200ms ease;
}

.item:hover {
  background: var(--xe-color-surface-container-lowest);
}

.item:active {
  background: var(--xe-color-surface-container-base);
}

.item:focus-visible {
  outline: 2px solid var(--xe-color-content-on-surface-on-surface);
  outline-offset: -2px;
}

/* Leading icon slot */
.item-leading-icon[hidden] {
  display: none;
}

.item-leading-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--xe-color-content-on-surface-variant);
}

/* Labels */
.item-labels {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.item-label {
  font-family: var(--xe-typography-label-sm-family);
  font-size: var(--xe-typography-label-sm-size);
  font-weight: var(--xe-typography-label-sm-weight);
  line-height: var(--xe-typography-label-sm-line-height);
  letter-spacing: var(--xe-typography-label-sm-letter-spacing);
  color: var(--xe-color-content-on-surface-on-surface);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-sublabel {
  font-family: var(--xe-typography-body-xs-family);
  font-size: var(--xe-typography-body-xs-size);
  font-weight: var(--xe-typography-body-xs-weight);
  line-height: var(--xe-typography-body-xs-line-height);
  letter-spacing: var(--xe-typography-body-xs-letter-spacing);
  color: var(--xe-color-content-on-surface-variant);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Trailing chevron icon */
.item-trailing-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: var(--xe-color-content-on-surface-variant);
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-nav-item/index.js
var xe_nav_item_default = i`/**
 * Nav Item Component CSS
 * Styles for navigation items using XE design tokens
 * For use in shadow DOM of xe-nav-item component
 */

:host {
  display: inline-flex;
  position: relative;
}

/* Nav item wrapper for positioning submenu */
.nav-item-wrapper {
  position: relative;
  display: inline-flex;
}

/* Base nav item styles */
.nav-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--xe-spacing-content-inset-compact);
  padding: var(--xe-spacing-content-inset-compact) var(--xe-spacing-content-inset-cozy);
  background-color: transparent;
  border: none;
  border-radius: var(--xe-radius-interactive);
  color: var(--xe-nav-item-content-color, var(--xe-color-content-on-surface-on-surface));
  font-family: var(--xe-typography-label-sm-family);
  font-size: var(--xe-typography-label-sm-size);
  font-weight: var(--xe-typography-label-sm-weight);
  line-height: var(--xe-typography-label-sm-line-height);
  letter-spacing: var(--xe-typography-label-sm-letter-spacing);
  text-transform: var(--xe-typography-label-sm-text-transform);
  text-decoration: none;
  cursor: pointer;
  transition: background-color 200ms ease;
  white-space: nowrap;
}

/* Hover state */
.nav-item:hover {
  background-color: var(--xe-nav-item-hover-bg, var(--xe-color-surface-container-lowest));
}

/* Pressed/Active state */
.nav-item:active,
.nav-item.active {
  background-color: var(--xe-nav-item-pressed-bg, var(--xe-color-surface-container-base));
}

/* Focus styles */
.nav-item:focus {
  outline: none;
}

.nav-item:focus-visible {
  outline: 2px solid var(--xe-color-content-on-surface-on-surface);
  outline-offset: 4px;
}

/* Content theme overrides for overlay navbar */
.content-theme-light {
  color: var(--xe-color-neutral-white);
}

.content-theme-light:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.content-theme-light:active,
.content-theme-light.active {
  background-color: rgba(255, 255, 255, 0.12);
}

.content-theme-dark {
  color: var(--xe-color-content-on-surface-on-surface);
}

.content-theme-dark:hover {
  background-color: var(--xe-color-surface-container-lowest);
}

/* Submenu indicator icon */
.nav-item.has-submenu {
  padding-right: var(--xe-spacing-content-inset-cozy);
}

.nav-item.has-submenu xe-icon {
  margin-left: 4px;
  color: var(--xe-nav-item-content-color, var(--xe-color-content-on-surface-variant));
}

/* Submenu container */
.submenu-container {
  position: absolute;
  top: 100%; /* overridden by JS to align with navbar bottom */
  left: 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-8px);
  transition: opacity 200ms ease, transform 200ms ease, visibility 0s 200ms;
  z-index: 1000;
  min-width: 200px;
}

.submenu-container.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  transition: opacity 200ms ease, transform 200ms ease;
}

/* Hide empty submenu slot */
.submenu-container:not(.open) {
  pointer-events: none;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-navbar/index.js
var xe_navbar_default = i`/**
 * Navbar Component CSS
 * For use in the shadow DOM of xe-navbar.
 *
 * Flex layout (left to right):
 *   [hamburger?] [logo] [nav-items?] →auto← [navbar-right: search? | actions]
 *
 * An optional toolbar row sits above the navbar row.
 */

:host {
  display: block;
  position: relative;
  z-index: 1;
  background-color: var(--xe-color-surface-base);
  --navbar-gap: var(--xe-spacing-inline-gap-xl);
  --navbar-actions-gap: var(--xe-spacing-inline-gap-md);
  box-shadow: var(--xe-effect-elevation-level-1);
}

:host([sticky]) {
  position: sticky;
  top: 0;
  z-index: 1000;
}

/* hero-overlay: toolbar stays in flow; .navbar row floats absolutely over following content */
:host([hero-overlay]) {
  box-shadow: none;
  position: relative;
  overflow: visible;
  background-color: transparent;
  --xe-nav-item-content-color: var(--xe-color-content-on-surface-on-surface-fixed-light);
  --xe-nav-item-hover-bg: var(--xe-color-interactive-overlay-hover-inverse);
  --xe-nav-item-pressed-bg: var(--xe-color-interactive-overlay-pressed-inverse);
}

:host([hero-overlay]) .navbar-hamburger {
  --xe-icon-button-color: var(--xe-color-content-on-surface-on-surface-fixed-light);
}

:host([hero-overlay][sticky]) {
  position: sticky;
}

:host([hero-overlay]) .navbar {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: transparent;
  box-shadow: none;
  transition: background-color 0.3s ease;
}

:host([hero-overlay][scrolled]) .navbar {
  background-color: var(--navbar-overlay-bg);
}

/* Once opacity threshold is crossed: lock to token color, restore elevation, revert nav item colors */
:host([hero-overlay][navbar-opaque]) {
  --xe-nav-item-content-color: initial;
  --xe-nav-item-hover-bg: initial;
  --xe-nav-item-pressed-bg: initial;
}

:host([hero-overlay][navbar-opaque]) .navbar-hamburger {
  --xe-icon-button-color: initial;
}

:host([hero-overlay][navbar-opaque]) .navbar {
  background-color: var(--xe-color-surface-base);
  box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.10);
}

:host([hero-overlay][navbar-opaque]) .toolbar {
  border-bottom: 1px solid var(--xe-color-border-neutral);
}

/* ─── Toolbar ─────────────────────────────────────────────────────────────────
 * Optional row above the main navbar. Hidden unless [has-toolbar] is set.
 * Contains toolbar-selector (left) and toolbar-actions + secondary-toolbar-actions (right).
 */

.toolbar {
  display: none;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 6px 20px;
  background-color: var(--xe-color-surface-container-lowest);

  @media (max-width: 400px) {
    padding-inline: 6px;
  }
}

.toolbar.has-toolbar {
  display: flex;
}

:host([toolbar-variant="base"]) .toolbar {
  background-color: var(--xe-color-surface-base);
}

.toolbar-start,
.toolbar-end {
  display: flex;
  align-items: center;
}

.toolbar-end {
  gap: var(--xe-spacing-inline-gap-lg);
}

.toolbar-end-links {
  display: flex;
  align-items: center;
  gap: var(--xe-spacing-inline-gap-md);
}

.toolbar-end-actions {
  display: flex;
  align-items: center;
  gap: var(--xe-spacing-inline-gap-sm);
}

.toolbar-start ::slotted(*),
.toolbar-end-links ::slotted(*),
.toolbar-end-actions ::slotted(*) {
  display: flex;
  align-items: center;
}

.toolbar-end-links ::slotted(*) {
  gap: var(--xe-spacing-inline-gap-md);
  --xe-hyperlink-font-size: 14px;
}

.toolbar-end-actions ::slotted(*) {
  gap: var(--xe-spacing-inline-gap-sm);
}


/* ─── Navbar row ──────────────────────────────────────────────────────────────
 * Main horizontal flex row. Gap (--navbar-gap, 32px) applies between all direct
 * children: hamburger, logo, nav-items, and navbar-right.
 */

.navbar {
  display: flex;
  align-items: center;
  padding: var(--xe-spacing-content-inset-cozy) var(--xe-spacing-content-inset-spacious);
  background-color: var(--xe-color-surface-base);
  gap: var(--navbar-gap);
}

/* ─── Hamburger ───────────────────────────────────────────────────────────────
 * Conditionally rendered by xe-navbar.ts — only present when nav is collapsed.
 */

.navbar-hamburger {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* ─── Logo ────────────────────────────────────────────────────────────────────
 * Always visible. Consumer decides what to render here.
 */

.navbar-logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.navbar-logo ::slotted(*) {
  display: flex;
  align-items: center;
}

/* ─── Nav items ───────────────────────────────────────────────────────────────
 * Conditionally rendered by xe-navbar.ts — removed from DOM when collapsed.
 * Not hidden with CSS; the element is not present when nav is collapsed.
 */

.navbar-nav-items {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  white-space: nowrap;
}

.navbar-nav-items ::slotted(*) {
  display: flex;
  align-items: center;
  gap: var(--xe-spacing-inline-gap-sm);
  flex-wrap: nowrap;
  min-width: 0;
}

/* ─── Right group ─────────────────────────────────────────────────────────────
 * Wrapper around search + actions. Pushed to the right edge via margin-left: auto.
 * The gap inside this wrapper (--navbar-actions-gap, 24px) is independent of the
 * outer navbar gap (--navbar-gap, 32px) — giving search↔actions its own spacing.
 *
 * When search expands inline, this wrapper grows leftward as the auto margin shrinks.
 */

.navbar-right {
  display: flex;
  align-items: center;
  gap: var(--navbar-actions-gap);
  flex-shrink: 0;
  margin-left: auto;
  min-width: 0;
}

/* ─── Search ──────────────────────────────────────────────────────────────────
 * Dedicated slot for xe-search-bar[collapsed]. Always in the DOM so slotchange
 * fires correctly, but hidden via display:none when no content is assigned.
 */

.navbar-search {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: 0;
}

.navbar-search.no-search {
  display: none;
}

/* ─── Actions ─────────────────────────────────────────────────────────────────
 * Right-aligned action items (icon buttons, language selector, etc.).
 * Always naturally sized — no flex-grow needed; the wrapper handles alignment.
 */

.navbar-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-width: 0;
}

.navbar-actions ::slotted(*) {
  display: flex;
  align-items: center;
  gap: var(--xe-spacing-inline-gap-lg);
  min-width: 0;
}

/* data-navbar-only: visible in navbar, never forwarded to drawer */
/* data-drawer-only: hidden in navbar at all times, forwarded to drawer on mobile */
/* data-collapse-to-drawer: visible in navbar on desktop, hidden when collapsed, forwarded to drawer */
.navbar-actions ::slotted([data-drawer-only]),
.toolbar-end ::slotted([data-drawer-only]) {
  display: none;
}

:host([nav-collapsed]) .navbar-actions ::slotted([data-collapse-to-drawer]),
:host([nav-collapsed]) .toolbar-end ::slotted([data-collapse-to-drawer]) {
  display: none;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-promo/index.js
var xe_promo_default = i`/**
 * Promo Composition CSS
 * Two-column layout: editorial content left, media slot right.
 */

:host {
  display: block;
  overflow: hidden;
  background-color: var(--xe-color-surface-base);
}

:host([background="subtle"]) {
  background-color: var(--xe-color-surface-container-base);
}

:host([background="muted"]) {
  background-color: var(--xe-color-surface-container-lowest);
}

.promo {
  position: relative;
  isolation: isolate;
  max-width: 1440px;
  margin: 0 auto;
  min-height: 715px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.promo-background {
  position: absolute;
  inset: 84px 0;
  pointer-events: none;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.promo-background ::slotted(img) {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

@media (prefers-color-scheme: dark) {
  .promo-background ::slotted(img) {
    filter: invert(1);
  }
}

:host-context([data-theme="dark"]) .promo-background ::slotted(img) {
  filter: invert(1);
}

/* TODO: padding-vertical (84px), padding-horizontal (274px), and the 600px mobile
   breakpoint are hardcoded from Figma and need to be standardized as role tokens. */
.promo-grid {
  position: relative;
  z-index: 1;
  padding: 0 var(--xe-spacing-content-inset-spacious);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: var(--xe-spacing-inline-gap-3xl);
  align-items: center;
}

@media (min-width: 600px) {
  .promo-grid {
    padding-left: clamp(var(--xe-spacing-content-inset-spacious), 19vw, 200px);
    padding-right: clamp(var(--xe-spacing-content-inset-spacious), 19vw, 200px);
  }
}

.promo-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--xe-spacing-stack-gap-xl);
  color: var(--xe-color-content-on-surface-on-surface);
  max-width: 490px;
}

.promo-title {
  margin: 0;
  font-family: var(--xe-typography-display-sm-family);
  font-size: var(--xe-typography-display-sm-size);
  font-weight: var(--xe-typography-display-sm-weight);
  line-height: var(--xe-typography-display-sm-line-height);
  letter-spacing: var(--xe-typography-display-sm-letter-spacing);
  text-transform: var(--xe-typography-display-sm-text-transform);
  color: var(--xe-color-content-on-surface-on-surface);
}

.promo-media {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

/* TODO: aspect-ratio 472/518 and border-radius 20px are hardcoded from Figma */
.promo-media ::slotted(img),
.promo-media ::slotted(video) {
  display: block;
  width: 100%;
  max-width: 472px;
  height: auto;
  aspect-ratio: 472 / 518;
  border-radius: 20px;
}

/* TODO: mobile min-height and padding-vertical should be standardized as tokens */
@media (max-width: 768px) {
  .promo {
    min-height: 0;
  }

  .promo-grid {
    grid-template-columns: 1fr;
    padding-block: 64px;
  }

  .promo-background {
    left: var(--xe-spacing-content-inset-spacious);
    right: var(--xe-spacing-content-inset-spacious);
  }

  .promo-content {
    align-items: center;
    text-align: center;
  }

  ::slotted([slot="actions"]) {
    display: flex;
    justify-content: center;
  }

  :host([hide-media-on-mobile]) .promo-media {
    display: none;
  }
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-quick-actions/index.js
var xe_quick_actions_default = i`/**
 * Quick Actions Composition CSS
 * Responsive card grid with count-driven layout variants (3-up, 4-up, 5-up).
 */

:host {
  display: block;
  background-color: var(--xe-color-surface-base);

  --card-title-color: var(--xe-color-brand-primary);
  --card-icon-color: var(--xe-color-brand-primary);
  --card-icon-to-title-gap: var(--xe-spacing-inline-gap-sm);
}

:host([background="subtle"]) {
  background-color: var(--xe-color-surface-container-base);
}

:host([background="muted"]) {
  background-color: var(--xe-color-surface-container-lowest);
}

.quick-actions {
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--xe-spacing-content-inset-spacious) var(--xe-spacing-content-inset-spacious);
}

/* ============================================
   GRID LAYOUTS — set via .grid--{n} class
   applied by slotchange listener
   ============================================ */

.grid {
  display: grid;
  gap: var(--xe-spacing-layout-gap-2xl);
}

/* 3-up: single row, equal-width columns */
.grid--3 {
  grid-template-columns: repeat(3, 1fr);
}

/* 4-up: 2×2 */
.grid--4 {
  grid-template-columns: repeat(2, 1fr);
}

/* 5-up: 3-col top row; row 2 = 1-col + 2-col span */
.grid--5 {
  grid-template-columns: repeat(3, 1fr);
}

.grid--5 ::slotted(:nth-child(4)) {
  grid-column: 1;
}

.grid--5 ::slotted(:nth-child(5)) {
  grid-column: 2 / span 2;
}

/* ============================================
   MOBILE
   ============================================ */

@media (max-width: 768px) {
  /* 3-up mobile: single full-width column */
  .grid--3 {
    grid-template-columns: 1fr;
  }

  /* 4-up mobile: 2×2 (unchanged) */

  /* 5-up mobile: 2×2 for first 4, card 5 full-width */
  .grid--5 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid--5 ::slotted(:nth-child(4)) {
    grid-column: auto;
  }

  .grid--5 ::slotted(:nth-child(5)) {
    grid-column: 1 / -1;
  }
}

@media (max-width: 599px) {
  /* All layouts collapse to single column at mobile */
  .grid--4,
  .grid--5 {
    grid-template-columns: 1fr;
  }

  .grid--5 ::slotted(:nth-child(5)) {
    grid-column: auto;
  }
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-radio-tile/index.js
var xe_radio_tile_default = i`:host {
  display: flex;
  box-sizing: border-box;
}

:host([disabled]) {
  cursor: not-allowed;
}

.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-style: solid;
  border-radius: var(--xe-radius-radius-sm);
  border-width: var(--xe-border-width-border-sm);
  border-color: var(--xe-color-border-subtle);
  background-color: var(--xe-color-surface-base);
  color: var(--xe-color-content-on-surface-on-surface-variant);
  cursor: pointer;
  box-sizing: border-box;
  overflow: hidden;
  transition: border-color 150ms ease, background-color 150ms ease;
}

:host([selected]) .tile {
  border-width: var(--xe-border-width-border-md);
  border-color: var(--xe-color-border-primary);
  background-color: var(--xe-color-surface-container-lowest);
  color: var(--xe-color-content-on-surface-on-surface);
}

:host([disabled]) .tile {
  border-width: var(--xe-border-width-border-sm);
  border-color: var(--xe-color-border-neutral);
  background-color: var(--xe-color-interactive-surface-disabled);
  color: var(--xe-color-content-disabled);
  cursor: not-allowed;
}

.tile:focus {
  outline: none;
}

.tile:focus-visible {
  outline: 2px solid var(--xe-color-content-on-surface-on-surface);
  outline-offset: -2px;
}

.state-layer {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--xe-spacing-stack-gap-lg);
  padding: var(--xe-spacing-content-inset-cozy);
  width: 100%;
  box-sizing: border-box;
  border-radius: var(--xe-radius-radius-sm);
  overflow: hidden;
}

.state-layer::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: transparent;
  pointer-events: none;
  transition: background-color 150ms ease;
}

:host(:not([selected]):not([disabled])) .tile:hover .state-layer::before {
  background-color: var(--xe-color-interactive-surface-hover);
}

:host(:not([selected]):not([disabled])) .tile:active .state-layer::before {
  background-color: var(--xe-color-interactive-surface-pressed);
}

.radio-indicator {
  position: absolute;
  top: var(--xe-spacing-content-inset-snug);
  right: var(--xe-spacing-content-inset-snug);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  color: var(--xe-color-border-default);
}

:host([selected]) .radio-indicator {
  color: var(--xe-color-border-primary);
}

:host([disabled]) .radio-indicator {
  opacity: 0.2;
}

.image-slot {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.image-slot ::slotted(*) {
  display: block;
  max-width: 100%;
  filter: var(--xe-radio-tile-image-filter, none);
}

:host([selected]) .image-slot ::slotted(*) {
  filter: var(--xe-radio-tile-image-filter-selected, var(--xe-radio-tile-image-filter, none));
}

@media (prefers-color-scheme: dark) {
  :host {
    --xe-radio-tile-image-filter: invert(1) brightness(0.7);
    --xe-radio-tile-image-filter-selected: invert(1);
  }
}

:host-context([data-theme="dark"]) {
  --xe-radio-tile-image-filter: invert(1) brightness(0.7);
  --xe-radio-tile-image-filter-selected: invert(1);
}

:host-context([data-theme="light"]) {
  --xe-radio-tile-image-filter: none;
  --xe-radio-tile-image-filter-selected: none;
}

.content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
}

.label {
  font-family: var(--xe-typography-label-md-family);
  font-size: var(--xe-typography-label-md-size);
  font-weight: var(--xe-typography-label-md-weight);
  line-height: var(--xe-typography-label-md-line-height);
  letter-spacing: var(--xe-typography-label-md-letter-spacing);
}

.sublabel {
  font-family: var(--xe-typography-body-sm-family);
  font-size: var(--xe-typography-body-sm-size);
  font-weight: var(--xe-typography-body-sm-weight);
  line-height: var(--xe-typography-body-sm-line-height);
  letter-spacing: var(--xe-typography-body-sm-letter-spacing);
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-radio-tile-group/index.js
var xe_radio_tile_group_default = i`:host {
  display: block;
  container-type: inline-size;
}

.group {
  display: grid;
  grid-template-columns: var(--xe-radio-tile-group-columns, repeat(auto-fill, minmax(160px, 1fr)));
  justify-content: var(--xe-radio-tile-group-justify-content, stretch);
  align-items: var(--xe-radio-tile-group-align-items, stretch);
  justify-items: var(--xe-radio-tile-group-justify-items, stretch);
  gap: var(--xe-spacing-layout-gap-md);
}

@container (max-width: 600px) {
  .group {
    grid-template-columns: var(--xe-radio-tile-group-columns-mobile, var(--xe-radio-tile-group-columns, repeat(auto-fill, minmax(160px, 1fr))));
  }
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-search-bar/index.js
var xe_search_bar_default = i`/**
 * Search Bar Component CSS
 * Uses CSS custom properties from design tokens
 */

/* ─── CSS Custom Properties from Tokens ─────────────────────────────── */
.search-container {
  --search-bar-radius: var(--xe-radius-rounded);
  --search-bar-border-color: var(--xe-color-content-on-surface-on-surface);
  --search-bar-text-color: var(--xe-color-content-on-surface-on-surface);
  --search-bar-icon-color: var(--xe-color-content-on-surface-variant);
  --search-bar-placeholder-color: var(--xe-color-content-on-surface-variant);
  --search-bar-bg-default: #00000000;
  --search-bar-bg-hover: var(--xe-color-surface-container-lowest);
  --search-bar-bg-pressed: var(--xe-color-surface-base);
  --search-bar-disabled-border: var(--xe-color-border-disabled);
  --search-bar-disabled-text: var(--xe-color-content-disabled);
  --search-bar-disabled-icon: var(--xe-color-content-disabled);
  --search-bar-padding: var(--xe-spacing-content-inset-snug);
  --search-bar-gap: 12px;
  --search-bar-icon-size: 20px;
  --search-bar-input-height: 20px;
}

/* ─── Host ───────────────────────────────────────────────────────────── */
:host {
  display: flex;
  width: 100%;
}


/* ─── Container (base) ───────────────────────────────────────────────── */
.search-container {
  display: flex;
  align-items: center;
  gap: var(--search-bar-gap);
  padding: var(--search-bar-padding);
  border: 1px solid var(--search-bar-border-color);
  border-radius: var(--search-bar-radius);
  background: var(--search-bar-bg-default);
  width: 100%;
  box-sizing: border-box;
  transition: background-color 0.2s ease;
}

.search-container:hover { background: var(--search-bar-bg-hover); }

:host(:not([collapsed][open])) .search-container:focus-within {
  background: var(--search-bar-bg-pressed);
}

:host([keyboard-focused]) .search-container {
  outline: 2px solid var(--xe-color-content-on-surface-on-surface);
  outline-offset: 2px;
}

/* ─── Search icon ────────────────────────────────────────────────────── */
.search-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--search-bar-icon-color);
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  outline: none;
}

/* ─── Input ──────────────────────────────────────────────────────────── */
input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  font-family: var(--bodylarge-fontface, 'Roboto', sans-serif);
  font-size: var(--bodylarge-fontsize, 16px);
  font-weight: var(--bodylarge-fontweight, 400);
  line-height: var(--bodylarge-lineheight, 24px);
  letter-spacing: var(--bodylarge-letterspacing, 0.25px);
  color: var(--search-bar-text-color);
  height: var(--search-bar-input-height);
  margin: 0;
  padding: 0;
}

input::placeholder { color: var(--search-bar-placeholder-color); }
input:disabled { cursor: not-allowed; color: var(--search-bar-disabled-text); }
input:disabled::placeholder { color: var(--search-bar-disabled-text); }

/* ─── Clear icon ─────────────────────────────────────────────────────── */
.clear-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--search-bar-icon-color);
  appearance: none;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.clear-icon.visible { opacity: 1; pointer-events: auto; }
.clear-icon:hover { color: var(--search-bar-text-color); }

/* ─── Disabled state ─────────────────────────────────────────────────── */
.search-container:has(input:disabled) { border-color: var(--search-bar-disabled-border); }

.search-container:has(input:disabled) .search-icon,
.search-container:has(input:disabled) .clear-icon {
  color: var(--search-bar-disabled-icon);
  cursor: not-allowed;
  pointer-events: none;
}

/* ─── Collapsed mode ─────────────────────────────────────────────────── */
/*
 * Host owns all sizing — transitions width only.
 * Container is always width: 100% and height: 48px.
 * Input uses max-width to grow/shrink smoothly without display toggling.
 */
:host([collapsed]) {
  width: 48px;
  transition: width 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

:host([collapsed]) .search-container {
  height: 48px;
  overflow: hidden;
  transition: background-color 200ms ease,
              border-color 200ms ease,
              padding 350ms cubic-bezier(0.4, 0, 0.2, 1),
              gap 350ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Icon fills its full size in search bar — no glyph shrink in either state */
:host([collapsed]) .search-icon {
  --xe-icon-glyph-offset: 0px;
}

/* Closed: icon-button appearance */
:host([collapsed]:not([open])) .search-container {
  padding: 0;
  gap: 0;
  background: transparent;
  border-color: var(--search-bar-border-color);
  justify-content: center;
  cursor: pointer;
}

:host([collapsed]:not([open])) .search-container:hover {
  background: var(--xe-states-hover);
}


/* Input collapses via max-width so it stays in DOM and transitions smoothly */
:host([collapsed]) input {
  max-width: 0;
  opacity: 0;
  pointer-events: none;
  transition: max-width 350ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 200ms ease;
}

:host([collapsed]:not([open])) .clear-icon {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

/* Open: full search bar */
:host([collapsed][open]) {
  width: 280px;
}

:host([collapsed][open]) .search-container {
  padding: var(--search-bar-padding);
  gap: var(--search-bar-gap);
  background: var(--search-bar-bg-default);
  border-color: var(--search-bar-border-color);
  justify-content: flex-start;
  cursor: default;
}

:host([collapsed][open]) .search-container:hover {
  background: var(--search-bar-bg-hover);
}

:host([collapsed][open]) input {
  max-width: 999px;
  opacity: 1;
  pointer-events: auto;
  transition: max-width 350ms cubic-bezier(0.4, 0, 0.2, 1),
              opacity 250ms ease 150ms;
}

:host([collapsed][open]) .clear-icon {
  max-width: 2rem;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-search-delegate/index.js
var xe_search_delegate_default = i`/**
 * Search Delegate Component CSS
 * Full-screen search overlay using XE design tokens.
 * Opens from top on both mobile and desktop when inline search cannot fit.
 * For use in shadow DOM of xe-search-delegate component.
 */

:host {
  display: contents;
}

/* Backdrop overlay */
.overlay {
  position: fixed;
  inset: 0;
  background: {{overlay.background}};
  z-index: 1099;
  animation: fadeIn 300ms ease forwards;
}

/* Search panel — slides in from the right, fills full viewport height */
.panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  background: var(--xe-color-surface-base);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.15);
  animation: slideInRight 300ms ease forwards;
}

@keyframes slideInRight {
  from { transform: translateX(100%); }
  to   { transform: translateX(0); }
}

@keyframes slideOutRight {
  from { transform: translateX(0); }
  to   { transform: translateX(100%); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}

.panel.closing {
  animation: slideOutRight 300ms ease forwards;
}

.overlay.closing {
  animation: fadeOut 300ms ease forwards;
}

/* Header row — back button + search input row */
.panel-header {
  display: flex;
  align-items: center;
  gap: var(--xe-spacing-inline-gap-md);
  padding: var(--xe-spacing-content-inset-cozy) var(--xe-spacing-content-inset-cozy);
  flex-shrink: 0;
  /* Constrain width on large screens so content aligns with a typical navbar */
  width: 100%;
  box-sizing: border-box;
  max-width: 1312px;
  margin: 0 auto;
}

/* Search input row — matches xe-search-bar expanded appearance */
.search-input-row {
  flex: 1;
  display: flex;
  align-items: center;
  gap: var(--xe-spacing-inline-gap-md);
  padding: var(--xe-spacing-content-inset-cozy);
  height: 56px;
  border: 1px solid var(--xe-color-content-on-surface-variant);
  border-radius: var(--xe-radius-round);
  background: var(--xe-color-surface-container-lowest);
  box-sizing: border-box;
  min-width: 0;
}

.search-icon {
  flex-shrink: 0;
  color: var(--xe-color-content-on-surface-variant);
}

:host([keyboard-focused]) .search-input-row {
  outline: 2px solid var(--xe-color-content-on-surface-on-surface);
  outline-offset: 3px;
}

input {
  flex: 1;
  min-width: 0;
  border: none;
  background: transparent;
  outline: none;
  font-family: var(--bodylarge-fontface, 'Roboto', sans-serif);
  font-size: var(--bodylarge-fontsize, 16px);
  font-weight: var(--bodylarge-fontweight, 400);
  line-height: var(--bodylarge-lineheight, 24px);
  letter-spacing: var(--bodylarge-letterspacing, 0.25px);
  color: var(--xe-color-content-on-surface-on-surface);
  margin: 0;
  padding: 0;
}

input::placeholder {
  color: var(--xe-color-content-on-surface-variant);
}

/* Divider */
.panel-divider {
  height: 1px;
  background: var(--xe-color-border-subtle);
  flex-shrink: 0;
}

/* Results area */
.panel-results {
  flex: 1;
  overflow-y: auto;
}

.panel-results ::slotted(*) {
  display: block;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-segmented-button/index.js
var xe_segmented_button_default = i`/**
 * Segmented Button Component CSS
 * Styles for the segmented button container and individual segments
 * For use in shadow DOM of xe-segmented-button component
 */

:host {
  display: inline-flex;
}

:host([expand]) {
  display: flex;
  flex: 1;
}

:host([expand]) .segmented-button {
  flex: 1;
}

.segmented-button {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid var(--xe-color-border-default);
  border-radius: var(--xe-radius-interactive);
  background: var(--xe-color-surface-container-lowest);
}

::slotted(xe-segmented-button-segment) {
  flex: 1;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-segmented-button-segment/index.js
var xe_segmented_button_segment_default = i`/**
 * Segmented Button Segment CSS
 * Styles for individual segment within xe-segmented-button
 * For use in shadow DOM of xe-segmented-button-segment component
 */

:host {
  display: flex;
  flex: 1;
  outline: none;
}


.segment {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--xe-spacing-inline-gap-sm);
  flex: 1;
  padding: var(--xe-spacing-content-inset-tight) var(--xe-spacing-content-inset-compact);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0;
  color: var(--xe-color-content-on-surface-on-surface);
  font-family: var(--xe-typography-label-sm-family);
  font-size: var(--xe-typography-label-sm-size);
  font-weight: var(--xe-typography-label-sm-weight);
  line-height: var(--xe-typography-label-sm-line-height);
  letter-spacing: var(--xe-typography-label-sm-letter-spacing);
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 200ms ease;
  box-sizing: border-box;
  overflow: hidden;
}

:host(:first-of-type) .segment {
  border-radius: var(--xe-radius-interactive) 0 0 var(--xe-radius-interactive);
}

:host(:last-of-type) .segment {
  border-radius: 0 var(--xe-radius-interactive) var(--xe-radius-interactive) 0;
}

.segment::before {
  content: '';
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  transition: opacity 200ms ease;
}

.segment:hover:not([aria-disabled="true"])::before {
  background-color: var(--xe-states-hover);
  opacity: 1;
}

.segment:active:not([aria-disabled="true"])::before {
  background-color: var(--xe-states-pressed);
  opacity: 1;
}

:host([disabled]) .segment {
  cursor: not-allowed;
  opacity: 0.38;
}

.segment:focus {
  outline: none;
}

.segment:focus-visible {
  outline: 2px solid var(--xe-color-content-on-surface-on-surface);
  outline-offset: 2px;
}

:host([selected]) .segment {
  background: var(--xe-color-surface-container-high);
  border-color: var(--xe-color-content-on-surface-on-surface);
  margin: -1px;
}

:host(:focus-within) {
  position: relative;
  z-index: 2;
}

.segment-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-spotlight/index.js
var xe_spotlight_default = i`/**
 * Spotlight Composition CSS
 * Full-width hero with centered content. Background is solid color (subtle/muted)
 * or a full-bleed image (image). The overlay prop adds a dark scrim over the image
 * and switches text to white.
 */

:host {
  display: block;
  overflow: hidden;
}

/* TODO: padding-vertical (84px), padding-horizontal (274px), and the 600px mobile
   breakpoint are hardcoded from Figma and need to be standardized as role tokens. */
.spotlight {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 715px;
  padding: 84px var(--xe-spacing-content-inset-spacious);
}

@media (min-width: 600px) {
  .spotlight {
    padding: 84px clamp(var(--xe-spacing-content-inset-spacious), 19vw, 274px);
  }
}

/* TODO: mobile min-height and padding-vertical should be standardized as tokens */
@media (max-width: 768px) {
  .spotlight {
    min-height: max(420px, 75vw);
    padding-block: 64px;
  }
}

:host([background="subtle"]) .spotlight {
  background-color: var(--xe-color-surface-container-base);
}

:host([background="muted"]) .spotlight {
  background-color: var(--xe-color-surface-container-lowest);
}

/* Background image slot */

.spotlight-background {
  display: none;
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

:host([background="image"]) .spotlight-background {
  display: block;
}

.spotlight-background slot {
  display: block;
  height: 100%;
}

.spotlight-picture {
  display: block;
  width: 100%;
  height: 100%;
}

.spotlight-background ::slotted(img),
.spotlight-background ::slotted(video),
.spotlight-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: var(--xe-spotlight-image-position, center);
}

@media (max-width: 768px) {
  .spotlight-background ::slotted(img),
  .spotlight-background ::slotted(video),
  .spotlight-image {
    object-position: var(--xe-spotlight-image-position-mobile, var(--xe-spotlight-image-position, center));
  }
}

/* Overlay */

.spotlight-overlay {
  display: none;
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

:host([background="image"][overlay="dark"]) .spotlight-overlay {
  display: block;
  background-color: #0000007A;
}

:host([background="image"][overlay="light"]) .spotlight-overlay {
  display: block;
  background-color: #ffffff4d;
}

/* Content */

.spotlight-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--xe-spacing-stack-gap-xl);
  text-align: center;
  color: var(--xe-color-content-on-surface-on-surface);
  width: 100%;
}

:host([background="image"][overlay="dark"]) .spotlight-content {
  color: var(--xe-color-content-on-surface-on-surface-fixed-light);
}

.spotlight-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--xe-spacing-inline-gap-md);
  justify-content: center;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-svg/index.js
var xe_svg_default = i`:host {
  display: block;
  color: var(--xe-svg-color, inherit);
}

svg {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 0 auto;
}

:host([align="start"]) svg {
  margin-right: auto;
  margin-left: 0;
}

:host([align="end"]) svg {
  margin-left: auto;
  margin-right: 0;
}
`;

// node_modules/@ignite/web/dist/tokens/component/xe-youtube-embed/index.js
var xe_youtube_embed_default = i`:host {
  display: block;
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.xeyt-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background-color: #000;
}

.xeyt-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.xeyt-playbtn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 72px;
  height: 72px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--xe-color-brand-primary-bright);
  transition: all 0.2s ease;
}

@media (max-width: 768px) {
  .xeyt-playbtn {
    width: 50px;
    height: 50px;
  }
}

.xeyt-playbtn:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.xeyt-playbtn:focus {
  outline: 2px solid #fff;
  outline-offset: 4px;
}

.xeyt-playicon {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
}

iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.xeyt-player {
  width: 100%;
  height: 100%;
}
`;

// scripts/ignite/dist/primitives/action/hyperlink/xe-hyperlink.js
import { faArrowUpRightFromSquare } from "@fortawesome/pro-solid-svg-icons";
import { faChevronRight } from "@fortawesome/pro-regular-svg-icons";

// scripts/ignite/dist/primitives/media/icon/icon-resolver.js
var iconRegistry = {};
function registerIcons(icons) {
  Object.assign(iconRegistry, icons);
}
function resolveIcon(iconName) {
  const iconDef = iconRegistry[iconName];
  if (!iconDef || !iconDef.icon || !Array.isArray(iconDef.icon)) {
    console.warn(`Icon "${iconName}" not found. Did you forget to register it with registerIcons()?`);
    return A;
  }
  const [width, height, , , paths] = iconDef.icon;
  const pathData = Array.isArray(paths) ? paths : [paths];
  return w`
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${width} ${height}"
      fill="currentColor"
      aria-hidden="true"
    >
      ${pathData.map((path) => w`<path d="${path}" />`)}
    </svg>
  `;
}

// scripts/ignite/dist/primitives/media/icon/xe-icon.js
var __decorate = function(decorators, target, key, desc) {
  var c4 = arguments.length, r5 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r5 = Reflect.decorate(decorators, target, key, desc);
  else for (var i5 = decorators.length - 1; i5 >= 0; i5--) if (d3 = decorators[i5]) r5 = (c4 < 3 ? d3(r5) : c4 > 3 ? d3(target, key, r5) : d3(target, key)) || r5;
  return c4 > 3 && r5 && Object.defineProperty(target, key, r5), r5;
};
var XEIcon = class XEIcon2 extends i4 {
  constructor() {
    super(...arguments);
    this.icon = "";
    this.size = "md";
  }
  render() {
    return b2`${resolveIcon(this.icon)}`;
  }
};
XEIcon.styles = xe_icon_default;
__decorate([
  n4({ type: String })
], XEIcon.prototype, "icon", void 0);
__decorate([
  n4({ type: String, reflect: true })
], XEIcon.prototype, "size", void 0);
XEIcon = __decorate([
  t3("xe-icon")
], XEIcon);

// scripts/ignite/dist/primitives/action/hyperlink/xe-hyperlink.js
var __decorate2 = function(decorators, target, key, desc) {
  var c4 = arguments.length, r5 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r5 = Reflect.decorate(decorators, target, key, desc);
  else for (var i5 = decorators.length - 1; i5 >= 0; i5--) if (d3 = decorators[i5]) r5 = (c4 < 3 ? d3(r5) : c4 > 3 ? d3(target, key, r5) : d3(target, key)) || r5;
  return c4 > 3 && r5 && Object.defineProperty(target, key, r5), r5;
};
registerIcons({ faArrowUpRightFromSquare, faChevronRight });
var XEHyperlink = class XEHyperlink2 extends i4 {
  constructor() {
    super(...arguments);
    this.href = "";
    this.target = "";
    this.ariaLabel = "";
    this.variant = "default";
    this.trailingIcon = false;
    this.linkType = "external";
  }
  render() {
    const icon = this.linkType === "internal" ? "faChevronRight" : "faArrowUpRightFromSquare";
    return b2`
      <a
        class="hyperlink"
        href=${this.href || A}
        target=${this.target || A}
        rel=${this.target === "_blank" ? "noopener noreferrer" : A}
        aria-label=${this.ariaLabel || A}
      >
        <slot></slot>
        ${this.trailingIcon ? b2`<span class="icon"><xe-icon icon=${icon} size="sm" aria-hidden="true"></xe-icon></span>` : A}
      </a>
    `;
  }
};
XEHyperlink.styles = xe_hyperlink_default;
__decorate2([
  n4({ type: String })
], XEHyperlink.prototype, "href", void 0);
__decorate2([
  n4({ type: String })
], XEHyperlink.prototype, "target", void 0);
__decorate2([
  n4({ type: String, attribute: "aria-label" })
], XEHyperlink.prototype, "ariaLabel", void 0);
__decorate2([
  n4({ type: String, reflect: true })
], XEHyperlink.prototype, "variant", void 0);
__decorate2([
  n4({ type: Boolean, reflect: true, attribute: "trailing-icon" })
], XEHyperlink.prototype, "trailingIcon", void 0);
__decorate2([
  n4({ type: String, attribute: "link-type" })
], XEHyperlink.prototype, "linkType", void 0);
XEHyperlink = __decorate2([
  t3("xe-hyperlink")
], XEHyperlink);
export {
  XEHyperlink
};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
@lit/reactive-element/decorators/custom-element.js:
@lit/reactive-element/decorators/property.js:
@lit/reactive-element/decorators/state.js:
@lit/reactive-element/decorators/event-options.js:
@lit/reactive-element/decorators/base.js:
@lit/reactive-element/decorators/query.js:
@lit/reactive-element/decorators/query-all.js:
@lit/reactive-element/decorators/query-async.js:
@lit/reactive-element/decorators/query-assigned-nodes.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/decorators/query-assigned-elements.js:
  (**
   * @license
   * Copyright 2021 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
