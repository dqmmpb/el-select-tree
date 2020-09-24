/*!
 * el-select-tree v1.0.21
 * (c) 2019-2020 yujinpan
 * Released under the MIT License.
 */

import 'core-js/modules/es7.array.includes';
import 'core-js/modules/es6.string.includes';
import 'core-js/modules/es6.number.constructor';
import Vue from 'vue';
import Emitter from 'element-ui/lib/mixins/emitter';
import treeFind from 'operation-tree-node/dist/treeFind.esm';
import treeEach from 'operation-tree-node/dist/treeEach.esm';

var script = {
  name: 'ElSelectTree',
  mixins: [Emitter],
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    clearable: Boolean,
    defaultExpandAll: Boolean,
    checkStrictly: Boolean,
    emptyText: {
      type: String,
      default: '无数据'
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    props: {
      type: Object,
      default: function _default() {
        return {
          value: 'value',
          label: 'label',
          children: 'children'
        };
      }
    },
    placement: {
      type: String,
      default: 'bottom-start'
    },
    size: {
      type: String,
      default: Vue.prototype.$ELEMENT ? Vue.prototype.$ELEMENT.size : ''
    },
    popoverMinWidth: {
      type: Number,
      default: 0
    },
    disabled: Boolean,
    multiple: Boolean,
    value: {
      type: [Number, String, Array],
      default: ''
    },
    disabledValues: {
      type: Array,
      default: function _default() {
        return [];
      }
    },
    data: {
      type: Array,
      default: function _default() {
        return [];
      }
    }
  },
  computed: {
    dataLength: function dataLength() {
      return this.data.length;
    },
    propsValue: function propsValue() {
      return this.props.value;
    },
    propsLabel: function propsLabel() {
      return this.props.label;
    },
    defaultExpandedKeys: function defaultExpandedKeys() {
      return Array.isArray(this.value) ? this.value : [this.value];
    }
  },
  data: function data() {
    return {
      visible: false,
      selectedLabel: ''
    };
  },
  methods: {
    valueChange: function valueChange(value) {
      this.$emit('change', value);
      this.dispatch('ElFormItem', 'el.form.change', value);
    },
    clear: function clear() {
      var _this = this;

      this.visible = false;

      if (this.multiple) {
        this.valueChange([]);
        this.$nextTick(function () {
          _this.$refs.elTree.setCheckedKeys([]);
        });
      } else {
        this.valueChange('');
      }
    },
    handleScroll: function handleScroll() {
      this.$refs.scrollbar && this.$refs.scrollbar.handleScroll();
    },
    nodeClick: function nodeClick(data, node, component) {
      var children = data[this.props.children];
      var value = data[this.propsValue];

      if (children && !this.checkStrictly) {
        component.handleExpandIconClick();
      } else if (!this.disabledValues.includes(value) && !this.multiple) {
        if (value !== this.value) {
          this.valueChange(value);
          this.selectedLabel = data[this.propsLabel];
        }

        this.visible = false;
      }
    },
    checkChange: function checkChange() {
      this.valueChange(this.$refs.elTree.getCheckedKeys(!this.checkStrictly));
      this.setSelectedLabel();
    },
    checkSelected: function checkSelected(value) {
      if (this.multiple) {
        return this.value.includes(value);
      } else {
        return this.value === value;
      }
    },
    setSelected: function setSelected() {
      var _this2 = this;

      var propsValue = this.propsValue;
      var value = this.value;

      if (String(value).length) {
        if (this.multiple) {
          this.$nextTick(function () {
            _this2.$refs.elTree.setCheckedKeys(_this2.value);

            _this2.setSelectedLabel();
          });
        } else {
          var selectedNode = treeFind(this.data, function (node) {
            return _this2.checkSelected(node[propsValue]);
          }, this.props);

          if (selectedNode) {
            this.selectedLabel = selectedNode[this.propsLabel];
          } else {
            this.selectedLabel = '';
          }
        }
      } else {
        this.selectedLabel = '';
      }
    },
    setTreeDataState: function setTreeDataState() {
      var _this3 = this;

      var disabledValues = this.disabledValues;
      treeEach(this.data, function (node) {
        node.disabled = disabledValues.includes(node[_this3.propsValue]);
      });
    },
    setSelectedLabel: function setSelectedLabel() {
      var _this4 = this;

      var elTree = this.$refs.elTree;
      var selectedNodes = elTree.getCheckedNodes(!this.checkStrictly);
      this.selectedLabel = selectedNodes.map(function (item) {
        return item[_this4.propsLabel];
      }).join(',');
    },
    treeItemClass: function treeItemClass(data) {
      var value = data[this.propsValue];
      return {
        selected: this.multiple ? false : this.checkSelected(value),
        'is-disabled': this.disabledValues.includes(value)
      };
    }
  },
  watch: {
    value: function value() {
      this.setSelected();
    },
    data: function data() {
      this.setTreeDataState();
      this.setSelected();
    },
    disabledValues: function disabledValues() {
      this.setTreeDataState();
    }
  },
  created: function created() {
    if (this.multiple && !Array.isArray(this.value)) {
      console.error('[el-select-tree]:', 'props `value` must be Array if use multiple!');
    }

    this.setTreeDataState();
  },
  mounted: function mounted() {
    var _this5 = this;

    this.setSelected();
    this.$nextTick(function () {
      var popper = _this5.$refs.elPopover.$refs.popper;
      var width;

      if (!_this5.popoverMinWidth) {
        var clientWidth = _this5.$el.clientWidth;

        if (!clientWidth) {
          console.log('[el-select-warn]:', 'can not get `width`, please set the `popoverMinWidth`');
        }

        width = clientWidth;
      } else {
        width = _this5.popoverMinWidth;
      }

      width && (popper.style.minWidth = width + 'px');
    });
  }
};

function styleInject(css, ref) {
  if (ref === void 0) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') {
    return;
  }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css_248z = ".el-select-tree{display:inline-block}.el-select-tree .el-input__icon{cursor:pointer;-webkit-transition:-webkit-transform .3s;transition:-webkit-transform .3s;transition:transform .3s;transition:transform .3s,-webkit-transform .3s}.el-select-tree .el-input__icon-close{display:none}.el-select-tree .el-input__inner{cursor:pointer;padding-right:30px}.el-select-tree .el-input:hover:not(.is-disabled) .el-input__inner{border-color:#c0c4cc}.el-select-tree .el-input:hover:not(.is-disabled).is-selected.is-clearable .el-input__icon-close{display:inline-block}.el-select-tree .el-input:hover:not(.is-disabled).is-selected.is-clearable .el-input__icon-arrow-down{display:none}.el-select-tree .el-input.is-active .el-input__icon-arrow-down{-webkit-transform:rotate(-180deg);-ms-transform:rotate(-180deg);transform:rotate(-180deg)}.el-select-tree .el-input.is-active .el-input__inner{border-color:#409eff}.el-select-tree__popover{padding:0!important;border:1px solid #e4e7ed!important;border-radius:4px!important}.el-select-tree__popover .popper__arrow{left:35px!important}.el-select-tree__popover .el-tree-node__expand-icon.is-leaf{cursor:pointer}.el-select-tree__list{overflow-y:auto}.el-select-tree__list::-webkit-scrollbar-track-piece{background:#d3dce6}.el-select-tree__list::-webkit-scrollbar{width:4px}.el-select-tree__list::-webkit-scrollbar-thumb{background:#99a9bf}.el-select-tree__item{position:relative;white-space:nowrap;padding-right:20px}.el-select-tree__item.selected{color:#409eff;font-weight:bolder}.el-select-tree__item.is-disabled{color:#bbb;cursor:not-allowed}.el-select-tree__empty{padding:10px 0;margin:0;text-align:center;color:#999;font-size:14px}";
styleInject(css_248z);

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "el-select-tree"
  }, [_c('el-popover', {
    ref: "elPopover",
    attrs: {
      "transition": "el-zoom-in-top",
      "popper-class": "el-select-tree__popover",
      "trigger": "click",
      "disabled": _vm.disabled,
      "placement": _vm.placement
    },
    on: {
      "after-enter": function afterEnter($event) {
        return _vm.handleScroll();
      }
    },
    model: {
      value: _vm.visible,
      callback: function callback($$v) {
        _vm.visible = $$v;
      },
      expression: "visible"
    }
  }, [_vm.dataLength ? _c('el-scrollbar', {
    ref: "scrollbar",
    class: {
      'is-empty': _vm.dataLength === 0
    },
    attrs: {
      "wrap-class": "el-select-dropdown__wrap",
      "view-class": "el-select-dropdown__list"
    }
  }, [_c('el-tree', {
    ref: "elTree",
    staticClass: "el-select-tree__list",
    attrs: {
      "default-expand-all": _vm.defaultExpandAll,
      "props": _vm.props,
      "node-key": _vm.propsValue,
      "show-checkbox": _vm.multiple,
      "expand-on-click-node": _vm.multiple,
      "data": _vm.data,
      "default-expanded-keys": _vm.defaultExpandedKeys,
      "check-strictly": _vm.checkStrictly
    },
    on: {
      "node-click": _vm.nodeClick,
      "check-change": _vm.checkChange
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function fn(ref) {
        var node = ref.node;
        var data = ref.data;
        return _c('div', {
          staticClass: "el-select-tree__item",
          class: _vm.treeItemClass(data)
        }, [_vm._t("default", [_vm._v(_vm._s(data[_vm.propsLabel]))], {
          "node": node,
          "data": data
        })], 2);
      }
    }], null, true)
  })], 1) : _c('p', {
    staticClass: "el-select-tree__empty"
  }, [_vm._v("\n      " + _vm._s(_vm.emptyText) + "\n    ")]), _c('el-input', {
    ref: "reference",
    class: {
      'is-active': _vm.visible,
      'is-selected': _vm.selectedLabel,
      'is-clearable': _vm.clearable
    },
    attrs: {
      "slot": "reference",
      "readonly": "",
      "validate-event": false,
      "size": _vm.size,
      "disabled": _vm.disabled,
      "placeholder": _vm.placeholder
    },
    slot: "reference",
    model: {
      value: _vm.selectedLabel,
      callback: function callback($$v) {
        _vm.selectedLabel = $$v;
      },
      expression: "selectedLabel"
    }
  }, [_vm.clearable ? _c('i', {
    staticClass: "el-input__icon el-input__icon-close el-icon-circle-close",
    attrs: {
      "slot": "suffix"
    },
    on: {
      "click": function click($event) {
        $event.stopPropagation();
        return _vm.clear();
      }
    },
    slot: "suffix"
  }) : _vm._e(), _c('i', {
    staticClass: "el-input__icon el-input__icon-arrow-down el-icon-arrow-down",
    attrs: {
      "slot": "suffix"
    },
    slot: "suffix"
  })])], 1)], 1);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = undefined;
/* module identifier */

var __vue_module_identifier__ = undefined;
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = /*#__PURE__*/normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

__vue_component__.install = function (Vue) {
  Vue.component('ElSelectTree', __vue_component__);
};

export default __vue_component__;
//# sourceMappingURL=index.js.map
