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
var i = (t3, ...e4) => {
  const o5 = 1 === t3.length ? t3[0] : e4.reduce((e5, s4, o6) => e5 + ((t4) => {
    if (true === t4._$cssResult$) return t4.cssText;
    if ("number" == typeof t4) return t4;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t3[o6 + 1], t3[0]);
  return new n(o5, t3, s);
};
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

// scripts/ignite/dist/tokens/component/xe-card/index.js
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
export {
  xe_card_default as default
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
