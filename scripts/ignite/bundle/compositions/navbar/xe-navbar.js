// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t5, e8, o7) {
    if (this._$cssResult$ = true, o7 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t5, this.t = e8;
  }
  get styleSheet() {
    let t5 = this.o;
    const s4 = this.t;
    if (e && void 0 === t5) {
      const e8 = void 0 !== s4 && 1 === s4.length;
      e8 && (t5 = o.get(s4)), void 0 === t5 && ((this.o = t5 = new CSSStyleSheet()).replaceSync(this.cssText), e8 && o.set(s4, t5));
    }
    return t5;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t5) => new n("string" == typeof t5 ? t5 : t5 + "", void 0, s);
var i = (t5, ...e8) => {
  const o7 = 1 === t5.length ? t5[0] : e8.reduce((e9, s4, o8) => e9 + ((t6) => {
    if (true === t6._$cssResult$) return t6.cssText;
    if ("number" == typeof t6) return t6;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t6 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t5[o8 + 1], t5[0]);
  return new n(o7, t5, s);
};
var S = (s4, o7) => {
  if (e) s4.adoptedStyleSheets = o7.map((t5) => t5 instanceof CSSStyleSheet ? t5 : t5.styleSheet);
  else for (const e8 of o7) {
    const o8 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o8.setAttribute("nonce", n5), o8.textContent = e8.cssText, s4.appendChild(o8);
  }
};
var c = e ? (t5) => t5 : (t5) => t5 instanceof CSSStyleSheet ? ((t6) => {
  let e8 = "";
  for (const s4 of t6.cssRules) e8 += s4.cssText;
  return r(e8);
})(t5) : t5;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t5, s4) => t5;
var u = { toAttribute(t5, s4) {
  switch (s4) {
    case Boolean:
      t5 = t5 ? l : null;
      break;
    case Object:
    case Array:
      t5 = null == t5 ? t5 : JSON.stringify(t5);
  }
  return t5;
}, fromAttribute(t5, s4) {
  let i6 = t5;
  switch (s4) {
    case Boolean:
      i6 = null !== t5;
      break;
    case Number:
      i6 = null === t5 ? null : Number(t5);
      break;
    case Object:
    case Array:
      try {
        i6 = JSON.parse(t5);
      } catch (t6) {
        i6 = null;
      }
  }
  return i6;
} };
var f = (t5, s4) => !i2(t5, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t5) {
    this._$Ei(), (this.l ??= []).push(t5);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t5, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t5) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t5, s4), !s4.noAccessor) {
      const i6 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t5, i6, s4);
      void 0 !== h3 && e2(this.prototype, t5, h3);
    }
  }
  static getPropertyDescriptor(t5, s4, i6) {
    const { get: e8, set: r6 } = h(this.prototype, t5) ?? { get() {
      return this[s4];
    }, set(t6) {
      this[s4] = t6;
    } };
    return { get: e8, set(s5) {
      const h3 = e8?.call(this);
      r6?.call(this, s5), this.requestUpdate(t5, h3, i6);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t5) {
    return this.elementProperties.get(t5) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t5 = n2(this);
    t5.finalize(), void 0 !== t5.l && (this.l = [...t5.l]), this.elementProperties = new Map(t5.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t6 = this.properties, s4 = [...r2(t6), ...o2(t6)];
      for (const i6 of s4) this.createProperty(i6, t6[i6]);
    }
    const t5 = this[Symbol.metadata];
    if (null !== t5) {
      const s4 = litPropertyMetadata.get(t5);
      if (void 0 !== s4) for (const [t6, i6] of s4) this.elementProperties.set(t6, i6);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t6, s4] of this.elementProperties) {
      const i6 = this._$Eu(t6, s4);
      void 0 !== i6 && this._$Eh.set(i6, t6);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i6 = [];
    if (Array.isArray(s4)) {
      const e8 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e8) i6.unshift(c(s5));
    } else void 0 !== s4 && i6.push(c(s4));
    return i6;
  }
  static _$Eu(t5, s4) {
    const i6 = s4.attribute;
    return false === i6 ? void 0 : "string" == typeof i6 ? i6 : "string" == typeof t5 ? t5.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t5) => this.enableUpdating = t5), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t5) => t5(this));
  }
  addController(t5) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t5), void 0 !== this.renderRoot && this.isConnected && t5.hostConnected?.();
  }
  removeController(t5) {
    this._$EO?.delete(t5);
  }
  _$E_() {
    const t5 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i6 of s4.keys()) this.hasOwnProperty(i6) && (t5.set(i6, this[i6]), delete this[i6]);
    t5.size > 0 && (this._$Ep = t5);
  }
  createRenderRoot() {
    const t5 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t5, this.constructor.elementStyles), t5;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t5) => t5.hostConnected?.());
  }
  enableUpdating(t5) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t5) => t5.hostDisconnected?.());
  }
  attributeChangedCallback(t5, s4, i6) {
    this._$AK(t5, i6);
  }
  _$ET(t5, s4) {
    const i6 = this.constructor.elementProperties.get(t5), e8 = this.constructor._$Eu(t5, i6);
    if (void 0 !== e8 && true === i6.reflect) {
      const h3 = (void 0 !== i6.converter?.toAttribute ? i6.converter : u).toAttribute(s4, i6.type);
      this._$Em = t5, null == h3 ? this.removeAttribute(e8) : this.setAttribute(e8, h3), this._$Em = null;
    }
  }
  _$AK(t5, s4) {
    const i6 = this.constructor, e8 = i6._$Eh.get(t5);
    if (void 0 !== e8 && this._$Em !== e8) {
      const t6 = i6.getPropertyOptions(e8), h3 = "function" == typeof t6.converter ? { fromAttribute: t6.converter } : void 0 !== t6.converter?.fromAttribute ? t6.converter : u;
      this._$Em = e8;
      const r6 = h3.fromAttribute(s4, t6.type);
      this[e8] = r6 ?? this._$Ej?.get(e8) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t5, s4, i6, e8 = false, h3) {
    if (void 0 !== t5) {
      const r6 = this.constructor;
      if (false === e8 && (h3 = this[t5]), i6 ??= r6.getPropertyOptions(t5), !((i6.hasChanged ?? f)(h3, s4) || i6.useDefault && i6.reflect && h3 === this._$Ej?.get(t5) && !this.hasAttribute(r6._$Eu(t5, i6)))) return;
      this.C(t5, s4, i6);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t5, s4, { useDefault: i6, reflect: e8, wrapped: h3 }, r6) {
    i6 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t5) && (this._$Ej.set(t5, r6 ?? s4 ?? this[t5]), true !== h3 || void 0 !== r6) || (this._$AL.has(t5) || (this.hasUpdated || i6 || (s4 = void 0), this._$AL.set(t5, s4)), true === e8 && this._$Em !== t5 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t5));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t6) {
      Promise.reject(t6);
    }
    const t5 = this.scheduleUpdate();
    return null != t5 && await t5, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t7, s5] of this._$Ep) this[t7] = s5;
        this._$Ep = void 0;
      }
      const t6 = this.constructor.elementProperties;
      if (t6.size > 0) for (const [s5, i6] of t6) {
        const { wrapped: t7 } = i6, e8 = this[s5];
        true !== t7 || this._$AL.has(s5) || void 0 === e8 || this.C(s5, void 0, i6, e8);
      }
    }
    let t5 = false;
    const s4 = this._$AL;
    try {
      t5 = this.shouldUpdate(s4), t5 ? (this.willUpdate(s4), this._$EO?.forEach((t6) => t6.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t5 = false, this._$EM(), s5;
    }
    t5 && this._$AE(s4);
  }
  willUpdate(t5) {
  }
  _$AE(t5) {
    this._$EO?.forEach((t6) => t6.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t5)), this.updated(t5);
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
  shouldUpdate(t5) {
    return true;
  }
  update(t5) {
    this._$Eq &&= this._$Eq.forEach((t6) => this._$ET(t6, this[t6])), this._$EM();
  }
  updated(t5) {
  }
  firstUpdated(t5) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t5) => t5;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t5) => t5 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t5) => null === t5 || "object" != typeof t5 && "function" != typeof t5;
var u2 = Array.isArray;
var d2 = (t5) => u2(t5) || "function" == typeof t5?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t5) => (i6, ...s4) => ({ _$litType$: t5, strings: i6, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t5, i6) {
  if (!u2(t5) || !t5.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i6) : i6;
}
var N = (t5, i6) => {
  const s4 = t5.length - 1, e8 = [];
  let n5, l3 = 2 === i6 ? "<svg>" : 3 === i6 ? "<math>" : "", c4 = v;
  for (let i7 = 0; i7 < s4; i7++) {
    const s5 = t5[i7];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t5[i7 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e8.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i7 : x2);
  }
  return [V(t5, l3 + (t5[s4] || "<?>") + (2 === i6 ? "</svg>" : 3 === i6 ? "</math>" : "")), e8];
};
var S2 = class _S {
  constructor({ strings: t5, _$litType$: i6 }, e8) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t5.length - 1, d3 = this.parts, [f3, v2] = N(t5, i6);
    if (this.el = _S.createElement(f3, e8), P.currentNode = this.el.content, 2 === i6 || 3 === i6) {
      const t6 = this.el.content.firstChild;
      t6.replaceWith(...t6.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t6 of r6.getAttributeNames()) if (t6.endsWith(h2)) {
          const i7 = v2[a3++], s4 = r6.getAttribute(t6).split(o3), e9 = /([.?@])?(.*)/.exec(i7);
          d3.push({ type: 1, index: l3, name: e9[2], strings: s4, ctor: "." === e9[1] ? I : "?" === e9[1] ? L : "@" === e9[1] ? z : H }), r6.removeAttribute(t6);
        } else t6.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t6));
        if (y2.test(r6.tagName)) {
          const t6 = r6.textContent.split(o3), i7 = t6.length - 1;
          if (i7 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i7; s4++) r6.append(t6[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t6[i7], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t6 = -1;
        for (; -1 !== (t6 = r6.data.indexOf(o3, t6 + 1)); ) d3.push({ type: 7, index: l3 }), t6 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t5, i6) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t5, s4;
  }
};
function M(t5, i6, s4 = t5, e8) {
  if (i6 === E) return i6;
  let h3 = void 0 !== e8 ? s4._$Co?.[e8] : s4._$Cl;
  const o7 = a2(i6) ? void 0 : i6._$litDirective$;
  return h3?.constructor !== o7 && (h3?._$AO?.(false), void 0 === o7 ? h3 = void 0 : (h3 = new o7(t5), h3._$AT(t5, s4, e8)), void 0 !== e8 ? (s4._$Co ??= [])[e8] = h3 : s4._$Cl = h3), void 0 !== h3 && (i6 = M(t5, h3._$AS(t5, i6.values), h3, e8)), i6;
}
var R = class {
  constructor(t5, i6) {
    this._$AV = [], this._$AN = void 0, this._$AD = t5, this._$AM = i6;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t5) {
    const { el: { content: i6 }, parts: s4 } = this._$AD, e8 = (t5?.creationScope ?? l2).importNode(i6, true);
    P.currentNode = e8;
    let h3 = P.nextNode(), o7 = 0, n5 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o7 === r6.index) {
        let i7;
        2 === r6.type ? i7 = new k(h3, h3.nextSibling, this, t5) : 1 === r6.type ? i7 = new r6.ctor(h3, r6.name, r6.strings, this, t5) : 6 === r6.type && (i7 = new Z(h3, this, t5)), this._$AV.push(i7), r6 = s4[++n5];
      }
      o7 !== r6?.index && (h3 = P.nextNode(), o7++);
    }
    return P.currentNode = l2, e8;
  }
  p(t5) {
    let i6 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t5, s4, i6), i6 += s4.strings.length - 2) : s4._$AI(t5[i6])), i6++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t5, i6, s4, e8) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t5, this._$AB = i6, this._$AM = s4, this.options = e8, this._$Cv = e8?.isConnected ?? true;
  }
  get parentNode() {
    let t5 = this._$AA.parentNode;
    const i6 = this._$AM;
    return void 0 !== i6 && 11 === t5?.nodeType && (t5 = i6.parentNode), t5;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t5, i6 = this) {
    t5 = M(this, t5, i6), a2(t5) ? t5 === A || null == t5 || "" === t5 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t5 !== this._$AH && t5 !== E && this._(t5) : void 0 !== t5._$litType$ ? this.$(t5) : void 0 !== t5.nodeType ? this.T(t5) : d2(t5) ? this.k(t5) : this._(t5);
  }
  O(t5) {
    return this._$AA.parentNode.insertBefore(t5, this._$AB);
  }
  T(t5) {
    this._$AH !== t5 && (this._$AR(), this._$AH = this.O(t5));
  }
  _(t5) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t5 : this.T(l2.createTextNode(t5)), this._$AH = t5;
  }
  $(t5) {
    const { values: i6, _$litType$: s4 } = t5, e8 = "number" == typeof s4 ? this._$AC(t5) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e8) this._$AH.p(i6);
    else {
      const t6 = new R(e8, this), s5 = t6.u(this.options);
      t6.p(i6), this.T(s5), this._$AH = t6;
    }
  }
  _$AC(t5) {
    let i6 = C.get(t5.strings);
    return void 0 === i6 && C.set(t5.strings, i6 = new S2(t5)), i6;
  }
  k(t5) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i6 = this._$AH;
    let s4, e8 = 0;
    for (const h3 of t5) e8 === i6.length ? i6.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i6[e8], s4._$AI(h3), e8++;
    e8 < i6.length && (this._$AR(s4 && s4._$AB.nextSibling, e8), i6.length = e8);
  }
  _$AR(t5 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t5 !== this._$AB; ) {
      const s5 = i3(t5).nextSibling;
      i3(t5).remove(), t5 = s5;
    }
  }
  setConnected(t5) {
    void 0 === this._$AM && (this._$Cv = t5, this._$AP?.(t5));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t5, i6, s4, e8, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t5, this.name = i6, this._$AM = e8, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t5, i6 = this, s4, e8) {
    const h3 = this.strings;
    let o7 = false;
    if (void 0 === h3) t5 = M(this, t5, i6, 0), o7 = !a2(t5) || t5 !== this._$AH && t5 !== E, o7 && (this._$AH = t5);
    else {
      const e9 = t5;
      let n5, r6;
      for (t5 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e9[s4 + n5], i6, n5), r6 === E && (r6 = this._$AH[n5]), o7 ||= !a2(r6) || r6 !== this._$AH[n5], r6 === A ? t5 = A : t5 !== A && (t5 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
    }
    o7 && !e8 && this.j(t5);
  }
  j(t5) {
    t5 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t5 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t5) {
    this.element[this.name] = t5 === A ? void 0 : t5;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t5) {
    this.element.toggleAttribute(this.name, !!t5 && t5 !== A);
  }
};
var z = class extends H {
  constructor(t5, i6, s4, e8, h3) {
    super(t5, i6, s4, e8, h3), this.type = 5;
  }
  _$AI(t5, i6 = this) {
    if ((t5 = M(this, t5, i6, 0) ?? A) === E) return;
    const s4 = this._$AH, e8 = t5 === A && s4 !== A || t5.capture !== s4.capture || t5.once !== s4.once || t5.passive !== s4.passive, h3 = t5 !== A && (s4 === A || e8);
    e8 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t5), this._$AH = t5;
  }
  handleEvent(t5) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t5) : this._$AH.handleEvent(t5);
  }
};
var Z = class {
  constructor(t5, i6, s4) {
    this.element = t5, this.type = 6, this._$AN = void 0, this._$AM = i6, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t5) {
    M(this, t5);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t5, i6, s4) => {
  const e8 = s4?.renderBefore ?? i6;
  let h3 = e8._$litPart$;
  if (void 0 === h3) {
    const t6 = s4?.renderBefore ?? null;
    e8._$litPart$ = h3 = new k(i6.insertBefore(c3(), t6), t6, void 0, s4 ?? {});
  }
  return h3._$AI(t5), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t5 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t5.firstChild, t5;
  }
  update(t5) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t5), this._$Do = D(r6, this.renderRoot, this.renderOptions);
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
var t3 = (t5) => (e8, o7) => {
  void 0 !== o7 ? o7.addInitializer(() => {
    customElements.define(t5, e8);
  }) : customElements.define(t5, e8);
};

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t5 = o5, e8, r6) => {
  const { kind: n5, metadata: i6 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i6);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i6, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t5 = Object.create(t5)).wrapped = true), s4.set(r6.name, t5), "accessor" === n5) {
    const { name: o7 } = r6;
    return { set(r7) {
      const n6 = e8.get.call(this);
      e8.set.call(this, r7), this.requestUpdate(o7, n6, t5, true, r7);
    }, init(e9) {
      return void 0 !== e9 && this.C(o7, void 0, t5, e9), e9;
    } };
  }
  if ("setter" === n5) {
    const { name: o7 } = r6;
    return function(r7) {
      const n6 = this[o7];
      e8.call(this, r7), this.requestUpdate(o7, n6, t5, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t5) {
  return (e8, o7) => "object" == typeof o7 ? r4(t5, e8, o7) : ((t6, e9, o8) => {
    const r6 = e9.hasOwnProperty(o8);
    return e9.constructor.createProperty(o8, t6), r6 ? Object.getOwnPropertyDescriptor(e9, o8) : void 0;
  })(t5, e8, o7);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// node_modules/@lit/reactive-element/decorators/base.js
var e4 = (e8, t5, c4) => (c4.configurable = true, c4.enumerable = true, Reflect.decorate && "object" != typeof t5 && Object.defineProperty(e8, t5, c4), c4);

// node_modules/@lit/reactive-element/decorators/query.js
function e5(e8, r6) {
  return (n5, s4, i6) => {
    const o7 = (t5) => t5.renderRoot?.querySelector(e8) ?? null;
    if (r6) {
      const { get: e9, set: r7 } = "object" == typeof s4 ? n5 : i6 ?? /* @__PURE__ */ (() => {
        const t5 = /* @__PURE__ */ Symbol();
        return { get() {
          return this[t5];
        }, set(e10) {
          this[t5] = e10;
        } };
      })();
      return e4(n5, s4, { get() {
        let t5 = e9.call(this);
        return void 0 === t5 && (t5 = o7(this), (null !== t5 || this.hasUpdated) && r7.call(this, t5)), t5;
      } });
    }
    return e4(n5, s4, { get() {
      return o7(this);
    } });
  };
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

// scripts/ignite/dist/compositions/navbar/utils/search-routing.js
var SEARCH_EXPANDED_WIDTH = 280;
var SEARCH_COLLAPSED_WIDTH = 48;
var SEARCH_NET_GROWTH = SEARCH_EXPANDED_WIDTH - SEARCH_COLLAPSED_WIDTH;
function getOccupiedWidth(navbarEl) {
  const PADDING = 64;
  const GAP = 32;
  const children = Array.from(navbarEl.children);
  const visibleChildren = children.filter((el) => el.offsetWidth > 0);
  const childrenWidth = visibleChildren.reduce((sum, el) => sum + el.offsetWidth, 0);
  const gapWidth = Math.max(0, visibleChildren.length - 1) * GAP;
  return PADDING + childrenWidth + gapWidth;
}
function getSearchAvailableGrowth(shadowRoot) {
  const navbarEl = shadowRoot.querySelector(".navbar");
  if (!navbarEl)
    return null;
  return navbarEl.offsetWidth - getOccupiedWidth(navbarEl);
}
function shouldOpenDelegate(shadowRoot) {
  const available = getSearchAvailableGrowth(shadowRoot);
  if (available === null)
    return null;
  return available < SEARCH_NET_GROWTH;
}
function shouldTransferWhileOpen(shadowRoot) {
  const navbarEl = shadowRoot.querySelector(".navbar");
  if (!navbarEl)
    return false;
  return getOccupiedWidth(navbarEl) > navbarEl.offsetWidth;
}
function shouldTransferToInline(shadowRoot) {
  const available = getSearchAvailableGrowth(shadowRoot);
  if (available === null)
    return false;
  return available >= SEARCH_NET_GROWTH;
}
function getSearchBar(shadowRoot) {
  const searchSlot = shadowRoot.querySelector('slot[name="search"]');
  if (!searchSlot)
    return null;
  for (const el of searchSlot.assignedElements({ flatten: true })) {
    const found = el.tagName.toLowerCase() === "xe-search-bar" ? el : el.querySelector("xe-search-bar");
    if (found)
      return found;
  }
  return null;
}

// node_modules/lit-html/directive.js
var t4 = { ATTRIBUTE: 1, CHILD: 2, PROPERTY: 3, BOOLEAN_ATTRIBUTE: 4, EVENT: 5, ELEMENT: 6 };
var e6 = (t5) => (...e8) => ({ _$litDirective$: t5, values: e8 });
var i5 = class {
  constructor(t5) {
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AT(t5, e8, i6) {
    this._$Ct = t5, this._$AM = e8, this._$Ci = i6;
  }
  _$AS(t5, e8) {
    return this.update(t5, e8);
  }
  update(t5, e8) {
    return this.render(...e8);
  }
};

// node_modules/lit-html/directives/class-map.js
var e7 = e6(class extends i5 {
  constructor(t5) {
    if (super(t5), t5.type !== t4.ATTRIBUTE || "class" !== t5.name || t5.strings?.length > 2) throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.");
  }
  render(t5) {
    return " " + Object.keys(t5).filter((s4) => t5[s4]).join(" ") + " ";
  }
  update(s4, [i6]) {
    if (void 0 === this.st) {
      this.st = /* @__PURE__ */ new Set(), void 0 !== s4.strings && (this.nt = new Set(s4.strings.join(" ").split(/\s/).filter((t5) => "" !== t5)));
      for (const t5 in i6) i6[t5] && !this.nt?.has(t5) && this.st.add(t5);
      return this.render(i6);
    }
    const r6 = s4.element.classList;
    for (const t5 of this.st) t5 in i6 || (r6.remove(t5), this.st.delete(t5));
    for (const t5 in i6) {
      const s5 = !!i6[t5];
      s5 === this.st.has(t5) || this.nt?.has(t5) || (s5 ? (r6.add(t5), this.st.add(t5)) : (r6.remove(t5), this.st.delete(t5)));
    }
    return E;
  }
});

// node_modules/@ignite/web/dist/primitives/media/logo/xe-logo.js
var __decorate = function(decorators, target, key, desc) {
  var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
  return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
};
var XELogo = class XELogo2 extends i4 {
  constructor() {
    super(...arguments);
    this.size = "md";
    this.variant = "primary";
    this.type = "lockup";
    this.label = "Xcel Energy";
  }
  render() {
    const classes = {
      "logo": true,
      [this.size]: true,
      [this.variant]: true
    };
    const logoContent = this.type === "mark" ? w`<svg viewBox="0 0 34 33" xmlns="http://www.w3.org/2000/svg" role="img" aria-label=${this.label}>
          <g clip-path="url(#clip0_xe_mark)">
            <path d="M33.4643 23.7688C32.1567 25.3188 30.2858 26.9088 27.731 28.6188C19.2819 34.2688 8.35836 34.2488 3.89239 28.5788C2.08187 26.2788 1.38783 23.4588 1.8807 20.4288C2.67532 15.5788 6.44725 10.7188 12.5125 6.73877C14.4437 5.46877 15.9022 5.47877 16.7773 5.70877C17.9039 5.99877 18.5577 6.75877 18.7689 7.15877V7.17877C19.2115 8.00877 20.2173 9.94877 16.3046 12.9788C8.54947 18.9888 5.83368 24.3888 8.66011 28.1788C11.6173 32.1388 21.1427 31.9388 27.5298 27.7788C29.5315 26.4788 31.2615 25.3588 32.891 23.4188C33.0821 23.1888 33.2933 23.2088 33.404 23.3088C33.5347 23.4188 33.5649 23.6388 33.4643 23.7688Z" fill="currentColor"/>
            <path d="M0.0699306 9.07877C1.37753 7.52877 3.24841 5.93877 5.80326 4.22877C14.2524 -1.42123 25.1759 -1.41123 29.6419 4.26877C31.4524 6.56877 32.1464 9.38877 31.6536 12.4188C30.8589 17.2688 27.087 22.1288 21.0217 26.1088C19.0905 27.3788 17.632 27.3688 16.7569 27.1488C15.6304 26.8588 14.9766 26.0988 14.7654 25.6988V25.6788C14.3228 24.8488 13.3169 22.9088 17.2297 19.8788C24.9848 13.8688 27.7006 8.46877 24.8741 4.67877C21.9169 0.718771 12.3916 0.918771 5.99438 5.07877C3.99274 6.37877 2.26268 7.50877 0.633205 9.43877C0.442094 9.66877 0.230866 9.63877 0.120223 9.54877C-0.0105372 9.43877 -0.0407126 9.21877 0.0598722 9.08877L0.0699306 9.07877Z" fill="currentColor"/>
          </g>
          <defs>
            <clipPath id="clip0_xe_mark">
              <rect width="33.524" height="32.8438" fill="white"/>
            </clipPath>
          </defs>
        </svg>` : w`<svg viewBox="0 0 171 33" xmlns="http://www.w3.org/2000/svg" role="img" aria-label=${this.label}>
            <g clip-path="url(#clip0_307_312)">
              <path d="M33.2681 23.761C31.9681 25.311 30.1081 26.901 27.5681 28.611C19.1681 34.261 8.30808 34.241 3.86808 28.571C2.06808 26.271 1.37808 23.451 1.86808 20.421C2.65808 15.571 6.40808 10.711 12.4381 6.73102C14.3581 5.46102 15.8081 5.47102 16.6781 5.70102C17.7981 5.99102 18.4481 6.75102 18.6581 7.15102V7.17102C19.0981 8.00102 20.0981 9.94102 16.2081 12.971C8.49808 18.981 5.79808 24.381 8.60808 28.171C11.5481 32.131 21.0181 31.931 27.3681 27.771C29.3581 26.471 31.0781 25.351 32.6981 23.411C32.8881 23.181 33.0981 23.201 33.2081 23.301C33.3381 23.411 33.3681 23.631 33.2681 23.761Z" fill="currentColor"/>
              <path d="M0.0695241 9.07096C1.36952 7.52096 3.22952 5.93096 5.76952 4.22096C14.1695 -1.42904 25.0295 -1.41904 29.4695 4.26096C31.2695 6.56096 31.9595 9.38096 31.4695 12.411C30.6795 17.261 26.9295 22.121 20.8995 26.101C18.9795 27.371 17.5295 27.361 16.6595 27.141C15.5395 26.851 14.8895 26.091 14.6795 25.691V25.671C14.2395 24.841 13.2395 22.901 17.1295 19.871C24.8395 13.861 27.5395 8.46096 24.7295 4.67096C21.7895 0.710958 12.3195 0.910958 5.95952 5.07096C3.96952 6.37096 2.24952 7.50096 0.629524 9.43096C0.439524 9.66096 0.229524 9.63096 0.119524 9.54096C-0.0104759 9.43096 -0.0404759 9.21096 0.0595241 9.08096L0.0695241 9.07096Z" fill="currentColor"/>
              <path d="M49.2405 14.5906L45.4805 6.89062H50.9505L52.5305 11.1506L55.7805 6.89062H61.7605L54.9605 14.5906L58.9205 23.2506H53.2605L51.4505 18.6706L47.6705 23.2506H41.4805L49.2205 14.5906H49.2405Z" fill="currentColor"/>
              <path d="M67.4709 15.8703C67.4909 15.3003 67.4009 14.9303 67.1509 14.7003C66.9209 14.4503 66.5309 14.3603 66.0009 14.3603C64.0309 14.3603 63.5009 16.9503 63.5009 18.0703C63.5009 19.1903 63.7509 20.2503 65.0609 20.2503C66.3009 20.2503 66.8009 19.1703 67.0509 18.5103H71.4009C70.6209 21.9003 68.4409 23.5503 65.0109 23.5503C59.9709 23.5503 58.9609 20.3403 58.9609 18.1203C58.9609 14.0703 61.5909 11.0703 66.1309 11.0703C69.4309 11.0703 71.8809 12.5603 71.8109 15.8803H67.4609L67.4709 15.8703Z" fill="currentColor"/>
              <path d="M77.1808 15.9603C77.5208 14.7003 78.3308 13.9703 79.5408 13.9703C80.6908 13.9703 81.2608 14.6803 81.2608 15.5703C81.2608 15.6803 81.2408 15.8403 81.2108 15.9603H77.1808ZM80.4408 19.7903C80.2108 20.2003 79.6408 20.6403 78.6508 20.6403C77.2308 20.6403 76.7908 19.5903 76.7908 18.3303H85.2608C85.4708 17.6003 85.4908 16.9103 85.4908 16.2703C85.4908 12.5403 82.3108 11.0703 79.6708 11.0703C76.7108 11.0703 72.5508 12.8603 72.5508 18.3103C72.5508 21.2003 74.2408 23.5603 78.4608 23.5603C83.5908 23.5603 84.4808 20.6003 84.7808 19.8003H80.4308L80.4408 19.7903Z" fill="currentColor"/>
              <path d="M89.1908 6.89062H93.7308L90.3408 23.2406H85.8008L89.1908 6.89062Z" fill="currentColor"/>
              <path d="M99.4405 6.89062H110.71L110.34 8.72063H101.25L100.15 13.9206H108.63L108.26 15.7506H99.7605L98.5705 21.4106H107.78L107.36 23.2406H95.9805L99.4405 6.89062Z" fill="currentColor"/>
              <path d="M111.74 11.4009H113.62L113.25 13.1909H113.29C114.28 11.8609 115.88 11.1309 117.51 11.1309C119.73 11.1309 120.81 12.0909 120.81 14.1809C120.81 14.6809 120.67 15.5809 120.46 16.4909L119.02 23.2509H117.07L118.58 16.3309C118.67 15.9009 118.85 14.9109 118.85 14.5009C118.85 13.3809 117.93 12.8509 116.79 12.8509C115.71 12.8509 114.59 13.4409 113.86 14.2309C113.17 14.8309 112.81 15.7709 112.55 16.7009L111.18 23.2509H109.23L111.73 11.4109L111.74 11.4009Z" fill="currentColor"/>
              <path d="M123.919 16.1906C124.489 14.3606 125.729 12.8506 128.019 12.8506C130.169 12.8506 130.929 14.5206 130.789 16.1906H123.919ZM132.559 17.9106C132.629 17.5906 132.739 16.9906 132.739 16.3806C132.739 13.0406 131.209 11.1406 127.719 11.1406C124.469 11.1406 121.629 14.2306 121.629 18.7706C121.629 20.8306 122.729 23.5306 126.649 23.5306C129.239 23.5306 131.389 22.1606 132.009 19.5506H130.059C129.509 21.0106 128.339 21.8206 126.649 21.8206C125.069 21.8206 123.579 20.7906 123.579 18.9606C123.579 18.6106 123.599 18.2706 123.649 17.9306H132.559V17.9106Z" fill="currentColor"/>
              <path d="M135.609 11.4018H137.439L136.869 13.9418H136.919C137.839 12.3118 139.229 11.1218 141.229 11.1218C141.459 11.1218 141.689 11.0718 141.909 11.1218L141.449 13.2018C141.269 13.1818 141.059 13.1818 140.879 13.1818C140.399 13.1818 140.169 13.1818 139.709 13.2918C138.629 13.5718 137.809 14.2818 137.189 15.2118C136.659 15.9718 136.389 17.0918 136.199 17.9818L135.079 23.2318H133.129L135.599 11.3918L135.609 11.4018Z" fill="currentColor"/>
              <path d="M153.371 28.0304L156.131 23.2404L154.051 11.4004H156.131L157.501 20.8104H157.551L162.521 11.4004H164.651L155.241 28.0304H153.371Z" fill="currentColor"/>
              <path d="M142.84 18.4406C142.84 16.2606 144.31 12.8506 147.03 12.8506C149.07 12.8506 150.05 14.0906 150.05 15.9406C150.05 18.3206 148.67 21.6206 145.74 21.6206C143.79 21.6206 142.83 20.1306 142.83 18.4406H142.84ZM150.93 21.5306L153.06 11.4106H151.23L150.86 13.5906H150.81V13.5406C150.47 12.0506 148.77 11.1406 147.05 11.1406C143.2 11.1406 140.89 14.9406 140.89 18.4506C140.89 21.2706 142.4 23.3506 145.33 23.3506C146.82 23.3506 148.17 22.8006 149.02 21.5406L149.07 21.5906C147.94 25.8806 144.83 26.8706 141.52 26.8706C141.35 27.3406 141.01 28.0006 140.77 28.5806C144.65 28.5806 149.48 27.7306 150.92 21.5506L150.93 21.5306Z" fill="currentColor"/>
              <path d="M170.942 12.6109C170.652 13.9709 169.312 15.0809 167.942 15.0809C166.572 15.0809 165.712 13.9709 166.002 12.6109C166.302 11.2109 167.652 10.1309 168.992 10.1309C170.332 10.1309 171.242 11.2109 170.942 12.6109ZM166.432 12.6109C166.192 13.7309 166.922 14.6509 168.032 14.6509C169.142 14.6509 170.282 13.7209 170.522 12.6109C170.762 11.4709 170.032 10.5509 168.902 10.5509C167.772 10.5509 166.682 11.4409 166.432 12.6109ZM167.622 11.2409H168.902C169.362 11.2409 169.932 11.2409 169.782 11.9609C169.722 12.2509 169.532 12.5509 168.982 12.6109C169.502 12.6409 169.472 12.9009 169.462 13.1709C169.422 13.7809 169.422 13.8109 169.432 13.9809H168.612C168.612 13.8109 168.612 13.6309 168.652 13.3409C168.682 13.0309 168.692 12.9109 168.352 12.9109H168.042L167.812 13.9809H167.042L167.622 11.2409ZM168.142 12.4209H168.432C168.682 12.4209 168.942 12.4209 169.012 12.0809C169.082 11.7409 168.802 11.7409 168.572 11.7409H168.282L168.142 12.4209Z" fill="currentColor"/>
            </g>
            <defs>
              <clipPath id="clip0_307_312">
                <rect width="171" height="32.83" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        `;
    const logoElement = b2`
      <div class=${e7(classes)} role="img" aria-label=${this.label}>
        ${logoContent}
      </div>
    `;
    if (this.href) {
      const linkLabel = this.target === "_blank" ? `${this.label} (opens in a new window)` : this.label;
      return b2`
        <a href=${this.href} target=${this.target || "_self"} aria-label=${linkLabel}>
          ${logoElement}
        </a>
      `;
    }
    return logoElement;
  }
};
XELogo.styles = xe_logo_default;
__decorate([
  n4({ type: String })
], XELogo.prototype, "size", void 0);
__decorate([
  n4({ type: String })
], XELogo.prototype, "variant", void 0);
__decorate([
  n4({ type: String })
], XELogo.prototype, "type", void 0);
__decorate([
  n4({ type: String })
], XELogo.prototype, "label", void 0);
__decorate([
  n4({ type: String })
], XELogo.prototype, "href", void 0);
__decorate([
  n4({ type: String })
], XELogo.prototype, "target", void 0);
XELogo = __decorate([
  t3("xe-logo")
], XELogo);

// node_modules/lit-html/directives/if-defined.js
var o6 = (o7) => o7 ?? A;

// node_modules/@ignite/web/dist/primitives/media/icon/icon-resolver.js
var iconRegistry = {};
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

// node_modules/@ignite/web/dist/primitives/media/icon/xe-icon.js
var __decorate2 = function(decorators, target, key, desc) {
  var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
  return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
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
__decorate2([
  n4({ type: String })
], XEIcon.prototype, "icon", void 0);
__decorate2([
  n4({ type: String, reflect: true })
], XEIcon.prototype, "size", void 0);
XEIcon = __decorate2([
  t3("xe-icon")
], XEIcon);

// node_modules/@ignite/web/dist/primitives/layout/menu-item/xe-menu-item.js
var __decorate3 = function(decorators, target, key, desc) {
  var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
  return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
};
var XEMenuItem_1;
var XEMenuItem = XEMenuItem_1 = class XEMenuItem2 extends i4 {
  constructor() {
    super(...arguments);
    this.label = "";
    this.sublabel = "";
    this.showSublabel = false;
    this.showDivider = false;
    this.selected = false;
    this.disabled = false;
    this.align = "left";
    this._submenuOpen = false;
    this._hasSubmenu = false;
    this._handleDocumentClick = (e8) => {
      const path = e8.composedPath();
      if (path.includes(this)) {
        return;
      }
      const clickedSubmenu = path.find((el) => {
        return el.classList?.contains("nested-submenu");
      });
      if (!clickedSubmenu) {
        this._submenuOpen = false;
      }
    };
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._handleDocumentClick);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._handleDocumentClick);
    if (XEMenuItem_1._openMenuItem === this) {
      XEMenuItem_1._openMenuItem = null;
    }
  }
  async firstUpdated() {
    await this.updateComplete;
    const submenuSlot = this.shadowRoot?.querySelector('slot[name="submenu"]');
    if (submenuSlot) {
      this._hasSubmenu = submenuSlot.assignedElements().length > 0;
    }
  }
  reset() {
    this._submenuOpen = false;
    if (XEMenuItem_1._openMenuItem === this)
      XEMenuItem_1._openMenuItem = null;
  }
  _handleKeyDown(e8) {
    if (e8.key === "Enter" || e8.key === " ") {
      e8.preventDefault();
      this._handleClick(e8);
    } else if (e8.key === "Escape" && this._submenuOpen) {
      e8.stopPropagation();
      this._submenuOpen = false;
      if (XEMenuItem_1._openMenuItem === this)
        XEMenuItem_1._openMenuItem = null;
    } else if (e8.key === "ArrowDown" || e8.key === "ArrowUp") {
      e8.preventDefault();
      e8.stopPropagation();
      this._moveSiblingFocus(e8.key === "ArrowDown" ? 1 : -1, e8.composedPath());
    } else if (e8.key === "ArrowRight" && this._hasSubmenu) {
      e8.preventDefault();
      e8.stopPropagation();
      if (!this._submenuOpen) {
        this._submenuOpen = true;
        XEMenuItem_1._openMenuItem = this;
        this.updateComplete.then(() => this._focusFirstNestedItem());
      }
    } else if (e8.key === "ArrowLeft") {
      e8.preventDefault();
      e8.stopPropagation();
      const parentItem = this.parentElement?.parentElement;
      if (parentItem?.tagName.toLowerCase() === "xe-menu-item") {
        parentItem.reset();
        parentItem.shadowRoot?.querySelector('[role="menuitem"]')?.focus();
      }
    }
  }
  _moveSiblingFocus(direction, path) {
    const parent = this.parentElement;
    if (!parent)
      return;
    const siblings = Array.from(parent.children).filter((el) => el.tagName.toLowerCase() === "xe-menu-item" && !el.hasAttribute("disabled"));
    const activeIndex = siblings.findIndex((el) => path.includes(el));
    const next = activeIndex === -1 ? direction === 1 ? 0 : siblings.length - 1 : activeIndex + direction;
    const clamped = Math.max(0, Math.min(siblings.length - 1, next));
    siblings[clamped].shadowRoot?.querySelector('[role="menuitem"]')?.focus();
  }
  _focusFirstNestedItem() {
    const slot = this.shadowRoot?.querySelector('slot[name="submenu"]');
    const menu = slot?.assignedElements()[0];
    if (!menu)
      return;
    const firstItem = menu.querySelector("xe-menu-item:not([disabled])");
    firstItem?.shadowRoot?.querySelector('[role="menuitem"]')?.focus();
  }
  _handleClick(e8) {
    if (this.disabled)
      return;
    if (this._hasSubmenu) {
      e8.stopPropagation();
      if (XEMenuItem_1._openMenuItem && XEMenuItem_1._openMenuItem !== this) {
        const thisParent = this.parentElement;
        const openParent = XEMenuItem_1._openMenuItem.parentElement;
        if (thisParent === openParent) {
          XEMenuItem_1._openMenuItem._submenuOpen = false;
        }
      }
      this._submenuOpen = !this._submenuOpen;
      if (this._submenuOpen) {
        XEMenuItem_1._openMenuItem = this;
        this.updateComplete.then(() => this._focusFirstNestedItem());
      } else if (XEMenuItem_1._openMenuItem === this) {
        XEMenuItem_1._openMenuItem = null;
      }
    } else if (this.href) {
      window.location.href = this.href;
    }
  }
  render() {
    const itemClasses = [
      "menu-item",
      this.selected ? "selected" : "",
      this._hasSubmenu ? "has-submenu" : "",
      this._submenuOpen ? "submenu-open" : ""
    ].filter(Boolean).join(" ");
    return b2`
      <div class="menu-item-wrapper">
        <div
          class="${itemClasses}"
          @click=${this._handleClick}
          @keydown=${this._handleKeyDown}
          role="menuitem"
          tabindex="-1"
          aria-disabled=${this.disabled}
          aria-haspopup=${this._hasSubmenu ? "menu" : "false"}
          aria-expanded=${this._hasSubmenu ? String(this._submenuOpen) : "false"}>

          <div class="menu-item-state-layer">
            <div class="menu-item-content">
              <slot name="leading-icon"></slot>

              <div class="menu-item-labels">
                <div class="menu-item-label">${this.label}</div>
                ${this.showSublabel ? b2`
                  <div class="menu-item-sublabel">${this.sublabel}</div>
                ` : A}
              </div>

              ${this._hasSubmenu ? b2`
                <xe-icon icon="faChevronRight" size="md"></xe-icon>
              ` : this.selected ? b2`
                <xe-icon icon="faCheck" size="sm"></xe-icon>
              ` : b2`
                <slot name="trailing-icon"></slot>
              `}
            </div>
          </div>

          ${this.showDivider ? b2`
            <div class="menu-item-divider"></div>
          ` : A}
        </div>

        <!-- Always render submenu slot so willUpdate can detect content -->
        <div class="nested-submenu ${this._submenuOpen ? "open" : ""}" ?inert=${!this._submenuOpen}>
          <slot name="submenu"></slot>
        </div>
      </div>
    `;
  }
};
XEMenuItem.styles = [xe_menu_item_default];
XEMenuItem._openMenuItem = null;
__decorate3([
  n4({ type: String })
], XEMenuItem.prototype, "label", void 0);
__decorate3([
  n4({ type: String })
], XEMenuItem.prototype, "sublabel", void 0);
__decorate3([
  n4({ type: Boolean, reflect: true, attribute: "show-sublabel" })
], XEMenuItem.prototype, "showSublabel", void 0);
__decorate3([
  n4({ type: Boolean, reflect: true, attribute: "show-divider" })
], XEMenuItem.prototype, "showDivider", void 0);
__decorate3([
  n4({ type: Boolean, reflect: true })
], XEMenuItem.prototype, "selected", void 0);
__decorate3([
  n4({ type: Boolean, reflect: true })
], XEMenuItem.prototype, "disabled", void 0);
__decorate3([
  n4({ type: String })
], XEMenuItem.prototype, "align", void 0);
__decorate3([
  n4({ type: String })
], XEMenuItem.prototype, "href", void 0);
__decorate3([
  r5()
], XEMenuItem.prototype, "_submenuOpen", void 0);
__decorate3([
  r5()
], XEMenuItem.prototype, "_hasSubmenu", void 0);
XEMenuItem = XEMenuItem_1 = __decorate3([
  t3("xe-menu-item")
], XEMenuItem);

// node_modules/@ignite/web/dist/primitives/layout/menu/xe-menu.js
var __decorate4 = function(decorators, target, key, desc) {
  var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
  return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
};
var XEMenu = class XEMenu2 extends i4 {
  constructor() {
    super(...arguments);
    this.variant = "filled";
  }
  render() {
    return b2`
      <div class="menu ${this.variant}" role="menu" style=${this.width ? `width:${this.width}` : ""}>
        <slot></slot>
      </div>
    `;
  }
};
XEMenu.styles = [xe_menu_default];
__decorate4([
  n4({ type: String, reflect: true })
], XEMenu.prototype, "variant", void 0);
__decorate4([
  n4({ type: String })
], XEMenu.prototype, "width", void 0);
XEMenu = __decorate4([
  t3("xe-menu")
], XEMenu);

// scripts/ignite/dist/compositions/navbar/xe-nav-item.js
var __decorate5 = function(decorators, target, key, desc) {
  var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
  return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
};
var XENavItem_1;
var XENavItem = XENavItem_1 = class XENavItem2 extends i4 {
  constructor() {
    super(...arguments);
    this.active = false;
    this._submenuOpen = false;
    this._hasSubmenu = false;
    this._handleDocumentClick = (e8) => {
      if (!e8.composedPath().includes(this)) {
        this._closeMenu();
      }
    };
    this._handleFocusOut = (e8) => {
      const related = e8.relatedTarget;
      if (!related || !this._containsNode(related)) {
        this._closeMenu();
      }
    };
    this._handleKeyDown = (e8) => {
      if (e8.key === "Escape" && this._submenuOpen) {
        e8.stopPropagation();
        this._closeMenu();
        this.shadowRoot?.querySelector("button.nav-item")?.focus();
      } else if ((e8.key === "ArrowDown" || e8.key === "Enter" || e8.key === " ") && this._hasSubmenu && !this._submenuOpen) {
        e8.preventDefault();
        if (XENavItem_1._openNavItem && XENavItem_1._openNavItem !== this) {
          XENavItem_1._openNavItem._closeMenu();
        }
        this._submenuOpen = true;
        XENavItem_1._openNavItem = this;
        this.updateComplete.then(() => {
          this._positionSubmenu();
          this._focusFirstMenuItem();
        });
      }
    };
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("click", this._handleDocumentClick);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("click", this._handleDocumentClick);
    if (XENavItem_1._openNavItem === this) {
      XENavItem_1._openNavItem = null;
    }
  }
  async firstUpdated() {
    await this.updateComplete;
    const submenuSlot = this.shadowRoot?.querySelector('slot[name="submenu"]');
    if (submenuSlot) {
      this._hasSubmenu = submenuSlot.assignedElements().length > 0;
    }
  }
  _positionSubmenu() {
    const container = this.shadowRoot?.querySelector(".submenu-container");
    if (!container)
      return;
    const navbar = this.closest("xe-navbar");
    if (!navbar)
      return;
    const navbarRow = navbar.shadowRoot?.querySelector(".navbar") ?? navbar;
    const referenceRect = navbarRow.getBoundingClientRect();
    const thisRect = this.getBoundingClientRect();
    container.style.top = `${referenceRect.bottom - thisRect.top - 12}px`;
  }
  _closeMenu() {
    this._submenuOpen = false;
    if (XENavItem_1._openNavItem === this)
      XENavItem_1._openNavItem = null;
    const slot = this.shadowRoot?.querySelector('slot[name="submenu"]');
    const menu = slot?.assignedElements()[0];
    menu?.querySelectorAll("xe-menu-item").forEach((el) => el.reset?.());
  }
  // Walk up through shadow host ancestors to check if a node is within this element.
  _containsNode(node) {
    let current = node;
    while (current) {
      if (current === this)
        return true;
      const root = current.getRootNode();
      current = root instanceof ShadowRoot ? root.host : current.parentElement;
    }
    return false;
  }
  _focusFirstMenuItem() {
    const slot = this.shadowRoot?.querySelector('slot[name="submenu"]');
    const menu = slot?.assignedElements()[0];
    if (!menu)
      return;
    const firstItem = menu.querySelector("xe-menu-item:not([disabled])");
    firstItem?.shadowRoot?.querySelector('[role="menuitem"]')?.focus();
  }
  _handleClick(e8) {
    if (this._hasSubmenu) {
      e8.preventDefault();
      e8.stopPropagation();
      if (XENavItem_1._openNavItem && XENavItem_1._openNavItem !== this) {
        XENavItem_1._openNavItem._closeMenu();
      }
      this._submenuOpen = !this._submenuOpen;
      if (this._submenuOpen) {
        XENavItem_1._openNavItem = this;
        this.updateComplete.then(() => {
          this._positionSubmenu();
          this._focusFirstMenuItem();
        });
      } else {
        this._closeMenu();
      }
    } else if (this.href) {
      window.location.href = this.href;
    }
  }
  // Removed - rely only on slotchange event to avoid update-in-update warning
  render() {
    const classes = {
      "nav-item": true,
      "active": this.active,
      "has-submenu": this._hasSubmenu,
      "submenu-open": this._submenuOpen,
      ...this.contentTheme && { [`content-theme-${this.contentTheme}`]: true }
    };
    return b2`
      <div class="nav-item-wrapper" @focusout=${this._handleFocusOut} @keydown=${this._handleKeyDown}>
        <button
          class=${e7(classes)}
          type="button"
          aria-haspopup=${o6(this._hasSubmenu ? "menu" : void 0)}
          aria-expanded=${o6(this._hasSubmenu ? String(this._submenuOpen) : void 0)}
          @click=${this._handleClick}>
          <slot></slot>
          ${this._hasSubmenu ? b2`
            <xe-icon icon="faChevronDown" size="sm"></xe-icon>
          ` : A}
        </button>

        <div class="submenu-container ${this._submenuOpen ? "open" : ""}" ?inert=${!this._submenuOpen}>
          <slot name="submenu"></slot>
        </div>
      </div>
    `;
  }
};
XENavItem.styles = xe_nav_item_default;
XENavItem._openNavItem = null;
__decorate5([
  n4({ type: Boolean, reflect: true })
], XENavItem.prototype, "active", void 0);
__decorate5([
  n4({ type: String, attribute: "content-theme" })
], XENavItem.prototype, "contentTheme", void 0);
__decorate5([
  n4({ type: String })
], XENavItem.prototype, "href", void 0);
__decorate5([
  r5()
], XENavItem.prototype, "_submenuOpen", void 0);
__decorate5([
  r5()
], XENavItem.prototype, "_hasSubmenu", void 0);
XENavItem = XENavItem_1 = __decorate5([
  t3("xe-nav-item")
], XENavItem);

// node_modules/@ignite/web/dist/utils/focus-trap.js
var FOCUSABLE = 'button:not([disabled]):not([tabindex="-1"]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]';
function getFocusableEls(root) {
  const results = [];
  const walkEl = (el) => {
    if (el.tagName === "SLOT") {
      el.assignedElements({ flatten: true }).forEach(walkEl);
      return;
    }
    if (el.shadowRoot) {
      Array.from(el.shadowRoot.children).forEach(walkEl);
    } else {
      if (el.matches(FOCUSABLE) && !results.includes(el)) {
        results.push(el);
      }
      Array.from(el.children).forEach(walkEl);
    }
  };
  Array.from(root.children).forEach(walkEl);
  return results;
}
function handleFocusTrap(e8, root) {
  if (e8.key !== "Tab")
    return;
  const focusable = getFocusableEls(root);
  if (!focusable.length)
    return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = e8.composedPath().find((n5) => focusable.includes(n5));
  if (e8.shiftKey && (active === first || !active)) {
    e8.preventDefault();
    last.focus();
  } else if (!e8.shiftKey && (active === last || !active)) {
    e8.preventDefault();
    first.focus();
  }
}

// node_modules/@ignite/web/dist/primitives/action/icon-button/xe-icon-button.js
var __decorate6 = function(decorators, target, key, desc) {
  var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
  return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
};
var XEIconButton = class XEIconButton2 extends i4 {
  constructor() {
    super(...arguments);
    this._ariaLabel = null;
    this.treatment = "default";
    this.size = "md";
    this.href = "";
    this.target = "";
    this.disabled = false;
  }
  static get observedAttributes() {
    return [...super.observedAttributes ?? [], "aria-label"];
  }
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === "aria-label") {
      if (newVal !== null) {
        this._ariaLabel = newVal;
        this.removeAttribute("aria-label");
        this.requestUpdate();
      }
      return;
    }
    super.attributeChangedCallback(name, oldVal, newVal);
  }
  _handleClick(e8) {
    if (this.disabled) {
      e8.preventDefault();
      e8.stopPropagation();
    }
  }
  render() {
    const classes = {
      "icon-button": true,
      [this.treatment]: true
    };
    const inner = b2`
      <div class="icon-button-container">
        <div class="icon-button-state-layer">
          <slot></slot>
        </div>
      </div>
    `;
    if (this.href) {
      return b2`
        <a
          class=${e7(classes)}
          href=${this.href}
          target=${this.target || A}
          rel=${this.target === "_blank" ? "noopener noreferrer" : A}
          aria-label=${this._ariaLabel || A}
          @click=${this._handleClick}>
          ${inner}
        </a>
      `;
    }
    return b2`
      <button
        class=${e7(classes)}
        type="button"
        ?disabled=${this.disabled}
        aria-label=${this._ariaLabel || A}
        @click=${this._handleClick}>
        ${inner}
      </button>
    `;
  }
};
XEIconButton.styles = xe_icon_button_default;
__decorate6([
  n4({ type: String, reflect: true })
], XEIconButton.prototype, "treatment", void 0);
__decorate6([
  n4({ type: String, reflect: true })
], XEIconButton.prototype, "size", void 0);
__decorate6([
  n4({ type: String })
], XEIconButton.prototype, "href", void 0);
__decorate6([
  n4({ type: String })
], XEIconButton.prototype, "target", void 0);
__decorate6([
  n4({ type: Boolean, reflect: true })
], XEIconButton.prototype, "disabled", void 0);
XEIconButton = __decorate6([
  t3("xe-icon-button")
], XEIconButton);

// node_modules/@ignite/web/dist/compositions/nav-drawer/xe-nav-drawer-item.js
var __decorate7 = function(decorators, target, key, desc) {
  var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
  return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
};
var XENavDrawerItem = class XENavDrawerItem2 extends i4 {
  constructor() {
    super(...arguments);
    this.label = "";
    this.sublabel = "";
    this.href = "";
    this.selected = false;
    this._hasLeadingIcon = false;
    this._hasChildren = false;
  }
  connectedCallback() {
    super.connectedCallback();
    this._hasChildren = Array.from(this.children).some((el) => el.getAttribute("slot") === "children");
  }
  _onLeadingIconSlotChange(e8) {
    const slot = e8.target;
    this._hasLeadingIcon = slot.assignedNodes({ flatten: true }).length > 0;
  }
  _handleClick(e8) {
    e8.preventDefault();
    if (this._hasChildren) {
      this.dispatchEvent(new CustomEvent("xe-nav-drawer-item-expand", {
        bubbles: true,
        composed: true,
        detail: { label: this.label }
      }));
      return;
    }
    this.dispatchEvent(new CustomEvent("xe-nav-drawer-item-click", {
      bubbles: true,
      composed: true,
      detail: { href: this.href }
    }));
    if (this.href) {
      window.location.href = this.href;
    }
  }
  render() {
    return b2`
      <button class="item" type="button" @click=${this._handleClick}>
        <span class="item-leading-icon" ?hidden=${!this._hasLeadingIcon}>
          <slot name="leading-icon" @slotchange=${this._onLeadingIconSlotChange}></slot>
        </span>

        <span class="item-labels">
          <span class="item-label">${this.label}</span>
          ${this.sublabel ? b2`<span class="item-sublabel">${this.sublabel}</span>` : A}
        </span>

        ${this._hasChildren ? b2`
          <span class="item-trailing-icon">
            <xe-icon icon="faChevronRight" size="md"></xe-icon>
          </span>
        ` : this.selected ? b2`
          <span class="item-trailing-icon">
            <xe-icon icon="faCheck" size="sm"></xe-icon>
          </span>
        ` : A}
      </button>

      <!-- Hidden slot — xe-nav-drawer queries assignedElements() from here -->
      <div hidden>
        <slot name="children"></slot>
      </div>
    `;
  }
};
XENavDrawerItem.styles = xe_nav_drawer_item_default;
__decorate7([
  n4({ type: String })
], XENavDrawerItem.prototype, "label", void 0);
__decorate7([
  n4({ type: String })
], XENavDrawerItem.prototype, "sublabel", void 0);
__decorate7([
  n4({ type: String })
], XENavDrawerItem.prototype, "href", void 0);
__decorate7([
  n4({ type: Boolean, reflect: true })
], XENavDrawerItem.prototype, "selected", void 0);
__decorate7([
  r5()
], XENavDrawerItem.prototype, "_hasLeadingIcon", void 0);
XENavDrawerItem = __decorate7([
  t3("xe-nav-drawer-item")
], XENavDrawerItem);

// node_modules/@ignite/web/dist/compositions/nav-drawer/xe-nav-drawer.js
var __decorate8 = function(decorators, target, key, desc) {
  var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
  return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
};
var XENavDrawer = class XENavDrawer2 extends i4 {
  constructor() {
    super(...arguments);
    this.open = false;
    this.showBack = false;
    this._hasActions = false;
    this._hasSelector = false;
    this._depth = 0;
    this._sectionLabel = null;
    this._closing = false;
    this._stack = [];
    this._track = null;
    this._triggerEl = null;
    this._backInFlight = false;
    this._handleDocPointerDown = (e8) => {
      if (!this.open)
        return;
      if (!e8.composedPath().includes(this))
        this._close();
    };
    this._handleKeyDown = (e8) => {
      if (!this.open)
        return;
      if (e8.key === "Escape") {
        this._close();
        return;
      }
      if (this.shadowRoot)
        handleFocusTrap(e8, this.shadowRoot);
    };
  }
  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("keydown", this._handleKeyDown);
    document.addEventListener("pointerdown", this._handleDocPointerDown);
    let opener = document.activeElement;
    while (opener?.shadowRoot?.activeElement) {
      opener = opener.shadowRoot.activeElement;
    }
    this._triggerEl = opener;
    this.updateComplete.then(() => {
      if (this.shadowRoot)
        getFocusableEls(this.shadowRoot)[0]?.focus();
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this._handleKeyDown);
    document.removeEventListener("pointerdown", this._handleDocPointerDown);
    this._triggerEl?.focus();
    this._triggerEl = null;
  }
  updated(changed) {
    if (changed.has("open") && !this.open) {
      this._resetToRoot();
    }
  }
  async firstUpdated() {
    await this.updateComplete;
    this._track = this.shadowRoot.querySelector(".nav-track");
  }
  _onActionsSlotChange(e8) {
    const slot = e8.target;
    this._hasActions = slot.assignedNodes({ flatten: true }).length > 0;
  }
  _onSelectorSlotChange(e8) {
    const slot = e8.target;
    this._hasSelector = slot.assignedNodes({ flatten: true }).length > 0;
  }
  _handleExpand(e8) {
    const { label, children: detailChildren } = e8.detail;
    const sourceItem = e8.target;
    let children;
    if (detailChildren?.length) {
      children = detailChildren;
    } else {
      const childrenSlot = sourceItem.shadowRoot?.querySelector('slot[name="children"]');
      children = childrenSlot ? childrenSlot.assignedElements() : [];
    }
    if (!children.length || !this._track)
      return;
    const panel = document.createElement("div");
    panel.className = "nav-panel";
    children.forEach((child) => panel.appendChild(child));
    Array.from(this._track.querySelectorAll(".nav-panel")).forEach((p3) => {
      p3.inert = true;
    });
    this._track.appendChild(panel);
    this._stack.push({ label, sourceItem: detailChildren?.length ? null : sourceItem, panel });
    this._depth = this._stack.length;
    this._sectionLabel = label;
    this._track.style.transform = `translateX(-${this._depth * 100}%)`;
    this.updateComplete.then(() => {
      const firstItem = panel.querySelector("xe-nav-drawer-item");
      firstItem?.shadowRoot?.querySelector("button")?.focus();
    });
  }
  _back(_e) {
    if (this._backInFlight)
      return;
    this._backInFlight = true;
    requestAnimationFrame(() => {
      this._backInFlight = false;
    });
    if (this._depth > 0 && this._track) {
      const { sourceItem, panel } = this._stack[this._stack.length - 1];
      if (sourceItem) {
        Array.from(panel.children).forEach((child) => sourceItem.appendChild(child));
      }
      this._track.removeChild(panel);
      this._stack.pop();
      this._depth = this._stack.length;
      this._sectionLabel = this._stack.length > 0 ? this._stack[this._stack.length - 1].label : null;
      this._track.style.transform = `translateX(-${this._depth * 100}%)`;
      const panels = Array.from(this._track.querySelectorAll(".nav-panel"));
      const visiblePanel = panels[panels.length - 1];
      if (visiblePanel)
        visiblePanel.inert = false;
      const poppedSourceItem = sourceItem;
      this.updateComplete.then(() => {
        if (this._depth > 0) {
          const backBtn = this.shadowRoot?.querySelector('xe-icon-button[aria-label="Back"]');
          backBtn?.shadowRoot?.querySelector("button")?.focus();
        } else {
          poppedSourceItem?.shadowRoot?.querySelector("button")?.focus();
        }
      });
    } else {
      this.dispatchEvent(new CustomEvent("xe-nav-drawer-back", { bubbles: true, composed: true }));
    }
  }
  _resetToRoot() {
    if (!this._track)
      return;
    while (this._stack.length > 0) {
      const { sourceItem, panel } = this._stack[this._stack.length - 1];
      Array.from(panel.children).forEach((child) => sourceItem.appendChild(child));
      this._track.removeChild(panel);
      this._stack.pop();
    }
    this._depth = 0;
    this._sectionLabel = null;
    Array.from(this._track.querySelectorAll(".nav-panel")).forEach((p3) => {
      p3.inert = false;
    });
    this._track.style.transition = "none";
    this._track.style.transform = "translateX(0)";
    requestAnimationFrame(() => {
      if (this._track)
        this._track.style.transition = "";
    });
  }
  _close() {
    if (this._closing)
      return;
    this._closing = true;
    const drawer = this.shadowRoot?.querySelector(".drawer");
    const dispatch = () => {
      const event = new CustomEvent("xe-nav-drawer-close", {
        bubbles: true,
        composed: true,
        cancelable: true
      });
      this.dispatchEvent(event);
      if (!event.defaultPrevented) {
        this.open = false;
        this._closing = false;
      } else {
        this._closing = false;
      }
    };
    if (drawer) {
      drawer.addEventListener("animationend", dispatch, { once: true });
    } else {
      dispatch();
    }
  }
  render() {
    const showBack = this.showBack || this._depth > 0;
    const isNested = this._depth > 0;
    return b2`

      <div
        class="drawer ${this._closing ? "closing" : ""}"
        ?inert="${!this.open}"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        @xe-nav-drawer-item-expand=${this._handleExpand}
      >
        <div class="drawer-header">
          ${showBack ? b2`
            <xe-icon-button size="md" aria-label="Back" @click=${this._back}>
              <xe-icon icon="faChevronLeft" size="md"></xe-icon>
            </xe-icon-button>
          ` : A}

          <div class="drawer-header-content">
            ${this._sectionLabel ? b2`<span class="drawer-header-title">${this._sectionLabel}</span>` : b2`<slot name="logo"></slot>`}
          </div>

          <xe-icon-button size="md" aria-label="Close navigation" @click=${this._close}>
            <xe-icon icon="faXmark" size="md"></xe-icon>
          </xe-icon-button>
        </div>

        <div class="drawer-actions" ?hidden=${!this._hasActions} ?inert=${isNested}>
          <slot name="actions" @slotchange=${this._onActionsSlotChange}></slot>
        </div>

        <div class="drawer-selector" ?hidden=${!this._hasSelector} ?inert=${isNested}>
          <slot name="selector" @slotchange=${this._onSelectorSlotChange}></slot>
        </div>

        <div class="drawer-divider"></div>

        <div class="nav-viewport">
          <div class="nav-track">
            <div class="nav-panel">
              <slot name="nav-items"></slot>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};
XENavDrawer.styles = xe_nav_drawer_default;
__decorate8([
  n4({ type: Boolean, reflect: true })
], XENavDrawer.prototype, "open", void 0);
__decorate8([
  n4({ type: Boolean, reflect: true, attribute: "show-back" })
], XENavDrawer.prototype, "showBack", void 0);
__decorate8([
  r5()
], XENavDrawer.prototype, "_hasActions", void 0);
__decorate8([
  r5()
], XENavDrawer.prototype, "_hasSelector", void 0);
__decorate8([
  r5()
], XENavDrawer.prototype, "_depth", void 0);
__decorate8([
  r5()
], XENavDrawer.prototype, "_sectionLabel", void 0);
__decorate8([
  r5()
], XENavDrawer.prototype, "_closing", void 0);
XENavDrawer = __decorate8([
  t3("xe-nav-drawer")
], XENavDrawer);

// node_modules/@ignite/web/dist/primitives/input-control/search-delegate/xe-search-delegate.js
var __decorate9 = function(decorators, target, key, desc) {
  var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
  return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
};
var XESearchDelegate = class XESearchDelegate2 extends i4 {
  constructor() {
    super(...arguments);
    this.placeholder = "Search...";
    this.value = "";
    this.keyboardOpen = false;
    this._value = "";
    this._closing = false;
    this._keyboardFocused = false;
    this._pointerDown = false;
    this._suppressFirstFocus = false;
    this._handleKeyDown = (e8) => {
      if (e8.key === "Escape") {
        this._close();
        return;
      }
      if (this.shadowRoot)
        handleFocusTrap(e8, this.shadowRoot);
    };
  }
  connectedCallback() {
    super.connectedCallback();
    this._value = this.value;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", this._handleKeyDown);
  }
  firstUpdated() {
    this._keyboardFocused = this.keyboardOpen;
    this._suppressFirstFocus = true;
    this._input?.focus();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    document.body.style.overflow = "";
    document.removeEventListener("keydown", this._handleKeyDown);
  }
  _close() {
    if (this._closing)
      return;
    this._closing = true;
    const panel = this.shadowRoot?.querySelector(".panel");
    const done = () => {
      this.dispatchEvent(new CustomEvent("xe-search-delegate-close", {
        bubbles: true,
        composed: true,
        cancelable: true
      }));
    };
    if (panel) {
      panel.addEventListener("animationend", done, { once: true });
    } else {
      done();
    }
  }
  _handleMouseDown() {
    this._pointerDown = true;
  }
  _handleInputFocus() {
    if (this._suppressFirstFocus) {
      this._suppressFirstFocus = false;
      return;
    }
    this._keyboardFocused = !this._pointerDown;
    this._pointerDown = false;
  }
  _handleInputBlur() {
    this._keyboardFocused = false;
    this._pointerDown = false;
  }
  _handleInput(e8) {
    this._value = e8.target.value;
    this.dispatchEvent(new CustomEvent("input", {
      bubbles: true,
      composed: true,
      detail: { value: this._value }
    }));
  }
  _handleKeyPress(e8) {
    if (e8.key === "Enter") {
      this.dispatchEvent(new CustomEvent("search", {
        bubbles: true,
        composed: true,
        detail: { value: this._value }
      }));
    }
  }
  _handleClear(e8) {
    this._value = "";
    if (this._input)
      this._input.value = "";
    const originalEvent = e8?.detail?.originalEvent;
    if (originalEvent && originalEvent.detail > 0)
      this._pointerDown = true;
    this._input?.focus();
    this.dispatchEvent(new CustomEvent("clear", { bubbles: true, composed: true }));
  }
  render() {
    return b2`
      <div class="overlay ${this._closing ? "closing" : ""}" @click=${this._close} aria-hidden="true"></div>

      <div class="panel ${this._closing ? "closing" : ""}" role="dialog" aria-modal="true" aria-label="Search">
        <div class="panel-header">
          <xe-icon-button aria-label="Back (close search)" @click=${this._close}>
            <xe-icon icon="faChevronLeft" size="md"></xe-icon>
          </xe-icon-button>
          <div class="search-input-row" @mousedown="${this._handleMouseDown}">
            <xe-icon class="search-icon" icon="faMagnifyingGlass" size="sm"></xe-icon>

            <input
              type="text"
              .value="${this._value}"
              placeholder="${this.placeholder}"
              @input="${this._handleInput}"
              @keydown="${this._handleKeyPress}"
              @focus="${this._handleInputFocus}"
              @blur="${this._handleInputBlur}"
              aria-label="${this.placeholder}"
            />

            ${this._value ? b2`
              <xe-icon-button aria-label="Clear search" @click="${(e8) => this._handleClear(e8)}">
                <xe-icon icon="faXmark" size="sm"></xe-icon>
              </xe-icon-button>
            ` : ""}
          </div>
        </div>

        <div class="panel-divider"></div>

        ${this._value ? b2`
          <div class="panel-results">
            <slot name="results"></slot>
          </div>
        ` : A}
      </div>
    `;
  }
};
XESearchDelegate.styles = [xe_search_delegate_default];
__decorate9([
  n4({ type: String })
], XESearchDelegate.prototype, "placeholder", void 0);
__decorate9([
  n4({ type: String })
], XESearchDelegate.prototype, "value", void 0);
__decorate9([
  n4({ type: Boolean, attribute: "keyboard-open" })
], XESearchDelegate.prototype, "keyboardOpen", void 0);
__decorate9([
  r5()
], XESearchDelegate.prototype, "_value", void 0);
__decorate9([
  r5()
], XESearchDelegate.prototype, "_closing", void 0);
__decorate9([
  n4({ type: Boolean, reflect: true, attribute: "keyboard-focused" })
], XESearchDelegate.prototype, "_keyboardFocused", void 0);
__decorate9([
  e5("input")
], XESearchDelegate.prototype, "_input", void 0);
XESearchDelegate = __decorate9([
  t3("xe-search-delegate")
], XESearchDelegate);

// node_modules/@ignite/web/dist/primitives/input-control/search-bar/xe-search-bar.js
var __decorate10 = function(decorators, target, key, desc) {
  var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
  return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
};
var XESearchBar = class XESearchBar2 extends i4 {
  constructor() {
    super(...arguments);
    this.placeholder = "Search...";
    this.value = "";
    this.disabled = false;
    this.collapsed = false;
    this._open = false;
    this._isSearching = false;
    this._delegateOpen = false;
    this._delegateKeyboardOpen = false;
    this._opening = false;
    this._pointerDown = false;
    this._suppressNextFocus = false;
    this._keyboardFocused = false;
  }
  openInline() {
    if (this._open)
      return;
    this._opening = true;
    this._open = true;
    this.updateComplete.then(() => {
      this._input?.focus();
      this._opening = false;
    });
  }
  openDelegate(keyboardOpen = false) {
    this._delegateKeyboardOpen = keyboardOpen;
    this._delegateOpen = true;
  }
  transferToDelegate() {
    this._open = false;
    this._delegateKeyboardOpen = false;
    this._delegateOpen = true;
  }
  transferToInline(value) {
    this._delegateOpen = false;
    this.value = value;
    this._isSearching = value.length > 0;
    this._opening = true;
    this._open = true;
    this.updateComplete.then(() => {
      this._suppressNextFocus = true;
      this._input?.focus();
      this._opening = false;
    });
  }
  updated(changedProperties) {
    if (changedProperties.has("value")) {
      this._isSearching = this.value.length > 0;
    }
    if (changedProperties.has("_open") || changedProperties.has("_delegateOpen")) {
      this.dispatchEvent(new CustomEvent("xe-search-bar-resize", { bubbles: true, composed: true }));
    }
  }
  _handleMouseDown(e8) {
    this._pointerDown = true;
    if (this._open) {
      e8.preventDefault();
      this._keyboardFocused = false;
    }
  }
  _handleInputFocus() {
    if (this._suppressNextFocus) {
      this._suppressNextFocus = false;
      this._pointerDown = false;
      return;
    }
    this._keyboardFocused = !this._pointerDown;
    this._pointerDown = false;
  }
  _handleIconFocus() {
    this._keyboardFocused = !this._pointerDown;
  }
  _handleIconBlur() {
    this._keyboardFocused = false;
  }
  _handleContainerKeyDown(e8) {
    if ((e8.key === "Enter" || e8.key === " ") && this.collapsed && !this._open) {
      e8.preventDefault();
      this.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, cancelable: true }));
    }
  }
  _handleExpandClick(e8) {
    if (this.collapsed) {
      if (!this._open) {
        this._opening = true;
        this._open = true;
        this.updateComplete.then(() => {
          this._input?.focus();
          this._opening = false;
        });
      }
      return;
    }
    const target = e8.target;
    if (target.closest("input") || target.closest(".clear-icon"))
      return;
    this._handleSearch();
  }
  _handleBlur() {
    this._keyboardFocused = false;
    if (this._opening)
      return;
    if (this.collapsed && !this.value) {
      this._open = false;
    }
  }
  _handleInput(e8) {
    const input = e8.target;
    this.value = input.value;
    this._isSearching = this.value.length > 0;
    this.dispatchEvent(new CustomEvent("xe-search-bar-input", {
      bubbles: true,
      composed: true,
      detail: { value: this.value }
    }));
  }
  _handleKeyDown(e8) {
    if (e8.key === "Enter") {
      this._handleSearch();
    } else if (e8.key === "Escape") {
      if (this.collapsed) {
        this.value = "";
        this._isSearching = false;
        this._open = false;
        this._input?.blur();
      } else {
        this._handleClear();
      }
    }
  }
  _handleSearch() {
    this.dispatchEvent(new CustomEvent("xe-search-bar-search", {
      bubbles: true,
      composed: true,
      detail: { value: this.value }
    }));
  }
  _handleClear() {
    this.value = "";
    this._isSearching = false;
    this.dispatchEvent(new CustomEvent("xe-search-bar-clear", {
      bubbles: true,
      composed: true
    }));
    this._input?.focus();
  }
  render() {
    return b2`
      <div class="search-container" @mousedown="${this._handleMouseDown}" @click="${this._handleExpandClick}" @keydown="${this._handleContainerKeyDown}">
        <button
          class="search-icon"
          type="button"
          aria-label="Search"
          aria-expanded="${this.collapsed ? String(this._open) : A}"
          tabindex="${this.collapsed && this._open ? "-1" : "0"}"
          @focus="${this._handleIconFocus}"
          @blur="${this._handleIconBlur}"
        >
          <xe-icon icon="faMagnifyingGlass" size="sm" aria-hidden="true"></xe-icon>
        </button>
        <input
          type="text"
          .value="${this.value}"
          placeholder="${this.placeholder}"
          ?disabled="${this.disabled}"
          @input="${this._handleInput}"
          @keydown="${this._handleKeyDown}"
          @focus="${this._handleInputFocus}"
          @blur="${this._handleBlur}"
          aria-label="Search"
          tabindex="${this.collapsed && !this._open ? "-1" : "0"}"
        />
        <button
          class="clear-icon ${this._isSearching ? "visible" : ""}"
          type="button"
          aria-label="Clear search"
          ?inert="${!this._isSearching}"
          tabindex="${this._isSearching ? "0" : "-1"}"
          @click="${this._handleClear}">
          <xe-icon icon="faXmark" size="sm" aria-hidden="true"></xe-icon>
        </button>
      </div>

      ${this._delegateOpen ? b2`
        <xe-search-delegate
          placeholder="${this.placeholder}"
          value="${this.value}"
          ?keyboard-open="${this._delegateKeyboardOpen}"
          @xe-search-delegate-close="${() => {
      this._delegateOpen = false;
    }}"
          @search="${(e8) => this.dispatchEvent(new CustomEvent("xe-search-bar-search", { bubbles: true, composed: true, detail: e8.detail }))}"
          @clear="${() => this.dispatchEvent(new CustomEvent("xe-search-bar-clear", { bubbles: true, composed: true }))}"
          @input="${(e8) => this.dispatchEvent(new CustomEvent("xe-search-bar-input", { bubbles: true, composed: true, detail: e8.detail }))}"
        >
          <slot slot="results" name="delegate-results"></slot>
        </xe-search-delegate>
      ` : ""}
    `;
  }
};
XESearchBar.styles = xe_search_bar_default;
__decorate10([
  n4({ type: String })
], XESearchBar.prototype, "placeholder", void 0);
__decorate10([
  n4({ type: String })
], XESearchBar.prototype, "value", void 0);
__decorate10([
  n4({ type: Boolean })
], XESearchBar.prototype, "disabled", void 0);
__decorate10([
  n4({ type: Boolean, reflect: true })
], XESearchBar.prototype, "collapsed", void 0);
__decorate10([
  n4({ type: Boolean, reflect: true, attribute: "open" })
], XESearchBar.prototype, "_open", void 0);
__decorate10([
  r5()
], XESearchBar.prototype, "_isSearching", void 0);
__decorate10([
  r5()
], XESearchBar.prototype, "_delegateOpen", void 0);
__decorate10([
  r5()
], XESearchBar.prototype, "_delegateKeyboardOpen", void 0);
__decorate10([
  e5("input")
], XESearchBar.prototype, "_input", void 0);
__decorate10([
  n4({ type: Boolean, reflect: true, attribute: "keyboard-focused" })
], XESearchBar.prototype, "_keyboardFocused", void 0);
XESearchBar = __decorate10([
  t3("xe-search-bar")
], XESearchBar);

// scripts/ignite/dist/compositions/navbar/xe-navbar.js
var __decorate11 = function(decorators, target, key, desc) {
  var c4 = arguments.length, r6 = c4 < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d3;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r6 = Reflect.decorate(decorators, target, key, desc);
  else for (var i6 = decorators.length - 1; i6 >= 0; i6--) if (d3 = decorators[i6]) r6 = (c4 < 3 ? d3(r6) : c4 > 3 ? d3(target, key, r6) : d3(target, key)) || r6;
  return c4 > 3 && r6 && Object.defineProperty(target, key, r6), r6;
};
var XENavbar = class XENavbar2 extends i4 {
  constructor() {
    super(...arguments);
    this.sticky = false;
    this.heroOverlay = false;
    this.searchMode = "auto";
    this._navCollapsed = false;
    this._noSearch = true;
    this._noActions = true;
    this._hasToolbar = false;
    this._scrolled = false;
    this._navbarOpaque = false;
    this._naturalWidth = 0;
    this._searchOpen = false;
    this._delegateOpen = false;
    this._drawerOpen = false;
    this._drawerContentBuilt = false;
    this._logoCompact = false;
    this._lockupLogoWidth = 0;
    this._currentOpacity = 0;
    this._scrollListener = this._handleScroll.bind(this);
    this._drawerCloseListener = this._handleDrawerClose.bind(this);
    this._searchClickListener = this._handleSearchClick.bind(this);
    this._handleSearchResize = () => {
      if (!this.shadowRoot)
        return;
      const searchBar = getSearchBar(this.shadowRoot);
      this._searchOpen = !!searchBar?._open;
      this._delegateOpen = !!searchBar?._delegateOpen;
    };
  }
  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  connectedCallback() {
    super.connectedCallback();
    if (this.heroOverlay) {
      this._updateOverlayBackground();
      window.addEventListener("scroll", this._scrollListener);
      setTimeout(() => this._updateLogoVariant(), 0);
      this._themeObserver = new MutationObserver(() => {
        this._updateOverlayBackground();
        this._updateLogoVariant();
      });
      this._themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"]
      });
    }
    this._resizeObserver = new ResizeObserver(() => this._checkOverflow());
    this._resizeObserver.observe(this);
    document.addEventListener("xe-nav-drawer-close", this._drawerCloseListener);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("scroll", this._scrollListener);
    this._themeObserver?.disconnect();
    this._resizeObserver?.disconnect();
    document.removeEventListener("xe-nav-drawer-close", this._drawerCloseListener);
  }
  async firstUpdated() {
    await this.updateComplete;
    this._hasToolbar = ["toolbar-selector", "toolbar-mobile-selector", "toolbar-links", "toolbar-actions"].some((name) => {
      const slot = this.shadowRoot?.querySelector(`slot[name="${name}"]`);
      return (slot?.assignedElements().length ?? 0) > 0;
    });
    this._updateSearchSlotPresence();
    this._updateActionsSlotPresence();
    this._checkOverflow();
  }
  updated(changedProperties) {
    if (changedProperties.has("heroOverlay")) {
      if (this.heroOverlay) {
        this._updateOverlayBackground();
        window.addEventListener("scroll", this._scrollListener);
      } else {
        window.removeEventListener("scroll", this._scrollListener);
      }
    }
    if (changedProperties.has("_drawerOpen") && this._drawerOpen && !this._drawerContentBuilt) {
      this._buildDrawerContent();
      this._drawerContentBuilt = true;
    }
    if (changedProperties.has("_navCollapsed")) {
      this._updateLogoType();
    }
  }
  // ─── Overflow / collapse detection ──────────────────────────────────────────
  /**
   * Measures the natural width of all flex children and compares it to the
   * navbar's available width to determine whether nav items should be collapsed.
   *
   * Natural width = sum of each flex child's offsetWidth + fixed padding + gaps.
   * This is measured from the actual rendered DOM — not assumed from slot configuration.
   *
   * The recorded value (_naturalWidth) is only updated when the layout is fully
   * stable: nav items in DOM and flex-grow not active. Once nav items are removed,
   * the auto margin fills the gap, and re-measuring would return the navbar's full
   * width — incorrectly suggesting everything fits.
   *
   * If search is currently open inline and the navbar shrinks below the threshold
   * for inline expansion, the search bar is transferred to the delegate (auto mode only).
   */
  _checkOverflow() {
    const navbarEl = this._getNavbarEl();
    if (!navbarEl)
      return;
    if (!this._navCollapsed) {
      this._naturalWidth = this._measureNaturalWidth(navbarEl);
    }
    const UNCOLLAPSE_MARGIN = 32;
    const shouldCollapse = this._naturalWidth > navbarEl.offsetWidth;
    const shouldUncollapse = this._naturalWidth + UNCOLLAPSE_MARGIN <= navbarEl.offsetWidth;
    const newCollapsed = this._navCollapsed ? !shouldUncollapse : shouldCollapse;
    if (newCollapsed !== this._navCollapsed) {
      this._navCollapsed = newCollapsed;
      this._applyCollapseToDrawerVisibility(newCollapsed);
      this._updateActionsSlotPresence();
      if (!newCollapsed && this._drawerOpen) {
        this._drawerOpen = false;
        this._drawerContentBuilt = false;
      }
    }
    if (this.searchMode === "auto" && this.shadowRoot) {
      const searchBar = getSearchBar(this.shadowRoot);
      if (this._searchOpen && shouldTransferWhileOpen(this.shadowRoot)) {
        searchBar?.transferToDelegate?.();
        this._searchOpen = false;
      } else if (this._delegateOpen && !this._navCollapsed && shouldTransferToInline(this.shadowRoot)) {
        const value = searchBar?.value ?? "";
        searchBar?.transferToInline?.(value);
        this._delegateOpen = false;
      }
    }
    this._updateLogoType();
  }
  /**
   * Measures the total natural width of all flex children currently in the DOM,
   * plus the navbar's fixed horizontal padding and inter-child gaps.
   *
   * - Padding: 32px each side = 64px total (content-inset.spacious = space-4xl)
   * - Gap: 32px between each flex child (inline-gap-xl = space-4xl)
   * - Gap count: number of gaps = number of visible children − 1
   */
  _measureNaturalWidth(navbarEl) {
    const PADDING = 64;
    const GAP = 32;
    const children = Array.from(navbarEl.children);
    const visibleChildren = children.filter((el) => el.offsetWidth > 0);
    const childrenWidth = visibleChildren.reduce((sum, el) => sum + el.offsetWidth, 0);
    const gapWidth = Math.max(0, visibleChildren.length - 1) * GAP;
    return PADDING + childrenWidth + gapWidth;
  }
  // ─── Search routing ──────────────────────────────────────────────────────────
  /**
   * Attaches a capture-phase click listener to xe-search-bar and a bubbling
   * xe-search-bar-resize listener to track open/closed state.
   * Called after first render and again whenever the search slot changes.
   */
  _attachSearchListener() {
    if (!this.shadowRoot)
      return;
    const searchBar = getSearchBar(this.shadowRoot);
    if (!searchBar)
      return;
    searchBar.removeEventListener("click", this._searchClickListener, true);
    searchBar.removeEventListener("xe-search-bar-resize", this._handleSearchResize);
    searchBar.addEventListener("click", this._searchClickListener, true);
    searchBar.addEventListener("xe-search-bar-resize", this._handleSearchResize);
  }
  /**
   * Capture-phase click handler. Fires before the search bar's own handler so the
   * navbar can intercept and route the interaction before the bar opens itself.
   *
   * - `delegate`: always open delegate; stop propagation so bar doesn't expand inline.
   * - `inline`: always expand inline; let the event through.
   * - `auto`: measure free space and decide.
   */
  _handleSearchClick(e8) {
    if (!this.shadowRoot)
      return;
    const searchBar = getSearchBar(this.shadowRoot);
    if (!searchBar)
      return;
    if (searchBar._open || searchBar._delegateOpen)
      return;
    const keyboardOpen = e8.detail === 0;
    if (this.searchMode === "delegate") {
      e8.stopPropagation();
      searchBar.openDelegate?.(keyboardOpen);
      return;
    }
    if (this.searchMode === "inline") {
      e8.stopPropagation();
      searchBar.openInline?.();
      return;
    }
    e8.stopPropagation();
    if (shouldOpenDelegate(this.shadowRoot)) {
      searchBar.openDelegate?.(keyboardOpen);
    } else {
      searchBar.openInline?.();
    }
  }
  // ─── Slot presence detection ─────────────────────────────────────────────────
  /**
   * Checks whether the search slot has content and sets [no-search] accordingly.
   * Controls whether actions gets flex-grow:1 as a fallback when nav is collapsed.
   */
  _applyCollapseToDrawerVisibility(collapsed) {
    Array.from(this.querySelectorAll("[data-collapse-to-drawer]")).forEach((el) => {
      el.style.display = collapsed ? "none" : "";
    });
  }
  _markDrawerDirty() {
    this._drawerContentBuilt = false;
  }
  _onLogoSlotChange() {
    this._drawerContentBuilt = false;
    this._lockupLogoWidth = 0;
  }
  _updateSearchSlotPresence() {
    const searchSlot = this.shadowRoot?.querySelector('slot[name="search"]');
    const hasSearch = (searchSlot?.assignedElements().length ?? 0) > 0;
    this._noSearch = !hasSearch;
    this._attachSearchListener();
  }
  _updateActionsSlotPresence() {
    const actionsSlot = this.shadowRoot?.querySelector('slot[name="actions"]');
    const assigned = actionsSlot?.assignedElements() ?? [];
    const hasVisible = assigned.some((el) => {
      const children = Array.from(el.children);
      const candidates = children.length > 0 ? children : [el];
      return candidates.some((candidate) => {
        if (candidate.hasAttribute("data-drawer-only"))
          return false;
        if (this._navCollapsed && candidate.hasAttribute("data-collapse-to-drawer"))
          return false;
        return true;
      });
    });
    this._noActions = !hasVisible;
  }
  /**
  
    // ─── Logo type switching ─────────────────────────────────────────────────────
  
    /**
     * Switches the slotted xe-logo between lockup (full wordmark) and mark (swirl)
     * depending on whether there is enough horizontal room in the navbar for the
     * full logo without squeezing the container padding.
     *
     * The lockup width is captured the first time the logo is measured in its
     * natural state (before any compaction), then reused on every resize tick.
     * The mark is never wider than the lockup, so it never triggers another measurement.
     */
  _updateLogoType() {
    const logoSlot = this.shadowRoot?.querySelector('slot[name="logo"]');
    if (!logoSlot)
      return;
    const logos = logoSlot.assignedElements().filter((el) => el.tagName.toLowerCase() === "xe-logo");
    if (!logos.length)
      return;
    const logoEl = logos[0];
    if (!this._logoCompact && logoEl.offsetWidth > 0) {
      this._lockupLogoWidth = logoEl.offsetWidth;
    }
    if (this._lockupLogoWidth === 0)
      return;
    const logoContainer = this.shadowRoot?.querySelector(".navbar-logo");
    if (!logoContainer)
      return;
    const navbarEl = this._getNavbarEl();
    if (!navbarEl)
      return;
    const siblingWidth = Array.from(navbarEl.children).filter((el) => !el.classList.contains("navbar-logo") && el.offsetWidth > 0).reduce((sum, el) => sum + el.offsetWidth, 0);
    const PADDING = 64;
    const GAP = 32;
    const visibleChildCount = Array.from(navbarEl.children).filter((el) => el.offsetWidth > 0).length;
    const gaps = Math.max(0, visibleChildCount - 1) * GAP;
    const available = navbarEl.offsetWidth - PADDING - siblingWidth - gaps;
    const needsMark = available < this._lockupLogoWidth;
    if (needsMark === this._logoCompact)
      return;
    this._logoCompact = needsMark;
    logos.forEach((logo) => logo.setAttribute("type", needsMark ? "mark" : "lockup"));
  }
  // ─── DOM helpers ─────────────────────────────────────────────────────────────
  _getNavbarEl() {
    return this.shadowRoot?.querySelector(".navbar");
  }
  // ─── Overlay / scroll ────────────────────────────────────────────────────────
  _handleScroll() {
    if (this.heroOverlay)
      this._updateOverlayBackground();
  }
  _updateOverlayBackground() {
    const theme = document.documentElement.getAttribute("data-theme") || "light";
    const rgb = theme === "dark" ? "0, 0, 0" : "255, 255, 255";
    const scrollY = window.scrollY;
    const opacity = Math.min(scrollY / 150, 1);
    this.style.setProperty("--navbar-overlay-bg", `rgba(${rgb}, ${opacity})`);
    const previousOpacity = this._currentOpacity;
    this._currentOpacity = opacity;
    const wasScrolled = this._scrolled;
    this._scrolled = scrollY > 0;
    const threshold = 0.7;
    const crossedThreshold = previousOpacity < threshold && this._currentOpacity >= threshold || previousOpacity >= threshold && this._currentOpacity < threshold;
    this._navbarOpaque = this._currentOpacity >= threshold;
    if (crossedThreshold || wasScrolled !== this._scrolled) {
      this._updateLogoVariant();
    }
  }
  _updateLogoVariant() {
    const logoSlot = this.shadowRoot?.querySelector('slot[name="logo"]');
    if (!logoSlot)
      return;
    const theme = document.documentElement.getAttribute("data-theme") || "light";
    logoSlot.assignedElements().filter((el) => el.tagName.toLowerCase() === "xe-logo").forEach((logo) => {
      const variant = theme === "dark" ? "inverse" : this._currentOpacity >= 0.7 ? "primary" : "inverse";
      logo.setAttribute("variant", variant);
    });
  }
  // ─── Drawer content builder ──────────────────────────────────────────────────
  _buildDrawerContent() {
    const drawer = this.shadowRoot?.querySelector("xe-nav-drawer");
    if (!drawer)
      return;
    Array.from(drawer.children).filter((el) => el.hasAttribute("data-generated")).forEach((el) => el.remove());
    Array.from(this.children).filter((el) => el.getAttribute("slot") === "logo").forEach((el) => {
      const clone = el.cloneNode(true);
      clone.setAttribute("slot", "logo");
      clone.setAttribute("data-generated", "");
      if (clone.tagName.toLowerCase() === "xe-logo") {
        clone.setAttribute("type", "lockup");
        clone.setAttribute("variant", "primary");
      }
      drawer.appendChild(clone);
    });
    const navItemsContainer = Array.from(this.children).find((el) => el.getAttribute("slot") === "nav-items");
    if (navItemsContainer) {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("slot", "nav-items");
      wrapper.setAttribute("data-generated", "");
      Array.from(navItemsContainer.children).filter((el) => el.tagName.toLowerCase() === "xe-nav-item").forEach((navItem) => wrapper.appendChild(this._convertNavItemToDrawerItem(navItem)));
      if (wrapper.children.length)
        drawer.appendChild(wrapper);
    }
    const lightChildren = Array.from(this.children);
    const actionEls = lightChildren.filter((el) => el.getAttribute("slot") === "actions" || el.getAttribute("slot") === "toolbar-actions" || el.getAttribute("slot") === "toolbar-links");
    const forwardedActions = [];
    actionEls.forEach((wrapper) => {
      if (wrapper.hasAttribute("data-navbar-only"))
        return;
      const children = Array.from(wrapper.children);
      if (children.length === 0) {
        forwardedActions.push(wrapper.cloneNode(true));
      } else {
        const kept = children.filter((el) => !el.hasAttribute("data-navbar-only"));
        if (kept.length) {
          const clone = wrapper.cloneNode(false);
          kept.forEach((el) => {
            if (el.tagName.toLowerCase() === "xe-menu-button") {
              clone.appendChild(this._menuButtonToDrawerAction(el));
              return;
            }
            const elClone = el.cloneNode(true);
            if (el.hasAttribute("data-collapse-to-drawer") || el.hasAttribute("data-drawer-only")) {
              elClone.style.display = "";
            }
            if (el.hasAttribute("data-drawer-treatment")) {
              elClone.setAttribute("treatment", el.getAttribute("data-drawer-treatment"));
            }
            clone.appendChild(elClone);
          });
          forwardedActions.push(clone);
        }
      }
    });
    if (forwardedActions.length) {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("slot", "actions");
      wrapper.setAttribute("data-generated", "");
      forwardedActions.forEach((el) => wrapper.appendChild(el));
      drawer.appendChild(wrapper);
    }
    const selectorEls = lightChildren.filter((el) => el.getAttribute("slot") === "toolbar-selector");
    if (selectorEls.length) {
      const wrapper = document.createElement("div");
      wrapper.setAttribute("slot", "selector");
      wrapper.setAttribute("data-generated", "");
      wrapper.style.width = "100%";
      selectorEls.forEach((el) => wrapper.appendChild(el.cloneNode(true)));
      drawer.appendChild(wrapper);
    }
  }
  /**
   * Converts a xe-menu-button to an xe-icon-button that pushes a drawer panel
   * instead of opening a floating menu.
   */
  _menuButtonToDrawerAction(menuButton) {
    const btn = document.createElement("xe-icon-button");
    const ariaLabel = menuButton.getAttribute("label") ?? "Open menu";
    btn.setAttribute("aria-label", ariaLabel);
    const icon = document.createElement("xe-icon");
    const iconName = menuButton.getAttribute("icon") ?? "faEllipsis";
    icon.setAttribute("icon", iconName);
    icon.setAttribute("size", "sm");
    btn.appendChild(icon);
    btn.addEventListener("click", () => {
      const menuItems = Array.from(menuButton.querySelectorAll("xe-menu-item"));
      const children = menuItems.map((item) => {
        const drawerItem = document.createElement("xe-nav-drawer-item");
        drawerItem.setAttribute("label", item.getAttribute("label") ?? "");
        const href = item.getAttribute("href");
        if (href && href !== "javascript:void(0)")
          drawerItem.setAttribute("href", href);
        if (item.hasAttribute("selected"))
          drawerItem.setAttribute("selected", "");
        return drawerItem;
      });
      btn.dispatchEvent(new CustomEvent("xe-nav-drawer-item-expand", {
        bubbles: true,
        composed: true,
        detail: { label: ariaLabel, children }
      }));
    });
    return btn;
  }
  _convertNavItemToDrawerItem(navItem) {
    const item = document.createElement("xe-nav-drawer-item");
    const label = Array.from(navItem.childNodes).filter((n5) => n5.nodeType === Node.TEXT_NODE).map((n5) => n5.textContent?.trim() ?? "").join("").trim();
    item.setAttribute("label", label);
    const href = navItem.getAttribute("href");
    if (href && href !== "javascript:void(0)")
      item.setAttribute("href", href);
    const submenu = navItem.querySelector(':scope > xe-menu[slot="submenu"]');
    if (submenu) {
      Array.from(submenu.children).filter((el) => el.tagName.toLowerCase() === "xe-menu-item").forEach((menuItem) => {
        const child = this._convertMenuItemToDrawerItem(menuItem);
        child.setAttribute("slot", "children");
        item.appendChild(child);
      });
    }
    return item;
  }
  _convertMenuItemToDrawerItem(menuItem) {
    const item = document.createElement("xe-nav-drawer-item");
    item.setAttribute("label", menuItem.getAttribute("label") ?? "");
    const href = menuItem.getAttribute("href");
    if (href && href !== "javascript:void(0)")
      item.setAttribute("href", href);
    const submenu = menuItem.querySelector(':scope > xe-menu[slot="submenu"]');
    if (submenu) {
      Array.from(submenu.children).filter((el) => el.tagName.toLowerCase() === "xe-menu-item").forEach((nested) => {
        const child = this._convertMenuItemToDrawerItem(nested);
        child.setAttribute("slot", "children");
        item.appendChild(child);
      });
    }
    return item;
  }
  // ─── Hamburger / drawer ──────────────────────────────────────────────────────
  _onMenuOpen() {
    this._drawerOpen = true;
    this.dispatchEvent(new CustomEvent("xe-navbar-menu-open", { bubbles: true, composed: true }));
  }
  _handleDrawerClose() {
    this._drawerOpen = false;
    this._drawerContentBuilt = false;
  }
  // ─── Render ──────────────────────────────────────────────────────────────────
  render() {
    return b2`
      ${this._drawerOpen ? b2`
        <xe-nav-drawer
          id="xe-nav-drawer"
          .open="${this._drawerOpen}"
          @xe-nav-drawer-close="${this._handleDrawerClose}">
        </xe-nav-drawer>
      ` : A}

      <div class="toolbar ${this._hasToolbar ? "has-toolbar" : ""}">
        <div class="toolbar-start">
          ${this._navCollapsed ? b2`<slot name="toolbar-mobile-selector"></slot>` : b2`<slot name="toolbar-selector" @slotchange="${this._markDrawerDirty}"></slot>`}
        </div>
        <div class="toolbar-end">
          <div class="toolbar-end-links">
            <slot name="toolbar-links"></slot>
          </div>
          <div class="toolbar-end-actions">
            <slot name="toolbar-actions"></slot>
          </div>
        </div>
      </div>

      <nav class="navbar" aria-label="Main">
        ${this._navCollapsed ? b2`
          <xe-icon-button
            class="navbar-hamburger"
            aria-label="Open navigation menu"
            aria-expanded="${this._drawerOpen}"
            aria-controls="xe-nav-drawer"
            @click="${this._onMenuOpen}">
            <xe-icon icon="faBars" size="sm"></xe-icon>
          </xe-icon-button>
        ` : A}

        <div class="navbar-logo">
          <slot name="logo" @slotchange="${this._onLogoSlotChange}"></slot>
        </div>

        ${!this._navCollapsed ? b2`
          <div class="navbar-nav-items">
            <slot name="nav-items" @slotchange="${this._markDrawerDirty}"></slot>
          </div>
        ` : ""}

        <div class="navbar-right">
          <div class="navbar-search ${this._noSearch ? "no-search" : ""}">
            <slot name="search" @slotchange="${this._updateSearchSlotPresence}"></slot>
          </div>

          ${!this._noActions ? b2`
            <div class="navbar-actions">
              <slot name="actions" @slotchange="${() => {
      this._markDrawerDirty();
      this._updateActionsSlotPresence();
    }}"></slot>
            </div>
          ` : A}
        </div>

        ${this._noActions ? b2`<slot name="actions" style="display:none" @slotchange="${() => {
      this._markDrawerDirty();
      this._updateActionsSlotPresence();
    }}"></slot>` : A}
      </nav>
    `;
  }
};
XENavbar.styles = [xe_navbar_default];
__decorate11([
  n4({ type: Boolean, reflect: true })
], XENavbar.prototype, "sticky", void 0);
__decorate11([
  n4({ type: Boolean, reflect: true, attribute: "hero-overlay" })
], XENavbar.prototype, "heroOverlay", void 0);
__decorate11([
  n4({ type: String, reflect: true, attribute: "toolbar-variant" })
], XENavbar.prototype, "toolbarVariant", void 0);
__decorate11([
  n4({ type: String, attribute: "search-mode" })
], XENavbar.prototype, "searchMode", void 0);
__decorate11([
  n4({ type: Boolean, reflect: true, attribute: "nav-collapsed" })
], XENavbar.prototype, "_navCollapsed", void 0);
__decorate11([
  n4({ type: Boolean, attribute: "no-search" })
], XENavbar.prototype, "_noSearch", void 0);
__decorate11([
  n4({ type: Boolean, attribute: "no-actions" })
], XENavbar.prototype, "_noActions", void 0);
__decorate11([
  n4({ type: Boolean, attribute: "has-toolbar" })
], XENavbar.prototype, "_hasToolbar", void 0);
__decorate11([
  n4({ type: Boolean, attribute: "scrolled" })
], XENavbar.prototype, "_scrolled", void 0);
__decorate11([
  n4({ type: Boolean, reflect: true, attribute: "navbar-opaque" })
], XENavbar.prototype, "_navbarOpaque", void 0);
__decorate11([
  r5()
], XENavbar.prototype, "_drawerOpen", void 0);
XENavbar = __decorate11([
  t3("xe-navbar")
], XENavbar);
export {
  XENavbar
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
lit-html/directive.js:
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

lit-html/directives/class-map.js:
lit-html/directives/if-defined.js:
  (**
   * @license
   * Copyright 2018 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
