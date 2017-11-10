"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var application_1 = require("@jupyterlab/application");
var apputils_1 = require("@jupyterlab/apputils");
var coreutils_1 = require("@jupyterlab/coreutils");
var launcher_1 = require("@jupyterlab/launcher");
var widgets_1 = require("@phosphor/widgets");
var algorithm_1 = require("@phosphor/algorithm");
var regulus_1 = require("@regulus/regulus");
var CommandIDs;
(function (CommandIDs) {
    CommandIDs.open = 'regulus:open';
    CommandIDs.interrupt = 'regulus:interrupt-kernel';
    CommandIDs.create = 'regulus:create';
    CommandIDs.clear = 'regulus:clear';
    CommandIDs.restart = 'regulus:restart-kernel';
    CommandIDs.closeAndShutdown = 'regulus:close-and-shutdown';
    //  export
    //  const inject = 'regulus:inject';
    CommandIDs.changeKernel = 'regulus:change-kernel';
})(CommandIDs || (CommandIDs = {}));
;
exports.trackerPlugin = {
    id: 'jupyter.services.regulus-tracker',
    provides: regulus_1.IRegulusTracker,
    requires: [
        apputils_1.IMainMenu,
        apputils_1.ICommandPalette,
        regulus_1.RegulusPanel.IContentFactory,
        application_1.ILayoutRestorer
    ],
    optional: [launcher_1.ILauncher],
    activate: activateRegulus,
    autoStart: true
};
exports.contentFactoryPlugin = {
    id: 'jupyter.services.regulus-renderer',
    provides: regulus_1.RegulusPanel.IContentFactory,
    requires: [],
    autoStart: true,
    activate: function (app) {
        return new regulus_1.RegulusPanel.ContentFactory();
    }
};
var plugins = [exports.contentFactoryPlugin, exports.trackerPlugin];
exports.default = plugins;
function activateRegulus(app, mainMenu, palette, contentFactory, restorer, launcher) {
    var manager = app.serviceManager;
    //console.log("===== In function activateRegulus");
    //console.log(app);
    //console.log(manager);
    var commands = app.commands, shell = app.shell;
    var category = 'Regulus';
    var command;
    var menu = new widgets_1.Menu({ commands: commands });
    var tracker = new apputils_1.InstanceTracker({ namespace: 'regulus' });
    restorer.restore(tracker, {
        command: CommandIDs.open,
        args: function (panel) {
            console.log('panel', panel);
            return {
                path: panel.regulus.session.path,
                name: panel.regulus.session.name
            };
        },
        name: function (panel) { console.log('name from panel', panel); return panel.regulus.session.path; },
        when: manager.ready
    });
    // Update the command registry when the regulus state changes.
    tracker.currentChanged.connect(function () {
        console.log('tracker.currentChanged');
        if (tracker.size <= 1) {
            commands.notifyCommandChanged(CommandIDs.interrupt);
        }
    });
    // The launcher callback.
    var callback = function (cwd, name) {
        return createRegulus({ basePath: cwd, kernelPreference: { name: name } });
    };
    // Add a launcher item if the launcher is available.
    if (launcher) {
        manager.ready.then(function () {
            var specs = manager.specs;
            if (!specs) {
                return;
            }
            var baseUrl = coreutils_1.PageConfig.getBaseUrl();
            for (var name_1 in specs.kernelspecs) {
                var displayName = specs.kernelspecs[name_1].display_name;
                var rank = name_1 === specs.default ? 0 : Infinity;
                var kernelIconUrl = specs.kernelspecs[name_1].resources['logo-64x64'];
                if (kernelIconUrl) {
                    var index = kernelIconUrl.indexOf('kernelspecs');
                    kernelIconUrl = baseUrl + kernelIconUrl.slice(index);
                }
                launcher.add({
                    displayName: displayName,
                    category: 'Regulus',
                    name: name_1,
                    iconClass: 'jp-Regulus',
                    callback: callback,
                    rank: rank,
                    kernelIconUrl: kernelIconUrl
                });
            }
        });
    }
    menu.title.label = category;
    function createRegulus(options) {
        return manager.ready.then(function () {
            //console.log('Jupyter Service manager before');
            //console.log(manager);
            var panel = new regulus_1.RegulusPanel(__assign({ manager: manager,
                contentFactory: contentFactory }, options));
            //console.log(manager);
            //console.log(panel);
            // Add the regulus panel to the tracker.
            tracker.add(panel);
            shell.addToMainArea(panel);
            shell.activateById(panel.id);
            return panel;
        });
    }
    function hasWidget() {
        return tracker.currentWidget !== null;
    }
    command = CommandIDs.open;
    commands.addCommand(command, {
        execute: function (args) {
            var path = args['path'];
            var widget = tracker.find(function (value) {
                return value.regulus.session.path === path;
            });
            if (widget) {
                shell.activateById(widget.id);
            }
            else {
                return manager.ready.then(function () {
                    var model = algorithm_1.find(manager.sessions.running(), function (item) {
                        return item.path === path;
                    });
                    if (model) {
                        return createRegulus(args);
                    }
                    return Promise.reject("No running regulus for path: " + path);
                });
            }
        },
    });
    command = CommandIDs.create;
    commands.addCommand(command, {
        label: 'Start New Regulus',
        execute: function (args) {
            var basePath = args.basePath || '.';
            //console.log("CommandIDs.create args");
            //console.log(args);
            return createRegulus(__assign({ basePath: basePath }, args));
        }
    });
    palette.addItem({ command: command, category: category });
    function getCurrent(args) {
        var widget = tracker.currentWidget;
        var activate = args['activate'] !== false;
        if (activate && widget) {
            shell.activateById(widget.id);
        }
        return widget;
    }
    command = CommandIDs.clear;
    commands.addCommand(command, {
        label: 'Clear Regulus',
        execute: function (args) {
            var current = getCurrent(args);
            if (!current) {
                return;
            }
            current.regulus.clear();
        },
        isEnabled: hasWidget
    });
    palette.addItem({ command: command, category: category });
    command = CommandIDs.interrupt;
    commands.addCommand(command, {
        label: 'Interrupt Kernel',
        execute: function (args) {
            var current = getCurrent(args);
            if (!current) {
                return;
            }
            var kernel = current.regulus.session.kernel;
            if (kernel) {
                return kernel.interrupt();
            }
        },
        isEnabled: hasWidget
    });
    palette.addItem({ command: command, category: category });
    command = CommandIDs.restart;
    commands.addCommand(command, {
        label: 'Restart Kernel',
        execute: function (args) {
            var current = getCurrent(args);
            if (!current) {
                return;
            }
            return current.regulus.session.restart();
        },
        isEnabled: hasWidget
    });
    palette.addItem({ command: command, category: category });
    command = CommandIDs.closeAndShutdown;
    commands.addCommand(command, {
        label: 'Close and Shutdown',
        execute: function (args) {
            var current = getCurrent(args);
            if (!current) {
                return;
            }
            return apputils_1.showDialog({
                title: 'Shutdown the regulus?',
                body: "Are you sure you want to close \"" + current.title.label + "\"?",
                buttons: [apputils_1.Dialog.cancelButton(), apputils_1.Dialog.warnButton()]
            }).then(function (result) {
                if (result.button.accept) {
                    current.regulus.session.shutdown().then(function () {
                        current.dispose();
                    });
                }
                else {
                    return false;
                }
            });
        },
        isEnabled: hasWidget
    });
    command = CommandIDs.changeKernel;
    commands.addCommand(command, {
        label: 'Change Kernel',
        execute: function (args) {
            var current = getCurrent(args);
            if (!current) {
                return;
            }
            return current.regulus.session.selectKernel();
        },
        isEnabled: hasWidget
    });
    palette.addItem({ command: command, category: category });
    //  menu.addItem({ command: CommandIDs.run });
    //  menu.addItem({ command: CommandIDs.runForced });
    //  menu.addItem({ command: CommandIDs.linebreak });
    //  menu.addItem({ type: 'separator' });
    menu.addItem({ command: CommandIDs.clear });
    menu.addItem({ type: 'separator' });
    menu.addItem({ command: CommandIDs.interrupt });
    menu.addItem({ command: CommandIDs.restart });
    menu.addItem({ command: CommandIDs.changeKernel });
    menu.addItem({ type: 'separator' });
    menu.addItem({ command: CommandIDs.closeAndShutdown });
    mainMenu.addMenu(menu, { rank: 50 });
    app.contextMenu.addItem({ command: CommandIDs.clear, selector: '.jp-CodeRegulus' });
    app.contextMenu.addItem({ command: CommandIDs.restart, selector: '.jp-CodeRegulus' });
    return tracker;
}
