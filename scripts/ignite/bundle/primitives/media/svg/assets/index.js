// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t3, e4, o5) {
    if (this._$cssResult$ = true, o5 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3, this.t = e4;
  }
  get styleSheet() {
    let t3 = this.o;
    const s4 = this.t;
    if (e && void 0 === t3) {
      const e4 = void 0 !== s4 && 1 === s4.length;
      e4 && (t3 = o.get(s4)), void 0 === t3 && ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText), e4 && o.set(s4, t3));
    }
    return t3;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t3) => new n("string" == typeof t3 ? t3 : t3 + "", void 0, s);
var S = (s4, o5) => {
  if (e) s4.adoptedStyleSheets = o5.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet);
  else for (const e4 of o5) {
    const o6 = document.createElement("style"), n4 = t.litNonce;
    void 0 !== n4 && o6.setAttribute("nonce", n4), o6.textContent = e4.cssText, s4.appendChild(o6);
  }
};
var c = e ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
  let e4 = "";
  for (const s4 of t4.cssRules) e4 += s4.cssText;
  return r(e4);
})(t3) : t3;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t3, s4) => t3;
var u = { toAttribute(t3, s4) {
  switch (s4) {
    case Boolean:
      t3 = t3 ? l : null;
      break;
    case Object:
    case Array:
      t3 = null == t3 ? t3 : JSON.stringify(t3);
  }
  return t3;
}, fromAttribute(t3, s4) {
  let i5 = t3;
  switch (s4) {
    case Boolean:
      i5 = null !== t3;
      break;
    case Number:
      i5 = null === t3 ? null : Number(t3);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t3);
      } catch (t4) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t3, s4) => !i2(t3, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), a.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
var y = class extends HTMLElement {
  static addInitializer(t3) {
    this._$Ei(), (this.l ??= []).push(t3);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t3, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t3) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t3, s4), !s4.noAccessor) {
      const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t3, i5, s4);
      void 0 !== h3 && e2(this.prototype, t3, h3);
    }
  }
  static getPropertyDescriptor(t3, s4, i5) {
    const { get: e4, set: r4 } = h(this.prototype, t3) ?? { get() {
      return this[s4];
    }, set(t4) {
      this[s4] = t4;
    } };
    return { get: e4, set(s5) {
      const h3 = e4?.call(this);
      r4?.call(this, s5), this.requestUpdate(t3, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t3 = n2(this);
    t3.finalize(), void 0 !== t3.l && (this.l = [...t3.l]), this.elementProperties = new Map(t3.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t4 = this.properties, s4 = [...r2(t4), ...o2(t4)];
      for (const i5 of s4) this.createProperty(i5, t4[i5]);
    }
    const t3 = this[Symbol.metadata];
    if (null !== t3) {
      const s4 = litPropertyMetadata.get(t3);
      if (void 0 !== s4) for (const [t4, i5] of s4) this.elementProperties.set(t4, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t4, s4] of this.elementProperties) {
      const i5 = this._$Eu(t4, s4);
      void 0 !== i5 && this._$Eh.set(i5, t4);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e4 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e4) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t3, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t3 ? t3.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t3) => this.enableUpdating = t3), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t3) => t3(this));
  }
  addController(t3) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(t3), void 0 !== this.renderRoot && this.isConnected && t3.hostConnected?.();
  }
  removeController(t3) {
    this._$EO?.delete(t3);
  }
  _$E_() {
    const t3 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t3.set(i5, this[i5]), delete this[i5]);
    t3.size > 0 && (this._$Ep = t3);
  }
  createRenderRoot() {
    const t3 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t3, this.constructor.elementStyles), t3;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(true), this._$EO?.forEach((t3) => t3.hostConnected?.());
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t3) => t3.hostDisconnected?.());
  }
  attributeChangedCallback(t3, s4, i5) {
    this._$AK(t3, i5);
  }
  _$ET(t3, s4) {
    const i5 = this.constructor.elementProperties.get(t3), e4 = this.constructor._$Eu(t3, i5);
    if (void 0 !== e4 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t3, null == h3 ? this.removeAttribute(e4) : this.setAttribute(e4, h3), this._$Em = null;
    }
  }
  _$AK(t3, s4) {
    const i5 = this.constructor, e4 = i5._$Eh.get(t3);
    if (void 0 !== e4 && this._$Em !== e4) {
      const t4 = i5.getPropertyOptions(e4), h3 = "function" == typeof t4.converter ? { fromAttribute: t4.converter } : void 0 !== t4.converter?.fromAttribute ? t4.converter : u;
      this._$Em = e4;
      const r4 = h3.fromAttribute(s4, t4.type);
      this[e4] = r4 ?? this._$Ej?.get(e4) ?? r4, this._$Em = null;
    }
  }
  requestUpdate(t3, s4, i5, e4 = false, h3) {
    if (void 0 !== t3) {
      const r4 = this.constructor;
      if (false === e4 && (h3 = this[t3]), i5 ??= r4.getPropertyOptions(t3), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t3) && !this.hasAttribute(r4._$Eu(t3, i5)))) return;
      this.C(t3, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t3, s4, { useDefault: i5, reflect: e4, wrapped: h3 }, r4) {
    i5 && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(t3) && (this._$Ej.set(t3, r4 ?? s4 ?? this[t3]), true !== h3 || void 0 !== r4) || (this._$AL.has(t3) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t3, s4)), true === e4 && this._$Em !== t3 && (this._$Eq ??= /* @__PURE__ */ new Set()).add(t3));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return null != t3 && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [t5, s5] of this._$Ep) this[t5] = s5;
        this._$Ep = void 0;
      }
      const t4 = this.constructor.elementProperties;
      if (t4.size > 0) for (const [s5, i5] of t4) {
        const { wrapped: t5 } = i5, e4 = this[s5];
        true !== t5 || this._$AL.has(s5) || void 0 === e4 || this.C(s5, void 0, i5, e4);
      }
    }
    let t3 = false;
    const s4 = this._$AL;
    try {
      t3 = this.shouldUpdate(s4), t3 ? (this.willUpdate(s4), this._$EO?.forEach((t4) => t4.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t3 = false, this._$EM(), s5;
    }
    t3 && this._$AE(s4);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    this._$EO?.forEach((t4) => t4.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
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
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    this._$Eq &&= this._$Eq.forEach((t4) => this._$ET(t4, this[t4])), this._$EM();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ??= []).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t3) => t3;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
var u2 = Array.isArray;
var d2 = (t3) => u2(t3) || "function" == typeof t3?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t3) => (i5, ...s4) => ({ _$litType$: t3, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t3, i5) {
  if (!u2(t3) || !t3.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t3, i5) => {
  const s4 = t3.length - 1, e4 = [];
  let n4, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t3[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n4 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n4 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n4 = void 0);
    const x2 = c4 === p2 && t3[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e4.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t3, l3 + (t3[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e4];
};
var S2 = class _S {
  constructor({ strings: t3, _$litType$: i5 }, e4) {
    let r4;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t3.length - 1, d3 = this.parts, [f3, v2] = N(t3, i5);
    if (this.el = _S.createElement(f3, e4), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t4 = this.el.content.firstChild;
      t4.replaceWith(...t4.childNodes);
    }
    for (; null !== (r4 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r4.nodeType) {
        if (r4.hasAttributes()) for (const t4 of r4.getAttributeNames()) if (t4.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r4.getAttribute(t4).split(o3), e5 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e5[2], strings: s4, ctor: "." === e5[1] ? I : "?" === e5[1] ? L : "@" === e5[1] ? z : H }), r4.removeAttribute(t4);
        } else t4.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r4.removeAttribute(t4));
        if (y2.test(r4.tagName)) {
          const t4 = r4.textContent.split(o3), i6 = t4.length - 1;
          if (i6 > 0) {
            r4.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r4.append(t4[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r4.append(t4[i6], c3());
          }
        }
      } else if (8 === r4.nodeType) if (r4.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t4 = -1;
        for (; -1 !== (t4 = r4.data.indexOf(o3, t4 + 1)); ) d3.push({ type: 7, index: l3 }), t4 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t3, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t3, s4;
  }
};
function M(t3, i5, s4 = t3, e4) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e4 ? s4._$Co?.[e4] : s4._$Cl;
  const o5 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o5 && (h3?._$AO?.(false), void 0 === o5 ? h3 = void 0 : (h3 = new o5(t3), h3._$AT(t3, s4, e4)), void 0 !== e4 ? (s4._$Co ??= [])[e4] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t3, h3._$AS(t3, i5.values), h3, e4)), i5;
}
var R = class {
  constructor(t3, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e4 = (t3?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e4;
    let h3 = P.nextNode(), o5 = 0, n4 = 0, r4 = s4[0];
    for (; void 0 !== r4; ) {
      if (o5 === r4.index) {
        let i6;
        2 === r4.type ? i6 = new k(h3, h3.nextSibling, this, t3) : 1 === r4.type ? i6 = new r4.ctor(h3, r4.name, r4.strings, this, t3) : 6 === r4.type && (i6 = new Z(h3, this, t3)), this._$AV.push(i6), r4 = s4[++n4];
      }
      o5 !== r4?.index && (h3 = P.nextNode(), o5++);
    }
    return P.currentNode = l2, e4;
  }
  p(t3) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t3, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t3[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t3, i5, s4, e4) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t3, this._$AB = i5, this._$AM = s4, this.options = e4, this._$Cv = e4?.isConnected ?? true;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t3?.nodeType && (t3 = i5.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i5 = this) {
    t3 = M(this, t3, i5), a2(t3) ? t3 === A || null == t3 || "" === t3 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t3 !== this._$AH && t3 !== E && this._(t3) : void 0 !== t3._$litType$ ? this.$(t3) : void 0 !== t3.nodeType ? this.T(t3) : d2(t3) ? this.k(t3) : this._(t3);
  }
  O(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  T(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.O(t3));
  }
  _(t3) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t3 : this.T(l2.createTextNode(t3)), this._$AH = t3;
  }
  $(t3) {
    const { values: i5, _$litType$: s4 } = t3, e4 = "number" == typeof s4 ? this._$AC(t3) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e4) this._$AH.p(i5);
    else {
      const t4 = new R(e4, this), s5 = t4.u(this.options);
      t4.p(i5), this.T(s5), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let i5 = C.get(t3.strings);
    return void 0 === i5 && C.set(t3.strings, i5 = new S2(t3)), i5;
  }
  k(t3) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e4 = 0;
    for (const h3 of t3) e4 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e4], s4._$AI(h3), e4++;
    e4 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e4), i5.length = e4);
  }
  _$AR(t3 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t3 !== this._$AB; ) {
      const s5 = i3(t3).nextSibling;
      i3(t3).remove(), t3 = s5;
    }
  }
  setConnected(t3) {
    void 0 === this._$AM && (this._$Cv = t3, this._$AP?.(t3));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t3, i5, s4, e4, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t3, this.name = i5, this._$AM = e4, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t3, i5 = this, s4, e4) {
    const h3 = this.strings;
    let o5 = false;
    if (void 0 === h3) t3 = M(this, t3, i5, 0), o5 = !a2(t3) || t3 !== this._$AH && t3 !== E, o5 && (this._$AH = t3);
    else {
      const e5 = t3;
      let n4, r4;
      for (t3 = h3[0], n4 = 0; n4 < h3.length - 1; n4++) r4 = M(this, e5[s4 + n4], i5, n4), r4 === E && (r4 = this._$AH[n4]), o5 ||= !a2(r4) || r4 !== this._$AH[n4], r4 === A ? t3 = A : t3 !== A && (t3 += (r4 ?? "") + h3[n4 + 1]), this._$AH[n4] = r4;
    }
    o5 && !e4 && this.j(t3);
  }
  j(t3) {
    t3 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === A ? void 0 : t3;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    this.element.toggleAttribute(this.name, !!t3 && t3 !== A);
  }
};
var z = class extends H {
  constructor(t3, i5, s4, e4, h3) {
    super(t3, i5, s4, e4, h3), this.type = 5;
  }
  _$AI(t3, i5 = this) {
    if ((t3 = M(this, t3, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e4 = t3 === A && s4 !== A || t3.capture !== s4.capture || t3.once !== s4.once || t3.passive !== s4.passive, h3 = t3 !== A && (s4 === A || e4);
    e4 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t3) : this._$AH.handleEvent(t3);
  }
};
var Z = class {
  constructor(t3, i5, s4) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    M(this, t3);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ??= []).push("3.3.3");
var D = (t3, i5, s4) => {
  const e4 = s4?.renderBefore ?? i5;
  let h3 = e4._$litPart$;
  if (void 0 === h3) {
    const t4 = s4?.renderBefore ?? null;
    e4._$litPart$ = h3 = new k(i5.insertBefore(c3(), t4), t4, void 0, s4 ?? {});
  }
  return h3._$AI(t3), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const t3 = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= t3.firstChild, t3;
  }
  update(t3) {
    const r4 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Do = D(r4, this.renderRoot, this.renderOptions);
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

// scripts/ignite/dist/primitives/media/svg/assets/solar-panel-illustration.js
var solar_panel_illustration_default = w`<svg width="328" height="395" viewBox="0 0 328 395" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M310.565 136.879C313.627 137.49 316.814 137.278 319.876 137.965C321.301 138.289 325.088 139.462 326.3 140.11C326.725 140.347 327.925 141.295 328 141.707C327.45 142.705 327.475 144.888 326.238 145.113C324.363 145.45 321.926 144.701 319.964 145.375L307.353 144.851L306.64 145.3C304.541 149.729 302.103 154.045 300.054 158.499C288.43 183.661 276.894 208.886 265.096 233.949C261.571 241.446 258.272 249.218 254.422 256.566C252.96 259.373 252.447 260.246 248.998 260.708C248.723 261.095 248.698 269.241 248.86 270.114C249.16 271.723 250.273 270.501 251.06 270.401C253.697 270.052 260.446 271.624 256.447 274.892C259.647 275.017 263.409 272.272 266.421 273.907C266.783 274.106 266.783 274.68 267.221 274.83C267.433 274.905 270.633 275.578 270.808 275.566C271.532 275.541 272.032 274.967 272.72 274.83C276.982 273.932 282.131 273.47 285.468 276.701C283.718 278.36 281.306 277.025 279.394 277.188C278.107 277.3 276.919 278.011 275.582 277.849C274.707 278.547 277.857 279.046 278.144 279.071C279.019 279.159 282.831 279.533 283.331 279.496C284.156 279.421 286.081 277.213 288.28 277.188C289.23 277.175 293.605 277.899 294.479 278.248C295.892 278.822 296.179 280.381 297.854 280.718C300.379 277.599 305.653 277.861 309.09 279.146C311.54 280.057 311.552 281.866 308.99 282.377C308.59 282.452 305.39 282.215 306.265 283.101C310.102 285.109 314.602 284.972 318.801 285.908C325.138 290.823 314.114 289.426 312.839 290.823C311.202 292.619 317.376 292.856 318.226 293.069C318.626 293.168 321.238 294.141 321.526 294.304C322.026 294.566 322.126 295.414 322.088 295.938C320.014 297.185 318.601 295.801 316.651 295.638C315.289 295.526 314.114 296.437 312.977 296.499C310.927 296.611 309.015 295.052 306.915 296.287C307.965 299.381 313.014 299.531 315.814 300.741C316.214 300.915 318.264 301.714 317.476 302.375C315.177 304.296 312.29 302.013 310.065 302.225C309.34 302.3 308.94 303.161 308.14 303.124C306.878 303.061 305.028 301.464 303.716 300.978C302.778 300.628 297.279 298.919 297.029 300.08C298.391 302.026 301.903 302.3 303.953 303.885C303.978 303.922 303.628 304.695 303.541 304.758C302.553 305.469 297.941 305.057 296.617 304.77C294.867 304.408 292.142 302.712 290.455 302.35C288.693 301.976 284.506 301.564 282.731 301.913C281.531 302.15 280.456 302.787 279.219 302.862C279.519 303.41 280.931 303.897 281.506 304.034C284.818 304.795 288.668 304.92 291.88 306.192C292.292 306.355 294.967 307.852 295.079 308.014C296.567 310.309 294.242 310.983 292.28 310.733C290.642 310.521 286.955 308.401 287.093 311.37C285.568 312.305 284.018 310.821 282.606 310.521C281.194 310.222 279.581 310.284 278.207 309.972C275.032 309.236 270.795 306.567 267.508 307.153C265.371 307.54 268.62 309.399 269.133 310.471C269.42 311.07 269.308 311.831 269.658 312.418C268.82 312.642 268.07 312.842 267.183 312.767C264.758 312.555 259.109 307.552 258.609 307.59C258.109 307.627 256.784 309.274 255.472 308.139C254.785 310.097 257.722 311.182 257.097 313.391C256.834 313.465 256.572 313.553 256.309 313.565C253.285 313.69 250.798 311.27 248.198 310.297C247.336 309.972 246.436 310.135 245.486 309.71C244.798 309.411 242.386 307.64 241.786 307.59C240.699 307.727 239.862 309.024 238.999 309.299C235.137 310.559 234.162 305.731 229.9 305.818C228.163 305.856 227.601 307.565 224.939 306.504C223.889 306.093 223.464 305.07 222.651 304.508C221.127 303.46 219.027 302.749 217.69 301.876C215.515 300.466 214.852 295.065 210.316 296.312L210.003 297.722C211.165 298.52 212.178 299.481 213.265 300.379C213.753 300.791 215.965 301.814 215.415 302.862C214.515 304.558 211.278 303.361 209.941 302.699C209.016 302.238 208.328 301.402 207.416 300.94C205.566 300.017 203.591 299.406 201.854 298.258C199.879 297.822 202.129 300.866 202.029 301.365C200.954 302.512 199.055 301.614 197.955 300.841C197.53 300.541 197.317 299.855 197.092 299.73C196.992 299.668 195.855 299.855 195.168 299.68C194.505 299.518 191.993 298.158 191.493 297.734C190.631 296.998 190.956 295.763 190.381 295.052C190.018 294.615 188.681 294.229 188.181 293.792C186.919 292.719 185.119 289.812 183.132 290.399C180.332 291.222 185.719 294.528 185.844 295.152C186.419 297.896 178.607 294.229 177.52 294.329C176.782 293.829 174.77 289.812 174.008 289.164C173.383 288.64 169.633 287.305 170.021 288.864C171.071 289.326 175.295 293.505 172.82 293.967C169.846 294.528 167.984 292.12 165.559 291.31C164.059 290.811 161.672 290.574 160.097 290.212C159.372 290.05 158.597 289.413 157.947 289.376C156.998 289.313 155.873 290.336 154.86 290.549C153.673 290.786 149.686 290.149 148.799 289.401C148.449 289.101 148.436 288.278 148.061 287.742C146.636 285.671 144.549 283.151 141.975 282.789L142.487 285.434C140.6 286.669 139.362 285.059 138.038 284.623C137.6 284.486 137 284.735 136.363 284.536C135.025 284.111 129.614 280.78 128.926 280.893C127.376 281.741 129.314 282.864 128.626 283.812C126.014 285.234 125.377 282.939 123.664 282.128C121.615 281.155 118.89 281.666 117.303 280.893C116.34 280.419 113.603 277.662 113.353 277.587C111.916 277.138 109.679 277.836 108.079 277.724C106.479 277.612 105.054 276.913 103.517 276.863C102.605 276.838 101.955 277.287 100.967 277.125C97.9679 276.651 92.7435 272.447 89.6564 271.337C87.4442 272.871 89.4315 273.757 89.8189 275.541C87.4942 275.728 85.8445 275.541 83.7697 274.493C82.7324 273.969 81.0951 272.322 80.2702 272.06C78.5454 271.511 77.0956 272.597 75.6083 272.098C75.0209 271.898 74.7084 271.299 74.2835 271.112C69.9466 269.179 67.6094 267.145 62.7475 265.835C61.6976 265.548 60.0104 264.525 59.1355 264.8C58.1856 265.099 57.8357 266.147 56.3608 265.985C55.7609 265.923 55.2735 265.411 54.6611 265.349C53.1488 265.174 52.0364 265.448 50.4116 264.987C49.5617 264.75 48.0994 263.689 47.7495 263.689C47.312 263.689 46.4622 264.45 45.6873 264.6C43.5125 265.012 40.6879 264.45 39.963 262.217L40.5254 261.419C41.6628 261.344 42.6627 261.943 43.775 262.043C48.9368 262.504 45.1873 260.221 45.3623 258.575C46.7246 256.604 48.7993 257.589 50.6241 258.163C53.3612 259.036 55.7734 260.67 58.4481 261.382C59.4354 260.396 53.5487 258.076 55.8109 256.279C59.123 255.393 61.6851 257.19 64.5348 258.412C65.4347 255.942 66.9344 257.065 69.0092 257.115C69.2966 256.866 66.347 253.56 69.5341 253.173C72.1713 252.849 73.4336 256.429 75.4458 257.776C76.1957 257.913 75.8958 257.452 75.9333 256.965C75.9958 256.055 75.8208 255.119 75.9833 254.208C76.9331 253.435 77.4581 254.433 78.0705 254.47C79.1328 254.533 79.3953 253.535 81.2701 254.258C83.5823 255.156 82.2574 256.554 84.0197 257.776L84.7821 257.24L84.5071 238.178C83.5822 237.392 79.4578 237.529 78.108 237.329C66.7845 235.583 55.386 233.849 44.05 232.127C40.013 231.516 34.4887 231.316 30.7142 230.293C28.1646 229.607 25.4149 226.576 24.765 224.018L77.5705 140.023L9.29206 140.846C9.34205 139.274 11.5543 139.998 12.7166 139.823C24.0276 138.102 35.976 139.137 47.387 138.202C48.3619 138.127 49.6492 137.827 50.5241 137.391C50.1992 136.942 49.8742 136.754 49.3618 136.567C35.5386 131.515 21.428 130.317 6.79239 130.292C6.00499 130.292 5.29259 130.654 4.51769 130.654C4.01776 130.654 0.418231 130.143 0.243254 130.018C-0.0567062 129.968 -0.0192111 129.357 0.0432806 129.17C0.168264 128.783 6.62991 126.712 7.56729 126.462C11.7792 125.34 19.3532 124.042 23.6402 124.067C26.9772 124.08 30.9767 125.277 34.4762 125.265C39.9505 125.24 44.7249 123.044 50.0242 122.745C56.5233 122.371 66.8845 124.554 73.3836 126.138C77.2456 127.074 80.8701 128.745 84.6446 129.968L90.9688 119.164C92.7435 117.218 94.3808 118.054 96.5555 117.83C107.992 116.607 119.627 116.644 131.138 116.046C153.823 114.861 176.37 113.189 199.154 111.891C229.813 110.145 260.309 108.96 291.092 107.438C298.191 107.088 305.59 106.128 312.639 106.153C316.339 106.165 315.927 108.336 317.364 110.819C318.976 113.588 320.876 114.361 319.464 118.067L310.502 136.942L310.565 136.879ZM156.823 239.65L246.736 250.553L312.077 111.168C311.44 110.332 302.928 111.417 301.179 111.517C277.707 112.79 253.822 113.725 230.563 115.147C227.901 115.31 225.214 115.796 222.539 115.871C220.227 119.888 217.927 123.93 215.752 128.034C208.041 142.593 200.867 157.463 193.168 172.034C184.081 189.238 174.295 206.229 165.209 223.507C162.384 228.884 160.135 234.547 156.81 239.662L156.823 239.65ZM216.865 115.796C211.09 116.12 205.304 116.158 199.529 116.445C188.968 116.956 178.42 117.767 167.871 118.428C163.034 118.728 158.11 118.428 153.336 119.401C138.637 145.013 123.427 170.363 108.379 195.737C101.93 206.615 95.3807 217.469 88.9065 228.347C88.7066 228.672 87.4067 230.98 87.5317 231.092L152.711 238.365L216.852 115.809L216.865 115.796ZM148.911 119.426C145.349 119.601 141.762 119.576 138.2 119.763C128.139 120.262 117.953 121.248 107.854 121.747C103.43 121.959 98.9177 121.797 94.4808 122.233C91.8562 125.664 89.8189 129.432 87.4942 133.037C69.6716 160.682 51.799 188.277 33.8638 215.86C32.214 218.392 30.1268 220.775 28.5145 223.357L84.1197 230.131L148.924 119.426H148.911ZM154.473 261.02C154.223 257.689 154.773 254.071 154.66 250.815C154.623 249.917 154.585 247.572 153.636 247.297L97.7804 239.65L97.4554 257.764C99.2052 258.138 102.43 254.495 103.555 254.495C105.392 254.495 105.454 256.678 104.38 257.764C106.067 257.789 107.092 256.391 108.866 256.154C110.266 255.967 114.741 255.593 114.891 257.34L114.478 258.126C113.328 258.999 110.791 257.564 110.654 259.423C110.991 259.71 117.378 258.575 118.403 258.437C119.24 258.325 120.165 258.55 121.015 258.412C122.715 258.15 125.327 255.73 126.402 258.6L125.164 260.072C126.527 260.209 127.451 259.261 128.751 258.961C130.439 258.562 134.651 258.887 136.475 259.173C137.938 259.398 139.987 260.77 141.175 260.758C143.412 260.733 144.737 257.913 148.186 259.672C148.774 259.972 148.836 260.77 149.586 260.745L148.274 262.055C150.348 261.544 152.548 262.03 154.498 261.02H154.473ZM88.8691 248.046V262.205C88.8691 263.665 90.5813 264.45 90.7813 262.13C90.9563 260.059 90.5063 257.639 90.4938 255.618C90.4813 253.597 90.9313 250.566 90.7563 248.744C90.6313 247.522 89.144 247.11 88.8691 248.046ZM168.708 249.206V261.893C168.708 261.893 169.221 262.467 169.358 262.38C169.296 261.157 171.933 261.232 172.82 261.406C173.708 261.581 174.395 262.829 175.483 263.028C178.345 263.552 185.194 262.242 187.681 264.351C188.193 264.787 188.331 265.723 189.068 265.96C189.718 266.172 191.168 265.623 192.193 265.76C194.243 266.035 196.905 267.706 198.305 267.943C199.217 268.093 200.442 267.133 201.529 266.995C203.566 266.746 211.19 266.796 212.828 267.594C213.553 267.956 214.202 269.016 214.877 269.166C215.427 269.291 216.49 268.405 217.365 268.38C219.439 268.318 220.639 269.84 221.727 269.89C222.701 269.927 223.276 268.779 224.126 268.48C226.501 267.632 230.275 267.582 232.713 268.33C233.312 266.833 233.4 266.06 232.775 264.55L233.287 259.248C233.213 258.862 232.65 258.774 232.338 258.674C228.751 257.439 220.252 256.803 216.015 256.192C203.841 254.433 191.63 252.986 179.482 251.164C175.883 250.628 172.308 249.83 168.721 249.231L168.708 249.206ZM160.047 275.479C160.535 274.93 160.11 271.05 160.11 270.139C160.11 267.557 160.285 264.737 160.122 262.192C160.035 260.82 159.997 258.974 158.31 260.396L158.485 275.878C158.635 276.015 159.835 275.716 160.06 275.466L160.047 275.479Z" fill="currentColor"/><path d="M293.08 16.3187C296.117 14.8591 299.629 14.3601 302.316 16.8053C304.391 18.689 303.629 20.3482 304.279 22.7684C306.078 23.0803 307.541 21.5583 309.353 21.6082C314.24 21.7579 317.727 24.9391 318.914 29.5424C319.664 32.4616 319.014 32.1747 318.552 34.3329C318.152 36.2416 318.327 38.7865 316.152 39.8719C315.665 40.1214 311.953 37.8384 310.678 37.7262C309.565 37.6264 304.216 38.1004 303.229 38.4747C302.404 38.7865 300.204 40.3834 299.492 41.0196C299.317 41.1818 297.804 42.8036 298.017 42.9782C299.792 43.5396 301.341 42.7162 302.966 43.4772C303.804 43.8764 304.841 44.5251 303.966 45.4608C301.279 45.9099 298.504 45.6479 295.967 46.7083C294.755 47.2198 293.518 48.5546 292.318 48.1928C291.88 48.0681 290.455 46.8829 290.405 46.4338C290.243 44.7247 292.905 42.342 292.255 39.0111C291.88 37.0774 288.293 33.4596 286.481 32.9232C284.381 32.2995 282.007 33.6967 281.007 33.1228C279.744 32.3993 279.407 30.6403 278.682 29.4925C278.095 28.507 275.52 27.7335 277.87 26.985C280.219 26.2365 280.307 27.9082 282.169 28.1577C282.894 26.2989 280.607 23.7789 279.044 22.8807C276.207 21.2589 273.595 21.2215 270.783 22.8807C270.008 23.3298 268.883 24.6646 268.421 24.8019C267.321 25.1262 265.509 24.727 264.221 24.9017C259.335 25.5379 253.373 30.3533 255.123 35.7426L256.035 35.1687C257.197 32.786 260.397 28.7066 263.359 31.289C262.822 32.9482 260.597 32.5739 259.51 33.5345C257.072 35.7177 258.197 40.3834 257.76 43.315C257.035 43.5146 256.61 42.7786 256.022 42.7412C255.16 42.7038 252.423 42.9533 251.436 43.0905C249.898 43.315 245.324 45.0616 244.749 44.9742C244.312 44.9119 243.812 44.6249 243.912 44.1384C245.336 42.8285 247.086 42.7412 247.874 40.6828C243.149 39.2731 235 41.8055 235.15 47.594C235.738 48.7667 237.825 47.6439 238.15 49.2158C238.45 50.7003 236.463 50.7877 235.75 51.137C235.238 51.3865 234.838 52.0477 234.438 52.1475C233.813 52.3096 232.588 51.5112 231.551 51.5237C229.139 51.5611 226.851 51.9853 225.089 53.6694C223.427 55.2538 223.377 55.8775 223.777 58.1231C222.377 57.6865 221.415 58.6595 220.327 58.7967C219.04 58.9714 217.84 58.3975 216.765 58.5098C215.603 58.6346 213.841 59.695 212.566 59.932C210.878 60.2563 208.466 60.1565 206.554 60.5183C205.842 60.6555 204.629 60.6431 204.317 61.4041C208.004 61.7035 211.678 61.7284 215.39 61.7534C224.102 61.8033 233.375 61.8282 242.099 61.4415C243.549 61.3791 246.399 60.5308 247.049 60.5433C247.561 60.5433 248.536 61.6161 249.998 61.7534C255.085 62.2274 261.009 60.5807 266.184 61.666C276.857 61.1047 287.856 60.5058 298.504 60.9425C299.779 60.9924 308.928 61.7409 304.529 64.1236C301.391 65.8078 293.692 64.7848 289.918 65.0219C282.994 65.4585 276.02 65.708 269.146 66.0199C264.096 66.2444 258.297 65.9949 253.335 67.0304C252.935 67.1177 252.548 67.1801 252.485 67.6666C259.247 68.5399 265.984 68.5523 272.783 68.6771C276.732 68.7395 280.657 68.8393 284.644 68.989C285.581 69.0264 286.631 68.2654 287.756 69.0139V69.9496C287.118 70.0618 286.518 70.4486 285.881 70.5608C283.881 70.9101 281.957 70.5234 280.344 70.6357C266.509 71.6212 252.86 71.9082 239.112 71.6212C234.175 71.5214 228.876 71.6212 223.927 71.3093C222.489 71.222 219.152 71.247 219.49 69.3258C226.926 67.6916 234.713 68.465 242.249 67.6666C240.674 66.0323 237.625 66.8058 235.488 66.6811C228.764 66.2819 222.952 65.8951 216.115 65.9325C206.042 65.9824 195.755 65.8203 185.707 65.7205C182.607 65.6955 179.32 65.9201 176.183 65.2838C168.984 63.8118 175.533 60.6306 179.258 60.5932C179.658 60.3811 179.195 59.3706 179.595 58.672C181.657 55.154 186.532 54.8296 190.131 55.628C190.919 55.8027 192.143 56.7758 192.768 56.3267C193.418 54.0686 193.531 52.896 195.318 51.1869C198.405 48.2427 202.705 46.833 206.879 48.118C207.629 48.3425 208.466 49.2158 209.091 49.2033C209.779 49.1784 211.628 47.4568 212.866 47.881C212.778 44.4378 213.678 40.9448 215.84 38.2626C218.69 34.7321 224.139 32.9482 228.551 32.7486C231.726 32.5989 232.476 33.5719 234.8 35.3808C235.7 34.021 236.925 32.786 238.6 32.4117C234.8 27.3343 236.837 21.8702 240.737 17.5912C244.212 13.7863 248.823 13.5867 253.11 16.2813C252.173 12.0647 253.273 9.24531 256.247 6.38849C264.434 -1.47087 277.72 -2.04473 287.206 4.47979C289.98 6.38849 292.043 8.83363 292.63 12.2394C292.868 13.5742 292.493 14.9465 293.043 16.2813L293.08 16.3187Z" fill="currentColor"/><path d="M70.0589 72.9685C72.0462 72.1326 72.9336 70.7604 75.2583 70.4235C80.72 69.6376 85.3194 71.7334 86.1443 77.5094C86.2568 78.3203 85.4569 78.8692 86.4193 79.5304C88.0816 80.6781 88.9565 78.8193 90.3688 78.5948C93.8683 78.0334 99.0926 79.1686 99.1301 83.4851C100.717 83.1732 101.93 84.6577 103.242 84.8324C104.554 85.007 106.317 84.4207 107.779 84.5454C109.316 84.6702 114.103 85.768 114.291 87.6642L113.053 89.3858C111.528 89.2611 110.016 89.7226 108.516 89.7975C95.5556 90.4836 78.7578 90.9577 65.9345 90.1219C65.0971 90.0719 61.1851 89.6852 61.1726 88.9492C61.3976 88.6248 61.5976 88.525 61.9975 88.4502C64.2722 88.0634 66.6344 88.3254 68.8966 88.1009C70.9963 87.8763 73.271 87.3025 75.5082 87.1278C78.1954 86.9282 80.97 87.4397 83.6072 86.6413C82.8198 86.1173 81.8074 85.3439 80.97 84.9945C79.7202 84.4831 74.7083 83.6472 74.4459 83.4352C74.3459 83.3478 73.796 81.8383 73.221 81.2021C71.5462 79.3433 69.0716 79.3059 66.7844 79.8922C68.0092 74.2285 59.7978 69.2633 55.7108 73.2928C54.7235 74.2659 55.6109 75.1017 55.3859 75.6382C54.661 77.3847 52.9362 75.1891 52.3488 75.0269C51.6739 74.8398 50.8865 75.0518 50.1741 74.8897C48.9367 74.6152 48.2868 73.2804 46.2996 73.455C44.5123 73.6172 40.5503 76.8108 41.0753 78.6946C41.3252 79.5803 45.2372 79.9172 45.9871 81.0524C45.5372 81.7884 45.1622 81.4391 44.5873 81.4516C41.4127 81.5265 36.9508 81.726 36.7508 85.8304C36.9508 86.0425 41.0753 85.7555 41.8502 85.8179C44.1374 85.9926 44.9248 86.1672 47.4619 86.1547C51.1614 86.1173 54.9109 86.1547 58.5105 86.8409V87.8015C57.5231 87.8264 56.7232 88.3628 55.7233 88.4626C49.9866 89.0365 39.9504 89.286 34.2387 88.9866C32.4764 88.8993 30.2267 88.2256 28.352 88.1133C24.4775 87.8888 20.0905 88.3628 16.416 88.2381C14.9787 88.1882 13.6164 88.7122 12.3291 87.29C11.9291 85.531 19.0407 85.0944 20.178 84.7575C20.8904 81.5764 21.7028 79.0688 24.9024 77.7714C27.702 76.6487 29.2018 76.6487 31.6265 78.5574L35.3885 76.5489C33.6263 69.4255 40.3379 63.1256 47.137 66.6935C47.9494 65.5707 47.4494 64.7224 48.6118 63.5622C53.2362 58.9214 63.8473 60.6305 67.3718 65.9325C68.8341 68.1406 69.309 70.4734 70.0714 72.956L70.0589 72.9685Z" fill="currentColor"/><path d="M41.6003 331.005C41.6877 331.042 41.7002 331.442 41.7752 331.467C42.0877 331.579 42.4376 331.292 42.6751 331.417C43.3125 331.729 45.4997 333.201 45.9247 333.75C46.2246 334.136 46.8996 335.558 46.9621 336.033C47.1495 337.579 45.7372 339.076 46.8121 340.124C50.5866 338.602 58.5105 336.931 57.5232 343.418C58.8855 343.318 65.8096 342.582 65.7846 344.902C65.7721 347.086 61.2102 345.401 60.3603 345.489C55.3234 346.05 52.7613 345.127 48.1119 345.04C46.4746 345.002 44.7623 345.913 43.1626 345.751C41.3378 345.564 40.6254 343.343 39.538 343.243C38.0132 343.093 35.5511 344.815 33.6013 344.765C30.2018 344.69 26.7147 341.809 22.8527 342.582C18.7283 343.405 18.6908 343.917 14.0039 343.617C12.0667 343.493 9.26702 344.341 9.81695 341.097C11.9167 339.875 13.9664 340.025 16.2661 340.449C16.741 334.935 25.4649 333.824 28.652 337.492C30.7017 335.633 31.1766 332.702 33.8638 331.504C35.3011 330.868 40.3379 330.469 41.5878 331.018L41.6003 331.005Z" fill="currentColor"/><path d="M153.198 315.411C155.735 314.513 158.01 312.941 160.46 314.912C165.484 318.942 156.81 317.794 155.023 317.707C149.999 317.482 144.724 317.033 139.5 316.721C136.263 316.522 134.701 315.835 131.338 316.821C130.839 316.971 130.614 317.582 129.926 317.719C128.239 318.056 126.164 317.445 124.614 317.432C123.377 317.42 120.54 318.093 119.678 317.432L119.203 316.559C119.065 314.937 121.477 314.912 122.69 314.775C123.09 314.725 123.59 315.087 123.964 315.025C124.189 314.987 126.589 313.016 127.801 312.629C130.714 311.706 132.301 312.891 133.913 312.654C134.476 312.567 136.225 310.471 137.45 310.072C140.975 308.924 144.087 309.698 145.824 313.103C146.774 313.128 147.136 312.305 148.124 312.143C149.786 311.868 153.998 313.041 153.198 315.424V315.411Z" fill="currentColor"/><path d="M285.431 329.995C288.543 329.845 291.217 331.33 292.08 334.386C294.179 333.775 298.154 334.948 297.704 337.63C297.254 340.312 291.63 338.503 289.655 339.426C284.756 338.204 279.531 338.678 274.457 338.453C273.332 338.403 268.245 338.753 267.82 338.154C266.583 336.37 269.52 335.048 270.845 334.549C273.245 333.625 275.794 333.813 278.319 334.137C280.506 331.604 281.856 330.157 285.431 329.995Z" fill="currentColor"/><path d="M88.5449 324.967C90.7571 324.406 94.5691 323.607 96.1314 325.778C96.5189 326.327 96.6564 327.512 97.1063 327.774C97.8812 328.223 99.706 327.687 100.406 329.084C97.7437 331.616 93.3443 328.884 90.0197 328.884C88.6449 328.884 87.4326 330.132 86.4452 329.92C86.1703 329.857 86.0453 329.109 85.5453 328.76C81.3834 325.853 76.3215 327.911 72.1471 328.884C67.3227 330.007 64.9231 326.527 69.9849 324.73C72.1471 323.957 72.7095 324.655 74.5093 324.655C76.409 324.655 76.1716 322.934 77.4589 321.649C80.5585 318.567 88.8574 319.441 88.5324 324.955L88.5449 324.967Z" fill="currentColor"/><path d="M54.7987 296.225C54.9112 296.175 56.0485 294.828 56.5485 294.528C58.5607 293.293 61.7228 293.019 63.8725 294.092C64.6724 294.491 64.8724 295.402 65.8972 295.339C66.7596 295.289 67.7095 294.117 68.9343 294.017C70.0967 293.929 70.8841 294.853 71.8465 294.69C72.0089 294.666 72.1964 293.056 74.0337 292.545C77.6957 291.534 81.2452 293.193 81.5827 297.161C84.7948 296.337 87.9818 300.017 83.2949 300.404C80.8703 300.604 79.6079 299.668 77.7207 299.344C76.7333 299.182 75.7459 299.394 74.8461 299.244C73.7587 299.069 72.1839 298.208 70.9091 298.358C69.7342 298.495 67.2846 300.841 65.2598 299.93C60.6854 297.859 55.3861 299.718 50.7367 298.296C49.4494 296.462 54.3488 296.387 54.7987 296.212V296.225Z" fill="currentColor"/><path d="M9.35471 291.696C9.51718 287.903 13.4542 290.261 15.4789 289.413C16.7412 288.889 16.5538 288.053 17.2662 287.242C19.4534 284.772 24.0278 283.575 26.9399 285.483C28.3272 286.394 28.2147 287.966 29.7895 288.265C31.0643 288.515 31.8017 287.467 32.9641 287.417C34.3139 287.354 37.0011 288.677 37.0885 290.199C37.3885 295.039 28.8771 292.631 26.34 292.644C24.8277 292.644 23.5403 293.417 22.0655 293.343C19.0409 293.205 14.8915 292.12 11.8419 291.671C11.067 291.559 10.1546 291.771 9.35471 291.671V291.696Z" fill="currentColor"/><path d="M52.9114 313.44C54.7611 313.714 55.936 312.517 57.7482 312.267C62.0227 311.656 64.6973 315.71 59.9354 316.272C55.9235 316.758 50.2492 315.199 46.0998 315.124C43.5876 315.074 39.5631 316.072 37.2134 315.773C36.851 315.723 36.501 315.71 36.2136 315.448C34.3513 311.631 40.9504 312.891 42.4627 312.404C43.0127 312.217 43.2252 311.095 43.8751 310.521C46.8122 307.976 53.0739 308.999 52.8989 313.44H52.9114Z" fill="currentColor"/><path d="M216.324 349.295C216.612 348.833 220.986 348.047 221.686 348.546C222.098 348.446 222.298 347.386 222.673 346.924C223.973 345.34 228.423 344.404 230.235 345.34C232.047 346.276 232.185 348.771 232.61 348.908C233.359 348.995 233.884 348.359 234.584 348.259C236.197 348.047 240.608 349.844 238.471 351.515C236.921 352.738 229.897 351.615 227.635 351.54C224.336 351.428 222.798 351.74 219.349 351.241C217.636 351.004 215.762 351.989 216.299 349.295H216.324Z" fill="currentColor"/><path d="M166.147 340.224C166.035 340.274 166.085 340.973 165.597 340.798L164.235 340.137C163.548 339.039 165.685 337.929 166.597 337.829C167.51 337.729 168.534 338.316 169.147 338.116C169.884 337.879 170.334 335.858 171.172 335.172C173.296 333.438 176.533 333.513 178.908 334.723C181.283 335.933 180.783 337.941 181.583 338.328C183.482 337.954 186.02 338.328 186.869 340.287C186.869 342.732 180.52 340.686 179.445 340.611C177.683 340.486 175.621 341.297 174.221 341.322C172.071 341.372 167.997 339.376 166.16 340.224H166.147Z" fill="currentColor"/><path d="M291.367 232.501C291.492 232.689 291.38 233.1 291.455 233.35C293.967 234.048 296.442 231.653 298.829 232.09C299.404 232.19 299.791 232.776 300.504 232.776C301.304 232.776 302.166 231.903 303.416 231.878C304.966 231.853 308.453 233.188 307.128 235.071C306.715 235.658 301.391 235.321 300.179 235.383C296.717 235.57 296.129 235.658 292.58 235.383C289.768 235.171 286.568 235.807 283.981 236.019C282.806 236.107 279.281 236.706 278.719 235.72C277.457 233.524 282.943 234.348 283.206 234.235C283.693 233.998 284.493 232.414 286.093 231.865C287.28 231.454 290.692 231.553 291.367 232.514V232.501Z" fill="currentColor"/><path d="M50.7744 154.544C51.8368 154.544 62.1479 154.569 62.1354 155.829C61.7355 156.303 61.223 156.552 60.6231 156.64C58.0235 157.014 53.3616 156.902 50.437 157.002C45.1752 157.189 39.9758 157.002 34.5891 156.964C30.6521 156.939 26.7401 157.426 22.7656 156.939C21.8657 156.827 20.8284 156.615 20.2659 155.829C20.2659 155.018 25.5402 155.38 26.3776 155.355C34.4391 155.093 42.6255 154.631 50.7994 154.556L50.7744 154.544Z" fill="currentColor"/><path d="M130.102 346.05C131.226 345.24 132.889 346.375 133.176 346.325C133.576 346.275 134.526 345.227 135.588 345.165C138.825 344.953 140.238 347.81 136.551 348.034C135.101 348.121 133.914 347.485 132.901 347.51C129.189 347.61 127.015 347.223 123.627 347.148C122.253 347.111 117.578 347.922 116.641 347.31C115.366 344.429 119.465 345.402 120.665 344.366C121.253 343.867 121.128 343.181 121.74 342.807C124.665 341.011 129.827 342.333 130.102 346.05Z" fill="currentColor"/><path d="M307.928 261.719C306.766 262.005 305.704 262.367 304.479 262.405C301.629 262.48 298.529 261.544 295.905 261.382C293.618 261.244 289.893 263.178 288.018 261.357C286.644 260.034 289.156 258.7 290.368 258.487C291.768 258.25 293.693 259.847 295.255 259.61C296.03 259.485 297.092 257.19 300.067 257.302C302.879 257.415 303.304 258.762 305.179 260.022C306.091 260.633 307.466 260.621 307.928 261.719Z" fill="currentColor"/><path d="M309.903 330.569L295.38 329.72C296.055 326.377 300.867 325.566 303.641 326.452C304.804 326.826 305.554 327.999 306.179 328.198C307.716 328.672 309.978 327.824 309.903 330.569Z" fill="currentColor"/><path d="M188.832 327.6C189.457 323.92 194.806 323.52 197.643 324.893C198.418 325.267 198.893 326.215 199.393 326.44C200.468 326.914 202.38 326.527 203.342 327.762L201.543 328.747C197.331 328.049 192.944 328.697 188.832 327.587V327.6Z" fill="currentColor"/><path d="M118.453 300.691C118.703 300.865 118.79 301.551 119.203 301.751C119.853 302.063 120.615 301.801 121.278 301.988C121.865 302.15 123.84 302.699 123.177 303.398C122.002 304.658 115.978 303.46 114.091 303.223C113.179 303.111 109.304 303.36 108.992 302.362C108.642 300.953 111.791 299.443 112.791 299.281C114.328 299.031 117.178 299.792 118.453 300.678V300.691Z" fill="currentColor"/><path d="M37.4013 264.039V265.012C35.6515 265.76 33.6768 264.812 32.2895 264.837C31.4646 264.85 30.5147 265.636 29.7023 265.586C29.2149 265.561 28.7274 265.124 28.2525 265.087C26.7777 264.962 23.3281 266.334 23.2657 263.752C24.553 262.766 26.3777 263.016 27.6026 262.641C28.1525 262.467 28.5775 261.656 29.2524 261.319C30.9521 260.471 34.1642 260.87 34.0767 263.215L37.4013 264.039Z" fill="currentColor"/><path d="M17.6036 211.98C19.6033 211.53 21.3281 211.406 23.2154 212.316C23.4778 213.177 22.3405 213.252 21.7406 213.302C19.5159 213.501 18.341 212.741 16.7662 212.666C15.3289 212.591 12.2918 213.115 10.3046 213.152C9.71715 213.152 7.0425 214.1 6.73004 212.803C6.3176 211.106 11.4419 211.942 12.0293 211.505C12.4293 211.219 12.2168 210.196 12.8042 209.647C14.3415 208.224 19.3784 209.048 17.6161 211.967L17.6036 211.98Z" fill="currentColor"/><path d="M268.946 41.3941L269.183 42.6666C268.421 43.4276 266.808 43.4899 266.159 44.2759C265.509 45.0618 265.859 46.0349 265.371 46.459C264.959 46.8208 258.66 49.1537 258.247 47.6068C259.884 43.8642 264.734 40.7828 268.933 41.3941H268.946Z" fill="currentColor"/><path d="M145.024 369.828C145.087 369.716 146.662 368.406 146.924 368.269C148.299 367.582 150.499 367.545 151.861 368.306C152.536 368.693 153.023 369.716 153.861 369.965C154.923 370.277 157.51 369.005 158.16 371.238C157.885 372.41 152.573 371.512 151.411 371.487C150.499 371.475 143.425 372.635 145.037 369.828H145.024Z" fill="currentColor"/><path d="M302.479 164.212L301.992 163.389C302.179 162.478 305.491 162.279 306.429 162.216C309.316 162.029 316.227 161.879 318.952 162.266C321.677 162.653 320.814 164.212 319.639 164.212H302.479Z" fill="currentColor"/><path d="M281.107 253.584C281.307 253.721 281.419 254.407 281.707 254.47C282.032 254.545 282.894 253.634 283.694 253.497C285.281 253.235 288.906 253.322 288.793 255.455C286.556 256.329 285.006 256.141 282.719 255.755C280.432 255.368 281.719 255.705 280.057 255.817C279.807 255.83 276.332 255.455 276.145 255.405C274.795 254.994 275.995 253.671 276.907 253.31C278.257 252.773 279.869 252.761 281.107 253.584Z" fill="currentColor"/><path d="M284.419 315.823C287.106 318.33 278.932 318.143 277.232 317.557C274.095 316.484 277.295 314.213 279.12 314.188C279.745 314.188 284.019 315.436 284.419 315.81V315.823Z" fill="currentColor"/><path d="M21.2409 261.394C19.3786 261.506 17.7164 262.242 15.7916 262.055C14.8917 261.968 11.8421 261.406 11.6547 260.57C11.6547 258.312 21.3284 257.651 21.2409 261.394Z" fill="currentColor"/><path d="M294.068 274.23C293.755 274.592 284.906 276.052 285.469 273.432C285.744 270.6 293.993 270.987 294.068 274.23Z" fill="currentColor"/><path d="M9.9426 242.382C12.5298 242.107 12.5048 242.968 14.1545 243.255C14.8919 243.38 18.2165 242.831 17.929 244.091C17.8291 244.54 15.4669 245.189 14.9294 245.151C13.0172 245.052 12.4673 245.239 10.83 245.239C10.1426 245.239 6.84301 244.84 6.70552 244.403C6.28058 242.981 8.99272 242.469 9.9301 242.369L9.9426 242.382Z" fill="currentColor"/><path d="M300.667 207.701C301.279 208.337 299.055 208.899 298.78 208.936C297.48 209.123 295.243 209.285 293.905 209.335C292.98 209.373 290.031 209.647 289.793 208.499C290.218 205.555 299.955 206.94 300.679 207.689L300.667 207.701Z" fill="currentColor"/><path d="M301.816 357.253C301.579 357.191 301.016 356.53 301.041 356.155C301.354 352.5 310.015 353.898 308.765 356.255C308.615 356.53 307.315 357.241 307.09 357.241C305.878 357.241 302.691 357.49 301.816 357.241V357.253Z" fill="currentColor"/><path d="M210.491 384.037C214.216 387.131 204.929 387.219 203.679 385.397C204.517 382.665 208.541 382.416 210.491 384.037Z" fill="currentColor"/><path d="M168.871 296.499C170.833 296.125 174.695 296.823 173.508 299.63C173.008 300.341 166.846 300.104 166.696 298.445C166.759 297.16 167.734 296.711 168.871 296.499Z" fill="currentColor"/><path d="M43.8126 290.91C43.95 291.122 44.5874 291.034 44.3375 291.833C43.7376 292.107 43.4126 292.893 42.8627 293.08C42.5502 293.193 38.6632 293.08 38.2258 293.006C36.1511 292.619 38.2883 289.375 40.8629 289.363C42.8252 289.363 42.9127 289.513 43.8126 290.91Z" fill="currentColor"/><path d="M36.0643 361.519C35.0269 362.293 29.4902 362.642 28.9652 361.894C26.7655 358.775 36.5392 357.527 36.0643 361.519Z" fill="currentColor"/><path d="M261.809 271.224C261.696 271.037 261.671 270.438 261.759 270.301C262.084 269.777 269.183 268.978 269.908 270.762C270.22 272.858 264.909 272.908 263.621 272.521C263.509 272.484 261.859 271.311 261.809 271.211V271.224Z" fill="currentColor"/><path d="M213.24 307.839C211.49 308.675 209.753 308.787 207.828 308.475C204.629 307.964 205.054 306.379 207.728 305.456C209.841 304.72 212.14 306.03 213.253 307.839H213.24Z" fill="currentColor"/><path d="M306.191 243.354C308.166 242.98 310.403 243.155 310.89 245.413C310.678 246.386 304.291 246.436 303.304 245.75C302.004 244.839 305.491 243.492 306.178 243.367L306.191 243.354Z" fill="currentColor"/><path d="M20.9031 202.099C20.5906 202.511 15.1039 202.174 14.179 202.062C13.5666 202 12.6792 201.725 12.0668 201.526C11.8043 201.438 11.0419 201.55 11.3419 200.952C12.0168 199.592 15.7663 199.667 17.0786 199.829C18.2909 199.979 20.7406 200.615 20.9031 202.099Z" fill="currentColor"/><path d="M309.24 309.823C309.153 311.108 307.816 311.42 306.778 311.482C305.891 311.532 301.641 311.195 301.629 309.985C303.079 307.178 307.053 308.712 309.228 309.823H309.24Z" fill="currentColor"/><path d="M108.429 281.903C108.804 281.591 110.804 280.867 111.378 280.905C112.153 280.955 115.803 282.389 115.59 283.3C115.34 284.373 108.791 284.186 108.154 282.813C108.041 282.551 108.254 282.052 108.429 281.903Z" fill="currentColor"/><path d="M15.7043 301.327C16.5667 300.479 23.2033 300.99 22.8784 302.4C22.5909 303.648 16.5542 303.972 15.4293 302.912C15.1419 302.55 15.4044 301.627 15.7043 301.327Z" fill="currentColor"/><path d="M301.879 337.542C303.004 337.156 307.866 337.555 307.578 339.264C307.328 340.774 301.079 340.911 301.004 338.977C300.992 338.528 301.404 337.692 301.867 337.542H301.879Z" fill="currentColor"/><path d="M273.607 232.402C273.857 229.694 278.469 229.782 280.382 230.742C284.593 232.863 274.87 232.776 273.607 232.402Z" fill="currentColor"/><path d="M84.0197 281.254C85.4195 279.632 89.519 280.668 89.8064 282.976C89.669 284.348 81.9575 283.624 84.0197 281.254Z" fill="currentColor"/><path d="M181.894 357.578C180.857 358.376 174.62 358.725 174.97 357.091C176.608 355.17 181.069 354.758 181.894 357.578Z" fill="currentColor"/><path d="M24.5024 359.524C24.165 360.01 19.3531 360.16 18.5907 359.387C16.7785 357.64 22.9026 356.181 24.2275 358.039C24.4899 358.401 24.7399 359.175 24.5024 359.511V359.524Z" fill="currentColor"/><path d="M290.518 244.515C290.33 244.34 289.98 243.654 290.43 243.429C291.717 243.305 298.004 241.92 298.354 243.442C298.704 244.964 291.43 245.326 290.518 244.515Z" fill="currentColor"/><path d="M318.09 315.461C318.864 316.808 315.852 316.871 314.953 316.908C313.603 316.97 312.253 316.808 311.203 315.873C310.928 313.29 317.59 314.588 318.09 315.461Z" fill="currentColor"/><path d="M245.324 322.747C245.936 322.186 251.623 321.886 252.16 323.496C251.148 325.117 245.761 325.142 245.061 323.67C244.949 323.408 245.149 322.909 245.324 322.747Z" fill="currentColor"/><path d="M311.14 347.772C312.815 347.46 315.727 347.336 316.827 348.845C316.839 349.257 313.69 349.718 313.127 349.781C312.377 349.881 308.54 350.33 308.915 348.845C308.978 348.583 310.778 347.835 311.14 347.772Z" fill="currentColor"/><path d="M292.58 226.8C292.393 226.751 292.005 226.152 291.768 225.977C291.768 225.091 296.217 224.767 297.167 224.879C298.242 225.004 299.467 225.303 300.179 226.139L299.842 226.8C297.93 226.451 294.23 227.262 292.58 226.8Z" fill="currentColor"/><path d="M269.708 266.047C270.433 265.124 276.494 264.725 276.582 265.835C276.032 267.731 271.17 268.13 269.995 267.145C269.595 266.808 269.545 266.521 269.708 266.047Z" fill="currentColor"/><path d="M313.277 265.274C313.077 265.124 312.777 264.313 313.002 264.014C315.339 262.816 318.439 263.016 320.113 265.174C319.439 266.197 318.439 265.374 317.651 265.399C316.589 265.436 314.264 265.972 313.277 265.261V265.274Z" fill="currentColor"/><path d="M20.9029 322.659C20.7779 319.316 27.802 319.216 26.3522 322.011C25.8147 323.034 22.0027 323.221 20.9029 322.659Z" fill="currentColor"/><path d="M27.1772 252.823C26.2898 252.86 25.6524 253.684 24.7775 253.709C23.9776 253.734 19.6407 253.272 19.9282 252C20.2156 250.727 26.5773 250.989 27.1897 252.81L27.1772 252.823Z" fill="currentColor"/><path d="M106.679 300.603C106.779 301.514 105.567 302.088 104.83 302.138C104.13 302.188 100.243 301.926 100.093 301.414C99.4678 299.406 105.692 299.356 106.692 300.603H106.679Z" fill="currentColor"/><path d="M64.6722 268.43C65.4596 268.43 68.2343 269.128 67.5968 270.288C66.7594 271.835 61.4726 270.788 61.4851 270.114C62.3475 269.016 63.2099 268.43 64.6722 268.43Z" fill="currentColor"/><path d="M111.529 327.675C112.504 327.388 117.241 327.625 116.903 329.084C115.903 330.382 110.942 330.357 110.667 328.71C110.629 328.236 111.129 327.8 111.529 327.675Z" fill="currentColor"/><path d="M42.3883 350.953C41.1635 348.783 49.6123 348.047 47.3126 351.178C46.2128 352.675 43.6881 351.689 42.3883 350.953Z" fill="currentColor"/><path d="M270.033 314.051C269.134 310.458 274.495 311.294 274.92 313.29C275.195 314.588 270.921 315.024 270.033 314.051Z" fill="currentColor"/><path d="M310.478 252.574C311.94 252.312 314.565 252.324 315.502 253.647C315.502 254.482 309.765 254.62 309.128 254.42C307.628 253.946 309.453 252.761 310.478 252.574Z" fill="currentColor"/><path d="M92.0811 275.965C93.8809 275.628 94.9057 276.052 96.1181 277.362C96.1181 278.373 89.8939 278.834 90.2063 277.063C90.3063 276.514 91.5562 276.052 92.0811 275.953V275.965Z" fill="currentColor"/><path d="M28.7271 275.952C29.552 275.765 34.0764 275.69 33.7639 277.025C32.964 278.123 27.1398 278.298 27.5023 276.713C27.5647 276.426 28.3896 276.027 28.7271 275.952Z" fill="currentColor"/><path d="M304.453 268.143C305.191 268.018 309.24 268.03 308.915 269.453C308.165 270.887 302.716 270.351 302.978 269.128C303.053 268.779 304.003 268.205 304.453 268.13V268.143Z" fill="currentColor"/><path d="M90.8444 303.884C89.2196 304.159 87.3948 304.658 85.895 303.722L85.5951 302.762C86.0075 301.377 91.3193 301.427 90.8569 303.872L90.8444 303.884Z" fill="currentColor"/><path d="M296.955 197.571C298.404 197.309 303.116 197.222 300.467 199.093C297.954 200.877 292.893 198.295 296.955 197.571Z" fill="currentColor"/><path d="M61.4859 282.14C59.3361 283.038 57.7738 282.676 55.5491 282.464C56.0491 279.907 60.7359 279.857 61.4859 282.14Z" fill="currentColor"/><path d="M297.366 216.596C296.242 216.795 290.68 217.606 291.105 215.785C291.78 214.924 292.58 214.999 293.542 214.986C294.129 214.986 298.241 215.697 297.366 216.596Z" fill="currentColor"/><path d="M306.604 203.097C307.503 202.548 312.503 202.511 312.203 203.908C311.953 205.081 305.991 205.518 306.604 203.097Z" fill="currentColor"/><path d="M319.139 280.169C318.764 280.693 313.852 280.393 313.539 279.021C314.952 277.462 318.701 277.786 319.139 280.169Z" fill="currentColor"/><path d="M112.953 342.757C112.141 341.597 118.015 339.538 118.253 341.946C118.253 343.418 113.966 343.268 112.953 342.757Z" fill="currentColor"/><path d="M141.162 289.213C141.837 289.226 143.812 290.074 143.624 290.86C142.899 292.282 137.925 291.459 138.825 290.024C139.087 289.613 140.637 289.188 141.15 289.201L141.162 289.213Z" fill="currentColor"/><path d="M226.027 372.473C230.189 372.074 227.627 377.101 223.952 374.382C223.927 373.334 225.089 372.56 226.027 372.473Z" fill="currentColor"/><path d="M284.168 223.182C284.756 224.043 278.794 224.779 278.557 223.669C279.507 221.124 282.344 222.296 284.168 223.182Z" fill="currentColor"/><path d="M41.0255 243.28C41.1254 245.263 35.1012 244.902 35.0887 244.103C36.626 242.519 39.0882 242.569 41.0255 243.28Z" fill="currentColor"/><path d="M166.984 309.237C169.934 309.162 170.259 311.657 166.572 311.47C163.335 311.307 164.135 309.299 166.984 309.237Z" fill="currentColor"/><path d="M283.844 270.276C282.044 271.262 279.857 271.112 277.907 270.601C276.932 269.229 283.394 268.492 283.844 270.276Z" fill="currentColor"/><path d="M281.119 352.725C281.482 353.087 281.457 354.197 280.982 354.309C280.07 354.022 278.832 354.609 278.107 354.521C275.145 354.209 278.932 350.554 281.119 352.725Z" fill="currentColor"/><path d="M156.736 392.882C157.385 392.77 160.11 393.431 160.11 393.98C159.585 395.589 154.948 395.065 155.173 393.98C155.573 393.543 156.136 392.982 156.736 392.87V392.882Z" fill="currentColor"/><path d="M314.527 271.274C313.452 271.611 309.427 272.197 309.94 270.189C310.39 268.442 315.414 270.276 314.527 271.274Z" fill="currentColor"/><path d="M224.327 311.557C225.227 311.457 226.864 312.18 227.414 312.954C226.739 314.176 222.565 314.151 222.827 312.667C222.89 312.305 223.914 311.619 224.327 311.569V311.557Z" fill="currentColor"/><path d="M26.8404 238.015C27.2904 238.539 26.7529 238.577 26.3905 238.701C25.1407 239.151 21.5661 239.874 21.8911 237.679C22.9659 237.454 26.053 237.092 26.8404 238.015Z" fill="currentColor"/><path d="M152.848 347.061L152.723 348.047C147.012 349.618 147.699 344.741 152.848 347.061Z" fill="currentColor"/><path d="M297.367 341.111C297.055 342.957 294.43 342.508 293.08 342.096C293.08 339.576 295.78 340.45 297.367 341.111Z" fill="currentColor"/><path d="M28.4895 200.789C28.7145 202.636 23.8776 202.212 23.5401 201.775C24.5275 199.966 26.8522 200.315 28.4895 200.789Z" fill="currentColor"/><path d="M183.932 302.849L183.569 301.452C186.707 299.219 189.581 303.797 183.932 302.849Z" fill="currentColor"/><path d="M297.367 351.976L297.217 352.975L296.817 353.236C290.517 353.898 293.305 350.717 297.367 351.976Z" fill="currentColor"/><path d="M18.8285 319.803C18.891 319.815 19.8534 320.738 19.5784 321.013C18.2786 321.212 14.6416 322.185 15.479 320.002C16.5288 319.653 17.7287 319.503 18.8285 319.803Z" fill="currentColor"/><path d="M143.962 331.218C142.425 331.604 140.563 332.677 139.351 331.055C139.351 330.032 143.688 329.646 143.962 331.218Z" fill="currentColor"/><path d="M165.072 298.944C165.247 299.68 164.959 299.481 164.659 299.693C163.472 300.566 162.447 300.316 161.11 299.917C161.522 297.959 163.634 298.183 165.072 298.932V298.944Z" fill="currentColor"/><path d="M83.62 345.352L83.3325 344.553C83.4575 343.418 87.0446 343.456 87.207 344.242C86.8446 345.863 84.8823 345.377 83.62 345.352Z" fill="currentColor"/><path d="M256.122 337.48C255.897 337.817 253.547 337.929 253.01 337.517L252.86 336.37C253.323 335.085 256.91 336.257 256.122 337.48Z" fill="currentColor"/><path d="M31.1267 182.663C31.5392 183.025 30.1144 184.01 29.7894 184.122C29.077 184.372 26.4648 184.185 27.1897 183L31.1267 182.65V182.663Z" fill="currentColor"/><path d="M12.9798 325.629C13.5297 326.215 12.7548 326.178 12.5048 326.315C11.8924 326.639 9.24277 327.538 9.0178 326.44C8.75534 325.167 12.4049 325.018 12.9798 325.629Z" fill="currentColor"/><path d="M261.359 266.059L261.409 267.319H258.109C257.934 265.523 260.122 265.373 261.359 266.059Z" fill="currentColor"/><path d="M188.169 316.409C187.969 318.23 186.032 317.257 184.869 317.395L184.907 316.284C185.732 315.074 187.119 316.01 188.169 316.422V316.409Z" fill="currentColor"/><path d="M108.004 314.763L107.954 316.035C103.729 317.233 103.304 314.139 108.004 314.763Z" fill="currentColor"/><path d="M15.2786 228.809L15.1036 229.807C10.0293 231.079 11.1417 227.661 15.2786 228.809Z" fill="currentColor"/><path d="M295.717 316.397L292.618 316.098L292.443 315.1C293.892 314.514 295.817 314.389 295.717 316.397Z" fill="currentColor"/><path d="M170.021 361.195L166.397 361.532C166.672 359.785 169.646 359.261 170.021 361.195Z" fill="currentColor"/><path d="M269.32 252.162C268.745 252.237 268.183 252.125 267.608 252.062C267.208 252.025 265.508 252.012 265.696 251.339C266.921 249.991 268.983 250.253 269.32 252.15V252.162Z" fill="currentColor"/><path d="M17.6041 277.2L13.9796 277.537C14.417 275.404 16.6417 275.441 17.6041 277.2Z" fill="currentColor"/><path d="M30.1394 304.882C30.0519 305.356 28.5771 305.768 28.2397 305.806C27.5523 305.88 27.1398 305.681 26.5149 305.531C26.8648 303.435 28.7646 304.346 30.1394 304.882Z" fill="currentColor"/><path d="M47.2997 242.956C48.512 242.506 49.9118 242.469 50.9242 243.442C49.9993 244.64 47.9496 244.203 47.2997 242.956Z" fill="currentColor"/><path d="M29.1521 193.204C28.9522 191.77 32.2517 191.458 32.4517 192.393C32.7017 193.591 29.7521 193.154 29.1521 193.204Z" fill="currentColor"/><path d="M295.929 271.985C296.817 271.698 298.067 272.035 298.679 272.759C297.642 274.231 293.917 272.622 295.929 271.985Z" fill="currentColor"/><path d="M232.938 372.798C233.55 372.61 234.875 372.735 234.687 373.559C233.788 374.507 232.85 374.719 232.05 373.559C232.325 373.284 232.55 372.922 232.938 372.798Z" fill="currentColor"/><path d="M93.8192 283.125C93.0568 282.302 96.2564 281.641 96.4564 282.639C96.5689 283.861 94.1067 283.437 93.8192 283.125Z" fill="currentColor"/><path d="M234.688 313.428C233.925 312.605 237.125 311.944 237.325 312.942C237.438 314.164 234.975 313.74 234.688 313.428Z" fill="currentColor"/><path d="M234.925 209.422C237.3 208.936 239.774 209.859 242.112 210.008C245.361 210.208 248.461 210.395 251.698 210.682C253.06 210.807 257.622 210.096 258.06 211.892C258.147 212.528 257.797 213.065 257.597 213.639C256.66 216.296 254.71 219.989 253.448 222.658C250.898 228.06 247.348 236.418 244.311 241.209C243.087 243.142 242.012 243.392 239.787 243.429L218.515 240.81L217.902 240.086L218.002 239.001L230.926 212.691C231.626 211.293 233.388 209.746 234.925 209.435V209.422Z" fill="currentColor"/><path d="M273.857 176.812C275.469 178.197 271.182 184.871 270.408 186.543C267.82 192.181 265.296 197.147 262.446 202.636C261.621 204.22 261.384 206.191 259.921 207.364C257.322 209.447 251.573 207.9 248.373 207.701C246.573 207.588 235.437 207.251 235.062 206.665C234.975 205.729 234.887 204.644 235.162 203.733C236.162 200.415 240.162 193.878 241.899 190.36C243.636 186.842 245.148 182.576 246.973 179.282C247.736 177.897 250.01 176.001 251.66 176.064C258.197 176.388 265.346 175.889 271.807 176.4C272.282 176.438 273.557 176.563 273.857 176.824V176.812Z" fill="currentColor"/><path d="M228.563 209.534C228.913 209.933 229.313 209.622 228.988 210.732C226.076 215.897 223.864 221.411 221.214 226.7C219.614 229.881 217.402 235.071 215.49 237.791C213.727 240.298 212.565 240.173 209.778 239.974C205.104 239.637 198.217 238.838 193.643 237.978C193.155 237.89 190.768 237.242 190.618 237.042L190.73 235.133C193.568 229.831 196.392 224.517 199.179 219.19C200.592 216.495 202.891 210.233 205.029 208.549C206.091 207.713 207.403 207.127 208.791 207.102C211.978 207.064 216.652 208.062 220.014 208.349C222.389 208.549 225.226 208.237 227.613 208.673C228.201 208.773 228.263 209.16 228.575 209.522L228.563 209.534Z" fill="currentColor"/><path d="M267.608 144.539C273.97 144.002 281.419 145.375 287.893 144.601L289.755 145.312L276.97 172.358C276.32 173.419 275.695 173.955 274.432 174.105C269.346 174.704 263.671 173.905 258.585 173.731C257.76 173.706 257.022 174.092 256.31 174.055C255.597 174.018 251.785 173.743 251.485 173.593C250.648 173.182 250.686 171.872 250.973 171.111L262.247 148.107C263.509 145.998 265.046 144.738 267.583 144.526L267.608 144.539Z" fill="currentColor"/><path d="M220.277 177.498C221.689 176.55 223.077 175.065 224.951 175.065C229.663 175.065 234.75 175.44 239.474 175.752C241.224 175.864 244.574 175.04 245.111 177.061C245.374 178.059 242.049 183.524 241.374 184.908C238.712 190.447 236.2 196.498 233.3 201.887C231.713 204.831 230.676 206.49 226.926 206.416C221.839 206.316 216.19 205.966 211.103 205.405C204.867 204.719 208.079 202.236 209.791 198.843C213.34 191.77 216.84 184.646 220.277 177.523V177.498Z" fill="currentColor"/><path d="M243.537 144.863C247.549 144.713 254.16 144.389 257.947 144.788C260.684 145.075 260.584 146.06 259.71 148.194C256.547 155.941 251.311 163.638 248.024 171.447C247.211 172.495 246.111 173.294 244.749 173.456C238.375 174.217 230.638 172.57 224.102 172.969L223.877 170.724L235.675 147.258C236.475 146.31 237.375 145.524 238.625 145.262C239.875 145 242.199 144.913 243.537 144.863Z" fill="currentColor"/><path d="M180.808 205.467L200.455 206.79C202.255 207.039 201.418 209.247 200.943 210.42C198.78 215.684 194.693 221.959 191.944 227.124C190.794 229.295 188.694 235.258 186.644 236.318C185.045 237.154 182.832 236.181 181.07 236.031C178.021 235.782 174.908 235.745 171.884 235.333C170.684 235.171 165.985 234.722 166.122 233.299C166.147 233.025 167.959 228.783 168.259 228.172C170.072 224.367 172.721 220.3 174.709 216.495C175.696 214.624 179.208 205.941 180.82 205.467H180.808Z" fill="currentColor"/><path d="M299.841 116.307C304.466 116.445 302.891 118.59 301.391 121.622C299.566 125.302 297.504 129.045 295.654 132.687C294.854 134.259 292.23 140.534 291.417 141.295C290.505 142.156 288.843 142.181 287.643 142.281C282.294 142.692 273.382 143.004 268.158 142.493C266.908 142.368 265.496 141.57 265.846 140.172C266.233 138.588 268.495 135.108 269.295 133.386C271.258 129.182 273.72 122.57 276.194 118.865C277.807 116.457 278.307 117.605 280.369 117.455C286.78 116.981 293.405 116.12 299.854 116.307H299.841Z" fill="currentColor"/><path d="M197.642 174.504C200.055 173.955 204.429 175.34 207.141 174.766C210.003 175.49 213.565 174.691 216.402 175.078C217.077 175.165 217.552 175.277 217.827 175.989C218.04 176.787 217.465 177.772 217.165 178.509C214.19 185.944 208.866 193.516 205.729 201.014C203.254 205.692 198.355 204.345 193.955 204.07C190.156 203.833 186.331 203.372 182.557 202.947C182.094 202.636 182.194 201.837 182.319 201.363C182.657 200.078 185.519 195.138 186.369 193.529C189.443 187.64 192.843 181.902 195.83 175.964C196.255 175.327 196.892 174.679 197.655 174.504H197.642Z" fill="currentColor"/><path d="M233.038 145.112C233.8 147.657 231.501 149.766 230.438 151.899C227.838 157.176 225.389 163.326 222.539 168.391C219.465 173.843 216.852 172.895 211.078 172.795C209.553 172.77 207.929 172.707 206.416 172.658C205.304 172.62 198.78 172.483 198.53 172.146C198.367 171.909 198.355 171.585 198.355 171.298C201.679 164.96 205.066 158.66 208.454 152.36C209.391 150.626 211.316 145.112 213.728 145.112H233.025H233.038Z" fill="currentColor"/><path d="M239.462 142.805C238.687 142.568 238.949 140.934 239.287 140.322L250.335 118.74L251.048 118.428C258.697 118.541 266.308 117.368 273.945 117.929L263.321 139.611C262.921 140.834 260.421 142.805 259.259 142.805H239.462Z" fill="currentColor"/><path d="M235.887 141.383C234.688 142.206 233.375 142.98 231.875 143.142C228.001 143.578 219.34 143.491 215.378 143.142C214.915 143.104 214.153 143.017 213.865 142.605C213.715 141.894 214.74 139.998 215.09 139.237C217.065 134.971 221.952 124.342 224.626 121.098C225.826 119.639 227.726 119.526 229.551 119.427C232.613 119.252 235.95 119.239 239.099 119.102C241.687 118.99 244.311 118.977 246.886 118.915C247.948 119.614 245.836 121.984 245.424 122.757C242.199 128.933 239.424 135.382 235.875 141.383H235.887Z" fill="currentColor"/><path d="M164.747 204.408L164.584 206.067L150.399 232.09C148.649 233.375 141.862 231.716 139.5 231.416C138.275 231.254 133.814 231.391 133.226 230.431C132.764 229.445 133.576 228.447 134.013 227.574C135.213 225.154 137.063 222.547 138.413 220.114C140.25 216.795 144.75 207.015 146.924 204.894C147.962 203.896 149.274 203.173 150.736 203.073L164.747 204.395V204.408Z" fill="currentColor"/><path d="M165.309 173.506L180.42 173.768L181.107 174.08L180.882 176.213C175.958 183.412 172.833 192.905 168.109 200.029C167.434 201.039 166.559 202.062 165.234 202.124L150.549 200.964L150.061 199.155L163.897 174.417L165.297 173.506H165.309Z" fill="currentColor"/><path d="M130.976 228.996C130.364 229.682 128.952 230.705 127.977 230.431L114.191 228.447L113.779 227.811L127.202 203.958C128.014 202.786 129.177 201.9 130.564 201.538L144.312 202.91L144.375 204.969L130.989 228.996H130.976Z" fill="currentColor"/><path d="M160.735 173.494C161.51 174.741 160.573 175.926 159.973 177.074C156.698 183.324 152.724 191.246 149.037 197.122C148.412 198.107 146.825 200.091 145.7 200.378C143.663 200.902 138.576 199.979 136.214 199.804C134.451 199.667 130.527 200.602 130.777 198.02C133.989 191.895 137.613 185.944 141.063 179.931C142.4 177.611 143.288 174.093 146.05 173.045C147.812 172.371 148.824 173.095 150.399 173.132C153.861 173.194 157.336 172.895 160.748 173.494H160.735Z" fill="currentColor"/><path d="M166.472 171.061C165.684 170.313 166.522 169.24 166.884 168.504C170.421 161.119 175.296 153.808 179.283 146.622C180.17 146.123 181.007 145.562 182.057 145.437C185.469 145.026 190.031 145.575 193.631 145.462C195.431 145.412 197.518 144.09 196.493 147.334C193.406 153.11 190.169 158.811 187.007 164.549C185.757 166.832 184.544 171.486 181.745 171.81C178.658 172.172 174.933 171.635 171.859 171.461C170.621 171.386 167.247 171.797 166.484 171.061H166.472Z" fill="currentColor"/><path d="M125.402 201.525L125.727 202.311L112.229 225.927C110.954 227.624 110.317 227.898 108.167 227.798C106.018 227.698 103.668 227.137 101.543 226.85C99.8558 226.626 95.5814 227.299 96.3438 224.567C97.0312 222.06 100.456 217.681 101.868 215.248C104.268 211.106 106.98 205.118 109.842 201.476C111.779 199.018 114.954 200.577 117.741 200.789C119.128 200.889 124.64 200.789 125.415 201.538L125.402 201.525Z" fill="currentColor"/><path d="M176.621 145.774C177.02 146.186 175.121 149.966 174.771 150.677C171.634 156.914 167.347 162.902 164.36 169.277C163.435 170.724 161.298 171.448 159.635 171.498C156.886 171.585 151.499 171.398 148.749 171.149C145.637 170.849 146.862 169.652 147.862 167.643C151.111 161.156 155.773 154.956 158.86 148.319C159.785 147.084 160.973 145.986 162.597 145.786C166.859 145.275 172.234 146.086 176.621 145.786V145.774Z" fill="currentColor"/><path d="M141.987 172.783L141.825 174.442C137.163 181.129 133.763 190.535 129.051 196.935C128.276 197.983 127.027 199.106 125.639 199.156C123.427 199.243 118.478 198.731 116.078 198.469C115.491 198.407 112.429 197.958 112.304 197.783C112.154 197.247 112.329 196.748 112.529 196.261C113.853 193.118 117.853 187.691 119.803 184.41C121.102 182.227 125.214 173.744 126.939 172.758C129.164 171.486 138.9 173.082 141.975 172.77L141.987 172.783Z" fill="currentColor"/><path d="M145.874 145.874C148.261 145.686 154.21 145.387 156.323 145.786C157.072 145.923 157.572 146.447 157.497 147.233L144.762 169.14C144.024 170.188 142.724 170.674 141.487 170.811C139.212 171.048 132.588 171.036 130.313 170.762C129.464 170.662 128.026 170.624 128.389 169.601C128.751 168.578 130.101 166.395 130.701 165.322C133.551 160.257 136.775 154.244 139.85 149.429C140.475 148.456 141.649 147.333 142.299 146.273C143.474 146.148 144.699 145.961 145.861 145.874H145.874Z" fill="currentColor"/><path d="M198.955 142.705C198.33 143.116 197.667 143.391 196.917 143.478C194.018 143.803 185.544 143.853 182.707 143.478C182.219 143.416 181.882 143.391 181.532 142.992L181.369 142.143L192.468 121.896C193.23 121.26 196.317 121.185 197.555 121.085C201.267 120.786 205.016 120.836 208.728 120.773L209.266 121.534C206.416 128.832 202.292 135.619 198.942 142.705H198.955Z" fill="currentColor"/><path d="M162.759 143.79L162.434 142.331L173.783 122.682C174.37 122.271 175.733 122.283 176.52 122.196C179.732 121.834 186.619 121.31 189.656 121.709C190.106 121.772 190.231 121.535 190.131 122.196C186.269 128.097 183.557 135.295 179.72 141.121C179.357 141.657 178.945 142.431 178.432 142.805C178.245 142.942 176.557 143.778 176.445 143.778H162.759V143.79Z" fill="currentColor"/><path d="M170.284 122.47C170.821 122.445 170.959 122.32 171.334 122.882L161.06 141.283C159.548 143.541 157.935 143.927 155.336 144.127C151.886 144.401 148.224 143.778 144.762 144.327C143.912 143.778 143.512 143.616 143.925 142.642C145.625 138.638 149.562 133.099 151.924 129.207C153.211 127.086 154.173 123.368 156.973 123.044C160.985 122.582 166.134 122.62 170.271 122.47H170.284Z" fill="currentColor"/><path d="M97.1179 199.142C97.4428 199.517 94.5682 204.357 94.0933 205.18C91.1687 210.133 87.1567 217.606 83.8696 221.972C82.4073 223.918 82.1699 223.856 79.7827 223.843C78.0579 223.843 74.9958 223.419 73.2085 223.182C71.4213 222.945 69.6465 222.957 68.2342 221.872L68.2592 220.887C72.7086 215.073 75.7957 208.124 79.8327 202.124C81.145 200.165 82.2948 197.907 85.082 198.119L97.1179 199.142Z" fill="currentColor"/><path d="M113.603 172.121L99.2552 196.174C98.4678 196.76 97.6179 197.184 96.6181 197.184C93.9934 197.184 89.744 196.785 87.0568 196.485C85.2821 196.286 83.8947 196.099 84.8321 193.94C89.3315 188.027 92.5686 180.218 96.8305 174.305C97.7679 173.007 98.9553 171.972 100.555 171.61L113.591 172.109L113.603 172.121Z" fill="currentColor"/><path d="M100.793 169.776L100.505 168.716L113.453 147.421C113.978 147.071 114.466 146.56 115.116 146.448C116.278 146.236 119.29 146.148 120.69 146.086C122.565 145.999 126.627 145.811 128.289 146.098C128.676 146.161 128.876 146.273 129.101 146.585L115.428 169.489L114.078 170.113L100.793 169.764V169.776Z" fill="currentColor"/><path d="M51.6241 220.501L51.8865 218.704C56.1985 212.878 59.548 206.029 63.6475 200.141C64.5974 198.769 66.1347 196.86 67.9094 196.785C69.3717 196.723 71.6464 197.334 73.1962 197.471C74.3836 197.584 78.758 197.409 79.4829 198.12C79.5704 198.806 79.4204 199.455 79.1079 200.066C75.7084 206.853 69.8967 213.714 66.2596 220.525C65.1348 221.436 64.1974 222.085 62.6726 222.06L51.6116 220.488L51.6241 220.501Z" fill="currentColor"/><path d="M82.4948 194.415C81.8948 194.951 79.9326 195.812 79.1202 195.849C77.133 195.949 72.0212 195.513 69.9464 195.126C67.2593 194.614 67.4343 194.402 68.7341 192.044C72.3961 185.42 77.6579 178.833 81.6199 172.309C84.707 169.589 91.5311 171.984 95.4681 171.61L95.5181 173.681L82.4823 194.415H82.4948Z" fill="currentColor"/><path d="M99.0053 146.51C100.58 146.223 108.966 146.148 110.479 146.435C110.741 146.485 110.991 146.51 111.166 146.747C111.279 146.896 111.304 147.084 111.329 147.271C111.441 148.73 103.942 159.509 102.605 161.63C101.093 164.012 99.4677 168.99 96.2806 169.476C94.3809 169.763 90.4314 169.614 88.3692 169.514C87.7568 169.489 84.5447 169.239 84.2697 169.002C83.8198 168.641 83.8198 168.329 84.1072 167.867L95.9307 149.03C96.7056 147.894 97.593 146.772 99.0178 146.51H99.0053Z" fill="currentColor"/><path d="M36.7884 218.529C36.5759 218.192 36.7384 217.331 36.9258 216.932C39.9754 212.666 42.5876 208.112 45.5122 203.758C46.2621 202.648 46.912 201.5 47.6994 200.34C48.4243 199.267 50.5865 195.974 51.5864 195.649C51.9988 195.525 52.3113 195.475 52.7362 195.487C54.761 195.537 57.8981 195.924 60.0103 196.161C61.5601 196.336 63.9973 196.286 62.8849 198.369L49.4492 219.215C48.7493 219.677 48.0744 220.176 47.187 220.176C45.4247 220.176 40.4629 219.39 38.5506 219.04C38.2132 218.978 36.8883 218.641 36.8009 218.504L36.7884 218.529Z" fill="currentColor"/><path d="M79.2956 171.136C79.4956 172.271 79.0332 172.945 78.5707 173.868C77.0709 176.862 74.5588 179.719 72.7465 182.551C71.1592 185.034 69.6594 187.915 68.0221 190.348C66.5348 192.556 65.6224 194.477 62.6353 194.552C60.8981 194.59 57.8735 194.34 56.0362 194.19C55.4738 194.153 52.8866 193.804 52.7116 193.554V192.544L66.7598 170.974C70.9717 170.475 75.1462 171.124 79.2956 171.136Z" fill="currentColor"/><path d="M141.6 123.743L141.737 125.564L130.614 143.79C125.939 145.013 120.74 144.19 115.915 144.439L116.403 142.119L127.051 124.99C127.889 124.254 131.351 123.868 132.601 123.78C133.676 123.705 134.626 124.055 135.55 124.03C136.688 124.005 140.825 123.231 141.612 123.73L141.6 123.743Z" fill="currentColor"/><path d="M68.4096 168.828C68.1597 168.616 69.672 166.296 69.9219 165.897C72.2716 162.067 74.8963 157.975 77.3709 154.232C78.1833 152.997 81.3454 148.007 82.0953 147.421C82.6702 146.972 83.0202 146.847 83.7451 146.76C85.5824 146.548 91.4691 146.31 93.2938 146.473C93.7063 146.51 95.1061 146.897 95.1311 147.259L82.1078 167.843C79.3082 170.375 72.0591 168.803 68.4221 168.828H68.4096Z" fill="currentColor"/><path d="M125.152 124.691C123.415 127.972 121.215 130.978 119.278 134.135C117.891 136.418 114.966 142.655 112.929 143.94C110.092 145.737 103.243 144.264 99.7933 144.739C99.1434 143.691 99.8433 142.88 100.356 141.932C103.255 136.43 107.142 131.091 110.404 125.789L112.442 125.015L125.152 124.703V124.691Z" fill="currentColor"/><path d="M108.005 125.352L107.83 126.986C104.38 131.39 102.018 136.929 98.9061 141.47C97.7687 143.142 96.8063 144.539 94.6441 144.788C91.3071 145.163 86.9951 144.838 83.5956 144.788L95.3065 126.338C95.694 125.988 96.1314 125.776 96.6439 125.701C97.7562 125.527 99.6935 125.439 100.918 125.352C103.243 125.202 105.693 125.315 108.005 125.352Z" fill="currentColor"/><path d="M136.063 257.464C136.113 257.389 137.638 256.84 137.888 256.803C138.726 256.691 141.938 257.115 141.663 258.263C141.313 259.697 134.789 259.385 136.076 257.464H136.063Z" fill="currentColor"/><path d="M133.726 256.778C133.051 256.142 129.802 256.915 130.102 255.63C130.289 254.819 133.614 254.657 134.039 255.655L133.739 256.778H133.726Z" fill="currentColor"/><path d="M116.153 252.262C116.253 252.337 116.603 253.111 116.578 253.148L112.616 253.485C112.654 251.975 115.153 251.526 116.153 252.262Z" fill="currentColor"/><path d="M204.004 264.363C204.142 265.111 203.967 264.887 203.579 265.099C201.105 266.446 198.218 266.209 195.755 265.012C196.43 263.452 199.417 263.04 200.88 263.09C201.855 263.115 202.93 264.313 203.992 264.363H204.004Z" fill="currentColor"/><path d="M223.464 266.982C222.639 267.369 218.239 267.656 218.189 266.82C219.002 264.625 222.776 264.874 223.464 266.982Z" fill="currentColor"/><path d="M195.093 261.731C194.355 264.101 188.231 262.991 190.831 261.257C192.131 260.383 193.73 261.506 195.093 261.731Z" fill="currentColor"/><path d="M175.958 261.057C175.971 258.699 178.708 259.285 179.908 260.57C178.871 262.08 177.408 261.082 175.958 261.057Z" fill="currentColor"/></svg>`;
export {
  solar_panel_illustration_default as solarPanelIllustration
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
*/
