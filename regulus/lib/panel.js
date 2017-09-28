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
var apputils_1 = require("@jupyterlab/apputils");
var coreutils_1 = require("@jupyterlab/coreutils");
var coreutils_2 = require("@phosphor/coreutils");
var widgets_1 = require("@phosphor/widgets");
var widget_1 = require("./widget");
/**
 * The class name added to regulus panels.
 */
var PANEL_CLASS = 'jp-RegulusPanel';
var ICON_CLASS = 'jp-RegulusIcon';
/**
 * Regulus main panel
 */
var RegulusPanel = /** @class */ (function (_super) {
    __extends(RegulusPanel, _super);
    function RegulusPanel(options) {
        var _this = _super.call(this) || this;
        _this.addClass(PANEL_CLASS);
        var path = options.path, basePath = options.basePath, name = options.name, manager = options.manager;
        console.log("options for RegulusPanel");
        console.log(options);
        var contentFactory = _this.contentFactory = (options.contentFactory || RegulusPanel.defaultContentFactory);
        var count = Private.count++;
        if (!path) {
            path = (basePath || '') + "/regulus-" + count + "-" + coreutils_1.uuid();
        }
        var session = _this._session = new apputils_1.ClientSession({
            manager: manager.sessions,
            path: path,
            name: name || "Regulus " + count,
            type: 'regulus',
            kernelPreference: options.kernelPreference
        });
        console.log("Session selected in for RegulusPanel");
        console.log(session);
        _this.regulus = contentFactory.createRegulus({
            session: session, contentFactory: contentFactory
        });
        _this.addWidget(_this.regulus);
        session.ready.then(function () {
            console.log('session ready');
            _this._updateTitle();
        });
        _this._manager = manager;
        // Some fix here 
        _this.regulus.executed.connect(_this._onExecuted, _this);
        session.kernelChanged.connect(_this._updateTitle, _this);
        session.propertyChanged.connect(_this._updateTitle, _this);
        _this.title.icon = ICON_CLASS;
        _this.title.closable = true;
        _this.id = "regulus-" + count;
        return _this;
    }
    Object.defineProperty(RegulusPanel.prototype, "session", {
        get: function () {
            return this._session;
        },
        enumerable: true,
        configurable: true
    });
    RegulusPanel.prototype.dispose = function () {
        this.regulus.dispose();
        _super.prototype.dispose.call(this);
    };
    RegulusPanel.prototype.onAfterAttach = function (msg) {
        this._session.initialize();
        console.log('panel:onAfterAttach:', msg);
    };
    RegulusPanel.prototype.onActivateRequest = function (msg) {
        console.log('panel:onActivateRequest:', msg);
    };
    RegulusPanel.prototype.onCloseRequest = function (msg) {
        console.log('panel:onCloseRequest', msg);
        _super.prototype.onCloseRequest.call(this, msg);
        this.dispose();
    };
    RegulusPanel.prototype._updateTitle = function () {
        console.log('_updateTitle');
    };
    RegulusPanel.prototype._onExecuted = function (sender, args) {
        console.log("In conExecuted");
    };
    return RegulusPanel;
}(widgets_1.Panel));
exports.RegulusPanel = RegulusPanel;
(function (RegulusPanel) {
    var ContentFactory = /** @class */ (function (_super) {
        __extends(ContentFactory, _super);
        function ContentFactory() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ContentFactory.prototype.createRegulus = function (options) {
            return new widget_1.Regulus(options);
        };
        return ContentFactory;
    }(widget_1.Regulus.ContentFactory));
    RegulusPanel.ContentFactory = ContentFactory;
    RegulusPanel.defaultContentFactory = new ContentFactory();
    RegulusPanel.IContentFactory = new coreutils_2.Token('jupyter.services.regulus.content-factory');
})(RegulusPanel = exports.RegulusPanel || (exports.RegulusPanel = {}));
exports.RegulusPanel = RegulusPanel;
var Private;
(function (Private) {
    Private.count = 1;
    //Some fix
    /**
     * Update the title of a console panel.
     */
    function updateTitle(panel, connected, executed) {
        var session = panel.regulus.session;
        var caption = ("Name: " + session.name + "\n" +
            ("Directory: " + coreutils_1.PathExt.dirname(session.path) + "\n") +
            ("Kernel: " + session.kernelDisplayName));
        if (connected) {
            caption += "\nConnected: " + coreutils_1.Time.format(connected.toISOString());
        }
        if (executed) {
            caption += "\nLast Execution: " + coreutils_1.Time.format(executed.toISOString());
        }
        panel.title.label = session.name;
        panel.title.caption = caption;
    }
    Private.updateTitle = updateTitle;
})(Private || (Private = {}));
