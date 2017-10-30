"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var widgets_1 = require("@phosphor/widgets");
var foreign_1 = require("./foreign");
//Some fix
var signaling_1 = require("@phosphor/signaling");
var REGULUS_CLASS = 'jp-Regulus';
var CONTENT_CLASS = 'jp-Regulus-content';
/**
 * The class name of a cell whose input originated from a foreign session.
 */
//const FOREIGN_CELL_CLASS = 'jp-Regulus-foreignCell';
var Regulus = /** @class */ (function (_super) {
    __extends(Regulus, _super);
    function Regulus(options) {
        var _this = _super.call(this) || this;
        //Some fix
        _this._executed = new signaling_1.Signal(_this);
        _this.addClass(REGULUS_CLASS);
        _this.contentFactory = (options.contentFactory || Regulus.defaultContentFactory);
        _this.session = options.session;
        _this._content = new widgets_1.Panel();
        _this._content.addClass(CONTENT_CLASS);
        var layout = _this.layout = new widgets_1.PanelLayout();
        layout.addWidget(_this._content);
        // Set up the foreign iopub handler.
        // console.log("#### Test whether ForeignHandler is updated from Widget");
        _this._foreignHandler = new foreign_1.ForeignHandler({
            session: _this.session,
            parent: _this,
        });
        _this._onKernelChanged();
        _this.session.kernelChanged.connect(_this._onKernelChanged, _this);
        return _this;
    }
    Object.defineProperty(Regulus.prototype, "executed", {
        //Some fix
        /**
         * A signal emitted when the console finished executing its prompt cell.
         */
        get: function () {
            //console.log("Finish execute in Regulus");
            return this._executed;
        },
        enumerable: true,
        configurable: true
    });
    Regulus.prototype.clear = function () {
        console.log("Regulus Clear");
    };
    Regulus.prototype.dispose = function () {
        // Do nothing if already disposed.
        if (this.isDisposed) {
            return;
        }
        this._foreignHandler.dispose();
        _super.prototype.dispose.call(this);
    };
    Regulus.prototype.onAfterAttach = function (msg) {
        console.log("widget: onAfterAttach:", msg);
    };
    Regulus.prototype.onBeforeDetach = function (msg) {
        console.log("widget: onBeforeDetach:", msg);
    };
    Regulus.prototype.onActivateMessage = function (msg) {
        console.log("widget: onActivateMessage:", msg);
    };
    Regulus.prototype.onUpdateRequest = function (msg) {
        console.log("widget: onUpdateRequest:", msg);
    };
    //Some fix
    /**
   * Update the console based on the kernel info.
   */
    Regulus.prototype._handleInfo = function (info) {
        console.log("In HandleInfo");
    };
    //Create a new foreign cell
    /*
      private _createCodeCell(): CodeCell {
        let factory = this.contentFactory;
        let options = this._createCodeCellOptions();
        let cell = factory.createCodeCell(options);
        cell.readOnly = true;
        cell.model.mimeType = this._mimetype;
        cell.addClass(FOREIGN_CELL_CLASS);
        return cell;
      }
    */
    Regulus.prototype._onKernelChanged = function () {
        var _this = this;
        var kernel = this.session.kernel;
        if (!kernel) {
            return;
        }
        kernel.ready.then(function () {
            if (_this.isDisposed || !kernel || !kernel.info) {
                return;
            }
            // Some fix
            _this._handleInfo(kernel.info);
        });
    };
    return Regulus;
}(widgets_1.Widget));
exports.Regulus = Regulus;
(function (Regulus) {
    var ContentFactory = /** @class */ (function () {
        function ContentFactory(options) {
            if (options === void 0) { options = {}; }
        }
        return ContentFactory;
    }());
    Regulus.ContentFactory = ContentFactory;
    Regulus.defaultContentFactory = new ContentFactory();
})(Regulus = exports.Regulus || (exports.Regulus = {}));
exports.Regulus = Regulus;
// namespace Private {}
